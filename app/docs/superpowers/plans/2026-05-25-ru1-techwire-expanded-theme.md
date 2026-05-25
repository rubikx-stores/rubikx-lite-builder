# Ru1-Techwire Expanded Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the 4-section Ru1-Techwire theme with a complete 9-section premium eCommerce layout where each section is independently removable.

**Architecture:** Section HTML data is extracted into `composables/themes-data.ts`; `composables/useThemes.ts` keeps only registry logic and imports from that file. Adding future themes requires only appending to `themes-data.ts` and registering metadata in `useThemes.ts` — no new files per theme.

**Tech Stack:** Vue 3 + TypeScript (Nuxt 3), `pbx-` prefixed Tailwind CSS, `@myissue/vue-website-page-builder` (lib untouched), inline `style=""` for gradients.

---

### Task 1: Create `themes-data.ts` — data layer for all theme sections

**Files:**
- Create: `app/composables/themes-data.ts`

> **Note:** This file has already been created and verified. This task documents what was built.

- [x] **Step 1: Confirm file exists with correct exports**

```bash
npx tsc --noEmit
```
Expected: `TypeScript: No errors found`

The file exports:
- `ThemeSection` interface (`{ id: null, title: string, html_code: string }`)
- `ru1TechwireSvg` — SVG string for builder panel cover image
- `ru1TechwireSections` — array of 9 `ThemeSection` objects

- [x] **Step 2: Verify 9 sections are present**

Check that `ru1TechwireSections` contains exactly these titles in order:
1. `'Ru1 Techwire Navbar'`
2. `'Ru1 Techwire Hero'`
3. `'Ru1 Techwire Featured Cards'`
4. `'Ru1 Techwire Product Grid'`
5. `'Ru1 Techwire Categories'`
6. `'Ru1 Techwire Stats'`
7. `'Ru1 Techwire Testimonials'`
8. `'Ru1 Techwire Newsletter'`
9. `'Ru1 Techwire Footer'`

Each entry has `id: null`, a `title` string, and an `html_code` string that starts with `<section data-component-title="Ru1 Techwire ...">`.

---

### Task 2: Update `useThemes.ts` — import data, remove inline HTML

**Files:**
- Modify: `app/composables/useThemes.ts`

> **Note:** Already done and verified.

- [x] **Step 1: Confirm imports are correct**

`useThemes.ts` should begin with:

```ts
import { type ThemeSection, ru1TechwireSections, ru1TechwireSvg } from './themes-data'
```

The file should contain NO inline `html_code` strings and NO `ru1TechwireSvg` SVG definition.

- [x] **Step 2: Confirm `themeRegistry` shape is intact**

```ts
export const themeRegistry: Record<string, Theme> = {
  'ru1-techwire': {
    meta: {
      id: 'ru1-techwire',
      name: 'Ru1-Techwire',
      description: 'Branded employee store theme',
      category: 'General',
      cover_image: ru1TechwireSvg,
    },
    sections: ru1TechwireSections,
  },
}
```

- [x] **Step 3: Confirm `useThemes()` composable is unchanged**

```ts
export function useThemes() {
  async function applyTheme(themeId: string) {
    const theme = themeRegistry[themeId]
    if (!theme) return
    const { getPageBuilder } = await import('@myissue/vue-website-page-builder')
    const builder = getPageBuilder()
    for (const section of [...theme.sections].reverse()) {
      await builder.addComponent(section)
    }
  }
  return { themeRegistry, applyTheme }
}
```

---

### Task 3: Smoke-test in the builder UI

**Files:**
- No file changes — runtime verification only

- [ ] **Step 1: Start the dev server**

```bash
pnpm dev
```

Navigate to the page builder editor (login → dashboard → editor).

- [ ] **Step 2: Open the component panel → Themes tab**

Click `General` or `All` category filter. Confirm:
- `Ru1-Techwire` card is visible
- Cover image SVG shows a recognisable 9-section wireframe layout

- [ ] **Step 3: Apply the theme**

Click the `Ru1-Techwire` card. Confirm:
- All 9 sections appear on the canvas in correct order (Navbar → Hero → Featured Cards → Product Grid → Categories → Stats → Testimonials → Newsletter → Footer)
- Each section renders visually distinct (no blank or broken sections)

- [ ] **Step 4: Verify section independence**

Delete any one section from the builder canvas. Confirm:
- Only that section disappears
- All other 8 sections remain intact and unaffected

- [ ] **Step 5: Verify re-apply works cleanly**

Undo or reset and re-apply the theme. Confirm the full 9 sections reload correctly.

---

### Task 4: Commit

**Files:**
- `app/composables/themes-data.ts` (new)
- `app/composables/useThemes.ts` (modified)
- `app/docs/superpowers/specs/2026-05-25-ru1-techwire-expanded-theme-design.md` (new)
- `app/docs/superpowers/plans/2026-05-25-ru1-techwire-expanded-theme.md` (new)

- [ ] **Step 1: Stage and commit**

```bash
git add app/composables/themes-data.ts app/composables/useThemes.ts app/docs/superpowers/specs/2026-05-25-ru1-techwire-expanded-theme-design.md app/docs/superpowers/plans/2026-05-25-ru1-techwire-expanded-theme.md
git commit -m "feat: expand Ru1-Techwire theme to 9 independent sections and extract theme data layer"
```

---

## Adding a Future Theme (Reference)

When adding a new theme, only two files change — no new files needed:

**1. Append to `app/composables/themes-data.ts`:**

```ts
export const myThemeSections: ThemeSection[] = [
  {
    id: null,
    title: 'My Theme Navbar',
    html_code: `<section data-component-title="My Theme Navbar">...</section>`,
  },
  // ... more sections
]

export const myThemeSvg = `<svg>...</svg>`
```

**2. Register in `app/composables/useThemes.ts`:**

```ts
import { type ThemeSection, ru1TechwireSections, ru1TechwireSvg, myThemeSections, myThemeSvg } from './themes-data'

export const themeRegistry: Record<string, Theme> = {
  'ru1-techwire': { /* existing */ },
  'my-theme': {
    meta: {
      id: 'my-theme',
      name: 'My Theme',
      description: 'Description here',
      category: 'General',
      cover_image: myThemeSvg,
    },
    sections: myThemeSections,
  },
}
```
