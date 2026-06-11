# Homepage Editor UX Improvement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add section headers and numeric steppers to the four Ru1-Homepage block editors so non-technical users can understand and use every field.

**Architecture:** Three-file change. (1) Extend `FieldConfig` type with `'header'` union and `step` property. (2) Update the EditorSidebar template to render header dividers and stepper controls. (3) Rewrite the four Homepage field arrays in themes-data.ts with grouped headers and step/placeholder values on number fields.

**Tech Stack:** Vue 3, TypeScript, Tailwind (pbx- prefixed), `app/composables/editor/useBlockRegistry.ts`, `app/composables/themes/themes-data.ts`, `app/components/builder/EditorSidebar.client.vue`

---

## Task 1: Extend FieldConfig type

**Files:**
- Modify: `app/composables/editor/useBlockRegistry.ts:3-11`

- [ ] **Step 1: Update the FieldConfig interface**

Replace lines 3–11 in `app/composables/editor/useBlockRegistry.ts`:

```ts
export interface FieldConfig {
  key: string
  label: string
  type: 'text' | 'url' | 'color' | 'select' | 'toggle' | 'number' | 'image' | 'list' | 'column-order' | 'header'
  options?: string[]
  listFields?: FieldConfig[]
  placeholder?: string
  unit?: string
  step?: number
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd app && npx tsc --noEmit`
Expected: no new errors (existing errors, if any, are pre-existing)

- [ ] **Step 3: Commit**

```bash
git add app/composables/editor/useBlockRegistry.ts
git commit -m "feat: add header type and step property to FieldConfig"
```

---

## Task 2: Render headers and steppers in EditorSidebar

**Files:**
- Modify: `app/components/builder/EditorSidebar.client.vue:477-508`

The current template loops with `v-for="field in blockConfig.fields"` and uses `v-if/v-else-if` chains. We need to:
1. Add a `v-if="field.type === 'header'"` branch as the first condition
2. Split `number` out of the `['text','url','number']` branch into its own stepper branch

- [ ] **Step 1: Replace the field rendering block in the template**

Find this block (around line 477–508):
```vue
<template v-for="field in blockConfig.fields" :key="field.key">

  <!-- image -->
  <div v-if="field.type === 'image'" class="mb-2.5">
```

Replace the opening of the v-for block plus the first two field branches (image and text/url/number). The full replacement:

```vue
<template v-for="field in blockConfig.fields" :key="field.key">

  <!-- header sentinel -->
  <div v-if="field.type === 'header'" class="mb-2 mt-4 first:mt-1">
    <div class="flex items-center gap-2">
      <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{{ field.label }}</span>
      <div class="flex-1 h-px bg-gray-200"></div>
    </div>
  </div>

  <!-- image -->
  <div v-else-if="field.type === 'image'" class="mb-2.5">
    <label class="block text-xs text-gray-500 mb-1">{{ field.label }}</label>
    <div class="flex items-center gap-1 mb-1">
      <input type="text" :value="blockData[field.key]" placeholder="https://..."
        class="flex-1 border border-gray-200 rounded-md px-2 py-1.5 text-xs focus:outline-none focus:border-blue-400"
        @input="debouncedUpdateBlockField(field.key, ($event.target as HTMLInputElement).value); uploadError[field.key] = ''" />
      <label class="shrink-0 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 border border-gray-200 rounded-md px-2 py-1.5 cursor-pointer">
        ↑ Upload
        <input type="file" accept="image/*" class="sr-only"
          @change="{ const f=($event.target as HTMLInputElement).files; if(f?.length) onUploadImage(field.key, f[0]) }" />
      </label>
    </div>
    <img v-if="blockData[field.key]" :src="blockData[field.key]"
      class="w-full h-20 object-cover rounded border border-gray-200 mb-1" alt="preview" />
    <p v-if="uploadError[field.key]" class="text-xs text-red-500">{{ uploadError[field.key] }}</p>
  </div>

  <!-- text / url -->
  <div v-else-if="field.type === 'text' || field.type === 'url'" class="mb-2.5">
    <label class="block text-xs text-gray-500 mb-1">{{ field.label }}</label>
    <input type="text" :value="blockData[field.key]"
      :placeholder="field.placeholder ?? ''"
      class="w-full border border-gray-200 rounded-md px-2 py-1.5 text-xs focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
      @input="debouncedUpdateBlockField(field.key, ($event.target as HTMLInputElement).value)" />
  </div>

  <!-- number → stepper -->
  <div v-else-if="field.type === 'number'" class="mb-2.5">
    <label class="block text-xs text-gray-500 mb-1">{{ field.label }}</label>
    <div class="flex items-center gap-1">
      <button type="button"
        class="w-7 h-7 flex items-center justify-center border border-gray-200 rounded-md bg-gray-50 hover:bg-gray-100 text-gray-600 text-base font-medium cursor-pointer shrink-0 leading-none"
        @click="updateBlockField(field.key, Math.max(0, Number(blockData[field.key] ?? field.placeholder ?? 0) - (field.step ?? 1)))">−</button>
      <div class="relative flex-1">
        <input type="number" :value="blockData[field.key]"
          :placeholder="field.placeholder ?? ''"
          class="w-full border border-gray-200 rounded-md px-2 py-1.5 text-xs text-center focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 pr-7"
          @input="debouncedUpdateBlockField(field.key, Number(($event.target as HTMLInputElement).value))" />
        <span class="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">{{ field.unit ?? 'px' }}</span>
      </div>
      <button type="button"
        class="w-7 h-7 flex items-center justify-center border border-gray-200 rounded-md bg-gray-50 hover:bg-gray-100 text-gray-600 text-base font-medium cursor-pointer shrink-0 leading-none"
        @click="updateBlockField(field.key, Number(blockData[field.key] ?? field.placeholder ?? 0) + (field.step ?? 1))">+</button>
    </div>
  </div>
```

- [ ] **Step 2: Verify the old `['text','url','number']` combined branch is fully removed**

Search for the string `['text','url','number']` in `EditorSidebar.client.vue` — it must not appear.

- [ ] **Step 3: Commit**

```bash
git add app/components/builder/EditorSidebar.client.vue
git commit -m "feat: render header dividers and number stepper in EditorSidebar"
```

---

## Task 3: Update Navbar field array

**Files:**
- Modify: `app/composables/themes/themes-data.ts:115-147`

- [ ] **Step 1: Replace `ru1NavbarFields`**

Replace the entire `ru1NavbarFields` export (lines 115–147) with:

```ts
export const ru1NavbarFields: FieldConfig[] = [
  { key: '_h_branding', label: 'Branding', type: 'header' },
  { key: 'logoUrl', label: 'Logo Image', type: 'image' },
  { key: 'brandName', label: 'Brand Name', type: 'text' },
  { key: 'logoWidth', label: 'Logo Width', type: 'number', unit: 'px', step: 4, placeholder: '120' },

  { key: '_h_navigation', label: 'Navigation', type: 'header' },
  {
    key: 'navLinks', label: 'Nav Links', type: 'list',
    listFields: [
      { key: 'label', label: 'Label', type: 'text' },
      { key: 'url', label: 'URL', type: 'url' },
      { key: 'visible', label: 'Visible', type: 'toggle' },
    ],
  },
  { key: 'showSearch', label: 'Search Bar', type: 'toggle' },
  { key: 'searchPlaceholder', label: 'Search Placeholder Text', type: 'text' },

  { key: '_h_buttons', label: 'Buttons', type: 'header' },
  { key: 'showSignIn', label: 'Show Sign In', type: 'toggle' },
  { key: 'signInLabel', label: 'Sign In Label', type: 'text' },
  { key: 'signInUrl', label: 'Sign In URL', type: 'url' },
  { key: 'showContactUs', label: 'Show Contact Us', type: 'toggle' },
  { key: 'contactUsLabel', label: 'Contact Us Label', type: 'text' },
  { key: 'contactUsUrl', label: 'Contact Us URL', type: 'url' },
  { key: 'showCart', label: 'Show Cart Icon', type: 'toggle' },
  { key: 'cartUrl', label: 'Cart URL', type: 'url' },

  { key: '_h_colors', label: 'Colors', type: 'header' },
  { key: 'bgColor', label: 'Background Color', type: 'color' },
  { key: 'textColor', label: 'Text Color', type: 'color' },
  { key: 'borderColor', label: 'Border Color', type: 'color' },

  { key: '_h_typography', label: 'Typography', type: 'header' },
  { key: 'fontSize', label: 'Font Size', type: 'number', unit: 'px', step: 1, placeholder: '14' },
  { key: 'fontWeight', label: 'Font Weight', type: 'select', options: ['300', '400', '500', '600', '700', '800'] },

  { key: '_h_layout', label: 'Layout', type: 'header' },
  { key: 'paddingY', label: 'Vertical Padding', type: 'number', unit: 'px', step: 4, placeholder: '16' },
  { key: 'paddingX', label: 'Horizontal Padding', type: 'number', unit: 'px', step: 4, placeholder: '24' },
  { key: 'sticky', label: 'Sticky Navbar', type: 'toggle' },
  { key: 'borderStyle', label: 'Border Style', type: 'select', options: ['none', 'solid', 'dashed', 'dotted'] },
  { key: 'borderWidth', label: 'Border Width', type: 'number', unit: 'px', step: 1, placeholder: '1' },
]
```

- [ ] **Step 2: Commit**

```bash
git add app/composables/themes/themes-data.ts
git commit -m "feat: add section headers and steppers to Navbar editor fields"
```

---

## Task 4: Update Hero field array

**Files:**
- Modify: `app/composables/themes/themes-data.ts:247-266`

- [ ] **Step 1: Replace `ru1HeroFields`**

Replace the entire `ru1HeroFields` export (lines 247–266) with:

```ts
export const ru1HeroFields: FieldConfig[] = [
  { key: '_h_banner', label: 'Banner', type: 'header' },
  { key: 'imageUrl', label: 'Banner Image', type: 'image' },
  { key: 'altText', label: 'Image Alt Text', type: 'text' },
  { key: 'linkUrl', label: 'Banner Link URL', type: 'url' },
  { key: 'aspectRatio', label: 'Aspect Ratio', type: 'select', options: ['4/1', '3/1', '16/9', '2/1', '4/3', '1/1'] },

  { key: '_h_text', label: 'Text', type: 'header' },
  { key: 'headline', label: 'Headline', type: 'text' },
  { key: 'subheadline', label: 'Subheadline', type: 'text' },
  { key: 'textColor', label: 'Text Color', type: 'color' },
  { key: 'textAlign', label: 'Text Alignment', type: 'select', options: ['left', 'center', 'right'] },

  { key: '_h_cta', label: 'CTA Button', type: 'header' },
  { key: 'ctaText', label: 'Button Text', type: 'text' },
  { key: 'ctaUrl', label: 'Button URL', type: 'url' },
  { key: 'ctaBgColor', label: 'Button Background Color', type: 'color' },
  { key: 'ctaTextColor', label: 'Button Text Color', type: 'color' },

  { key: '_h_overlay', label: 'Overlay', type: 'header' },
  { key: 'overlayColor', label: 'Overlay Color', type: 'color' },
  { key: 'overlayOpacity', label: 'Overlay Opacity', type: 'number', unit: '%', step: 5, placeholder: '40' },

  { key: '_h_layout', label: 'Layout', type: 'header' },
  { key: 'bgColor', label: 'Section Background', type: 'color' },
  { key: 'paddingY', label: 'Vertical Padding', type: 'number', unit: 'px', step: 4, placeholder: '32' },
  { key: 'paddingX', label: 'Horizontal Padding', type: 'number', unit: 'px', step: 4, placeholder: '24' },
  { key: 'borderRadius', label: 'Corner Radius', type: 'number', unit: 'px', step: 2, placeholder: '8' },
]
```

- [ ] **Step 2: Commit**

```bash
git add app/composables/themes/themes-data.ts
git commit -m "feat: add section headers and steppers to Hero editor fields"
```

---

## Task 5: Update Featured Products field array

**Files:**
- Modify: `app/composables/themes/themes-data.ts:372-401`

- [ ] **Step 1: Replace `ru1ProductsFields`**

Replace the entire `ru1ProductsFields` export (lines 372–401) with:

```ts
export const ru1ProductsFields: FieldConfig[] = [
  { key: '_h_section', label: 'Section', type: 'header' },
  { key: 'sectionTitle', label: 'Section Title', type: 'text' },
  { key: 'titleAlign', label: 'Title Alignment', type: 'select', options: ['left', 'center', 'right'] },
  { key: 'titleColor', label: 'Title Color', type: 'color' },

  { key: '_h_grid', label: 'Grid', type: 'header' },
  { key: 'columns', label: 'Columns', type: 'select', options: ['1', '2', '3', '4', '5', '6'] },
  { key: 'rows', label: 'Rows', type: 'select', options: ['1', '2', '3', '4', '5', '6'] },

  { key: '_h_card', label: 'Card Style', type: 'header' },
  { key: 'cardBorderRadius', label: 'Card Corner Radius', type: 'number', unit: 'px', step: 2, placeholder: '8' },
  { key: 'cardAnimation', label: 'Hover Animation', type: 'toggle' },
  { key: 'hoverEffect', label: 'Animation Type', type: 'select', options: ['Lift Up', 'Drop Down', 'Slide Left', 'Slide Right', 'Pop Out', 'Zoom In', 'Glow', 'Tilt Left', 'Tilt Right'] },
  { key: 'hoverAmount', label: 'Animation Amount', type: 'number', unit: 'px', step: 1, placeholder: '8' },
  { key: 'animationDuration', label: 'Animation Duration', type: 'number', unit: 'ms', step: 50, placeholder: '300' },

  { key: '_h_pricing', label: 'Pricing', type: 'header' },
  { key: 'oldPriceColor', label: 'Old Price Color', type: 'color' },
  { key: 'buttonBgColor', label: 'Button Background Color', type: 'color' },
  { key: 'buttonTextColor', label: 'Button Text Color', type: 'color' },

  { key: '_h_layout', label: 'Layout', type: 'header' },
  { key: 'bgColor', label: 'Section Background', type: 'color' },
  { key: 'paddingY', label: 'Vertical Padding', type: 'number', unit: 'px', step: 4, placeholder: '32' },
  { key: 'paddingX', label: 'Horizontal Padding', type: 'number', unit: 'px', step: 4, placeholder: '24' },

  { key: '_h_products', label: 'Products', type: 'header' },
  {
    key: 'products', label: 'Products', type: 'list',
    listFields: [
      { key: 'imageUrl', label: 'Image', type: 'image' },
      { key: 'name', label: 'Product Name', type: 'text' },
      { key: 'price', label: 'Price', type: 'text' },
      { key: 'oldPrice', label: 'Old Price (optional)', type: 'text' },
      { key: 'buttonLabel', label: 'Button Text', type: 'text' },
      { key: 'buttonUrl', label: 'Button URL', type: 'url' },
      { key: 'colors', label: 'Color Swatches', type: 'text', placeholder: 'blue, black, #ff0000' },
    ],
  },
]
```

- [ ] **Step 2: Commit**

```bash
git add app/composables/themes/themes-data.ts
git commit -m "feat: add section headers and steppers to Products editor fields"
```

---

## Task 6: Update Footer field array

**Files:**
- Modify: `app/composables/themes/themes-data.ts:499-517`

- [ ] **Step 1: Replace `ru1FooterFields`**

Replace the entire `ru1FooterFields` export (lines 499–517) with:

```ts
export const ru1FooterFields: FieldConfig[] = [
  { key: '_h_content', label: 'Content', type: 'header' },
  { key: 'tagline', label: 'Tagline', type: 'text' },
  {
    key: 'usefulLinks', label: 'Useful Links', type: 'list',
    listFields: [
      { key: 'label', label: 'Label', type: 'text' },
      { key: 'url', label: 'URL', type: 'url' },
    ],
  },
  { key: 'contactEmail', label: 'Contact Email', type: 'text' },
  { key: 'contactPhone', label: 'Contact Phone', type: 'text' },
  { key: 'copyright', label: 'Copyright Text', type: 'text' },

  { key: '_h_colors', label: 'Colors', type: 'header' },
  { key: 'bgColor', label: 'Background Color', type: 'color' },
  { key: 'textColor', label: 'Text Color', type: 'color' },
  { key: 'borderColor', label: 'Border Color', type: 'color' },

  { key: '_h_layout', label: 'Layout', type: 'header' },
  { key: 'paddingY', label: 'Vertical Padding', type: 'number', unit: 'px', step: 4, placeholder: '32' },
  { key: 'paddingX', label: 'Horizontal Padding', type: 'number', unit: 'px', step: 4, placeholder: '24' },
  { key: 'borderStyle', label: 'Border Style', type: 'select', options: ['none', 'solid', 'dashed', 'dotted'] },
  { key: 'borderWidth', label: 'Border Width', type: 'number', unit: 'px', step: 1, placeholder: '1' },
  { key: 'columnOrder', label: 'Column Order', type: 'column-order' },
]
```

- [ ] **Step 2: Commit**

```bash
git add app/composables/themes/themes-data.ts
git commit -m "feat: add section headers and steppers to Footer editor fields"
```

---

## Task 7: Final verification

- [ ] **Step 1: Run TypeScript check**

```bash
cd app && npx tsc --noEmit
```
Expected: no new type errors

- [ ] **Step 2: Start dev server and open the builder**

```bash
cd app && npm run dev
```
Open the builder, add the Ru1 Homepage theme, and click on each block to open its editor. Verify:
- Navbar editor shows: Branding / Navigation / Buttons / Colors / Typography / Layout sections with dividers
- Hero editor shows: Banner / Text / CTA Button / Overlay / Layout sections
- Products editor shows: Section / Grid / Card Style / Pricing / Layout / Products sections
- Footer editor shows: Content / Colors / Layout sections
- All number fields show − [input] + stepper with unit label
- Stepper − and + buttons adjust values by the configured step amount
- Input is still directly typeable
- All other field types (color, toggle, select, list) are unchanged
