import { reactive } from 'vue'

export interface FieldConfig {
  key: string
  label: string
  type: 'text' | 'url' | 'color' | 'select' | 'toggle' | 'number' | 'image' | 'list' | 'column-order' | 'header'
  options?: string[]
  listFields?: FieldConfig[]
  placeholder?: string
  unit?: string
  step?: number
}

export interface BlockEditorConfig<T = Record<string, any>> {
  defaults: T
  fields: FieldConfig[]
  render: (data: any) => string
}

interface RegistryEntry {
  config: BlockEditorConfig
  state: Record<string, any>
}

const _registry = reactive<Map<string, RegistryEntry>>(new Map())

const STORAGE_KEY = 'app-block-registry-v6'
let _storageCache: Record<string, Record<string, any>> | null = null

function _loadStorage(): Record<string, Record<string, any>> {
  if (_storageCache !== null) return _storageCache
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    _storageCache = {}
    return _storageCache
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    _storageCache = raw ? JSON.parse(raw) : {}
  } catch {
    _storageCache = {}
  }
  return _storageCache!
}

function _saveStorage() {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return
  try {
    const out: Record<string, any> = {}
    _registry.forEach((entry, title) => {
      out[title] = JSON.parse(JSON.stringify(entry.state))
    })
    _storageCache = out
    localStorage.setItem(STORAGE_KEY, JSON.stringify(out))
  } catch {
    // Quota exceeded or other storage failure — fail silently so editor still
    // works without persistence
  }
}

export function useBlockRegistry() {
  function register(title: string, config: BlockEditorConfig) {
    if (_registry.has(title)) {
      // Update config (fields/render) but keep existing state
      const existing = _registry.get(title)!
      existing.config = config
      // Merge any new default fields that don't exist in current state
      Object.keys(config.defaults).forEach(key => {
        if (!(key in existing.state)) {
          existing.state[key] = (config.defaults as any)[key]
        }
      })
      return
    }
    const stored = _loadStorage()[title]
    // Merge defaults with stored so newly-added fields default-fill,
    // but existing field values from storage win.
    const initialState = stored
      ? { ...JSON.parse(JSON.stringify(config.defaults)), ...stored }
      : JSON.parse(JSON.stringify(config.defaults))
    _registry.set(title, { config, state: reactive(initialState) })
  }

  function hasConfig(title: string): boolean {
    return _registry.has(title)
  }

  function getConfig(title: string): BlockEditorConfig | null {
    return _registry.get(title)?.config ?? null
  }

  function getData(title: string): Record<string, any> | null {
    const entry = _registry.get(title)
    return entry ? entry.state : null
  }

  function setData(title: string, key: string, value: any) {
    const entry = _registry.get(title)
    if (!entry) return
    entry.state[key] = value
    _saveStorage()
  }

  function setListItem(title: string, listKey: string, index: number, itemKey: string, value: any) {
    const entry = _registry.get(title)
    if (entry && Array.isArray(entry.state[listKey]) && index >= 0 && index < entry.state[listKey].length) {
      entry.state[listKey][index][itemKey] = value
      _saveStorage()
    }
  }

  function addListItem(title: string, listKey: string, template: Record<string, any>) {
    const entry = _registry.get(title)
    if (entry && Array.isArray(entry.state[listKey])) {
      entry.state[listKey].push({ ...template })
      _saveStorage()
    }
  }

  function removeListItem(title: string, listKey: string, index: number) {
    const entry = _registry.get(title)
    if (entry && Array.isArray(entry.state[listKey])) {
      entry.state[listKey].splice(index, 1)
      _saveStorage()
    }
  }

  function moveListItem(title: string, listKey: string, fromIndex: number, toIndex: number) {
    const entry = _registry.get(title)
    if (!entry || !Array.isArray(entry.state[listKey])) return
    const arr = entry.state[listKey]
    if (fromIndex < 0 || fromIndex >= arr.length || toIndex < 0 || toIndex >= arr.length) return
    const [item] = arr.splice(fromIndex, 1)
    arr.splice(toIndex, 0, item)
    _saveStorage()
  }

  function resetToDefaults(title: string) {
    const entry = _registry.get(title)
    if (!entry) return
    const fresh = JSON.parse(JSON.stringify(entry.config.defaults))
    for (const k of Object.keys(entry.state)) {
      if (!(k in fresh)) delete entry.state[k]
    }
    Object.assign(entry.state, fresh)
    _saveStorage()
  }

  // Replace entire state for a block. Used by undo/redo sync from DOM, where
  // multiple fields need to be updated atomically without triggering multiple
  // re-renders.
  function replaceData(title: string, newState: Record<string, any>) {
    const entry = _registry.get(title)
    if (!entry) return
    // Mutate reactive object in place so existing references remain valid
    for (const k of Object.keys(entry.state)) {
      if (!(k in newState)) delete entry.state[k]
    }
    Object.assign(entry.state, JSON.parse(JSON.stringify(newState)))
    _saveStorage()
  }

  return {
    register, hasConfig, getConfig, getData,
    setData, setListItem, addListItem, removeListItem, moveListItem,
    replaceData, resetToDefaults,
  }
}
