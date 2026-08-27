<script setup lang="ts">
// Bigger, WYSIWYG-ish replacement for the FAQ answer sidebar's single-line
// input — opened via an "Edit" button on that field (see
// EditorSidebar.client.vue). Lets the admin select text and apply bold,
// color, font size, a hyperlink, or a fully-styled button — entirely with
// app-local code (contenteditable + the Selection/Range API). No dependency
// on the library's own TipTap editor, which only reaches FAQ answers via the
// canvas "Manage Content" panel and isn't reachable from here.
//
// Every formatting op wraps the current selection in a plain <strong>/<span>/
// <a>, tagged with data-faq-mark so "Remove" can find and unwrap whichever
// one the cursor is inside, and so clicking back into an existing link/button
// re-opens its panel pre-filled for editing instead of creating a nested one.
//
// Edits are a local draft: nothing is written back to the block until "Save"
// is clicked; closing (X, backdrop, Cancel) discards them.
import { ref, shallowRef, watch, nextTick } from 'vue'

const props = defineProps<{ modelValue: boolean; initialHtml: string }>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  save: [html: string]
}>()

const editorEl = ref<HTMLElement | null>(null)
// shallowRef: a DOM Range's own reactivity doesn't matter here (it's used as
// a plain mutable box, never rendered), and ref()'s deep unwrap otherwise
// mangles the type of .startContainer/.endContainer (both plain Nodes).
const savedRange = shallowRef<Range | null>(null)
const selectionError = ref('')

const FONT_SIZES: Record<string, string> = { sm: '0.875rem', base: '1rem', lg: '1.25rem', xl: '1.5rem' }
const LINE_HEIGHTS: Record<string, string> = { tight: '1.2', normal: '1.5', relaxed: '1.75', loose: '2' }
const textColorInput = ref('#111827')
const fontSizeKey = ref('base')
const lineHeightKey = ref('normal')

const showUrlBar = ref(false)
const pendingType = ref<'link' | 'button' | null>(null)
const editingAnchor = ref<HTMLAnchorElement | null>(null)
// True while editingAnchor is a brand-new button created up-front (see
// startLinkOrButton) purely so its live preview has something to restyle —
// it isn't a real, confirmed part of the content yet. cancelUrlBar unwraps
// it if the admin backs out without clicking "Add".
const isDraftAnchor = ref(false)
const urlInput = ref('')
const buttonBgColor = ref('#111827')
const buttonTextColor = ref('#ffffff')
const buttonWidth = ref(140)
const buttonHeight = ref(40)
const buttonBorderRadius = ref(8)
const buttonPaddingX = ref(16)
const buttonPaddingY = ref(8)
const buttonMarginX = ref(0)
const buttonMarginY = ref(0)

// Live preview: every time a button style value changes while the button
// panel is open, immediately re-apply it to whatever <a> is being edited —
// the pre-existing one, or the draft created up-front for a new button.
watch(
  [buttonBgColor, buttonTextColor, buttonWidth, buttonHeight, buttonBorderRadius, buttonPaddingX, buttonPaddingY, buttonMarginX, buttonMarginY],
  () => {
    if (pendingType.value === 'button' && editingAnchor.value) {
      editingAnchor.value.setAttribute('style', buttonStyle())
    }
  },
)

watch(() => props.modelValue, async (open) => {
  showUrlBar.value = false
  selectionError.value = ''
  editingAnchor.value = null
  isDraftAnchor.value = false
  savedRange.value = null
  if (!open) return
  await nextTick()
  if (editorEl.value) editorEl.value.innerHTML = props.initialHtml || ''
})

// Toolbar buttons live outside the contenteditable, so clicking one would
// normally blur it and collapse the browser's text selection before the
// click handler runs. Capturing the Range on every mouseup/keyup inside the
// editor — and using @mousedown.prevent on plain toolbar buttons so they
// never steal focus in the first place — keeps a live reference to exactly
// what was selected. Native <input type="color">/<select> don't need the
// same treatment; their own focus shift doesn't clear the saved range.
function captureSelection() {
  const sel = window.getSelection()
  if (sel && sel.rangeCount > 0 && editorEl.value?.contains(sel.anchorNode)) {
    savedRange.value = sel.getRangeAt(0).cloneRange()
  }
}

// Contenteditable's default Enter behavior inserts a new <div> (or <p>) per
// line. That's invalid content wherever the saved HTML ends up embedded
// inside a <p> or <h1>-<h6> tag (both only allow phrasing content, not block
// elements) — the browser would silently cut that tag short right there,
// breaking its own styling for everything after the break. Forcing <br>
// instead keeps every line break valid no matter where this value renders.
function handleEditorKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    document.execCommand('insertLineBreak')
  }
}

function closestMarkFromNode(node: Node | null, selector: string): HTMLElement | null {
  if (!node) return null
  const el = node.nodeType === Node.TEXT_NODE ? node.parentElement : (node as HTMLElement)
  const found = el?.closest(selector) ?? null
  return found && editorEl.value?.contains(found) ? (found as HTMLElement) : null
}

// Uses the saved Range's own start/end containers (not window.getSelection()
// at click time) — for some selections .anchorNode resolves to a coarse
// container rather than the exact text node, which made closest() miss an
// existing link/button it was actually inside. Requiring the SAME marked
// ancestor at both boundaries also ensures a selection that only partially
// overlaps a mark isn't mistaken for being "inside" it.
function currentMarkedAncestor(selector: string): HTMLElement | null {
  const range = savedRange.value
  if (!range) return null
  const startMark = closestMarkFromNode(range.startContainer, selector)
  if (!startMark) return null
  const endMark = closestMarkFromNode(range.endContainer, selector)
  return startMark === endMark ? startMark : null
}

// Removes any elements matching `selector` found inside a fragment, keeping
// their own contents in place — used to scrub old color/size marks out of a
// selection before rewrapping it (see wrapSelection's clearSelector).
function stripMarksFromFragment(fragment: DocumentFragment, selector: string) {
  fragment.querySelectorAll(selector).forEach((mark) => {
    const parent = mark.parentNode
    if (!parent) return
    while (mark.firstChild) parent.insertBefore(mark.firstChild, mark)
    parent.removeChild(mark)
  })
}

// Removes an existing mark of this exact kind around the current selection,
// if any, returning whether one was found. Used by toggleBold (to flip
// bold off) and as a fallback for wrapSelection's clearSelector when the
// selection sits neatly inside a single mark rather than partially
// overlapping/spanning several (see stripMarksFromFragment for that case).
function unwrapExistingMark(selector: string): boolean {
  const existing = currentMarkedAncestor(selector)
  if (!existing) return false
  const parent = existing.parentNode
  if (!parent) return false
  while (existing.firstChild) parent.insertBefore(existing.firstChild, existing)
  parent.removeChild(existing)
  return true
}

// clearSelector strips any pre-existing mark of the same kind from the whole
// selection first (not just a single exact-ancestor match) — so applying a
// new color/size to a sentence that has some already-differently-colored/
// sized words inside it recolors the WHOLE sentence uniformly, instead of
// those specific words' own inline style keeping their old value and only
// the rest of the sentence changing.
function wrapSelection(tag: string, attrs: Record<string, string>, clearSelector?: string): boolean {
  const range = savedRange.value
  if (!range || range.collapsed) {
    selectionError.value = 'Select some text first.'
    return false
  }
  const wrapper = document.createElement(tag)
  for (const [k, v] of Object.entries(attrs)) wrapper.setAttribute(k, v)
  try {
    const extracted = range.extractContents()
    if (clearSelector) stripMarksFromFragment(extracted, clearSelector)
    wrapper.appendChild(extracted)
    range.insertNode(wrapper)
  } catch {
    // Selection spanned something extractContents couldn't handle cleanly —
    // leave content untouched rather than risk corrupting it.
    return false
  }
  savedRange.value = null
  return true
}

function toggleBold() {
  selectionError.value = ''
  if (unwrapExistingMark('strong[data-faq-mark="bold"]')) return
  wrapSelection('strong', { 'data-faq-mark': 'bold' })
}

function applyTextColor() {
  selectionError.value = ''
  wrapSelection('span', { 'data-faq-mark': 'color', style: `color:${textColorInput.value};` }, 'span[data-faq-mark="color"]')
}

function applyFontSize(key: string) {
  selectionError.value = ''
  wrapSelection('span', { 'data-faq-mark': 'size', style: `font-size:${FONT_SIZES[key] ?? FONT_SIZES.base};` }, 'span[data-faq-mark="size"]')
}

// Unlike Bold/Color/Size, line-height only visually changes anything when it
// spans a whole block — wrapping just the selected words in a <span> (the
// old behavior) has no meaningful effect on line spacing, since a browser's
// line-box height is governed by the block as a whole. So this always
// applies to the entire answer, regardless of what's selected, wrapping
// (or re-using) a single root-level element so the value survives into the
// saved HTML. That wrapper is a <span style="display:block"> rather than a
// <div> — the saved HTML gets embedded into all sorts of contexts (many
// inside a <p> tag), and a <div> isn't valid inside a <p> — the browser
// would silently close the <p> early and break its own styling. A <span>
// is valid there regardless of its display value, and display:block makes
// it behave identically to a div for line-height purposes.
function applyLineHeight(key: string) {
  selectionError.value = ''
  const el = editorEl.value
  if (!el) return
  const value = LINE_HEIGHTS[key] ?? LINE_HEIGHTS.normal
  let wrapper = el.firstElementChild as HTMLElement | null
  if (!wrapper || el.children.length !== 1 || wrapper.getAttribute('data-faq-mark') !== 'lineheight') {
    wrapper = document.createElement('span')
    wrapper.setAttribute('data-faq-mark', 'lineheight')
    wrapper.style.display = 'block'
    while (el.firstChild) wrapper.appendChild(el.firstChild)
    el.appendChild(wrapper)
  }
  wrapper.style.lineHeight = value
}

function rgbToHex(color: string, fallback: string): string {
  if (!color) return fallback
  if (color.startsWith('#')) return color
  const m = color.match(/\d+/g)
  if (!m) return fallback
  return '#' + m.slice(0, 3).map((n) => Number(n).toString(16).padStart(2, '0')).join('')
}

function startLinkOrButton(type: 'link' | 'button') {
  selectionError.value = ''
  const existingAnchor = currentMarkedAncestor('a[data-faq-mark]') as HTMLAnchorElement | null

  if (existingAnchor) {
    editingAnchor.value = existingAnchor
    isDraftAnchor.value = false
    pendingType.value = type
    urlInput.value = existingAnchor.getAttribute('href') || ''
    if (type === 'button') {
      buttonBgColor.value = rgbToHex(existingAnchor.style.backgroundColor, '#111827')
      buttonTextColor.value = rgbToHex(existingAnchor.style.color, '#ffffff')
      buttonWidth.value = parseInt(existingAnchor.style.width, 10) || 140
      buttonHeight.value = parseInt(existingAnchor.style.height, 10) || 40
      buttonBorderRadius.value = parseInt(existingAnchor.style.borderRadius, 10) || 8
      buttonPaddingX.value = parseInt(existingAnchor.style.paddingLeft, 10) || 16
      buttonPaddingY.value = parseInt(existingAnchor.style.paddingTop, 10) || 8
      buttonMarginX.value = parseInt(existingAnchor.style.marginLeft, 10) || 0
      buttonMarginY.value = parseInt(existingAnchor.style.marginTop, 10) || 0
    }
    showUrlBar.value = true
    return
  }

  if (!savedRange.value || savedRange.value.collapsed) {
    selectionError.value = 'Select some text first.'
    return
  }
  // Clear the target BEFORE resetting the style refs below — the live-preview
  // watch fires on every one of those resets, and would otherwise restyle
  // whatever anchor was being edited in this modal session just before.
  editingAnchor.value = null
  isDraftAnchor.value = false
  pendingType.value = type
  urlInput.value = ''
  buttonBgColor.value = '#111827'
  buttonTextColor.value = '#ffffff'
  buttonWidth.value = 140
  buttonHeight.value = 40
  buttonBorderRadius.value = 8
  buttonPaddingX.value = 16
  buttonPaddingY.value = 8
  buttonMarginX.value = 0
  buttonMarginY.value = 0

  if (type === 'button') {
    // Wrap the selection right away (with default styles) instead of
    // waiting for "Add" — this gives the width/height/padding/margin/radius
    // sliders a live element to restyle as soon as they're moved. Cancel
    // unwraps this draft again if the admin backs out.
    const range = savedRange.value
    const draft = document.createElement('a')
    draft.setAttribute('data-faq-mark', 'button')
    draft.setAttribute('style', buttonStyle())
    try {
      draft.appendChild(range.extractContents())
      range.insertNode(draft)
    } catch {
      selectionError.value = 'Could not apply a button to that selection.'
      return
    }
    editingAnchor.value = draft
    isDraftAnchor.value = true
    // The button draft has already consumed the range (extractContents
    // above) — clear it so nothing downstream tries to reuse a stale Range.
    savedRange.value = null
  } else {
    // A brand-new LINK still needs savedRange later, in confirmLinkOrButton,
    // to wrap the selection once the URL is entered — do NOT clear it here.
    editingAnchor.value = null
    isDraftAnchor.value = false
  }

  showUrlBar.value = true
}

// Literal width/height (not derived from padding) so the number entered is
// exactly the rendered box size regardless of the text's own length —
// box-sizing keeps padding/border from adding to that, inline-flex centers
// the label inside it, and overflow:hidden + ellipsis keeps a too-long label
// from breaking the box if the chosen width can't fit it. Padding then
// controls the gap between the label and the button's own edge (within that
// fixed box), and margin controls the gap between the button and whatever
// text sits next to it.
function buttonStyle(): string {
  return `display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;width:${buttonWidth.value}px;height:${buttonHeight.value}px;padding:${buttonPaddingY.value}px ${buttonPaddingX.value}px;margin:${buttonMarginY.value}px ${buttonMarginX.value}px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;background:${buttonBgColor.value};color:${buttonTextColor.value};border-radius:${buttonBorderRadius.value}px;text-decoration:none;font-weight:600;`
}

// A bare domain ("example.com") or bare email ("you@example.com") typed
// without a scheme resolves as a path relative to the current page instead
// of navigating anywhere — silently "does nothing" from the admin's point of
// view. Recognized schemes, root-relative ("/shop"), and in-page ("#faq")
// links pass through untouched.
function normalizeHref(raw: string): string {
  if (/^([a-z][a-z0-9+.-]*:|\/|#)/i.test(raw)) return raw
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)) return `mailto:${raw}`
  return `https://${raw}`
}

function confirmLinkOrButton() {
  const raw = urlInput.value.trim()
  if (!raw) return
  const href = normalizeHref(raw)
  const style = pendingType.value === 'button' ? buttonStyle() : 'color:inherit;text-decoration:underline;cursor:pointer;'

  if (editingAnchor.value) {
    const a = editingAnchor.value
    a.setAttribute('href', href)
    a.setAttribute('data-faq-mark', pendingType.value === 'button' ? 'button' : 'link')
    a.setAttribute('style', style)
    if (isDraftAnchor.value) {
      a.setAttribute('target', '_blank')
      a.setAttribute('rel', 'noopener')
    }
  } else {
    // Only reached for a brand-new LINK — a brand-new button is already a
    // live editingAnchor by this point (see startLinkOrButton).
    const range = savedRange.value
    if (!range) return
    const anchor = document.createElement('a')
    anchor.setAttribute('href', href)
    anchor.setAttribute('target', '_blank')
    anchor.setAttribute('rel', 'noopener')
    anchor.setAttribute('data-faq-mark', 'link')
    anchor.setAttribute('style', style)
    try {
      anchor.appendChild(range.extractContents())
      range.insertNode(anchor)
    } catch {
      // leave content untouched
    }
  }

  isDraftAnchor.value = false
  showUrlBar.value = false
  editingAnchor.value = null
  savedRange.value = null
}

function cancelUrlBar() {
  // A brand-new button's live-preview draft was only ever provisional —
  // back out of it exactly like before this element existed at all.
  if (isDraftAnchor.value && editingAnchor.value) {
    const el = editingAnchor.value
    const parent = el.parentNode
    if (parent) {
      while (el.firstChild) parent.insertBefore(el.firstChild, el)
      parent.removeChild(el)
    }
  }
  isDraftAnchor.value = false
  showUrlBar.value = false
  editingAnchor.value = null
}

// Unwraps whichever data-faq-mark element (link, button, bold, color, size)
// the caret/selection sits inside — the general "clear formatting here".
function removeFormatting() {
  selectionError.value = ''
  const marked = currentMarkedAncestor('[data-faq-mark]')
  if (!marked) {
    selectionError.value = 'Click inside some styled text first.'
    return
  }
  const parent = marked.parentNode
  if (!parent) return
  while (marked.firstChild) parent.insertBefore(marked.firstChild, marked)
  parent.removeChild(marked)
}

function close() {
  emit('update:modelValue', false)
}

function save() {
  emit('save', editorEl.value?.innerHTML ?? '')
  emit('update:modelValue', false)
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="props.modelValue"
      class="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 p-4"
      @click.self="close"
    >
      <div class="w-full max-w-2xl rounded-xl bg-white p-5 shadow-xl max-h-[90vh] flex flex-col">
        <div class="mb-3 flex items-center justify-between shrink-0">
          <h3 class="text-lg font-medium text-gray-900">Edit Answer</h3>
          <button
            type="button"
            aria-label="Close"
            class="cursor-pointer rounded-md border-none bg-transparent p-1 text-gray-400 hover:text-gray-700"
            @click="close"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <p class="mb-2 text-xs text-gray-500 shrink-0">Select text below, then apply a style. Line Height applies to the whole text instead, since it only affects spacing at that scale. "Remove" clears whatever style is under the cursor.</p>

        <!-- Format row -->
        <div class="mb-2 flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            class="flex items-center gap-1 rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100"
            @mousedown.prevent
            @click="toggleBold"
          >
            <span class="material-symbols-outlined text-base">format_bold</span>
            Bold
          </button>

          <label class="flex items-center gap-1.5 rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700">
            <span class="material-symbols-outlined text-base">format_color_text</span>
            Color
            <input
              v-model="textColorInput"
              type="color"
              class="h-5 w-6 cursor-pointer rounded border-none p-0"
              @change="applyTextColor"
            />
          </label>

          <label class="flex items-center gap-1.5 rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700">
            <span class="material-symbols-outlined text-base">format_size</span>
            Size
            <select
              v-model="fontSizeKey"
              class="rounded border-none bg-transparent text-xs font-medium text-gray-700 focus:outline-none"
              @change="applyFontSize(fontSizeKey)"
            >
              <option value="sm">Small</option>
              <option value="base">Normal</option>
              <option value="lg">Large</option>
              <option value="xl">X-Large</option>
            </select>
          </label>

          <label class="flex items-center gap-1.5 rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700">
            <span class="material-symbols-outlined text-base">format_line_spacing</span>
            Line Height
            <select
              v-model="lineHeightKey"
              class="rounded border-none bg-transparent text-xs font-medium text-gray-700 focus:outline-none"
              @change="applyLineHeight(lineHeightKey)"
            >
              <option value="tight">Tight</option>
              <option value="normal">Normal</option>
              <option value="relaxed">Relaxed</option>
              <option value="loose">Loose</option>
            </select>
          </label>
        </div>

        <!-- Insert row -->
        <div class="mb-2 flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            class="flex items-center gap-1 rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100"
            @mousedown.prevent
            @click="startLinkOrButton('link')"
          >
            <span class="material-symbols-outlined text-base">link</span>
            Link
          </button>
          <button
            type="button"
            class="flex items-center gap-1 rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100"
            @mousedown.prevent
            @click="startLinkOrButton('button')"
          >
            <span class="material-symbols-outlined text-base">smart_button</span>
            Button
          </button>
          <button
            type="button"
            class="flex items-center gap-1 rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100"
            @mousedown.prevent
            @click="removeFormatting"
          >
            <span class="material-symbols-outlined text-base">link_off</span>
            Remove
          </button>
          <span v-if="selectionError" class="text-xs text-red-500">{{ selectionError }}</span>
        </div>

        <!-- Link / Button settings panel -->
        <div v-if="showUrlBar" class="mb-2 space-y-2 rounded-md border border-gray-200 bg-gray-50 p-2 shrink-0">
          <div class="flex items-center gap-2">
            <label class="w-24 shrink-0 text-xs text-gray-600">URL</label>
            <input
              v-model="urlInput"
              type="text"
              placeholder="https://example.com, you@example.com, or /shop"
              class="min-w-0 flex-1 rounded border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:border-blue-400"
              @keydown.enter.prevent="confirmLinkOrButton"
            />
          </div>

          <template v-if="pendingType === 'button'">
            <div class="flex items-center gap-2">
              <label class="w-24 shrink-0 text-xs text-gray-600">Background</label>
              <input v-model="buttonBgColor" type="color" class="h-7 w-10 cursor-pointer rounded border-none p-0" />
              <span class="text-xs text-gray-500">{{ buttonBgColor }}</span>
            </div>
            <div class="flex items-center gap-2">
              <label class="w-24 shrink-0 text-xs text-gray-600">Text Color</label>
              <input v-model="buttonTextColor" type="color" class="h-7 w-10 cursor-pointer rounded border-none p-0" />
              <span class="text-xs text-gray-500">{{ buttonTextColor }}</span>
            </div>
            <div class="grid grid-cols-2 gap-x-4 gap-y-2">
              <div class="flex items-center gap-2">
                <label class="w-16 shrink-0 text-xs text-gray-600">Width</label>
                <input v-model.number="buttonWidth" type="range" min="60" max="400" class="flex-1" />
                <span class="w-10 shrink-0 text-right text-xs text-gray-500">{{ buttonWidth }}px</span>
              </div>
              <div class="flex items-center gap-2">
                <label class="w-16 shrink-0 text-xs text-gray-600">Height</label>
                <input v-model.number="buttonHeight" type="range" min="24" max="120" class="flex-1" />
                <span class="w-10 shrink-0 text-right text-xs text-gray-500">{{ buttonHeight }}px</span>
              </div>
              <div class="flex items-center gap-2">
                <label class="w-16 shrink-0 text-xs text-gray-600">Pad X</label>
                <input v-model.number="buttonPaddingX" type="range" min="0" max="60" class="flex-1" />
                <span class="w-10 shrink-0 text-right text-xs text-gray-500">{{ buttonPaddingX }}px</span>
              </div>
              <div class="flex items-center gap-2">
                <label class="w-16 shrink-0 text-xs text-gray-600">Pad Y</label>
                <input v-model.number="buttonPaddingY" type="range" min="0" max="40" class="flex-1" />
                <span class="w-10 shrink-0 text-right text-xs text-gray-500">{{ buttonPaddingY }}px</span>
              </div>
              <div class="flex items-center gap-2">
                <label class="w-16 shrink-0 text-xs text-gray-600">Margin X</label>
                <input v-model.number="buttonMarginX" type="range" min="0" max="60" class="flex-1" />
                <span class="w-10 shrink-0 text-right text-xs text-gray-500">{{ buttonMarginX }}px</span>
              </div>
              <div class="flex items-center gap-2">
                <label class="w-16 shrink-0 text-xs text-gray-600">Margin Y</label>
                <input v-model.number="buttonMarginY" type="range" min="0" max="40" class="flex-1" />
                <span class="w-10 shrink-0 text-right text-xs text-gray-500">{{ buttonMarginY }}px</span>
              </div>
              <div class="flex items-center gap-2">
                <label class="w-16 shrink-0 text-xs text-gray-600">Radius</label>
                <input v-model.number="buttonBorderRadius" type="range" min="0" max="32" class="flex-1" />
                <span class="w-10 shrink-0 text-right text-xs text-gray-500">{{ buttonBorderRadius }}px</span>
              </div>
            </div>
            <p class="text-xs text-gray-400">Padding is the gap between the label and the button's edge; Margin is the gap between the button and surrounding text. A too-long label clips with an ellipsis rather than stretching the box.</p>
          </template>

          <div class="flex justify-end gap-2">
            <button type="button" class="rounded border border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100" @click="cancelUrlBar">Cancel</button>
            <button type="button" class="rounded bg-gray-900 px-2.5 py-1 text-xs font-medium text-white hover:bg-gray-700" @click="confirmLinkOrButton">{{ editingAnchor ? 'Update' : 'Add' }}</button>
          </div>
        </div>

        <div
          ref="editorEl"
          contenteditable="true"
          class="flex-1 overflow-y-auto rounded-md border border-gray-200 px-3 py-2 text-sm leading-relaxed focus:outline-none"
          style="min-height: 16rem;"
          @mouseup="captureSelection"
          @keyup="captureSelection"
          @keydown="handleEditorKeydown"
        ></div>

        <div class="mt-3 flex flex-row gap-2 shrink-0">
          <button
            type="button"
            class="flex-1 rounded-md border border-gray-300 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            @click="close"
          >
            Cancel
          </button>
          <button
            type="button"
            class="flex-1 rounded-md bg-gray-900 py-2 text-sm font-medium text-white hover:bg-gray-700"
            @click="save"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
