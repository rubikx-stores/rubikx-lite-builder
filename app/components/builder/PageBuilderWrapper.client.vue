<script setup lang="ts">
import { PageBuilder, getPageBuilder } from '@myissue/vue-website-page-builder'
import type { PageBuilderConfig } from '@myissue/vue-website-page-builder'
import BuilderPanel from './BuilderPanel.client.vue'
import EditorSidebar from './EditorSidebar.client.vue'
import { productImageSrc } from '~/composables/useProductImageSrc'
import { NAVBAR_TITLES, FOOTER_TITLES } from '~/composables/useGlobalSections'
import { hydrateComponents } from '~/plugins/rubikx-hydration.client'
import { sharedPageBuilderStore } from '@myissue/vue-website-page-builder'
import { useBlockRegistry } from '~/composables/editor/useBlockRegistry'
import { usePageHtmlCache } from '~/composables/usePageHtmlCache'

// Register all block configs eagerly on builder mount so the editor opens
// correctly even on page reload with saved canvas data (before the user opens
// the Add-Component modal where BuilderPanel would register them again).
useThemes()
useLayouts()

const props = defineProps<{
  pageId?: string
  pageName?: string
  pageVersion?: number
  companyId?: number
}>()

const config: PageBuilderConfig = {
  updateOrCreate: {
    formType: 'update',
    formName: 'page',
  },
  resourceData: props.pageId ? { title: props.pageId, id: props.pageId as any } : null,
}

// Mirrors the builder's internal sanitizeForLocalStorage to compute the key.
// Key format for update+string-id: page-builder-update-resource-{formName}-{title}
const sanitize = (s: string) =>
  s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')

let _destroyed = false
let _saveBtn: Element | null = null
let _pendingHtml: string | null = null

const selectedCompanyId = useState<number | null>('selectedCompanyId')

const showVersionModal = ref(false)
const selectedVersion = ref(1)
const saveInFlight = ref(false)

async function handleSaveClick() {
  if (saveInFlight.value || !props.pageId) return

  // Allow the builder's handleManualSave to flush saveDomComponentsToLocalStorage first
  await new Promise<void>((resolve) => setTimeout(resolve, 500))

  const builder = getPageBuilder() as any
  const html = builder.getSavedPageHtml()
  if (!html) return

  _pendingHtml = html
  selectedVersion.value = props.pageVersion ?? 1
  showVersionModal.value = true
}

async function confirmSave() {
  if (!props.pageId || !_pendingHtml) return
  saveInFlight.value = true
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(_pendingHtml, 'text/html')
    const allSections = Array.from(doc.querySelectorAll('section[data-component-title]'))

    // Re-stamp data-component-props from the live registry on every section.
    // Belt-and-suspenders: even if _applyBlockRender already kept the DOM in sync,
    // this guarantees the saved HTML always carries the exact current field state.
    const { getData } = useBlockRegistry()
    allSections.forEach(sec => {
      const title = sec.getAttribute('data-component-title')
      const componentId = sec.getAttribute('data-componentid')
      if (!title || !componentId) return
      const data = getData(componentId)
      if (data) {
        const { mainImageSrc: _m, thumbImageSrcs: _t, _productName, _productPriceNum, _productColors, ...persistable } = data as any
        sec.setAttribute('data-component-props', encodeURIComponent(JSON.stringify(persistable)))
      }
    })

    const allNavbarSections = allSections.filter(s =>
      NAVBAR_TITLES.includes(s.getAttribute('data-component-title') ?? '')
    )
    const allFooterSections = allSections.filter(s =>
      FOOTER_TITLES.includes(s.getAttribute('data-component-title') ?? '')
    )
    // Keep only the last navbar/footer — prevents double-header when user
    // accidentally has two header blocks on canvas at save time.
    const navbarSections = allNavbarSections.length > 1 ? allNavbarSections.slice(-1) : allNavbarSections
    const footerSections = allFooterSections.length > 1 ? allFooterSections.slice(-1) : allFooterSections
    const contentSections = allSections.filter(s =>
      !navbarSections.includes(s) && !footerSections.includes(s)
    )

    const toHtml = (secs: Element[]) => secs.map(s => s.outerHTML).join('\n')
    const version = String(selectedVersion.value)
    const commonBody = { updatedBy: 'editor', updatedOn: new Date().toISOString(), version, ...(props.companyId ? { companyId: props.companyId } : {}) }
    const globalBody = { ...commonBody, state: 'published' as const }
    const pageBody   = { ...commonBody, state: 'draft' as const }

    const saves: Promise<any>[] = []

    if (navbarSections.length > 0) {
      saves.push($fetch<any>('/api/proxy/odoo/cms', {
        method: 'POST',
        body: { ...globalBody, key: 'global-header', value: toHtml(navbarSections) },
      }))
    }

    if (contentSections.length > 0) {
      saves.push($fetch<any>('/api/proxy/odoo/cms', {
        method: 'POST',
        body: { ...pageBody, key: props.pageId, value: toHtml(contentSections) },
      }))
    }

    if (footerSections.length > 0) {
      saves.push($fetch<any>('/api/proxy/odoo/cms', {
        method: 'POST',
        body: { ...globalBody, key: 'global-footer', value: toHtml(footerSections) },
      }))
    }

    if (saves.length === 0) {
      console.warn('[CMS] Nothing to save — canvas is empty')
      showVersionModal.value = false
      await navigateTo('/')
      return
    }

    await Promise.all(saves)

    // Keep pageHtmlCache in sync so the next editor open uses the freshly saved
    // HTML even if pages.value in index.vue is stale (e.g. global-header was just
    // created for the first time and hasn't propagated to the pages list yet).
    const pageHtmlCache = usePageHtmlCache()
    if (navbarSections.length > 0)  pageHtmlCache.value['global-header'] = toHtml(navbarSections)
    if (contentSections.length > 0) pageHtmlCache.value[props.pageId]    = toHtml(contentSections)
    if (footerSections.length > 0)  pageHtmlCache.value['global-footer'] = toHtml(footerSections)

    showVersionModal.value = false
  } catch (error) {
    console.error('[CMS] Save error:', error)
  } finally {
    saveInFlight.value = false
  }
}

// Polls via rAF until the builder's save button appears in the navbar, then
// attaches a single click listener. Stops polling on unmount.
function waitForSaveButton(): Promise<Element> {
  return new Promise((resolve) => {
    const check = () => {
      if (_destroyed) return
      const btn = document.querySelector('#pagebuilder-navbar button')
      if (btn) { resolve(btn); return }
      requestAnimationFrame(check)
    }
    requestAnimationFrame(check)
  })
}

// ── Mega-menu product tile click → product detail panel ──────────────────────
function handleProductTileClick(e: MouseEvent) {
  const tile = (e.target as Element).closest('.ru-ptile') as HTMLAnchorElement | null
  if (!tile) return
  e.preventDefault()
  e.stopPropagation()

  const section = tile.closest('section')
  const panel   = section?.querySelector<HTMLElement>('.ru-pd')
  if (!panel) return

  const rawImg = tile.getAttribute('data-img') ?? ''
  const name  = tile.querySelector<HTMLElement>('.ru-ptile-name')?.textContent?.trim() ?? ''
  const price = tile.querySelector<HTMLElement>('.ru-ptile-price')?.textContent?.trim() ?? ''

  panel.innerHTML = `
    <div style="display:grid;grid-template-columns:45% 55%;height:480px;position:relative;">
      <div id="ru-pd-imgcol" style="overflow:hidden;background:#f3f4f6;"></div>
      <div style="padding:52px 56px;display:flex;flex-direction:column;justify-content:center;background:#fff;">
        <div style="font-size:10px;font-weight:700;color:#9ca3af;letter-spacing:.14em;text-transform:uppercase;margin-bottom:16px;">Featured Product</div>
        <div style="font-size:30px;font-weight:800;color:#111827;line-height:1.2;margin-bottom:14px;">${name}</div>
        <div style="font-size:24px;font-weight:600;color:#374151;margin-bottom:32px;">${price}</div>
        <a href="${tile.href}" style="display:inline-block;padding:14px 32px;background:#111827;color:#fff;text-decoration:none;border-radius:8px;font-size:15px;font-weight:600;letter-spacing:.02em;">View Product →</a>
      </div>
      <button onclick="this.closest('.ru-pd').style.display='none'"
        style="position:absolute;top:14px;right:16px;background:rgba(255,255,255,.9);border:1px solid #e5e7eb;border-radius:50%;width:32px;height:32px;cursor:pointer;font-size:18px;color:#6b7280;line-height:1;display:flex;align-items:center;justify-content:center;">×</button>
    </div>`

  const imgSrc = productImageSrc(rawImg)
  if (imgSrc) {
    const imgCol = panel.querySelector<HTMLElement>('#ru-pd-imgcol')
    if (imgCol) {
      const img = document.createElement('img')
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;'
      img.src = imgSrc
      imgCol.appendChild(img)
    }
  }

  panel.style.display = 'block'
}

function blockBuilderAnchors(e: MouseEvent) {
  const a = (e.target as Element).closest('#pagebuilder a')
  if (a) e.preventDefault()
}

onUnmounted(() => {
  _destroyed = true
  _saveBtn?.removeEventListener('click', handleSaveClick)
  document.removeEventListener('click', handleProductTileClick, true)
  document.removeEventListener('click', blockBuilderAnchors, true)
})

onMounted(async () => {
  const builder = getPageBuilder() as any
  let parsedComponents: any[] | undefined = undefined
  const savedProps = new Map<string, Record<string, any>>()

  if (props.pageId) {
    const storageKey = `page-builder-update-resource-page-${sanitize(props.pageId)}`
    const pageHtmlCache = usePageHtmlCache()

    let headerHtml = pageHtmlCache.value['global-header'] ?? ''
    let contentHtml = pageHtmlCache.value[props.pageId] ?? ''
    let footerHtml = pageHtmlCache.value['global-footer'] ?? ''

    // Strip navbar and footer from contentHtml to prevent duplication
    // Handles pages saved before the global split existed
    if (contentHtml) {
      const parser = new DOMParser()
      const doc = parser.parseFromString(contentHtml, 'text/html')
      const allSections = Array.from(doc.querySelectorAll('section[data-component-title]'))

      allSections.filter(s =>
        NAVBAR_TITLES.includes(s.getAttribute('data-component-title') ?? '')
      ).forEach(s => s.remove())

      allSections.filter(s =>
        FOOTER_TITLES.includes(s.getAttribute('data-component-title') ?? '')
      ).forEach(s => s.remove())

      contentHtml = Array.from(doc.querySelectorAll('section[data-component-title]'))
        .map(s => s.outerHTML).join('\n')
    }

    // Dedup headerHtml — handles double-header saved before the save-time fix was deployed.
    // If global-header somehow contains two navbar sections, keep only the last one.
    if (headerHtml) {
      const hDoc = new DOMParser().parseFromString(headerHtml, 'text/html')
      const hNavbars = Array.from(hDoc.querySelectorAll('section[data-component-title]'))
        .filter(s => NAVBAR_TITLES.includes(s.getAttribute('data-component-title') ?? ''))
      if (hNavbars.length > 1) {
        hNavbars.slice(0, -1).forEach(s => s.remove())
        headerHtml = Array.from(hDoc.querySelectorAll('section[data-component-title]'))
          .map(s => s.outerHTML).join('\n')
      }
    }

    const html = [headerHtml, contentHtml, footerHtml].filter(Boolean).join('\n') || null

    if (html) {
      const parsed = builder.parsePageBuilderHTML(html)
      parsedComponents = parsed.components
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          components: parsed.components,
          pageBuilderContentSavedAt: new Date().toISOString(),
          pageSettings: { classes: parsed.pageSettings?.classes ?? '', style: '' },
        }),
      )

      // parsePageBuilderHTML assigns a UUID to each section (comp.id) and
      // preserves data-component-props in comp.html_code. We pre-build the
      // savedProps map here so registerInstance (called after startBuilder)
      // can restore each section's exact saved field state.
      // Note: the library strips data-componentid from Odoo-saved HTML, so
      // comp.html_code is the canonical source for both the UUID and the props.
      ;(parsedComponents ?? []).forEach((comp: any) => {
        if (!comp.id) return
        try {
          const m = (comp.html_code as string)?.match(/data-component-props="([^"]*)"/)
          if (m) savedProps.set(comp.id, JSON.parse(decodeURIComponent(m[1])))
        } catch {}
      })
    } else {
      localStorage.removeItem(storageKey)
    }
  }

  await builder.startBuilder(config, parsedComponents)
  // Wait for Vue to flush DOM after the library's reactive state changes
  await nextTick()

  // Register each section as an independent instance. parsedComponents has the
  // UUID (comp.id) that parsePageBuilderHTML assigned, plus the saved props we
  // extracted from comp.html_code above. For a new/empty page parsedComponents
  // is undefined so there's nothing to register yet — the history watcher in
  // useEditorSidebar picks up new blocks as they're added.
  const { registerInstance } = useBlockRegistry()
  ;(parsedComponents ?? []).forEach((comp: any) => {
    const componentId = comp.id
    const title = comp.title as string | undefined
    if (!componentId || !title) return
    registerInstance(componentId, title, savedProps.get(componentId))
  })

  const stopHydrationWatch = watch(
    () => (sharedPageBuilderStore as any).getIsLoadingGlobal,
    (loading) => {
      if (!loading) {
        hydrateComponents(selectedCompanyId.value ?? undefined)
        stopHydrationWatch()
      }
    }
  )

  // The builder wraps sections in a container that has overflow-x:scroll, which
  // CSS spec forces overflow-y from 'visible' to 'auto'. Any overflow value other
  // than 'visible' on an ancestor creates an overflow context that intercepts
  // position:sticky, so sticky sections never reach the real scroll container
  // (#page-builder-wrapper). Fix: walk from #pagebuilder up to the wrapper and
  // clear overflow on every intermediate element.
  function clearBuilderScroll() {
    const pagebuilderEl = document.getElementById('pagebuilder')
    const wrapperEl = document.getElementById('page-builder-wrapper')
    if (pagebuilderEl && wrapperEl) {
      let el = pagebuilderEl.parentElement
      while (el && el !== wrapperEl) {
        el.style.overflow = 'visible'
        el.style.height = 'auto'
        el.style.minHeight = '0'
        el = el.parentElement
      }
    }
  }

  // Run early, then again after the builder UI is fully rendered.
  clearBuilderScroll()

  _saveBtn = await waitForSaveButton()
  _saveBtn.addEventListener('click', handleSaveClick)

  // Second pass: some library elements get their height set reactively after
  // startBuilder resolves — re-applying after the UI is fully settled ensures
  // the 90vh min-height is cleared for all pages.
  clearBuilderScroll()

  // Capture-phase so we intercept before the builder's own click handler
  document.addEventListener('click', handleProductTileClick, true)
  document.addEventListener('click', blockBuilderAnchors, true)
})
</script>

<template>
  <div class="relative h-full overflow-hidden">
    <PageBuilder :CustomBuilderComponents="BuilderPanel" />
    <EditorSidebar />

    <!-- Version picker modal -->
    <Teleport to="body">
      <div
        v-if="showVersionModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      >
        <div class="bg-white rounded-xl shadow-xl w-80 p-6 space-y-5">
          <div>
            <h3 class="text-sm font-semibold text-gray-900">Save as version</h3>
            <p class="mt-1 text-xs text-gray-500">Choose the version number for this save.</p>
          </div>

          <div class="space-y-1">
            <label class="text-xs font-medium text-gray-700">Version</label>
            <input
              v-model.number="selectedVersion"
              type="number"
              min="1"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>

          <div class="flex gap-2 justify-end">
            <button
              class="rounded-lg border border-gray-200 px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              @click="showVersionModal = false"
            >
              Cancel
            </button>
            <button
              :disabled="saveInFlight"
              class="rounded-lg bg-gray-900 px-4 py-2 text-xs font-medium text-white hover:bg-gray-700 disabled:opacity-50 transition-colors"
              @click="confirmSave"
            >
              {{ saveInFlight ? 'Saving…' : 'Save' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
