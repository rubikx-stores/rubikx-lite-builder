<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { useSiteConfig, type SiteConfigValues } from '~/composables/useSiteConfig'
import { useThemeColors, type ThemeColorValues } from '~/composables/editor/useThemeColors'
import { usePageHtmlCache } from '~/composables/usePageHtmlCache'

definePageMeta({ layout: 'dashboard' })

interface Website {
  id: number
  name: string
  domain: string
}

const { data: websites } = await useFetch<Website[]>('/api/websites')
const selectedCompanyId = useState<number | null>('selectedCompanyId', () => null)

watchEffect(() => {
  if (websites.value?.length && !selectedCompanyId.value) {
    selectedCompanyId.value = websites.value[0].id
  }
})

const { user } = useAuth()
const siteConfig = useSiteConfig()
const { state: themeState, saveTheme, themeJson } = useThemeColors()
const saving = ref(false)
const savedSuccess = ref(false)
const saveError = ref('')
const loading = ref(true)

const draftConfig = reactive<SiteConfigValues>({
  defaultHomePage: siteConfig.state.defaultHomePage,
  isShopAsHomePage: siteConfig.state.isShopAsHomePage,
})

const draftTheme = reactive<ThemeColorValues>({
  primaryCtaBgColor: themeState.primaryCtaBgColor,
  primaryCtaTextColor: themeState.primaryCtaTextColor,
  secondaryCtaBgColor: themeState.secondaryCtaBgColor,
  secondaryCtaTextColor: themeState.secondaryCtaTextColor,
  primaryTextColor: themeState.primaryTextColor,
  secondaryTextColor: themeState.secondaryTextColor,
})

async function loadExistingSettings() {
  const companyId = selectedCompanyId.value ?? websites.value?.[0]?.id ?? 1
  loading.value = true
  try {
    const pages = await $fetch<any[]>('/api/pages', { query: { companyId } })
    
    const configPage = pages.find((p: any) => p.id === 'global-config')
    if (configPage && configPage.versions[0]?.value) {
      siteConfig.loadFromJson(configPage.versions[0].value)
    } else {
      siteConfig.reset()
    }

    const themePage = pages.find((p: any) => p.id === 'global-theme')
    if (themePage && themePage.versions[0]?.value) {
      useThemeColors().seedFromThemeJson(themePage.versions[0].value)
    }

    // Sync draft values
    draftConfig.defaultHomePage = siteConfig.state.defaultHomePage
    draftConfig.isShopAsHomePage = siteConfig.state.isShopAsHomePage
    draftTheme.primaryCtaBgColor = themeState.primaryCtaBgColor
    draftTheme.primaryCtaTextColor = themeState.primaryCtaTextColor
    draftTheme.secondaryCtaBgColor = themeState.secondaryCtaBgColor
    draftTheme.secondaryCtaTextColor = themeState.secondaryCtaTextColor
    draftTheme.primaryTextColor = themeState.primaryTextColor
    draftTheme.secondaryTextColor = themeState.secondaryTextColor
  } catch (e: any) {
    console.error('[CONFIG PAGE] Failed to load CMS configuration:', e)
  } finally {
    loading.value = false
  }
}

watch(selectedCompanyId, () => {
  loadExistingSettings()
}, { immediate: true })

function handleShopToggle(e: Event) {
  const target = e.target as HTMLInputElement
  draftConfig.isShopAsHomePage = target.checked
  draftConfig.defaultHomePage = target.checked ? '/shop' : '/'
}

async function save() {
  saving.value = true
  saveError.value = ''
  savedSuccess.value = false
  try {
    // Save locally
    siteConfig.setConfig({
      defaultHomePage: draftConfig.defaultHomePage,
      isShopAsHomePage: draftConfig.isShopAsHomePage,
    })
    saveTheme({
      primaryCtaBgColor: draftTheme.primaryCtaBgColor,
      primaryCtaTextColor: draftTheme.primaryCtaTextColor,
      secondaryCtaBgColor: draftTheme.secondaryCtaBgColor,
      secondaryCtaTextColor: draftTheme.secondaryCtaTextColor,
      primaryTextColor: draftTheme.primaryTextColor,
      secondaryTextColor: draftTheme.secondaryTextColor,
    })

    const companyId = selectedCompanyId.value ?? websites.value?.[0]?.id ?? 1

    // Always save as the next version after whatever the CMS currently has —
    // never a hardcoded 1. A fixed version number can end up lower than an
    // existing record's (e.g. from an old/stray write) and get permanently
    // shadowed by it, since "latest" is picked by highest version number.
    const latestPages = await $fetch<any[]>('/api/pages', { query: { companyId } })
    const nextVersion = (key: string) => {
      const versions = latestPages.find((p) => p.id === key)?.versions ?? []
      return versions.length ? Math.max(...versions.map((v: any) => Number(v.version) || 0)) + 1 : 1
    }

    const commonPayload = {
      state: 'published' as const,
      updatedBy: user.value?.name ?? 'editor',
      updatedOn: new Date().toISOString(),
      companyId,
      company_id: companyId,
    }

    const configPayload = {
      ...commonPayload,
      version: nextVersion('global-config'),
      key: 'global-config',
      value: siteConfig.configJson(),
    }

    const themePayload = {
      ...commonPayload,
      version: nextVersion('global-theme'),
      key: 'global-theme',
      value: themeJson(),
    }

    console.log('====================================================')
    console.log('[CONFIG PAGE] Saving "global-config":', configPayload)
    console.log('[CONFIG PAGE] Saving "global-theme":', themePayload)
    console.log('====================================================')

    // Call CMS api for both configuration and theme colors
    await Promise.all([
      $fetch('/api/proxy/odoo/cms', {
        method: 'POST',
        body: configPayload,
      }),
      $fetch('/api/proxy/odoo/cms', {
        method: 'POST',
        body: themePayload,
      })
    ])

    // Update html cache
    const pageHtmlCache = usePageHtmlCache()
    pageHtmlCache.value['global-theme'] = themeJson()
    pageHtmlCache.value['global-config'] = siteConfig.configJson()

    savedSuccess.value = true
    setTimeout(() => {
      savedSuccess.value = false
    }, 3000)
  } catch (err: any) {
    saveError.value = err?.data?.message || err?.message || 'Failed to save configuration.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="max-w-5xl mx-auto py-4 space-y-8">
    <!-- Breadcrumb & Top Bar -->
    <div class="flex items-center justify-between">
      <div class="space-y-1">
        <NuxtLink
          to="/"
          class="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors mb-1"
        >
          <span class="material-symbols-outlined text-base">arrow_back</span>
          <span>Back to Your Pages</span>
        </NuxtLink>
        <h1 class="text-2xl font-bold text-gray-900">Site & Theme Configuration</h1>
        <p class="text-sm text-gray-500">Manage global store settings, route redirects, and brand palettes</p>
      </div>

      <div class="flex items-center gap-3">
        <NuxtLink
          to="/"
          class="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
        >
          Cancel
        </NuxtLink>
        <button
          type="button"
          :disabled="saving || loading"
          class="rounded-xl bg-black px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 cursor-pointer flex items-center gap-2 transition-colors shadow-sm"
          @click="save"
        >
          <span v-if="saving" class="inline-block animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
          <span>{{ saving ? 'Saving Changes…' : 'Save Changes' }}</span>
        </button>
      </div>
    </div>

    <!-- Alert Banners -->
    <div v-if="savedSuccess" class="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-800 flex items-center gap-2">
      <span class="material-symbols-outlined text-emerald-600">check_circle</span>
      <span>Configuration updated and published successfully!</span>
    </div>

    <div v-if="saveError" class="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700 flex items-center gap-2">
      <span class="material-symbols-outlined text-red-600">error</span>
      <span>{{ saveError }}</span>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="loading" class="py-12 text-center text-sm text-gray-400">
      Loading configuration settings…
    </div>

    <!-- Main Content Cards -->
    <div v-else class="space-y-8">
      <!-- Card 1: Homepage & Routing Settings -->
      <div class="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
        <div class="mb-4">
          <h2 class="text-lg font-bold text-gray-900">Homepage & Route Settings</h2>
          <p class="text-xs text-gray-500">Configure default landing route behavior for site visitors</p>
        </div>

        <div class="rounded-xl border border-gray-200 bg-gray-50/60 p-5">
          <div class="flex items-start justify-between gap-6">
            <div class="flex-1 space-y-1">
              <label for="page-toggle-home" class="text-sm font-semibold text-gray-900 cursor-pointer block">
                Hide Home Page / Redirect to Shop
              </label>
              <p class="text-xs text-gray-500 leading-relaxed">
                When enabled, visitors navigating to your root domain will open directly on the <code class="bg-gray-200 px-1.5 py-0.5 rounded text-gray-800 font-mono">/shop</code> page. The root homepage card will also be hidden from your pages list.
              </p>
            </div>
            <div class="flex items-center shrink-0 pt-0.5">
              <input
                id="page-toggle-home"
                type="checkbox"
                :checked="draftConfig.isShopAsHomePage"
                class="h-6 w-6 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                @change="handleShopToggle"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Card 2: Theme Brand Colors -->
      <div class="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
        <div class="mb-5">
          <h2 class="text-lg font-bold text-gray-900">Theme Brand Colors</h2>
          <p class="text-xs text-gray-500">Customize primary and secondary colors across your store components</p>
        </div>

        <div class="space-y-6">
          <!-- Primary CTA -->
          <div class="rounded-xl border border-gray-100 p-5 bg-gray-50/40">
            <h3 class="text-xs font-bold text-gray-700 uppercase tracking-wider mb-4">Primary CTA Button</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1.5">Background Color</label>
                <div class="flex items-center gap-2.5">
                  <input v-model="draftTheme.primaryCtaBgColor" type="color" aria-label="Primary Background Color" class="h-10 w-10 shrink-0 cursor-pointer rounded-xl border border-gray-300 p-1">
                  <input v-model="draftTheme.primaryCtaBgColor" type="text" spellcheck="false" aria-label="Primary Background Color hex" class="w-full min-w-0 rounded-xl border border-gray-300 py-2 px-3 text-sm font-mono lowercase focus:outline-none focus:ring-1 focus:ring-gray-900">
                </div>
              </div>

              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1.5">Text Color</label>
                <div class="flex items-center gap-2.5">
                  <input v-model="draftTheme.primaryCtaTextColor" type="color" aria-label="Primary Text Color" class="h-10 w-10 shrink-0 cursor-pointer rounded-xl border border-gray-300 p-1">
                  <input v-model="draftTheme.primaryCtaTextColor" type="text" spellcheck="false" aria-label="Primary Text Color hex" class="w-full min-w-0 rounded-xl border border-gray-300 py-2 px-3 text-sm font-mono lowercase focus:outline-none focus:ring-1 focus:ring-gray-900">
                </div>
              </div>

              <div class="flex flex-col justify-end">
                <span class="block text-xs font-medium text-gray-400 mb-1.5">Live Preview</span>
                <span
                  class="h-10 rounded-xl px-5 text-sm font-semibold flex items-center justify-center shadow-xs transition-colors"
                  :style="{ background: draftTheme.primaryCtaBgColor, color: draftTheme.primaryCtaTextColor }"
                >
                  Add to Cart
                </span>
              </div>
            </div>
          </div>

          <!-- Secondary CTA -->
          <div class="rounded-xl border border-gray-100 p-5 bg-gray-50/40">
            <h3 class="text-xs font-bold text-gray-700 uppercase tracking-wider mb-4">Secondary CTA Button</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1.5">Background Color</label>
                <div class="flex items-center gap-2.5">
                  <input v-model="draftTheme.secondaryCtaBgColor" type="color" aria-label="Secondary Background Color" class="h-10 w-10 shrink-0 cursor-pointer rounded-xl border border-gray-300 p-1">
                  <input v-model="draftTheme.secondaryCtaBgColor" type="text" spellcheck="false" aria-label="Secondary Background Color hex" class="w-full min-w-0 rounded-xl border border-gray-300 py-2 px-3 text-sm font-mono lowercase focus:outline-none focus:ring-1 focus:ring-gray-900">
                </div>
              </div>

              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1.5">Text Color</label>
                <div class="flex items-center gap-2.5">
                  <input v-model="draftTheme.secondaryCtaTextColor" type="color" aria-label="Secondary Text Color" class="h-10 w-10 shrink-0 cursor-pointer rounded-xl border border-gray-300 p-1">
                  <input v-model="draftTheme.secondaryCtaTextColor" type="text" spellcheck="false" aria-label="Secondary Text Color hex" class="w-full min-w-0 rounded-xl border border-gray-300 py-2 px-3 text-sm font-mono lowercase focus:outline-none focus:ring-1 focus:ring-gray-900">
                </div>
              </div>

              <div class="flex flex-col justify-end">
                <span class="block text-xs font-medium text-gray-400 mb-1.5">Live Preview</span>
                <span
                  class="h-10 rounded-xl px-5 text-sm font-semibold flex items-center justify-center shadow-xs transition-colors"
                  :style="{ background: draftTheme.secondaryCtaBgColor, color: draftTheme.secondaryCtaTextColor }"
                >
                  View Product
                </span>
              </div>
            </div>
          </div>

          <!-- Text & Headings -->
          <div class="rounded-xl border border-gray-100 p-5 bg-gray-50/40">
            <h3 class="text-xs font-bold text-gray-700 uppercase tracking-wider mb-4">Text & Headings</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1.5">Primary Text (Headings)</label>
                <div class="flex items-center gap-2.5">
                  <input v-model="draftTheme.primaryTextColor" type="color" aria-label="Primary Text Color" class="h-10 w-10 shrink-0 cursor-pointer rounded-xl border border-gray-300 p-1">
                  <input v-model="draftTheme.primaryTextColor" type="text" spellcheck="false" aria-label="Primary Text Color hex" class="w-full min-w-0 rounded-xl border border-gray-300 py-2 px-3 text-sm font-mono lowercase focus:outline-none focus:ring-1 focus:ring-gray-900">
                </div>
              </div>

              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1.5">Secondary Text (Subheadings)</label>
                <div class="flex items-center gap-2.5">
                  <input v-model="draftTheme.secondaryTextColor" type="color" aria-label="Secondary Text Color" class="h-10 w-10 shrink-0 cursor-pointer rounded-xl border border-gray-300 p-1">
                  <input v-model="draftTheme.secondaryTextColor" type="text" spellcheck="false" aria-label="Secondary Text Color hex" class="w-full min-w-0 rounded-xl border border-gray-300 py-2 px-3 text-sm font-mono lowercase focus:outline-none focus:ring-1 focus:ring-gray-900">
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
