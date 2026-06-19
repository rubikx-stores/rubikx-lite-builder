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
  updatedBy?: string
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
const { user } = useAuth()

const selectedWebsiteId = useState<number | null>('selectedCompanyId', () => null)
const pages = ref<Page[]>([])
const loadingPages = ref(false)
const selectedVersions = ref<Record<string, number>>({})
const publishing = ref<Record<string, boolean>>({})
const deleting = ref<Record<string, boolean>>({})

const showDeleteModal = ref(false)
const pageToDelete = ref<Page | null>(null)

// New page modal state
const showNewPageModal = ref(false)
const newPageName = ref('')
const newPageNameInput = ref<HTMLInputElement | null>(null)
const newPageError = ref('')

watchEffect(() => {
  if (websites.value?.length && !selectedWebsiteId.value) {
    selectedWebsiteId.value = websites.value[0].id
  }
})

async function fetchPages() {
  if (!selectedWebsiteId.value) return
  loadingPages.value = true
  try {
    pages.value = await $fetch<Page[]>('/api/pages', { query: { companyId: selectedWebsiteId.value } })
    pages.value.forEach((p) => {
      selectedVersions.value[p.id] = p.versions[0]?.version ?? 1
    })
  } finally {
    loadingPages.value = false
  }
}
watch(selectedWebsiteId, fetchPages, { immediate: true })
onMounted(fetchPages)

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
        updatedBy: user.value?.name ?? 'editor',
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

function confirmDeletePage(page: Page) {
  pageToDelete.value = page
  showDeleteModal.value = true
}

async function deletePage() {
  if (!pageToDelete.value) return
  const page = pageToDelete.value
  showDeleteModal.value = false
  deleting.value[page.id] = true
  try {
    await $fetch(`/api/pages/${page.id}`, { method: 'DELETE', query: { companyId: selectedWebsiteId.value } })
    pages.value = pages.value.filter(p => p.id !== page.id)
  } catch (e: any) {
    alert(e?.data?.message ?? 'Failed to delete page')
  } finally {
    deleting.value[page.id] = false
    pageToDelete.value = null
  }
}

const pageHtmlCache = usePageHtmlCache()

const GLOBAL_KEYS = ['global-header', 'global-footer']
const displayPages = computed(() => pages.value.filter(p => !GLOBAL_KEYS.includes(p.id)))

function editPage(page: Page) {
  const vData = selectedVersionData(page)
  pageHtmlCache.value[page.id] = vData.value

  const headerPage = pages.value.find(p => p.id === 'global-header')
  const footerPage = pages.value.find(p => p.id === 'global-footer')

  if (headerPage) {
    pageHtmlCache.value['global-header'] = headerPage.versions[0]?.value ?? ''
  }
  if (footerPage) {
    pageHtmlCache.value['global-footer'] = footerPage.versions[0]?.value ?? ''
  }

  navigateTo(`/editor?pageId=${page.id}&pageName=${encodeURIComponent(page.name)}&pageVersion=${vData.version}&companyId=${selectedWebsiteId.value}`)
}

function formatDate(iso: string) {
  const date = new Date(iso.replace(' ', 'T'))
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function toSlug(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function openNewPageModal() {
  newPageName.value = ''
  newPageError.value = ''
  showNewPageModal.value = true
  nextTick(() => newPageNameInput.value?.focus())
}

function closeNewPageModal() {
  showNewPageModal.value = false
  newPageName.value = ''
  newPageError.value = ''
}

async function createNewPage() {
  const name = newPageName.value.trim()
  if (!name) {
    newPageError.value = 'Page name is required.'
    return
  }
  const slug = toSlug(name)
  if (!slug) {
    newPageError.value = 'Please enter a valid page name.'
    return
  }
  if (pages.value.some((p) => p.id === slug)) {
    newPageError.value = `A page named "${slug}" already exists.`
    return
  }
  const now = new Date().toISOString()
  const newPage = {
    id: slug,
    name,
    slug: `/${slug}`,
    status: 'draft',
    updatedAt: now,
    versions: [{ version: 1, updatedAt: now, status: 'draft', value: '' }],
  }
  pages.value.unshift(newPage)
  selectedVersions.value[slug] = 1
  pageHtmlCache.value[slug] = ''
  // Save empty page to Odoo so it persists on refresh
  try {
    await $fetch('/api/proxy/odoo/cms', {
      method: 'POST',
      body: {
        key: slug,
        value: ' ',
        version: 1,
        state: 'draft',
        companyId: selectedWebsiteId.value ?? 1,
        company_id: selectedWebsiteId.value ?? 1,
        updatedBy: user.value?.name ?? 'editor',
        updatedOn: new Date().toISOString(),
      }
    })
  } catch (e) {
    console.error('[NEW PAGE] Failed to save to Odoo:', e)
  }
  closeNewPageModal()
}

function handleModalKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') createNewPage()
  if (e.key === 'Escape') closeNewPageModal()
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
        v-for="page in displayPages"
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
            <div class="flex items-center gap-2">
              <select
                v-model="selectedVersions[page.id]"
                class="shrink-0 rounded border border-gray-200 bg-white px-2 py-0.5 text-xs text-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-400"
              >
                <option v-for="v in page.versions" :key="v.version" :value="v.version">
                  v{{ v.version }}
                </option>
              </select>
              <button
                :disabled="deleting[page.id]"
                class="p-1.5 rounded-lg border border-red-200 text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                @click.stop="confirmDeletePage(page)"
                title="Delete page"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Updated date -->
          <p class="text-xs text-gray-400">Updated {{ formatDate(selectedVersionData(page)?.updatedAt ?? page.updatedAt) }}</p>
          <p v-if="selectedVersionData(page)?.updatedBy" class="text-xs text-gray-400">by {{ selectedVersionData(page)?.updatedBy }}</p>

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

      <!-- New Page card -->
      <button
        class="flex min-h-[220px] w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 transition-colors hover:border-gray-400 hover:bg-gray-50"
        @click="openNewPageModal"
      >
        <span class="text-4xl font-light leading-none text-gray-300">+</span>
        <span class="mt-2 text-sm text-gray-400">New Page</span>
      </button>
    </div>

    <!-- New Page modal -->
    <Teleport to="body">
      <div
        v-if="showNewPageModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
        @click.self="closeNewPageModal"
      >
        <div
          class="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
          @keydown="handleModalKeydown"
        >
          <h2 class="text-base font-semibold text-gray-900">New Page</h2>
          <p class="mt-1 text-xs text-gray-500">Give your page a name to get started.</p>

          <div class="mt-4">
            <input
              ref="newPageNameInput"
              v-model="newPageName"
              type="text"
              placeholder="e.g. About Us"
              class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
              @input="newPageError = ''"
            />
            <!-- Slug preview -->
            <p v-if="newPageName.trim()" class="mt-1.5 text-xs text-gray-400">
              Slug: <span class="font-mono text-gray-600">/{{ toSlug(newPageName) }}</span>
            </p>
            <!-- Error -->
            <p v-if="newPageError" class="mt-1.5 text-xs text-red-500">{{ newPageError }}</p>
          </div>

          <div class="mt-5 flex gap-2">
            <button
              class="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
              @click="closeNewPageModal"
            >
              Cancel
            </button>
            <button
              class="flex-1 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-40"
              :disabled="!newPageName.trim()"
              @click="createNewPage"
            >
              Create Page
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Delete confirmation modal -->
    <Teleport to="body">
      <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div class="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
          <h3 class="text-base font-semibold text-gray-900 mb-2">Delete page</h3>
          <p class="text-sm text-gray-500 mb-6">Are you sure you want to delete <span class="font-medium text-gray-900">{{ pageToDelete?.name }}</span>? This cannot be undone.</p>
          <div class="flex gap-3">
            <button
              class="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              @click="showDeleteModal = false; pageToDelete = null"
            >
              Cancel
            </button>
            <button
              class="flex-1 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-600 transition-colors"
              @click="deletePage()"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
