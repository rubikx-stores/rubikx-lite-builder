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

watch(() => props.modelValue, async (open) => {
  showUrlBar.value = false
  selectionError.value = ''
  editingAnchor.value = null
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

function wrapSelection(tag: string, attrs: Record<string, string>): boolean {
  const range = savedRange.value
  if (!range || range.collapsed) {
    selectionError.value = 'Select some text first.'
    return false
  }
  const wrapper = document.createElement(tag)
  for (const [k, v] of Object.entries(attrs)) wrapper.setAttribute(k, v)
  try {
    wrapper.appendChild(range.extractContents())
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
  const existing = currentMarkedAncestor('strong[data-faq-mark="bold"]')
  if (existing) {
    const parent = existing.parentNode
    if (!parent) return
    while (existing.firstChild) parent.insertBefore(existing.firstChild, existing)
    parent.removeChild(existing)
    return
  }
  wrapSelection('strong', { 'data-faq-mark': 'bold' })
}

function applyTextColor() {
  selectionError.value = ''
  wrapSelection('span', { 'data-faq-mark': 'color', style: `color:${textColorInput.value};` })
}

function applyFontSize(key: string) {
  selectionError.value = ''
  wrapSelection('span', { 'data-faq-mark': 'size', style: `font-size:${FONT_SIZES[key] ?? FONT_SIZES.base};` })
}

function applyLineHeight(key: string) {
  selectionError.value = ''
  wrapSelection('span', { 'data-faq-mark': 'lineheight', style: `line-height:${LINE_HEIGHTS[key] ?? LINE_HEIGHTS.normal};` })
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
  editingAnchor.value = null
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

function confirmLinkOrButton() {
  const href = urlInput.value.trim()
  if (!href) return
  const style = pendingType.value === 'button' ? buttonStyle() : 'color:inherit;text-decoration:underline;cursor:pointer;'

  if (editingAnchor.value) {
    const a = editingAnchor.value
    a.setAttribute('href', href)
    a.setAttribute('data-faq-mark', pendingType.value === 'button' ? 'button' : 'link')
    a.setAttribute('style', style)
  } else {
    const range = savedRange.value
    if (!range) return
    const anchor = document.createElement('a')
    anchor.setAttribute('href', href)
    anchor.setAttribute('target', '_blank')
    anchor.setAttribute('rel', 'noopener')
    anchor.setAttribute('data-faq-mark', pendingType.value === 'button' ? 'button' : 'link')
    anchor.setAttribute('style', style)
    try {
      anchor.appendChild(range.extractContents())
      range.insertNode(anchor)
    } catch {
      // leave content untouched
    }
  }

  showUrlBar.value = false
  editingAnchor.value = null
  savedRange.value = null
}

function cancelUrlBar() {
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

        <p class="mb-2 text-xs text-gray-500 shrink-0">Select text below, then apply a style. "Remove" clears whatever style is under the cursor.</p>

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
              type="url"
              placeholder="https://example.com"
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
