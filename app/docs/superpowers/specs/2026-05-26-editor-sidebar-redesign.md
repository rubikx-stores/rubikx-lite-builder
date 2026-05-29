# Editor Sidebar Redesign

**Date:** 2026-05-26  
**Scope:** `app/` folder only  
**Status:** Approved

---

## Goal

Replace the current `EditorSidebar.client.vue` with a redesigned panel that:

- Shows `Editing <tagname>` as the header with an × close button
- Renders block-specific content fields dynamically at the top
- Supports image fields with both URL input and client-side file upload
- Falls back gracefully to element style editors when no block config exists
- All logic lives inside `app/`

---

## Architecture

### Files changed

| File | Change |
|---|---|
| `app/components/EditorSidebar.client.vue` | Full redesign — new header, image upload, field order |
| `app/composables/useEditorSidebar.ts` | Add `closeEditor()`, expose `selectedTag` |
| `app/composables/useBlockRegistry.ts` | No change — registry stays as-is |

No new files required. All logic stays in `app/`.

### Data flow

```
User clicks element in builder
  → store.setElement(el)
  → useEditorSidebar.selectedEl reacts
  → mode computed: 'block' | 'element' | 'none'
  → EditorSidebar renders with:
      header: "Editing <tagname>"
      block fields (if mode === 'block')
      element styles (always, collapsed when block fields present)
```

---

## Section 1 — Header

```
[ × ]                    Editing <Navbar>
─────────────────────────────────────────
```

- Left: `×` button → calls `closeEditor()` which calls `store.setElement(null)`
- Right: `Editing <{label}>` where:
  - If `mode === 'block'`: label = `selectedBlockTitle` (e.g. `Navbar`)
  - If `mode === 'element'`: label = `selectedEl.tagName.toLowerCase()` (e.g. `div`)
- `selectedTag` computed added to `useEditorSidebar` composable

---

## Section 2 — Block Content Fields

Shown only when `mode === 'block'` and block config exists.

Rendered directly (no wrapping "Block Content" section label).

Field types:

| Type | UI |
|---|---|
| `text` / `url` / `number` | Label + text input |
| `color` | Label + color swatch + hex input |
| `toggle` | Label row + toggle switch |
| `select` | Label + `<select>` dropdown |
| `list` | Label + items with sub-fields, ↑↓ reorder, × remove, + Add button |
| `image` | Label + URL input + Upload button + thumbnail preview |

**Fallback:** if `mode === 'block'` but `blockConfig` is null (unregistered block), skip block fields section entirely and render only element styles.

---

## Section 3 — Image Field with Upload

For `FieldConfig type='image'`:

```
Label
[ URL text input ................................ ] [ ↑ Upload ]
[ thumbnail preview if URL is set ]
[ error message if upload failed ]
```

Upload logic (client-side only, no backend):
1. Click "↑ Upload" → trigger hidden `<input type="file" accept="image/*">`
2. `FileReader.readAsDataURL(file)` → base64 data URL
3. On success → call `updateBlockField(field.key, dataUrl)`
4. On `FileReader` error → set `uploadError` ref with message, keep previous value unchanged
5. `uploadError` clears on next successful upload or manual URL change

---

## Section 4 — Element Style Editors

All existing style sections preserved unchanged:
Link, Typography, Background Color, Text Color, Padding, Margin, Border Radius, Border, Opacity, Image (src), Classes, Inline Styles, HTML.

**Collapsed by default** when `mode === 'block'` (block fields are primary).  
**Expanded by default** when `mode === 'element'` (raw element, no block config).

Implemented via a wrapping `<details>` group labeled "Element Styles" that has its `open` attribute bound to `mode !== 'block'`.

---

## Section 5 — Fallback Logic

| Situation | Behavior |
|---|---|
| `mode === 'none'` | Sidebar hidden (slide-out transition) |
| `mode === 'element'` | Header shows tag name, element styles expanded, no block fields |
| `mode === 'block'` + config found | Block fields at top, element styles collapsed below |
| `mode === 'block'` + config missing | Header shows tag name, element styles expanded, no block fields |
| Image upload — FileReader error | Inline error shown, previous field value kept |
| `updateBlockField` / `_applyBlockRender` throws | Console error, DOM not updated, sidebar stays open |
| `closeEditor()` called | `store.setElement(null)`, sidebar slides out |

---

## Composable changes

### `useEditorSidebar.ts`

Add:
```ts
const selectedTag = computed<string>(() => {
  if (mode.value === 'block') return selectedBlockTitle.value ?? ''
  return selectedEl.value?.tagName?.toLowerCase() ?? 'element'
})

function closeEditor() {
  store.setElement(null)
}
```

Export `selectedTag` and `closeEditor`.

---

## Constraints

- All code in `app/` — no changes to `node_modules`, `server/`, or `docs/`
- No new npm packages — use native `FileReader` for upload
- No backend upload endpoint — base64 data URL only
- Keep existing `useBlockRegistry` API unchanged
- Keep existing block render pipeline unchanged
