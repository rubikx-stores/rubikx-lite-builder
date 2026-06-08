import type { FieldConfig } from '../editor/useBlockRegistry'
import { productImageSrc } from '../useProductImageSrc'
import { socialIconHtml } from '../useSocialIcons'


export const navbar1Svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 277.5 32">
  <rect fill="#394152" x="0" y="0" width="277.5" height="32"/>
  <rect fill="#718096" x="8"   y="12" width="36" height="8"/>
  <rect fill="#718096" x="95"  y="13" width="20" height="6"/>
  <rect fill="#718096" x="122" y="13" width="20" height="6"/>
  <rect fill="#718096" x="149" y="13" width="20" height="6"/>
  <rect fill="#718096" x="208" y="12" width="26" height="8"/>
  <rect fill="#718096" x="240" y="12" width="26" height="8"/>
</svg>`

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
  logoUrl: string
  logoText: string
  logoWidth: number
  logoAlign: string
  brandFontSize: number
  brandFontWeight: string
  navLinks: NavLink[]
  navLinksAlign: string
  linkFontSize: number
  linkFontWeight: string
  linkColor: string
  showSearch: boolean
  searchPlaceholder: string
  searchAlign: string
  ctaButtons: CtaButton[]
  buttonsAlign: string
  buttonBorderRadius: number
  bgColor: string
  textColor: string
  paddingY: number
  paddingX: number
  sticky: boolean
  showBottomBorder: boolean
  bottomBorderColor: string
}

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

export const navbar1Fields: FieldConfig[] = [
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

  { key: 'showSearch',      label: 'Show Search Bar',       type: 'toggle'  },
  { key: 'searchPlaceholder', label: 'Search Placeholder',  type: 'text',
    placeholder: 'e.g. Search products…'                                    },
  { key: 'searchAlign',     label: 'Search Position',       type: 'select',
    options: ['left', 'center', 'right']                                    },

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

export function renderNavbar1(data: Navbar1Data): string {
  const navStyle = [
    `background:${data.bgColor}`,
    `color:${data.textColor}`,
    `padding:${data.paddingY}px ${data.paddingX}px`,
    data.sticky ? 'position:sticky;top:0;z-index:50' : '',
    data.showBottomBorder ? `border-bottom:1px solid ${data.bottomBorderColor}` : '',
  ].filter(Boolean).join(';')

  const logoInner = data.logoUrl
    ? `<img src="${data.logoUrl}" alt="${data.logoText}" style="width:${data.logoWidth}px;height:auto;display:block;" />`
    : `<span data-field-key="logoText" style="font-size:${data.brandFontSize}px;font-weight:${data.brandFontWeight};color:inherit;">${data.logoText}</span>`
  const logoEl = `<a href="/" style="text-decoration:none;color:inherit;display:flex;align-items:center;">${logoInner}</a>`

  const searchEl = data.showSearch
    ? `<div style="display:flex;align-items:center;border:1px solid #d1d5db;border-radius:9999px;padding:0.375rem 0.75rem;gap:0.5rem;min-width:160px;max-width:220px;">
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="flex-shrink:0;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/></svg>
        <input type="text" placeholder="${data.searchPlaceholder}" style="border:none;outline:none;background:transparent;font-size:0.875rem;width:100%;color:${data.textColor};" />
      </div>`
    : ''

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
  addressLine1: '123 Main Street, Suite 100',
  addressLine2: 'New York, NY 10001',
  phone: '+1 (555) 000-0000',
  email: 'hello@example.com',
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


const inputStyle = 'display:block;width:100%;box-sizing:border-box;border-radius:6px;background:#fff;padding:0.5rem 0.875rem;font-size:1rem;color:#111827;outline:1px solid #d1d5db;outline-offset:-1px;'

export function renderRu1Form(data: Ru1FormData): string {
  const phoneHref = `tel:${data.phone.replace(/\s/g, '')}`
  const emailHref = `mailto:${data.email}`
  const btnStyle  = `display:inline-block;border-radius:6px;padding:0.625rem 0.875rem;font-size:0.875rem;font-weight:600;color:#fff;background:${data.submitBgColor};border:none;cursor:pointer;`
  const alignMap: Record<string, string> = { left: 'flex-start', center: 'center', right: 'flex-end' }
  const btnJustify = alignMap[data.submitAlign ?? 'right'] ?? 'flex-end'

  // Build social icons row — auto-detect platform & brand colour from URL
  const socialIcons = (data.socials ?? []).map(s => socialIconHtml(s.href)).filter(Boolean)
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

// ─── Footer-1 ─────────────────────────────────────────────────────────────────

export const footer1Svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 177.28 70">
  <rect width="177.28" height="70" fill="#1a1a1a"/>
  <rect x="8" y="12" width="40" height="4" rx="1" fill="#444"/>
  <rect x="8" y="20" width="30" height="3" rx="1" fill="#333"/>
  <rect x="8" y="26" width="35" height="3" rx="1" fill="#333"/>
  <rect x="8" y="32" width="28" height="3" rx="1" fill="#333"/>
  <rect x="68" y="12" width="40" height="4" rx="1" fill="#444"/>
  <rect x="68" y="20" width="50" height="3" rx="1" fill="#333"/>
  <rect x="68" y="26" width="45" height="3" rx="1" fill="#333"/>
  <rect x="128" y="12" width="40" height="4" rx="1" fill="#444"/>
  <rect x="128" y="20" width="35" height="3" rx="1" fill="#333"/>
  <rect x="128" y="26" width="30" height="3" rx="1" fill="#333"/>
  <rect x="0" y="55" width="177.28" height="1" fill="#333"/>
  <rect x="50" y="62" width="77" height="3" rx="1" fill="#444"/>
</svg>`

export interface Footer1Data {
  usefulLinks: { label: string; url: string }[]
  aboutText: string
  contactEmail: string
  contactPhone: string
  copyright: string
  bgColor: string
  textColor: string
  paddingY: number
  paddingX: number
}

export const footer1Defaults: Footer1Data = {
  usefulLinks: [
    { label: 'Home',       url: '/'        },
    { label: 'Shop',       url: '/shop'    },
    { label: 'About Us',   url: '/about'   },
    { label: 'Contact Us', url: '/contact' },
  ],
  aboutText: 'This site is for employees to order branded apparel and accessories.',
  contactEmail: 'support@yourdomain.com',
  contactPhone: '+1 000-000-0000',
  copyright: '© Your Store. All rights reserved.',
  bgColor: '#1a1a1a',
  textColor: '#ffffff',
  paddingY: 48,
  paddingX: 16,
}

export const footer1Fields: FieldConfig[] = [
  {
    key: 'usefulLinks', label: 'Useful Links', type: 'list',
    listFields: [
      { key: 'label', label: 'Label', type: 'text' },
      { key: 'url',   label: 'URL',   type: 'url'  },
    ],
  },
  { key: 'aboutText',    label: 'About Text',        type: 'text'   },
  { key: 'contactEmail', label: 'Contact Email',      type: 'text'   },
  { key: 'contactPhone', label: 'Contact Phone',      type: 'text'   },
  { key: 'copyright',    label: 'Copyright',          type: 'text'   },
  { key: 'bgColor',      label: 'Background Color',   type: 'color'  },
  { key: 'textColor',    label: 'Text Color',          type: 'color'  },
  { key: 'paddingY',     label: 'Vertical Padding',   type: 'number' },
  { key: 'paddingX',     label: 'Horizontal Padding', type: 'number' },
]

export function renderFooter1(data: Footer1Data): string {
  return `<section data-component-title="Footer-1">
<footer style="background-color:${data.bgColor};color:${data.textColor};padding:${data.paddingY}px ${data.paddingX}px;">
  <div style="max-width:1280px;margin:0 auto;">
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:32px;padding-bottom:40px;">
      <div>
        <h3 style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:16px;opacity:0.5;">Useful Links</h3>
        <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:8px;">
          ${data.usefulLinks.map(l => `<li><a href="${l.url}" style="font-size:14px;color:${data.textColor};text-decoration:none;opacity:0.7;">${l.label}</a></li>`).join('')}
        </ul>
      </div>
      <div>
        <h3 style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:16px;opacity:0.5;">About Us</h3>
        <p data-field-key="aboutText" style="font-size:14px;opacity:0.7;line-height:1.6;">${data.aboutText}</p>
      </div>
      <div>
        <h3 style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:16px;opacity:0.5;">Connect with Us</h3>
        <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:8px;">
          <li style="font-size:14px;opacity:0.7;">${data.contactEmail}</li>
          <li style="font-size:14px;opacity:0.7;">${data.contactPhone}</li>
        </ul>
      </div>
    </div>
    <div style="border-top:1px solid rgba(255,255,255,0.1);padding-top:24px;text-align:center;">
      <p data-field-key="copyright" style="font-size:14px;opacity:0.5;">${data.copyright}</p>
    </div>
  </div>
</footer>

</section>`
}
