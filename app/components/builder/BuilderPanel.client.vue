<script setup lang="ts">
import { nextTick, ref, computed } from 'vue'
import componentHelpers from '#lib/componentHelpers'
import componentData from '#lib/component'
import themesData from '#lib/themes'
import { getPageBuilder, usePageBuilderModal, usePageBuilderStateStore } from '@myissue/vue-website-page-builder'
import { NAVBAR_TITLES, FOOTER_TITLES } from '~/composables/useGlobalSections'
import { hydrateComponents } from '~/plugins/rubikx-hydration.client'
import { FONT_FAMILY_OPTIONS } from '~/composables/editor/fontFields'

const selectedCompanyId = useState<number | null>('selectedCompanyId')

const { themeRegistry, applyTheme } = useThemes()
const { layoutComponentRegistry } = useLayouts()
const { closeAddComponentModal } = usePageBuilderModal()
const { applyBlockRender, applyFontToAllBlocks } = useEditorSidebar()
const blockRegistry = useBlockRegistry()

const isLoading = ref(false)
const selectedTab = ref<'Components' | 'Themes' | 'Settings'>('Components')
const selectedCategory = ref('All')
const selectedThemeCategory = ref('All')
// Not a hydrated ref — derived from each block's own fontFamily field so it
// stays correct across modal close/reopen and page reload without a second,
// separately-persisted "page font" value that could drift out of sync.
const globalFont = computed<string>({
  get() {
    if (typeof document === 'undefined') return ''
    let value: string | null = null
    let mixed = false
    document.querySelectorAll<HTMLElement>('section[data-component-title][data-componentid]').forEach((sec) => {
      if (mixed) return
      const id = sec.getAttribute('data-componentid')
      const title = sec.getAttribute('data-component-title')
      if (!id || !title || !blockRegistry.hasConfig(title)) return
      // Don't assume something else has already registered this block — on a
      // freshly opened/published page nothing may have read it yet, and
      // treating "unregistered" as blank is what made this dropdown show
      // Default even though the real value is sitting right on the section's
      // data-component-props. Register it from there on the spot if needed.
      if (!blockRegistry.getData(id)) {
        const rawProps = sec.getAttribute('data-component-props')
        let props: Record<string, any> | undefined
        try { if (rawProps) props = JSON.parse(decodeURIComponent(rawProps)) } catch {}
        blockRegistry.registerInstance(id, title, props)
      }
      const font = (blockRegistry.getData(id)?.fontFamily as string) ?? ''
      if (value === null) value = font
      else if (value !== font) mixed = true
    })
    return mixed ? '' : (value ?? '')
  },
  set(value: string) {
    applyFontToAllBlocks(value)
  },
})

const categories = computed(() => {
  const libCats = componentData[0]?.components?.data?.map((c) => c.category) ?? []
  // Custom layout categories (Header, etc.) come first so they're easy to find
  const customCats = Object.keys(layoutComponentRegistry)
  return ['All', ...customCats, ...new Set(libCats)]
})

const filteredComponents = computed(() => {
  const libData = componentData[0]?.components?.data ?? []
  // Merge custom layout components + library components into one list
  const customItems = Object.values(layoutComponentRegistry).flat()
  const all = [...customItems, ...libData]
  return selectedCategory.value === 'All'
    ? all
    : all.filter((c) => c.category === selectedCategory.value)
})

const themeCategories = computed(() => {
  const registryCats = Object.values(themeRegistry).map(t => t.meta.category)
  const libCats = themesData[0]?.themes?.data?.map((t) => t.category) ?? []
  return ['All', ...new Set([...registryCats, ...libCats])]
})

const filteredRegistryThemes = computed(() => {
  const entries = Object.entries(themeRegistry)
  if (selectedThemeCategory.value === 'All') return Object.fromEntries(entries)
  return Object.fromEntries(entries.filter(([, t]) => t.meta.category === selectedThemeCategory.value))
})

const filteredLibThemes = computed(() => {
  const data = themesData[0]?.themes?.data ?? []
  if (selectedThemeCategory.value === 'All') return data
  return data.filter((t) => t.category === selectedThemeCategory.value)
})

const _PRODUCT_IDS_BLOCK_TITLES = new Set(['Ru1-Product Detail', 'Ru2-Product Detail', 'Ru3-Product Detail'])
const _PRODUCT_BLOCK_TITLES = new Set([
  'Ru1-Product Detail', 'Ru2-Product Detail', 'Ru3-Product Detail',
  'Ru1 Homepage Featured Products', 'Ru1 Shop Content', 'Ru2 Shop Products', 'Ru3 Shop Products',
])

function _pdImgSrc(image: any): string {
  if (!image) return ''
  if (typeof image === 'string') {
    if (image.startsWith('data:') || image.startsWith('http') || image.startsWith('/')) return image
    const mime = image.startsWith('/9j/') ? 'image/jpeg' : 'image/png'
    return `data:${mime};base64,${image}`
  }
  if (image?.file_data) return `data:${image.type || 'image/png'};base64,${image.file_data}`
  return ''
}

async function _autoLoadProductsOnAdd(title: string, companyId: number | null) {
  const res = await fetch(`/api/products${companyId ? `?companyId=${companyId}` : ''}`)
  if (!res.ok) return
  const prods: any[] = await res.json()
  if (!prods?.length) return

  await nextTick()
  const sectionEl = document.querySelector(`section[data-component-title="${CSS.escape(title)}"]`) as HTMLElement | null
  const compId = sectionEl?.getAttribute('data-componentid')
  if (!compId) return

  const curr = (blockRegistry.getData(compId) as any)?.currency || '$'

  if (_PRODUCT_IDS_BLOCK_TITLES.has(title)) {
    const first = prods[0]
    const img = _pdImgSrc(first.image)
    blockRegistry.setData(compId, 'mainImageSrc', img)
    blockRegistry.setData(compId, 'thumbImageSrcs', img ? [img] : [])
    blockRegistry.setData(compId, '_productName', first.name ?? '')
    blockRegistry.setData(compId, '_productPriceNum', Number(first.price) || 0)
    blockRegistry.setData(compId, '_productColors',
      Array.isArray(first.colors) && first.colors.length
        ? first.colors.map((c: any) => ({ htmlColor: c.htmlColor || '', name: c.name || '' }))
        : []
    )
    blockRegistry.setData(compId, '_autoLoadProductId', String(first.id))
  } else {
    const defaultCount = ((blockRegistry.getData(compId) as any)?.products?.length) || 4
    const mapped = prods.slice(0, defaultCount).map((p: any, i: number) => ({
      id: p.id,
      imageUrl: _pdImgSrc(p.image),
      name: p.name ?? `Product ${i + 1}`,
      price: `${curr}${Number(p.price || 0).toFixed(2)}`,
      oldPrice: '',
      buttonLabel: 'Add to Cart',
      buttonUrl: '/shop',
      colors: Array.isArray(p.colors) && p.colors.length
        ? p.colors.map((c: any) => c.htmlColor || '').filter(Boolean).join(', ')
        : '#FF0000, #0000FF',
    }))
    blockRegistry.setData(compId, 'products', mapped)
  }

  await nextTick()
  await applyBlockRender(title)
  await nextTick()
  hydrateComponents(selectedCompanyId.value ?? undefined)
}

async function handleDropComponent(comp: { id: string | number | null; html_code: string; title: string }) {
  isLoading.value = true
  try {
    const store = usePageBuilderStateStore() as any

    const allSections = Array.from(document.querySelectorAll('section[data-component-title]'))
    const headerIndex = allSections.findIndex(s => NAVBAR_TITLES.includes(s.getAttribute('data-component-title') ?? ''))
    const footerIndex = allSections.findIndex(s => FOOTER_TITLES.includes(s.getAttribute('data-component-title') ?? ''))

    const currentMethod = store.getComponentArrayAddMethod
    const currentIndex = store.getAddComponentAddIndex ?? 0
    const minIndex = headerIndex !== -1 ? headerIndex + 1 : 0
    const maxIndex = footerIndex !== -1 ? footerIndex : allSections.length

    console.log('[ADD] method:', currentMethod, 'headerIndex:', headerIndex, 'footerIndex:', footerIndex, 'currentIndex:', currentIndex, 'minIndex:', minIndex, 'maxIndex:', maxIndex)

    let methodOverridden = false

    if (headerIndex !== -1 || footerIndex !== -1) {
      if (currentMethod === 'unshift') {
        store.setComponentArrayAddMethod('insert')
        store.setAddComponentAddIndex(minIndex)
        methodOverridden = true
        await nextTick()
      } else if (currentMethod === 'push') {
        store.setComponentArrayAddMethod('insert')
        store.setAddComponentAddIndex(maxIndex)
        methodOverridden = true
        await nextTick()
      } else {
        const clampedIndex = Math.min(Math.max(currentIndex, minIndex), maxIndex)
        if (clampedIndex !== currentIndex) {
          store.setAddComponentAddIndex(clampedIndex)
          await nextTick()
        }
      }
    }

    await getPageBuilder().addComponent(comp)

    // Restore original method if we overrode it
    if (methodOverridden) {
      store.setComponentArrayAddMethod(currentMethod)
    }

    if (comp.title && blockRegistry.hasConfig(comp.title)) {
      blockRegistry.resetToDefaults(comp.title)
      await nextTick()
      await applyBlockRender(comp.title)
    }

    // Hydrate dynamic components after adding new component
    await nextTick()
    hydrateComponents(selectedCompanyId.value ?? undefined)
  } catch (e) {
    console.error('[ADD] Error:', e)
  } finally {
    closeAddComponentModal()
    isLoading.value = false
  }
}

async function handleDropLibTheme(html_code: string) {
  isLoading.value = true
  const { getPageBuilder: getPB } = await import('@myissue/vue-website-page-builder')
  await (getPB() as any).addTheme(html_code)
  closeAddComponentModal()
  isLoading.value = false
}

async function handleApplyTheme(themeId: string) {
  isLoading.value = true
  await applyTheme(themeId)
  const theme = themeRegistry[themeId]
  if (theme) {
    await nextTick()
    for (const section of theme.sections) {
      if (
        blockRegistry.hasConfig(section.title) &&
        !NAVBAR_TITLES.includes(section.title) &&
        !FOOTER_TITLES.includes(section.title)
      ) {
        blockRegistry.resetToDefaults(section.title)
        await applyBlockRender(section.title)
      }
    }
  }
  // Hydrate dynamic components (CartBadge, AuthState, CategoryNav, etc.)
  // after all theme sections are in the DOM — same as handleAddComponent does.
  await nextTick()
  hydrateComponents(selectedCompanyId.value ?? 3)

  closeAddComponentModal()
  isLoading.value = false
}
</script>

<template>
  <div>
    <template v-if="isLoading">
      <div class="min-h-[90vh] h-[90vh]">
        <div class="flex items-center justify-center">
          <div
            class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
          >
            <span
              class="!absolute !m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
            >Loading...</span>
          </div>
        </div>
      </div>
    </template>

    <div v-if="!isLoading">
      <!-- Tab selector -->
      <div
        class="mb-4 flex jusitify-left items-center gap-2 border-0 border-solid border-b border-gray-200 pb-4 overflow-auto"
      >
        <button
          v-for="tab in ['Components', 'Themes', 'Settings']"
          :key="tab"
          class="inline-flex min-h-[3rem] cursor-pointer items-center justify-center gap-1 whitespace-nowrap rounded-full border border-transparent py-3 font-medium shadow-sm text-xs px-4"
          :class="[
            selectedTab === tab
              ? 'bg-myPrimaryLinkColor text-white hover:bg-myPrimaryLinkColor hover:text-white'
              : 'bg-[#dee6f0] text-gray-900 hover:bg-myPrimaryLinkColor hover:text-white',
          ]"
          @click="selectedTab = tab as 'Components' | 'Themes' | 'Settings'"
        >
          <span>
            <svg fill="currentColor" height="22" viewBox="0 0 22 22" width="22" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 7.23V4h3.23v3.23H4zM9.385 7.23V4h3.23v3.23h-3.23zM14.77 4v3.23H18V4h-3.23zM4 12.615v-3.23h3.23v3.23H4zM9.385 9.385v3.23h3.23v-3.23h-3.23zM14.77 12.615v-3.23H18v3.23h-3.23zM4 14.77V18h3.23v-3.23H4zM9.385 18v-3.23h3.23V18h-3.23zM14.77 14.77V18H18v-3.23h-3.23z" />
            </svg>
          </span>
          <span>{{ tab }}</span>
        </button>
      </div>

      <!-- ── Settings Tab ── -->
      <template v-if="selectedTab === 'Settings'">
        <div class="mb-8 px-2">
          <h3 class="break-words text-base font-medium text-gray-900 md:text-lg lg:text-xl mb-4">Settings</h3>
          <label class="block text-sm font-medium text-gray-900 mb-2">Set Font For Whole Page</label>
          <select
            v-model="globalFont"
            class="w-full max-w-sm rounded-md border border-gray-300 py-2 px-3 text-sm"
          >
            <option v-for="opt in FONT_FAMILY_OPTIONS" :key="opt" :value="opt">{{ opt || 'Default' }}</option>
          </select>
          <p class="text-xs text-gray-500 mt-2 max-w-sm">
            Applies to every block on this page. A block (or a single field within it) that already has its own font set is left unchanged.
          </p>
        </div>
      </template>

      <!-- ── Themes Tab ── -->
      <template v-if="selectedTab === 'Themes'">
        <div class="mb-8">
          <h3 class="break-words text-base font-medium text-gray-900 md:text-lg lg:text-xl mb-4">Themes</h3>

          <!-- Category filter — General always first -->
          <div
            class="mb-4 flex jusitify-left items-center gap-2 border-0 border-solid border-b border-gray-200 pb-4 overflow-auto"
          >
            <button
              v-for="cat in themeCategories"
              :key="cat"
              class="inline-flex min-h-[3rem] cursor-pointer items-center justify-center gap-1 whitespace-nowrap rounded-full border border-transparent py-3 font-medium shadow-sm text-xs px-4"
              :class="[
                selectedThemeCategory === cat
                  ? 'bg-myPrimaryLinkColor text-white hover:bg-myPrimaryLinkColor hover:text-white'
                  : 'bg-[#dee6f0] text-gray-900 hover:bg-myPrimaryLinkColor hover:text-white',
              ]"
              @click="selectedThemeCategory = cat"
            >
              {{ cat }}
            </button>
          </div>

          <div class="min-h-[96rem]">
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pb-4">

              <!-- Registry themes — filtered by selected category -->
              <template v-if="Object.keys(filteredRegistryThemes).length > 0">
                <div
                  v-for="(theme, id) in filteredRegistryThemes"
                  :key="id"
                  class="border-solid border border-gray-400 overflow-hidden hover:border-myPrimaryLinkColor duration-100 cursor-pointer max-h-[30rem]"
                  @click="handleApplyTheme(String(id))"
                >
                  <div
                    class="overflow-hidden whitespace-pre-line flex-1 h-auto border-0 border-solid border-b border-gray-200 py-2 px-2"
                  >
                    <div
                      class="w-64 h-96 object-cover cursor-pointer bg-white mx-auto flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:object-top"
                      v-html="theme.meta.cover_image"
                    />
                  </div>
                  <div class="p-3">
                    <h4 class="text-sm font-normal text-gray-900 lg:text-base">{{ theme.meta.name }}</h4>
                    <div class="text-xs font-normal text-gray-900 pt-2">{{ theme.meta.description }}</div>
                  </div>
                </div>
              </template>

              <!-- Library themes — shown when any match the selected category -->
              <template v-if="filteredLibThemes.length > 0">
                <div
                  v-for="theme in filteredLibThemes"
                  :key="theme.title"
                  class="border-solid border border-gray-400 overflow-hidden hover:border-myPrimaryLinkColor duration-100 cursor-pointer max-h-[30rem]"
                  @click="handleDropLibTheme(theme.html_code)"
                >
                  <div
                    class="overflow-hidden whitespace-pre-line flex-1 h-auto border-0 border-solid border-b border-gray-200 py-2 px-2"
                  >
                    <div
                      class="w-64 h-96 object-cover cursor-pointer bg-white mx-auto flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:object-top"
                      v-html="theme.cover_image"
                    />
                  </div>
                  <div class="p-3">
                    <h4 class="text-sm font-normal text-gray-900 lg:text-base">{{ theme.title }}</h4>
                    <div class="text-xs font-normal text-gray-900 pt-2">Click to add theme</div>
                  </div>
                </div>
              </template>

            </div>
          </div>
        </div>
      </template>

      <!-- ── Components Tab ── -->
      <template v-if="selectedTab === 'Components'">
        <!-- Helper Components -->
        <div class="mb-8">
          <h3 class="break-words text-base font-medium text-gray-900 md:text-lg lg:text-xl mb-4">Helper Components</h3>
          <div class="px-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div
              v-for="helper in componentHelpers"
              :key="helper.title"
              class="border-solid border border-gray-400 overflow-hidden hover:border-myPrimaryLinkColor duration-100 cursor-pointer max-h-96 p-4"
              @click="handleDropComponent({ id: null, html_code: helper.html_code, title: helper.title })"
            >
              <div class="max-h-72 cursor-pointer object-contain bg-white mx-auto">
                <h4 class="text-base font-medium text-gray-900">{{ helper.title }}</h4>
              </div>
              <div class="text-xs font-normal text-gray-900 pt-2">
                Click to add {{ helper.title.toLowerCase() }} component
              </div>
            </div>
          </div>
        </div>

        <!-- Layout Components -->
        <div class="px-2">
          <h3 class="break-words text-base font-medium text-gray-900 md:text-lg lg:text-xl mb-4">Layout Components</h3>
          <div
            class="mb-4 flex jusitify-left items-center gap-2 border-0 border-solid border-b border-gray-200 pb-4 overflow-auto"
          >
            <button
              v-for="cat in categories"
              :key="cat"
              class="inline-flex min-h-[3rem] cursor-pointer items-center justify-center gap-1 whitespace-nowrap rounded-full border border-transparent py-3 font-medium shadow-sm text-xs px-4"
              :class="[
                selectedCategory === cat
                  ? 'bg-myPrimaryLinkColor text-white hover:bg-myPrimaryLinkColor hover:text-white'
                  : 'bg-[#dee6f0] text-gray-900 hover:bg-myPrimaryLinkColor hover:text-white',
              ]"
              @click="selectedCategory = cat"
            >
              {{ cat }}
            </button>
          </div>
          <div class="min-h-[96rem]">
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pb-4">
              <div
                v-for="comp in filteredComponents"
                :key="comp.title"
                class="border-solid border border-gray-400 overflow-hidden hover:border-myPrimaryLinkColor duration-100 cursor-pointer max-h-96"
                @click="handleDropComponent({ id: null, html_code: comp.html_code, title: comp.title })"
              >
                <div
                  class="overflow-hidden whitespace-pre-line flex-1 h-auto border-0 border-solid border-b border-gray-200 py-2 px-2"
                >
                  <div
                    class="w-64 h-64 object-cover cursor-pointer bg-white mx-auto flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:object-top"
                    v-html="comp.cover_image"
                  />
                </div>
                <div class="p-3">
                  <h4 class="text-sm font-normal text-gray-900 lg:text-base">{{ comp.title }}</h4>
                  <div class="text-xs font-normal text-gray-900 pt-2">Click to add component</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <div>
        <button class="sr-only">Focusable fallback</button>
      </div>
    </div>
  </div>
</template>
