import { reactive } from 'vue'

export interface SiteConfigValues {
  defaultHomePage: '/' | '/shop'
  isShopAsHomePage: boolean
}

const STORAGE_KEY = 'app-site-config-v2'

const _state = reactive<SiteConfigValues>({
  defaultHomePage: '/',
  isShopAsHomePage: false,
})

let _loaded = false

function _load() {
  if (_loaded) return
  _loaded = true
  if (typeof localStorage === 'undefined') return
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      const VALID_PAGES = ['/', '/shop'] as const
      if (VALID_PAGES.includes(parsed?.defaultHomePage)) {
        _state.defaultHomePage = parsed.defaultHomePage
      }
      if (typeof parsed?.isShopAsHomePage === 'boolean') {
        _state.isShopAsHomePage = parsed.isShopAsHomePage
      }
    }
  } catch {
    // Silently ignore corrupted local storage
  }
}

function _persist() {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      defaultHomePage: _state.defaultHomePage,
      isShopAsHomePage: _state.isShopAsHomePage,
    }))
  } catch {
    // Silently ignore storage quota or permission errors
  }
}

export function useSiteConfig() {
  _load()

  // Resets to defaults — call this when switching to a company/website that
  // has no global-config record yet, so the previous company's values don't
  // leak into the new one (and potentially get saved as its config).
  function reset() {
    _state.defaultHomePage = '/'
    _state.isShopAsHomePage = false
    _persist()
  }

  function setConfig(newConfig: Partial<SiteConfigValues>) {
    if (newConfig.defaultHomePage !== undefined) {
      _state.defaultHomePage = newConfig.defaultHomePage
    }
    if (newConfig.isShopAsHomePage !== undefined) {
      _state.isShopAsHomePage = newConfig.isShopAsHomePage
      if (newConfig.isShopAsHomePage) {
        _state.defaultHomePage = '/shop'
      } else if (newConfig.defaultHomePage === undefined) {
        _state.defaultHomePage = '/'
      }
    }
    _persist()
  }

  function loadFromJson(jsonStrOrObj: string | Record<string, any>) {
    try {
      const parsed = typeof jsonStrOrObj === 'string' ? JSON.parse(jsonStrOrObj) : jsonStrOrObj
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        const VALID_PAGES = ['/', '/shop'] as const
        if (VALID_PAGES.includes(parsed.defaultHomePage)) {
          _state.defaultHomePage = parsed.defaultHomePage
        }
        if (typeof parsed.isShopAsHomePage === 'boolean') {
          _state.isShopAsHomePage = parsed.isShopAsHomePage
        }
        _persist()
      }
    } catch {
      // Silently ignore invalid JSON
    }
  }

  function configJson(): string {
    return JSON.stringify({
      defaultHomePage: _state.defaultHomePage,
      isShopAsHomePage: _state.isShopAsHomePage,
    })
  }

  return {
    state: _state,
    setConfig,
    loadFromJson,
    configJson,
    reset,
  }
}
