# Convert 5 Product Layout Templates to Configurable Components

**Date:** 2026-07-13  
**Status:** Design Review  
**Scope:** Convert static HTML template layouts into proper configurable block components with full font customization, following the Banner component pattern.

## Overview

Currently, 5 product layout templates ("Show Single Product", "Show Multiple Products", "Show 6 Products", "Show 6 Products Minimal", "Show 4 Products Centered") exist as static hardcoded HTML in `useLayouts.ts` with no customization options.

This spec converts them into proper configurable components with data interfaces, defaults, field configs, and render functions — matching the pattern used by Banner, Contact, and other components. Users will be able to customize fonts for product names, prices, descriptions, and section titles via the editor sidebar.

## Components In Scope

1. **Show Single Product** (single product display)
2. **Show Multiple Products** (3-product grid)
3. **Show 6 Products** (6-product 3x2 grid)
4. **Show 6 Products Minimal** (6-product minimal layout)
5. **Show 4 Products Centered** (4-product centered layout)

## Font Fields to Add (All Components)

Each component will have identical font customization structure:

- `fontFamily: string` — Default/fallback font family for the component
- `sectionTitleFont: string` — Font for section titles (if present in template)
- `productNameFont: string` — Font for product names
- `priceFont: string` — Font for product prices
- `descriptionFont: string` — Font for product descriptions

All default to empty string (`''`) = no override, inherit.

## Implementation Pattern

**Following existing Banner component pattern** (from `app/composables/layouts/components.ts`):

### 1. TypeScript Interface
```ts
export interface ShowSingleProductData {
  // existing fields from template (products array, colors, padding, etc.)
  products: Product[]
  bgColor: string
  paddingY: number
  paddingX: number
  
  // new font fields
  fontFamily: string
  sectionTitleFont: string
  productNameFont: string
  priceFont: string
  descriptionFont: string
}
```

### 2. Defaults Object
```ts
export const showSingleProductDefaults: ShowSingleProductData = {
  // existing defaults
  products: [{ imageUrl: '', name: 'Product Name', price: '$0.00', description: '...' }],
  bgColor: '#ffffff',
  paddingY: 24,
  paddingX: 16,
  
  // font defaults — all empty strings
  fontFamily: '',
  sectionTitleFont: '',
  productNameFont: '',
  priceFont: '',
  descriptionFont: '',
}
```

### 3. Fields Config
```ts
export const showSingleProductFields: FieldConfig[] = [
  { key: '_h_fonts', label: 'Fonts', type: 'header' },
  fontField('fontFamily', 'Font Family'),
  fontField('sectionTitleFont', 'Section Title Font'),
  fontField('productNameFont', 'Product Name Font'),
  fontField('priceFont', 'Price Font'),
  fontField('descriptionFont', 'Description Font'),
  
  // existing layout/color fields...
  { key: 'bgColor', label: 'Background Color', type: 'color' },
  { key: 'paddingY', label: 'Vertical Padding (px)', type: 'number' },
  // etc.
]
```

### 4. Render Function
```ts
export function renderShowSingleProduct(data: ShowSingleProductData): string {
  // Extract current HTML from useLayouts.ts template
  // Apply fontCss() to each text element:
  // - Section title: fontCss(data.sectionTitleFont, data.fontFamily)
  // - Product name: fontCss(data.productNameFont, data.fontFamily)
  // - Price: fontCss(data.priceFont, data.fontFamily)
  // - Description: fontCss(data.descriptionFont, data.fontFamily)
  
  return `<section data-component-title="Show Single Product" 
          data-component-props="${encodeURIComponent(JSON.stringify(data))}"
          style="${fontCss(undefined, data.fontFamily)}...">
    ...rendered HTML with fontCss() applied to text elements...
  </section>`
}
```

### 5. Block Registry Registration
In `useLayouts.ts`:
```ts
blockRegistry.register('Show Single Product', {
  defaults: showSingleProductDefaults,
  fields: showSingleProductFields,
  render: renderShowSingleProduct,
})
```

## Font Utilities (Reuse Existing)

- `fontField(key: string, label: string): FieldConfig` — Creates dropdown field (from `fontFields.ts`)
- `fontCss(specificFont: string | undefined, blockDefault: string | undefined): string` — Returns CSS string (from `fontFields.ts`)

## Data Migration

No migration needed — new font fields default to empty strings (no override applied).

## Files to Modify

1. **`app/composables/layouts/components.ts`**
   - Add 5 new interfaces (ShowSingleProductData, ShowMultipleProductsData, etc.)
   - Add 5 defaults objects
   - Add 5 field config arrays
   - Add 5 render functions
   - Extract HTML from current `useLayouts.ts` templates and convert to render functions

2. **`app/composables/layouts/useLayouts.ts`**
   - Remove static template objects from `layoutComponentRegistry.Products` array (the 5 templates)
   - Remove/update the hardcoded HTML templates
   - Add imports for the 5 new components from `components.ts`
   - Register each component via `blockRegistry.register()`

## Testing Verification

1. **Build check** — `pnpm run build:lib` passes with no TypeScript errors
2. **UI check** — Each of the 5 products components:
   - Appears in the "Products" category in the component picker
   - Shows editor sidebar with "Fonts" section containing 5 font dropdowns
   - Selected fonts render correctly in preview and published pages
   - Empty font selection (default) works without breaking layout
3. **Pattern consistency** — All 5 follow exact same structure (interfaces match, fields order consistent, etc.)

## Success Criteria

- ✅ All 5 components have working font customization in editor sidebar
- ✅ Font dropdowns contain all available fonts from `FONT_FAMILY_OPTIONS`
- ✅ Selected fonts render correctly (no layout breaks)
- ✅ Follows existing Banner component pattern exactly
- ✅ No breaking changes to existing functionality
- ✅ TypeScript compilation passes
