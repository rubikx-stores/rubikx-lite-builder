<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { usePageBuilderStateStore } from '@myissue/vue-website-page-builder'

const store = usePageBuilderStateStore() as any
const {
  selectedEl,
  selectedBlockTitle,
  mode,
  blockConfig,
  blockData,
  updateBlockField,
  updateBlockListItem,
  addBlockListItem,
  removeBlockListItem,
  updateElementStyle,
  updateElementClass,
  addLink,
  removeLink,
  openGlobalPageStyles,
} = useEditorSidebar()

// ── Link editor local state ──────────────────────────────────────────────────
const linkEnabled = ref(false)
const linkUrl = ref('')
const linkNewTab = ref(false)
const linkError = ref('')
const linkSuccess = ref('')

watch(selectedEl, (el) => {
  if (!el) { linkEnabled.value = false; linkUrl.value = ''; linkError.value = ''; linkSuccess.value = ''; return }
  const a = el.closest('a') as HTMLAnchorElement | null
  linkEnabled.value = !!a
  linkUrl.value = a?.href ?? ''
  linkNewTab.value = a?.target === '_blank'
  linkError.value = ''
  linkSuccess.value = ''
})

function onLinkToggle(val: boolean) {
  linkEnabled.value = val
  if (!val) { removeLink(); linkSuccess.value = 'Link removed'; linkUrl.value = '' }
}

function onLinkSubmit() {
  if (!linkUrl.value.startsWith('http://') && !linkUrl.value.startsWith('https://')) {
    linkError.value = 'URL must start with http:// or https://'
    linkSuccess.value = ''
    return
  }
  addLink(linkUrl.value, linkNewTab.value)
  linkError.value = ''
  linkSuccess.value = 'Link added'
}

// ── Class editor local state ─────────────────────────────────────────────────
const classInput = ref('')
const currentClasses = ref<string[]>([])

function _refreshClasses() {
  currentClasses.value = selectedEl.value ? Array.from(selectedEl.value.classList) : []
}

watch(selectedEl, () => _refreshClasses())

function onAddClass() {
  const cls = classInput.value.trim()
  if (!cls) return
  updateElementClass(cls, true)
  classInput.value = ''
  _refreshClasses()
}

// ── Style editor local state ─────────────────────────────────────────────────
const styleProp = ref('')
const styleVal = ref('')
const currentStyles = ref('')

function _refreshStyles() {
  currentStyles.value = selectedEl.value?.style.cssText ?? ''
}

watch(selectedEl, () => _refreshStyles())

function onAddStyle() {
  const p = styleProp.value.trim()
  const v = styleVal.value.trim()
  if (!p || !v) return
  updateElementStyle(p, v)
  styleProp.value = ''
  styleVal.value = ''
  _refreshStyles()
}

// ── HTML editor local state ──────────────────────────────────────────────────
const htmlInput = ref('')

watch(selectedEl, (el) => { if (el) htmlInput.value = el.outerHTML })

function onApplyHtml() {
  const el = selectedEl.value
  if (!el || !el.parentNode) return
  const tmp = document.createElement('div')
  tmp.innerHTML = htmlInput.value
  const newEl = tmp.firstElementChild as HTMLElement | null
  if (!newEl) return
  el.parentNode.replaceChild(newEl, el)
  store.setElement(newEl)
  import('@myissue/vue-website-page-builder').then(({ getPageBuilder }) => {
    const b = getPageBuilder() as any
    b.addListenersToEditableElements().then(() => { b.syncDomToStoreOnly(); b.saveDomComponentsToLocalStorage() })
  })
}

// ── Image editor ─────────────────────────────────────────────────────────────
const imageInput = ref('')
watch(selectedEl, (el) => {
  imageInput.value = el?.tagName === 'IMG' ? (el as HTMLImageElement).src : ''
})

function onApplyImage() {
  const el = selectedEl.value
  if (!el || el.tagName !== 'IMG') return
  ;(el as HTMLImageElement).src = imageInput.value
  import('@myissue/vue-website-page-builder').then(({ getPageBuilder }) => {
    const b = getPageBuilder() as any
    b.syncDomToStoreOnly(); b.saveDomComponentsToLocalStorage()
  })
}

// ── Border radius local state ────────────────────────────────────────────────
const borderRadiusMode = ref<'global' | 'specific'>('global')
const borderRadiusGlobal = ref('0')
const borderRadiusTL = ref('')
const borderRadiusTR = ref('')
const borderRadiusBL = ref('')
const borderRadiusBR = ref('')

watch(selectedEl, (el) => {
  if (!el) return
  borderRadiusGlobal.value = el.style.borderRadius ? el.style.borderRadius.replace('px', '') : '0'
  borderRadiusTL.value = el.style.borderTopLeftRadius || ''
  borderRadiusTR.value = el.style.borderTopRightRadius || ''
  borderRadiusBL.value = el.style.borderBottomLeftRadius || ''
  borderRadiusBR.value = el.style.borderBottomRightRadius || ''
})

// ── Spacing presets ───────────────────────────────────────────────────────────
const spacingPresets = ['0px', '4px', '8px', '12px', '16px', '24px', '32px', '48px', '64px']

// ── Typography ────────────────────────────────────────────────────────────────
const fontSizes = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px', '48px']
const fontWeights = ['300', '400', '500', '600', '700', '800', '900']
const fontFamilies = ['inherit', 'Inter, sans-serif', 'Georgia, serif', 'Courier New, monospace', 'Arial, sans-serif']

const isTextElement = computed(() => {
  const tag = selectedEl.value?.tagName?.toUpperCase()
  return tag ? ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'SPAN', 'A', 'LI', 'BUTTON', 'LABEL'].includes(tag) : false
})

const isImageElement = computed(() => selectedEl.value?.tagName?.toUpperCase() === 'IMG')
</script>

<template>
  <Transition
    enter-active-class="transition-transform duration-200"
    enter-from-class="-translate-x-full"
    enter-to-class="translate-x-0"
    leave-active-class="transition-transform duration-200"
    leave-from-class="translate-x-0"
    leave-to-class="-translate-x-full"
  >
    <div
      v-if="mode !== 'none'"
      class="absolute left-0 top-0 bottom-0 z-30 w-72 bg-white border-r border-gray-200 shadow-lg flex flex-col overflow-hidden"
    >
      <!-- Header -->
      <div class="flex-shrink-0 px-3 py-2 border-b border-gray-200 bg-gray-50">
        <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          {{ mode === 'block' ? selectedBlockTitle : 'Element' }}
        </p>
      </div>

      <!-- Scrollable content -->
      <div class="flex-1 overflow-y-auto pb-4">

        <!-- ── Block Content Editor ───────────────────────────────────────── -->
        <template v-if="mode === 'block' && blockConfig && blockData">
          <div class="px-3 pt-3 pb-2 border-b border-gray-200">
            <p class="text-xs font-semibold text-gray-700 mb-3">Block Content</p>

            <template v-for="field in blockConfig.fields" :key="field.key">
              <!-- text / url / image / number -->
              <div v-if="['text','url','image','number'].includes(field.type)" class="mb-3">
                <label class="block text-xs text-gray-600 mb-1">{{ field.label }}</label>
                <input
                  type="text"
                  :value="blockData[field.key]"
                  class="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-400"
                  @change="updateBlockField(field.key, ($event.target as HTMLInputElement).value)"
                />
              </div>

              <!-- color -->
              <div v-else-if="field.type === 'color'" class="mb-3">
                <label class="block text-xs text-gray-600 mb-1">{{ field.label }}</label>
                <div class="flex items-center gap-2">
                  <input type="color" :value="blockData[field.key]" class="w-8 h-8 border border-gray-300 rounded cursor-pointer" @change="updateBlockField(field.key, ($event.target as HTMLInputElement).value)" />
                  <input type="text" :value="blockData[field.key]" class="flex-1 border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-400" @change="updateBlockField(field.key, ($event.target as HTMLInputElement).value)" />
                </div>
              </div>

              <!-- toggle -->
              <div v-else-if="field.type === 'toggle'" class="mb-3 flex items-center justify-between">
                <label class="text-xs text-gray-600">{{ field.label }}</label>
                <button
                  type="button"
                  class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors border-none cursor-pointer"
                  :class="blockData[field.key] ? 'bg-blue-500' : 'bg-gray-300'"
                  @click="updateBlockField(field.key, !blockData[field.key])"
                >
                  <span class="inline-block h-3.5 w-3.5 rounded-full bg-white shadow transform transition-transform" :class="blockData[field.key] ? 'translate-x-4' : 'translate-x-0.5'" />
                </button>
              </div>

              <!-- select -->
              <div v-else-if="field.type === 'select'" class="mb-3">
                <label class="block text-xs text-gray-600 mb-1">{{ field.label }}</label>
                <select
                  :value="String(blockData[field.key])"
                  class="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-400 bg-white"
                  @change="updateBlockField(field.key, Number(($event.target as HTMLSelectElement).value) || ($event.target as HTMLSelectElement).value)"
                >
                  <option v-for="opt in field.options" :key="opt" :value="opt">{{ opt }}</option>
                </select>
              </div>

              <!-- list -->
              <div v-else-if="field.type === 'list' && field.listFields" class="mb-3">
                <div class="flex items-center justify-between mb-2">
                  <label class="text-xs text-gray-600">{{ field.label }}</label>
                  <button
                    type="button"
                    class="text-xs text-blue-500 hover:text-blue-700 border-none bg-transparent cursor-pointer"
                    @click="addBlockListItem(field.key, Object.fromEntries((field.listFields ?? []).map(f => [f.key, ''])))"
                  >+ Add</button>
                </div>
                <div
                  v-for="(item, idx) in (blockData[field.key] as Record<string, any>[])"
                  :key="idx"
                  class="mb-2 border border-gray-200 rounded p-2"
                >
                  <div class="flex justify-between items-center mb-1">
                    <span class="text-xs text-gray-400">#{{ idx + 1 }}</span>
                    <div class="flex gap-1">
                      <button v-if="idx > 0" type="button" class="text-xs text-gray-400 hover:text-gray-700 border-none bg-transparent cursor-pointer" @click="updateBlockField(field.key, (() => { const arr = [...blockData![field.key]]; const [it] = arr.splice(idx,1); arr.splice(idx-1,0,it); return arr })())">↑</button>
                      <button v-if="idx < (blockData[field.key] as any[]).length - 1" type="button" class="text-xs text-gray-400 hover:text-gray-700 border-none bg-transparent cursor-pointer" @click="updateBlockField(field.key, (() => { const arr = [...blockData![field.key]]; const [it] = arr.splice(idx,1); arr.splice(idx+1,0,it); return arr })())">↓</button>
                      <button type="button" class="text-xs text-red-400 hover:text-red-600 border-none bg-transparent cursor-pointer" @click="removeBlockListItem(field.key, idx)">✕</button>
                    </div>
                  </div>
                  <template v-for="subField in field.listFields" :key="subField.key">
                    <div class="mb-1">
                      <label class="block text-xs text-gray-500 mb-0.5">{{ subField.label }}</label>
                      <input type="text" :value="item[subField.key]" class="w-full border border-gray-200 rounded px-2 py-0.5 text-xs focus:outline-none focus:border-blue-400" @change="updateBlockListItem(field.key, idx, subField.key, ($event.target as HTMLInputElement).value)" />
                    </div>
                  </template>
                </div>
              </div>
            </template>
          </div>
        </template>

        <!-- ── Element Style Editors ─────────────────────────────────────── -->
        <div class="px-3 pt-3">
          <p class="text-xs font-semibold text-gray-700 mb-3">Element Styles</p>

          <!-- Link Editor -->
          <details class="mb-2 border border-gray-100 rounded">
            <summary class="px-2 py-1.5 text-xs font-medium text-gray-700 cursor-pointer list-none flex items-center justify-between">Link <span class="text-gray-400">▾</span></summary>
            <div class="px-2 py-2 border-t border-gray-100">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs text-gray-600">Enable Link</span>
                <button type="button" class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors border-none cursor-pointer" :class="linkEnabled ? 'bg-blue-500' : 'bg-gray-300'" @click="onLinkToggle(!linkEnabled)">
                  <span class="inline-block h-3.5 w-3.5 rounded-full bg-white shadow transform transition-transform" :class="linkEnabled ? 'translate-x-4' : 'translate-x-0.5'" />
                </button>
              </div>
              <template v-if="linkEnabled">
                <input v-model="linkUrl" type="text" placeholder="https://" class="w-full border border-gray-300 rounded px-2 py-1 text-xs mb-1 focus:outline-none focus:border-blue-400" @keydown.enter="onLinkSubmit" />
                <div class="flex items-center justify-between mb-1">
                  <span class="text-xs text-gray-600">Open in new tab</span>
                  <input type="checkbox" v-model="linkNewTab" class="cursor-pointer" />
                </div>
                <button type="button" class="w-full text-xs bg-blue-500 text-white rounded py-1 border-none cursor-pointer hover:bg-blue-600" @click="onLinkSubmit">Apply</button>
                <p v-if="linkError" class="text-xs text-red-500 mt-1">{{ linkError }}</p>
                <p v-if="linkSuccess" class="text-xs text-green-500 mt-1">{{ linkSuccess }}</p>
              </template>
            </div>
          </details>

          <!-- Typography -->
          <details v-if="isTextElement" class="mb-2 border border-gray-100 rounded">
            <summary class="px-2 py-1.5 text-xs font-medium text-gray-700 cursor-pointer list-none flex items-center justify-between">Typography <span class="text-gray-400">▾</span></summary>
            <div class="px-2 py-2 border-t border-gray-100">
              <label class="block text-xs text-gray-500 mb-0.5">Font Size</label>
              <select class="w-full border border-gray-200 rounded px-2 py-1 text-xs mb-2 bg-white" @change="updateElementStyle('fontSize', ($event.target as HTMLSelectElement).value)">
                <option value="">— size —</option>
                <option v-for="s in fontSizes" :key="s" :value="s">{{ s }}</option>
              </select>
              <label class="block text-xs text-gray-500 mb-0.5">Font Weight</label>
              <select class="w-full border border-gray-200 rounded px-2 py-1 text-xs mb-2 bg-white" @change="updateElementStyle('fontWeight', ($event.target as HTMLSelectElement).value)">
                <option value="">— weight —</option>
                <option v-for="w in fontWeights" :key="w" :value="w">{{ w }}</option>
              </select>
              <label class="block text-xs text-gray-500 mb-0.5">Font Family</label>
              <select class="w-full border border-gray-200 rounded px-2 py-1 text-xs bg-white" @change="updateElementStyle('fontFamily', ($event.target as HTMLSelectElement).value)">
                <option value="">— family —</option>
                <option v-for="f in fontFamilies" :key="f" :value="f">{{ f }}</option>
              </select>
            </div>
          </details>

          <!-- Background Color -->
          <details class="mb-2 border border-gray-100 rounded">
            <summary class="px-2 py-1.5 text-xs font-medium text-gray-700 cursor-pointer list-none flex items-center justify-between">Background Color <span class="text-gray-400">▾</span></summary>
            <div class="px-2 py-2 border-t border-gray-100 flex items-center gap-2">
              <input type="color" class="w-8 h-8 border border-gray-300 rounded cursor-pointer" @change="updateElementStyle('backgroundColor', ($event.target as HTMLInputElement).value)" />
              <button type="button" class="text-xs text-gray-500 hover:text-red-500 border-none bg-transparent cursor-pointer" @click="updateElementStyle('backgroundColor', '')">Clear</button>
            </div>
          </details>

          <!-- Text Color -->
          <details v-if="isTextElement" class="mb-2 border border-gray-100 rounded">
            <summary class="px-2 py-1.5 text-xs font-medium text-gray-700 cursor-pointer list-none flex items-center justify-between">Text Color <span class="text-gray-400">▾</span></summary>
            <div class="px-2 py-2 border-t border-gray-100 flex items-center gap-2">
              <input type="color" class="w-8 h-8 border border-gray-300 rounded cursor-pointer" @change="updateElementStyle('color', ($event.target as HTMLInputElement).value)" />
              <button type="button" class="text-xs text-gray-500 hover:text-red-500 border-none bg-transparent cursor-pointer" @click="updateElementStyle('color', '')">Clear</button>
            </div>
          </details>

          <!-- Padding -->
          <details class="mb-2 border border-gray-100 rounded">
            <summary class="px-2 py-1.5 text-xs font-medium text-gray-700 cursor-pointer list-none flex items-center justify-between">Padding <span class="text-gray-400">▾</span></summary>
            <div class="px-2 py-2 border-t border-gray-100">
              <label class="block text-xs text-gray-500 mb-0.5">Vertical (top &amp; bottom)</label>
              <select class="w-full border border-gray-200 rounded px-2 py-1 text-xs mb-2 bg-white" @change="(e) => { const v = (e.target as HTMLSelectElement).value; updateElementStyle('paddingTop', v); updateElementStyle('paddingBottom', v) }">
                <option value="">— none —</option>
                <option v-for="s in spacingPresets" :key="s" :value="s">{{ s }}</option>
              </select>
              <label class="block text-xs text-gray-500 mb-0.5">Horizontal (left &amp; right)</label>
              <select class="w-full border border-gray-200 rounded px-2 py-1 text-xs bg-white" @change="(e) => { const v = (e.target as HTMLSelectElement).value; updateElementStyle('paddingLeft', v); updateElementStyle('paddingRight', v) }">
                <option value="">— none —</option>
                <option v-for="s in spacingPresets" :key="s" :value="s">{{ s }}</option>
              </select>
            </div>
          </details>

          <!-- Margin -->
          <details class="mb-2 border border-gray-100 rounded">
            <summary class="px-2 py-1.5 text-xs font-medium text-gray-700 cursor-pointer list-none flex items-center justify-between">Margin <span class="text-gray-400">▾</span></summary>
            <div class="px-2 py-2 border-t border-gray-100">
              <label class="block text-xs text-gray-500 mb-0.5">Vertical (top &amp; bottom)</label>
              <select class="w-full border border-gray-200 rounded px-2 py-1 text-xs mb-2 bg-white" @change="(e) => { const v = (e.target as HTMLSelectElement).value; updateElementStyle('marginTop', v); updateElementStyle('marginBottom', v) }">
                <option value="">— none —</option>
                <option v-for="s in spacingPresets" :key="s" :value="s">{{ s }}</option>
              </select>
              <label class="block text-xs text-gray-500 mb-0.5">Horizontal (left &amp; right)</label>
              <select class="w-full border border-gray-200 rounded px-2 py-1 text-xs bg-white" @change="(e) => { const v = (e.target as HTMLSelectElement).value; updateElementStyle('marginLeft', v); updateElementStyle('marginRight', v) }">
                <option value="">— none —</option>
                <option v-for="s in spacingPresets" :key="s" :value="s">{{ s }}</option>
              </select>
            </div>
          </details>

          <!-- Border Radius -->
          <details class="mb-2 border border-gray-100 rounded">
            <summary class="px-2 py-1.5 text-xs font-medium text-gray-700 cursor-pointer list-none flex items-center justify-between">Border Radius <span class="text-gray-400">▾</span></summary>
            <div class="px-2 py-2 border-t border-gray-100">
              <div class="flex gap-2 mb-2">
                <button type="button" class="text-xs px-2 py-0.5 rounded border-none cursor-pointer" :class="borderRadiusMode === 'global' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'" @click="borderRadiusMode = 'global'">Global</button>
                <button type="button" class="text-xs px-2 py-0.5 rounded border-none cursor-pointer" :class="borderRadiusMode === 'specific' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'" @click="borderRadiusMode = 'specific'">Specific</button>
              </div>
              <template v-if="borderRadiusMode === 'global'">
                <input type="range" min="0" max="50" v-model="borderRadiusGlobal" class="w-full" @input="updateElementStyle('borderRadius', borderRadiusGlobal + 'px')" />
                <span class="text-xs text-gray-500">{{ borderRadiusGlobal }}px</span>
              </template>
              <template v-else>
                <div class="grid grid-cols-2 gap-1">
                  <div><label class="text-xs text-gray-500">TL</label><input type="text" v-model="borderRadiusTL" class="w-full border border-gray-200 rounded px-1 py-0.5 text-xs" @change="updateElementStyle('borderTopLeftRadius', borderRadiusTL)" /></div>
                  <div><label class="text-xs text-gray-500">TR</label><input type="text" v-model="borderRadiusTR" class="w-full border border-gray-200 rounded px-1 py-0.5 text-xs" @change="updateElementStyle('borderTopRightRadius', borderRadiusTR)" /></div>
                  <div><label class="text-xs text-gray-500">BL</label><input type="text" v-model="borderRadiusBL" class="w-full border border-gray-200 rounded px-1 py-0.5 text-xs" @change="updateElementStyle('borderBottomLeftRadius', borderRadiusBL)" /></div>
                  <div><label class="text-xs text-gray-500">BR</label><input type="text" v-model="borderRadiusBR" class="w-full border border-gray-200 rounded px-1 py-0.5 text-xs" @change="updateElementStyle('borderBottomRightRadius', borderRadiusBR)" /></div>
                </div>
              </template>
            </div>
          </details>

          <!-- Borders -->
          <details class="mb-2 border border-gray-100 rounded">
            <summary class="px-2 py-1.5 text-xs font-medium text-gray-700 cursor-pointer list-none flex items-center justify-between">Borders <span class="text-gray-400">▾</span></summary>
            <div class="px-2 py-2 border-t border-gray-100">
              <label class="block text-xs text-gray-500 mb-0.5">Style</label>
              <select class="w-full border border-gray-200 rounded px-2 py-1 text-xs mb-2 bg-white" @change="updateElementStyle('borderStyle', ($event.target as HTMLSelectElement).value)">
                <option value="none">none</option>
                <option value="solid">solid</option>
                <option value="dashed">dashed</option>
                <option value="dotted">dotted</option>
              </select>
              <label class="block text-xs text-gray-500 mb-0.5">Width (px)</label>
              <input type="number" min="0" max="20" placeholder="1" class="w-full border border-gray-200 rounded px-2 py-1 text-xs mb-2" @change="updateElementStyle('borderWidth', ($event.target as HTMLInputElement).value + 'px')" />
              <label class="block text-xs text-gray-500 mb-0.5">Color</label>
              <input type="color" class="w-8 h-8 border border-gray-300 rounded cursor-pointer" @change="updateElementStyle('borderColor', ($event.target as HTMLInputElement).value)" />
            </div>
          </details>

          <!-- Opacity -->
          <details class="mb-2 border border-gray-100 rounded">
            <summary class="px-2 py-1.5 text-xs font-medium text-gray-700 cursor-pointer list-none flex items-center justify-between">Opacity <span class="text-gray-400">▾</span></summary>
            <div class="px-2 py-2 border-t border-gray-100">
              <label class="block text-xs text-gray-500 mb-0.5">Element Opacity</label>
              <input type="range" min="0" max="1" step="0.05" class="w-full" @input="updateElementStyle('opacity', ($event.target as HTMLInputElement).value)" />
            </div>
          </details>

          <!-- Image Editor -->
          <details v-if="isImageElement" class="mb-2 border border-gray-100 rounded">
            <summary class="px-2 py-1.5 text-xs font-medium text-gray-700 cursor-pointer list-none flex items-center justify-between">Image <span class="text-gray-400">▾</span></summary>
            <div class="px-2 py-2 border-t border-gray-100">
              <img v-if="imageInput" :src="imageInput" class="w-full h-24 object-cover rounded mb-2 border border-gray-200" alt="preview" />
              <input type="text" v-model="imageInput" placeholder="https://..." class="w-full border border-gray-200 rounded px-2 py-1 text-xs mb-1" />
              <button type="button" class="w-full text-xs bg-blue-500 text-white rounded py-1 border-none cursor-pointer hover:bg-blue-600" @click="onApplyImage">Apply</button>
            </div>
          </details>

          <!-- Class Editor -->
          <details class="mb-2 border border-gray-100 rounded">
            <summary class="px-2 py-1.5 text-xs font-medium text-gray-700 cursor-pointer list-none flex items-center justify-between">Classes <span class="text-gray-400">▾</span></summary>
            <div class="px-2 py-2 border-t border-gray-100">
              <div class="flex flex-wrap gap-1 mb-2">
                <span v-for="cls in currentClasses" :key="cls" class="inline-flex items-center gap-0.5 bg-gray-100 text-gray-700 text-xs rounded px-1.5 py-0.5">
                  {{ cls }}
                  <button type="button" class="text-gray-400 hover:text-red-500 border-none bg-transparent cursor-pointer p-0 leading-none" @click="() => { updateElementClass(cls, false); _refreshClasses() }">×</button>
                </span>
              </div>
              <div class="flex gap-1">
                <input v-model="classInput" type="text" placeholder="class-name" class="flex-1 border border-gray-200 rounded px-2 py-1 text-xs" @keydown.enter="onAddClass" />
                <button type="button" class="text-xs bg-blue-500 text-white rounded px-2 border-none cursor-pointer hover:bg-blue-600" @click="onAddClass">Add</button>
              </div>
            </div>
          </details>

          <!-- Style Editor -->
          <details class="mb-2 border border-gray-100 rounded">
            <summary class="px-2 py-1.5 text-xs font-medium text-gray-700 cursor-pointer list-none flex items-center justify-between">Inline Styles <span class="text-gray-400">▾</span></summary>
            <div class="px-2 py-2 border-t border-gray-100">
              <p class="text-xs text-gray-400 mb-1 break-all">{{ currentStyles || '—' }}</p>
              <div class="flex gap-1 mb-1">
                <input v-model="styleProp" type="text" placeholder="property" class="flex-1 border border-gray-200 rounded px-2 py-1 text-xs" />
                <input v-model="styleVal" type="text" placeholder="value" class="flex-1 border border-gray-200 rounded px-2 py-1 text-xs" @keydown.enter="onAddStyle" />
              </div>
              <button type="button" class="w-full text-xs bg-blue-500 text-white rounded py-1 border-none cursor-pointer hover:bg-blue-600" @click="onAddStyle">Apply</button>
            </div>
          </details>

          <!-- HTML Editor -->
          <details class="mb-2 border border-gray-100 rounded">
            <summary class="px-2 py-1.5 text-xs font-medium text-gray-700 cursor-pointer list-none flex items-center justify-between">HTML <span class="text-gray-400">▾</span></summary>
            <div class="px-2 py-2 border-t border-gray-100">
              <textarea v-model="htmlInput" rows="6" class="w-full border border-gray-200 rounded px-2 py-1 text-xs font-mono mb-1 focus:outline-none focus:border-blue-400" />
              <button type="button" class="w-full text-xs bg-blue-500 text-white rounded py-1 border-none cursor-pointer hover:bg-blue-600" @click="onApplyHtml">Apply HTML</button>
            </div>
          </details>

        </div>
      </div>

      <!-- ── Global Page Styles — always at bottom ──────────────────────── -->
      <div class="flex-shrink-0 border-t border-gray-200 p-3">
        <button
          type="button"
          class="w-full text-xs font-medium bg-gray-50 hover:bg-gray-100 text-gray-700 rounded py-2 border border-gray-200 cursor-pointer"
          @click="openGlobalPageStyles"
        >
          ⚙ Global Page Styles
        </button>
      </div>
    </div>
  </Transition>
</template>
