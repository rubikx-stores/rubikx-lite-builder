# Convert 5 Product Templates to Configurable Components — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert 5 static product layout templates into proper configurable block components with font customization, following the Banner component pattern.

**Architecture:** Extract HTML from 5 template definitions in `useLayouts.ts`. For each, create a TypeScript interface, defaults object, fields config with 5 font fields (fontFamily, sectionTitleFont, productNameFont, priceFont, descriptionFont), and render function that applies `fontCss()` to text elements. Register each via `blockRegistry.register()` in useLayouts. All changes in `components.ts` and `useLayouts.ts` only.

**Tech Stack:** Vue 3 + TypeScript, inline styles, existing `fontField()` and `fontCss()` helpers.

## Global Constraints

- Follow Banner component pattern (from `app/composables/layouts/components.ts:1728-1843`)
- Font field names: `fontFamily`, `sectionTitleFont`, `productNameFont`, `priceFont`, `descriptionFont`
- All font fields default to empty string (`''`)
- Apply `fontCss()` to: section titles, product names, prices, descriptions
- Use inline styles only (no Tailwind in render functions)
- Use `ru-` CSS prefix for custom classes (none needed for templates)
- One render function per template; extract from existing HTML in useLayouts.ts
- Each render function returns string with `data-component-title="Template Name"` in section tag
- Register via `blockRegistry.register('Template Name', { defaults, fields, render })`
- **NO COMMITS TO REMOTE** — local changes only

---

## File Structure

**Single file modifications:**
- `app/composables/layouts/components.ts` — Add 5 component definitions (interfaces, defaults, fields, render functions)
- `app/composables/layouts/useLayouts.ts` — Import new components, register via blockRegistry, remove old template objects

---

## Task 1: Show Single Product Component

**Files:**
- Modify: `app/composables/layouts/components.ts` — Add interface, defaults, fields, render function (end of file)
- Modify: `app/composables/layouts/useLayouts.ts` — Remove "Show Single Product" from `layoutComponentRegistry.Products` array (line ~272)

**Interfaces:**
- Consumes: `fontField()` → returns `FieldConfig`
- Consumes: `fontCss(specificFont, blockDefault)` → returns CSS string
- Produces: `ShowSingleProductData` interface, `showSingleProductDefaults`, `showSingleProductFields`, `renderShowSingleProduct(data: ShowSingleProductData): string`

**Steps:**

- [ ] **Step 1: Read current template HTML**

In `app/composables/layouts/useLayouts.ts` (line 272), find the object with `title: 'Show Single Product'` and read its full `html_code` property. Copy it to a text editor for reference — you'll extract this HTML into the render function.

Expected: HTML with single product image, name, description. Extract the entire `html_code` string.

- [ ] **Step 2: Add ShowSingleProductData interface**

In `app/composables/layouts/components.ts`, at the end of the file (after existing component definitions), add:

```ts
export interface ShowSingleProductData {
  products: Product[]
  bgColor: string
  paddingY: number
  paddingX: number
  fontFamily: string
  sectionTitleFont: string
  productNameFont: string
  priceFont: string
  descriptionFont: string
}
```

- [ ] **Step 3: Add showSingleProductDefaults**

After the interface, add:

```ts
export const showSingleProductDefaults: ShowSingleProductData = {
  products: [
    {
      imageUrl: placeholderSvg,
      name: 'Product Name',
      price: '$0.00',
      oldPrice: '',
      buttonLabel: 'Add to Cart',
      buttonUrl: '/shop',
      colors: '',
    },
  ],
  bgColor: '#ffffff',
  paddingY: 24,
  paddingX: 16,
  fontFamily: '',
  sectionTitleFont: '',
  productNameFont: '',
  priceFont: '',
  descriptionFont: '',
}
```

- [ ] **Step 4: Add showSingleProductFields**

```ts
export const showSingleProductFields: FieldConfig[] = [
  { key: '_h_layout', label: 'Layout', type: 'header' },
  { key: 'bgColor', label: 'Background Color', type: 'color' },
  { key: 'paddingY', label: 'Vertical Padding (px)', type: 'number', placeholder: '24' },
  { key: 'paddingX', label: 'Horizontal Padding (px)', type: 'number', placeholder: '16' },

  { key: '_h_fonts', label: 'Fonts', type: 'header' },
  fontField('fontFamily', 'Font Family'),
  fontField('sectionTitleFont', 'Section Title Font'),
  fontField('productNameFont', 'Product Name Font'),
  fontField('priceFont', 'Price Font'),
  fontField('descriptionFont', 'Description Font'),

  { key: '_h_products', label: 'Products', type: 'header' },
  {
    key: 'products',
    label: 'Products',
    type: 'list',
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
```

- [ ] **Step 5: Add renderShowSingleProduct function**

Extract the HTML from the template (Step 1) and convert it to a render function:

```ts
export function renderShowSingleProduct(data: ShowSingleProductData): string {
  const product = data.products[0] || {
    imageUrl: placeholderSvg,
    name: 'Product Name',
    price: '$0.00',
    oldPrice: '',
  }

  return `<section data-component-title="Show Single Product" data-component-props="${encodeURIComponent(JSON.stringify(data))}" style="background:${data.bgColor};padding:${data.paddingY}px ${data.paddingX}px;">
    <div style="max-width:80rem;margin:0 auto;">
      <div style="display:flex;flex-direction:column;align-items:center;gap:1.5rem;">
        <img src="${product.imageUrl || placeholderSvg}" alt="${product.name}" style="width:100%;max-width:400px;aspect-ratio:1;object-fit:cover;" />
        <div style="text-align:center;">
          <h2 style="font-size:1.5rem;font-weight:600;margin:0;${fontCss(data.productNameFont, data.fontFamily)}">${product.name}</h2>
          <p style="font-size:1rem;color:#666;margin:0.5rem 0;${fontCss(data.priceFont, data.fontFamily)}">${product.price}</p>
          <p style="font-size:0.875rem;color:#999;${fontCss(data.descriptionFont, data.fontFamily)}">${product.oldPrice ? `Old Price: ${product.oldPrice}` : 'Start customizing by editing this default text directly in the editor.'}</p>
        </div>
      </div>
    </div>
  </section>`
}
```

- [ ] **Step 6: Verify TypeScript compiles**

Run: `pnpm run build:lib`

Expected: No TypeScript errors in the build output. If errors, they'll be type mismatches in the interface or render function — fix them.

---

## Task 2: Show Multiple Products Component

**Files:**
- Modify: `app/composables/layouts/components.ts` — Add interface, defaults, fields, render (after Task 1)
- Modify: `app/composables/layouts/useLayouts.ts` — Remove "Show Multiple Products" from array (line ~288)

**Interfaces:**
- Produces: `ShowMultipleProductsData`, `showMultipleProductsDefaults`, `showMultipleProductsFields`, `renderShowMultipleProducts()`

**Steps:**

- [ ] **Step 1: Extract HTML from template**

In useLayouts.ts (line 288), find `title: 'Show Multiple Products'` and read its `html_code`. This shows 3 products in a grid.

- [ ] **Step 2: Add ShowMultipleProductsData interface**

```ts
export interface ShowMultipleProductsData {
  products: Product[]
  columns: number
  bgColor: string
  paddingY: number
  paddingX: number
  fontFamily: string
  sectionTitleFont: string
  productNameFont: string
  priceFont: string
  descriptionFont: string
}
```

- [ ] **Step 3: Add showMultipleProductsDefaults**

```ts
export const showMultipleProductsDefaults: ShowMultipleProductsData = {
  products: [
    { imageUrl: placeholderSvg, name: 'Product One', price: '$0', oldPrice: '', buttonLabel: 'Add to Cart', buttonUrl: '/shop', colors: '' },
    { imageUrl: placeholderSvg, name: 'Product Two', price: '$0', oldPrice: '', buttonLabel: 'Add to Cart', buttonUrl: '/shop', colors: '' },
    { imageUrl: placeholderSvg, name: 'Product Three', price: '$0', oldPrice: '', buttonLabel: 'Add to Cart', buttonUrl: '/shop', colors: '' },
  ],
  columns: 3,
  bgColor: '#ffffff',
  paddingY: 24,
  paddingX: 16,
  fontFamily: '',
  sectionTitleFont: '',
  productNameFont: '',
  priceFont: '',
  descriptionFont: '',
}
```

- [ ] **Step 4: Add showMultipleProductsFields**

Same structure as Task 1, plus `columns` field:

```ts
export const showMultipleProductsFields: FieldConfig[] = [
  { key: '_h_layout', label: 'Layout', type: 'header' },
  { key: 'bgColor', label: 'Background Color', type: 'color' },
  { key: 'paddingY', label: 'Vertical Padding (px)', type: 'number', placeholder: '24' },
  { key: 'paddingX', label: 'Horizontal Padding (px)', type: 'number', placeholder: '16' },
  { key: 'columns', label: 'Columns', type: 'select', options: ['1', '2', '3', '4'] },

  { key: '_h_fonts', label: 'Fonts', type: 'header' },
  fontField('fontFamily', 'Font Family'),
  fontField('sectionTitleFont', 'Section Title Font'),
  fontField('productNameFont', 'Product Name Font'),
  fontField('priceFont', 'Price Font'),
  fontField('descriptionFont', 'Description Font'),

  { key: '_h_products', label: 'Products', type: 'header' },
  {
    key: 'products',
    label: 'Products',
    type: 'list',
    listFields: [
      { key: 'imageUrl', label: 'Image', type: 'image', noAspectRatio: true },
      { key: 'name', label: 'Product Name', type: 'text' },
      { key: 'price', label: 'Price', type: 'text' },
      { key: 'oldPrice', label: 'Old Price (optional)', type: 'text' },
      { key: 'buttonLabel', label: 'Button Text', type: 'text' },
      { key: 'buttonUrl', label: 'Button URL', type: 'url' },
      { key: 'colors', label: 'Color Swatches', type: 'text' },
    ],
  },
]
```

- [ ] **Step 5: Add renderShowMultipleProducts function**

Similar to Task 1 but render 3 products in a grid:

```ts
export function renderShowMultipleProducts(data: ShowMultipleProductsData): string {
  const cols = data.columns || 3
  const products = data.products.slice(0, cols)

  const productHtml = products.map(p => `
    <div style="display:flex;flex-direction:column;gap:0.5rem;">
      <img src="${p.imageUrl || placeholderSvg}" alt="${p.name}" style="width:100%;aspect-ratio:1;object-fit:cover;border-radius:4px;" />
      <h3 style="font-size:0.875rem;font-weight:600;margin:0;${fontCss(data.productNameFont, data.fontFamily)}">${p.name}</h3>
      <p style="font-size:0.875rem;margin:0;${fontCss(data.priceFont, data.fontFamily)}">${p.price}</p>
      <p style="font-size:0.75rem;color:#999;${fontCss(data.descriptionFont, data.fontFamily)}">Start customizing by editing this default text directly in the editor.</p>
    </div>
  `).join('')

  return `<section data-component-title="Show Multiple Products" data-component-props="${encodeURIComponent(JSON.stringify(data))}" style="background:${data.bgColor};padding:${data.paddingY}px ${data.paddingX}px;">
    <div style="max-width:80rem;margin:0 auto;">
      <div style="display:grid;grid-template-columns:repeat(${cols}, 1fr);gap:1.5rem;">
        ${productHtml}
      </div>
    </div>
  </section>`
}
```

- [ ] **Step 6: Verify TypeScript**

Run: `pnpm run build:lib`

Expected: No new errors.

---

## Task 3: Show 6 Products Component

**Files:**
- Modify: `app/composables/layouts/components.ts` — Add interface, defaults, fields, render
- Modify: `app/composables/layouts/useLayouts.ts` — Remove "Show 6 Products" (line ~324)

**Interfaces:**
- Produces: `Show6ProductsData`, `show6ProductsDefaults`, `show6ProductsFields`, `renderShow6Products()`

**Steps:**

- [ ] **Step 1: Extract HTML from template**

In useLayouts.ts (line 324), find `title: 'Show 6 Products'` — this is a 3x2 grid (6 products).

- [ ] **Step 2-5: Add interface, defaults, fields, render**

Follow same pattern as Task 2 but with 6 products (3 columns, 2 rows):

```ts
export interface Show6ProductsData {
  products: Product[]
  columns: number
  rows: number
  bgColor: string
  paddingY: number
  paddingX: number
  fontFamily: string
  sectionTitleFont: string
  productNameFont: string
  priceFont: string
  descriptionFont: string
}

export const show6ProductsDefaults: Show6ProductsData = {
  products: [
    { imageUrl: placeholderSvg, name: 'Product One', price: '$0', oldPrice: '', buttonLabel: 'Add to Cart', buttonUrl: '/shop', colors: '' },
    { imageUrl: placeholderSvg, name: 'Product Two', price: '$0', oldPrice: '', buttonLabel: 'Add to Cart', buttonUrl: '/shop', colors: '' },
    { imageUrl: placeholderSvg, name: 'Product Three', price: '$0', oldPrice: '', buttonLabel: 'Add to Cart', buttonUrl: '/shop', colors: '' },
    { imageUrl: placeholderSvg, name: 'Product Four', price: '$0', oldPrice: '', buttonLabel: 'Add to Cart', buttonUrl: '/shop', colors: '' },
    { imageUrl: placeholderSvg, name: 'Product Five', price: '$0', oldPrice: '', buttonLabel: 'Add to Cart', buttonUrl: '/shop', colors: '' },
    { imageUrl: placeholderSvg, name: 'Product Six', price: '$0', oldPrice: '', buttonLabel: 'Add to Cart', buttonUrl: '/shop', colors: '' },
  ],
  columns: 3,
  rows: 2,
  bgColor: '#ffffff',
  paddingY: 24,
  paddingX: 16,
  fontFamily: '',
  sectionTitleFont: '',
  productNameFont: '',
  priceFont: '',
  descriptionFont: '',
}

export const show6ProductsFields: FieldConfig[] = [
  { key: '_h_layout', label: 'Layout', type: 'header' },
  { key: 'bgColor', label: 'Background Color', type: 'color' },
  { key: 'paddingY', label: 'Vertical Padding (px)', type: 'number', placeholder: '24' },
  { key: 'paddingX', label: 'Horizontal Padding (px)', type: 'number', placeholder: '16' },
  { key: 'columns', label: 'Columns', type: 'select', options: ['2', '3', '4'] },
  { key: 'rows', label: 'Rows', type: 'select', options: ['1', '2', '3'] },

  { key: '_h_fonts', label: 'Fonts', type: 'header' },
  fontField('fontFamily', 'Font Family'),
  fontField('sectionTitleFont', 'Section Title Font'),
  fontField('productNameFont', 'Product Name Font'),
  fontField('priceFont', 'Price Font'),
  fontField('descriptionFont', 'Description Font'),

  { key: '_h_products', label: 'Products', type: 'header' },
  {
    key: 'products',
    label: 'Products',
    type: 'list',
    listFields: [
      { key: 'imageUrl', label: 'Image', type: 'image', noAspectRatio: true },
      { key: 'name', label: 'Product Name', type: 'text' },
      { key: 'price', label: 'Price', type: 'text' },
      { key: 'oldPrice', label: 'Old Price (optional)', type: 'text' },
      { key: 'buttonLabel', label: 'Button Text', type: 'text' },
      { key: 'buttonUrl', label: 'Button URL', type: 'url' },
      { key: 'colors', label: 'Color Swatches', type: 'text' },
    ],
  },
]

export function renderShow6Products(data: Show6ProductsData): string {
  const cols = data.columns || 3
  const rows = data.rows || 2
  const maxProducts = cols * rows
  const products = data.products.slice(0, maxProducts)

  const productHtml = products.map(p => `
    <div style="display:flex;flex-direction:column;gap:0.5rem;">
      <img src="${p.imageUrl || placeholderSvg}" alt="${p.name}" style="width:100%;aspect-ratio:1;object-fit:cover;border-radius:4px;" />
      <h3 style="font-size:0.875rem;font-weight:600;margin:0;${fontCss(data.productNameFont, data.fontFamily)}">${p.name}</h3>
      <p style="font-size:0.875rem;margin:0;${fontCss(data.priceFont, data.fontFamily)}">${p.price}</p>
    </div>
  `).join('')

  return `<section data-component-title="Show 6 Products" data-component-props="${encodeURIComponent(JSON.stringify(data))}" style="background:${data.bgColor};padding:${data.paddingY}px ${data.paddingX}px;">
    <div style="max-width:80rem;margin:0 auto;">
      <div style="display:grid;grid-template-columns:repeat(${cols}, 1fr);gap:1.5rem;">
        ${productHtml}
      </div>
    </div>
  </section>`
}
```

- [ ] **Step 6: Verify TypeScript**

Run: `pnpm run build:lib`

Expected: No new errors.

---

## Task 4: Show 6 Products Minimal Component

**Files:**
- Modify: `app/composables/layouts/components.ts` — Add interface, defaults, fields, render
- Modify: `app/composables/layouts/useLayouts.ts` — Remove "Show 6 Products Minimal" (line ~381)

**Interfaces:**
- Produces: `Show6ProductsMinimalData`, `show6ProductsMinimalDefaults`, `show6ProductsMinimalFields`, `renderShow6ProductsMinimal()`

**Steps:**

Same pattern as Task 3 but with "minimal" styling (smaller, more compact layout). Follow the HTML structure from the useLayouts.ts template and apply font customization.

Code structure:

```ts
export interface Show6ProductsMinimalData {
  products: Product[]
  columns: number
  bgColor: string
  paddingY: number
  paddingX: number
  fontFamily: string
  sectionTitleFont: string
  productNameFont: string
  priceFont: string
  descriptionFont: string
}

// defaults: 6 products, columns: 3, minimal styling
// fields: same 5 font fields
// render: compact grid with minimal spacing
```

- [ ] **Step 1: Build and verify**

Run: `pnpm run build:lib`

---

## Task 5: Show 4 Products Centered Component

**Files:**
- Modify: `app/composables/layouts/components.ts` — Add interface, defaults, fields, render
- Modify: `app/composables/layouts/useLayouts.ts` — Remove "Show 4 Products Centered" (line ~438)

**Interfaces:**
- Produces: `Show4ProductsCenteredData`, `show4ProductsCenteredDefaults`, `show4ProductsCenteredFields`, `renderShow4ProductsCentered()`

**Steps:**

Same pattern as Task 3-4 but with 4 products centered layout:

```ts
export interface Show4ProductsCenteredData {
  products: Product[]
  bgColor: string
  paddingY: number
  paddingX: number
  fontFamily: string
  sectionTitleFont: string
  productNameFont: string
  priceFont: string
  descriptionFont: string
}

// defaults: 4 products centered
// fields: same 5 font fields
// render: centered 4-product grid
```

- [ ] **Step 1: Build and verify**

Run: `pnpm run build:lib`

---

## Task 6: Register All Components & Update useLayouts.ts

**Files:**
- Modify: `app/composables/layouts/useLayouts.ts` — Import new components, register via blockRegistry, remove old template objects

**Steps:**

- [ ] **Step 1: Add imports**

At the top of useLayouts.ts, add to the import from `./components`:

```ts
import {
  // ... existing imports ...
  showSingleProductDefaults,
  showSingleProductFields,
  renderShowSingleProduct,
  showMultipleProductsDefaults,
  showMultipleProductsFields,
  renderShowMultipleProducts,
  show6ProductsDefaults,
  show6ProductsFields,
  renderShow6Products,
  show6ProductsMinimalDefaults,
  show6ProductsMinimalFields,
  renderShow6ProductsMinimal,
  show4ProductsCenteredDefaults,
  show4ProductsCenteredFields,
  renderShow4ProductsCentered,
} from './components'
```

- [ ] **Step 2: Remove old template objects**

In useLayouts.ts, find the `layoutComponentRegistry.Products` array (around line 270). Remove the 5 template objects:
- `{ title: 'Show Single Product', ... }`
- `{ title: 'Show Multiple Products', ... }`
- `{ title: 'Show 6 Products', ... }`
- `{ title: 'Show 6 Products Minimal', ... }`
- `{ title: 'Show 4 Products Centered', ... }`

Leave the array structure intact but empty it of these 5 items.

- [ ] **Step 3: Register components in useLayouts()**

In the `useLayouts()` function, find where `blockRegistry.register()` calls are made (around line 570). Add 5 new registrations:

```ts
blockRegistry.register('Show Single Product', {
  defaults: showSingleProductDefaults,
  fields: showSingleProductFields,
  render: renderShowSingleProduct,
})

blockRegistry.register('Show Multiple Products', {
  defaults: showMultipleProductsDefaults,
  fields: showMultipleProductsFields,
  render: renderShowMultipleProducts,
})

blockRegistry.register('Show 6 Products', {
  defaults: show6ProductsDefaults,
  fields: show6ProductsFields,
  render: renderShow6Products,
})

blockRegistry.register('Show 6 Products Minimal', {
  defaults: show6ProductsMinimalDefaults,
  fields: show6ProductsMinimalFields,
  render: renderShow6ProductsMinimal,
})

blockRegistry.register('Show 4 Products Centered', {
  defaults: show4ProductsCenteredDefaults,
  fields: show4ProductsCenteredFields,
  render: renderShow4ProductsCentered,
})
```

- [ ] **Step 4: Verify no TypeScript errors**

Run: `pnpm run build:lib`

Expected: Build passes with no errors. All 5 components should now be registered and ready to use.

- [ ] **Step 5: Verify import count**

In components.ts, run a quick check that all 5 new exports are exported:

```bash
grep -n "^export.*Show.*Products\|^export.*renderShow" app/composables/layouts/components.ts | wc -l
```

Expected: At least 20 matches (4 exports per component × 5 components = 20).

---

## Final Verification

After all 6 tasks complete:

- [ ] **Step 1: Full build**

Run: `pnpm run build:lib`

Expected: Zero errors, zero warnings related to new components.

- [ ] **Step 2: Verify registration**

Check that the 5 components appear in the registry. In a TypeScript file that imports useLayouts, try:

```ts
const { layoutComponentRegistry } = useLayouts()
console.log(Object.keys(layoutComponentRegistry))
```

Expected output includes: 'Show Single Product', 'Show Multiple Products', 'Show 6 Products', 'Show 6 Products Minimal', 'Show 4 Products Centered'.

- [ ] **Step 3: Summary**

All 5 product templates now have:
- ✅ TypeScript interfaces
- ✅ Defaults objects
- ✅ Field configs with 5 font fields each
- ✅ Render functions applying fontCss() to text
- ✅ Registered via blockRegistry
- ✅ Ready to use in editor sidebar with font customization

---

## Summary

**What gets built:**
- 5 product layout components with full font customization
- Font dropdowns appear in editor sidebar for each component
- All render functions apply fonts to product names, prices, descriptions, section titles

**Files modified:**
- `app/composables/layouts/components.ts` (5 new component definitions)
- `app/composables/layouts/useLayouts.ts` (imports, registrations, removed templates)

**No files created, no breaking changes, no remote commits.**

**Estimated effort:** ~45 minutes (5-10 minutes per component + 5 minutes registration + verification)
