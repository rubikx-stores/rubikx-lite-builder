<script setup lang="ts">
import { ref, reactive } from 'vue'
import { INTERNAL_CMS_KEYS } from '~/composables/useGlobalSections'
import type { Website } from '~/types/website'

interface Page {
  id: string
  name: string
  versions: { version: number }[]
}

const props = defineProps<{
  sourceCompanyId: number
  sourcePageKey: string
  sourceVersion?: number
}>()

const emit = defineEmits<{ (e: 'close'): void }>()

const websites = ref<Website[]>([])
const loadingWebsites = ref(false)

// Per-site page lists are fetched lazily, only once a site is expanded.
const pagesBySite = reactive<Record<number, Page[]>>({})
const loadingSite = reactive<Record<number, boolean>>({})
const expandedSite = ref<number | null>(null)

// selections[companyId] = Set of pageKeys ticked for that target site.
const selections = reactive<Record<number, Set<string>>>({})

const cloning = ref(false)
const results = ref<Array<{ companyId: number; pageKey: string; ok: boolean; version?: number; error?: string }>>([])

// global-header/global-footer/global-theme/global-config aren't real pages —
// they're internal CMS keys (navbar/footer/theme settings). Cloning design
// into them through this generic page picker is not the intended use of
// this modal, so they're filtered out of the list entirely.
const HIDDEN_KEYS = INTERNAL_CMS_KEYS

async function loadWebsites() {
  loadingWebsites.value = true
  try {
    websites.value = await $fetch<Website[]>('/api/websites')
  } finally {
    loadingWebsites.value = false
  }
}
loadWebsites()

async function toggleSite(companyId: number) {
  expandedSite.value = expandedSite.value === companyId ? null : companyId
  if (expandedSite.value !== companyId || pagesBySite[companyId]) return
  loadingSite[companyId] = true
  try {
    const fetched = await $fetch<Page[]>('/api/pages', { query: { companyId } })
    pagesBySite[companyId] = fetched.filter((p) => !HIDDEN_KEYS.has(p.id))
  } finally {
    loadingSite[companyId] = false
  }
}

function isChecked(companyId: number, pageKey: string): boolean {
  return selections[companyId]?.has(pageKey) ?? false
}

function toggleSelection(companyId: number, pageKey: string) {
  if (!selections[companyId]) selections[companyId] = new Set()
  const set = selections[companyId]
  if (set.has(pageKey)) set.delete(pageKey)
  else set.add(pageKey)
}

function hasAnySelection(): boolean {
  return Object.values(selections).some((set) => set.size > 0)
}

async function confirmClone() {
  const targets = Object.entries(selections).flatMap(([companyId, set]) =>
    Array.from(set).map((pageKey) => ({ companyId: Number(companyId), pageKey })),
  )
  if (targets.length === 0) return

  cloning.value = true
  results.value = []
  try {
    const res = await $fetch<{ results: typeof results.value }>('/api/pages/clone', {
      method: 'POST',
      body: {
        sourceCompanyId: props.sourceCompanyId,
        sourcePageKey: props.sourcePageKey,
        sourceVersion: props.sourceVersion,
        targets,
      },
    })
    results.value = res.results
  } catch (err: any) {
    results.value = targets.map((t) => ({ ...t, ok: false, error: err?.data?.message || err?.message || 'Clone failed' }))
  } finally {
    cloning.value = false
  }
}

function siteName(companyId: number): string {
  return websites.value.find((w) => w.id === companyId)?.name ?? `Site ${companyId}`
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" @click.self="emit('close')">
      <div class="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl space-y-4">
        <div>
          <h3 class="text-sm font-semibold text-gray-900">Clone Design</h3>
          <p class="mt-1 text-xs text-gray-500">
            Copy this page's design (colors, layout, banners, fonts) to other sites' pages as a new draft version.
            Products and category picks are not copied — each site keeps its own.
          </p>
        </div>

        <div v-if="loadingWebsites" class="py-8 text-center text-xs text-gray-400">Loading sites…</div>

        <div v-else class="space-y-2">
          <div v-for="site in websites" :key="site.id" class="rounded-lg border border-gray-200">
            <button
              class="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-medium text-gray-800 hover:bg-gray-50"
              @click="toggleSite(site.id)"
            >
              <span>{{ site.name }} — {{ site.domain }}</span>
              <span class="text-xs text-gray-400">
                {{ selections[site.id]?.size ? `${selections[site.id].size} selected` : '' }}
                {{ expandedSite === site.id ? '▲' : '▼' }}
              </span>
            </button>

            <div v-if="expandedSite === site.id" class="border-t border-gray-100 px-3 py-2 space-y-1">
              <div v-if="loadingSite[site.id]" class="py-2 text-xs text-gray-400">Loading pages…</div>
              <label
                v-for="page in pagesBySite[site.id]"
                v-else
                :key="page.id"
                class="flex items-center gap-2 py-1 text-sm text-gray-700"
              >
                <input
                  type="checkbox"
                  :checked="isChecked(site.id, page.id)"
                  @change="toggleSelection(site.id, page.id)"
                />
                {{ page.name }}
              </label>
              <p v-if="pagesBySite[site.id] && pagesBySite[site.id].length === 0" class="py-2 text-xs text-gray-400">
                No pages found.
              </p>
            </div>
          </div>
        </div>

        <div v-if="results.length" class="space-y-1 rounded-lg bg-gray-50 p-3 text-xs">
          <div v-for="r in results" :key="`${r.companyId}-${r.pageKey}`" :class="r.ok ? 'text-green-700' : 'text-red-600'">
            {{ siteName(r.companyId) }} — {{ r.pageKey }}:
            {{ r.ok ? `cloned as v${r.version} (draft)` : r.error }}
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
            :disabled="cloning || !hasAnySelection()"
            class="rounded-lg bg-gray-900 px-4 py-2 text-xs font-medium text-white hover:bg-gray-700 disabled:opacity-50 transition-colors"
            @click="confirmClone"
          >
            {{ cloning ? 'Cloning…' : 'Clone Design' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
