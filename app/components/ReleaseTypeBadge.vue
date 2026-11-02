<script setup lang="ts">
import type { ReleaseType } from '~/types/release'

const props = defineProps<{ type: ReleaseType }>()

const META: Record<ReleaseType, { label: string; cls: string }> = {
  new: { label: 'New', cls: 'bg-emerald-50 text-emerald-700' },
  improved: { label: 'Improved', cls: 'bg-blue-50 text-blue-700' },
  fix: { label: 'Fix', cls: 'bg-amber-50 text-amber-700' },
}
// Unknown types (e.g. a typo in releases.json) fall back to a neutral pill instead of crashing the page
const meta = computed(() => META[props.type] ?? { label: 'Update', cls: 'bg-gray-100 text-gray-700' })
</script>

<template>
  <span class="inline-block rounded-full px-2 py-0.5 text-[11px] font-medium" :class="meta.cls">
    {{ meta.label }}
  </span>
</template>
