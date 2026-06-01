<script setup lang="ts">
import { PageBuilder, getPageBuilder } from '@myissue/vue-website-page-builder'
import type { PageBuilderConfig } from '@myissue/vue-website-page-builder'
import BuilderPanel from './BuilderPanel.client.vue'
import EditorSidebar from './EditorSidebar.client.vue'

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
  resourceData: props.pageId ? { title: props.pageId, id: props.pageId } : null,
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
    await $fetch('/api/proxy/odoo/cms', {
      method: 'POST',
      body: {
        key: props.pageId,
        value: _pendingHtml,
        updatedBy: 'editor',
        updatedOn: new Date().toISOString(),
        version: String(selectedVersion.value),
        state: 'draft' as const,
      },
    })
    showVersionModal.value = false
    await navigateTo('/')
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

onUnmounted(() => {
  _destroyed = true
  _saveBtn?.removeEventListener('click', handleSaveClick)
})

onMounted(async () => {
  const builder = getPageBuilder()

  if (props.pageId) {
    const storageKey = `page-builder-update-resource-page-${sanitize(props.pageId)}`
    const pageHtmlCache = usePageHtmlCache()
    const html = pageHtmlCache.value[props.pageId] ?? null

    if (html) {
      const parsed = builder.parsePageBuilderHTML(html)
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

  await builder.startBuilder(config)

  _saveBtn = await waitForSaveButton()
  _saveBtn.addEventListener('click', handleSaveClick)
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
