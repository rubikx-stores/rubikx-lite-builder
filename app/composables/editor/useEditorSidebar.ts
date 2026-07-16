import { computed, watch } from 'vue'
import { usePageBuilderStateStore } from '@myissue/vue-website-page-builder'
import { useBlockRegistry } from './useBlockRegistry'

export type SidebarMode = 'none' | 'block' | 'element'

// When the user applies styles via the element editor while inside a registered
// block, _applyBlockRender() replaces section.innerHTML and wipes those styles.
// We record every user-applied property here and re-apply after each re-render.
//
// Key 1: componentId  Key 2: stable element key  Value: { cssProp → value }
const _elementOverrides = new Map<string, Map<string, Record<string, string>>>()

function _getElementKey(el: HTMLElement, section: HTMLElement): string | null {
  const fieldKey = el.getAttribute('data-field-key')
  if (fieldKey) return `key:${fieldKey}`
  const indices: number[] = []
  let cur: Element = el
  while (cur !== section) {
    const parent = cur.parentElement
    if (!parent) return null
    indices.unshift(Array.from(parent.children).indexOf(cur))
    cur = parent
  }
  return `idx:${indices.join(',')}`
}

function _getElementByKey(key: string, section: HTMLElement): HTMLElement | null {
  if (key.startsWith('key:')) {
    return section.querySelector(`[data-field-key="${key.slice(4)}"]`) as HTMLElement | null
  }
  if (key.startsWith('idx:')) {
    const indices = key.slice(4).split(',').map(Number)
    let cur: Element = section
    for (const idx of indices) {
      cur = cur.children[idx]
      if (!cur) return null
    }
    return cur as HTMLElement
  }
  return null
}

export function useEditorSidebar() {
  const store = usePageBuilderStateStore() as any
  const registry = useBlockRegistry()

  // Sync inline edits and undo/redo into per-instance registry state.
  // Also auto-registers new blocks dropped during editing.
  watch(
    () => store.getHistoryIndex,
    () => {
      if (typeof document === 'undefined') return
      document.querySelectorAll<HTMLElement>('section[data-component-title][data-componentid]').forEach((sec) => {
        const title = sec.getAttribute('data-component-title')!
        const componentId = sec.getAttribute('data-componentid')!
        if (!registry.hasConfig(title)) return

        if (!registry.getData(componentId)) {
          // Register from this section's live data-component-props (the block's
          // actual saved field values) so blocks loaded from a saved/published
          // page keep their real data instead of being seeded with blank
          // defaults — registerInstance() no-ops on every later registration
          // attempt for this componentId once it's been called once, so
          // whichever call wins first must carry the real props.
          const rawProps = sec.getAttribute('data-component-props')
          let props: Record<string, any> | undefined
          try { if (rawProps) props = JSON.parse(decodeURIComponent(rawProps)) } catch {}
          registry.registerInstance(componentId, title, props)
          return
        }

        // Existing instance — sync text/image fields for inline edits and undo/redo
        sec.querySelectorAll<HTMLElement>('[data-field-key]').forEach((el) => {
          const key = el.getAttribute('data-field-key')
          if (!key) return
          const val = el.tagName === 'IMG' ? (el as HTMLImageElement).src || '' : el.textContent ?? ''
          registry.setData(componentId, key, val)
        })
      })
    },
  )

  const selectedEl = computed<HTMLElement | null>(
    () => (store.getElement as HTMLElement | null) ?? null,
  )

  // Tracks the last instance ID seen from a LIVE element. Used as fallback when
  // selectedEl is null or detached (briefly orphaned after _applyBlockRender
  // swaps innerHTML).
  let _lastKnownBlockId: string | null = null

  // Safety net: if a section is selected but not yet in the registry (race
  // condition at startup or a block added by the library before our watcher
  // fired), lazily register it from the section's current DOM state.
  watch(selectedEl, (el) => {
    if (!el?.isConnected) return
    const section = el.closest('[data-component-title]') as HTMLElement | null
    if (!section) return
    const componentId = section.getAttribute('data-componentid')
    const title = section.getAttribute('data-component-title')
    if (!componentId || !title || !registry.hasConfig(title)) return
    if (registry.getData(componentId)) return // already registered
    const rawProps = section.getAttribute('data-component-props')
    let props: Record<string, any> | undefined
    try { if (rawProps) props = JSON.parse(decodeURIComponent(rawProps)) } catch {}
    registry.registerInstance(componentId, title, props)
  })

  const selectedBlockId = computed<string | null>(() => {
    const el = selectedEl.value
    if (el && el.isConnected) {
      const section = el.closest('section[data-componentid]')
      const id = section?.getAttribute('data-componentid') ?? null
      if (id) _lastKnownBlockId = id
      return id
    }
    return _lastKnownBlockId
  })

  const selectedBlockTitle = computed<string | null>(() => {
    const id = selectedBlockId.value
    return id ? registry.getTitle(id) : null
  })

  const mode = computed<SidebarMode>(() => {
    const el = selectedEl.value
    const title = selectedBlockTitle.value

    if ((!el || !el.isConnected) && !title) return 'none'
    if (title && registry.hasConfig(title)) return 'block'
    if (el && el.isConnected) return 'element'

    return 'none'
  })

  const blockConfig = computed(() => {
    const title = selectedBlockTitle.value
    return title ? registry.getConfig(title) : null
  })

  const blockData = computed(() => {
    const id = selectedBlockId.value
    return id ? registry.getData(id) : null
  })

  const selectedTag = computed<string>(() => {
    if (mode.value === 'block') return selectedBlockTitle.value ?? ''
    return selectedEl.value?.tagName?.toLowerCase() ?? 'element'
  })

  async function _syncBuilder() {
    const { getPageBuilder } = await import('@myissue/vue-website-page-builder')
    const builder = getPageBuilder() as any
    builder.syncDomToStoreOnly()
    builder.saveDomComponentsToLocalStorage()
  }

  async function _syncBuilderWithListeners() {
    const { getPageBuilder } = await import('@myissue/vue-website-page-builder')
    const builder = getPageBuilder() as any

    // syncDomToStoreOnly()'s components=[] / set-back cycle (below) briefly
    // tears down and rebuilds every canvas section, which can perturb
    // #page-builder-wrapper's scroll position as a side effect. Capture it here
    // and restore it once the rebuild has settled, so editing a field never
    // moves the canvas out from under the user.
    const canvas = document.querySelector('#page-builder-wrapper') as HTMLElement | null
    const savedScrollTop = canvas?.scrollTop

    // ORDER IS CRITICAL.
    // syncDomToStoreOnly() calls store.setComponents(...) which internally does
    // `this.components = []` then re-assigns on the next tick. That clears and
    // re-renders all canvas sections — destroying any DOM nodes the library was
    // tracking. If we attached listeners BEFORE this, those listeners are bound
    // to detached nodes and clicks stop working on every block, not just the
    // re-rendered one. The library's own internal code (see
    // vue-website-page-builder.js line 2774) follows this exact order:
    //   syncDomToStoreOnly → wait a microtask → addListenersToEditableElements
    builder.syncDomToStoreOnly()
    builder.saveDomComponentsToLocalStorage()
    // Wait for the components=[] / set-back microtask to complete and Vue to
    // re-render the canvas sections, THEN attach click listeners to the fresh DOM.
    await Promise.resolve()
    await Promise.resolve()
    if (canvas && savedScrollTop != null) canvas.scrollTop = savedScrollTop
    await builder.addListenersToEditableElements()
  }

  async function _applyBlockRender(componentId: string) {
    const title = registry.getTitle(componentId)
    const config = title ? registry.getConfig(title) : null
    const data = registry.getData(componentId)
    if (!config || !data) return

    const section = document.querySelector(
      `section[data-componentid="${componentId}"]`,
    ) as HTMLElement | null
    if (!section) return

    const newHtml = config.render(data)
    const parser = new DOMParser()
    const doc = parser.parseFromString(newHtml, 'text/html')
    const newSection = doc.querySelector('section')
    if (!newSection) return

    // BEFORE the innerHTML swap, capture whether the user is currently on THIS
    // block. If they've already clicked a different component (e.g. their click
    // happened while a debounced field update was still pending), we MUST NOT
    // steal their selection back to this section.
    const currentEl = selectedEl.value
    const userIsOnThisBlock = currentEl?.isConnected
      ? !!currentEl.closest(`section[data-componentid="${componentId}"]`)
      : _lastKnownBlockId === componentId

    // Sync attributes on the <section> tag itself (e.g. style="position:sticky")
    const newStyle = newSection.getAttribute('style')
    if (newStyle) section.setAttribute('style', newStyle)
    else section.removeAttribute('style')

    // Keep data-component-props in sync so saveDomComponentsToLocalStorage()
    // captures the current field state when the builder flushes to storage.
    const newProps = newSection.getAttribute('data-component-props')
    if (newProps) section.setAttribute('data-component-props', newProps)
    else section.removeAttribute('data-component-props')

    section.innerHTML = newSection.innerHTML

    // Re-apply any element-level style overrides the user set via the element
    // editor — these are wiped by the innerHTML swap above.
    const blockOverrides = _elementOverrides.get(componentId)
    if (blockOverrides) {
      const stale: string[] = []
      blockOverrides.forEach((props, elKey) => {
        const target = _getElementByKey(elKey, section)
        if (target) {
          Object.entries(props).forEach(([p, v]) => { (target.style as any)[p] = v })
        } else {
          stale.push(elKey)
        }
      })
      stale.forEach(k => blockOverrides.delete(k))
    }

    if (userIsOnThisBlock) {
      store.setElement(section)
    }
    await _syncBuilderWithListeners()
  }

  // forcedId allows debouncedUpdateBlockField in EditorSidebar to snapshot the
  // componentId at call time (before the debounce fires) so a fast block switch
  // can't misdirect the update to the newly selected block.
  async function updateBlockField(key: string, value: any, forcedId?: string) {
    const id = forcedId ?? selectedBlockId.value
    if (!id || !registry.getTitle(id)) return
    registry.setData(id, key, value)
    _elementOverrides.delete(id)
    await _applyBlockRender(id)
  }

  async function updateBlockListItem(
    listKey: string,
    index: number,
    itemKey: string,
    value: any,
  ) {
    const id = selectedBlockId.value
    if (!id || !registry.getTitle(id)) return
    registry.setListItem(id, listKey, index, itemKey, value)
    _elementOverrides.delete(id)
    await _applyBlockRender(id)
  }

  async function addBlockListItem(listKey: string, template: Record<string, any>) {
    const id = selectedBlockId.value
    if (!id || !registry.getTitle(id)) return
    registry.addListItem(id, listKey, template)
    _elementOverrides.delete(id)
    await _applyBlockRender(id)
  }

  async function removeBlockListItem(listKey: string, index: number) {
    const id = selectedBlockId.value
    if (!id || !registry.getTitle(id)) return
    registry.removeListItem(id, listKey, index)
    _elementOverrides.delete(id)
    await _applyBlockRender(id)
  }

  async function updateElementStyle(prop: string, value: string) {
    const el = selectedEl.value
    if (!el) return
    ;(el.style as any)[prop] = value

    const id = selectedBlockId.value
    if (id && registry.getTitle(id)) {
      const section = document.querySelector(
        `section[data-componentid="${id}"]`,
      ) as HTMLElement | null
      if (section) {
        const elKey = _getElementKey(el, section)
        if (elKey) {
          if (!_elementOverrides.has(id)) _elementOverrides.set(id, new Map())
          const blockOverrides = _elementOverrides.get(id)!
          if (!blockOverrides.has(elKey)) blockOverrides.set(elKey, {})
          const props = blockOverrides.get(elKey)!
          if (value !== '') props[prop] = value
          else {
            delete props[prop]
            if (Object.keys(props).length === 0) blockOverrides.delete(elKey)
          }
        }
      }
    }

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

  function closeEditor() {
    _lastKnownBlockId = null
    store.setElement(null)
  }

  async function openGlobalPageStyles() {
    const { getPageBuilder } = await import('@myissue/vue-website-page-builder')
    const builder = getPageBuilder() as any
    await builder.globalPageStyles()
  }

  // Sets the block-level `fontFamily` default on every registered block
  // currently on the canvas. Blocks that haven't adopted a `fontFamily`
  // field are safely skipped. Never touches per-field font overrides.
  async function applyFontToAllBlocks(value: string) {
    if (typeof document === 'undefined') return
    const ids: string[] = []
    document.querySelectorAll<HTMLElement>('section[data-component-title][data-componentid]').forEach((sec) => {
      const id = sec.getAttribute('data-componentid')
      const title = sec.getAttribute('data-component-title')
      if (!id || !title || !registry.hasConfig(title)) return
      // Blocks the user hasn't clicked/selected yet (e.g. on a freshly opened
      // page) are never registered, so getData() would be null and this block
      // would silently be skipped. Register it here from its current DOM
      // state — same lazy-registration pattern used by the selectedEl watch
      // above — so "whole page" really means the whole page.
      if (!registry.getData(id)) {
        const rawProps = sec.getAttribute('data-component-props')
        let props: Record<string, any> | undefined
        try { if (rawProps) props = JSON.parse(decodeURIComponent(rawProps)) } catch {}
        registry.registerInstance(id, title, props)
      }
      ids.push(id)
    })
    for (const id of ids) {
      registry.setData(id, 'fontFamily', value)
      await _applyBlockRender(id)
    }
  }

  return {
    selectedEl,
    selectedBlockId,
    selectedBlockTitle,
    mode,
    blockConfig,
    blockData,
    selectedTag,
    applyBlockRender: _applyBlockRender,
    applyFontToAllBlocks,
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
