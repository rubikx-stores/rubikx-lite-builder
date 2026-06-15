<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { usePageBuilderStateStore, sharedPageBuilderStore } from '@myissue/vue-website-page-builder'
import ProductsEditor from '../ProductsEditor.client.vue'
import { productImageSrc } from '~/composables/useProductImageSrc'
import { getDomain, faviconUrl } from '~/composables/useSocialIcons'
import { hydrateComponents } from '~/plugins/rubikx-hydration.client'

const store = usePageBuilderStateStore() as any
const {
  selectedEl, selectedBlockTitle, mode,
  blockConfig, blockData,
  updateBlockField, updateBlockListItem, addBlockListItem, removeBlockListItem,
  updateElementStyle,
} = useEditorSidebar()

// ── Element style helpers (used for library components in 'element' mode) ─────
function getPx(prop: string): number {
  const el = selectedEl.value; if (!el) return 0
  const v = parseFloat((el.style as any)?.[prop] || '')
  if (!isNaN(v) && v !== 0) return v
  return parseFloat((getComputedStyle(el) as any)[prop] || '0') || 0
}
function clamp(v: number, lo: number, hi: number) { return Math.min(hi, Math.max(lo, v)) }
function applyPx(prop: string, val: number, lo = 0, hi = 999): number {
  const c = clamp(val, lo, hi); updateElementStyle(prop, c + 'px'); return c
}

// ── Typography ────────────────────────────────────────────────────────────────
const fsVal = ref(14); const lhVal = ref(0); const lsVal = ref(0)
const fontFamilies = ['inherit', 'Inter, sans-serif', 'Georgia, serif', 'Courier New, monospace', 'Arial, sans-serif']
const fontWeights  = [{ v: '300', l: 'Light' }, { v: '400', l: 'Regular' }, { v: '500', l: 'Medium' }, { v: '600', l: 'SemiBold' }, { v: '700', l: 'Bold' }, { v: '800', l: 'ExtraBold' }]
const textAligns   = ['left', 'center', 'right', 'justify']
watch(selectedEl, (el) => {
  if (!el) return
  fsVal.value = getPx('fontSize') || 14
  lhVal.value = getPx('lineHeight') || 0
  lsVal.value = getPx('letterSpacing') || 0
})
function adjFs(d: number) { fsVal.value = applyPx('fontSize', fsVal.value + d, 1, 200) }
function adjLh(d: number) { lhVal.value = applyPx('lineHeight', lhVal.value + d, 0, 200) }
function adjLs(d: number) { lsVal.value = applyPx('letterSpacing', lsVal.value + d, -10, 50) }

// ── Image src ─────────────────────────────────────────────────────────────────
const imageInput = ref('')
watch(selectedEl, (el) => { imageInput.value = el?.tagName === 'IMG' ? (el as HTMLImageElement).src : '' })
function onApplyImage() {
  const el = selectedEl.value; if (!el || el.tagName !== 'IMG') return
  ;(el as HTMLImageElement).src = imageInput.value
  import('@myissue/vue-website-page-builder').then(({ getPageBuilder }) => {
    const b = getPageBuilder() as any; b.syncDomToStoreOnly(); b.saveDomComponentsToLocalStorage()
  })
}

// ── Color picker normaliser ───────────────────────────────────────────────────
// <input type="color"> only accepts #rrggbb — anything else (empty string,
// 'transparent', named colours, 5-digit hex, etc.) triggers a browser warning
// and the picker shows black. This converts any CSS colour value to a safe
// 6-digit hex so the swatch always works, while the sibling text input keeps
// showing / accepting the raw value.
function toHex(v: string | undefined | null): string {
  if (!v) return '#000000'
  const s = String(v).trim()
  if (/^#[0-9a-fA-F]{6}$/.test(s)) return s           // already #rrggbb
  if (/^#[0-9a-fA-F]{3}$/.test(s))                     // #rgb → #rrggbb
    return '#' + s[1]+s[1] + s[2]+s[2] + s[3]+s[3]
  // Named colour or anything else → render on an off-screen canvas to resolve
  try {
    const ctx = document.createElement('canvas').getContext('2d')!
    ctx.fillStyle = s
    const resolved = ctx.fillStyle                      // browser normalises it
    if (/^#[0-9a-fA-F]{6}$/.test(resolved)) return resolved
  } catch { /* ignore SSR / headless */ }
  return '#000000'                                      // safe fallback
}

// ── Product block flag ────────────────────────────────────────────────────────
const _PRODUCT_TITLES = ['Show Single Product', 'Show Multiple Products', 'Show 6 Products', 'Show 6 Products Minimal', 'Show 4 Products Centered', 'Ru1 Homepage Featured Products', 'Ru2 Shop Content']

const lastProductTitle = ref('')

watch(
  () => (sharedPageBuilderStore as any).getComponent,
  (comp: any) => {
    if (comp?.title && _PRODUCT_TITLES.includes(comp.title)) {
      lastProductTitle.value = comp.title
    } else if (comp !== null) {
      lastProductTitle.value = ''
    }
    // comp === null is a post-save reset — keep lastProductTitle as-is
  }
)

const isProductBlock = computed(() =>
  _PRODUCT_TITLES.includes((sharedPageBuilderStore as any).getComponent?.title ?? '') ||
  _PRODUCT_TITLES.includes(selectedBlockTitle.value ?? '') ||
  lastProductTitle.value !== ''
)

// ── Element type flags ────────────────────────────────────────────────────────
const isTextEl = computed(() => {
  const t = selectedEl.value?.tagName?.toUpperCase()
  return t ? ['P','H1','H2','H3','H4','H5','H6','SPAN','A','LI','BUTTON','LABEL'].includes(t) : false
})
const isImgEl  = computed(() => selectedEl.value?.tagName?.toUpperCase() === 'IMG')

// Debounce that captures the block title at CALL time, not execution time.
// Without this, if the user switches to Hero before 300ms, the Navbar logo
// update would fire against Hero's registry and trigger _applyBlockRender
// for the wrong block — disrupting the Hero selection.

let _fieldDebounceTimer = 0
function debouncedUpdateBlockField(fieldKey: string, value: any) {
  const capturedTitle = selectedBlockTitle.value   // snapshot NOW, before any await
  clearTimeout(_fieldDebounceTimer)
  _fieldDebounceTimer = window.setTimeout(() => {
    if (!capturedTitle) return
    updateBlockField(fieldKey, value, capturedTitle)
  }, 50)
}

async function onToggleField(fieldKey: string, newValue: boolean) {
  await updateBlockField(fieldKey, newValue)
  if (fieldKey === 'dynamicCategories' && newValue === true) {
    await nextTick()
    hydrateComponents()
  }
}

// Debounced list-item updater — fires 150ms after the user stops typing so
// every keystroke reflects in the canvas without hammering _applyBlockRender.
let _listItemDebounceTimer = 0
function debouncedUpdateBlockListItem(listKey: string, idx: number, itemKey: string, value: any) {
  clearTimeout(_listItemDebounceTimer)
  _listItemDebounceTimer = window.setTimeout(() => {
    updateBlockListItem(listKey, idx, itemKey, value)
  }, 50)
}

// ── Block image upload ────────────────────────────────────────────────────────
const uploadError = ref<Record<string, string>>({})

function onUploadImage(fieldKey: string, file: File) {
  if (!file.type.startsWith('image/')) { uploadError.value[fieldKey] = 'Please select an image file.'; return }
  uploadError.value[fieldKey] = ''
  const reader = new FileReader()
  reader.onload = () => updateBlockField(fieldKey, reader.result as string)
  reader.onerror = () => { uploadError.value[fieldKey] = 'File could not be read. Try again or paste a URL.' }
  reader.readAsDataURL(file)
}

// ── List reorder helpers ──────────────────────────────────────────────────────
function moveListItemUp(listKey: string, idx: number) {
  const src = blockData.value as Record<string, any>; if (!src) return
  const arr = [...(src[listKey] as any[])]; const [item] = arr.splice(idx, 1); arr.splice(idx - 1, 0, item)
  updateBlockField(listKey, arr)
}
function moveListItemDown(listKey: string, idx: number) {
  const src = blockData.value as Record<string, any>; if (!src) return
  const arr = [...(src[listKey] as any[])]; const [item] = arr.splice(idx, 1); arr.splice(idx + 1, 0, item)
  updateBlockField(listKey, arr)
}
function onUploadSubImage(listKey: string, idx: number, subKey: string, file: File) {
  const reader = new FileReader()
  reader.onload = () => updateBlockListItem(listKey, idx, subKey, reader.result as string)
  reader.readAsDataURL(file)
}

function updateColumnOrder(fieldKey: string, index: number, newVal: string) {
  const currentOrder = [...((blockData.value?.[fieldKey] as string[]) ?? [])]
  const swapIdx = currentOrder.indexOf(newVal)
  if (swapIdx !== -1 && swapIdx !== index) {
    currentOrder[swapIdx] = currentOrder[index]
  }
  currentOrder[index] = newVal
  updateBlockField(fieldKey, currentOrder)
}

const colOrderLabelMap: Record<string, string> = {
  links: 'Links', about: 'About', contact: 'Contact',
  info: 'Info Panel', form: 'Form',
}


// ── Mega menu editor (Mega-menu-Header only) ──────────────────────────────────
interface MegaProduct { id: number; name: string; price: number; image: string }
interface EditingGroup { label: string; href: string; products: MegaProduct[] }

const megaMenuPickerIdx  = ref(-1)          // which navLink editor is open
const editingGroups      = ref<EditingGroup[]>([])
const groupProductIdx    = ref(-1)          // which group's product picker is open
const megaMenuAllProducts = ref<MegaProduct[]>([])
const megaMenuSearch     = ref('')
const megaMenuLoading    = ref(false)
const selectedProductIds = ref(new Set<number>())

const megaMenuFiltered = computed(() =>
  megaMenuSearch.value.trim()
    ? megaMenuAllProducts.value.filter(p => p.name.toLowerCase().includes(megaMenuSearch.value.toLowerCase()))
    : megaMenuAllProducts.value
)

function openMegaMenuEditor(navIdx: number) {
  const links: any[] = (blockData.value as any)?.navLinks ?? []
  const existing: any[] = links[navIdx]?.megaMenu ?? []
  editingGroups.value = existing.length
    ? existing.map((g: any) => ({ label: g.label, href: g.href, products: g.products ?? [] }))
    : [{ label: 'Women', href: '/women', products: [] }, { label: 'Men', href: '/men', products: [] }]
  megaMenuPickerIdx.value = navIdx
  groupProductIdx.value = -1
}

function closeMegaMenuEditor() {
  megaMenuPickerIdx.value = -1
  groupProductIdx.value = -1
  editingGroups.value = []
  megaMenuSearch.value = ''
}

function addGroup() {
  editingGroups.value = [...editingGroups.value, { label: '', href: '', products: [] }]
}

function removeGroup(gi: number) {
  editingGroups.value = editingGroups.value.filter((_, i) => i !== gi)
}

function onGroupLabelInput(gi: number, val: string) {
  editingGroups.value = editingGroups.value.map((g, i) =>
    i === gi ? { ...g, label: val, href: `/${val.toLowerCase().replace(/\s+/g, '-')}` } : g
  )
}

async function openGroupProductPicker(gi: number) {
  groupProductIdx.value = gi
  megaMenuSearch.value = ''
  megaMenuLoading.value = true
  try {
    megaMenuAllProducts.value = await $fetch<MegaProduct[]>('/api/products')
  } finally {
    megaMenuLoading.value = false
  }
  selectedProductIds.value = new Set(editingGroups.value[gi].products.map(p => p.id))
}

function toggleProduct(id: number) {
  const s = new Set(selectedProductIds.value)
  s.has(id) ? s.delete(id) : s.add(id)
  selectedProductIds.value = s
}

function applyGroupProducts() {
  const gi = groupProductIdx.value
  if (gi < 0) return
  const products = megaMenuAllProducts.value.filter(p => selectedProductIds.value.has(p.id))
  editingGroups.value = editingGroups.value.map((g, i) => i === gi ? { ...g, products } : g)
  groupProductIdx.value = -1
  selectedProductIds.value = new Set()
}

function applyMegaMenuToLink() {
  const idx = megaMenuPickerIdx.value
  if (idx < 0) return
  const megaMenu = editingGroups.value.map(g => ({
    label: g.label,
    href: g.href,
    products: g.products.map(p => ({ id: p.id, label: p.name, href: `/shop/${p.id}`, image: p.image, price: p.price })),
  }))
  const links: any[] = [...((blockData.value as any)?.navLinks ?? [])]
  links[idx] = { ...links[idx], megaMenu }
  updateBlockField('navLinks', links)
  closeMegaMenuEditor()
}


// ── Teleport into library right panel scroll area ─────────────────────────────
const _libStore = usePageBuilderStateStore() as any

let slotEl: HTMLElement | null = null
const slotReady = ref(false)
let _destroyed = false
let _injecting = false   // prevents concurrent inject loops

function _frame(): Promise<void> {
  return new Promise(resolve => requestAnimationFrame(() => resolve()))
}

// Async loop: keeps trying until the slot is in the DOM or the component unmounts.
// Unlike RAF-based approaches, this loop cannot be externally cancelled — every
// trigger that calls _ensureInjected() that finds _injecting=true just returns,
// knowing the loop is already running and will succeed.
async function _ensureInjected() {
  if (_injecting) return   // loop already running
  _injecting = true

  while (!_destroyed) {
    // Fast path: slot is already in the DOM
    if (slotEl?.isConnected) { slotReady.value = true; break }

    // Slot gone — mark Teleport as unmounted so it can re-mount to new node
    if (slotReady.value) slotReady.value = false

    const panel = document.getElementById('pagebuilder-right-menu')
    if (!panel) { await _frame(); continue }

    const scrollArea = (
      panel.querySelector('.pbx-overflow-y-scroll') ??
      panel.querySelector('[class*="overflow-y"]') ??
      panel.firstElementChild
    ) as HTMLElement | null

    if (!scrollArea) { await _frame(); continue }

    // Reuse an existing slot node (concurrent trigger already inserted it)
    const existing = scrollArea.querySelector('#app-block-editor-slot') as HTMLElement | null
    if (existing) { slotEl = existing; slotReady.value = true; break }

    if (!slotEl) {
      slotEl = document.createElement('div')
      slotEl.id = 'app-block-editor-slot'
    }
    scrollArea.insertBefore(slotEl, scrollArea.firstChild)
    slotReady.value = true
    break
  }

  _injecting = false
}

let _observer: MutationObserver | null = null

// Suppress the library's uncaught image-load error.
// When store.setElement(section) is called after _applyBlockRender, the library's
// initializeElementStyles scans the section for images and tries to load them.
// If an image fails (bad URL, CORS, etc.) it emits an unhandledrejection whose
// reason is an HTMLImageElement error Event. This is cosmetic — it does NOT
// break functionality — but we silence it to keep the console clean.
function _suppressImgError(ev: PromiseRejectionEvent) {
  if (ev.reason instanceof Event &&
      ev.reason.type === 'error' &&
      ev.reason.target instanceof HTMLImageElement) {
    ev.preventDefault()
  }
}

onMounted(() => {
  window.addEventListener('unhandledrejection', _suppressImgError)
  _ensureInjected()

  // When the library opens the right panel (menuRight → true)
  watch(() => _libStore.getMenuRight, (open: boolean) => {
    if (open) _ensureInjected()
    else slotReady.value = false   // panel closed cleanly
  }, { flush: 'post' })

  // When switching blocks (A→B), mode stays 'block' so watch(mode) won't fire;
  // watch(selectedBlockTitle) catches every block switch reliably.
  watch(() => selectedBlockTitle.value, (title) => { if (title) _ensureInjected() })

  // Mode change (none/element → block) means panel just became available
  watch(mode, (m) => { if (m !== 'none') _ensureInjected() }, { flush: 'post' })

  // Detect slot detachment caused by panel re-renders (e.g. after _applyBlockRender)
  _observer = new MutationObserver(() => {
    if (slotEl && !slotEl.isConnected) _ensureInjected()
  })
  _observer.observe(document.body, { childList: true, subtree: true })
})

// Any element click re-checks (covers cases where panel was open but DOM shifted)
watch(() => selectedEl.value, (el) => { if (el) _ensureInjected() })


onUnmounted(() => {
  _destroyed = true
  window.removeEventListener('unhandledrejection', _suppressImgError)
  _observer?.disconnect()
  slotEl?.remove()
  slotEl = null
  slotReady.value = false
})
</script>

<template>
  <Teleport v-if="slotReady" to="#app-block-editor-slot">
    <template v-if="mode !== 'none' || isProductBlock">

      <!-- ── Product block editor ──────────────────────────────────────── -->
      <div v-show="isProductBlock">
        <ProductsEditor
          :update-block-field="updateBlockField"
          :selected-block-title="selectedBlockTitle ?? ''"
          :block-data="blockData ?? undefined"
        />
      </div>

      <!-- ── Block Content Editor ────────────────────────────────────────── -->
      <template v-if="mode === 'block' && blockConfig && blockData">
        <div class="border-b border-gray-100 px-3 pt-3 pb-3">
          <template v-for="field in blockConfig.fields" :key="field.key">

            <!-- header sentinel -->
            <div v-if="field.type === 'header'" class="mb-2 mt-4 first:mt-1">
              <div class="flex items-center gap-2">
                <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{{ field.label }}</span>
                <div class="flex-1 h-px bg-gray-200"></div>
              </div>
            </div>

            <!-- image -->
            <div v-else-if="field.type === 'image'" class="mb-2.5">
              <label class="block text-xs text-gray-500 mb-1">{{ field.label }}</label>
              <div class="flex items-center gap-1 mb-1">
                <input type="text" :value="blockData[field.key]" placeholder="https://..."
                  class="flex-1 border border-gray-200 rounded-md px-2 py-1.5 text-xs focus:outline-none focus:border-blue-400"
                  @input="debouncedUpdateBlockField(field.key, ($event.target as HTMLInputElement).value); uploadError[field.key] = ''" />
                <label class="shrink-0 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 border border-gray-200 rounded-md px-2 py-1.5 cursor-pointer">
                  ↑ Upload
                  <input type="file" accept="image/*" class="sr-only"
                    @change="{ const f=($event.target as HTMLInputElement).files; if(f?.length) onUploadImage(field.key, f[0]) }" />
                </label>
              </div>
              <img v-if="blockData[field.key]" :src="blockData[field.key]"
                class="w-full h-20 object-cover rounded border border-gray-200 mb-1" alt="preview" />
              <p v-if="uploadError[field.key]" class="text-xs text-red-500">{{ uploadError[field.key] }}</p>
            </div>

            <!-- text / url -->
            <div v-else-if="field.type === 'text' || field.type === 'url'" class="mb-2.5">
              <label class="block text-xs text-gray-500 mb-1">{{ field.label }}</label>
              <input type="text" :value="blockData[field.key]"
                :placeholder="field.placeholder ?? ''"
                class="w-full border border-gray-200 rounded-md px-2 py-1.5 text-xs focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                @input="debouncedUpdateBlockField(field.key, ($event.target as HTMLInputElement).value)" />
            </div>

            <!-- number → stepper -->
            <div v-else-if="field.type === 'number'" class="mb-2.5">
              <label class="block text-xs text-gray-500 mb-1">{{ field.label }}</label>
              <div class="flex items-center gap-1">
                <button type="button"
                  class="w-7 h-7 flex items-center justify-center border border-gray-200 rounded-md bg-gray-50 hover:bg-gray-100 text-gray-600 text-base font-medium cursor-pointer shrink-0 leading-none"
                  @click="updateBlockField(field.key, Math.max(0, Number(blockData[field.key] ?? field.placeholder ?? 0) - (field.step ?? 1)))">−</button>
                <div class="relative flex-1">
                  <input type="number" :value="blockData[field.key]"
                    :placeholder="field.placeholder ?? ''"
                    class="w-full border border-gray-200 rounded-md px-2 py-1.5 text-xs text-center focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 pr-7"
                    @input="debouncedUpdateBlockField(field.key, Number(($event.target as HTMLInputElement).value))" />
                  <span class="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">{{ field.unit ?? 'px' }}</span>
                </div>
                <button type="button"
                  class="w-7 h-7 flex items-center justify-center border border-gray-200 rounded-md bg-gray-50 hover:bg-gray-100 text-gray-600 text-base font-medium cursor-pointer shrink-0 leading-none"
                  @click="updateBlockField(field.key, Number(blockData[field.key] ?? field.placeholder ?? 0) + (field.step ?? 1))">+</button>
              </div>
            </div>

            <!-- color -->
            <div v-else-if="field.type === 'color'" class="mb-2.5">
              <label class="block text-xs text-gray-500 mb-1">{{ field.label }}</label>
              <div class="flex items-center gap-2 border border-gray-200 rounded-md px-2 py-1">
                <input type="color" :value="toHex(blockData[field.key])" class="w-6 h-6 rounded cursor-pointer border-none p-0"
                  @input="updateBlockField(field.key, ($event.target as HTMLInputElement).value)" />
                <input type="text" :value="blockData[field.key]" class="flex-1 text-xs focus:outline-none"
                  @input="debouncedUpdateBlockField(field.key, ($event.target as HTMLInputElement).value)" />
              </div>
            </div>

            <!-- toggle -->
            <div v-else-if="field.type === 'toggle'" class="mb-2.5 flex items-center justify-between py-1">
              <label class="text-xs text-gray-600">{{ field.label }}</label>
              <button type="button"
                class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors border-none cursor-pointer shrink-0"
                :class="blockData[field.key] ? 'bg-blue-500' : 'bg-gray-200'"
                @click="onToggleField(field.key, !blockData[field.key])">
                <span class="inline-block h-3.5 w-3.5 rounded-full bg-white shadow transform transition-transform"
                  :class="blockData[field.key] ? 'translate-x-4' : 'translate-x-0.5'" />
              </button>
            </div>

            <!-- select -->
            <div v-else-if="field.type === 'select'" class="mb-2.5">
              <label class="block text-xs text-gray-500 mb-1">{{ field.label }}</label>
              <select class="w-full border border-gray-200 rounded-md px-2 py-1.5 text-xs focus:outline-none focus:border-blue-400 bg-white"
                :value="String(blockData[field.key])"
                @change="updateBlockField(field.key, Number(($event.target as HTMLSelectElement).value) || ($event.target as HTMLSelectElement).value)">
                <option v-for="opt in field.options" :key="opt" :value="opt">{{ opt }}</option>
              </select>
            </div>

            <!-- column-order -->
            <div v-else-if="field.type === 'column-order'" class="mb-2.5">
              <label class="block text-xs text-gray-500 mb-1">{{ field.label }}</label>
              <div class="flex gap-1.5">
                <div
                  v-for="(pos, i) in ((blockData[field.key] as string[] ?? []).length === 2 ? ['Left', 'Right'] : ['Left', 'Center', 'Right'])"
                  :key="pos"
                  class="flex-1">
                  <label class="block text-xs text-gray-400 mb-0.5">{{ pos }}</label>
                  <select
                    class="w-full border border-gray-200 rounded px-1.5 py-1 text-xs bg-white focus:outline-none"
                    :value="(blockData[field.key] as string[])?.[i]"
                    @change="updateColumnOrder(field.key, i, ($event.target as HTMLSelectElement).value)">
                    <option
                      v-for="opt in (blockData[field.key] as string[] ?? [])"
                      :key="opt"
                      :value="opt">
                      {{ colOrderLabelMap[opt] ?? opt }}
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <!-- list -->
            <div v-if="field.type === 'list' && field.listFields" class="mb-2.5">
              <div class="flex items-center justify-between mb-1.5">
                <label class="text-xs text-gray-500">{{ field.label }}</label>
                <button type="button"
                  class="text-xs text-blue-500 hover:text-blue-700 border border-blue-200 rounded px-1.5 py-0.5 bg-blue-50 cursor-pointer"
                  @click="addBlockListItem(field.key, Object.fromEntries((field.listFields ?? []).map(f => [f.key, ''])))">+ Add</button>
              </div>
              <div v-for="(item, idx) in (blockData[field.key] as Record<string,any>[])" :key="idx"
                class="mb-1.5 border border-gray-200 rounded-md overflow-hidden">
                <div class="flex justify-between items-center px-2 py-1 bg-gray-50 border-b border-gray-100">
                  <!-- Social link: show live brand icon + platform name -->
                  <template v-if="field.key === 'socials' && selectedBlockTitle === 'Ru1-Form'">
                    <div class="flex items-center gap-1.5">
                      <template v-if="item.href">
                        <span
                          class="flex items-center justify-center w-6 h-6 rounded-full shrink-0 overflow-hidden"
                          style="background:#fff;border:1.5px solid #e5e7eb;">
                          <img :src="faviconUrl(item.href)" width="16" height="16" style="object-fit:contain;" :alt="getDomain(item.href)" />
                        </span>
                      </template>
                      <span v-else class="flex items-center justify-center w-6 h-6 rounded-full border border-dashed border-gray-300 text-gray-300 text-xs">+</span>
                      <span class="text-xs font-medium" :style="item.href ? 'color:#374151;' : 'color:#9ca3af;'">
                        {{ item.href ? (getDomain(item.href) || 'Link') : 'Paste URL below' }}
                      </span>
                    </div>
                  </template>
                  <span v-else class="text-xs text-gray-400 font-medium">{{ idx + 1 }}</span>
                  <div class="flex gap-1">
                    <button v-if="idx > 0" type="button" class="text-xs text-gray-400 hover:text-gray-700 border-none bg-transparent cursor-pointer px-1" @click="moveListItemUp(field.key, idx)">↑</button>
                    <button v-if="idx < (blockData[field.key] as any[]).length - 1" type="button" class="text-xs text-gray-400 hover:text-gray-700 border-none bg-transparent cursor-pointer px-1" @click="moveListItemDown(field.key, idx)">↓</button>
                    <button type="button" class="text-xs text-red-400 hover:text-red-600 border-none bg-transparent cursor-pointer px-1" @click="removeBlockListItem(field.key, idx)">✕</button>
                  </div>
                </div>
                <div class="px-2 py-1.5">
                  <template v-for="subField in field.listFields" :key="subField.key">
                    <div class="mb-1">
                      <label class="block text-xs text-gray-400 mb-0.5">{{ subField.label }}</label>
                      <template v-if="subField.type === 'image'">
                        <div class="flex items-center gap-1 mb-1">
                          <input type="text" :value="item[subField.key]" placeholder="https://..."
                            class="flex-1 border border-gray-200 rounded px-2 py-0.5 text-xs focus:outline-none focus:border-blue-400"
                            @input="debouncedUpdateBlockListItem(field.key, idx, subField.key, ($event.target as HTMLInputElement).value)" />
                          <label class="shrink-0 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 border border-gray-200 rounded px-1.5 py-0.5 cursor-pointer">
                            ↑ <input type="file" accept="image/*" class="sr-only"
                              @change="{ const f=($event.target as HTMLInputElement).files; if(f?.length) onUploadSubImage(field.key,idx,subField.key,f[0]) }" />
                          </label>
                        </div>
                        <img v-if="item[subField.key]" :src="item[subField.key]" class="w-full aspect-square object-cover rounded border border-gray-200 bg-gray-50" alt="preview" />
                      </template>
                      <template v-else-if="subField.type === 'toggle'">
                        <button type="button"
                          class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors border-none cursor-pointer"
                          :class="item[subField.key] !== false ? 'bg-blue-500' : 'bg-gray-200'"
                          @click="updateBlockListItem(field.key, idx, subField.key, item[subField.key] === false)">
                          <span class="inline-block h-3.5 w-3.5 rounded-full bg-white shadow transform transition-transform"
                            :class="item[subField.key] !== false ? 'translate-x-4' : 'translate-x-0.5'" />
                        </button>
                      </template>

                      <!-- color sub-field: swatch picker + hex text input -->
                      <template v-else-if="subField.type === 'color'">
                        <div class="flex items-center gap-2 border border-gray-200 rounded-md px-2 py-1">
                          <input type="color" :value="toHex(item[subField.key])"
                            class="w-6 h-6 rounded cursor-pointer border-none p-0 shrink-0"
                            @input="updateBlockListItem(field.key, idx, subField.key, ($event.target as HTMLInputElement).value)" />
                          <input type="text" :value="item[subField.key]"
                            placeholder="#000000"
                            class="flex-1 text-xs focus:outline-none min-w-0"
                            @input="debouncedUpdateBlockListItem(field.key, idx, subField.key, ($event.target as HTMLInputElement).value)" />
                        </div>
                      </template>

                      <!-- select sub-field: dropdown, instant on selection -->
                      <template v-else-if="subField.type === 'select'">
                        <select class="w-full border border-gray-200 rounded px-2 py-0.5 text-xs bg-white focus:outline-none focus:border-blue-400"
                          :value="item[subField.key]"
                          @change="updateBlockListItem(field.key, idx, subField.key, ($event.target as HTMLSelectElement).value)">
                          <option v-for="opt in subField.options" :key="opt" :value="opt">{{ opt }}</option>
                        </select>
                      </template>

                      <!-- text / url / number: instant update on every keystroke -->
                      <template v-else>
                        <div class="relative">
                          <input type="text" :value="typeof item[subField.key] === 'object' ? '' : (item[subField.key] ?? '')"
                            :placeholder="subField.placeholder ?? ''"
                            :class="subField.type === 'number' ? 'pr-7' : ''"
                            class="w-full border border-gray-200 rounded px-2 py-0.5 text-xs focus:outline-none focus:border-blue-400"
                            @input="debouncedUpdateBlockListItem(field.key, idx, subField.key, ($event.target as HTMLInputElement).value)" />
                          <span v-if="subField.type === 'number'" class="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">{{ subField.unit ?? 'px' }}</span>
                        </div>
                      </template>
                    </div>
                  </template>

                  <!-- Mega Menu configurator: only for Mega-menu-Header navLinks -->
                  <template v-if="selectedBlockTitle === 'Mega-menu-Header' && field.key === 'navLinks'">
                    <div class="mt-1.5 pt-1.5 border-t border-gray-100">
                      <div class="flex items-center justify-between mb-1">
                        <span class="text-xs text-gray-400">Mega Menu</span>
                        <button type="button"
                          @click="megaMenuPickerIdx === idx ? closeMegaMenuEditor() : openMegaMenuEditor(idx)"
                          class="text-xs border border-gray-200 rounded px-1.5 py-0.5 bg-white text-gray-500 hover:bg-gray-50 cursor-pointer">
                          {{ (item.megaMenu as any[])?.length ? `${(item.megaMenu as any[]).length} groups ✎` : '+ Set' }}
                        </button>
                      </div>

                      <!-- mega menu editor panel -->
                      <div v-if="megaMenuPickerIdx === idx" class="border border-gray-200 rounded-md overflow-hidden text-xs mt-1">

                        <!-- product picker for a specific group -->
                        <template v-if="groupProductIdx >= 0">
                          <div class="px-2 py-1.5 bg-gray-50 border-b border-gray-100 flex items-center gap-1.5">
                            <button type="button" @click="groupProductIdx = -1; selectedProductIds = new Set()"
                              class="text-gray-400 hover:text-gray-700 bg-transparent border-none cursor-pointer text-sm leading-none">←</button>
                            <span class="font-medium text-gray-600 flex-1">{{ editingGroups[groupProductIdx]?.label || 'Group' }} products
                              <span v-if="selectedProductIds.size" class="text-blue-500">({{ selectedProductIds.size }})</span>
                            </span>
                            <button type="button" @click="closeMegaMenuEditor" class="text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer">✕</button>
                          </div>
                          <div class="px-2 py-1.5 border-b border-gray-100">
                            <input type="text" v-model="megaMenuSearch" placeholder="Search products…"
                              class="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-400" />
                          </div>
                          <div v-if="megaMenuLoading" class="px-2 py-3 text-gray-400 text-center">Loading…</div>
                          <div v-else class="max-h-52 overflow-y-auto">
                            <label v-for="product in megaMenuFiltered" :key="product.id"
                              class="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 cursor-pointer border-b border-gray-50">
                              <input type="checkbox" :checked="selectedProductIds.has(product.id)"
                                @change="toggleProduct(product.id)" class="cursor-pointer shrink-0" />
                              <img v-if="productImageSrc(product.image)" :src="productImageSrc(product.image)"
                                class="w-8 h-8 object-cover rounded shrink-0" />
                              <div v-else class="w-8 h-8 bg-gray-100 rounded shrink-0" />
                              <div class="flex-1 min-w-0">
                                <div class="text-gray-700 truncate">{{ product.name }}</div>
                                <div class="text-gray-400">${{ Number(product.price).toFixed(2) }}</div>
                              </div>
                            </label>
                            <div v-if="!megaMenuFiltered.length" class="px-2 py-2 text-gray-400 text-center">No products found</div>
                          </div>
                          <div class="px-2 py-1.5 bg-gray-50 border-t border-gray-100">
                            <button type="button" @click="applyGroupProducts"
                              class="w-full text-xs border border-gray-900 rounded px-2 py-1 bg-gray-900 text-white hover:bg-gray-700 cursor-pointer">
                              Done
                            </button>
                          </div>
                        </template>

                        <!-- groups list -->
                        <template v-else>
                          <div class="px-2 py-1.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                            <span class="font-medium text-gray-600">Groups</span>
                            <button type="button" @click="closeMegaMenuEditor" class="text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer">✕</button>
                          </div>
                          <div class="max-h-52 overflow-y-auto">
                            <div v-for="(group, gi) in editingGroups" :key="gi"
                              class="flex items-center gap-1.5 px-2 py-1.5 border-b border-gray-50">
                              <input type="text" :value="group.label"
                                @input="onGroupLabelInput(gi, ($event.target as HTMLInputElement).value)"
                                placeholder="e.g. Women"
                                class="flex-1 border border-gray-200 rounded px-1.5 py-0.5 text-xs focus:outline-none focus:border-blue-400 min-w-0" />
                              <button type="button" @click="openGroupProductPicker(gi)"
                                class="shrink-0 text-xs border border-blue-200 rounded px-1.5 py-0.5 bg-blue-50 text-blue-600 hover:bg-blue-100 cursor-pointer whitespace-nowrap">
                                {{ group.products.length ? `${group.products.length} ✎` : '+ Products' }}
                              </button>
                              <button type="button" @click="removeGroup(gi)"
                                class="shrink-0 text-red-400 hover:text-red-600 bg-transparent border-none cursor-pointer">✕</button>
                            </div>
                            <div v-if="!editingGroups.length" class="px-2 py-2 text-gray-400 text-center">No groups yet</div>
                          </div>
                          <div class="px-2 py-1 border-b border-gray-100">
                            <button type="button" @click="addGroup"
                              class="w-full text-xs text-blue-500 hover:text-blue-700 border border-blue-200 rounded px-2 py-1 bg-blue-50 cursor-pointer">
                              + Add group
                            </button>
                          </div>
                          <div class="px-2 py-1.5 bg-gray-50 flex gap-1.5">
                            <button type="button" @click="applyMegaMenuToLink"
                              class="flex-1 text-xs border border-gray-900 rounded px-2 py-1 bg-gray-900 text-white hover:bg-gray-700 cursor-pointer">
                              Apply
                            </button>
                            <button type="button" @click="closeMegaMenuEditor"
                              class="text-xs border border-gray-200 rounded px-2 py-1 bg-white text-gray-500 hover:bg-gray-50 cursor-pointer">
                              Cancel
                            </button>
                          </div>
                        </template>
                      </div>

                      <!-- summary when closed -->
                      <div v-else-if="(item.megaMenu as any[])?.length" class="mt-0.5">
                        <div v-for="(g, gi) in (item.megaMenu as any[]).slice(0, 3)" :key="gi"
                          class="text-xs text-gray-400 truncate">• {{ g.label }} ({{ (g.products as any[])?.length ?? 0 }})</div>
                        <div v-if="(item.megaMenu as any[]).length > 3" class="text-xs text-gray-400">
                          + {{ (item.megaMenu as any[]).length - 3 }} more
                        </div>
                      </div>
                    </div>
                  </template>
                </div>
              </div>
            </div>

          </template>
        </div>
      </template>

      <!-- Fallback: block selected but not registered in app registry -->
      <div v-if="!isProductBlock && mode === 'block' && (!blockConfig || !blockData)"
        class="px-3 py-3 border-b border-gray-100 text-xs text-gray-400 text-center leading-relaxed">
        No custom editor for this block.<br/>Use the library editors below.
      </div>

      <!-- mode === 'element': library component or raw element — show style editors -->
      <!-- also shown in block mode when a specific child element (not the section itself) is selected -->
      <template v-if="!isProductBlock && (mode === 'element' || (mode === 'block' && selectedEl?.isConnected && selectedEl?.tagName?.toUpperCase() !== 'SECTION'))">

        <!-- Typography (text elements only) -->
        <details v-if="isTextEl" open class="border-b border-gray-100">
          <summary class="px-3 py-2.5 text-xs font-semibold text-gray-600 uppercase tracking-wide cursor-pointer list-none flex items-center justify-between select-none hover:bg-gray-50">
            Typography <span class="text-gray-300">▾</span>
          </summary>
          <div class="px-3 pb-3 space-y-2.5">
            <div class="flex items-center justify-between">
              <span class="text-xs text-gray-500">Size</span>
              <div class="flex items-center gap-1">
                <button @click="adjFs(-1)" class="w-6 h-6 flex items-center justify-center rounded bg-gray-100 hover:bg-gray-200 text-gray-600 border-none cursor-pointer text-sm leading-none font-medium">−</button>
                <input type="number" :value="fsVal" class="w-11 text-center text-xs border border-gray-200 rounded py-0.5 focus:outline-none focus:border-blue-400"
                  @input="fsVal = applyPx('fontSize', Number(($event.target as HTMLInputElement).value), 1, 200)" />
                <button @click="adjFs(1)" class="w-6 h-6 flex items-center justify-center rounded bg-gray-100 hover:bg-gray-200 text-gray-600 border-none cursor-pointer text-sm leading-none font-medium">+</button>
                <span class="text-xs text-gray-400">px</span>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-xs text-gray-500">Line height</span>
              <div class="flex items-center gap-1">
                <button @click="adjLh(-1)" class="w-6 h-6 flex items-center justify-center rounded bg-gray-100 hover:bg-gray-200 text-gray-600 border-none cursor-pointer text-sm leading-none font-medium">−</button>
                <input type="number" :value="lhVal" class="w-11 text-center text-xs border border-gray-200 rounded py-0.5 focus:outline-none focus:border-blue-400"
                  @input="lhVal = applyPx('lineHeight', Number(($event.target as HTMLInputElement).value), 0, 200)" />
                <button @click="adjLh(1)" class="w-6 h-6 flex items-center justify-center rounded bg-gray-100 hover:bg-gray-200 text-gray-600 border-none cursor-pointer text-sm leading-none font-medium">+</button>
                <span class="text-xs text-gray-400">px</span>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-xs text-gray-500">Spacing</span>
              <div class="flex items-center gap-1">
                <button @click="adjLs(-1)" class="w-6 h-6 flex items-center justify-center rounded bg-gray-100 hover:bg-gray-200 text-gray-600 border-none cursor-pointer text-sm leading-none font-medium">−</button>
                <input type="number" :value="lsVal" class="w-11 text-center text-xs border border-gray-200 rounded py-0.5 focus:outline-none focus:border-blue-400"
                  @input="lsVal = applyPx('letterSpacing', Number(($event.target as HTMLInputElement).value), -10, 50)" />
                <button @click="adjLs(1)" class="w-6 h-6 flex items-center justify-center rounded bg-gray-100 hover:bg-gray-200 text-gray-600 border-none cursor-pointer text-sm leading-none font-medium">+</button>
                <span class="text-xs text-gray-400">px</span>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-xs text-gray-500">Weight</span>
              <select class="border border-gray-200 rounded px-2 py-0.5 text-xs bg-white focus:outline-none focus:border-blue-400"
                @change="updateElementStyle('fontWeight', ($event.target as HTMLSelectElement).value)">
                <option value="">—</option>
                <option v-for="w in fontWeights" :key="w.v" :value="w.v">{{ w.l }}</option>
              </select>
            </div>
            <div>
              <span class="text-xs text-gray-500 block mb-1">Font Family</span>
              <select class="w-full border border-gray-200 rounded-md px-2 py-1.5 text-xs bg-white focus:outline-none focus:border-blue-400"
                @change="updateElementStyle('fontFamily', ($event.target as HTMLSelectElement).value)">
                <option value="">— family —</option>
                <option v-for="f in fontFamilies" :key="f" :value="f">{{ f }}</option>
              </select>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-xs text-gray-500">Align</span>
              <div class="flex gap-1">
                <button v-for="a in textAligns" :key="a" type="button"
                  class="w-7 h-7 text-xs border rounded border-gray-200 cursor-pointer flex items-center justify-center hover:bg-gray-100"
                  :class="selectedEl?.style.textAlign === a ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-500'"
                  @click="updateElementStyle('textAlign', a)">≡</button>
              </div>
            </div>
          </div>
        </details>

        <!-- Text colour (text elements only) -->
        <details v-if="isTextEl" class="border-b border-gray-100">
          <summary class="px-3 py-2.5 text-xs font-semibold text-gray-600 uppercase tracking-wide cursor-pointer list-none flex items-center justify-between select-none hover:bg-gray-50">
            Text Colour <span class="text-gray-300">▾</span>
          </summary>
          <div class="px-3 pb-3 flex items-center gap-2">
            <input type="color" class="w-8 h-8 rounded-md border border-gray-200 cursor-pointer p-0.5"
              @change="updateElementStyle('color', ($event.target as HTMLInputElement).value)" />
            <input type="text" placeholder="#000000" class="flex-1 border border-gray-200 rounded-md px-2 py-1.5 text-xs focus:outline-none focus:border-blue-400"
              @input="updateElementStyle('color', ($event.target as HTMLInputElement).value)" />
            <button type="button" class="text-xs text-gray-400 hover:text-red-500 border-none bg-transparent cursor-pointer shrink-0"
              @click="updateElementStyle('color', '')">✕</button>
          </div>
        </details>

        <!-- Background colour -->
        <details class="border-b border-gray-100">
          <summary class="px-3 py-2.5 text-xs font-semibold text-gray-600 uppercase tracking-wide cursor-pointer list-none flex items-center justify-between select-none hover:bg-gray-50">
            Background <span class="text-gray-300">▾</span>
          </summary>
          <div class="px-3 pb-3 flex items-center gap-2">
            <input type="color" class="w-8 h-8 rounded-md border border-gray-200 cursor-pointer p-0.5"
              @change="updateElementStyle('backgroundColor', ($event.target as HTMLInputElement).value)" />
            <input type="text" placeholder="#ffffff" class="flex-1 border border-gray-200 rounded-md px-2 py-1.5 text-xs focus:outline-none focus:border-blue-400"
              @input="updateElementStyle('backgroundColor', ($event.target as HTMLInputElement).value)" />
            <button type="button" class="text-xs text-gray-400 hover:text-red-500 border-none bg-transparent cursor-pointer shrink-0"
              @click="updateElementStyle('backgroundColor', '')">✕</button>
          </div>
        </details>

        <!-- Image src (img elements only) -->
        <details v-if="isImgEl" class="border-b border-gray-100">
          <summary class="px-3 py-2.5 text-xs font-semibold text-gray-600 uppercase tracking-wide cursor-pointer list-none flex items-center justify-between select-none hover:bg-gray-50">
            Image <span class="text-gray-300">▾</span>
          </summary>
          <div class="px-3 pb-3">
            <img v-if="imageInput" :src="imageInput" class="w-full h-24 object-cover rounded-md mb-2 border border-gray-200" alt="preview" />
            <input type="text" v-model="imageInput" placeholder="https://…" class="w-full border border-gray-200 rounded-md px-2 py-1.5 text-xs mb-2 focus:outline-none focus:border-blue-400" />
            <button type="button" class="w-full text-xs bg-blue-500 text-white rounded-md py-1.5 border-none cursor-pointer hover:bg-blue-600" @click="onApplyImage">Apply</button>
          </div>
        </details>

        <div class="h-2"></div>
      </template>

    </template>
  </Teleport>
</template>
