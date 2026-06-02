<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })

interface Website {
  id: number
  name: string
  domain: string
}

interface PageVersion {
  version: number
  updatedAt: string
  status: string
  value: string
}

interface Page {
  id: string
  name: string
  slug: string
  status: string
  updatedAt: string
  versions: PageVersion[]
}

const { data: websites } = await useFetch<Website[]>('/api/websites')

const selectedWebsiteId = ref<number | null>(null)
const pages = ref<Page[]>([])
const loadingPages = ref(false)
const selectedVersions = ref<Record<string, number>>({})
const publishing = ref<Record<string, boolean>>({})

watchEffect(() => {
  if (websites.value?.length && !selectedWebsiteId.value) {
    selectedWebsiteId.value = websites.value[0].id
  }
})

watch(
  selectedWebsiteId,
  async (id) => {
    if (!id) return
    loadingPages.value = true
    try {
      pages.value = await $fetch<Page[]>('/api/pages', {
        query: { websiteId: 3 },
      })
      pages.value.forEach((p) => {
        selectedVersions.value[p.id] = p.versions[0]?.version ?? 1
      })
    } finally {
      loadingPages.value = false
    }
  },
  { immediate: true }
)

function selectedVersionData(page: Page) {
  const vNum = selectedVersions.value[page.id]
  return page.versions.find((v) => v.version === vNum) ?? page.versions[0]
}

async function publishPage(page: Page) {
  publishing.value[page.id] = true
  const vData = selectedVersionData(page)
  try {
    await $fetch('/api/proxy/odoo/cms', {
      method: 'POST',
      body: {
        key: page.id,
        value: vData.value,
        version: String(vData.version),
        state: 'published',
        updatedBy: 'editor',
        updatedOn: new Date().toISOString(),
      },
    })
    const target = pages.value.find((p) => p.id === page.id)
    if (target) {
      target.status = 'published'
      const vNum = selectedVersions.value[page.id]
      const targetVersion = target.versions.find((v) => v.version === vNum) ?? target.versions[0]
      if (targetVersion) targetVersion.status = 'published'
    }
  } finally {
    publishing.value[page.id] = false
  }
}

const pageHtmlCache = usePageHtmlCache()

function editPage(page: Page) {
  const vData = selectedVersionData(page)
  pageHtmlCache.value[page.id] = vData.value
  navigateTo(`/editor?pageId=${page.id}&pageName=${encodeURIComponent(page.name)}&pageVersion=${vData.version}`)
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}
</script>

<template>
  <div>
    <!-- Website selector (only shown when multiple websites exist) -->
    <div v-if="websites && websites.length > 1" class="mb-6 flex items-center gap-2">
      <label class="text-xs font-medium text-gray-500 shrink-0">Website</label>
      <select
        v-model="selectedWebsiteId"
        class="rounded-lg border border-gray-200 px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-gray-400"
      >
        <option v-for="site in websites" :key="site.id" :value="site.id">
          {{ site.name }} — {{ site.domain }}
        </option>
      </select>
    </div>

    <!-- Page title -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Your Pages</h1>
      <p class="mt-1 text-sm text-gray-500">Manage and publish your store pages</p>
    </div>

    <!-- Loading -->
    <div v-if="loadingPages" class="py-16 text-center text-sm text-gray-400">
      Loading…
    </div>

    <!-- Card grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <!-- Page cards -->
      <div
        v-for="page in pages"
        :key="page.id"
        class="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white"
      >
        <!-- Browser mockup preview -->
        <div class="relative flex h-36 items-center justify-center bg-slate-50">
          <svg width="130" height="84" viewBox="0 0 130 84" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="0.5" y="0.5" width="129" height="83" rx="5.5" fill="white" stroke="#CBD5E1" />
            <rect x="0.5" y="0.5" width="129" height="16" rx="5.5" fill="#F1F5F9" stroke="#CBD5E1" />
            <circle cx="10" cy="8.5" r="2.5" fill="#E2E8F0" />
            <circle cx="18" cy="8.5" r="2.5" fill="#E2E8F0" />
            <circle cx="26" cy="8.5" r="2.5" fill="#E2E8F0" />
            <rect x="34" y="4.5" width="72" height="8" rx="4" fill="#E2E8F0" />
            <rect x="10" y="24" width="110" height="6" rx="2" fill="#E2E8F0" />
            <rect x="10" y="34" width="85" height="5" rx="2" fill="#E2E8F0" />
            <rect x="10" y="43" width="95" height="5" rx="2" fill="#E2E8F0" />
            <rect x="10" y="58" width="50" height="15" rx="3" fill="#CBD5E1" />
            <rect x="68" y="58" width="50" height="15" rx="3" fill="#E2E8F0" />
          </svg>

          <!-- Status badge -->
          <span
            class="absolute right-2.5 top-2.5 rounded-full px-2 py-0.5 text-xs font-medium leading-none"
            :class="
              selectedVersionData(page)?.status === 'published'
                ? 'bg-green-50 text-green-700'
                : 'bg-amber-50 text-amber-700'
            "
          >
            {{ selectedVersionData(page)?.status ?? page.status }}
          </span>
        </div>

        <!-- Card body -->
        <div class="flex flex-1 flex-col gap-2 p-4">
          <!-- Name + version dropdown -->
          <div class="flex items-center justify-between gap-2">
            <span class="truncate text-sm font-semibold text-gray-900">{{ page.name }}</span>
            <select
              v-model="selectedVersions[page.id]"
              class="shrink-0 rounded border border-gray-200 bg-white px-2 py-0.5 text-xs text-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-400"
            >
              <option v-for="v in page.versions" :key="v.version" :value="v.version">
                v{{ v.version }}
              </option>
            </select>
          </div>

          <!-- Updated date -->
          <p class="text-xs text-gray-400">
            Updated {{ formatDate(selectedVersionData(page)?.updatedAt ?? page.updatedAt) }}
          </p>

          <!-- Action buttons -->
          <div class="mt-auto flex items-center gap-2 pt-3">
            <button
              :disabled="selectedVersionData(page)?.status === 'published' || publishing[page.id]"
              class="flex-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors"
              :class="
                selectedVersionData(page)?.status === 'published'
                  ? 'cursor-not-allowed border-gray-200 text-gray-400'
                  : 'border-gray-900 text-gray-900 hover:bg-gray-50'
              "
              @click="publishPage(page)"
            >
              {{ publishing[page.id] ? 'Publishing…' : 'Publish' }}
            </button>
            <button
              class="flex-1 rounded-lg bg-black px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-gray-800"
              @click="editPage(page)"
            >
              Edit →
            </button>
          </div>
        </div>
      </div>

      <!-- New Page placeholder -->
      <button
        class="flex min-h-[220px] w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 transition-colors hover:border-gray-400 hover:bg-gray-50"
      >
        <span class="text-4xl font-light leading-none text-gray-300">+</span>
        <span class="mt-2 text-sm text-gray-400">New Page</span>
      </button>
    </div>
  </div>
</template>
