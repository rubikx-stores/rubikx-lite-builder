# Helper Components Editable Blocks Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give all 11 "Helper Components" (Text, Header H2–H6, YouTube Video, Break Divider, Left/Centered/Right Positioned Button) a real right-panel field editor, matching how every other block (`Ru1-Banner`, `Ru1-Navbar`, etc.) already works.

**Architecture:** Add app-side `{defaults, fields, render}` definitions for all 11 titles in a new file, register them in the existing `blockRegistry`, and swap the Helper Components picker's static HTML for `render(defaults)` output so every freshly-dropped instance is self-describing from the start (exactly like every other block). No changes to the library (`src/`) or to `EditorSidebar.client.vue`/`useEditorSidebar.ts` — the existing `data-component-title` → registry matching does the rest once these 11 are registered.

**Tech Stack:** Vue 3 `<script setup>`, Nuxt 3 (auto-imported composables), TypeScript. No unit-test framework covers app-side render-function blocks in this repo (confirmed: none of the 40+ existing `Ru1-*`/`Ru2-*` blocks in `themes-data.ts`/`components.ts` have test files) — verification for each task is `npx nuxt typecheck` (must pass with zero new errors) plus a manual check in the running dev server, matching how every sibling block in this codebase was actually built and verified.

## Global Constraints

- No changes to `src/` (the library) — everything lives under `app/composables/helpers/` and one small edit to `app/components/builder/BuilderPanel.client.vue`.
- `data-component-title` on each render function's root `<section>` must exactly match the corresponding title string already in `src/utils/html-elements/componentHelpers.ts`: `'Text'`, `'Header H2'`, `'Header H3'`, `'Header H4'`, `'Header H5'`, `'Header H6'`, `'YouTube Video'`, `'Break Divider'`, `'Left Positioned Button'`, `'Centered Button'`, `'Right Positioned Button'`.
- Every `render(data)` function returns a single root `<section data-component-title="..." data-component-props="${encodeURIComponent(JSON.stringify(data))}" ...>...</section>` — this is the contract every other block in the registry follows (see `renderBanner` in `app/composables/layouts/components.ts:1805-1854`) and what `useEditorSidebar.ts`/`PageBuilderWrapper.client.vue`'s save logic expects.
- Follow existing field-config conventions exactly: `fontField(key, label)` for any font-family dropdown, a `{ key: '_h_font', label: 'Font', type: 'header' }` divider before it, `FieldConfig['type']` values limited to the union already defined in `app/composables/editor/useBlockRegistry.ts:6` (`'text' | 'textarea' | 'url' | 'color' | 'select' | 'toggle' | 'number' | 'image' | 'list' | 'column-order' | 'header'`).
- Buttons keep their fixed alignment per variant (not user-editable) — only `Left Positioned Button`/`Centered Button`/`Right Positioned Button` differ in default `justify-content`.
- Run `npx nuxt typecheck` from the `app/` directory after every task; it must complete with no new errors (pre-existing duplicate-import warnings between `themes-data.ts` and `components.ts` are unrelated and expected).

---

### Task 1: Text block

**Files:**
- Create: `app/composables/helpers/helperBlocks.ts`

**Interfaces:**
- Produces: `interface HelperTextData { content: string; fontFamily: string; fontSize: number; fontWeight: string; color: string; textAlign: string; paddingY: number }`, `helperTextDefaults: HelperTextData`, `helperTextFields: FieldConfig[]`, `renderHelperText(data: HelperTextData): string`

- [ ] **Step 1: Create the file with the Text block definition**

```ts
import type { FieldConfig } from '../editor/useBlockRegistry'
import { fontField, fontCss } from '../editor/fontFields'

// ─── Text ─────────────────────────────────────────────────────────────────────

export interface HelperTextData {
  content: string
  fontFamily: string
  fontSize: number
  fontWeight: string
  color: string
  textAlign: string
  paddingY: number
}

export const helperTextDefaults: HelperTextData = {
  content: 'Start customizing by editing this default text directly in the editor.',
  fontFamily: '',
  fontSize: 16,
  fontWeight: '400',
  color: '#111827',
  textAlign: 'left',
  paddingY: 16,
}

export const helperTextFields: FieldConfig[] = [
  { key: '_h_font', label: 'Font', type: 'header' },
  fontField('fontFamily', 'Font Family'),
  { key: 'content', label: 'Text', type: 'textarea', placeholder: 'Enter your text…' },
  { key: 'fontSize', label: 'Font Size', type: 'number', unit: 'px', step: 1 },
  { key: 'fontWeight', label: 'Font Weight', type: 'select', options: ['400', '500', '600', '700'] },
  { key: 'color', label: 'Text Color', type: 'color' },
  { key: 'textAlign', label: 'Text Alignment', type: 'select', options: ['left', 'center', 'right'] },
  { key: 'paddingY', label: 'Vertical Padding', type: 'number', unit: 'px', step: 4 },
]

export function renderHelperText(data: HelperTextData): string {
  return `<section data-component-title="Text" data-component-props="${encodeURIComponent(JSON.stringify(data))}" style="padding:${data.paddingY}px 16px;${fontCss(undefined, data.fontFamily)}">
  <div style="max-width:80rem;margin:0 auto;">
    <p style="margin:0;font-size:${data.fontSize}px;font-weight:${data.fontWeight};color:${data.color};text-align:${data.textAlign};white-space:pre-wrap;">${data.content}</p>
  </div>
</section>`
}
```

- [ ] **Step 2: Typecheck**

Run from `app/`: `npx nuxt typecheck`
Expected: no errors referencing `helperBlocks.ts`

- [ ] **Step 3: Commit**

```bash
git add app/composables/helpers/helperBlocks.ts
git commit -m "feat: add Text helper block definition"
```

---

### Task 2: Header H2–H6 blocks

**Files:**
- Modify: `app/composables/helpers/helperBlocks.ts`

**Interfaces:**
- Consumes: `FieldConfig` (from Task 1's import), `fontField`, `fontCss`
- Produces: `interface HelperHeaderData { content: string; fontFamily: string; fontSize: number; fontWeight: string; color: string; textAlign: string; paddingY: number }`; for each level `L` in `H2`..`H6`: `helperHeader${L}Defaults`, `helperHeader${L}Fields`, `renderHelperHeader${L}(data: HelperHeaderData): string` (e.g. `helperHeaderH2Defaults`, `helperHeaderH2Fields`, `renderHelperHeaderH2`)

- [ ] **Step 1: Append the header factory and 5 exports**

Add to the end of `app/composables/helpers/helperBlocks.ts`:

```ts

// ─── Headers (H2–H6) ────────────────────────────────────────────────────────────
// Identical fields across all 5 levels — only the tag name and default font
// size differ, so they're built through one shared factory instead of 5
// near-duplicate blocks.

export interface HelperHeaderData {
  content: string
  fontFamily: string
  fontSize: number
  fontWeight: string
  color: string
  textAlign: string
  paddingY: number
}

function makeHeaderBlock(tag: string, title: string, defaultFontSize: number) {
  const defaults: HelperHeaderData = {
    content: 'Layouts and visual.',
    fontFamily: '',
    fontSize: defaultFontSize,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'left',
    paddingY: 16,
  }

  const fields: FieldConfig[] = [
    { key: '_h_font', label: 'Font', type: 'header' },
    fontField('fontFamily', 'Font Family'),
    { key: 'content', label: 'Heading Text', type: 'text', placeholder: 'Enter heading…' },
    { key: 'fontSize', label: 'Font Size', type: 'number', unit: 'px', step: 1 },
    { key: 'fontWeight', label: 'Font Weight', type: 'select', options: ['400', '500', '600', '700', '800'] },
    { key: 'color', label: 'Text Color', type: 'color' },
    { key: 'textAlign', label: 'Text Alignment', type: 'select', options: ['left', 'center', 'right'] },
    { key: 'paddingY', label: 'Vertical Padding', type: 'number', unit: 'px', step: 4 },
  ]

  function render(data: HelperHeaderData): string {
    return `<section data-component-title="${title}" data-component-props="${encodeURIComponent(JSON.stringify(data))}" style="padding:${data.paddingY}px 16px;${fontCss(undefined, data.fontFamily)}">
  <div style="max-width:80rem;margin:0 auto;">
    <${tag} style="margin:0;font-size:${data.fontSize}px;font-weight:${data.fontWeight};color:${data.color};text-align:${data.textAlign};">${data.content}</${tag}>
  </div>
</section>`
  }

  return { defaults, fields, render }
}

export const {
  defaults: helperHeaderH2Defaults,
  fields: helperHeaderH2Fields,
  render: renderHelperHeaderH2,
} = makeHeaderBlock('h2', 'Header H2', 32)

export const {
  defaults: helperHeaderH3Defaults,
  fields: helperHeaderH3Fields,
  render: renderHelperHeaderH3,
} = makeHeaderBlock('h3', 'Header H3', 28)

export const {
  defaults: helperHeaderH4Defaults,
  fields: helperHeaderH4Fields,
  render: renderHelperHeaderH4,
} = makeHeaderBlock('h4', 'Header H4', 24)

export const {
  defaults: helperHeaderH5Defaults,
  fields: helperHeaderH5Fields,
  render: renderHelperHeaderH5,
} = makeHeaderBlock('h5', 'Header H5', 20)

export const {
  defaults: helperHeaderH6Defaults,
  fields: helperHeaderH6Fields,
  render: renderHelperHeaderH6,
} = makeHeaderBlock('h6', 'Header H6', 16)
```

- [ ] **Step 2: Typecheck**

Run from `app/`: `npx nuxt typecheck`
Expected: no errors referencing `helperBlocks.ts`

- [ ] **Step 3: Commit**

```bash
git add app/composables/helpers/helperBlocks.ts
git commit -m "feat: add Header H2-H6 helper block definitions"
```

---

### Task 3: YouTube Video block

**Files:**
- Modify: `app/composables/helpers/helperBlocks.ts`

**Interfaces:**
- Consumes: `FieldConfig` (Task 1's import)
- Produces: `interface HelperYoutubeData { videoUrl: string; aspectRatio: string; extraHeight: number; paddingY: number }`, `helperYoutubeDefaults`, `helperYoutubeFields`, `renderHelperYoutube(data: HelperYoutubeData): string`

- [ ] **Step 1: Append the YouTube Video block**

Add to the end of `app/composables/helpers/helperBlocks.ts`:

```ts

// ─── YouTube Video ──────────────────────────────────────────────────────────────
// Aspect ratio + extra-height follows the same idea as Ru1Hero's aspectRatio/
// extraHeight fields (app/composables/themes/themes-data.ts:470-478): the ratio
// sets a responsive base height via the padding-top percentage trick, and
// extraHeight adds on top of that via calc() rather than overriding it outright.

export interface HelperYoutubeData {
  videoUrl: string
  aspectRatio: string
  extraHeight: number
  paddingY: number
}

export const helperYoutubeDefaults: HelperYoutubeData = {
  videoUrl: '',
  aspectRatio: '16/9',
  extraHeight: 0,
  paddingY: 16,
}

export const helperYoutubeFields: FieldConfig[] = [
  { key: 'videoUrl', label: 'YouTube Video URL or ID', type: 'url', placeholder: 'https://www.youtube.com/watch?v=…' },
  { key: 'aspectRatio', label: 'Aspect Ratio', type: 'select', options: ['16/9', '4/3', '1/1', '9/16', '21/9'] },
  { key: 'extraHeight', label: 'Extra Height', type: 'number', unit: 'px', step: 10, placeholder: '0' },
  { key: 'paddingY', label: 'Vertical Padding', type: 'number', unit: 'px', step: 4 },
]

function helperYoutubeEmbedSrc(input: string): string {
  const idMatch = input.match(/(?:youtu\.be\/|[?&]v=|embed\/)([\w-]{11})/)
  const id = idMatch ? idMatch[1] : input.trim()
  return id ? `https://www.youtube.com/embed/${id}` : ''
}

function helperYoutubeRatioPercent(ratio: string): number {
  const [w, h] = ratio.split('/').map(Number)
  return w > 0 && h > 0 ? (h / w) * 100 : 56.25
}

export function renderHelperYoutube(data: HelperYoutubeData): string {
  const percent = helperYoutubeRatioPercent(data.aspectRatio)
  const boxHeight = data.extraHeight ? `calc(${percent}% + ${data.extraHeight}px)` : `${percent}%`
  const src = helperYoutubeEmbedSrc(data.videoUrl)
  return `<section data-component-title="YouTube Video" data-component-props="${encodeURIComponent(JSON.stringify(data))}" style="padding:${data.paddingY}px 16px;">
  <div style="max-width:80rem;margin:0 auto;">
    <div style="position:relative;width:100%;height:0;padding-top:${boxHeight};background:#f3f4f6;">
      ${src ? `<iframe src="${src}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen" allowfullscreen></iframe>` : ''}
    </div>
  </div>
</section>`
}
```

- [ ] **Step 2: Typecheck**

Run from `app/`: `npx nuxt typecheck`
Expected: no errors referencing `helperBlocks.ts`

- [ ] **Step 3: Commit**

```bash
git add app/composables/helpers/helperBlocks.ts
git commit -m "feat: add YouTube Video helper block definition"
```

---

### Task 4: Break Divider block

**Files:**
- Modify: `app/composables/helpers/helperBlocks.ts`

**Interfaces:**
- Consumes: `FieldConfig` (Task 1's import)
- Produces: `interface HelperDividerData { color: string; thickness: number; width: number; spacing: number }`, `helperDividerDefaults`, `helperDividerFields`, `renderHelperDivider(data: HelperDividerData): string`

- [ ] **Step 1: Append the Break Divider block**

Add to the end of `app/composables/helpers/helperBlocks.ts`:

```ts

// ─── Break Divider ──────────────────────────────────────────────────────────────

export interface HelperDividerData {
  color: string
  thickness: number
  width: number
  spacing: number
}

export const helperDividerDefaults: HelperDividerData = {
  color: '#d1d5db',
  thickness: 1,
  width: 100,
  spacing: 32,
}

export const helperDividerFields: FieldConfig[] = [
  { key: 'color', label: 'Color', type: 'color' },
  { key: 'thickness', label: 'Thickness', type: 'number', unit: 'px', step: 1 },
  { key: 'width', label: 'Width', type: 'number', unit: '%', step: 5 },
  { key: 'spacing', label: 'Vertical Spacing', type: 'number', unit: 'px', step: 4 },
]

export function renderHelperDivider(data: HelperDividerData): string {
  return `<section data-component-title="Break Divider" data-component-props="${encodeURIComponent(JSON.stringify(data))}" style="padding:${data.spacing}px 16px;">
  <div style="max-width:80rem;margin:0 auto;display:flex;justify-content:center;">
    <div style="width:${data.width}%;border-top:${data.thickness}px solid ${data.color};"></div>
  </div>
</section>`
}
```

- [ ] **Step 2: Typecheck**

Run from `app/`: `npx nuxt typecheck`
Expected: no errors referencing `helperBlocks.ts`

- [ ] **Step 3: Commit**

```bash
git add app/composables/helpers/helperBlocks.ts
git commit -m "feat: add Break Divider helper block definition"
```

---

### Task 5: Button blocks (Left / Centered / Right Positioned)

**Files:**
- Modify: `app/composables/helpers/helperBlocks.ts`

**Interfaces:**
- Consumes: `FieldConfig`, `fontField`, `fontCss` (Task 1's imports)
- Produces: `interface HelperButtonData { label: string; href: string; fontFamily: string; fontSize: number; fontWeight: string; textColor: string; bgColor: string; paddingX: number; paddingY: number }`; for each variant: `helperButtonLeftDefaults`/`helperButtonLeftFields`/`renderHelperButtonLeft`, `helperButtonCenterDefaults`/`helperButtonCenterFields`/`renderHelperButtonCenter`, `helperButtonRightDefaults`/`helperButtonRightFields`/`renderHelperButtonRight`

- [ ] **Step 1: Append the button factory and 3 exports**

Add to the end of `app/composables/helpers/helperBlocks.ts`:

```ts

// ─── Buttons (Left / Centered / Right Positioned) ──────────────────────────────
// Identical fields across all 3 variants — only the default justify-content
// differs, and alignment is fixed per variant (not user-editable) so the 3
// picker cards stay distinct.

export interface HelperButtonData {
  label: string
  href: string
  fontFamily: string
  fontSize: number
  fontWeight: string
  textColor: string
  bgColor: string
  paddingX: number
  paddingY: number
}

function makeButtonBlock(title: string, justify: string) {
  const defaults: HelperButtonData = {
    label: 'Link to landing page',
    href: 'https://www.google.com',
    fontFamily: '',
    fontSize: 16,
    fontWeight: '500',
    textColor: '#ffffff',
    bgColor: '#16a34a',
    paddingX: 24,
    paddingY: 12,
  }

  const fields: FieldConfig[] = [
    { key: '_h_font', label: 'Font', type: 'header' },
    fontField('fontFamily', 'Font Family'),
    { key: 'label', label: 'Button Text', type: 'text', placeholder: 'e.g. Shop Now' },
    { key: 'href', label: 'Link URL', type: 'url', placeholder: 'https://…' },
    { key: 'fontSize', label: 'Font Size', type: 'number', unit: 'px', step: 1 },
    { key: 'fontWeight', label: 'Font Weight', type: 'select', options: ['400', '500', '600', '700'] },
    { key: 'textColor', label: 'Text Color', type: 'color' },
    { key: 'bgColor', label: 'Background Color', type: 'color' },
    { key: 'paddingX', label: 'Padding X (width)', type: 'number', unit: 'px', step: 2 },
    { key: 'paddingY', label: 'Padding Y (height)', type: 'number', unit: 'px', step: 2 },
  ]

  function render(data: HelperButtonData): string {
    return `<section data-component-title="${title}" data-component-props="${encodeURIComponent(JSON.stringify(data))}" style="padding:16px;">
  <div style="max-width:80rem;margin:0 auto;display:flex;justify-content:${justify};">
    <a href="${data.href}" target="_blank" rel="noopener noreferrer nofollow" style="display:inline-block;padding:${data.paddingY}px ${data.paddingX}px;background:${data.bgColor};color:${data.textColor};text-decoration:none;font-size:${data.fontSize}px;font-weight:${data.fontWeight};${fontCss(undefined, data.fontFamily)}">${data.label}</a>
  </div>
</section>`
  }

  return { defaults, fields, render }
}

export const {
  defaults: helperButtonLeftDefaults,
  fields: helperButtonLeftFields,
  render: renderHelperButtonLeft,
} = makeButtonBlock('Left Positioned Button', 'flex-start')

export const {
  defaults: helperButtonCenterDefaults,
  fields: helperButtonCenterFields,
  render: renderHelperButtonCenter,
} = makeButtonBlock('Centered Button', 'center')

export const {
  defaults: helperButtonRightDefaults,
  fields: helperButtonRightFields,
  render: renderHelperButtonRight,
} = makeButtonBlock('Right Positioned Button', 'flex-end')
```

- [ ] **Step 2: Typecheck**

Run from `app/`: `npx nuxt typecheck`
Expected: no errors referencing `helperBlocks.ts`

- [ ] **Step 3: Commit**

```bash
git add app/composables/helpers/helperBlocks.ts
git commit -m "feat: add button helper block definitions"
```

---

### Task 6: Register all 11 blocks and build the resolved helper list

**Files:**
- Create: `app/composables/helpers/useHelperBlocks.ts`

**Interfaces:**
- Consumes: everything exported by `app/composables/helpers/helperBlocks.ts` (Tasks 1–5); `useBlockRegistry` from `../editor/useBlockRegistry` (`register(title, {defaults, fields, render})`); default export `componentHelpers: {html_code, id, title, icon}[]` from `#lib/componentHelpers`
- Produces: `useHelperBlocks(): { helperComponentBlocks: {html_code, id, title, icon}[] }` — an array with the same shape and order as the library's `componentHelpers`, but with `html_code` replaced by `render(defaults)` output for all 11 matching titles

- [ ] **Step 1: Create the file**

```ts
import componentHelpers from '#lib/componentHelpers'
import { useBlockRegistry } from '../editor/useBlockRegistry'
import {
  helperTextDefaults, helperTextFields, renderHelperText,
  helperHeaderH2Defaults, helperHeaderH2Fields, renderHelperHeaderH2,
  helperHeaderH3Defaults, helperHeaderH3Fields, renderHelperHeaderH3,
  helperHeaderH4Defaults, helperHeaderH4Fields, renderHelperHeaderH4,
  helperHeaderH5Defaults, helperHeaderH5Fields, renderHelperHeaderH5,
  helperHeaderH6Defaults, helperHeaderH6Fields, renderHelperHeaderH6,
  helperYoutubeDefaults, helperYoutubeFields, renderHelperYoutube,
  helperDividerDefaults, helperDividerFields, renderHelperDivider,
  helperButtonLeftDefaults, helperButtonLeftFields, renderHelperButtonLeft,
  helperButtonCenterDefaults, helperButtonCenterFields, renderHelperButtonCenter,
  helperButtonRightDefaults, helperButtonRightFields, renderHelperButtonRight,
} from './helperBlocks'

// Pre-rendered html_code for each of the 11 Helper Components titles, keyed
// exactly as they appear in src/utils/html-elements/componentHelpers.ts.
const RENDERED_HTML: Record<string, string> = {
  'Text': renderHelperText(helperTextDefaults),
  'Header H2': renderHelperHeaderH2(helperHeaderH2Defaults),
  'Header H3': renderHelperHeaderH3(helperHeaderH3Defaults),
  'Header H4': renderHelperHeaderH4(helperHeaderH4Defaults),
  'Header H5': renderHelperHeaderH5(helperHeaderH5Defaults),
  'Header H6': renderHelperHeaderH6(helperHeaderH6Defaults),
  'YouTube Video': renderHelperYoutube(helperYoutubeDefaults),
  'Break Divider': renderHelperDivider(helperDividerDefaults),
  'Left Positioned Button': renderHelperButtonLeft(helperButtonLeftDefaults),
  'Centered Button': renderHelperButtonCenter(helperButtonCenterDefaults),
  'Right Positioned Button': renderHelperButtonRight(helperButtonRightDefaults),
}

export function useHelperBlocks() {
  const blockRegistry = useBlockRegistry()

  blockRegistry.register('Text', { defaults: helperTextDefaults, fields: helperTextFields, render: renderHelperText })
  blockRegistry.register('Header H2', { defaults: helperHeaderH2Defaults, fields: helperHeaderH2Fields, render: renderHelperHeaderH2 })
  blockRegistry.register('Header H3', { defaults: helperHeaderH3Defaults, fields: helperHeaderH3Fields, render: renderHelperHeaderH3 })
  blockRegistry.register('Header H4', { defaults: helperHeaderH4Defaults, fields: helperHeaderH4Fields, render: renderHelperHeaderH4 })
  blockRegistry.register('Header H5', { defaults: helperHeaderH5Defaults, fields: helperHeaderH5Fields, render: renderHelperHeaderH5 })
  blockRegistry.register('Header H6', { defaults: helperHeaderH6Defaults, fields: helperHeaderH6Fields, render: renderHelperHeaderH6 })
  blockRegistry.register('YouTube Video', { defaults: helperYoutubeDefaults, fields: helperYoutubeFields, render: renderHelperYoutube })
  blockRegistry.register('Break Divider', { defaults: helperDividerDefaults, fields: helperDividerFields, render: renderHelperDivider })
  blockRegistry.register('Left Positioned Button', { defaults: helperButtonLeftDefaults, fields: helperButtonLeftFields, render: renderHelperButtonLeft })
  blockRegistry.register('Centered Button', { defaults: helperButtonCenterDefaults, fields: helperButtonCenterFields, render: renderHelperButtonCenter })
  blockRegistry.register('Right Positioned Button', { defaults: helperButtonRightDefaults, fields: helperButtonRightFields, render: renderHelperButtonRight })

  const helperComponentBlocks = componentHelpers.map((helper) =>
    RENDERED_HTML[helper.title] ? { ...helper, html_code: RENDERED_HTML[helper.title] } : helper
  )

  return { helperComponentBlocks }
}
```

- [ ] **Step 2: Typecheck**

Run from `app/`: `npx nuxt typecheck`
Expected: no errors referencing `useHelperBlocks.ts` or `helperBlocks.ts`

- [ ] **Step 3: Commit**

```bash
git add app/composables/helpers/useHelperBlocks.ts
git commit -m "feat: register helper blocks and build resolved Helper Components list"
```

---

### Task 7: Wire into BuilderPanel and verify end-to-end

**Files:**
- Modify: `app/components/builder/BuilderPanel.client.vue`

**Interfaces:**
- Consumes: `useHelperBlocks()` from Task 6 (auto-imported by Nuxt from `app/composables/helpers/useHelperBlocks.ts`, same convention as the existing `useThemes()`/`useLayouts()` calls a few lines above it in this same file)

- [ ] **Step 1: Remove the now-unused library import**

In `app/components/builder/BuilderPanel.client.vue`, remove line 3:

```diff
-import componentHelpers from '#lib/componentHelpers'
```

- [ ] **Step 2: Call useHelperBlocks() alongside the existing registry composables**

Find this block (around line 13-14):

```ts
const { themeRegistry, applyTheme } = useThemes()
const { layoutComponentRegistry } = useLayouts()
```

Change it to:

```ts
const { themeRegistry, applyTheme } = useThemes()
const { layoutComponentRegistry } = useLayouts()
const { helperComponentBlocks } = useHelperBlocks()
```

- [ ] **Step 3: Swap the Helper Components grid's data source**

Find this line in the template (around line 328):

```diff
-              v-for="helper in componentHelpers"
+              v-for="helper in helperComponentBlocks"
```

- [ ] **Step 4: Typecheck**

Run from `app/`: `npx nuxt typecheck`
Expected: no errors

- [ ] **Step 5: Manual verification in the running dev server**

Start (or reuse) the dev server (`pnpm dev` from `app/`), open the page builder, and for each of the 11 Helper Components cards:

1. Click the card to drop it onto the canvas.
2. Select the dropped block — confirm the right panel shows the **structured field editor** (not the generic element editor) with the fields listed in this plan for that block type.
3. Edit at least one field (e.g. change Text's content, a Header's font size, YouTube's aspect ratio, Divider's color, or a Button's padding) and confirm the canvas updates live.
4. For YouTube Video specifically: set Aspect Ratio to `4/3`, then set Extra Height to `50`, and confirm the embed box grows taller than the `4/3`-only height.
5. For each of the 3 buttons: confirm each keeps its own fixed alignment (left/center/right) and that Padding X/Y visibly resizes the button.
6. Save/publish the page, reload it, and confirm the edited values persist (read back from `data-component-props`) rather than reverting to defaults.

- [ ] **Step 6: Commit**

```bash
git add app/components/builder/BuilderPanel.client.vue
git commit -m "feat: wire Helper Components picker to registered editable blocks"
```
