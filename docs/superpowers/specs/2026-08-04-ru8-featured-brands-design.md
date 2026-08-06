# Ru8-Featured-Brands — Design

## Goal

Add a new "Banner" category block, `Ru8-Featured-Brands`, matching the reference
screenshot: a full-bleed colored section with a centered title, subtitle, CTA
button, and a row of brand/partner logos below.

## Data model

New interface `Ru8FeaturedBrandsData` in `app/composables/layouts/components.ts`:

```ts
interface Ru8BrandItem {
  imageUrl: string
  url: string        // optional link; plain <img> if empty
}

interface Ru8FeaturedBrandsData {
  bgColor: string
  paddingY: number
  title: string
  titleColor: string
  subtitle: string
  subtitleColor: string
  showCta: boolean
  ctaLabel: string
  ctaHref: string
  ctaBgColor: string
  ctaTextColor: string
  logoHeight: number   // px, each logo's max-height
  logoGap: number       // px, gap between logos
  brands: Ru8BrandItem[]
  fontFamily: string
  titleFont: string
  subtitleFont: string
  buttonFont: string
}
```

Defaults approximate the screenshot: green section background, white title/
subtitle text, a darker-green pill CTA button, empty `brands: []`.

## Fields (sidebar)

Grouped with `{ type: 'header' }` separators, following the existing
Ru1-Banner/Ru7 convention:

- **Font** — `fontField('fontFamily', ...)`
- **Section** — `bgColor` (color), `paddingY` (number, px)
- **Title** — `title` (text), `titleColor` (color), title font
- **Subtitle** — `subtitle` (text), `subtitleColor` (color), subtitle font
- **CTA Button** — `showCta` (toggle), `ctaLabel` (text), `ctaHref` (url),
  `ctaBgColor` (color), `ctaTextColor` (color), button font
- **Brands** — `logoHeight` (number, px), `logoGap` (number, px), and a
  `brands` list field with `listFields: [{ imageUrl: image }, { url: url,
  optional }]`

The `imageUrl` list item uses the existing generic `type: 'image'` field,
which already supports both pasting a URL and uploading from the local
computer — no new upload plumbing needed.

No caption/name field per logo, matching the screenshot (logo image only).

## Render

`renderRu8FeaturedBrands(data)`:

- `<section data-component-title="Ru8-Featured-Brands" data-component-props="...">`
  with `background:${bgColor}`, vertical padding, centered flex column
- `<h2>` title, `<p>` subtitle, optional CTA `<a>` pill button — same
  structure/style conventions as `renderBanner` (Ru1-Banner)
- A `flex-wrap;justify-content:center;align-items:center;gap:${logoGap}px`
  row underneath. Each brand renders `<img>` (or `<a><img></a>` when `url`
  is set) with `max-height:${logoHeight}px;width:auto;object-fit:contain`.
  Logos render as uploaded — no forced grayscale/color filter.
- If `brands` is empty, render nothing for the logo row (no placeholder
  tiles), since unlike Ru7's fixed grid this is a free-flowing row.

## Registry wiring

- Add `ru8FeaturedBrandsSvg` thumbnail, interface, defaults, fields, and
  `renderRu8FeaturedBrands` to `app/composables/layouts/components.ts`
  (near the other Banner-family blocks).
- Import them into `app/composables/layouts/useLayouts.ts`.
- Add a `{ title: 'Ru8-Featured-Brands', category: 'Banner', cover_image,
  html_code: renderRu8FeaturedBrands(ru8FeaturedBrandsDefaults) }` entry to
  the `Banner` array.
- Add a matching `blockRegistry.register('Ru8-Featured-Brands', { defaults,
  fields, render })` call in `useLayouts()`.

## Out of scope

- No logo color/grayscale filtering.
- No per-row/column count configuration — logos wrap naturally via flexbox.
- No API-driven brand sync (unlike Ru7's category sync button) — this is a
  fully manual list, since there's no existing "brands" backend endpoint.

## Testing

- `pnpm run build:lib`, then visually verify in the running app: add the
  block from the Banner category, add a few logos (one via URL, one via
  upload), toggle the CTA, confirm it renders and edits correctly in the
  builder canvas.
