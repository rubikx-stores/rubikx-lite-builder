import type { FieldConfig } from './useBlockRegistry'

export interface ThemeSection {
  id: null
  title: string
  html_code: string
}

const placeholderSvg = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 150"><rect fill="#394152" width="200" height="150"/><polygon fill="#718096" points="65 90 90 60 115 90"/><polygon fill="#718096" points="110 90 122.5 75 135 90"/><circle fill="#718096" cx="122.5" cy="64" r="4"/></svg>')}`

export const ru1TechwireSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 340" width="100%" height="100%">
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
  bgColor: string
  sticky: boolean
  showSearch: boolean
  searchPlaceholder: string
  navLinks: NavLink[]
  showSignIn: boolean
  signInLabel: string
  signInUrl: string
  showContactUs: boolean
  contactUsLabel: string
  contactUsUrl: string
  showCart: boolean
  cartUrl: string
  textColor: string
  fontSize: number
  fontWeight: string
  paddingY: number
  paddingX: number
  logoWidth: number
  borderStyle: string
  borderWidth: number
  borderColor: string
}

export const ru1NavbarDefaults: Ru1NavbarData = {
  logoUrl: '',
  brandName: 'Your Logo',
  bgColor: '#ffffff',
  sticky: false,
  showSearch: true,
  searchPlaceholder: 'Search...',
  navLinks: [
    { label: 'Home', url: '/', visible: true },
    { label: 'Shop', url: '/shop', visible: true },
    { label: 'About Us', url: '/about', visible: true },
  ],
  showSignIn: true,
  signInLabel: 'Sign In',
  signInUrl: '/signin',
  showContactUs: true,
  contactUsLabel: 'Contact Us',
  contactUsUrl: '/contact',
  showCart: true,
  cartUrl: '/cart',
  textColor: '#111827',
  fontSize: 14,
  fontWeight: '500',
  paddingY: 0,
  paddingX: 16,
  logoWidth: 120,
  borderStyle: 'none',
  borderWidth: 1,
  borderColor: '#e5e7eb',
}

export const ru1NavbarFields: FieldConfig[] = [
  { key: 'logoUrl', label: 'Logo Image', type: 'image' },
  { key: 'brandName', label: 'Brand Name', type: 'text' },
  { key: 'bgColor', label: 'Background Color', type: 'color' },
  { key: 'sticky', label: 'Sticky Navbar', type: 'toggle' },
  { key: 'showSearch', label: 'Search Bar', type: 'toggle' },
  { key: 'searchPlaceholder', label: 'Search Placeholder', type: 'text' },
  {
    key: 'navLinks', label: 'Nav Links', type: 'list',
    listFields: [
      { key: 'label', label: 'Label', type: 'text' },
      { key: 'url', label: 'URL', type: 'url' },
      { key: 'visible', label: 'Visible', type: 'toggle' },
    ],
  },
  { key: 'showSignIn', label: 'Show Sign In', type: 'toggle' },
  { key: 'signInLabel', label: 'Sign In Label', type: 'text' },
  { key: 'signInUrl', label: 'Sign In URL', type: 'url' },
  { key: 'showContactUs', label: 'Show Contact Us', type: 'toggle' },
  { key: 'contactUsLabel', label: 'Contact Us Label', type: 'text' },
  { key: 'contactUsUrl', label: 'Contact Us URL', type: 'url' },
  { key: 'showCart', label: 'Show Cart', type: 'toggle' },
  { key: 'cartUrl', label: 'Cart URL', type: 'url' },
  { key: 'textColor', label: 'Text Color', type: 'color' },
  { key: 'fontSize', label: 'Font Size', type: 'number' },
  { key: 'fontWeight', label: 'Font Weight', type: 'select', options: ['300', '400', '500', '600', '700', '800'] },
  { key: 'paddingY', label: 'Vertical Padding', type: 'number' },
  { key: 'paddingX', label: 'Horizontal Padding', type: 'number' },
  { key: 'logoWidth', label: 'Logo Width', type: 'number' },
  { key: 'borderStyle', label: 'Border Style', type: 'select', options: ['none', 'solid', 'dashed', 'dotted'] },
  { key: 'borderWidth', label: 'Border Width', type: 'number' },
  { key: 'borderColor', label: 'Border Color', type: 'color' },
]

export function renderRu1Navbar(data: Ru1NavbarData): string {
  const navStyle = [
    `background:${data.bgColor}`,
    `color:${data.textColor}`,
    `font-size:${data.fontSize}px`,
    `font-weight:${data.fontWeight}`,
    (data.paddingY || data.paddingX) ? `padding:${data.paddingY}px ${data.paddingX}px` : '',
    data.borderStyle !== 'none' ? `border-bottom:${data.borderWidth}px ${data.borderStyle} ${data.borderColor}` : '',
    data.sticky ? 'position:sticky;top:0;z-index:50' : '',
  ].filter(Boolean).join(';')

  const logo = data.logoUrl
    ? `<img src="${data.logoUrl}" alt="${data.brandName}" style="width:${data.logoWidth}px;height:auto;display:block;" />`
    : `<span style="font-size:1.125rem;font-weight:700;">${data.brandName}</span>`

  const searchBar = data.showSearch
    ? `<div class="pbx-flex-1 pbx-flex pbx-justify-center">
        <div class="pbx-flex pbx-items-center pbx-border pbx-border-gray-300 pbx-rounded-full pbx-px-3 pbx-py-1.5 pbx-gap-2 pbx-w-full pbx-max-w-xs">
          <svg class="pbx-h-4 pbx-w-4 pbx-flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/></svg>
          <input type="text" placeholder="${data.searchPlaceholder}" class="pbx-w-full pbx-bg-transparent pbx-text-sm focus:pbx-outline-none" />
        </div>
      </div>`
    : '<div class="pbx-flex-1"></div>'

  const topRight = [
    data.showSignIn ? `<a href="${data.signInUrl}" style="color:${data.textColor}" class="pbx-text-sm pbx-font-medium pbx-no-underline">${data.signInLabel}</a>` : '',
    data.showContactUs ? `<a href="${data.contactUsUrl}" style="color:${data.textColor}" class="pbx-text-sm pbx-font-medium pbx-no-underline">${data.contactUsLabel}</a>` : '',
    data.showCart
      ? `<a href="${data.cartUrl}" style="color:${data.textColor}"><svg class="pbx-h-6 pbx-w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg></a>`
      : '',
  ].filter(Boolean)

  const navLinks = data.navLinks
    .filter(l => l.visible !== false)
    .map(l => `<a href="${l.url}" style="color:${data.textColor}" class="pbx-text-sm pbx-font-medium pbx-no-underline">${l.label}</a>`)

  return `<section data-component-title="Ru1 Techwire Navbar">
<nav style="${navStyle}">
  <div class="pbx-max-w-7xl pbx-mx-auto pbx-px-4 sm:pbx-px-6 lg:pbx-px-8">
    <div class="pbx-flex pbx-items-center pbx-justify-between pbx-gap-4 pbx-py-3">
      <div class="pbx-flex-shrink-0">${logo}</div>
      ${searchBar}
      <div class="pbx-flex pbx-items-center pbx-gap-2">
        ${topRight.join('\n        ')}
      </div>
    </div>
    ${navLinks.length ? `<div class="pbx-hidden md:pbx-flex pbx-items-center pbx-gap-6 pbx-py-2">
      ${navLinks.join('\n      ')}
    </div>` : ''}
  </div>
</nav>
</section>`
}

// ─── Hero block editor data ──────────────────────────────────────────────────

export interface Ru1HeroData {
  imageUrl: string
  altText: string
  linkUrl: string
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
}

export const ru1HeroDefaults: Ru1HeroData = {
  imageUrl: placeholderSvg,
  altText: 'Hero image',
  linkUrl: '',
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
}

export const ru1HeroFields: FieldConfig[] = [
  { key: 'imageUrl', label: 'Banner Image', type: 'image' },
  { key: 'altText', label: 'Alt Text', type: 'text' },
  { key: 'linkUrl', label: 'Banner Link URL', type: 'url' },
  { key: 'headline', label: 'Headline', type: 'text' },
  { key: 'subheadline', label: 'Subheadline', type: 'text' },
  { key: 'textColor', label: 'Text Color', type: 'color' },
  { key: 'textAlign', label: 'Text Alignment', type: 'select', options: ['left', 'center', 'right'] },
  { key: 'overlayColor', label: 'Overlay Color', type: 'color' },
  { key: 'overlayOpacity', label: 'Overlay Opacity (0–100)', type: 'number' },
  { key: 'ctaText', label: 'CTA Button Text', type: 'text' },
  { key: 'ctaUrl', label: 'CTA Button URL', type: 'url' },
  { key: 'ctaBgColor', label: 'CTA Button BG Color', type: 'color' },
  { key: 'ctaTextColor', label: 'CTA Button Text Color', type: 'color' },
  { key: 'bgColor', label: 'Section Background', type: 'color' },
  { key: 'paddingY', label: 'Vertical Padding', type: 'number' },
  { key: 'paddingX', label: 'Horizontal Padding', type: 'number' },
  { key: 'borderRadius', label: 'Border Radius', type: 'number' },
]

export function renderRu1Hero(data: Ru1HeroData): string {
  const alignItems = data.textAlign === 'left' ? 'flex-start' : data.textAlign === 'right' ? 'flex-end' : 'center'

  const sectionStyle = [
    `background:${data.bgColor}`,
    data.paddingY ? `padding-top:${data.paddingY}px;padding-bottom:${data.paddingY}px` : '',
    data.paddingX ? `padding-left:${data.paddingX}px;padding-right:${data.paddingX}px` : '',
    data.borderRadius ? `border-radius:${data.borderRadius}px` : '',
  ].filter(Boolean).join(';')

  const overlayDiv = data.overlayOpacity > 0
    ? `<div style="position:absolute;inset:0;background:${data.overlayColor};opacity:${(data.overlayOpacity / 100).toFixed(2)};pointer-events:none"></div>`
    : ''

  const ctaBtn = data.ctaText
    ? `<a href="${data.ctaUrl}" style="display:inline-block;background:${data.ctaBgColor};color:${data.ctaTextColor};padding:0.625rem 1.5rem;border-radius:0.375rem;text-decoration:none;font-weight:600;margin-top:1rem">${data.ctaText}</a>`
    : ''

  const hasText = data.headline || data.subheadline || data.ctaText
  const textLayer = hasText
    ? `<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:${alignItems};justify-content:center;padding:2rem;text-align:${data.textAlign};color:${data.textColor}">
      ${data.headline ? `<h2 style="font-size:2.25rem;font-weight:700;margin:0;line-height:1.2">${data.headline}</h2>` : ''}
      ${data.subheadline ? `<p style="font-size:1.125rem;margin:0.5rem 0 0">${data.subheadline}</p>` : ''}
      ${ctaBtn}
    </div>`
    : ''

  const inner = `<div style="position:relative;">
    <img src="${data.imageUrl}" alt="${data.altText}" style="width:100%;aspect-ratio:4/1;object-fit:cover;display:block;" />
    ${overlayDiv}
    ${textLayer}
  </div>`

  return `<section data-component-title="Ru1 Techwire Hero">
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
}

export interface Ru1ProductsData {
  sectionTitle: string
  columns: 1 | 2 | 3 | 4
  products: Product[]
  bgColor: string
  paddingY: number
  paddingX: number
  cardBorderRadius: number
  buttonBgColor: string
  buttonTextColor: string
  oldPriceColor: string
}

const _colClass: Record<string, string> = {
  '1': 'pbx-grid-cols-1',
  '2': 'pbx-grid-cols-2',
  '3': 'pbx-grid-cols-2 sm:pbx-grid-cols-3',
  '4': 'pbx-grid-cols-2 sm:pbx-grid-cols-2 lg:pbx-grid-cols-4',
}

export const ru1ProductsDefaults: Ru1ProductsData = {
  sectionTitle: 'Featured Products',
  columns: 4,
  bgColor: '',
  paddingY: 48,
  paddingX: 16,
  cardBorderRadius: 8,
  buttonBgColor: '#111827',
  buttonTextColor: '#ffffff',
  oldPriceColor: '#9ca3af',
  products: [
    { imageUrl: placeholderSvg, name: 'Product One',   price: '$29.99', oldPrice: '',       buttonLabel: 'Add to Cart', buttonUrl: '/shop' },
    { imageUrl: placeholderSvg, name: 'Product Two',   price: '$39.99', oldPrice: '$49.99', buttonLabel: 'Add to Cart', buttonUrl: '/shop' },
    { imageUrl: placeholderSvg, name: 'Product Three', price: '$49.99', oldPrice: '',       buttonLabel: 'Add to Cart', buttonUrl: '/shop' },
    { imageUrl: placeholderSvg, name: 'Product Four',  price: '$59.99', oldPrice: '$79.99', buttonLabel: 'Add to Cart', buttonUrl: '/shop' },
  ],
}

export const ru1ProductsFields: FieldConfig[] = [
  { key: 'sectionTitle', label: 'Section Title', type: 'text' },
  { key: 'columns', label: 'Columns', type: 'select', options: ['1', '2', '3', '4'] },
  { key: 'bgColor', label: 'Section Background', type: 'color' },
  { key: 'paddingY', label: 'Vertical Padding', type: 'number' },
  { key: 'paddingX', label: 'Horizontal Padding', type: 'number' },
  { key: 'cardBorderRadius', label: 'Card Border Radius', type: 'number' },
  { key: 'buttonBgColor', label: 'Button BG Color', type: 'color' },
  { key: 'buttonTextColor', label: 'Button Text Color', type: 'color' },
  { key: 'oldPriceColor', label: 'Old Price Color', type: 'color' },
  {
    key: 'products', label: 'Products', type: 'list',
    listFields: [
      { key: 'imageUrl', label: 'Image', type: 'image' },
      { key: 'name', label: 'Product Name', type: 'text' },
      { key: 'price', label: 'Price', type: 'text' },
      { key: 'oldPrice', label: 'Old Price', type: 'text' },
      { key: 'buttonLabel', label: 'Button Text', type: 'text' },
      { key: 'buttonUrl', label: 'Button URL', type: 'url' },
    ],
  },
]

export function renderRu1Products(data: Ru1ProductsData): string {
  const colCls = _colClass[String(data.columns)] ?? _colClass['4']

  const sectionStyle = [
    data.bgColor ? `background:${data.bgColor}` : '',
    `padding:${data.paddingY}px ${data.paddingX}px`,
  ].filter(Boolean).join(';')

  const cards = data.products.map(p => `
      <div style="border-radius:${data.cardBorderRadius}px;overflow:hidden" class="pbx-flex pbx-flex-col pbx-border pbx-border-gray-200">
        <img class="pbx-object-cover pbx-w-full pbx-object-top pbx-aspect-square" src="${p.imageUrl}" alt="${p.name}" />
        <div class="pbx-flex pbx-flex-col pbx-gap-1 pbx-p-3 pbx-flex-1">
          <p class="pbx-font-semibold pbx-text-sm">${p.name}</p>
          <div class="pbx-flex pbx-items-center pbx-gap-2">
            <p class="pbx-text-sm">${p.price}</p>
            ${p.oldPrice ? `<s style="color:${data.oldPriceColor}" class="pbx-text-sm">${p.oldPrice}</s>` : ''}
          </div>
          <a href="${p.buttonUrl}" style="background:${data.buttonBgColor};color:${data.buttonTextColor};border-radius:${data.cardBorderRadius}px;margin-top:auto;text-align:center;font-size:0.875rem;font-weight:500;padding:0.5rem 1rem;text-decoration:none;display:block">${p.buttonLabel}</a>
        </div>
      </div>`).join('')

  return `<section data-component-title="Ru1 Techwire Featured Products">
<div style="${sectionStyle}">
  <div class="pbx-mx-auto pbx-max-w-7xl">
    <div class="pbx-break-words pbx-font-medium pbx-text-3xl lg:pbx-text-4xl pbx-mb-8">
      <h1>${data.sectionTitle}</h1>
    </div>
    <div class="pbx-myPrimaryGap pbx-grid ${colCls}">
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
  paddingY: number
  paddingX: number
  borderStyle: string
  borderWidth: number
  borderColor: string
}

export const ru1FooterDefaults: Ru1FooterData = {
  tagline: 'This site is for employees to order branded apparel and accessories.',
  usefulLinks: [
    { label: 'Home', url: '/' },
    { label: 'Shop', url: '/shop' },
    { label: 'About Us', url: '/about' },
    { label: 'Contact Us', url: '/contact' },
  ],
  contactEmail: 'support@yourdomain.com',
  contactPhone: '+1 000-000-0000',
  copyright: '© Your Store. All rights reserved.',
  paddingY: 48,
  paddingX: 16,
  borderStyle: 'none',
  borderWidth: 1,
  borderColor: '#e5e7eb',
}

export const ru1FooterFields: FieldConfig[] = [
  { key: 'tagline', label: 'Tagline', type: 'text' },
  {
    key: 'usefulLinks', label: 'Useful Links', type: 'list',
    listFields: [
      { key: 'label', label: 'Label', type: 'text' },
      { key: 'url', label: 'URL', type: 'url' },
    ],
  },
  { key: 'contactEmail', label: 'Contact Email', type: 'text' },
  { key: 'contactPhone', label: 'Contact Phone', type: 'text' },
  { key: 'copyright', label: 'Copyright Text', type: 'text' },
  { key: 'paddingY', label: 'Vertical Padding', type: 'number' },
  { key: 'paddingX', label: 'Horizontal Padding', type: 'number' },
  { key: 'borderStyle', label: 'Border Style', type: 'select', options: ['none', 'solid', 'dashed', 'dotted'] },
  { key: 'borderWidth', label: 'Border Width', type: 'number' },
  { key: 'borderColor', label: 'Border Color', type: 'color' },
]

export function renderRu1Footer(data: Ru1FooterData): string {
  const footerStyle = [
    `padding:${data.paddingY}px ${data.paddingX}px`,
    data.borderStyle !== 'none' ? `border-top:${data.borderWidth}px ${data.borderStyle} ${data.borderColor}` : '',
  ].filter(Boolean).join(';')

  return `<section data-component-title="Ru1 Techwire Footer">
<footer style="${footerStyle}">
  <div class="pbx-max-w-7xl pbx-mx-auto">
    <div class="pbx-grid pbx-grid-cols-1 md:pbx-grid-cols-3 pbx-gap-8">
      <div>
        <h3 class="pbx-text-sm pbx-font-semibold pbx-uppercase pbx-tracking-wider pbx-mb-4">Useful Links</h3>
        <ul class="pbx-space-y-2">
          ${data.usefulLinks.map(l => `<li><a href="${l.url}" class="pbx-text-sm pbx-text-gray-700 hover:pbx-text-gray-900">${l.label}</a></li>`).join('\n          ')}
        </ul>
      </div>
      <div>
        <h3 class="pbx-text-sm pbx-font-semibold pbx-uppercase pbx-tracking-wider pbx-mb-4">About Us</h3>
        <p class="pbx-text-sm pbx-text-gray-700 pbx-leading-relaxed">${data.tagline}</p>
      </div>
      <div>
        <h3 class="pbx-text-sm pbx-font-semibold pbx-uppercase pbx-tracking-wider pbx-mb-4">Connect with Us</h3>
        <ul class="pbx-space-y-2">
          <li class="pbx-text-sm pbx-text-gray-700">${data.contactEmail}</li>
          <li class="pbx-text-sm pbx-text-gray-700">${data.contactPhone}</li>
        </ul>
      </div>
    </div>
    <div class="pbx-border-t pbx-border-gray-200 pbx-mt-8 pbx-pt-6 pbx-text-center">
      <p class="pbx-text-sm pbx-text-gray-500">${data.copyright}</p>
    </div>
  </div>
</footer>
</section>`
}

// ─── Theme sections (initial HTML derived from render(defaults)) ─────────────

export const ru1TechwireSections: ThemeSection[] = [
  { id: null, title: 'Ru1 Techwire Navbar',            html_code: renderRu1Navbar(ru1NavbarDefaults) },
  { id: null, title: 'Ru1 Techwire Hero',              html_code: renderRu1Hero(ru1HeroDefaults) },
  { id: null, title: 'Ru1 Techwire Featured Products', html_code: renderRu1Products(ru1ProductsDefaults) },
  { id: null, title: 'Ru1 Techwire Footer',            html_code: renderRu1Footer(ru1FooterDefaults) },
]
