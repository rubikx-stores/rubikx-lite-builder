import type { FieldConfig } from '../editor/useBlockRegistry'
import { fontField, fontCss } from '../editor/fontFields'
import { icon } from '../useIconSvg'
import {
  megaMenuHeaderDefaults, megaMenuHeaderFields, renderMegaMenuHeader,
  ru1FooterDefaults as layoutFooter1Defaults, ru1FooterFields as layoutFooter1Fields, renderRu1Footer as renderLayoutFooter1,
  ru1StatsDefaults, ru1StatsFields, renderRu1Stats,
  ru2StatsDefaults, ru2StatsFields, renderRu2Stats,
  ru3StatsDefaults, ru3StatsFields, renderRu3Stats,
  ru4StatsDefaults, ru4StatsFields, renderRu4Stats,
  ru5ImageCarouselDefaults, ru5ImageCarouselFields, renderRu5ImageCarousel,
  ru6SplitHeroDefaults, ru6SplitHeroFields, renderRu6SplitHero,
} from '../layouts/components'

export const ru1NavbarSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 277.5 40">
  <rect fill="#1f2937" x="0" y="0" width="277.5" height="40"/>
  <rect fill="#9ca3af" x="8" y="7" width="36" height="7" rx="1"/>
  <rect fill="#374151" x="100" y="6" width="77" height="9" rx="4"/>
  <rect fill="#4b5563" x="200" y="7" width="22" height="7" rx="2"/>
  <rect fill="#4b5563" x="228" y="7" width="22" height="7" rx="2"/>
  <rect fill="#6b7280" x="8" y="24" width="25" height="4" rx="1"/>
  <rect fill="#6b7280" x="42" y="24" width="22" height="4" rx="1"/>
  <rect fill="#6b7280" x="72" y="24" width="28" height="4" rx="1"/>
  <rect fill="#6b7280" x="108" y="24" width="32" height="4" rx="1"/>
</svg>`

export interface ThemeSection {
  id: null
  title: string
  html_code: string
}

const placeholderSvg = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 150"><rect fill="#394152" width="200" height="150"/><polygon fill="#718096" points="65 90 90 60 115 90"/><polygon fill="#718096" points="110 90 122.5 75 135 90"/><circle fill="#718096" cx="122.5" cy="64" r="4"/></svg>')}`

export const ru1HomepageSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 340" width="100%" height="100%">
  <rect fill="#394152" x="0" y="0" width="280" height="18"/>
  <rect fill="#718096" x="8" y="6" width="30" height="5"/>
  <rect fill="#718096" x="180" y="6" width="18" height="5"/>
  <rect fill="#718096" x="203" y="6" width="18" height="5"/>
  <rect fill="#718096" x="226" y="6" width="18" height="5"/>
  <rect fill="#718096" x="250" y="6" width="22" height="5"/>
  <rect fill="#394152" x="0" y="26" width="280" height="75"/>
  <polygon fill="#718096" points="80 85 115 50 150 85 80 85"/>
  <polygon fill="#718096" points="145 85 163 65 181 85 145 85"/>
  <circle fill="#718096" cx="163" cy="56" r="6"/>
  <rect fill="#394152" x="0" y="112" width="90" height="7"/>
  <rect fill="#394152" x="0" y="128" width="62" height="56"/>
  <rect fill="#394152" x="73" y="128" width="62" height="56"/>
  <rect fill="#394152" x="146" y="128" width="62" height="56"/>
  <rect fill="#394152" x="219" y="128" width="61" height="56"/>
  <polygon fill="#718096" points="8 174 22 155 36 174 8 174"/>
  <polygon fill="#718096" points="81 174 95 155 109 174 81 174"/>
  <polygon fill="#718096" points="154 174 168 155 182 174 154 174"/>
  <polygon fill="#718096" points="227 174 241 155 255 174 227 174"/>
  <rect fill="#394152" x="0" y="192" width="55" height="4"/>
  <rect fill="#394152" x="73" y="192" width="55" height="4"/>
  <rect fill="#394152" x="146" y="192" width="55" height="4"/>
  <rect fill="#394152" x="219" y="192" width="55" height="4"/>
  <rect fill="#394152" x="0" y="202" width="30" height="3"/>
  <rect fill="#394152" x="73" y="202" width="30" height="3"/>
  <rect fill="#394152" x="146" y="202" width="30" height="3"/>
  <rect fill="#394152" x="219" y="202" width="30" height="3"/>
  <rect fill="#394152" x="0" y="224" width="280" height="78"/>
  <rect fill="#718096" x="8" y="234" width="55" height="4"/>
  <rect fill="#718096" x="8" y="244" width="45" height="3"/>
  <rect fill="#718096" x="8" y="252" width="50" height="3"/>
  <rect fill="#718096" x="8" y="260" width="40" height="3"/>
  <rect fill="#718096" x="100" y="234" width="55" height="4"/>
  <rect fill="#718096" x="100" y="244" width="45" height="3"/>
  <rect fill="#718096" x="100" y="252" width="50" height="3"/>
  <rect fill="#718096" x="192" y="234" width="55" height="4"/>
  <rect fill="#718096" x="192" y="244" width="50" height="3"/>
  <rect fill="#718096" x="192" y="252" width="45" height="3"/>
  <rect fill="#718096" x="90" y="285" width="100" height="3"/>
</svg>`

// ─── Navbar block editor data ───────────────────────────────────────────────

export interface NavLink { label: string; url: string; visible?: boolean }

export interface Ru1NavbarData {
  logoUrl: string
  brandName: string
  logoWidth: number
  logoAlign: string
  brandFontSize: number
  brandFontWeight: string
  bgColor: string
  sticky: boolean
  showSearch: boolean
  searchPlaceholder: string
  searchAlign: string
  searchWidth: number
  navLinks: NavLink[]
  dynamicCategories: boolean
  navLinksAlign: string
  linkColor: string
  linkFontSize: number
  linkFontWeight: string
  showSignIn: boolean
  signInLabel: string
  signInUrl: string
  showContactUs: boolean
  contactUsLabel: string
  contactUsUrl: string
  showCart: boolean
  cartUrl: string
  buttonsAlign: string
  textColor: string
  fontSize: number
  fontWeight: string
  paddingY: number
  paddingX: number
  borderStyle: string
  borderWidth: number
  borderColor: string
  fontFamily: string
  brandFont: string
  linkFont: string
  buttonFont: string
}

export const ru1NavbarDefaults: Ru1NavbarData = {
  logoUrl: '',
  brandName: 'Your Logo',
  logoWidth: 120,
  logoAlign: 'left',
  brandFontSize: 20,
  brandFontWeight: '700',
  bgColor: '#ffffff',
  sticky: false,
  showSearch: true,
  searchPlaceholder: 'Search...',
  searchAlign: 'center',
  searchWidth: 560,
  navLinks: [
    { label: 'Home', url: '/', visible: true },
    { label: 'Shop', url: '/shop', visible: true },
    { label: 'About Us', url: '/aboutus', visible: true },
  ],
  dynamicCategories: true,
  navLinksAlign: 'lower-left',
  linkColor: '#111827',
  linkFontSize: 14,
  linkFontWeight: '500',
  showSignIn: true,
  signInLabel: 'Sign In',
  signInUrl: '/login',
  showContactUs: true,
  contactUsLabel: 'Contact Us',
  contactUsUrl: '/contactus',
  showCart: true,
  cartUrl: '/cart',
  buttonsAlign: 'right',
  textColor: '#111827',
  fontSize: 14,
  fontWeight: '500',
  paddingY: 0,
  paddingX: 16,
  borderStyle: 'solid',
  borderWidth: 1,
  borderColor: '#374151',
  fontFamily: '',
  brandFont: '',
  linkFont: '',
  buttonFont: '',
}

export const ru1NavbarFields: FieldConfig[] = [
  { key: '_h_font', label: 'Font', type: 'header' },
  fontField('fontFamily', 'Font Family'),

  { key: '_h_branding', label: 'Branding', type: 'header' },
  { key: 'logoUrl', label: 'Logo Image', type: 'image', noAspectRatio: true },
  { key: 'brandName', label: 'Brand Name', type: 'text' },
  { key: 'logoWidth', label: 'Logo Width (px)', type: 'number', step: 4, placeholder: '120' },
  { key: 'logoAlign', label: 'Logo Position', type: 'select', options: ['left', 'center', 'right'] },
  { key: 'brandFontSize', label: 'Brand Font Size (px)', type: 'number', step: 1, placeholder: '20' },
  { key: 'brandFontWeight', label: 'Brand Font Weight', type: 'select', options: ['300', '400', '500', '600', '700', '800'] },
  fontField('brandFont', 'Brand Font'),

  { key: '_h_navigation', label: 'Navigation', type: 'header' },
  {
    key: 'navLinks', label: 'Nav Links', type: 'list',
    listFields: [
      { key: 'label', label: 'Label', type: 'text' },
      { key: 'url', label: 'URL', type: 'url' },
      { key: 'visible', label: 'Visible', type: 'toggle' },
    ],
  },
  { key: 'navLinksAlign', label: 'Links Position', type: 'select', options: ['left', 'center', 'right', 'lower-left', 'lower-center', 'lower-right'] },
  { key: 'dynamicCategories', label: 'Dynamic Categories', type: 'toggle' },
  { key: 'linkColor', label: 'Link Colour', type: 'color' },
  { key: 'linkFontSize', label: 'Link Font Size (px)', type: 'number', step: 1, placeholder: '14' },
  { key: 'linkFontWeight', label: 'Link Font Weight', type: 'select', options: ['300', '400', '500', '600', '700', '800'] },
  fontField('linkFont', 'Link Font'),
  { key: 'showSearch', label: 'Show Search Bar', type: 'toggle' },
  { key: 'searchPlaceholder', label: 'Search Placeholder', type: 'text' },
  { key: 'searchAlign', label: 'Search Position', type: 'select', options: ['left', 'center', 'right'] },
  { key: 'searchWidth', label: 'Search Width (px)', type: 'number', unit: 'px', step: 10, placeholder: '220' },

  { key: '_h_buttons', label: 'Buttons', type: 'header' },
  { key: 'showSignIn', label: 'Show Sign In', type: 'toggle' },
  { key: 'signInLabel', label: 'Sign In Label', type: 'text' },
  { key: 'signInUrl', label: 'Sign In URL', type: 'url' },
  { key: 'showContactUs', label: 'Show Contact Us', type: 'toggle' },
  { key: 'contactUsLabel', label: 'Contact Us Label', type: 'text' },
  { key: 'contactUsUrl', label: 'Contact Us URL', type: 'url' },
  { key: 'showCart', label: 'Show Cart Icon', type: 'toggle' },
  { key: 'cartUrl', label: 'Cart URL', type: 'url' },
  { key: 'buttonsAlign', label: 'Buttons Position', type: 'select', options: ['left', 'center', 'right'] },
  fontField('buttonFont', 'Button Font'),

  { key: '_h_style', label: 'Style', type: 'header' },
  { key: 'bgColor', label: 'Background Colour', type: 'color' },
  { key: 'fontSize', label: 'Font Size (px)', type: 'number', step: 1, placeholder: '14' },
  { key: 'fontWeight', label: 'Font Weight', type: 'select', options: ['300', '400', '500', '600', '700', '800'] },

  { key: '_h_layout', label: 'Layout', type: 'header' },
  { key: 'paddingY', label: 'Vertical Padding (px)', type: 'number', step: 4, placeholder: '12' },
  { key: 'paddingX', label: 'Horizontal Padding (px)', type: 'number', step: 4, placeholder: '16' },
  { key: 'sticky', label: 'Sticky Navbar', type: 'toggle' },
  { key: 'borderStyle', label: 'Border Style', type: 'select', options: ['none', 'solid', 'dashed', 'dotted'] },
  { key: 'borderWidth', label: 'Border Width (px)', type: 'number', step: 1, placeholder: '1' },
  { key: 'borderColor', label: 'Border Colour', type: 'color' },
]

export function renderRu1Navbar(data: Ru1NavbarData): string {
  const navStyle = [
    `background:${data.bgColor}`,
    `color:${data.textColor}`,
    `padding:0 ${data.paddingX}px`,
  ].filter(Boolean).join(';')

  const topRowBorder = data.borderStyle !== 'none'
    ? `border-bottom:${data.borderWidth}px ${data.borderStyle} ${data.borderColor};`
    : ''

  const logoInner = data.logoUrl
    ? `<img src="${data.logoUrl}" alt="${data.brandName}" style="width:${data.logoWidth}px;height:auto;display:block;" />`
    : `<span data-field-key="brandName" style="font-size:${data.brandFontSize}px;font-weight:${data.brandFontWeight};color:inherit;${fontCss(data.brandFont, data.fontFamily)}">${data.brandName}</span>`
  const logoEl = `<a href="/" style="text-decoration:none;color:inherit;display:flex;align-items:center;">${logoInner}</a>`

  const linkStyle = `color:${data.linkColor};font-size:1rem;text-decoration:none;display:inline-flex;align-items:center;border-radius:0.375rem;padding:0.5rem 0;${fontCss(data.linkFont, data.fontFamily)}`

  const searchW = data.searchWidth || 420
  const searchEl = data.showSearch
    ? `<div style="display:flex;align-items:center;border:1px solid #e2e8f0;border-radius:8px;padding:0.5rem 0.875rem;gap:0.5rem;width:${searchW}px;max-width:100%;min-width:0;">
        ${icon('magnifyingGlass', { size: 16, stroke: '#3b82f6', style: 'flex-shrink:0;' })}
        <input type="text" placeholder="${data.searchPlaceholder}" style="border:none;outline:none;background:transparent;font-size:0.875rem;width:100%;color:#3b82f6;min-width:0;" />
      </div>`
    : ''

  const buttonsArr = [
    data.showSignIn ? `<a href="${data.signInUrl}" data-auth-signin-btn="true" style="color:${data.textColor};font-size:0.875rem;text-decoration:none;border:1px solid ${data.textColor};border-radius:0.375rem;padding:0.375rem 1rem;display:inline-flex;align-items:center;background:#fff;box-shadow:0 1px 2px 0 rgba(0,0,0,0.05);cursor:pointer;white-space:nowrap;flex-shrink:0;${fontCss(data.buttonFont, data.fontFamily)}">${data.signInLabel}</a>` : '',
    data.showContactUs ? `<a href="${data.contactUsUrl}" style="color:${data.textColor};font-size:0.875rem;text-decoration:none;border:1px solid ${data.textColor};border-radius:0.375rem;padding:0.375rem 1rem;display:inline-flex;align-items:center;background:#fff;box-shadow:0 1px 2px 0 rgba(0,0,0,0.05);cursor:pointer;white-space:nowrap;flex-shrink:0;${fontCss(data.buttonFont, data.fontFamily)}">${data.contactUsLabel}</a>` : '',
    data.showCart
      ? `<span data-rubikx-component="CartBadge" data-on-mount="loadCartCount" data-cart-url="${data.cartUrl}" data-text-color="${data.textColor}" style="position:relative;display:inline-flex;flex-shrink:0;"><a href="${data.cartUrl}" style="color:${data.textColor};display:inline-flex;">${icon('shoppingCart')}</a></span>`
      : '',
    data.showSignIn ? `<span data-rubikx-component="AuthState" data-on-mount="loadAuthState" data-sign-in-url="${data.signInUrl}" data-profile-url="/me/personal" style="position:relative;display:none;align-items:center;flex-shrink:0;"></span>` : '',
  ].filter(Boolean)
  const buttonsEl = buttonsArr.length
    ? `<div style="display:flex;align-items:center;flex-wrap:nowrap;flex-shrink:0;gap:1.5rem;">${buttonsArr.join('')}</div>`
    : ''

  const visibleNavLinks = data.navLinks.filter(l => l.visible !== false)
  const staticLinks = visibleNavLinks.map(l => `<div style="position:relative;"><a href="${l.url}" style="${linkStyle}">${l.label}</a></div>`).join('')
  const dynamicPlaceholder = data.dynamicCategories
    ? `<div
        data-rubikx-component='CategoryNav'
        data-on-mount='loadCategories'
        data-max-items='20'
        data-link-color='${data.linkColor}'
        data-font-size='${data.linkFontSize}'
        data-font-weight='${data.linkFontWeight}'
        style='position:relative;display:inline-block;' data-cat-nav='true'
      >
        <a style='${linkStyle}cursor:pointer;'>Categories ▾</a>
        <div data-cat-dropdown='true' style='display:none;position:absolute;top:100%;left:0;background:#fff;min-width:200px;box-shadow:0 4px 12px rgba(0,0,0,0.1);border-radius:8px;padding:8px 0;z-index:100;margin-top:-2px;padding-top:4px;'>
          <span style='display:block;padding:8px 16px;color:#999;font-size:12px;font-style:italic;'>⟳ Load Categories</span>
        </div>
      </div>`
    : ''
  const linksEl = (staticLinks || dynamicPlaceholder)
    ? `<nav style="display:flex;flex-wrap:wrap;align-items:center;gap:0.75rem;">${staticLinks}${dynamicPlaceholder}</nav>`
    : ''

  const lowerJustifyMap: Record<string, string> = {
    'lower-left': 'flex-start',
    'lower-center': 'center',
    'lower-right': 'flex-end',
  }
  const isLowerLinks = data.navLinksAlign in lowerJustifyMap

  const cols: Record<string, string[]> = { left: [], center: [], right: [] }
  const put = (zone: string, el: string) => { if (el && zone in cols) cols[zone].push(el) }
  put(data.logoAlign,    logoEl)
  if (!isLowerLinks) put(data.navLinksAlign, linksEl)
  put(data.searchAlign,  searchEl)
  put(data.buttonsAlign, buttonsEl)

  const zone = (items: string[], justify: string) =>
    `<div style="display:flex;align-items:center;gap:0.75rem;justify-content:${justify};">${items.join('')}</div>`

  const lowerRow = isLowerLinks && linksEl
    ? `<div style="margin:0 auto;display:flex;align-items:center;justify-content:${lowerJustifyMap[data.navLinksAlign]};padding:0.5rem 0;gap:0.75rem;">${linksEl}</div>`
    : ''

  const sectionStyle = fontCss(undefined, data.fontFamily) + (data.sticky ? 'position:sticky;top:0;z-index:9999' : '')

  const mobileDrawerLinks = visibleNavLinks.map(l =>
    `<a href="${l.url}" style="display:block;padding:0.75rem 0;font-size:1.125rem;font-weight:500;color:${data.textColor};text-decoration:none;border-bottom:1px solid #f3f4f6;">${l.label}</a>`
  ).join('')

  const mobileSearchEl = data.showSearch
    ? `<div style="display:flex;align-items:center;border:1px solid #e5e7eb;border-radius:0.375rem;padding:0 0.5rem;gap:0.5rem;background:#fff;margin-bottom:1rem;">
        ${icon('magnifyingGlass', { size: 20, stroke: '#1e40af', style: 'flex-shrink:0;' })}
        <input type="text" placeholder="${data.searchPlaceholder}" style="border:none;outline:none;background:#fff;font-size:0.875rem;width:100%;color:#3b82f6;padding:0.5rem 0;" />
      </div>`
    : ''

  const mobileNav = `
<style>
  [data-nav-mobile] { display: none; }
  [data-nav-desktop] { display: grid; }
  [data-nav-desktop-lower] { display: block; }
  @media (max-width: 1024px) {
    [data-nav-mobile] { display: flex !important; }
    [data-nav-desktop] { display: none !important; }
    [data-nav-desktop-lower] { display: none !important; }
  }
</style>
<!-- Mobile header -->
<div data-nav-mobile="true" style="display:none;align-items:center;justify-content:space-between;padding:1.25rem ${data.paddingX}px;border-bottom:1px solid ${data.borderColor || '#374151'};">
  ${logoEl}
  <div style="display:flex;align-items:center;gap:1rem;">
    ${data.showCart ? `<span data-rubikx-component="CartBadge" data-on-mount="loadCartCount" data-cart-url="${data.cartUrl}" data-text-color="${data.textColor}" style="position:relative;display:inline-flex;"><a href="${data.cartUrl}" style="color:${data.textColor};display:inline-flex;">${icon('shoppingCart')}</a></span>` : ''}
    <button onclick="(function(btn){var s=btn.closest('section');var d=s&&s.querySelector('[data-mobile-drawer]');var o=s&&s.querySelector('[data-mobile-overlay]');if(d){d.style.transform='translateX(0)';}if(o){o.style.display='block';}document.body.style.overflow='hidden';})(this);event.stopPropagation();" style="background:none;border:none;cursor:pointer;padding:0;display:inline-flex;align-items:center;">
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="${data.textColor}" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
    </button>
  </div>
</div>

<!-- Drawer -->
<div data-mobile-drawer="true" style="position:fixed;top:0;left:0;width:320px;max-width:85vw;height:100vh;background:#fff;z-index:99999;transform:translateX(-100%);transition:transform 0.3s ease;box-shadow:4px 0 24px rgba(0,0,0,0.15);overflow-y:auto;padding:1.5rem;">
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.5rem;">
    ${logoEl}
    <button onclick="(function(btn){var d=document.querySelector('[data-mobile-drawer]');var o=document.querySelector('[data-mobile-overlay]');if(d){d.style.transform='translateX(-100%)';}if(o){o.style.display='none';}document.body.style.overflow='';})(this);event.stopPropagation();" style="background:none;border:none;cursor:pointer;padding:0.25rem;display:flex;align-items:center;">
      ${icon('xMark', { size: 24, stroke: data.textColor })}
    </button>
  </div>
  ${mobileSearchEl}
  <div style="display:flex;flex-direction:column;">
    ${mobileDrawerLinks}
    ${data.dynamicCategories ? `<a style="display:block;padding:0.75rem 0;font-size:1.125rem;font-weight:500;color:${data.textColor};text-decoration:none;border-bottom:1px solid #f3f4f6;cursor:pointer;">Categories</a>` : ''}
  </div>
  <div style="display:flex;flex-direction:column;gap:0.75rem;margin-top:1.5rem;">
    ${data.showContactUs ? `<a href="${data.contactUsUrl}" style="display:flex;align-items:center;justify-content:center;border:1px solid ${data.textColor};border-radius:0.375rem;padding:0.625rem 1rem;font-size:0.875rem;font-weight:500;color:${data.textColor};text-decoration:none;${fontCss(data.buttonFont, data.fontFamily)}">${data.contactUsLabel}</a>` : ''}
    ${data.showSignIn ? `<a href="${data.signInUrl}" data-auth-signin-btn="true" style="display:flex;align-items:center;justify-content:center;border:1px solid ${data.textColor};border-radius:0.375rem;padding:0.625rem 1rem;font-size:0.875rem;font-weight:500;color:${data.textColor};text-decoration:none;${fontCss(data.buttonFont, data.fontFamily)}">${data.signInLabel}</a>` : ''}
  </div>
</div>

<!-- Overlay -->
<div data-mobile-overlay="true" onclick="(function(el){var d=document.querySelector('[data-mobile-drawer]');if(d){d.style.transform='translateX(-100%)';}el.style.display='none';document.body.style.overflow='';})(this);" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:99998;"></div>`

  return `<section data-component-title="Ru1-Navbar" data-component-props="${encodeURIComponent(JSON.stringify(data))}"${sectionStyle ? ` style="${sectionStyle}"` : ''}>
<nav style="${navStyle}">
  ${mobileNav}
  <div data-nav-desktop="true" style="display:grid;margin:0 auto;grid-template-columns:1fr 1fr 1fr;align-items:center;gap:1rem;height:80px;${topRowBorder}">
    ${zone(cols.left,   'flex-start')}
    ${zone(cols.center, 'center')}
    ${zone(cols.right,  'flex-end')}
  </div>
  <div data-nav-desktop-lower="true">${lowerRow}</div>
</nav>
</section>`
}

// ─── Hero block editor data ──────────────────────────────────────────────────

export interface Ru1HeroData {
  imageUrl: string
  altText: string
  linkUrl: string
  aspectRatio: string
  extraHeight: number
  headline: string
  subheadline: string
  textColor: string
  textAlign: string
  overlayColor: string
  overlayOpacity: number
  ctaText: string
  ctaUrl: string
  ctaBgColor: string
  ctaTextColor: string
  bgColor: string
  paddingY: number
  paddingX: number
  borderRadius: number
  fontFamily: string
  headlineFont: string
  subheadlineFont: string
  ctaFont: string
}

export const ru1HeroDefaults: Ru1HeroData = {
  imageUrl: placeholderSvg,
  altText: 'Hero image',
  linkUrl: '',
  aspectRatio: '3.49/1',
  extraHeight: 0,
  headline: '',
  subheadline: '',
  textColor: '#ffffff',
  textAlign: 'center',
  overlayColor: '#000000',
  overlayOpacity: 30,
  ctaText: '',
  ctaUrl: '',
  ctaBgColor: '#2563eb',
  ctaTextColor: '#ffffff',
  bgColor: '#394152',
  paddingY: 0,
  paddingX: 0,
  borderRadius: 0,
  fontFamily: '',
  headlineFont: '',
  subheadlineFont: '',
  ctaFont: '',
}

export const ru1HeroFields: FieldConfig[] = [
  { key: '_h_font', label: 'Font', type: 'header' },
  fontField('fontFamily', 'Font Family'),

  { key: '_h_image', label: 'Image', type: 'header' },
  { key: 'imageUrl', label: 'Banner Image', type: 'image', noAspectRatio: true },
  { key: 'altText', label: 'Alt Text', type: 'text' },
  { key: 'linkUrl', label: 'Link URL', type: 'url' },
  { key: 'aspectRatio', label: 'Aspect Ratio', type: 'select', options: ['4/1', '3/1', '3.49/1', '16/9', '2/1', '4/3', '1/1'] },
  { key: 'extraHeight', label: 'Extra Height', type: 'number', unit: 'cm', step: 0.5, placeholder: '0' },

  { key: '_h_overlay', label: 'Overlay', type: 'header' },
  { key: 'overlayColor', label: 'Overlay Color', type: 'color' },
  { key: 'overlayOpacity', label: 'Overlay Opacity', type: 'number', unit: '%', step: 5, placeholder: '40' },

  { key: '_h_text', label: 'Text', type: 'header' },
  { key: 'headline', label: 'Headline', type: 'text' },
  fontField('headlineFont', 'Headline Font'),
  { key: 'subheadline', label: 'Subheadline', type: 'text' },
  fontField('subheadlineFont', 'Subheadline Font'),
  { key: 'textColor', label: 'Text Color', type: 'color' },
  { key: 'textAlign', label: 'Text Alignment', type: 'select', options: ['left', 'center', 'right'] },

  { key: '_h_cta', label: 'CTA Button', type: 'header' },
  { key: 'ctaText', label: 'Button Text', type: 'text' },
  { key: 'ctaUrl', label: 'Button URL', type: 'url' },
  { key: 'ctaBgColor', label: 'Button Background', type: 'color' },
  { key: 'ctaTextColor', label: 'Button Text Color', type: 'color' },
  fontField('ctaFont', 'Button Font'),

  { key: '_h_layout', label: 'Layout', type: 'header' },
  { key: 'bgColor', label: 'Section Background', type: 'color' },
  { key: 'paddingY', label: 'Vertical Padding', type: 'number', unit: 'px', step: 4, placeholder: '32' },
  { key: 'paddingX', label: 'Horizontal Padding', type: 'number', unit: 'px', step: 4, placeholder: '24' },
  { key: 'borderRadius', label: 'Corner Radius', type: 'number', unit: 'px', step: 2, placeholder: '8' },
]

function ru1HeroRatioPercent(ratio: string): number {
  const [w, h] = ratio.split('/').map(Number)
  return w > 0 && h > 0 ? (h / w) * 100 : 100
}

export function renderRu1Hero(data: Ru1HeroData): string {
  const alignItems = data.textAlign === 'left' ? 'flex-start' : data.textAlign === 'right' ? 'flex-end' : 'center'
  const ratioPercent = ru1HeroRatioPercent(data.aspectRatio)
  const boxHeight = data.extraHeight ? `calc(${ratioPercent}% + ${data.extraHeight}cm)` : `${ratioPercent}%`

  const sectionStyle = [
    fontCss(undefined, data.fontFamily),
    `background:${data.bgColor}`,
    data.paddingY ? `padding-top:${data.paddingY}px;padding-bottom:${data.paddingY}px` : '',
    data.paddingX ? `padding-left:${data.paddingX}px;padding-right:${data.paddingX}px` : '',
    data.borderRadius ? `border-radius:${data.borderRadius}px` : '',
  ].filter(Boolean).join(';')

  const overlayDiv = `<div style="position:absolute;inset:0;background:${data.overlayColor};opacity:${(data.overlayOpacity / 100).toFixed(2)};pointer-events:none"></div>`

  const ctaBtn = data.ctaText
    ? `<a href="${data.ctaUrl}" style="display:inline-block;background:${data.ctaBgColor};color:${data.ctaTextColor};padding:0.625rem 1.5rem;border-radius:0.375rem;text-decoration:none;font-weight:600;margin-top:1rem;${fontCss(data.ctaFont, data.fontFamily)}">${data.ctaText}</a>`
    : ''

  const hasText = data.headline || data.subheadline || data.ctaText
  const textLayer = hasText
    ? `<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:${alignItems};justify-content:center;padding:2rem;text-align:${data.textAlign};color:${data.textColor}">
      ${data.headline ? `<h2 data-field-key="headline" style="font-size:2.25rem;font-weight:700;margin:0;line-height:1.2;${fontCss(data.headlineFont, data.fontFamily)}">${data.headline}</h2>` : ''}
      ${data.subheadline ? `<p data-field-key="subheadline" style="font-size:1.125rem;margin:0.5rem 0 0;${fontCss(data.subheadlineFont, data.fontFamily)}">${data.subheadline}</p>` : ''}
      ${ctaBtn}
    </div>`
    : ''

  const inner = `<div style="position:relative;width:100%;height:0;padding-bottom:${boxHeight};overflow:hidden;">
    <img src="${data.imageUrl}" alt="${data.altText}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:fill;display:block;" />
    ${overlayDiv}
    ${textLayer}
  </div>`

  return `<section data-component-title="Ru1 Homepage Hero" data-component-props="${encodeURIComponent(JSON.stringify(data))}">
<div style="${sectionStyle}">
  ${data.linkUrl ? `<a href="${data.linkUrl}" style="display:block">${inner}</a>` : inner}
</div>
</section>`
}

// ─── Featured Products block editor data ────────────────────────────────────

export interface Product {
  imageUrl: string
  name: string
  price: string
  oldPrice: string
  buttonLabel: string
  buttonUrl: string
  colors: string
}

export interface Ru1ProductsData {
  sectionTitle: string
  titleAlign: string
  titleColor: string
  columns: 1 | 2 | 3 | 4 | 5 | 6
  rows: number
  products: Product[]
  bgColor: string
  paddingY: number
  paddingX: number
  cardBorderRadius: number
  hoverBorderColor: string
  buttonBgColor: string
  buttonTextColor: string
  oldPriceColor: string
  cardAnimation: boolean
  hoverEffect: string
  hoverAmount: number
  animationDuration: number
  showAddToCart: boolean
  addToCartRadius: number
  showViewProduct: boolean
  viewProductLabel: string
  viewProductBg: string
  viewProductTextColor: string
  viewProductRadius: number
  showArrowBtn: boolean
  arrowBtnBg: string
  arrowBtnColor: string
  arrowBtnPosition: 'top' | 'center' | 'bottom'
  fontFamily: string
  sectionTitleFont: string
  productNameFont: string
  priceFont: string
  buttonFont: string
}

const _colClass: Record<string, string> = {
  '1': 'grid-cols-1',
  '2': 'grid-cols-2',
  '3': 'grid-cols-2 sm:grid-cols-3',
  '4': 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-4',
  '5': 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5',
  '6': 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
}

function _gridCss(sel: string, cols: number): string {
  const m = Math.min(cols, 2)
  const t = Math.min(cols, 3)
  let css = `${sel}{display:grid;gap:1rem;grid-template-columns:repeat(${m},1fr)}`
  if (t > m) css += `@media(min-width:640px){${sel}{grid-template-columns:repeat(${t},1fr)}}`
  if (cols > t) css += `@media(min-width:1024px){${sel}{grid-template-columns:repeat(${cols},1fr)}}`
  return css
}

export const ru1ProductsDefaults: Ru1ProductsData = {
  sectionTitle: 'Featured Products',
  titleAlign: 'left',
  titleColor: '#111827',
  columns: 4,
  rows: 1,
  bgColor: '',
  paddingY: 48,
  paddingX: 16,
  cardBorderRadius: 8,
  hoverBorderColor: '',
  buttonBgColor: '#111827',
  buttonTextColor: '#ffffff',
  oldPriceColor: '#9ca3af',
  cardAnimation: false,
  hoverEffect: 'Lift Up',
  hoverAmount: 6,
  animationDuration: 300,
  showAddToCart: true,
  addToCartRadius: 6,
  showViewProduct: false,
  viewProductLabel: 'View Product',
  viewProductBg: '#2563eb',
  viewProductTextColor: '#ffffff',
  viewProductRadius: 24,
  showArrowBtn: false,
  arrowBtnBg: '#1e293b',
  arrowBtnColor: '#ffffff',
  arrowBtnPosition: 'center',
  products: [],
  fontFamily: '',
  sectionTitleFont: '',
  productNameFont: '',
  priceFont: '',
  buttonFont: '',
}

export const ru1ProductsFields: FieldConfig[] = [
  { key: '_h_font', label: 'Font', type: 'header' },
  fontField('fontFamily', 'Font Family'),

  { key: '_h_section', label: 'Section', type: 'header' },
  { key: 'sectionTitle', label: 'Section Title', type: 'text' },
  { key: 'titleAlign', label: 'Title Alignment', type: 'select', options: ['left', 'center', 'right'] },
  { key: 'titleColor', label: 'Title Color', type: 'color' },
  fontField('sectionTitleFont', 'Section Title Font'),

  { key: '_h_layout', label: 'Layout', type: 'header' },
  { key: 'bgColor', label: 'Section Background', type: 'color' },
  { key: 'paddingY', label: 'Vertical Padding', type: 'number', unit: 'px', step: 4, placeholder: '48' },
  { key: 'paddingX', label: 'Horizontal Padding', type: 'number', unit: 'px', step: 4, placeholder: '16' },

  { key: '_h_grid', label: 'Grid', type: 'header' },
  { key: 'columns', label: 'Columns', type: 'select', options: ['1', '2', '3', '4', '5', '6'] },
  { key: 'rows', label: 'Rows', type: 'select', options: ['1', '2', '3', '4', '5', '6'] },

  { key: '_h_card', label: 'Card Style', type: 'header' },
  { key: 'cardBorderRadius', label: 'Corner Radius', type: 'number', unit: 'px', step: 2, placeholder: '8' },
  { key: 'hoverBorderColor', label: 'Hover Border Color', type: 'color' },
  { key: 'cardAnimation', label: 'Hover Animation', type: 'toggle' },
  { key: 'hoverEffect', label: 'Animation Type', type: 'select', options: ['Lift Up', 'Drop Down', 'Slide Left', 'Slide Right', 'Pop Out', 'Zoom In', 'Glow', 'Tilt Left', 'Tilt Right'] },
  { key: 'hoverAmount', label: 'Animation Amount', type: 'number', unit: 'px', step: 1, placeholder: '8' },
  { key: 'animationDuration', label: 'Animation Duration', type: 'number', unit: 'ms', step: 50, placeholder: '300' },

  { key: '_h_viewproduct', label: 'View Product Overlay', type: 'header' },
  { key: 'showViewProduct', label: 'Show View Product', type: 'toggle' },
  { key: 'viewProductLabel', label: 'Button Text', type: 'text' },
  { key: 'viewProductBg', label: 'Background Color', type: 'color' },
  { key: 'viewProductTextColor', label: 'Text Color', type: 'color' },
  { key: 'viewProductRadius', label: 'Border Radius', type: 'number', unit: 'px', step: 2, placeholder: '24' },

  { key: '_h_arrowbtn', label: 'Arrow Button', type: 'header' },
  { key: 'showArrowBtn', label: 'Show Arrow Button', type: 'toggle' },
  { key: 'arrowBtnPosition', label: 'Position', type: 'select', options: ['top', 'center', 'bottom'] },
  { key: 'arrowBtnBg', label: 'Background Color', type: 'color' },
  { key: 'arrowBtnColor', label: 'Icon Color', type: 'color' },

  { key: '_h_pricing', label: 'Pricing & Button', type: 'header' },
  { key: 'oldPriceColor', label: 'Old Price Color', type: 'color' },
  fontField('priceFont', 'Price Font'),
  fontField('productNameFont', 'Product Name Font'),
  { key: 'showAddToCart', label: 'Show Add to Cart Button', type: 'toggle' },
  { key: 'buttonBgColor', label: 'Button Background', type: 'color' },
  { key: 'buttonTextColor', label: 'Button Text Color', type: 'color' },
  { key: 'addToCartRadius', label: 'Button Border Radius', type: 'number', unit: 'px', step: 2, placeholder: '6' },
  fontField('buttonFont', 'Button Font'),

  { key: '_h_products', label: 'Products', type: 'header' },
  {
    key: 'products', label: 'Products', type: 'list',
    listFields: [
      { key: 'imageUrl', label: 'Image', type: 'image', noAspectRatio: true },
      { key: 'name', label: 'Product Name', type: 'text' },
      { key: 'price', label: 'Price', type: 'text' },
      { key: 'oldPrice', label: 'Old Price (optional)', type: 'text' },
      { key: 'buttonLabel', label: 'Button Text', type: 'text' },
      { key: 'buttonUrl', label: 'Button URL', type: 'url' },
      { key: 'colors', label: 'Color Swatches', type: 'text', placeholder: 'blue, black, #ff0000' },
    ],
  },
]

export function renderRu1Products(data: Ru1ProductsData): string {
  const colCls = _colClass[String(data.columns)] ?? _colClass['4']
  const _hoverCSS = (effect: string, amount: number): string => {
    switch (effect) {
      case 'Lift Up':    return `transform:translateY(-${amount}px)`
      case 'Drop Down':  return `transform:translateY(${amount}px)`
      case 'Slide Left': return `transform:translateX(-${amount}px)`
      case 'Slide Right':return `transform:translateX(${amount}px)`
      case 'Pop Out':    return `transform:scale(${1 + amount / 100})`
      case 'Zoom In':    return `transform:scale(${1 + amount / 100});box-shadow:0 25px 50px rgba(0,0,0,0.15)`
      case 'Glow':       return `box-shadow:0 0 ${amount}px rgba(99,102,241,0.7)`
      case 'Tilt Left':  return `transform:rotate(-${amount}deg)`
      case 'Tilt Right': return `transform:rotate(${amount}deg)`
      default:           return `transform:translateY(-${amount}px)`
    }
  }
  const dur = data.animationDuration ?? 300
  const arrowBtnPos = data.showArrowBtn !== false ? (data.arrowBtnPosition ?? 'center') : 'hidden'
  const needsOverlay = data.showViewProduct !== false || arrowBtnPos === 'top'

  const gridId = 'fpg-ru1fp'
  const styleRules: string[] = []
  styleRules.push(_gridCss(`#${gridId}`, Number(data.columns) || 4))
  if (needsOverlay) styleRules.push(`[data-fp-card]:hover [data-fp-overlay]{opacity:1!important}`)
  if (data.hoverBorderColor) {
    styleRules.push(`[data-fp-card]:hover{border-color:${data.hoverBorderColor}!important}`)
  }
  if (data.cardAnimation) {
    styleRules.push(`[data-fp-card]{transition:transform ${dur}ms ease,box-shadow ${dur}ms ease}`)
    styleRules.push(`[data-fp-card]:hover{${_hoverCSS(data.hoverEffect, data.hoverAmount)}}`)
  }
  const animStyle = `<style>${styleRules.join('')}</style>`

  const sectionBg = data.bgColor ? `background:${data.bgColor}` : ''
  const innerStyle = `padding:${data.paddingY}px ${data.paddingX}px`

  const maxVisible = data.columns * (data.rows ?? 1)
  const placeholder = { imageUrl: placeholderSvg, name: 'Product Name', price: '$0.00', oldPrice: '', buttonLabel: 'Add to Cart', buttonUrl: '/shop', colors: '' }
  const visibleProducts = [
    ...data.products.slice(0, maxVisible),
    ...Array(Math.max(0, maxVisible - data.products.length)).fill(placeholder),
  ]

  const cards = visibleProducts.map(p => {
    const cs = Array.isArray(p.colors) ? '' : String(p.colors ?? '').trim()
    const allColors = cs ? cs.split(',').map((c: string) => c.trim()).filter(Boolean) : []
    const shownColors = allColors.slice(0, 5)
    const extraColors = allColors.length - 5
    const colorsHtml = allColors.length
      ? `<div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;padding:4px 0">${shownColors.map((c: string) => `<span title="${c}" style="display:inline-block;width:14px;height:14px;border-radius:50%;background:${c};border:1px solid rgba(0,0,0,0.15);flex-shrink:0"></span>`).join('')}${extraColors > 0 ? `<span style="font-size:10px;color:#6b7280;line-height:14px;flex-shrink:0">+${extraColors}</span>` : ''}</div>`
      : ''

    const vpLabel = data.viewProductLabel || 'View Product'
    const viewProductBtn = data.showViewProduct !== false
      ? `<a href="${p.buttonUrl}" style="background:${data.viewProductBg};color:${data.viewProductTextColor};font-size:0.8125rem;font-weight:600;text-decoration:none;pointer-events:auto;padding:0.5rem 1.25rem;border-radius:${data.viewProductRadius}px;letter-spacing:0.01em">${vpLabel}</a>`
      : ''

    const arrowBtnEl = `<a href="${p.buttonUrl}" style="width:32px;height:32px;border-radius:50%;background:${data.arrowBtnBg ?? '#1e293b'};display:flex;align-items:center;justify-content:center;text-decoration:none;flex-shrink:0;pointer-events:auto"><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6h8M7 3l3 3-3 3" stroke="${data.arrowBtnColor ?? '#ffffff'}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></a>`
    const arrowBtnAbsolute = `<a href="${p.buttonUrl}" style="position:absolute;right:12px;width:32px;height:32px;border-radius:50%;background:${data.arrowBtnBg ?? '#1e293b'};display:flex;align-items:center;justify-content:center;text-decoration:none;pointer-events:auto;flex-shrink:0"><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6h8M7 3l3 3-3 3" stroke="${data.arrowBtnColor ?? '#ffffff'}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></a>`

    const overlayHtml = needsOverlay
      ? (arrowBtnPos === 'top'
          ? `<div data-fp-overlay="1" style="position:absolute;bottom:0;left:0;right:0;display:flex;align-items:center;justify-content:center;padding:10px 12px;opacity:0;transition:opacity 180ms ease;pointer-events:none">
              ${viewProductBtn}${arrowBtnAbsolute}
            </div>`
          : `<div data-fp-overlay="1" style="position:absolute;bottom:0;left:0;right:0;display:flex;align-items:center;justify-content:center;padding:10px 12px;opacity:0;transition:opacity 180ms ease;pointer-events:none">
              ${viewProductBtn}
            </div>`)
      : ''

    const priceRow = arrowBtnPos === 'center'
      ? `<div style="display:flex;align-items:center;justify-content:space-between;gap:0.375rem">
          <div style="display:flex;align-items:center;gap:0.5rem">
            <p style="font-size:0.875rem;${fontCss(data.priceFont, data.fontFamily)}">${p.price}</p>
            ${p.oldPrice ? `<s style="color:${data.oldPriceColor};font-size:0.875rem;${fontCss(data.priceFont, data.fontFamily)}">${p.oldPrice}</s>` : ''}
          </div>
          ${arrowBtnEl}
        </div>`
      : `<div style="display:flex;align-items:center;gap:0.5rem">
          <p style="font-size:0.875rem;${fontCss(data.priceFont, data.fontFamily)}">${p.price}</p>
          ${p.oldPrice ? `<s style="color:${data.oldPriceColor};font-size:0.875rem;${fontCss(data.priceFont, data.fontFamily)}">${p.oldPrice}</s>` : ''}
        </div>`

    const bottomRow = arrowBtnPos === 'bottom'
      ? `<div style="display:flex;justify-content:flex-end;margin-top:auto;padding-top:8px">${arrowBtnEl}</div>`
      : ''

    return `
      <div data-fp-card="1" style="border-radius:${data.cardBorderRadius}px;overflow:hidden;display:flex;flex-direction:column;border:1px solid #e5e7eb">
        <div style="position:relative;overflow:hidden">
          <img style="width:100%;aspect-ratio:1/1;object-fit:contain;display:block;background:#f9fafb" src="${p.imageUrl}" alt="${p.name}" />
          ${overlayHtml}
        </div>
        <div style="display:flex;flex-direction:column;gap:0.25rem;padding:0.75rem;flex:1">
          <p style="font-weight:600;font-size:0.875rem;${fontCss(data.productNameFont, data.fontFamily)}">${p.name}</p>
          ${priceRow}
          ${colorsHtml}
          ${data.showAddToCart !== false ? `<a href="${p.buttonUrl}" class="shop-btn" style="background:${data.buttonBgColor};color:${data.buttonTextColor};border-radius:${data.addToCartRadius ?? 6}px;margin-top:auto;text-align:center;font-size:0.875rem;font-weight:500;padding:0.5rem 1rem;text-decoration:none;display:block;${fontCss(data.buttonFont, data.fontFamily)}">${p.buttonLabel}</a>` : ''}
          ${bottomRow}
        </div>
      </div>`
  }).join('')

  const sectionStyle = fontCss(undefined, data.fontFamily) + sectionBg

  return `<section data-component-title="Ru1 Homepage Featured Products" data-component-props="${encodeURIComponent(JSON.stringify(data))}"${sectionStyle ? ` style="${sectionStyle}"` : ''}>
${animStyle}
<div style="${innerStyle}">
  <div style="max-width:80rem;margin:0 auto">
    <div style="margin-bottom:2rem">
      <h1 data-field-key="sectionTitle" style="margin:0;font-size:2rem;font-weight:600;text-align:${data.titleAlign};color:${data.titleColor};${fontCss(data.sectionTitleFont, data.fontFamily)}">${data.sectionTitle}</h1>
    </div>
    <div id="${gridId}">
      ${cards}
    </div>
  </div>
</div>
</section>`
}

// ─── Footer block editor data ────────────────────────────────────────────────

export interface Ru1FooterData {
  tagline: string
  usefulLinks: { label: string; url: string }[]
  contactEmail: string
  contactPhone: string
  copyright: string
  copyrightAlign: string
  bgColor: string
  textColor: string
  linkColor: string
  headingColor: string
  paddingY: number
  paddingX: number
  borderStyle: string
  borderWidth: number
  borderColor: string
  columnOrder: string[]
  fontFamily: string
  headingFont: string
  bodyFont: string
  copyrightFont: string
}

export const ru1FooterDefaults: Ru1FooterData = {
  tagline: 'This site is for employees to order branded apparel and accessories.',
  usefulLinks: [
    { label: 'Home', url: '/' },
    { label: 'Shop', url: '/shop' },
    { label: 'About Us', url: '/aboutus' },
    { label: 'Contact Us', url: '/contactus' },
  ],
  contactEmail: 'support@yourdomain.com',
  contactPhone: '+1 000-000-0000',
  copyright: '© Your Store. All rights reserved.',
  copyrightAlign: 'center',
  bgColor: '#f9fafb',
  textColor: '#374151',
  linkColor: '#111827',
  headingColor: '#111827',
  paddingY: 48,
  paddingX: 60,
  borderStyle: 'solid',
  borderWidth: 1,
  borderColor: '#e5e7eb',
  columnOrder: ['links', 'about', 'contact'],
  fontFamily: '',
  headingFont: '',
  bodyFont: '',
  copyrightFont: '',
}

export const ru1FooterFields: FieldConfig[] = [
  { key: '_h_font', label: 'Font', type: 'header' },
  fontField('fontFamily', 'Font Family'),

  { key: '_h_content', label: 'Content', type: 'header' },
  { key: 'tagline', label: 'Tagline', type: 'textarea' },
  { key: 'contactEmail', label: 'Contact Email', type: 'text' },
  { key: 'contactPhone', label: 'Contact Phone', type: 'text' },
  { key: 'copyright', label: 'Copyright Text', type: 'textarea' },
  { key: 'copyrightAlign', label: 'Align Text', type: 'select', options: ['left', 'center', 'right'] },
  fontField('copyrightFont', 'Copyright Font'),
  {
    key: 'usefulLinks', label: 'Useful Links', type: 'list',
    listFields: [
      { key: 'label', label: 'Label', type: 'text' },
      { key: 'url', label: 'URL', type: 'url' },
    ],
  },
  fontField('headingFont', 'Heading Font'),
  fontField('bodyFont', 'Body Font'),

  { key: '_h_columns', label: 'Column Order', type: 'header' },
  { key: 'columnOrder', label: 'Column Order', type: 'column-order' },

  { key: '_h_style', label: 'Style', type: 'header' },
  { key: 'bgColor', label: 'Background Color', type: 'color' },
  { key: 'textColor', label: 'Text Color', type: 'color' },
  { key: 'linkColor', label: 'Link Color', type: 'color' },
  { key: 'headingColor', label: 'Heading Color', type: 'color' },
  { key: 'borderStyle', label: 'Border Style', type: 'select', options: ['none', 'solid', 'dashed', 'dotted'] },
  { key: 'borderWidth', label: 'Border Width', type: 'number', unit: 'px', step: 1, placeholder: '1' },
  { key: 'borderColor', label: 'Border Color', type: 'color' },

  { key: '_h_layout', label: 'Layout', type: 'header' },
  { key: 'paddingY', label: 'Vertical Padding', type: 'number', unit: 'px', step: 4, placeholder: '48' },
  { key: 'paddingX', label: 'Horizontal Padding', type: 'number', unit: 'px', step: 4, placeholder: '16' },
]

export function renderRu1Footer(data: Ru1FooterData): string {
  const bg = data.bgColor || '#f9fafb'
  const text = data.textColor || '#374151'
  const link = data.linkColor || '#111827'
  const heading = data.headingColor || '#111827'

  const footerStyle = [
    `background:${bg}`,
    `color:${text}`,
    `padding:${data.paddingY}px ${data.paddingX}px`,
    data.borderStyle !== 'none' ? `border-top:${data.borderWidth}px ${data.borderStyle} ${data.borderColor}` : '',
  ].filter(Boolean).join(';')

  const hStyle = `font-size:0.75rem;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:${heading};margin-bottom:1rem;${fontCss(data.headingFont, data.fontFamily)}`
  const pStyle = `font-size:0.875rem;color:${text};line-height:1.625;${fontCss(data.bodyFont, data.fontFamily)}`
  const aStyle = `font-size:0.875rem;color:${link};text-decoration:none;${fontCss(data.bodyFont, data.fontFamily)}`

  const linksCol = `<div style="max-width:20rem;">
        <h3 style="${hStyle}">Useful Links</h3>
        <ul style="list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:0.5rem;">
          ${data.usefulLinks.map(l => `<li><a href="${l.url}" style="${aStyle}">${l.label}</a></li>`).join('\n          ')}
        </ul>
      </div>`
  const aboutCol = `<div style="max-width:20rem;">
        <h3 style="${hStyle}">About Us</h3>
        <p data-field-key="tagline" style="${pStyle}">${data.tagline}</p>
      </div>`
  const contactCol = `<div style="max-width:20rem;">
        <h3 style="${hStyle}">Connect with Us</h3>
        <ul style="list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:0.5rem;">
          <li style="${pStyle}">${data.contactEmail}</li>
          <li style="${pStyle}">${data.contactPhone}</li>
        </ul>
      </div>`
  const colMap: Record<string, string> = { links: linksCol, about: aboutCol, contact: contactCol }
  const orderedCols = (data.columnOrder ?? ['links', 'about', 'contact']).map(k => colMap[k] ?? '').join('\n      ')

  const sectionFontStyle = fontCss(undefined, data.fontFamily)

  return `<section data-component-title="Ru1 Homepage Footer" data-component-props="${encodeURIComponent(JSON.stringify(data))}"${sectionFontStyle ? ` style="${sectionFontStyle}"` : ''}>
<footer style="${footerStyle}">
  <div style="max-width:80rem;margin:0 auto">
    <div style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:2rem;">
      ${orderedCols}
    </div>
    <div style="border-top:1px solid ${data.borderColor || '#e5e7eb'};margin-top:2rem;padding-top:1.5rem;text-align:${data.copyrightAlign || 'center'};">
      <p data-field-key="copyright" style="font-size:0.875rem;color:${text};${fontCss(data.copyrightFont, data.fontFamily)}">${data.copyright}</p>
    </div>
  </div>
</footer>
</section>`
}

// ─── Theme sections (initial HTML derived from render(defaults)) ─────────────

export const ru1HomepageSections: ThemeSection[] = [
  { id: null, title: 'Ru1-Navbar',                      html_code: renderRu1Navbar(ru1NavbarDefaults) },
  { id: null, title: 'Ru1 Homepage Hero',              html_code: renderRu1Hero(ru1HeroDefaults) },
  { id: null, title: 'Ru1 Homepage Featured Products', html_code: renderRu1Products(ru1ProductsDefaults) },
  { id: null, title: 'Ru1 Homepage Footer',            html_code: renderRu1Footer(ru1FooterDefaults) },
]

// ═══════════════════════════════════════════════════════════════════════════════
// Ru1 ShopPage theme
// ═══════════════════════════════════════════════════════════════════════════════

export const ru2ShoppageSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 340" width="100%" height="100%">
  <rect fill="#394152" x="0" y="0" width="280" height="18"/>
  <rect fill="#718096" x="8" y="6" width="28" height="5"/>
  <rect fill="#718096" x="185" y="6" width="16" height="5"/>
  <rect fill="#718096" x="206" y="6" width="16" height="5"/>
  <rect fill="#718096" x="227" y="6" width="16" height="5"/>
  <rect fill="#718096" x="250" y="6" width="22" height="5"/>
  <rect fill="#f3f4f6" x="0" y="18" width="280" height="28"/>
  <rect fill="#9ca3af" x="8" y="22" width="60" height="2"/>
  <rect fill="#374151" x="8" y="28" width="52" height="8"/>
  <rect fill="#e5e7eb" x="0" y="46" width="280" height="1"/>
  <rect fill="#ffffff" x="0" y="47" width="280" height="19"/>
  <rect fill="#374151" x="4" y="53" width="18" height="3"/>
  <rect fill="#9ca3af" x="26" y="53" width="28" height="3"/>
  <rect fill="#e5e7eb" x="120" y="51" width="28" height="12" rx="2"/>
  <rect fill="#e5e7eb" x="152" y="51" width="22" height="12" rx="2"/>
  <rect fill="#e5e7eb" x="178" y="51" width="20" height="12" rx="2"/>
  <rect fill="#e5e7eb" x="202" y="51" width="26" height="12" rx="2"/>
  <rect fill="#e5e7eb" x="232" y="51" width="20" height="12" rx="2"/>
  <rect fill="#e5e7eb" x="0" y="66" width="280" height="1"/>
  <rect fill="#394152" x="4" y="69" width="65" height="46"/>
  <polygon fill="#718096" points="10 108 30 84 50 108"/>
  <polygon fill="#718096" points="46 108 56 96 66 108"/>
  <rect fill="#374151" x="4" y="118" width="55" height="3"/>
  <rect fill="#9ca3af" x="4" y="125" width="32" height="2"/>
  <rect fill="#394152" x="73" y="69" width="65" height="46"/>
  <polygon fill="#718096" points="79 108 99 84 119 108"/>
  <polygon fill="#718096" points="115 108 125 96 135 108"/>
  <rect fill="#374151" x="73" y="118" width="55" height="3"/>
  <rect fill="#9ca3af" x="73" y="125" width="32" height="2"/>
  <rect fill="#394152" x="142" y="69" width="65" height="46"/>
  <polygon fill="#718096" points="148 108 168 84 188 108"/>
  <polygon fill="#718096" points="184 108 194 96 204 108"/>
  <rect fill="#374151" x="142" y="118" width="55" height="3"/>
  <rect fill="#9ca3af" x="142" y="125" width="32" height="2"/>
  <rect fill="#394152" x="211" y="69" width="65" height="46"/>
  <polygon fill="#718096" points="217 108 237 84 257 108"/>
  <polygon fill="#718096" points="253 108 263 96 273 108"/>
  <rect fill="#374151" x="211" y="118" width="55" height="3"/>
  <rect fill="#9ca3af" x="211" y="125" width="32" height="2"/>
  <rect fill="#394152" x="4" y="133" width="65" height="46"/>
  <polygon fill="#718096" points="10 172 30 148 50 172"/>
  <polygon fill="#718096" points="46 172 56 160 66 172"/>
  <rect fill="#374151" x="4" y="182" width="55" height="3"/>
  <rect fill="#9ca3af" x="4" y="189" width="32" height="2"/>
  <rect fill="#394152" x="73" y="133" width="65" height="46"/>
  <polygon fill="#718096" points="79 172 99 148 119 172"/>
  <rect fill="#374151" x="73" y="182" width="55" height="3"/>
  <rect fill="#9ca3af" x="73" y="189" width="32" height="2"/>
  <rect fill="#394152" x="142" y="133" width="65" height="46"/>
  <polygon fill="#718096" points="148 172 168 148 188 172"/>
  <rect fill="#374151" x="142" y="182" width="55" height="3"/>
  <rect fill="#9ca3af" x="142" y="189" width="32" height="2"/>
  <rect fill="#394152" x="211" y="133" width="65" height="46"/>
  <polygon fill="#718096" points="217 172 237 148 257 172"/>
  <rect fill="#374151" x="211" y="182" width="55" height="3"/>
  <rect fill="#9ca3af" x="211" y="189" width="32" height="2"/>
  <rect fill="#394152" x="4" y="197" width="65" height="46"/>
  <polygon fill="#718096" points="10 236 30 212 50 236"/>
  <polygon fill="#718096" points="46 236 56 224 66 236"/>
  <rect fill="#374151" x="4" y="246" width="55" height="3"/>
  <rect fill="#9ca3af" x="4" y="253" width="32" height="2"/>
  <rect fill="#394152" x="73" y="197" width="65" height="46"/>
  <polygon fill="#718096" points="79 236 99 212 119 236"/>
  <rect fill="#374151" x="73" y="246" width="55" height="3"/>
  <rect fill="#9ca3af" x="73" y="253" width="32" height="2"/>
  <rect fill="#394152" x="142" y="197" width="65" height="46"/>
  <polygon fill="#718096" points="148 236 168 212 188 236"/>
  <rect fill="#374151" x="142" y="246" width="55" height="3"/>
  <rect fill="#9ca3af" x="142" y="253" width="32" height="2"/>
  <rect fill="#394152" x="211" y="197" width="65" height="46"/>
  <polygon fill="#718096" points="217 236 237 212 257 236"/>
  <rect fill="#374151" x="211" y="246" width="55" height="3"/>
  <rect fill="#9ca3af" x="211" y="253" width="32" height="2"/>
  <rect fill="#e5e7eb" x="96" y="270" width="14" height="10" rx="2"/>
  <rect fill="#374151" x="114" y="270" width="14" height="10" rx="2"/>
  <rect fill="#e5e7eb" x="132" y="270" width="14" height="10" rx="2"/>
  <rect fill="#e5e7eb" x="150" y="270" width="14" height="10" rx="2"/>
  <rect fill="#e5e7eb" x="168" y="270" width="14" height="10" rx="2"/>
  <rect fill="#394152" x="0" y="314" width="280" height="26"/>
  <rect fill="#718096" x="8" y="320" width="55" height="4"/>
  <rect fill="#718096" x="8" y="328" width="45" height="3"/>
  <rect fill="#718096" x="100" y="320" width="55" height="4"/>
  <rect fill="#718096" x="100" y="328" width="40" height="3"/>
  <rect fill="#718096" x="192" y="320" width="55" height="4"/>
  <rect fill="#718096" x="192" y="328" width="40" height="3"/>
</svg>`
// ─── Ru1 Shop Hero block ─────────────────────────────────────────────────────

export interface Ru2ShopHeroData {
  pageTitle: string
  showBreadcrumbs: boolean
  breadcrumbs: { label: string; url: string }[]
  bgColor: string
  bgImageUrl: string
  textColor: string
  breadcrumbColor: string
  textAlign: string
  paddingY: number
  paddingX: number
  borderBottom: boolean
  borderColor: string
  fontFamily: string
  titleFont: string
}

export const ru2ShopHeroDefaults: Ru2ShopHeroData = {
  pageTitle: 'Shop',
  showBreadcrumbs: true,
  breadcrumbs: [
    { label: 'Home', url: '/' },
    { label: 'Shop', url: '/shop' },
  ],
  bgColor: '#f3f4f6',
  bgImageUrl: '',
  textColor: '#111827',
  breadcrumbColor: '#6b7280',
  textAlign: 'left',
  paddingY: 24,
  paddingX: 16,
  borderBottom: true,
  borderColor: '#e5e7eb',
  fontFamily: '',
  titleFont: '',
}

export const ru2ShopHeroFields: FieldConfig[] = [
  { key: '_h_content', label: 'Content', type: 'header' },
  { key: 'pageTitle', label: 'Page Title', type: 'text' },
  { key: 'textAlign', label: 'Text Alignment', type: 'select', options: ['left', 'center', 'right'] },

  { key: '_h_breadcrumbs', label: 'Breadcrumbs', type: 'header' },
  { key: 'showBreadcrumbs', label: 'Show Breadcrumbs', type: 'toggle' },
  {
    key: 'breadcrumbs', label: 'Breadcrumb Links', type: 'list',
    listFields: [
      { key: 'label', label: 'Label', type: 'text' },
      { key: 'url', label: 'URL', type: 'url' },
    ],
  },

  { key: '_h_colors', label: 'Colors', type: 'header' },
  { key: 'bgColor', label: 'Background Color', type: 'color' },
  { key: 'bgImageUrl', label: 'Background Image', type: 'image' },
  { key: 'textColor', label: 'Title Color', type: 'color' },
  { key: 'breadcrumbColor', label: 'Breadcrumb Color', type: 'color' },

  { key: '_h_fonts', label: 'Fonts', type: 'header' },
  fontField('fontFamily', 'Font Family'),
  fontField('titleFont', 'Title Font'),

  { key: '_h_layout', label: 'Layout', type: 'header' },
  { key: 'paddingY', label: 'Vertical Padding', type: 'number', unit: 'px', step: 4, placeholder: '24' },
  { key: 'paddingX', label: 'Horizontal Padding', type: 'number', unit: 'px', step: 4, placeholder: '16' },
  { key: 'borderBottom', label: 'Bottom Border', type: 'toggle' },
  { key: 'borderColor', label: 'Border Color', type: 'color' },
]

export function renderRu2ShopHero(data: Ru2ShopHeroData): string {
  const bgStyles = [
    `background:${data.bgColor}`,
    data.bgImageUrl ? `background-image:url('${data.bgImageUrl}');background-size:cover;background-position:center` : '',
    `padding:${data.paddingY}px ${data.paddingX}px`,
    data.borderBottom ? `border-bottom:1px solid ${data.borderColor}` : '',
  ].filter(Boolean).join(';')

  const breadcrumbsHtml = data.showBreadcrumbs ? `
    <nav style="margin-top:0.5rem">
      <ol style="display:flex;flex-wrap:wrap;align-items:center;gap:0.25rem;list-style:none;padding:0;margin:0">
        ${(data.breadcrumbs ?? []).map((crumb, i, arr) => {
          const isLast = i === arr.length - 1
          return `<li style="display:flex;align-items:center;gap:0.25rem">
            ${i > 0 ? `<span style="color:${data.breadcrumbColor};font-size:0.8125rem;margin-right:0.25rem">/</span>` : ''}
            ${isLast
              ? `<span style="font-size:0.8125rem;color:${data.breadcrumbColor};${fontCss(undefined, data.fontFamily)}">${crumb.label}</span>`
              : `<a href="${crumb.url}" style="font-size:0.8125rem;color:${data.breadcrumbColor};text-decoration:none;hover:text-decoration:underline;${fontCss(undefined, data.fontFamily)}">${crumb.label}</a>`
            }
          </li>`
        }).join('')}
      </ol>
    </nav>` : ''

  return `<section data-component-title="Ru1 Shop Hero" data-component-props="${encodeURIComponent(JSON.stringify(data))}">
<div style="${bgStyles}">
  <div style="max-width:80rem;margin:0 auto;text-align:${data.textAlign}">
    ${breadcrumbsHtml}
    <h1 data-field-key="pageTitle" style="font-size:1.75rem;font-weight:700;color:${data.textColor};margin:0.5rem 0 0;line-height:1.2;${fontCss(data.titleFont, data.fontFamily)}">${data.pageTitle}</h1>
  </div>
</div>
</section>`
}

// ─── Ru1 Shop Content block ──────────────────────────────────────────────────

export interface FilterDropdown {
  label: string
  visible: boolean
}

export interface Ru2ShopContentData {
  showFilterBar: boolean
  filterPosition: 'top' | 'left' | 'right'
  showProductCount: boolean
  showSortBy: boolean
  sortLabel: string
  filterDropdowns: FilterDropdown[]
  columns: number
  rows: number
  showAddToCart: boolean
  cardBorderRadius: number
  hoverBorderColor: string
  cardAnimation: boolean
  hoverEffect: string
  hoverAmount: number
  animationDuration: number
  showViewProduct: boolean
  viewProductLabel: string
  viewProductBg: string
  viewProductTextColor: string
  viewProductRadius: number
  showArrowBtn: boolean
  arrowBtnBg: string
  arrowBtnColor: string
  arrowBtnPosition: 'top' | 'center' | 'bottom'
  oldPriceColor: string
  buttonBgColor: string
  buttonTextColor: string
  addToCartRadius: number
  products: Product[]
  showPagination: boolean
  totalPages: number
  bgColor: string
  paddingY: number
  paddingX: number
  fontFamily: string
  productNameFont: string
  priceFont: string
  buttonFont: string
}

const _shopColClass: Record<string, string> = {
  '2': 'grid-cols-2',
  '3': 'grid-cols-2 sm:grid-cols-3',
  '4': 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-4',
  '5': 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5',
}

export const ru2ShopContentDefaults: Ru2ShopContentData = {
  showFilterBar: true,
  filterPosition: 'top',
  showProductCount: true,
  showSortBy: true,
  sortLabel: 'Sort By',
  filterDropdowns: [
    { label: 'Color', visible: true },
    { label: 'Size', visible: true },
    { label: 'Brands', visible: true },
    { label: 'Price', visible: true },
  ],
  columns: 4,
  rows: 2,
  showAddToCart: false,
  cardBorderRadius: 8,
  hoverBorderColor: '#2563eb',
  cardAnimation: false,
  hoverEffect: 'Lift Up',
  hoverAmount: 6,
  animationDuration: 300,
  showViewProduct: true,
  viewProductLabel: 'View Product',
  viewProductBg: '#2563eb',
  viewProductTextColor: '#ffffff',
  viewProductRadius: 24,
  showArrowBtn: true,
  arrowBtnBg: '#1e293b',
  arrowBtnColor: '#ffffff',
  arrowBtnPosition: 'center',
  oldPriceColor: '#9ca3af',
  buttonBgColor: '#111827',
  buttonTextColor: '#ffffff',
  addToCartRadius: 6,
  products: [
    { imageUrl: placeholderSvg, name: 'Product One',   price: '$0', oldPrice: '', buttonLabel: 'Add to Cart', buttonUrl: '/shop', colors: '#FF0000, #0000FF' },
    { imageUrl: placeholderSvg, name: 'Product Two',   price: '$0', oldPrice: '', buttonLabel: 'Add to Cart', buttonUrl: '/shop', colors: '#FF0000, #0000FF' },
    { imageUrl: placeholderSvg, name: 'Product Three', price: '$0', oldPrice: '', buttonLabel: 'Add to Cart', buttonUrl: '/shop', colors: '#FF0000, #0000FF' },
    { imageUrl: placeholderSvg, name: 'Product Four',  price: '$0', oldPrice: '', buttonLabel: 'Add to Cart', buttonUrl: '/shop', colors: '#FF0000, #0000FF' },
    { imageUrl: placeholderSvg, name: 'Product Five',  price: '$0', oldPrice: '', buttonLabel: 'Add to Cart', buttonUrl: '/shop', colors: '#FF0000, #0000FF' },
    { imageUrl: placeholderSvg, name: 'Product Six',   price: '$0', oldPrice: '', buttonLabel: 'Add to Cart', buttonUrl: '/shop', colors: '#FF0000, #0000FF' },
    { imageUrl: placeholderSvg, name: 'Product Seven', price: '$0', oldPrice: '', buttonLabel: 'Add to Cart', buttonUrl: '/shop', colors: '#FF0000, #0000FF' },
    { imageUrl: placeholderSvg, name: 'Product Eight', price: '$0', oldPrice: '', buttonLabel: 'Add to Cart', buttonUrl: '/shop', colors: '#FF0000, #0000FF' },
  ],
  showPagination: true,
  totalPages: 1,
  bgColor: '',
  paddingY: 48,
  paddingX: 16,
  fontFamily: '',
  productNameFont: '',
  priceFont: '',
  buttonFont: '',
}

export const ru2ShopContentFields: FieldConfig[] = [
  // ── Section wrapper ───────────────────────────────────────────────────────
  { key: '_h_layout', label: 'Layout', type: 'header' },
  { key: 'bgColor', label: 'Section Background', type: 'color' },
  { key: 'paddingY', label: 'Vertical Padding', type: 'number', unit: 'px', step: 4, placeholder: '48' },
  { key: 'paddingX', label: 'Horizontal Padding', type: 'number', unit: 'px', step: 4, placeholder: '16' },

  // ── Product grid ─────────────────────────────────────────────────────────
  { key: '_h_grid', label: 'Grid', type: 'header' },
  { key: 'columns', label: 'Columns', type: 'select', options: ['2', '3', '4', '5'] },
  { key: 'rows', label: 'Rows per Page', type: 'select', options: ['1', '2', '3', '4', '5', '6', '7', '8'] },

  // ── Pagination (bottom of section) ───────────────────────────────────────
  { key: '_h_pagination', label: 'Pagination', type: 'header' },
  { key: 'showPagination', label: 'Show Pagination', type: 'toggle' },

  // ── Filter bar ────────────────────────────────────────────────────────────
  { key: '_h_filterbar', label: 'Filter Bar', type: 'header' },
  { key: 'showFilterBar', label: 'Show Filter Bar', type: 'toggle' },
  { key: 'filterPosition', label: 'Filter Position', type: 'select', options: ['top', 'left', 'right'] },
  { key: 'showProductCount', label: 'Show Product Count', type: 'toggle' },
  { key: 'showSortBy', label: 'Show Sort By', type: 'toggle' },
  { key: 'sortLabel', label: 'Sort Label', type: 'text' },
  {
    key: 'filterDropdowns', label: 'Filter Dropdowns', type: 'list',
    listFields: [
      { key: 'label', label: 'Label', type: 'text' },
      { key: 'visible', label: 'Visible', type: 'toggle' },
    ],
  },

  // ── Card (border, hover animation) ───────────────────────────────────────
  { key: '_h_card', label: 'Card Style', type: 'header' },
  { key: 'cardBorderRadius', label: 'Corner Radius', type: 'number', unit: 'px', step: 2, placeholder: '8' },
  { key: 'hoverBorderColor', label: 'Hover Border Color', type: 'color' },
  { key: 'cardAnimation', label: 'Hover Animation', type: 'toggle' },
  { key: 'hoverEffect', label: 'Animation Type', type: 'select', options: ['Lift Up', 'Drop Down', 'Slide Left', 'Slide Right', 'Pop Out', 'Zoom In', 'Glow', 'Tilt Left', 'Tilt Right'] },
  { key: 'hoverAmount', label: 'Animation Amount', type: 'number', unit: 'px', step: 1, placeholder: '6' },
  { key: 'animationDuration', label: 'Duration', type: 'number', unit: 'ms', step: 50, placeholder: '300' },

  // ── Image overlay (appears on hover) ─────────────────────────────────────
  { key: '_h_viewproduct', label: 'View Product Overlay', type: 'header' },
  { key: 'showViewProduct', label: 'Show View Product', type: 'toggle' },
  { key: 'viewProductLabel', label: 'Button Text', type: 'text' },
  { key: 'viewProductBg', label: 'Background Color', type: 'color' },
  { key: 'viewProductTextColor', label: 'Text Color', type: 'color' },
  { key: 'viewProductRadius', label: 'Border Radius', type: 'number', unit: 'px', step: 2, placeholder: '24' },

  { key: '_h_arrowbtn', label: 'Arrow Button', type: 'header' },
  { key: 'showArrowBtn', label: 'Show Arrow Button', type: 'toggle' },
  { key: 'arrowBtnPosition', label: 'Position', type: 'select', options: ['top', 'center', 'bottom'] },
  { key: 'arrowBtnBg', label: 'Background Color', type: 'color' },
  { key: 'arrowBtnColor', label: 'Icon Color', type: 'color' },

  // ── Card info (price, add to cart) ───────────────────────────────────────
  { key: '_h_pricing', label: 'Pricing & Button', type: 'header' },
  { key: 'oldPriceColor', label: 'Old Price Color', type: 'color' },
  { key: 'showAddToCart', label: 'Show Add to Cart Button', type: 'toggle' },
  { key: 'buttonBgColor', label: 'Button Background', type: 'color' },
  { key: 'buttonTextColor', label: 'Button Text Color', type: 'color' },
  { key: 'addToCartRadius', label: 'Button Border Radius', type: 'number', unit: 'px', step: 2, placeholder: '6' },

  // ── Fonts ────────────────────────────────────────────────────────────────
  { key: '_h_fonts', label: 'Fonts', type: 'header' },
  fontField('fontFamily', 'Font Family'),
  fontField('productNameFont', 'Product Name Font'),
  fontField('priceFont', 'Price Font'),
  fontField('buttonFont', 'Button Font'),

  // ── Products list ─────────────────────────────────────────────────────────
  { key: '_h_products', label: 'Products', type: 'header' },
  {
    key: 'products', label: 'Products', type: 'list',
    listFields: [
      { key: 'imageUrl', label: 'Image', type: 'image', noAspectRatio: true },
      { key: 'name', label: 'Product Name', type: 'text' },
      { key: 'price', label: 'Price', type: 'text' },
      { key: 'oldPrice', label: 'Old Price (optional)', type: 'text' },
      { key: 'buttonLabel', label: 'Button Text', type: 'text' },
      { key: 'buttonUrl', label: 'Button URL', type: 'url' },
      { key: 'colors', label: 'Color Swatches', type: 'text', placeholder: 'blue, black, #ff0000' },
    ],
  },
]

export function renderRu2ShopContent(data: Ru2ShopContentData): string {
  const colCls = _shopColClass[String(data.columns)] ?? _shopColClass['4']
  const gridId = 'spg-ru1sp'

  const _hoverOn = (effect: string, amount: number): string => {
    switch (effect) {
      case 'Lift Up':     return `this.style.transform='translateY(-${amount}px)'`
      case 'Drop Down':   return `this.style.transform='translateY(${amount}px)'`
      case 'Slide Left':  return `this.style.transform='translateX(-${amount}px)'`
      case 'Slide Right': return `this.style.transform='translateX(${amount}px)'`
      case 'Pop Out':     return `this.style.transform='scale(${1 + amount / 100})'`
      case 'Zoom In':     return `this.style.transform='scale(${1 + amount / 100})';this.style.boxShadow='0 25px 50px rgba(0,0,0,0.15)'`
      case 'Glow':        return `this.style.boxShadow='0 0 ${amount}px rgba(99,102,241,0.7)'`
      case 'Tilt Left':   return `this.style.transform='rotate(-${amount}deg)'`
      case 'Tilt Right':  return `this.style.transform='rotate(${amount}deg)'`
      default:            return `this.style.transform='translateY(-${amount}px)'`
    }
  }

  const hoverBorder = data.hoverBorderColor || '#2563eb'
  const dur = data.cardAnimation ? data.animationDuration : 200
  const enterHandler = [
    `this.style.borderColor='${hoverBorder}'`,
    `var ov=this.querySelector('.shop-img-overlay');if(ov)ov.style.opacity='1'`,
    data.cardAnimation ? _hoverOn(data.hoverEffect, data.hoverAmount) : '',
  ].filter(Boolean).join(';')
  const leaveHandler = [
    `this.style.borderColor='#e5e7eb'`,
    `var ov=this.querySelector('.shop-img-overlay');if(ov)ov.style.opacity='0'`,
    data.cardAnimation ? `this.style.transform='';this.style.boxShadow=''` : '',
  ].filter(Boolean).join(';')
  const cardTransition = `border-color ${dur}ms ease${data.cardAnimation ? `,transform ${dur}ms ease,box-shadow ${dur}ms ease` : ''}`

  const perPage = (data.columns ?? 4) * (data.rows ?? 1)
  const productCount = data.products.length
  const pages = Math.max(1, Math.ceil(productCount / perPage))

  const renderCard = (p: Product) => {
    const cs = Array.isArray(p.colors) ? '' : String(p.colors ?? '').trim()
    const allColors2 = cs ? cs.split(',').map((c: string) => c.trim()).filter(Boolean) : []
    const shownColors2 = allColors2.slice(0, 13)
    const extraColors2 = allColors2.length - 13
    const colorsHtml = allColors2.length
      ? `<div style="display:flex;flex-wrap:wrap;gap:5px;align-items:center;margin-top:6px">${shownColors2.map((c: string) => `<span title="${c}" style="display:inline-block;width:14px;height:14px;border-radius:50%;background:${c};border:1px solid rgba(0,0,0,0.12);flex-shrink:0"></span>`).join('')}${extraColors2 > 0 ? `<span style="font-size:10px;color:#6b7280;line-height:14px;flex-shrink:0">+${extraColors2}</span>` : ''}</div>`
      : ''
    const arrowBtnPos = data.showArrowBtn !== false ? (data.arrowBtnPosition ?? 'center') : 'hidden'
    const arrowBtnEl = `<a href="${p.buttonUrl}" style="width:32px;height:32px;border-radius:50%;background:${data.arrowBtnBg ?? '#1e293b'};display:flex;align-items:center;justify-content:center;text-decoration:none;flex-shrink:0;pointer-events:auto"><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6h8M7 3l3 3-3 3" stroke="${data.arrowBtnColor ?? '#ffffff'}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></a>`

    const vpLabel = data.viewProductLabel || 'View Product'
    const viewProductBtn = data.showViewProduct !== false
      ? `<a href="${p.buttonUrl}" style="background:${data.viewProductBg};color:${data.viewProductTextColor};font-size:0.8125rem;font-weight:600;text-decoration:none;pointer-events:auto;padding:0.5rem 1.25rem;border-radius:${data.viewProductRadius}px;letter-spacing:0.01em">${vpLabel}</a>`
      : ''

    const arrowBtnAbsolute = `<a href="${p.buttonUrl}" style="position:absolute;right:12px;width:32px;height:32px;border-radius:50%;background:${data.arrowBtnBg ?? '#1e293b'};display:flex;align-items:center;justify-content:center;text-decoration:none;pointer-events:auto;flex-shrink:0"><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6h8M7 3l3 3-3 3" stroke="${data.arrowBtnColor ?? '#ffffff'}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></a>`

    const hasOverlay = data.showViewProduct !== false || arrowBtnPos === 'top'
    // top: View Product centered, arrow pinned to the far right
    const overlayHtml = hasOverlay
      ? (arrowBtnPos === 'top'
          ? `<div class="shop-img-overlay" style="position:absolute;bottom:0;left:0;right:0;display:flex;align-items:center;justify-content:center;padding:10px 12px;opacity:0;transition:opacity 180ms ease;pointer-events:none">
              ${viewProductBtn}
              ${arrowBtnAbsolute}
            </div>`
          : `<div class="shop-img-overlay" style="position:absolute;bottom:0;left:0;right:0;display:flex;align-items:center;justify-content:center;padding:10px 12px;opacity:0;transition:opacity 180ms ease;pointer-events:none">
              ${viewProductBtn}
            </div>`)
      : ''

    // center: arrow inline with price row
    const priceRow = arrowBtnPos === 'center'
      ? `<div style="display:flex;align-items:center;justify-content:space-between;gap:0.375rem;margin-bottom:2px">
          <div style="display:flex;align-items:center;gap:0.375rem">
            ${p.price ? `<span style="font-size:0.9375rem;font-weight:700;color:#111827;${fontCss(data.priceFont, data.fontFamily)}">${p.price}</span>` : ''}
            ${p.oldPrice ? `<s style="color:${data.oldPriceColor};font-size:0.8125rem;${fontCss(data.priceFont, data.fontFamily)}">${p.oldPrice}</s>` : ''}
          </div>
          ${arrowBtnEl}
        </div>`
      : `<div style="display:flex;align-items:center;gap:0.375rem;margin-bottom:2px">
          ${p.price ? `<span style="font-size:0.9375rem;font-weight:700;color:#111827;${fontCss(data.priceFont, data.fontFamily)}">${p.price}</span>` : ''}
          ${p.oldPrice ? `<s style="color:${data.oldPriceColor};font-size:0.8125rem;${fontCss(data.priceFont, data.fontFamily)}">${p.oldPrice}</s>` : ''}
        </div>`

    // bottom: arrow at the very end of the card
    const footerRow = data.showAddToCart
      ? `<div style="display:flex;align-items:center;gap:8px;margin-top:auto;padding-top:8px">
           <a href="${p.buttonUrl}" class="shop-btn" style="flex:1;background:${data.buttonBgColor};color:${data.buttonTextColor};text-align:center;padding:0.5rem 0.25rem;font-size:0.8125rem;font-weight:500;text-decoration:none;border-radius:${data.addToCartRadius ?? 6}px;${fontCss(data.buttonFont, data.fontFamily)}">${p.buttonLabel}</a>
           ${arrowBtnPos === 'bottom' ? arrowBtnEl : ''}
         </div>`
      : arrowBtnPos === 'bottom'
        ? `<div style="display:flex;justify-content:flex-end;margin-top:auto;padding-top:8px">${arrowBtnEl}</div>`
        : ''

    return `
      <div style="border-radius:${data.cardBorderRadius}px;overflow:hidden;background:#fff;border:1.5px solid #e5e7eb;transition:${cardTransition};position:relative;display:flex;flex-direction:column" onmouseenter="${enterHandler}" onmouseleave="${leaveHandler}">
        <div style="position:relative;overflow:hidden">
          <img src="${p.imageUrl}" alt="${p.name}" style="width:100%;aspect-ratio:1/1;object-fit:contain;display:block;background:#f9fafb" />
          ${overlayHtml}
        </div>
        <div style="padding:0.875rem;flex:1;display:flex;flex-direction:column">
          <p style="font-size:0.9375rem;font-weight:600;color:#111827;margin:0 0 4px;line-height:1.35;${fontCss(data.productNameFont, data.fontFamily)}">${p.name}</p>
          ${priceRow}
          ${colorsHtml}
          ${footerRow}
        </div>
      </div>`
  }

  const pageGrids = Array.from({ length: pages }, (_: any, i: number) => {
    const pageCards = data.products.slice(i * perPage, (i + 1) * perPage).map(renderCard).join('')
    return `<div data-sp="${i + 1}" style="display:${i === 0 ? '' : 'none'}"><div data-sg="${gridId}">${pageCards}</div></div>`
  }).join('')

  const visibleDropdowns = (data.filterDropdowns ?? []).filter((f: FilterDropdown) => f.visible !== false)
  const filterPos = data.filterPosition ?? 'top'

  // Self-defining nav function — defines window._sn once, then calls it on every click
  const navFn = `window._sn=window._sn||function(b,t){var s=b.closest('section'),ps=s.querySelectorAll('[data-sp]'),c=1,n;ps.forEach(function(p){if(p.style.display!='none')c=+p.dataset.sp});n=t==='p'?Math.max(1,c-1):t==='n'?Math.min(c+1,ps.length):+t;ps.forEach(function(p){p.style.display=+p.dataset.sp===n?'':'none'});s.querySelectorAll('[data-spb]').forEach(function(x){var v=+x.dataset.spb;if(v){x.style.background=v===n?'#111827':'#fff';x.style.color=v===n?'#fff':'#374151';x.style.borderColor=v===n?'#111827':'#d1d5db'}})}`

  const paginationHtml = data.showPagination ? `
    <div style="display:flex;justify-content:center;align-items:center;gap:0.375rem;margin-top:2rem">
      <button onclick="${navFn};_sn(this,'p')" style="width:34px;height:34px;display:flex;align-items:center;justify-content:center;border:1px solid #d1d5db;border-radius:6px;background:#fff;cursor:pointer;font-size:0.875rem;color:#6b7280">&#8249;</button>
      ${Array.from({length: Math.min(pages, 5)}, (_: any, i: number) => i + 1).map((n: number) => `<button data-spb="${n}" onclick="${navFn};_sn(this,${n})" style="width:34px;height:34px;display:flex;align-items:center;justify-content:center;border:1px solid ${n === 1 ? '#111827' : '#d1d5db'};border-radius:6px;background:${n === 1 ? '#111827' : '#fff'};cursor:pointer;font-size:0.875rem;color:${n === 1 ? '#fff' : '#374151'}">${n}</button>`).join('')}
      ${pages > 5 ? `<span style="font-size:0.875rem;color:#6b7280;padding:0 2px">&hellip;</span><button data-spb="${pages}" onclick="${navFn};_sn(this,${pages})" style="width:34px;height:34px;display:flex;align-items:center;justify-content:center;border:1px solid #d1d5db;border-radius:6px;background:#fff;cursor:pointer;font-size:0.875rem;color:#374151">${pages}</button>` : ''}
      <button onclick="${navFn};_sn(this,'n')" style="width:34px;height:34px;display:flex;align-items:center;justify-content:center;border:1px solid #d1d5db;border-radius:6px;background:#fff;cursor:pointer;font-size:0.875rem;color:#6b7280">&#8250;</button>
    </div>` : ''

  const sectionStyle = [
    data.bgColor ? `background:${data.bgColor}` : '',
    `padding:${data.paddingY}px ${data.paddingX}px`,
  ].filter(Boolean).join(';')

  let innerHtml: string
  if (!data.showFilterBar) {
    innerHtml = `${pageGrids}${paginationHtml}`
  } else if (filterPos === 'top') {
    const topBar = `<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:0.75rem;padding:0.75rem 0;border-bottom:1px solid #e5e7eb;margin-bottom:1.5rem">
      <div style="display:flex;align-items:center;gap:1rem">
        ${data.showProductCount ? `<span style="font-size:0.875rem;font-weight:500;color:#111827">${productCount} Products</span>` : ''}
        ${data.showSortBy ? `<div style="display:flex;align-items:center;gap:0.375rem"><span style="font-size:0.875rem;color:#374151">${data.sortLabel}:</span><button style="display:inline-flex;align-items:center;gap:0.25rem;background:none;border:none;cursor:pointer;font-size:0.875rem;color:#374151;padding:0">Default <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 3.5L5 6.5L8 3.5" stroke="#374151" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div>` : ''}
      </div>
      ${visibleDropdowns.length ? `<div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap">${visibleDropdowns.map((f: FilterDropdown) => `<div data-rubikx-component="${f.label.replace(/\s+/g, '')}Filter" data-on-mount="loadProductFilters" data-filter-style="top" style="position:relative;display:inline-block;"><button style="display:inline-flex;align-items:center;gap:0.375rem;background:#fff;border:1px solid #d1d5db;border-radius:4px;cursor:pointer;font-size:0.875rem;color:#374151;padding:0.375rem 0.75rem;white-space:nowrap">${f.label} <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 3.5L5 6.5L8 3.5" stroke="#374151" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button><div class="rubikx-filter-dropdown" style="display:none;position:absolute;top:100%;left:0;background:#fff;min-width:160px;box-shadow:0 4px 12px rgba(0,0,0,0.1);border-radius:8px;padding:8px;z-index:100;"><span style="display:block;padding:8px;color:#999;font-size:12px;font-style:italic;">⟳ Loads from Odoo on live site</span></div></div>`).join('')}</div>` : ''}
    </div>`
    innerHtml = `${topBar}${pageGrids}${paginationHtml}`
  } else {
    // sidebar layout (left or right)
    const metaBar = (data.showProductCount || data.showSortBy) ? `<div style="display:flex;align-items:center;gap:1rem;padding:0.5rem 0;margin-bottom:1rem;border-bottom:1px solid #e5e7eb">
      ${data.showProductCount ? `<span style="font-size:0.875rem;font-weight:500;color:#111827">${productCount} Products</span>` : ''}
      ${data.showSortBy ? `<div style="display:flex;align-items:center;gap:0.375rem"><span style="font-size:0.875rem;color:#374151">${data.sortLabel}:</span><button style="display:inline-flex;align-items:center;gap:0.25rem;background:none;border:none;cursor:pointer;font-size:0.875rem;color:#374151;padding:0">Default <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 3.5L5 6.5L8 3.5" stroke="#374151" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div>` : ''}
    </div>` : ''
    const sidebarAccordion = visibleDropdowns.map((f: FilterDropdown) => `<div data-rubikx-component="${f.label.replace(/\s+/g, '')}Filter" data-on-mount="loadProductFilters" data-filter-style="sidebar" style="border-bottom:1px solid #f3f4f6;padding:0.625rem 0;"><div style="display:flex;align-items:center;justify-content:space-between;"><span style="font-size:0.875rem;color:#374151;">${f.label}</span><button class="rubikx-filter-toggle" style="background:none;border:none;cursor:pointer;font-size:1.1rem;color:#6b7280;padding:0;line-height:1">+</button></div><div class="rubikx-filter-values" style="display:none;padding-top:0.5rem;"><span style="display:block;padding:4px 0;color:#999;font-size:12px;font-style:italic;">⟳ Loads from Odoo on live site</span></div></div>`).join('')
    const sidebarBorder = filterPos === 'left'
      ? 'border-right:1px solid #e5e7eb;padding-right:1.25rem;margin-right:1.5rem'
      : 'border-left:1px solid #e5e7eb;padding-left:1.25rem;margin-left:1.5rem'
    const sidebar = `<div style="width:220px;flex-shrink:0;${sidebarBorder}">
      <div style="display:flex;align-items:center;gap:0.5rem;padding-bottom:0.75rem;border-bottom:1px solid #e5e7eb;margin-bottom:0.25rem">
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M1 3h13M3.5 7h8M6 11h3" stroke="#374151" stroke-width="1.5" stroke-linecap="round"/></svg>
        <span style="font-size:0.875rem;font-weight:600;color:#111827">Filters</span>
      </div>
      ${sidebarAccordion}
    </div>`
    const gridArea = `<div style="flex:1;min-width:0">${pageGrids}${paginationHtml}</div>`
    const flexRow = filterPos === 'left'
      ? `<div style="display:flex;align-items:flex-start">${sidebar}${gridArea}</div>`
      : `<div style="display:flex;align-items:flex-start">${gridArea}${sidebar}</div>`
    innerHtml = `${metaBar}${flexRow}`
  }

  return `<section data-component-title="Ru1 Shop Content" data-component-props="${encodeURIComponent(JSON.stringify(data))}">
<style>${_gridCss(`[data-sg="${gridId}"]`, Number(data.columns) || 4)}</style>
<div style="${sectionStyle}">
  <div style="max-width:80rem;margin:0 auto">
    ${innerHtml}
  </div>
</div>
</section>`
}
// ─── Ru1 ShopPage sections ───────────────────────────────────────────────────

export const ru2ShoppageSections: ThemeSection[] = [
  { id: null, title: 'Ru1 Shop Hero',    html_code: renderRu2ShopHero(ru2ShopHeroDefaults) },
  { id: null, title: 'Ru1 Shop Content', html_code: renderRu2ShopContent(ru2ShopContentDefaults) },
]

// ─── Ru2 Shop Header ──────────────────────────────────────────────────────────

export const ru3ShopSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 340" width="100%" height="100%">
  <rect fill="#394152" x="0" y="0" width="280" height="18"/>
  <rect fill="#718096" x="8" y="6" width="28" height="5"/>
  <rect fill="#718096" x="185" y="6" width="16" height="5"/>
  <rect fill="#718096" x="206" y="6" width="16" height="5"/>
  <rect fill="#718096" x="227" y="6" width="16" height="5"/>
  <rect fill="#718096" x="250" y="6" width="22" height="5"/>
  <rect fill="#f3f4f6" x="0" y="18" width="280" height="22"/>
  <rect fill="#9ca3af" x="8" y="22" width="50" height="2"/>
  <rect fill="#374151" x="8" y="27" width="60" height="7"/>
  <rect fill="#e5e7eb" x="0" y="40" width="280" height="1"/>
  <rect fill="#ffffff" x="0" y="41" width="280" height="16"/>
  <rect fill="#374151" x="4" y="47" width="18" height="3"/>
  <rect fill="#9ca3af" x="26" y="47" width="24" height="3"/>
  <rect fill="#e5e7eb" x="110" y="43" width="24" height="10" rx="2"/>
  <rect fill="#e5e7eb" x="138" y="43" width="20" height="10" rx="2"/>
  <rect fill="#e5e7eb" x="162" y="43" width="24" height="10" rx="2"/>
  <rect fill="#e5e7eb" x="190" y="43" width="22" height="10" rx="2"/>
  <rect fill="#e5e7eb" x="216" y="43" width="18" height="10" rx="2"/>
  <rect fill="#e5e7eb" x="0" y="57" width="280" height="1"/>
  <rect fill="#394152" x="4" y="60" width="63" height="42"/>
  <polygon fill="#718096" points="10 98 28 76 46 98"/>
  <polygon fill="#718096" points="43 98 53 86 63 98"/>
  <rect fill="#374151" x="4" y="106" width="53" height="3"/>
  <rect fill="#9ca3af" x="4" y="113" width="30" height="2"/>
  <rect fill="#394152" x="72" y="60" width="63" height="42"/>
  <polygon fill="#718096" points="78 98 96 76 114 98"/>
  <polygon fill="#718096" points="111 98 121 86 131 98"/>
  <rect fill="#374151" x="72" y="106" width="53" height="3"/>
  <rect fill="#9ca3af" x="72" y="113" width="30" height="2"/>
  <rect fill="#394152" x="140" y="60" width="63" height="42"/>
  <polygon fill="#718096" points="146 98 164 76 182 98"/>
  <polygon fill="#718096" points="179 98 189 86 199 98"/>
  <rect fill="#374151" x="140" y="106" width="53" height="3"/>
  <rect fill="#9ca3af" x="140" y="113" width="30" height="2"/>
  <rect fill="#394152" x="209" y="60" width="63" height="42"/>
  <polygon fill="#718096" points="215 98 233 76 251 98"/>
  <polygon fill="#718096" points="248 98 258 86 268 98"/>
  <rect fill="#374151" x="209" y="106" width="53" height="3"/>
  <rect fill="#9ca3af" x="209" y="113" width="30" height="2"/>
  <rect fill="#394152" x="4" y="122" width="63" height="42"/>
  <polygon fill="#718096" points="10 160 28 138 46 160"/>
  <rect fill="#374151" x="4" y="168" width="53" height="3"/>
  <rect fill="#9ca3af" x="4" y="175" width="30" height="2"/>
  <rect fill="#394152" x="72" y="122" width="63" height="42"/>
  <polygon fill="#718096" points="78 160 96 138 114 160"/>
  <rect fill="#374151" x="72" y="168" width="53" height="3"/>
  <rect fill="#9ca3af" x="72" y="175" width="30" height="2"/>
  <rect fill="#394152" x="140" y="122" width="63" height="42"/>
  <polygon fill="#718096" points="146 160 164 138 182 160"/>
  <rect fill="#374151" x="140" y="168" width="53" height="3"/>
  <rect fill="#9ca3af" x="140" y="175" width="30" height="2"/>
  <rect fill="#394152" x="209" y="122" width="63" height="42"/>
  <polygon fill="#718096" points="215 160 233 138 251 160"/>
  <rect fill="#374151" x="209" y="168" width="53" height="3"/>
  <rect fill="#9ca3af" x="209" y="175" width="30" height="2"/>
  <rect fill="#394152" x="4" y="184" width="63" height="42"/>
  <polygon fill="#718096" points="10 222 28 200 46 222"/>
  <rect fill="#374151" x="4" y="230" width="53" height="3"/>
  <rect fill="#9ca3af" x="4" y="237" width="30" height="2"/>
  <rect fill="#394152" x="72" y="184" width="63" height="42"/>
  <polygon fill="#718096" points="78 222 96 200 114 222"/>
  <rect fill="#374151" x="72" y="230" width="53" height="3"/>
  <rect fill="#9ca3af" x="72" y="237" width="30" height="2"/>
  <rect fill="#394152" x="140" y="184" width="63" height="42"/>
  <polygon fill="#718096" points="146 222 164 200 182 222"/>
  <rect fill="#374151" x="140" y="230" width="53" height="3"/>
  <rect fill="#9ca3af" x="140" y="237" width="30" height="2"/>
  <rect fill="#394152" x="209" y="184" width="63" height="42"/>
  <polygon fill="#718096" points="215 222 233 200 251 222"/>
  <rect fill="#374151" x="209" y="230" width="53" height="3"/>
  <rect fill="#9ca3af" x="209" y="237" width="30" height="2"/>
  <rect fill="#e5e7eb" x="94" y="252" width="12" height="9" rx="2"/>
  <rect fill="#374151" x="110" y="252" width="12" height="9" rx="2"/>
  <rect fill="#e5e7eb" x="126" y="252" width="12" height="9" rx="2"/>
  <rect fill="#e5e7eb" x="142" y="252" width="12" height="9" rx="2"/>
  <rect fill="#e5e7eb" x="158" y="252" width="12" height="9" rx="2"/>
  <rect fill="#394152" x="0" y="300" width="280" height="40"/>
  <rect fill="#718096" x="8" y="308" width="55" height="4"/>
  <rect fill="#718096" x="8" y="318" width="45" height="3"/>
  <rect fill="#718096" x="100" y="308" width="55" height="4"/>
  <rect fill="#718096" x="100" y="318" width="40" height="3"/>
  <rect fill="#718096" x="192" y="308" width="55" height="4"/>
  <rect fill="#718096" x="192" y="318" width="40" height="3"/>
</svg>`

export interface Ru3ShopHeaderData {
  pageTitle: string
  breadcrumb: string
  bgColor: string
  textColor: string
  fontFamily: string
  titleFont: string
  paddingY: number
  paddingX: number
  showProductCount: boolean
  productCountText: string
  showSortBy: boolean
}

export const ru3ShopHeaderDefaults: Ru3ShopHeaderData = {
  pageTitle: 'Shop All',
  breadcrumb: 'Home > Shop All',
  bgColor: '#ffffff',
  textColor: '#111111',
  fontFamily: '',
  titleFont: '',
  paddingY: 24,
  paddingX: 16,
  showProductCount: true,
  productCountText: '13 Products',
  showSortBy: true,
}

export const ru3ShopHeaderFields: FieldConfig[] = [
  { key: 'pageTitle',         label: 'Page Title',         type: 'text',   placeholder: 'e.g. Shop All' },
  { key: 'breadcrumb',        label: 'Breadcrumb',         type: 'text',   placeholder: 'e.g. Home > Shop All' },
  { key: 'bgColor',           label: 'Background Color',   type: 'color' },
  { key: 'textColor',         label: 'Text Color',         type: 'color' },
  { key: '_h_fonts',          label: 'Fonts',              type: 'header' },
  fontField('fontFamily', 'Font Family'),
  fontField('titleFont', 'Title Font'),
  { key: 'paddingY',          label: 'Vertical Padding (px)',   type: 'number', placeholder: '24' },
  { key: 'paddingX',          label: 'Horizontal Padding (px)', type: 'number', placeholder: '16' },
  { key: 'showProductCount',  label: 'Show Product Count', type: 'toggle' },
  { key: 'productCountText',  label: 'Product Count Text', type: 'text',   placeholder: 'e.g. 13 Products' },
  { key: 'showSortBy',        label: 'Show Sort By',       type: 'toggle' },
]

export function renderRu3ShopHeader(data: Ru3ShopHeaderData): string {
  return `<section data-component-title='Ru2 Shop Header' data-component-props="${encodeURIComponent(JSON.stringify(data))}">
<div style='background:${data.bgColor};padding:${data.paddingY}px ${data.paddingX}px;border-bottom:1px solid #e5e7eb;'>
  <div style='max-width:80rem;margin:0 auto;'>
    <div style='display:flex;align-items:center;gap:8px;margin-bottom:12px;font-size:14px;color:#6b7280;'>
      <span>${data.breadcrumb}</span>
    </div>
    <div style='display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;'>
      <h1 data-field-key='pageTitle' style='font-size:28px;font-weight:700;color:${data.textColor};margin:0;${fontCss(data.titleFont, data.fontFamily)}'>${data.pageTitle}</h1>
      <div style='display:flex;align-items:center;gap:16px;'>
        ${data.showProductCount ? `<span style='font-size:14px;color:#6b7280;font-weight:500;'>${data.productCountText}</span>` : ''}
        ${data.showSortBy ? `<div style='display:flex;align-items:center;gap:8px;font-size:14px;color:#374151;'>
          <span>Sort By:</span>
          <select style='border:1px solid #e5e7eb;border-radius:6px;padding:6px 12px;font-size:14px;background:#fff;cursor:pointer;outline:none;'>
            <option>Default</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
            <option>Newest</option>
          </select>
        </div>` : ''}
      </div>
    </div>
  </div>
</div>
</section>`
}

// ─── Ru2 Shop Filters ─────────────────────────────────────────────────────────

export interface Ru3ShopFiltersData {
  bgColor: string
  borderColor: string
  paddingY: number
  paddingX: number
  showCategories: boolean
  showColor: boolean
  showSize: boolean
  showBrands: boolean
  showPrice: boolean
  fontFamily: string
  filterButtonFont: string
}

export const ru3ShopFiltersDefaults: Ru3ShopFiltersData = {
  bgColor: '#ffffff',
  borderColor: '#e5e7eb',
  paddingY: 12,
  paddingX: 16,
  showCategories: true,
  showColor: true,
  showSize: true,
  showBrands: true,
  showPrice: true,
  fontFamily: '',
  filterButtonFont: '',
}

export const ru3ShopFiltersFields: FieldConfig[] = [
  { key: 'bgColor',          label: 'Background Color',       type: 'color' },
  { key: 'borderColor',      label: 'Border Color',           type: 'color' },
  { key: 'paddingY',         label: 'Vertical Padding (px)',  type: 'number' },
  { key: 'paddingX',         label: 'Horizontal Padding (px)',type: 'number' },
  { key: 'showCategories',   label: 'Show Categories',        type: 'toggle' },
  { key: 'showColor',        label: 'Show Color',             type: 'toggle' },
  { key: 'showSize',         label: 'Show Size',              type: 'toggle' },
  { key: 'showBrands',       label: 'Show Brands',            type: 'toggle' },
  { key: 'showPrice',        label: 'Show Price',             type: 'toggle' },

  { key: '_h_fonts', label: 'Fonts', type: 'header' },
  fontField('fontFamily', 'Font Family'),
  fontField('filterButtonFont', 'Filter Button Font'),
]

export function renderRu3ShopFilters(data: Ru3ShopFiltersData): string {
  const filters = [
    data.showCategories ? 'Categories' : null,
    data.showColor ? 'Color' : null,
    data.showSize ? 'Size' : null,
    data.showBrands ? 'Brands' : null,
    data.showPrice ? 'Price' : null,
  ].filter(Boolean)

  return `<section data-component-title='Ru2 Shop Filters' data-component-props="${encodeURIComponent(JSON.stringify(data))}">
<div style='background:${data.bgColor};padding:${data.paddingY}px ${data.paddingX}px;border-bottom:1px solid ${data.borderColor};'>
  <div style='max-width:80rem;margin:0 auto;display:flex;align-items:center;gap:12px;flex-wrap:wrap;'>
    ${filters.map(f => `<button style='display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border:1px solid ${data.borderColor};border-radius:6px;background:#fff;font-size:14px;color:#374151;cursor:pointer;white-space:nowrap;${fontCss(data.filterButtonFont, data.fontFamily)}'>
      ${f}
      <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'><polyline points='6 9 12 15 18 9'></polyline></svg>
    </button>`).join('')}
  </div>
</div>
</section>`
}

// ─── Ru2 Shop Products ────────────────────────────────────────────────────────

export interface Ru3ShopProductsData {
  sectionTitle: string
  titleAlign: string
  titleColor: string
  columns: 1 | 2 | 3 | 4 | 5 | 6
  rows: number
  products: Product[]
  bgColor: string
  paddingY: number
  paddingX: number
  cardBorderRadius: number
  buttonBgColor: string
  buttonTextColor: string
  oldPriceColor: string
  cardAnimation: boolean
  hoverEffect: string
  hoverAmount: number
  animationDuration: number
  showLoadMore: boolean
  loadMoreLabel: string
  loadMoreBgColor: string
  loadMoreTextColor: string
  fontFamily: string
  sectionTitleFont: string
  productNameFont: string
  priceFont: string
  buttonFont: string
}

export const ru3ShopProductsDefaults: Ru3ShopProductsData = {
  sectionTitle: '',
  titleAlign: 'left',
  titleColor: '#111111',
  columns: 4,
  rows: 2,
  products: ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight'].map(ord => ({
    imageUrl: '',
    name: `Product ${ord}`,
    price: '$0',
    oldPrice: '',
    buttonLabel: 'Shop Now',
    buttonUrl: '/shop',
    colors: '#FF0000, #0000FF',
  })),
  bgColor: '#ffffff',
  paddingY: 24,
  paddingX: 16,
  cardBorderRadius: 8,
  buttonBgColor: '#111111',
  buttonTextColor: '#ffffff',
  oldPriceColor: '#9ca3af',
  cardAnimation: false,
  hoverEffect: 'Lift Up',
  hoverAmount: 4,
  animationDuration: 300,
  showLoadMore: true,
  loadMoreLabel: 'Load More',
  loadMoreBgColor: '#111111',
  loadMoreTextColor: '#ffffff',
  fontFamily: '',
  sectionTitleFont: '',
  productNameFont: '',
  priceFont: '',
  buttonFont: '',
}

export const ru3ShopProductsFields: FieldConfig[] = [
  { key: 'bgColor',           label: 'Background Color',          type: 'color' },
  { key: 'paddingY',          label: 'Vertical Padding (px)',     type: 'number' },
  { key: 'paddingX',          label: 'Horizontal Padding (px)',   type: 'number' },
  { key: 'columns',           label: 'Columns',                   type: 'select', options: ['2', '3', '4'] },
  { key: 'rows',              label: 'Rows',                      type: 'number', placeholder: '2' },
  { key: '_h_fonts',          label: 'Fonts',                     type: 'header' },
  fontField('fontFamily', 'Font Family'),
  fontField('sectionTitleFont', 'Section Title Font'),
  fontField('productNameFont', 'Product Name Font'),
  fontField('priceFont', 'Price Font'),
  fontField('buttonFont', 'Button Font'),
  { key: 'cardBorderRadius',  label: 'Card Border Radius (px)',   type: 'number' },
  { key: 'buttonBgColor',     label: 'Button Background',         type: 'color' },
  { key: 'buttonTextColor',   label: 'Button Text Color',         type: 'color' },
  { key: 'oldPriceColor',     label: 'Old Price Color',           type: 'color' },
  { key: 'cardAnimation',     label: 'Hover Animation',           type: 'toggle' },
  { key: 'hoverEffect',       label: 'Animation Type',            type: 'select', options: ['Lift Up', 'Drop Down', 'Slide Left', 'Slide Right', 'Pop Out', 'Zoom In', 'Glow', 'Tilt Left', 'Tilt Right'] },
  { key: 'hoverAmount',       label: 'Animation Amount',          type: 'number' },
  { key: 'animationDuration', label: 'Animation Duration (ms)',   type: 'number' },
  { key: 'showLoadMore',      label: 'Show Load More Button',     type: 'toggle' },
  { key: 'loadMoreLabel',     label: 'Load More Label',           type: 'text',   placeholder: 'e.g. Load More' },
  { key: 'loadMoreBgColor',   label: 'Load More BG Color',        type: 'color' },
  { key: 'loadMoreTextColor', label: 'Load More Text Color',      type: 'color' },
]

export function renderRu3ShopProducts(data: Ru3ShopProductsData): string {
  const colCls = _colClass[String(data.columns)] ?? _colClass['4']
  const _hoverCSS = (effect: string, amount: number): string => {
    switch (effect) {
      case 'Lift Up':    return `transform:translateY(-${amount}px)`
      case 'Drop Down':  return `transform:translateY(${amount}px)`
      case 'Slide Left': return `transform:translateX(-${amount}px)`
      case 'Slide Right':return `transform:translateX(${amount}px)`
      case 'Pop Out':    return `transform:scale(${1 + amount / 100})`
      case 'Zoom In':    return `transform:scale(${1 + amount / 100});box-shadow:0 25px 50px rgba(0,0,0,0.15)`
      case 'Glow':       return `box-shadow:0 0 ${amount}px rgba(99,102,241,0.7)`
      case 'Tilt Left':  return `transform:rotate(-${amount}deg)`
      case 'Tilt Right': return `transform:rotate(${amount}deg)`
      default:           return `transform:translateY(-${amount}px)`
    }
  }
  const gridId = 'r3g-ru1r3'
  const animStyle = `<style>${_gridCss(`#${gridId}`, Number(data.columns) || 4)}${data.cardAnimation ? `[data-ru3-card]{transition:transform ${data.animationDuration}ms ease,box-shadow ${data.animationDuration}ms ease}[data-ru3-card]:hover{${_hoverCSS(data.hoverEffect, data.hoverAmount)}}` : ''}</style>`
  const cardAttr = data.cardAnimation ? ' data-ru3-card="1"' : ''

  const sectionStyle = [
    data.bgColor ? `background:${data.bgColor}` : '',
    `padding:${data.paddingY}px ${data.paddingX}px`,
  ].filter(Boolean).join(';')

  const maxVisible = data.columns * (data.rows ?? 1)
  const placeholder = { imageUrl: placeholderSvg, name: 'Product Name', price: '$0.00', oldPrice: '', buttonLabel: 'Shop Now', buttonUrl: '/shop', colors: '' }
  const visibleProducts = [
    ...data.products.slice(0, maxVisible),
    ...Array(Math.max(0, maxVisible - data.products.length)).fill(placeholder),
  ]
  const cards = visibleProducts.map(p => `
      <div style="border-radius:${data.cardBorderRadius}px;overflow:hidden;display:flex;flex-direction:column;border:1px solid #e5e7eb"${cardAttr}>
        <img style="width:100%;height:auto;display:block" src="${p.imageUrl || placeholderSvg}" alt="${p.name}" />
        <div style="display:flex;flex-direction:column;gap:0.25rem;padding:0.75rem;flex:1">
          <p style="font-weight:600;font-size:0.875rem;${fontCss(data.productNameFont, data.fontFamily)}">${p.name}</p>
          <div style="display:flex;align-items:center;gap:0.5rem">
            <p style="font-size:0.875rem;${fontCss(data.priceFont, data.fontFamily)}">${p.price}</p>
            ${p.oldPrice ? `<s style="color:${data.oldPriceColor};font-size:0.875rem;${fontCss(data.priceFont, data.fontFamily)}">${p.oldPrice}</s>` : ''}
          </div>
          ${(() => { const cs = Array.isArray(p.colors) ? '' : String(p.colors ?? '').trim(); const all = cs ? cs.split(',').map((c: string) => c.trim()).filter(Boolean) : []; const shown = all.slice(0, 13); const extra = all.length - 13; return all.length ? `<div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;padding:4px 0">${shown.map((c: string) => `<span title="${c}" style="display:inline-block;width:14px;height:14px;border-radius:50%;background:${c};border:1px solid rgba(0,0,0,0.15);flex-shrink:0"></span>`).join('')}${extra > 0 ? `<span style="font-size:10px;color:#6b7280;line-height:14px;flex-shrink:0">+${extra}</span>` : ''}</div>` : '' })()}
          <a href="${p.buttonUrl}" class="shop-btn" style="background:${data.buttonBgColor};color:${data.buttonTextColor};border-radius:${data.cardBorderRadius}px;margin-top:auto;text-align:center;font-size:0.875rem;font-weight:500;padding:0.5rem 1rem;text-decoration:none;display:block;${fontCss(data.buttonFont, data.fontFamily)}">${p.buttonLabel}</a>
        </div>
      </div>`).join('')

  const loadMoreBtn = data.showLoadMore
    ? `<div style="display:flex;justify-content:center;margin-top:32px;">
        <button style="background:${data.loadMoreBgColor};color:${data.loadMoreTextColor};border:none;border-radius:8px;padding:12px 40px;font-size:15px;font-weight:600;cursor:pointer;letter-spacing:0.02em;${fontCss(data.buttonFont, data.fontFamily)}">${data.loadMoreLabel}</button>
      </div>`
    : ''

  return `<section data-component-title="Ru2 Shop Products" data-component-props="${encodeURIComponent(JSON.stringify(data))}">
${animStyle}
<div style="${sectionStyle}">
  <div style="max-width:80rem;margin:0 auto">
    <div id="${gridId}">
      ${cards}
    </div>
    ${loadMoreBtn}
  </div>
</div>
</section>`
}

export const ru3ShopSections: ThemeSection[] = [
  { id: null, title: 'Ru2 Shop Header',   html_code: renderRu3ShopHeader(ru3ShopHeaderDefaults) },
  { id: null, title: 'Ru2 Shop Filters',  html_code: renderRu3ShopFilters(ru3ShopFiltersDefaults) },
  { id: null, title: 'Ru2 Shop Products', html_code: renderRu3ShopProducts(ru3ShopProductsDefaults) },
]

// ═══════════════════════════════════════════════════════════════════════════════
// Ru2 HomePage — Fieldwork (Dark + Amber)
// ═══════════════════════════════════════════════════════════════════════════════

export const ru2HomePageSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 340" width="100%" height="100%">
  <rect fill="#394152" x="0" y="0" width="280" height="18"/>
  <rect fill="#718096" x="8" y="6" width="30" height="5"/>
  <rect fill="#718096" x="180" y="6" width="18" height="5"/>
  <rect fill="#718096" x="203" y="6" width="18" height="5"/>
  <rect fill="#718096" x="226" y="6" width="18" height="5"/>
  <rect fill="#718096" x="250" y="6" width="22" height="5"/>
  <rect fill="#394152" x="0" y="26" width="130" height="75"/>
  <rect fill="#718096" x="8" y="34" width="55" height="4"/>
  <rect fill="#718096" x="8" y="42" width="90" height="7"/>
  <rect fill="#718096" x="8" y="53" width="75" height="4"/>
  <rect fill="#718096" x="8" y="61" width="60" height="4"/>
  <rect fill="#718096" x="8" y="76" width="38" height="9"/>
  <rect fill="#394152" x="138" y="26" width="142" height="75"/>
  <polygon fill="#718096" points="150 96 190 52 230 96 150 96"/>
  <polygon fill="#718096" points="220 96 248 66 276 96 220 96"/>
  <circle fill="#718096" cx="248" cy="58" r="7"/>
  <rect fill="#394152" x="0" y="113" width="90" height="7"/>
  <rect fill="#394152" x="0" y="128" width="62" height="56"/>
  <rect fill="#394152" x="73" y="128" width="62" height="56"/>
  <rect fill="#394152" x="146" y="128" width="62" height="56"/>
  <rect fill="#394152" x="219" y="128" width="61" height="56"/>
  <polygon fill="#718096" points="8 174 22 155 36 174 8 174"/>
  <polygon fill="#718096" points="81 174 95 155 109 174 81 174"/>
  <polygon fill="#718096" points="154 174 168 155 182 174 154 174"/>
  <polygon fill="#718096" points="227 174 241 155 255 174 227 174"/>
  <rect fill="#394152" x="0" y="192" width="55" height="4"/>
  <rect fill="#394152" x="73" y="192" width="55" height="4"/>
  <rect fill="#394152" x="146" y="192" width="55" height="4"/>
  <rect fill="#394152" x="219" y="192" width="55" height="4"/>
  <rect fill="#394152" x="0" y="202" width="30" height="3"/>
  <rect fill="#394152" x="73" y="202" width="30" height="3"/>
  <rect fill="#394152" x="146" y="202" width="30" height="3"/>
  <rect fill="#394152" x="219" y="202" width="30" height="3"/>
  <rect fill="#394152" x="0" y="224" width="280" height="78"/>
  <rect fill="#718096" x="8" y="234" width="55" height="4"/>
  <rect fill="#718096" x="8" y="244" width="45" height="3"/>
  <rect fill="#718096" x="8" y="252" width="50" height="3"/>
  <rect fill="#718096" x="8" y="260" width="40" height="3"/>
  <rect fill="#718096" x="100" y="234" width="55" height="4"/>
  <rect fill="#718096" x="100" y="244" width="45" height="3"/>
  <rect fill="#718096" x="100" y="252" width="50" height="3"/>
  <rect fill="#718096" x="192" y="234" width="55" height="4"/>
  <rect fill="#718096" x="192" y="244" width="50" height="3"/>
  <rect fill="#718096" x="192" y="252" width="45" height="3"/>
  <rect fill="#718096" x="90" y="285" width="100" height="3"/>
</svg>`

// ── Ru2 HomePage unique component defaults ────────────────────────────────────

export interface Ru2HomeNavbarData extends ReturnType<typeof Object.assign> {}
export const ru2HomeNavbarDefaults = {
  ...megaMenuHeaderDefaults,
  bgColor: '#0f1923',
  textColor: '#ffffff',
  linkColor: '#d1d5db',
  bottomBorderColor: '#1c2e3e',
  showBottomBorder: true,
  dynamicCategories: true,
  ctaButtons: [
    { label: 'Sign In', href: '/login', style: 'outline', textColor: '#f59e0b', bgColor: 'transparent', borderColor: '#f59e0b' },
    { label: 'Shop Now', href: '/shop', style: 'filled', textColor: '#0f1923', bgColor: '#f59e0b', borderColor: '#f59e0b' },
  ],
}

export const ru2HomeCarouselDefaults = {
  ...ru5ImageCarouselDefaults,
  height: 520,
  dotActiveColor: '#f59e0b',
  dotColor: 'rgba(245,158,11,0.3)',
  slides: [
    { bgImage: '', overlayColor: '#0f1923', overlayOpacity: 75, title: 'Built for the Field.\nReady for Anything.', subtitle: 'NEW SEASON DROP', description: 'Premium workwear and branded gear, curated for your team.', showCta: true, ctaLabel: 'Shop Now', ctaHref: '/shop', ctaBgColor: '#f59e0b', ctaTextColor: '#0f1923' },
    { bgImage: '', overlayColor: '#0f1923', overlayOpacity: 75, title: 'Gear That Works\nAs Hard As You', subtitle: 'FEATURED GEAR', description: 'From the site to the weekend — we have got you covered.', showCta: true, ctaLabel: 'Explore', ctaHref: '/shop', ctaBgColor: '#f59e0b', ctaTextColor: '#0f1923' },
    { bgImage: '', overlayColor: '#0f1923', overlayOpacity: 75, title: 'Your Brand.\nYour Team.\nYour Store.', subtitle: 'EXCLUSIVE DROPS', description: 'Branded gear that makes your team stand out.', showCta: true, ctaLabel: 'Get Started', ctaHref: '/shop', ctaBgColor: '#f59e0b', ctaTextColor: '#0f1923' },
  ],
}

export const ru2HomeStatsDefaults = {
  ...ru1StatsDefaults,
  bgColor: '#f8f9fa',
  cardBgColor: '#ffffff',
  valueColor: '#0f1923',
  valueFontWeight: '800',
  labelColor: '#6b7280',
  showBorder: true,
  cardBorderColor: '#e5e7eb',
  items: [
    { iconUrl: '', value: '500+', label: 'Products Available', description: 'Curated workwear and branded gear' },
    { iconUrl: '', value: '98%', label: 'Satisfaction Rate', description: 'Verified customer reviews' },
    { iconUrl: '', value: '48h', label: 'Fast Shipping', description: 'Delivered straight to your door' },
    { iconUrl: '', value: '12K+', label: 'Happy Teams', description: 'Companies trusting us with their brand' },
  ],
}

export const ru2HomeSplitHeroDefaults = {
  ...ru6SplitHeroDefaults,
  bgColor: '#ffffff',
  textSide: 'left',
  eyebrow: 'OUR PROMISE',
  eyebrowColor: '#f59e0b',
  title: 'Gear That Works\nAs Hard As You',
  titleColor: '#0f1923',
  titleFontWeight: '900',
  description: 'Every piece selected for durability, comfort, and brand-readiness. Your logo, your colors, your team.',
  descriptionColor: '#6b7280',
  ctaLabel: 'Explore Collection',
  ctaBgColor: '#f59e0b',
  ctaTextColor: '#0f1923',
  ctaBorderColor: '#f59e0b',
  cardMode: false,
  imageBorderRadius: 16,
}

export const ru2HomeFooterDefaults = {
  ...layoutFooter1Defaults,
  bgColor: '#0a1118',
  textColor: '#9ca3af',
  copyright: '© 2026 Fieldwork™ — All rights reserved.',
}

export const ru2HomePageSections: ThemeSection[] = [
  { id: null, title: 'Ru2-Home-Navbar',    html_code: renderMegaMenuHeader(ru2HomeNavbarDefaults) },
  { id: null, title: 'Ru2-Home-Carousel',  html_code: renderRu5ImageCarousel(ru2HomeCarouselDefaults) },
  { id: null, title: 'Ru2-Home-Stats',     html_code: renderRu1Stats(ru2HomeStatsDefaults) },
  { id: null, title: 'Ru1 Homepage Featured Products', html_code: renderRu1Products(ru1ProductsDefaults) },
  { id: null, title: 'Ru2-Home-SplitHero', html_code: renderRu6SplitHero(ru2HomeSplitHeroDefaults) },
  { id: null, title: 'Ru2-Home-Footer',    html_code: renderLayoutFooter1(ru2HomeFooterDefaults) },
]

// ═══════════════════════════════════════════════════════════════════════════════
// Ru3 HomePage — Slate & Mint (Corporate Clean)
// ═══════════════════════════════════════════════════════════════════════════════

export const ru3HomePageSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 340" width="100%" height="100%">
  <rect fill="#394152" x="0" y="0" width="280" height="18"/>
  <rect fill="#718096" x="8" y="6" width="30" height="5"/>
  <rect fill="#718096" x="180" y="6" width="18" height="5"/>
  <rect fill="#718096" x="203" y="6" width="18" height="5"/>
  <rect fill="#718096" x="226" y="6" width="18" height="5"/>
  <rect fill="#718096" x="250" y="6" width="22" height="5"/>
  <rect fill="#394152" x="0" y="26" width="280" height="55"/>
  <polygon fill="#718096" points="50 77 100 40 150 77 50 77"/>
  <polygon fill="#718096" points="140 77 168 52 196 77 140 77"/>
  <polygon fill="#718096" points="188 77 230 44 272 77 188 77"/>
  <circle fill="#718096" cx="230" cy="36" r="6"/>
  <rect fill="#394152" x="0" y="93" width="55" height="6"/>
  <rect fill="#394152" x="0" y="108" width="86" height="42"/>
  <polygon fill="#718096" points="8 144 30 124 52 144 8 144"/>
  <rect fill="#718096" x="8" y="153" width="55" height="3"/>
  <rect fill="#394152" x="97" y="108" width="86" height="42"/>
  <polygon fill="#718096" points="105 144 127 124 149 144 105 144"/>
  <rect fill="#718096" x="105" y="153" width="55" height="3"/>
  <rect fill="#394152" x="194" y="108" width="86" height="42"/>
  <polygon fill="#718096" points="202 144 224 124 246 144 202 144"/>
  <rect fill="#718096" x="202" y="153" width="55" height="3"/>
  <rect fill="#394152" x="0" y="168" width="55" height="5"/>
  <rect fill="#394152" x="0" y="181" width="62" height="45"/>
  <polygon fill="#718096" points="5 220 19 204 33 220 5 220"/>
  <rect fill="#394152" x="73" y="181" width="62" height="45"/>
  <polygon fill="#718096" points="78 220 92 204 106 220 78 220"/>
  <rect fill="#394152" x="146" y="181" width="62" height="45"/>
  <polygon fill="#718096" points="151 220 165 204 179 220 151 220"/>
  <rect fill="#394152" x="219" y="181" width="61" height="45"/>
  <polygon fill="#718096" points="224 220 238 204 252 220 224 220"/>
  <rect fill="#394152" x="0" y="233" width="45" height="3"/>
  <rect fill="#394152" x="73" y="233" width="45" height="3"/>
  <rect fill="#394152" x="146" y="233" width="45" height="3"/>
  <rect fill="#394152" x="219" y="233" width="45" height="3"/>
  <rect fill="#394152" x="0" y="252" width="280" height="50"/>
  <rect fill="#718096" x="8" y="262" width="55" height="4"/>
  <rect fill="#718096" x="8" y="270" width="45" height="3"/>
  <rect fill="#718096" x="8" y="278" width="50" height="3"/>
  <rect fill="#718096" x="100" y="262" width="55" height="4"/>
  <rect fill="#718096" x="100" y="270" width="45" height="3"/>
  <rect fill="#718096" x="192" y="262" width="55" height="4"/>
  <rect fill="#718096" x="192" y="270" width="50" height="3"/>
  <rect fill="#718096" x="90" y="294" width="100" height="3"/>
</svg>`

// ── Ru3 HomePage unique component defaults ────────────────────────────────────

export const ru3HomeNavbarDefaults = {
  ...megaMenuHeaderDefaults,
  bgColor: '#ffffff',
  textColor: '#0f2d4a',
  linkColor: '#374151',
  bottomBorderColor: '#e5e7eb',
  showBottomBorder: true,
  dynamicCategories: true,
  ctaButtons: [
    { label: 'Sign In', href: '/login', style: 'outline', textColor: '#0f2d4a', bgColor: 'transparent', borderColor: '#0f2d4a' },
    { label: 'Browse Gear', href: '/shop', style: 'filled', textColor: '#ffffff', bgColor: '#0f2d4a', borderColor: '#0f2d4a' },
  ],
}

export const ru3HomeSplitHeroDefaults = {
  ...ru6SplitHeroDefaults,
  bgColor: '#ffffff',
  textSide: 'left',
  eyebrow: 'YOUR COMPANY STORE',
  eyebrowColor: '#10b981',
  title: 'Gear Up.\nStand Out.\nShip Fast.',
  titleColor: '#0f2d4a',
  titleFontWeight: '800',
  titleFontSize: 52,
  description: 'Everything your team needs, branded and ready. Select your gear, redeem your allowance, and ship it straight to your door.',
  descriptionColor: '#6b7280',
  ctaLabel: 'Browse Gear',
  ctaBgColor: '#0f2d4a',
  ctaTextColor: '#ffffff',
  ctaBorderColor: '#0f2d4a',
  showSecondaryCta: true,
  secondaryCtaLabel: 'How it works',
  secondaryCtaHref: '/aboutus',
  secondaryCtaColor: '#10b981',
  cardMode: true,
  cardBgColor: '#e8f5f1',
  cardBorderRadius: 16,
  cardPadding: 24,
  imageHeight: 380,
}

export const ru3HomeStatsDefaults = {
  ...ru2StatsDefaults,
  bgColor: '#f8fafc',
  cardBgColor: '#ffffff',
  title: 'Why teams choose us.',
  titleColor: '#0f2d4a',
  subtitle: 'Numbers that speak for themselves.',
  subtitleColor: '#9ca3af',
  showCta1: true,
  cta1Label: 'See Demo',
  cta1BgColor: '#ffffff',
  cta1TextColor: '#374151',
  cta1BorderColor: '#d1d5db',
  showCta2: true,
  cta2Label: 'Get Started',
  cta2BgColor: '#0f2d4a',
  cta2TextColor: '#ffffff',
  cta2BorderColor: '#0f2d4a',
  valueColor: '#0f2d4a',
  valueFontWeight: '800',
  labelColor: '#374151',
  descriptionColor: '#9ca3af',
  dividerColor: '#e5e7eb',
  showDividers: true,
  items: [
    { value: '500+', label: 'Products', description: 'Curated workwear and branded gear options' },
    { value: '48h', label: 'Shipping', description: 'Fast delivery straight to your door' },
    { value: '12K+', label: 'Happy Teams', description: 'Companies trusting us with their brand' },
    { value: '98%', label: 'Satisfaction', description: 'Verified customer satisfaction rating' },
  ],
}

export const ru3HomeEditorialDefaults = {
  ...ru4StatsDefaults,
  bgColor: '#f0f7f4',
  sectionTitle: '"The gear that defines how your team shows up."',
  sectionTitleColor: '#0f2d4a',
  sectionTitleWeight: '300',
  dividerColor: '#b2d8cc',
  showDivider: true,
  sectionNumber: '03',
  sectionNumberColor: '#0f2d4a',
  sectionDescription: 'Three simple steps — pick your gear, redeem your allowance, and ship it home. Your team always looks the part.',
  sectionDescriptionColor: '#6b7280',
  valueColor: '#0f2d4a',
  valueFontWeight: '300',
  labelColor: '#6b7280',
  items: [
    { value: '500+', label: 'Products Available' },
    { value: '48h', label: 'Delivery Time' },
    { value: '12K', label: 'Teams Served' },
    { value: '98%', label: 'Satisfaction Rate' },
  ],
}

export const ru3HomeFooterDefaults = {
  ...layoutFooter1Defaults,
  bgColor: '#0f2d4a',
  textColor: '#9ca3af',
  copyright: '© 2026 ProStore — All rights reserved.',
}

export const ru3HomePageSections: ThemeSection[] = [
  { id: null, title: 'Ru3-Home-Navbar',    html_code: renderMegaMenuHeader(ru3HomeNavbarDefaults) },
  { id: null, title: 'Ru3-Home-SplitHero', html_code: renderRu6SplitHero(ru3HomeSplitHeroDefaults) },
  { id: null, title: 'Ru3-Home-Stats',     html_code: renderRu2Stats(ru3HomeStatsDefaults) },
  { id: null, title: 'Ru1 Homepage Featured Products', html_code: renderRu1Products(ru1ProductsDefaults) },
  { id: null, title: 'Ru3-Home-Editorial', html_code: renderRu4Stats(ru3HomeEditorialDefaults) },
  { id: null, title: 'Ru3-Home-Footer',    html_code: renderLayoutFooter1(ru3HomeFooterDefaults) },
]

// ═══════════════════════════════════════════════════════════════════════════════
// Ru4 HomePage — Outpost (Warm Terracotta)
// ═══════════════════════════════════════════════════════════════════════════════

export const ru4HomePageSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 340" width="100%" height="100%">
  <rect fill="#394152" x="0" y="0" width="280" height="18"/>
  <rect fill="#718096" x="8" y="6" width="30" height="5"/>
  <rect fill="#718096" x="180" y="6" width="18" height="5"/>
  <rect fill="#718096" x="203" y="6" width="18" height="5"/>
  <rect fill="#718096" x="226" y="6" width="18" height="5"/>
  <rect fill="#718096" x="250" y="6" width="22" height="5"/>
  <rect fill="#394152" x="0" y="26" width="280" height="80"/>
  <polygon fill="#718096" points="60 100 120 52 180 100 60 100"/>
  <polygon fill="#718096" points="170 100 208 68 246 100 170 100"/>
  <circle fill="#718096" cx="208" cy="60" r="8"/>
  <rect fill="#718096" x="85" y="58" width="110" height="7"/>
  <rect fill="#718096" x="100" y="70" width="80" height="4"/>
  <rect fill="#394152" x="0" y="118" width="86" height="30"/>
  <rect fill="#718096" x="8" y="125" width="50" height="4"/>
  <rect fill="#718096" x="8" y="133" width="38" height="3"/>
  <rect fill="#394152" x="97" y="118" width="86" height="30"/>
  <rect fill="#718096" x="105" y="125" width="50" height="4"/>
  <rect fill="#718096" x="105" y="133" width="38" height="3"/>
  <rect fill="#394152" x="194" y="118" width="86" height="30"/>
  <rect fill="#718096" x="202" y="125" width="50" height="4"/>
  <rect fill="#718096" x="202" y="133" width="38" height="3"/>
  <rect fill="#394152" x="0" y="160" width="80" height="6"/>
  <rect fill="#394152" x="0" y="174" width="62" height="50"/>
  <polygon fill="#718096" points="5 218 19 200 33 218 5 218"/>
  <rect fill="#394152" x="73" y="174" width="62" height="50"/>
  <polygon fill="#718096" points="78 218 92 200 106 218 78 218"/>
  <rect fill="#394152" x="146" y="174" width="62" height="50"/>
  <polygon fill="#718096" points="151 218 165 200 179 218 151 218"/>
  <rect fill="#394152" x="219" y="174" width="61" height="50"/>
  <polygon fill="#718096" points="224 218 238 200 252 218 224 218"/>
  <rect fill="#394152" x="0" y="232" width="45" height="3"/>
  <rect fill="#394152" x="73" y="232" width="45" height="3"/>
  <rect fill="#394152" x="146" y="232" width="45" height="3"/>
  <rect fill="#394152" x="219" y="232" width="45" height="3"/>
  <rect fill="#394152" x="0" y="252" width="280" height="50"/>
  <rect fill="#718096" x="8" y="262" width="55" height="4"/>
  <rect fill="#718096" x="8" y="270" width="45" height="3"/>
  <rect fill="#718096" x="8" y="278" width="50" height="3"/>
  <rect fill="#718096" x="100" y="262" width="55" height="4"/>
  <rect fill="#718096" x="100" y="270" width="45" height="3"/>
  <rect fill="#718096" x="192" y="262" width="55" height="4"/>
  <rect fill="#718096" x="192" y="270" width="50" height="3"/>
  <rect fill="#718096" x="90" y="294" width="100" height="3"/>
</svg>`

export const ru4HomeNavbarDefaults = {
  ...megaMenuHeaderDefaults,
  bgColor: '#faf9f7',
  textColor: '#1a1a1a',
  linkColor: '#4a4440',
  bottomBorderColor: '#e8e2da',
  showBottomBorder: true,
  dynamicCategories: true,
  ctaButtons: [
    { label: 'Sign In', href: '/login', style: 'outline', textColor: '#1a1a1a', bgColor: 'transparent', borderColor: '#1a1a1a' },
    { label: 'Shop Now', href: '/shop', style: 'filled', textColor: '#ffffff', bgColor: '#e85d26', borderColor: '#e85d26' },
  ],
}

export const ru4HomeSplitHeroDefaults = {
  ...ru6SplitHeroDefaults,
  bgColor: '#f5f0e8',
  textSide: 'left',
  eyebrow: 'YOUR COMPANY STORE',
  eyebrowColor: '#e85d26',
  title: 'Gear Built for\nReal Work.',
  titleColor: '#1a1a1a',
  titleFontWeight: '900',
  titleFontSize: 52,
  description: 'From the site to the weekend — branded apparel your team will actually reach for. Your logo, your colors, delivered fast.',
  descriptionColor: '#6b5c52',
  ctaLabel: 'Browse Gear',
  ctaBgColor: '#e85d26',
  ctaTextColor: '#ffffff',
  ctaBorderColor: '#e85d26',
  showSecondaryCta: true,
  secondaryCtaLabel: 'How it works',
  secondaryCtaHref: '/aboutus',
  secondaryCtaColor: '#e85d26',
  cardMode: true,
  cardBgColor: '#e8ddd0',
  cardBorderRadius: 16,
  cardPadding: 24,
  imageHeight: 380,
}

export const ru4HomeStepsDefaults = {
  ...ru3StatsDefaults,
  bgColor: '#ffffff',
  cardBgColor: '#ffffff',
  cardBorderRadius: 0,
  showBorder: false,
  badgeBgColor: '#fef0e8',
  badgeTextColor: '#e85d26',
  badgeSize: 48,
  showSeparator: true,
  separatorColor: '#e8e2da',
  titleColor: '#1a1a1a',
  titleFontWeight: '700',
  descriptionColor: '#6b5c52',
  showSectionTitle: true,
  sectionTitle: 'Three Simple Steps',
  sectionTitleColor: '#e85d26',
  sectionTitleSize: 12,
  sectionTitleWeight: '700',
  items: [
    { badgeType: 'number', badgeText: '1', iconUrl: '', title: 'Pick Your Gear', description: 'Explore the lineup and find pieces that fit your style and your work.' },
    { badgeType: 'number', badgeText: '2', iconUrl: '', title: 'Redeem Your Credit', description: 'Your launch allowance is already loaded and ready to use.' },
    { badgeType: 'number', badgeText: '3', iconUrl: '', title: 'Ship It Home', description: 'Fast free shipping straight to your door. No hassle.' },
  ],
}

export const ru4HomeAboutSplitDefaults = {
  ...ru6SplitHeroDefaults,
  bgColor: '#ffffff',
  textSide: 'left',
  eyebrow: 'OUR PROMISE',
  eyebrowColor: '#e85d26',
  title: 'Quality Pieces\nBuilt to Last',
  titleColor: '#1a1a1a',
  titleFontWeight: '900',
  titleFontSize: 40,
  description: 'Every item is selected for durability, comfort, and brand pride. Your team deserves gear they will wear long after the workday ends.',
  descriptionColor: '#6b5c52',
  ctaLabel: 'Explore Collection',
  ctaBgColor: '#1a1a1a',
  ctaTextColor: '#ffffff',
  ctaBorderColor: '#1a1a1a',
  cardMode: true,
  cardBgColor: '#f5f0e8',
  cardBorderRadius: 0,
  cardPadding: 0,
  imageHeight: 320,
}

export const ru4HomeFooterDefaults = {
  ...layoutFooter1Defaults,
  bgColor: '#2d2618',
  textColor: '#8b7d6b',
  copyright: '© 2026 Outpost — All rights reserved.',
}

export const ru4HomePageSections: ThemeSection[] = [
  { id: null, title: 'Ru4 Homepage Navbar',    html_code: renderMegaMenuHeader(ru4HomeNavbarDefaults) },
  { id: null, title: 'Ru4 Homepage SplitHero', html_code: renderRu6SplitHero(ru4HomeSplitHeroDefaults) },
  { id: null, title: 'Ru4 Homepage Steps',     html_code: renderRu3Stats(ru4HomeStepsDefaults) },
  { id: null, title: 'Ru1 Homepage Featured Products', html_code: renderRu1Products(ru1ProductsDefaults) },
  { id: null, title: 'Ru4 Homepage About',     html_code: renderRu6SplitHero(ru4HomeAboutSplitDefaults) },
  { id: null, title: 'Ru4 Homepage Footer',    html_code: renderLayoutFooter1(ru4HomeFooterDefaults) },
]
