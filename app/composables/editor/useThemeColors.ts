import { reactive } from 'vue'
import { NAVBAR_TITLES } from '../useGlobalSections'

// ─── Site-wide theme colors ──────────────────────────────────────────────────
// Four explicit, user-set brand colors that every block/component can inherit,
// exposed to rendered HTML as CSS variables. Blocks reference the variables via
// their color field DEFAULTS (see applyThemeTokens), so a block follows the
// theme by default while a user-picked color on that block wins.
//
// Four variables are emitted:
//   --rbx-primary / --rbx-secondary            → button & accent backgrounds
//   --rbx-primary-text / --rbx-secondary-text  → text sitting ON those buttons
//                                                 (both fully user-controlled —
//                                                 no auto contrast computation)
//
// Color analog of fontFields.ts (fontCss / GOOGLE_FONTS_STYLESHEET_URL).

// Defaults are NOT arbitrary: primary is the project's own brand green
// (main.css --color-primary-link, used across the builder as myPrimaryLinkColor);
// secondary is the conventional neutral (Bootstrap's standard secondary grey).
export const RBX_PRIMARY_DEFAULT = '#16a34a'
export const RBX_SECONDARY_DEFAULT = '#6c757d'
export const RBX_PRIMARY_TEXT_DEFAULT = '#ffffff'
export const RBX_SECONDARY_TEXT_DEFAULT = '#ffffff'

const STORAGE_KEY = 'app-theme-colors-v2'

interface ThemeColors {
  primaryButtonColor: string
  secondaryButtonColor: string
  primaryTextColor: string
  secondaryTextColor: string
  // True once the user has set a theme color at least once. Until then the
  // builder never rewrites block colors, so appearance is unchanged for anyone
  // who never opens the theme controls.
  activated: boolean
}

const _state = reactive<ThemeColors>({
  primaryButtonColor: RBX_PRIMARY_DEFAULT,
  secondaryButtonColor: RBX_SECONDARY_DEFAULT,
  primaryTextColor: RBX_PRIMARY_TEXT_DEFAULT,
  secondaryTextColor: RBX_SECONDARY_TEXT_DEFAULT,
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
      if (typeof parsed?.primaryButtonColor === 'string') _state.primaryButtonColor = parsed.primaryButtonColor
      if (typeof parsed?.secondaryButtonColor === 'string') _state.secondaryButtonColor = parsed.secondaryButtonColor
      if (typeof parsed?.primaryTextColor === 'string') _state.primaryTextColor = parsed.primaryTextColor
      if (typeof parsed?.secondaryTextColor === 'string') _state.secondaryTextColor = parsed.secondaryTextColor
      if (typeof parsed?.activated === 'boolean') _state.activated = parsed.activated
    }
  } catch {}
}

function _persist() {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      primaryButtonColor: _state.primaryButtonColor,
      secondaryButtonColor: _state.secondaryButtonColor,
      primaryTextColor: _state.primaryTextColor,
      secondaryTextColor: _state.secondaryTextColor,
      activated: _state.activated,
    }))
  } catch {}
}

// ─── Which color field keys map to which theme role ──────────────────────────
// Only genuine brand/accent roles. Backgrounds, headings, body text, borders,
// overlays, dividers and plain link colors stay literal (neutral).
type Role = 'primary' | 'secondary' | 'primary-text' | 'secondary-text'

export const THEME_PRIMARY_KEYS = new Set<string>([
  'accentColor', 'ctaBgColor', 'buttonBgColor', 'submitBgColor', 'cta1BgColor',
  'viewProductBg', 'arrowBtnBg', 'arrowBgColor', 'badgeBgColor', 'statsIconColor',
  'loadMoreBgColor', 'eyebrowColor', 'sectionNumberColor', 'browseAllColor', 'subtitleLinkColor',
])
export const THEME_SECONDARY_KEYS = new Set<string>([
  'cta2BgColor', 'secondaryCtaColor',
])
// Text that sits on a primary/secondary button — user-set, not computed.
export const THEME_PRIMARY_TEXT_KEYS = new Set<string>([
  'ctaTextColor', 'buttonTextColor', 'submitTextColor', 'cta1TextColor',
  'viewProductTextColor', 'loadMoreTextColor', 'arrowBtnColor', 'arrowColor', 'badgeTextColor',
  // Product name / price — same convention already used on the Product Detail
  // blocks; theming them here also covers those blocks automatically.
  'productNameColor', 'priceColor',
])
export const THEME_SECONDARY_TEXT_KEYS = new Set<string>([
  'cta2TextColor',
])

// Brand colors that live inside list items where the item's key name is NOT
// itself in the sets above (e.g. mega-menu ctaButtons use plain `bgColor` /
// `textColor`). Maps: listKey → { itemColorKey → role }.
export const THEME_NESTED_LIST_ROLES: Record<string, Record<string, Role>> = {
  ctaButtons: { bgColor: 'primary', textColor: 'primary-text' },
}

// Top-level keys whose role depends on WHICH block they're on — `linkColor`
// means "nav link" on a navbar but "footer link" on a footer, and only the
// former should follow the theme. Scoped by block title (not global by key
// name) so footer links stay neutral. Built from the existing NAVBAR_TITLES
// list so any navbar variant automatically gets themed nav links.
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

// Recursively rewrite a defaults clone's brand colors to var() references.
// Ungated (pure defaults) — used at block seed/reset time. Mutates & returns.
// `title` enables per-block key roles (e.g. navbar linkColor vs footer linkColor).
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

function _rootVars(
  primary = _state.primaryButtonColor,
  secondary = _state.secondaryButtonColor,
  primaryText = _state.primaryTextColor,
  secondaryText = _state.secondaryTextColor,
): string {
  return `--rbx-primary:${primary};--rbx-secondary:${secondary};`
    + `--rbx-primary-text:${primaryText};--rbx-secondary-text:${secondaryText}`
}

// The <style> block embedded in the saved page fragment so the live Odoo
// storefront inherits the theme (this app can't reach that page's <head>).
// Emitted only once the theme is active — otherwise every var(--rbx-*, <hex>)
// falls back to its original color and the site looks exactly as before.
export function themeRootStyle(
  primary = _state.primaryButtonColor,
  secondary = _state.secondaryButtonColor,
  primaryText = _state.primaryTextColor,
  secondaryText = _state.secondaryTextColor,
): string {
  if (!_state.activated) return ''
  return `<style>:root{${_rootVars(primary, secondary, primaryText, secondaryText)}}</style>`
}

// Builder canvas: keep a <style id="rbx-theme-vars"> in <head> in sync so themed
// blocks recolor instantly — the CSS variable change cascades on its own. When
// the theme is inactive the vars are cleared so fallbacks (original colors) show.
export function applyThemeVarsToHead() {
  if (typeof document === 'undefined') return
  let el = document.getElementById('rbx-theme-vars')
  if (!el) {
    el = document.createElement('style')
    el.id = 'rbx-theme-vars'
    document.head.appendChild(el)
  }
  el.textContent = _state.activated ? `:root{${_rootVars()}}` : ''
}

// Restore saved colors from a global-header fragment's :root on page load.
// Fallback path only — kept for pages saved before the global-theme JSON
// record existed. seedFromThemeJson (below) is the authoritative source now.
export function seedFromHeaderHtml(headerHtml: string | undefined | null) {
  if (!headerHtml) return
  const p  = headerHtml.match(/--rbx-primary:\s*([^;}\s]+)/)
  const s  = headerHtml.match(/--rbx-secondary:\s*([^;}\s]+)/)
  const pt = headerHtml.match(/--rbx-primary-text:\s*([^;}\s]+)/)
  const st = headerHtml.match(/--rbx-secondary-text:\s*([^;}\s]+)/)
  if (p) _state.primaryButtonColor = p[1]
  if (s) _state.secondaryButtonColor = s[1]
  if (pt) _state.primaryTextColor = pt[1]
  if (st) _state.secondaryTextColor = st[1]
  if (p || s || pt || st) { _state.activated = true; _persist() }
}

// The clean, structured JSON record saved to the CMS as the `global-theme`
// key — a standalone source of truth for the 4 colors, separate from the CSS
// baked into global-header (which exists only so the live Odoo page, which
// this app can't inject a <head> into, still gets themed visually). Emitted
// only once the theme is active, same rule as themeRootStyle. Flat object —
// no extra "theme" wrapper, since the CMS envelope's own field is already
// named `theme`.
export function themeJson(): string {
  if (!_state.activated) return ''
  return JSON.stringify({
    primaryButtonColor: _state.primaryButtonColor,
    secondaryButtonColor: _state.secondaryButtonColor,
    primaryTextColor: _state.primaryTextColor,
    secondaryTextColor: _state.secondaryTextColor,
  })
}

// Restore saved colors from a global-theme CMS record's JSON value.
export function seedFromThemeJson(json: string | undefined | null): boolean {
  if (!json) return false
  try {
    const t = JSON.parse(json)
    if (!t || typeof t !== 'object') return false
    if (typeof t.primaryButtonColor === 'string') _state.primaryButtonColor = t.primaryButtonColor
    if (typeof t.secondaryButtonColor === 'string') _state.secondaryButtonColor = t.secondaryButtonColor
    if (typeof t.primaryTextColor === 'string') _state.primaryTextColor = t.primaryTextColor
    if (typeof t.secondaryTextColor === 'string') _state.secondaryTextColor = t.secondaryTextColor
    _state.activated = true
    _persist()
    return true
  } catch {
    return false
  }
}

export function useThemeColors() {
  _load()
  return {
    state: _state,
    isActivated: () => _state.activated,
    setPrimaryButtonColor(v: string) {
      _state.primaryButtonColor = v
      _state.activated = true
      _persist()
    },
    setSecondaryButtonColor(v: string) {
      _state.secondaryButtonColor = v
      _state.activated = true
      _persist()
    },
    setPrimaryTextColor(v: string) {
      _state.primaryTextColor = v
      _state.activated = true
      _persist()
    },
    setSecondaryTextColor(v: string) {
      _state.secondaryTextColor = v
      _state.activated = true
      _persist()
    },
    themeRootStyle,
    applyThemeVarsToHead,
    seedFromHeaderHtml,
    themeJson,
    seedFromThemeJson,
  }
}
