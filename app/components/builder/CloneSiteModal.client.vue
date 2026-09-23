<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Website } from '~/types/website'

const props = defineProps<{
  websites: Website[]
  sourceCompanyId: number
}>()

const emit = defineEmits<{ (e: 'close'): void; (e: 'cloned'): void }>()

const targetCompanyId = ref<number | null>(null)
const cloning = ref(false)
const results = ref<Array<{ companyId: number; pageKey: string; ok: boolean; version?: number; error?: string }>>([])
const requestError = ref('')

const targetOptions = computed(() => props.websites.filter((w) => w.id !== props.sourceCompanyId))

function siteName(companyId: number): string {
  return props.websites.find((w) => w.id === companyId)?.name ?? `Site ${companyId}`
}

async function confirmClone() {
  if (!targetCompanyId.value) return
  cloning.value = true
  results.value = []
  requestError.value = ''
  try {
    const res = await $fetch<{ results: typeof results.value }>('/api/pages/clone-site', {
      method: 'POST',
      body: { sourceCompanyId: props.sourceCompanyId, targetCompanyId: targetCompanyId.value },
    })
    results.value = res.results
    if (results.value.length === 0) {
      requestError.value = `${siteName(props.sourceCompanyId)} has no pages to clone.`
    } else if (results.value.some((r) => r.ok)) {
      emit('cloned')
    }
  } catch (err: any) {
    requestError.value = err?.data?.message || err?.message || 'Clone failed'
  } finally {
    cloning.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" @click.self="emit('close')">
      <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
        <div>
          <h3 class="text-sm font-semibold text-gray-900">Clone Site</h3>
          <p class="mt-1 text-xs text-gray-500">
            Copies every page from {{ siteName(sourceCompanyId) }} to the selected site as new draft versions.
            Pages the target site doesn't have yet are created; pages it already has are overwritten with a new
            draft (nothing is published automatically).
          </p>
        </div>

        <div>
          <label class="text-xs font-medium text-gray-500">Target site</label>
          <select
            v-model="targetCompanyId"
            class="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-gray-400"
          >
            <option :value="null" disabled>Select a site…</option>
            <option v-for="site in targetOptions" :key="site.id" :value="site.id">
              {{ site.name }} — {{ site.domain }}
            </option>
          </select>
        </div>

        <p v-if="requestError" class="text-xs text-red-600">{{ requestError }}</p>

        <div v-if="results.length" class="max-h-64 space-y-1 overflow-y-auto rounded-lg bg-gray-50 p-3 text-xs">
          <div v-for="(r, idx) in results" :key="`${r.pageKey}-${idx}`" :class="r.ok ? 'text-green-700' : 'text-red-600'">
            {{ r.pageKey }}: {{ r.ok ? `cloned as v${r.version} (draft)` : r.error }}
          </div>
        </div>

        <div class="flex gap-2 justify-end pt-2">
          <button
            class="rounded-lg border border-gray-200 px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            @click="emit('close')"
          >
            Close
          </button>
          <button
            :disabled="cloning || !targetCompanyId"
            class="rounded-lg bg-gray-900 px-4 py-2 text-xs font-medium text-white hover:bg-gray-700 disabled:opacity-50 transition-colors"
            @click="confirmClone"
          >
            {{ cloning ? 'Cloning…' : 'Clone Site' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
