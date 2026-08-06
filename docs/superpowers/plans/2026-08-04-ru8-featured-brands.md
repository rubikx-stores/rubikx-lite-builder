# Ru8-Featured-Brands Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a new "Banner"-category block, `Ru8-Featured-Brands`, rendering a colored section with centered title/subtitle/CTA and a wrapping row of brand logos.

**Architecture:** Follows the existing Ru-block convention: SVG thumbnail + `XxxData` interface + `xxxDefaults` + `xxxFields: FieldConfig[]` + `renderXxx(data)` in `components.ts`, wired into the picker via `useLayouts.ts`. No new infra — reuses the generic `type: 'image'` field (URL paste + local upload already built in) and the generic `type: 'list'` field for the logo array.

**Tech Stack:** Vue 3 + TypeScript, plain template-literal HTML rendering (no JSX/SFC for block output), no test framework in this repo for render functions — verification is `pnpm run build:lib` (type/build check) plus manual check in the running app per project convention.

## Global Constraints

- `ru-` prefix for any new custom CSS classes; no `pbx-` prefix (none needed here — inline styles only).
- No Tailwind utility classes inside render functions — inline styles only.
- No `max-w-7xl`/`mx-auto` — use `max-width:80rem;margin:0 auto` instead.
- Do not commit any changes — user explicitly requested no commits for this task.
- Build the library (`pnpm run build:lib` from repo root) before the app can pick up changes; do not restart the user's dev server.

---

### Task 1: Define the Ru8-Featured-Brands block (data model, fields, render)

**Files:**
- Modify: `app/composables/layouts/components.ts` — add new block near the other Banner-family blocks (e.g. after `Ru1-Banner` around line 3101, matching existing spacing/comment-header style `// ─── Ru8-Featured-Brands ─── ...`)

**Interfaces:**
- Produces: `ru8FeaturedBrandsSvg: string`, `Ru8BrandItem { imageUrl: string; url: string }`, `Ru8FeaturedBrandsData` (full fields below), `ru8FeaturedBrandsDefaults: Ru8FeaturedBrandsData`, `ru8FeaturedBrandsFields: FieldConfig[]`, `renderRu8FeaturedBrands(data: Ru8FeaturedBrandsData): string`
- Consumes: existing helpers already in `components.ts` — `fontField(key, label)`, `fontCss(fontKey, familyKey)`, `productImageSrc(url)`, and the `FieldConfig` type already imported/defined in that file.

- [ ] **Step 1: Add the thumbnail SVG constant**

```ts
// ─── Ru8-Featured-Brands ──────────────────────────────────────────────────────

export const ru8FeaturedBrandsSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 277.5 100">
  <rect fill="#1f2937" x="0" y="0" width="277.5" height="100"/>
  <rect fill="#9ca3af" x="89" y="14" width="100" height="8" rx="1"/>
  <rect fill="#6b7280" x="99" y="27" width="80" height="4" rx="1"/>
  <rect fill="#4b5563" x="119" y="38" width="40" height="10" rx="3"/>
  <rect fill="#6b7280" x="20" y="66" width="40" height="10" rx="1"/>
  <rect fill="#6b7280" x="72" y="66" width="40" height="10" rx="1"/>
  <rect fill="#6b7280" x="124" y="66" width="40" height="10" rx="1"/>
  <rect fill="#6b7280" x="176" y="66" width="40" height="10" rx="1"/>
  <rect fill="#6b7280" x="228" y="66" width="30" height="10" rx="1"/>
</svg>`
```

- [ ] **Step 2: Add the data interfaces**

```ts
export interface Ru8BrandItem {
  imageUrl: string
  url: string
}

export interface Ru8FeaturedBrandsData {
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
  logoHeight: number
  logoGap: number
  brands: Ru8BrandItem[]
  fontFamily: string
  titleFont: string
  subtitleFont: string
  buttonFont: string
}
```

- [ ] **Step 3: Add the defaults, approximating the reference screenshot**

```ts
export const ru8FeaturedBrandsDefaults: Ru8FeaturedBrandsData = {
  bgColor: '#1f9d55',
  paddingY: 64,
  title: 'Your Favorite Brands',
  titleColor: '#ffffff',
  subtitle: 'Shop the brands you already know and trust—now customized to work for you.',
  subtitleColor: '#ffffff',
  showCta: true,
  ctaLabel: 'Shop By Brand',
  ctaHref: '/shop',
  ctaBgColor: '#166534',
  ctaTextColor: '#ffffff',
  logoHeight: 40,
  logoGap: 48,
  brands: [],
  fontFamily: '',
  titleFont: '',
  subtitleFont: '',
  buttonFont: '',
}
```

- [ ] **Step 4: Add the sidebar field config**

```ts
export const ru8FeaturedBrandsFields: FieldConfig[] = [
  { key: '_h_font', label: 'Font', type: 'header' },
  fontField('fontFamily', 'Font Family'),

  { key: '_h_section', label: 'Section', type: 'header' },
  { key: 'bgColor',  label: 'Background Colour', type: 'color' },
  { key: 'paddingY', label: 'Vertical Padding (px)', type: 'number', placeholder: '64' },

  { key: '_h_title', label: 'Title', type: 'header' },
  { key: 'title',      label: 'Title',        type: 'text', placeholder: 'e.g. Your Favorite Brands' },
  { key: 'titleColor', label: 'Title Colour', type: 'color' },
  fontField('titleFont', 'Title Font'),

  { key: '_h_subtitle', label: 'Subtitle', type: 'header' },
  { key: 'subtitle',      label: 'Subtitle',        type: 'text', placeholder: 'Short supporting line…' },
  { key: 'subtitleColor', label: 'Subtitle Colour', type: 'color' },
  fontField('subtitleFont', 'Subtitle Font'),

  { key: '_h_cta', label: 'CTA Button', type: 'header' },
  { key: 'showCta',      label: 'Show Button',      type: 'toggle' },
  { key: 'ctaLabel',     label: 'Button Text',      type: 'text', placeholder: 'e.g. Shop By Brand' },
  { key: 'ctaHref',      label: 'Button URL',       type: 'url',  placeholder: '/shop' },
  { key: 'ctaBgColor',   label: 'Button Background',  type: 'color' },
  { key: 'ctaTextColor', label: 'Button Text Colour', type: 'color' },
  fontField('buttonFont', 'Button Font'),

  { key: '_h_brands', label: 'Brands', type: 'header' },
  { key: 'logoHeight', label: 'Logo Height (px)', type: 'number', placeholder: '40' },
  { key: 'logoGap',    label: 'Logo Gap (px)',    type: 'number', placeholder: '48' },
  {
    key: 'brands', label: 'Brand Logos', type: 'list',
    listFields: [
      { key: 'imageUrl', label: 'Logo Image',       type: 'image', noAspectRatio: true },
      { key: 'url',      label: 'Link URL (optional)', type: 'url', placeholder: 'https://...' },
    ],
  },
]
```

- [ ] **Step 5: Add the render function**

```ts
export function renderRu8FeaturedBrands(data: Ru8FeaturedBrandsData): string {
  const ctaHtml = data.showCta !== false
    ? `<a href="${data.ctaHref}" style="display:inline-block;margin-top:2rem;padding:0.75rem 2rem;background:${data.ctaBgColor};color:${data.ctaTextColor};text-decoration:none;border-radius:999px;font-size:1rem;font-weight:600;${fontCss(data.buttonFont, data.fontFamily)}">${data.ctaLabel}</a>`
    : ''

  const brands = data.brands ?? []
  const logosHtml = brands.length
    ? `<div style="display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:${data.logoGap}px;margin-top:3rem;">
      ${brands.map((b) => {
        const src = productImageSrc(b.imageUrl)
        if (!src) return ''
        const img = `<img src="${src}" alt="" style="max-height:${data.logoHeight}px;width:auto;object-fit:contain;display:block;" />`
        return b.url
          ? `<a href="${b.url}" style="display:inline-flex;align-items:center;">${img}</a>`
          : img
      }).join('')}
    </div>`
    : ''

  return `<section data-component-title="Ru8-Featured-Brands" data-component-props="${encodeURIComponent(JSON.stringify(data))}" style="background:${data.bgColor};padding:${data.paddingY}px 1rem;${fontCss(undefined, data.fontFamily)}">
  <div style="max-width:80rem;margin:0 auto;width:100%;display:flex;flex-direction:column;align-items:center;text-align:center;">
    <h2 data-field-key="title" style="font-size:min(2.5rem,8vw);font-weight:700;color:${data.titleColor};margin:0;line-height:1.2;${fontCss(data.titleFont, data.fontFamily)}">${data.title}</h2>
    <p data-field-key="subtitle" style="font-size:min(1.125rem,4.5vw);color:${data.subtitleColor};margin:1rem 0 0;max-width:42rem;${fontCss(data.subtitleFont, data.fontFamily)}">${data.subtitle}</p>
    ${ctaHtml}
    ${logosHtml}
  </div>
</section>`
}
```

- [ ] **Step 6: Verify the file still compiles**

Run: `pnpm run build:lib` (from repo root)
Expected: build succeeds with no TypeScript errors mentioning `components.ts` or `Ru8`.

---

### Task 2: Register Ru8-Featured-Brands in the Banner category

**Files:**
- Modify: `app/composables/layouts/useLayouts.ts` — import block near the top (alongside the other Banner-family imports), add a `Banner` array entry, add a `blockRegistry.register(...)` call

**Interfaces:**
- Consumes (from Task 1): `ru8FeaturedBrandsSvg`, `ru8FeaturedBrandsDefaults`, `ru8FeaturedBrandsFields`, `renderRu8FeaturedBrands` — all exported from `./components`.

- [ ] **Step 1: Add the import**

Add to the existing import block pulling from `./components` (near the other `ru7HeroCategoryCollection*`/`renderRu7HeroCategoryCollection` imports):

```ts
  ru8FeaturedBrandsSvg,
  ru8FeaturedBrandsDefaults,
  ru8FeaturedBrandsFields,
  renderRu8FeaturedBrands,
```

- [ ] **Step 2: Add the Banner category entry**

In `layoutComponentRegistry`, append to the `Banner` array (after the existing `Ru7-Hero-Category-Collection` entry):

```ts
  {
    title: 'Ru8-Featured-Brands',
    category: 'Banner',
    cover_image: ru8FeaturedBrandsSvg,
    html_code: renderRu8FeaturedBrands(ru8FeaturedBrandsDefaults),
  },
```

- [ ] **Step 3: Add the block registry registration**

In the `useLayouts()` function body, alongside the other `blockRegistry.register(...)` calls (after the `Ru7-Hero-Category-Collection` one):

```ts
  blockRegistry.register('Ru8-Featured-Brands', {
    defaults: ru8FeaturedBrandsDefaults,
    fields: ru8FeaturedBrandsFields,
    render: renderRu8FeaturedBrands,
  })
```

- [ ] **Step 4: Verify build and registration**

Run: `pnpm run build:lib` (from repo root)
Expected: build succeeds with no errors.

Then check: `grep -n "Ru8-Featured-Brands" app/composables/layouts/useLayouts.ts` should show 3 matches (import usage aside — the Banner array entry and the `register(...)` call, both keyed by the exact string `'Ru8-Featured-Brands'`).

Manual verification (per project convention — no automated test harness for block rendering exists in this repo): after the user restarts their own dev server, open the page builder, find "Ru8-Featured-Brands" under the Banner category, drag it onto a page, add at least one logo via URL paste and one via local upload, toggle the CTA button off/on, and confirm the block renders and all sidebar fields update the canvas live.

---

## Do not commit

Per explicit user instruction for this task: do not run `git add` / `git commit` for any of the above changes. Leave them as uncommitted working-tree changes for the user to review and commit themselves.
