<script setup lang="ts">
import { PageBuilder, getPageBuilder } from '@myissue/vue-website-page-builder'
import type { PageBuilderConfig } from '@myissue/vue-website-page-builder'
import BuilderPanel from './BuilderPanel.client.vue'
import EditorSidebar from './EditorSidebar.client.vue'
import { productImageSrc } from '~/composables/useProductImageSrc'
import { NAVBAR_TITLES, FOOTER_TITLES } from '~/composables/useGlobalSections'

// Register all block configs eagerly on builder mount so the editor opens
// correctly even on page reload with saved canvas data (before the user opens
// the Add-Component modal where BuilderPanel would register them again).
useThemes()
useLayouts()

const props = defineProps<{
  pageId?: string
  pageName?: string
  pageVersion?: number
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

    const navbarSections = allSections.filter(s =>
      NAVBAR_TITLES.includes(s.getAttribute('data-component-title') ?? '')
    )
    const footerSections = allSections.filter(s =>
      FOOTER_TITLES.includes(s.getAttribute('data-component-title') ?? '')
    )
    const contentSections = allSections.filter(s =>
      !navbarSections.includes(s) && !footerSections.includes(s)
    )

    const toHtml = (secs: Element[]) => secs.map(s => s.outerHTML).join('\n')
    const version = String(selectedVersion.value)
    const baseBody = { updatedBy: 'editor', updatedOn: new Date().toISOString(), state: 'draft' as const, version }

    const saves: Promise<any>[] = []

    if (navbarSections.length > 0) {
      saves.push($fetch('/api/proxy/odoo/cms', {
        method: 'POST',
        body: { ...baseBody, key: 'global-header', value: toHtml(navbarSections) },
      }))
    }

    if (contentSections.length > 0) {
      saves.push($fetch('/api/proxy/odoo/cms', {
        method: 'POST',
        body: { ...baseBody, key: props.pageId, value: toHtml(contentSections) },
      }))
    }

    if (footerSections.length > 0) {
      saves.push($fetch('/api/proxy/odoo/cms', {
        method: 'POST',
        body: { ...baseBody, key: 'global-footer', value: toHtml(footerSections) },
      }))
    }

    if (saves.length === 0) {
      console.warn('[CMS] Nothing to save — canvas is empty')
      showVersionModal.value = false
      await navigateTo('/')
      return
    }

    await Promise.all(saves)
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
      const btn = document.querySelector('#pagebuilder-navbar .pbx-mySecondaryButton')
      if (btn) { resolve(btn); return }
      requestAnimationFrame(check)
    }
    requestAnimationFrame(check)
  })
}

// ── Mega-menu product tile click → product detail panel ──────────────────────
function handleProductTileClick(e: MouseEvent) {
  const tile = (e.target as Element).closest('.pbx-ptile') as HTMLAnchorElement | null
  if (!tile) return
  e.preventDefault()
  e.stopPropagation()

  const section = tile.closest('section')
  const panel   = section?.querySelector<HTMLElement>('.pbx-pd')
  if (!panel) return

  const rawImg = tile.getAttribute('data-img') ?? ''
  const name  = tile.querySelector<HTMLElement>('.pbx-ptile-name')?.textContent?.trim() ?? ''
  const price = tile.querySelector<HTMLElement>('.pbx-ptile-price')?.textContent?.trim() ?? ''

  panel.innerHTML = `
    <div style="display:grid;grid-template-columns:45% 55%;height:480px;position:relative;">
      <div id="pbx-pd-imgcol" style="overflow:hidden;background:#f3f4f6;"></div>
      <div style="padding:52px 56px;display:flex;flex-direction:column;justify-content:center;background:#fff;">
        <div style="font-size:10px;font-weight:700;color:#9ca3af;letter-spacing:.14em;text-transform:uppercase;margin-bottom:16px;">Featured Product</div>
        <div style="font-size:30px;font-weight:800;color:#111827;line-height:1.2;margin-bottom:14px;">${name}</div>
        <div style="font-size:24px;font-weight:600;color:#374151;margin-bottom:32px;">${price}</div>
        <a href="${tile.href}" style="display:inline-block;padding:14px 32px;background:#111827;color:#fff;text-decoration:none;border-radius:8px;font-size:15px;font-weight:600;letter-spacing:.02em;">View Product →</a>
      </div>
      <button onclick="this.closest('.pbx-pd').style.display='none'"
        style="position:absolute;top:14px;right:16px;background:rgba(255,255,255,.9);border:1px solid #e5e7eb;border-radius:50%;width:32px;height:32px;cursor:pointer;font-size:18px;color:#6b7280;line-height:1;display:flex;align-items:center;justify-content:center;">×</button>
    </div>`

  const imgSrc = productImageSrc(rawImg)
  if (imgSrc) {
    const imgCol = panel.querySelector<HTMLElement>('#pbx-pd-imgcol')
    if (imgCol) {
      const img = document.createElement('img')
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;'
      img.src = imgSrc
      imgCol.appendChild(img)
    }
  }

  panel.style.display = 'block'
  panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
}

onUnmounted(() => {
  _destroyed = true
  _saveBtn?.removeEventListener('click', handleSaveClick)
  document.removeEventListener('click', handleProductTileClick, true)
})

onMounted(async () => {
  const builder = getPageBuilder()
  let parsedComponents: any[] | undefined = undefined

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

    const html = [headerHtml, contentHtml, footerHtml].filter(Boolean).join('\n') || null

    if (html) {
      const parsed = (builder as any).parsePageBuilderHTML(html)
      parsedComponents = parsed.components
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          components: parsed.components,
          pageBuilderContentSavedAt: new Date().toISOString(),
          pageSettings: { classes: parsed.pageSettings?.classes ?? '', style: '' },
        }),
      )
    } else {
      localStorage.removeItem(storageKey)
    }
  }

  await builder.startBuilder(config, parsedComponents)

  // The builder wraps sections in a container that has overflow-x:scroll, which
  // CSS spec forces overflow-y from 'visible' to 'auto'. Any overflow value other
  // than 'visible' on an ancestor creates an overflow context that intercepts
  // position:sticky, so sticky sections never reach the real scroll container
  // (#page-builder-wrapper). Fix: walk from #pagebuilder up to the wrapper and
  // clear overflow on every intermediate element.
  const pagebuilderEl = document.getElementById('pagebuilder')
  const wrapperEl = document.getElementById('page-builder-wrapper')
  if (pagebuilderEl && wrapperEl) {
    let el = pagebuilderEl.parentElement
    while (el && el !== wrapperEl) {
      el.style.overflow = 'visible'
      el = el.parentElement
    }
  }

  _saveBtn = await waitForSaveButton()
  _saveBtn.addEventListener('click', handleSaveClick)

  // Capture-phase so we intercept before the builder's own click handler
  document.addEventListener('click', handleProductTileClick, true)
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
