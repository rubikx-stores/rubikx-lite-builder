# Font Customization for Shop & Product Components

**Date:** 2026-07-13  
**Status:** Design Review  
**Scope:** Add font family customization to all product display and shop page components across Ru1-ShopPage and Ru2-ShopPage themes.

## Overview

Currently, font customization is available in `Ru1 Homepage Featured Products` but missing from shop page components. This spec adds consistent font control across all product display and shop header/filter components.

## Components In Scope

### Ru1-ShopPage (Ru2 Shop series)
1. **Ru1 Shop Hero** (ru2ShopHero)
   - Page title heading
   - Breadcrumb text

2. **Ru1 Shop Content** (ru2ShopContent)
   - Product card titles
   - Product prices
   - "Add to Cart" button text

### Ru2-ShopPage (Ru3 Shop series)
1. **Ru2 Shop Header** (ru3ShopHeader)
   - Page title heading
   - Breadcrumb text
   - Product count label
   - Sort by label

2. **Ru2 Shop Filters** (ru3ShopFilters)
   - Filter button text

3. **Ru2 Shop Products** (ru3ShopProducts)
   - Section title
   - Product card titles
   - Product prices
   - "Load More" button text

## Font Fields to Add

### Ru1 Shop Hero
- `fontFamily` (string) — Default font family for the section
- `titleFont` (string) — Font family for page title

### Ru1 Shop Content
- `fontFamily` (string) — Default font family for the section
- `productNameFont` (string) — Font family for product names
- `priceFont` (string) — Font family for prices
- `buttonFont` (string) — Font family for "Add to Cart" button

### Ru2 Shop Header
- `fontFamily` (string) — Default font family for the section
- `titleFont` (string) — Font family for page title
- `breadcrumbFont` (string) — Font family for breadcrumbs and metadata

### Ru2 Shop Filters
- `fontFamily` (string) — Default font family for the section
- `filterButtonFont` (string) — Font family for filter button text

### Ru2 Shop Products
- `fontFamily` (string) — Default font family for the section
- `sectionTitleFont` (string) — Font family for section title
- `productNameFont` (string) — Font family for product names
- `priceFont` (string) — Font family for prices
- `buttonFont` (string) — Font family for "Load More" button

## Implementation Details

### Font Utilities (Already Exist)
- `fontField(key: string, label: string): FieldConfig` — Creates a font family dropdown field
- `fontCss(role: string | undefined, blockDefault: string | undefined): string` — Returns CSS `font-family` style

### Available Fonts
Font options are defined in `fontFields.ts` and include:
- System fonts (Arial, Verdana, etc.)
- Google Fonts (Poppins, Playfair Display, Oswald, Caveat, Roboto Mono)

### Pattern to Follow

From `Ru1 Homepage Featured Products`:

**Interface:**
```ts
export interface Ru1ProductsData {
  fontFamily: string
  sectionTitleFont: string
  priceFont: string
  productNameFont: string
  buttonFont: string
  // ... other fields
}
```

**Defaults:**
```ts
export const ru1ProductsDefaults: Ru1ProductsData = {
  fontFamily: '',
  sectionTitleFont: '',
  priceFont: '',
  productNameFont: '',
  buttonFont: '',
  // ... other defaults
}
```

**Fields:**
```ts
export const ru1ProductsFields: FieldConfig[] = [
  fontField('fontFamily', 'Font Family'),
  fontField('sectionTitleFont', 'Section Title Font'),
  fontField('priceFont', 'Price Font'),
  fontField('productNameFont', 'Product Name Font'),
  fontField('buttonFont', 'Button Font'),
  // ... other fields
]
```

**Render:**
```ts
// In inline styles:
style="${fontCss(data.productNameFont, data.fontFamily)}"
```

## Data Migration

No migration needed — new font fields default to empty strings, which means "use inheritance" (no override applied).

## Testing

1. **Visual verification** — Each component renders correctly with and without font overrides
2. **UI verification** — Font dropdowns appear in editor sidebar in correct sections
3. **Style verification** — `font-family` CSS is applied correctly to rendered elements

## Files to Modify

1. `app/composables/themes/themes-data.ts`
   - Update `Ru2ShopHeroData`, `Ru2ShopContentData`, `Ru3ShopHeaderData`, `Ru3ShopFiltersData`, `Ru3ShopProductsData` interfaces
   - Update corresponding `Defaults` objects
   - Update corresponding `Fields` arrays
   - Update render functions to apply `fontCss()`

## Success Criteria

- ✅ All 5 components have font customization fields visible in editor sidebar
- ✅ Font dropdowns contain all available fonts from FONT_FAMILY_OPTIONS
- ✅ Selected fonts render correctly in preview and published pages
- ✅ Empty font selection (default) works without breaking layout
- ✅ Follows existing pattern from `Ru1 Homepage Featured Products`
