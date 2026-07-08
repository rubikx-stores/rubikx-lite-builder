# Font Family field: "Default" label + top placement

## Context

Every block/theme component in the page builder has a block-wide "Font Family"
dropdown (built via `fontField()` in `app/composables/editor/fontFields.ts`),
plus per-element font overrides (Title Font, Button Font, etc.). Two usability
issues were reported against the current implementation:

1. The dropdown's "use the default/inherited font" option is an empty string,
   which renders as a blank line in the `<select>` instead of readable text.
2. The block-wide "Font Family" control is buried at the bottom (or middle) of
   each component's field list, in 25 different positions depending on the
   component — inconsistent and easy to miss, when it's the field a user most
   likely wants to set first.

## Goals

- The blank font option reads "Default" instead of showing nothing.
- Every component's "Font Family" field appears as the very first thing in its
  editor panel, under a small "Font" section header, consistent across all
  components.

## Design

### 1. "Default" label for the blank option

`app/components/builder/EditorSidebar.client.vue` renders top-level `select`
fields as:

```html
<option v-for="opt in field.options" :key="opt" :value="opt">{{ opt }}</option>
```

Change the display text to `{{ opt || 'Default' }}`. This is a global change
to the select-field renderer, not scoped to font fields specifically — but
it's safe: no other `type: 'select'` field anywhere in `themes-data.ts` or
`layouts/components.ts` uses an empty string as a real option value, so this
can't collide with or relabel anything else. It also mirrors the existing
pattern already used in `BuilderPanel.client.vue`'s "Set Font For Whole Page"
dropdown (`{{ opt || 'Default' }}`).

The other `<option v-for="opt in field.options">` in the same file (for
`subField.type === 'select'` inside list items) is untouched — `fontField()`
is never used inside a `listFields` array, so it's not affected either way.

### 2. Move "Font Family" to the top, under a new "Font" header

For every `fields` array that currently contains a block-wide
`fontField('fontFamily', 'Font Family')` entry, add a matching header and
move both to the front of the array:

```ts
export const someComponentFields: FieldConfig[] = [
  { key: '_h_font', label: 'Font', type: 'header' },
  fontField('fontFamily', 'Font Family'),

  // ...all existing fields follow, unchanged, starting with whatever
  // header/field used to lead the array (e.g. '_h_content', '_h_branding')
]
```

This follows the existing header-naming convention already used throughout
both files (`_h_content`, `_h_style`, `_h_layout`, etc.).

Only the one block-wide `fontFamily` field per component moves. Per-element
font overrides (e.g. `titleFont`, `buttonFont`) are untouched and stay in
their existing sections — they're a different, more specific control than the
block-wide default.

## Scope

Mechanical relocation only — no logic, defaults, or behavior changes. Affects:

- `app/components/builder/EditorSidebar.client.vue` — 1 line (display text).
- `app/composables/themes/themes-data.ts` — 4 fields arrays:
  `ru1NavbarFields`, `ru1HeroFields`, `ru1ProductsFields`, `ru1FooterFields`.
- `app/composables/layouts/components.ts` — 21 fields arrays: every array
  listed in the prior research pass (`megaMenuHeaderFields`, `ru1FormFields`,
  `ru2FormFields`, `ru1FooterFields`, `ru2FooterFields`, `ru1AboutFields`,
  `ru2AboutFields`, `ru1FaqFields`, `bannerFields`,
  `ru2SplitBannerCollageFields`, `ru1StatsFields`, `ru2StatsFields`,
  `ru3StatsFields`, `ru4StatsFields`, `ru5ImageCarouselFields`,
  `ru3TextImageHeroFields`, `ru6SplitHeroFields`, `ru4OverlayPanelFields`,
  `ru1ProductDetailFields`, `ru2ProductDetailFields`, `ru3ProductDetailFields`).

For each of the 25 arrays, the pattern is identical: delete the existing
`fontField('fontFamily', 'Font Family')` line from its current position,
and insert `{ key: '_h_font', label: 'Font', type: 'header' }` plus that same
line as the first two entries of the array.

## Out of scope

- No changes to `FONT_FAMILY_OPTIONS`, `fontField()`, or `fontCss()`.
- No changes to per-element font fields (`titleFont`, `buttonFont`, etc.) or
  their positions.
- No changes to the global "Set Font For Whole Page" control in
  `BuilderPanel.client.vue` (it already shows "Default" correctly).

## Verification

- `nuxt typecheck` (`pnpm run lint` / `nuxt typecheck` in `app/`) must stay
  clean — field-array reordering is type-safe by construction (`FieldConfig[]`
  order doesn't matter to the type system), so this mainly catches typos.
- Visual check in the builder: open the editor panel for a few representative
  components (one from `themes-data.ts`, e.g. Ru1-Navbar; one from
  `components.ts`, e.g. MegaMenuHeader or Ru3-Text + Image Hero) and confirm
  "Font" / "Font Family" is the first section shown, and the dropdown's first
  option reads "Default" instead of blank.
