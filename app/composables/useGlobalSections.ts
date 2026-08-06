export const NAVBAR_TITLES = ['Mega-menu-Header', 'Ru2-Mega-Menu-Header', 'Ru3-Mega-Header', 'Ru4-Navbar', 'Ru1 Techwire Navbar', 'Ru1 Homepage Navbar', 'Ru1-Navbar', 'Ru2-Home-Navbar', 'Ru3-Home-Navbar', 'Ru4 Homepage Navbar']
export const FOOTER_TITLES = ['Ru1 Techwire Footer', 'Footer-1', 'Ru1 Homepage Footer', 'Ru1-Footer', 'Ru2-Footer', 'Ru3-Footer', 'Ru4-Footer', 'Ru2-Home-Footer', 'Ru3-Home-Footer', 'Ru4 Homepage Footer']

// Shop theme mockup blocks (product grid/filters/breadcrumb) — live product data
// replaces these on the real storefront, so they're stripped out at publish time.
export const SHOP_TITLES = ['Ru1 Shop Hero', 'Ru1 Shop Content', 'Ru2 Shop Header', 'Ru2 Shop Filters', 'Ru2 Shop Products']

export interface ShopPublishSplit {
  // Sent under the page's own key. Never section content — just the style/script
  // preamble (always non-empty when the page has any saved content), because the
  // CMS proxy 400s on an empty `value`.
  mainHtml: string
  // Sent under the 'shop-header'/'shop-footer' keys, same way global-header/
  // global-footer are their own keys — empty string when the user added no banner
  // on that side, so the caller knows to skip posting it.
  shopHeaderHtml: string
  shopFooterHtml: string
}

// Publish-time only — the builder's own Save flow must keep the shop mockup blocks
// so the editor canvas round-trips correctly. Only the Publish payload drops them,
// splitting whatever banners the user placed above/below into their own
// shop-header/shop-footer values so the live storefront knows where to inject the
// real product grid.
export function splitShopSectionsForPublish(html: string): ShopPublishSplit {
  if (!html) return { mainHtml: html, shopHeaderHtml: '', shopFooterHtml: '' }

  const doc = new DOMParser().parseFromString(html, 'text/html')
  const sections = Array.from(doc.querySelectorAll('section[data-component-title]'))
  const shopIndices = sections
    .map((s, i) => (SHOP_TITLES.includes(s.getAttribute('data-component-title') ?? '') ? i : -1))
    .filter(i => i !== -1)

  // DOMParser hoists leading <style>/<script> tags into <head> per HTML5 parsing
  // rules (before the first real body content), so both containers need checking.
  const preamble = Array.from(doc.querySelectorAll('head > style, head > script, body > style, body > script'))
    .map(el => el.outerHTML)
    .join('\n')

  if (shopIndices.length === 0) return { mainHtml: html, shopHeaderHtml: '', shopFooterHtml: '' }

  const firstIdx = shopIndices[0]
  const lastIdx = shopIndices[shopIndices.length - 1]
  const headerSecs = sections.slice(0, firstIdx)
  const footerSecs = sections.slice(lastIdx + 1)

  const build = (secs: Element[]) =>
    secs.length ? [preamble, secs.map(s => s.outerHTML).join('\n')].filter(Boolean).join('\n') : ''

  return {
    mainHtml: preamble,
    shopHeaderHtml: build(headerSecs),
    shopFooterHtml: build(footerSecs),
  }
}
