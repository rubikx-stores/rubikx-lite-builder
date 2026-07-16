# Font Customization for Shop & Product Components — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add font family customization fields to all shop page and product display components (Ru1 Shop Hero, Ru1 Shop Content, Ru2 Shop Header, Ru2 Shop Filters, Ru2 Shop Products).

**Architecture:** Add font fields to component data interfaces, defaults, field configs, and render functions. Reuse existing `fontField()` and `fontCss()` helpers from `fontFields.ts`. Pattern already exists in `Ru1 Homepage Featured Products`; this is straightforward application across 5 components.

**Tech Stack:** Vue 3 + TypeScript, inline styles (no Tailwind in render functions), existing font utilities.

## Global Constraints

- Use `ru-` CSS prefix only; no `pbx-` prefix
- No Tailwind utility classes in render functions—use inline styles only
- Font options defined in `FONT_FAMILY_OPTIONS` from `fontFields.ts`
- Empty font string (`''`) = no override, element inherits (no CSS applied)
- Apply `fontCss(specificFont, blockDefault)` to each text element that should support font override
- One commit per component

---

## File Structure

**Single file modified:**
- `app/composables/themes/themes-data.ts`
  - Update 5 component data interfaces
  - Update 5 defaults objects
  - Update 5 field config arrays
  - Update 5 render functions

No new files created. Reuse existing `fontField()` and `fontCss()` from `app/composables/editor/fontFields.ts`.

---

## Task 1: Ru1 Shop Hero (Ru2ShopHero)

**Files:**
- Modify: `app/composables/themes/themes-data.ts` — Ru2ShopHero interface, defaults, fields, render function (lines ~1020–1160)

**Interfaces:**
- Consumes: `fontField(key, label)` → returns FieldConfig
- Consumes: `fontCss(specificFont, blockDefault)` → returns CSS string
- Produces: Updated `Ru2ShopHeroData` interface with `fontFamily` and `titleFont`

**Steps:**

- [ ] **Step 1: Update Ru2ShopHeroData interface**

In `app/composables/themes/themes-data.ts`, find the `Ru2ShopHeroData` interface (around line 1020). Add two font fields:

```ts
export interface Ru2ShopHeroData {
  pageTitle: string
  showBreadcrumbs: boolean
  breadcrumbs: Array<{ label: string; url: string }>
  bgColor: string
  bgImageUrl: string
  textColor: string
  breadcrumbColor: string
  textAlign: string
  paddingY: number
  paddingX: number
  borderBottom: boolean
  borderColor: string
  fontFamily: string           // ADD THIS
  titleFont: string            // ADD THIS
}
```

- [ ] **Step 2: Update ru2ShopHeroDefaults**

Find `ru2ShopHeroDefaults` (around line 1066). Add default values for new fields:

```ts
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
  fontFamily: '',              // ADD THIS
  titleFont: '',               // ADD THIS
}
```

- [ ] **Step 3: Update ru2ShopHeroFields**

Find `ru2ShopHeroFields` (around line 1084). Add font fields after the "Colors" header:

```ts
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

  { key: '_h_fonts', label: 'Fonts', type: 'header' },              // ADD THIS
  fontField('fontFamily', 'Font Family'),                            // ADD THIS
  fontField('titleFont', 'Title Font'),                              // ADD THIS

  { key: '_h_layout', label: 'Layout', type: 'header' },
  { key: 'paddingY', label: 'Vertical Padding', type: 'number', unit: 'px', step: 4, placeholder: '24' },
  { key: 'paddingX', label: 'Horizontal Padding', type: 'number', unit: 'px', step: 4, placeholder: '16' },
  { key: 'borderBottom', label: 'Bottom Border', type: 'toggle' },
  { key: 'borderColor', label: 'Border Color', type: 'color' },
]
```

- [ ] **Step 4: Update renderRu2ShopHero function**

Find the `renderRu2ShopHero` function (around line 1112). Locate the `<h1>` tag rendering the page title and the breadcrumb rendering. Apply `fontCss()` to each:

Original (around line 1127–1135):
```ts
<h1 style="font-size:1.875rem;font-weight:700;color:${data.textColor};margin:0;">${data.pageTitle}</h1>
```

Update to:
```ts
<h1 style="font-size:1.875rem;font-weight:700;color:${data.textColor};margin:0;${fontCss(data.titleFont, data.fontFamily)}">${data.pageTitle}</h1>
```

Also find breadcrumb rendering (around line 1121) and update breadcrumb text `<span>` to use `fontCss()`:
```ts
<span style="${fontCss(undefined, data.fontFamily)}">${data.breadcrumb}</span>
```

- [ ] **Step 5: Verify interface matches**

Skim `renderRu2ShopHero(data: Ru2ShopHeroData)` signature to confirm it matches updated interface. It should.

- [ ] **Step 6: Commit**

```bash
git add app/composables/themes/themes-data.ts
git commit -m "feat(Ru1-Shop-Hero): add font customization for title and breadcrumbs"
```

---

## Task 2: Ru1 Shop Content (Ru2ShopContent)

**Files:**
- Modify: `app/composables/themes/themes-data.ts` — Ru2ShopContent interface, defaults, fields, render function (lines ~1134–1460)

**Interfaces:**
- Consumes: `fontField()`, `fontCss()`
- Produces: Updated `Ru2ShopContentData` interface with `fontFamily`, `productNameFont`, `priceFont`, `buttonFont`

**Steps:**

- [ ] **Step 1: Update Ru2ShopContentData interface**

Find the `Ru2ShopContentData` interface (around line 1134). Add four font fields:

```ts
export interface Ru2ShopContentData {
  // ... existing fields ...
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
  fontFamily: string           // ADD THIS
  productNameFont: string      // ADD THIS
  priceFont: string            // ADD THIS
  buttonFont: string           // ADD THIS
}
```

- [ ] **Step 2: Update ru2ShopContentDefaults**

Find `ru2ShopContentDefaults` (around line 1197). Add font defaults at the end:

```ts
export const ru2ShopContentDefaults: Ru2ShopContentData = {
  // ... existing defaults ...
  bgColor: '',
  paddingY: 48,
  paddingX: 16,
  fontFamily: '',              // ADD THIS
  productNameFont: '',         // ADD THIS
  priceFont: '',               // ADD THIS
  buttonFont: '',              // ADD THIS
}
```

- [ ] **Step 3: Update ru2ShopContentFields**

Find `ru2ShopContentFields` (around line 1248). Add font fields section after the "Pricing & Button" header:

```ts
  // ── Card info (price, add to cart) ───────────────────────────────────
  { key: '_h_pricing', label: 'Pricing & Button', type: 'header' },
  { key: 'oldPriceColor', label: 'Old Price Color', type: 'color' },
  { key: 'showAddToCart', label: 'Show Add to Cart Button', type: 'toggle' },
  { key: 'buttonBgColor', label: 'Button Background', type: 'color' },
  { key: 'buttonTextColor', label: 'Button Text Color', type: 'color' },
  { key: 'addToCartRadius', label: 'Button Border Radius', type: 'number', unit: 'px', step: 2, placeholder: '6' },

  { key: '_h_fonts', label: 'Fonts', type: 'header' },              // ADD THIS
  fontField('fontFamily', 'Font Family'),                            // ADD THIS
  fontField('productNameFont', 'Product Name Font'),                 // ADD THIS
  fontField('priceFont', 'Price Font'),                              // ADD THIS
  fontField('buttonFont', 'Button Font'),                            // ADD THIS

  // ── Products list ─────────────────────────────────────────────────────
  { key: '_h_products', label: 'Products', type: 'header' },
```

- [ ] **Step 4: Update renderRu2ShopContent render function**

Find the `renderCard` function inside `renderRu2ShopContent` (around line 1363). Locate where product names, prices, and buttons are rendered:

**Product name** (around line 1832):
```ts
<p style="font-weight:600;font-size:0.875rem">${p.name}</p>
```
Update to:
```ts
<p style="font-weight:600;font-size:0.875rem;${fontCss(data.productNameFont, data.fontFamily)}">${p.name}</p>
```

**Price** (around line 1834):
```ts
<p style="font-size:0.875rem">${p.price}</p>
```
Update to:
```ts
<p style="font-size:0.875rem;${fontCss(data.priceFont, data.fontFamily)}">${p.price}</p>
```

**Old price** (around line 1835):
```ts
<s style="color:${data.oldPriceColor};font-size:0.875rem">${p.oldPrice}</s>
```
Update to:
```ts
<s style="color:${data.oldPriceColor};font-size:0.875rem;${fontCss(data.priceFont, data.fontFamily)}">${p.oldPrice}</s>
```

**Add to Cart button** (find around line 1838, look for `shop-btn`):
```ts
<a href="${p.buttonUrl}" class="shop-btn" style="background:${data.buttonBgColor};color:${data.buttonTextColor};border-radius:${data.addToCartRadius ?? 6}px;margin-top:auto;text-align:center;font-size:0.875rem;font-weight:500;padding:0.5rem 1rem;text-decoration:none;display:block;${fontCss(data.buttonFont, data.fontFamily)}">${p.buttonLabel}</a>
```

(The `fontCss()` call is already there from the grep results earlier—verify and confirm it's present.)

- [ ] **Step 5: Commit**

```bash
git add app/composables/themes/themes-data.ts
git commit -m "feat(Ru1-Shop-Content): add font customization for product names, prices, and buttons"
```

---

## Task 3: Ru2 Shop Header (Ru3ShopHeader)

**Files:**
- Modify: `app/composables/themes/themes-data.ts` — Ru3ShopHeader interface, defaults, fields, render function (lines ~1597–1658)

**Interfaces:**
- Consumes: `fontField()`, `fontCss()`
- Produces: Updated `Ru3ShopHeaderData` interface with `fontFamily` and `titleFont`

**Steps:**

- [ ] **Step 1: Update Ru3ShopHeaderData interface**

Find the `Ru3ShopHeaderData` interface (around line 1597). Add two font fields:

```ts
export interface Ru3ShopHeaderData {
  pageTitle: string
  breadcrumb: string
  bgColor: string
  textColor: string
  paddingY: number
  paddingX: number
  showProductCount: boolean
  productCountText: string
  showSortBy: boolean
  fontFamily: string           // ADD THIS
  titleFont: string            // ADD THIS
}
```

- [ ] **Step 2: Update ru3ShopHeaderDefaults**

Find `ru3ShopHeaderDefaults` (around line 1609). Add font defaults:

```ts
export const ru3ShopHeaderDefaults: Ru3ShopHeaderData = {
  pageTitle: 'Shop All',
  breadcrumb: 'Home > Shop All',
  bgColor: '#ffffff',
  textColor: '#111111',
  paddingY: 24,
  paddingX: 16,
  showProductCount: true,
  productCountText: '13 Products',
  showSortBy: true,
  fontFamily: '',              // ADD THIS
  titleFont: '',               // ADD THIS
}
```

- [ ] **Step 3: Update ru3ShopHeaderFields**

Find `ru3ShopHeaderFields` (around line 1621). Add font fields after text color:

```ts
export const ru3ShopHeaderFields: FieldConfig[] = [
  { key: 'pageTitle',         label: 'Page Title',         type: 'text',   placeholder: 'e.g. Shop All' },
  { key: 'breadcrumb',        label: 'Breadcrumb',         type: 'text',   placeholder: 'e.g. Home > Shop All' },
  { key: 'bgColor',           label: 'Background Color',   type: 'color' },
  { key: 'textColor',         label: 'Text Color',         type: 'color' },
  
  { key: '_h_fonts', label: 'Fonts', type: 'header' },               // ADD THIS
  fontField('fontFamily', 'Font Family'),                            // ADD THIS
  fontField('titleFont', 'Title Font'),                              // ADD THIS
  
  { key: 'paddingY',          label: 'Vertical Padding (px)',   type: 'number', placeholder: '24' },
  { key: 'paddingX',          label: 'Horizontal Padding (px)', type: 'number', placeholder: '16' },
  { key: 'showProductCount',  label: 'Show Product Count', type: 'toggle' },
  { key: 'productCountText',  label: 'Product Count Text', type: 'text',   placeholder: 'e.g. 13 Products' },
  { key: 'showSortBy',        label: 'Show Sort By',       type: 'toggle' },
]
```

- [ ] **Step 4: Update renderRu3ShopHeader function**

Find the `renderRu3ShopHeader` function (around line 1633). Locate the `<h1>` tag (around line 1641):

Original:
```ts
<h1 data-field-key='pageTitle' style='font-size:28px;font-weight:700;color:${data.textColor};margin:0;'>${data.pageTitle}</h1>
```

Update to:
```ts
<h1 data-field-key='pageTitle' style='font-size:28px;font-weight:700;color:${data.textColor};margin:0;${fontCss(data.titleFont, data.fontFamily)}'>${data.pageTitle}</h1>
```

- [ ] **Step 5: Commit**

```bash
git add app/composables/themes/themes-data.ts
git commit -m "feat(Ru2-Shop-Header): add font customization for page title"
```

---

## Task 4: Ru2 Shop Filters (Ru3ShopFilters)

**Files:**
- Modify: `app/composables/themes/themes-data.ts` — Ru3ShopFilters interface, defaults, fields, render function (lines ~1662–1717)

**Interfaces:**
- Consumes: `fontField()`, `fontCss()`
- Produces: Updated `Ru3ShopFiltersData` interface with `fontFamily` and `filterButtonFont`

**Steps:**

- [ ] **Step 1: Update Ru3ShopFiltersData interface**

Find the `Ru3ShopFiltersData` interface (around line 1662). Add two font fields:

```ts
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
  fontFamily: string           // ADD THIS
  filterButtonFont: string     // ADD THIS
}
```

- [ ] **Step 2: Update ru3ShopFiltersDefaults**

Find `ru3ShopFiltersDefaults` (around line 1674). Add font defaults:

```ts
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
  fontFamily: '',              // ADD THIS
  filterButtonFont: '',        // ADD THIS
}
```

- [ ] **Step 3: Update ru3ShopFiltersFields**

Find `ru3ShopFiltersFields` (around line 1681). Add font fields:

```ts
export const ru3ShopFiltersFields: FieldConfig[] = [
  { key: 'bgColor',           label: 'Background Color',          type: 'color' },
  { key: 'borderColor',       label: 'Border Color',              type: 'color' },
  { key: 'paddingY',          label: 'Vertical Padding (px)',     type: 'number' },
  { key: 'paddingX',          label: 'Horizontal Padding (px)',   type: 'number' },
  
  { key: '_h_fonts', label: 'Fonts', type: 'header' },             // ADD THIS
  fontField('fontFamily', 'Font Family'),                          // ADD THIS
  fontField('filterButtonFont', 'Filter Button Font'),             // ADD THIS
  
  { key: 'showCategories',    label: 'Show Categories',           type: 'toggle' },
  { key: 'showColor',         label: 'Show Color',                type: 'toggle' },
  { key: 'showSize',          label: 'Show Size',                 type: 'toggle' },
  { key: 'showBrands',        label: 'Show Brands',               type: 'toggle' },
  { key: 'showPrice',         label: 'Show Price',                type: 'toggle' },
]
```

- [ ] **Step 4: Update renderRu3ShopFilters function**

Find the `renderRu3ShopFilters` function (around line 1698). Locate the filter button rendering (around line 1710):

Original:
```ts
<button style='display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border:1px solid ${data.borderColor};border-radius:6px;background:#fff;font-size:14px;color:#374151;cursor:pointer;white-space:nowrap;'>
```

Update to:
```ts
<button style='display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border:1px solid ${data.borderColor};border-radius:6px;background:#fff;font-size:14px;color:#374151;cursor:pointer;white-space:nowrap;${fontCss(data.filterButtonFont, data.fontFamily)}'>
```

- [ ] **Step 5: Commit**

```bash
git add app/composables/themes/themes-data.ts
git commit -m "feat(Ru2-Shop-Filters): add font customization for filter buttons"
```

---

## Task 5: Ru2 Shop Products (Ru3ShopProducts)

**Files:**
- Modify: `app/composables/themes/themes-data.ts` — Ru3ShopProducts interface, defaults, fields, render function (lines ~1721–1850)

**Interfaces:**
- Consumes: `fontField()`, `fontCss()`
- Produces: Updated `Ru3ShopProductsData` interface with `fontFamily`, `sectionTitleFont`, `productNameFont`, `priceFont`, `buttonFont`

**Steps:**

- [ ] **Step 1: Update Ru3ShopProductsData interface**

Find the `Ru3ShopProductsData` interface (around line 1721). Add five font fields:

```ts
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
  fontFamily: string           // ADD THIS
  sectionTitleFont: string     // ADD THIS
  productNameFont: string      // ADD THIS
  priceFont: string            // ADD THIS
  buttonFont: string           // ADD THIS
}
```

- [ ] **Step 2: Update ru3ShopProductsDefaults**

Find `ru3ShopProductsDefaults` (around line 1745). Add font defaults:

```ts
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
  fontFamily: '',              // ADD THIS
  sectionTitleFont: '',        // ADD THIS
  productNameFont: '',         // ADD THIS
  priceFont: '',               // ADD THIS
  buttonFont: '',              // ADD THIS
}
```

- [ ] **Step 3: Update ru3ShopProductsFields**

Find `ru3ShopProductsFields` (around line 1777). Add font section after layout/padding fields:

```ts
export const ru3ShopProductsFields: FieldConfig[] = [
  { key: 'bgColor',           label: 'Background Color',          type: 'color' },
  { key: 'paddingY',          label: 'Vertical Padding (px)',     type: 'number' },
  { key: 'paddingX',          label: 'Horizontal Padding (px)',   type: 'number' },
  { key: 'columns',           label: 'Columns',                   type: 'select', options: ['2', '3', '4'] },
  { key: 'rows',              label: 'Rows',                      type: 'number', placeholder: '2' },
  
  { key: '_h_fonts', label: 'Fonts', type: 'header' },             // ADD THIS
  fontField('fontFamily', 'Font Family'),                          // ADD THIS
  fontField('sectionTitleFont', 'Section Title Font'),             // ADD THIS
  fontField('productNameFont', 'Product Name Font'),               // ADD THIS
  fontField('priceFont', 'Price Font'),                            // ADD THIS
  fontField('buttonFont', 'Button Font'),                          // ADD THIS
  
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
```

- [ ] **Step 4: Update renderRu3ShopProducts render function**

Find the `renderCard` function inside `renderRu3ShopProducts` (around line 1828). Locate where product names, prices, and buttons are rendered:

**Product name** (around line 1832):
```ts
<p style="font-weight:600;font-size:0.875rem">${p.name}</p>
```
Update to:
```ts
<p style="font-weight:600;font-size:0.875rem;${fontCss(data.productNameFont, data.fontFamily)}">${p.name}</p>
```

**Price** (around line 1834):
```ts
<p style="font-size:0.875rem">${p.price}</p>
```
Update to:
```ts
<p style="font-size:0.875rem;${fontCss(data.priceFont, data.fontFamily)}">${p.price}</p>
```

**Old price** (around line 1835):
```ts
<s style="color:${data.oldPriceColor};font-size:0.875rem">${p.oldPrice}</s>
```
Update to:
```ts
<s style="color:${data.oldPriceColor};font-size:0.875rem;${fontCss(data.priceFont, data.fontFamily)}">${p.oldPrice}</s>
```

**Shop Now button** (around line 1838):
```ts
<a href="${p.buttonUrl}" class="shop-btn" style="background:${data.buttonBgColor};color:${data.buttonTextColor};border-radius:${data.cardBorderRadius}px;margin-top:auto;text-align:center;font-size:0.875rem;font-weight:500;padding:0.5rem 1rem;text-decoration:none;display:block">${p.buttonLabel}</a>
```
Update to:
```ts
<a href="${p.buttonUrl}" class="shop-btn" style="background:${data.buttonBgColor};color:${data.buttonTextColor};border-radius:${data.cardBorderRadius}px;margin-top:auto;text-align:center;font-size:0.875rem;font-weight:500;padding:0.5rem 1rem;text-decoration:none;display:block;${fontCss(data.buttonFont, data.fontFamily)}">${p.buttonLabel}</a>
```

**Load More button** (around line 1844):
```ts
<button style="background:${data.loadMoreBgColor};color:${data.loadMoreTextColor};border:none;border-radius:8px;padding:12px 40px;font-size:15px;font-weight:600;cursor:pointer;letter-spacing:0.02em;">${data.loadMoreLabel}</button>
```
Update to:
```ts
<button style="background:${data.loadMoreBgColor};color:${data.loadMoreTextColor};border:none;border-radius:8px;padding:12px 40px;font-size:15px;font-weight:600;cursor:pointer;letter-spacing:0.02em;${fontCss(data.buttonFont, data.fontFamily)}">${data.loadMoreLabel}</button>
```

- [ ] **Step 5: Commit**

```bash
git add app/composables/themes/themes-data.ts
git commit -m "feat(Ru2-Shop-Products): add font customization for titles, product names, prices, and buttons"
```

---

## Final Verification

After all 5 tasks complete:

- [ ] **Step 1: Verify all interfaces updated**

Check that all 5 interfaces have been updated with their respective font fields:
- Ru2ShopHeroData: `fontFamily`, `titleFont`
- Ru2ShopContentData: `fontFamily`, `productNameFont`, `priceFont`, `buttonFont`
- Ru3ShopHeaderData: `fontFamily`, `titleFont`
- Ru3ShopFiltersData: `fontFamily`, `filterButtonFont`
- Ru3ShopProductsData: `fontFamily`, `sectionTitleFont`, `productNameFont`, `priceFont`, `buttonFont`

- [ ] **Step 2: Verify all defaults match interfaces**

Confirm defaults have matching empty string (`''`) entries for all new font fields.

- [ ] **Step 3: Build the library**

```bash
pnpm run build:lib
```

Expected: No TypeScript errors. If there are errors, they'll point to type mismatches in render functions.

- [ ] **Step 4: Run tests (if any)**

```bash
pnpm test
```

(If tests exist, they should pass. If no tests, skip this.)

- [ ] **Step 5: Final commit summary**

Review all 5 commits in `git log --oneline | head -5` to verify they're there:
```
feat(Ru2-Shop-Products): add font customization...
feat(Ru2-Shop-Filters): add font customization...
feat(Ru2-Shop-Header): add font customization...
feat(Ru1-Shop-Content): add font customization...
feat(Ru1-Shop-Hero): add font customization...
```

---

## Summary

**What gets built:**
- 5 shop/product components with full font family customization
- Font dropdowns appear in editor sidebar for each component
- Renders apply font overrides to all text elements (titles, product names, prices, buttons)

**Files modified:**
- `app/composables/themes/themes-data.ts` (5 components updated in one file)

**No files created, no breaking changes, no migrations needed.**

**Estimated effort:** ~30 minutes (one task ~5–6 minutes each, including verification)
