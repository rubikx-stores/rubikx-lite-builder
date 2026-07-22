import { reactive } from 'vue'

export interface FieldConfig {
  key: string
  label: string
  type: 'text' | 'textarea' | 'url' | 'color' | 'select' | 'toggle' | 'number' | 'image' | 'list' | 'column-order' | 'header'
  options?: string[]
  listFields?: FieldConfig[]
  placeholder?: string
  unit?: string
  step?: number
  noAspectRatio?: boolean
  visibleIf?: (data: Record<string, any>) => boolean
}

export interface BlockEditorConfig<T = Record<string, any>> {
  defaults: T
  fields: FieldConfig[]
  render: (data: any) => string
}

// Config is shared by title (render function + field definitions).
// State is per-instance, keyed by data-componentid (the UUID the builder
// assigns each section). This means two Ru1-Navbar sections are fully
// independent — editing one does not affect the other.
const _configs = new Map<string, BlockEditorConfig>()
const _states = reactive<Map<string, Record<string, any>>>(new Map())
const _idToTitle = new Map<string, string>() // componentId → title

const STORAGE_KEY = 'app-block-registry-v7'
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
    _states.forEach((state, id) => {
      out[id] = JSON.parse(JSON.stringify(state))
    })
    _storageCache = out
    localStorage.setItem(STORAGE_KEY, JSON.stringify(out))
  } catch {}
}

export function useBlockRegistry() {
  // Register the shared config for a component type (title → config).
  // Called once per component type by useThemes / useLayouts.
  function register(title: string, config: BlockEditorConfig) {
    _configs.set(title, config)
  }

  // Register a specific section instance. Creates per-instance state seeded
  // from (in priority order): initialState → localStorage → config defaults.
  function registerInstance(
    componentId: string,
    title: string,
    initialState?: Record<string, any>,
  ) {
    _idToTitle.set(componentId, title)
    if (_states.has(componentId)) return // already registered, keep existing state
    const config = _configs.get(title)
    const base = config ? JSON.parse(JSON.stringify(config.defaults)) : {}
    const stored = _loadStorage()[componentId]
    const merged = { ...base, ...(stored ?? {}), ...(initialState ?? {}) }
    _states.set(componentId, reactive(merged))
  }

  function hasConfig(title: string): boolean {
    return _configs.has(title)
  }

  function getConfig(title: string): BlockEditorConfig | null {
    return _configs.get(title) ?? null
  }

  function getTitle(componentId: string): string | null {
    return _idToTitle.get(componentId) ?? null
  }

  function getData(componentId: string): Record<string, any> | null {
    return _states.get(componentId) ?? null
  }

  function setData(componentId: string, key: string, value: any) {
    const state = _states.get(componentId)
    if (!state) return
    state[key] = value
    _saveStorage()
  }

  function setListItem(componentId: string, listKey: string, index: number, itemKey: string, value: any) {
    const state = _states.get(componentId)
    if (state && Array.isArray(state[listKey]) && index >= 0 && index < state[listKey].length) {
      state[listKey][index][itemKey] = value
      _saveStorage()
    }
  }

  function addListItem(componentId: string, listKey: string, template: Record<string, any>) {
    const state = _states.get(componentId)
    if (state && Array.isArray(state[listKey])) {
      state[listKey].push({ ...template })
      _saveStorage()
    }
  }

  function removeListItem(componentId: string, listKey: string, index: number) {
    const state = _states.get(componentId)
    if (state && Array.isArray(state[listKey])) {
      state[listKey].splice(index, 1)
      _saveStorage()
    }
  }

  function moveListItem(componentId: string, listKey: string, fromIndex: number, toIndex: number) {
    const state = _states.get(componentId)
    if (!state || !Array.isArray(state[listKey])) return
    const arr = state[listKey]
    if (fromIndex < 0 || fromIndex >= arr.length || toIndex < 0 || toIndex >= arr.length) return
    const [item] = arr.splice(fromIndex, 1)
    arr.splice(toIndex, 0, item)
    _saveStorage()
  }

  function resetToDefaults(componentId: string) {
    const title = _idToTitle.get(componentId)
    const config = title ? _configs.get(title) : null
    if (!config) return
    const state = _states.get(componentId)
    if (!state) return
    const fresh = JSON.parse(JSON.stringify(config.defaults))
    for (const k of Object.keys(state)) {
      if (!(k in fresh)) delete state[k]
    }
    Object.assign(state, fresh)
    _saveStorage()
  }

  function replaceData(componentId: string, newState: Record<string, any>) {
    const state = _states.get(componentId)
    if (!state) return
    for (const k of Object.keys(state)) {
      if (!(k in newState)) delete state[k]
    }
    Object.assign(state, JSON.parse(JSON.stringify(newState)))
    _saveStorage()
  }

  return {
    register,
    registerInstance,
    hasConfig,
    getConfig,
    getTitle,
    getData,
    setData,
    setListItem,
    addListItem,
    removeListItem,
    moveListItem,
    replaceData,
    resetToDefaults,
  }
}
