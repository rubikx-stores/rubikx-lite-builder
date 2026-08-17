<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { usePageBuilderStateStore, sharedPageBuilderStore } from '@myissue/vue-website-page-builder'
import ProductsEditor from '../ProductsEditor.client.vue'
import FaqAnswerEditorModal from './FaqAnswerEditorModal.client.vue'
import { useBlockRegistry } from '~/composables/editor/useBlockRegistry'
import type { FieldConfig } from '~/composables/editor/useBlockRegistry'
import { productImageSrc } from '~/composables/useProductImageSrc'
import { getDomain, faviconUrl } from '~/composables/useSocialIcons'
import { hydrateComponents } from '~/plugins/rubikx-hydration.client'
import { buildCategoryTree } from '~/composables/categories/buildCategoryTree'
import type { FlatCategory } from '~/composables/categories/buildCategoryTree'

const selectedCompanyId = useState<number | null>('selectedCompanyId')

const store = usePageBuilderStateStore() as any
const {
  selectedEl, selectedBlockId, selectedBlockTitle, mode,
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

// ── List-item toggle sub-field ────────────────────────────────────────────────
// Unset value normally reads as ON (matches fields like `visible`, where a
// link should still show up until someone turns it off). A field can opt into
// the opposite by setting `default: false` in its FieldConfig (e.g. "Open in
// New Tab", which should stay off until explicitly enabled).
function isSubToggleOn(item: Record<string, any>, subField: FieldConfig): boolean {
  return subField.default === false ? item[subField.key] === true : item[subField.key] !== false
}
function nextSubToggleValue(item: Record<string, any>, subField: FieldConfig): boolean {
  return subField.default === false ? item[subField.key] !== true : item[subField.key] === false
}

// ── Product block flag ────────────────────────────────────────────────────────
// Legacy blocks that pre-date the block registry
const _LEGACY_PRODUCT_TITLES = ['Ru3-Show-Single-Products', 'Ru2-Show-Multiple-Products']

const _blockRegistry = useBlockRegistry()

function _isProductTitle(title: string): boolean {
  if (!title) return false
  if (_LEGACY_PRODUCT_TITLES.includes(title)) return true
  // Any registry block whose defaults include a productIds or products field
  const config = _blockRegistry.getConfig(title)
  if (config) return 'productIds' in config.defaults || 'products' in config.defaults
  return false
}

const lastProductTitle = ref('')

watch(
  () => (sharedPageBuilderStore as any).getComponent,
  (comp: any) => {
    if (comp?.title && _isProductTitle(comp.title)) {
      lastProductTitle.value = comp.title
    } else if (comp !== null) {
      lastProductTitle.value = ''
    }
    // comp === null is a post-save reset — keep lastProductTitle as-is
  }
)

const isProductBlock = computed(() =>
  _isProductTitle((sharedPageBuilderStore as any).getComponent?.title ?? '') ||
  _isProductTitle(selectedBlockTitle.value ?? '') ||
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
  const capturedId = selectedBlockId.value   // snapshot NOW, before any await
  clearTimeout(_fieldDebounceTimer)
  _fieldDebounceTimer = window.setTimeout(() => {
    if (!capturedId) return
    updateBlockField(fieldKey, value, capturedId)
  }, 50)
}

async function onToggleField(fieldKey: string, newValue: boolean) {
  await updateBlockField(fieldKey, newValue)
  if (fieldKey === 'dynamicCategories' && newValue === true) {
    await nextTick()
    document.querySelectorAll('[data-rubikx-component="CategoryNav"]').forEach(el => {
      (el as HTMLElement).removeAttribute('data-hydrated')
    })
    hydrateComponents(selectedCompanyId.value ?? undefined)
  }
}

// Sync Categories from API (Ru3-Mega-Header): fetches the real category
// tree once and writes one Nav Links entry per root category — showDropdown
// on for anything with children, so mountCmsCategoryNav (headless) scopes
// its dropdown via data-category-name exactly like a hand-typed dropdown
// link already does. Re-running preserves any URL you've already edited for
// a category still present (matched by label) and only adds genuinely new
// ones — it never touches links that aren't in the current category list
// (e.g. "Home"), so those stay exactly as configured.
async function syncCategoriesFromApi() {
  const data = blockData.value
  if (!data) return
  buttonFieldBusy.value.syncCategoriesFromApi = true
  buttonFieldError.value.syncCategoriesFromApi = ''
  try {
    const flat = await $fetch<FlatCategory[]>('/api/categories', {
      query: { companyId: selectedCompanyId.value ?? undefined },
    })
    const tree = buildCategoryTree(flat)

    // Display-name priority: headlessName (if truthy — it's `false` when
    // unset, not null/undefined, hence `||` not `??`) → displayName → name.
    const labelFor = (c: FlatCategory) => String(c.headlessName || c.displayName || c.name)

    const existingNavLinks = (data.navLinks ?? []) as Array<{ label: string; href: string; showDropdown: boolean; categoryFilter?: string }>
    const existingByLabel = new Map(existingNavLinks.map(l => [l.label, l]))
    const categoryLabels = new Set(tree.map(labelFor))

    const keptStatic = existingNavLinks.filter(l => !categoryLabels.has(l.label))
    const syncedCategories = tree.map(cat => {
      const label = labelFor(cat)
      const existing = existingByLabel.get(label)
      const slug = cat.headlessName || cat.name.toLowerCase().replace(/\s+/g, '-')
      return {
        label,
        href: existing?.href ?? `/${slug}`,
        showDropdown: (cat.children?.length ?? 0) > 0,
        // Keeps the builder-preview's own dropdown scoping (loadCategories'
        // data-category-filter) in sync with the live site's scoping
        // (mountCmsCategoryNav's data-category-name, always derived from
        // this same label) — without this, a synced category would preview
        // as the full unscoped tree while still being correct once published.
        categoryFilter: existing?.categoryFilter ?? label,
      }
    })

    await updateBlockField('navLinks', [...keptStatic, ...syncedCategories])
  } catch (e) {
    console.error('[Sync Categories from API] failed', e)
    buttonFieldError.value.syncCategoriesFromApi = 'Failed to fetch categories — check console.'
  } finally {
    buttonFieldBusy.value.syncCategoriesFromApi = false
  }
}

// Sync Categories from API (Ru7-Hero-Category-Collection): fetches the real
// category tree once and writes one Categories list entry per top-level
// category, name-matched against whatever's already there so an
// already-uploaded card image survives a re-sync. Unlike Ru3-Mega-Header's
// Nav Links (a mix of static + category links), every item in this list is a
// category, so re-syncing fully replaces the list rather than merging with
// "kept" entries.
async function syncRu7CategoriesFromApi() {
  const data = blockData.value
  if (!data) return
  buttonFieldBusy.value.syncRu7CategoriesFromApi = true
  buttonFieldError.value.syncRu7CategoriesFromApi = ''
  try {
    const flat = await $fetch<FlatCategory[]>('/api/categories', {
      query: { companyId: selectedCompanyId.value ?? undefined },
    })
    const tree = buildCategoryTree(flat)
    const labelFor = (c: FlatCategory) => String(c.headlessName || c.displayName || c.name)

    const existingCategories = (data.categories ?? []) as Array<{ imageUrl: string; name: string; categoryUrl?: string }>
    const existingByName = new Map(existingCategories.map(c => [c.name, c]))

    const synced = tree.map(cat => {
      const label = labelFor(cat)
      const existing = existingByName.get(label)
      // Real backend slug (headlessName, same convention as CategoryNav/Sync
      // Categories From API above) — not a naive slugify of the display
      // label, so it matches the company's actual category identifiers.
      const slug = cat.headlessName || cat.name.toLowerCase().replace(/\s+/g, '-')
      return {
        imageUrl: existing?.imageUrl ?? '',
        name: label,
        categoryUrl: existing?.categoryUrl ?? `/shop?category=${slug}`,
      }
    })

    await updateBlockField('categories', synced)
  } catch (e) {
    console.error('[Sync Ru7 Categories from API] failed', e)
    buttonFieldError.value.syncRu7CategoriesFromApi = 'Failed to fetch categories — check console.'
  } finally {
    buttonFieldBusy.value.syncRu7CategoriesFromApi = false
  }
}

// Sync Categories from API (Ru10-Shop-By-Category): identical logic to
// syncRu7CategoriesFromApi above — same "categories" list shape, so the two
// blocks share this exact sync behaviour independently per-instance.
async function syncRu10CategoriesFromApi() {
  const data = blockData.value
  if (!data) return
  buttonFieldBusy.value.syncRu10CategoriesFromApi = true
  buttonFieldError.value.syncRu10CategoriesFromApi = ''
  try {
    const flat = await $fetch<FlatCategory[]>('/api/categories', {
      query: { companyId: selectedCompanyId.value ?? undefined },
    })
    const tree = buildCategoryTree(flat)
    const labelFor = (c: FlatCategory) => String(c.headlessName || c.displayName || c.name)

    const existingCategories = (data.categories ?? []) as Array<{ imageUrl: string; name: string; categoryUrl?: string }>
    const existingByName = new Map(existingCategories.map(c => [c.name, c]))

    const synced = tree.map(cat => {
      const label = labelFor(cat)
      const existing = existingByName.get(label)
      // Slug always derived from the same label shown as this category's
      // name (not the backend's separate headlessName) — so the URL always
      // matches whatever name is visible in the editor for this category.
      const slug = label.trim().toLowerCase().replace(/\s+/g, '-')
      return {
        imageUrl: existing?.imageUrl ?? '',
        name: label,
        categoryUrl: existing?.categoryUrl ?? `/shop?category=${slug}`,
      }
    })

    await updateBlockField('categories', synced)
  } catch (e) {
    console.error('[Sync Ru10 Categories from API] failed', e)
    buttonFieldError.value.syncRu10CategoriesFromApi = 'Failed to fetch categories — check console.'
  } finally {
    buttonFieldBusy.value.syncRu10CategoriesFromApi = false
  }
}

function onButtonField(fieldKey: string) {
  if (fieldKey === 'syncCategoriesFromApi') syncCategoriesFromApi()
  if (fieldKey === 'syncRu7CategoriesFromApi') syncRu7CategoriesFromApi()
  if (fieldKey === 'syncRu10CategoriesFromApi') syncRu10CategoriesFromApi()
}

// Ru7-Hero-Category-Collection: Card Height defaults to 0 ("auto" — use Card
// Aspect Ratio for real responsive sizing on the live page, see
// renderRu7HeroCategoryCollection). While it's still 0, the sidebar box shows
// a standard height for whichever aspect ratio is selected (based on a fixed
// reference card width) instead of a bare "0", so there's a sensible number
// to nudge up/down from. The moment it's touched, it becomes a real stored
// px value like any other number field.
const RU7_CARD_HEIGHT_BASELINE_WIDTH = 400
const ru7CardHeightDisplay = computed(() => {
  const stored = Number(blockData.value?.cardHeight ?? 0)
  if (stored > 0) return stored
  const [w, h] = String(blockData.value?.cardAspectRatio ?? '4 / 5')
    .split('/').map(s => parseFloat(s.trim()) || 0)
  return Math.round(RU7_CARD_HEIGHT_BASELINE_WIDTH * ((h || 5) / (w || 4)))
})

async function onSelectField(fieldKey: string, value: string | number) {
  await updateBlockField(fieldKey, value)
  // When gallery layout changes, the block re-renders with new carousel HTML.
  // Re-run hydration — the fresh element has no data-hydrated so it gets wired.
  if (fieldKey === 'galleryLayout') {
    await nextTick()
    await nextTick()
    hydrateComponents(selectedCompanyId.value ?? undefined)
  }
}

// Re-wire Layout 3 carousel after ANY field change while that layout is active.
// When a field changes the block re-renders → new DOM element (no data-hydrated).
// The watcher calls hydrateComponents so the fresh element gets its carousel wired.
// Other ProductDetail blocks keep their data-hydrated and are skipped automatically.
//
// Ru3-Mega-Header gets the same treatment: it has several hydrated shells
// (AccountMenu, CartBadge, CategoryNav, HeaderSearch) that all
// lose their click/hover wiring the same way on every field edit — without
// this, e.g. the Account dropdown stops opening the moment you touch any
// other field on the block.
let _carouselRewireTimer = 0
watch(
  blockData,
  async (newData) => {
    const isCarouselLayout3 = !!newData && (newData as Record<string, any>).galleryLayout === 'layout3'
    const isRu3MegaHeader = selectedBlockTitle.value === 'Ru3-Mega-Header'
    if (!isCarouselLayout3 && !isRu3MegaHeader) return
    if (!document.getElementById('page-builder-wrapper')) return
    clearTimeout(_carouselRewireTimer)
    _carouselRewireTimer = window.setTimeout(async () => {
      await nextTick()
      await nextTick()
      hydrateComponents(selectedCompanyId.value ?? undefined)
    }, 150)
  },
  { deep: true },
)

// Keep the right panel in sync with canvas edits made via the library's own
// "Manage Content" rich-text panel (pencil icon). That panel edits a
// data-field-key element directly on the canvas through its own internal
// state, completely separate from this sidebar's useBlockRegistry — without
// this watcher, the field's input here would keep showing the old value,
// and the next unrelated field edit would re-render the block from that
// stale value and overwrite the canvas edit.
const { getData: getRegistryData, setData: setRegistryData, setListItem: setRegistryListItem } = useBlockRegistry()
watch(
  () => (store as any).getTextAreaVueModel,
  (html) => {
    if (typeof html !== 'string') return
    const el = (store as any).getElement as HTMLElement | null
    const fieldKey = el?.dataset?.fieldKey
    if (!el || !fieldKey) return
    const componentId = el.closest('[data-componentid]')?.getAttribute('data-componentid')
    if (!componentId) return

    const tmp = document.createElement('div')
    tmp.innerHTML = html
    // TipTap always wraps content in a block tag (<p>, or <h1>-<h6> if the
    // user hit a heading button). These fields (a span/short text field)
    // already have their own fixed styling, so nesting a block tag inside
    // them breaks it — unwrap any single top-level block tag down to its
    // inner HTML, keeping inline formatting (bold, links) but dropping the
    // block wrapper itself.
    const BLOCK_TAGS = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6']
    const newValue = (tmp.children.length === 1 && BLOCK_TAGS.includes(tmp.firstElementChild?.tagName ?? ''))
      ? tmp.firstElementChild!.innerHTML
      : tmp.innerHTML

    const current = getRegistryData(componentId)
    if (!current) return

    // List-item field (e.g. an FAQ question/answer) — el carries the list
    // key + its index alongside the field key.
    const listKey = el.dataset.listKey
    const listIndex = el.dataset.listIndex
    if (listKey && listIndex != null) {
      const idx = Number(listIndex)
      const list = current[listKey]
      if (Array.isArray(list) && list[idx]?.[fieldKey] !== newValue) {
        setRegistryListItem(componentId, listKey, idx, fieldKey, newValue)
      }
      return
    }

    if (current[fieldKey] !== newValue) {
      setRegistryData(componentId, fieldKey, newValue)
    }
  },
)

// Debounced list-item updater — fires 150ms after the user stops typing so
// every keystroke reflects in the canvas without hammering _applyBlockRender.
let _listItemDebounceTimer = 0
function debouncedUpdateBlockListItem(listKey: string, idx: number, itemKey: string, value: any) {
  clearTimeout(_listItemDebounceTimer)
  _listItemDebounceTimer = window.setTimeout(() => {
    updateBlockListItem(listKey, idx, itemKey, value)
  }, 50)
}

// FAQ answer: the plain single-line input is too small to read and can't
// hold a hyperlink/button, so it opens a bigger modal editor instead (see
// FaqAnswerEditorModal.client.vue). The sidebar row itself just shows a
// stripped-text preview + an "Edit" button.
const showFaqAnswerModal = ref(false)
const faqAnswerModalInitial = ref('')
const faqAnswerModalTarget = ref<{ listKey: string; idx: number; itemKey: string } | null>(null)

function stripHtml(html: any): string {
  if (typeof html !== 'string' || !html) return ''
  const div = document.createElement('div')
  div.innerHTML = html
  return div.textContent || ''
}

function openFaqAnswerModal(listKey: string, idx: number, itemKey: string, currentValue: any) {
  faqAnswerModalTarget.value = { listKey, idx, itemKey }
  faqAnswerModalInitial.value = typeof currentValue === 'string' ? currentValue : ''
  showFaqAnswerModal.value = true
}

function handleFaqAnswerSave(html: string) {
  if (!faqAnswerModalTarget.value) return
  const { listKey, idx, itemKey } = faqAnswerModalTarget.value
  updateBlockListItem(listKey, idx, itemKey, html)
}

// Ru7-Hero-Category-Collection: typing the Category Name auto-fills the
// sibling Categories url — but only while that field is still empty, so an
// admin who has typed their own URL never gets it clobbered by further name
// edits. Uses its own debounce timer (not _listItemDebounceTimer) so it
// doesn't race with unrelated list-item edits on other fields/items.
let _ru7CategoryNameDebounceTimer = 0
function onRu7CategoryNameInput(idx: number, value: string) {
  clearTimeout(_ru7CategoryNameDebounceTimer)
  _ru7CategoryNameDebounceTimer = window.setTimeout(async () => {
    await updateBlockListItem('categories', idx, 'name', value)
    const current = (blockData.value?.categories as any[] | undefined)?.[idx]
    if (!current?.categoryUrl) {
      const slug = value.trim().toLowerCase().replace(/\s+/g, '-')
      await updateBlockListItem('categories', idx, 'categoryUrl', slug ? `/shop?category=${slug}` : '')
    }
  }, 150)
}

// ── Block image upload ────────────────────────────────────────────────────────
const uploadError = ref<Record<string, string>>({})
const uploading = ref<Record<string, boolean>>({})
const buttonFieldBusy = ref<Record<string, boolean>>({})
const buttonFieldError = ref<Record<string, string>>({})

// NOTE: this deliberately does NOT pin/lock scroll during upload. An earlier
// version force-held the canvas + sidebar scroll to a captured position every
// animation frame while the picker was open, which made the click jump (the
// hidden file input grabbing focus scrolled it into view) and froze scrolling
// during the upload ("stuck"). The file inputs are now display:none (`hidden`),
// so clicking Upload never moves focus/scroll, and the post-upload canvas
// rebuild is handled surgically by _syncBuilderWithListeners' rAF scroll
// restore (canvas) plus RightSidebarEditor's same-block guard (sidebar) — no
// per-frame pinning needed. Result: scrolling stays smooth throughout.

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024 // 10MB — matches the server-side cap

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

// Fetches an external http(s) image URL through our server, uploads it to S3,
// and returns the CDN URL. This replaces the raw third-party URL so published
// pages don't depend on external origins.
async function proxyExternalImageToS3(url: string, fieldKey: string): Promise<string> {
  const { url: cdnUrl } = await $fetch<{ url: string }>('/api/proxy/image', {
    method: 'POST',
    body: {
      url,
      companyId: selectedCompanyId.value ?? undefined,
      fieldKey,
    },
  })
  return cdnUrl
}

// Called when the user finishes typing/pasting in an image URL field. If the
// value is an external http(s) URL it is proxied through S3; otherwise the
// value is saved as-is (handles relative paths, data: URLs, etc.).
// URLs already on our own CDN are saved directly — no re-upload needed.
async function onImageUrlChange(fieldKey: string, value: string) {
  uploadError.value[fieldKey] = ''
  const trimmed = value.trim()
  const cdnBase = useRuntimeConfig().public.s3CdnUrl as string
  if (
    !trimmed.startsWith('http://') && !trimmed.startsWith('https://') ||
    (cdnBase && trimmed.startsWith(cdnBase))
  ) {
    updateBlockField(fieldKey, trimmed)
    return
  }
  uploading.value[fieldKey] = true
  try {
    const cdnUrl = await proxyExternalImageToS3(trimmed, fieldKey)
    updateBlockField(fieldKey, cdnUrl)
  } catch (err) {
    uploadError.value[fieldKey] = uploadErrorMessage(err)
  } finally {
    uploading.value[fieldKey] = false
  }
}

// Uploads a file through our own server (base64 → S3 PutObject) and returns
// the resulting CDN URL to store on the field. The bucket only grants read
// access to its CloudFront distribution, not the public, so the URL must
// come from the server (which knows the CDN domain) rather than being built
// client-side. Throws with a user-facing message on failure.
async function uploadImageToS3(file: File, fieldKey: string): Promise<string> {
  if (file.size > MAX_UPLOAD_BYTES) throw new Error('Image is too large (max 10MB)')

  const dataUrl = await readFileAsDataUrl(file)
  const { url } = await $fetch<{ url: string }>('/api/uploads/image', {
    method: 'POST',
    body: {
      dataUrl,
      fileName: file.name,
      companyId: selectedCompanyId.value ?? undefined,
      fieldKey,
    },
  })

  return url
}

// Surfaces the specific size-limit message (thrown client-side, before any
// network call) and falls back to a generic message for network/server errors.
function uploadErrorMessage(err: unknown): string {
  return err instanceof Error && err.message.includes('too large')
    ? err.message
    : 'Upload failed. Try again or paste a URL.'
}

async function onUploadImage(fieldKey: string, file: File) {
  if (!file.type.startsWith('image/')) { uploadError.value[fieldKey] = 'Please select an image file.'; return }
  uploadError.value[fieldKey] = ''
  uploading.value[fieldKey] = true
  try {
    const url = await uploadImageToS3(file, fieldKey)
    await updateBlockField(fieldKey, url)
  } catch (err) {
    uploadError.value[fieldKey] = uploadErrorMessage(err)
  } finally {
    uploading.value[fieldKey] = false
  }
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
const subUploadKey = (listKey: string, idx: number, subKey: string) => `${listKey}.${idx}.${subKey}`

async function onUploadSubImage(listKey: string, idx: number, subKey: string, file: File) {
  const key = subUploadKey(listKey, idx, subKey)
  if (!file.type.startsWith('image/')) { uploadError.value[key] = 'Please select an image file.'; return }
  uploadError.value[key] = ''
  uploading.value[key] = true
  try {
    const url = await uploadImageToS3(file, subKey)
    await updateBlockListItem(listKey, idx, subKey, url)
  } catch (err) {
    uploadError.value[key] = uploadErrorMessage(err)
  } finally {
    uploading.value[key] = false
  }
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


// ── Mega menu editor (Ru2-Mega-Menu-Header only) ──────────────────────────────────
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
      panel.querySelector('.overflow-y-scroll') ??
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
            <template v-if="!field.visibleIf || field.visibleIf(blockData)">

            <!-- header sentinel -->
            <div v-if="field.type === 'header'" class="mb-3 mt-6 first:mt-2 flex items-center gap-2">
              <span class="text-sm font-bold text-gray-900 uppercase tracking-wide whitespace-nowrap">{{ field.label }}</span>
              <div class="flex-1 h-px bg-gray-300"></div>
            </div>

            <!-- image -->
            <div v-else-if="field.type === 'image'" class="mb-2.5">
              <label class="block text-sm font-semibold text-gray-800 mb-1.5">{{ field.label }}</label>
              <div class="flex items-center gap-1 mb-1">
                <input type="text" :value="blockData[field.key]" :placeholder="field.placeholder || 'Paste URL'"
                  class="flex-1 border border-gray-200 rounded-md px-2 py-1.5 text-xs focus:outline-none focus:border-blue-400"
                  :disabled="uploading[field.key]"
                  @change="onImageUrlChange(field.key, ($event.target as HTMLInputElement).value)"
                  @input="debouncedUpdateBlockField(field.key, ($event.target as HTMLInputElement).value.trim()); uploadError[field.key] = ''" />
                <label
                  class="shrink-0 text-xs border rounded-md px-2 py-1.5"
                  :class="uploading[field.key]
                    ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-wait'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600 border-gray-200 cursor-pointer'"
                >
                  {{ uploading[field.key] ? 'Uploading…' : '↑ Upload' }}
                  <input type="file" accept="image/*" class="hidden" :disabled="uploading[field.key]"
                    @change="{ const f=($event.target as HTMLInputElement).files; if(f?.length) onUploadImage(field.key, f[0]) }" />
                </label>
              </div>
              <img v-if="blockData[field.key]" :src="blockData[field.key]"
                class="w-full h-20 object-cover rounded border border-gray-200 mb-1" alt="preview" />
              <div v-if="blockData[field.key] && !field.noAspectRatio" class="flex items-center gap-1.5 mt-1">
                <label class="text-xs text-gray-400 shrink-0">Aspect ratio</label>
                <select
                  :value="(blockData[field.key + 'AspectRatio'] as string) ?? 'Auto'"
                  class="flex-1 border border-gray-200 rounded-md px-2 py-1 text-xs focus:outline-none focus:border-blue-400"
                  @change="updateBlockField(field.key + 'AspectRatio', ($event.target as HTMLSelectElement).value)"
                >
                  <option v-for="opt in ['Auto', 'Wide (16:9)', 'Standard (4:3)', 'Square (1:1)', 'Tall (3:4)', 'Cinematic (21:9)']" :key="opt" :value="opt">{{ opt }}</option>
                </select>
              </div>
              <p v-if="uploadError[field.key]" class="text-xs text-red-500">{{ uploadError[field.key] }}</p>
            </div>

            <!-- textarea -->
            <div v-else-if="field.type === 'textarea'" class="mb-2.5">
              <label class="block text-sm font-semibold text-gray-800 mb-1.5">{{ field.label }}</label>
              <textarea
                :value="blockData[field.key]"
                :placeholder="field.placeholder ?? ''"
                rows="3"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-colors resize-none"
                @input="debouncedUpdateBlockField(field.key, ($event.target as HTMLTextAreaElement).value)"
              ></textarea>
            </div>

            <!-- text / url -->
            <div v-else-if="field.type === 'text' || field.type === 'url'" class="mb-2.5">
              <label class="block text-sm font-semibold text-gray-800 mb-1.5">{{ field.label }}</label>
              <input type="text" :value="blockData[field.key]"
                :placeholder="field.placeholder ?? ''"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-colors"
                @input="debouncedUpdateBlockField(field.key, ($event.target as HTMLInputElement).value)" />
            </div>

            <!-- number → stepper -->
            <!-- Ru7-Hero-Category-Collection Card Height: shows a standard
                 height for whichever Card Aspect Ratio is selected instead of
                 a bare 0 until the admin nudges it, then behaves like any
                 other number field -->
            <div v-else-if="field.key === 'cardHeight' && selectedBlockTitle === 'Ru7-Hero-Category-Collection'" class="mb-2.5">
              <label class="block text-sm font-semibold text-gray-800 mb-1.5">{{ field.label }}</label>
              <div class="flex items-center gap-1 w-full">
                <button type="button"
                  class="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors text-lg font-medium cursor-pointer shrink-0"
                  @click="updateBlockField('cardHeight', Math.max(0, ru7CardHeightDisplay - (field.step ?? 1)))">−</button>
                <input type="number" :value="ru7CardHeightDisplay"
                  class="flex-1 text-center border border-gray-300 rounded-lg py-1.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                  @input="debouncedUpdateBlockField('cardHeight', Number(($event.target as HTMLInputElement).value))" />
                <span class="text-xs text-gray-500 font-semibold">{{ field.unit ?? 'px' }}</span>
                <button type="button"
                  class="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors text-lg font-medium cursor-pointer shrink-0"
                  @click="updateBlockField('cardHeight', ru7CardHeightDisplay + (field.step ?? 1))">+</button>
              </div>
            </div>

            <div v-else-if="field.type === 'number'" class="mb-2.5">
              <label class="block text-sm font-semibold text-gray-800 mb-1.5">{{ field.label }}</label>
              <div class="flex items-center gap-1 w-full">
                <button type="button"
                  class="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors text-lg font-medium cursor-pointer shrink-0"
                  @click="updateBlockField(field.key, Math.max(0, Number(blockData[field.key] ?? field.placeholder ?? 0) - (field.step ?? 1)))">−</button>
                <input type="number" :value="blockData[field.key]"
                  :placeholder="field.placeholder ?? ''"
                  class="flex-1 text-center border border-gray-300 rounded-lg py-1.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                  @input="debouncedUpdateBlockField(field.key, Number(($event.target as HTMLInputElement).value))" />
                <span class="text-xs text-gray-500 font-semibold">{{ field.unit ?? 'px' }}</span>
                <button type="button"
                  class="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors text-lg font-medium cursor-pointer shrink-0"
                  @click="updateBlockField(field.key, Number(blockData[field.key] ?? field.placeholder ?? 0) + (field.step ?? 1))">+</button>
              </div>
            </div>

            <!-- color -->
            <div v-else-if="field.type === 'color'" class="mb-2.5">
              <label class="block text-sm font-semibold text-gray-800 mb-1.5">{{ field.label }}</label>
              <div class="flex items-center gap-2 w-full">
                <input type="color" :value="toHex(blockData[field.key])" class="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5 bg-white"
                  @input="updateBlockField(field.key, ($event.target as HTMLInputElement).value)" />
                <input type="text" :value="blockData[field.key]" class="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                  @input="debouncedUpdateBlockField(field.key, ($event.target as HTMLInputElement).value)" />
              </div>
            </div>

            <!-- toggle -->
            <div v-else-if="field.type === 'toggle'" class="mb-2.5 flex items-center justify-between py-1">
              <label class="text-sm font-semibold text-gray-800">{{ field.label }}</label>
              <div class="flex items-center gap-2">
                <span class="text-xs font-medium text-gray-500">{{ blockData[field.key] ? 'ON' : 'OFF' }}</span>
                <button type="button"
                  class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors border-none cursor-pointer shrink-0"
                  :class="blockData[field.key] ? 'bg-blue-500' : 'bg-gray-200'"
                  @click="onToggleField(field.key, !blockData[field.key])">
                  <span class="inline-block h-3.5 w-3.5 rounded-full bg-white shadow transform transition-transform"
                    :class="blockData[field.key] ? 'translate-x-4' : 'translate-x-0.5'" />
                </button>
              </div>
            </div>

            <!-- button -->
            <div v-else-if="field.type === 'button'" class="mb-2.5">
              <button type="button"
                class="w-full rounded-lg border border-gray-300 bg-gray-50 hover:bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-800 transition-colors"
                :disabled="buttonFieldBusy[field.key]"
                @click="onButtonField(field.key)">
                {{ buttonFieldBusy[field.key] ? 'Working…' : field.label }}
              </button>
              <p v-if="buttonFieldError[field.key]" class="text-xs text-red-500 mt-1">{{ buttonFieldError[field.key] }}</p>
            </div>

            <!-- select -->
            <div v-else-if="field.type === 'select'" class="mb-2.5">
              <label class="block text-sm font-semibold text-gray-800 mb-1.5">{{ field.label }}</label>
              <div class="relative">
                <select class="w-full rounded-lg border border-gray-300 px-3 py-2 pr-8 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-colors appearance-none cursor-pointer"
                  :value="String(blockData[field.key])"
                  @change="onSelectField(field.key, Number(($event.target as HTMLSelectElement).value) || ($event.target as HTMLSelectElement).value)">
                  <option v-for="opt in field.options" :key="opt" :value="opt">{{ field.optionLabels?.[opt] ?? (opt || 'Default') }}</option>
                </select>
                <svg class="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 5L7 9L11 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </div>

            <!-- align: left/center/right icon button group -->
            <div v-else-if="field.type === 'align'" class="mb-2.5">
              <label class="block text-sm font-semibold text-gray-800 mb-1.5">{{ field.label }}</label>
              <div class="flex gap-1.5">
                <button v-for="a in ['left', 'center', 'right']" :key="a" type="button"
                  class="flex-1 h-9 rounded-lg border flex items-center justify-center cursor-pointer transition-colors"
                  :class="String(blockData[field.key] ?? 'left') === a
                    ? 'bg-blue-50 border-blue-400 text-blue-600'
                    : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'"
                  :title="a.charAt(0).toUpperCase() + a.slice(1)"
                  @click="updateBlockField(field.key, a)">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <line x1="2" y1="4" x2="14" y2="4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    <line v-if="a === 'left'" x1="2" y1="8" x2="10" y2="8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    <line v-else-if="a === 'center'" x1="4" y1="8" x2="12" y2="8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    <line v-else x1="6" y1="8" x2="14" y2="8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    <line x1="2" y1="12" x2="14" y2="12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                  </svg>
                </button>
              </div>
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
                class="rounded-xl border border-gray-300 bg-white p-3 mb-2 shadow-sm">
                <div class="flex justify-between items-center px-2 py-1 bg-gray-50 border-b border-gray-100">
                  <!-- Social link: show live brand icon + platform name -->
                  <template v-if="field.key === 'socials' && selectedBlockTitle === 'Ru1-Form'">
                    <div class="flex items-center gap-1.5">
                      <template v-if="item.href">
                        <span
                          class="flex items-center justify-center w-6 h-6 rounded-full shrink-0 overflow-hidden bg-white border-[1.5px] border-gray-200">
                          <img :src="faviconUrl(item.href)" width="16" height="16" class="object-contain" :alt="getDomain(item.href)" />
                        </span>
                      </template>
                      <span v-else class="flex items-center justify-center w-6 h-6 rounded-full border border-dashed border-gray-300 text-gray-300 text-xs">+</span>
                      <span class="text-xs font-medium" :class="item.href ? 'text-gray-700' : 'text-gray-400'">
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
                  <template v-for="subField in field.listFields" :key="subField.label">
                    <div class="mb-1" v-if="!subField.visibleIf || subField.visibleIf(item)">
                      <label class="block text-sm font-medium text-gray-700 mb-0.5">{{ subField.label }}</label>
                      <template v-if="subField.type === 'image'">
                        <div class="flex items-center gap-1 mb-1">
                          <input type="text" :value="item[subField.key]" :placeholder="subField.placeholder || 'Paste URL'"
                            class="flex-1 border border-gray-200 rounded px-2 py-0.5 text-xs focus:outline-none focus:border-blue-400"
                            @change="debouncedUpdateBlockListItem(field.key, idx, subField.key, ($event.target as HTMLInputElement).value.trim())"
                            @input="debouncedUpdateBlockListItem(field.key, idx, subField.key, ($event.target as HTMLInputElement).value.trim())" />
                          <label
                            class="shrink-0 text-xs border rounded px-1.5 py-0.5"
                            :class="uploading[subUploadKey(field.key, idx, subField.key)]
                              ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-wait'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-600 border-gray-200 cursor-pointer'"
                          >
                            {{ uploading[subUploadKey(field.key, idx, subField.key)] ? '…' : '↑' }}
                            <input type="file" accept="image/*" class="hidden" :disabled="uploading[subUploadKey(field.key, idx, subField.key)]"
                              @change="{ const f=($event.target as HTMLInputElement).files; if(f?.length) onUploadSubImage(field.key,idx,subField.key,f[0]) }" />
                          </label>
                        </div>
                        <img v-if="item[subField.key]" :src="item[subField.key]" class="w-full aspect-square object-cover rounded border border-gray-200 bg-gray-50" alt="preview" />
                        <p v-if="uploadError[subUploadKey(field.key, idx, subField.key)]" class="text-xs text-red-500">{{ uploadError[subUploadKey(field.key, idx, subField.key)] }}</p>
                      </template>
                      <template v-else-if="subField.type === 'toggle'">
                        <button type="button"
                          class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors border-none cursor-pointer"
                          :class="isSubToggleOn(item, subField) ? 'bg-blue-500' : 'bg-gray-200'"
                          @click="updateBlockListItem(field.key, idx, subField.key, nextSubToggleValue(item, subField))">
                          <span class="inline-block h-3.5 w-3.5 rounded-full bg-white shadow transform transition-transform"
                            :class="isSubToggleOn(item, subField) ? 'translate-x-4' : 'translate-x-0.5'" />
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
                          <option v-for="opt in subField.options" :key="opt" :value="opt">{{ subField.optionLabels?.[opt] ?? opt }}</option>
                        </select>
                      </template>

                      <!-- number sub-field: same −/+ stepper widget as top-level number fields -->
                      <template v-else-if="subField.type === 'number'">
                        <div class="flex items-center gap-1 w-full">
                          <button type="button"
                            class="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors text-base font-medium cursor-pointer shrink-0"
                            @click="updateBlockListItem(field.key, idx, subField.key, Math.max(0, Number(item[subField.key] ?? subField.placeholder ?? 0) - (subField.step ?? 1)))">−</button>
                          <input type="number" :value="item[subField.key]"
                            :placeholder="subField.placeholder ?? ''"
                            class="flex-1 text-center border border-gray-300 rounded-lg py-1 text-xs text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                            @input="debouncedUpdateBlockListItem(field.key, idx, subField.key, Number(($event.target as HTMLInputElement).value))" />
                          <span class="text-xs text-gray-500 font-semibold shrink-0">{{ subField.unit ?? 'px' }}</span>
                          <button type="button"
                            class="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors text-base font-medium cursor-pointer shrink-0"
                            @click="updateBlockListItem(field.key, idx, subField.key, Number(item[subField.key] ?? subField.placeholder ?? 0) + (subField.step ?? 1))">+</button>
                        </div>
                      </template>

                      <!-- Ru7-Hero-Category-Collection: typing the Category Name
                           auto-fills the sibling Categories url ONLY while that
                           field is still empty — once the admin edits it
                           directly it's a fully independent, editable value and
                           is never overwritten by further name edits. -->
                      <template v-else-if="field.key === 'categories' && subField.key === 'name'">
                        <input type="text" :value="item.name ?? ''"
                          :placeholder="subField.placeholder ?? ''"
                          class="w-full border border-gray-200 rounded px-2 py-0.5 text-xs focus:outline-none focus:border-blue-400"
                          @input="onRu7CategoryNameInput(idx, ($event.target as HTMLInputElement).value)" />
                      </template>

                      <!-- FAQ answer: too small/plain as a single-line input, and
                           needs to support inline hyperlinks/buttons — opens a
                           bigger modal editor instead of an inline field. -->
                      <template v-else-if="field.key === 'faqs' && subField.key === 'answer'">
                        <div class="flex items-center gap-1.5">
                          <div class="flex-1 min-w-0 truncate rounded border border-gray-200 px-2 py-1 text-xs" :class="item.answer ? 'text-gray-600' : 'text-gray-400'" :title="stripHtml(item.answer)">
                            {{ stripHtml(item.answer) || 'Click Edit to add an answer…' }}
                          </div>
                          <button type="button"
                            class="shrink-0 rounded border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-600 hover:bg-gray-100"
                            @click="openFaqAnswerModal(field.key, idx, subField.key, item.answer)">Edit</button>
                        </div>
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

                  <!-- Mega Menu configurator: only for Ru2-Mega-Menu-Header navLinks -->
                  <template v-if="selectedBlockTitle === 'Ru2-Mega-Menu-Header' && field.key === 'navLinks'">
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

            </template><!-- /visibleIf -->
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

  <FaqAnswerEditorModal
    v-model="showFaqAnswerModal"
    :initial-html="faqAnswerModalInitial"
    @save="handleFaqAnswerSave"
  />
</template>
