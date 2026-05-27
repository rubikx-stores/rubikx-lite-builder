import { computed } from 'vue'
import { usePageBuilderStateStore } from '@myissue/vue-website-page-builder'
import { useBlockRegistry } from './useBlockRegistry'

export type SidebarMode = 'none' | 'block' | 'element'

export function useEditorSidebar() {
  const store = usePageBuilderStateStore() as any
  const registry = useBlockRegistry()

  const selectedEl = computed<HTMLElement | null>(() => (store.getElement as HTMLElement | null) ?? null)

  const selectedBlockTitle = computed<string | null>(() => {
    const el = selectedEl.value
    if (!el) return null
    const section = el.closest('[data-component-title]')
    return section?.getAttribute('data-component-title') ?? null
  })

  const mode = computed<SidebarMode>(() => {
    if (!selectedEl.value) return 'none'
    if (selectedBlockTitle.value && registry.hasConfig(selectedBlockTitle.value)) return 'block'
    return 'element'
  })

  const blockConfig = computed(() => {
    if (!selectedBlockTitle.value) return null
    return registry.getConfig(selectedBlockTitle.value)
  })

  const blockData = computed(() => {
    if (!selectedBlockTitle.value) return null
    return registry.getData(selectedBlockTitle.value)
  })

  const selectedTag = computed<string>(() => {
    if (mode.value === 'block') return selectedBlockTitle.value ?? ''
    return selectedEl.value?.tagName?.toLowerCase() ?? 'element'
  })

  function closeEditor() {
    store.setElement(null)
  }

  async function _syncBuilder() {
    const { getPageBuilder } = await import('@myissue/vue-website-page-builder')
    const builder = getPageBuilder() as any
    builder.syncDomToStoreOnly()
    builder.saveDomComponentsToLocalStorage()
  }

  async function _syncBuilderWithListeners() {
    const { getPageBuilder } = await import('@myissue/vue-website-page-builder')
    const builder = getPageBuilder() as any
    await builder.addListenersToEditableElements()
    builder.syncDomToStoreOnly()
    builder.saveDomComponentsToLocalStorage()
  }

  async function updateBlockField(key: string, value: any) {
    const title = selectedBlockTitle.value
    if (!title || !blockConfig.value) return
    registry.setData(title, key, value)
    await _applyBlockRender(title)
  }

  async function updateBlockListItem(listKey: string, index: number, itemKey: string, value: any) {
    const title = selectedBlockTitle.value
    if (!title || !blockConfig.value) return
    registry.setListItem(title, listKey, index, itemKey, value)
    await _applyBlockRender(title)
  }

  async function addBlockListItem(listKey: string, template: Record<string, any>) {
    const title = selectedBlockTitle.value
    if (!title || !blockConfig.value) return
    registry.addListItem(title, listKey, template)
    await _applyBlockRender(title)
  }

  async function removeBlockListItem(listKey: string, index: number) {
    const title = selectedBlockTitle.value
    if (!title || !blockConfig.value) return
    registry.removeListItem(title, listKey, index)
    await _applyBlockRender(title)
  }

  async function _applyBlockRender(title: string) {
    const config = registry.getConfig(title)
    const data = registry.getData(title)
    if (!config || !data) return

    const newHtml = config.render(data)
    const el = selectedEl.value
    if (!el) return

    const section = el.closest('section[data-componentid]') as HTMLElement | null
    if (!section) return

    const parser = new DOMParser()
    const doc = parser.parseFromString(newHtml, 'text/html')
    const newSection = doc.querySelector('section')
    if (!newSection) return

    section.innerHTML = newSection.innerHTML
    await _syncBuilderWithListeners()
  }

  async function updateElementStyle(prop: string, value: string) {
    const el = selectedEl.value
    if (!el) return
    ;(el.style as any)[prop] = value
    await _syncBuilder()
  }

  async function updateElementClass(cls: string, add: boolean) {
    const el = selectedEl.value
    if (!el) return
    if (add) el.classList.add(cls)
    else el.classList.remove(cls)
    await _syncBuilder()
  }

  async function addLink(url: string, newTab: boolean) {
    const el = selectedEl.value
    if (!el) return
    const existing = el.closest('a') as HTMLAnchorElement | null
    if (existing) {
      existing.href = url
      newTab ? (existing.target = '_blank') : existing.removeAttribute('target')
    } else {
      const a = document.createElement('a')
      a.href = url
      if (newTab) a.target = '_blank'
      el.parentNode?.insertBefore(a, el)
      a.appendChild(el)
    }
    store.setElement(el)
    await _syncBuilder()
  }

  async function removeLink() {
    const el = selectedEl.value
    if (!el) return
    const a = el.closest('a')
    if (!a || !a.parentNode) return
    a.parentNode.insertBefore(el, a)
    a.parentNode.removeChild(a)
    store.setElement(el)
    await _syncBuilder()
  }

  async function openGlobalPageStyles() {
    const { getPageBuilder } = await import('@myissue/vue-website-page-builder')
    const builder = getPageBuilder() as any
    await builder.globalPageStyles()
  }

  return {
    selectedEl,
    selectedBlockTitle,
    mode,
    blockConfig,
    blockData,
    selectedTag,
    updateBlockField,
    updateBlockListItem,
    addBlockListItem,
    removeBlockListItem,
    updateElementStyle,
    updateElementClass,
    addLink,
    removeLink,
    closeEditor,
    openGlobalPageStyles,
  }
}
