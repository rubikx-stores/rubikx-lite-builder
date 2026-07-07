# Font Family Field Placement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the blank "use default font" dropdown option read "Default" instead of blank, and move every component's block-wide "Font Family" field to the top of its editor panel under a new "Font" header.

**Architecture:** Two independent, purely mechanical changes: (1) a one-line display-text fix in the shared sidebar field renderer, and (2) reordering one existing field (plus a new header) to the front of 25 `FieldConfig[]` arrays across two data files. No new components, no logic changes, no data-shape changes.

**Tech Stack:** Vue 3 (`<script setup>` SFC), TypeScript, no test framework in this codebase for these files — verification is `nuxt typecheck` plus manual visual checks in the running builder.

## Global Constraints

- Pure reordering / display-text change only — no changes to `FONT_FAMILY_OPTIONS`, `fontField()`, `fontCss()`, field defaults, or any render function.
- New header key/label must follow the existing convention already used throughout both files: `{ key: '_h_font', label: 'Font', type: 'header' }` (see existing examples like `_h_content`, `_h_style`, `_h_layout`).
- Per-element font override fields (e.g. `titleFont`, `buttonFont`) are untouched and stay exactly where they are — only the one block-wide `fontFamily` field per component moves.
- Design spec: `docs/superpowers/specs/2026-07-06-font-family-field-placement-design.md`.

---

### Task 1: "Default" label for the blank font option

**Files:**
- Modify: `app/components/builder/EditorSidebar.client.vue:559`

**Interfaces:**
- Consumes: nothing from other tasks.
- Produces: nothing consumed by other tasks — fully independent of Tasks 2–4.

- [ ] **Step 1: Make the change**

In `app/components/builder/EditorSidebar.client.vue`, find line 559:

```vue
                  <option v-for="opt in field.options" :key="opt" :value="opt">{{ opt }}</option>
```

Replace with:

```vue
                  <option v-for="opt in field.options" :key="opt" :value="opt">{{ opt || 'Default' }}</option>
```

- [ ] **Step 2: Verify no other `field.options` template exists that this could break**

Run: `grep -n "field.options" app/components/builder/EditorSidebar.client.vue`
Expected: exactly one match, the line just edited (line 559). If there are more matches, stop and re-check the design spec's "Out of scope" section before touching them — this plan only covers the single top-level `type: 'select'` renderer.

- [ ] **Step 3: Type-check**

Run (from `app/`): `pnpm exec nuxt typecheck`
Expected: exits 0, no new errors (pre-existing "Duplicated imports" warnings are unrelated and fine).

- [ ] **Step 4: Commit**

```bash
git add app/components/builder/EditorSidebar.client.vue
git commit -m "fix: show 'Default' instead of blank for the unset font option"
```

---

### Task 2: Move "Font Family" to the top in `themes-data.ts` (4 arrays)

**Files:**
- Modify: `app/composables/themes/themes-data.ts` — `ru1NavbarFields` (line 169), `ru1HeroFields` (line 431), `ru1ProductsFields` (line 616), `ru1FooterFields` (line 852)

**Interfaces:**
- Consumes: nothing from other tasks.
- Produces: nothing consumed by other tasks.

For each of the 4 arrays below, apply the exact same transformation: delete the `fontField('fontFamily', 'Font Family'),` line from its current position (and close up the blank line it leaves behind, if any), then insert `{ key: '_h_font', label: 'Font', type: 'header' },` and `fontField('fontFamily', 'Font Family'),` as the first two entries of the array, followed by a blank line before the array's original first entry.

- [ ] **Step 1: `ru1NavbarFields`**

Current (around line 169):
```ts
export const ru1NavbarFields: FieldConfig[] = [
  { key: '_h_branding', label: 'Branding', type: 'header' },
```

Change to:
```ts
export const ru1NavbarFields: FieldConfig[] = [
  { key: '_h_font', label: 'Font', type: 'header' },
  fontField('fontFamily', 'Font Family'),

  { key: '_h_branding', label: 'Branding', type: 'header' },
```

Current (around line 212-216):
```ts
  { key: 'bgColor', label: 'Background Colour', type: 'color' },
  { key: 'fontSize', label: 'Font Size (px)', type: 'number', step: 1, placeholder: '14' },
  { key: 'fontWeight', label: 'Font Weight', type: 'select', options: ['300', '400', '500', '600', '700', '800'] },
  fontField('fontFamily', 'Font Family'),

```

Change to:
```ts
  { key: 'bgColor', label: 'Background Colour', type: 'color' },
  { key: 'fontSize', label: 'Font Size (px)', type: 'number', step: 1, placeholder: '14' },
  { key: 'fontWeight', label: 'Font Weight', type: 'select', options: ['300', '400', '500', '600', '700', '800'] },

```

- [ ] **Step 2: `ru1HeroFields`**

Current (around line 431):
```ts
export const ru1HeroFields: FieldConfig[] = [
  { key: '_h_image', label: 'Image', type: 'header' },
```

Change to:
```ts
export const ru1HeroFields: FieldConfig[] = [
  { key: '_h_font', label: 'Font', type: 'header' },
  fontField('fontFamily', 'Font Family'),

  { key: '_h_image', label: 'Image', type: 'header' },
```

Current (around line 460-464, end of array):
```ts
  { key: 'paddingY', label: 'Vertical Padding', type: 'number', unit: 'px', step: 4, placeholder: '32' },
  { key: 'paddingX', label: 'Horizontal Padding', type: 'number', unit: 'px', step: 4, placeholder: '24' },
  { key: 'borderRadius', label: 'Corner Radius', type: 'number', unit: 'px', step: 2, placeholder: '8' },
  fontField('fontFamily', 'Font Family'),
]
```

Change to:
```ts
  { key: 'paddingY', label: 'Vertical Padding', type: 'number', unit: 'px', step: 4, placeholder: '32' },
  { key: 'paddingX', label: 'Horizontal Padding', type: 'number', unit: 'px', step: 4, placeholder: '24' },
  { key: 'borderRadius', label: 'Corner Radius', type: 'number', unit: 'px', step: 2, placeholder: '8' },
]
```

- [ ] **Step 3: `ru1ProductsFields`**

Current (around line 616):
```ts
export const ru1ProductsFields: FieldConfig[] = [
  { key: '_h_section', label: 'Section', type: 'header' },
```

Change to:
```ts
export const ru1ProductsFields: FieldConfig[] = [
  { key: '_h_font', label: 'Font', type: 'header' },
  fontField('fontFamily', 'Font Family'),

  { key: '_h_section', label: 'Section', type: 'header' },
```

Current (around line 624-628):
```ts
  { key: 'bgColor', label: 'Section Background', type: 'color' },
  { key: 'paddingY', label: 'Vertical Padding', type: 'number', unit: 'px', step: 4, placeholder: '48' },
  { key: 'paddingX', label: 'Horizontal Padding', type: 'number', unit: 'px', step: 4, placeholder: '16' },
  fontField('fontFamily', 'Font Family'),

```

Change to:
```ts
  { key: 'bgColor', label: 'Section Background', type: 'color' },
  { key: 'paddingY', label: 'Vertical Padding', type: 'number', unit: 'px', step: 4, placeholder: '48' },
  { key: 'paddingX', label: 'Horizontal Padding', type: 'number', unit: 'px', step: 4, placeholder: '16' },

```

- [ ] **Step 4: `ru1FooterFields`**

Current (around line 852):
```ts
export const ru1FooterFields: FieldConfig[] = [
  { key: '_h_content', label: 'Content', type: 'header' },
```

Change to:
```ts
export const ru1FooterFields: FieldConfig[] = [
  { key: '_h_font', label: 'Font', type: 'header' },
  fontField('fontFamily', 'Font Family'),

  { key: '_h_content', label: 'Content', type: 'header' },
```

Current (around line 882-886, end of array):
```ts
  { key: '_h_layout', label: 'Layout', type: 'header' },
  { key: 'paddingY', label: 'Vertical Padding', type: 'number', unit: 'px', step: 4, placeholder: '48' },
  { key: 'paddingX', label: 'Horizontal Padding', type: 'number', unit: 'px', step: 4, placeholder: '16' },
  fontField('fontFamily', 'Font Family'),
]
```

Change to:
```ts
  { key: '_h_layout', label: 'Layout', type: 'header' },
  { key: 'paddingY', label: 'Vertical Padding', type: 'number', unit: 'px', step: 4, placeholder: '48' },
  { key: 'paddingX', label: 'Horizontal Padding', type: 'number', unit: 'px', step: 4, placeholder: '16' },
]
```

- [ ] **Step 5: Type-check**

Run (from `app/`): `pnpm exec nuxt typecheck`
Expected: exits 0, no new errors.

- [ ] **Step 6: Commit**

```bash
git add app/composables/themes/themes-data.ts
git commit -m "refactor: move Font Family field to top of editor panel (themes-data.ts)"
```

---

### Task 3: Move "Font Family" to the top in `layouts/components.ts` — first 11 arrays

**Files:**
- Modify: `app/composables/layouts/components.ts` — `megaMenuHeaderFields` (121), `ru1FormFields` (456), `ru2FormFields` (691), `ru1FooterFields` (909), `ru2FooterFields` (1029), `ru1AboutFields` (1169), `ru2AboutFields` (1437), `ru1FaqFields` (1674), `bannerFields` (1759), `ru2SplitBannerCollageFields` (1976), `ru1StatsFields` (2114)

**Interfaces:**
- Consumes: nothing from other tasks.
- Produces: nothing consumed by other tasks. Independent of Task 4 (different arrays, no overlapping line ranges) — order between Task 3 and Task 4 doesn't matter, but apply each task's edits top-to-bottom by line number within itself so earlier deletions don't shift the line numbers quoted for later ones in the same task.

Same transformation as Task 2, applied to each array below.

- [ ] **Step 1: `megaMenuHeaderFields`**

Current (start, around line 121):
```ts
export const megaMenuHeaderFields: FieldConfig[] = [
  { key: 'logoUrl',         label: 'Logo Image',           type: 'image',
```

Change to:
```ts
export const megaMenuHeaderFields: FieldConfig[] = [
  { key: '_h_font', label: 'Font', type: 'header' },
  fontField('fontFamily', 'Font Family'),

  { key: 'logoUrl',         label: 'Logo Image',           type: 'image',
```

Current (end, around line 191-194):
```ts
  { key: 'showBottomBorder',label: 'Show Bottom Border',    type: 'toggle'  },
  { key: 'bottomBorderColor', label: 'Bottom Border Colour', type: 'color'  },
  fontField('fontFamily', 'Font Family'),
]
```

Change to:
```ts
  { key: 'showBottomBorder',label: 'Show Bottom Border',    type: 'toggle'  },
  { key: 'bottomBorderColor', label: 'Bottom Border Colour', type: 'color'  },
]
```

- [ ] **Step 2: `ru1FormFields`**

Current (start, around line 456):
```ts
export const ru1FormFields: FieldConfig[] = [
  { key: 'title',       label: 'Section Title',      type: 'text',   placeholder: 'e.g. Get in touch'         },
```

Change to:
```ts
export const ru1FormFields: FieldConfig[] = [
  { key: '_h_font', label: 'Font', type: 'header' },
  fontField('fontFamily', 'Font Family'),

  { key: 'title',       label: 'Section Title',      type: 'text',   placeholder: 'e.g. Get in touch'         },
```

Current (around line 467-470):
```ts
  { key: 'submitAlign',   label: 'Submit Button Align',  type: 'select', options: ['left', 'center', 'right'] },
  fontField('buttonFont', 'Button Font'),
  fontField('fontFamily', 'Font Family'),
  {
    key: 'socials', label: 'Social Links', type: 'list',
```

Change to:
```ts
  { key: 'submitAlign',   label: 'Submit Button Align',  type: 'select', options: ['left', 'center', 'right'] },
  fontField('buttonFont', 'Button Font'),
  {
    key: 'socials', label: 'Social Links', type: 'list',
```

- [ ] **Step 3: `ru2FormFields`**

Current (start, around line 691):
```ts
export const ru2FormFields: FieldConfig[] = [
  { key: '_h_panel', label: 'Info Panel', type: 'header' },
```

Change to:
```ts
export const ru2FormFields: FieldConfig[] = [
  { key: '_h_font', label: 'Font', type: 'header' },
  fontField('fontFamily', 'Font Family'),

  { key: '_h_panel', label: 'Info Panel', type: 'header' },
```

Current (around line 733-737):
```ts
  { key: 'inputBorderColor', label: 'Input Border Colour', type: 'color' },
  { key: 'labelColor', label: 'Label Colour', type: 'color' },
  fontField('fontFamily', 'Font Family'),

  { key: '_h_layout', label: 'Layout', type: 'header' },
```

Change to:
```ts
  { key: 'inputBorderColor', label: 'Input Border Colour', type: 'color' },
  { key: 'labelColor', label: 'Label Colour', type: 'color' },

  { key: '_h_layout', label: 'Layout', type: 'header' },
```

- [ ] **Step 4: `ru1FooterFields` (components.ts version)**

Current (start, around line 909):
```ts
export const ru1FooterFields: FieldConfig[] = [
  { key: '_h_content', label: 'Content', type: 'header' },
```

Change to:
```ts
export const ru1FooterFields: FieldConfig[] = [
  { key: '_h_font', label: 'Font', type: 'header' },
  fontField('fontFamily', 'Font Family'),

  { key: '_h_content', label: 'Content', type: 'header' },
```

Current (around line 936-940):
```ts
  { key: 'borderWidth',  label: 'Border Width',        type: 'number', unit: 'px', step: 1, placeholder: '1' },
  { key: 'borderColor',  label: 'Border Color',        type: 'color'  },
  fontField('fontFamily', 'Font Family'),

  { key: '_h_layout', label: 'Layout', type: 'header' },
```

Change to:
```ts
  { key: 'borderWidth',  label: 'Border Width',        type: 'number', unit: 'px', step: 1, placeholder: '1' },
  { key: 'borderColor',  label: 'Border Color',        type: 'color'  },

  { key: '_h_layout', label: 'Layout', type: 'header' },
```

- [ ] **Step 5: `ru2FooterFields`**

Current (start, around line 1029):
```ts
export const ru2FooterFields: FieldConfig[] = [
  { key: 'copyright', label: 'Copyright Text', type: 'text', placeholder: '© 2026 Your Company, Inc.' },
```

Change to:
```ts
export const ru2FooterFields: FieldConfig[] = [
  { key: '_h_font', label: 'Font', type: 'header' },
  fontField('fontFamily', 'Font Family'),

  { key: 'copyright', label: 'Copyright Text', type: 'text', placeholder: '© 2026 Your Company, Inc.' },
```

Current (end, around line 1041-1044):
```ts
  { key: 'paddingY',  label: 'Vertical Padding',  type: 'number', placeholder: '20' },
  { key: 'paddingX',  label: 'Horizontal Padding', type: 'number', placeholder: '32' },
  fontField('fontFamily', 'Font Family'),
]
```

Change to:
```ts
  { key: 'paddingY',  label: 'Vertical Padding',  type: 'number', placeholder: '20' },
  { key: 'paddingX',  label: 'Horizontal Padding', type: 'number', placeholder: '32' },
]
```

- [ ] **Step 6: `ru1AboutFields`**

Current (start, around line 1169):
```ts
export const ru1AboutFields: FieldConfig[] = [
  { key: 'sectionBgColor',  label: 'Section Background',    type: 'color' },
```

Change to:
```ts
export const ru1AboutFields: FieldConfig[] = [
  { key: '_h_font', label: 'Font', type: 'header' },
  fontField('fontFamily', 'Font Family'),

  { key: 'sectionBgColor',  label: 'Section Background',    type: 'color' },
```

Current (end, around line 1200-1203):
```ts
    ],
  },
  fontField('fontFamily', 'Font Family'),
]
```

Change to:
```ts
    ],
  },
]
```

- [ ] **Step 7: `ru2AboutFields`**

Current (start, around line 1437):
```ts
export const ru2AboutFields: FieldConfig[] = [
  { key: '_h_visibility', label: 'Sections', type: 'header' },
```

Change to:
```ts
export const ru2AboutFields: FieldConfig[] = [
  { key: '_h_font', label: 'Font', type: 'header' },
  fontField('fontFamily', 'Font Family'),

  { key: '_h_visibility', label: 'Sections', type: 'header' },
```

Current (around line 1445-1449):
```ts
  { key: 'paddingY', label: 'Vertical Padding (px)', type: 'number', placeholder: '64' },
  { key: 'paddingX', label: 'Horizontal Padding (px)', type: 'number', placeholder: '48' },
  fontField('fontFamily', 'Font Family'),

  { key: '_h_hero', label: 'Hero', type: 'header' },
```

Change to:
```ts
  { key: 'paddingY', label: 'Vertical Padding (px)', type: 'number', placeholder: '64' },
  { key: 'paddingX', label: 'Horizontal Padding (px)', type: 'number', placeholder: '48' },

  { key: '_h_hero', label: 'Hero', type: 'header' },
```

- [ ] **Step 8: `ru1FaqFields`**

Current (start, around line 1674):
```ts
export const ru1FaqFields: FieldConfig[] = [
  { key: 'sectionBgColor', label: 'Section Background',   type: 'color' },
```

Change to:
```ts
export const ru1FaqFields: FieldConfig[] = [
  { key: '_h_font', label: 'Font', type: 'header' },
  fontField('fontFamily', 'Font Family'),

  { key: 'sectionBgColor', label: 'Section Background',   type: 'color' },
```

Current (around line 1694-1697):
```ts
  { key: 'iconColor',      label: 'Icon Colour (+/−)',    type: 'color' },
  { key: 'dividerColor',   label: 'Divider Line Colour',  type: 'color' },
  fontField('fontFamily', 'Font Family'),
  {
    key: 'faqs', label: 'FAQ Items', type: 'list',
```

Change to:
```ts
  { key: 'iconColor',      label: 'Icon Colour (+/−)',    type: 'color' },
  { key: 'dividerColor',   label: 'Divider Line Colour',  type: 'color' },
  {
    key: 'faqs', label: 'FAQ Items', type: 'list',
```

- [ ] **Step 9: `bannerFields`**

Current (start, around line 1759):
```ts
export const bannerFields: FieldConfig[] = [
  { key: 'title',    label: 'Title',    type: 'text',  placeholder: 'e.g. Welcome to Our Store' },
```

Change to:
```ts
export const bannerFields: FieldConfig[] = [
  { key: '_h_font', label: 'Font', type: 'header' },
  fontField('fontFamily', 'Font Family'),

  { key: 'title',    label: 'Title',    type: 'text',  placeholder: 'e.g. Welcome to Our Store' },
```

Current (around line 1774-1778):
```ts
  { key: 'ctaTextColor', label: 'Button Text Colour', type: 'color' },
  fontField('buttonFont', 'Button Font'),
  fontField('fontFamily', 'Font Family'),
  { key: 'paddingY', label: 'Vertical Padding (px)', type: 'number', placeholder: '80' },
]
```

Change to:
```ts
  { key: 'ctaTextColor', label: 'Button Text Colour', type: 'color' },
  fontField('buttonFont', 'Button Font'),
  { key: 'paddingY', label: 'Vertical Padding (px)', type: 'number', placeholder: '80' },
]
```

- [ ] **Step 10: `ru2SplitBannerCollageFields`**

Current (start, around line 1976):
```ts
export const ru2SplitBannerCollageFields: FieldConfig[] = [
  { key: '_h_bg',    label: 'Background', type: 'header' },
```

Change to:
```ts
export const ru2SplitBannerCollageFields: FieldConfig[] = [
  { key: '_h_font', label: 'Font', type: 'header' },
  fontField('fontFamily', 'Font Family'),

  { key: '_h_bg',    label: 'Background', type: 'header' },
```

Current (around line 1980-1984):
```ts
  { key: 'overlayColor',   label: 'Overlay Colour',          type: 'color' },
  { key: 'overlayOpacity', label: 'Overlay Opacity (0–100)', type: 'number', placeholder: '30' },
  fontField('fontFamily', 'Font Family'),

  { key: '_h_title',          label: 'Title', type: 'header' },
```

Change to:
```ts
  { key: 'overlayColor',   label: 'Overlay Colour',          type: 'color' },
  { key: 'overlayOpacity', label: 'Overlay Opacity (0–100)', type: 'number', placeholder: '30' },

  { key: '_h_title',          label: 'Title', type: 'header' },
```

- [ ] **Step 11: `ru1StatsFields`**

Current (start, around line 2114):
```ts
export const ru1StatsFields: FieldConfig[] = [
  { key: '_h_layout', label: 'Layout', type: 'header' },
```

Change to:
```ts
export const ru1StatsFields: FieldConfig[] = [
  { key: '_h_font', label: 'Font', type: 'header' },
  fontField('fontFamily', 'Font Family'),

  { key: '_h_layout', label: 'Layout', type: 'header' },
```

Current (around line 2121-2125):
```ts
  { key: '_h_section', label: 'Section', type: 'header' },
  { key: 'bgColor', label: 'Background Colour', type: 'color' },
  fontField('fontFamily', 'Font Family'),

  { key: '_h_card', label: 'Card Style', type: 'header' },
```

Change to:
```ts
  { key: '_h_section', label: 'Section', type: 'header' },
  { key: 'bgColor', label: 'Background Colour', type: 'color' },

  { key: '_h_card', label: 'Card Style', type: 'header' },
```

- [ ] **Step 12: Type-check**

Run (from `app/`): `pnpm exec nuxt typecheck`
Expected: exits 0, no new errors.

- [ ] **Step 13: Commit**

```bash
git add app/composables/layouts/components.ts
git commit -m "refactor: move Font Family field to top of editor panel (components.ts, part 1)"
```

---

### Task 4: Move "Font Family" to the top in `layouts/components.ts` — remaining 10 arrays

**Files:**
- Modify: `app/composables/layouts/components.ts` — `ru2StatsFields` (2478), `ru3StatsFields` (2706), `ru4StatsFields` (2912), `ru5ImageCarouselFields` (3134), `ru3TextImageHeroFields` (3340), `ru6SplitHeroFields` (3593), `ru4OverlayPanelFields` (3823), `ru1ProductDetailFields` (4218), `ru2ProductDetailFields` (4486), `ru3ProductDetailFields` (5226)

**Interfaces:**
- Consumes: nothing from other tasks. Run this after Task 3 has been committed (both tasks touch the same file; committing Task 3 first keeps diffs reviewable, but the line ranges here don't overlap Task 3's, so order doesn't affect correctness).
- Produces: nothing consumed by other tasks.

Same transformation again.

- [ ] **Step 1: `ru2StatsFields`**

Current (start, around line 2478):
```ts
export const ru2StatsFields: FieldConfig[] = [
  { key: '_h_layout', label: 'Layout', type: 'header' },
```

Change to:
```ts
export const ru2StatsFields: FieldConfig[] = [
  { key: '_h_font', label: 'Font', type: 'header' },
  fontField('fontFamily', 'Font Family'),

  { key: '_h_layout', label: 'Layout', type: 'header' },
```

Current (around line 2484-2488):
```ts
  { key: '_h_section', label: 'Section', type: 'header' },
  { key: 'bgColor', label: 'Background Colour', type: 'color' },
  fontField('fontFamily', 'Font Family'),

  { key: '_h_card', label: 'Card Style', type: 'header' },
```

Change to:
```ts
  { key: '_h_section', label: 'Section', type: 'header' },
  { key: 'bgColor', label: 'Background Colour', type: 'color' },

  { key: '_h_card', label: 'Card Style', type: 'header' },
```

- [ ] **Step 2: `ru3StatsFields`**

Current (start, around line 2706):
```ts
export const ru3StatsFields: FieldConfig[] = [
  { key: '_h_layout', label: 'Layout', type: 'header' },
```

Change to:
```ts
export const ru3StatsFields: FieldConfig[] = [
  { key: '_h_font', label: 'Font', type: 'header' },
  fontField('fontFamily', 'Font Family'),

  { key: '_h_layout', label: 'Layout', type: 'header' },
```

Current (around line 2711-2715):
```ts
  { key: '_h_section', label: 'Section', type: 'header' },
  { key: 'bgColor', label: 'Background Colour', type: 'color' },
  fontField('fontFamily', 'Font Family'),
  { key: 'showSectionTitle', label: 'Show Section Title', type: 'toggle' },
  { key: 'sectionTitle', label: 'Section Title', type: 'text', placeholder: 'e.g. How it works' },
```

Change to:
```ts
  { key: '_h_section', label: 'Section', type: 'header' },
  { key: 'bgColor', label: 'Background Colour', type: 'color' },
  { key: 'showSectionTitle', label: 'Show Section Title', type: 'toggle' },
  { key: 'sectionTitle', label: 'Section Title', type: 'text', placeholder: 'e.g. How it works' },
```

- [ ] **Step 3: `ru4StatsFields`**

Current (start, around line 2912):
```ts
export const ru4StatsFields: FieldConfig[] = [
  { key: '_h_layout', label: 'Layout', type: 'header' },
```

Change to:
```ts
export const ru4StatsFields: FieldConfig[] = [
  { key: '_h_font', label: 'Font', type: 'header' },
  fontField('fontFamily', 'Font Family'),

  { key: '_h_layout', label: 'Layout', type: 'header' },
```

Current (around line 2920-2924):
```ts
  { key: 'showDivider', label: 'Show Divider', type: 'toggle' },
  { key: 'dividerColor', label: 'Divider Colour', type: 'color' },
  fontField('fontFamily', 'Font Family'),

  { key: '_h_title', label: 'Section Title', type: 'header' },
```

Change to:
```ts
  { key: 'showDivider', label: 'Show Divider', type: 'toggle' },
  { key: 'dividerColor', label: 'Divider Colour', type: 'color' },

  { key: '_h_title', label: 'Section Title', type: 'header' },
```

- [ ] **Step 4: `ru5ImageCarouselFields`**

Current (start, around line 3134):
```ts
export const ru5ImageCarouselFields: FieldConfig[] = [
  { key: '_h_layout', label: 'Layout', type: 'header' },
```

Change to:
```ts
export const ru5ImageCarouselFields: FieldConfig[] = [
  { key: '_h_font', label: 'Font', type: 'header' },
  fontField('fontFamily', 'Font Family'),

  { key: '_h_layout', label: 'Layout', type: 'header' },
```

Current (around line 3165-3169):
```ts
  { key: 'ctaBorderRadius', label: 'CTA Button Radius (px)', type: 'number', placeholder: '6' },
  fontField('buttonFont', 'Button Font'),
  fontField('fontFamily', 'Font Family'),

  {
```

Change to:
```ts
  { key: 'ctaBorderRadius', label: 'CTA Button Radius (px)', type: 'number', placeholder: '6' },
  fontField('buttonFont', 'Button Font'),

  {
```

- [ ] **Step 5: `ru3TextImageHeroFields`**

Current (start, around line 3340):
```ts
export const ru3TextImageHeroFields: FieldConfig[] = [
  { key: '_h_section_bg', label: 'Background', type: 'header' },
```

Change to:
```ts
export const ru3TextImageHeroFields: FieldConfig[] = [
  { key: '_h_font', label: 'Font', type: 'header' },
  fontField('fontFamily', 'Font Family'),

  { key: '_h_section_bg', label: 'Background', type: 'header' },
```

Current (end, around line 3385-3388):
```ts
  { key: 'descriptionSize',  label: 'Description Size',  type: 'number', unit: 'px', step: 1, placeholder: '16' },
  fontField('descriptionFont', 'Description Font'),
  fontField('fontFamily', 'Font Family'),
]
```

Change to:
```ts
  { key: 'descriptionSize',  label: 'Description Size',  type: 'number', unit: 'px', step: 1, placeholder: '16' },
  fontField('descriptionFont', 'Description Font'),
]
```

- [ ] **Step 6: `ru6SplitHeroFields`**

Current (start, around line 3593):
```ts
export const ru6SplitHeroFields: FieldConfig[] = [
  { key: '_h_layout', label: 'Layout', type: 'header' },
```

Change to:
```ts
export const ru6SplitHeroFields: FieldConfig[] = [
  { key: '_h_font', label: 'Font', type: 'header' },
  fontField('fontFamily', 'Font Family'),

  { key: '_h_layout', label: 'Layout', type: 'header' },
```

Current (around line 3635-3639):
```ts
  { key: 'secondaryCtaColor', label: 'Secondary CTA Colour', type: 'color' },
  fontField('secondaryButtonFont', 'Secondary CTA Font'),
  fontField('fontFamily', 'Font Family'),

  { key: '_h_image', label: 'Image', type: 'header' },
```

Change to:
```ts
  { key: 'secondaryCtaColor', label: 'Secondary CTA Colour', type: 'color' },
  fontField('secondaryButtonFont', 'Secondary CTA Font'),

  { key: '_h_image', label: 'Image', type: 'header' },
```

- [ ] **Step 7: `ru4OverlayPanelFields`**

Current (start, around line 3823):
```ts
export const ru4OverlayPanelFields: FieldConfig[] = [
  { key: '_h_bg', label: 'Background', type: 'header' },
```

Change to:
```ts
export const ru4OverlayPanelFields: FieldConfig[] = [
  { key: '_h_font', label: 'Font', type: 'header' },
  fontField('fontFamily', 'Font Family'),

  { key: '_h_bg', label: 'Background', type: 'header' },
```

Current (end, around line 3871-3874):
```ts
  { key: 'ctaBorderColor', label: 'Button Border Color', type: 'color' },
  fontField('buttonFont', 'Button Font'),
  fontField('fontFamily', 'Font Family'),
]
```

Change to:
```ts
  { key: 'ctaBorderColor', label: 'Button Border Color', type: 'color' },
  fontField('buttonFont', 'Button Font'),
]
```

- [ ] **Step 8: `ru1ProductDetailFields`**

Current (start, around line 4218):
```ts
export const ru1ProductDetailFields: FieldConfig[] = [
  // ── Gallery layout selector (always visible) ───────────────────────────────
```

Change to:
```ts
export const ru1ProductDetailFields: FieldConfig[] = [
  { key: '_h_font', label: 'Font', type: 'header' },
  fontField('fontFamily', 'Font Family'),

  // ── Gallery layout selector (always visible) ───────────────────────────────
```

Current (around line 4231-4234):
```ts
  fontField('descriptionFont', 'Description Font'),
  fontField('buttonFont', 'Add to Cart Button Font'),
  fontField('fontFamily', 'Font Family'),
  { key: 'sizes', label: 'Sizes (applies to all products)', type: 'list', listFields: [
```

Change to:
```ts
  fontField('descriptionFont', 'Description Font'),
  fontField('buttonFont', 'Add to Cart Button Font'),
  { key: 'sizes', label: 'Sizes (applies to all products)', type: 'list', listFields: [
```

- [ ] **Step 9: `ru2ProductDetailFields`**

Current (start, around line 4486):
```ts
export const ru2ProductDetailFields: FieldConfig[] = [
  { key: '_h_appearance', label: 'Appearance', type: 'header' },
```

Change to:
```ts
export const ru2ProductDetailFields: FieldConfig[] = [
  { key: '_h_font', label: 'Font', type: 'header' },
  fontField('fontFamily', 'Font Family'),

  { key: '_h_appearance', label: 'Appearance', type: 'header' },
```

Current (end, around line 4535-4538):
```ts
  { key: 'paddingY', label: 'Vertical Padding',   type: 'number', unit: 'px', step: 4 },
  { key: 'paddingX', label: 'Horizontal Padding', type: 'number', unit: 'px', step: 4 },
  fontField('fontFamily', 'Font Family'),
]
```

Change to:
```ts
  { key: 'paddingY', label: 'Vertical Padding',   type: 'number', unit: 'px', step: 4 },
  { key: 'paddingX', label: 'Horizontal Padding', type: 'number', unit: 'px', step: 4 },
]
```

- [ ] **Step 10: `ru3ProductDetailFields`**

Current (start, around line 5226):
```ts
export const ru3ProductDetailFields: FieldConfig[] = [
  { key: '_h_appearance', label: 'Appearance', type: 'header' },
```

Change to:
```ts
export const ru3ProductDetailFields: FieldConfig[] = [
  { key: '_h_font', label: 'Font', type: 'header' },
  fontField('fontFamily', 'Font Family'),

  { key: '_h_appearance', label: 'Appearance', type: 'header' },
```

Current (end, around line 5313-5316):
```ts
  { key: 'paddingY', label: 'Vertical Padding',   type: 'number', unit: 'px', step: 4 },
  { key: 'paddingX', label: 'Horizontal Padding', type: 'number', unit: 'px', step: 4 },
  fontField('fontFamily', 'Font Family'),
]
```

Change to:
```ts
  { key: 'paddingY', label: 'Vertical Padding',   type: 'number', unit: 'px', step: 4 },
  { key: 'paddingX', label: 'Horizontal Padding', type: 'number', unit: 'px', step: 4 },
]
```

- [ ] **Step 11: Verify exactly 25 `_h_font` headers now exist across both files**

Run: `grep -rn "_h_font" app/composables/themes/themes-data.ts app/composables/layouts/components.ts | wc -l`
Expected: `25` (4 in `themes-data.ts` + 21 in `components.ts`).

Run: `grep -c "fontField('fontFamily', 'Font Family')" app/composables/themes/themes-data.ts app/composables/layouts/components.ts`
Expected: `themes-data.ts:4` and `components.ts:21` — same counts as before the refactor, confirming no field was duplicated or dropped.

- [ ] **Step 12: Type-check**

Run (from `app/`): `pnpm exec nuxt typecheck`
Expected: exits 0, no new errors.

- [ ] **Step 13: Commit**

```bash
git add app/composables/layouts/components.ts
git commit -m "refactor: move Font Family field to top of editor panel (components.ts, part 2)"
```

---

### Task 5: Manual visual verification

**Files:** none (verification only).

**Interfaces:**
- Consumes: the running builder UI, populated by Tasks 1–4.
- Produces: final confirmation the plan achieved its goal.

- [ ] **Step 1: Start the dev server**

Run (from `app/`): `pnpm run dev`
Expected: Nuxt starts without errors, prints a local URL.

- [ ] **Step 2: Check one `themes-data.ts` component**

In the builder, select a Ru1-Navbar block. In its right-hand editor panel, confirm:
- The very first section header reads "Font", with a "Font Family" dropdown directly under it.
- Opening that dropdown shows "Default" as the first option (not blank).
- The "Branding" section (previously first) now appears right after "Font".

- [ ] **Step 3: Check one `components.ts` component**

Select a Ru3-Text + Image Hero block (or MegaMenuHeader). Confirm the same: "Font" header + "Font Family" dropdown first, "Default" shown for the blank option, and the component's own first section (e.g. "Background") now second.

- [ ] **Step 4: Confirm no behavior regression**

Pick any block, set its "Font Family" to a non-default value (e.g. "Georgia, serif"), and confirm the rendered block's text visibly changes font in the canvas — same behavior as before this refactor, just reached via a field that's now at the top instead of the bottom.

- [ ] **Step 5: Stop the dev server**

Stop the process started in Step 1 (e.g. Ctrl+C, or kill the backgrounded process).
