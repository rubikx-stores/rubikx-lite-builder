<script setup lang="ts">
import componentHelpers from '#lib/componentHelpers'
import componentData from '#lib/component'
import themesData from '#lib/themes'
import { getPageBuilder, usePageBuilderModal } from '@myissue/vue-website-page-builder'

const activeTab = ref<'components' | 'themes'>('components')
const { themeRegistry, applyTheme } = useThemes()
const { closeAddComponentModal } = usePageBuilderModal()

const componentsByCategory = computed(() => {
  const items = componentData[0]?.components?.data ?? []
  return items.reduce<Record<string, typeof items>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {})
})

const libThemesByCategory = computed(() => {
  const items = themesData[0]?.themes?.data ?? []
  return items.reduce<Record<string, typeof items>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {})
})

function addItem(item: { html_code: string; title: string }) {
  getPageBuilder().addComponent({ id: null, title: item.title, html_code: item.html_code })
  closeAddComponentModal()
}

async function handleTheme(themeId: string) {
  await applyTheme(themeId)
  closeAddComponentModal()
}
</script>

<template>
  <div class="h-full flex flex-col overflow-hidden">
    <!-- Tab bar -->
    <div class="flex shrink-0 border-b border-gray-200 bg-white">
      <button
        class="px-4 py-3 text-sm font-medium transition-colors"
        :class="activeTab === 'components'
          ? 'border-b-2 border-gray-900 text-gray-900'
          : 'text-gray-500 hover:text-gray-700'"
        @click="activeTab = 'components'"
      >
        Components
      </button>
      <button
        class="px-4 py-3 text-sm font-medium transition-colors"
        :class="activeTab === 'themes'
          ? 'border-b-2 border-gray-900 text-gray-900'
          : 'text-gray-500 hover:text-gray-700'"
        @click="activeTab = 'themes'"
      >
        Themes
      </button>
    </div>

    <!-- Scrollable content -->
    <div class="flex-1 overflow-y-auto p-4">

      <!-- ── Components Tab ── -->
      <template v-if="activeTab === 'components'">
        <!-- Helper components -->
        <div class="mb-6">
          <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Helpers</p>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="helper in componentHelpers"
              :key="helper.title"
              class="flex flex-col items-center gap-1 p-2 rounded border border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-colors min-w-[64px]"
              @click="addItem(helper)"
            >
              <span v-html="helper.icon" class="text-gray-600 [&_.material-symbols-outlined]:text-xl [&_.material-symbols-outlined]:leading-none" />
              <span class="text-xs text-gray-600 text-center leading-tight">{{ helper.title }}</span>
            </button>
          </div>
        </div>

        <!-- Component categories -->
        <div v-for="(items, category) in componentsByCategory" :key="category" class="mb-6">
          <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{{ category }}</p>
          <div class="grid grid-cols-2 gap-3">
            <div
              v-for="item in items"
              :key="item.title"
              class="cursor-pointer rounded border border-gray-200 overflow-hidden hover:border-gray-400 transition-colors"
              @click="addItem(item)"
            >
              <div
                v-if="item.cover_image"
                v-html="item.cover_image"
                class="w-full h-28 bg-gray-50 overflow-hidden [&>svg]:w-full [&>svg]:h-full"
              />
              <div class="px-2 py-1.5 text-xs text-gray-700 font-medium truncate">{{ item.title }}</div>
            </div>
          </div>
        </div>
      </template>

      <!-- ── Themes Tab ── -->
      <template v-if="activeTab === 'themes'">
        <!-- General category (custom themes) — always first -->
        <div class="mb-6">
          <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">General</p>
          <div class="grid grid-cols-2 gap-3">
            <div
              v-for="(theme, id) in themeRegistry"
              :key="id"
              class="cursor-pointer rounded border border-gray-200 overflow-hidden hover:border-gray-400 transition-colors"
              @click="handleTheme(String(id))"
            >
              <div
                v-html="theme.meta.cover_image"
                class="w-full h-28 bg-gray-50 overflow-hidden [&>svg]:w-full [&>svg]:h-full"
              />
              <div class="px-2 py-1.5">
                <p class="text-xs font-medium text-gray-900 truncate">{{ theme.meta.name }}</p>
                <p class="text-xs text-gray-400 truncate">{{ theme.meta.description }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Library theme categories (Article, Marketing, etc.) -->
        <div v-for="(items, category) in libThemesByCategory" :key="category" class="mb-6">
          <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{{ category }}</p>
          <div class="grid grid-cols-2 gap-3">
            <div
              v-for="item in items"
              :key="item.title"
              class="cursor-pointer rounded border border-gray-200 overflow-hidden hover:border-gray-400 transition-colors"
              @click="addItem(item)"
            >
              <div
                v-if="item.cover_image"
                v-html="item.cover_image"
                class="w-full h-28 bg-gray-50 overflow-hidden [&>svg]:w-full [&>svg]:h-full"
              />
              <div class="px-2 py-1.5 text-xs text-gray-700 font-medium truncate">{{ item.title }}</div>
            </div>
          </div>
        </div>
      </template>

    </div>
  </div>
</template>
