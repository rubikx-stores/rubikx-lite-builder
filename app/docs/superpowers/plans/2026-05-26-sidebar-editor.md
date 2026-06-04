# Sidebar Editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a two-mode editor sidebar that shows block content fields for registered blocks and element-style editors for any selected element, with Global Page Styles always accessible at the bottom.

**Architecture:** `useBlockRegistry` (composable) holds block schemas + runtime state. `useEditorSidebar` (composable) watches `usePageBuilderStateStore().getElement` reactively to detect selection and mode. `EditorSidebar.client.vue` (thin shell) renders based on mode. Block data + render functions are co-located in `themes-data.ts`. DOM mutations sync back to library via `builder.syncDomToStoreOnly()`.

**Tech Stack:** Vue 3 + TypeScript (Nuxt 3), `@myissue/vue-website-page-builder` (Pinia store + builder instance), standard Tailwind classes (no `pbx-` prefix) for sidebar UI. `pbx-` prefix is only for HTML inside block sections rendered onto the canvas.

---

## File Map

| File | Change | Responsibility |
|---|---|---|
| `app/composables/useBlockRegistry.ts` | New | Block schema registry + runtime state map |
| `app/composables/useEditorSidebar.ts` | New | Selection state, mode detection, update methods |
| `app/components/EditorSidebar.client.vue` | New | Sidebar shell + all element editors + block field renderer |
| `app/composables/themes-data.ts` | Modified | Add `defaults`, `fields`, `render()` for 4 blocks |
| `app/composables/useThemes.ts` | Modified | Register blocks on `useThemes()` call |
| `app/components/PageBuilderWrapper.client.vue` | Modified | Mount `<EditorSidebar>` |

---

## Key Library APIs (verified from bundle)

```ts
import { usePageBuilderStateStore, getPageBuilder } from '@myissue/vue-website-page-builder'

const store = usePageBuilderStateStore()

// Selected element — reactive, updates when user clicks canvas
store.getElement          // HTMLElement | null

// Open library's right panel (global styles accessible there)
store.setMenuRight(true)  // open
store.setMenuRight(false) // close

// After any DOM mutation, sync back to library:
const builder = getPageBuilder() as any
builder.syncDomToStoreOnly()              // reads DOM → updates store components array
builder.saveDomComponentsToLocalStorage() // persists to localStorage
await builder.addListenersToEditableElements() // re-attaches click/hover listeners (needed after innerHTML replace)
```

---

## Task 1: Create `useBlockRegistry.ts`

**Files:**
- Create: `app/composables/useBlockRegistry.ts`

- [ ] **Step 1: Create the file with full registry implementation**

```ts
import { reactive } from 'vue'

export interface FieldConfig {
  key: string
  label: string
  type: 'text' | 'url' | 'color' | 'select' | 'toggle' | 'number' | 'image' | 'list'
  options?: string[]
  listFields?: FieldConfig[]
}

export interface BlockEditorConfig<T = Record<string, any>> {
  defaults: T
  fields: FieldConfig[]
  render: (data: T) => string
}

interface RegistryEntry {
  config: BlockEditorConfig
  state: Record<string, any>
}

const _registry = reactive<Map<string, RegistryEntry>>(new Map())

export function useBlockRegistry() {
  function register(title: string, config: BlockEditorConfig) {
    if (!_registry.has(title)) {
      _registry.set(title, { config, state: { ...config.defaults } })
    }
  }

  function hasConfig(title: string): boolean {
    return _registry.has(title)
  }

  function getConfig(title: string): BlockEditorConfig | null {
    return _registry.get(title)?.config ?? null
  }

  function getData(title: string): Record<string, any> | null {
    const entry = _registry.get(title)
    return entry ? entry.state : null
  }

  function setData(title: string, key: string, value: any) {
    const entry = _registry.get(title)
    if (entry) entry.state[key] = value
  }

  function setListItem(title: string, listKey: string, index: number, itemKey: string, value: any) {
    const entry = _registry.get(title)
    if (entry && Array.isArray(entry.state[listKey])) {
      entry.state[listKey][index][itemKey] = value
    }
  }

  function addListItem(title: string, listKey: string, template: Record<string, any>) {
    const entry = _registry.get(title)
    if (entry && Array.isArray(entry.state[listKey])) {
      entry.state[listKey].push({ ...template })
    }
  }

  function removeListItem(title: string, listKey: string, index: number) {
    const entry = _registry.get(title)
    if (entry && Array.isArray(entry.state[listKey])) {
      entry.state[listKey].splice(index, 1)
    }
  }

  function moveListItem(title: string, listKey: string, fromIndex: number, toIndex: number) {
    const entry = _registry.get(title)
    if (!entry || !Array.isArray(entry.state[listKey])) return
    const arr = entry.state[listKey]
    const [item] = arr.splice(fromIndex, 1)
    arr.splice(toIndex, 0, item)
  }

  return { register, hasConfig, getConfig, getData, setData, setListItem, addListItem, removeListItem, moveListItem }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
pnpm nuxt typecheck
```
Expected: no errors from `useBlockRegistry.ts`

---

## Task 2: Create `useEditorSidebar.ts`

**Files:**
- Create: `app/composables/useEditorSidebar.ts`

- [ ] **Step 1: Create the file**

```ts
import { computed } from 'vue'
import { usePageBuilderStateStore } from '@myissue/vue-website-page-builder'
import { useBlockRegistry } from './useBlockRegistry'

export type SidebarMode = 'none' | 'block' | 'element'

export function useEditorSidebar() {
  const store = usePageBuilderStateStore()
  const registry = useBlockRegistry()

  const selectedEl = computed<HTMLElement | null>(() => (store.getElement as HTMLElement | null) ?? null)

  const selectedBlockTitle = computed<string | null>(() => {
    const el = selectedEl.value
    if (!el) return null
    const section = el.closest('[data-component-title]')
    return section?.getAttribute('data-component-title') ?? null
  })

  const mode = computed<SidebarMode>(() => {
    if (!selectedEl.value) return 'none'
    if (selectedBlockTitle.value && registry.hasConfig(selectedBlockTitle.value)) return 'block'
    return 'element'
  })

  const blockConfig = computed(() => {
    if (!selectedBlockTitle.value) return null
    return registry.getConfig(selectedBlockTitle.value)
  })

  const blockData = computed(() => {
    if (!selectedBlockTitle.value) return null
    return registry.getData(selectedBlockTitle.value)
  })

  async function _syncBuilder() {
    const { getPageBuilder } = await import('@myissue/vue-website-page-builder')
    const builder = getPageBuilder() as any
    builder.syncDomToStoreOnly()
    builder.saveDomComponentsToLocalStorage()
  }

  async function _syncBuilderWithListeners() {
    const { getPageBuilder } = await import('@myissue/vue-website-page-builder')
    const builder = getPageBuilder() as any
    await builder.addListenersToEditableElements()
    builder.syncDomToStoreOnly()
    builder.saveDomComponentsToLocalStorage()
  }

  async function updateBlockField(key: string, value: any) {
    const title = selectedBlockTitle.value
    if (!title || !blockConfig.value) return
    registry.setData(title, key, value)
    await _applyBlockRender(title)
  }

  async function updateBlockListItem(listKey: string, index: number, itemKey: string, value: any) {
    const title = selectedBlockTitle.value
    if (!title || !blockConfig.value) return
    registry.setListItem(title, listKey, index, itemKey, value)
    await _applyBlockRender(title)
  }

  async function addBlockListItem(listKey: string, template: Record<string, any>) {
    const title = selectedBlockTitle.value
    if (!title || !blockConfig.value) return
    registry.addListItem(title, listKey, template)
    await _applyBlockRender(title)
  }

  async function removeBlockListItem(listKey: string, index: number) {
    const title = selectedBlockTitle.value
    if (!title || !blockConfig.value) return
    registry.removeListItem(title, listKey, index)
    await _applyBlockRender(title)
  }

  async function _applyBlockRender(title: string) {
    const config = registry.getConfig(title)
    const data = registry.getData(title)
    if (!config || !data) return

    const newHtml = config.render(data)
    const el = selectedEl.value
    if (!el) return

    const section = el.closest('section[data-componentid]') as HTMLElement | null
    if (!section) return

    const parser = new DOMParser()
    const doc = parser.parseFromString(newHtml, 'text/html')
    const newSection = doc.querySelector('section')
    if (!newSection) return

    section.innerHTML = newSection.innerHTML
    await _syncBuilderWithListeners()
  }

  function updateElementStyle(prop: string, value: string) {
    const el = selectedEl.value
    if (!el) return
    ;(el.style as any)[prop] = value
    _syncBuilder()
  }

  function updateElementClass(cls: string, add: boolean) {
    const el = selectedEl.value
    if (!el) return
    if (add) el.classList.add(cls)
    else el.classList.remove(cls)
    _syncBuilder()
  }

  function addLink(url: string, newTab: boolean) {
    const el = selectedEl.value
    if (!el) return
    const existing = el.closest('a') as HTMLAnchorElement | null
    if (existing) {
      existing.href = url
      newTab ? (existing.target = '_blank') : existing.removeAttribute('target')
    } else {
      const a = document.createElement('a')
      a.href = url
      if (newTab) a.target = '_blank'
      el.parentNode?.insertBefore(a, el)
      a.appendChild(el)
      store.setElement(el)
    }
    _syncBuilder()
  }

  function removeLink() {
    const el = selectedEl.value
    if (!el) return
    const a = el.closest('a')
    if (!a || !a.parentNode) return
    a.parentNode.insertBefore(el, a)
    a.parentNode.removeChild(a)
    store.setElement(el)
    _syncBuilder()
  }

  function openGlobalPageStyles() {
    store.setMenuRight(true)
  }

  return {
    selectedEl,
    selectedBlockTitle,
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
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
pnpm nuxt typecheck
```
Expected: no errors from `useEditorSidebar.ts`

---

## Task 3: Extend `themes-data.ts` with block schemas

**Files:**
- Modify: `app/composables/themes-data.ts`

Add the following exports to the END of `themes-data.ts` (after the existing `ru1TechwireSections` array). Do not remove or modify any existing code.

- [ ] **Step 1: Add import type for FieldConfig at the top of the file**

Add this as the first line of `themes-data.ts`:

```ts
import type { FieldConfig } from './useBlockRegistry'
```

- [ ] **Step 2: Add Navbar block schema (append to end of file)**

```ts
// ─── Navbar block editor data ───────────────────────────────────────────────

export interface NavLink { label: string; url: string }

export interface Ru1NavbarData {
  brandName: string
  showSearch: boolean
  topLinks: NavLink[]
  navLinks: NavLink[]
}

export const ru1NavbarDefaults: Ru1NavbarData = {
  brandName: 'Your Logo',
  showSearch: true,
  topLinks: [
    { label: 'Sign In', url: '/signin' },
    { label: 'Contact Us', url: '/contact' },
  ],
  navLinks: [
    { label: 'Home', url: '/' },
    { label: 'Shop', url: '/shop' },
    { label: 'About Us', url: '/about' },
  ],
}

export const ru1NavbarFields: FieldConfig[] = [
  { key: 'brandName', label: 'Brand Name', type: 'text' },
  { key: 'showSearch', label: 'Show Search Bar', type: 'toggle' },
  {
    key: 'topLinks', label: 'Top Links', type: 'list',
    listFields: [
      { key: 'label', label: 'Label', type: 'text' },
      { key: 'url', label: 'URL', type: 'url' },
    ],
  },
  {
    key: 'navLinks', label: 'Nav Links', type: 'list',
    listFields: [
      { key: 'label', label: 'Label', type: 'text' },
      { key: 'url', label: 'URL', type: 'url' },
    ],
  },
]

export function renderRu1Navbar(data: Ru1NavbarData): string {
  return `<section data-component-title="Ru1 Techwire Navbar">
<nav class="pbx-bg-white pbx-shadow-sm">
  <div class="pbx-max-w-7xl pbx-mx-auto pbx-px-4 sm:pbx-px-6 lg:pbx-px-8">
    <div class="pbx-flex pbx-items-center pbx-justify-between pbx-gap-4 pbx-py-3">
      <div class="pbx-flex-shrink-0">
        <span class="pbx-text-lg pbx-font-bold pbx-text-gray-900">${data.brandName}</span>
      </div>
      ${data.showSearch ? `<div class="pbx-flex-1 pbx-flex pbx-justify-center">
        <div class="pbx-flex pbx-items-center pbx-border pbx-border-gray-300 pbx-rounded-full pbx-px-3 pbx-py-1.5 pbx-gap-2 pbx-w-full pbx-max-w-xs">
          <svg class="pbx-h-4 pbx-w-4 pbx-text-blue-400 pbx-flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/></svg>
          <input type="text" placeholder="Search..." class="pbx-w-full pbx-bg-transparent pbx-text-sm pbx-text-gray-500 focus:pbx-outline-none" />
        </div>
      </div>` : '<div class="pbx-flex-1"></div>'}
      <div class="pbx-flex pbx-items-center pbx-gap-2">
        ${data.topLinks.map(l => `<a href="${l.url}" class="pbx-text-sm pbx-font-medium pbx-text-gray-700 hover:pbx-text-gray-900 pbx-no-underline">${l.label}</a>`).join('\n        ')}
        <a href="/cart" class="pbx-text-gray-700 hover:pbx-text-gray-900">
          <svg class="pbx-h-6 pbx-w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
        </a>
      </div>
    </div>
    <div class="pbx-hidden md:pbx-flex pbx-items-center pbx-gap-6 pbx-py-2">
      ${data.navLinks.map(l => `<a href="${l.url}" class="pbx-text-sm pbx-font-medium pbx-text-gray-700 hover:pbx-text-gray-900 pbx-no-underline">${l.label}</a>`).join('\n      ')}
    </div>
  </div>
</nav>
</section>`
}
```

- [ ] **Step 3: Add Hero block schema (append to end of file)**

```ts
// ─── Hero block editor data ──────────────────────────────────────────────────

export interface Ru1HeroData {
  imageUrl: string
  altText: string
  linkUrl: string
  bgColor: string
}

export const ru1HeroDefaults: Ru1HeroData = {
  imageUrl: placeholderSvg,
  altText: 'Hero image',
  linkUrl: '',
  bgColor: '#394152',
}

export const ru1HeroFields: FieldConfig[] = [
  { key: 'imageUrl', label: 'Image URL', type: 'image' },
  { key: 'altText', label: 'Alt Text', type: 'text' },
  { key: 'linkUrl', label: 'Click Link URL', type: 'url' },
  { key: 'bgColor', label: 'Background Color', type: 'color' },
]

export function renderRu1Hero(data: Ru1HeroData): string {
  const inner = `<img class="pbx-w-full pbx-h-auto pbx-block" src="${data.imageUrl}" alt="${data.altText}" />`
  return `<section data-component-title="Ru1 Techwire Hero">
<div style="background:${data.bgColor};">
  ${data.linkUrl ? `<a href="${data.linkUrl}">${inner}</a>` : inner}
</div>
</section>`
}
```

- [ ] **Step 4: Add Featured Products block schema (append to end of file)**

```ts
// ─── Featured Products block editor data ────────────────────────────────────

export interface ProductSwatch { color: string }
export interface Product {
  name: string
  price: string
  imageUrl: string
  buttonLabel: string
  buttonUrl: string
  swatches: ProductSwatch[]
}

export interface Ru1ProductsData {
  sectionTitle: string
  columns: 1 | 2 | 3 | 4
  products: Product[]
}

const _colClass: Record<number, string> = {
  1: 'pbx-grid-cols-1',
  2: 'pbx-grid-cols-2',
  3: 'pbx-grid-cols-2 sm:pbx-grid-cols-3',
  4: 'pbx-grid-cols-2 sm:pbx-grid-cols-2 lg:pbx-grid-cols-4',
}

export const ru1ProductsDefaults: Ru1ProductsData = {
  sectionTitle: 'Featured Products',
  columns: 4,
  products: [
    { name: 'Product One', price: '$29.99', imageUrl: placeholderSvg, buttonLabel: 'Add to Cart', buttonUrl: '/shop', swatches: [{ color: '#111827' }, { color: '#ffffff' }, { color: '#ef4444' }] },
    { name: 'Product Two', price: '$39.99', imageUrl: placeholderSvg, buttonLabel: 'Add to Cart', buttonUrl: '/shop', swatches: [{ color: '#3b82f6' }, { color: '#22c55e' }] },
    { name: 'Product Three', price: '$49.99', imageUrl: placeholderSvg, buttonLabel: 'Add to Cart', buttonUrl: '/shop', swatches: [{ color: '#a855f7' }, { color: '#f59e0b' }, { color: '#111827' }] },
    { name: 'Product Four', price: '$59.99', imageUrl: placeholderSvg, buttonLabel: 'Add to Cart', buttonUrl: '/shop', swatches: [{ color: '#111827' }, { color: '#6b7280' }] },
  ],
}

export const ru1ProductsFields: FieldConfig[] = [
  { key: 'sectionTitle', label: 'Section Title', type: 'text' },
  { key: 'columns', label: 'Columns', type: 'select', options: ['1', '2', '3', '4'] },
  {
    key: 'products', label: 'Products', type: 'list',
    listFields: [
      { key: 'name', label: 'Product Name', type: 'text' },
      { key: 'price', label: 'Price', type: 'text' },
      { key: 'imageUrl', label: 'Image URL', type: 'image' },
      { key: 'buttonLabel', label: 'Button Label', type: 'text' },
      { key: 'buttonUrl', label: 'Button URL', type: 'url' },
    ],
  },
]

export function renderRu1Products(data: Ru1ProductsData): string {
  const colCls = _colClass[data.columns] ?? _colClass[4]
  const cards = data.products.map(p => `
      <div class="pbx-flex pbx-flex-col pbx-border pbx-border-gray-200 pbx-rounded-lg pbx-overflow-hidden">
        <img class="pbx-object-cover pbx-w-full pbx-object-top pbx-aspect-square" src="${p.imageUrl}" alt="${p.name}" />
        <div class="pbx-flex pbx-flex-col pbx-gap-1 pbx-p-3 pbx-flex-1">
          <p class="pbx-font-semibold pbx-text-sm">${p.name}</p>
          <p class="pbx-text-sm">${p.price}</p>
          <div class="pbx-flex pbx-items-center pbx-gap-1 pbx-my-1">
            ${p.swatches.map(s => `<span class="pbx-w-4 pbx-h-4 pbx-rounded-full pbx-inline-block pbx-border pbx-border-gray-300" style="background:${s.color}"></span>`).join('')}
          </div>
          <a href="${p.buttonUrl}" class="pbx-mySecondaryButton pbx-mt-auto">${p.buttonLabel}</a>
        </div>
      </div>`).join('')
  return `<section data-component-title="Ru1 Techwire Featured Products">
<div class="md:pbx-pt-16 md:pbx-pb-16 pbx-pt-6 pbx-pb-6 lg:pbx-px-4 pbx-px-2">
  <div class="pbx-mx-auto pbx-max-w-7xl">
    <div class="pbx-break-words pbx-font-medium pbx-text-3xl lg:pbx-text-4xl pbx-mb-8">
      <h1>${data.sectionTitle}</h1>
    </div>
    <div class="pbx-myPrimaryGap pbx-grid ${colCls}">
      ${cards}
    </div>
  </div>
</div>
</section>`
}
```

- [ ] **Step 5: Add Footer block schema (append to end of file)**

```ts
// ─── Footer block editor data ────────────────────────────────────────────────

export interface Ru1FooterData {
  tagline: string
  usefulLinks: NavLink[]
  contactEmail: string
  contactPhone: string
  copyright: string
}

export const ru1FooterDefaults: Ru1FooterData = {
  tagline: 'This site is for employees to order branded apparel and accessories.',
  usefulLinks: [
    { label: 'Home', url: '/' },
    { label: 'Shop', url: '/shop' },
    { label: 'About Us', url: '/about' },
    { label: 'Contact Us', url: '/contact' },
  ],
  contactEmail: 'support@yourdomain.com',
  contactPhone: '+1 000-000-0000',
  copyright: '© Your Store. All rights reserved.',
}

export const ru1FooterFields: FieldConfig[] = [
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
]

export function renderRu1Footer(data: Ru1FooterData): string {
  return `<section data-component-title="Ru1 Techwire Footer">
<footer>
  <div class="pbx-max-w-7xl pbx-mx-auto pbx-px-4 sm:pbx-px-6 lg:pbx-px-8 pbx-py-12">
    <div class="pbx-grid pbx-grid-cols-1 md:pbx-grid-cols-3 pbx-gap-8">
      <div>
        <h3 class="pbx-text-sm pbx-font-semibold pbx-uppercase pbx-tracking-wider pbx-mb-4">Useful Links</h3>
        <ul class="pbx-space-y-2">
          ${data.usefulLinks.map(l => `<li><a href="${l.url}" class="pbx-text-sm pbx-text-gray-700 hover:pbx-text-gray-900">${l.label}</a></li>`).join('\n          ')}
        </ul>
      </div>
      <div>
        <h3 class="pbx-text-sm pbx-font-semibold pbx-uppercase pbx-tracking-wider pbx-mb-4">About Us</h3>
        <p class="pbx-text-sm pbx-text-gray-700 pbx-leading-relaxed">${data.tagline}</p>
      </div>
      <div>
        <h3 class="pbx-text-sm pbx-font-semibold pbx-uppercase pbx-tracking-wider pbx-mb-4">Connect with Us</h3>
        <ul class="pbx-space-y-2">
          <li class="pbx-text-sm pbx-text-gray-700">${data.contactEmail}</li>
          <li class="pbx-text-sm pbx-text-gray-700">${data.contactPhone}</li>
        </ul>
      </div>
    </div>
    <div class="pbx-border-t pbx-border-gray-200 pbx-mt-8 pbx-pt-6 pbx-text-center">
      <p class="pbx-text-sm pbx-text-gray-500">${data.copyright}</p>
    </div>
  </div>
</footer>
</section>`
}
```

- [ ] **Step 6: Verify TypeScript compiles**

```bash
pnpm nuxt typecheck
```
Expected: no errors

---

## Task 4: Update `useThemes.ts` to register blocks

**Files:**
- Modify: `app/composables/useThemes.ts`

- [ ] **Step 1: Replace entire file**

```ts
import { type ThemeSection, ru1TechwireSections, ru1TechwireSvg } from './themes-data'
import {
  ru1NavbarDefaults, ru1NavbarFields, renderRu1Navbar,
  ru1HeroDefaults, ru1HeroFields, renderRu1Hero,
  ru1ProductsDefaults, ru1ProductsFields, renderRu1Products,
  ru1FooterDefaults, ru1FooterFields, renderRu1Footer,
} from './themes-data'
import { useBlockRegistry } from './useBlockRegistry'

interface ThemeMeta {
  id: string
  name: string
  description: string
  category: string
  cover_image: string
}

interface Theme {
  meta: ThemeMeta
  sections: ThemeSection[]
}

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

export function useThemes() {
  const blockRegistry = useBlockRegistry()

  blockRegistry.register('Ru1 Techwire Navbar', { defaults: ru1NavbarDefaults, fields: ru1NavbarFields, render: renderRu1Navbar })
  blockRegistry.register('Ru1 Techwire Hero', { defaults: ru1HeroDefaults, fields: ru1HeroFields, render: renderRu1Hero })
  blockRegistry.register('Ru1 Techwire Featured Products', { defaults: ru1ProductsDefaults, fields: ru1ProductsFields, render: renderRu1Products })
  blockRegistry.register('Ru1 Techwire Footer', { defaults: ru1FooterDefaults, fields: ru1FooterFields, render: renderRu1Footer })

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

- [ ] **Step 2: Verify TypeScript compiles**

```bash
pnpm nuxt typecheck
```
Expected: no errors

---

## Task 5: Create `EditorSidebar.client.vue`

**Files:**
- Create: `app/components/EditorSidebar.client.vue`

**Styling note:** All sidebar UI classes use standard Tailwind (no `pbx-` prefix). Only the block render functions in `themes-data.ts` use `pbx-` classes since those render onto the canvas.

- [ ] **Step 1: Create the component**

```vue
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { usePageBuilderStateStore } from '@myissue/vue-website-page-builder'

const store = usePageBuilderStateStore()
const {
  selectedEl,
  selectedBlockTitle,
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
} = useEditorSidebar()

// ── Link editor local state ──────────────────────────────────────────────────
const linkEnabled = ref(false)
const linkUrl = ref('')
const linkNewTab = ref(false)
const linkError = ref('')
const linkSuccess = ref('')

watch(selectedEl, (el) => {
  if (!el) { linkEnabled.value = false; linkUrl.value = ''; linkError.value = ''; linkSuccess.value = ''; return }
  const a = el.closest('a') as HTMLAnchorElement | null
  linkEnabled.value = !!a
  linkUrl.value = a?.href ?? ''
  linkNewTab.value = a?.target === '_blank'
  linkError.value = ''
  linkSuccess.value = ''
})

function onLinkToggle(val: boolean) {
  linkEnabled.value = val
  if (!val) { removeLink(); linkSuccess.value = 'Link removed'; linkUrl.value = '' }
}

function onLinkSubmit() {
  if (!linkUrl.value.startsWith('http://') && !linkUrl.value.startsWith('https://')) {
    linkError.value = 'URL must start with http:// or https://'
    linkSuccess.value = ''
    return
  }
  addLink(linkUrl.value, linkNewTab.value)
  linkError.value = ''
  linkSuccess.value = 'Link added'
}

// ── Class editor local state ─────────────────────────────────────────────────
const classInput = ref('')
const currentClasses = computed(() => selectedEl.value ? Array.from(selectedEl.value.classList) : [])

function onAddClass() {
  const cls = classInput.value.trim()
  if (!cls) return
  updateElementClass(cls, true)
  classInput.value = ''
}

// ── Style editor local state ─────────────────────────────────────────────────
const styleProp = ref('')
const styleVal = ref('')
const currentStyles = computed(() => selectedEl.value?.style.cssText ?? '')

function onAddStyle() {
  const p = styleProp.value.trim()
  const v = styleVal.value.trim()
  if (!p || !v) return
  updateElementStyle(p, v)
  styleProp.value = ''
  styleVal.value = ''
}

// ── HTML editor local state ──────────────────────────────────────────────────
const htmlInput = ref('')

watch(selectedEl, (el) => { if (el) htmlInput.value = el.outerHTML })

function onApplyHtml() {
  const el = selectedEl.value
  if (!el || !el.parentNode) return
  const tmp = document.createElement('div')
  tmp.innerHTML = htmlInput.value
  const newEl = tmp.firstElementChild as HTMLElement | null
  if (!newEl) return
  el.parentNode.replaceChild(newEl, el)
  store.setElement(newEl)
  import('@myissue/vue-website-page-builder').then(({ getPageBuilder }) => {
    const b = getPageBuilder() as any
    b.addListenersToEditableElements().then(() => { b.syncDomToStoreOnly(); b.saveDomComponentsToLocalStorage() })
  })
}

// ── Image editor ─────────────────────────────────────────────────────────────
const imageInput = ref('')
watch(selectedEl, (el) => {
  imageInput.value = el?.tagName === 'IMG' ? (el as HTMLImageElement).src : ''
})

function onApplyImage() {
  const el = selectedEl.value
  if (!el || el.tagName !== 'IMG') return
  ;(el as HTMLImageElement).src = imageInput.value
  import('@myissue/vue-website-page-builder').then(({ getPageBuilder }) => {
    const b = getPageBuilder() as any
    b.syncDomToStoreOnly(); b.saveDomComponentsToLocalStorage()
  })
}

// ── Border radius local state ────────────────────────────────────────────────
const borderRadiusMode = ref<'global' | 'specific'>('global')
const borderRadiusGlobal = ref('0')
const borderRadiusTL = ref('')
const borderRadiusTR = ref('')
const borderRadiusBL = ref('')
const borderRadiusBR = ref('')

watch(selectedEl, (el) => {
  if (!el) return
  borderRadiusGlobal.value = el.style.borderRadius ? el.style.borderRadius.replace('px', '') : '0'
  borderRadiusTL.value = el.style.borderTopLeftRadius || ''
  borderRadiusTR.value = el.style.borderTopRightRadius || ''
  borderRadiusBL.value = el.style.borderBottomLeftRadius || ''
  borderRadiusBR.value = el.style.borderBottomRightRadius || ''
})

// ── Spacing presets ───────────────────────────────────────────────────────────
const spacingPresets = ['0px', '4px', '8px', '12px', '16px', '24px', '32px', '48px', '64px']

// ── Typography ────────────────────────────────────────────────────────────────
const fontSizes = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px', '48px']
const fontWeights = ['300', '400', '500', '600', '700', '800', '900']
const fontFamilies = ['inherit', 'Inter, sans-serif', 'Georgia, serif', 'Courier New, monospace', 'Arial, sans-serif']

const isTextElement = computed(() => {
  const tag = selectedEl.value?.tagName?.toUpperCase()
  return tag ? ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'SPAN', 'A', 'LI', 'BUTTON', 'LABEL'].includes(tag) : false
})

const isImageElement = computed(() => selectedEl.value?.tagName?.toUpperCase() === 'IMG')
</script>

<template>
  <Transition
    enter-active-class="transition-transform duration-200"
    enter-from-class="-translate-x-full"
    enter-to-class="translate-x-0"
    leave-active-class="transition-transform duration-200"
    leave-from-class="translate-x-0"
    leave-to-class="-translate-x-full"
  >
    <div
      v-if="mode !== 'none'"
      class="absolute left-0 top-0 bottom-0 z-30 w-72 bg-white border-r border-gray-200 shadow-lg flex flex-col overflow-hidden"
    >
      <!-- Header -->
      <div class="flex-shrink-0 px-3 py-2 border-b border-gray-200 bg-gray-50">
        <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          {{ mode === 'block' ? selectedBlockTitle : 'Element' }}
        </p>
      </div>

      <!-- Scrollable content -->
      <div class="flex-1 overflow-y-auto pb-4">

        <!-- ── Block Content Editor ───────────────────────────────────────── -->
        <template v-if="mode === 'block' && blockConfig && blockData">
          <div class="px-3 pt-3 pb-2 border-b border-gray-200">
            <p class="text-xs font-semibold text-gray-700 mb-3">Block Content</p>

            <template v-for="field in blockConfig.fields" :key="field.key">
              <!-- text / url / image / number -->
              <div v-if="['text','url','image','number'].includes(field.type)" class="mb-3">
                <label class="block text-xs text-gray-600 mb-1">{{ field.label }}</label>
                <input
                  type="text"
                  :value="blockData[field.key]"
                  class="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-400"
                  @change="updateBlockField(field.key, ($event.target as HTMLInputElement).value)"
                />
              </div>

              <!-- color -->
              <div v-else-if="field.type === 'color'" class="mb-3">
                <label class="block text-xs text-gray-600 mb-1">{{ field.label }}</label>
                <div class="flex items-center gap-2">
                  <input type="color" :value="blockData[field.key]" class="w-8 h-8 border border-gray-300 rounded cursor-pointer" @change="updateBlockField(field.key, ($event.target as HTMLInputElement).value)" />
                  <input type="text" :value="blockData[field.key]" class="flex-1 border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-400" @change="updateBlockField(field.key, ($event.target as HTMLInputElement).value)" />
                </div>
              </div>

              <!-- toggle -->
              <div v-else-if="field.type === 'toggle'" class="mb-3 flex items-center justify-between">
                <label class="text-xs text-gray-600">{{ field.label }}</label>
                <button
                  type="button"
                  class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors border-none cursor-pointer"
                  :class="blockData[field.key] ? 'bg-blue-500' : 'bg-gray-300'"
                  @click="updateBlockField(field.key, !blockData[field.key])"
                >
                  <span class="inline-block h-3.5 w-3.5 rounded-full bg-white shadow transform transition-transform" :class="blockData[field.key] ? 'translate-x-4' : 'translate-x-0.5'" />
                </button>
              </div>

              <!-- select -->
              <div v-else-if="field.type === 'select'" class="mb-3">
                <label class="block text-xs text-gray-600 mb-1">{{ field.label }}</label>
                <select
                  :value="String(blockData[field.key])"
                  class="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-400 bg-white"
                  @change="updateBlockField(field.key, Number(($event.target as HTMLSelectElement).value) || ($event.target as HTMLSelectElement).value)"
                >
                  <option v-for="opt in field.options" :key="opt" :value="opt">{{ opt }}</option>
                </select>
              </div>

              <!-- list -->
              <div v-else-if="field.type === 'list' && field.listFields" class="mb-3">
                <div class="flex items-center justify-between mb-2">
                  <label class="text-xs text-gray-600">{{ field.label }}</label>
                  <button
                    type="button"
                    class="text-xs text-blue-500 hover:text-blue-700 border-none bg-transparent cursor-pointer"
                    @click="addBlockListItem(field.key, Object.fromEntries((field.listFields ?? []).map(f => [f.key, ''])))"
                  >+ Add</button>
                </div>
                <div
                  v-for="(item, idx) in (blockData[field.key] as Record<string, any>[])"
                  :key="idx"
                  class="mb-2 border border-gray-200 rounded p-2"
                >
                  <div class="flex justify-between items-center mb-1">
                    <span class="text-xs text-gray-400">#{{ idx + 1 }}</span>
                    <div class="flex gap-1">
                      <button v-if="idx > 0" type="button" class="text-xs text-gray-400 hover:text-gray-700 border-none bg-transparent cursor-pointer" @click="updateBlockField(field.key, (() => { const arr = [...blockData![field.key]]; const [it] = arr.splice(idx,1); arr.splice(idx-1,0,it); return arr })())">↑</button>
                      <button v-if="idx < (blockData[field.key] as any[]).length - 1" type="button" class="text-xs text-gray-400 hover:text-gray-700 border-none bg-transparent cursor-pointer" @click="updateBlockField(field.key, (() => { const arr = [...blockData![field.key]]; const [it] = arr.splice(idx,1); arr.splice(idx+1,0,it); return arr })())">↓</button>
                      <button type="button" class="text-xs text-red-400 hover:text-red-600 border-none bg-transparent cursor-pointer" @click="removeBlockListItem(field.key, idx)">✕</button>
                    </div>
                  </div>
                  <template v-for="subField in field.listFields" :key="subField.key">
                    <div class="mb-1">
                      <label class="block text-xs text-gray-500 mb-0.5">{{ subField.label }}</label>
                      <input type="text" :value="item[subField.key]" class="w-full border border-gray-200 rounded px-2 py-0.5 text-xs focus:outline-none focus:border-blue-400" @change="updateBlockListItem(field.key, idx, subField.key, ($event.target as HTMLInputElement).value)" />
                    </div>
                  </template>
                </div>
              </div>
            </template>
          </div>
        </template>

        <!-- ── Element Style Editors ─────────────────────────────────────── -->
        <div class="px-3 pt-3">
          <p class="text-xs font-semibold text-gray-700 mb-3">Element Styles</p>

          <!-- Link Editor -->
          <details class="mb-2 border border-gray-100 rounded">
            <summary class="px-2 py-1.5 text-xs font-medium text-gray-700 cursor-pointer list-none flex items-center justify-between">Link <span class="text-gray-400">▾</span></summary>
            <div class="px-2 py-2 border-t border-gray-100">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs text-gray-600">Enable Link</span>
                <button type="button" class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors border-none cursor-pointer" :class="linkEnabled ? 'bg-blue-500' : 'bg-gray-300'" @click="onLinkToggle(!linkEnabled)">
                  <span class="inline-block h-3.5 w-3.5 rounded-full bg-white shadow transform transition-transform" :class="linkEnabled ? 'translate-x-4' : 'translate-x-0.5'" />
                </button>
              </div>
              <template v-if="linkEnabled">
                <input v-model="linkUrl" type="text" placeholder="https://" class="w-full border border-gray-300 rounded px-2 py-1 text-xs mb-1 focus:outline-none focus:border-blue-400" @keydown.enter="onLinkSubmit" />
                <div class="flex items-center justify-between mb-1">
                  <span class="text-xs text-gray-600">Open in new tab</span>
                  <input type="checkbox" v-model="linkNewTab" class="cursor-pointer" />
                </div>
                <button type="button" class="w-full text-xs bg-blue-500 text-white rounded py-1 border-none cursor-pointer hover:bg-blue-600" @click="onLinkSubmit">Apply</button>
                <p v-if="linkError" class="text-xs text-red-500 mt-1">{{ linkError }}</p>
                <p v-if="linkSuccess" class="text-xs text-green-500 mt-1">{{ linkSuccess }}</p>
              </template>
            </div>
          </details>

          <!-- Typography -->
          <details v-if="isTextElement" class="mb-2 border border-gray-100 rounded">
            <summary class="px-2 py-1.5 text-xs font-medium text-gray-700 cursor-pointer list-none flex items-center justify-between">Typography <span class="text-gray-400">▾</span></summary>
            <div class="px-2 py-2 border-t border-gray-100">
              <label class="block text-xs text-gray-500 mb-0.5">Font Size</label>
              <select class="w-full border border-gray-200 rounded px-2 py-1 text-xs mb-2 bg-white" @change="updateElementStyle('fontSize', ($event.target as HTMLSelectElement).value)">
                <option value="">— size —</option>
                <option v-for="s in fontSizes" :key="s" :value="s">{{ s }}</option>
              </select>
              <label class="block text-xs text-gray-500 mb-0.5">Font Weight</label>
              <select class="w-full border border-gray-200 rounded px-2 py-1 text-xs mb-2 bg-white" @change="updateElementStyle('fontWeight', ($event.target as HTMLSelectElement).value)">
                <option value="">— weight —</option>
                <option v-for="w in fontWeights" :key="w" :value="w">{{ w }}</option>
              </select>
              <label class="block text-xs text-gray-500 mb-0.5">Font Family</label>
              <select class="w-full border border-gray-200 rounded px-2 py-1 text-xs bg-white" @change="updateElementStyle('fontFamily', ($event.target as HTMLSelectElement).value)">
                <option value="">— family —</option>
                <option v-for="f in fontFamilies" :key="f" :value="f">{{ f }}</option>
              </select>
            </div>
          </details>

          <!-- Background Color -->
          <details class="mb-2 border border-gray-100 rounded">
            <summary class="px-2 py-1.5 text-xs font-medium text-gray-700 cursor-pointer list-none flex items-center justify-between">Background Color <span class="text-gray-400">▾</span></summary>
            <div class="px-2 py-2 border-t border-gray-100 flex items-center gap-2">
              <input type="color" class="w-8 h-8 border border-gray-300 rounded cursor-pointer" @change="updateElementStyle('backgroundColor', ($event.target as HTMLInputElement).value)" />
              <button type="button" class="text-xs text-gray-500 hover:text-red-500 border-none bg-transparent cursor-pointer" @click="updateElementStyle('backgroundColor', '')">Clear</button>
            </div>
          </details>

          <!-- Text Color -->
          <details v-if="isTextElement" class="mb-2 border border-gray-100 rounded">
            <summary class="px-2 py-1.5 text-xs font-medium text-gray-700 cursor-pointer list-none flex items-center justify-between">Text Color <span class="text-gray-400">▾</span></summary>
            <div class="px-2 py-2 border-t border-gray-100 flex items-center gap-2">
              <input type="color" class="w-8 h-8 border border-gray-300 rounded cursor-pointer" @change="updateElementStyle('color', ($event.target as HTMLInputElement).value)" />
              <button type="button" class="text-xs text-gray-500 hover:text-red-500 border-none bg-transparent cursor-pointer" @click="updateElementStyle('color', '')">Clear</button>
            </div>
          </details>

          <!-- Padding -->
          <details class="mb-2 border border-gray-100 rounded">
            <summary class="px-2 py-1.5 text-xs font-medium text-gray-700 cursor-pointer list-none flex items-center justify-between">Padding <span class="text-gray-400">▾</span></summary>
            <div class="px-2 py-2 border-t border-gray-100">
              <label class="block text-xs text-gray-500 mb-0.5">Vertical (top &amp; bottom)</label>
              <select class="w-full border border-gray-200 rounded px-2 py-1 text-xs mb-2 bg-white" @change="(e) => { const v = (e.target as HTMLSelectElement).value; updateElementStyle('paddingTop', v); updateElementStyle('paddingBottom', v) }">
                <option value="">— none —</option>
                <option v-for="s in spacingPresets" :key="s" :value="s">{{ s }}</option>
              </select>
              <label class="block text-xs text-gray-500 mb-0.5">Horizontal (left &amp; right)</label>
              <select class="w-full border border-gray-200 rounded px-2 py-1 text-xs bg-white" @change="(e) => { const v = (e.target as HTMLSelectElement).value; updateElementStyle('paddingLeft', v); updateElementStyle('paddingRight', v) }">
                <option value="">— none —</option>
                <option v-for="s in spacingPresets" :key="s" :value="s">{{ s }}</option>
              </select>
            </div>
          </details>

          <!-- Margin -->
          <details class="mb-2 border border-gray-100 rounded">
            <summary class="px-2 py-1.5 text-xs font-medium text-gray-700 cursor-pointer list-none flex items-center justify-between">Margin <span class="text-gray-400">▾</span></summary>
            <div class="px-2 py-2 border-t border-gray-100">
              <label class="block text-xs text-gray-500 mb-0.5">Vertical (top &amp; bottom)</label>
              <select class="w-full border border-gray-200 rounded px-2 py-1 text-xs mb-2 bg-white" @change="(e) => { const v = (e.target as HTMLSelectElement).value; updateElementStyle('marginTop', v); updateElementStyle('marginBottom', v) }">
                <option value="">— none —</option>
                <option v-for="s in spacingPresets" :key="s" :value="s">{{ s }}</option>
              </select>
              <label class="block text-xs text-gray-500 mb-0.5">Horizontal (left &amp; right)</label>
              <select class="w-full border border-gray-200 rounded px-2 py-1 text-xs bg-white" @change="(e) => { const v = (e.target as HTMLSelectElement).value; updateElementStyle('marginLeft', v); updateElementStyle('marginRight', v) }">
                <option value="">— none —</option>
                <option v-for="s in spacingPresets" :key="s" :value="s">{{ s }}</option>
              </select>
            </div>
          </details>

          <!-- Border Radius -->
          <details class="mb-2 border border-gray-100 rounded">
            <summary class="px-2 py-1.5 text-xs font-medium text-gray-700 cursor-pointer list-none flex items-center justify-between">Border Radius <span class="text-gray-400">▾</span></summary>
            <div class="px-2 py-2 border-t border-gray-100">
              <div class="flex gap-2 mb-2">
                <button type="button" class="text-xs px-2 py-0.5 rounded border-none cursor-pointer" :class="borderRadiusMode === 'global' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'" @click="borderRadiusMode = 'global'">Global</button>
                <button type="button" class="text-xs px-2 py-0.5 rounded border-none cursor-pointer" :class="borderRadiusMode === 'specific' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'" @click="borderRadiusMode = 'specific'">Specific</button>
              </div>
              <template v-if="borderRadiusMode === 'global'">
                <input type="range" min="0" max="50" v-model="borderRadiusGlobal" class="w-full" @input="updateElementStyle('borderRadius', borderRadiusGlobal + 'px')" />
                <span class="text-xs text-gray-500">{{ borderRadiusGlobal }}px</span>
              </template>
              <template v-else>
                <div class="grid grid-cols-2 gap-1">
                  <div><label class="text-xs text-gray-500">TL</label><input type="text" v-model="borderRadiusTL" class="w-full border border-gray-200 rounded px-1 py-0.5 text-xs" @change="updateElementStyle('borderTopLeftRadius', borderRadiusTL)" /></div>
                  <div><label class="text-xs text-gray-500">TR</label><input type="text" v-model="borderRadiusTR" class="w-full border border-gray-200 rounded px-1 py-0.5 text-xs" @change="updateElementStyle('borderTopRightRadius', borderRadiusTR)" /></div>
                  <div><label class="text-xs text-gray-500">BL</label><input type="text" v-model="borderRadiusBL" class="w-full border border-gray-200 rounded px-1 py-0.5 text-xs" @change="updateElementStyle('borderBottomLeftRadius', borderRadiusBL)" /></div>
                  <div><label class="text-xs text-gray-500">BR</label><input type="text" v-model="borderRadiusBR" class="w-full border border-gray-200 rounded px-1 py-0.5 text-xs" @change="updateElementStyle('borderBottomRightRadius', borderRadiusBR)" /></div>
                </div>
              </template>
            </div>
          </details>

          <!-- Borders -->
          <details class="mb-2 border border-gray-100 rounded">
            <summary class="px-2 py-1.5 text-xs font-medium text-gray-700 cursor-pointer list-none flex items-center justify-between">Borders <span class="text-gray-400">▾</span></summary>
            <div class="px-2 py-2 border-t border-gray-100">
              <label class="block text-xs text-gray-500 mb-0.5">Style</label>
              <select class="w-full border border-gray-200 rounded px-2 py-1 text-xs mb-2 bg-white" @change="updateElementStyle('borderStyle', ($event.target as HTMLSelectElement).value)">
                <option value="none">none</option>
                <option value="solid">solid</option>
                <option value="dashed">dashed</option>
                <option value="dotted">dotted</option>
              </select>
              <label class="block text-xs text-gray-500 mb-0.5">Width (px)</label>
              <input type="number" min="0" max="20" placeholder="1" class="w-full border border-gray-200 rounded px-2 py-1 text-xs mb-2" @change="updateElementStyle('borderWidth', ($event.target as HTMLInputElement).value + 'px')" />
              <label class="block text-xs text-gray-500 mb-0.5">Color</label>
              <input type="color" class="w-8 h-8 border border-gray-300 rounded cursor-pointer" @change="updateElementStyle('borderColor', ($event.target as HTMLInputElement).value)" />
            </div>
          </details>

          <!-- Opacity -->
          <details class="mb-2 border border-gray-100 rounded">
            <summary class="px-2 py-1.5 text-xs font-medium text-gray-700 cursor-pointer list-none flex items-center justify-between">Opacity <span class="text-gray-400">▾</span></summary>
            <div class="px-2 py-2 border-t border-gray-100">
              <label class="block text-xs text-gray-500 mb-0.5">Element Opacity</label>
              <input type="range" min="0" max="1" step="0.05" class="w-full" @input="updateElementStyle('opacity', ($event.target as HTMLInputElement).value)" />
            </div>
          </details>

          <!-- Image Editor -->
          <details v-if="isImageElement" class="mb-2 border border-gray-100 rounded">
            <summary class="px-2 py-1.5 text-xs font-medium text-gray-700 cursor-pointer list-none flex items-center justify-between">Image <span class="text-gray-400">▾</span></summary>
            <div class="px-2 py-2 border-t border-gray-100">
              <img v-if="imageInput" :src="imageInput" class="w-full h-24 object-cover rounded mb-2 border border-gray-200" alt="preview" />
              <input type="text" v-model="imageInput" placeholder="https://..." class="w-full border border-gray-200 rounded px-2 py-1 text-xs mb-1" />
              <button type="button" class="w-full text-xs bg-blue-500 text-white rounded py-1 border-none cursor-pointer hover:bg-blue-600" @click="onApplyImage">Apply</button>
            </div>
          </details>

          <!-- Class Editor -->
          <details class="mb-2 border border-gray-100 rounded">
            <summary class="px-2 py-1.5 text-xs font-medium text-gray-700 cursor-pointer list-none flex items-center justify-between">Classes <span class="text-gray-400">▾</span></summary>
            <div class="px-2 py-2 border-t border-gray-100">
              <div class="flex flex-wrap gap-1 mb-2">
                <span v-for="cls in currentClasses" :key="cls" class="inline-flex items-center gap-0.5 bg-gray-100 text-gray-700 text-xs rounded px-1.5 py-0.5">
                  {{ cls }}
                  <button type="button" class="text-gray-400 hover:text-red-500 border-none bg-transparent cursor-pointer p-0 leading-none" @click="updateElementClass(cls, false)">×</button>
                </span>
              </div>
              <div class="flex gap-1">
                <input v-model="classInput" type="text" placeholder="class-name" class="flex-1 border border-gray-200 rounded px-2 py-1 text-xs" @keydown.enter="onAddClass" />
                <button type="button" class="text-xs bg-blue-500 text-white rounded px-2 border-none cursor-pointer hover:bg-blue-600" @click="onAddClass">Add</button>
              </div>
            </div>
          </details>

          <!-- Style Editor -->
          <details class="mb-2 border border-gray-100 rounded">
            <summary class="px-2 py-1.5 text-xs font-medium text-gray-700 cursor-pointer list-none flex items-center justify-between">Inline Styles <span class="text-gray-400">▾</span></summary>
            <div class="px-2 py-2 border-t border-gray-100">
              <p class="text-xs text-gray-400 mb-1 break-all">{{ currentStyles || '—' }}</p>
              <div class="flex gap-1 mb-1">
                <input v-model="styleProp" type="text" placeholder="property" class="flex-1 border border-gray-200 rounded px-2 py-1 text-xs" />
                <input v-model="styleVal" type="text" placeholder="value" class="flex-1 border border-gray-200 rounded px-2 py-1 text-xs" @keydown.enter="onAddStyle" />
              </div>
              <button type="button" class="w-full text-xs bg-blue-500 text-white rounded py-1 border-none cursor-pointer hover:bg-blue-600" @click="onAddStyle">Apply</button>
            </div>
          </details>

          <!-- HTML Editor -->
          <details class="mb-2 border border-gray-100 rounded">
            <summary class="px-2 py-1.5 text-xs font-medium text-gray-700 cursor-pointer list-none flex items-center justify-between">HTML <span class="text-gray-400">▾</span></summary>
            <div class="px-2 py-2 border-t border-gray-100">
              <textarea v-model="htmlInput" rows="6" class="w-full border border-gray-200 rounded px-2 py-1 text-xs font-mono mb-1 focus:outline-none focus:border-blue-400" />
              <button type="button" class="w-full text-xs bg-blue-500 text-white rounded py-1 border-none cursor-pointer hover:bg-blue-600" @click="onApplyHtml">Apply HTML</button>
            </div>
          </details>

        </div>
      </div>

      <!-- ── Global Page Styles — always at bottom ──────────────────────── -->
      <div class="flex-shrink-0 border-t border-gray-200 p-3">
        <button
          type="button"
          class="w-full text-xs font-medium bg-gray-50 hover:bg-gray-100 text-gray-700 rounded py-2 border border-gray-200 cursor-pointer"
          @click="openGlobalPageStyles"
        >
          ⚙ Global Page Styles
        </button>
      </div>
    </div>
  </Transition>
</template>
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
pnpm nuxt typecheck
```
Expected: no errors

---

## Task 6: Update `PageBuilderWrapper.client.vue`

**Files:**
- Modify: `app/components/PageBuilderWrapper.client.vue`

- [ ] **Step 1: Replace entire file**

```vue
<script setup lang="ts">
import { PageBuilder, getPageBuilder } from '@myissue/vue-website-page-builder'
import type { PageBuilderConfig } from '@myissue/vue-website-page-builder'
import BuilderPanel from './BuilderPanel.client.vue'
import EditorSidebar from './EditorSidebar.client.vue'

const props = defineProps<{
  pageId?: number
  pageName?: string
}>()

const config: PageBuilderConfig = {
  updateOrCreate: {
    formType: 'create',
    formName: 'page',
  },
  resourceData: props.pageId ? { title: props.pageName ?? 'page', id: props.pageId } : null,
}

onMounted(async () => {
  const builder = getPageBuilder()
  await builder.startBuilder(config)
})
</script>

<template>
  <div class="relative h-full overflow-hidden">
    <PageBuilder :CustomBuilderComponents="BuilderPanel" />
    <EditorSidebar />
  </div>
</template>
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
pnpm nuxt typecheck
```
Expected: no errors

---

## Task 7: Smoke test + commit

- [ ] **Step 1: Start dev server**

```bash
pnpm dev
```

Navigate to the editor page (login → dashboard → open a page in editor).

- [ ] **Step 2: Test mode = 'none' (nothing selected)**

Confirm: sidebar is hidden. Library's default UI is visible as normal.

- [ ] **Step 3: Test mode = 'element' (click generic element)**

Click any `<p>`, `<div>`, or `<img>` inside any component.

Confirm:
- Sidebar slides in from left showing "Element Styles"
- Typography editors appear for text elements
- Image editor appears for `<img>` elements
- Global Page Styles button visible at bottom

- [ ] **Step 4: Test mode = 'block' (click inside Ru1-Techwire Navbar)**

Apply the Ru1-Techwire theme first. Click any element inside the Navbar section.

Confirm:
- Sidebar shows "Block Content" section above element editors
- Fields visible: Brand Name, Show Search Bar, Top Links, Nav Links
- Editing "Brand Name" input and pressing Enter updates the canvas

- [ ] **Step 5: Test list field add/remove**

In Navbar block content, click "+ Add" on Nav Links. Confirm new row appears. Click ✕. Confirm it is removed.

- [ ] **Step 6: Test Global Page Styles button**

Click "⚙ Global Page Styles" at the bottom. Confirm library's right panel opens.

- [ ] **Step 7: Test deselect**

Click outside any canvas element. Confirm sidebar slides out.

- [ ] **Step 8: Commit**

```bash
git add app/composables/useBlockRegistry.ts app/composables/useEditorSidebar.ts app/components/EditorSidebar.client.vue app/composables/themes-data.ts app/composables/useThemes.ts app/components/PageBuilderWrapper.client.vue app/docs/superpowers/specs/2026-05-26-sidebar-editor-design.md app/docs/superpowers/plans/2026-05-26-sidebar-editor.md
git commit -m "feat: add two-mode sidebar editor with block content fields and element style editors"
```

---

## Adding Future Block Editors (Reference)

When a new block needs structured content editing, add to `themes-data.ts` and one call in `useThemes.ts`. No other files change.

**`themes-data.ts`:**
```ts
export const myBlockDefaults = { title: 'My Block', ... }
export const myBlockFields: FieldConfig[] = [{ key: 'title', label: 'Title', type: 'text' }]
export function renderMyBlock(data: typeof myBlockDefaults): string {
  return `<section data-component-title="My Block Title">...</section>`
}
```

**`useThemes.ts`** (inside `useThemes()` function body):
```ts
blockRegistry.register('My Block Title', { defaults: myBlockDefaults, fields: myBlockFields, render: renderMyBlock })
```

The sidebar handles it automatically — `EditorSidebar.client.vue` never needs editing to support new blocks.
