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
  dynamicCategories: true,
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
    placeholder: 'https://example.com/logo.png', noAspectRatio: true       },
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
    options: ['left', 'center', 'right', 'lower-left', 'lower-center', 'lower-right'] },
  { key: 'linkColor',          label: 'Link Colour',                       type: 'color'   },
  { key: 'linkFontSize',    label: 'Link Font Size (px)',   type: 'number',
    placeholder: '14'                                                       },
  { key: 'linkFontWeight',  label: 'Link Font Weight',      type: 'select',
    options: ['400', '500', '600', '700']                                   },

  { key: 'showSearch',        label: 'Show Search Bar',               type: 'toggle'  },
  { key: 'dynamicCategories', label: 'Dynamic Categories',  type: 'toggle'  },
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
        style='position:relative;display:inline-block;' data-cat-nav='true'
      >
        <a style='${linkStyle}cursor:pointer;'>Categories ▾</a>
        <div data-cat-dropdown='true' style='display:none;position:absolute;top:100%;left:0;background:#fff;min-width:200px;box-shadow:0 4px 12px rgba(0,0,0,0.1);border-radius:8px;padding:8px 0;z-index:100;margin-top:-2px;padding-top:4px;'>
          <span style='display:block;padding:8px 16px;color:#999;font-size:12px;font-style:italic;'>⟳ Load Categories</span>
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
          const bg = btn.style === 'outline' ? (btn.bgColor || 'transparent') : btn.bgColor
          return `<a href="${btn.href}" style="${base}background:${bg};color:${btn.textColor};border:1.5px solid ${btn.borderColor};">${btn.label}</a>`
        }).join('')
      }</div>`
    : ''

  const lowerJustifyMap: Record<string, string> = {
    'lower-left': 'flex-start',
    'lower-center': 'center',
    'lower-right': 'flex-end',
  }
  const isLowerLinks = data.navLinksAlign in lowerJustifyMap

  const cols: Record<string, string[]> = { left: [], center: [], right: [] }
  const put = (zone: string, el: string) => { if (el && zone in cols) cols[zone].push(el) }
  put(data.logoAlign,   logoEl)
  if (!isLowerLinks) put(data.navLinksAlign, linksEl)
  put(data.searchAlign,  searchEl)
  put(data.buttonsAlign, buttonsEl)

  const zone = (items: string[], justify: string) =>
    `<div style="display:flex;align-items:center;gap:0.75rem;justify-content:${justify};">${items.join('')}</div>`

  const lowerRow = isLowerLinks && linksEl
    ? `<div class="pbx-max-w-7xl pbx-mx-auto" style="display:flex;align-items:center;justify-content:${lowerJustifyMap[data.navLinksAlign]};padding-top:0.5rem;">${linksEl}</div>`
    : ''

  const hasMegaMenu = data.navLinks.some(l => l.megaMenu && l.megaMenu.length > 0)

  // Refresh dropdowns with live Odoo data + wire product-tile click → detail panel
  const megaScript = hasMegaMenu
    ? `<script>(function(){function wireTiles(sec){sec.querySelectorAll('.pbx-ptile').forEach(function(a){a.addEventListener('click',function(e){e.preventDefault();var panel=sec.querySelector('.pbx-pd');if(!panel)return;var imgEl=a.querySelector('img');var imgSrc=imgEl?imgEl.src:'';var name=(a.querySelector('.pbx-ptile-name')||{}).textContent||'';var price=(a.querySelector('.pbx-ptile-price')||{}).textContent||'';var imgCol=imgSrc?'<img src="'+imgSrc+'" style="width:100%;height:100%;object-fit:cover;display:block;" />':'<div style="width:100%;height:100%;background:#f3f4f6;"></div>';panel.innerHTML='<div style="display:grid;grid-template-columns:40% 60%;height:380px;position:relative;">'+  '<div style="overflow:hidden;">'+imgCol+'</div>'+  '<div style="padding:40px 48px;display:flex;flex-direction:column;justify-content:center;background:#fff;">'+    '<div style="font-size:10px;font-weight:700;color:#9ca3af;letter-spacing:.12em;text-transform:uppercase;margin-bottom:12px;">Featured Product</div>'+    '<div style="font-size:26px;font-weight:700;color:#111827;line-height:1.25;margin-bottom:12px;">'+name+'</div>'+    '<div style="font-size:22px;font-weight:600;color:#374151;margin-bottom:28px;">'+price+'</div>'+    '<div><a href="'+a.href+'" style="display:inline-block;padding:12px 28px;background:#111827;color:#fff;text-decoration:none;border-radius:6px;font-size:14px;font-weight:500;letter-spacing:.02em;">View Product →</a></div>'+  '</div>'+  '<button onclick="this.closest(\\'.pbx-pd\\').style.display=\\'none\\'" style="position:absolute;top:12px;right:16px;background:rgba(255,255,255,.9);border:1px solid #e5e7eb;border-radius:50%;width:28px;height:28px;cursor:pointer;font-size:16px;color:#6b7280;display:flex;align-items:center;justify-content:center;line-height:1;">×</button>'+  '</div>';panel.style.display='block';panel.scrollIntoView({behavior:'smooth',block:'nearest'});});})}function init(){var ts=document.querySelectorAll('.pbx-mega-item[data-mega-json]');if(!ts.length)return;var allIds=[];ts.forEach(function(t){try{JSON.parse(t.getAttribute('data-mega-json').replace(/&quot;/g,'"')).forEach(function(g){(g.ids||[]).forEach(function(id){if(allIds.indexOf(id)<0)allIds.push(id);});});}catch(e){}});ts.forEach(function(t){var sec=t.closest('section');if(sec)wireTiles(sec);});if(!allIds.length)return;fetch('/api/products?ids='+allIds.join(',')).then(function(r){return r.json();}).then(function(prods){var map={};prods.forEach(function(p){map[p.id]=p;});ts.forEach(function(t){var groups;try{groups=JSON.parse(t.getAttribute('data-mega-json').replace(/&quot;/g,'"'));}catch(e){return;}var drop=t.querySelector('.pbx-mega-drop');if(!drop)return;var html=groups.map(function(g){var items=(g.ids||[]).map(function(id){var p=map[id];if(!p)return'';var img=p.image?'<img src="data:image/png;base64,'+p.image+'" style="width:44px;height:44px;object-fit:cover;border-radius:6px;flex-shrink:0;"/>':'<div style="width:44px;height:44px;background:#f3f4f6;border-radius:6px;flex-shrink:0;"></div>';var price=p.price!=null?'<span class="pbx-ptile-price" style="font-size:11px;color:#6b7280;">$'+Number(p.price).toFixed(2)+'</span>':'';return'<a href="/shop/'+p.id+'" class="pbx-ptile" style="display:flex;align-items:center;gap:10px;padding:7px 14px;text-decoration:none;cursor:pointer;" onmouseover="this.style.background=\\'#f9fafb\\'" onmouseout="this.style.background=\\'\\''">'+img+'<div style="min-width:0;"><div class="pbx-ptile-name" style="font-size:13px;font-weight:500;color:#1f2937;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:160px;">'+p.name+'</div>'+price+'</div></a>';}).join('');if(!items.trim())return'';return'<div><a href="'+(g.href||'#')+'" style="display:block;padding:8px 14px 4px;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.06em;text-decoration:none;">'+g.label+'</a>'+items+'</div>';}).filter(Boolean).join('<div style="height:1px;background:#f3f4f6;margin:4px 0;"></div>');drop.innerHTML=html;var sec=t.closest('section');if(sec)wireTiles(sec);});}).catch(function(){});}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();})();<\/script>`
    : ''

  return `<section data-component-title="Ru2-Mega-Menu-Header" data-component-props="${encodeURIComponent(JSON.stringify(data))}"${data.sticky ? ' style="position:sticky;top:0;z-index:9999"' : ''}>
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
  ${lowerRow}
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
  showInfo: boolean
  showForm: boolean
  singleBlockAlign: string
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
  showInfo: true,
  showForm: true,
  singleBlockAlign: 'center',
}

export const ru1FormFields: FieldConfig[] = [
  { key: 'title',       label: 'Section Title',      type: 'text',   placeholder: 'e.g. Get in touch'         },
  { key: 'description', label: 'Description',        type: 'textarea',   placeholder: 'Short intro paragraph…'   },
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
  { key: '_h_blocks', label: 'Blocks', type: 'header' },
  { key: 'showInfo', label: 'Show "Get in Touch" Block', type: 'toggle' },
  { key: 'showForm', label: 'Show Form Block', type: 'toggle' },
  { key: 'singleBlockAlign', label: 'Single Block Alignment', type: 'select', options: ['left', 'center', 'right'] },
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
      <div style="max-width:100%;margin-left:3.5rem;">
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

  const showInfo = data.showInfo !== false
  const showForm = data.showForm !== false

  if (showInfo && showForm) {
    const colMap: Record<string, string> = { info: infoCol, form: formCol }
    const order = data.columnOrder ?? ['info', 'form']
    const orderedCols = order.map(k => colMap[k] ?? '').join('\n    ')
    return `<section data-component-title="Ru1-Form" data-component-props="${encodeURIComponent(JSON.stringify(data))}" style="position:relative;background:#fff;">
  <div style="margin:0 auto;max-width:80rem;display:grid;grid-template-columns:1fr 1fr;">
    ${orderedCols}
  </div>
</section>`
  }

  if (showInfo || showForm) {
    const singleCol = showInfo ? infoCol : formCol
    const alignMap: Record<string, string> = { left: '0 auto 0 0', center: '0 auto', right: '0 0 0 auto' }
    const margin = alignMap[data.singleBlockAlign ?? 'center'] ?? '0 auto'
    return `<section data-component-title="Ru1-Form" data-component-props="${encodeURIComponent(JSON.stringify(data))}" style="position:relative;background:#fff;">
  <div style="margin:0 auto;max-width:80rem;">
    <div style="max-width:50%;margin:${margin};">${singleCol}</div>
  </div>
</section>`
  }

  return `<section data-component-title="Ru1-Form" data-component-props="${encodeURIComponent(JSON.stringify(data))}" style="position:relative;background:#fff;min-height:4rem;"></section>`
}

// ─── Ru1-Footer ───────────────────────────────────────────────────────────────

export const ru1FooterSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 277.5 100">
  <rect fill="#1f2937" x="0" y="0" width="277.5" height="100"/>
  <rect fill="#9ca3af" x="10" y="10" width="38" height="5" rx="1"/>
  <rect fill="#6b7280" x="10" y="20" width="30" height="3" rx="1"/>
  <rect fill="#6b7280" x="10" y="26" width="36" height="3" rx="1"/>
  <rect fill="#6b7280" x="10" y="32" width="28" height="3" rx="1"/>
  <rect fill="#6b7280" x="10" y="38" width="33" height="3" rx="1"/>
  <rect fill="#9ca3af" x="100" y="10" width="38" height="5" rx="1"/>
  <rect fill="#6b7280" x="100" y="20" width="55" height="3" rx="1"/>
  <rect fill="#6b7280" x="100" y="26" width="48" height="3" rx="1"/>
  <rect fill="#6b7280" x="100" y="32" width="52" height="3" rx="1"/>
  <rect fill="#9ca3af" x="195" y="10" width="38" height="5" rx="1"/>
  <rect fill="#6b7280" x="195" y="20" width="42" height="3" rx="1"/>
  <rect fill="#6b7280" x="195" y="26" width="35" height="3" rx="1"/>
  <rect fill="#6b7280" x="195" y="32" width="38" height="3" rx="1"/>
  <rect fill="#374151" x="10" y="70" width="257.5" height="1"/>
  <rect fill="#4b5563" x="89" y="80" width="100" height="3" rx="1"/>
</svg>`

export interface Ru1FooterData {
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

export const ru1FooterDefaults: Ru1FooterData = {
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
  bgColor: '#ffffff',
  textColor: '#000000',
  paddingY: 48,
  paddingX: 16,
}

export const ru1FooterFields: FieldConfig[] = [
  {
    key: 'usefulLinks', label: 'Useful Links', type: 'list',
    listFields: [
      { key: 'label', label: 'Label', type: 'text' },
      { key: 'url',   label: 'URL',   type: 'url'  },
    ],
  },
  { key: 'aboutText',    label: 'About Text',        type: 'textarea'   },
  { key: 'contactEmail', label: 'Contact Email',      type: 'text'   },
  { key: 'contactPhone', label: 'Contact Phone',      type: 'text'   },
  { key: 'copyright',    label: 'Copyright',          type: 'textarea'   },
  { key: 'bgColor',      label: 'Background Color',   type: 'color'  },
  { key: 'textColor',    label: 'Text Color',          type: 'color'  },
  { key: 'paddingY',     label: 'Vertical Padding',   type: 'number' },
  { key: 'paddingX',     label: 'Horizontal Padding', type: 'number' },
]

export function renderRu1Footer(data: Ru1FooterData): string {
  return `<section data-component-title="Ru1-Footer" data-component-props="${encodeURIComponent(JSON.stringify(data))}">
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

// ─── Ru2-Footer ───────────────────────────────────────────────────────────────

export const ru2FooterSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 277.5 48">
  <rect fill="#1f2937" x="0" y="0" width="277.5" height="48"/>
  <rect fill="#9ca3af" x="12" y="16" width="90" height="4" rx="1"/>
  <rect fill="#6b7280" x="12" y="24" width="65" height="3" rx="1"/>
  <circle cx="222" cy="24" r="7" fill="#374151"/>
  <circle cx="238" cy="24" r="7" fill="#374151"/>
  <circle cx="254" cy="24" r="7" fill="#374151"/>
</svg>`

export interface Ru2FooterData {
  copyright: string
  socials: { href: string }[]
  iconPosition: string
  bgColor: string
  textColor: string
  paddingY: number
  paddingX: number
}

export const ru2FooterDefaults: Ru2FooterData = {
  copyright: '© 2026 Your Company, Inc. All rights reserved.',
  socials: [],
  iconPosition: 'right',
  bgColor: '#ffffff',
  textColor: '#000000',
  paddingY: 20,
  paddingX: 32,
}

export const ru2FooterFields: FieldConfig[] = [
  { key: 'copyright', label: 'Copyright Text', type: 'text', placeholder: '© 2026 Your Company, Inc.' },
  {
    key: 'socials', label: 'Social Links', type: 'list',
    listFields: [
      { key: 'href', label: 'URL', type: 'url', placeholder: 'https://instagram.com/...' },
    ],
  },
  { key: 'iconPosition', label: 'Icon Position', type: 'select', options: ['left', 'center', 'right'] },
  { key: 'bgColor',   label: 'Background Color', type: 'color' },
  { key: 'textColor', label: 'Text Color',        type: 'color' },
  { key: 'paddingY',  label: 'Vertical Padding',  type: 'number', placeholder: '20' },
  { key: 'paddingX',  label: 'Horizontal Padding', type: 'number', placeholder: '32' },
]

export function renderRu2Footer(data: Ru2FooterData): string {
  const icons = (data.socials ?? []).map(s => socialIconHtml(s.href, 20)).filter(Boolean)
  const iconsHtml = icons.length
    ? `<div style="display:flex;gap:10px;align-items:center;flex-shrink:0;">${icons.join('')}</div>`
    : ''

  const pos = data.iconPosition ?? 'right'
  let innerHtml: string
  if (pos === 'center') {
    innerHtml = `<div style="display:flex;flex-direction:column;align-items:center;gap:12px;width:100%;">
      ${iconsHtml}
      <p style="margin:0;font-size:13px;opacity:0.6;">${data.copyright}</p>
    </div>`
  } else if (pos === 'left') {
    innerHtml = `<div style="display:flex;align-items:center;justify-content:space-between;width:100%;gap:16px;">
      ${iconsHtml}
      <p style="margin:0;font-size:13px;opacity:0.6;">${data.copyright}</p>
    </div>`
  } else {
    innerHtml = `<div style="display:flex;align-items:center;justify-content:space-between;width:100%;gap:16px;">
      <p style="margin:0;font-size:13px;opacity:0.6;">${data.copyright}</p>
      ${iconsHtml}
    </div>`
  }

  return `<section data-component-title="Ru2-Footer" data-component-props="${encodeURIComponent(JSON.stringify(data))}">
<footer style="background-color:${data.bgColor};color:${data.textColor};padding:${data.paddingY ?? 20}px ${data.paddingX ?? 32}px;box-sizing:border-box;">
  <div style="max-width:1280px;margin:0 auto;">
    ${innerHtml}
  </div>
</footer>
</section>`
}

// ─── Ru1-About ───────────────────────────────────────────────────────────────

export const ru1AboutSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 277.5 105">
  <rect fill="#1f2937" width="277.5" height="105"/>
  <rect fill="#9ca3af" x="89" y="6" width="100" height="6" rx="1"/>
  <rect fill="#6b7280" x="55" y="17" width="168" height="3" rx="1"/>
  <rect fill="#6b7280" x="65" y="22" width="148" height="3" rx="1"/>
  <rect fill="#4b5563" x="106" y="30" width="66" height="7" rx="3"/>
  <rect fill="#374151" x="0" y="43" width="277.5" height="22"/>
  <rect fill="#374151" x="30" y="70" width="218" height="28" rx="3"/>
  <rect fill="#4b5563" x="43" y="75" width="6" height="6" rx="1"/>
  <rect fill="#9ca3af" x="38" y="84" width="16" height="3" rx="1"/>
  <rect fill="#6b7280" x="40" y="89" width="12" height="2" rx="1"/>
  <rect fill="#4b5563" x="104" y="75" width="6" height="6" rx="1"/>
  <rect fill="#9ca3af" x="99" y="84" width="16" height="3" rx="1"/>
  <rect fill="#6b7280" x="101" y="89" width="12" height="2" rx="1"/>
  <rect fill="#4b5563" x="165" y="75" width="6" height="6" rx="1"/>
  <rect fill="#9ca3af" x="160" y="84" width="16" height="3" rx="1"/>
  <rect fill="#6b7280" x="162" y="89" width="12" height="2" rx="1"/>
  <rect fill="#4b5563" x="226" y="75" width="6" height="6" rx="1"/>
  <rect fill="#9ca3af" x="221" y="84" width="16" height="3" rx="1"/>
  <rect fill="#6b7280" x="223" y="89" width="12" height="2" rx="1"/>
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
  showCta: boolean
  ctaLabel: string
  ctaBgColor: string
  ctaAlign: string
  buttonAnimation: string
  image: string
  imageOpacity: number
  imageAspectRatio: string
  showStats: boolean
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
  showCta: true,
  ctaLabel: 'Contact Us',
  ctaBgColor: '#4f46e5',
  ctaAlign: 'center',
  buttonAnimation: 'Lift up',
  image: 'https://cdn.flyonui.com/fy-assets/blocks/marketing-ui/about/about-9.png',
  imageOpacity: 100,
  imageAspectRatio: 'Wide (16:9)',
  showStats: true,
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
  { key: 'description',     label: 'Description',           type: 'textarea',   placeholder: 'Short intro paragraph…' },
  { key: 'descriptionAlign',label: 'Description Alignment', type: 'select', options: ['left', 'center', 'right'] },
  { key: 'ctaHref',         label: 'Button URL',            type: 'url',    placeholder: 'https://...' },
  { key: 'ctaLabel',        label: 'Button Text',           type: 'text',   placeholder: 'e.g. Contact Us' },
  { key: 'showCta',         label: 'Show Button',           type: 'toggle' },
  { key: 'ctaBgColor',        label: 'Button Colour',       type: 'color' },
  { key: 'ctaAlign',          label: 'Button Alignment',    type: 'select', options: ['left', 'center', 'right'] },
  { key: 'buttonAnimation',   label: 'Button Hover Effect', type: 'select', options: ['None', 'Lift up', 'Grow bigger', 'Glow'] },
  { key: 'image',             label: 'Cover Image',         type: 'image' },
  { key: 'imageOpacity',     label: 'Image Opacity (0 = invisible, 100 = fully visible)', type: 'number', placeholder: '100', unit: '%' },
  { key: 'showStats',      label: 'Show Stats Cards',      type: 'toggle' },
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
  const ratio = data.imageAspectRatio ?? 'Wide (16:9)'
  const aspectMap: Record<string, string> = {
    'Auto':            '',
    'Wide (16:9)':     'aspect-ratio:16/9',
    'Standard (4:3)':  'aspect-ratio:4/3',
    'Square (1:1)':    'aspect-ratio:1/1',
    'Tall (3:4)':      'aspect-ratio:3/4',
    'Cinematic (21:9)':'aspect-ratio:21/9',
  }
  const aspectStyle = aspectMap[ratio] ?? 'aspect-ratio:16/9'
  const autoRatioAttr = (ratio === 'Auto' && imgSrc)
    ? ` onload="this.parentElement.style.aspectRatio=this.naturalWidth+'/'+this.naturalHeight"`
    : ''
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

  return `<section data-component-title="Ru1-About" data-component-props="${encodeURIComponent(JSON.stringify(data))}" style="background:${data.sectionBgColor};padding:4rem 0;">
  <div style="margin:0 auto;max-width:80rem;padding:0 2rem;">
    <div style="display:flex;flex-direction:column;gap:4rem;">
      <div style="display:flex;flex-direction:column;gap:1rem;">
        <h2 style="font-size:2.25rem;font-weight:${fontWeight};text-align:${data.titleAlign};color:${data.titleColor};margin:0 0 1rem;">${data.title}</h2>
        <p style="font-size:1.125rem;line-height:1.75;text-align:${data.descriptionAlign};color:#4b5563;margin:0 0 1.5rem;">${data.description}</p>
        ${data.showCta !== false ? `<div style='display:flex;justify-content:${ctaJustify};'>
          <a href='${data.ctaHref}' style='${btnStyle}'${hoverAttrs}>${data.ctaLabel ?? 'Contact Us'}</a>
        </div>` : ''}
      </div>
      <div style="position:relative;width:100%;${aspectStyle};border-radius:0.75rem;${data.showStats !== false ? 'margin-bottom:6rem;' : ''}">
        <img src="${imgSrc}"${autoRatioAttr} style="width:100%;height:100%;object-fit:cover;border-radius:0.75rem;display:block;opacity:${imgOpacity};" />
        ${data.showStats !== false ? `<div style="position:absolute;bottom:-4rem;left:50%;transform:translateX(-50%);background:${data.statsBgColor};border:1px solid #e5e7eb;border-radius:0.75rem;display:grid;grid-template-columns:repeat(4,1fr);gap:2.5rem;padding:2rem 2.5rem;white-space:nowrap;">
            ${statsHtml}
        </div>` : ''}
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
  { key: 'subtitleText',      label: 'Subtitle Text (before link)', type: 'textarea', placeholder: "Have a different question…" },
  { key: 'subtitleLinkText',  label: 'Subtitle Link Label',         type: 'text', placeholder: 'e.g. sending us an email' },
  { key: 'subtitleLinkHref',  label: 'Subtitle Link URL',           type: 'url',  placeholder: 'https://...' },
  { key: 'subtitleAfterLink', label: 'Subtitle Text (after link)',  type: 'textarea', placeholder: "and we'll get back to you…" },
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

// ─── Ru1-Banner ──────────────────────────────────────────────────────────────

export const bannerSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 277.5 80">
  <rect fill="#1f2937" x="0" y="0" width="277.5" height="80"/>
  <rect fill="#9ca3af" x="80" y="18" width="118" height="8" rx="1"/>
  <rect fill="#6b7280" x="96" y="31" width="86" height="4" rx="1"/>
  <rect fill="#4b5563" x="110" y="44" width="58" height="13" rx="3"/>
</svg>`

export interface BannerData {
  title: string
  subtitle: string
  bgColor: string
  bgImage: string
  bgImageAspectRatio: string
  overlayColor: string
  overlayOpacity: number
  textColor: string
  textAlign: string
  showCta: boolean
  ctaLabel: string
  ctaHref: string
  ctaBgColor: string
  ctaTextColor: string
  paddingY: number
}

export const bannerDefaults: BannerData = {
  title: 'Welcome to Our Store',
  subtitle: 'Discover our latest collection and find something you love.',
  bgColor: '#1f2937',
  bgImage: '',
  bgImageAspectRatio: 'Auto',
  overlayColor: '#000000',
  overlayOpacity: 40,
  textColor: '#ffffff',
  textAlign: 'center',
  showCta: true,
  ctaLabel: 'Shop Now',
  ctaHref: '/shop',
  ctaBgColor: '#ffffff',
  ctaTextColor: '#111827',
  paddingY: 80,
}

export const bannerFields: FieldConfig[] = [
  { key: 'title',    label: 'Title',    type: 'text',  placeholder: 'e.g. Welcome to Our Store' },
  { key: 'subtitle', label: 'Subtitle', type: 'text',  placeholder: 'Short supporting line…' },
  { key: 'textColor',  label: 'Text Colour',       type: 'color' },
  { key: 'textAlign',  label: 'Text Alignment',    type: 'select', options: ['left', 'center', 'right'] },
  { key: 'bgColor',    label: 'Background Colour', type: 'color' },
  { key: 'bgImage',    label: 'Background Image',  type: 'image' },
  { key: 'overlayColor',   label: 'Overlay Colour',          type: 'color' },
  { key: 'overlayOpacity', label: 'Overlay Opacity (0–100)', type: 'number', placeholder: '40' },
  { key: 'showCta',    label: 'Show Button',      type: 'toggle' },
  { key: 'ctaLabel',   label: 'Button Text',      type: 'text', placeholder: 'e.g. Shop Now' },
  { key: 'ctaHref',    label: 'Button URL',       type: 'url',  placeholder: '/shop' },
  { key: 'ctaBgColor',   label: 'Button Background',  type: 'color' },
  { key: 'ctaTextColor', label: 'Button Text Colour', type: 'color' },
  { key: 'paddingY', label: 'Vertical Padding (px)', type: 'number', placeholder: '80' },
]

function hexToRgba(hex: string, opacity: number): string {
  const h = hex.replace('#', '')
  const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h
  const r = parseInt(full.slice(0, 2), 16)
  const g = parseInt(full.slice(2, 4), 16)
  const b = parseInt(full.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${opacity})`
}

export function renderBanner(data: BannerData): string {
  const imgSrc = productImageSrc(data.bgImage)
  const overlayOpacity = Math.min(100, Math.max(0, data.overlayOpacity ?? 40)) / 100
  const alignMap: Record<string, string> = { left: 'flex-start', center: 'center', right: 'flex-end' }
  const textAlign = data.textAlign ?? 'center'
  const itemsAlign = alignMap[textAlign] ?? 'center'

  const ratio = data.bgImageAspectRatio ?? 'Auto'
  const aspectRatioMap: Record<string, string> = {
    'Wide (16:9)':      'aspect-ratio:16/9;',
    'Standard (4:3)':   'aspect-ratio:4/3;',
    'Square (1:1)':     'aspect-ratio:1/1;',
    'Cinematic (21:9)': 'aspect-ratio:21/9;',
  }
  const aspectStyle = ratio !== 'Auto' ? (aspectRatioMap[ratio] ?? '') : ''

  // Auto: read natural image dimensions at runtime and set aspect-ratio to match exactly
  const autoRatioScript = (imgSrc && ratio === 'Auto')
    ? `<script>(function(){var s=document.currentScript.parentElement;var i=new Image();i.onload=function(){s.style.aspectRatio=i.naturalWidth+'/'+i.naturalHeight;};i.src='${imgSrc}';})()</script>`
    : ''

  const bgStyle = imgSrc
    ? `background:url('${imgSrc}') center/cover no-repeat;background-color:${data.bgColor};`
    : `background:${data.bgColor};`

  // inset box-shadow acts as overlay on top of the background image without
  // any extra DOM element — avoids z-index conflicts with the builder's
  // hover/selection indicator (which uses position:absolute inside the section)
  const overlayShadow = (imgSrc && overlayOpacity > 0)
    ? `box-shadow:inset 0 0 0 9999px ${hexToRgba(data.overlayColor ?? '#000000', overlayOpacity)};`
    : ''

  const ctaHtml = data.showCta !== false
    ? `<a href="${data.ctaHref}" style="display:inline-block;margin-top:2rem;padding:0.75rem 2rem;background:${data.ctaBgColor};color:${data.ctaTextColor};text-decoration:none;border-radius:6px;font-size:1rem;font-weight:600;">${data.ctaLabel}</a>`
    : ''

  // Section uses display:flex so the inner div can flex:1 and fill the full
  // aspect-ratio height — the builder's hover/select arm fires on that div,
  // so it must cover the entire section area, not just the text content height.
  return `<section data-component-title="Ru1-Banner" data-component-props="${encodeURIComponent(JSON.stringify(data))}" style="${bgStyle}${aspectStyle}${overlayShadow}display:flex;flex-direction:column;">
  ${autoRatioScript}
  <div style="width:100%;box-sizing:border-box;flex:1;display:flex;align-items:center;padding:${data.paddingY}px 1rem;">
    <div style="max-width:80rem;margin:0 auto;width:100%;display:flex;flex-direction:column;align-items:${itemsAlign};text-align:${textAlign};">
      <h2 style="font-size:2.5rem;font-weight:700;color:${data.textColor};margin:0;line-height:1.2;">${data.title}</h2>
      <p style="font-size:1.125rem;color:${data.textColor};opacity:0.85;margin:1rem 0 0;max-width:42rem;">${data.subtitle}</p>
      ${ctaHtml}
    </div>
  </div>
</section>`
}

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

  return `<section data-component-title="Ru1-FAQ" data-component-props="${encodeURIComponent(JSON.stringify(data))}" style="background:${data.sectionBgColor};padding:6rem 0;">
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

// ─── Ru2-Split-Banner-Collage ────────────────────────────────────────────────

export const ru2SplitBannerCollageSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 277.5 100">
  <rect fill="#1f2937" width="277.5" height="100"/>
  <rect fill="#9ca3af" x="10" y="14" width="50" height="2.5" rx="1"/>
  <rect fill="#f3f4f6" x="10" y="21" width="95" height="11" rx="1"/>
  <rect fill="#6b7280" x="10" y="38" width="80" height="2.5" rx="1"/>
  <rect fill="#6b7280" x="10" y="43" width="65" height="2.5" rx="1"/>
  <rect fill="#16a34a" x="10" y="54" width="40" height="10" rx="3"/>
  <rect fill="#374151" x="137" y="3"  width="41" height="42" rx="2"/>
  <rect fill="#4b5563" x="181" y="3"  width="41" height="14" rx="2"/>
  <rect fill="#374151" x="225" y="3"  width="50" height="42" rx="2"/>
  <rect fill="#4b5563" x="181" y="20" width="41" height="40" rx="2"/>
  <rect fill="#374151" x="137" y="48" width="41" height="49" rx="2"/>
  <rect fill="#4a5568" x="225" y="48" width="50" height="49" rx="2"/>
  <rect fill="#4a5568" x="181" y="63" width="41" height="34" rx="2"/>
</svg>`

export interface Ru2CollageImage {
  src: string
  alt: string
}

export interface Ru2SplitBannerCollageData {
  bgImage: string
  bgColor: string
  overlayColor: string
  overlayOpacity: number
  title: string
  titleSize: number
  titleWeight: string
  titleColor: string
  titleLetterSpacing: number
  subtitle: string
  subtitleColor: string
  subtitleSize: number
  description: string
  descriptionColor: string
  textSide: string
  textAlign: string
  showCta: boolean
  ctaLabel: string
  ctaHref: string
  ctaBgColor: string
  ctaTextColor: string
  ctaBorderRadius: number
  paddingY: number
  splitRatio: string
  bgImageAspectRatio?: string
  collageGap: number
  collageBorderRadius: number
  collageImages: Ru2CollageImage[]
}

export const ru2SplitBannerCollageDefaults: Ru2SplitBannerCollageData = {
  bgImage: '',
  bgImageAspectRatio: 'Auto',
  bgColor: '#1f2937',
  overlayColor: '#000000',
  overlayOpacity: 30,
  title: 'OUTFITTER',
  titleSize: 72,
  titleWeight: '800',
  titleColor: '#ffffff',
  titleLetterSpacing: 2,
  subtitle: 'BRANDED APPAREL & GOODS',
  subtitleColor: '#d1d5db',
  subtitleSize: 13,
  description: 'From the shop to the field to the weekend — discover a collection built for every moment.',
  descriptionColor: '#9ca3af',
  textSide: 'left',
  textAlign: 'left',
  showCta: true,
  ctaLabel: 'Shop Now',
  ctaHref: '/shop',
  ctaBgColor: '#16a34a',
  ctaTextColor: '#ffffff',
  ctaBorderRadius: 6,
  paddingY: 0,
  splitRatio: '50/50',
  collageGap: 6,
  collageBorderRadius: 16,
  collageImages: [
    { src: '', alt: 'Photo 1' },
    { src: '', alt: 'Photo 2' },
    { src: '', alt: 'Photo 3' },
    { src: '', alt: 'Photo 4' },
    { src: '', alt: 'Photo 5' },
    { src: '', alt: 'Photo 6' },
    { src: '', alt: 'Photo 7' },
  ],
}

export const ru2SplitBannerCollageFields: FieldConfig[] = [
  { key: '_h_bg',    label: 'Background', type: 'header' },
  { key: 'bgImage',  label: 'Background Image',      type: 'image', placeholder: 'Paste URL' },
  { key: 'bgColor',  label: 'Background Colour',     type: 'color' },
  { key: 'overlayColor',   label: 'Overlay Colour',          type: 'color' },
  { key: 'overlayOpacity', label: 'Overlay Opacity (0–100)', type: 'number', placeholder: '30' },

  { key: '_h_title',          label: 'Title', type: 'header' },
  { key: 'title',             label: 'Title',             type: 'text',   placeholder: 'e.g. OUTFITTER' },
  { key: 'titleSize',         label: 'Title Size (px)',   type: 'number', placeholder: '72' },
  { key: 'titleWeight',       label: 'Title Weight',      type: 'select', options: ['400', '500', '600', '700', '800', '900'] },
  { key: 'titleColor',        label: 'Title Colour',      type: 'color' },
  { key: 'titleLetterSpacing',label: 'Letter Spacing (px)', type: 'number', placeholder: '2' },

  { key: '_h_subtitle',   label: 'Subtitle', type: 'header' },
  { key: 'subtitle',      label: 'Subtitle',          type: 'text',   placeholder: 'e.g. BRANDED APPAREL & GOODS' },
  { key: 'subtitleSize',  label: 'Subtitle Size (px)', type: 'number', placeholder: '13' },
  { key: 'subtitleColor', label: 'Subtitle Colour',   type: 'color' },

  { key: '_h_desc',          label: 'Description', type: 'header' },
  { key: 'description',      label: 'Description',       type: 'text',  placeholder: 'Short paragraph…' },
  { key: 'descriptionColor', label: 'Description Colour', type: 'color' },

  { key: '_h_cta',          label: 'CTA Button', type: 'header' },
  { key: 'showCta',         label: 'Show Button',        type: 'toggle' },
  { key: 'ctaLabel',        label: 'Button Text',        type: 'text',  placeholder: 'e.g. Shop Now' },
  { key: 'ctaHref',         label: 'Button URL',         type: 'url',   placeholder: '/shop' },
  { key: 'ctaBgColor',      label: 'Button Background',  type: 'color' },
  { key: 'ctaTextColor',    label: 'Button Text Colour', type: 'color' },
  { key: 'ctaBorderRadius', label: 'Button Radius (px)', type: 'number', placeholder: '6' },

  { key: '_h_layout',  label: 'Layout', type: 'header' },
  { key: 'textSide',   label: 'Text Side',                     type: 'select', options: ['left', 'right'] },
  { key: 'textAlign',  label: 'Text Alignment',                type: 'select', options: ['left', 'center', 'right'] },
  { key: 'paddingY',   label: 'Vertical Padding (px)',         type: 'number', placeholder: '0' },
  { key: 'splitRatio', label: 'Split Ratio (text / collage)',  type: 'select', options: ['50/50', '55/45', '60/40', '40/60'] },

  { key: '_h_collage',          label: 'Collage', type: 'header' },
  { key: 'collageGap',          label: 'Gap between images (px)',   type: 'number', placeholder: '6' },
  { key: 'collageBorderRadius', label: 'Image Corner Radius (px)',  type: 'number', placeholder: '16' },
  {
    key: 'collageImages',
    label: 'Collage Images (7)',
    type: 'list',
    listFields: [
      { key: 'src', label: 'Image', type: 'image', noAspectRatio: true },
      { key: 'alt', label: 'Alt Text', type: 'text', placeholder: 'e.g. Person wearing polo shirt' },
    ],
  },
]

// ─── Ru1-Stats ───────────────────────────────────────────────────────────────

export const ru1StatsSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 277.5 60">
  <rect fill="#1f2937" width="277.5" height="60"/>
  <rect fill="#374151" x="8"   y="10" width="55" height="40" rx="4"/>
  <rect fill="#374151" x="73"  y="10" width="55" height="40" rx="4"/>
  <rect fill="#374151" x="138" y="10" width="55" height="40" rx="4"/>
  <rect fill="#374151" x="203" y="10" width="55" height="40" rx="4"/>
  <rect fill="#6b7280" x="20"  y="18" width="16" height="3" rx="1"/>
  <rect fill="#9ca3af" x="20"  y="25" width="28" height="6" rx="1"/>
  <rect fill="#6b7280" x="20"  y="35" width="22" height="3" rx="1"/>
  <rect fill="#6b7280" x="85"  y="18" width="16" height="3" rx="1"/>
  <rect fill="#9ca3af" x="85"  y="25" width="28" height="6" rx="1"/>
  <rect fill="#6b7280" x="85"  y="35" width="22" height="3" rx="1"/>
  <rect fill="#6b7280" x="150" y="18" width="16" height="3" rx="1"/>
  <rect fill="#9ca3af" x="150" y="25" width="28" height="6" rx="1"/>
  <rect fill="#6b7280" x="150" y="35" width="22" height="3" rx="1"/>
  <rect fill="#6b7280" x="215" y="18" width="16" height="3" rx="1"/>
  <rect fill="#9ca3af" x="215" y="25" width="28" height="6" rx="1"/>
  <rect fill="#6b7280" x="215" y="35" width="22" height="3" rx="1"/>
</svg>`

export interface Ru1StatItem {
  iconUrl: string
  value: string
  label: string
  description: string
}

export interface Ru1StatsData {
  bgColor: string
  paddingY: number
  paddingX: number
  cardBgColor: string
  cardBorderRadius: number
  cardBorderColor: string
  showBorder: boolean
  valueFontSize: number
  valueFontWeight: string
  valueColor: string
  labelFontSize: number
  labelColor: string
  descriptionColor: string
  iconSize: number
  layout: string
  textAlign: string
  items: Ru1StatItem[]
}

export const ru1StatsDefaults: Ru1StatsData = {
  bgColor: '#ffffff',
  paddingY: 48,
  paddingX: 24,
  cardBgColor: '#f9fafb',
  cardBorderRadius: 12,
  cardBorderColor: '#e5e7eb',
  showBorder: true,
  valueFontSize: 36,
  valueFontWeight: '700',
  valueColor: '#111827',
  labelFontSize: 14,
  labelColor: '#6b7280',
  descriptionColor: '#9ca3af',
  iconSize: 36,
  layout: '4-columns',
  textAlign: 'left',
  items: [
    { iconUrl: '', value: '20+', label: 'Years of Experience', description: '' },
    { iconUrl: '', value: '70+', label: 'Successful Projects', description: '' },
    { iconUrl: '', value: '500+', label: 'Customer Reviews', description: '' },
    { iconUrl: '', value: '25', label: 'Awards Achieved', description: '' },
  ],
}

export const ru1StatsFields: FieldConfig[] = [
  { key: '_h_layout', label: 'Layout', type: 'header' },
  { key: 'layout', label: 'Columns', type: 'select', options: ['2-columns', '3-columns', '4-columns'] },
  { key: 'textAlign', label: 'Text Align', type: 'select', options: ['left', 'center', 'right'] },
  { key: 'paddingY', label: 'Vertical Padding (px)', type: 'number', placeholder: '48' },
  { key: 'paddingX', label: 'Horizontal Padding (px)', type: 'number', placeholder: '24' },

  { key: '_h_section', label: 'Section', type: 'header' },
  { key: 'bgColor', label: 'Background Colour', type: 'color' },

  { key: '_h_card', label: 'Card Style', type: 'header' },
  { key: 'cardBgColor', label: 'Card Background', type: 'color' },
  { key: 'cardBorderRadius', label: 'Card Radius (px)', type: 'number', placeholder: '12' },
  { key: 'showBorder', label: 'Show Border', type: 'toggle' },
  { key: 'cardBorderColor', label: 'Border Colour', type: 'color' },

  { key: '_h_value', label: 'Value', type: 'header' },
  { key: 'valueFontSize', label: 'Value Size (px)', type: 'number', placeholder: '36' },
  { key: 'valueFontWeight', label: 'Value Weight', type: 'select', options: ['400', '500', '600', '700', '800', '900'] },
  { key: 'valueColor', label: 'Value Colour', type: 'color' },

  { key: '_h_label', label: 'Label & Description', type: 'header' },
  { key: 'labelFontSize', label: 'Label Size (px)', type: 'number', placeholder: '14' },
  { key: 'labelColor', label: 'Label Colour', type: 'color' },
  { key: 'descriptionColor', label: 'Description Colour', type: 'color' },
  { key: 'iconSize', label: 'Icon Size (px)', type: 'number', placeholder: '36' },

  {
    key: 'items',
    label: 'Stat Items',
    type: 'list',
    listFields: [
      { key: 'iconUrl', label: 'Icon URL', type: 'url', placeholder: 'https://example.com/icon.svg' },
      { key: 'value', label: 'Value', type: 'text', placeholder: 'e.g. 500+' },
      { key: 'label', label: 'Label', type: 'text', placeholder: 'e.g. Customer Reviews' },
      { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Optional short description' },
    ],
  },
]

export function renderRu1Stats(data: Ru1StatsData): string {
  const colMap: Record<string, string> = {
    '2-columns': 'repeat(2, 1fr)',
    '3-columns': 'repeat(3, 1fr)',
    '4-columns': 'repeat(4, 1fr)',
  }
  const gridCols = colMap[data.layout ?? '4-columns'] ?? 'repeat(4, 1fr)'
  const borderStyle = data.showBorder ? `border:1px solid ${data.cardBorderColor};` : ''
  const alignMap: Record<string, string> = { left: 'flex-start', center: 'center', right: 'flex-end' }

  const cardsHtml = (data.items ?? []).map(item => {
    const iconHtml = item.iconUrl
      ? `<img src="${item.iconUrl}" alt="${item.label}" style="width:${data.iconSize}px;height:${data.iconSize}px;object-fit:contain;margin-bottom:12px;display:block;" />`
      : ''

    const descHtml = item.description
      ? `<p style="margin:4px 0 0;font-size:12px;color:${data.descriptionColor};line-height:1.5;">${item.description}</p>`
      : ''

    return `<div style="background:${data.cardBgColor};${borderStyle}border-radius:${data.cardBorderRadius}px;padding:28px 24px;display:flex;flex-direction:column;align-items:${alignMap[data.textAlign ?? 'left']};text-align:${data.textAlign ?? 'left'};">
      ${iconHtml}
      <div style="font-size:${data.valueFontSize}px;font-weight:${data.valueFontWeight};color:${data.valueColor};line-height:1.1;margin-bottom:6px;">${item.value}</div>
      <div style="font-size:${data.labelFontSize}px;color:${data.labelColor};font-weight:500;">${item.label}</div>
      ${descHtml}
    </div>`
  }).join('')

  return `<section data-component-title="Ru1-Stats" style="background:${data.bgColor};padding:${data.paddingY}px ${data.paddingX}px;">
  <div style="max-width:1280px;margin:0 auto;">
    <div style="display:grid;grid-template-columns:${gridCols};gap:16px;">
      ${cardsHtml}
    </div>
  </div>
</section>`
}

// ─── Ru2-Split-Banner-Collage ────────────────────────────────────────────────

export function renderRu2SplitBannerCollage(data: Ru2SplitBannerCollageData): string {
  const imgSrc = productImageSrc(data.bgImage)
  const overlayOpacity = Math.min(100, Math.max(0, data.overlayOpacity ?? 30)) / 100

  const bgStyle = imgSrc
    ? `background-image:url('${imgSrc}');background-size:cover;background-position:center;background-repeat:no-repeat;background-color:${data.bgColor};`
    : `background-color:${data.bgColor};`

  const overlayShadow = (imgSrc && overlayOpacity > 0)
    ? `box-shadow:inset 0 0 0 9999px ${hexToRgba(data.overlayColor ?? '#000000', overlayOpacity)};`
    : ''

  const ratio = data.bgImageAspectRatio ?? 'Auto'
  const aspectRatioMap: Record<string, string> = {
    'Wide (16:9)':      'aspect-ratio:16/9;',
    'Standard (4:3)':   'aspect-ratio:4/3;',
    'Square (1:1)':     'aspect-ratio:1/1;',
    'Tall (3:4)':       'aspect-ratio:3/4;',
    'Cinematic (21:9)': 'aspect-ratio:21/9;',
  }
  // Auto = no aspect-ratio set, section height driven by collage content.
  // Specific ratios are applied directly via CSS — autoRatioScript is not used
  // here because scripts inside innerHTML replacements never execute in the builder.
  const aspectStyle = ratio !== 'Auto' ? (aspectRatioMap[ratio] ?? '') : ''

  const splitMap: Record<string, [string, string]> = {
    '50/50': ['1fr',     '1fr'  ],
    '55/45': ['1.22fr',  '1fr'  ],
    '60/40': ['1.5fr',   '1fr'  ],
    '40/60': ['0.67fr',  '1fr'  ],
  }
  const [textFr, collageFr] = splitMap[data.splitRatio ?? '50/50'] ?? ['1fr', '1fr']
  const gridCols = data.textSide === 'right'
    ? `${collageFr} ${textFr}`
    : `${textFr} ${collageFr}`

  const alignMap: Record<string, string> = { left: 'flex-start', center: 'center', right: 'flex-end' }
  const itemsAlign = alignMap[data.textAlign ?? 'left'] ?? 'flex-start'

  const py    = Math.max(data.paddingY ?? 0, 48)
  const gap   = data.collageGap ?? 6
  const radius = data.collageBorderRadius ?? 16

  const letterSpacing = data.titleLetterSpacing ? `letter-spacing:${data.titleLetterSpacing}px;` : ''

  const ctaHtml = data.showCta !== false
    ? `<a href="${data.ctaHref}" style="display:inline-block;margin-top:2rem;padding:0.75rem 2rem;background:${data.ctaBgColor};color:${data.ctaTextColor};text-decoration:none;border-radius:${data.ctaBorderRadius ?? 6}px;font-size:1rem;font-weight:600;">${data.ctaLabel}</a>`
    : ''

  const textCol = `<div style="padding:${py}px 3rem;display:flex;flex-direction:column;align-items:${itemsAlign};text-align:${data.textAlign ?? 'left'};align-self:center;">
    ${data.subtitle ? `<p style="font-size:${data.subtitleSize ?? 13}px;font-weight:600;color:${data.subtitleColor};letter-spacing:0.14em;text-transform:uppercase;margin:0 0 1rem;">${data.subtitle}</p>` : ''}
    <h2 style="font-size:${data.titleSize ?? 72}px;font-weight:${data.titleWeight ?? '800'};color:${data.titleColor};margin:0 0 1.25rem;line-height:1;${letterSpacing}">${data.title}</h2>
    ${data.description ? `<p style="font-size:1rem;line-height:1.7;color:${data.descriptionColor};margin:0;max-width:36rem;">${data.description}</p>` : ''}
    ${ctaHtml}
  </div>`

  // 7 images in 3 flex columns:
  //   col0 (idx 0,3): tall images, equal height — anchor the outer edges
  //   col1 (idx 1,4,6): short→tall→mid — the staggered middle creates the mosaic rhythm
  //   col2 (idx 2,5): mirrors col0
  // Heights per slot: idx 1 (image 2) matches idx 6 (image 7) at 280px
  const staggerHeights = [320, 280, 320, 360, 330, 360, 280]
  const images = [...(data.collageImages ?? []), ...Array(7).fill({ src: '', alt: '' })].slice(0, 7)
  const hasAspectRatio = ratio !== 'Auto'

  const renderCollageImg = (idx: number) => {
    const src = productImageSrc(images[idx]?.src ?? '')
    const h = staggerHeights[idx] ?? 280
    const br = `${radius}px`
    // Both states are a single childless <div> — only CSS properties differ.
    // No structural DOM change when a URL is added, so the collage never re-layouts.
    // border-radius clips background-image natively (no overflow:hidden wrapper needed).
    // When a fixed aspect-ratio is set, use flex-grow weights so the mosaic scales to fill
    // the section height exactly. For Auto, use fixed pixel heights (content-driven).
    const sizeStyle = hasAspectRatio
      ? `flex:${h} 1 0;min-height:0;`
      : `height:${h}px;flex-shrink:0;`
    return src
      ? `<div data-rbx-idx="${idx}" style="width:100%;${sizeStyle}border-radius:${br};background-image:url('${src}');background-size:cover;background-position:center;background-repeat:no-repeat;"></div>`
      : `<div data-rbx-idx="${idx}" style="width:100%;${sizeStyle}border-radius:${br};background-color:#2d3748;border:2px dashed #4b5563;box-sizing:border-box;"></div>`
  }

  // Outer padding for the collage group: use paddingY for top/bottom, 2rem for left/right
  // so the 7-image mosaic has equal breathing room on all sides (centered within its column).
  const py2  = Math.max(data.paddingY ?? 0, 0)
  const collagePad = `${py2}px 2rem`

  // When a fixed aspect-ratio is set, propagate section height through the flex chain so
  // the collage fills exactly — sub-columns become flex containers with flex-grow images.
  // When Auto, use fixed pixel heights driven by content (no height cascade needed).
  const collageCol = hasAspectRatio
    ? `<div style="height:100%;box-sizing:border-box;padding:${collagePad};display:flex;flex-direction:column;">
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:${gap}px;flex:1;min-height:0;">
          <div style="display:flex;flex-direction:column;gap:${gap}px;min-height:0;">
            ${renderCollageImg(0)}
            ${renderCollageImg(3)}
          </div>
          <div style="display:flex;flex-direction:column;gap:${gap}px;min-height:0;">
            ${renderCollageImg(1)}
            ${renderCollageImg(4)}
            ${renderCollageImg(6)}
          </div>
          <div style="display:flex;flex-direction:column;gap:${gap}px;min-height:0;">
            ${renderCollageImg(2)}
            ${renderCollageImg(5)}
          </div>
        </div>
      </div>`
    : `<div style="padding:${collagePad};display:grid;grid-template-columns:1fr 1fr 1fr;gap:${gap}px;align-items:start;">
        <div style="display:flex;flex-direction:column;gap:${gap}px;">
          ${renderCollageImg(0)}
          ${renderCollageImg(3)}
        </div>
        <div style="display:flex;flex-direction:column;gap:${gap}px;">
          ${renderCollageImg(1)}
          ${renderCollageImg(4)}
          ${renderCollageImg(6)}
        </div>
        <div style="display:flex;flex-direction:column;gap:${gap}px;">
          ${renderCollageImg(2)}
          ${renderCollageImg(5)}
        </div>
      </div>`

  const leftCol  = data.textSide === 'right' ? collageCol : textCol
  const rightCol = data.textSide === 'right' ? textCol    : collageCol

  if (hasAspectRatio) {
    return `<section data-component-title="Ru2-Split-Banner-Collage" data-component-props="${encodeURIComponent(JSON.stringify(data))}" style="${bgStyle}${aspectStyle}${overlayShadow}overflow:hidden;display:flex;align-items:stretch;">
  <div style="width:100%;box-sizing:border-box;flex:1;min-height:0;display:flex;flex-direction:column;">
    <div style="display:grid;grid-template-columns:${gridCols};flex:1;min-height:0;align-items:stretch;">
      ${leftCol}
      ${rightCol}
    </div>
  </div>
</section>`
  }

  return `<section data-component-title="Ru2-Split-Banner-Collage" data-component-props="${encodeURIComponent(JSON.stringify(data))}" style="${bgStyle}${aspectStyle}${overlayShadow}overflow:hidden;display:flex;align-items:center;">
  <div style="width:100%;box-sizing:border-box;">
    <div style="display:grid;grid-template-columns:${gridCols};align-items:center;">
      ${leftCol}
      ${rightCol}
    </div>
  </div>
</section>`
}

// ─── Ru2-Stats ───────────────────────────────────────────────────────────────

export const ru2StatsSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 277.5 70">
  <rect fill="#1f2937" width="277.5" height="70"/>
  <rect fill="#374151" x="8" y="8" width="261.5" height="54" rx="6"/>
  <rect fill="#9ca3af" x="18" y="18" width="55" height="7" rx="1"/>
  <rect fill="#6b7280" x="18" y="28" width="80" height="3" rx="1"/>
  <rect fill="#4b5563" x="190" y="16" width="35" height="8" rx="4"/>
  <rect fill="#6b7280" x="230" y="16" width="35" height="8" rx="12"/>
  <rect fill="#9ca3af" x="18" y="44" width="20" height="5" rx="1"/>
  <rect fill="#9ca3af" x="85" y="44" width="20" height="5" rx="1"/>
  <rect fill="#9ca3af" x="152" y="44" width="20" height="5" rx="1"/>
  <rect fill="#9ca3af" x="219" y="44" width="20" height="5" rx="1"/>
  <rect fill="#6b7280" x="18" y="52" width="40" height="3" rx="1"/>
  <rect fill="#6b7280" x="85" y="52" width="40" height="3" rx="1"/>
  <rect fill="#6b7280" x="152" y="52" width="40" height="3" rx="1"/>
  <rect fill="#6b7280" x="219" y="52" width="40" height="3" rx="1"/>
</svg>`

export interface Ru2StatItem {
  value: string
  label: string
  description: string
}

export interface Ru2StatsData {
  bgColor: string
  cardBgColor: string
  cardBorderRadius: number
  cardBorderColor: string
  showBorder: boolean
  paddingY: number
  paddingX: number
  title: string
  titleFontSize: number
  titleFontWeight: string
  titleColor: string
  subtitle: string
  subtitleColor: string
  showCta1: boolean
  cta1Label: string
  cta1Href: string
  cta1BgColor: string
  cta1TextColor: string
  cta1BorderColor: string
  cta1Style: string
  showCta2: boolean
  cta2Label: string
  cta2Href: string
  cta2BgColor: string
  cta2TextColor: string
  cta2BorderColor: string
  cta2Style: string
  ctaBorderRadius: number
  valueFontSize: number
  valueFontWeight: string
  valueColor: string
  labelFontSize: number
  labelFontWeight: string
  labelColor: string
  descriptionFontSize: number
  descriptionColor: string
  dividerColor: string
  showDividers: boolean
  layout: string
  items: Ru2StatItem[]
}

export const ru2StatsDefaults: Ru2StatsData = {
  bgColor: '#f3f4f6',
  cardBgColor: '#ffffff',
  cardBorderRadius: 16,
  cardBorderColor: '#e5e7eb',
  showBorder: false,
  paddingY: 32,
  paddingX: 24,
  title: 'We only deliver results.',
  titleFontSize: 22,
  titleFontWeight: '700',
  titleColor: '#111827',
  subtitle: "We don't use excuses. We deliver outcomes.",
  subtitleColor: '#6b7280',
  showCta1: true,
  cta1Label: 'Demo',
  cta1Href: '/demo',
  cta1BgColor: '#ffffff',
  cta1TextColor: '#111827',
  cta1BorderColor: '#d1d5db',
  cta1Style: 'outline',
  showCta2: true,
  cta2Label: 'Get Started',
  cta2Href: '/signup',
  cta2BgColor: '#111827',
  cta2TextColor: '#ffffff',
  cta2BorderColor: '#111827',
  cta2Style: 'filled',
  ctaBorderRadius: 20,
  valueFontSize: 40,
  valueFontWeight: '700',
  valueColor: '#1f2937',
  labelFontSize: 13,
  labelFontWeight: '600',
  labelColor: '#374151',
  descriptionFontSize: 13,
  descriptionColor: '#6b7280',
  dividerColor: '#e5e7eb',
  showDividers: true,
  layout: '4-columns',
  items: [
    { value: '420%', label: 'More Speed', description: 'Faster delivery cycles across the board.' },
    { value: '21.2K', label: 'Total Ratings', description: 'From verified users worldwide.' },
    { value: '110X', label: 'Efficiency Level', description: 'Automation that scales with you.' },
    { value: '16M', label: 'Total Users', description: 'And growing every single day.' },
  ],
}

export const ru2StatsFields: FieldConfig[] = [
  { key: '_h_layout', label: 'Layout', type: 'header' },
  { key: 'layout', label: 'Columns', type: 'select', options: ['2-columns', '3-columns', '4-columns'] },
  { key: 'paddingY', label: 'Vertical Padding (px)', type: 'number', placeholder: '32' },
  { key: 'paddingX', label: 'Horizontal Padding (px)', type: 'number', placeholder: '24' },

  { key: '_h_section', label: 'Section', type: 'header' },
  { key: 'bgColor', label: 'Background Colour', type: 'color' },

  { key: '_h_card', label: 'Card Style', type: 'header' },
  { key: 'cardBgColor', label: 'Card Background', type: 'color' },
  { key: 'cardBorderRadius', label: 'Card Radius (px)', type: 'number', placeholder: '16' },
  { key: 'showBorder', label: 'Show Border', type: 'toggle' },
  { key: 'cardBorderColor', label: 'Border Colour', type: 'color' },

  { key: '_h_header', label: 'Title & Subtitle', type: 'header' },
  { key: 'title', label: 'Title', type: 'text', placeholder: 'e.g. We only deliver results.' },
  { key: 'titleFontSize', label: 'Title Size (px)', type: 'number', placeholder: '22' },
  { key: 'titleFontWeight', label: 'Title Weight', type: 'select', options: ['400', '500', '600', '700', '800'] },
  { key: 'titleColor', label: 'Title Colour', type: 'color' },
  { key: 'subtitle', label: 'Subtitle', type: 'text', placeholder: 'Short supporting line' },
  { key: 'subtitleColor', label: 'Subtitle Colour', type: 'color' },

  { key: '_h_cta', label: 'CTA Buttons', type: 'header' },
  { key: 'showCta1', label: 'Show Button 1', type: 'toggle' },
  { key: 'cta1Label', label: 'Button 1 Label', type: 'text', placeholder: 'e.g. Demo' },
  { key: 'cta1Href', label: 'Button 1 URL', type: 'url', placeholder: '/demo' },
  { key: 'cta1Style', label: 'Button 1 Style', type: 'select', options: ['outline', 'filled'] },
  { key: 'cta1TextColor', label: 'Button 1 Text', type: 'color' },
  { key: 'cta1BgColor', label: 'Button 1 Background', type: 'color' },
  { key: 'cta1BorderColor', label: 'Button 1 Border', type: 'color' },
  { key: 'showCta2', label: 'Show Button 2', type: 'toggle' },
  { key: 'cta2Label', label: 'Button 2 Label', type: 'text', placeholder: 'e.g. Get Started' },
  { key: 'cta2Href', label: 'Button 2 URL', type: 'url', placeholder: '/signup' },
  { key: 'cta2Style', label: 'Button 2 Style', type: 'select', options: ['outline', 'filled'] },
  { key: 'cta2TextColor', label: 'Button 2 Text', type: 'color' },
  { key: 'cta2BgColor', label: 'Button 2 Background', type: 'color' },
  { key: 'cta2BorderColor', label: 'Button 2 Border', type: 'color' },
  { key: 'ctaBorderRadius', label: 'Button Radius (px)', type: 'number', placeholder: '20' },

  { key: '_h_stats', label: 'Stat Values', type: 'header' },
  { key: 'valueFontSize', label: 'Value Size (px)', type: 'number', placeholder: '40' },
  { key: 'valueFontWeight', label: 'Value Weight', type: 'select', options: ['400', '500', '600', '700', '800', '900'] },
  { key: 'valueColor', label: 'Value Colour', type: 'color' },
  { key: 'labelFontSize', label: 'Label Size (px)', type: 'number', placeholder: '13' },
  { key: 'labelFontWeight', label: 'Label Weight', type: 'select', options: ['400', '500', '600', '700'] },
  { key: 'labelColor', label: 'Label Colour', type: 'color' },
  { key: 'descriptionFontSize', label: 'Description Size (px)', type: 'number', placeholder: '13' },
  { key: 'descriptionColor', label: 'Description Colour', type: 'color' },
  { key: 'showDividers', label: 'Show Dividers', type: 'toggle' },
  { key: 'dividerColor', label: 'Divider Colour', type: 'color' },

  {
    key: 'items',
    label: 'Stat Items',
    type: 'list',
    listFields: [
      { key: 'value', label: 'Value', type: 'text', placeholder: 'e.g. 420%' },
      { key: 'label', label: 'Label', type: 'text', placeholder: 'e.g. More Speed' },
      { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Short supporting line' },
    ],
  },
]

export function renderRu2Stats(data: Ru2StatsData): string {
  const colMap: Record<string, string> = {
    '2-columns': 'repeat(2, 1fr)',
    '3-columns': 'repeat(3, 1fr)',
    '4-columns': 'repeat(4, 1fr)',
  }
  const gridCols = colMap[data.layout ?? '4-columns'] ?? 'repeat(4, 1fr)'
  const cardBorder = data.showBorder ? `border:1px solid ${data.cardBorderColor};` : ''

  const cta1Html = data.showCta1
    ? `<a href="${data.cta1Href}" style="display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:${data.ctaBorderRadius}px;font-size:14px;font-weight:500;text-decoration:none;background:${data.cta1Style === 'filled' ? data.cta1BgColor : (data.cta1BgColor || 'transparent')};color:${data.cta1TextColor};border:1.5px solid ${data.cta1BorderColor};">▷ ${data.cta1Label}</a>`
    : ''

  const cta2Html = data.showCta2
    ? `<a href="${data.cta2Href}" style="display:inline-block;padding:8px 20px;border-radius:${data.ctaBorderRadius}px;font-size:14px;font-weight:500;text-decoration:none;background:${data.cta2BgColor};color:${data.cta2TextColor};border:1.5px solid ${data.cta2BorderColor};">${data.cta2Label}</a>`
    : ''

  const statsHtml = (data.items ?? []).map((item, i) => {
    const divider = data.showDividers && i > 0
      ? `border-left:1px solid ${data.dividerColor};`
      : ''
    const descHtml = item.description
      ? `<p style="margin:6px 0 0;font-size:${data.descriptionFontSize}px;color:${data.descriptionColor};line-height:1.5;">${item.description}</p>`
      : ''
    return `<div style="${divider}padding:0 24px;">
      <div style="font-size:${data.valueFontSize}px;font-weight:${data.valueFontWeight};color:${data.valueColor};line-height:1.1;margin-bottom:4px;">${item.value}</div>
      <div style="font-size:${data.labelFontSize}px;font-weight:${data.labelFontWeight};color:${data.labelColor};margin-bottom:2px;">${item.label}</div>
      ${descHtml}
    </div>`
  }).join('')

  return `<section data-component-title="Ru2-Stats" style="background:${data.bgColor};padding:${data.paddingY}px ${data.paddingX}px;">
  <div style="max-width:1280px;margin:0 auto;">
    <div style="background:${data.cardBgColor};${cardBorder}border-radius:${data.cardBorderRadius}px;padding:32px;">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:28px;gap:16px;flex-wrap:wrap;">
        <div>
          <h3 style="margin:0 0 6px;font-size:${data.titleFontSize}px;font-weight:${data.titleFontWeight};color:${data.titleColor};line-height:1.3;">${data.title}</h3>
          ${data.subtitle ? `<p style="margin:0;font-size:14px;color:${data.subtitleColor};">${data.subtitle}</p>` : ''}
        </div>
        ${(cta1Html || cta2Html) ? `<div style="display:flex;align-items:center;gap:8px;flex-shrink:0;">${cta1Html}${cta2Html}</div>` : ''}
      </div>
      <div style="display:grid;grid-template-columns:${gridCols};gap:0;">
        ${statsHtml}
      </div>
    </div>
  </div>
</section>`
}

// ─── Ru3-Stats ───────────────────────────────────────────────────────────────

export const ru3StatsSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 277.5 60">
  <rect fill="#1f2937" width="277.5" height="60"/>
  <rect fill="#374151" x="8" y="8" width="261.5" height="44" rx="6"/>
  <circle fill="#4b5563" cx="38" cy="30" r="10"/>
  <rect fill="#9ca3af" x="35" y="26" width="6" height="8" rx="1"/>
  <rect fill="#9ca3af" x="54" y="24" width="30" height="4" rx="1"/>
  <rect fill="#6b7280" x="54" y="31" width="40" height="3" rx="1"/>
  <rect fill="#6b7280" x="54" y="37" width="35" height="3" rx="1"/>
  <rect fill="#4b5563" x="108" y="28" width="6" height="6" rx="1" transform="rotate(45 111 31)"/>
  <circle fill="#4b5563" cx="131" cy="30" r="10"/>
  <rect fill="#9ca3af" x="128" y="26" width="6" height="8" rx="1"/>
  <rect fill="#9ca3af" x="147" y="24" width="30" height="4" rx="1"/>
  <rect fill="#6b7280" x="147" y="31" width="40" height="3" rx="1"/>
  <rect fill="#6b7280" x="147" y="37" width="35" height="3" rx="1"/>
  <rect fill="#4b5563" x="201" y="28" width="6" height="6" rx="1" transform="rotate(45 204 31)"/>
  <circle fill="#4b5563" cx="224" cy="30" r="10"/>
  <rect fill="#9ca3af" x="221" y="26" width="6" height="8" rx="1"/>
  <rect fill="#9ca3af" x="240" y="24" width="22" height="4" rx="1"/>
  <rect fill="#6b7280" x="240" y="31" width="28" height="3" rx="1"/>
  <rect fill="#6b7280" x="240" y="37" width="24" height="3" rx="1"/>
</svg>`

export interface Ru3StepItem {
  badgeType: string
  badgeText: string
  iconUrl: string
  title: string
  description: string
}

export interface Ru3StatsData {
  bgColor: string
  cardBgColor: string
  cardBorderRadius: number
  cardBorderColor: string
  showBorder: boolean
  paddingY: number
  paddingX: number
  showSectionTitle: boolean
  sectionTitle: string
  sectionTitleSize: number
  sectionTitleWeight: string
  sectionTitleColor: string
  sectionSubtitle: string
  sectionSubtitleColor: string
  badgeBgColor: string
  badgeTextColor: string
  badgeSize: number
  showSeparator: boolean
  separatorColor: string
  titleFontSize: number
  titleFontWeight: string
  titleColor: string
  descriptionFontSize: number
  descriptionColor: string
  items: Ru3StepItem[]
}

export const ru3StatsDefaults: Ru3StatsData = {
  bgColor: '#f9fafb',
  cardBgColor: '#ffffff',
  cardBorderRadius: 16,
  cardBorderColor: '#e5e7eb',
  showBorder: false,
  paddingY: 32,
  paddingX: 24,
  showSectionTitle: false,
  sectionTitle: 'How it works',
  sectionTitleSize: 28,
  sectionTitleWeight: '700',
  sectionTitleColor: '#111827',
  sectionSubtitle: '',
  sectionSubtitleColor: '#6b7280',
  badgeBgColor: '#ede9fe',
  badgeTextColor: '#7c3aed',
  badgeSize: 52,
  showSeparator: true,
  separatorColor: '#d1d5db',
  titleFontSize: 16,
  titleFontWeight: '700',
  titleColor: '#111827',
  descriptionFontSize: 14,
  descriptionColor: '#6b7280',
  items: [
    { badgeType: 'number', badgeText: '1', iconUrl: '', title: 'Pick your gear', description: 'Explore the lineup and find pieces that fit your style.' },
    { badgeType: 'number', badgeText: '2', iconUrl: '', title: 'Redeem your $50', description: 'Your launch allotment is already loaded.' },
    { badgeType: 'number', badgeText: '3', iconUrl: '', title: 'Ship it home', description: 'Fast free shipping straight to your door.' },
  ],
}

export const ru3StatsFields: FieldConfig[] = [
  { key: '_h_layout', label: 'Layout', type: 'header' },
  { key: 'paddingY', label: 'Vertical Padding (px)', type: 'number', placeholder: '32' },
  { key: 'paddingX', label: 'Horizontal Padding (px)', type: 'number', placeholder: '24' },

  { key: '_h_section', label: 'Section', type: 'header' },
  { key: 'bgColor', label: 'Background Colour', type: 'color' },
  { key: 'showSectionTitle', label: 'Show Section Title', type: 'toggle' },
  { key: 'sectionTitle', label: 'Section Title', type: 'text', placeholder: 'e.g. How it works' },
  { key: 'sectionTitleSize', label: 'Title Size (px)', type: 'number', placeholder: '28' },
  { key: 'sectionTitleWeight', label: 'Title Weight', type: 'select', options: ['400', '500', '600', '700', '800'] },
  { key: 'sectionTitleColor', label: 'Title Colour', type: 'color' },
  { key: 'sectionSubtitle', label: 'Subtitle', type: 'text', placeholder: 'Optional supporting line' },
  { key: 'sectionSubtitleColor', label: 'Subtitle Colour', type: 'color' },

  { key: '_h_card', label: 'Card Style', type: 'header' },
  { key: 'cardBgColor', label: 'Card Background', type: 'color' },
  { key: 'cardBorderRadius', label: 'Card Radius (px)', type: 'number', placeholder: '16' },
  { key: 'showBorder', label: 'Show Border', type: 'toggle' },
  { key: 'cardBorderColor', label: 'Border Colour', type: 'color' },

  { key: '_h_badge', label: 'Badge', type: 'header' },
  { key: 'badgeBgColor', label: 'Badge Background', type: 'color' },
  { key: 'badgeTextColor', label: 'Badge Text / Icon Colour', type: 'color' },
  { key: 'badgeSize', label: 'Badge Size (px)', type: 'number', placeholder: '52' },

  { key: '_h_separator', label: 'Separator', type: 'header' },
  { key: 'showSeparator', label: 'Show Separator', type: 'toggle' },
  { key: 'separatorColor', label: 'Separator Colour', type: 'color' },

  { key: '_h_text', label: 'Text Style', type: 'header' },
  { key: 'titleFontSize', label: 'Title Size (px)', type: 'number', placeholder: '16' },
  { key: 'titleFontWeight', label: 'Title Weight', type: 'select', options: ['400', '500', '600', '700', '800'] },
  { key: 'titleColor', label: 'Title Colour', type: 'color' },
  { key: 'descriptionFontSize', label: 'Description Size (px)', type: 'number', placeholder: '14' },
  { key: 'descriptionColor', label: 'Description Colour', type: 'color' },

  {
    key: 'items',
    label: 'Steps',
    type: 'list',
    listFields: [
      { key: 'badgeType', label: 'Badge Type', type: 'select', options: ['number', 'icon'] },
      { key: 'badgeText', label: 'Badge Number/Text', type: 'text', placeholder: 'e.g. 1' },
      { key: 'iconUrl', label: 'Icon URL (if badge type is icon)', type: 'url', placeholder: 'https://example.com/icon.svg' },
      { key: 'title', label: 'Title', type: 'text', placeholder: 'e.g. Pick your gear' },
      { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Short supporting line' },
    ],
  },
]

export function renderRu3Stats(data: Ru3StatsData): string {
  const cardBorder = data.showBorder ? `border:1px solid ${data.cardBorderColor};` : ''
  const half = data.badgeSize / 2

  const sectionHeaderHtml = data.showSectionTitle
    ? `<div style="text-align:center;margin-bottom:24px;">
        <h2 style="margin:0 0 8px;font-size:${data.sectionTitleSize}px;font-weight:${data.sectionTitleWeight};color:${data.sectionTitleColor};line-height:1.3;">${data.sectionTitle}</h2>
        ${data.sectionSubtitle ? `<p style="margin:0;font-size:15px;color:${data.sectionSubtitleColor};">${data.sectionSubtitle}</p>` : ''}
      </div>`
    : ''

  const separatorHtml = data.showSeparator
    ? `<div style="flex-shrink:0;width:10px;height:10px;background:${data.separatorColor};transform:rotate(45deg);margin:0 16px;align-self:center;"></div>`
    : ''

  const itemsHtml = (data.items ?? []).map((item, i) => {
    const badgeInner = item.badgeType === 'icon' && item.iconUrl
      ? `<img src="${item.iconUrl}" style="width:${data.badgeSize * 0.5}px;height:${data.badgeSize * 0.5}px;object-fit:contain;" />`
      : `<span style="font-size:${data.badgeSize * 0.45}px;font-weight:700;color:${data.badgeTextColor};font-style:italic;">${item.badgeText}</span>`

    const stepHtml = `<div style="display:flex;align-items:flex-start;gap:16px;flex:1;min-width:0;">
      <div style="flex-shrink:0;width:${data.badgeSize}px;height:${data.badgeSize}px;border-radius:${half}px;background:${data.badgeBgColor};display:flex;align-items:center;justify-content:center;">
        ${badgeInner}
      </div>
      <div style="min-width:0;">
        <div style="font-size:${data.titleFontSize}px;font-weight:${data.titleFontWeight};color:${data.titleColor};margin-bottom:6px;line-height:1.3;">${item.title}</div>
        <div style="font-size:${data.descriptionFontSize}px;color:${data.descriptionColor};line-height:1.6;">${item.description}</div>
      </div>
    </div>`

    const sep = i < (data.items.length - 1) ? separatorHtml : ''
    return stepHtml + sep
  }).join('')

  return `<section data-component-title="Ru3-Stats" style="background:${data.bgColor};padding:${data.paddingY}px ${data.paddingX}px;">
  <div style="max-width:1280px;margin:0 auto;">
    ${sectionHeaderHtml}
    <div style="background:${data.cardBgColor};${cardBorder}border-radius:${data.cardBorderRadius}px;padding:32px 40px;display:flex;align-items:stretch;flex-wrap:wrap;gap:16px;">
      ${itemsHtml}
    </div>
  </div>
</section>`
}

// ─── Ru4-Stats ───────────────────────────────────────────────────────────────

export const ru4StatsSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 277.5 80">
  <rect fill="#1f2937" width="277.5" height="80"/>
  <rect fill="#9ca3af" x="60" y="8" width="157" height="8" rx="1"/>
  <rect fill="#6b7280" x="80" y="20" width="117" height="4" rx="1"/>
  <rect fill="#4b5563" x="8" y="36" width="20" height="18" rx="1"/>
  <rect fill="#6b7280" x="8" y="57" width="55" height="3" rx="1"/>
  <rect fill="#6b7280" x="8" y="63" width="50" height="3" rx="1"/>
  <rect fill="#6b7280" x="8" y="69" width="45" height="3" rx="1"/>
  <rect fill="#374151" x="100" y="36" width="35" height="10" rx="1"/>
  <rect fill="#6b7280" x="100" y="50" width="28" height="3" rx="1"/>
  <rect fill="#374151" x="160" y="36" width="35" height="10" rx="1"/>
  <rect fill="#6b7280" x="160" y="50" width="28" height="3" rx="1"/>
  <rect fill="#374151" x="100" y="60" width="35" height="10" rx="1"/>
  <rect fill="#6b7280" x="100" y="73" width="28" height="3" rx="1"/>
  <rect fill="#374151" x="160" y="60" width="35" height="10" rx="1"/>
  <rect fill="#6b7280" x="160" y="73" width="28" height="3" rx="1"/>
</svg>`

export interface Ru4StatItem {
  value: string
  label: string
}

export interface Ru4StatsData {
  bgColor: string
  paddingY: number
  paddingX: number
  showSectionTitle: boolean
  sectionTitle: string
  sectionTitleSize: number
  sectionTitleWeight: string
  sectionTitleColor: string
  sectionTitleFont: string
  sectionSubtitle: string
  sectionSubtitleColor: string
  sectionSubtitleSize: number
  sectionNumber: string
  sectionNumberSize: number
  sectionNumberColor: string
  sectionNumberFont: string
  sectionDescription: string
  sectionDescriptionColor: string
  sectionDescriptionSize: number
  dividerColor: string
  showDivider: boolean
  valueFontSize: number
  valueFontWeight: string
  valueColor: string
  valueFont: string
  labelFontSize: number
  labelColor: string
  gridGap: number
  items: Ru4StatItem[]
}

export const ru4StatsDefaults: Ru4StatsData = {
  bgColor: '#e8e4dc',
  paddingY: 64,
  paddingX: 48,
  showSectionTitle: true,
  sectionTitle: 'Our platform combines RNA-seq, proteomics, metabolomics.',
  sectionTitleSize: 40,
  sectionTitleWeight: '400',
  sectionTitleColor: '#2d2d2d',
  sectionTitleFont: 'Georgia, serif',
  sectionSubtitle: '',
  sectionSubtitleColor: '#6b7280',
  sectionSubtitleSize: 16,
  sectionNumber: '02',
  sectionNumberSize: 80,
  sectionNumberColor: '#2d2d2d',
  sectionNumberFont: 'Georgia, serif',
  sectionDescription: 'Non-coding RNA panels: MicroRNAs, lncRNAs, and circRNAs as novel biomarkers for early-stage cancer detection.',
  sectionDescriptionColor: '#6b6b5a',
  sectionDescriptionSize: 14,
  dividerColor: '#c5c0b5',
  showDivider: true,
  valueFontSize: 48,
  valueFontWeight: '400',
  valueColor: '#2d2d2d',
  valueFont: 'Georgia, serif',
  labelFontSize: 13,
  labelColor: '#6b6b5a',
  gridGap: 32,
  items: [
    { value: '23k+', label: 'Total Ligands' },
    { value: '100M+', label: 'TWAS Sequence' },
    { value: '33x', label: 'Splicing LLMs' },
    { value: '11B', label: 'RNA panels' },
  ],
}

export const ru4StatsFields: FieldConfig[] = [
  { key: '_h_layout', label: 'Layout', type: 'header' },
  { key: 'paddingY', label: 'Vertical Padding (px)', type: 'number', placeholder: '64' },
  { key: 'paddingX', label: 'Horizontal Padding (px)', type: 'number', placeholder: '48' },
  { key: 'gridGap', label: 'Grid Gap (px)', type: 'number', placeholder: '32' },

  { key: '_h_section', label: 'Section', type: 'header' },
  { key: 'bgColor', label: 'Background Colour', type: 'color' },
  { key: 'showDivider', label: 'Show Divider', type: 'toggle' },
  { key: 'dividerColor', label: 'Divider Colour', type: 'color' },

  { key: '_h_title', label: 'Section Title', type: 'header' },
  { key: 'showSectionTitle', label: 'Show Title', type: 'toggle' },
  { key: 'sectionTitle', label: 'Title', type: 'textarea', placeholder: 'e.g. Our platform combines...' },
  { key: 'sectionTitleSize', label: 'Title Size (px)', type: 'number', placeholder: '40' },
  { key: 'sectionTitleWeight', label: 'Title Weight', type: 'select', options: ['300', '400', '500', '600', '700'] },
  { key: 'sectionTitleColor', label: 'Title Colour', type: 'color' },
  { key: 'sectionTitleFont', label: 'Title Font', type: 'text', placeholder: 'e.g. Georgia, serif' },
  { key: 'sectionSubtitle', label: 'Subtitle', type: 'text', placeholder: 'Optional subtitle' },
  { key: 'sectionSubtitleSize', label: 'Subtitle Size (px)', type: 'number', placeholder: '16' },
  { key: 'sectionSubtitleColor', label: 'Subtitle Colour', type: 'color' },

  { key: '_h_number', label: 'Section Number / Label', type: 'header' },
  { key: 'sectionNumber', label: 'Number / Label', type: 'text', placeholder: 'e.g. 02' },
  { key: 'sectionNumberSize', label: 'Number Size (px)', type: 'number', placeholder: '80' },
  { key: 'sectionNumberColor', label: 'Number Colour', type: 'color' },
  { key: 'sectionNumberFont', label: 'Number Font', type: 'text', placeholder: 'e.g. Georgia, serif' },
  { key: 'sectionDescription', label: 'Description', type: 'textarea', placeholder: 'Supporting description text' },
  { key: 'sectionDescriptionSize', label: 'Description Size (px)', type: 'number', placeholder: '14' },
  { key: 'sectionDescriptionColor', label: 'Description Colour', type: 'color' },

  { key: '_h_stats', label: 'Stat Values', type: 'header' },
  { key: 'valueFontSize', label: 'Value Size (px)', type: 'number', placeholder: '48' },
  { key: 'valueFontWeight', label: 'Value Weight', type: 'select', options: ['300', '400', '500', '600', '700'] },
  { key: 'valueColor', label: 'Value Colour', type: 'color' },
  { key: 'valueFont', label: 'Value Font', type: 'text', placeholder: 'e.g. Georgia, serif' },
  { key: 'labelFontSize', label: 'Label Size (px)', type: 'number', placeholder: '13' },
  { key: 'labelColor', label: 'Label Colour', type: 'color' },

  {
    key: 'items',
    label: 'Stat Items',
    type: 'list',
    listFields: [
      { key: 'value', label: 'Value', type: 'text', placeholder: 'e.g. 23k+' },
      { key: 'label', label: 'Label', type: 'text', placeholder: 'e.g. Total Ligands' },
    ],
  },
]

export function renderRu4Stats(data: Ru4StatsData): string {
  const dividerHtml = data.showDivider
    ? `<div style="width:100%;height:1px;background:${data.dividerColor};margin-bottom:${data.gridGap}px;"></div>`
    : ''

  const titleHtml = data.showSectionTitle
    ? `<div style="text-align:center;margin-bottom:${data.gridGap}px;max-width:700px;margin-left:auto;margin-right:auto;">
        <h2 style="margin:0 0 12px;font-size:${data.sectionTitleSize}px;font-weight:${data.sectionTitleWeight};color:${data.sectionTitleColor};font-family:${data.sectionTitleFont};line-height:1.25;">${data.sectionTitle}</h2>
        ${data.sectionSubtitle ? `<p style="margin:0;font-size:${data.sectionSubtitleSize}px;color:${data.sectionSubtitleColor};">${data.sectionSubtitle}</p>` : ''}
      </div>`
    : ''

  const statsGrid = (data.items ?? []).map(item => `
    <div>
      <div style="font-size:${data.valueFontSize}px;font-weight:${data.valueFontWeight};color:${data.valueColor};font-family:${data.valueFont};line-height:1.1;margin-bottom:6px;">${item.value}</div>
      <div style="font-size:${data.labelFontSize}px;color:${data.labelColor};line-height:1.4;">${item.label}</div>
    </div>`
  ).join('')

  return `<section data-component-title="Ru4-Stats" style="background:${data.bgColor};padding:${data.paddingY}px ${data.paddingX}px;">
  <div style="max-width:1280px;margin:0 auto;">
    ${titleHtml}
    ${dividerHtml}
    <div style="display:grid;grid-template-columns:1fr 2fr;gap:${data.gridGap}px;align-items:start;">
      <div>
        <div style="font-size:${data.sectionNumberSize}px;font-weight:${data.sectionTitleWeight};color:${data.sectionNumberColor};font-family:${data.sectionNumberFont};line-height:1;margin-bottom:16px;">${data.sectionNumber}</div>
        <p style="margin:0;font-size:${data.sectionDescriptionSize}px;color:${data.sectionDescriptionColor};line-height:1.7;max-width:280px;">${data.sectionDescription}</p>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:${data.gridGap}px;">
        ${statsGrid}
      </div>
    </div>
  </div>
</section>`
}

// ─── Ru5-Image-Carousel ──────────────────────────────────────────────────────

export const ru5ImageCarouselSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 277.5 80">
  <rect fill="#1f2937" width="277.5" height="80"/>
  <rect fill="#374151" x="0" y="0" width="277.5" height="80"/>
  <rect fill="#4b5563" x="20" y="28" width="80" height="8" rx="1"/>
  <rect fill="#6b7280" x="20" y="40" width="55" height="4" rx="1"/>
  <rect fill="#6b7280" x="20" y="47" width="45" height="4" rx="1"/>
  <rect fill="#9ca3af" x="20" y="58" width="28" height="8" rx="3"/>
  <circle fill="#ffffff" cx="126" cy="74" r="3"/>
  <circle fill="#6b7280" cx="136" cy="74" r="2"/>
  <circle fill="#6b7280" cx="144" cy="74" r="2"/>
  <rect fill="rgba(255,255,255,0.2)" x="4" y="34" width="12" height="12" rx="6"/>
  <rect fill="rgba(255,255,255,0.2)" x="261" y="34" width="12" height="12" rx="6"/>
  <text x="8" y="44" font-size="8" fill="white">‹</text>
  <text x="264" y="44" font-size="8" fill="white">›</text>
</svg>`

export interface Ru5CarouselSlide {
  bgImage: string
  overlayColor: string
  overlayOpacity: number
  title: string
  subtitle: string
  description: string
  showCta: boolean
  ctaLabel: string
  ctaHref: string
  ctaBgColor: string
  ctaTextColor: string
}

export interface Ru5ImageCarouselData {
  height: number
  autoPlay: boolean
  autoPlayInterval: number
  showArrows: boolean
  arrowBgColor: string
  arrowColor: string
  showDots: boolean
  dotColor: string
  dotActiveColor: string
  titleFontSize: number
  titleFontWeight: string
  titleColor: string
  subtitleFontSize: number
  subtitleColor: string
  descriptionFontSize: number
  descriptionColor: string
  ctaBorderRadius: number
  textAlign: string
  textPosition: string
  slides: Ru5CarouselSlide[]
}

export const ru5ImageCarouselDefaults: Ru5ImageCarouselData = {
  height: 560,
  autoPlay: true,
  autoPlayInterval: 4,
  showArrows: true,
  arrowBgColor: 'rgba(255,255,255,0.2)',
  arrowColor: '#ffffff',
  showDots: true,
  dotColor: 'rgba(255,255,255,0.5)',
  dotActiveColor: '#ffffff',
  titleFontSize: 48,
  titleFontWeight: '700',
  titleColor: '#ffffff',
  subtitleFontSize: 14,
  subtitleColor: 'rgba(255,255,255,0.8)',
  descriptionFontSize: 16,
  descriptionColor: 'rgba(255,255,255,0.85)',
  ctaBorderRadius: 6,
  textAlign: 'left',
  textPosition: 'center-left',
  slides: [
    {
      bgImage: '',
      overlayColor: '#000000',
      overlayOpacity: 40,
      title: 'Gear Up, Power Onward',
      subtitle: 'NEW COLLECTION',
      description: 'You put in the work — we make it easy to suit up right.',
      showCta: true,
      ctaLabel: 'Shop Now',
      ctaHref: '/shop',
      ctaBgColor: '#ffffff',
      ctaTextColor: '#111827',
    },
    {
      bgImage: '',
      overlayColor: '#000000',
      overlayOpacity: 40,
      title: 'Built For Every Moment',
      subtitle: 'FEATURED GEAR',
      description: 'From the shop to the field to the weekend.',
      showCta: true,
      ctaLabel: 'Explore',
      ctaHref: '/shop',
      ctaBgColor: '#ffffff',
      ctaTextColor: '#111827',
    },
    {
      bgImage: '',
      overlayColor: '#000000',
      overlayOpacity: 40,
      title: 'Your Store. Your Choice.',
      subtitle: 'EXCLUSIVE DEALS',
      description: 'Discover pieces that fit your style and your work.',
      showCta: true,
      ctaLabel: 'Get Started',
      ctaHref: '/shop',
      ctaBgColor: '#ffffff',
      ctaTextColor: '#111827',
    },
  ],
}

export const ru5ImageCarouselFields: FieldConfig[] = [
  { key: '_h_layout', label: 'Layout', type: 'header' },
  { key: 'height', label: 'Slider Height (px)', type: 'number', placeholder: '560' },
  { key: 'textAlign', label: 'Text Alignment', type: 'select', options: ['left', 'center', 'right'] },
  { key: 'textPosition', label: 'Text Position', type: 'select', options: ['center-left', 'center', 'center-right', 'bottom-left', 'bottom-center'] },

  { key: '_h_autoplay', label: 'Autoplay', type: 'header' },
  { key: 'autoPlay', label: 'Auto Play', type: 'toggle' },
  { key: 'autoPlayInterval', label: 'Interval (seconds)', type: 'number', placeholder: '4' },

  { key: '_h_arrows', label: 'Arrows', type: 'header' },
  { key: 'showArrows', label: 'Show Arrows', type: 'toggle' },
  { key: 'arrowBgColor', label: 'Arrow Background', type: 'color' },
  { key: 'arrowColor', label: 'Arrow Icon Colour', type: 'color' },

  { key: '_h_dots', label: 'Dots', type: 'header' },
  { key: 'showDots', label: 'Show Dots', type: 'toggle' },
  { key: 'dotColor', label: 'Dot Colour', type: 'color' },
  { key: 'dotActiveColor', label: 'Active Dot Colour', type: 'color' },

  { key: '_h_typography', label: 'Typography', type: 'header' },
  { key: 'titleFontSize', label: 'Title Size (px)', type: 'number', placeholder: '48' },
  { key: 'titleFontWeight', label: 'Title Weight', type: 'select', options: ['400', '500', '600', '700', '800', '900'] },
  { key: 'titleColor', label: 'Title Colour', type: 'color' },
  { key: 'subtitleFontSize', label: 'Subtitle Size (px)', type: 'number', placeholder: '14' },
  { key: 'subtitleColor', label: 'Subtitle Colour', type: 'color' },
  { key: 'descriptionFontSize', label: 'Description Size (px)', type: 'number', placeholder: '16' },
  { key: 'descriptionColor', label: 'Description Colour', type: 'color' },
  { key: 'ctaBorderRadius', label: 'CTA Button Radius (px)', type: 'number', placeholder: '6' },

  {
    key: 'slides',
    label: 'Slides',
    type: 'list',
    listFields: [
      { key: 'bgImage', label: 'Background Image', type: 'image', noAspectRatio: true },
      { key: 'overlayColor', label: 'Overlay Colour', type: 'color' },
      { key: 'overlayOpacity', label: 'Overlay Opacity (0-100)', type: 'number', placeholder: '40' },
      { key: 'title', label: 'Title', type: 'text', placeholder: 'e.g. Gear Up, Power Onward' },
      { key: 'subtitle', label: 'Subtitle', type: 'text', placeholder: 'e.g. NEW COLLECTION' },
      { key: 'description', label: 'Description', type: 'text', placeholder: 'Short supporting line' },
      { key: 'showCta', label: 'Show CTA Button', type: 'toggle' },
      { key: 'ctaLabel', label: 'CTA Label', type: 'text', placeholder: 'e.g. Shop Now' },
      { key: 'ctaHref', label: 'CTA URL', type: 'url', placeholder: '/shop' },
      { key: 'ctaBgColor', label: 'CTA Background', type: 'color' },
      { key: 'ctaTextColor', label: 'CTA Text Colour', type: 'color' },
    ],
  },
]

export function renderRu5ImageCarousel(data: Ru5ImageCarouselData): string {
  const uid = 'rbx-slider-' + Math.random().toString(36).slice(2, 7)

  const positionMap: Record<string, string> = {
    'center-left':   'align-items:center;justify-content:flex-start;',
    'center':        'align-items:center;justify-content:center;',
    'center-right':  'align-items:center;justify-content:flex-end;',
    'bottom-left':   'align-items:flex-end;justify-content:flex-start;',
    'bottom-center': 'align-items:flex-end;justify-content:center;',
  }
  const posStyle = positionMap[data.textPosition ?? 'center-left'] ?? positionMap['center-left']

  const slidesHtml = (data.slides ?? []).map((slide, i) => {
    const overlayOpacity = Math.min(100, Math.max(0, slide.overlayOpacity ?? 40)) / 100
    const bgStyle = slide.bgImage
      ? `background-image:url('${slide.bgImage}');background-size:cover;background-position:center;background-repeat:no-repeat;`
      : `background-color:#1f2937;`
    const overlayStyle = `position:absolute;inset:0;background:${slide.overlayColor ?? '#000'};opacity:${overlayOpacity};pointer-events:none;`
    const ctaHtml = slide.showCta !== false
      ? `<a href="${slide.ctaHref}" style="display:inline-block;margin-top:1.5rem;padding:0.75rem 2rem;background:${slide.ctaBgColor};color:${slide.ctaTextColor};text-decoration:none;border-radius:${data.ctaBorderRadius}px;font-size:1rem;font-weight:600;">${slide.ctaLabel}</a>`
      : ''
    return `<div data-slide="${i}" style="position:absolute;inset:0;${bgStyle}opacity:${i === 0 ? '1' : '0'};transition:opacity 0.6s ease;pointer-events:${i === 0 ? 'auto' : 'none'};">
      <div style="${overlayStyle}"></div>
      <div style="position:relative;z-index:1;height:100%;display:flex;${posStyle}padding:3rem 5rem;">
        <div style="max-width:600px;text-align:${data.textAlign ?? 'left'};">
          ${slide.subtitle ? `<p style="margin:0 0 0.75rem;font-size:${data.subtitleFontSize}px;font-weight:600;color:${data.subtitleColor};letter-spacing:0.12em;text-transform:uppercase;">${slide.subtitle}</p>` : ''}
          <h2 style="margin:0 0 1rem;font-size:${data.titleFontSize}px;font-weight:${data.titleFontWeight};color:${data.titleColor};line-height:1.15;">${slide.title}</h2>
          ${slide.description ? `<p style="margin:0;font-size:${data.descriptionFontSize}px;color:${data.descriptionColor};line-height:1.6;">${slide.description}</p>` : ''}
          ${ctaHtml}
        </div>
      </div>
    </div>`
  }).join('')

  const arrowsHtml = data.showArrows !== false ? `
    <button data-prev="true" style="position:absolute;left:16px;top:50%;transform:translateY(-50%);z-index:10;width:44px;height:44px;border-radius:50%;background:${data.arrowBgColor};border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;color:${data.arrowColor};font-size:22px;backdrop-filter:blur(4px);">&#8249;</button>
    <button data-next="true" style="position:absolute;right:16px;top:50%;transform:translateY(-50%);z-index:10;width:44px;height:44px;border-radius:50%;background:${data.arrowBgColor};border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;color:${data.arrowColor};font-size:22px;backdrop-filter:blur(4px);">&#8250;</button>` : ''

  const dotsHtml = data.showDots !== false ? `
    <div class="${uid}-dots" style="position:absolute;bottom:20px;left:50%;transform:translateX(-50%);z-index:10;display:flex;gap:8px;align-items:center;">
      ${(data.slides ?? []).map((_, i) => `<button data-dot="${i}" data-active-color="${data.dotActiveColor}" data-inactive-color="${data.dotColor}" style="width:${i === 0 ? '24px' : '8px'};height:8px;border-radius:4px;background:${i === 0 ? data.dotActiveColor : data.dotColor};border:none;cursor:pointer;padding:0;transition:all 0.3s;"></button>`).join('')}
    </div>` : ''

  return `<section data-component-title="Ru5-Image-Carousel" style="position:relative;overflow:hidden;">
  <div data-rubikx-component="HeroSlider" data-on-mount="loadSlider" data-autoplay="${data.autoPlay !== false ? 'true' : 'false'}" data-interval="${(data.autoPlayInterval ?? 4) * 1000}" style="position:relative;height:${data.height}px;overflow:hidden;">
    ${slidesHtml}
    ${arrowsHtml}
    ${dotsHtml}
  </div>
</section>`
}

// ─── Ru3-Text + Image Hero ───────────────────────────────────────────────────

export const ru3TextImageHeroSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 277.5 80">
  <rect fill="#1f2937" width="277.5" height="80"/>
  <rect fill="#374151" x="148" y="8" width="118" height="64" rx="4"/>
  <rect fill="#4b5563" x="163" y="22" width="88" height="36" rx="2"/>
  <circle fill="#6b7280" cx="184" cy="36" r="5"/>
  <rect fill="#6b7280" x="12" y="10" width="38" height="3" rx="1.5"/>
  <rect fill="#9ca3af" x="12" y="17" width="112" height="8" rx="1.5"/>
  <rect fill="#9ca3af" x="12" y="29" width="90" height="8" rx="1.5"/>
  <rect fill="#6b7280" x="12" y="42" width="108" height="3" rx="1"/>
  <rect fill="#6b7280" x="12" y="48" width="92" height="3" rx="1"/>
  <rect fill="#4b5563" x="12" y="58" width="52" height="14" rx="5"/>
</svg>`

export interface Ru3TextImageHeroData {
  bgColor: string
  bgOpacity: number
  heading: string
  subheading: string
  description: string
  ctaText: string
  ctaUrl: string
  imageUrl: string
  imageAlt: string
  imageFit: string
  imageBorderRadius: number
  overlayColor: string
  overlayOpacity: number
  splitRatio: string
  imageSide: string
  sectionHeight: string
  contentAlign: string
  verticalAlign: string
  columnGap: number
  paddingY: number
  paddingX: number
  headingColor: string
  headingSize: number
  headingWeight: string
  subheadingColor: string
  subheadingSize: number
  descriptionColor: string
  descriptionSize: number
  ctaBgColor: string
  ctaTextColor: string
  ctaBorderRadius: number
  ctaBorderWidth: number
  ctaBorderColor: string
  ctaStyle: string
}

export const ru3TextImageHeroDefaults: Ru3TextImageHeroData = {
  bgColor: '#ffffff',
  bgOpacity: 100,
  heading: 'Welcome to your Locker',
  subheading: 'Fresh Omni gear, picked for the team.',
  description: 'Show off the new brand with a $50 launch allotment toward something you will actually wear, use, and keep.',
  ctaText: 'Shop the lineup →',
  ctaUrl: '/shop',
  imageUrl: '',
  imageAlt: 'Hero image',
  imageFit: 'cover',
  imageBorderRadius: 8,
  overlayColor: '#000000',
  overlayOpacity: 0,
  splitRatio: '50/50',
  imageSide: 'right',
  sectionHeight: 'Auto',
  contentAlign: 'left',
  verticalAlign: 'center',
  columnGap: 48,
  paddingY: 64,
  paddingX: 48,
  headingColor: '#0f172a',
  headingSize: 48,
  headingWeight: 'Bold',
  subheadingColor: '#0f172a',
  subheadingSize: 22,
  descriptionColor: '#475569',
  descriptionSize: 16,
  ctaBgColor: '#a855f7',
  ctaTextColor: '#ffffff',
  ctaBorderRadius: 50,
  ctaBorderWidth: 2,
  ctaBorderColor: '#a855f7',
  ctaStyle: 'filled',
}

export const ru3TextImageHeroFields: FieldConfig[] = [
  { key: '_h_section_bg', label: 'Background', type: 'header' },
  { key: 'bgColor',   label: 'Background Color',   type: 'color' },
  { key: 'bgOpacity', label: 'Background Opacity', type: 'number', unit: '%', step: 5, placeholder: '100' },
  { key: '_h_content',  label: 'Content',  type: 'header' },
  { key: 'heading',     label: 'Heading',  type: 'text', placeholder: 'e.g. Welcome to your Locker' },
  { key: 'subheading',  label: 'Subheading', type: 'text', placeholder: 'e.g. Fresh gear, picked for the team.' },
  { key: 'description', label: 'Description', type: 'text', placeholder: 'Short body copy…' },
  { key: '_h_cta', label: 'CTA Button', type: 'header' },
  { key: 'ctaText',  label: 'Button Text',  type: 'text', placeholder: 'e.g. Shop Now' },
  { key: 'ctaUrl',   label: 'Button URL',   type: 'url',  placeholder: '/shop' },
  { key: 'ctaStyle', label: 'Button Style', type: 'select', options: ['filled', 'outline', 'ghost'] },
  { key: 'ctaBgColor',      label: 'Button Background', type: 'color' },
  { key: 'ctaTextColor',    label: 'Button Text Color', type: 'color' },
  { key: 'ctaBorderRadius', label: 'Button Radius',     type: 'number', unit: 'px', step: 2, placeholder: '50' },
  { key: 'ctaBorderWidth',  label: 'Border Width',      type: 'number', unit: 'px', step: 1, placeholder: '2' },
  { key: 'ctaBorderColor',  label: 'Border Color',      type: 'color' },
  { key: '_h_image', label: 'Image', type: 'header' },
  { key: 'imageUrl',          label: 'Hero Image',   type: 'image', noAspectRatio: true },
  { key: 'imageAlt',          label: 'Alt Text',     type: 'text', placeholder: 'Hero image' },
  { key: 'imageFit',          label: 'Image Fit',    type: 'select', options: ['cover', 'contain', 'fill'] },
  { key: 'imageBorderRadius', label: 'Corner Radius', type: 'number', unit: 'px', step: 4, placeholder: '8' },
  { key: '_h_overlay', label: 'Image Overlay', type: 'header' },
  { key: 'overlayColor',   label: 'Overlay Color',   type: 'color' },
  { key: 'overlayOpacity', label: 'Overlay Opacity', type: 'number', unit: '%', step: 5, placeholder: '0' },
  { key: '_h_layout', label: 'Layout', type: 'header' },
  { key: 'splitRatio',    label: 'Column Ratio',    type: 'select', options: ['50/50', '40/60', '30/70', '60/40', '70/30'] },
  { key: 'imageSide',     label: 'Image Position',  type: 'select', options: ['right', 'left'] },
  { key: 'sectionHeight', label: 'Section Height',  type: 'select', options: ['Auto', 'Small (300px)', 'Medium (500px)', 'Large (700px)'] },
  { key: 'contentAlign',  label: 'Text Alignment',  type: 'select', options: ['left', 'center', 'right'] },
  { key: 'verticalAlign', label: 'Vertical Align',  type: 'select', options: ['center', 'top', 'bottom'] },
  { key: 'columnGap',     label: 'Column Gap',      type: 'number', unit: 'px', step: 8, placeholder: '48' },
  { key: '_h_spacing', label: 'Spacing', type: 'header' },
  { key: 'paddingY', label: 'Vertical Padding',   type: 'number', unit: 'px', step: 8, placeholder: '64' },
  { key: 'paddingX', label: 'Horizontal Padding', type: 'number', unit: 'px', step: 8, placeholder: '48' },
  { key: '_h_typography', label: 'Typography', type: 'header' },
  { key: 'headingColor',    label: 'Heading Color',    type: 'color' },
  { key: 'headingSize',     label: 'Heading Size',     type: 'number', unit: 'px', step: 2, placeholder: '48' },
  { key: 'headingWeight',   label: 'Heading Weight',   type: 'select', options: ['Normal', 'Medium', 'Semibold', 'Bold', 'Extrabold'] },
  { key: 'subheadingColor', label: 'Subheading Color', type: 'color' },
  { key: 'subheadingSize',  label: 'Subheading Size',  type: 'number', unit: 'px', step: 1, placeholder: '22' },
  { key: 'descriptionColor', label: 'Description Color', type: 'color' },
  { key: 'descriptionSize',  label: 'Description Size',  type: 'number', unit: 'px', step: 1, placeholder: '16' },
]

export function renderRu3TextImageHero(data: Ru3TextImageHeroData): string {
  const imgSrc = productImageSrc(data.imageUrl)
  const overlayOpacity = Math.min(100, Math.max(0, data.overlayOpacity ?? 0)) / 100

  const splitMap: Record<string, [string, string]> = {
    '50/50': ['1fr', '1fr'],
    '40/60': ['4fr', '6fr'],
    '30/70': ['3fr', '7fr'],
    '60/40': ['6fr', '4fr'],
    '70/30': ['7fr', '3fr'],
  }
  const [textFr, imageFr] = splitMap[data.splitRatio ?? '50/50'] ?? ['1fr', '1fr']
  const gridCols = data.imageSide === 'left'
    ? `${imageFr} ${textFr}`
    : `${textFr} ${imageFr}`

  const heightMap: Record<string, string> = {
    'Auto':            '',
    'Small (300px)':   'min-height:300px;',
    'Medium (500px)':  'min-height:500px;',
    'Large (700px)':   'min-height:700px;',
  }
  const heightStyle = heightMap[data.sectionHeight ?? 'Auto'] ?? ''

  const vertAlignMap: Record<string, string> = { center: 'center', top: 'start', bottom: 'end' }
  const vertAlign = vertAlignMap[data.verticalAlign ?? 'center'] ?? 'center'

  const flexAlignMap: Record<string, string> = { left: 'flex-start', center: 'center', right: 'flex-end' }
  const contentAlignFlex = flexAlignMap[data.contentAlign ?? 'left'] ?? 'flex-start'

  const weightMap: Record<string, string> = { Normal: '400', Medium: '500', Semibold: '600', Bold: '700', Extrabold: '800' }
  const fontWeight = weightMap[data.headingWeight ?? 'Bold'] ?? '700'

  let ctaBtnStyle: string
  if (data.ctaStyle === 'outline') {
    ctaBtnStyle = `background:transparent;color:${data.ctaBgColor};border:${data.ctaBorderWidth ?? 2}px solid ${data.ctaBorderColor ?? data.ctaBgColor};`
  } else if (data.ctaStyle === 'ghost') {
    ctaBtnStyle = `background:transparent;color:${data.ctaTextColor};border:none;`
  } else {
    ctaBtnStyle = `background:${data.ctaBgColor};color:${data.ctaTextColor};border:${data.ctaBorderWidth ?? 0}px solid transparent;`
  }

  const ctaHtml = data.ctaText
    ? `<a href="${data.ctaUrl ?? '#'}" style="display:inline-block;margin-top:1.75rem;padding:0.75rem 1.75rem;${ctaBtnStyle}border-radius:${data.ctaBorderRadius ?? 50}px;text-decoration:none;font-size:1rem;font-weight:600;">${data.ctaText}</a>`
    : ''

  const textCol = `<div style="display:flex;flex-direction:column;align-items:${contentAlignFlex};text-align:${data.contentAlign ?? 'left'};align-self:${vertAlign};">
    <h2 style="font-size:${data.headingSize ?? 48}px;font-weight:${fontWeight};color:${data.headingColor};margin:0;line-height:1.1;">${data.heading}</h2>
    ${data.subheading ? `<p style="font-size:${data.subheadingSize ?? 22}px;font-weight:700;color:${data.subheadingColor};margin:1.25rem 0 0;line-height:1.4;">${data.subheading}</p>` : ''}
    ${data.description ? `<p style="font-size:${data.descriptionSize ?? 16}px;line-height:1.7;color:${data.descriptionColor};margin:0.75rem 0 0;max-width:36rem;">${data.description}</p>` : ''}
    ${ctaHtml}
  </div>`

  const overlayDiv = (imgSrc && overlayOpacity > 0)
    ? `<div style="position:absolute;inset:0;background:${hexToRgba(data.overlayColor ?? '#000000', overlayOpacity)};pointer-events:none;"></div>`
    : ''

  const isFixedHeight = data.sectionHeight !== 'Auto'
  const imageContainerExtra = isFixedHeight ? 'align-self:stretch;' : ''
  const imgStyle = isFixedHeight
    ? `width:100%;height:100%;object-fit:${data.imageFit ?? 'cover'};display:block;`
    : `width:100%;height:auto;object-fit:${data.imageFit ?? 'cover'};display:block;`

  const imageCol = imgSrc
    ? `<div style="position:relative;overflow:hidden;border-radius:${data.imageBorderRadius ?? 8}px;${imageContainerExtra}">
      <img src="${imgSrc}" alt="${data.imageAlt ?? ''}" style="${imgStyle}" />
      ${overlayDiv}
    </div>`
    : `<div style="position:relative;overflow:hidden;border-radius:${data.imageBorderRadius ?? 8}px;${imageContainerExtra}background:#e2e8f0;min-height:320px;display:flex;align-items:center;justify-content:center;">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
    </div>`

  const leftCol  = data.imageSide === 'left' ? imageCol : textCol
  const rightCol = data.imageSide === 'left' ? textCol  : imageCol

  const bgOpacityVal = Math.min(100, Math.max(0, data.bgOpacity ?? 100)) / 100
  const sectionBg = bgOpacityVal < 1 ? hexToRgba(data.bgColor, bgOpacityVal) : data.bgColor

  return `<section data-component-title="Ru3-Text + Image Hero" data-component-props="${encodeURIComponent(JSON.stringify(data))}" style="background:${sectionBg};${heightStyle}">
  <style>@media(max-width:767px){.ru3-tih-grid{grid-template-columns:1fr!important;gap:2rem!important;}}</style>
  <div style="max-width:80rem;margin:0 auto;padding:${data.paddingY ?? 64}px ${data.paddingX ?? 48}px;box-sizing:border-box;">
    <div class="ru3-tih-grid" style="display:grid;grid-template-columns:${gridCols};gap:${data.columnGap ?? 48}px;align-items:${vertAlign};">
      ${leftCol}
      ${rightCol}
    </div>
  </div>
</section>`
}

// ─── Ru6-Split-Hero ──────────────────────────────────────────────────────────

export const ru6SplitHeroSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 277.5 80">
  <rect fill="#1f2937" width="277.5" height="80"/>
  <rect fill="#9ca3af" x="12" y="18" width="70" height="8" rx="1"/>
  <rect fill="#9ca3af" x="12" y="30" width="55" height="6" rx="1"/>
  <rect fill="#6b7280" x="12" y="42" width="80" height="3" rx="1"/>
  <rect fill="#6b7280" x="12" y="48" width="72" height="3" rx="1"/>
  <rect fill="#6b7280" x="12" y="54" width="65" height="3" rx="1"/>
  <rect fill="#4b5563" x="12" y="63" width="32" height="9" rx="4"/>
  <rect fill="#374151" x="140" y="8" width="125" height="64" rx="6"/>
  <rect fill="#4b5563" x="152" y="20" width="100" height="40" rx="4"/>
</svg>`

export interface Ru6SplitHeroData {
  bgColor: string
  paddingY: number
  paddingX: number
  textSide: string
  splitRatio: string
  gap: number
  eyebrow: string
  eyebrowColor: string
  eyebrowFontSize: number
  title: string
  titleFontSize: number
  titleFontWeight: string
  titleColor: string
  titleLineHeight: number
  description: string
  descriptionFontSize: number
  descriptionColor: string
  showCta: boolean
  ctaLabel: string
  ctaHref: string
  ctaBgColor: string
  ctaTextColor: string
  ctaBorderRadius: number
  ctaBorderColor: string
  ctaStyle: string
  showSecondaryCta: boolean
  secondaryCtaLabel: string
  secondaryCtaHref: string
  secondaryCtaColor: string
  imageUrl: string
  imageBorderRadius: number
  imageObjectFit: string
  imageHeight: number
  cardMode: boolean
  cardBgColor: string
  cardPadding: number
  cardBorderRadius: number
  cardBorderColor: string
  cardShowBorder: boolean
  textAlign: string
  verticalAlign: string
}

export const ru6SplitHeroDefaults: Ru6SplitHeroData = {
  bgColor: '#ffffff',
  paddingY: 64,
  paddingX: 32,
  textSide: 'left',
  splitRatio: '50/50',
  gap: 48,
  eyebrow: '',
  eyebrowColor: '#6b7280',
  eyebrowFontSize: 13,
  title: 'Gear Up\nPower Onward™',
  titleFontSize: 48,
  titleFontWeight: '700',
  titleColor: '#111827',
  titleLineHeight: 1.15,
  description: 'You put in the work — we make it easy to suit up right. This is your store. Your choice.',
  descriptionFontSize: 16,
  descriptionColor: '#4b5563',
  showCta: true,
  ctaLabel: 'Gear Up',
  ctaHref: '/shop',
  ctaBgColor: '#dc2626',
  ctaTextColor: '#ffffff',
  ctaBorderRadius: 24,
  ctaBorderColor: '#dc2626',
  ctaStyle: 'filled',
  showSecondaryCta: false,
  secondaryCtaLabel: 'Learn More',
  secondaryCtaHref: '/about',
  secondaryCtaColor: '#374151',
  imageUrl: '',
  imageBorderRadius: 12,
  imageObjectFit: 'cover',
  imageHeight: 480,
  cardMode: false,
  cardBgColor: '#f3f4f6',
  cardPadding: 24,
  cardBorderRadius: 16,
  cardBorderColor: '#e5e7eb',
  cardShowBorder: false,
  textAlign: 'left',
  verticalAlign: 'center',
}

export const ru6SplitHeroFields: FieldConfig[] = [
  { key: '_h_layout', label: 'Layout', type: 'header' },
  { key: 'textSide', label: 'Text Side', type: 'select', options: ['left', 'right'] },
  { key: 'splitRatio', label: 'Split Ratio', type: 'select', options: ['50/50', '55/45', '60/40', '40/60', '45/55'] },
  { key: 'gap', label: 'Gap (px)', type: 'number', placeholder: '48' },
  { key: 'verticalAlign', label: 'Vertical Align', type: 'select', options: ['top', 'center', 'bottom'] },
  { key: 'paddingY', label: 'Vertical Padding (px)', type: 'number', placeholder: '64' },
  { key: 'paddingX', label: 'Horizontal Padding (px)', type: 'number', placeholder: '32' },

  { key: '_h_section', label: 'Section', type: 'header' },
  { key: 'bgColor', label: 'Background Colour', type: 'color' },

  { key: '_h_text', label: 'Text', type: 'header' },
  { key: 'textAlign', label: 'Text Align', type: 'select', options: ['left', 'center', 'right'] },
  { key: 'eyebrow', label: 'Eyebrow Text', type: 'text', placeholder: 'e.g. NEW COLLECTION' },
  { key: 'eyebrowFontSize', label: 'Eyebrow Size (px)', type: 'number', placeholder: '13' },
  { key: 'eyebrowColor', label: 'Eyebrow Colour', type: 'color' },
  { key: 'title', label: 'Title', type: 'textarea', placeholder: 'e.g. Gear Up\nPower Onward' },
  { key: 'titleFontSize', label: 'Title Size (px)', type: 'number', placeholder: '48' },
  { key: 'titleFontWeight', label: 'Title Weight', type: 'select', options: ['400', '500', '600', '700', '800', '900'] },
  { key: 'titleColor', label: 'Title Colour', type: 'color' },
  { key: 'titleLineHeight', label: 'Title Line Height', type: 'number', placeholder: '1.15' },
  { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Supporting description text' },
  { key: 'descriptionFontSize', label: 'Description Size (px)', type: 'number', placeholder: '16' },
  { key: 'descriptionColor', label: 'Description Colour', type: 'color' },

  { key: '_h_cta', label: 'CTA Button', type: 'header' },
  { key: 'showCta', label: 'Show Primary CTA', type: 'toggle' },
  { key: 'ctaLabel', label: 'Primary CTA Label', type: 'text', placeholder: 'e.g. Gear Up' },
  { key: 'ctaHref', label: 'Primary CTA URL', type: 'url', placeholder: '/shop' },
  { key: 'ctaStyle', label: 'Primary CTA Style', type: 'select', options: ['filled', 'outline'] },
  { key: 'ctaBgColor', label: 'Primary CTA Background', type: 'color' },
  { key: 'ctaTextColor', label: 'Primary CTA Text', type: 'color' },
  { key: 'ctaBorderColor', label: 'Primary CTA Border', type: 'color' },
  { key: 'ctaBorderRadius', label: 'CTA Border Radius (px)', type: 'number', placeholder: '24' },
  { key: 'showSecondaryCta', label: 'Show Secondary CTA', type: 'toggle' },
  { key: 'secondaryCtaLabel', label: 'Secondary CTA Label', type: 'text', placeholder: 'e.g. Learn More' },
  { key: 'secondaryCtaHref', label: 'Secondary CTA URL', type: 'url', placeholder: '/about' },
  { key: 'secondaryCtaColor', label: 'Secondary CTA Colour', type: 'color' },

  { key: '_h_image', label: 'Image', type: 'header' },
  { key: 'imageUrl', label: 'Image', type: 'image', noAspectRatio: true },
  { key: 'imageHeight', label: 'Image Height (px)', type: 'number', placeholder: '480' },
  { key: 'imageBorderRadius', label: 'Image Radius (px)', type: 'number', placeholder: '12' },
  { key: 'imageObjectFit', label: 'Image Fit', type: 'select', options: ['cover', 'contain', 'fill'] },

  { key: '_h_card', label: 'Card Mode', type: 'header' },
  { key: 'cardMode', label: 'Enable Card Mode', type: 'toggle' },
  { key: 'cardBgColor', label: 'Card Background', type: 'color' },
  { key: 'cardPadding', label: 'Card Padding (px)', type: 'number', placeholder: '24' },
  { key: 'cardBorderRadius', label: 'Card Radius (px)', type: 'number', placeholder: '16' },
  { key: 'cardShowBorder', label: 'Show Card Border', type: 'toggle' },
  { key: 'cardBorderColor', label: 'Card Border Colour', type: 'color' },
]

export function renderRu6SplitHero(data: Ru6SplitHeroData): string {
  const splitMap: Record<string, [string, string]> = {
    '50/50': ['1fr', '1fr'],
    '55/45': ['1.22fr', '1fr'],
    '60/40': ['1.5fr', '1fr'],
    '40/60': ['0.67fr', '1fr'],
    '45/55': ['0.82fr', '1fr'],
  }
  const [textFr, imageFr] = splitMap[data.splitRatio ?? '50/50'] ?? ['1fr', '1fr']
  const gridCols = data.textSide === 'left'
    ? `${textFr} ${imageFr}`
    : `${imageFr} ${textFr}`

  const vAlignMap: Record<string, string> = { top: 'flex-start', center: 'center', bottom: 'flex-end' }
  const vAlign = vAlignMap[data.verticalAlign ?? 'center'] ?? 'center'

  const eyebrowHtml = data.eyebrow
    ? `<p style="margin:0 0 12px;font-size:${data.eyebrowFontSize}px;font-weight:600;color:${data.eyebrowColor};letter-spacing:0.1em;text-transform:uppercase;">${data.eyebrow}</p>`
    : ''

  const titleHtml = data.title
    ? `<h2 style="margin:0 0 16px;font-size:${data.titleFontSize}px;font-weight:${data.titleFontWeight};color:${data.titleColor};line-height:${data.titleLineHeight};white-space:pre-line;">${data.title}</h2>`
    : ''

  const descHtml = data.description
    ? `<p style="margin:0 0 28px;font-size:${data.descriptionFontSize}px;color:${data.descriptionColor};line-height:1.7;">${data.description}</p>`
    : ''

  const primaryCtaHtml = data.showCta !== false
    ? `<a href="${data.ctaHref}" style="display:inline-block;padding:0.75rem 1.75rem;background:${data.ctaStyle === 'outline' ? 'transparent' : data.ctaBgColor};color:${data.ctaTextColor};text-decoration:none;border-radius:${data.ctaBorderRadius}px;font-size:0.9rem;font-weight:600;border:2px solid ${data.ctaBorderColor};letter-spacing:0.04em;">${data.ctaLabel}</a>`
    : ''

  const secondaryCtaHtml = data.showSecondaryCta
    ? `<a href="${data.secondaryCtaHref}" style="display:inline-block;padding:0.75rem 1.25rem;color:${data.secondaryCtaColor};text-decoration:none;font-size:0.9rem;font-weight:500;">→ ${data.secondaryCtaLabel}</a>`
    : ''

  const ctasHtml = (primaryCtaHtml || secondaryCtaHtml)
    ? `<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">${primaryCtaHtml}${secondaryCtaHtml}</div>`
    : ''

  const textCol = `<div style="display:flex;flex-direction:column;justify-content:${vAlign};text-align:${data.textAlign ?? 'left'};">
    ${eyebrowHtml}
    ${titleHtml}
    ${descHtml}
    ${ctasHtml}
  </div>`

  const imgInner = data.imageUrl
    ? `<img src="${data.imageUrl}" alt="${data.title}" style="width:100%;height:${data.imageHeight}px;object-fit:${data.imageObjectFit};border-radius:${data.cardMode ? '0' : data.imageBorderRadius}px;display:block;" />`
    : `<div style="width:100%;height:${data.imageHeight}px;background:#e5e7eb;border-radius:${data.cardMode ? '0' : data.imageBorderRadius}px;display:flex;align-items:center;justify-content:center;"><span style="color:#9ca3af;font-size:14px;">Add an image</span></div>`

  const imageCol = data.cardMode
    ? `<div style="display:flex;align-items:${vAlign};">
        <div style="width:100%;background:${data.cardBgColor};padding:${data.cardPadding}px;border-radius:${data.cardBorderRadius}px;${data.cardShowBorder ? `border:1px solid ${data.cardBorderColor};` : ''}box-sizing:border-box;">
          ${imgInner}
        </div>
      </div>`
    : `<div style="display:flex;align-items:${vAlign};">${imgInner}</div>`

  const leftCol = data.textSide === 'left' ? textCol : imageCol
  const rightCol = data.textSide === 'left' ? imageCol : textCol

  return `<section data-component-title="Ru6-Split-Hero" style="background:${data.bgColor};padding:${data.paddingY}px ${data.paddingX}px;">
  <div style="max-width:1280px;margin:0 auto;">
    <div style="display:grid;grid-template-columns:${gridCols};gap:${data.gap}px;align-items:${vAlign};">
      ${leftCol}
      ${rightCol}
    </div>
  </div>
</section>`
}

// ─── Ru4-Overlay Panel ───────────────────────────────────────────────────────

export const ru4OverlayPanelSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 277.5 80">
  <rect fill="#1f2937" width="277.5" height="80"/>
  <polygon fill="#374151" points="8,8 152,8 152,54 132,72 8,72"/>
  <rect fill="#9ca3af" x="16" y="16" width="90" height="6" rx="1.5"/>
  <rect fill="#9ca3af" x="16" y="26" width="72" height="6" rx="1.5"/>
  <rect fill="#6b7280" x="16" y="38" width="112" height="3" rx="1"/>
  <rect fill="#6b7280" x="16" y="44" width="100" height="3" rx="1"/>
  <rect fill="#6b7280" x="16" y="50" width="108" height="3" rx="1"/>
  <rect fill="#4b5563" x="16" y="59" width="52" height="11" rx="3"/>
</svg>`

export interface Ru4OverlayPanelData {
  bgImage: string
  bgImageAspectRatio: string
  bgColor: string
  bgPosition: string
  bgSize: string
  overlayColor: string
  overlayOpacity: number
  sectionHeight: string
  sectionPaddingX: number
  panelPosition: string
  panelWidth: string
  panelBgColor: string
  panelBgOpacity: number
  panelBorderRadius: number
  panelShadow: string
  panelPaddingY: number
  panelPaddingX: number
  clipCorner: string
  clipSize: number
  heading: string
  headingColor: string
  headingSize: number
  headingWeight: string
  description: string
  descriptionColor: string
  descriptionSize: number
  contentAlign: string
  ctaText: string
  ctaUrl: string
  ctaStyle: string
  ctaBgColor: string
  ctaTextColor: string
  ctaBorderRadius: number
  ctaBorderWidth: number
  ctaBorderColor: string
}

export const ru4OverlayPanelDefaults: Ru4OverlayPanelData = {
  bgImage: '',
  bgImageAspectRatio: 'Auto',
  bgColor: '#f7f7f7',
  bgPosition: 'center',
  bgSize: 'cover',
  overlayColor: '#000000',
  overlayOpacity: 0,
  sectionHeight: '500px',
  sectionPaddingX: 48,
  panelPosition: 'left',
  panelWidth: '45%',
  panelBgColor: '#f7f7f7',
  panelBgOpacity: 100,
  panelBorderRadius: 8,
  panelShadow: 'lg',
  panelPaddingY: 48,
  panelPaddingX: 40,
  clipCorner: 'bottom-right',
  clipSize: 48,
  heading: 'Celebrate Every Achievement',
  headingColor: '#111827',
  headingSize: 32,
  headingWeight: 'Bold',
  description: 'Your results fuel our success. Choose from a curated collection of exclusive rewards, delivered globally to recognise your impact.',
  descriptionColor: '#4b5563',
  descriptionSize: 15,
  contentAlign: 'left',
  ctaText: 'Celebrate Now',
  ctaUrl: '/shop',
  ctaStyle: 'filled',
  ctaBgColor: '#dc2626',
  ctaTextColor: '#ffffff',
  ctaBorderRadius: 6,
  ctaBorderWidth: 2,
  ctaBorderColor: '#dc2626',
}

export const ru4OverlayPanelFields: FieldConfig[] = [
  { key: '_h_bg', label: 'Background', type: 'header' },
  { key: 'bgImage', label: 'Background Image', type: 'image' },
  { key: 'bgImageAspectRatio', label: 'Image Aspect Ratio', type: 'select', options: ['Auto', 'Wide (16:9)', 'Standard (4:3)', 'Square (1:1)', 'Tall (3:4)', 'Cinematic (21:9)'] },
  { key: 'bgColor', label: 'Fallback Color', type: 'color' },
  { key: 'bgPosition', label: 'Image Position', type: 'select', options: ['center', 'top', 'bottom', 'left', 'right', 'top center', 'bottom center'] },
  { key: 'bgSize', label: 'Image Size', type: 'select', options: ['cover', 'contain'] },
  { key: 'overlayColor', label: 'Overlay Color', type: 'color' },
  { key: 'overlayOpacity', label: 'Overlay Opacity', type: 'number', unit: '%', step: 5, placeholder: '0' },
  { key: 'sectionHeight', label: 'Section Height', type: 'select', options: ['Auto', '400px', '500px', '600px', '700px', '80vh', '100vh'] },
  { key: 'sectionPaddingX', label: 'Section Side Padding (px)', type: 'number', placeholder: '48' },

  { key: '_h_panel', label: 'Panel', type: 'header' },
  { key: 'panelPosition', label: 'Panel Position', type: 'select', options: ['left', 'center', 'right'] },
  { key: 'panelWidth', label: 'Panel Width', type: 'select', options: ['30%', '35%', '40%', '45%', '50%', '55%', '60%'] },
  { key: 'panelBgColor', label: 'Panel Background', type: 'color' },
  { key: 'panelBgOpacity', label: 'Panel Opacity (%)', type: 'number', step: 5, placeholder: '100' },
  { key: 'panelShadow', label: 'Shadow', type: 'select', options: ['none', 'sm', 'md', 'lg', 'xl'] },
  { key: 'panelPaddingY', label: 'Panel Vertical Padding (px)', type: 'number', placeholder: '48' },
  { key: 'panelPaddingX', label: 'Panel Horizontal Padding (px)', type: 'number', placeholder: '40' },

  { key: '_h_clip', label: 'Diagonal Cut Corner', type: 'header' },
  { key: 'clipCorner', label: 'Cut Corner', type: 'select', options: ['none', 'top-left', 'top-right', 'bottom-left', 'bottom-right'] },
  { key: 'clipSize', label: 'Cut Size (px)', type: 'number', placeholder: '48' },
  { key: 'panelBorderRadius', label: 'Border Radius (px) — used when cut is none', type: 'number', placeholder: '8' },

  { key: '_h_content', label: 'Content', type: 'header' },
  { key: 'heading', label: 'Heading', type: 'text', placeholder: 'Heading text' },
  { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Supporting description' },
  { key: 'contentAlign', label: 'Content Alignment', type: 'select', options: ['left', 'center', 'right'] },

  { key: '_h_typography', label: 'Typography', type: 'header' },
  { key: 'headingColor', label: 'Heading Color', type: 'color' },
  { key: 'headingSize', label: 'Heading Size (px)', type: 'number', placeholder: '32' },
  { key: 'headingWeight', label: 'Heading Weight', type: 'select', options: ['Light', 'Regular', 'Medium', 'Semibold', 'Bold', 'Extrabold', 'Black'] },
  { key: 'descriptionColor', label: 'Description Color', type: 'color' },
  { key: 'descriptionSize', label: 'Description Size (px)', type: 'number', placeholder: '15' },

  { key: '_h_cta', label: 'CTA Button', type: 'header' },
  { key: 'ctaText', label: 'Button Text', type: 'text', placeholder: 'e.g. Celebrate Now' },
  { key: 'ctaUrl', label: 'Button URL', type: 'url', placeholder: '/shop' },
  { key: 'ctaStyle', label: 'Button Style', type: 'select', options: ['filled', 'outline'] },
  { key: 'ctaBgColor', label: 'Button Background', type: 'color' },
  { key: 'ctaTextColor', label: 'Button Text Color', type: 'color' },
  { key: 'ctaBorderRadius', label: 'Button Radius (px)', type: 'number', placeholder: '6' },
  { key: 'ctaBorderWidth', label: 'Button Border Width (px)', type: 'number', placeholder: '2' },
  { key: 'ctaBorderColor', label: 'Button Border Color', type: 'color' },
]

export function renderRu4OverlayPanel(data: Ru4OverlayPanelData): string {
  const imgSrc = productImageSrc(data.bgImage)

  const bgStyle = imgSrc
    ? `background-image:url('${imgSrc}');background-size:${data.bgSize ?? 'cover'};background-position:${data.bgPosition ?? 'center'};background-repeat:no-repeat;background-color:${data.bgColor};`
    : `background-color:${data.bgColor};`

  const overlayOpacity = Math.min(100, Math.max(0, data.overlayOpacity ?? 0)) / 100
  const overlayStyle = (imgSrc && overlayOpacity > 0)
    ? `box-shadow:inset 0 0 0 9999px ${hexToRgba(data.overlayColor ?? '#000000', overlayOpacity)};`
    : ''

  const ratio = data.bgImageAspectRatio ?? 'Auto'
  const aspectRatioMap: Record<string, string> = {
    'Wide (16:9)':      'aspect-ratio:16/9;',
    'Standard (4:3)':   'aspect-ratio:4/3;',
    'Square (1:1)':     'aspect-ratio:1/1;',
    'Tall (3:4)':       'aspect-ratio:3/4;',
    'Cinematic (21:9)': 'aspect-ratio:21/9;',
  }
  const aspectStyle = ratio !== 'Auto' ? (aspectRatioMap[ratio] ?? '') : ''

  const heightMap: Record<string, string> = {
    '400px': 'min-height:400px;',
    '500px': 'min-height:500px;',
    '600px': 'min-height:600px;',
    '700px': 'min-height:700px;',
    '80vh': 'min-height:80vh;',
    '100vh': 'min-height:100vh;',
  }
  const heightStyle = (data.sectionHeight ?? 'Auto') !== 'Auto' ? (heightMap[data.sectionHeight] ?? '') : ''

  const justifyMap: Record<string, string> = { left: 'flex-start', center: 'center', right: 'flex-end' }
  const justifyContent = justifyMap[data.panelPosition ?? 'left'] ?? 'flex-start'

  const shadowMap: Record<string, string> = {
    none: '',
    sm: 'filter:drop-shadow(0 1px 3px rgba(0,0,0,0.15)) drop-shadow(0 1px 2px rgba(0,0,0,0.10));',
    md: 'filter:drop-shadow(0 4px 6px rgba(0,0,0,0.12)) drop-shadow(0 2px 4px rgba(0,0,0,0.08));',
    lg: 'filter:drop-shadow(0 10px 15px rgba(0,0,0,0.12)) drop-shadow(0 4px 6px rgba(0,0,0,0.07));',
    xl: 'filter:drop-shadow(0 20px 25px rgba(0,0,0,0.12)) drop-shadow(0 10px 10px rgba(0,0,0,0.06));',
  }
  const shadowStyle = shadowMap[data.panelShadow ?? 'lg'] ?? ''

  const clipSize = data.clipSize ?? 48
  const clipMap: Record<string, string> = {
    'bottom-right': `clip-path:polygon(0 0, 100% 0, 100% calc(100% - ${clipSize}px), calc(100% - ${clipSize}px) 100%, 0 100%);`,
    'bottom-left':  `clip-path:polygon(0 0, 100% 0, 100% 100%, ${clipSize}px 100%, 0 calc(100% - ${clipSize}px));`,
    'top-right':    `clip-path:polygon(0 0, calc(100% - ${clipSize}px) 0, 100% ${clipSize}px, 100% 100%, 0 100%);`,
    'top-left':     `clip-path:polygon(${clipSize}px 0, 100% 0, 100% 100%, 0 100%, 0 ${clipSize}px);`,
  }
  const useClip = (data.clipCorner ?? 'bottom-right') !== 'none'
  const clipStyle = useClip ? (clipMap[data.clipCorner ?? 'bottom-right'] ?? '') : ''
  const borderRadiusStyle = !useClip ? `border-radius:${data.panelBorderRadius ?? 8}px;` : ''

  const fontWeightMap: Record<string, string> = {
    Light: '300', Regular: '400', Medium: '500', Semibold: '600', Bold: '700', Extrabold: '800', Black: '900',
  }
  const fontWeight = fontWeightMap[data.headingWeight ?? 'Bold'] ?? '700'

  const alignMap: Record<string, string> = { left: 'flex-start', center: 'center', right: 'flex-end' }
  const contentAlignFlex = alignMap[data.contentAlign ?? 'left'] ?? 'flex-start'

  const ctaBtnStyle = data.ctaStyle === 'outline'
    ? `background:transparent;color:${data.ctaBorderColor};border:${data.ctaBorderWidth ?? 2}px solid ${data.ctaBorderColor};`
    : `background:${data.ctaBgColor};color:${data.ctaTextColor};border:${data.ctaBorderWidth ?? 2}px solid ${data.ctaBorderColor};`

  const ctaHtml = data.ctaText
    ? `<a href="${data.ctaUrl}" style="display:inline-block;margin-top:1.5rem;padding:0.75rem 2rem;text-decoration:none;border-radius:${data.ctaBorderRadius ?? 6}px;font-size:13px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;${ctaBtnStyle}">${data.ctaText}</a>`
    : ''

  const panelBg = (data.panelBgOpacity ?? 100) < 100
    ? hexToRgba(data.panelBgColor, (data.panelBgOpacity ?? 100) / 100)
    : data.panelBgColor
  const panelStyle = `background:${panelBg};${borderRadiusStyle}${shadowStyle}${clipStyle}padding:${data.panelPaddingY ?? 48}px ${data.panelPaddingX ?? 40}px;box-sizing:border-box;`

  return `<section data-component-title="Ru4-Overlay Panel" data-component-props="${encodeURIComponent(JSON.stringify(data))}" style="${bgStyle}${overlayStyle}${aspectStyle}${heightStyle}position:relative;display:flex;align-items:center;overflow:hidden;">
  <style>@media(max-width:767px){.ru4-op-panel{width:100%!important;clip-path:none!important;}}</style>
  <div style="width:100%;padding:40px ${data.sectionPaddingX ?? 48}px;box-sizing:border-box;display:flex;justify-content:${justifyContent};">
    <div class="ru4-op-panel" style="width:${data.panelWidth ?? '45%'};max-width:100%;${panelStyle}">
      <div style="display:flex;flex-direction:column;align-items:${contentAlignFlex};text-align:${data.contentAlign ?? 'left'};">
        <h2 style="font-size:${data.headingSize ?? 32}px;font-weight:${fontWeight};color:${data.headingColor};margin:0;line-height:1.2;">${data.heading}</h2>
        ${data.description ? `<p style="font-size:${data.descriptionSize ?? 15}px;line-height:1.7;color:${data.descriptionColor};margin:1rem 0 0;max-width:42rem;">${data.description}</p>` : ''}
        ${ctaHtml}
      </div>
    </div>
  </div>
</section>`
}
