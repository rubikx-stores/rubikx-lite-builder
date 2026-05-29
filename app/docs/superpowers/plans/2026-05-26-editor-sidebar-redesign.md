# Editor Sidebar Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign EditorSidebar to show "Editing \<tagname\>" header with dynamic block content fields at top, image upload support, and graceful fallback to element styles.

**Architecture:** Extend `useEditorSidebar.ts` with two new exports (`selectedTag`, `closeEditor`), then rebuild the `EditorSidebar.client.vue` template — new header, block fields rendered directly at top, image fields with FileReader upload, element styles wrapped in a collapsible group that defaults open/closed based on mode.

**Tech Stack:** Vue 3 Composition API, TypeScript, Tailwind CSS, native `FileReader` API (no new packages)

---

## File Map

| File | Action |
|---|---|
| `app/composables/useEditorSidebar.ts` | Modify — add `selectedTag` computed + `closeEditor` function |
| `app/components/EditorSidebar.client.vue` | Modify — full template redesign, add image upload logic |

---

### Task 1: Extend `useEditorSidebar` composable

**Files:**
- Modify: `app/composables/useEditorSidebar.ts`

- [ ] **Step 1: Add `selectedTag` computed and `closeEditor` to the composable**

Open `app/composables/useEditorSidebar.ts`. Add after the existing `blockData` computed (around line 34), and add to the return object:

```ts
// after blockData computed (line ~34):

const selectedTag = computed<string>(() => {
  if (mode.value === 'block') return selectedBlockTitle.value ?? ''
  return selectedEl.value?.tagName?.toLowerCase() ?? 'element'
})

function closeEditor() {
  store.setElement(null)
}
```

In the `return` statement at the bottom, add `selectedTag` and `closeEditor`:

```ts
return {
  selectedEl,
  selectedBlockTitle,
  selectedTag,        // NEW
  mode,
  blockConfig,
  blockData,
  updateBlockField,
  updateBlockListItem,
  addBlockListItem,
  removeBlockListItem,
  updateElementStyle,
  updateElementClass,
  addLink,
  removeLink,
  openGlobalPageStyles,
  closeEditor,        // NEW
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run from `app/`:
```bash
pnpm typecheck
```
Expected: no new errors related to `useEditorSidebar.ts`.

- [ ] **Step 3: Commit**

```bash
git add app/composables/useEditorSidebar.ts
git commit -m "feat: add selectedTag computed and closeEditor to useEditorSidebar"
```

---

### Task 2: Redesign the EditorSidebar header

**Files:**
- Modify: `app/components/EditorSidebar.client.vue`

- [ ] **Step 1: Destructure the two new exports in the script**

In `EditorSidebar.client.vue`, update the destructure of `useEditorSidebar()` (top of `<script setup>`) to include `selectedTag` and `closeEditor`:

```ts
const {
  selectedEl, selectedBlockTitle, selectedTag, mode,
  blockConfig, blockData,
  updateBlockField, updateBlockListItem, addBlockListItem, removeBlockListItem,
  updateElementStyle, updateElementClass,
  addLink, removeLink, openGlobalPageStyles, closeEditor,
} = useEditorSidebar()
```

- [ ] **Step 2: Replace the header `<div>` in the template**

Find the current header block (starts at the `<!-- Header -->` comment, lines ~217-224):

```html
<!-- Header -->
<div class="flex-shrink-0 px-3 py-2.5 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
  <p class="text-xs font-semibold text-gray-600 uppercase tracking-wide truncate">
    {{ mode === 'block' ? selectedBlockTitle : (selectedEl?.tagName?.toLowerCase() ?? 'Element') }}
  </p>
  <span class="text-xs text-gray-400 bg-white border border-gray-200 rounded px-1.5 py-0.5 ml-2 shrink-0">
    {{ mode }}
  </span>
</div>
```

Replace it with:

```html
<!-- Header -->
<div class="flex-shrink-0 px-4 py-3 border-b border-gray-200 bg-white flex items-center justify-between">
  <button
    type="button"
    class="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 border-none bg-transparent cursor-pointer text-base leading-none"
    @click="closeEditor"
  >×</button>
  <span class="text-xs font-semibold text-gray-700 tracking-wide">
    Editing &lt;{{ selectedTag }}&gt;
  </span>
</div>
```

- [ ] **Step 3: Verify the builder still renders and the sidebar shows the new header**

Start the dev server:
```bash
pnpm dev
```
Open the builder, click any element. Confirm the header now reads `Editing <div>` (or whatever tag), and the × button closes the sidebar (deselects the element).

- [ ] **Step 4: Commit**

```bash
git add app/components/EditorSidebar.client.vue
git commit -m "feat: redesign editor sidebar header with close button and Editing <tag> label"
```

---

### Task 3: Move block content fields to top, remove section label

**Files:**
- Modify: `app/components/EditorSidebar.client.vue`

- [ ] **Step 1: Remove the "Block Content" wrapper div and its heading**

Find and remove the wrapping div that adds the "Block Content" label. The block content section currently looks like:

```html
<template v-if="mode === 'block' && blockConfig && blockData">
  <div class="border-b border-gray-100">
    <div class="px-3 pt-3 pb-1 flex items-center justify-between">
      <p class="text-xs font-semibold text-gray-700 uppercase tracking-wide">Block Content</p>
    </div>
    <div class="px-3 pb-3">
      <template v-for="field in blockConfig.fields" :key="field.key">
        <!-- ...fields... -->
      </template>
    </div>
  </div>
</template>
```

Replace with (no heading, fields render directly):

```html
<template v-if="mode === 'block' && blockConfig && blockData">
  <div class="border-b border-gray-100 px-3 pt-3 pb-3">
    <template v-for="field in blockConfig.fields" :key="field.key">
      <!-- ...fields unchanged... -->
    </template>
  </div>
</template>
```

Keep all the inner field templates (`text/url/image/number`, `color`, `toggle`, `select`, `list`) exactly as they are — only the outer wrapper changes.

- [ ] **Step 2: Verify block fields still render correctly**

In the builder, click a registered block (e.g. Navbar if registered). Confirm fields appear at the top without a "Block Content" heading.

- [ ] **Step 3: Commit**

```bash
git add app/components/EditorSidebar.client.vue
git commit -m "feat: render block content fields directly at top without section label"
```

---

### Task 4: Wrap element styles in collapsible group

**Files:**
- Modify: `app/components/EditorSidebar.client.vue`

- [ ] **Step 1: Add a computed `stylesOpen` that reflects whether element styles should start expanded**

In `<script setup>`, add after the `isImgEl` computed (around line 200):

```ts
const stylesOpen = computed(() => mode.value !== 'block')
```

- [ ] **Step 2: Wrap all element style `<details>` sections in a single collapsible group**

In the template, find the comment `<!-- ── Element Style Editors ─────────────────────────────────────── -->` (line ~321). Wrap everything from that comment down to the `<div class="h-4"></div>` spacer in a `<details>` element:

```html
<!-- ── Element Style Editors ─────────────────────────────────────── -->
<details :open="stylesOpen">
  <summary class="px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer list-none flex items-center justify-between select-none hover:bg-gray-50 border-b border-gray-100">
    Element Styles
    <span class="text-gray-300">▾</span>
  </summary>

  <!-- Link -->
  <details class="border-b border-gray-100">
    <!-- ...existing Link section unchanged... -->
  </details>

  <!-- Typography -->
  <details v-if="isTextEl" class="border-b border-gray-100">
    <!-- ...existing Typography section unchanged... -->
  </details>

  <!-- Background Color -->
  <details class="border-b border-gray-100">
    <!-- ...existing Background section unchanged... -->
  </details>

  <!-- Text Color -->
  <details v-if="isTextEl" class="border-b border-gray-100">
    <!-- ...existing Text Color section unchanged... -->
  </details>

  <!-- Padding -->
  <details class="border-b border-gray-100">
    <!-- ...existing Padding section unchanged... -->
  </details>

  <!-- Margin -->
  <details class="border-b border-gray-100">
    <!-- ...existing Margin section unchanged... -->
  </details>

  <!-- Border Radius -->
  <details class="border-b border-gray-100">
    <!-- ...existing Radius section unchanged... -->
  </details>

  <!-- Borders -->
  <details class="border-b border-gray-100">
    <!-- ...existing Border section unchanged... -->
  </details>

  <!-- Opacity -->
  <details class="border-b border-gray-100">
    <!-- ...existing Opacity section unchanged... -->
  </details>

  <!-- Image -->
  <details v-if="isImgEl" class="border-b border-gray-100">
    <!-- ...existing Image section unchanged... -->
  </details>

  <!-- Classes -->
  <details class="border-b border-gray-100">
    <!-- ...existing Classes section unchanged... -->
  </details>

  <!-- Inline Styles -->
  <details class="border-b border-gray-100">
    <!-- ...existing Styles section unchanged... -->
  </details>

  <!-- HTML -->
  <details class="border-b border-gray-100">
    <!-- ...existing HTML section unchanged... -->
  </details>

  <div class="h-4"></div>
</details>
```

> **Note:** The existing content of each inner `<details>` stays byte-for-byte identical — only add the outer `<details :open="stylesOpen">` wrapper with the "Element Styles" summary row.

- [ ] **Step 3: Verify behaviour**

- Click a **registered block** → "Element Styles" group starts **collapsed**
- Click a **raw element** (div, span, etc.) → "Element Styles" group starts **expanded**
- Clicking the "Element Styles" summary toggles it open/closed

- [ ] **Step 4: Commit**

```bash
git add app/components/EditorSidebar.client.vue
git commit -m "feat: wrap element style editors in collapsible group, collapsed when block is selected"
```

---

### Task 5: Add image upload to `image` type block fields

**Files:**
- Modify: `app/components/EditorSidebar.client.vue`

- [ ] **Step 1: Add upload state refs in `<script setup>`**

After the `isImgEl` computed, add:

```ts
// ── Block image upload ────────────────────────────────────────────────────────
const uploadError = ref<Record<string, string>>({})  // keyed by field.key

function onUploadImage(fieldKey: string, file: File) {
  uploadError.value[fieldKey] = ''
  const reader = new FileReader()
  reader.onload = () => {
    const dataUrl = reader.result as string
    updateBlockField(fieldKey, dataUrl)
  }
  reader.onerror = () => {
    uploadError.value[fieldKey] = 'File could not be read. Please try again or paste a URL.'
  }
  reader.readAsDataURL(file)
}
```

- [ ] **Step 2: Replace the `image` field type renderer inside the block fields template**

Find the existing `image` field renderer inside the block content `<template v-for="field in blockConfig.fields">`. It currently shares the `text/url/image/number` branch:

```html
<!-- text / url / image / number -->
<div v-if="['text','url','image','number'].includes(field.type)" class="mb-2.5">
```

Split `image` out into its own branch **before** the combined branch so it takes precedence:

```html
<!-- image field with URL input + file upload -->
<div v-if="field.type === 'image'" class="mb-2.5">
  <label class="block text-xs text-gray-500 mb-1">{{ field.label }}</label>
  <div class="flex items-center gap-1 mb-1">
    <input
      type="text"
      :value="blockData[field.key]"
      placeholder="https://..."
      class="flex-1 border border-gray-200 rounded-md px-2 py-1.5 text-xs focus:outline-none focus:border-blue-400"
      @change="updateBlockField(field.key, ($event.target as HTMLInputElement).value); uploadError[field.key] = ''"
    />
    <label
      class="shrink-0 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 border border-gray-200 rounded-md px-2 py-1.5 cursor-pointer"
    >
      ↑ Upload
      <input
        type="file"
        accept="image/*"
        class="sr-only"
        @change="onUploadImage(field.key, ($event.target as HTMLInputElement).files![0])"
      />
    </label>
  </div>
  <img
    v-if="blockData[field.key]"
    :src="blockData[field.key]"
    class="w-full h-20 object-cover rounded border border-gray-200 mb-1"
    alt="preview"
  />
  <p v-if="uploadError[field.key]" class="text-xs text-red-500">{{ uploadError[field.key] }}</p>
</div>

<!-- text / url / number -->
<div v-else-if="['text','url','number'].includes(field.type)" class="mb-2.5">
```

> **Important:** Change the existing combined branch condition from `['text','url','image','number']` to `['text','url','number']` (remove `'image'`) so the new dedicated branch handles it.

- [ ] **Step 3: Verify image upload flow**

In the builder, click a registered block that has an `image`-type field. Confirm:
- URL input is present
- "↑ Upload" button opens a file picker
- After selecting an image, the thumbnail preview updates and the block re-renders
- If a non-image file somehow passes (edge case), FileReader should still succeed; errors appear inline

- [ ] **Step 4: Commit**

```bash
git add app/components/EditorSidebar.client.vue
git commit -m "feat: add image upload (FileReader base64) for image-type block fields with error fallback"
```

---

### Task 6: Remove the "Global Page Styles" pinned button

**Files:**
- Modify: `app/components/EditorSidebar.client.vue`

> The old pinned "⚙ Global Page Styles" button at the bottom of the sidebar is no longer needed — the new design doesn't have a footer action. Remove it so the panel is clean.

- [ ] **Step 1: Remove the pinned footer**

Find and delete this block from the template:

```html
<!-- Global Page Styles — pinned at bottom -->
<div class="flex-shrink-0 border-t border-gray-200 p-3">
  <button
    type="button"
    class="w-full text-xs font-medium bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-md py-2 border border-gray-200 cursor-pointer"
    @click="openGlobalPageStyles"
  >
    ⚙ Global Page Styles
  </button>
</div>
```

- [ ] **Step 2: Remove `openGlobalPageStyles` from the destructure** (it's no longer called)

In `<script setup>`, update the destructure:

```ts
const {
  selectedEl, selectedBlockTitle, selectedTag, mode,
  blockConfig, blockData,
  updateBlockField, updateBlockListItem, addBlockListItem, removeBlockListItem,
  updateElementStyle, updateElementClass,
  addLink, removeLink, closeEditor,
} = useEditorSidebar()
```

- [ ] **Step 3: Verify no TypeScript errors**

```bash
pnpm typecheck
```
Expected: no errors.

- [ ] **Step 4: Final visual check**

Open the builder. Confirm:
- Sidebar opens when an element is clicked
- Header shows `Editing <tagname>`
- × button closes the sidebar
- Block fields appear at top for registered blocks (no "Block Content" label)
- "Element Styles" group is collapsed for blocks, expanded for raw elements
- Image fields have URL input + Upload button + preview

- [ ] **Step 5: Commit**

```bash
git add app/components/EditorSidebar.client.vue
git commit -m "feat: remove global page styles button, finalise editor sidebar redesign"
```

---

## Self-Review

**Spec coverage:**
- ✅ Header: `Editing <tagname>` + × close button — Task 2
- ✅ `selectedTag` computed + `closeEditor` — Task 1
- ✅ Block fields at top, no section label — Task 3
- ✅ `image` field with URL + upload + preview + error — Task 5
- ✅ Element styles collapsible, collapsed when block selected — Task 4
- ✅ Fallback: no block config → element styles only (existing `v-if="mode === 'block' && blockConfig && blockData"` guard) — covered by existing logic, no extra task needed
- ✅ FileReader error fallback — Task 5 `reader.onerror`
- ✅ All code in `app/` — all file paths are under `app/`

**Placeholder scan:** No TBDs, no "implement later", no vague steps. All code blocks are complete.

**Type consistency:** `uploadError` is `Record<string, string>`, keyed by `field.key` (string) — consistent across Task 5 script and template. `closeEditor` defined in Task 1, used in Task 2 template and removed from destructure in Task 6 (wait — Task 6 keeps `closeEditor` in destructure, only removes `openGlobalPageStyles`). ✅ Consistent.
