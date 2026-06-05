import { computed, watch } from 'vue'
import { usePageBuilderStateStore } from '@myissue/vue-website-page-builder'
import { useBlockRegistry } from './useBlockRegistry'

export type SidebarMode = 'none' | 'block' | 'element'

// When the user applies styles via the element editor while inside a registered
// block, _applyBlockRender() replaces section.innerHTML and wipes those styles.
// We record every user-applied property here and re-apply after each re-render.
//
// Key 1: block title  Key 2: stable element key  Value: { cssProp → value }
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

function _extractDataFromSection(section: HTMLElement, defaults: Record<string, any>): Record<string, any> {
  const out: Record<string, any> = JSON.parse(JSON.stringify(defaults))
  section.querySelectorAll<HTMLElement>('[data-field-key]').forEach((el) => {
    const key = el.getAttribute('data-field-key')
    if (!key) return
    if (el.tagName === 'IMG') {
      out[key] = (el as HTMLImageElement).src || ''
    } else {
      out[key] = el.textContent ?? ''
    }
  })
  return out
}

export function useEditorSidebar() {
  const store = usePageBuilderStateStore() as any
  const registry = useBlockRegistry()

  watch(
    () => store.getHistoryIndex,
    () => {
      if (typeof document === 'undefined') return
      document.querySelectorAll<HTMLElement>('section[data-component-title]').forEach((sec) => {
        const title = sec.getAttribute('data-component-title')
        if (!title) return
        const cfg = registry.getConfig(title)
        if (!cfg) return
        const newState = _extractDataFromSection(sec, cfg.defaults)
        registry.replaceData(title, newState)
      })
    },
  )

  const selectedEl = computed<HTMLElement | null>(
    () => (store.getElement as HTMLElement | null) ?? null,
  )

  // Track the last block title seen via a LIVE element. This is used as fallback
  // when selectedEl is null or detached (e.g. immediately after _applyBlockRender
  // replaces section innerHTML — the old child node is orphaned for a brief window
  // before the library re-establishes selection on the new section).
  let _lastKnownBlockTitle: string | null = null

  const selectedBlockTitle = computed<string | null>(() => {
    const el = selectedEl.value
    if (el && el.isConnected) {
      const section = el.closest('[data-component-title]')
      const title = section?.getAttribute('data-component-title') ?? null
      if (title) _lastKnownBlockTitle = title
      return title
    }
    return _lastKnownBlockTitle
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
    const title = selectedBlockTitle.value
    return title ? registry.getData(title) : null
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
    await builder.addListenersToEditableElements()
  }

  async function _applyBlockRender(title: string) {
    const config = registry.getConfig(title)
    const data = registry.getData(title)
    if (!config || !data) return

    const section = document.querySelector(
      `section[data-component-title="${title}"]`,
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
    //
    // Logic:
    //  • If selectedEl is a LIVE element → check whether it's inside this section
    //  • If selectedEl is null/detached → fall back to _lastKnownBlockTitle, which
    //    tracks the last block the user was actually on. If they switched to
    //    another block, _lastKnownBlockTitle has already updated to that block.
    const currentEl = selectedEl.value
    const userIsOnThisBlock = currentEl?.isConnected
      ? !!currentEl.closest(`section[data-component-title="${title}"]`)
      : _lastKnownBlockTitle === title

    // Sync attributes on the <section> tag itself (e.g. style="position:sticky")
    // — these are NOT part of innerHTML so must be copied separately.
    const newStyle = newSection.getAttribute('style')
    if (newStyle) section.setAttribute('style', newStyle)
    else section.removeAttribute('style')

    section.innerHTML = newSection.innerHTML

    // Re-apply any element-level style overrides the user set via the element
    // editor — these are wiped by the innerHTML swap above.
    const blockOverrides = _elementOverrides.get(title)
    if (blockOverrides) {
      const stale: string[] = []
      blockOverrides.forEach((props, elKey) => {
        const target = _getElementByKey(elKey, section)
        if (target) {
          Object.entries(props).forEach(([p, v]) => { (target.style as any)[p] = v })
        } else {
          stale.push(elKey) // element gone after structural change — drop override
        }
      })
      stale.forEach(k => blockOverrides.delete(k))
    }

    // _syncBuilderWithListeners re-registers click handlers across the whole
    // document, so the new children of this section become clickable regardless
    // of which element is currently selected. setElement is only needed to keep
    // the editor open on THIS block when the user hasn't moved away.
    if (userIsOnThisBlock) {
      store.setElement(section)
    }
    await _syncBuilderWithListeners()
  }

  async function updateBlockField(key: string, value: any, forcedTitle?: string) {
    const title = forcedTitle ?? selectedBlockTitle.value
    if (!title || !registry.getConfig(title)) return
    registry.setData(title, key, value)
    _elementOverrides.delete(title)
    await _applyBlockRender(title)
  }

  async function updateBlockListItem(
    listKey: string,
    index: number,
    itemKey: string,
    value: any,
  ) {
    const title = selectedBlockTitle.value
    if (!title || !registry.getConfig(title)) return
    registry.setListItem(title, listKey, index, itemKey, value)
    _elementOverrides.delete(title)
    await _applyBlockRender(title)
  }

  async function addBlockListItem(listKey: string, template: Record<string, any>) {
    const title = selectedBlockTitle.value
    if (!title || !registry.getConfig(title)) return
    registry.addListItem(title, listKey, template)
    _elementOverrides.delete(title)
    await _applyBlockRender(title)
  }

  async function removeBlockListItem(listKey: string, index: number) {
    const title = selectedBlockTitle.value
    if (!title || !registry.getConfig(title)) return
    registry.removeListItem(title, listKey, index)
    _elementOverrides.delete(title)
    await _applyBlockRender(title)
  }

  async function updateElementStyle(prop: string, value: string) {
    const el = selectedEl.value
    if (!el) return
    ;(el.style as any)[prop] = value

    // If the element is inside a registered block, record the override so it
    // survives the next _applyBlockRender() innerHTML swap.
    const title = selectedBlockTitle.value
    if (title && registry.hasConfig(title)) {
      const section = document.querySelector(
        `section[data-component-title="${title}"]`,
      ) as HTMLElement | null
      if (section) {
        const elKey = _getElementKey(el, section)
        if (elKey) {
          if (!_elementOverrides.has(title)) _elementOverrides.set(title, new Map())
          const blockOverrides = _elementOverrides.get(title)!
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
    _lastKnownBlockTitle = null
    store.setElement(null)
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
    applyBlockRender: _applyBlockRender,
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
