# Block Registry Expansion — Ru1 Techwire Theme

**Date:** 2026-05-28
**Scope:** `app/composables/themes-data.ts` only
**Status:** Approved

---

## Goal

Expand all four Ru1 Techwire block editor configs (Navbar, Hero, Featured Products, Footer) with richer fields so store owners can fully customise their storefront from the editor panel without touching code. All editor changes reflect on the builder canvas in real time.

---

## Architecture

### Files changed

| File | Change |
|---|---|
| `app/composables/themes-data.ts` | Expand interfaces, defaults, fields arrays, render functions for all 4 blocks |
| `app/composables/useThemes.ts` | No change — already imports and registers all blocks |
| `app/components/EditorSidebar.client.vue` | No change — already handles all FieldConfig types |
| `app/composables/useBlockRegistry.ts` | No change — FieldConfig already supports all required types |

No new files. All logic stays in `themes-data.ts`.

---

## Block 1 — Ru1 Techwire Navbar

### Interface

```ts
interface Ru1NavbarData {
  // Identity
  logoUrl: string           // logo image; falls back to brandName text if empty
  brandName: string
  // Search
  showSearch: boolean
  searchPlaceholder: string
  // Nav links (main row below top bar)
  navLinks: { label: string; url: string; visible: boolean }[]
  // Top-right actions
  showSignIn: boolean
  signInLabel: string
  signInUrl: string
  showContactUs: boolean
  contactUsLabel: string
  contactUsUrl: string
  showCart: boolean
  cartUrl: string
  // Appearance
  bgColor: string           // nav background
  textColor: string         // all link/text colour
  sticky: boolean           // position:sticky top:0
  // Typography
  fontSize: number          // px, applied to nav links
  fontWeight: string        // '300'|'400'|'500'|'600'|'700'|'800'
  // Spacing
  paddingY: number          // vertical padding px
  paddingX: number          // horizontal padding px
  logoWidth: number         // logo image width px
  // Border
  borderStyle: string       // 'none'|'solid'|'dashed'|'dotted'
  borderWidth: number       // px
  borderColor: string
}
```

### Fields (in order, matching sidebar screenshot)

1. `logoUrl` — Logo Image (image)
2. `brandName` — Brand Name (text)
3. `bgColor` — Background Color (color)
4. `sticky` — Sticky Navbar (toggle)
5. `showSearch` — Search Bar (toggle)
6. `searchPlaceholder` — Search Placeholder (text)
7. `navLinks` — Nav Links (list: label text, url url default `#`, visible toggle)
8. `showSignIn` — Show Sign In (toggle)
9. `signInLabel` — Sign In Label (text)
10. `signInUrl` — Sign In URL (url)
11. `showContactUs` — Show Contact Us (toggle)
12. `contactUsLabel` — Contact Us Label (text)
13. `contactUsUrl` — Contact Us URL (url)
14. `showCart` — Show Cart (toggle)
15. `cartUrl` — Cart URL (url)
16. `textColor` — Text Color (color)
17. `fontSize` — Font Size (number)
18. `fontWeight` — Font Weight (select: 300/400/500/600/700/800)
19. `paddingY` — Vertical Padding (number)
20. `paddingX` — Horizontal Padding (number)
21. `logoWidth` — Logo Width (number)
22. `borderStyle` — Border Style (select: none/solid/dashed/dotted)
23. `borderWidth` — Border Width (number)
24. `borderColor` — Border Color (color)

### Render behaviour

- `<nav>` gets inline styles: `background`, `color`, `font-size`, `font-weight`, `padding`, `border-*`, `position:sticky/static`
- Logo: if `logoUrl` is set → `<img style="width:{logoWidth}px">`, else `<span>{brandName}</span>`
- Search bar: shown when `showSearch === true`, placeholder from `searchPlaceholder`
- Nav links: only those with `visible === true` are rendered
- Sign In / Contact Us / Cart: each shown only when their `show*` toggle is true
- Cart links to `cartUrl`

### Defaults

```
logoUrl: '', brandName: 'Your Logo', bgColor: '#ffffff', sticky: false,
showSearch: true, searchPlaceholder: 'Search...',
navLinks: [
  { label: 'Home', url: '/', visible: true },
  { label: 'Shop', url: '/shop', visible: true },
  { label: 'About Us', url: '/about', visible: true },
],
showSignIn: true, signInLabel: 'Sign In', signInUrl: '/signin',
showContactUs: true, contactUsLabel: 'Contact Us', contactUsUrl: '/contact',
showCart: true, cartUrl: '/cart',
textColor: '#111827',
fontSize: 14, fontWeight: '500',
paddingY: 12, paddingX: 16, logoWidth: 120,
borderStyle: 'none', borderWidth: 1, borderColor: '#e5e7eb'
```

---

## Block 2 — Ru1 Techwire Hero

### Interface

```ts
interface Ru1HeroData {
  // Image
  imageUrl: string
  altText: string
  linkUrl: string           // wraps image+overlay in <a> if set
  // Text overlay
  headline: string
  subheadline: string
  textColor: string
  textAlign: string         // 'left'|'center'|'right'
  // Overlay (darkens image for text readability)
  overlayColor: string
  overlayOpacity: number    // 0–100
  // CTA button
  ctaText: string
  ctaUrl: string
  ctaBgColor: string
  ctaTextColor: string
  // Section
  bgColor: string
  paddingY: number
  paddingX: number
  borderRadius: number
}
```

### Fields (in order)

1. `imageUrl` — Banner Image (image)
2. `altText` — Alt Text (text)
3. `linkUrl` — Banner Link URL (url)
4. `headline` — Headline (text)
5. `subheadline` — Subheadline (text)
6. `textColor` — Text Color (color)
7. `textAlign` — Text Alignment (select: left/center/right)
8. `overlayColor` — Overlay Color (color)
9. `overlayOpacity` — Overlay Opacity (number, 0–100)
10. `ctaText` — CTA Button Text (text)
11. `ctaUrl` — CTA Button URL (url)
12. `ctaBgColor` — CTA Button BG Color (color)
13. `ctaTextColor` — CTA Button Text Color (color)
14. `bgColor` — Section Background (color)
15. `paddingY` — Vertical Padding (number)
16. `paddingX` — Horizontal Padding (number)
17. `borderRadius` — Border Radius (number)

### Render behaviour

- Aspect ratio **4:1 is fixed** in render via `style="aspect-ratio:4/1; object-fit:cover; width:100%"`
- Overlay is a `position:absolute inset-0` div with `background` and `opacity` from data
- Headline + subheadline + CTA button are stacked in a `position:absolute` text layer
- If `headline`, `subheadline`, and `ctaText` are all empty → text layer is omitted
- If `linkUrl` is set → entire hero wrapped in `<a href="{linkUrl}">`

### Defaults

```
imageUrl: placeholderSvg, altText: 'Hero image', linkUrl: '',
headline: '', subheadline: '', textColor: '#ffffff', textAlign: 'center',
overlayColor: '#000000', overlayOpacity: 30,
ctaText: '', ctaUrl: '', ctaBgColor: '#2563eb', ctaTextColor: '#ffffff',
bgColor: '#394152', paddingY: 0, paddingX: 0, borderRadius: 0
```

---

## Block 3 — Ru1 Techwire Featured Products

### Interface

```ts
interface Product {
  imageUrl: string
  name: string
  price: string
  oldPrice: string          // strike-through; empty = not shown
  buttonLabel: string
  buttonUrl: string
}

interface Ru1ProductsData {
  sectionTitle: string
  columns: 1 | 2 | 3 | 4
  products: Product[]
  // Appearance
  bgColor: string
  paddingY: number
  paddingX: number
  cardBorderRadius: number
  buttonBgColor: string
  buttonTextColor: string
  oldPriceColor: string
}
```

### Fields (in order)

1. `sectionTitle` — Section Title (text)
2. `columns` — Columns (select: 1/2/3/4)
3. `bgColor` — Section Background (color)
4. `paddingY` — Vertical Padding (number)
5. `paddingX` — Horizontal Padding (number)
6. `cardBorderRadius` — Card Border Radius (number)
7. `buttonBgColor` — Button BG Color (color)
8. `buttonTextColor` — Button Text Color (color)
9. `oldPriceColor` — Old Price Color (color)
10. `products` — Products (list):
    - `imageUrl` — Image (image)
    - `name` — Product Name (text)
    - `price` — Price (text)
    - `oldPrice` — Old Price (text, empty = hidden)
    - `buttonLabel` — Button Text (text)
    - `buttonUrl` — Button URL (url)

### Render behaviour

- Section gets `background`, `padding` inline styles
- Each card gets `border-radius` from `cardBorderRadius`
- Old price shown as `<s style="color:{oldPriceColor}">` only when `oldPrice` is non-empty
- Button gets `background:{buttonBgColor}; color:{buttonTextColor}` inline styles
- Color swatches removed (were hardcoded, not user-editable)

### Defaults

```
sectionTitle: 'Featured Products', columns: 4,
bgColor: '', paddingY: 48, paddingX: 16,
cardBorderRadius: 8,
buttonBgColor: '#111827', buttonTextColor: '#ffffff', oldPriceColor: '#9ca3af',
products: [
  { imageUrl: placeholderSvg, name: 'Product One', price: '$29.99', oldPrice: '', buttonLabel: 'Add to Cart', buttonUrl: '/shop' },
  { imageUrl: placeholderSvg, name: 'Product Two', price: '$39.99', oldPrice: '$49.99', buttonLabel: 'Add to Cart', buttonUrl: '/shop' },
  { imageUrl: placeholderSvg, name: 'Product Three', price: '$49.99', oldPrice: '', buttonLabel: 'Add to Cart', buttonUrl: '/shop' },
  { imageUrl: placeholderSvg, name: 'Product Four', price: '$59.99', oldPrice: '$79.99', buttonLabel: 'Add to Cart', buttonUrl: '/shop' },
]
```

---

## Block 4 — Ru1 Techwire Footer

### Interface

```ts
interface Ru1FooterData {
  tagline: string
  usefulLinks: { label: string; url: string }[]
  contactEmail: string
  contactPhone: string
  copyright: string
  paddingY: number
  paddingX: number
  borderStyle: string
  borderColor: string
}
```

### Fields (in order)

1. `tagline` — Tagline (text)
2. `usefulLinks` — Useful Links (list: label text, url url)
3. `contactEmail` — Contact Email (text)
4. `contactPhone` — Contact Phone (text)
5. `copyright` — Copyright Text (text)
6. `paddingY` — Vertical Padding (number)
7. `paddingX` — Horizontal Padding (number)
8. `borderStyle` — Border Style (select: none/solid/dashed/dotted)
9. `borderColor` — Border Color (color)

### Defaults

```
tagline: 'This site is for employees to order branded apparel and accessories.',
usefulLinks: [
  { label: 'Home', url: '/' }, { label: 'Shop', url: '/shop' },
  { label: 'About Us', url: '/about' }, { label: 'Contact Us', url: '/contact' },
],
contactEmail: 'support@yourdomain.com', contactPhone: '+1 000-000-0000',
copyright: '© Your Store. All rights reserved.',
paddingY: 48, paddingX: 16, borderStyle: 'none', borderColor: '#e5e7eb'
```

---

## Fallback / edge-case rules

| Situation | Behaviour |
|---|---|
| `logoUrl` empty | Show `brandName` text span instead of `<img>` |
| `navLink.visible === false` | Link omitted from render |
| `showSignIn/showContactUs/showCart === false` | Element omitted from render |
| `headline + subheadline + ctaText` all empty | Overlay text layer omitted entirely |
| `ctaText` empty but `headline` set | Only headline/subheadline shown, no button |
| `oldPrice` empty string | `<s>` element not rendered |
| `overlayOpacity === 0` | Overlay div still rendered but invisible (no flicker) |
| `borderStyle === 'none'` | `border` not added to inline style |

---

## Constraints

- All code in `app/` — no changes to `src/`, `node_modules/`, or `server/`
- No new npm packages
- No new files — all changes in `themes-data.ts`
- All field types use existing `FieldConfig` union — no new types needed
- Render functions output plain HTML strings (no Vue, no JSX)
- Real-time updates already wired via `debouncedUpdateBlockField` → `_applyBlockRender` in existing EditorSidebar

---

## Verification

1. Apply the Ru1 Techwire theme to a fresh page
2. Click the **Navbar** section → editor panel shows all 24 fields; toggling Sticky, Show Cart, navLink visibility all re-renders instantly
3. Change navbar bg color → nav background updates without page reload
4. Click **Hero** section → set headline + CTA text → overlay appears on canvas; opacity slider dims the image
5. Click **Featured Products** → change columns to 2 → grid collapses instantly; add old price to a product → strikethrough appears
6. Click **Footer** → change padding and copyright text → footer re-renders
7. Reload page → all changes are persisted (localStorage via existing sync)
