<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { usePageBuilderStateStore } from '@myissue/vue-website-page-builder'

const store = usePageBuilderStateStore() as any
const {
  selectedEl, selectedBlockTitle, selectedTag, mode,
  blockConfig, blockData,
  updateBlockField, updateBlockListItem, addBlockListItem, removeBlockListItem,
  updateElementStyle, updateElementClass,
  addLink, removeLink, openGlobalPageStyles, closeEditor,
} = useEditorSidebar()

// ── Helpers ──────────────────────────────────────────────────────────────────
function getPx(prop: string): number {
  return parseFloat((selectedEl.value?.style as any)?.[prop] || '0') || 0
}
function clamp(v: number, min: number, max: number) { return Math.min(max, Math.max(min, v)) }
function applyPx(prop: string, val: number, min = 0, max = 999): number {
  const c = clamp(val, min, max)
  updateElementStyle(prop, c + 'px')
  return c
}

// ── Padding ───────────────────────────────────────────────────────────────────
const pT = ref(0); const pR = ref(0); const pB = ref(0); const pL = ref(0)
const pLinked = ref(false)

watch(selectedEl, (el) => {
  if (!el) return
  pT.value = getPx('paddingTop'); pR.value = getPx('paddingRight')
  pB.value = getPx('paddingBottom'); pL.value = getPx('paddingLeft')
})

function adjP(side: 'T'|'R'|'B'|'L', delta: number) {
  if (pLinked.value) {
    const next = clamp(pT.value + delta, 0, 999)
    pT.value = pR.value = pB.value = pL.value = next
    ;['paddingTop','paddingRight','paddingBottom','paddingLeft'].forEach(p => updateElementStyle(p, next + 'px'))
  } else {
    const map = { T: [pT, 'paddingTop'], R: [pR, 'paddingRight'], B: [pB, 'paddingBottom'], L: [pL, 'paddingLeft'] } as any
    const [r, p] = map[side]; r.value = applyPx(p, r.value + delta)
  }
}
function setP(side: 'T'|'R'|'B'|'L', val: number) {
  const map = { T: [pT, 'paddingTop'], R: [pR, 'paddingRight'], B: [pB, 'paddingBottom'], L: [pL, 'paddingLeft'] } as any
  const [r, p] = map[side]; r.value = applyPx(p, val)
}

// ── Margin ────────────────────────────────────────────────────────────────────
const mT = ref(0); const mR = ref(0); const mB = ref(0); const mL = ref(0)
const mLinked = ref(false)

watch(selectedEl, (el) => {
  if (!el) return
  mT.value = getPx('marginTop'); mR.value = getPx('marginRight')
  mB.value = getPx('marginBottom'); mL.value = getPx('marginLeft')
})

function adjM(side: 'T'|'R'|'B'|'L', delta: number) {
  if (mLinked.value) {
    const next = clamp(mT.value + delta, -999, 999)
    mT.value = mR.value = mB.value = mL.value = next
    ;['marginTop','marginRight','marginBottom','marginLeft'].forEach(p => updateElementStyle(p, next + 'px'))
  } else {
    const map = { T: [mT, 'marginTop'], R: [mR, 'marginRight'], B: [mB, 'marginBottom'], L: [mL, 'marginLeft'] } as any
    const [r, p] = map[side]; r.value = applyPx(p, r.value + delta, -999)
  }
}
function setM(side: 'T'|'R'|'B'|'L', val: number) {
  const map = { T: [mT, 'marginTop'], R: [mR, 'marginRight'], B: [mB, 'marginBottom'], L: [mL, 'marginLeft'] } as any
  const [r, p] = map[side]; r.value = applyPx(p, val, -999)
}

// ── Typography ────────────────────────────────────────────────────────────────
const fsVal = ref(14); const lhVal = ref(0); const lsVal = ref(0)
const fontFamilies = ['inherit', 'Inter, sans-serif', 'Georgia, serif', 'Courier New, monospace', 'Arial, sans-serif']
const fontWeights = [
  { v: '300', l: 'Light 300' }, { v: '400', l: 'Regular 400' }, { v: '500', l: 'Medium 500' },
  { v: '600', l: 'SemiBold 600' }, { v: '700', l: 'Bold 700' }, { v: '800', l: 'ExtraBold 800' },
]
const textAligns = ['left', 'center', 'right', 'justify']

watch(selectedEl, (el) => {
  if (!el) return
  fsVal.value = getPx('fontSize') || 14
  lhVal.value = getPx('lineHeight') || 0
  lsVal.value = getPx('letterSpacing') || 0
})

function adjFs(d: number) { fsVal.value = applyPx('fontSize', fsVal.value + d, 1, 200) }
function adjLh(d: number) { lhVal.value = applyPx('lineHeight', lhVal.value + d, 0, 10) }
function adjLs(d: number) { lsVal.value = applyPx('letterSpacing', lsVal.value + d, -10, 50) }

// ── Border radius ─────────────────────────────────────────────────────────────
const brLinked = ref(true)
const brAll = ref(0); const brTL = ref(0); const brTR = ref(0); const brBL = ref(0); const brBR = ref(0)

watch(selectedEl, (el) => {
  if (!el) return
  brAll.value = getPx('borderRadius')
  brTL.value = getPx('borderTopLeftRadius'); brTR.value = getPx('borderTopRightRadius')
  brBL.value = getPx('borderBottomLeftRadius'); brBR.value = getPx('borderBottomRightRadius')
})

function adjBr(delta: number) {
  if (brLinked.value) {
    brAll.value = applyPx('borderRadius', brAll.value + delta)
    brTL.value = brTR.value = brBL.value = brBR.value = brAll.value
  }
}
function adjBrCorner(ref_: any, prop: string, delta: number) {
  ref_.value = applyPx(prop, ref_.value + delta)
}

// ── Border ────────────────────────────────────────────────────────────────────
const bwVal = ref(0)
watch(selectedEl, (el) => { if (el) bwVal.value = getPx('borderWidth') })
function adjBw(d: number) { bwVal.value = applyPx('borderWidth', bwVal.value + d, 0, 20) }

// ── Opacity ───────────────────────────────────────────────────────────────────
const opVal = ref(100)
watch(selectedEl, (el) => {
  if (!el) return
  opVal.value = Math.round((parseFloat(el.style.opacity || '1') || 1) * 100)
})
function adjOp(d: number) {
  opVal.value = clamp(opVal.value + d, 0, 100)
  updateElementStyle('opacity', (opVal.value / 100).toFixed(2))
}

// ── Link ──────────────────────────────────────────────────────────────────────
const linkEnabled = ref(false); const linkUrl = ref(''); const linkNewTab = ref(false)
const linkError = ref(''); const linkSuccess = ref('')

watch(selectedEl, (el) => {
  if (!el) { linkEnabled.value = false; linkUrl.value = ''; linkError.value = ''; linkSuccess.value = ''; return }
  const a = el.closest('a') as HTMLAnchorElement | null
  linkEnabled.value = !!a; linkUrl.value = a?.href ?? ''; linkNewTab.value = a?.target === '_blank'
  linkError.value = ''; linkSuccess.value = ''
})
function onLinkToggle(v: boolean) {
  linkEnabled.value = v
  if (!v) { removeLink(); linkSuccess.value = 'Link removed'; linkUrl.value = '' }
}
function onLinkSubmit() {
  if (!linkUrl.value.startsWith('http://') && !linkUrl.value.startsWith('https://')) {
    linkError.value = 'URL must start with http:// or https://'; linkSuccess.value = ''; return
  }
  addLink(linkUrl.value, linkNewTab.value); linkError.value = ''; linkSuccess.value = 'Link added'
}

// ── Classes ───────────────────────────────────────────────────────────────────
const classInput = ref(''); const currentClasses = ref<string[]>([])
function _refreshClasses() { currentClasses.value = selectedEl.value ? Array.from(selectedEl.value.classList) : [] }
watch(selectedEl, () => _refreshClasses())
function onAddClass() {
  const cls = classInput.value.trim(); if (!cls) return
  updateElementClass(cls, true); classInput.value = ''; _refreshClasses()
}

// ── Inline styles ─────────────────────────────────────────────────────────────
const styleProp = ref(''); const styleVal = ref(''); const currentStyles = ref('')
function _refreshStyles() { currentStyles.value = selectedEl.value?.style.cssText ?? '' }
watch(selectedEl, () => _refreshStyles())
function onAddStyle() {
  const p = styleProp.value.trim(); const v = styleVal.value.trim(); if (!p || !v) return
  updateElementStyle(p, v); styleProp.value = ''; styleVal.value = ''; _refreshStyles()
}

// ── HTML ──────────────────────────────────────────────────────────────────────
const htmlInput = ref('')
watch(selectedEl, (el) => { if (el) htmlInput.value = el.outerHTML })
function onApplyHtml() {
  const el = selectedEl.value; if (!el || !el.parentNode) return
  const tmp = document.createElement('div'); tmp.innerHTML = htmlInput.value
  const newEl = tmp.firstElementChild as HTMLElement | null; if (!newEl) return
  el.parentNode.replaceChild(newEl, el); store.setElement(newEl)
  import('@myissue/vue-website-page-builder').then(({ getPageBuilder }) => {
    const b = getPageBuilder() as any
    b.addListenersToEditableElements().then(() => { b.syncDomToStoreOnly(); b.saveDomComponentsToLocalStorage() })
  })
}

// ── Image ─────────────────────────────────────────────────────────────────────
const imageInput = ref('')
watch(selectedEl, (el) => { imageInput.value = el?.tagName === 'IMG' ? (el as HTMLImageElement).src : '' })
function onApplyImage() {
  const el = selectedEl.value; if (!el || el.tagName !== 'IMG') return
  ;(el as HTMLImageElement).src = imageInput.value
  import('@myissue/vue-website-page-builder').then(({ getPageBuilder }) => {
    const b = getPageBuilder() as any; b.syncDomToStoreOnly(); b.saveDomComponentsToLocalStorage()
  })
}

const isTextEl = computed(() => {
  const t = selectedEl.value?.tagName?.toUpperCase()
  return t ? ['P','H1','H2','H3','H4','H5','H6','SPAN','A','LI','BUTTON','LABEL'].includes(t) : false
})
const isImgEl = computed(() => selectedEl.value?.tagName?.toUpperCase() === 'IMG')
const stylesOpen = computed(() => mode.value !== 'block')

// ── Block image upload ────────────────────────────────────────────────────────
const uploadError = ref<Record<string, string>>({})

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
</script>

<template>
  <Transition
    enter-active-class="transition-transform duration-200"
    enter-from-class="translate-x-full"
    enter-to-class="translate-x-0"
    leave-active-class="transition-transform duration-200"
    leave-from-class="translate-x-0"
    leave-to-class="translate-x-full"
  >
    <div
      v-if="mode !== 'none'"
      class="absolute right-0 top-0 bottom-0 z-30 w-72 bg-white border-l border-gray-200 shadow-lg flex flex-col overflow-hidden"
    >
      <!-- Header -->
      <div class="flex-shrink-0 px-4 py-3 border-b border-gray-200 bg-white flex items-center justify-between">
        <button
          type="button"
          aria-label="Close editor"
          class="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 border-none bg-transparent cursor-pointer text-base leading-none"
          @click="closeEditor"
        >×</button>
        <span class="text-xs font-semibold text-gray-700 tracking-wide">
          Editing &lt;{{ selectedTag || 'element' }}&gt;
        </span>
      </div>

      <!-- Scrollable content -->
      <div class="flex-1 overflow-y-auto">

        <!-- ── Block Content Editor ───────────────────────────────────────── -->
        <template v-if="mode === 'block' && blockConfig && blockData">
          <div class="border-b border-gray-100 px-3 pt-3 pb-3">
            <template v-for="field in blockConfig.fields" :key="field.key">

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
                      @change="{ const f = ($event.target as HTMLInputElement).files; if (f?.length) onUploadImage(field.key, f[0]) }"
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
                <label class="block text-xs text-gray-500 mb-1">{{ field.label }}</label>
                <input
                  type="text" :value="blockData[field.key]"
                  class="w-full border border-gray-200 rounded-md px-2 py-1.5 text-xs focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                  @change="updateBlockField(field.key, ($event.target as HTMLInputElement).value)"
                />
              </div>

              <!-- color -->
              <div v-else-if="field.type === 'color'" class="mb-2.5">
                <label class="block text-xs text-gray-500 mb-1">{{ field.label }}</label>
                <div class="flex items-center gap-2 border border-gray-200 rounded-md px-2 py-1">
                  <input type="color" :value="blockData[field.key]" class="w-6 h-6 rounded cursor-pointer border-none p-0" @change="updateBlockField(field.key, ($event.target as HTMLInputElement).value)" />
                  <input type="text" :value="blockData[field.key]" class="flex-1 text-xs focus:outline-none" @change="updateBlockField(field.key, ($event.target as HTMLInputElement).value)" />
                </div>
              </div>

              <!-- toggle -->
              <div v-else-if="field.type === 'toggle'" class="mb-2.5 flex items-center justify-between py-1">
                <label class="text-xs text-gray-600">{{ field.label }}</label>
                <button
                  type="button"
                  class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors border-none cursor-pointer shrink-0"
                  :class="blockData[field.key] ? 'bg-blue-500' : 'bg-gray-200'"
                  @click="updateBlockField(field.key, !blockData[field.key])"
                >
                  <span class="inline-block h-3.5 w-3.5 rounded-full bg-white shadow transform transition-transform" :class="blockData[field.key] ? 'translate-x-4' : 'translate-x-0.5'" />
                </button>
              </div>

              <!-- select -->
              <div v-else-if="field.type === 'select'" class="mb-2.5">
                <label class="block text-xs text-gray-500 mb-1">{{ field.label }}</label>
                <select
                  :value="String(blockData[field.key])"
                  class="w-full border border-gray-200 rounded-md px-2 py-1.5 text-xs focus:outline-none focus:border-blue-400 bg-white"
                  @change="updateBlockField(field.key, Number(($event.target as HTMLSelectElement).value) || ($event.target as HTMLSelectElement).value)"
                >
                  <option v-for="opt in field.options" :key="opt" :value="opt">{{ opt }}</option>
                </select>
              </div>

              <!-- list -->
              <div v-else-if="field.type === 'list' && field.listFields" class="mb-2.5">
                <div class="flex items-center justify-between mb-1.5">
                  <label class="text-xs text-gray-500">{{ field.label }}</label>
                  <button
                    type="button"
                    class="text-xs text-blue-500 hover:text-blue-700 border border-blue-200 rounded px-1.5 py-0.5 bg-blue-50 cursor-pointer"
                    @click="addBlockListItem(field.key, Object.fromEntries((field.listFields ?? []).map(f => [f.key, ''])))"
                  >+ Add</button>
                </div>
                <div
                  v-for="(item, idx) in (blockData[field.key] as Record<string, any>[])"
                  :key="idx"
                  class="mb-1.5 border border-gray-200 rounded-md overflow-hidden"
                >
                  <div class="flex justify-between items-center px-2 py-1 bg-gray-50 border-b border-gray-100">
                    <span class="text-xs text-gray-400 font-medium">{{ idx + 1 }}</span>
                    <div class="flex gap-1">
                      <button v-if="idx > 0" type="button" class="text-xs text-gray-400 hover:text-gray-700 border-none bg-transparent cursor-pointer px-1" @click="updateBlockField(field.key, (() => { const arr = [...blockData![field.key]]; const [it] = arr.splice(idx,1); arr.splice(idx-1,0,it); return arr })())">↑</button>
                      <button v-if="idx < (blockData[field.key] as any[]).length - 1" type="button" class="text-xs text-gray-400 hover:text-gray-700 border-none bg-transparent cursor-pointer px-1" @click="updateBlockField(field.key, (() => { const arr = [...blockData![field.key]]; const [it] = arr.splice(idx,1); arr.splice(idx+1,0,it); return arr })())">↓</button>
                      <button type="button" class="text-xs text-red-400 hover:text-red-600 border-none bg-transparent cursor-pointer px-1" @click="removeBlockListItem(field.key, idx)">✕</button>
                    </div>
                  </div>
                  <div class="px-2 py-1.5">
                    <template v-for="subField in field.listFields" :key="subField.key">
                      <div class="mb-1">
                        <label class="block text-xs text-gray-400 mb-0.5">{{ subField.label }}</label>
                        <input type="text" :value="item[subField.key]" class="w-full border border-gray-200 rounded px-2 py-0.5 text-xs focus:outline-none focus:border-blue-400" @change="updateBlockListItem(field.key, idx, subField.key, ($event.target as HTMLInputElement).value)" />
                      </div>
                    </template>
                  </div>
                </div>
              </div>

            </template>
          </div>
        </template>

        <!-- ── Element Style Editors ─────────────────────────────────────── -->
        <details :open="stylesOpen">
          <summary class="px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer list-none flex items-center justify-between select-none hover:bg-gray-50 border-b border-gray-100">
            Element Styles
            <span class="text-gray-300">▾</span>
          </summary>

        <!-- Link -->
        <details class="border-b border-gray-100">
          <summary class="px-3 py-2.5 text-xs font-semibold text-gray-600 uppercase tracking-wide cursor-pointer list-none flex items-center justify-between select-none hover:bg-gray-50">
            Link
            <div class="flex items-center gap-2">
              <span v-if="linkEnabled" class="text-blue-500 text-xs font-normal normal-case tracking-normal">on</span>
              <span class="text-gray-300">▾</span>
            </div>
          </summary>
          <div class="px-3 pb-3">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs text-gray-600">Enable link</span>
              <button type="button" class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors border-none cursor-pointer shrink-0" :class="linkEnabled ? 'bg-blue-500' : 'bg-gray-200'" @click="onLinkToggle(!linkEnabled)">
                <span class="inline-block h-3.5 w-3.5 rounded-full bg-white shadow transform transition-transform" :class="linkEnabled ? 'translate-x-4' : 'translate-x-0.5'" />
              </button>
            </div>
            <template v-if="linkEnabled">
              <input v-model="linkUrl" type="text" placeholder="https://" class="w-full border border-gray-200 rounded-md px-2 py-1.5 text-xs mb-2 focus:outline-none focus:border-blue-400" @keydown.enter="onLinkSubmit" />
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs text-gray-600">Open in new tab</span>
                <input type="checkbox" v-model="linkNewTab" class="cursor-pointer" />
              </div>
              <button type="button" class="w-full text-xs bg-blue-500 text-white rounded-md py-1.5 border-none cursor-pointer hover:bg-blue-600" @click="onLinkSubmit">Apply</button>
              <p v-if="linkError" class="text-xs text-red-500 mt-1">{{ linkError }}</p>
              <p v-if="linkSuccess" class="text-xs text-green-500 mt-1">{{ linkSuccess }}</p>
            </template>
          </div>
        </details>

        <!-- Typography -->
        <details v-if="isTextEl" class="border-b border-gray-100">
          <summary class="px-3 py-2.5 text-xs font-semibold text-gray-600 uppercase tracking-wide cursor-pointer list-none flex items-center justify-between select-none hover:bg-gray-50">Typography <span class="text-gray-300">▾</span></summary>
          <div class="px-3 pb-3 space-y-2.5">

            <!-- Font size stepper -->
            <div class="flex items-center justify-between">
              <span class="text-xs text-gray-500">Size</span>
              <div class="flex items-center gap-1">
                <button @click="adjFs(-1)" class="w-6 h-6 flex items-center justify-center rounded bg-gray-100 hover:bg-gray-200 text-gray-600 border-none cursor-pointer text-sm leading-none font-medium">−</button>
                <input type="number" :value="fsVal" class="w-11 text-center text-xs border border-gray-200 rounded py-0.5 focus:outline-none focus:border-blue-400" @change="fsVal = applyPx('fontSize', Number(($event.target as HTMLInputElement).value), 1, 200)" />
                <button @click="adjFs(1)" class="w-6 h-6 flex items-center justify-center rounded bg-gray-100 hover:bg-gray-200 text-gray-600 border-none cursor-pointer text-sm leading-none font-medium">+</button>
                <span class="text-xs text-gray-400 w-4">px</span>
              </div>
            </div>

            <!-- Line height stepper -->
            <div class="flex items-center justify-between">
              <span class="text-xs text-gray-500">Line height</span>
              <div class="flex items-center gap-1">
                <button @click="adjLh(-1)" class="w-6 h-6 flex items-center justify-center rounded bg-gray-100 hover:bg-gray-200 text-gray-600 border-none cursor-pointer text-sm leading-none font-medium">−</button>
                <input type="number" :value="lhVal" class="w-11 text-center text-xs border border-gray-200 rounded py-0.5 focus:outline-none focus:border-blue-400" @change="lhVal = applyPx('lineHeight', Number(($event.target as HTMLInputElement).value), 0, 10)" />
                <button @click="adjLh(1)" class="w-6 h-6 flex items-center justify-center rounded bg-gray-100 hover:bg-gray-200 text-gray-600 border-none cursor-pointer text-sm leading-none font-medium">+</button>
                <span class="text-xs text-gray-400 w-4">px</span>
              </div>
            </div>

            <!-- Letter spacing stepper -->
            <div class="flex items-center justify-between">
              <span class="text-xs text-gray-500">Spacing</span>
              <div class="flex items-center gap-1">
                <button @click="adjLs(-1)" class="w-6 h-6 flex items-center justify-center rounded bg-gray-100 hover:bg-gray-200 text-gray-600 border-none cursor-pointer text-sm leading-none font-medium">−</button>
                <input type="number" :value="lsVal" class="w-11 text-center text-xs border border-gray-200 rounded py-0.5 focus:outline-none focus:border-blue-400" @change="lsVal = applyPx('letterSpacing', Number(($event.target as HTMLInputElement).value), -10, 50)" />
                <button @click="adjLs(1)" class="w-6 h-6 flex items-center justify-center rounded bg-gray-100 hover:bg-gray-200 text-gray-600 border-none cursor-pointer text-sm leading-none font-medium">+</button>
                <span class="text-xs text-gray-400 w-4">px</span>
              </div>
            </div>

            <!-- Font weight -->
            <div class="flex items-center justify-between">
              <span class="text-xs text-gray-500">Weight</span>
              <select class="border border-gray-200 rounded px-2 py-0.5 text-xs bg-white focus:outline-none focus:border-blue-400" @change="updateElementStyle('fontWeight', ($event.target as HTMLSelectElement).value)">
                <option value="">—</option>
                <option v-for="w in fontWeights" :key="w.v" :value="w.v">{{ w.l }}</option>
              </select>
            </div>

            <!-- Font family -->
            <div>
              <span class="text-xs text-gray-500 block mb-1">Font Family</span>
              <select class="w-full border border-gray-200 rounded-md px-2 py-1.5 text-xs bg-white focus:outline-none focus:border-blue-400" @change="updateElementStyle('fontFamily', ($event.target as HTMLSelectElement).value)">
                <option value="">— family —</option>
                <option v-for="f in fontFamilies" :key="f" :value="f">{{ f }}</option>
              </select>
            </div>

            <!-- Text align -->
            <div class="flex items-center justify-between">
              <span class="text-xs text-gray-500">Align</span>
              <div class="flex gap-1">
                <button v-for="a in textAligns" :key="a" type="button"
                  class="w-7 h-7 text-xs border rounded border-gray-200 cursor-pointer flex items-center justify-center hover:bg-gray-100"
                  :class="selectedEl?.style.textAlign === a ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-500'"
                  @click="updateElementStyle('textAlign', a)"
                >
                  {{ a === 'left' ? '≡' : a === 'center' ? '≡' : a === 'right' ? '≡' : '≡' }}
                </button>
              </div>
            </div>

          </div>
        </details>

        <!-- Background Color -->
        <details class="border-b border-gray-100">
          <summary class="px-3 py-2.5 text-xs font-semibold text-gray-600 uppercase tracking-wide cursor-pointer list-none flex items-center justify-between select-none hover:bg-gray-50">Background <span class="text-gray-300">▾</span></summary>
          <div class="px-3 pb-3 flex items-center gap-2">
            <input type="color" class="w-8 h-8 rounded-md border border-gray-200 cursor-pointer p-0.5" @change="updateElementStyle('backgroundColor', ($event.target as HTMLInputElement).value)" />
            <input type="text" placeholder="#ffffff" class="flex-1 border border-gray-200 rounded-md px-2 py-1.5 text-xs focus:outline-none focus:border-blue-400" @change="updateElementStyle('backgroundColor', ($event.target as HTMLInputElement).value)" />
            <button type="button" class="text-xs text-gray-400 hover:text-red-500 border-none bg-transparent cursor-pointer shrink-0" @click="updateElementStyle('backgroundColor', '')">✕</button>
          </div>
        </details>

        <!-- Text Color -->
        <details v-if="isTextEl" class="border-b border-gray-100">
          <summary class="px-3 py-2.5 text-xs font-semibold text-gray-600 uppercase tracking-wide cursor-pointer list-none flex items-center justify-between select-none hover:bg-gray-50">Text Color <span class="text-gray-300">▾</span></summary>
          <div class="px-3 pb-3 flex items-center gap-2">
            <input type="color" class="w-8 h-8 rounded-md border border-gray-200 cursor-pointer p-0.5" @change="updateElementStyle('color', ($event.target as HTMLInputElement).value)" />
            <input type="text" placeholder="#000000" class="flex-1 border border-gray-200 rounded-md px-2 py-1.5 text-xs focus:outline-none focus:border-blue-400" @change="updateElementStyle('color', ($event.target as HTMLInputElement).value)" />
            <button type="button" class="text-xs text-gray-400 hover:text-red-500 border-none bg-transparent cursor-pointer shrink-0" @click="updateElementStyle('color', '')">✕</button>
          </div>
        </details>

        <!-- Padding -->
        <details class="border-b border-gray-100">
          <summary class="px-3 py-2.5 text-xs font-semibold text-gray-600 uppercase tracking-wide cursor-pointer list-none flex items-center justify-between select-none hover:bg-gray-50">
            Padding
            <div class="flex items-center gap-2">
              <button type="button"
                class="text-xs px-1.5 py-0.5 rounded border cursor-pointer font-normal normal-case tracking-normal"
                :class="pLinked ? 'border-blue-400 text-blue-500 bg-blue-50' : 'border-gray-200 text-gray-400 bg-white'"
                @click.stop="pLinked = !pLinked"
              >link</button>
              <span class="text-gray-300">▾</span>
            </div>
          </summary>
          <div class="px-3 pb-3">
            <!-- 4-sided grid: T R B L -->
            <div class="grid grid-cols-2 gap-2">
              <div v-for="s in ['T','R','B','L'] as const" :key="s">
                <div class="flex items-center justify-between mb-0.5">
                  <span class="text-xs text-gray-400">{{ s === 'T' ? 'Top' : s === 'R' ? 'Right' : s === 'B' ? 'Bottom' : 'Left' }}</span>
                </div>
                <div class="flex items-center gap-0.5">
                  <button @click="adjP(s, -4)" class="w-5 h-6 flex items-center justify-center rounded bg-gray-100 hover:bg-gray-200 text-gray-600 border-none cursor-pointer text-sm leading-none">−</button>
                  <input type="number"
                    :value="s === 'T' ? pT : s === 'R' ? pR : s === 'B' ? pB : pL"
                    class="flex-1 min-w-0 text-center text-xs border border-gray-200 rounded py-0.5 focus:outline-none focus:border-blue-400"
                    @change="setP(s, Number(($event.target as HTMLInputElement).value))"
                  />
                  <button @click="adjP(s, 4)" class="w-5 h-6 flex items-center justify-center rounded bg-gray-100 hover:bg-gray-200 text-gray-600 border-none cursor-pointer text-sm leading-none">+</button>
                </div>
              </div>
            </div>
          </div>
        </details>

        <!-- Margin -->
        <details class="border-b border-gray-100">
          <summary class="px-3 py-2.5 text-xs font-semibold text-gray-600 uppercase tracking-wide cursor-pointer list-none flex items-center justify-between select-none hover:bg-gray-50">
            Margin
            <div class="flex items-center gap-2">
              <button type="button"
                class="text-xs px-1.5 py-0.5 rounded border cursor-pointer font-normal normal-case tracking-normal"
                :class="mLinked ? 'border-blue-400 text-blue-500 bg-blue-50' : 'border-gray-200 text-gray-400 bg-white'"
                @click.stop="mLinked = !mLinked"
              >link</button>
              <span class="text-gray-300">▾</span>
            </div>
          </summary>
          <div class="px-3 pb-3">
            <div class="grid grid-cols-2 gap-2">
              <div v-for="s in ['T','R','B','L'] as const" :key="s">
                <div class="flex items-center justify-between mb-0.5">
                  <span class="text-xs text-gray-400">{{ s === 'T' ? 'Top' : s === 'R' ? 'Right' : s === 'B' ? 'Bottom' : 'Left' }}</span>
                </div>
                <div class="flex items-center gap-0.5">
                  <button @click="adjM(s, -4)" class="w-5 h-6 flex items-center justify-center rounded bg-gray-100 hover:bg-gray-200 text-gray-600 border-none cursor-pointer text-sm leading-none">−</button>
                  <input type="number"
                    :value="s === 'T' ? mT : s === 'R' ? mR : s === 'B' ? mB : mL"
                    class="flex-1 min-w-0 text-center text-xs border border-gray-200 rounded py-0.5 focus:outline-none focus:border-blue-400"
                    @change="setM(s, Number(($event.target as HTMLInputElement).value))"
                  />
                  <button @click="adjM(s, 4)" class="w-5 h-6 flex items-center justify-center rounded bg-gray-100 hover:bg-gray-200 text-gray-600 border-none cursor-pointer text-sm leading-none">+</button>
                </div>
              </div>
            </div>
          </div>
        </details>

        <!-- Border Radius -->
        <details class="border-b border-gray-100">
          <summary class="px-3 py-2.5 text-xs font-semibold text-gray-600 uppercase tracking-wide cursor-pointer list-none flex items-center justify-between select-none hover:bg-gray-50">
            Radius
            <div class="flex items-center gap-2">
              <button type="button"
                class="text-xs px-1.5 py-0.5 rounded border cursor-pointer font-normal normal-case tracking-normal"
                :class="brLinked ? 'border-blue-400 text-blue-500 bg-blue-50' : 'border-gray-200 text-gray-400 bg-white'"
                @click.stop="brLinked = !brLinked"
              >link</button>
              <span class="text-gray-300">▾</span>
            </div>
          </summary>
          <div class="px-3 pb-3">
            <template v-if="brLinked">
              <div class="flex items-center justify-between">
                <span class="text-xs text-gray-500">All corners</span>
                <div class="flex items-center gap-1">
                  <button @click="adjBr(-1)" class="w-6 h-6 flex items-center justify-center rounded bg-gray-100 hover:bg-gray-200 text-gray-600 border-none cursor-pointer text-sm leading-none font-medium">−</button>
                  <input type="number" :value="brAll" class="w-11 text-center text-xs border border-gray-200 rounded py-0.5 focus:outline-none focus:border-blue-400" @change="brAll = applyPx('borderRadius', Number(($event.target as HTMLInputElement).value))" />
                  <button @click="adjBr(1)" class="w-6 h-6 flex items-center justify-center rounded bg-gray-100 hover:bg-gray-200 text-gray-600 border-none cursor-pointer text-sm leading-none font-medium">+</button>
                  <span class="text-xs text-gray-400 w-4">px</span>
                </div>
              </div>
            </template>
            <template v-else>
              <div class="grid grid-cols-2 gap-2">
                <div v-for="[ref_, prop, label] in [[brTL,'borderTopLeftRadius','TL'],[brTR,'borderTopRightRadius','TR'],[brBL,'borderBottomLeftRadius','BL'],[brBR,'borderBottomRightRadius','BR']]" :key="label as string">
                  <span class="text-xs text-gray-400 block mb-0.5">{{ label }}</span>
                  <div class="flex items-center gap-0.5">
                    <button @click="adjBrCorner(ref_, prop as string, -1)" class="w-5 h-6 flex items-center justify-center rounded bg-gray-100 hover:bg-gray-200 text-gray-600 border-none cursor-pointer text-sm leading-none">−</button>
                    <input type="number" :value="ref_ as number" class="flex-1 min-w-0 text-center text-xs border border-gray-200 rounded py-0.5 focus:outline-none" @change="adjBrCorner(ref_, prop as string, 0)" />
                    <button @click="adjBrCorner(ref_, prop as string, 1)" class="w-5 h-6 flex items-center justify-center rounded bg-gray-100 hover:bg-gray-200 text-gray-600 border-none cursor-pointer text-sm leading-none">+</button>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </details>

        <!-- Borders -->
        <details class="border-b border-gray-100">
          <summary class="px-3 py-2.5 text-xs font-semibold text-gray-600 uppercase tracking-wide cursor-pointer list-none flex items-center justify-between select-none hover:bg-gray-50">Border <span class="text-gray-300">▾</span></summary>
          <div class="px-3 pb-3 space-y-2.5">
            <div class="flex items-center justify-between">
              <span class="text-xs text-gray-500">Width</span>
              <div class="flex items-center gap-1">
                <button @click="adjBw(-1)" class="w-6 h-6 flex items-center justify-center rounded bg-gray-100 hover:bg-gray-200 text-gray-600 border-none cursor-pointer text-sm leading-none font-medium">−</button>
                <input type="number" :value="bwVal" class="w-11 text-center text-xs border border-gray-200 rounded py-0.5 focus:outline-none focus:border-blue-400" @change="bwVal = applyPx('borderWidth', Number(($event.target as HTMLInputElement).value), 0, 20)" />
                <button @click="adjBw(1)" class="w-6 h-6 flex items-center justify-center rounded bg-gray-100 hover:bg-gray-200 text-gray-600 border-none cursor-pointer text-sm leading-none font-medium">+</button>
                <span class="text-xs text-gray-400 w-4">px</span>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-xs text-gray-500">Style</span>
              <select class="border border-gray-200 rounded px-2 py-0.5 text-xs bg-white focus:outline-none focus:border-blue-400" @change="updateElementStyle('borderStyle', ($event.target as HTMLSelectElement).value)">
                <option value="none">none</option>
                <option value="solid">solid</option>
                <option value="dashed">dashed</option>
                <option value="dotted">dotted</option>
              </select>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs text-gray-500 shrink-0">Color</span>
              <input type="color" class="w-8 h-8 rounded-md border border-gray-200 cursor-pointer p-0.5" @change="updateElementStyle('borderColor', ($event.target as HTMLInputElement).value)" />
            </div>
          </div>
        </details>

        <!-- Opacity -->
        <details class="border-b border-gray-100">
          <summary class="px-3 py-2.5 text-xs font-semibold text-gray-600 uppercase tracking-wide cursor-pointer list-none flex items-center justify-between select-none hover:bg-gray-50">Opacity <span class="text-gray-300">▾</span></summary>
          <div class="px-3 pb-3">
            <div class="flex items-center justify-between">
              <span class="text-xs text-gray-500">{{ opVal }}%</span>
              <div class="flex items-center gap-1">
                <button @click="adjOp(-5)" class="w-6 h-6 flex items-center justify-center rounded bg-gray-100 hover:bg-gray-200 text-gray-600 border-none cursor-pointer text-sm leading-none font-medium">−</button>
                <input type="number" min="0" max="100" :value="opVal" class="w-11 text-center text-xs border border-gray-200 rounded py-0.5 focus:outline-none focus:border-blue-400"
                  @change="adjOp(Number(($event.target as HTMLInputElement).value) - opVal)" />
                <button @click="adjOp(5)" class="w-6 h-6 flex items-center justify-center rounded bg-gray-100 hover:bg-gray-200 text-gray-600 border-none cursor-pointer text-sm leading-none font-medium">+</button>
                <span class="text-xs text-gray-400 w-4">%</span>
              </div>
            </div>
            <input type="range" min="0" max="100" :value="opVal" class="w-full mt-2" @input="adjOp(Number(($event.target as HTMLInputElement).value) - opVal)" />
          </div>
        </details>

        <!-- Image -->
        <details v-if="isImgEl" class="border-b border-gray-100">
          <summary class="px-3 py-2.5 text-xs font-semibold text-gray-600 uppercase tracking-wide cursor-pointer list-none flex items-center justify-between select-none hover:bg-gray-50">Image <span class="text-gray-300">▾</span></summary>
          <div class="px-3 pb-3">
            <img v-if="imageInput" :src="imageInput" class="w-full h-24 object-cover rounded-md mb-2 border border-gray-200" alt="preview" />
            <input type="text" v-model="imageInput" placeholder="https://..." class="w-full border border-gray-200 rounded-md px-2 py-1.5 text-xs mb-2 focus:outline-none focus:border-blue-400" />
            <button type="button" class="w-full text-xs bg-blue-500 text-white rounded-md py-1.5 border-none cursor-pointer hover:bg-blue-600" @click="onApplyImage">Apply</button>
          </div>
        </details>

        <!-- Classes -->
        <details class="border-b border-gray-100">
          <summary class="px-3 py-2.5 text-xs font-semibold text-gray-600 uppercase tracking-wide cursor-pointer list-none flex items-center justify-between select-none hover:bg-gray-50">Classes <span class="text-gray-300">▾</span></summary>
          <div class="px-3 pb-3">
            <div class="flex flex-wrap gap-1 mb-2">
              <span v-for="cls in currentClasses" :key="cls" class="inline-flex items-center gap-0.5 bg-blue-50 text-blue-700 text-xs rounded px-2 py-0.5 border border-blue-100">
                {{ cls }}
                <button type="button" class="text-blue-400 hover:text-red-500 border-none bg-transparent cursor-pointer p-0 leading-none ml-0.5" @click="() => { updateElementClass(cls, false); _refreshClasses() }">×</button>
              </span>
            </div>
            <div class="flex gap-1">
              <input v-model="classInput" type="text" placeholder="class-name" class="flex-1 border border-gray-200 rounded-md px-2 py-1.5 text-xs focus:outline-none focus:border-blue-400" @keydown.enter="onAddClass" />
              <button type="button" class="text-xs bg-blue-500 text-white rounded-md px-3 border-none cursor-pointer hover:bg-blue-600" @click="onAddClass">Add</button>
            </div>
          </div>
        </details>

        <!-- Inline Styles -->
        <details class="border-b border-gray-100">
          <summary class="px-3 py-2.5 text-xs font-semibold text-gray-600 uppercase tracking-wide cursor-pointer list-none flex items-center justify-between select-none hover:bg-gray-50">Styles <span class="text-gray-300">▾</span></summary>
          <div class="px-3 pb-3">
            <p class="text-xs text-gray-400 mb-2 break-all font-mono leading-relaxed">{{ currentStyles || '—' }}</p>
            <div class="flex gap-1 mb-2">
              <input v-model="styleProp" type="text" placeholder="property" class="flex-1 border border-gray-200 rounded-md px-2 py-1.5 text-xs focus:outline-none focus:border-blue-400" />
              <input v-model="styleVal" type="text" placeholder="value" class="flex-1 border border-gray-200 rounded-md px-2 py-1.5 text-xs focus:outline-none focus:border-blue-400" @keydown.enter="onAddStyle" />
            </div>
            <button type="button" class="w-full text-xs bg-blue-500 text-white rounded-md py-1.5 border-none cursor-pointer hover:bg-blue-600" @click="onAddStyle">Apply</button>
          </div>
        </details>

        <!-- HTML -->
        <details class="border-b border-gray-100">
          <summary class="px-3 py-2.5 text-xs font-semibold text-gray-600 uppercase tracking-wide cursor-pointer list-none flex items-center justify-between select-none hover:bg-gray-50">HTML <span class="text-gray-300">▾</span></summary>
          <div class="px-3 pb-3">
            <textarea v-model="htmlInput" rows="6" class="w-full border border-gray-200 rounded-md px-2 py-1.5 text-xs font-mono mb-2 focus:outline-none focus:border-blue-400 resize-y" />
            <button type="button" class="w-full text-xs bg-blue-500 text-white rounded-md py-1.5 border-none cursor-pointer hover:bg-blue-600" @click="onApplyHtml">Apply HTML</button>
          </div>
        </details>

          <div class="h-4"></div>
        </details>
      </div>

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
    </div>
  </Transition>
</template>
