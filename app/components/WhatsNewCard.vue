<script setup lang="ts">
const { releases, openDrawer } = useReleaseNotes()
const latest = computed(() => releases.value.slice(0, 2))
</script>

<template>
  <section
    v-if="latest.length"
    aria-labelledby="whats-new-heading"
    class="mt-10 rounded-xl border border-gray-200 bg-white"
  >
    <div class="flex items-center justify-between border-b border-gray-100 px-5 py-3">
      <h2 id="whats-new-heading" class="text-sm font-semibold text-gray-900">What's new</h2>
      <button
        class="rounded text-sm font-medium text-gray-600 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
        @click="openDrawer"
      >
        View all
      </button>
    </div>
    <ul class="grid grid-cols-1 divide-y divide-gray-100 md:grid-cols-2 md:divide-x md:divide-y-0">
      <li v-for="r in latest" :key="r.id" class="px-5 py-4">
        <div class="flex items-center gap-2">
          <ReleaseTypeBadge :type="r.type" />
          <time :datetime="r.date" class="text-xs text-gray-500">{{ formatReleaseDate(r.date) }}</time>
        </div>
        <h3 class="mt-2 text-sm font-medium text-gray-900">{{ r.title }}</h3>
        <p class="mt-1 text-sm leading-relaxed text-gray-600">{{ r.summary }}</p>
      </li>
    </ul>
  </section>
</template>
