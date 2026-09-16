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
import { ref, shallowRef, computed, watch, nextTick, onUnmounted } from 'vue'
import { FONT_FAMILY_OPTIONS } from '../../composables/editor/fontFields'

const props = defineProps<{
  modelValue: boolean
  initialHtml: string
  // Optional base CSS (font-size/weight/colour/line-height/family) so the
  // editable preview roughly matches the field's real on-page appearance —
  // e.g. a 48px hero title previews near 48px instead of the small default.
  // Per-selection marks (Bold, Color, Size, Weight, …) still layer on top of
  // this via normal CSS inline-style precedence. Left empty (the FAQ-answer
  // case has no such base style to read), the editable keeps its original
  // compact look.
  previewStyle?: string
}>()
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
// Mirrors savedRange as a set of on-screen boxes so the selection stays
// visibly highlighted even once focus moves to a Color/Size/Line-Height
// control — the browser's own selection rendering dims/disappears the
// moment the contenteditable itself isn't the focused element.
const highlightRects = ref<{ top: number; left: number; width: number; height: number }[]>([])

const FONT_SIZES: Record<string, string> = { sm: '0.875rem', base: '1rem', lg: '1.25rem', xl: '1.5rem' }
const LINE_HEIGHTS: Record<string, string> = { tight: '1.2', normal: '1.5', relaxed: '1.75', loose: '2' }
const LETTER_SPACINGS: Record<string, string> = { tight: '-0.02em', normal: '0', wide: '0.05em', wider: '0.1em' }
const FONT_WEIGHTS = [
  { value: '300', label: 'Light' },
  { value: '400', label: 'Regular' },
  { value: '500', label: 'Medium' },
  { value: '600', label: 'SemiBold' },
  { value: '700', label: 'Bold' },
  { value: '800', label: 'ExtraBold' },
  { value: '900', label: 'Black' },
]
const textColorInput = ref('#111827')
const fontSizeKey = ref('base')
const lineHeightKey = ref('normal')
// Precise pixel size — a supplement to the sm/base/lg/xl presets above,
// needed once this modal started editing large headline-style fields (a
// hero title) rather than just FAQ-answer body text, where the presets
// don't reach anywhere near the sizes those fields actually use.
const customFontSizePx = ref(16)
const fontWeightKey = ref('700')
const letterSpacingKey = ref('normal')
const textAlignKey = ref<'left' | 'center' | 'right'>('left')
const gradientFromColor = ref('#4f46e5')
const gradientToColor = ref('#ec4899')
const fontFamilyKey = ref('')

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
  setSavedRange(null)
  document.removeEventListener('selectionchange', captureSelection)
  if (!open) return
  // Seed the pixel-size input from the field's real base size (previewStyle)
  // so it starts near "what this text actually is" instead of a generic 16 —
  // e.g. opening a 48px hero title shows 48 there, ready to nudge.
  const baseSizeMatch = /font-size:\s*([\d.]+)px/.exec(props.previewStyle || '')
  customFontSizePx.value = baseSizeMatch ? Math.round(parseFloat(baseSizeMatch[1])) : 16
  fontWeightKey.value = '700'
  letterSpacingKey.value = 'normal'
  textAlignKey.value = 'left'
  await nextTick()
  if (editorEl.value) editorEl.value.innerHTML = props.initialHtml || ''
  // Supplements the @mouseup/@keyup handlers on the editable itself: a drag
  // selection that's released outside the editable's box never fires mouseup
  // there, which left savedRange stale and made the toolbar act as if
  // nothing were selected. selectionchange fires regardless of where the
  // mouse is released, as long as the document's selection actually changed.
  document.addEventListener('selectionchange', captureSelection)
})

onUnmounted(() => {
  document.removeEventListener('selectionchange', captureSelection)
})

function updateHighlight() {
  const range = savedRange.value
  const editor = editorEl.value
  if (!range || !editor || range.collapsed) {
    highlightRects.value = []
    return
  }
  const editorRect = editor.getBoundingClientRect()
  highlightRects.value = Array.from(range.getClientRects()).map((r) => ({
    top: r.top - editorRect.top,
    left: r.left - editorRect.left,
    width: r.width,
    height: r.height,
  }))
}

function setSavedRange(range: Range | null) {
  savedRange.value = range
  updateHighlight()
}

// Toolbar buttons live outside the contenteditable, so clicking one would
// normally blur it and collapse the browser's text selection before the
// click handler runs. Capturing the Range on every mouseup/keyup inside the
// editor — and using @mousedown.prevent on plain toolbar buttons so they
// never steal focus in the first place — keeps a live reference to exactly
// what was selected. Native <input type="color">/<select> don't need the
// same treatment; their own focus shift doesn't clear the saved range (it's
// also mirrored into highlightRects — see updateHighlight — so the
// selection stays visible after that focus shift too).
function captureSelection() {
  const sel = window.getSelection()
  if (sel && sel.rangeCount > 0 && editorEl.value?.contains(sel.anchorNode)) {
    setSavedRange(sel.getRangeAt(0).cloneRange())
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

// Drives the toolbar's pressed/active look and the "N characters selected"
// status line below the intro text — both recompute automatically whenever
// setSavedRange runs, giving a non-technical admin a constant, explicit
// answer to "what's selected right now" instead of relying on the browser's
// own (easily-lost) selection highlight.
const isBoldActive = computed(() => !!currentMarkedAncestor('strong[data-faq-mark="bold"]'))
const isUppercaseActive = computed(() => !!currentMarkedAncestor('span[data-faq-mark="uppercase"]'))
const hasSelection = computed(() => {
  const range = savedRange.value
  return !!range && !range.collapsed
})
const activeAnchorMarkType = computed(() => currentMarkedAncestor('a[data-faq-mark]')?.getAttribute('data-faq-mark') ?? null)
const selectionSummary = computed(() => {
  const range = savedRange.value
  if (!range || range.collapsed) return 'No text selected'
  const len = range.toString().length
  return `${len} character${len === 1 ? '' : 's'} selected`
})

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
  // Unlike wrapSelection, this used to leave savedRange pointing at the
  // now-unwrapped range without clearing it — stale enough that a follow-up
  // action before any new selection could act on outdated boundaries.
  setSavedRange(null)
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
    // leave content untouched rather than risk corrupting it. Surfacing this
    // (instead of a bare `return false`) is the difference between the admin
    // seeing "why didn't Bold apply?" with no explanation and getting an
    // actual reason.
    selectionError.value = "Couldn't apply that to the current selection — try selecting a smaller or simpler range."
    return false
  }
  setSavedRange(null)
  return true
}

function toggleBold() {
  selectionError.value = ''
  if (unwrapExistingMark('strong[data-faq-mark="bold"]')) return
  // Same clearSelector treatment as Color/Size (see wrapSelection). Without
  // it, a selection that only partially overlaps an existing bold run (the
  // exact-ancestor check above requires BOTH ends to sit inside the very
  // same <strong>) nested a new <strong> instead of normalizing it, so
  // toggling bold back off only unwrapped the innermost layer and the text
  // stayed visibly bold.
  wrapSelection('strong', { 'data-faq-mark': 'bold' }, 'strong[data-faq-mark="bold"]')
}

// Bound to the color <input>'s own `input` event (fires continuously while
// dragging inside the native color picker), not `change` (which only fires
// once the picker closes) — the reason picking a color didn't feel "live"
// and needed a hard click/Enter to actually commit. Same live-preview
// pattern as the Button feature's editingAnchor: the first firing wraps the
// selection and keeps a reference to that wrapper; every firing after that
// just restyles the SAME element directly instead of re-running
// extractContents/insertNode (which would fail on the 2nd+ call anyway,
// since wrapSelection already consumes/clears the selection on success).
// finalizeTextColor (bound to `change`, which fires once when the picker
// closes) drops that reference so the next time this control is used — on a
// different selection — it starts a fresh wrapper instead of continuing to
// restyle this one.
const liveColorMark = shallowRef<HTMLElement | null>(null)

function applyTextColor() {
  selectionError.value = ''
  if (liveColorMark.value) {
    liveColorMark.value.setAttribute('style', `color:${textColorInput.value};`)
    return
  }
  const range = savedRange.value
  if (!range || range.collapsed) {
    selectionError.value = 'Select some text first.'
    return
  }
  const wrapper = document.createElement('span')
  wrapper.setAttribute('data-faq-mark', 'color')
  wrapper.setAttribute('style', `color:${textColorInput.value};`)
  try {
    const extracted = range.extractContents()
    stripMarksFromFragment(extracted, 'span[data-faq-mark="color"], span[data-faq-mark="gradient"]')
    wrapper.appendChild(extracted)
    range.insertNode(wrapper)
  } catch {
    selectionError.value = "Couldn't apply that to the current selection — try selecting a smaller or simpler range."
    return
  }
  liveColorMark.value = wrapper
  setSavedRange(null)
}

function finalizeTextColor() {
  liveColorMark.value = null
}

// Gradient text: a solid text-color and a gradient are mutually exclusive, so
// this clears either kind of pre-existing mark from the selection first, same
// as applyTextColor does in the other direction. Both -webkit-background-clip
// and the unprefixed background-clip are set (older WebKit still needs the
// prefix), and -webkit-text-fill-color is set alongside color:transparent —
// the former is what WebKit/Blink actually honors for the fill, the latter is
// the standard fallback for engines that don't support any of this and would
// otherwise render solid black text over the gradient.
function applyGradientText() {
  selectionError.value = ''
  wrapSelection(
    'span',
    {
      'data-faq-mark': 'gradient',
      style: `background-image:linear-gradient(90deg, ${gradientFromColor.value}, ${gradientToColor.value});-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-fill-color:transparent;`,
    },
    'span[data-faq-mark="color"], span[data-faq-mark="gradient"]',
  )
}

// '' (the "Default" option) clears any existing font-family mark instead of
// wrapping with an empty style — same extractContents/stripMarksFromFragment
// steps wrapSelection uses internally, reused here directly since there's no
// wrapper to insert in this branch.
function applyFontFamily(key: string) {
  selectionError.value = ''
  if (!key) {
    // Same ancestor-unwrap approach as toggleBold/toggleUppercase — finds the
    // actual wrapping <span> from the cursor/selection and removes exactly
    // that element. The previous extractContents-based approach only found a
    // mark to strip when the selection extended past the span's own
    // boundary; selecting precisely the marked word (e.g. a double-click,
    // landing entirely inside the span) extracted plain text with no <span>
    // in it, so there was nothing to strip and the word landed right back
    // inside the same still-there font-marked span — "Default" silently did
    // nothing for the single most common way to select a word.
    if (unwrapExistingMark('span[data-faq-mark="font"]')) return
    selectionError.value = 'Click inside the styled text first.'
    return
  }
  wrapSelection('span', { 'data-faq-mark': 'font', style: `font-family:${key};` }, 'span[data-faq-mark="font"]')
}

function applyFontSize(key: string) {
  selectionError.value = ''
  wrapSelection('span', { 'data-faq-mark': 'size', style: `font-size:${FONT_SIZES[key] ?? FONT_SIZES.base};` }, 'span[data-faq-mark="size"]')
}

// Supplements the sm/base/lg/xl presets with an exact pixel value — needed
// once this modal started editing headline-sized fields (e.g. a hero title),
// where those small presets don't reach anywhere near the sizes actually
// used. Same clearSelector as the preset version so the two share one mark
// and never stack conflicting sizes on the same run.
function applyFontSizePx(px: number) {
  selectionError.value = ''
  if (!px || px <= 0) return
  wrapSelection('span', { 'data-faq-mark': 'size', style: `font-size:${px}px;` }, 'span[data-faq-mark="size"]')
}

function applyFontWeight(weight: string) {
  selectionError.value = ''
  wrapSelection('span', { 'data-faq-mark': 'weight', style: `font-weight:${weight};` }, 'span[data-faq-mark="weight"]')
}

function applyLetterSpacing(key: string) {
  selectionError.value = ''
  wrapSelection('span', { 'data-faq-mark': 'letterspacing', style: `letter-spacing:${LETTER_SPACINGS[key] ?? LETTER_SPACINGS.normal};` }, 'span[data-faq-mark="letterspacing"]')
}

function toggleUppercase() {
  selectionError.value = ''
  if (unwrapExistingMark('span[data-faq-mark="uppercase"]')) return
  wrapSelection('span', { 'data-faq-mark': 'uppercase', style: 'text-transform:uppercase;' }, 'span[data-faq-mark="uppercase"]')
}

// Line-height and text-align only visually change anything when they span a
// whole block — wrapping just the selected words in a <span> has no
// meaningful effect, since a browser's line-box/alignment is governed by the
// block as a whole. So both always apply to the entire answer regardless of
// what's selected, sharing one root-level wrapper element so the values
// survive into the saved HTML. That wrapper is a <span style="display:block">
// rather than a <div> — the saved HTML gets embedded into all sorts of
// contexts (many inside a <p> tag), and a <div> isn't valid inside a <p> —
// the browser would silently close the <p> early and break its own styling.
// A <span> is valid there regardless of its display value, and
// display:block makes it behave identically to a div for these purposes.
function ensureBlockWrapper(): HTMLElement | null {
  const el = editorEl.value
  if (!el) return null
  let wrapper = el.firstElementChild as HTMLElement | null
  if (!wrapper || el.children.length !== 1 || wrapper.getAttribute('data-faq-mark') !== 'block') {
    wrapper = document.createElement('span')
    wrapper.setAttribute('data-faq-mark', 'block')
    wrapper.style.display = 'block'
    while (el.firstChild) wrapper.appendChild(el.firstChild)
    el.appendChild(wrapper)
  }
  return wrapper
}

function applyLineHeight(key: string) {
  selectionError.value = ''
  const wrapper = ensureBlockWrapper()
  if (!wrapper) return
  wrapper.style.lineHeight = LINE_HEIGHTS[key] ?? LINE_HEIGHTS.normal
}

function applyTextAlign(align: 'left' | 'center' | 'right') {
  selectionError.value = ''
  const wrapper = ensureBlockWrapper()
  if (!wrapper) return
  wrapper.style.textAlign = align
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
    setSavedRange(null)
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
  // content-box (not border-box): Width/Height size the label area only, and
  // Padding ADDS around it — final box = width + 2*padX by height + 2*padY.
  // With border-box, Width/Height set the TOTAL box and padding just ate
  // into that same fixed total, so with the label centered inside it,
  // nothing ever visibly moved as Padding changed. content-box makes both
  // sliders compose the same way: each one directly grows/shrinks the
  // rendered button, with no masking between them.
  return `display:inline-flex;align-items:center;justify-content:center;box-sizing:content-box;width:${buttonWidth.value}px;height:${buttonHeight.value}px;padding:${buttonPaddingY.value}px ${buttonPaddingX.value}px;margin:${buttonMarginY.value}px ${buttonMarginX.value}px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;background:${buttonBgColor.value};color:${buttonTextColor.value};border-radius:${buttonBorderRadius.value}px;text-decoration:none;font-weight:600;`
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
  if (!raw) {
    selectionError.value = 'Enter a URL first.'
    return
  }
  selectionError.value = ''
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
    if (!range) {
      selectionError.value = 'Selection was lost — reselect the text and try again.'
      return
    }
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
      selectionError.value = "Couldn't create the link for that selection — try selecting a smaller or simpler range."
    }
  }

  isDraftAnchor.value = false
  showUrlBar.value = false
  editingAnchor.value = null
  setSavedRange(null)
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
      <div class="w-full max-w-4xl rounded-xl bg-white p-5 shadow-xl max-h-[92vh] overflow-y-auto flex flex-col">
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

        <p class="mb-2 text-xs text-gray-500 shrink-0">Select text below, then apply a style. Line Height and Align apply to the whole text instead, since they only affect layout at that scale. "Remove" clears whatever style is under the cursor.</p>

        <!-- Always-visible selection status: the editor's own highlight can
             visually fade once focus moves to a Color/Size control, so this
             label is the reliable answer to "what's selected right now" and
             to why an action didn't apply. -->
        <div class="mb-2 flex items-center justify-between gap-2 text-xs shrink-0">
          <span
            class="rounded-full px-2 py-0.5 font-medium"
            :class="hasSelection ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'"
          >{{ selectionSummary }}</span>
          <span v-if="selectionError" class="text-red-500">{{ selectionError }}</span>
        </div>

        <!-- Text style row -->
        <div class="mb-2 flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            class="flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium hover:bg-gray-100"
            :class="isBoldActive ? 'border-gray-900 bg-gray-900 text-white hover:bg-gray-800' : 'border-gray-200 bg-gray-50 text-gray-700'"
            @mousedown.prevent
            @click="toggleBold"
          >
            <span class="material-symbols-outlined text-base">format_bold</span>
            Bold
          </button>

          <button
            type="button"
            class="flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium hover:bg-gray-100"
            :class="isUppercaseActive ? 'border-gray-900 bg-gray-900 text-white hover:bg-gray-800' : 'border-gray-200 bg-gray-50 text-gray-700'"
            @mousedown.prevent
            @click="toggleUppercase"
          >
            <span class="material-symbols-outlined text-base">text_fields</span>
            Uppercase
          </button>

          <label class="flex items-center gap-1.5 rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700">
            <span class="material-symbols-outlined text-base">format_color_text</span>
            Color
            <input
              v-model="textColorInput"
              type="color"
              class="h-5 w-6 cursor-pointer rounded border-none p-0"
              @input="applyTextColor"
              @change="finalizeTextColor"
            />
          </label>

          <div class="flex items-center gap-1.5 rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700">
            <span class="material-symbols-outlined text-base">gradient</span>
            Gradient
            <input
              v-model="gradientFromColor"
              type="color"
              class="h-5 w-6 cursor-pointer rounded border-none p-0"
              title="Gradient start color"
            />
            <input
              v-model="gradientToColor"
              type="color"
              class="h-5 w-6 cursor-pointer rounded border-none p-0"
              title="Gradient end color"
            />
            <button
              type="button"
              class="rounded border border-gray-300 bg-white px-1.5 py-0.5 text-[11px] font-medium text-gray-700 hover:bg-gray-100"
              @mousedown.prevent
              @click="applyGradientText"
            >
              Apply
            </button>
          </div>

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

          <!-- Exact pixel size — the presets above top out at 1.5rem/24px,
               nowhere near what a hero title actually needs. -->
          <div class="flex items-center gap-1 rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700">
            <span class="material-symbols-outlined text-base">format_size</span>
            <button
              type="button"
              class="flex h-5 w-5 items-center justify-center rounded border border-gray-300 bg-white text-gray-600 hover:bg-gray-100"
              @mousedown.prevent
              @click="customFontSizePx = Math.max(8, customFontSizePx - 1)"
            >−</button>
            <input
              v-model.number="customFontSizePx"
              type="number"
              min="8"
              max="200"
              class="w-12 rounded border border-gray-300 bg-white px-1 py-0.5 text-center text-xs focus:outline-none focus:border-blue-400"
              @change="applyFontSizePx(customFontSizePx)"
              @keydown.enter.prevent="applyFontSizePx(customFontSizePx)"
            />
            <button
              type="button"
              class="flex h-5 w-5 items-center justify-center rounded border border-gray-300 bg-white text-gray-600 hover:bg-gray-100"
              @mousedown.prevent
              @click="customFontSizePx = Math.min(200, customFontSizePx + 1)"
            >+</button>
            px
            <!-- Explicit trigger: a native <select>/number input only fires
                 change when its value actually differs from what's already
                 showing, so re-picking/re-entering the same px value (or
                 nudging ± back to a value you'd already applied) silently
                 did nothing. This always re-applies the current number,
                 regardless of whether it changed. -->
            <button
              type="button"
              class="rounded border border-gray-300 bg-white px-1.5 py-0.5 text-[11px] font-medium text-gray-700 hover:bg-gray-100"
              @mousedown.prevent
              @click="applyFontSizePx(customFontSizePx)"
            >
              Apply
            </button>
          </div>

          <label class="flex items-center gap-1.5 rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700">
            <span class="material-symbols-outlined text-base">line_weight</span>
            Weight
            <select
              v-model="fontWeightKey"
              class="rounded border-none bg-transparent text-xs font-medium text-gray-700 focus:outline-none"
              @change="applyFontWeight(fontWeightKey)"
            >
              <option v-for="w in FONT_WEIGHTS" :key="w.value" :value="w.value">{{ w.label }}</option>
            </select>
          </label>

          <label class="flex items-center gap-1.5 rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700">
            <span class="material-symbols-outlined text-base">format_letter_spacing</span>
            Letter Spacing
            <select
              v-model="letterSpacingKey"
              class="rounded border-none bg-transparent text-xs font-medium text-gray-700 focus:outline-none"
              @change="applyLetterSpacing(letterSpacingKey)"
            >
              <option value="tight">Tight</option>
              <option value="normal">Normal</option>
              <option value="wide">Wide</option>
              <option value="wider">Wider</option>
            </select>
          </label>
        </div>

        <!-- Layout row: line height and alignment only make visible sense
             applied to the whole text (see ensureBlockWrapper), unlike the
             per-selection rows above. -->
        <div class="mb-2 flex flex-wrap items-center gap-2 shrink-0">
          <label class="flex items-center gap-1.5 rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700">
            <span class="material-symbols-outlined text-base">font_download</span>
            Font
            <select
              v-model="fontFamilyKey"
              class="max-w-[9rem] rounded border-none bg-transparent text-xs font-medium text-gray-700 focus:outline-none"
              @change="applyFontFamily(fontFamilyKey)"
            >
              <option v-for="opt in FONT_FAMILY_OPTIONS" :key="opt" :value="opt">{{ opt || 'Default' }}</option>
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

          <label class="flex items-center gap-1.5 rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700">
            <span class="material-symbols-outlined text-base">format_align_left</span>
            Align
            <select
              v-model="textAlignKey"
              class="rounded border-none bg-transparent text-xs font-medium text-gray-700 focus:outline-none"
              @change="applyTextAlign(textAlignKey)"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </label>
        </div>

        <!-- Insert row -->
        <div class="mb-2 flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            class="flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium hover:bg-gray-100"
            :class="activeAnchorMarkType === 'link' ? 'border-gray-900 bg-gray-900 text-white hover:bg-gray-800' : 'border-gray-200 bg-gray-50 text-gray-700'"
            @mousedown.prevent
            @click="startLinkOrButton('link')"
          >
            <span class="material-symbols-outlined text-base">link</span>
            Link
          </button>
          <button
            type="button"
            class="flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium hover:bg-gray-100"
            :class="activeAnchorMarkType === 'button' ? 'border-gray-900 bg-gray-900 text-white hover:bg-gray-800' : 'border-gray-200 bg-gray-50 text-gray-700'"
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

          <div class="flex items-center justify-end gap-2">
            <!-- Duplicates the top status bar's error: that one can scroll
                 out of view once the Button panel (with all its sliders)
                 pushes Update far enough down, which made clicking it with
                 no URL look like it silently did nothing. -->
            <span v-if="selectionError" class="mr-auto text-xs text-red-500">{{ selectionError }}</span>
            <button type="button" class="rounded border border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100" @click="cancelUrlBar">Cancel</button>
            <button type="button" class="rounded bg-gray-900 px-2.5 py-1 text-xs font-medium text-white hover:bg-gray-700" @click="confirmLinkOrButton">{{ editingAnchor ? 'Update' : 'Add' }}</button>
          </div>
        </div>

        <div class="relative flex-1" style="min-height: 22rem;">
          <!-- Custom highlight overlay: mirrors the captured selection so it
               stays visible even after focus moves to the Color/Size/
               Line-Height controls, where the browser's own selection
               rendering dims or disappears once the contenteditable itself
               is no longer the focused element. -->
          <div class="pointer-events-none absolute inset-0 overflow-hidden rounded-md" aria-hidden="true">
            <div
              v-for="(rect, i) in highlightRects"
              :key="i"
              class="absolute rounded-sm bg-blue-300/50"
              :style="{ top: rect.top + 'px', left: rect.left + 'px', width: rect.width + 'px', height: rect.height + 'px' }"
            ></div>
          </div>
          <div
            ref="editorEl"
            contenteditable="true"
            class="absolute inset-0 overflow-y-auto rounded-md border border-gray-200 bg-gray-300 px-3 py-2 text-sm leading-relaxed focus:outline-none"
            :style="previewStyle"
            @mouseup="captureSelection"
            @keyup="captureSelection"
            @keydown="handleEditorKeydown"
            @scroll="updateHighlight"
          ></div>
        </div>

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
