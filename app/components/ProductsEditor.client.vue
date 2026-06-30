<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { sharedPageBuilderStore, getPageBuilder } from '@myissue/vue-website-page-builder'
import { useBlockRegistry } from '~/composables/editor/useBlockRegistry'

const props = defineProps({
  updateBlockField: { type: Function, default: null },
  selectedBlockTitle: { type: String, default: '' },
  blockData: { type: Object, default: null },
})

const THEME_REGISTRY_BLOCKS = ['Ru1 Homepage Featured Products', 'Ru1 Shop Content', 'Ru2 Shop Products', 'Ru3 Shop Products', 'Ru1-Product Detail', 'Ru2-Product Detail', 'Ru3-Product Detail']
// Blocks that store selected IDs as a comma-separated productIds field (not a products array)
const PRODUCT_IDS_BLOCKS = ['Ru1-Product Detail', 'Ru2-Product Detail', 'Ru3-Product Detail']
// Blocks that support pagination — allow many products across multiple pages
const PAGINATED_BLOCKS = ['Ru1 Shop Content', 'Ru2 Shop Products', 'Ru3 Shop Products']

function debounce(fn, delay) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

const pageBuilderStateStore = sharedPageBuilderStore
const pageBuilderService = getPageBuilder()

const products = ref([])
const loading = ref(false)
const errorMsg = ref('')
const search = ref('')
const selected = ref([])
const applied = ref(false)

const btnEnabled = ref(true)
const btnText = ref('Shop Now')
const btnBg = ref('#000000')
const btnColor = ref('#ffffff')
const cardSubtitle = ref('')
const cardSubtitleEnabled = ref(true)

const bgColor = ref('#ffffff')
const bgImageUrl = ref('')
const bgImageError = ref('')

const cardBg = ref('#ffffff')
const cardTextColor = ref('#000000')
const cardFontSize = ref(14)
const cardBorderRadius = ref(0)
const cardShadow = ref('none')
const cardMargin = ref(0)
const cardPadding = ref(0)
const cardLayout = ref('default')
const shadowPresets = {
  'none':       '0 0 #0000',
  'shadow-2xs': '0 1px rgb(0 0 0 / 0.05)',
  'shadow-xs':  '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  'shadow-sm':  '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  'shadow-md':  '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  'shadow-lg':  '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  'shadow-xl':  '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  'shadow-2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
}

const component = computed(() => pageBuilderStateStore.getComponent)

const isThemeBlock = computed(() => {
  const title = component.value?.title ?? props.selectedBlockTitle ?? ''
  return THEME_REGISTRY_BLOCKS.includes(title)
})

const isProductIdsBlock = computed(() => {
  const title = component.value?.title ?? props.selectedBlockTitle ?? ''
  return PRODUCT_IDS_BLOCKS.includes(title)
})

const isRu2ProductDetail = computed(() => {
  const t = component.value?.title ?? props.selectedBlockTitle ?? ''
  return t === 'Ru2-Product Detail' || t === 'Ru3-Product Detail'
})

// ── Related products picker state (Ru2-Product Detail only) ──────────────────
const relatedSelected = ref([])
const relatedSearch = ref('')
const relatedApplied = ref(false)

// ── Related card / button style refs ─────────────────────────────────────────
const relCardBgRef = ref('#ffffff')
const relCardTextColorRef = ref('#111827')
const relCardFontSizeRef = ref(14)
const relCardBorderRadiusRef = ref(8)
const relCardShadowRef = ref('none')
const relCardLayoutRef = ref('default')
const relCardMarginRef = ref(0)
const relCardPaddingRef = ref(0)
const relCardFontWeightRef = ref('400')
const relCardTextAlignRef = ref('left')
const relCardSubtitleRef = ref('')
const relCardSubtitleEnabledRef = ref(true)
const relBtnTextRef = ref('Add to bag')
const relBtnBgRef = ref('#111827')
const relBtnColorRef = ref('#ffffff')
const relBtnBorderRadiusRef = ref(8)

function _syncRelStyles(bd) {
  relCardBgRef.value          = bd?.relatedCardBg ?? '#ffffff'
  relCardTextColorRef.value   = bd?.relatedCardTextColor ?? '#111827'
  relCardFontSizeRef.value    = bd?.relatedCardFontSize ?? 14
  relCardBorderRadiusRef.value = bd?.relatedCardBorderRadius ?? 8
  relCardShadowRef.value      = bd?.relatedCardShadow ?? 'none'
  relCardLayoutRef.value      = bd?.relatedCardLayout ?? 'default'
  relCardMarginRef.value      = bd?.relatedCardMargin ?? 0
  relCardPaddingRef.value     = bd?.relatedCardPadding ?? 0
  relCardFontWeightRef.value  = bd?.relatedCardFontWeight ?? '400'
  relCardTextAlignRef.value   = bd?.relatedCardTextAlign ?? 'left'
  relCardSubtitleRef.value    = bd?.relatedCardSubtitle ?? ''
  relCardSubtitleEnabledRef.value = bd?.relatedCardSubtitleEnabled !== false
  relBtnTextRef.value         = bd?.relatedAddToCartLabel ?? 'Add to bag'
  relBtnBgRef.value           = bd?.relatedButtonBgColor ?? '#111827'
  relBtnColorRef.value        = bd?.relatedButtonTextColor ?? '#ffffff'
  relBtnBorderRadiusRef.value = bd?.relatedButtonBorderRadius ?? 8
}

async function _persistRel(key, value) {
  const title = component.value?.title ?? props.selectedBlockTitle
  if (!props.updateBlockField || !title || !isRu2ProductDetail.value) return
  if (props.blockData?.[key] === value) return
  await props.updateBlockField(key, value)
}

const _dRelCardBg          = debounce((v) => _persistRel('relatedCardBg', v), 200)
const _dRelCardText        = debounce((v) => _persistRel('relatedCardTextColor', v), 200)
const _dRelCardFontSize    = debounce((v) => _persistRel('relatedCardFontSize', v), 200)
const _dRelCardRadius      = debounce((v) => _persistRel('relatedCardBorderRadius', v), 200)
const _dRelCardShadow      = debounce((v) => _persistRel('relatedCardShadow', v), 0)
const _dRelCardLayout      = debounce((v) => _persistRel('relatedCardLayout', v), 0)
const _dRelCardMargin      = debounce((v) => _persistRel('relatedCardMargin', v), 200)
const _dRelCardPadding     = debounce((v) => _persistRel('relatedCardPadding', v), 200)
const _dRelCardFontWeight  = debounce((v) => _persistRel('relatedCardFontWeight', v), 0)
const _dRelCardTextAlign   = debounce((v) => _persistRel('relatedCardTextAlign', v), 0)
const _dRelCardSubtitle    = debounce((v) => _persistRel('relatedCardSubtitle', v), 300)
const _dRelCardSubtitleEn  = debounce((v) => _persistRel('relatedCardSubtitleEnabled', v), 0)
const _dRelBtnText         = debounce((v) => _persistRel('relatedAddToCartLabel', v), 300)
const _dRelBtnBg           = debounce((v) => _persistRel('relatedButtonBgColor', v), 200)
const _dRelBtnColor        = debounce((v) => _persistRel('relatedButtonTextColor', v), 200)
const _dRelBtnRadius       = debounce((v) => _persistRel('relatedButtonBorderRadius', v), 200)

watch(relCardBgRef,          (v) => _dRelCardBg(v))
watch(relCardTextColorRef,   (v) => _dRelCardText(v))
watch(relCardFontSizeRef,    (v) => _dRelCardFontSize(v))
watch(relCardBorderRadiusRef,(v) => _dRelCardRadius(v))
watch(relCardShadowRef,      (v) => _dRelCardShadow(v))
watch(relCardLayoutRef,      (v) => _dRelCardLayout(v))
watch(relCardMarginRef,      (v) => _dRelCardMargin(v))
watch(relCardPaddingRef,     (v) => _dRelCardPadding(v))
watch(relCardFontWeightRef,  (v) => _dRelCardFontWeight(v))
watch(relCardTextAlignRef,   (v) => _dRelCardTextAlign(v))
watch(relCardSubtitleRef,    (v) => _dRelCardSubtitle(v))
watch(relCardSubtitleEnabledRef, (v) => _dRelCardSubtitleEn(v))
watch(relBtnTextRef,         (v) => _dRelBtnText(v))
watch(relBtnBgRef,           (v) => _dRelBtnBg(v))
watch(relBtnColorRef,        (v) => _dRelBtnColor(v))
watch(relBtnBorderRadiusRef, (v) => _dRelBtnRadius(v))

const relatedMaxSelection = computed(() =>
  Math.max(1, Number(props.blockData?.relatedColumns ?? 4)) *
  Math.max(1, Number(props.blockData?.relatedRows ?? 1))
)

const filteredRelatedProducts = computed(() => {
  const q = relatedSearch.value.trim().toLowerCase()
  if (!q) return products.value
  return products.value.filter((p) => p.name?.toLowerCase().includes(q))
})

function isRelatedSelected(product) {
  return relatedSelected.value.some((p) => p.id === product.id)
}
function isRelatedDisabled(product) {
  return !isRelatedSelected(product) && relatedSelected.value.length >= relatedMaxSelection.value
}
function toggleRelated(product) {
  const idx = relatedSelected.value.findIndex(p => p.id === product.id)
  if (idx >= 0) relatedSelected.value.splice(idx, 1)
  else if (relatedSelected.value.length < relatedMaxSelection.value) relatedSelected.value.push(product)
  doApplyRelated()
}

async function doApplyRelated(confirm = false) {
  const title = component.value?.title ?? props.selectedBlockTitle
  if (!props.updateBlockField || !title) return
  const mapped = relatedSelected.value.map(p => ({
    id: p.id,
    imageUrl: productImageSrc(p.image),
    name: p.name,
    price: p.price != null ? (typeof p.price === 'number' ? `$${p.price.toFixed(2)}` : String(p.price)) : '',
    colors: Array.isArray(p.colors) && p.colors.length
      ? p.colors.map(c => ({ htmlColor: c.htmlColor || '', name: c.name || '' }))
      : [],
  }))
  await props.updateBlockField('relatedProducts', mapped)
  if (confirm) relatedApplied.value = true
}

watch(() => props.blockData?.relatedProducts, (prods) => {
  if (!Array.isArray(prods) || !prods.length || !products.value.length) return
  const matched = prods
    .map(rp => products.value.find(p => p.id === rp.id))
    .filter(Boolean)
  if (matched.length) { relatedSelected.value = matched; relatedApplied.value = true }
}, { immediate: true })

const lastAppliedCompId = ref('')
const _lastResetForId = ref('')

const storedMode = ref('')
watch(component, async (newComp) => {
  if (newComp?.title) {
    storedMode.value = newComp.title.includes('Single') ? 'single' : newComp.title.includes('6') ? 'six' : newComp.title.includes('4') ? 'four' : 'multiple'
    lastAppliedCompId.value = newComp.id
  }
  if (newComp?.id && newComp.id !== _lastResetForId.value) {
    _lastResetForId.value = newComp.id
    if (isThemeBlock.value) {
      if (isRu2ProductDetail.value) _syncRelStyles(props.blockData)
      // Don't reset state — but restore the selection if it was cleared
      // (e.g. user navigated to a non-theme block which reset selected.value).
      // Guard: only restore when empty AND products are loaded; if products
      // haven't loaded yet, onMounted handles it after the fetch completes.
      if (selected.value.length === 0 && products.value.length > 0) {
        await nextTick()
        const section = getSection()
        const storedIds = section?.getAttribute('data-selected-products')
        if (storedIds) {
          try {
            const ids = JSON.parse(storedIds)
            const restored = products.value.filter(p => ids.includes(p.id))
            if (restored.length) { selected.value = restored; applied.value = true }
          } catch { /* ignore */ }
        }
        // Fallback after reload: data-selected-products is lost in the
        // parsePageBuilderHTML → startBuilder cycle, so match by id then name.
        if (!selected.value.length && isProductIdsBlock.value && props.blockData?.productIds) {
          const ids = String(props.blockData.productIds).split(',').map(s => s.trim()).filter(Boolean).map(Number)
          const matched = products.value.filter(p => ids.includes(p.id))
          if (matched.length) { selected.value = matched; applied.value = true }
        } else if (!selected.value.length && props.blockData?.products?.length) {
          const matched = props.blockData.products
            .flatMap(tp => {
              const found = tp.id != null
                ? products.value.find(op => op.id === tp.id)
                : products.value.find(op => op.name === tp.name)
              return found ? [found] : []
            })
          if (matched.length) { selected.value = matched; applied.value = true }
        }
      }
      return
    }
    selected.value = []
    search.value = ''
    btnText.value = 'Shop Now'
    btnBg.value = '#000000'
    btnColor.value = '#ffffff'
    btnEnabled.value = true
    cardSubtitle.value = ''
    cardSubtitleEnabled.value = true
    bgColor.value = '#ffffff'
    bgImageUrl.value = ''
    cardBg.value = '#ffffff'
    cardTextColor.value = '#000000'
    cardFontSize.value = 14
    cardBorderRadius.value = 0
    cardShadow.value = 'none'
    cardMargin.value = 0
    cardPadding.value = 0
    cardLayout.value = 'default'

    // Restore selected products from canvas data attribute
    await nextTick()
    const section = getSection()
    const storedIds = section?.getAttribute('data-selected-products')
    if (storedIds && products.value.length > 0) {
      try {
        const ids = JSON.parse(storedIds)
        selected.value = products.value.filter(p => ids.includes(p.id))
      } catch { /* ignore parse errors */ }
    }
  }
}, { immediate: true })

// For theme blocks: collapse the applied banner when switching to a different block
watch(() => props.selectedBlockTitle, (newTitle, oldTitle) => {
  if (newTitle !== oldTitle) {
    // Guard: don't reset on transient empty state caused by section re-renders
    if (newTitle) applied.value = false
    search.value = ''
    // Only wipe selection when truly navigating to a real non-theme block
    if (oldTitle && newTitle && THEME_REGISTRY_BLOCKS.includes(oldTitle) && !THEME_REGISTRY_BLOCKS.includes(newTitle)) {
      selected.value = []
    }
  }
})

const mode = computed(() => storedMode.value || 'multiple')

const isPaginatedBlock = computed(() => {
  const title = props.selectedBlockTitle ?? ''
  return PAGINATED_BLOCKS.includes(title)
})

// Per-page capacity = columns × rows
const perPage = computed(() =>
  Number(props.blockData?.columns ?? 4) * Number(props.blockData?.rows ?? 1)
)

const maxSelection = computed(() => {
  if (isProductIdsBlock.value) return 1
  if (isThemeBlock.value) {
    // Shop/paginated blocks: allow up to 10 pages worth of products
    if (isPaginatedBlock.value) return perPage.value * 10
    // Featured Products: exactly one grid — blur beyond capacity
    return perPage.value
  }
  return mode.value === 'single' ? 1 : mode.value === 'six' ? 6 : mode.value === 'four' ? 4 : 3
})

const filteredProducts = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return products.value
  return products.value.filter((p) => p.name?.toLowerCase().includes(q))
})

const selectedCompanyId = useState('selectedCompanyId', () => null)

function _needsAutoLoad() {
  if (isProductIdsBlock.value) {
    const main = props.blockData?.mainImageSrc
    const thumbs = props.blockData?.thumbImageSrcs
    return (!main || main === '') && (!Array.isArray(thumbs) || thumbs.length === 0)
  }
  const prods = props.blockData?.products
  if (!Array.isArray(prods) || prods.length === 0) return true
  return prods.every(p => !p.imageUrl || p.imageUrl === '' || p.imageUrl.startsWith('data:image/svg+xml'))
}

function _autoLoadCount() {
  if (isProductIdsBlock.value) return 1
  if (isPaginatedBlock.value) return perPage.value
  return maxSelection.value
}

onMounted(async () => {
  loading.value = true
  try {
    const res = await fetch(`/api/products${selectedCompanyId.value ? `?companyId=${selectedCompanyId.value}` : ''}`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    products.value = await res.json()
  } catch (e) {
    errorMsg.value = e instanceof Error ? e.message : 'Failed to load products'
  } finally {
    loading.value = false
  }
  // Hardcode placeholder values — don't read from DOM
  // because canvas might already have products applied
  const PLACEHOLDER_NAME = 'Layouts and visual.'
  const PLACEHOLDER_PRICE = 'Start customizing by editing this default text directly in the editor.'

  await nextTick()
  const section = getSection()

  // Pre-populate from stored data attribute (primary)
  const storedIds = section?.getAttribute('data-selected-products')
  if (storedIds) {
    try {
      const ids = JSON.parse(storedIds)
      selected.value = products.value.filter(p => ids.includes(p.id))
    } catch (e) {
      // ignore parse errors
    }
  }

  // Fallback for productIds blocks (e.g. Ru1-Product Detail): restore from comma-separated IDs
  if (!selected.value.length && isProductIdsBlock.value && props.blockData?.productIds) {
    const ids = String(props.blockData.productIds).split(',').map(s => s.trim()).filter(Boolean).map(Number)
    const matched = products.value.filter(p => ids.includes(p.id))
    if (matched.length) selected.value = matched
  }

  // Fallback for auto-loaded productIds blocks: restore from _autoLoadProductId (set without writing productIds)
  if (!selected.value.length && isProductIdsBlock.value && props.blockData?._autoLoadProductId) {
    const id = Number(props.blockData._autoLoadProductId)
    if (id) {
      const matched = products.value.filter(p => p.id === id)
      if (matched.length) selected.value = matched
    }
  }

  // Fallback for theme blocks: match by id then name from blockData.products when no IDs stored
  if (!selected.value.length && isThemeBlock.value && !isProductIdsBlock.value && props.blockData?.products?.length) {
    const matched = props.blockData.products
      .map(tp => tp.id != null
        ? products.value.find(op => op.id === tp.id)
        : products.value.find(op => op.name === tp.name))
      .filter(Boolean)
    if (matched.length) selected.value = matched
  }

  // Sync registry with restored selection and show applied state so the user
  // sees "N products applied" immediately after save/reload.
  // For productIds blocks in auto-loaded state (productIds is empty), skip doApplyThemeBlock
  // so that writing productIds doesn't clear the description placeholder.
  if (isThemeBlock.value && selected.value.length > 0 && (!isProductIdsBlock.value || props.blockData?.productIds)) {
    await nextTick()
    doApplyThemeBlock()
    applied.value = true
  }

  // Sync related card style refs from blockData on mount
  if (isRu2ProductDetail.value) _syncRelStyles(props.blockData)

  // Restore related products selection (Ru2-Product Detail)
  if (isRu2ProductDetail.value && !relatedSelected.value.length && Array.isArray(props.blockData?.relatedProducts) && props.blockData.relatedProducts.length) {
    const matched = props.blockData.relatedProducts
      .map(rp => products.value.find(p => p.id === rp.id))
      .filter(Boolean)
    if (matched.length) { relatedSelected.value = matched; relatedApplied.value = true }
  }

  // Auto-load: populate cards with real Odoo product data on first add.
  // For productIds blocks: writes runtime fields + mainImageSrc. productIds stays empty so the
  //   description placeholder stays visible until user explicitly picks via the picker.
  // For products-array blocks: writes full products array with real image/name/price/colors.
  if (_needsAutoLoad() && products.value.length > 0 && props.updateBlockField) {
    const n = _autoLoadCount()
    const firstN = products.value.slice(0, n)
    const curr = props.blockData?.currency || '$'
    try {
      if (isProductIdsBlock.value) {
        const first = firstN[0]
        if (first) {
          const sectionEl = getSection()
          const compId = sectionEl?.getAttribute('data-componentid')
          if (compId) {
            const reg = useBlockRegistry()
            const img = productImageSrc(first.image)
            reg.setData(compId, '_productName', first.name ?? '')
            reg.setData(compId, '_productPriceNum', Number(first.price) || 0)
            reg.setData(compId, '_productColors',
              Array.isArray(first.colors) && first.colors.length
                ? first.colors.map(c => ({ htmlColor: c.htmlColor || '', name: c.name || '' }))
                : []
            )
            // Store for picker auto-restore without touching productIds
            reg.setData(compId, '_autoLoadProductId', String(first.id))
            await props.updateBlockField('mainImageSrc', img)
            await props.updateBlockField('thumbImageSrcs', img ? [img] : [])
          }
        }
        selected.value = firstN
      } else if (isThemeBlock.value) {
        const mapped = firstN.map((p, i) => ({
          id: p.id,
          imageUrl: productImageSrc(p.image),
          name: p.name ?? `Product ${i + 1}`,
          price: `${curr}${Number(p.price || 0).toFixed(2)}`,
          oldPrice: '',
          buttonLabel: 'Add to Cart',
          buttonUrl: '/shop',
          colors: Array.isArray(p.colors) && p.colors.length
            ? p.colors.map(c => c.htmlColor || '').filter(Boolean).join(', ')
            : '#FF0000, #0000FF',
        }))
        await props.updateBlockField('products', mapped)
        selected.value = firstN
      }
    } catch {
      // Graceful: placeholder data remains if persist fails
    }
  }
})

function getSection() {
  if (isThemeBlock.value) {
    const title = props.selectedBlockTitle
    return title ? document.querySelector(`section[data-component-title="${title}"]`) : null
  }
  const id = component.value?.id ?? lastAppliedCompId.value
  if (!id) return null
  return document.querySelector(`section[data-componentid="${id}"]`)
}

function productImageSrc(image) {
  if (!image) return ''
  if (image.startsWith('data:') || image.startsWith('http') || image.startsWith('/')) return image
  // Detect format from base64 magic bytes: /9j/ = JPEG, iVBOR = PNG
  const mime = image.startsWith('/9j/') ? 'image/jpeg' : 'image/png'
  return `data:${mime};base64,${image}`
}

async function doApplyThemeBlock(confirm = false) {
  const section = getSection()
  const title = component.value?.title ?? props.selectedBlockTitle

  // Read active page before re-render (re-render always resets to page 1)
  let currentPage = 1
  if (section) {
    section.querySelectorAll('[data-sp]').forEach(function(p) {
      if (p.style.display !== 'none') currentPage = +(p.dataset.sp || 1)
    })
  }

  const mapped = selected.value.map(p => ({
    id: p.id,
    imageUrl: productImageSrc(p.image),
    name: p.name,
    price: p.price != null ? (typeof p.price === 'number' ? `$${p.price.toFixed(2)}` : String(p.price)) : '',
    oldPrice: '',
    buttonLabel: 'Add to Cart',
    buttonUrl: '/shop',
    colors: Array.isArray(p.colors) && p.colors.length
      ? p.colors.map(c => c.htmlColor || c.name || '').filter(Boolean).join(', ')
      : (typeof p.colors === 'string' ? p.colors : ''),
  }))

  // Store selected IDs on the section element so restore-on-mount works after re-render
  if (section) {
    section.setAttribute('data-selected-products', JSON.stringify(selected.value.map(p => p.id)))
  }

  if (props.updateBlockField && title) {
    if (isProductIdsBlock.value) {
      // All product display data is stored in the registry as builder-only runtime
      // fields. The render function uses them and strips them from data-component-props
      // so they never bloat the saved HTML. This means any editor field change
      // (currency, button label, accent color, etc.) re-renders with current product
      // data intact — no post-hoc DOM injection needed.
      const registry = useBlockRegistry()
      const firstProduct = selected.value[0]
      const sectionEl = getSection()
      const compId = sectionEl?.getAttribute('data-componentid')
      if (compId) {
        registry.setData(compId, 'mainImageSrc', firstProduct?.image ? productImageSrc(firstProduct.image) : '')
        registry.setData(compId, 'thumbImageSrcs', selected.value.map(p => p.image ? productImageSrc(p.image) : ''))
        registry.setData(compId, '_productName', firstProduct?.name ?? '')
        registry.setData(compId, '_productPriceNum', firstProduct ? Number(firstProduct.price) : null)
        registry.setData(compId, '_productColors',
          Array.isArray(firstProduct?.colors) && firstProduct.colors.length
            ? firstProduct.colors.map(c => ({ htmlColor: c.htmlColor || '', name: c.name || '' }))
            : []
        )
      }

      await props.updateBlockField('productIds', selected.value.map(p => p.id).join(','))
    } else {
      props.updateBlockField('products', mapped)
    }
  }

  // Restore the page the user was on — re-render resets to page 1
  if (currentPage > 1) {
    await nextTick()
    const newSection = getSection()
    if (newSection) {
      const pageDivs = newSection.querySelectorAll('[data-sp]')
      const target = Math.min(currentPage, pageDivs.length)
      pageDivs.forEach(function(p) {
        p.style.display = +(p.dataset.sp || 0) === target ? '' : 'none'
      })
      newSection.querySelectorAll('[data-spb]').forEach(function(x) {
        const v = +(x.dataset.spb || 0)
        if (v) {
          x.style.background = v === target ? '#111827' : '#fff'
          x.style.color = v === target ? '#fff' : '#374151'
          x.style.borderColor = v === target ? '#111827' : '#d1d5db'
        }
      })
    }
  }

  if (confirm) applied.value = true
}

function doApply() {
  if (isThemeBlock.value) { doApplyThemeBlock(); return }

  const section = getSection()
  if (!section) return

  // Nuclear clean: remove all buttons and swatches from every product card slot
  section.querySelectorAll('img[alt="provider"]').forEach(img => {
    const card = img.closest('[class*="flex"]') ?? img.parentElement
    card?.querySelectorAll('a').forEach(b => b.remove())
    card?.querySelectorAll('[class*="color-swatches"], .color-swatches').forEach(s => s.remove())
  })

  const cards = Array.from(section.querySelectorAll('.flex-1, .flex-1')).filter(el =>
    el.querySelector('img[alt="provider"]')
  )
  cards.forEach(card => {
    card.style.backgroundColor = cardBg.value
    card.style.color = cardTextColor.value
    card.style.fontSize = cardFontSize.value + 'px'
    card.style.borderRadius = cardBorderRadius.value + 'px'
    card.style.overflow = 'hidden'
    card.style.boxShadow = shadowPresets[cardShadow.value] ?? 'none'
    card.style.margin = cardMargin.value + 'px'
    card.style.padding = cardPadding.value + 'px'
  })

  const imgs = section.querySelectorAll('img[alt="provider"]')
  imgs.forEach((img, i) => {
    const product = selected.value[i]
    if (!product) return
    img.setAttribute('src', productImageSrc(product.image))
    const parentDiv = img.parentElement
    if (parentDiv) {
      const ps = parentDiv.querySelectorAll('p')
      if (ps[0]) ps[0].textContent = product.name ?? ''
      if (ps[1]) ps[1].textContent = product.price != null ? String(product.price) : ''
      if (ps[2]) {
        if (cardSubtitleEnabled.value && cardSubtitle.value.trim()) {
          ps[2].textContent = cardSubtitle.value.trim()
          ps[2].style.display = ''
        } else if (!cardSubtitleEnabled.value) {
          ps[2].style.display = 'none'
        } else {
          ps[2].textContent = 'Start customizing by editing this default text directly in the editor.'
          ps[2].style.display = ''
        }
      }

      // textContainer is the div that holds the <p> tags — button goes here too
      const textContainer = ps[0]?.parentElement ?? parentDiv
      // Nuke all existing buttons from the whole card before recreating
      const cardDiv = img.closest('.flex-1, .flex-1') ?? parentDiv
      const textDiv = cardDiv.querySelector('.break-words, .break-words') ?? textContainer
      textDiv.style.display = 'flex'
      textDiv.style.flexDirection = 'column'
      textDiv.style.flex = '1'

      if (cardLayout.value === 'centered') {
        textDiv.style.textAlign = 'center'
      } else if (cardLayout.value === 'inline') {
        textDiv.style.textAlign = ''
        if (ps[0] && ps[1]) {
          const wrapper = document.createElement('div')
          wrapper.className = 'layout-inline-wrapper'
          wrapper.style.cssText = 'display:flex; justify-content:space-between; align-items:center;'
          ps[0].style.cssText += '; min-width:0; overflow:hidden;'
          ps[1].style.cssText += '; white-space:nowrap; flex-shrink:0;'
          textDiv.insertBefore(wrapper, ps[0])
          wrapper.appendChild(ps[0])
          wrapper.appendChild(ps[1])
        }
      } else {
        textDiv.style.textAlign = 'left'
      }

      // Add new swatches if product has colors
      if (product.colors?.length) {
        const swatchContainer = document.createElement('div')
        swatchContainer.className = 'color-swatches'
        const isCentered = cardDiv?.classList.contains('text-center') || textDiv?.classList.contains('text-center') || textDiv?.style?.textAlign === 'center' || cardLayout.value === 'centered'
        swatchContainer.style.cssText = `display:flex; flex-wrap:wrap; gap:4px; padding:4px 0; justify-content:${isCentered ? 'center' : 'flex-start'};`
        const MAX_SWATCHES = 12
        product.colors.slice(0, MAX_SWATCHES).forEach(color => {
          const dot = document.createElement('span')
          dot.title = color.name
          dot.style.cssText = `display:inline-block; width:12px; height:12px; border-radius:50%; background-color:${color.htmlColor}; border:1px solid rgba(0,0,0,0.15); flex-shrink:0;`
          swatchContainer.appendChild(dot)
        })
        const extra = product.colors.length - MAX_SWATCHES
        if (extra > 0) {
          const more = document.createElement('span')
          more.style.cssText = `font-size:10px; color:#6b7280; line-height:12px; flex-shrink:0;`
          more.textContent = `+${extra}`
          swatchContainer.appendChild(more)
        }
        const existingBtn = textDiv?.querySelector('a.shop-btn')
        if (existingBtn) {
          textDiv.insertBefore(swatchContainer, existingBtn)
        } else {
          textDiv?.appendChild(swatchContainer)
        }
      }

      if (btnEnabled.value) {
        const btn = document.createElement('a')
        btn.href = '#'
        btn.setAttribute('data-product-id', String(product.id ?? ''))
        btn.className = 'shop-btn'
        const isCentered = textDiv?.classList.contains('text-center')
        btn.style.cssText = `display:inline-block; background-color:${btnBg.value}; color:${btnColor.value}; padding:8px 16px; text-decoration:none; font-size:14px; cursor:pointer; border:none; width:100%; text-align:center; box-sizing:border-box; margin-top:auto;`
        btn.textContent = btnText.value
        textDiv.appendChild(btn)
      }
    }
  })

  // Clear slots that have no selected product
  imgs.forEach((img, i) => {
    if (!selected.value[i]) {
      img.setAttribute('src',
        'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'400\' viewBox=\'0 0 400 400\'%3E%3Crect width=\'400\' height=\'400\' fill=\'%23e5e7eb\'/%3E%3C/svg%3E'
      )
      const parentDiv = img.parentElement
      if (parentDiv) {
        const ps = parentDiv.querySelectorAll('p')
        if (ps[0]) ps[0].textContent = 'Layouts and visual.'
        if (ps[1]) ps[1].textContent =
          'Start customizing by editing this default text directly in the editor.'
        const cardDiv = img.closest('.flex-1, .flex-1')
          ?? parentDiv
        cardDiv.querySelectorAll('a').forEach(b => b.remove())
        cardDiv.querySelectorAll('.color-swatches').forEach(s => s.remove())
        // Remove flex styles from textDiv
        const textDiv = cardDiv.querySelector(
          '.break-words, .break-words'
        ) ?? parentDiv
        textDiv.style.display = ''
        textDiv.style.flexDirection = ''
        textDiv.style.flex = ''
      }
    }
  })

  // Store selected product IDs on section for reliable pre-population
  section.setAttribute(
    'data-selected-products',
    JSON.stringify(selected.value.map(p => p.id))
  )

  pageBuilderService.handleManualSave()
}

function toggle(product) {
  const idx = selected.value.findIndex(p => p.id === product.id)
  if (idx >= 0) {
    selected.value.splice(idx, 1)
  } else if (selected.value.length < maxSelection.value) {
    selected.value.push(product)
  }
  doApply()
}

function isSelected(product) {
  return selected.value.some((p) => p.id === product.id)
}

function isDisabled(product) {
  return !isSelected(product) && selected.value.length >= maxSelection.value
}

function applyBackgroundLive() {
  const section = getSection()
  if (!section) return
  section.style.backgroundColor = bgColor.value
  if (bgImageUrl.value.trim()) {
    if (!bgImageUrl.value.trim().startsWith('http')) {
      bgImageError.value = 'URL must start with http:// or https://'
      return
    }
    bgImageError.value = ''
    section.style.backgroundImage = `url('${bgImageUrl.value.trim()}')`
    section.style.backgroundSize = 'cover'
    section.style.backgroundPosition = 'center'
    section.style.backgroundRepeat = 'no-repeat'
  } else {
    bgImageError.value = ''
    section.style.backgroundImage = ''
  }
  pageBuilderService.handleManualSave()
}

function applyCardStylesLive() {
  const section = getSection()
  if (!section) return
  const cards = Array.from(section.querySelectorAll('.flex-1, .flex-1')).filter(el =>
    el.querySelector('img[alt="provider"]')
  )
  if (!cards.length) return
  cards.forEach(card => {
    card.style.backgroundColor = cardBg.value
    card.style.color = cardTextColor.value
    card.style.fontSize = cardFontSize.value + 'px'
    card.style.borderRadius = cardBorderRadius.value + 'px'
    card.style.overflow = 'hidden'
    card.style.boxShadow = shadowPresets[cardShadow.value] ?? 'none'
    card.style.margin = cardMargin.value + 'px'
    card.style.padding = cardPadding.value + 'px'
  })
  pageBuilderService.handleManualSave()
}

function applyButtonLive() {
  const section = getSection()
  if (!section) return

  const existingBtns = section.querySelectorAll('a.shop-btn')

  if (!btnEnabled.value) {
    existingBtns.forEach(btn => btn.remove())
    pageBuilderService.handleManualSave()
    return
  }

  if (existingBtns.length > 0) {
    existingBtns.forEach(btn => {
      btn.textContent = btnText.value
      btn.style.backgroundColor = btnBg.value
      btn.style.color = btnColor.value
    })
    pageBuilderService.handleManualSave()
  } else if (selected.value.length > 0) {
    doApply()
  }
}

const debouncedBackground = debounce(applyBackgroundLive, 300)
const debouncedCardNumbers = debounce(applyCardStylesLive, 300)
const debouncedButtonText = debounce(applyButtonLive, 300)

watch(bgColor, applyBackgroundLive)
watch(bgImageUrl, debouncedBackground)
watch([cardBg, cardTextColor, cardShadow], applyCardStylesLive)
watch(cardLayout, () => {
  if (selected.value.length > 0) doApply()
})
watch([cardFontSize, cardBorderRadius, cardMargin, cardPadding], debouncedCardNumbers)
watch([btnEnabled, btnBg, btnColor], applyButtonLive)
watch(btnText, debouncedButtonText)
const debouncedSubtitle = debounce(doApply, 300)
watch(cardSubtitle, debouncedSubtitle)
watch(cardSubtitleEnabled, () => { if (selected.value.length > 0) doApply() })

// For non-paginated blocks: trim excess products when the grid shrinks.
// Paginated blocks keep all products — pages recompute from the new perPage.
watch(perPage, (newPerPage) => {
  if (isThemeBlock.value && !isPaginatedBlock.value && selected.value.length > newPerPage) {
    selected.value = selected.value.slice(0, newPerPage)
  }
})
</script>

<template>
  <div class="mt-1 mb-3">

    <!-- ── Applied state (theme blocks after confirm) ───────────────────────── -->
    <div v-if="isThemeBlock && applied" class="px-2 py-5 text-center">
      <div class="w-10 h-10 rounded-full bg-green-50 border border-green-200 flex items-center justify-center mx-auto mb-2">
        <span class="text-green-600 text-base">✓</span>
      </div>
      <p class="text-sm font-medium text-gray-800 mb-0.5">{{ selected.length }} product{{ selected.length !== 1 ? 's' : '' }} applied</p>
      <p class="text-xs text-gray-400 mb-3">Click the block on canvas to re-edit</p>
      <button
        @click="applied = false"
        class="text-xs text-blue-600 underline cursor-pointer bg-transparent border-0 p-0"
      >Edit products</button>
    </div>

    <!-- ── Picker (default / non-applied state) ─────────────────────────────── -->
    <template v-else>
    <p class="font-medium text-sm mb-2 px-1">
      Select products
      <span class="text-gray-400 font-normal text-xs">&nbsp;{{ selected.length }}{{ isThemeBlock ? '' : '/' + maxSelection }}</span>
    </p>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-6">
      <div
        class="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"
        role="status"
      >
        <span class="!absolute !m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="errorMsg" class="text-red-600 text-xs px-1 py-2">
      {{ errorMsg }}
    </div>

    <!-- Search + grid -->
    <div v-else>
      <!-- Search -->
      <div class="px-1 mb-2">
        <input
          v-model="search"
          type="text"
          placeholder="Search products..."
          class="w-full border border-gray-300 text-xs px-2 py-1.5 rounded outline-none focus:border-gray-500 bg-white"
        />
      </div>

      <!-- No results -->
      <p
        v-if="filteredProducts.length === 0"
        class="text-xs text-gray-400 text-center py-4"
      >
        No products found
      </p>

      <!-- Product grid -->
      <div v-else class="grid grid-cols-2 gap-1.5 max-h-80 overflow-y-auto px-1 pb-1">
        <div
          v-for="product in filteredProducts"
          :key="product.id"
          @click="!isDisabled(product) && toggle(product)"
          :class="[
            'relative border-2 rounded overflow-hidden transition-all',
            isSelected(product)
              ? 'border-blue-500 cursor-pointer'
              : isDisabled(product)
                ? 'border-transparent cursor-not-allowed'
                : 'border-transparent cursor-pointer hover:border-gray-300',
          ]"
          :style="isDisabled(product) ? (isThemeBlock ? { filter: 'blur(2px)', opacity: '0.55', pointerEvents: 'none' } : { opacity: '0.4' }) : {}"
        >
          <img
            :src="productImageSrc(product.image)"
            :alt="product.name"
            class="w-full aspect-square object-cover block"
          />
          <div class="px-1 py-1">
            <p class="text-xs font-medium truncate leading-tight m-0">{{ product.name }}</p>
            <p class="text-xs text-gray-500 leading-tight m-0">{{ product.price }}</p>
          </div>
          <div v-if="product.colors?.length" class="flex gap-1 px-1 pb-1">
            <div
              v-for="color in product.colors"
              :key="color.id"
              :title="color.name"
              :style="{ backgroundColor: color.htmlColor }"
              class="w-3 h-3 rounded-full border border-gray-300 flex-shrink-0"
            />
          </div>
          <!-- Checkmark badge -->
          <div
            v-if="isSelected(product)"
            class="absolute top-1 right-1 bg-blue-500 rounded-full w-5 h-5 flex items-center justify-center"
          >
            <span class="text-white text-xs leading-none">✓</span>
          </div>
        </div>
      </div>

      <!-- Capacity hint -->
      <p v-if="isThemeBlock && !isPaginatedBlock && selected.length >= maxSelection" class="text-xs text-gray-400 text-center mt-2 px-1">
        Grid full ({{ selected.length }}/{{ maxSelection }}). Increase Rows or Columns to add more.
      </p>
      <p v-if="isPaginatedBlock && selected.length > 0" class="text-xs text-gray-400 text-center mt-2 px-1">
        {{ selected.length }} product{{ selected.length !== 1 ? 's' : '' }} · {{ Math.ceil(selected.length / perPage) }} page{{ Math.ceil(selected.length / perPage) !== 1 ? 's' : '' }} ({{ perPage }} per page)
      </p>

      <!-- Apply button (theme blocks only) -->
      <div v-if="isThemeBlock && selected.length > 0" class="px-1 mt-3">
        <button
          @click="doApplyThemeBlock(true)"
          class="w-full bg-gray-900 text-white text-xs font-medium py-2 px-3 rounded cursor-pointer border-0"
        >
          Apply {{ selected.length }} Product{{ selected.length !== 1 ? 's' : '' }}
        </button>
      </div>

      <!-- Divider -->
      <div v-if="!isThemeBlock" class="w-full border-t border-gray-200 my-4"></div>

      <!-- Background configurator -->
      <template v-if="!isThemeBlock">
      <div class="px-1">
        <p class="font-medium text-sm mb-3">Background</p>

        <!-- Background color -->
        <div class="mb-2">
          <label class="block text-xs text-gray-500 mb-1">Color</label>
          <div class="flex items-center gap-1.5 border border-gray-300 rounded px-2 py-1 bg-white">
            <input
              v-model="bgColor"
              type="color"
              class="w-5 h-5 rounded border-0 cursor-pointer p-0"
            />
            <span class="text-xs text-gray-600 font-mono">{{ bgColor }}</span>
          </div>
        </div>

        <!-- Background image URL -->
        <div class="mb-3">
          <label class="block text-xs text-gray-500 mb-1">Image URL</label>
          <input
            v-model="bgImageUrl"
            type="text"
            placeholder="https://example.com/image.jpg"
            class="w-full border border-gray-300 text-xs px-2 py-1.5 rounded outline-none focus:border-gray-500 bg-white"
          />
          <p v-if="bgImageError" class="text-red-500 text-xs mt-1">{{ bgImageError }}</p>
        </div>
      </div>

      <!-- Divider -->
      <div class="w-full border-t border-gray-200 my-4"></div>

      <!-- Card Style configurator -->
      <div class="px-1">
        <p class="font-medium text-sm mb-3">Card Style</p>

        <!-- Card Layout picker -->
        <div class="mb-3">
          <label class="block text-xs text-gray-500 mb-1.5">Card Layout</label>
          <div class="flex gap-2">
            <button type="button" @click="cardLayout = 'default'"
              :class="cardLayout === 'default' ? 'border-gray-900 bg-gray-50' : 'border-gray-200 bg-white'"
              class="flex-1 border-2 rounded-lg p-1.5 cursor-pointer transition-colors">
              <svg viewBox='0 0 40 48' fill='none' xmlns='http://www.w3.org/2000/svg' class='w-full'>
                <rect width='40' height='26' rx='2' fill='#E2E8F0'/>
                <rect y='29' width='28' height='3' rx='1' fill='#94A3B8'/>
                <rect y='34' width='20' height='3' rx='1' fill='#CBD5E1'/>
                <rect y='39' width='40' height='9' rx='2' fill='#1E293B'/>
              </svg>
              <span class="text-xs text-gray-500 mt-1 block text-center">Default</span>
            </button>
            <button type="button" @click="cardLayout = 'inline'"
              :class="cardLayout === 'inline' ? 'border-gray-900 bg-gray-50' : 'border-gray-200 bg-white'"
              class="flex-1 border-2 rounded-lg p-1.5 cursor-pointer transition-colors">
              <svg viewBox='0 0 40 48' fill='none' xmlns='http://www.w3.org/2000/svg' class='w-full'>
                <rect width='40' height='26' rx='2' fill='#E2E8F0'/>
                <rect y='29' width='18' height='3' rx='1' fill='#94A3B8'/>
                <rect x='24' y='29' width='16' height='3' rx='1' fill='#94A3B8'/>
                <rect y='34' width='40' height='9' rx='2' fill='#1E293B'/>
              </svg>
              <span class="text-xs text-gray-500 mt-1 block text-center">Inline</span>
            </button>
            <button type="button" @click="cardLayout = 'centered'"
              :class="cardLayout === 'centered' ? 'border-gray-900 bg-gray-50' : 'border-gray-200 bg-white'"
              class="flex-1 border-2 rounded-lg p-1.5 cursor-pointer transition-colors">
              <svg viewBox='0 0 40 48' fill='none' xmlns='http://www.w3.org/2000/svg' class='w-full'>
                <rect width='40' height='26' rx='2' fill='#E2E8F0'/>
                <rect x='6' y='29' width='28' height='3' rx='1' fill='#94A3B8'/>
                <rect x='10' y='34' width='20' height='3' rx='1' fill='#CBD5E1'/>
                <rect y='39' width='40' height='9' rx='2' fill='#1E293B'/>
              </svg>
              <span class="text-xs text-gray-500 mt-1 block text-center">Centered</span>
            </button>
          </div>
        </div>

        <!-- Row 1: Card bg + text color -->
        <div class="flex gap-2 mb-2">
          <div class="flex-1">
            <label class="block text-xs text-gray-500 mb-1">Background</label>
            <div class="flex items-center gap-1.5 border border-gray-300 rounded px-2 py-1 bg-white">
              <input
                v-model="cardBg"
                type="color"
                class="w-5 h-5 rounded border-0 cursor-pointer p-0"
              />
              <span class="text-xs text-gray-600 font-mono">{{ cardBg }}</span>
            </div>
          </div>
          <div class="flex-1">
            <label class="block text-xs text-gray-500 mb-1">Text color</label>
            <div class="flex items-center gap-1.5 border border-gray-300 rounded px-2 py-1 bg-white">
              <input
                v-model="cardTextColor"
                type="color"
                class="w-5 h-5 rounded border-0 cursor-pointer p-0"
              />
              <span class="text-xs text-gray-600 font-mono">{{ cardTextColor }}</span>
            </div>
          </div>
        </div>

        <!-- Row 2: Font size + Border radius -->
        <div class="flex gap-2 mb-2">
          <div class="flex-1">
            <label class="block text-xs text-gray-500 mb-1">Font size</label>
            <div class="flex items-center border border-gray-300 rounded bg-white">
              <input
                v-model.number="cardFontSize"
                type="number"
                min="10"
                max="32"
                class="w-full text-xs px-2 py-1.5 outline-none bg-transparent"
              />
              <span class="text-xs text-gray-400 pr-2">px</span>
            </div>
          </div>
          <div class="flex-1">
            <label class="block text-xs text-gray-500 mb-1">Border radius</label>
            <div class="flex items-center border border-gray-300 rounded bg-white">
              <input
                v-model.number="cardBorderRadius"
                type="number"
                min="0"
                max="50"
                class="w-full text-xs px-2 py-1.5 outline-none bg-transparent"
              />
              <span class="text-xs text-gray-400 pr-2">px</span>
            </div>
          </div>
        </div>

        <!-- Row 3: Box shadow dropdown -->
        <div class="mb-2">
          <label class="block text-xs text-gray-500 mb-1">Box shadow</label>
          <select
            v-model="cardShadow"
            class="w-full border border-gray-300 text-xs px-2 py-1.5 rounded outline-none bg-white focus:border-gray-500 cursor-pointer"
          >
            <option value="none">None</option>
            <option value="shadow-2xs">2xs</option>
            <option value="shadow-xs">xs</option>
            <option value="shadow-sm">sm</option>
            <option value="shadow-md">md</option>
            <option value="shadow-lg">lg</option>
            <option value="shadow-xl">xl</option>
            <option value="shadow-2xl">2xl</option>
          </select>
        </div>

        <!-- Row 4: Margin + Padding -->
        <div class="flex gap-2 mb-3">
          <div class="flex-1">
            <label class="block text-xs text-gray-500 mb-1">Margin</label>
            <div class="flex items-center border border-gray-300 rounded bg-white">
              <input
                v-model.number="cardMargin"
                type="number"
                min="0"
                max="50"
                class="w-full text-xs px-2 py-1.5 outline-none bg-transparent"
              />
              <span class="text-xs text-gray-400 pr-2">px</span>
            </div>
          </div>
          <div class="flex-1">
            <label class="block text-xs text-gray-500 mb-1">Padding</label>
            <div class="flex items-center border border-gray-300 rounded bg-white">
              <input
                v-model.number="cardPadding"
                type="number"
                min="0"
                max="50"
                class="w-full text-xs px-2 py-1.5 outline-none bg-transparent"
              />
              <span class="text-xs text-gray-400 pr-2">px</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Divider -->
      <div class="w-full border-t border-gray-200 my-4"></div>

      <!-- Button configurator -->
      <div class="px-1">
        <!-- Section header + toggle -->
        <div class="flex items-center justify-between mb-3">
          <p class="font-medium text-sm">Button</p>
          <div class="flex items-center cursor-pointer" @click.prevent="btnEnabled = !btnEnabled">
            <div class="relative w-9 h-5">
              <div
                :class="[
                  'absolute inset-0 rounded-full transition-colors duration-200',
                  btnEnabled ? 'bg-black' : 'bg-gray-300',
                ]"
              ></div>
              <div
                :class="[
                  'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200',
                  btnEnabled ? 'translate-x-5' : 'translate-x-0.5',
                ]"
              ></div>
            </div>
          </div>
        </div>

        <!-- Config fields — only when toggle is on -->
        <div v-if="btnEnabled" class="flex flex-col gap-2">
          <!-- Button text -->
          <div>
            <label class="block text-xs text-gray-500 mb-1">Button text</label>
            <input
              v-model="btnText"
              type="text"
              class="w-full border border-gray-300 text-xs px-2 py-1.5 rounded outline-none focus:border-gray-500 bg-white"
            />
          </div>

          <!-- Card subtitle -->
          <div class="mt-2">
            <div class="flex items-center justify-between mb-1">
              <label class="text-xs text-gray-500">Card Subtitle</label>
              <label class="flex items-center gap-1 cursor-pointer">
                <input type="checkbox" v-model="cardSubtitleEnabled" class="cursor-pointer" />
                <span class="text-xs text-gray-400">Show</span>
              </label>
            </div>
            <input v-model="cardSubtitle" v-if="cardSubtitleEnabled" type="text" maxlength="50"
              placeholder="e.g. Available in 3 colors"
              class="w-full border border-gray-300 text-xs px-2 py-1.5 rounded outline-none focus:border-gray-500 bg-white" />
            <p v-if="cardSubtitleEnabled" class="text-right text-xs text-gray-400 mt-0.5">{{ cardSubtitle.length }}/50</p>
          </div>

          <!-- Color pickers -->
          <div class="flex gap-2">
            <div class="flex-1">
              <label class="block text-xs text-gray-500 mb-1">Background</label>
              <div class="flex items-center gap-1.5 border border-gray-300 rounded px-2 py-1 bg-white">
                <input
                  v-model="btnBg"
                  type="color"
                  class="w-5 h-5 rounded border-0 cursor-pointer p-0"
                />
                <span class="text-xs text-gray-600 font-mono">{{ btnBg }}</span>
              </div>
            </div>
            <div class="flex-1">
              <label class="block text-xs text-gray-500 mb-1">Text color</label>
              <div class="flex items-center gap-1.5 border border-gray-300 rounded px-2 py-1 bg-white">
                <input
                  v-model="btnColor"
                  type="color"
                  class="w-5 h-5 rounded border-0 cursor-pointer p-0"
                />
                <span class="text-xs text-gray-600 font-mono">{{ btnColor }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      </template>
    </div>
    </template><!-- end v-else (picker state) -->
  </div>

  <!-- ── Customers also bought picker (Ru2-Product Detail only) ──────────── -->
  <template v-if="isRu2ProductDetail">
    <div class="w-full border-t border-gray-200 my-4"></div>

    <div class="mt-1 mb-3">
      <!-- Applied state -->
      <div v-if="relatedApplied" class="px-2 py-5 text-center">
        <div class="w-10 h-10 rounded-full bg-green-50 border border-green-200 flex items-center justify-center mx-auto mb-2">
          <span class="text-green-600 text-base">✓</span>
        </div>
        <p class="text-sm font-medium text-gray-800 mb-0.5">{{ relatedSelected.length }} related product{{ relatedSelected.length !== 1 ? 's' : '' }} applied</p>
        <p class="text-xs text-gray-400 mb-3">{{ relatedMaxSelection }} max ({{ blockData?.relatedColumns ?? 4 }} cols × {{ blockData?.relatedRows ?? 1 }} rows)</p>
        <button @click="relatedApplied = false" class="text-xs text-blue-600 underline cursor-pointer bg-transparent border-0 p-0">Edit related</button>
      </div>

      <!-- Picker -->
      <template v-else>
        <p class="font-medium text-sm mb-1 px-1">Customers also bought</p>
        <p class="text-xs text-gray-400 mb-2 px-1">{{ relatedSelected.length }}/{{ relatedMaxSelection }} · {{ blockData?.relatedColumns ?? 4 }} cols × {{ blockData?.relatedRows ?? 1 }} rows</p>

        <div v-if="loading" class="flex items-center justify-center py-6">
          <div class="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" role="status"></div>
        </div>

        <div v-else>
          <!-- Search -->
          <div class="px-1 mb-2">
            <input v-model="relatedSearch" type="text" placeholder="Search products..."
              class="w-full border border-gray-300 text-xs px-2 py-1.5 rounded outline-none focus:border-gray-500 bg-white" />
          </div>

          <p v-if="filteredRelatedProducts.length === 0" class="text-xs text-gray-400 text-center py-4">No products found</p>

          <!-- Grid -->
          <div v-else class="grid grid-cols-2 gap-1.5 max-h-80 overflow-y-auto px-1 pb-1">
            <div
              v-for="product in filteredRelatedProducts"
              :key="product.id"
              @click="!isRelatedDisabled(product) && toggleRelated(product)"
              :class="[
                'relative border-2 rounded overflow-hidden transition-all',
                isRelatedSelected(product) ? 'border-blue-500 cursor-pointer'
                  : isRelatedDisabled(product) ? 'border-transparent cursor-not-allowed'
                  : 'border-transparent cursor-pointer hover:border-gray-300',
              ]"
              :style="isRelatedDisabled(product) ? { filter: 'blur(2px)', opacity: '0.55', pointerEvents: 'none' } : {}"
            >
              <img :src="productImageSrc(product.image)" :alt="product.name" class="w-full aspect-square object-cover block" />
              <div class="px-1 py-1">
                <p class="text-xs font-medium truncate leading-tight m-0">{{ product.name }}</p>
                <p class="text-xs text-gray-500 leading-tight m-0">{{ product.price }}</p>
              </div>
              <div v-if="isRelatedSelected(product)" class="absolute top-1 right-1 bg-blue-500 rounded-full w-5 h-5 flex items-center justify-center">
                <span class="text-white text-xs leading-none">✓</span>
              </div>
            </div>
          </div>

          <p v-if="relatedSelected.length >= relatedMaxSelection" class="text-xs text-gray-400 text-center mt-2 px-1">
            Grid full ({{ relatedSelected.length }}/{{ relatedMaxSelection }}). Increase Rows or Columns to add more.
          </p>

          <div v-if="relatedSelected.length > 0" class="px-1 mt-3">
            <button @click="doApplyRelated(true)" class="w-full bg-gray-900 text-white text-xs font-medium py-2 px-3 rounded cursor-pointer border-0">
              Apply {{ relatedSelected.length }} Related Product{{ relatedSelected.length !== 1 ? 's' : '' }}
            </button>
          </div>
        </div>
      </template>

      <!-- ── Card Style ──────────────────────────────────────────────────── -->
      <div class="w-full border-t border-gray-200 my-4"></div>
      <div class="px-1">
        <p class="font-medium text-sm mb-3">Card Style</p>

        <!-- Card layout -->
        <div class="mb-3">
          <label class="block text-xs text-gray-500 mb-1.5">Card Layout</label>
          <div class="flex gap-2">
            <button type="button" @click="relCardLayoutRef = 'default'"
              :class="relCardLayoutRef === 'default' ? 'border-gray-900 bg-gray-50' : 'border-gray-200 bg-white'"
              class="flex-1 border-2 rounded-lg p-1.5 cursor-pointer transition-colors">
              <svg viewBox='0 0 40 48' fill='none' xmlns='http://www.w3.org/2000/svg' class='w-full'>
                <rect width='40' height='26' rx='2' fill='#E2E8F0'/><rect y='29' width='28' height='3' rx='1' fill='#94A3B8'/><rect y='34' width='20' height='3' rx='1' fill='#CBD5E1'/><rect y='39' width='40' height='9' rx='2' fill='#1E293B'/>
              </svg>
              <span class="text-xs text-gray-500 mt-1 block text-center">Default</span>
            </button>
            <button type="button" @click="relCardLayoutRef = 'inline'"
              :class="relCardLayoutRef === 'inline' ? 'border-gray-900 bg-gray-50' : 'border-gray-200 bg-white'"
              class="flex-1 border-2 rounded-lg p-1.5 cursor-pointer transition-colors">
              <svg viewBox='0 0 40 48' fill='none' xmlns='http://www.w3.org/2000/svg' class='w-full'>
                <rect width='40' height='26' rx='2' fill='#E2E8F0'/><rect y='29' width='18' height='3' rx='1' fill='#94A3B8'/><rect x='24' y='29' width='16' height='3' rx='1' fill='#94A3B8'/><rect y='34' width='40' height='9' rx='2' fill='#1E293B'/>
              </svg>
              <span class="text-xs text-gray-500 mt-1 block text-center">Inline</span>
            </button>
            <button type="button" @click="relCardLayoutRef = 'centered'"
              :class="relCardLayoutRef === 'centered' ? 'border-gray-900 bg-gray-50' : 'border-gray-200 bg-white'"
              class="flex-1 border-2 rounded-lg p-1.5 cursor-pointer transition-colors">
              <svg viewBox='0 0 40 48' fill='none' xmlns='http://www.w3.org/2000/svg' class='w-full'>
                <rect width='40' height='26' rx='2' fill='#E2E8F0'/><rect x='6' y='29' width='28' height='3' rx='1' fill='#94A3B8'/><rect x='10' y='34' width='20' height='3' rx='1' fill='#CBD5E1'/><rect y='39' width='40' height='9' rx='2' fill='#1E293B'/>
              </svg>
              <span class="text-xs text-gray-500 mt-1 block text-center">Centered</span>
            </button>
          </div>
        </div>

        <!-- Font weight + Text align -->
        <div class="flex gap-2 mb-2">
          <div class="flex-1">
            <label class="block text-xs text-gray-500 mb-1">Font weight</label>
            <select v-model="relCardFontWeightRef" class="w-full border border-gray-300 text-xs px-2 py-1.5 rounded outline-none bg-white focus:border-gray-500 cursor-pointer">
              <option value="300">Light</option>
              <option value="400">Normal</option>
              <option value="500">Medium</option>
              <option value="600">SemiBold</option>
              <option value="700">Bold</option>
            </select>
          </div>
          <div class="flex-1">
            <label class="block text-xs text-gray-500 mb-1">Text align</label>
            <div class="flex gap-1">
              <button type="button" @click="relCardTextAlignRef = 'left'"
                :class="relCardTextAlignRef === 'left' ? 'border-gray-900 bg-gray-100' : 'border-gray-200 bg-white'"
                class="flex-1 border-2 rounded py-1.5 cursor-pointer transition-colors flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" class="w-3.5 h-3.5 fill-current"><path d="M1 3h14v1H1zm0 3h8v1H1zm0 3h14v1H1zm0 3h8v1H1z"/></svg>
              </button>
              <button type="button" @click="relCardTextAlignRef = 'center'"
                :class="relCardTextAlignRef === 'center' ? 'border-gray-900 bg-gray-100' : 'border-gray-200 bg-white'"
                class="flex-1 border-2 rounded py-1.5 cursor-pointer transition-colors flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" class="w-3.5 h-3.5 fill-current"><path d="M1 3h14v1H1zm3 3h8v1H4zm-3 3h14v1H1zm3 3h8v1H4z"/></svg>
              </button>
              <button type="button" @click="relCardTextAlignRef = 'right'"
                :class="relCardTextAlignRef === 'right' ? 'border-gray-900 bg-gray-100' : 'border-gray-200 bg-white'"
                class="flex-1 border-2 rounded py-1.5 cursor-pointer transition-colors flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" class="w-3.5 h-3.5 fill-current"><path d="M1 3h14v1H1zm6 3h8v1H7zm-6 3h14v1H1zm6 3h8v1H7z"/></svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Card bg + text color -->
        <div class="flex gap-2 mb-2">
          <div class="flex-1">
            <label class="block text-xs text-gray-500 mb-1">Background</label>
            <div class="flex items-center gap-1.5 border border-gray-300 rounded px-2 py-1 bg-white">
              <input v-model="relCardBgRef" type="color" class="w-5 h-5 rounded border-0 cursor-pointer p-0" />
              <span class="text-xs text-gray-600 font-mono">{{ relCardBgRef }}</span>
            </div>
          </div>
          <div class="flex-1">
            <label class="block text-xs text-gray-500 mb-1">Text color</label>
            <div class="flex items-center gap-1.5 border border-gray-300 rounded px-2 py-1 bg-white">
              <input v-model="relCardTextColorRef" type="color" class="w-5 h-5 rounded border-0 cursor-pointer p-0" />
              <span class="text-xs text-gray-600 font-mono">{{ relCardTextColorRef }}</span>
            </div>
          </div>
        </div>

        <!-- Font size + border radius -->
        <div class="flex gap-2 mb-2">
          <div class="flex-1">
            <label class="block text-xs text-gray-500 mb-1">Font size</label>
            <div class="flex items-center border border-gray-300 rounded bg-white">
              <input v-model.number="relCardFontSizeRef" type="number" min="10" max="32" class="w-full text-xs px-2 py-1.5 outline-none bg-transparent" />
              <span class="text-xs text-gray-400 pr-2">px</span>
            </div>
          </div>
          <div class="flex-1">
            <label class="block text-xs text-gray-500 mb-1">Border radius</label>
            <div class="flex items-center border border-gray-300 rounded bg-white">
              <input v-model.number="relCardBorderRadiusRef" type="number" min="0" max="50" class="w-full text-xs px-2 py-1.5 outline-none bg-transparent" />
              <span class="text-xs text-gray-400 pr-2">px</span>
            </div>
          </div>
        </div>

        <!-- Box shadow -->
        <div class="mb-2">
          <label class="block text-xs text-gray-500 mb-1">Box shadow</label>
          <select v-model="relCardShadowRef" class="w-full border border-gray-300 text-xs px-2 py-1.5 rounded outline-none bg-white focus:border-gray-500 cursor-pointer">
            <option value="none">None</option>
            <option value="shadow-sm">sm</option>
            <option value="shadow-md">md</option>
            <option value="shadow-lg">lg</option>
            <option value="shadow-xl">xl</option>
          </select>
        </div>

        <!-- Margin + Padding -->
        <div class="flex gap-2 mb-3">
          <div class="flex-1">
            <label class="block text-xs text-gray-500 mb-1">Margin</label>
            <div class="flex items-center border border-gray-300 rounded bg-white">
              <input v-model.number="relCardMarginRef" type="number" min="0" max="50" class="w-full text-xs px-2 py-1.5 outline-none bg-transparent" />
              <span class="text-xs text-gray-400 pr-2">px</span>
            </div>
          </div>
          <div class="flex-1">
            <label class="block text-xs text-gray-500 mb-1">Padding</label>
            <div class="flex items-center border border-gray-300 rounded bg-white">
              <input v-model.number="relCardPaddingRef" type="number" min="0" max="50" class="w-full text-xs px-2 py-1.5 outline-none bg-transparent" />
              <span class="text-xs text-gray-400 pr-2">px</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Button ──────────────────────────────────────────────────────── -->
      <div class="w-full border-t border-gray-200 my-4"></div>
      <div class="px-1">
        <p class="font-medium text-sm mb-3">Button</p>

        <!-- Button text -->
        <div class="mb-2">
          <label class="block text-xs text-gray-500 mb-1">Button text</label>
          <input v-model="relBtnTextRef" type="text" class="w-full border border-gray-300 text-xs px-2 py-1.5 rounded outline-none focus:border-gray-500 bg-white" />
        </div>

        <!-- Card Subtitle -->
        <div class="mb-3">
          <div class="flex items-center justify-between mb-1">
            <label class="text-xs text-gray-500">Card Subtitle</label>
            <label class="flex items-center gap-1 cursor-pointer">
              <input type="checkbox" v-model="relCardSubtitleEnabledRef" class="cursor-pointer" />
              <span class="text-xs text-gray-400">Show</span>
            </label>
          </div>
          <input v-if="relCardSubtitleEnabledRef" v-model="relCardSubtitleRef" type="text" maxlength="50"
            placeholder="e.g. Available in 3 colors"
            class="w-full border border-gray-300 text-xs px-2 py-1.5 rounded outline-none focus:border-gray-500 bg-white" />
          <p v-if="relCardSubtitleEnabledRef" class="text-right text-xs text-gray-400 mt-0.5">{{ relCardSubtitleRef.length }}/50</p>
        </div>

        <!-- Button colors + radius -->
        <div class="flex gap-2 mb-2">
          <div class="flex-1">
            <label class="block text-xs text-gray-500 mb-1">Background</label>
            <div class="flex items-center gap-1.5 border border-gray-300 rounded px-2 py-1 bg-white">
              <input v-model="relBtnBgRef" type="color" class="w-5 h-5 rounded border-0 cursor-pointer p-0" />
              <span class="text-xs text-gray-600 font-mono">{{ relBtnBgRef }}</span>
            </div>
          </div>
          <div class="flex-1">
            <label class="block text-xs text-gray-500 mb-1">Text color</label>
            <div class="flex items-center gap-1.5 border border-gray-300 rounded px-2 py-1 bg-white">
              <input v-model="relBtnColorRef" type="color" class="w-5 h-5 rounded border-0 cursor-pointer p-0" />
              <span class="text-xs text-gray-600 font-mono">{{ relBtnColorRef }}</span>
            </div>
          </div>
        </div>
        <div class="mb-3">
          <label class="block text-xs text-gray-500 mb-1">Border radius</label>
          <div class="flex items-center border border-gray-300 rounded bg-white">
            <input v-model.number="relBtnBorderRadiusRef" type="number" min="0" max="50" class="w-full text-xs px-2 py-1.5 outline-none bg-transparent" />
            <span class="text-xs text-gray-400 pr-2">px</span>
          </div>
        </div>
      </div>
    </div>
  </template>
</template>
