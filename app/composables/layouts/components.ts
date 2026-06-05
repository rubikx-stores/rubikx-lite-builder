import type { FieldConfig } from '../editor/useBlockRegistry'
import { productImageSrc } from '../useProductImageSrc'


// ─── Navbar-1 SVG cover ───────────────────────────────────────────────────────
// Matches the library component card style exactly:
//   transparent bg, #394152 for the navbar bar, #718096 for inner elements
export const navbar1Svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 277.5 32">
  <rect fill="#394152" x="0" y="0" width="277.5" height="32"/>
  <rect fill="#718096" x="8"   y="12" width="36" height="8"/>
  <rect fill="#718096" x="95"  y="13" width="20" height="6"/>
  <rect fill="#718096" x="122" y="13" width="20" height="6"/>
  <rect fill="#718096" x="149" y="13" width="20" height="6"/>
  <rect fill="#718096" x="208" y="12" width="26" height="8"/>
  <rect fill="#718096" x="240" y="12" width="26" height="8"/>
</svg>`

// ─── Interface ────────────────────────────────────────────────────────────────
export interface MegaMenuProduct { id: number; label: string; href: string; image?: string; price?: number }
export interface MegaMenuGroup   { label: string; href: string; products: MegaMenuProduct[] }
export interface NavLink         { label: string; href: string; megaMenu?: MegaMenuGroup[] }
export interface CtaButton {
  label: string
  href: string
  style: string       // 'outline' | 'filled'
  textColor: string
  bgColor: string
  borderColor: string
}

export interface Navbar1Data {
  // Logo
  logoUrl: string
  logoText: string
  logoWidth: number
  logoAlign: string
  brandFontSize: number
  brandFontWeight: string
  // Nav links
  navLinks: NavLink[]
  navLinksAlign: string
  linkFontSize: number
  linkFontWeight: string
  linkColor: string
  // Search
  showSearch: boolean
  searchPlaceholder: string
  searchAlign: string
  // CTA buttons — fully dynamic list (add/remove/reorder)
  ctaButtons: CtaButton[]
  buttonsAlign: string
  buttonBorderRadius: number
  // Appearance
  bgColor: string
  textColor: string
  paddingY: number
  paddingX: number
  sticky: boolean
  showBottomBorder: boolean
  bottomBorderColor: string
}

// ─── Defaults ─────────────────────────────────────────────────────────────────
export const navbar1Defaults: Navbar1Data = {
  logoUrl: '',
  logoText: 'Brand',
  logoWidth: 120,
  logoAlign: 'left',
  brandFontSize: 20,
  brandFontWeight: '700',

  navLinks: [
    { label: 'Home',       href: '/'           },
    { label: 'Contact',    href: '/contact'    },
    { label: 'Categories', href: '/categories', megaMenu: [
      { label: 'Women', href: '/women', products: [] },
      { label: 'Men',   href: '/men',   products: [] },
    ]},
  ],
  navLinksAlign: 'center',
  linkFontSize: 14,
  linkFontWeight: '500',
  linkColor: '#1f2937',

  showSearch: false,
  searchPlaceholder: 'Search products…',
  searchAlign: 'center',

  ctaButtons: [
    { label: 'Sign In',        href: '/signin',   style: 'outline', textColor: '#1f2937', bgColor: '#ffffff',     borderColor: '#1f2937' },
  ],
  buttonsAlign: 'right',
  buttonBorderRadius: 6,

  bgColor: '#ffffff',
  textColor: '#1f2937',
  paddingY: 12,
  paddingX: 16,
  sticky: false,
  showBottomBorder: true,
  bottomBorderColor: '#e5e7eb',
}

// ─── Fields ───────────────────────────────────────────────────────────────────
export const navbar1Fields: FieldConfig[] = [
  // ── Logo ───────────────────────────────────────────────────────────────────
  { key: 'logoUrl',         label: 'Logo Image',           type: 'image',
    placeholder: 'https://example.com/logo.png'                             },
  { key: 'logoText',        label: 'Brand Name',           type: 'text',
    placeholder: 'e.g. Acme Co'                                             },
  { key: 'logoWidth',       label: 'Logo Width (px)',      type: 'number',
    placeholder: '120'                                                      },
  { key: 'logoAlign',       label: 'Logo Position',        type: 'select',
    options: ['left', 'center', 'right']                                    },
  { key: 'brandFontSize',   label: 'Brand Font Size (px)', type: 'number',
    placeholder: '20 — size of the brand text when no logo image is set'    },
  { key: 'brandFontWeight', label: 'Brand Font Weight',    type: 'select',
    options: ['400', '500', '600', '700', '800']                            },

  // ── Nav Links ──────────────────────────────────────────────────────────────
  {
    key: 'navLinks', label: 'Nav Links', type: 'list',
    listFields: [
      { key: 'label', label: 'Label', type: 'text', placeholder: 'e.g. Shop'          },
      { key: 'href',  label: 'URL',   type: 'url',  placeholder: 'e.g. /shop or https://…' },
    ],
  },
  { key: 'navLinksAlign',   label: 'Links Position',       type: 'select',
    options: ['left', 'center', 'right']                                    },
  { key: 'linkColor',       label: 'Link Colour',          type: 'color'   },
  { key: 'linkFontSize',    label: 'Link Font Size (px)',   type: 'number',
    placeholder: '14'                                                       },
  { key: 'linkFontWeight',  label: 'Link Font Weight',      type: 'select',
    options: ['400', '500', '600', '700']                                   },

  // ── Search ─────────────────────────────────────────────────────────────────
  { key: 'showSearch',      label: 'Show Search Bar',       type: 'toggle'  },
  { key: 'searchPlaceholder', label: 'Search Placeholder',  type: 'text',
    placeholder: 'e.g. Search products…'                                    },
  { key: 'searchAlign',     label: 'Search Position',       type: 'select',
    options: ['left', 'center', 'right']                                    },

  // ── CTA Buttons — fully dynamic ────────────────────────────────────────────
  // Each button has its own label, URL, style (outline / filled), and colours.
  // Use + Add to add more buttons (e.g. Sign Up, Get Started, Dashboard…).
  {
    key: 'ctaButtons', label: 'CTA Buttons', type: 'list',
    listFields: [
      { key: 'label',       label: 'Label',        type: 'text',   placeholder: 'e.g. Sign In'        },
      { key: 'href',        label: 'URL',           type: 'url',    placeholder: 'e.g. /signin'        },
      { key: 'style',       label: 'Style',         type: 'select', options: ['outline', 'filled']     },
      { key: 'textColor',   label: 'Text Colour',   type: 'color'                                      },
      { key: 'bgColor',     label: 'BG Colour',     type: 'color'                                      },
      { key: 'borderColor', label: 'Border Colour', type: 'color'                                      },
    ],
  },
  { key: 'buttonsAlign',    label: 'Buttons Position',      type: 'select',
    options: ['left', 'center', 'right']                                    },
  { key: 'buttonBorderRadius', label: 'Button Radius (px)', type: 'number',
    placeholder: '6 — corner roundness for all CTA buttons'                },

  // ── Appearance ─────────────────────────────────────────────────────────────
  { key: 'bgColor',         label: 'Background Colour',     type: 'color'   },
  { key: 'textColor',       label: 'Global Text Colour',    type: 'color'   },
  { key: 'paddingY',        label: 'Vertical Padding (px)', type: 'number',
    placeholder: '12'                                                       },
  { key: 'paddingX',        label: 'Horizontal Padding (px)', type: 'number',
    placeholder: '16'                                                       },
  { key: 'sticky',          label: 'Sticky Navbar',         type: 'toggle'  },
  { key: 'showBottomBorder',label: 'Show Bottom Border',    type: 'toggle'  },
  { key: 'bottomBorderColor', label: 'Bottom Border Colour', type: 'color'  },
]

// ─── Render ───────────────────────────────────────────────────────────────────
export function renderNavbar1(data: Navbar1Data): string {
  const navStyle = [
    `background:${data.bgColor}`,
    `color:${data.textColor}`,
    `padding:${data.paddingY}px ${data.paddingX}px`,
    data.sticky ? 'position:sticky;top:0;z-index:50' : '',
    data.showBottomBorder ? `border-bottom:1px solid ${data.bottomBorderColor}` : '',
  ].filter(Boolean).join(';')

  // ── Logo ──────────────────────────────────────────────────────────────────
  const logoInner = data.logoUrl
    ? `<img src="${data.logoUrl}" alt="${data.logoText}" style="width:${data.logoWidth}px;height:auto;display:block;" />`
    : `<span data-field-key="logoText" style="font-size:${data.brandFontSize}px;font-weight:${data.brandFontWeight};color:inherit;">${data.logoText}</span>`
  const logoEl = `<a href="/" style="text-decoration:none;color:inherit;display:flex;align-items:center;">${logoInner}</a>`

  // ── Search ────────────────────────────────────────────────────────────────
  const searchEl = data.showSearch
    ? `<div style="display:flex;align-items:center;border:1px solid #d1d5db;border-radius:9999px;padding:0.375rem 0.75rem;gap:0.5rem;min-width:160px;max-width:220px;">
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="flex-shrink:0;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/></svg>
        <input type="text" placeholder="${data.searchPlaceholder}" style="border:none;outline:none;background:transparent;font-size:0.875rem;width:100%;color:${data.textColor};" />
      </div>`
    : ''

  // ── Nav links ─────────────────────────────────────────────────────────────
  const linkStyle = `color:${data.linkColor};text-decoration:none;font-size:${data.linkFontSize}px;font-weight:${data.linkFontWeight};white-space:nowrap;`

  const renderStaticDrop = (megaMenu: typeof data.navLinks[0]['megaMenu']) => {
    if (!megaMenu || !megaMenu.length) return ''
    return megaMenu.map((g, gi) => {
      const productsHtml = g.products.map(p => {
        const imgSrc = productImageSrc(p.image)
        const img = imgSrc
          ? `<img src="${imgSrc}" style="width:44px;height:44px;object-fit:cover;border-radius:6px;flex-shrink:0;"/>`
          : `<div style="width:44px;height:44px;background:#f3f4f6;border-radius:6px;flex-shrink:0;"></div>`
        const price = p.price != null ? `<span class="pbx-ptile-price" style="font-size:11px;color:#6b7280;">$${Number(p.price).toFixed(2)}</span>` : ''
        return `<a href="/shop/${p.id}" class="pbx-ptile" data-img="${p.image ?? ''}" style="display:flex;align-items:center;gap:10px;padding:7px 14px;text-decoration:none;cursor:pointer;" onmouseover="this.style.background='#f9fafb'" onmouseout="this.style.background=''">${img}<div style="min-width:0;"><div class="pbx-ptile-name" style="font-size:13px;font-weight:500;color:#1f2937;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:160px;">${p.label}</div>${price}</div></a>`
      }).join('')
      const divider = gi > 0 ? '<div style="height:1px;background:#f3f4f6;margin:4px 0;"></div>' : ''
      return `${divider}<div><a href="${g.href}" style="display:block;padding:8px 14px 4px;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.06em;text-decoration:none;">${g.label}</a>${productsHtml || '<div style="padding:4px 14px 8px;font-size:12px;color:#9ca3af;font-style:italic;">No products selected</div>'}</div>`
    }).join('')
  }

  const linksEl = data.navLinks.length
    ? `<nav style="display:flex;align-items:center;gap:1.5rem;">${
        data.navLinks.map(l => {
          if (l.megaMenu && l.megaMenu.length > 0) {
            const groups = l.megaMenu.map(g => ({ label: g.label, href: g.href, ids: g.products.map(p => p.id) }))
            const json = JSON.stringify(groups).replace(/"/g, '&quot;')
            const staticContent = renderStaticDrop(l.megaMenu)
            return `<div class="pbx-mega-item" data-mega-json="${json}" style="position:relative;display:inline-block;">` +
              `<a href="${l.href}" style="${linkStyle}cursor:pointer;">${l.label} ▾</a>` +
              `<div class="pbx-mega-drop" style="display:none;position:absolute;top:100%;left:0;min-width:260px;background:#fff;border:1px solid #e5e7eb;border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,.12);z-index:100;overflow:hidden;">${staticContent}</div>` +
              `</div>`
          }
          return `<a href="${l.href}" style="${linkStyle}">${l.label}</a>`
        }).join('')
      }</nav>`
    : ''

  // ── CTA buttons (fully dynamic list) ─────────────────────────────────────
  const buttonsEl = data.ctaButtons.length
    ? `<div style="display:flex;align-items:center;gap:0.5rem;">${
        data.ctaButtons.map(btn => {
          const base = `display:inline-block;padding:0.4375rem 1rem;border-radius:${data.buttonBorderRadius}px;text-decoration:none;font-size:0.875rem;font-weight:500;white-space:nowrap;`
          return btn.style === 'filled'
            ? `<a href="${btn.href}" style="${base}background:${btn.bgColor};color:${btn.textColor};border:1.5px solid ${btn.borderColor};">${btn.label}</a>`
            : `<a href="${btn.href}" style="${base}background:transparent;color:${btn.textColor};border:1.5px solid ${btn.borderColor};">${btn.label}</a>`
        }).join('')
      }</div>`
    : ''

  // ── Column assignment ─────────────────────────────────────────────────────
  const cols: Record<string, string[]> = { left: [], center: [], right: [] }
  const put = (zone: string, el: string) => { if (el && zone in cols) cols[zone].push(el) }
  put(data.logoAlign,     logoEl)
  put(data.navLinksAlign, linksEl)
  put(data.searchAlign,   searchEl)
  put(data.buttonsAlign,  buttonsEl)

  const zone = (items: string[], justify: string) =>
    `<div style="display:flex;align-items:center;gap:0.75rem;justify-content:${justify};">${items.join('')}</div>`

  const hasMegaMenu = data.navLinks.some(l => l.megaMenu && l.megaMenu.length > 0)

  // Refresh dropdowns with live Odoo data + wire product-tile click → detail panel
  const megaScript = hasMegaMenu
    ? `<script>(function(){function wireTiles(sec){sec.querySelectorAll('.pbx-ptile').forEach(function(a){a.addEventListener('click',function(e){e.preventDefault();var panel=sec.querySelector('.pbx-pd');if(!panel)return;var imgEl=a.querySelector('img');var imgSrc=imgEl?imgEl.src:'';var name=(a.querySelector('.pbx-ptile-name')||{}).textContent||'';var price=(a.querySelector('.pbx-ptile-price')||{}).textContent||'';var imgCol=imgSrc?'<img src="'+imgSrc+'" style="width:100%;height:100%;object-fit:cover;display:block;" />':'<div style="width:100%;height:100%;background:#f3f4f6;"></div>';panel.innerHTML='<div style="display:grid;grid-template-columns:40% 60%;height:380px;position:relative;">'+  '<div style="overflow:hidden;">'+imgCol+'</div>'+  '<div style="padding:40px 48px;display:flex;flex-direction:column;justify-content:center;background:#fff;">'+    '<div style="font-size:10px;font-weight:700;color:#9ca3af;letter-spacing:.12em;text-transform:uppercase;margin-bottom:12px;">Featured Product</div>'+    '<div style="font-size:26px;font-weight:700;color:#111827;line-height:1.25;margin-bottom:12px;">'+name+'</div>'+    '<div style="font-size:22px;font-weight:600;color:#374151;margin-bottom:28px;">'+price+'</div>'+    '<div><a href="'+a.href+'" style="display:inline-block;padding:12px 28px;background:#111827;color:#fff;text-decoration:none;border-radius:6px;font-size:14px;font-weight:500;letter-spacing:.02em;">View Product →</a></div>'+  '</div>'+  '<button onclick="this.closest(\\'.pbx-pd\\').style.display=\\'none\\'" style="position:absolute;top:12px;right:16px;background:rgba(255,255,255,.9);border:1px solid #e5e7eb;border-radius:50%;width:28px;height:28px;cursor:pointer;font-size:16px;color:#6b7280;display:flex;align-items:center;justify-content:center;line-height:1;">×</button>'+  '</div>';panel.style.display='block';panel.scrollIntoView({behavior:'smooth',block:'nearest'});});})}function init(){var ts=document.querySelectorAll('.pbx-mega-item[data-mega-json]');if(!ts.length)return;var allIds=[];ts.forEach(function(t){try{JSON.parse(t.getAttribute('data-mega-json').replace(/&quot;/g,'"')).forEach(function(g){(g.ids||[]).forEach(function(id){if(allIds.indexOf(id)<0)allIds.push(id);});});}catch(e){}});ts.forEach(function(t){var sec=t.closest('section');if(sec)wireTiles(sec);});if(!allIds.length)return;fetch('/api/products?ids='+allIds.join(',')).then(function(r){return r.json();}).then(function(prods){var map={};prods.forEach(function(p){map[p.id]=p;});ts.forEach(function(t){var groups;try{groups=JSON.parse(t.getAttribute('data-mega-json').replace(/&quot;/g,'"'));}catch(e){return;}var drop=t.querySelector('.pbx-mega-drop');if(!drop)return;var html=groups.map(function(g){var items=(g.ids||[]).map(function(id){var p=map[id];if(!p)return'';var img=p.image?'<img src="data:image/png;base64,'+p.image+'" style="width:44px;height:44px;object-fit:cover;border-radius:6px;flex-shrink:0;"/>':'<div style="width:44px;height:44px;background:#f3f4f6;border-radius:6px;flex-shrink:0;"></div>';var price=p.price!=null?'<span class="pbx-ptile-price" style="font-size:11px;color:#6b7280;">$'+Number(p.price).toFixed(2)+'</span>':'';return'<a href="/shop/'+p.id+'" class="pbx-ptile" style="display:flex;align-items:center;gap:10px;padding:7px 14px;text-decoration:none;cursor:pointer;" onmouseover="this.style.background=\\'#f9fafb\\'" onmouseout="this.style.background=\\'\\''">'+img+'<div style="min-width:0;"><div class="pbx-ptile-name" style="font-size:13px;font-weight:500;color:#1f2937;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:160px;">'+p.name+'</div>'+price+'</div></a>';}).join('');if(!items.trim())return'';return'<div><a href="'+(g.href||'#')+'" style="display:block;padding:8px 14px 4px;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.06em;text-decoration:none;">'+g.label+'</a>'+items+'</div>';}).filter(Boolean).join('<div style="height:1px;background:#f3f4f6;margin:4px 0;"></div>');drop.innerHTML=html;var sec=t.closest('section');if(sec)wireTiles(sec);});}).catch(function(){});}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();})();<\/script>`
    : ''

  return `<section data-component-title="Mega-menu-Header">
<style>
.pbx-mega-item:hover .pbx-mega-drop{display:block !important;}
.pbx-pd{display:none;width:100%;border-top:1px solid #e5e7eb;overflow:hidden;}
</style>
<nav style="${navStyle}">
  <div class="pbx-max-w-7xl pbx-mx-auto" style="display:grid;grid-template-columns:1fr 1fr 1fr;align-items:center;gap:1rem;">
    ${zone(cols.left,   'flex-start')}
    ${zone(cols.center, 'center')}
    ${zone(cols.right,  'flex-end')}
  </div>
</nav>
${hasMegaMenu ? '<div class="pbx-pd"></div>' : ''}
${megaScript}</section>`
}

// ═══════════════════════════════════════════════════════════════════════════════
// Ru1-Form  (Contact category)
// ═══════════════════════════════════════════════════════════════════════════════

export const ru1FormSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 277.5 105">
  <rect fill="#394152" x="0" y="10" width="88" height="7"/>
  <rect fill="#394152" x="0" y="24" width="118" height="3"/>
  <rect fill="#394152" x="0" y="30" width="112" height="3"/>
  <rect fill="#394152" x="0" y="36" width="105" height="3"/>
  <rect fill="#394152" x="0" y="42" width="88" height="3"/>
  <rect fill="#394152" x="0" y="55" width="5" height="5"/>
  <rect fill="#394152" x="9" y="56" width="82" height="3"/>
  <rect fill="#394152" x="0" y="66" width="5" height="5"/>
  <rect fill="#394152" x="9" y="67" width="62" height="3"/>
  <rect fill="#394152" x="0" y="77" width="5" height="5"/>
  <rect fill="#394152" x="9" y="78" width="74" height="3"/>
  <rect fill="#394152" x="148" y="10" width="55" height="11"/>
  <rect fill="#394152" x="209" y="10" width="55" height="11"/>
  <rect fill="#394152" x="148" y="27" width="116" height="10"/>
  <rect fill="#394152" x="148" y="43" width="116" height="10"/>
  <rect fill="#394152" x="148" y="59" width="116" height="22"/>
  <rect fill="#394152" x="204" y="88" width="60" height="10"/>
</svg>`

export interface Ru1FormData {
  title: string
  description: string
  addressLine1: string
  addressLine2: string
  phone: string
  email: string
  submitLabel: string
  submitBgColor: string
  submitAlign: string
  socials: Array<{ href: string }>
  columnOrder: string[]
}

export const ru1FormDefaults: Ru1FormData = {
  title: 'Get in touch',
  description: "We'd love to hear from you. Whether you have questions about our services, need expert guidance, or want to discuss a new project, our team is here to help. Fill out the form, and we'll get back to you as soon as possible.",
  addressLine1: '',
  addressLine2: '',
  phone: '',
  email: '',
  submitLabel: 'Send message',
  submitBgColor: '#4f46e5',
  submitAlign: 'right',
  socials: [],
  columnOrder: ['info', 'form'],
}

export const ru1FormFields: FieldConfig[] = [
  { key: 'title',       label: 'Section Title',      type: 'text',   placeholder: 'e.g. Get in touch'         },
  { key: 'description', label: 'Description',        type: 'text',   placeholder: 'Short intro paragraph…'   },
  { key: 'addressLine1',label: 'Address Line 1',     type: 'text',   placeholder: 'Street address'            },
  { key: 'addressLine2',label: 'Address Line 2',     type: 'text',   placeholder: 'City, State ZIP'           },
  { key: 'phone',       label: 'Phone Number',       type: 'text',   placeholder: 'Your phone number'         },
  { key: 'email',       label: 'Email Address',      type: 'text',   placeholder: 'Your email address'        },
  { key: 'submitLabel', label: 'Submit Button Text', type: 'text',   placeholder: 'Send message'              },
  { key: 'submitBgColor', label: 'Submit Button Colour', type: 'color'                                        },
  { key: 'submitAlign',   label: 'Submit Button Align',  type: 'select', options: ['left', 'center', 'right'] },
  {
    key: 'socials', label: 'Social Links', type: 'list',
    listFields: [
      { key: 'href', label: 'URL', type: 'url', placeholder: 'Paste your social media URL' },
    ],
  },
  { key: 'columnOrder', label: 'Column Order', type: 'column-order' },
]

const iconBuilding = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="height:28px;width:24px;flex-shrink:0;color:#9ca3af;" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z"/></svg>`
const iconPhone   = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="height:28px;width:24px;flex-shrink:0;color:#9ca3af;" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 6.75Z"/></svg>`
const iconEnvelope = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="height:28px;width:24px;flex-shrink:0;color:#9ca3af;" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"/></svg>`

// Social icon SVGs (filled, 18×18)
const svgFacebook  = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true"><path d="M9.198 21.5h4v-8.01h3.604l.396-3.98h-4V7.5a1 1 0 0 1 1-1h3v-4h-3a5 5 0 0 0-5 5v2.01h-2l-.396 3.98h2.396v8.01Z"/></svg>`
const svgX         = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`
const svgYoutube   = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`
const svgInstagram = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.98-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.98-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>`
const svgLinkedin  = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`
const svgTiktok    = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>`
const svgPinterest = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>`
const svgWhatsapp  = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>`
const svgLinkFallback = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`

function detectSocial(href: string): { icon: string; color: string; label: string } {
  const u = href.toLowerCase()
  if (u.includes('facebook.com') || u.includes('fb.com'))   return { icon: svgFacebook,     color: '#1877F2', label: 'Facebook'  }
  if (u.includes('x.com') || u.includes('twitter.com'))     return { icon: svgX,            color: '#000000', label: 'X'         }
  if (u.includes('youtube.com') || u.includes('youtu.be'))  return { icon: svgYoutube,      color: '#FF0000', label: 'YouTube'   }
  if (u.includes('instagram.com'))                          return { icon: svgInstagram,    color: '#C13584', label: 'Instagram' }
  if (u.includes('linkedin.com'))                           return { icon: svgLinkedin,     color: '#0A66C2', label: 'LinkedIn'  }
  if (u.includes('tiktok.com'))                             return { icon: svgTiktok,       color: '#010101', label: 'TikTok'   }
  if (u.includes('pinterest.com'))                          return { icon: svgPinterest,    color: '#E60023', label: 'Pinterest' }
  if (u.includes('whatsapp.com') || u.includes('wa.me'))   return { icon: svgWhatsapp,     color: '#25D366', label: 'WhatsApp' }
  return { icon: svgLinkFallback, color: '#374151', label: 'Link' }
}

function socialIcon(href: string): string {
  if (!href.trim()) return ''
  const { icon, color, label } = detectSocial(href)
  return `<a href="${href}" style="display:flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:50%;border:1.5px solid ${color};color:${color};text-decoration:none;flex-shrink:0;background:transparent;" aria-label="${label}" target="_blank" rel="noopener" onmouseover="this.style.background='${color}';this.style.color='#fff'" onmouseout="this.style.background='transparent';this.style.color='${color}'">${icon}</a>`
}

const inputStyle = 'display:block;width:100%;box-sizing:border-box;border-radius:6px;background:#fff;padding:0.5rem 0.875rem;font-size:1rem;color:#111827;outline:1px solid #d1d5db;outline-offset:-1px;'

export function renderRu1Form(data: Ru1FormData): string {
  const phoneHref = `tel:${data.phone.replace(/\s/g, '')}`
  const emailHref = `mailto:${data.email}`
  const btnStyle  = `display:inline-block;border-radius:6px;padding:0.625rem 0.875rem;font-size:0.875rem;font-weight:600;color:#fff;background:${data.submitBgColor};border:none;cursor:pointer;`
  const alignMap: Record<string, string> = { left: 'flex-start', center: 'center', right: 'flex-end' }
  const btnJustify = alignMap[data.submitAlign ?? 'right'] ?? 'flex-end'

  // Build social icons row — auto-detect platform & brand colour from URL
  const socialIcons = (data.socials ?? []).map(s => socialIcon(s.href)).filter(Boolean)
  const socialRow = socialIcons.length
    ? `<div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:2rem;">${socialIcons.join('')}</div>`
    : ''

  const infoCol = `<div style="position:relative;padding:6rem 2rem 5rem;overflow:hidden;background:#f3f4f6;">
      <h2 style="font-size:2.25rem;font-weight:600;color:#111827;margin:0 0 1.5rem;">${data.title}</h2>
      <p style="font-size:1.125rem;line-height:2;color:#4b5563;margin:0 0 2.5rem;">${data.description}</p>
      <dl style="display:flex;flex-direction:column;gap:1rem;font-size:1rem;line-height:1.75;color:#4b5563;">
        <div style="display:flex;gap:1rem;align-items:flex-start;">
          <dt style="flex:none;">${iconBuilding}</dt>
          <dd style="margin:0;">${data.addressLine1}<br/>${data.addressLine2}</dd>
        </div>
        <div style="display:flex;gap:1rem;align-items:flex-start;">
          <dt style="flex:none;">${iconPhone}</dt>
          <dd style="margin:0;"><a href="${phoneHref}" style="color:inherit;text-decoration:none;">${data.phone}</a></dd>
        </div>
        <div style="display:flex;gap:1rem;align-items:flex-start;">
          <dt style="flex:none;">${iconEnvelope}</dt>
          <dd style="margin:0;"><a href="${emailHref}" style="color:inherit;text-decoration:none;">${data.email}</a></dd>
        </div>
      </dl>
      ${socialRow}
    </div>`

  const formCol = `<div style="padding:5rem 2rem 6rem;">
      <div style="max-width:28rem;margin-left:auto;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem 2rem;">
          <div>
            <label for="ru1-first-name" style="display:block;font-size:0.875rem;font-weight:600;color:#111827;margin-bottom:0.625rem;">First name</label>
            <input type="text" id="ru1-first-name" name="first-name" autocomplete="given-name" style="${inputStyle}" />
          </div>
          <div>
            <label for="ru1-last-name" style="display:block;font-size:0.875rem;font-weight:600;color:#111827;margin-bottom:0.625rem;">Last name</label>
            <input type="text" id="ru1-last-name" name="last-name" autocomplete="family-name" style="${inputStyle}" />
          </div>
          <div style="grid-column:1/-1;">
            <label for="ru1-email" style="display:block;font-size:0.875rem;font-weight:600;color:#111827;margin-bottom:0.625rem;">Email</label>
            <input type="email" id="ru1-email" name="email" autocomplete="email" style="${inputStyle}" />
          </div>
          <div style="grid-column:1/-1;">
            <label for="ru1-phone" style="display:block;font-size:0.875rem;font-weight:600;color:#111827;margin-bottom:0.625rem;">Phone number</label>
            <input type="tel" id="ru1-phone" name="phone-number" autocomplete="tel" style="${inputStyle}" />
          </div>
          <div style="grid-column:1/-1;">
            <label for="ru1-message" style="display:block;font-size:0.875rem;font-weight:600;color:#111827;margin-bottom:0.625rem;">Message</label>
            <textarea id="ru1-message" name="message" rows="4" style="${inputStyle}resize:vertical;"></textarea>
          </div>
        </div>
        <div style="margin-top:2rem;display:flex;justify-content:${btnJustify};">
          <button type="submit" style="${btnStyle}">${data.submitLabel}</button>
        </div>
      </div>
    </div>`

  const colMap: Record<string, string> = { info: infoCol, form: formCol }
  const order = data.columnOrder ?? ['info', 'form']
  const orderedCols = order.map(k => colMap[k] ?? '').join('\n    ')

  return `<section data-component-title="Ru1-Form" style="position:relative;background:#fff;">
  <div style="margin:0 auto;max-width:80rem;display:grid;grid-template-columns:1fr 1fr;">
    ${orderedCols}
  </div>
</section>`
}
