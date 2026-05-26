import { reactive } from 'vue'

export interface FieldConfig {
  key: string
  label: string
  type: 'text' | 'url' | 'color' | 'select' | 'toggle' | 'number' | 'image' | 'list'
  options?: string[]
  listFields?: FieldConfig[]
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

export function useBlockRegistry() {
  function register(title: string, config: BlockEditorConfig) {
    if (!_registry.has(title)) {
      _registry.set(title, { config, state: reactive({ ...config.defaults }) })
    }
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
    if (entry) entry.state[key] = value
  }

  function setListItem(title: string, listKey: string, index: number, itemKey: string, value: any) {
    const entry = _registry.get(title)
    if (entry && Array.isArray(entry.state[listKey]) && index >= 0 && index < entry.state[listKey].length) {
      entry.state[listKey][index][itemKey] = value
    }
  }

  function addListItem(title: string, listKey: string, template: Record<string, any>) {
    const entry = _registry.get(title)
    if (entry && Array.isArray(entry.state[listKey])) {
      entry.state[listKey].push({ ...template })
    }
  }

  function removeListItem(title: string, listKey: string, index: number) {
    const entry = _registry.get(title)
    if (entry && Array.isArray(entry.state[listKey])) {
      entry.state[listKey].splice(index, 1)
    }
  }

  function moveListItem(title: string, listKey: string, fromIndex: number, toIndex: number) {
    const entry = _registry.get(title)
    if (!entry || !Array.isArray(entry.state[listKey])) return
    const arr = entry.state[listKey]
    if (fromIndex < 0 || fromIndex >= arr.length || toIndex < 0 || toIndex >= arr.length) return
    const [item] = arr.splice(fromIndex, 1)
    arr.splice(toIndex, 0, item)
  }

  return { register, hasConfig, getConfig, getData, setData, setListItem, addListItem, removeListItem, moveListItem }
}
