import type { FieldConfig } from '../editor/useBlockRegistry'
import { productImageSrc } from '../useProductImageSrc'
import { socialIconHtml } from '../useSocialIcons'


export const megaMenuHeaderSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 277.5 32">
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

export interface MegaMenuHeaderData {
  logoUrl: string
  logoText: string
  logoWidth: number
  logoAlign: string
  brandFontSize: number
  brandFontWeight: string
  navLinks: NavLink[]
  navLinksAlign: string
  dynamicCategories: boolean
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

export const megaMenuHeaderDefaults: MegaMenuHeaderData = {
  logoUrl: '',
  logoText: 'Brand',
  logoWidth: 120,
  logoAlign: 'left',
  brandFontSize: 20,
  brandFontWeight: '700',

  navLinks: [
    { label: 'Home',    href: '/'        },
    { label: 'Contact', href: '/contact' },
  ],
  navLinksAlign: 'center',
  dynamicCategories: false,
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

export const megaMenuHeaderFields: FieldConfig[] = [
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
  { key: 'navLinksAlign',      label: 'Links Position',                  type: 'select',
    options: ['left', 'center', 'right']                                    },
  { key: 'linkColor',          label: 'Link Colour',                       type: 'color'   },
  { key: 'linkFontSize',    label: 'Link Font Size (px)',   type: 'number',
    placeholder: '14'                                                       },
  { key: 'linkFontWeight',  label: 'Link Font Weight',      type: 'select',
    options: ['400', '500', '600', '700']                                   },

  { key: 'showSearch',        label: 'Show Search Bar',               type: 'toggle'  },
  { key: 'dynamicCategories', label: 'Dynamic Categories from Odoo',  type: 'toggle'  },
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

export function renderMegaMenuHeader(data: MegaMenuHeaderData): string {
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

  const staticLinks = data.navLinks.length
    ? data.navLinks.map(l => {
        if (l.megaMenu && l.megaMenu.length > 0) {
          const groups = l.megaMenu.map(g => ({ label: g.label, href: g.href, ids: g.products.map(p => p.id) }))
          const json = JSON.stringify(groups).replace(/'/g, '&quot;')
          const staticContent = renderStaticDrop(l.megaMenu)
          return `<div class='pbx-mega-item' data-mega-json='${json}' style='position:relative;display:inline-block;'>` +
            `<a href='${l.href}' style='${linkStyle}cursor:pointer;'>${l.label} ▾</a>` +
            `<div class='pbx-mega-drop' style='display:none;position:absolute;top:100%;left:0;min-width:260px;background:#fff;border:1px solid #e5e7eb;border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,.12);z-index:100;overflow:hidden;'>${staticContent}</div>` +
            `</div>`
        }
        return `<a href='${l.href}' style='${linkStyle}'>${l.label}</a>`
      }).join('')
    : ''

  const dynamicPlaceholder = data.dynamicCategories
    ? `<div
        data-rubikx-component='CategoryNav'
        data-on-mount='loadCategories'
        data-max-items='20'
        data-label='Categories'
        data-link-color='${data.linkColor}'
        data-font-size='${data.linkFontSize}'
        data-font-weight='${data.linkFontWeight}'
        style='position:relative;display:inline-block;'
        onmouseover='this.querySelector("div").style.display="block"'
        onmouseout='this.querySelector("div").style.display="none"'
      >
        <a style='${linkStyle}cursor:pointer;'>Categories ▾</a>
        <div style='display:none;position:absolute;top:100%;left:0;background:#fff;min-width:200px;box-shadow:0 4px 12px rgba(0,0,0,0.1);border-radius:8px;padding:8px 0;z-index:100;'>
          <span style='display:block;padding:8px 16px;color:#999;font-size:12px;font-style:italic;'>⟳ Loads from Odoo on live site</span>
        </div>
      </div>`
    : ''

  const linksEl = (staticLinks || dynamicPlaceholder)
    ? `<nav style='display:flex;align-items:center;gap:1.5rem;'>${staticLinks}${dynamicPlaceholder}</nav>`
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
</section>`
}

// ─── Footer-1 ─────────────────────────────────────────────────────────────────

export const footer1Svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 177.28 70'>
  <rect width='177.28' height='70' fill='#1a1a1a'/>
  <rect x='8' y='12' width='40' height='4' rx='1' fill='#444'/>
  <rect x='8' y='20' width='30' height='3' rx='1' fill='#333'/>
  <rect x='8' y='26' width='35' height='3' rx='1' fill='#333'/>
  <rect x='8' y='32' width='28' height='3' rx='1' fill='#333'/>
  <rect x='68' y='12' width='40' height='4' rx='1' fill='#444'/>
  <rect x='68' y='20' width='50' height='3' rx='1' fill='#333'/>
  <rect x='68' y='26' width='45' height='3' rx='1' fill='#333'/>
  <rect x='128' y='12' width='40' height='4' rx='1' fill='#444'/>
  <rect x='128' y='20' width='35' height='3' rx='1' fill='#333'/>
  <rect x='128' y='26' width='30' height='3' rx='1' fill='#333'/>
  <rect x='0' y='55' width='177.28' height='1' fill='#333'/>
  <rect x='50' y='62' width='77' height='3' rx='1' fill='#444'/>
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

// ─── Ru1-About ───────────────────────────────────────────────────────────────

export const ru1AboutSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 277.5 105">
  <rect fill="#394152" x="89" y="6" width="100" height="6"/>
  <rect fill="#394152" x="55" y="17" width="168" height="3"/>
  <rect fill="#394152" x="65" y="22" width="148" height="3"/>
  <rect fill="#394152" x="106" y="30" width="66" height="7"/>
  <rect fill="#394152" x="0" y="43" width="277.5" height="38" opacity="0.4"/>
  <rect fill="#f3f4f6" x="30" y="70" width="218" height="28" rx="3"/>
  <rect fill="#394152" x="43" y="75" width="6" height="6"/>
  <rect fill="#394152" x="38" y="84" width="16" height="3"/>
  <rect fill="#394152" x="40" y="89" width="12" height="2"/>
  <rect fill="#394152" x="104" y="75" width="6" height="6"/>
  <rect fill="#394152" x="99" y="84" width="16" height="3"/>
  <rect fill="#394152" x="101" y="89" width="12" height="2"/>
  <rect fill="#394152" x="165" y="75" width="6" height="6"/>
  <rect fill="#394152" x="160" y="84" width="16" height="3"/>
  <rect fill="#394152" x="162" y="89" width="12" height="2"/>
  <rect fill="#394152" x="226" y="75" width="6" height="6"/>
  <rect fill="#394152" x="221" y="84" width="16" height="3"/>
  <rect fill="#394152" x="223" y="89" width="12" height="2"/>
</svg>`

export interface Ru1AboutData {
  sectionBgColor: string
  title: string
  titleColor: string
  titleAlign: string
  titleWeight: string
  description: string
  descriptionAlign: string
  ctaHref: string
  ctaBgColor: string
  ctaAlign: string
  buttonAnimation: string
  image: string
  imageOpacity: number
  imageAspectRatio: string
  statsBgColor: string
  statsIconColor: string
  stats: Array<{ value: string; label: string }>
}

export const ru1AboutDefaults: Ru1AboutData = {
  sectionBgColor: '#f3f4f6',
  title: 'About Us',
  titleColor: '#111827',
  titleAlign: 'center',
  titleWeight: 'Semibold',
  description: 'Our achievement story stands as a powerful testament to teamwork and perseverance. United, we have faced challenges, celebrated victories, and woven a narrative of growth and success.',
  descriptionAlign: 'center',
  ctaHref: '#',
  ctaBgColor: '#4f46e5',
  ctaAlign: 'center',
  buttonAnimation: 'Lift up',
  image: 'https://cdn.flyonui.com/fy-assets/blocks/marketing-ui/about/about-9.png',
  imageOpacity: 100,
  imageAspectRatio: 'Wide (16:9)',
  statsBgColor: '#ffffff',
  statsIconColor: '#7c3aed',
  stats: [
    { value: '20+', label: 'Years of Experience' },
    { value: '70+', label: 'Successful Projects' },
    { value: '500+', label: 'Customer Reviews' },
    { value: '25', label: 'Achieve Awards' },
  ],
}

export const ru1AboutFields: FieldConfig[] = [
  { key: 'sectionBgColor',  label: 'Section Background',    type: 'color' },
  { key: 'title',           label: 'Section Title',         type: 'text',   placeholder: 'e.g. About Us' },
  { key: 'titleColor',      label: 'Title Colour',          type: 'color' },
  { key: 'titleAlign',      label: 'Title Alignment',       type: 'select', options: ['left', 'center', 'right'] },
  { key: 'titleWeight',     label: 'Title Weight',          type: 'select', options: ['Normal', 'Medium', 'Semibold', 'Bold', 'Extrabold'] },
  { key: 'description',     label: 'Description',           type: 'text',   placeholder: 'Short intro paragraph…' },
  { key: 'descriptionAlign',label: 'Description Alignment', type: 'select', options: ['left', 'center', 'right'] },
  { key: 'ctaHref',         label: 'Button URL',            type: 'url',    placeholder: 'https://...' },
  { key: 'ctaBgColor',        label: 'Button Colour',       type: 'color' },
  { key: 'ctaAlign',          label: 'Button Alignment',    type: 'select', options: ['left', 'center', 'right'] },
  { key: 'buttonAnimation',   label: 'Button Hover Effect', type: 'select', options: ['None', 'Lift up', 'Grow bigger', 'Glow'] },
  { key: 'image',             label: 'Cover Image',         type: 'image' },
  { key: 'imageOpacity',     label: 'Image Opacity (0 = invisible, 100 = fully visible)', type: 'number', placeholder: '100', unit: '%' },
  { key: 'imageAspectRatio', label: 'Image Shape',          type: 'select', options: ['Wide (16:9)', 'Standard (4:3)', 'Square (1:1)', 'Tall (3:4)', 'Cinematic (21:9)'] },
  { key: 'statsBgColor',   label: 'Stats Card Background', type: 'color' },
  { key: 'statsIconColor', label: 'Stats Icon Colour',     type: 'color' },
  {
    key: 'stats',
    label: 'Stats',
    type: 'list',
    listFields: [
      { key: 'value', label: 'Value', type: 'text', placeholder: 'e.g. 20+' },
      { key: 'label', label: 'Label', type: 'text', placeholder: 'e.g. Years of Experience' },
    ],
  },
]

const statIcons = [
  `<svg width="33" height="32" viewBox="0 0 33 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M16.3013 1.6001H20.6159C22.7164 1.60007 24.4097 1.60004 25.7414 1.77213C27.1239 1.95079 28.2879 2.33299 29.2126 3.22162C30.137 4.11026 30.5346 5.22912 30.7206 6.55798C30.8996 7.8379 30.8996 9.4653 30.8996 11.4843V20.5043C30.8996 22.5233 30.8996 24.1507 30.7206 25.4307C30.5346 26.7595 30.137 27.8783 29.2126 28.767C28.2879 29.6556 27.1239 30.0378 25.7414 30.2164C24.4097 30.3886 22.7164 30.3886 20.6159 30.3886H6.01758V11.4843C6.01755 9.4653 6.01753 7.8379 6.19656 6.55798C6.38244 5.22912 6.78011 4.11026 7.70465 3.22162C8.62919 2.33299 9.79329 1.95079 11.1758 1.77213C12.5075 1.60004 14.2007 1.60007 16.3013 1.6001Z" fill="var(--color-primary)" fill-opacity="0.2"/><path d="M4.48162 6.80371C5.02138 6.67016 5.67024 6.66745 6.16962 6.69236C6.04966 7.95368 6.04968 9.54289 6.0497 11.5003V30.3849C5.95382 30.3779 5.86482 30.3676 5.77944 30.3531C3.8803 30.026 2.38587 28.0716 2.13584 25.5878C2.09949 25.2268 2.09955 24.8159 2.09962 24.2127L2.09963 10.9668C2.09963 9.20932 2.88685 7.19828 4.48162 6.80371Z" fill="var(--color-primary)"/><path fill-rule="evenodd" clip-rule="evenodd" d="M12.2452 8.01881C12.2602 8.01881 12.2751 8.01883 12.29 8.01883H15.3019C15.3168 8.01883 15.3317 8.01881 15.3467 8.01881C15.6139 8.01871 15.9028 8.0186 16.1466 8.05011C16.4323 8.08702 16.7972 8.18196 17.1042 8.47715C17.4114 8.77231 17.5101 9.12306 17.5485 9.39762C17.5813 9.63199 17.5812 9.90964 17.5812 10.1664C17.5812 10.1809 17.5812 10.1952 17.5812 10.2095V11.9308C17.5812 11.9451 17.5812 11.9595 17.5812 11.9739C17.5812 12.2307 17.5813 12.5083 17.5485 12.7427C17.5101 13.0173 17.4114 13.368 17.1042 13.6632C16.7972 13.9584 16.4323 14.0533 16.1466 14.0902C15.9028 14.1217 15.6139 14.1216 15.3467 14.1215C15.3317 14.1215 15.3168 14.1215 15.3019 14.1215H12.29C12.2751 14.1215 12.2602 14.1215 12.2452 14.1215C11.978 14.1216 11.6891 14.1217 11.4453 14.0902C11.1596 14.0533 10.7947 13.9584 10.4876 13.6632C10.1805 13.368 10.0817 13.0173 10.0433 12.7427C10.0105 12.5083 10.0107 12.2307 10.0108 11.9739C10.0108 11.9595 10.0108 11.9451 10.0108 11.9308V10.2095C10.0108 10.1952 10.0108 10.1808 10.0108 10.1664C10.0107 9.90964 10.0105 9.63199 10.0433 9.39762C10.0817 9.12306 10.1805 8.77231 10.4876 8.47715C10.7947 8.18196 11.1596 8.08702 11.4453 8.05011C11.6891 8.0186 11.978 8.01871 12.2452 8.01881Z" fill="var(--color-primary)"/><path fill-rule="evenodd" clip-rule="evenodd" d="M21.5312 9.06403C21.5312 8.45253 22.0469 7.95679 22.6833 7.95679H25.7553C26.3914 7.95679 26.9073 8.45253 26.9073 9.06403C26.9073 9.67555 26.3914 10.1713 25.7553 10.1713H22.6833C22.0469 10.1713 21.5312 9.67555 21.5312 9.06403Z" fill="var(--color-primary)"/><path fill-rule="evenodd" clip-rule="evenodd" d="M21.5312 13.0418C21.5312 12.4303 22.0469 11.9346 22.6833 11.9346H25.7553C26.3914 11.9346 26.9073 12.4303 26.9073 13.0418C26.9073 13.6533 26.3914 14.1491 25.7553 14.1491H22.6833C22.0469 14.1491 21.5312 13.6533 21.5312 13.0418Z" fill="var(--color-primary)"/><path fill-rule="evenodd" clip-rule="evenodd" d="M10.0107 18.947C10.0107 18.3355 10.5265 17.8398 11.1627 17.8398H25.7548C26.391 17.8398 26.9068 18.3355 26.9068 18.947C26.9068 19.5586 26.391 20.0542 25.7548 20.0542H11.1627C10.5265 20.0542 10.0107 19.5586 10.0107 18.947Z" fill="var(--color-primary)"/><path fill-rule="evenodd" clip-rule="evenodd" d="M10.0107 23.376C10.0107 22.7645 10.5265 22.2688 11.1627 22.2688H25.7548C26.391 22.2688 26.9068 22.7645 26.9068 23.376C26.9068 23.9875 26.391 24.4834 25.7548 24.4834H11.1627C10.5265 24.4834 10.0107 23.9875 10.0107 23.376Z" fill="var(--color-primary)"/></svg>`,
  `<svg width="33" height="32" viewBox="0 0 33 32" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_10399_304346)"><path d="M12.8113 1.15372e-06H20.1892C20.5026 -1.66422e-05 20.7906 -3.29867e-05 21.0324 0.0167549C21.2924 0.0347947 21.5781 0.0758928 21.8684 0.19827C22.4957 0.462627 22.9941 0.969686 23.254 1.6079C23.3413 1.8225 23.3864 2.03462 23.4114 2.23597C24.1495 2.24587 24.7229 2.28333 25.2343 2.42272C27.1272 2.93882 28.606 4.44328 29.1132 6.36936C29.3008 7.08179 29.3005 7.91253 29.3002 9.12995V22.0352C29.3002 24.0706 29.3002 25.7114 29.1296 27.0016C28.9527 28.3414 28.574 29.4694 27.6935 30.3653C26.8128 31.2611 25.7042 31.6464 24.3876 31.8266C23.1192 32 21.5068 32 19.5061 32H13.4942C11.4937 32 9.88113 32 8.61289 31.8266C7.29617 31.6464 6.18751 31.2611 5.30698 30.3653C4.42647 29.4694 4.04775 28.3414 3.87073 27.0016C3.70021 25.7114 3.70025 24.0706 3.70026 22.0352L3.70023 9.12997C3.69985 7.91253 3.69957 7.08179 3.88719 6.36938C4.39444 4.44328 5.87309 2.93882 7.76615 2.42272C8.27749 2.28331 8.85085 2.24587 9.58897 2.23595C9.61397 2.03461 9.65919 1.8225 9.74655 1.6079C10.0064 0.969686 10.5047 0.462627 11.132 0.19827C11.4224 0.0758928 11.7081 0.0347947 11.968 0.0167549C12.2098 -3.29867e-05 12.4978 -1.66424e-05 12.8113 1.15372e-06Z" fill="var(--color-primary)" fill-opacity="0.2"/><path fill-rule="evenodd" clip-rule="evenodd" d="M11.7752 2.45764C11.8122 2.37007 11.8808 2.30026 11.9669 2.26265C11.9776 2.25986 12.0192 2.25079 12.1169 2.24401C12.2749 2.23303 12.4868 2.23242 12.8426 2.23242H20.1569C20.5128 2.23242 20.7246 2.23303 20.8827 2.24401C20.9804 2.25079 21.0219 2.25986 21.0326 2.26265C21.1187 2.30026 21.1873 2.37007 21.2243 2.45764C21.227 2.46858 21.236 2.51085 21.2427 2.61033C21.2534 2.77108 21.2541 2.98669 21.2541 3.34871C21.2541 3.71073 21.2534 3.92634 21.2427 4.08709C21.236 4.18655 21.227 4.22882 21.2243 4.23978C21.1873 4.32735 21.1187 4.39714 21.0326 4.43477C21.0219 4.43754 20.9804 4.44663 20.8827 4.45341C20.7246 4.46439 20.5128 4.46498 20.1569 4.46498H12.8426C12.4868 4.46498 12.2749 4.46439 12.1169 4.45341C12.0192 4.44663 11.9776 4.43754 11.9669 4.43477C11.8808 4.39714 11.8122 4.32735 11.7752 4.23978C11.7725 4.22884 11.7636 4.18657 11.7569 4.08709C11.7461 3.92634 11.7455 3.71073 11.7455 3.34871C11.7455 2.98669 11.7461 2.77108 11.7569 2.61033C11.7636 2.51085 11.7725 2.46858 11.7752 2.45764ZM10.2256 14.5218C10.2256 13.85 10.7604 13.3021 11.4242 13.3021H21.5753C22.2392 13.3021 22.774 13.85 22.774 14.5218C22.774 15.1937 22.2392 15.7416 21.5753 15.7416H11.4242C10.7604 15.7416 10.2256 15.1937 10.2256 14.5218ZM10.2256 20.4339C10.2256 19.7621 10.7604 19.2142 11.4242 19.2142H21.5753C22.2392 19.2142 22.774 19.7621 22.774 20.4339C22.774 21.1058 22.2392 21.6538 21.5753 21.6538H11.4242C10.7604 21.6538 10.2256 21.1058 10.2256 20.4339Z" fill="var(--color-primary)"/></g><defs><clipPath id="clip0_10399_304346"><rect width="32" height="32" fill="white" transform="translate(0.5)"/></clipPath></defs></svg>`,
  `<svg width="33" height="32" viewBox="0 0 33 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.777 1.67693C16.2533 1.57449 16.7458 1.57449 17.2222 1.67693C18.2817 1.90485 18.9665 2.74077 19.5034 3.62363C20.0466 4.51691 20.6182 5.77322 21.3204 7.31653L21.354 7.39047C21.8278 8.43194 21.9406 8.62269 22.0806 8.74709C22.1351 8.79555 22.1942 8.83872 22.2567 8.87599C22.4175 8.97165 22.6326 9.02063 23.7626 9.15256L24.0393 9.18485C25.6289 9.37042 26.9233 9.5215 27.8889 9.74909C28.8418 9.97368 29.8001 10.339 30.3535 11.2077C30.6743 11.7112 30.8609 12.2895 30.8953 12.8867C30.9546 13.9171 30.3927 14.7797 29.7529 15.5254C29.1046 16.2811 28.1455 17.1694 26.9678 18.2604L26.9114 18.3126C26.0318 19.1275 25.8786 19.3041 25.8046 19.4838C25.7674 19.5735 25.7418 19.6676 25.7281 19.7638C25.7006 19.9563 25.7425 20.187 26.0849 21.3403L26.1554 21.5779C26.7015 23.4177 27.1446 24.9095 27.3318 26.0607C27.5162 27.1945 27.5286 28.4012 26.7162 29.3081C26.511 29.5374 26.2762 29.7382 26.0183 29.9052C24.9982 30.5655 23.8175 30.3583 22.7361 29.9918C21.6383 29.6195 20.2478 28.938 18.5329 28.0979L18.0074 27.8404C16.9332 27.314 16.7183 27.2383 16.5186 27.2367L16.4918 27.2369C16.2921 27.2399 16.0778 27.3175 15.0077 27.8524L14.5348 28.0889C12.8028 28.955 11.399 29.6567 10.2908 30.0417C9.20024 30.4206 8.00708 30.6382 6.97612 29.9683C6.73189 29.8095 6.5085 29.6206 6.31124 29.4055C5.4785 28.4982 5.48604 27.2772 5.669 26.1303C5.85492 24.9649 6.29999 23.4518 6.84917 21.5847L6.9213 21.3395C7.26031 20.1868 7.30159 19.9564 7.2737 19.7641C7.25984 19.6686 7.23421 19.5751 7.19741 19.486C7.1233 19.3067 6.97037 19.1302 6.0918 18.3164L6.03546 18.2641C4.85594 17.1715 3.89552 16.2819 3.24637 15.5251C2.60575 14.7783 2.04337 13.9142 2.10412 12.8823C2.13908 12.2881 2.32471 11.7128 2.64325 11.2114C3.1965 10.3407 4.15586 9.97445 5.1101 9.74941C6.07703 9.52136 7.37335 9.37005 8.96543 9.18421L9.23652 9.15256C10.3666 9.02063 10.5816 8.97165 10.7424 8.87599C10.805 8.83872 10.864 8.79555 10.9186 8.74709C11.0586 8.62269 11.1713 8.43194 11.6451 7.39047L11.6787 7.31666C12.3809 5.77328 12.9525 4.51693 13.4957 3.62363C14.0327 2.74077 14.7174 1.90485 15.777 1.67693Z" fill="var(--color-primary)" fill-opacity="0.2"/></svg>`,
  `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M27.281 19.6648C27.281 25.5919 22.4545 30.3968 16.5004 30.3968C10.5464 30.3968 5.71973 25.5919 5.71973 19.6648C5.71973 13.7377 10.5464 8.93286 16.5004 8.93286C22.4545 8.93286 27.281 13.7377 27.281 19.6648Z" fill="var(--color-primary)" fill-opacity="0.2"/><path d="M18.4258 7.43527C21.1365 7.85461 23.5578 9.14535 25.3915 11.0108C25.4296 10.9537 25.4687 10.895 25.509 10.8344L29.9243 4.20274C30.6866 3.05788 31.0677 2.48546 30.8298 2.04424C30.5919 1.60303 29.9019 1.60303 28.5223 1.60303H25.8261C24.0082 1.60303 23.0992 1.60303 22.3397 2.02085C21.5802 2.43868 21.0965 3.20482 20.1291 4.73709L18.4258 7.43527Z" fill="var(--color-primary)"/><path d="M7.62681 10.992C9.46465 9.13024 11.8892 7.84429 14.6024 7.43093L11.9124 3.17007C11.2968 2.19487 10.2209 1.60303 9.0639 1.60303H2.94211C2.27136 1.60303 1.87047 2.34632 2.24102 2.90288L7.5218 10.8344C7.55772 10.8884 7.5927 10.9409 7.62681 10.992Z" fill="var(--color-primary)"/><path d="M16.5004 15.0288C16.2816 15.0288 16.1489 15.323 15.8836 15.9115L15.7868 16.126C15.4037 16.9757 15.2121 17.4005 14.8529 17.6631C14.4937 17.9257 14.0291 17.9804 13.1 18.0898L12.8713 18.1169C12.248 18.1901 11.9364 18.2269 11.869 18.4306C11.8016 18.6345 12.0304 18.8482 12.4879 19.2759L12.5667 19.3495C13.3016 20.0364 13.6691 20.3799 13.7949 20.8375C13.9208 21.2951 13.7803 21.777 13.4993 22.7409L13.3798 23.1509C13.1939 23.7885 13.101 24.1073 13.2717 24.2482C13.4425 24.389 13.7399 24.2389 14.3347 23.9389L14.9876 23.6095C15.7299 23.2351 16.101 23.0479 16.5012 23.0463C16.9013 23.0447 17.2741 23.2289 18.0194 23.5973L18.6711 23.9196C19.2644 24.2129 19.561 24.3596 19.7305 24.2181C19.8999 24.0769 19.8068 23.7604 19.6207 23.1276L19.5081 22.7449C19.2239 21.7793 19.0818 21.2964 19.2074 20.8375C19.333 20.3786 19.7015 20.0343 20.4383 19.3455L20.5129 19.2759C20.9705 18.8482 21.1991 18.6345 21.1317 18.4306C21.0644 18.2269 20.7527 18.1901 20.1295 18.1169L19.9009 18.0898C18.9717 17.9804 18.5071 17.9257 18.1479 17.6631C17.7887 17.4005 17.5972 16.9757 17.214 16.126L17.1172 15.9115C16.8519 15.323 16.7193 15.0288 16.5004 15.0288Z" fill="var(--color-primary)"/></svg>`,
]

export function renderRu1About(data: Ru1AboutData): string {
  const imgSrc = productImageSrc(data.image)
  const aspectMap: Record<string, string> = {
    'Wide (16:9)':     'aspect-ratio:16/9',
    'Standard (4:3)':  'aspect-ratio:4/3',
    'Square (1:1)':    'aspect-ratio:1/1',
    'Tall (3:4)':      'aspect-ratio:3/4',
    'Cinematic (21:9)':'aspect-ratio:21/9',
  }
  const aspectStyle = aspectMap[data.imageAspectRatio] ?? 'aspect-ratio:16/9'
  const imgOpacity = Math.min(100, Math.max(0, data.imageOpacity ?? 100)) / 100
  const weightMap: Record<string, string> = { Normal: '400', Medium: '500', Semibold: '600', Bold: '700', Extrabold: '800' }
  const fontWeight = weightMap[data.titleWeight] ?? '600'
  const alignMap: Record<string, string> = { left: 'flex-start', center: 'center', right: 'flex-end' }
  const ctaJustify = alignMap[data.ctaAlign] ?? 'center'
  const animMap: Record<string, { extra: string; over: string; out: string }> = {
    'None':        { extra: '', over: '', out: '' },
    'Lift up':     { extra: 'transition:transform 0.2s ease,box-shadow 0.2s ease;', over: "this.style.transform='translateY(-4px)';this.style.boxShadow='0 8px 20px rgba(0,0,0,0.18)'", out: "this.style.transform='translateY(0)';this.style.boxShadow='none'" },
    'Grow bigger': { extra: 'transition:transform 0.2s ease;', over: "this.style.transform='scale(1.07)'", out: "this.style.transform='scale(1)'" },
    'Glow':        { extra: 'transition:box-shadow 0.2s ease;', over: `this.style.boxShadow='0 0 20px 5px ${data.ctaBgColor}99'`, out: "this.style.boxShadow='none'" },
  }
  const anim = animMap[data.buttonAnimation] ?? animMap['None']
  const hoverAttrs = anim.over ? ` onmouseover="${anim.over}" onmouseout="${anim.out}"` : ''
  const btnStyle = `display:inline-block;border-radius:6px;padding:0.625rem 1.25rem;font-size:0.875rem;font-weight:600;color:#fff;background:${data.ctaBgColor};border:none;cursor:pointer;text-decoration:none;${anim.extra}`

  const iconColor = data.statsIconColor ?? '#7c3aed'
  const coloredIcons = statIcons.map(svg => svg.replace(/var\(--color-primary\)/g, iconColor))

  const statsHtml = (data.stats ?? []).map((stat, i) => {
    const icon = coloredIcons[i % coloredIcons.length]
    return `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1rem;">
              ${icon}
              <div style="text-align:center;">
                <div style="font-size:1.875rem;font-weight:600;color:${iconColor};">${stat.value}</div>
                <p style="color:#6b7280;margin:0.25rem 0 0;">${stat.label}</p>
              </div>
            </div>`
  }).join('\n            ')

  return `<section data-component-title="Ru1-About" style="background:${data.sectionBgColor};padding:4rem 0;">
  <div style="margin:0 auto;max-width:80rem;padding:0 2rem;">
    <div style="display:flex;flex-direction:column;gap:4rem;">
      <div style="display:flex;flex-direction:column;gap:1rem;">
        <h2 style="font-size:2.25rem;font-weight:${fontWeight};text-align:${data.titleAlign};color:${data.titleColor};margin:0 0 1rem;">${data.title}</h2>
        <p style="font-size:1.125rem;line-height:1.75;text-align:${data.descriptionAlign};color:#4b5563;margin:0 0 1.5rem;">${data.description}</p>
        <div style="display:flex;justify-content:${ctaJustify};">
          <a href="${data.ctaHref}" style="${btnStyle}"${hoverAttrs}>Read More</a>
        </div>
      </div>
      <div style="position:relative;width:100%;${aspectStyle};border-radius:0.75rem;margin-bottom:6rem;">
        <img src="${imgSrc}" style="width:100%;height:100%;object-fit:cover;border-radius:0.75rem;display:block;opacity:${imgOpacity};" />
        <div style="position:absolute;bottom:-4rem;left:50%;transform:translateX(-50%);background:${data.statsBgColor};border:1px solid #e5e7eb;border-radius:0.75rem;display:grid;grid-template-columns:repeat(4,1fr);gap:2.5rem;padding:2rem 2.5rem;white-space:nowrap;">
            ${statsHtml}
        </div>
      </div>
    </div>
  </div>
</section>`
}

// ─── Ru1-FAQ ─────────────────────────────────────────────────────────────────

export const ru1FaqSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 277.5 120">
  <rect fill="#394152" x="0" y="0" width="277.5" height="120"/>
  <rect fill="#718096" x="10" y="8" width="90" height="9" rx="1"/>
  <rect fill="#5a6475" x="10" y="20" width="140" height="4" rx="1"/>
  <rect fill="#5a6475" x="10" y="32" width="257.5" height="1"/>
  <rect fill="#718096" x="10" y="38" width="80" height="6" rx="1"/>
  <rect fill="#a0aec0" x="253" y="36" width="10" height="10" rx="1"/>
  <rect fill="#5a6475" x="10" y="52" width="257.5" height="1"/>
  <rect fill="#718096" x="10" y="58" width="130" height="6" rx="1"/>
  <rect fill="#a0aec0" x="253" y="56" width="10" height="10" rx="1"/>
  <rect fill="#5a6475" x="10" y="72" width="257.5" height="1"/>
  <rect fill="#718096" x="10" y="78" width="180" height="6" rx="1"/>
  <rect fill="#a0aec0" x="253" y="76" width="10" height="10" rx="1"/>
  <rect fill="#5a6475" x="10" y="92" width="257.5" height="1"/>
  <rect fill="#718096" x="10" y="98" width="220" height="6" rx="1"/>
  <rect fill="#a0aec0" x="253" y="96" width="10" height="10" rx="1"/>
  <rect fill="#5a6475" x="10" y="112" width="257.5" height="1"/>
</svg>`

export interface Ru1FaqData {
  sectionBgColor: string
  title: string
  titleColor: string
  titleAlign: string
  titleWeight: string
  subtitleText: string
  subtitleAfterLink: string
  subtitleLinkText: string
  subtitleLinkHref: string
  subtitleColor: string
  subtitleLinkColor: string
  subtitleAlign: string
  subtitleWeight: string
  questionColor: string
  answerColor: string
  iconColor: string
  dividerColor: string
  faqs: Array<{ question: string; answer: string }>
}

export const ru1FaqDefaults: Ru1FaqData = {
  sectionBgColor: '#ffffff',
  title: 'Frequently asked questions',
  titleColor: '#111827',
  titleAlign: 'left',
  titleWeight: 'Semibold',
  subtitleText: "Have a different question and can't find the answer you're looking for? Reach out to our support team by",
  subtitleAfterLink: "and we'll get back to you as soon as we can.",
  subtitleLinkText: 'sending us an email',
  subtitleLinkHref: '#',
  subtitleColor: '#4b5563',
  subtitleLinkColor: '#4f46e5',
  subtitleAlign: 'left',
  subtitleWeight: 'Normal',
  questionColor: '#111827',
  answerColor: '#4b5563',
  iconColor: '#111827',
  dividerColor: '#e5e7eb',
  faqs: [
    { question: 'What services do you provide?',           answer: 'We offer a range of solutions tailored to meet business needs, including consulting, development, design, and ongoing support services.' },
    { question: 'How can I get started with your services?', answer: 'You can get started by contacting our team through the inquiry form or scheduling a consultation. We will discuss your requirements and recommend the best solution.' },
    { question: 'Do you provide customized solutions?',    answer: 'Yes, we understand that every business is unique. Our team works closely with clients to deliver customized solutions that align with their goals and requirements.' },
    { question: 'How long does a typical project take?',   answer: 'Project timelines vary depending on scope, complexity, and requirements. After an initial consultation, we provide a detailed timeline and project roadmap.' },
    { question: 'Do you offer post-launch support?',       answer: 'Absolutely. We provide ongoing support, maintenance, and updates to ensure your solution remains secure, efficient, and up to date.' },
    { question: 'How can I contact your team?',            answer: 'You can reach us through our contact form, email, or phone. Our team is available to answer questions and assist you with any inquiries.' },
  ],
}

export const ru1FaqFields: FieldConfig[] = [
  { key: 'sectionBgColor', label: 'Section Background',   type: 'color' },
  { key: 'title',          label: 'Section Title',        type: 'text',   placeholder: 'e.g. Frequently asked questions' },
  { key: 'titleColor',     label: 'Title Colour',         type: 'color' },
  { key: 'titleAlign',     label: 'Title Alignment',      type: 'select', options: ['left', 'center', 'right'] },
  { key: 'titleWeight',    label: 'Title Weight',         type: 'select', options: ['Normal', 'Medium', 'Semibold', 'Bold', 'Extrabold'] },
  { key: 'subtitleText',      label: 'Subtitle Text (before link)', type: 'text', placeholder: "Have a different question…" },
  { key: 'subtitleLinkText',  label: 'Subtitle Link Label',         type: 'text', placeholder: 'e.g. sending us an email' },
  { key: 'subtitleLinkHref',  label: 'Subtitle Link URL',           type: 'url',  placeholder: 'https://...' },
  { key: 'subtitleAfterLink', label: 'Subtitle Text (after link)',  type: 'text', placeholder: "and we'll get back to you…" },
  { key: 'subtitleColor',     label: 'Subtitle Text Colour',        type: 'color' },
  { key: 'subtitleLinkColor', label: 'Subtitle Link Colour',        type: 'color' },
  { key: 'subtitleAlign',     label: 'Subtitle Alignment',          type: 'select', options: ['left', 'center', 'right'] },
  { key: 'subtitleWeight',    label: 'Subtitle Weight',             type: 'select', options: ['Normal', 'Medium', 'Semibold', 'Bold', 'Extrabold'] },
  { key: 'questionColor',     label: 'Question Colour',             type: 'color' },
  { key: 'answerColor',    label: 'Answer Colour',        type: 'color' },
  { key: 'iconColor',      label: 'Icon Colour (+/−)',    type: 'color' },
  { key: 'dividerColor',   label: 'Divider Line Colour',  type: 'color' },
  {
    key: 'faqs', label: 'FAQ Items', type: 'list',
    listFields: [
      { key: 'question', label: 'Question', type: 'text', placeholder: 'e.g. What services do you provide?' },
      { key: 'answer',   label: 'Answer',   type: 'text', placeholder: 'e.g. We offer...' },
    ],
  },
]

export function renderRu1Faq(data: Ru1FaqData): string {
  const weightMap: Record<string, string> = { Normal: '400', Medium: '500', Semibold: '600', Bold: '700', Extrabold: '800' }
  const fontWeight = weightMap[data.titleWeight] ?? '600'
  const subtitleWeight = weightMap[data.subtitleWeight] ?? '400'

  const faqItems = (data.faqs ?? []).map((faq) => `
    <div class="ru1-faq-item" style="border-top:1px solid ${data.dividerColor};padding:1.5rem 0;">
      <dt>
        <button onclick="var p=this.closest('.ru1-faq-item');var ans=p.querySelector('.ru1-faq-ans');var icon=p.querySelector('.ru1-faq-icon');var isOpen=ans.style.display!=='none';ans.style.display=isOpen?'none':'block';icon.textContent=isOpen?'+':'−';" style="display:flex;width:100%;align-items:flex-start;justify-content:space-between;text-align:left;background:none;border:none;cursor:pointer;padding:0;">
          <span style="font-size:1rem;font-weight:600;line-height:1.75;color:${data.questionColor};">${faq.question}</span>
          <span style="margin-left:1.5rem;display:flex;height:1.75rem;align-items:center;flex-shrink:0;">
            <span class="ru1-faq-icon" style="font-size:1.375rem;font-weight:300;color:${data.iconColor};line-height:1;user-select:none;">+</span>
          </span>
        </button>
      </dt>
      <dd class="ru1-faq-ans" style="display:none;margin-top:0.5rem;padding-right:3rem;margin-bottom:0;">
        <p style="font-size:1rem;line-height:1.75;color:${data.answerColor};margin:0;">${faq.answer}</p>
      </dd>
    </div>`).join('\n')

  return `<section data-component-title="Ru1-FAQ" style="background:${data.sectionBgColor};padding:6rem 0;">
  <div style="margin:0 auto;max-width:80rem;padding:0 2rem;">
    <div style="margin:0 auto;max-width:56rem;">
      <h2 style="font-size:2.5rem;font-weight:${fontWeight};letter-spacing:-0.025em;color:${data.titleColor};text-align:${data.titleAlign};margin:0 0 1.5rem;">${data.title}</h2>
      <p style="font-size:1rem;line-height:1.75;font-weight:${subtitleWeight};color:${data.subtitleColor};text-align:${data.subtitleAlign};margin:0 0 4rem;">${data.subtitleText} <a href="${data.subtitleLinkHref}" style="font-weight:600;color:${data.subtitleLinkColor};text-decoration:none;" onmouseover="this.style.opacity='0.75'" onmouseout="this.style.opacity='1'">${data.subtitleLinkText}</a> ${data.subtitleAfterLink}</p>
      <dl style="border-bottom:1px solid ${data.dividerColor};margin:0;padding:0;">
        ${faqItems}
      </dl>
    </div>
  </div>
</section>`
}
