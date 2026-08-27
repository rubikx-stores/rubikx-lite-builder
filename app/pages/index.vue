<script setup lang="ts">
import { useSiteConfig } from '~/composables/useSiteConfig'
import { splitShopSectionsForPublish, GLOBAL_OWNER_PAGES } from '~/composables/useGlobalSections'
import { resetThemeToDefaults } from '~/composables/editor/useThemeColors'

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
  isDefault?: boolean
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
const selectedDeleteVersions = ref<number[]>([])
const deleteInFlight = ref(false)
const deleteError = ref('')
const deleteConfirmText = ref('')
const selectAllCheckboxRef = ref<HTMLInputElement | null>(null)
// New page modal state
const showNewPageModal = ref(false)
const newPageName = ref('')
const newPageNameInput = ref<HTMLInputElement | null>(null)
const newPageError = ref('')

// Site configuration composable
const siteConfig = useSiteConfig()

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

    const configPage = pages.value.find(p => p.id === 'global-config')
    if (configPage && configPage.versions[0]?.value) {
      siteConfig.loadFromJson(configPage.versions[0].value)
    } else {
      siteConfig.reset()
    }
    const themePage = pages.value.find(p => p.id === 'global-theme')
    if (themePage && themePage.versions[0]?.value) {
      useThemeColors().seedFromThemeJson(themePage.versions[0].value)
    } else {
      resetThemeToDefaults()
    }
  } finally {
    loadingPages.value = false
  }
}
watch(selectedWebsiteId, fetchPages, { immediate: true })

function selectedVersionData(page: Page) {
  const vNum = selectedVersions.value[page.id]
  return page.versions.find((v) => v.version === vNum) ?? page.versions[0]
}

// True once every version the page has is currently checked — whether it
// started that way (single-version page) or got there via "Select all".
// This is also the exact condition under which the delete removes the
// page from the site entirely, the single most destructive thing this
// modal can do — so it doubles as the trigger for the heavier warning
// and type-the-name confirmation below, instead of just the checkbox state.
const allDeleteVersionsSelected = computed(() => {
  const page = pageToDelete.value
  if (!page) return false
  return selectedDeleteVersions.value.length === page.versions.length
})

const deleteHasPublishedWarning = computed(() => {
  const page = pageToDelete.value
  if (!page) return false
  return page.versions.some((v) => selectedDeleteVersions.value.includes(v.version) && v.status === 'published')
})

const deleteConfirmDisabled = computed(() => {
  if (!selectedDeleteVersions.value.length || deleteInFlight.value) return true
  if (allDeleteVersionsSelected.value) return deleteConfirmText.value.trim() !== pageToDelete.value?.name
  return false
})

// Native checkbox indeterminate state can't be set via a template
// attribute — it has to be poked at the DOM node directly.
watchEffect(() => {
  if (selectAllCheckboxRef.value) {
    selectAllCheckboxRef.value.indeterminate = selectedDeleteVersions.value.length > 0 && !allDeleteVersionsSelected.value
  }
})

function toggleSelectAllDeleteVersions() {
  const page = pageToDelete.value
  if (!page) return
  selectedDeleteVersions.value = allDeleteVersionsSelected.value ? [] : page.versions.map((v) => v.version)
}

function toggleDeleteVersion(version: number) {
  const idx = selectedDeleteVersions.value.indexOf(version)
  if (idx === -1) selectedDeleteVersions.value.push(version)
  else selectedDeleteVersions.value.splice(idx, 1)
}

function closeDeleteModal() {
  if (deleteInFlight.value) return
  showDeleteModal.value = false
  pageToDelete.value = null
  deleteError.value = ''
  deleteConfirmText.value = ''
}

function onDeleteModalKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') closeDeleteModal()
}
watch(showDeleteModal, (open) => {
  if (open) window.addEventListener('keydown', onDeleteModalKeydown)
  else window.removeEventListener('keydown', onDeleteModalKeydown)
})

async function publishPage(page: Page) {
  publishing.value[page.id] = true
  const vData = selectedVersionData(page)
  // Only the dedicated "shop" page's banners get split into shop-header/
  // shop-footer — those are the two keys the live /shop route reads. Shop-theme
  // blocks reused on any other page (e.g. a shop preview section on Home) are
  // just normal page content and publish as-is, unsplit.
  const { mainHtml, shopHeaderHtml, shopFooterHtml } = page.id === 'shop'
    ? splitShopSectionsForPublish(vData.value)
    : { mainHtml: vData.value, shopHeaderHtml: '', shopFooterHtml: '' }

  const commonFields = {
    version: vData.version,
    state: 'published' as const,
    companyId: selectedWebsiteId.value ?? 1,
    company_id: selectedWebsiteId.value ?? 1,
    updatedBy: user.value?.name ?? 'editor',
    updatedOn: new Date().toISOString(),
  }
  const publishPayload = { key: page.id, value: mainHtml, ...commonFields }

  // Only home/shop own the site-wide global header/footer (see confirmSave()
  // in PageBuilderWrapper.client.vue, which only ever saves them as draft).
  // Publishing either one promotes whatever the latest saved draft of
  // global-header/global-footer currently is to 'published', at that same
  // version — the CMS read path already breaks version ties in favor of
  // 'published' (see server/api/pages/index.get.ts), so this is what makes
  // the pending design go live instead of every intermediate Save.
  const globalPromotions: { key: string; value: string; version: number }[] = []
  if (GLOBAL_OWNER_PAGES.includes(page.id)) {
    for (const key of ['global-header', 'global-footer']) {
      const latest = pages.value.find((p) => p.id === key)?.versions[0]
      if (latest) globalPromotions.push({ key, value: latest.value, version: latest.version })
    }
  }

  console.log('====================================================')
  console.log(`[PUBLISH PAGE] Publishing page "${page.id}":`, publishPayload)
  if (shopHeaderHtml) console.log('[PUBLISH PAGE] Also publishing "shop-header":', shopHeaderHtml)
  if (shopFooterHtml) console.log('[PUBLISH PAGE] Also publishing "shop-footer":', shopFooterHtml)
  globalPromotions.forEach((g) => console.log(`[PUBLISH PAGE] Also promoting "${g.key}" (v${g.version}) to published`))
  console.log('====================================================')
  try {
    const posts = [$fetch('/api/proxy/odoo/cms', { method: 'POST', body: publishPayload })]
    if (shopHeaderHtml) {
      posts.push($fetch('/api/proxy/odoo/cms', {
        method: 'POST',
        body: { ...commonFields, key: 'shop-header', value: shopHeaderHtml },
      }))
    }
    if (shopFooterHtml) {
      posts.push($fetch('/api/proxy/odoo/cms', {
        method: 'POST',
        body: { ...commonFields, key: 'shop-footer', value: shopFooterHtml },
      }))
    }
    for (const g of globalPromotions) {
      posts.push($fetch('/api/proxy/odoo/cms', {
        method: 'POST',
        body: { ...commonFields, key: g.key, value: g.value, version: g.version },
      }))
    }
    const res = await Promise.all(posts)
    console.log('[PUBLISH] response:', res)
    const target = pages.value.find((p) => p.id === page.id)
    if (target) {
      target.status = 'published'
      const vNum = selectedVersions.value[page.id]
      const targetVersion = target.versions.find((v) => v.version === vNum) ?? target.versions[0]
      if (targetVersion) targetVersion.status = 'published'
    }
    for (const g of globalPromotions) {
      const gTarget = pages.value.find((p) => p.id === g.key)
      if (gTarget) {
        gTarget.status = 'published'
        const gVersion = gTarget.versions.find((v) => v.version === g.version)
        if (gVersion) gVersion.status = 'published'
      }
    }
  } finally {
    publishing.value[page.id] = false
  }
}

function confirmDeletePage(page: Page) {
  if (page.isDefault) return // nothing persisted yet — no-op until the page is saved
  pageToDelete.value = page
  deleteError.value = ''
  deleteConfirmText.value = ''
  // Defaults to just whichever version is currently active in the card's
  // own dropdown — least destructive starting point. "Select all" or
  // individual checkboxes in the modal below let the admin widen or
  // narrow that before confirming.
  const defaultVersion = selectedVersions.value[page.id] ?? page.versions[0]?.version
  selectedDeleteVersions.value = defaultVersion !== undefined ? [defaultVersion] : []
  showDeleteModal.value = true
}

async function deletePage() {
  if (!pageToDelete.value || !selectedDeleteVersions.value.length) return
  const page = pageToDelete.value
  const isAll = selectedDeleteVersions.value.length === page.versions.length
  deleteInFlight.value = true
  deleteError.value = ''
  deleting.value[page.id] = true
  try {
    await $fetch(`/api/pages/${page.id}`, {
      method: 'DELETE',
      query: {
        companyId: selectedWebsiteId.value,
        ...(isAll ? {} : { versions: selectedDeleteVersions.value.join(',') }),
      },
    })
    if (isAll) {
      // Deleting all of Home's versions cascades its matching global-header/
      // global-footer versions on the backend (see [key].delete.ts) — refetch
      // so pages.value picks up the reset default theme instead of leaving
      // editPage()'s pageHtmlCache seeding stuck on stale cached entries.
      if (page.id === 'home') {
        await fetchPages()
      } else {
        pages.value = pages.value.filter(p => p.id !== page.id)
      }
    } else {
      await fetchPages()
    }
    showDeleteModal.value = false
    pageToDelete.value = null
  } catch (e: any) {
    deleteError.value = e?.data?.message ?? 'Failed to delete page'
  } finally {
    deleteInFlight.value = false
    deleting.value[page.id] = false
  }
}

const pageHtmlCache = usePageHtmlCache()

const GLOBAL_KEYS = ['global-header', 'global-footer', 'global-theme', 'global-config', 'shop-header', 'shop-footer']
const displayPages = computed(() => {
  return pages.value.filter(p => {
    if (GLOBAL_KEYS.includes(p.id)) return false
    if (p.id === 'home' && siteConfig.state.isShopAsHomePage) return false
    return true
  })
})

function editPage(page: Page) {
  const vData = selectedVersionData(page)
  pageHtmlCache.value[page.id] = vData.value

  const headerPage = pages.value.find(p => p.id === 'global-header')
  const footerPage = pages.value.find(p => p.id === 'global-footer')
  const themePage = pages.value.find(p => p.id === 'global-theme')

  if (headerPage) {
    pageHtmlCache.value['global-header'] = headerPage.versions[0]?.value ?? ''
  }
  if (footerPage) {
    pageHtmlCache.value['global-footer'] = footerPage.versions[0]?.value ?? ''
  }
  if (themePage) {
    pageHtmlCache.value['global-theme'] = themePage.versions[0]?.value ?? ''
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
    <div class="mb-8 flex items-start justify-between">
      <div>
        <div class="flex items-center gap-3">
          <h1 class="text-2xl font-bold text-gray-900">Your Pages</h1>
          <NuxtLink
            to="/configuration"
            title="Site & Theme Configuration"
            class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl bg-gray-100 text-gray-700 transition-colors hover:bg-gray-200 hover:text-gray-900 border-none shadow-xs"
          >
            <span class="material-symbols-outlined text-2xl leading-none">settings</span>
          </NuxtLink>
        </div>
        <p class="mt-1 text-sm text-gray-500">Manage and publish your store pages</p>
      </div>
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
                v-if="!page.isDefault"
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
      <Transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="showDeleteModal"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          @click.self="closeDeleteModal"
        >
          <Transition
            appear
            enter-active-class="transition duration-150 ease-out"
            enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition duration-100 ease-in"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-modal-title"
              class="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            >
              <div class="flex items-start gap-3">
                <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </span>
                <div class="min-w-0 pt-0.5">
                  <h3 id="delete-modal-title" class="text-base font-semibold text-gray-900">Delete page</h3>
                  <p class="mt-0.5 text-sm text-gray-500">
                    <span class="font-medium text-gray-900">{{ pageToDelete?.name }}</span> will be permanently removed. This cannot be undone.
                  </p>
                </div>
              </div>

              <div
                v-if="pageToDelete && pageToDelete.versions.length > 1"
                class="mt-5"
                :class="{ 'pointer-events-none opacity-60': deleteInFlight }"
              >
                <label class="flex cursor-pointer items-center justify-between rounded-lg border border-gray-200 px-3 py-2 hover:bg-gray-50">
                  <span class="flex items-center gap-2.5">
                    <input
                      ref="selectAllCheckboxRef"
                      type="checkbox"
                      :checked="allDeleteVersionsSelected"
                      class="cursor-pointer accent-gray-900"
                      @change="toggleSelectAllDeleteVersions"
                    />
                    <span class="text-sm font-medium text-gray-900">Select all</span>
                  </span>
                  <span class="text-xs text-gray-400">{{ selectedDeleteVersions.length }} of {{ pageToDelete.versions.length }} selected</span>
                </label>

                <div class="mt-2 max-h-44 space-y-1 overflow-y-auto rounded-lg border border-gray-100 p-1.5">
                  <label
                    v-for="v in pageToDelete.versions"
                    :key="v.version"
                    class="flex cursor-pointer items-center justify-between gap-2 rounded-md border px-2.5 py-2 transition-colors"
                    :class="selectedDeleteVersions.includes(v.version) ? 'border-gray-900 bg-gray-50' : 'border-transparent hover:bg-gray-50'"
                  >
                    <span class="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        :checked="selectedDeleteVersions.includes(v.version)"
                        class="cursor-pointer accent-gray-900"
                        @change="toggleDeleteVersion(v.version)"
                      />
                      <span class="text-sm text-gray-900">v{{ v.version }}</span>
                    </span>
                    <span
                      class="rounded-full px-2 py-0.5 text-xs font-medium"
                      :class="v.status === 'published' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'"
                    >
                      {{ v.status }}
                    </span>
                  </label>
                </div>
              </div>

              <!-- Full page removal: the whole page is coming off the site —
                   this is the most destructive path through this modal, so
                   it gets a harder-to-miss warning and a type-to-confirm
                   gate instead of just an informational note. -->
              <div v-if="allDeleteVersionsSelected" class="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-3">
                <div class="flex items-start gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="mt-0.5 h-4 w-4 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                  <p class="text-xs font-medium leading-relaxed text-red-700">
                    This permanently deletes <span class="font-semibold">{{ pageToDelete?.name }}</span> and removes it from your live site.
                  </p>
                </div>
                <div class="mt-2.5">
                  <label class="block text-xs text-red-700">
                    Type <span class="font-mono font-semibold">{{ pageToDelete?.name }}</span> to confirm
                  </label>
                  <input
                    v-model="deleteConfirmText"
                    type="text"
                    autocomplete="off"
                    :disabled="deleteInFlight"
                    class="mt-1.5 w-full rounded-lg border border-red-300 bg-white px-2.5 py-1.5 text-sm text-gray-900 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>
              </div>

              <!-- Partial deletion that still touches a published version —
                   softer, informational note since the page itself survives. -->
              <div v-else-if="deleteHasPublishedWarning" class="mt-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
                <svg xmlns="http://www.w3.org/2000/svg" class="mt-0.5 h-4 w-4 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-8.25 3h.008v.008h-.008V15z" />
                </svg>
                <p class="text-xs leading-relaxed text-amber-700">This will remove a version that is currently live on your site.</p>
              </div>

              <p v-if="deleteError" class="mt-4 text-xs text-red-600">{{ deleteError }}</p>

              <div class="mt-6 flex gap-2">
                <button
                  class="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-40"
                  :disabled="deleteInFlight"
                  @click="closeDeleteModal"
                >
                  Cancel
                </button>
                <button
                  class="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-40"
                  :disabled="deleteConfirmDisabled"
                  @click="deletePage()"
                >
                  <span v-if="deleteInFlight" class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  {{ deleteInFlight ? 'Deleting…' : 'Delete' }}
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
