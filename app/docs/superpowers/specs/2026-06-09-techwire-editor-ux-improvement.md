# Ru1-Homepage Editor UX Improvement

**Date:** 2026-06-09
**Scope:** Navbar, Hero, Featured Products, Footer block editors
**Goal:** Make all editor fields understandable and usable by non-technical users

---

## Problem

The current editor sidebar presents fields in a flat, ungrouped list with raw number inputs (`paddingY: 48`). Non-technical users have no context for what values are reasonable, fields from unrelated concerns are mixed together, and there is no visual separation between groups like "Colors" and "Layout".

---

## Approach

**Approach A — Header sentinel objects + stepper controls.**

Two minimal additions:
1. Insert `{ type: 'header', label: '...' }` sentinel objects into each block's field array to render section dividers.
2. Add `step` and `placeholder` to number fields; render them as a stepper control (− input +) instead of a plain text input.

No structural refactor of FieldConfig. No collapsible sections. Flat list, better organised.

---

## Changes

### 1. `FieldConfig` type (`useBlockRegistry.ts`)

Add two optional properties to the existing type:

```ts
// Header sentinel — no key, just a visual divider
{ type: 'header', label: string }

// Enhanced number field
{ key: string, label: string, type: 'number', unit?: string, step?: number, placeholder?: number }
```

`step` defaults to `1` in the renderer if omitted.
`placeholder` shows as greyed-out example text when the field has no value.

### 2. Stepper control (`EditorSidebar.client.vue`)

Number fields render as:

```
Label
[ − ]  [ value / placeholder ]  [ + ]
               px
```

- `−` decrements by `step`; `+` increments by `step`
- Input is still directly typeable
- Unit label (`px`, `ms`, `%`) displayed below/beside
- All other field types (color, toggle, select, list, image, column-order) unchanged

### 3. Header rendering (`EditorSidebar.client.vue`)

When a field with `type: 'header'` is encountered:

```
──── Colors ────────────────────
```

A small bold label with a horizontal rule. No interaction, no collapse.

---

## Block Field Groups

### Ru1 Homepage Navbar

| Group | Fields |
|---|---|
| Branding | logoUrl, brandName, logoWidth |
| Navigation | navLinks, showSearch, searchPlaceholder, searchAlign |
| Buttons | showSignIn + signInLabel + signInUrl, showContactUs + contactUsLabel + contactUsUrl, showCart + cartUrl |
| Colors | bgColor, textColor, borderColor |
| Typography | fontSize (step:1, placeholder:14), fontWeight |
| Layout | paddingY (step:4, placeholder:16), paddingX (step:4, placeholder:24), sticky, borderStyle, borderWidth (step:1, placeholder:1) |

### Ru1 Homepage Hero

| Group | Fields |
|---|---|
| Banner | imageUrl, altText, linkUrl, aspectRatio |
| Text | headline, subheadline, textColor, textAlign |
| CTA Button | ctaText, ctaUrl, ctaBgColor, ctaTextColor |
| Overlay | overlayColor, overlayOpacity (step:5, placeholder:40) |
| Layout | bgColor, paddingY (step:4, placeholder:32), paddingX (step:4, placeholder:24), borderRadius (step:2, placeholder:8) |

### Ru1 Homepage Featured Products

| Group | Fields |
|---|---|
| Section | sectionTitle, titleAlign, titleColor |
| Grid | columns, rows |
| Card Style | cardBorderRadius (step:2, placeholder:8), cardAnimation, hoverEffect, hoverAmount (step:1, placeholder:8), animationDuration (step:50, placeholder:300) |
| Pricing | oldPriceColor, buttonBgColor, buttonTextColor |
| Layout | bgColor, paddingY (step:4, placeholder:32), paddingX (step:4, placeholder:24) |
| Products | products (list) |

### Ru1 Homepage Footer

| Group | Fields |
|---|---|
| Content | tagline, usefulLinks, contactEmail, contactPhone, copyright |
| Colors | bgColor, textColor, borderColor |
| Layout | paddingY (step:4, placeholder:32), paddingX (step:4, placeholder:24), borderStyle, borderWidth (step:1, placeholder:1), columnOrder |

---

## Stepper Step & Placeholder Reference

| Field | Step | Placeholder | Unit |
|---|---|---|---|
| logoWidth | 4 | 120 | px |
| fontSize | 1 | 14 | px |
| borderWidth | 1 | 1 | px |
| paddingY | 4 | 32 | px |
| paddingX | 4 | 24 | px |
| overlayOpacity | 5 | 40 | % |
| borderRadius | 2 | 8 | px |
| cardBorderRadius | 2 | 8 | px |
| hoverAmount | 1 | 8 | px |
| animationDuration | 50 | 300 | ms |

---

## Files to Change

| File | What changes |
|---|---|
| `app/composables/editor/useBlockRegistry.ts` | Add `step`, `placeholder` to FieldConfig type; add `type: 'header'` union |
| `app/composables/themes/themes-data.ts` | Insert header sentinels + add step/placeholder to all number fields in all 4 blocks |
| `app/components/builder/EditorSidebar.client.vue` | Render `type: 'header'` as section divider; render `type: 'number'` as stepper |

---

## Out of Scope

- Font weight labels (stays as current numeric select)
- Collapsible/accordion sections
- Any layout/theme changes to the sidebar shell
- Any block other than the four Homepage blocks
