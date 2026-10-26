<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const props = withDefaults(defineProps<{
  html: string
  // Above every real breakpoint (1024px) so previews always render desktop layout.
  designWidth?: number
  // Per-instance floor on the displayed box height, for thin blocks (bars, navbars).
  minHeight?: number
}>(), {
  designWidth: 1200,
  minHeight: 48,
})

// Chunk of design-width content rendered before cropping to the real measured height.
const DESIGN_HEIGHT = 2200
const MAX_HEIGHT = 320
const DEFAULT_HEIGHT = 90

const root = ref<HTMLElement | null>(null)
const iframeEl = ref<HTMLIFrameElement | null>(null)
const visible = ref(false)
// Measured so the scale always matches the box's actual rendered width.
const boxWidth = ref(0)
// Real content height reported by the iframe (see srcdoc script below).
const measuredContentHeight = ref<number | null>(null)

let intersectionObserver: IntersectionObserver | null = null
let resizeObserver: ResizeObserver | null = null

function setRoot(el: Element | null) {
  intersectionObserver?.disconnect()
  resizeObserver?.disconnect()
  if (!el) return

  // Mount only while on/near screen — at most a handful of ~57 previews are ever live at once.
  intersectionObserver = new IntersectionObserver(
    (entries) => { visible.value = entries.some(e => e.isIntersecting) },
    { rootMargin: '200px 0px' },
  )
  intersectionObserver.observe(el)

  resizeObserver = new ResizeObserver((entries) => {
    boxWidth.value = entries[0]?.contentRect.width ?? 0
  })
  resizeObserver.observe(el)
}

function onMessage(e: MessageEvent) {
  if (!iframeEl.value || e.source !== iframeEl.value.contentWindow) return
  const h = (e.data as any)?.__rubikxPreviewHeight
  if (typeof h === 'number' && h > 0) measuredContentHeight.value = h
}

onMounted(() => window.addEventListener('message', onMessage))
onBeforeUnmount(() => {
  window.removeEventListener('message', onMessage)
  intersectionObserver?.disconnect()
  resizeObserver?.disconnect()
})

const srcdoc = computed(() => `<!doctype html><html><head><meta charset="utf-8">
<style>html,body{margin:0;padding:0;}</style></head>
<body>${props.html}
<script>
(function(){
  function report(){
    try { window.parent.postMessage({ __rubikxPreviewHeight: document.body.scrollHeight }, '*') } catch (e) {}
  }
  window.addEventListener('load', report)
  // Re-checks in case 'load' already fired, or late-settling content (webfonts) shifts height.
  setTimeout(report, 50)
  setTimeout(report, 300)
})()
<\/script>
</body></html>`)

const scale = computed(() => (boxWidth.value || 256) / props.designWidth)

const displayHeight = computed(() => {
  const h = measuredContentHeight.value
  if (!h) return DEFAULT_HEIGHT
  return Math.min(MAX_HEIGHT, Math.max(props.minHeight, h * scale.value))
})
</script>

<template>
  <div
    :ref="(el) => setRoot(el as Element | null)"
    :style="{
      position: 'relative',
      width: '100%',
      height: displayHeight + 'px',
      overflow: 'hidden',
      pointerEvents: 'none',
      background: '#fff',
    }"
  >
    <iframe
      v-if="visible"
      ref="iframeEl"
      :srcdoc="srcdoc"
      sandbox="allow-scripts"
      title="Component preview"
      :style="{
        position: 'absolute',
        top: '0',
        left: '0',
        width: designWidth + 'px',
        height: DESIGN_HEIGHT + 'px',
        border: '0',
        transformOrigin: '0 0',
        transform: `scale(${scale})`,
      }"
    />
  </div>
</template>
