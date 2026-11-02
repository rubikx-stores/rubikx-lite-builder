<script setup lang="ts">
const { releases, drawerOpen, closeDrawer } = useReleaseNotes()
const closeBtn = ref<HTMLButtonElement | null>(null)
let previouslyFocused: HTMLElement | null = null

function onKeydown(e: KeyboardEvent) {
  if (!drawerOpen.value) return
  if (e.key === 'Escape') {
    closeDrawer()
    return
  }
  // Keep Tab inside the drawer: the focusable elements are the close button and any "Learn more" links
  if (e.key === 'Tab') {
    const focusable = document.querySelectorAll<HTMLElement>('[data-whats-new-drawer] button, [data-whats-new-drawer] a[href]')
    if (!focusable.length) return
    const first = focusable[0]!
    const last = focusable[focusable.length - 1]!
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }
}

watch(drawerOpen, async (open) => {
  if (open) {
    previouslyFocused = document.activeElement as HTMLElement | null
    document.body.style.overflow = 'hidden'
    await nextTick()
    closeBtn.value?.focus()
  } else {
    document.body.style.overflow = ''
    previouslyFocused?.focus()
    previouslyFocused = null
  }
})

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <div v-if="drawerOpen" class="fixed inset-0 z-50 flex justify-end">
      <div class="absolute inset-0 bg-black/30" aria-hidden="true" @click="closeDrawer" />
      <aside
        data-whats-new-drawer
        class="relative flex h-full w-full max-w-md flex-col bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="whats-new-drawer-title"
      >
        <div class="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 id="whats-new-drawer-title" class="text-base font-semibold text-gray-900">What's new</h2>
          <button
            ref="closeBtn"
            class="-mr-2 rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
            aria-label="Close"
            @click="closeDrawer"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <ul class="flex-1 space-y-5 overflow-y-auto px-5 py-4">
          <li v-for="r in releases" :key="r.id" class="border-b border-gray-100 pb-5 last:border-0">
            <div class="flex items-center gap-2">
              <ReleaseTypeBadge :type="r.type" />
              <time :datetime="r.date" class="text-xs text-gray-500">{{ formatReleaseDate(r.date) }}</time>
            </div>
            <h3 class="mt-1.5 text-sm font-medium text-gray-900">{{ r.title }}</h3>
            <p class="mt-1 text-sm text-gray-600">{{ r.summary }}</p>
            <a
              v-if="r.link"
              :href="r.link"
              target="_blank"
              rel="noopener"
              class="mt-1 inline-block text-xs text-blue-600 hover:underline"
            >
              Learn more
            </a>
          </li>
        </ul>
      </aside>
    </div>
  </Teleport>
</template>
