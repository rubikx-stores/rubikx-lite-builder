# Sidebar Editor — Design Spec

> **Status:** Approved  
> **Date:** 2026-05-26

---

## Goal

Build a two-mode editor sidebar for the page builder. When the user clicks any element on the canvas the sidebar switches from the library's default global styles UI into an editor. When nothing is selected it returns to normal. All future components automatically get element-style editors with zero setup; structured block content editors are opt-in via a registry.

---

## Architecture

Three new files + three modified files. All changes in `/app` only.

### Core Pieces

**`composables/useBlockRegistry.ts`** (new)
Holds two maps:
- Static config map: `block title → { defaults, fields, render(data) → html }`
- Runtime state map: `block title → current field values`

Exports: `register(title, config)`, `getConfig(title)`, `getData(title)`, `setData(title, data)`

Any block registers itself here. The sidebar reads from it without knowing what specific blocks exist.

**`composables/useEditorSidebar.ts`** (new)
Subscribes to the library's selection event via `getPageBuilder()` on mount. On selection:
- Walks up the DOM from the selected element looking for `[data-component-title]`
- Sets `mode` to `'block'` if the title is found AND exists in the registry
- Sets `mode` to `'element'` otherwise (unregistered block or raw element)
- Sets `mode` to `'none'` on deselect

Exports: `mode`, `selectedEl`, `selectedBlockTitle`, `blockConfig`, `blockData`, `updateBlockField(key, value)`, `updateElementStyle(prop, value)`

`updateBlockField` → updates runtime state → calls `render(data)` → calls library update API  
`updateElementStyle` → writes to `selectedEl.style.*` directly → calls library notify API

**`components/EditorSidebar.client.vue`** (new)
Thin shell. Reads `useEditorSidebar`. Renders one of three states:

| Mode | What renders |
|---|---|
| `'none'` | Library default global styles (pass-through, editor hidden) |
| `'block'` | Block content fields (from registry) + element style editors below |
| `'element'` | Element style editors only |

Global Page Styles always pinned at the bottom in all three states.

---

## Block Registry Shape

```ts
interface FieldConfig {
  key: string
  label: string
  type: 'text' | 'url' | 'color' | 'select' | 'toggle' | 'number' | 'image' | 'list'
  options?: string[]         // for 'select'
  listFields?: FieldConfig[] // for 'list' (e.g. nav links — each item has sub-fields)
}

interface BlockEditorConfig<T = Record<string, any>> {
  defaults: T
  fields: FieldConfig[]
  render: (data: T) => string  // returns html_code for the full block section
}
```

### Registering a Block (example — Navbar)

All three exports live in `composables/themes-data.ts` co-located with the block's HTML:

```ts
export const ru1NavbarDefaults = {
  brandName: 'Your Logo',
  bgColor: '#ffffff',
  showSearch: true,
  navLinks: [{ label: 'Home', url: '/' }, { label: 'Shop', url: '/shop' }],
}

export const ru1NavbarFields: FieldConfig[] = [
  { key: 'brandName', label: 'Brand Name', type: 'text' },
  { key: 'bgColor',   label: 'Background Color', type: 'color' },
  { key: 'showSearch', label: 'Show Search Bar', type: 'toggle' },
  {
    key: 'navLinks', label: 'Nav Links', type: 'list',
    listFields: [
      { key: 'label', label: 'Label', type: 'text' },
      { key: 'url',   label: 'URL',   type: 'url' },
    ],
  },
]

export function renderRu1Navbar(data: typeof ru1NavbarDefaults): string {
  return `<section data-component-title="Ru1 Techwire Navbar">...</section>`
}
```

Registration call in `composables/useThemes.ts`:

```ts
blockRegistry.register('Ru1 Techwire Navbar', {
  defaults: ru1NavbarDefaults,
  fields: ru1NavbarFields,
  render: renderRu1Navbar,
})
```

### Adding a Future Block

Two steps only, no sidebar changes:
1. Export `myDefaults`, `myFields`, `renderMyBlock` from `themes-data.ts`
2. Call `blockRegistry.register('My Block Title', { ... })` in `useThemes.ts`

---

## Element Style Editors

All live inside `EditorSidebar.client.vue` as template sections — no separate files per editor. Subset shown is determined by `selectedEl.tagName`.

| Editor | Shown for |
|---|---|
| Link | all elements |
| Typography (size, weight, family) | `p`, `h1`–`h6`, `span`, `a`, `li` |
| Background Color | all elements |
| Text Color | text elements |
| Padding | all elements |
| Margin | all elements |
| Border Radius | all elements |
| Borders (style, width, color) | all elements |
| Opacity (element + background) | all elements |
| Image (src picker) | `img`, `video`, `iframe` |
| Class (Tailwind / custom) | all elements |
| Style (raw inline CSS) | all elements |
| HTML (raw markup) | all elements |

Each editor reads `selectedEl.style.*` on mount and writes back on user change. Library notify API is called after every write.

---

## Full Data Flow

```
User clicks element on canvas
    ↓
Library fires selection event → useEditorSidebar receives HTMLElement
    ↓
Walk up DOM ancestors for [data-component-title]
    ↓
Title found AND in blockRegistry → mode = 'block'
Title found but NOT in registry  → mode = 'element'
No title found                   → mode = 'element'
No click / deselect              → mode = 'none'
    ↓
EditorSidebar renders based on mode (see table above)
Global Page Styles always at bottom
    ↓
User edits block field:
  → blockState[title][key] = newValue
  → html = blockConfig.render(blockState[title])
  → builder.updateComponent(title, html)

User edits element style:
  → selectedEl.style[prop] = value
  → builder.notifyChange()
```

---

## Default Editor for All Components

Any component added to the builder — whether from the component library, a theme, or a custom paste — automatically gets the full element-style editor on every element inside it. No registration required. Registration only adds the structured block content fields on top.

---

## Sidebar States Summary

| State | Trigger | What shows |
|---|---|---|
| `none` | Nothing selected | Library default global styles |
| `element` | Clicked unregistered element | Element style editors |
| `block` | Clicked registered block | Block content fields + element style editors |
| (all) | Always | Global Page Styles at bottom |

---

## File Map

| File | Change |
|---|---|
| `app/composables/useBlockRegistry.ts` | New — registry core |
| `app/composables/useEditorSidebar.ts` | New — selection state + mode detection |
| `app/components/EditorSidebar.client.vue` | New — sidebar shell + all element editors |
| `app/composables/themes-data.ts` | Modified — add defaults + fields + render per block |
| `app/composables/useThemes.ts` | Modified — register blocks on setup |
| `app/components/PageBuilderWrapper.client.vue` | Modified — mount `<EditorSidebar>` |

3 new files. 3 modified files. Nothing outside `/app`.

---

## Constraints

- All changes in `/app` only — library is untouched
- No inline `<script>` or `<style>` tags in block HTML strings
- Each block section wrapped in `<section data-component-title="...">` — required for mode detection
- No new files beyond the 3 listed above
- Standard Tailwind classes (no `pbx-` prefix) for sidebar UI styling — `pbx-` prefix is only for HTML inside block sections rendered onto the canvas
