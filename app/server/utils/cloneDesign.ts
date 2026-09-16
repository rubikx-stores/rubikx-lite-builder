import { useBlockRegistry } from '../../composables/editor/useBlockRegistry'
import { useThemes } from '../../composables/themes/useThemes'
import { useLayouts } from '../../composables/layouts/useLayouts'

// useThemes()/useLayouts() just populate the shared, module-level block
// registry (title → {defaults, fields, render}) — no browser APIs involved,
// so it's safe to run once per server process, same as the client does once
// per app load.
let _registered = false
function ensureBlockRegistry() {
  if (_registered) return
  useThemes()
  useLayouts()
  _registered = true
}

interface ParsedBlock {
  match: string // the full `<section ...>...</section>` substring to replace
  title: string
  data: Record<string, any>
}

// Every block the builder renders wraps itself as
// `<section data-component-title="X" data-component-props="<encoded JSON>">...</section>`
// (see themes-data.ts / components.ts) — quote style (' vs ") varies per call
// site, so both are matched. This is the same shape confirmSave()/onMounted()
// in PageBuilderWrapper already rely on when it re-parses saved HTML.
const SECTION_RE =
  /<section\s+[^>]*data-component-title=(["'])((?:(?!\1).)*)\1[^>]*data-component-props=(["'])((?:(?!\3).)*)\3[^>]*>[\s\S]*?<\/section>/g

function parseSections(html: string): ParsedBlock[] {
  const blocks: ParsedBlock[] = []
  let m: RegExpExecArray | null
  SECTION_RE.lastIndex = 0
  while ((m = SECTION_RE.exec(html))) {
    const title = m[2]
    let data: Record<string, any> = {}
    try {
      data = JSON.parse(decodeURIComponent(m[4]))
    } catch {
      data = {}
    }
    blocks.push({ match: m[0], title, data })
  }
  return blocks
}

// Recursively clears any field flagged `siteSpecific` — to its explicit
// `cloneValue` when set, otherwise the block's own default (or an empty
// list, for list fields with no matching default). Covers both "don't
// duplicate this site's products" (products lists) and "don't leak this
// site's live categories" (dynamicCategories-style toggles, which default to
// `true` and so need an explicit `cloneValue: false`). Also walks list items
// (listFields) so nested per-row toggles (e.g. a nav link's own
// "Show Categories Dropdown") are covered too.
function stripSiteSpecificFields(
  data: Record<string, any>,
  fields: import('../../composables/editor/useBlockRegistry').FieldConfig[],
  defaults: Record<string, any>,
) {
  for (const field of fields) {
    if (!(field.key in data)) continue

    if (field.siteSpecific) {
      if ('cloneValue' in field) {
        data[field.key] = JSON.parse(JSON.stringify(field.cloneValue))
      } else {
        const fallback = defaults?.[field.key]
        data[field.key] = fallback !== undefined
          ? JSON.parse(JSON.stringify(fallback))
          : (field.type === 'list' ? [] : undefined)
      }
      continue
    }

    if (field.type === 'list' && field.listFields && Array.isArray(data[field.key])) {
      const itemDefault = Array.isArray(defaults?.[field.key]) ? defaults[field.key][0] ?? {} : {}
      for (const item of data[field.key]) {
        if (item && typeof item === 'object') stripSiteSpecificFields(item, field.listFields, itemDefault)
      }
    }
  }
}

// Mega-menu per-link "pick specific products" data (navLinks[].megaMenu[].products)
// isn't exposed as a generic FieldConfig list (see megaMenuHeaderFields — the
// megaMenu picker is a bespoke UI, not driven by listFields), so it's cleared
// structurally instead of through the siteSpecific flag mechanism above.
function stripMegaMenuProducts(data: Record<string, any>) {
  if (!Array.isArray(data.navLinks)) return
  for (const link of data.navLinks) {
    if (!Array.isArray(link?.megaMenu)) continue
    for (const group of link.megaMenu) {
      if (Array.isArray(group?.products)) group.products = []
    }
  }
}

// "Sync Categories from API" (EditorSidebar.client.vue, Ru3-style navbars)
// writes the site's actual category names directly as navLinks[].label —
// one nav link per root category — with categoryFilter set to the matching
// category name. The generic siteSpecific pass already blanks
// showDropdown/categoryFilter so the dropdown *contents* can't leak, but
// that leaves the label itself: real category names sitting as plain
// visible nav text. navLinks can't be wiped wholesale (people also hand-type
// ordinary links like "Contact Us" here), but a non-empty categoryFilter is
// a reliable signal that a given entry was sync-generated rather than typed
// by hand, so those specific entries are dropped instead of just neutered.
function stripSyncedCategoryNavItems(data: Record<string, any>) {
  if (!Array.isArray(data.navLinks)) return
  data.navLinks = data.navLinks.filter((link: any) => !link?.categoryFilter)
}

function sanitizeBlockData(title: string, data: Record<string, any>): Record<string, any> {
  const sanitized = JSON.parse(JSON.stringify(data ?? {}))
  stripSyncedCategoryNavItems(sanitized)
  const config = useBlockRegistry().getConfig(title)
  if (config) stripSiteSpecificFields(sanitized, config.fields, config.defaults)
  stripMegaMenuProducts(sanitized)
  return sanitized
}

// Some navbar/footer titles the app still recognizes as valid (see
// NAVBAR_TITLES/FOOTER_TITLES in useGlobalSections.ts, e.g. "Ru1 Techwire
// Navbar") predate the block-registry system entirely — there is no render
// function or field config for them anywhere in this codebase, only raw
// HTML saved directly to Odoo long ago. The loop below can't sanitize what
// it can't parse into fields, so as a last-resort safety net this strips
// the hydration hook for any category-fetching shell wherever it appears in
// the final HTML — recognized or not. It can't remove the dead "Categories"
// link's markup (no field config to re-render from), but it guarantees no
// live category call is ever made against a block this code doesn't know
// how to sanitize properly.
const CATEGORY_HYDRATION_HOOKS = /data-on-mount=(["'])(?:loadCategories|loadDynamicNav)\1/g

// Clones a page's *design* by re-rendering every block from its own render
// function with site-specific fields (product lists, mega-menu product
// picks) reset to defaults. Design fields (colors, fonts, spacing, banner
// images, copy) and live/dynamic shells (CategoryNav, CartBadge, AuthState,
// SearchBar — these re-fetch per company at hydration time, see
// rubikx-hydration.client.ts) pass through untouched; nothing needs to
// change for them to already show the target site's own data.
//
// Anything outside the matched `<section>` blocks (the leading
// `<style>@import ...</style><script>...</script>` preamble written by
// confirmSave() in PageBuilderWrapper.client.vue) is left exactly as-is.
export function cloneDesignHtml(sourceHtml: string): string {
  ensureBlockRegistry()
  const blocks = parseSections(sourceHtml)

  let result = sourceHtml
  for (const block of blocks) {
    const config = useBlockRegistry().getConfig(block.title)
    if (!config) continue // unrecognized block type — can't re-render it; the fallback below still disarms its category fetch
    const sanitized = sanitizeBlockData(block.title, block.data)
    const rendered = config.render(sanitized)
    result = result.replace(block.match, rendered)
  }

  return result.replace(CATEGORY_HYDRATION_HOOKS, '')
}
