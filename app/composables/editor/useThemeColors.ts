import { reactive } from 'vue'
import { NAVBAR_TITLES } from '../useGlobalSections'

// ─── Site-wide brand colors ───────────────────────────────────────────────────
// 6 colors (Primary/Secondary × CTA Background/CTA Text, plus Primary/Secondary
// Heading text), stored and saved to the CMS (`global-theme` record) for
// reference only. They do NOT apply themselves to any block — per-block
// button/text colors are still set manually from each block's own right-panel
// editor, same as always.
//
// Only committed to state (and persisted) when the modal's Save button is
// clicked — picking a color alone never saves anything.

export const RBX_PRIMARY_DEFAULT = '#16a34a'
export const RBX_SECONDARY_DEFAULT = '#6c757d'
export const RBX_TEXT_DEFAULT = '#ffffff'
export const RBX_HEADING_TEXT_DEFAULT = '#000000'
export const RBX_SUBHEADING_TEXT_DEFAULT = '#2563eb'

const STORAGE_KEY = 'app-theme-colors-v7'

export interface ThemeColorValues {
  primaryCtaBgColor: string
  primaryCtaTextColor: string
  secondaryCtaBgColor: string
  secondaryCtaTextColor: string
  // Heading / subheading text colors — independent of the CTA button colors above.
  primaryTextColor: string
  secondaryTextColor: string
}

const VALUE_KEYS = [
  'primaryCtaBgColor',
  'primaryCtaTextColor',
  'secondaryCtaBgColor',
  'secondaryCtaTextColor',
  'primaryTextColor',
  'secondaryTextColor',
] as const

interface ThemeColors extends ThemeColorValues {
  // True once Save has been clicked at least once.
  activated: boolean
}

const _state = reactive<ThemeColors>({
  primaryCtaBgColor: RBX_PRIMARY_DEFAULT,
  primaryCtaTextColor: RBX_TEXT_DEFAULT,
  secondaryCtaBgColor: RBX_SECONDARY_DEFAULT,
  secondaryCtaTextColor: RBX_TEXT_DEFAULT,
  primaryTextColor: RBX_HEADING_TEXT_DEFAULT,
  secondaryTextColor: RBX_SUBHEADING_TEXT_DEFAULT,
  activated: false,
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
      for (const key of VALUE_KEYS) {
        if (typeof parsed?.[key] === 'string') _state[key] = parsed[key]
      }
      if (typeof parsed?.activated === 'boolean') _state.activated = parsed.activated
    }
  } catch {}
}

function _persist() {
  if (typeof localStorage === 'undefined') return
  try {
    const out: Record<string, any> = { activated: _state.activated }
    for (const key of VALUE_KEYS) out[key] = _state[key]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(out))
  } catch {}
}

// ─── Which color field keys map to which theme role ──────────────────────────
// Dead code today (nothing calls applyThemeTokens/the sweep anymore — theme
// colors don't apply to blocks). Left in place in case that's re-enabled
// later; harmless while unused.
type Role = 'primary' | 'secondary' | 'primary-text' | 'secondary-text'

export const THEME_PRIMARY_KEYS = new Set<string>([
  'accentColor', 'ctaBgColor', 'buttonBgColor', 'submitBgColor', 'cta1BgColor',
  'viewProductBg', 'arrowBtnBg', 'arrowBgColor', 'badgeBgColor', 'statsIconColor',
  'loadMoreBgColor', 'eyebrowColor', 'sectionNumberColor', 'browseAllColor', 'subtitleLinkColor',
])
export const THEME_SECONDARY_KEYS = new Set<string>([
  'cta2BgColor', 'secondaryCtaColor',
])
export const THEME_PRIMARY_TEXT_KEYS = new Set<string>([
  'ctaTextColor', 'buttonTextColor', 'submitTextColor', 'cta1TextColor',
  'viewProductTextColor', 'loadMoreTextColor', 'arrowBtnColor', 'arrowColor', 'badgeTextColor',
  'productNameColor', 'priceColor',
])
export const THEME_SECONDARY_TEXT_KEYS = new Set<string>([
  'cta2TextColor',
])

export const THEME_NESTED_LIST_ROLES: Record<string, Record<string, Role>> = {
  ctaButtons: { bgColor: 'primary', textColor: 'primary-text' },
}

export const THEME_TITLE_KEY_ROLES: Record<string, Record<string, Role>> =
  Object.fromEntries(NAVBAR_TITLES.map((title) => [title, { linkColor: 'primary-text' as Role }]))

const HEX_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/

export function isThemeColor(value: unknown): value is string {
  return typeof value === 'string' && value.startsWith('var(--rbx-')
}

export function roleForKey(key: string, title?: string): Role | null {
  if (title && THEME_TITLE_KEY_ROLES[title]?.[key]) return THEME_TITLE_KEY_ROLES[title][key]
  if (THEME_PRIMARY_KEYS.has(key)) return 'primary'
  if (THEME_SECONDARY_KEYS.has(key)) return 'secondary'
  if (THEME_PRIMARY_TEXT_KEYS.has(key)) return 'primary-text'
  if (THEME_SECONDARY_TEXT_KEYS.has(key)) return 'secondary-text'
  return null
}

export function wrapThemeVar(value: string, role: Role): string {
  return `var(--rbx-${role}, ${value})`
}

export function applyThemeTokens(data: Record<string, any>, title?: string): Record<string, any> {
  _walk(data, undefined, title)
  return data
}

function _walk(node: any, listKey: string | undefined, title: string | undefined) {
  if (Array.isArray(node)) {
    node.forEach((item) => _walk(item, listKey, title))
    return
  }
  if (!node || typeof node !== 'object') return
  for (const key of Object.keys(node)) {
    const val = node[key]
    if (typeof val === 'string' && HEX_RE.test(val)) {
      const role = roleForKey(key, title) ?? (listKey ? THEME_NESTED_LIST_ROLES[listKey]?.[key] : undefined)
      if (role) node[key] = wrapThemeVar(val, role)
    } else if (Array.isArray(val)) {
      _walk(val, key, title)
    } else if (val && typeof val === 'object') {
      _walk(val, listKey, title)
    }
  }
}

// ─── Save / load ──────────────────────────────────────────────────────────────

// Clean JSON saved to the CMS as the `global-theme` record's value — a flat
// object, only emitted once Save has been clicked at least once.
export function themeJson(): string {
  if (!_state.activated) return ''
  const out: Record<string, string> = {}
  for (const key of VALUE_KEYS) out[key] = _state[key]
  return JSON.stringify(out)
}

// Restore saved colors from a global-theme CMS record's JSON value.
export function seedFromThemeJson(json: string | undefined | null): boolean {
  if (!json) return false
  try {
    const t = JSON.parse(json)
    if (!t || typeof t !== 'object') return false
    let found = false
    for (const key of VALUE_KEYS) {
      if (typeof t[key] === 'string') { _state[key] = t[key]; found = true }
    }
    if (found) { _state.activated = true; _persist() }
    return found
  } catch {
    return false
  }
}

export function useThemeColors() {
  _load()
  return {
    state: _state,
    isActivated: () => _state.activated,
    // Commits all 6 values at once — called only when the modal's Save
    // button is clicked, so picking colors never persists anything by itself.
    saveTheme(values: ThemeColorValues) {
      Object.assign(_state, values)
      _state.activated = true
      _persist()
    },
    themeJson,
    seedFromThemeJson,
  }
}
