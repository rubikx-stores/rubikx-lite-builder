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

let saveInFlight = false
let _destroyed = false
let _saveBtn: Element | null = null

async function handleSaveClick() {
  if (saveInFlight || !props.pageId) return
  saveInFlight = true

  try {
    console.log('[CMS] Save triggered')

    // Allow the builder's handleManualSave to flush saveDomComponentsToLocalStorage first
    await new Promise<void>((resolve) => setTimeout(resolve, 500))

    const builder = getPageBuilder() as any
    const html = builder.getSavedPageHtml()
    if (!html) return

    const payload = {
      key: props.pageId,
      value: html,
      updatedBy: 'editor',
      updatedOn: new Date().toISOString(),
      version: 'v1',
      state: 'draft' as const,
    }

    console.log('[CMS] Payload:', payload)

    const response = await $fetch('/api/proxy/odoo/cms', {
      method: 'POST',
      body: payload,
    })
    console.log('[CMS] Save success:', response)
    await navigateTo('/')
  } catch (error) {
    console.error('[CMS] Save error:', error)
  } finally {
    saveInFlight = false
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

    try {
      const { html } = await $fetch<{ html: string | null }>('/api/cms-version', {
        query: { key: props.pageId },
      })

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
        // No saved content in Odoo — start with a blank canvas
        localStorage.removeItem(storageKey)
      }
    } catch (err) {
      console.error('[CMS] Failed to load page HTML:', err)
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
  </div>
</template>
