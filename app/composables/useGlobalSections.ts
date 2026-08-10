export const NAVBAR_TITLES = ['Mega-menu-Header', 'Ru2-Mega-Menu-Header', 'Ru3-Mega-Header', 'Ru4-Navbar', 'Ru1 Techwire Navbar', 'Ru1 Homepage Navbar', 'Ru1-Navbar', 'Ru2-Home-Navbar', 'Ru3-Home-Navbar', 'Ru4 Homepage Navbar']
export const FOOTER_TITLES = ['Ru1 Techwire Footer', 'Footer-1', 'Ru1 Homepage Footer', 'Ru1-Footer', 'Ru2-Footer', 'Ru3-Footer', 'Ru4-Footer', 'Ru5-Footer', 'Ru2-Home-Footer', 'Ru3-Home-Footer', 'Ru4 Homepage Footer']

// Shop theme mockup blocks (product grid/filters/breadcrumb) — live product data
// replaces these on the real storefront, so they're stripped out at publish time.
export const SHOP_TITLES = ['Ru1 Shop Hero', 'Ru1 Shop Content', 'Ru2 Shop Header', 'Ru2 Shop Filters', 'Ru2 Shop Products']

export interface ShopPublishSplit {
  // Sent under the page's own key. Never section content — just the style/script
  // preamble (always non-empty when the page has any saved content), because the
  // CMS proxy 400s on an empty `value`.
  mainHtml: string
  // Sent under the 'shop-header'/'shop-footer' keys, same way global-header/
  // global-footer are their own keys. Always non-empty — the CMS rejects a
  // truly empty value — but when there's no banner this is an HTML comment,
  // not the style/script preamble. The live storefront's shopHeaderHtml/
  // shopFooterHtml computeds run this through DOMPurify.sanitize() and use
  // v-if/v-else on the result to decide whether to show a legacy fallback
  // banner instead; DOMPurify strips comments to '' by default but may keep a
  // bare <style> tag, so sending the preamble here would make that check
  // falsely truthy and permanently hide the fallback banner even when this
  // shop page never had a builder banner at all.
  shopHeaderHtml: string
  shopFooterHtml: string
}

// Publish-time only — the builder's own Save flow must keep the shop mockup blocks
// so the editor canvas round-trips correctly. The Publish payload additionally
// splits whatever banners the user placed above/below the shop mockup blocks into
// their own shop-header/shop-footer values so the live storefront knows where to
// inject the real product grid.
//
// mainHtml is always the full, unmodified page content — same as every other
// page's publish — never just the preamble. It doesn't matter that the live
// storefront never reads the plain "shop" key: publishing a stripped-down version
// under the same version number as the draft made that record win version ties
// (published beats draft at equal version), so reopening the page to edit again
// loaded the stripped record instead of the real content. Keeping mainHtml == the
// real content means draft and published are never in conflict.
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

  // The caller only invokes this for the dedicated "shop" page (gated by
  // page.id in index.vue), so zero shop-mockup blocks here just means "no
  // product-grid position to split around yet" — not an unrelated page. Treat
  // the whole page as header content rather than routing it to the "shop" key,
  // which the live storefront never reads, so a banner-only shop page still
  // reaches the live site.
  const headerSecs = shopIndices.length === 0 ? sections : sections.slice(0, shopIndices[0])
  const footerSecs = shopIndices.length === 0 ? [] : sections.slice(shopIndices[shopIndices.length - 1] + 1)

  // Zero sections → publish an HTML comment, not the preamble. Still
  // non-empty (satisfies the CMS), but sanitizes down to '' on the storefront
  // (DOMPurify strips comments), so a removed banner is published as an
  // explicit clear that correctly falls back to the storefront's own default
  // banner — instead of either silently skipping the update (leaves the old
  // banner live forever) or sending real markup that reads as truthy and
  // permanently hides that fallback.
  const build = (secs: Element[]) =>
    secs.length ? [preamble, secs.map(s => s.outerHTML).join('\n')].filter(Boolean).join('\n') : '<!-- cleared -->'

  return {
    mainHtml: html,
    shopHeaderHtml: build(headerSecs),
    shopFooterHtml: build(footerSecs),
  }
}
