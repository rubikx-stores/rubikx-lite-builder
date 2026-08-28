import { buildCategoryTree } from '~/composables/categories/buildCategoryTree'
import type {
  FlatCategory,
  CategoryNode,
} from '~/composables/categories/buildCategoryTree'
import { icon } from '~/composables/useIconSvg'
import { productImageSrc } from '~/composables/useProductImageSrc'

// Set true to preview logged-in auth state inside the builder
const SIMULATE_AUTH = false

function renderCategoryTree(
  categories: CategoryNode[],
  linkStyle: string
): string {
  return categories
    .map((cat) => {
      // Matches the live storefront's /shop?category=<name> convention
      // (mountCmsCategoryNav) rather than a /<slug> route, so clicking a
      // category in the builder preview resolves the same way it will once
      // published — including synthesized parents with no real slug.
      const categoryQuery = cat.headlessName || cat.displayName || cat.name
      const href = `/shop?category=${encodeURIComponent(categoryQuery)}`
      const label = cat.displayName.includes(' / ')
        ? cat.displayName.split(' / ').pop()!
        : cat.displayName
      if (!cat.children || cat.children.length === 0) {
        return `<a href='${href}' style='display:block;padding:6px 16px;${linkStyle}text-decoration:none;white-space:nowrap;'>${label}</a>`
      }
      return `<div data-cat-parent='true' style='position:relative;'>
      <a href='${href}' aria-haspopup='true' aria-expanded='false' style='display:flex;align-items:center;justify-content:space-between;gap:12px;padding:6px 16px;${linkStyle}text-decoration:none;font-weight:600;white-space:nowrap;'>${label}<span aria-hidden='true' style='font-size:16px;opacity:.9;'>▸</span></a>
      <div data-cat-flyout='true' style='display:none;position:absolute;left:100%;top:0;margin-left:-10px;padding:8px 0 8px 10px;z-index:101;pointer-events:none;'>
        <div style='background:#fff;min-width:180px;box-shadow:0 4px 12px rgba(0,0,0,0.1);border-radius:8px;padding:8px 0;pointer-events:auto;'>
          ${renderCategoryTree(cat.children, linkStyle)}
        </div>
      </div>
    </div>`
    })
    .join('')
}

// The CSS rule `[data-cat-parent]:hover > [data-cat-flyout]` (below, in the
// injected stylesheet) is mouse-only — a keyboard or screen-reader user has
// no way to reach a 2nd/3rd-level category, which matters more now that
// buildCategoryTree actually supports arbitrary depth (previously nesting
// past one level didn't really exist, so nothing meaningful was gated
// behind hover). Adds the keyboard-equivalent (focusin/focusout, which
// bubble from any descendant, unlike focus/blur) plus viewport-edge
// flipping — each flyout previously hardcoded left:100%, which now that
// deep nesting is real can push a 3rd/4th-level flyout off the right edge
// of the screen. Runs once per hydration alongside renderCategoryTree, not
// delegated, since each row's own flyout position must be measured
// independently.
function bindFlyoutAccessibility(dropdown: HTMLElement) {
  dropdown.querySelectorAll<HTMLElement>('[data-cat-parent]').forEach((row) => {
    const trigger = row.querySelector<HTMLAnchorElement>(':scope > a')
    const flyout = row.querySelector<HTMLElement>(':scope > [data-cat-flyout]')
    if (!trigger || !flyout) return

    const position = () => {
      flyout.style.left = '100%'
      flyout.style.right = 'auto'
      flyout.style.marginLeft = '-10px'
      flyout.style.marginRight = ''
      if (flyout.getBoundingClientRect().right > window.innerWidth) {
        flyout.style.left = 'auto'
        flyout.style.right = '100%'
        flyout.style.marginLeft = ''
        flyout.style.marginRight = '-10px'
      }
    }
    const open = () => {
      flyout.style.display = 'block'
      position()
      trigger.setAttribute('aria-expanded', 'true')
    }
    const close = () => {
      // Explicitly 'none', not '' — clearing the property via '' removes the
      // JS override entirely rather than reverting to the div's original
      // inline display:none, so the element would fall through to its
      // default display:block and stay visibly open after the mouse/focus
      // actually leaves.
      flyout.style.display = 'none'
      trigger.setAttribute('aria-expanded', 'false')
    }

    row.addEventListener('mouseenter', open)
    row.addEventListener('mouseleave', close)
    row.addEventListener('focusin', open)
    row.addEventListener('focusout', (e: FocusEvent) => {
      if (!row.contains(e.relatedTarget as Node | null)) close()
    })
  })
}

// "Inline" alternative to renderCategoryTree — a category with children
// renders as a toggle row (label + chevron, not a link) whose own children
// sit directly beneath it in normal document flow, indented one level per
// depth, instead of popping out as an absolutely-positioned flyout. Matches
// the accordion pattern the mobile drawer already uses, just for desktop.
// Only leaf categories are clickable links; a parent row exists purely to
// expand/collapse — clicking it never navigates.
//
// Starts pre-expanded (every level open the moment the dropdown appears, so
// the full tree is visible with no clicking) but stays collapsible — the
// chevron still toggles a branch closed if a shopper wants to shrink it.
function renderCategoryTreeInline(
  categories: CategoryNode[],
  linkStyle: string,
  depth = 0
): string {
  return categories
    .map((cat) => {
      const categoryQuery = cat.headlessName || cat.displayName || cat.name
      const href = `/shop?category=${encodeURIComponent(categoryQuery)}`
      const label = cat.displayName.includes(' / ')
        ? cat.displayName.split(' / ').pop()!
        : cat.displayName
      const indent = 16 + depth * 16
      if (!cat.children || cat.children.length === 0) {
        return `<a href='${href}' style='display:block;padding:6px 16px 6px ${indent}px;${linkStyle}text-decoration:none;white-space:nowrap;'>${label}</a>`
      }
      return `<div data-cat-inline-parent='true'>
      <div data-cat-inline-toggle='true' style='display:flex;align-items:center;justify-content:space-between;gap:12px;padding:6px 16px 6px ${indent}px;${linkStyle}font-weight:600;white-space:nowrap;cursor:pointer;'>${label}<span data-cat-inline-chevron='true' style='font-size:11px;opacity:.6;transition:transform .15s;display:inline-block;transform:rotate(180deg);'>▾</span></div>
      <div data-cat-inline-children='true' style='display:block;'>
        ${renderCategoryTreeInline(cat.children, linkStyle, depth + 1)}
      </div>
    </div>`
    })
    .join('')
}

// Renders a mega-grid column's items, any depth deep — a child that itself
// has children (now that buildCategoryTree supports arbitrary depth, not
// just one level) gets its own grandchildren listed indented directly
// beneath it in the same column, rather than the grandchildren being
// silently omitted because the mega-grid map only ever read cat.children,
// never child.children.
function renderMegaColumnItems(nodes: CategoryNode[], depth = 0): string {
  return nodes
    .map((node) => {
      const query = node.headlessName || node.displayName || node.name
      const href = `/shop?category=${encodeURIComponent(query)}`
      const label = node.displayName.includes(' / ')
        ? node.displayName.split(' / ').pop()!
        : node.displayName
      const nested = (node.children ?? []).length
        ? `<div style='padding-left:${8 + (depth + 1) * 8}px;'>${renderMegaColumnItems(node.children, depth + 1)}</div>`
        : ''
      return `<div class='rubikx-mega-child'><a href='${href}'>${label}</a></div>${nested}`
    })
    .join('')
}

// Builds one mega-grid column: a bold header (linking to that node's own
// category page), its items via renderMegaColumnItems, and a synthesized
// "View All Products" link at the bottom (not a real category — always
// points at the column's own header link) matching the brand-column mega
// menu reference design (e.g. Water Innovations → Moen / Must Be A Moen,
// each column repeating the same product-type list).
function renderMegaColumn(header: CategoryNode, items: CategoryNode[]): string {
  const query = header.headlessName || header.displayName || header.name
  const href = `/shop?category=${encodeURIComponent(query)}`
  const label = header.displayName.includes(' / ')
    ? header.displayName.split(' / ').pop()!
    : header.displayName
  const itemsHtml = renderMegaColumnItems(items)
  return `<div>
    <div class='rubikx-mega-header'><a href='${href}'>${label}</a></div>
    ${itemsHtml}
    <div class='rubikx-mega-child'><a href='${href}'>View All Products</a></div>
  </div>`
}

// For Ru5's logoNavLinks — a flat list of plain category links plus a
// trailing "View All Products" link pointing at the general shop page (not
// a per-category filter, since a logo group has no real single /shop scope
// of its own). Categories come from Odoo's productCategoryIds relation
// (nested under logoIds, aggregated per group by /api/logo-groups) — this
// shape has no children (unlike CategoryNode, the auto-category row's own
// shape), hence its own renderer rather than coercing into renderMegaColumn's
// tree-walking one. Otherwise matches every other category-link builder in
// this file exactly: href prefers headlessName (the real backend slug, per
// loadCategories/renderMegaColumn/_renderDynamicNavResults all doing the
// same headlessName||displayName||name priority) over displayName, and the
// label shows only the leaf segment of a " / "-delimited hierarchical
// displayName (matching renderMegaColumn's own label logic) rather than the
// full path. text-decoration set inline, not left to the ambient
// [data-cat-dropdown] a CSS rule — this same markup also lands inside
// [data-cat-inline-children] on mobile (not a [data-cat-dropdown]
// descendant at all), so relying on that rule alone left mobile showing a
// default underline.
function renderGroupCategoryLinks(categories: Array<{ id: number, name: string, displayName: string, headlessName?: string | false }>): string {
  const itemsHtml = categories
    .map((cat) => {
      const query = cat.headlessName || cat.displayName || cat.name
      const href = `/shop?category=${encodeURIComponent(query)}`
      const label = cat.displayName.includes(' / ')
        ? cat.displayName.split(' / ').pop()!
        : cat.displayName
      return `<div class='rubikx-mega-child'><a href='${href}' style='text-decoration:none;'>${label}</a></div>`
    })
    .join('')
  const viewAll = `<div class='rubikx-mega-child'><a href='/shop' style='text-decoration:none;'>View All Products</a></div>`
  return itemsHtml + viewAll
}

// Click-to-expand wiring for renderCategoryTreeInline's toggle rows — a
// single delegated listener on the dropdown container rather than one per
// row, since loadCategories only ever calls this once per hydration
// (guarded by data-hydrated) and delegation survives any future re-render
// of the same dropdown without needing to re-bind.
function bindInlineCategoryToggles(dropdown: HTMLElement) {
  dropdown.addEventListener('click', (e) => {
    const toggle = (e.target as HTMLElement).closest<HTMLElement>('[data-cat-inline-toggle]')
    if (!toggle || !dropdown.contains(toggle)) return
    const parent = toggle.closest<HTMLElement>('[data-cat-inline-parent]')
    const children = parent?.querySelector<HTMLElement>(':scope > [data-cat-inline-children]')
    if (!children) return
    const isOpen = children.style.display === 'block'
    children.style.display = isOpen ? 'none' : 'block'
    const chevron = toggle.querySelector<HTMLElement>('[data-cat-inline-chevron]')
    if (chevron) chevron.style.transform = isOpen ? '' : 'rotate(180deg)'
  })
}

// Finds the tree node whose name/displayName/headlessName matches `filter`
// (case-insensitive), searching every level, not just top-level categories.
function _findCategoryNode(nodes: CategoryNode[], filter: string): CategoryNode | null {
  const target = filter.trim().toLowerCase()
  for (const node of nodes) {
    if (
      node.name?.toLowerCase() === target ||
      node.displayName?.toLowerCase() === target ||
      (typeof node.headlessName === 'string' && node.headlessName.toLowerCase() === target)
    ) return node
    const found = _findCategoryNode(node.children ?? [], filter)
    if (found) return found
  }
  return null
}

async function loadCategories(el: HTMLElement, companyId?: number) {
  if (el.dataset.hydrated === 'true') return
  el.dataset.hydrated = 'true'

  const maxItems = parseInt(el.dataset.maxItems ?? '20')
  const linkColor = el.dataset.linkColor ?? '#000000'
  const fontSize = el.dataset.fontSize ?? '14'
  const fontWeight = el.dataset.fontWeight ?? '400'
  const categoryFilter = el.dataset.categoryFilter ?? ''
  const dropdownStyle = el.dataset.categoryDropdownStyle === 'inline' ? 'inline' : 'floating'
  const linkStyle = `color:${linkColor};font-size:${fontSize}px;font-weight:${fontWeight};white-space:nowrap;`

  const dropdown = el.querySelector<HTMLElement>(
    'div[style*="position:absolute"], div[style*="position: absolute"]'
  )
  if (!dropdown) return

  try {
    const flat = await $fetch<FlatCategory[]>('/api/categories', {
      query: { companyId },
    })
    const fullTree = buildCategoryTree(flat)
    // When a specific category name is configured for this nav link (e.g.
    // "Apparel" vs "Headwear"), scope the dropdown to just that category's
    // own children instead of showing every top-level category everywhere.
    const matched = categoryFilter ? _findCategoryNode(fullTree, categoryFilter) : null
    const scoped = matched ? (matched.children ?? []) : fullTree
    const tree = scoped.slice(0, maxItems)

    if (categoryFilter && !matched) {
      console.warn(`[Rubikx] Category filter "${categoryFilter}" did not match any category name`)
    }

    if (dropdownStyle === 'inline') {
      // Everything expands in place within the panel — never appropriate
      // as a horizontal mega-grid, so this bypasses that layout regardless
      // of how many top-level categories there are.
      el.removeAttribute('data-mega')
      dropdown.innerHTML = renderCategoryTreeInline(tree, linkStyle)
      bindInlineCategoryToggles(dropdown)
    } else if (tree.length > 6) {
      // Mega menu — horizontal grid layout (unscoped: every top-level
      // category as its own column, no "View All Products" line since
      // there's no single brand/category this dropdown is scoped to)
      el.setAttribute('data-mega', 'true')
      dropdown.innerHTML = tree
        .map((cat) => {
          const categoryQuery = cat.headlessName || cat.displayName || cat.name
          const href = `/shop?category=${encodeURIComponent(categoryQuery)}`
          const childrenHtml = renderMegaColumnItems(cat.children ?? [])
          return `<div>
          <div class='rubikx-mega-header'><a href='${href}'>${cat.displayName}</a></div>
          ${childrenHtml}
        </div>`
        })
        .join('')
    } else {
      // Simple vertical dropdown — children reveal as a flyout on hover
      el.removeAttribute('data-mega')
      dropdown.innerHTML = renderCategoryTree(tree, linkStyle)
      bindFlyoutAccessibility(dropdown)
    }
  } catch (e) {
    console.error('[Rubikx] Failed to load categories:', e)
    if (dropdown) dropdown.innerHTML = ''
  }
}

// Ru5-Dynamic-Navbar's nav row — unlike loadCategories above (which fills a
// single hand-configured nav link's dropdown), this builds the entire row of
// top-level nav items itself, one per root category the backend returns, so
// the navbar's item count tracks the live category tree with nothing to
// configure per-site: one category in, one item shown; nine in, nine shown.
// A root with children renders as a mega-dropdown item (one column per
// grouping level under it, or a single column headed by its own name when it
// has no such grouping — see renderMegaColumn); a childless root renders as
// a plain link. Populates both the desktop row and the mobile accordion
// panel from one fetch, matching Home (already static in the shell markup)
// on each side.
//
// Builder-preview only, same split as loadCategories/loadNavOverflow above —
// the published Odoo page doesn't run this app's Nuxt plugin, so the live
// storefront needs its own equivalent mount function in the headless repo.
//
// Always re-fetches on every hydration call, same as loadCategories above —
// deliberately no cache. A module-level cache was tried here and reverted:
// it made this navbar populate near-instantly on later hydrations while
// every other dynamic-category shell on the page stayed fetch-driven, so it
// visibly rendered first while the rest of the page was still loading
// (behavior other navbar components don't have) — and being keyed by
// companyId with no invalidation, switching between company sites within
// the same session without a full reload could surface one company's
// categories on another's navbar. Consistency with loadCategories's
// always-fetch behavior matters more here than avoiding the refetch.
function _renderDynamicNavResults(
  roots: CategoryNode[],
  desktopContainer: HTMLElement | null,
  mobileContainer: HTMLElement | null,
  linkStyle: string
) {
  const emptyState = `<span style='display:block;padding:6px 0;color:#9ca3af;font-size:13px;font-style:italic;'>No categories found</span>`

  if (desktopContainer) {
    desktopContainer.innerHTML = roots.length
      ? roots.map((root) => {
          const query = root.headlessName || root.displayName || root.name
          const href = `/shop?category=${encodeURIComponent(query)}`
          const children = root.children ?? []
          if (!children.length) {
            return `<a href='${href}' style='${linkStyle}text-decoration:none;'>${root.displayName}</a>`
          }
          const hasGrouping = children.some((c) => (c.children ?? []).length > 0)
          const dropInner = hasGrouping
            ? children.map((c) => renderMegaColumn(c, c.children ?? [])).join('')
            : renderMegaColumn(root, children)
          return `<div data-cat-nav='true' data-mega='true' style='position:relative;display:inline-block;'>
            <a href='${href}' style='${linkStyle}text-decoration:none;cursor:pointer;'>${root.displayName} ▾</a>
            <div data-cat-dropdown='true' style='display:none;position:absolute;top:100%;left:0;background:#fff;min-width:200px;box-shadow:0 4px 12px rgba(0,0,0,0.1);border-radius:8px;padding:8px 0;z-index:100;margin-top:-2px;padding-top:4px;'>
              ${dropInner}
            </div>
          </div>`
        }).join('')
      : emptyState
  }

  if (mobileContainer) {
    if (roots.length) {
      mobileContainer.innerHTML = renderCategoryTreeInline(roots, linkStyle)
      bindInlineCategoryToggles(mobileContainer)
      // renderCategoryTreeInline defaults to pre-expanded (right for
      // CategoryNav's own floating panel) — this reference design shows
      // every top-level category collapsed until tapped, so close them
      // immediately after render instead.
      mobileContainer.querySelectorAll<HTMLElement>('[data-cat-inline-children]').forEach((c) => {
        c.style.display = 'none'
      })
      mobileContainer.querySelectorAll<HTMLElement>('[data-cat-inline-chevron]').forEach((c) => {
        c.style.transform = ''
      })
    } else {
      mobileContainer.innerHTML = emptyState
    }
  }
}

async function loadDynamicNav(el: HTMLElement, companyId?: number) {
  if (el.dataset.hydrated === 'true') return
  el.dataset.hydrated = 'true'

  // || 20 (not just ?? on the attribute read above) so a cleared/invalid
  // Max Categories input — which saves as 0, not absent — doesn't slice the
  // live tree to nothing and empty out the entire primary nav row.
  const maxCategories = parseInt(el.dataset.maxCategories ?? '20') || 20
  const linkColor = el.dataset.linkColor ?? '#1f2937'
  const fontSize = el.dataset.fontSize ?? '14'
  const fontWeight = el.dataset.fontWeight ?? '500'
  const linkStyle = `color:${linkColor};font-size:${fontSize}px;font-weight:${fontWeight};white-space:nowrap;`

  const desktopContainer = el.querySelector<HTMLElement>('[data-ru5-desktop-items]')
  const mobileContainer = el.querySelector<HTMLElement>('[data-ru5-mobile-items]')
  if (!desktopContainer && !mobileContainer) return

  // Editing ANY field on ANY block ends with _applyBlockRender calling
  // _syncBuilderWithListeners → builder.syncDomToStoreOnly(), which does
  // `this.components = []` then repopulates on the next tick — a full
  // teardown-and-rebuild of every <section> on the canvas, not just the one
  // that was edited (confirmed via logging: a captured <section> reference
  // stays the *same object* across this — section.querySelector(...) still
  // finds "the same node" relative to it — but that whole subtree is
  // orphaned; isConnected is false because a brand new section replaced it
  // in the live DOM). So no DOM reference captured before the fetch below —
  // not even an ancestor — can be trusted once the fetch resolves. Only the
  // `data-componentid` *string* survives the rebuild (the new section is
  // re-assigned the same id), so that's what gets captured, and the actual
  // container lookup happens fresh from `document` after the fetch.
  const componentId = el.closest('section')?.getAttribute('data-componentid') ?? null

  try {
    const flat = await $fetch<FlatCategory[]>('/api/categories', {
      query: { companyId },
    })
    const roots = buildCategoryTree(flat).slice(0, maxCategories)

    const liveSection = componentId
      ? document.querySelector<HTMLElement>(`section[data-componentid="${componentId}"]`)
      : el.closest('section')
    const liveDesktop = liveSection?.querySelector<HTMLElement>('[data-ru5-desktop-items]') ?? desktopContainer
    const liveMobile = liveSection?.querySelector<HTMLElement>('[data-ru5-mobile-items]') ?? mobileContainer
    if (!liveDesktop?.isConnected && !liveMobile?.isConnected) return

    _renderDynamicNavResults(roots, liveDesktop, liveMobile, linkStyle)
  } catch (e) {
    console.error('[Rubikx] Failed to load dynamic nav categories:', e)
    const liveSection = componentId
      ? document.querySelector<HTMLElement>(`section[data-componentid="${componentId}"]`)
      : el.closest('section')
    const liveDesktop = liveSection?.querySelector<HTMLElement>('[data-ru5-desktop-items]') ?? desktopContainer
    const liveMobile = liveSection?.querySelector<HTMLElement>('[data-ru5-mobile-items]') ?? mobileContainer
    if (liveDesktop) liveDesktop.innerHTML = ''
    if (liveMobile) liveMobile.innerHTML = ''
  }
}

// Ru5-Dynamic-Navbar's logoNavLinks — a hand-authored nav link with one
// column per selected logo GROUP (see Ru5LogoNavLink in components.ts).
// Headers are static, rendered directly by renderLogoNavLinkShell — nothing
// to fetch for those, only the column content ([data-logo-col-items]) needs
// filling, with that group's own real categories: fetches /api/logo-groups
// live, then matches each [data-logo-group] column back to its entry by the
// URL-decoded group name.
//
// Always re-fetches on every hydration call, same as loadDynamicNav above —
// deliberately no cache. This is a live-data feature by requirement: a
// category added on the backend must show up on the published site without
// republishing, the same guarantee the site-wide auto-category row already
// has. The known cost is that editing ANY field on this block (which tears
// down and rebuilds the whole canvas, per EditorSidebar.client.vue's
// REWIRE_ON_ANY_FIELD_TITLES) re-fires this fetch too — an accepted
// trade-off, not an oversight, matching loadDynamicNav's own documented
// stance on the same trade-off.
//
// Structured like loadDynamicNav above, including its documented
// re-find-after-rebuild workaround (editing ANY field on the block tears
// down and rebuilds every <section>, orphaning any DOM reference captured
// before the fetch resolves — see loadDynamicNav's comment for the full
// explanation), keyed by data-logo-nav-index instead of data-componentid
// alone since a navbar can have several logoNavLinks shells in the same
// section.
//
// Triggered ONLY from the desktop shell (renderLogoNavLinkShell only emits
// data-on-mount on that one) — this one call fetches once and fills in BOTH
// the desktop and mobile representations of the same link, found by shared
// data-logo-nav-index. Without this, both shells independently carrying
// data-on-mount would fire two full-catalog scans per link (desktop +
// mobile) on every hydration pass for content that's identical either way.
async function loadLogoNav(el: HTMLElement, companyId?: number) {
  if (el.dataset.hydrated === 'true') return
  el.dataset.hydrated = 'true'

  const idx = el.dataset.logoNavIndex
  const componentId = el.closest('section')?.getAttribute('data-componentid') ?? null

  const findLiveShells = () => {
    const liveSection = componentId
      ? document.querySelector<HTMLElement>(`section[data-componentid="${componentId}"]`)
      : el.closest('section')
    const desktop = liveSection?.querySelector<HTMLElement>(`[data-logo-nav-index="${idx}"][data-logo-nav-mobile="false"]`) ?? el
    const mobile = liveSection?.querySelector<HTMLElement>(`[data-logo-nav-index="${idx}"][data-logo-nav-mobile="true"]`) ?? null
    return { desktop, mobile }
  }

  const fillColumns = (shell: HTMLElement, categoriesByGroupName: Map<string, Array<{ id: number, name: string, displayName: string, headlessName?: string | false }>>) => {
    shell.querySelectorAll<HTMLElement>('[data-logo-group]').forEach((column) => {
      const groupName = decodeURIComponent(column.dataset.logoGroup ?? '')
      const items = column.querySelector<HTMLElement>('[data-logo-col-items]')
      if (!items) return
      items.innerHTML = renderGroupCategoryLinks(categoriesByGroupName.get(groupName) ?? [])
    })
  }

  try {
    const { desktop: desktop0, mobile: mobile0 } = findLiveShells()
    if (!desktop0.isConnected && !mobile0?.isConnected) return

    const groups = await $fetch<Array<{ groupName: string, categories: Array<{ id: number, name: string, displayName: string, headlessName?: string | false }> }>>(
      '/api/logo-groups',
      { query: { companyId } }
    )
    const categoriesByGroupName = new Map(groups.map((g) => [g.groupName, g.categories]))

    const { desktop, mobile } = findLiveShells()
    if (desktop.isConnected) fillColumns(desktop, categoriesByGroupName)
    if (mobile?.isConnected) {
      fillColumns(mobile, categoriesByGroupName)
      bindInlineCategoryToggles(mobile)
    }
  } catch (e) {
    console.error('[Rubikx] Failed to load logo nav categories:', e)
    const { desktop, mobile } = findLiveShells()
    const clearColumns = (shell: HTMLElement) => {
      shell.querySelectorAll<HTMLElement>('[data-logo-col-items]').forEach((col) => { col.innerHTML = '' })
    }
    if (desktop.isConnected) clearColumns(desktop)
    if (mobile?.isConnected) clearColumns(mobile)
  }
}

// Builder-preview-only aid for Ru3-Mega-Header's "+" overflow
// (data-rubikx-component="NavOverflow"). Measures the nav row's available
// width against its [data-nav-item] children and hides whichever trailing
// ones don't fit, rendering them inside the "+" panel as an accordion —
// header + chevron + children, expanded by default — instead of the
// hover-flyout style they use in the row. Re-measures on ResizeObserver so
// resizing the actual browser window (there's no device-preview toggle in
// this builder) shows the effect live. This never runs on the published
// site — the headless repo needs its own equivalent (mountCmsNavOverflow).
function loadNavOverflow(row: HTMLElement) {
  const overflowTrigger = row.querySelector<HTMLElement>(
    '[data-rubikx-component="NavOverflow"]'
  )
  const overflowDropdown = overflowTrigger?.querySelector<HTMLElement>(
    '[data-overflow-dropdown]'
  )
  if (!overflowTrigger || !overflowDropdown) return

  function buildAccordionRow(item: HTMLElement): HTMLElement {
    const link = item.querySelector<HTMLAnchorElement>('a')
    const label = (link?.textContent ?? '').replace(/▾\s*$/, '').trim()
    const href = link?.getAttribute('href') ?? '#'
    const catDropdown = item.querySelector<HTMLElement>('[data-cat-dropdown]')
    const children = catDropdown
      ? Array.from(catDropdown.querySelectorAll<HTMLAnchorElement>('a'))
      : []

    const wrap = document.createElement('div')
    wrap.style.cssText = 'border-bottom:1px solid #f3f4f6;'

    if (!children.length) {
      const a = document.createElement('a')
      a.href = href
      a.textContent = label
      a.style.cssText =
        'display:block;padding:10px 16px;color:#1f2937;font-size:14px;font-weight:500;text-decoration:none;white-space:nowrap;'
      wrap.appendChild(a)
      return wrap
    }

    const headerRow = document.createElement('div')
    headerRow.style.cssText =
      'display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 16px;cursor:pointer;'
    const headerLabel = document.createElement('span')
    headerLabel.textContent = label
    headerLabel.style.cssText = 'font-size:14px;font-weight:600;white-space:nowrap;'
    const chevron = document.createElement('span')
    chevron.textContent = '▾'
    chevron.style.cssText = 'transition:transform .15s;transform:rotate(180deg);'
    headerRow.append(headerLabel, chevron)
    wrap.appendChild(headerRow)

    const childList = document.createElement('div')
    childList.style.cssText = 'display:block;padding-bottom:4px;'
    children.forEach((child) => {
      const clone = child.cloneNode(true) as HTMLAnchorElement
      clone.style.cssText =
        'display:block;padding:6px 16px 6px 32px;font-size:13px;color:#374151;text-decoration:none;white-space:nowrap;'
      childList.appendChild(clone)
    })
    wrap.appendChild(childList)

    // Expanded by default, per the design reference — chevron still toggles it.
    let open = true
    headerRow.addEventListener('click', () => {
      open = !open
      childList.style.display = open ? 'block' : 'none'
      chevron.style.transform = open ? 'rotate(180deg)' : ''
    })

    return wrap
  }

  function recalc() {
    const items = Array.from(row.querySelectorAll<HTMLElement>('[data-nav-item]'))
    // Always reset from scratch before re-measuring — the only reliable way
    // to handle both shrinking and growing the viewport from any prior state.
    items.forEach((item) => { item.style.display = '' })
    overflowDropdown!.innerHTML = ''
    overflowTrigger!.style.display = 'none'
    if (!items.length) return

    const available = row.clientWidth
    const reserve = overflowTrigger!.getBoundingClientRect().width || 40
    let used = 0
    let cut = items.length
    for (let i = 0; i < items.length; i++) {
      used += items[i].getBoundingClientRect().width + 32 // approximate the row's own gap
      if (used > available - reserve) {
        cut = i
        break
      }
    }
    if (cut >= items.length) return

    overflowTrigger!.style.display = ''
    for (let i = cut; i < items.length; i++) {
      items[i].style.display = 'none'
      overflowDropdown!.appendChild(buildAccordionRow(items[i]))
    }
  }

  recalc()
  ;(row as any)._navOverflowRecalc = recalc

  if (!row.dataset.navOverflowResizeBound) {
    row.dataset.navOverflowResizeBound = 'true'
    let t: ReturnType<typeof setTimeout>
    const ro = new ResizeObserver(() => {
      clearTimeout(t)
      t = setTimeout(recalc, 100)
    })
    ro.observe(row)
  }

  if (!overflowTrigger.dataset.navOverflowHoverBound) {
    overflowTrigger.dataset.navOverflowHoverBound = 'true'
    overflowTrigger.addEventListener('mouseenter', () => {
      overflowDropdown!.style.display = 'block'
    })
    overflowTrigger.addEventListener('mouseleave', () => {
      overflowDropdown!.style.display = 'none'
    })
  }
}

// In-memory guard instead of a data-hydrated attribute: the builder serializes
// the canvas to HTML and rebuilds it on every field edit, which would bake a
// data-hydrated attribute into the saved HTML — the rebuilt slider would then
// be born "already hydrated" and loadSlider would skip wiring it (no autoplay/
// arrows). A WeakSet keys off the live element, so a freshly rebuilt node is
// never marked and always re-hydrates, and nothing persists into saved HTML.
const _hydratedSliders = new WeakSet<HTMLElement>()
function loadSlider(el: HTMLElement) {
  if (_hydratedSliders.has(el)) return
  _hydratedSliders.add(el)

  const slides = Array.from(el.querySelectorAll<HTMLElement>('[data-slide]'))
  const dots = Array.from(el.querySelectorAll<HTMLElement>('[data-dot]'))
  const prevBtn = el.querySelector<HTMLElement>('[data-prev]')
  const nextBtn = el.querySelector<HTMLElement>('[data-next]')
  const autoPlay = el.dataset.autoplay === 'true'
  const interval = parseInt(el.dataset.interval ?? '4000')

  if (!slides.length) return

  let cur = 0
  let timer: ReturnType<typeof setInterval> | null = null

  function goTo(n: number) {
    slides[cur].style.opacity = '0'
    slides[cur].style.pointerEvents = 'none'
    if (dots[cur]) {
      dots[cur].style.width = '8px'
      dots[cur].style.background =
        dots[cur].dataset.inactiveColor ?? 'rgba(255,255,255,0.5)'
    }
    cur = (n + slides.length) % slides.length
    slides[cur].style.opacity = '1'
    slides[cur].style.pointerEvents = 'auto'
    if (dots[cur]) {
      dots[cur].style.width = '24px'
      dots[cur].style.background = dots[cur].dataset.activeColor ?? '#ffffff'
    }
  }

  function startTimer() {
    if (autoPlay) timer = setInterval(() => goTo(cur + 1), interval)
  }
  function stopTimer() {
    if (timer) clearInterval(timer)
  }

  if (prevBtn)
    prevBtn.addEventListener('click', () => {
      stopTimer()
      goTo(cur - 1)
      startTimer()
    })
  if (nextBtn)
    nextBtn.addEventListener('click', () => {
      stopTimer()
      goTo(cur + 1)
      startTimer()
    })
  dots.forEach((d, i) =>
    d.addEventListener('click', () => {
      stopTimer()
      goTo(i)
      startTimer()
    })
  )
  el.addEventListener('mouseenter', stopTimer)
  el.addEventListener('mouseleave', startTimer)

  startTimer()
}

// ─── Cart count store (Ru3-Mega-Header's Cart icon) ───────────────────────────
// Plain localStorage-backed count.
// TODO: swap for a real Odoo cart API call once one exists; this is a stand-in
// so the badge stops being hardcoded and moves as items get added/removed.
const CART_STORAGE_KEY = 'rubikx-cart-v1'
const CART_CHANGE_EVENT = 'rubikx:cart-changed'

function _readCart(): number[] {
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter((n) => typeof n === 'number') : []
  } catch {
    return []
  }
}

function _writeCart(ids: number[]) {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(ids))
  } catch {}
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(CART_CHANGE_EVENT, { detail: { ids } }))
  }
}

function getCartCount(): number {
  return _readCart().length
}

function addToCart(productId: number) {
  _writeCart([..._readCart(), productId])
}

function removeFromCart(productId: number) {
  const ids = _readCart()
  const idx = ids.indexOf(productId)
  if (idx !== -1) { ids.splice(idx, 1); _writeCart(ids) }
}

function onCartChange(cb: (ids: number[]) => void): () => void {
  if (typeof window === 'undefined') return () => {}
  const handler = (e: Event) => cb((e as CustomEvent).detail?.ids ?? _readCart())
  window.addEventListener(CART_CHANGE_EVENT, handler)
  return () => window.removeEventListener(CART_CHANGE_EVENT, handler)
}

function _renderCartBadge(el: HTMLElement) {
  const count = getCartCount()

  const existing = el.querySelector('[data-cart-badge]')
  if (existing) existing.remove()
  if (count <= 0) return

  const badge = document.createElement('span')
  badge.setAttribute('data-cart-badge', 'true')
  badge.textContent = String(count)
  badge.style.cssText =
    'position:absolute;top:-6px;right:-6px;background:#ef4444;color:#fff;border-radius:50%;width:18px;height:18px;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;pointer-events:none;'
  el.appendChild(badge)

  document.querySelectorAll('[data-ru3-cart-count]').forEach((span) => {
    span.textContent = String(count)
  })
}

async function loadCartCount(el: HTMLElement, companyId?: number) {
  _renderCartBadge(el)
  if (el.dataset.cartWired === 'true') return
  el.dataset.cartWired = 'true'
  onCartChange(() => _renderCartBadge(el))
}

async function loadAuthState(el: HTMLElement, companyId?: number) {
  const inBuilder = !!document.getElementById('page-builder-wrapper')
  if (inBuilder && !SIMULATE_AUTH) return
  const profileUrl = el.dataset.profileUrl ?? '/me/personal'

  // New layout: querySelectorAll covers both desktop + mobile drawer Sign In buttons
  // Old layout (backwards compat): Sign In link is a child <a> inside the shell itself
  const externalSignInBtns = Array.from(
    document.querySelectorAll<HTMLElement>('[data-auth-signin-btn]')
  )
  const internalSignInLink = el.querySelector<HTMLElement>('a')
  const isNewLayout = externalSignInBtns.length > 0
  const signInEls: HTMLElement[] = isNewLayout
    ? externalSignInBtns
    : internalSignInLink
      ? [internalSignInLink]
      : []

  try {
    let userName = ''
    if (SIMULATE_AUTH) {
      userName = 'Demo User'
    } else {
      const res = await $fetch<{ user: { name: string; email: string } }>(
        '/api/auth/me'
      )
      userName = res.user?.name ?? ''
    }

    signInEls.forEach((btn) => {
      btn.style.display = 'none'
    })
    el.style.display = 'inline-flex'

    el.querySelector('[data-auth-profile]')?.remove()
    el.querySelector('[data-auth-dropdown]')?.remove()

    const initials = userName
      ? userName
          .trim()
          .split(/\s+/)
          .map((n: string) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)
      : ''

    const profileBtn = document.createElement('button')
    profileBtn.setAttribute('data-auth-profile', 'true')
    profileBtn.style.cssText =
      'background:none;border:none;cursor:pointer;display:flex;align-items:center;padding:0;'

    const avatar = document.createElement('div')
    avatar.style.cssText =
      'width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;'
    if (initials) {
      avatar.style.cssText +=
        'background:var(--rbx-primary, #6366f1);color:#fff;font-size:13px;font-weight:600;letter-spacing:0.025em;'
      avatar.textContent = initials
    } else {
      avatar.style.cssText += 'background:#e5e7eb;'
      avatar.innerHTML = icon('user', { size: 20, style: 'flex-shrink:0;' })
    }
    profileBtn.appendChild(avatar)

    const dropdown = document.createElement('div')
    dropdown.setAttribute('data-auth-dropdown', 'true')
    dropdown.style.cssText =
      'display:none;position:absolute;top:calc(100% + 8px);right:0;background:#fff;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.12);min-width:160px;z-index:9999;padding:4px 0;'

    const profileLink = document.createElement('a')
    profileLink.setAttribute('href', profileUrl)
    profileLink.textContent = 'Your Profile'
    profileLink.style.cssText =
      'display:block;padding:10px 16px;font-size:14px;color:#111827;text-decoration:none;white-space:nowrap;'

    const signOutLink = document.createElement('a')
    signOutLink.setAttribute('href', '/logout')
    signOutLink.textContent = 'Sign out'
    signOutLink.style.cssText =
      'display:block;padding:10px 16px;font-size:14px;color:#ef4444;text-decoration:none;white-space:nowrap;'

    dropdown.appendChild(profileLink)
    dropdown.appendChild(signOutLink)

    profileBtn.addEventListener('click', (e) => {
      e.stopPropagation()
      const isOpen = dropdown.style.display === 'block'
      dropdown.style.display = isOpen ? 'none' : 'block'
    })

    document.addEventListener(
      'click',
      () => {
        dropdown.style.display = 'none'
      },
      { once: false }
    )

    el.appendChild(profileBtn)
    el.appendChild(dropdown)
  } catch {
    signInEls.forEach((btn) => {
      btn.style.display = ''
    })
    if (isNewLayout) el.style.display = 'none'
    el.querySelector('[data-auth-profile]')?.remove()
    el.querySelector('[data-auth-dropdown]')?.remove()
  }
}

function loadMobileNav(el: HTMLElement) {
  if (el.dataset.hydrated === 'true') return
  el.dataset.hydrated = 'true'

  const nav = el.closest('nav') || el.closest('section')
  if (!nav) return

  // Clean up any drawer/overlay left by a previous hydration run (e.g. builder re-render)
  document
    .querySelectorAll('[data-rb-nav-drawer-live]')
    .forEach((n) => n.remove())
  document
    .querySelectorAll('[data-rb-nav-overlay-live]')
    .forEach((n) => n.remove())

  // Hide the static in-nav copies — position:fixed inside the builder's overflow:scroll
  // container is clipped, so we re-create both appended to document.body instead.
  const staticDrawer = nav.querySelector<HTMLElement>('[data-mobile-drawer]')
  const staticOverlay = nav.querySelector<HTMLElement>('[data-mobile-overlay]')
  if (staticDrawer) staticDrawer.style.display = 'none'
  if (staticOverlay) staticOverlay.style.display = 'none'

  // Overlay — all styles set via JS so Odoo stripping inline CSS doesn't matter
  const overlay = document.createElement('div')
  overlay.setAttribute('data-rb-nav-overlay-live', 'true')
  overlay.style.cssText =
    'display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:99998;'
  document.body.appendChild(overlay)

  // Drawer — uses transform for show/hide so a CSS transform on an Odoo ancestor
  // element cannot break positioning (position:fixed containing block issue).
  const drawer = document.createElement('div')
  drawer.setAttribute('data-rb-nav-drawer-live', 'true')
  drawer.style.cssText =
    'position:fixed;top:0;left:0;width:320px;max-width:85vw;height:100vh;background:#fff;z-index:99999;transform:translateX(-100%);transition:transform 0.3s ease;box-shadow:4px 0 24px rgba(0,0,0,0.15);overflow-y:auto;padding:1.5rem;'
  if (staticDrawer) drawer.innerHTML = staticDrawer.innerHTML
  document.body.appendChild(drawer)

  const closeBtn = drawer.querySelector<HTMLElement>('[data-mobile-close]')

  function openDrawer() {
    drawer.style.transform = 'translateX(0)'
    overlay.style.display = 'block'
    document.body.style.overflow = 'hidden'
  }

  function closeDrawer() {
    drawer.style.transform = 'translateX(-100%)'
    overlay.style.display = 'none'
    document.body.style.overflow = ''
  }

  el.addEventListener('click', openDrawer)
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer)
  overlay.addEventListener('click', closeDrawer)
}

// Ru2-FAQ+Banner accordion. The markup is native <details>/<summary>, which
// toggles on its own on the published page. Inside the builder the library
// intercepts the click (block selection) and can swallow the native toggle,
// so here we drive it manually: preventDefault stops the native toggle from
// also firing (no double toggle) and stopPropagation stops the builder from
// hijacking the click. Idempotent via data-faqWired so re-renders don't stack.
function loadFaqAccordion(el: HTMLElement) {
  el.querySelectorAll<HTMLElement>('details.ru2-faqb-item > summary').forEach((summary) => {
    if (summary.dataset.faqWired === '1') return
    summary.dataset.faqWired = '1'
    summary.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      const details = summary.closest('details')
      if (details) details.open = !details.open
    })
  })
}

// Navbar search — client-side. Fetches the product list once (shared across the
// desktop + mobile inputs), then filters by name on each keystroke and shows a
// results dropdown; clicking a result opens /product/{id}. No per-keystroke
// network calls. Bails out inside the builder.
let _searchProductsPromise: Promise<any[]> | null = null
function _fetchAllProducts(companyId?: number): Promise<any[]> {
  if (_searchProductsPromise) return _searchProductsPromise
  const url = companyId ? `/api/products?companyId=${companyId}` : '/api/products'
  _searchProductsPromise = fetch(url)
    .then((r) => (r.ok ? r.json() : []))
    .then((list) => (Array.isArray(list) ? list : []))
    .catch(() => [])
  return _searchProductsPromise
}

function loadSearch(el: HTMLElement, companyId?: number) {
  if (document.getElementById('page-builder-wrapper')) return // never in the builder
  const input = el as HTMLInputElement
  if (input.dataset.searchWired === '1') return
  input.dataset.searchWired = '1'

  const wrapper = input.closest('div')
  if (!wrapper) return
  wrapper.style.position = 'relative'

  const dropdown = document.createElement('div')
  dropdown.setAttribute('data-search-results', '1')
  dropdown.style.cssText =
    'position:absolute;top:calc(100% + 6px);left:0;width:100%;background:#fff;border:1px solid #e2e8f0;border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,0.12);max-height:360px;overflow-y:auto;z-index:1000;display:none;'
  wrapper.appendChild(dropdown)

  let products: any[] = []
  _fetchAllProducts(companyId).then((list) => { products = list })

  function currentMatches(): any[] {
    const q = input.value.trim().toLowerCase()
    if (!q) return []
    return products.filter((p) => String(p.name ?? '').toLowerCase().includes(q))
  }

  function render(items: any[]) {
    if (!items.length) {
      dropdown.innerHTML =
        '<div style="padding:12px 14px;color:#6b7280;font-size:13px;">No products found</div>'
      return
    }
    dropdown.innerHTML = items.slice(0, 8).map((p) => {
      const img = productImageSrc(p.image)
      const price = p.price != null && p.price !== '' ? `$${Number(p.price).toFixed(2)}` : ''
      return `<a href="/product/${p.id}" style="display:flex;align-items:center;gap:10px;padding:8px 12px;text-decoration:none;color:#111827;border-bottom:1px solid #f1f5f9;">
        ${img ? `<img src="${img}" alt="" style="width:36px;height:36px;object-fit:contain;border-radius:4px;background:#f8fafc;flex-shrink:0;" />` : ''}
        <span style="font-size:13px;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${p.name ?? ''}</span>
        <span style="font-size:13px;color:#6b7280;flex-shrink:0;">${price}</span>
      </a>`
    }).join('')
  }

  input.addEventListener('input', () => {
    if (!input.value.trim()) { dropdown.style.display = 'none'; return }
    render(currentMatches())
    dropdown.style.display = 'block'
  })

  input.addEventListener('keydown', (e) => {
    if ((e as KeyboardEvent).key === 'Enter') {
      const first = currentMatches()[0]
      if (first) window.location.href = `/product/${first.id}`
    }
  })

  document.addEventListener('click', (e) => {
    if (!wrapper.contains(e.target as Node)) dropdown.style.display = 'none'
  })
}

const HANDLERS: Record<string, (el: HTMLElement, companyId?: number) => void> =
  {
    loadCategories,
    loadDynamicNav,
    loadLogoNav,
    loadNavOverflow,
    loadSlider,
    loadCartCount,
    loadAuthState,
    loadSearch,
    loadFaqAccordion,
  }

// Tracks the companyId passed to the most recent hydrateComponents() call so
// the MutationObserver below (which lives for the page's lifetime) can hydrate
// late-arriving elements with the right context instead of a stale closure value.
let _lastCompanyId: number | undefined

function hydrateElement(el: HTMLElement, companyId?: number) {
  const onMount = el.dataset.onMount
  if (!onMount) return
  const handler = HANDLERS[onMount]
  if (!handler) {
    console.warn(`[Rubikx] No handler registered for: ${onMount}`)
    return
  }
  handler(el, companyId)
}

export function hydrateComponents(companyId?: number) {
  _lastCompanyId = companyId
  // Inject responsive navbar CSS for the live Odoo site (where main.css is not loaded).
  // main.css covers the builder; this covers the live site. Same selectors, same rules.
  if (!document.getElementById('rubikx-nav-styles')) {
    const s = document.createElement('style')
    s.id = 'rubikx-nav-styles'
    s.textContent = `
[data-nav-mobile]{display:none}
[data-nav-desktop]{display:grid}
@media(max-width:1024px){
  [data-nav-mobile]{display:flex!important}
  [data-nav-desktop]{display:none!important}
  [data-nav-desktop-lower]{display:none!important}
}`
    document.head.appendChild(s)
  }

  if (!document.getElementById('rubikx-stats-styles')) {
    const ss = document.createElement('style')
    ss.id = 'rubikx-stats-styles'
    ss.textContent = `
@media(max-width:768px){
  [data-ru1-stats-grid]{grid-template-columns:repeat(2,1fr)!important}
  [data-ru2-stats-grid]{grid-template-columns:repeat(2,1fr)!important;gap:20px!important}
  [data-ru2-stats-grid]>div{border-left:none!important}
  [data-ru4-stats-outer]{grid-template-columns:1fr!important}
  [data-ru3-stats-row]{flex-direction:column!important}
  [data-ru3-stats-sep]{display:none!important}
}
@media(max-width:480px){
  [data-ru1-stats-grid]{grid-template-columns:1fr!important;gap:12px!important}
  [data-ru2-stats-grid]{grid-template-columns:1fr!important;gap:0!important}
  [data-ru2-stats-grid]>div{border-top:1px solid rgba(0,0,0,0.08);padding-top:20px!important}
  [data-ru2-stats-grid]>div:first-child{border-top:none!important;padding-top:0!important}
  [data-ru4-stats-inner]{grid-template-columns:1fr!important}
}`
    document.head.appendChild(ss)
  }

  if (!document.getElementById('rubikx-cat-styles')) {
    const style = document.createElement('style')
    style.id = 'rubikx-cat-styles'
    style.textContent = `
  [data-cat-nav][data-mega]:hover [data-cat-dropdown] { display: flex !important; flex-wrap: wrap; min-width: 500px; padding: 12px; gap: 0; }
  [data-cat-nav]:not([data-mega]):hover [data-cat-dropdown] { display: block !important; min-width: 200px; padding: 8px 0; }
  [data-cat-nav][data-mega] [data-cat-dropdown] > div { min-width: 150px; flex: 1 1 150px; padding: 4px 8px; }
  [data-cat-nav][data-mega] [data-cat-dropdown] .rubikx-mega-header a { font-weight: 600; font-size: 13px; padding: 4px 8px 2px; display: block; border-bottom: 1px solid #f0f0f0; margin-bottom: 4px; color: #111; }
  [data-cat-nav][data-mega] [data-cat-dropdown] > div > div a { font-size: 12px; color: #555; padding: 2px 8px; display: block; }
  [data-cat-nav] [data-cat-dropdown] a { text-decoration: none; color: #111; font-size: 13px; }
  [data-cat-nav] [data-cat-dropdown] a:hover { color: #000; opacity: 0.7; }
  [data-cat-parent]:hover > [data-cat-flyout] { display: block !important; }
  /* Ru5-Dynamic-Navbar only (scoped via the nav[data-rubikx-component=
     "DynamicCategoryNav"] ancestor) — the mega dropdown spans the full
     header width instead of only as wide as its own columns, matching the
     reference design. Scoped rather than widened on the shared
     [data-cat-nav][data-mega] rule above so Ru3-Mega-Header's own
     (unscoped, >6-category) mega dropdown keeps its current content-width
     sizing and local positioning untouched. */
  nav[data-rubikx-component="DynamicCategoryNav"] { position: relative; }
  nav[data-rubikx-component="DynamicCategoryNav"] [data-cat-nav][data-mega] { position: static !important; }
  nav[data-rubikx-component="DynamicCategoryNav"] [data-cat-nav][data-mega]:hover [data-cat-dropdown] { left: 0 !important; right: 0 !important; width: 100% !important; min-width: 0 !important; }
  /* Full-width box shouldn't carry the shared rule's rounded corners — at
     edge-to-edge width only the two far corners would show any rounding at
     all, which read as a mistake rather than a deliberate radius. */
  nav[data-rubikx-component="DynamicCategoryNav"] [data-cat-dropdown] { border-radius: 0 !important; }
  /* Larger type and more vertical breathing room between category rows,
     scoped to Ru5 only so Ru3-Mega-Header's own unscoped mega dropdown
     (shares .rubikx-mega-child/-header via the same >6-category branch in
     loadCategories) keeps its current sizing untouched. */
  nav[data-rubikx-component="DynamicCategoryNav"] [data-cat-dropdown] .rubikx-mega-header a { font-size: 15px !important; }
  nav[data-rubikx-component="DynamicCategoryNav"] [data-cat-dropdown] > div > div a { font-size: 14px !important; padding: 6px 8px !important; }
`
    document.head.appendChild(style)
  }

  // This script only ever loads inside this admin app (builder/dashboard) —
  // the published page gets a bare HTML fragment and never runs it, so this
  // rule never applies there and the iframe stays fully interactive by
  // default. Here in the builder, the library never attaches click/select
  // listeners to <iframe> and it visually covers the div behind it, so
  // pointer-events:none lets that first click reach the div and select the
  // block. [selected] is the exact attribute the library sets on whatever
  // element you clicked — once selected, the iframe becomes interactive again
  // so the video is actually playable while you're editing it.
  if (!document.getElementById('rubikx-yt-styles')) {
    const yt = document.createElement('style')
    yt.id = 'rubikx-yt-styles'
    yt.textContent = `
  [data-rb-yt-frame] iframe { pointer-events: none; }
  [data-rb-yt-frame][selected] iframe { pointer-events: auto; }
`
    document.head.appendChild(yt)
  }
  document
    .querySelectorAll<HTMLElement>('[data-rubikx-component]')
    .forEach((el) => hydrateElement(el, companyId))

  // Watch for components whose markup lands in the DOM after this pass — the
  // builder's async render/insert (e.g. adding the first block to an empty
  // canvas) can land slightly later than the nextTick() callers await before
  // calling hydrateComponents(), which otherwise leaves that element's
  // data-on-mount handler (CartBadge, AuthState, CategoryNav, HeroSlider) never
  // invoked at all — no retry, so it silently never hydrates.
  if (!(window as any).__rbxHydrationObserver) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType !== 1) return
          const el = node as HTMLElement
          if (el.dataset?.rubikxComponent) hydrateElement(el, _lastCompanyId)
          el.querySelectorAll?.<HTMLElement>('[data-rubikx-component]').forEach(
            (child) => hydrateElement(child, _lastCompanyId)
          )
        })
      })
    })
    observer.observe(document.body, { childList: true, subtree: true })
    ;(window as any).__rbxHydrationObserver = observer
  }
}

export default defineNuxtPlugin(() => {
  hydrateComponents()
})
