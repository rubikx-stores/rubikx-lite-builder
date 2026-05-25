<script setup lang="ts">
import componentHelpers from '#lib/componentHelpers'
import componentData from '#lib/component'
import themesData from '#lib/themes'
import { getPageBuilder, usePageBuilderModal } from '@myissue/vue-website-page-builder'

const { themeRegistry, applyTheme } = useThemes()
const { closeAddComponentModal } = usePageBuilderModal()

const isLoading = ref(false)
const selectedTab = ref<'Components' | 'Themes'>('Components')
const selectedCategory = ref('All')
const selectedThemeCategory = ref('All')

const categories = computed(() => {
  const all = componentData[0]?.components?.data?.map((c) => c.category) ?? []
  return ['All', ...new Set(all)]
})

const filteredComponents = computed(() => {
  const data = componentData[0]?.components?.data ?? []
  return selectedCategory.value === 'All'
    ? data
    : data.filter((c) => c.category === selectedCategory.value)
})

const themeCategories = computed(() => {
  const libCats = themesData[0]?.themes?.data?.map((t) => t.category) ?? []
  return ['All', 'General', ...new Set(libCats)]
})

const filteredLibThemes = computed(() => {
  const data = themesData[0]?.themes?.data ?? []
  if (selectedThemeCategory.value === 'All' || selectedThemeCategory.value === 'General') return data
  return data.filter((t) => t.category === selectedThemeCategory.value)
})

async function handleDropComponent(comp: { id: string | number | null; html_code: string; title: string }) {
  isLoading.value = true
  await getPageBuilder().addComponent(comp)
  closeAddComponentModal()
  isLoading.value = false
}

async function handleDropLibTheme(html_code: string) {
  isLoading.value = true
  const { getPageBuilder: getPB } = await import('@myissue/vue-website-page-builder')
  await (getPB() as any).addTheme(html_code)
  closeAddComponentModal()
  isLoading.value = false
}

async function handleApplyTheme(themeId: string) {
  isLoading.value = true
  await applyTheme(themeId)
  closeAddComponentModal()
  isLoading.value = false
}
</script>

<template>
  <div>
    <template v-if="isLoading">
      <div class="pbx-min-h-[90vh] pbx-h-[90vh]">
        <div class="pbx-flex pbx-items-center pbx-justify-center">
          <div
            class="pbx-inline-block pbx-h-8 pbx-w-8 pbx-animate-spin pbx-rounded-full pbx-border-4 pbx-border-solid pbx-border-current pbx-border-r-transparent pbx-align-[-0.125em] motion-reduce:pbx-animate-[spin_1.5s_linear_infinite]"
          >
            <span
              class="!pbx-absolute !pbx-m-px !pbx-h-px !pbx-w-px !pbx-overflow-hidden !pbx-whitespace-nowrap !pbx-border-0 !pbx-p-0 !pbx-[clip:rect(0,0,0,0)]"
            >Loading...</span>
          </div>
        </div>
      </div>
    </template>

    <div v-if="!isLoading">
      <!-- Tab selector -->
      <div
        class="pbx-mb-4 pbx-flex pbx-jusitify-left pbx-items-center pbx-gap-2 pbx-border-0 pbx-border-solid pbx-border-b pbx-border-gray-200 pbx-pb-4 pbx-overflow-auto"
      >
        <button
          v-for="tab in ['Components', 'Themes']"
          :key="tab"
          class="pbx-mySecondaryButton pbx-text-xs pbx-px-4"
          :class="[
            selectedTab === tab
              ? 'pbx-bg-myPrimaryLinkColor pbx-text-white hover:pbx-bg-myPrimaryLinkColor hover:pbx-text-white'
              : 'hover:pbx-bg-myPrimaryLinkColor hover:pbx-text-white',
          ]"
          @click="selectedTab = tab as 'Components' | 'Themes'"
        >
          <span>
            <svg fill="currentColor" height="22" viewBox="0 0 22 22" width="22" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 7.23V4h3.23v3.23H4zM9.385 7.23V4h3.23v3.23h-3.23zM14.77 4v3.23H18V4h-3.23zM4 12.615v-3.23h3.23v3.23H4zM9.385 9.385v3.23h3.23v-3.23h-3.23zM14.77 12.615v-3.23H18v3.23h-3.23zM4 14.77V18h3.23v-3.23H4zM9.385 18v-3.23h3.23V18h-3.23zM14.77 14.77V18H18v-3.23h-3.23z" />
            </svg>
          </span>
          <span>{{ tab }}</span>
        </button>
      </div>

      <!-- ── Themes Tab ── -->
      <template v-if="selectedTab === 'Themes'">
        <div class="pbx-mb-8">
          <h3 class="pbx-myQuaternaryHeader pbx-mb-4">Themes</h3>

          <!-- Category filter — General always first -->
          <div
            class="pbx-mb-4 pbx-flex pbx-jusitify-left pbx-items-center pbx-gap-2 pbx-border-0 pbx-border-solid pbx-border-b pbx-border-gray-200 pbx-pb-4 pbx-overflow-auto"
          >
            <button
              v-for="cat in themeCategories"
              :key="cat"
              class="pbx-mySecondaryButton pbx-text-xs pbx-px-4"
              :class="[
                selectedThemeCategory === cat
                  ? 'pbx-bg-myPrimaryLinkColor pbx-text-white hover:pbx-bg-myPrimaryLinkColor hover:pbx-text-white'
                  : 'hover:pbx-bg-myPrimaryLinkColor hover:pbx-text-white',
              ]"
              @click="selectedThemeCategory = cat"
            >
              {{ cat }}
            </button>
          </div>

          <div class="pbx-min-h-[96rem]">
            <div class="pbx-grid pbx-grid-cols-1 sm:pbx-grid-cols-2 md:pbx-grid-cols-3 pbx-gap-4 pbx-pb-4">

              <!-- Custom (General) themes — shown when General or All is selected -->
              <template v-if="selectedThemeCategory === 'General' || selectedThemeCategory === 'All'">
                <div
                  v-for="(theme, id) in themeRegistry"
                  :key="id"
                  class="pbx-border-solid pbx-border pbx-border-gray-400 pbx-overflow-hidden hover:pbx-border-myPrimaryLinkColor pbx-duration-100 pbx-cursor-pointer pbx-max-h-[30rem]"
                  @click="handleApplyTheme(String(id))"
                >
                  <div
                    class="pbx-overflow-hidden pbx-whitespace-pre-line pbx-flex-1 pbx-h-auto pbx-border-0 pbx-border-solid pbx-border-b pbx-border-gray-200 pbx-py-2 pbx-px-2"
                  >
                    <div
                      class="pbx-w-64 pbx-h-96 pbx-object-cover pbx-cursor-pointer pbx-bg-white pbx-mx-auto pbx-flex pbx-items-center pbx-justify-center pbx-theme-cover"
                      v-html="theme.meta.cover_image"
                    />
                  </div>
                  <div class="pbx-p-3">
                    <h4 class="pbx-myPrimaryParagraph pbx-text-sm pbx-font-normal">{{ theme.meta.name }}</h4>
                    <div class="pbx-myPrimaryParagraph pbx-text-xs pbx-font-normal pbx-pt-2">{{ theme.meta.description }}</div>
                  </div>
                </div>
              </template>

              <!-- Library themes (Article, Marketing, etc.) — shown when not General-only -->
              <template v-if="selectedThemeCategory !== 'General'">
                <div
                  v-for="theme in filteredLibThemes"
                  :key="theme.title"
                  class="pbx-border-solid pbx-border pbx-border-gray-400 pbx-overflow-hidden hover:pbx-border-myPrimaryLinkColor pbx-duration-100 pbx-cursor-pointer pbx-max-h-[30rem]"
                  @click="handleDropLibTheme(theme.html_code)"
                >
                  <div
                    class="pbx-overflow-hidden pbx-whitespace-pre-line pbx-flex-1 pbx-h-auto pbx-border-0 pbx-border-solid pbx-border-b pbx-border-gray-200 pbx-py-2 pbx-px-2"
                  >
                    <div
                      class="pbx-w-64 pbx-h-96 pbx-object-cover pbx-cursor-pointer pbx-bg-white pbx-mx-auto pbx-flex pbx-items-center pbx-justify-center pbx-theme-cover"
                      v-html="theme.cover_image"
                    />
                  </div>
                  <div class="pbx-p-3">
                    <h4 class="pbx-myPrimaryParagraph pbx-text-sm pbx-font-normal">{{ theme.title }}</h4>
                    <div class="pbx-myPrimaryParagraph pbx-text-xs pbx-font-normal pbx-pt-2">Click to add theme</div>
                  </div>
                </div>
              </template>

            </div>
          </div>
        </div>
      </template>

      <!-- ── Components Tab ── -->
      <template v-if="selectedTab === 'Components'">
        <!-- Helper Components -->
        <div class="pbx-mb-8">
          <h3 class="pbx-myQuaternaryHeader pbx-mb-4">Helper Components</h3>
          <div class="pbx-px-2 pbx-grid pbx-grid-cols-1 sm:pbx-grid-cols-2 md:pbx-grid-cols-3 lg:pbx-grid-cols-4 pbx-gap-4">
            <div
              v-for="helper in componentHelpers"
              :key="helper.title"
              class="pbx-border-solid pbx-border pbx-border-gray-400 pbx-overflow-hidden hover:pbx-border-myPrimaryLinkColor pbx-duration-100 pbx-cursor-pointer pbx-max-h-96 pbx-p-4"
              @click="handleDropComponent({ id: null, html_code: helper.html_code, title: helper.title })"
            >
              <div class="pbx-max-h-72 pbx-cursor-pointer pbx-object-contain pbx-bg-white pbx-mx-auto">
                <h4 class="pbx-myPrimaryParagraph pbx-text-base pbx-font-medium">{{ helper.title }}</h4>
              </div>
              <div class="pbx-myPrimaryParagraph pbx-text-xs pbx-font-normal pbx-pt-2">
                Click to add {{ helper.title.toLowerCase() }} component
              </div>
            </div>
          </div>
        </div>

        <!-- Layout Components -->
        <div class="pbx-px-2">
          <h3 class="pbx-myQuaternaryHeader pbx-mb-4">Layout Components</h3>
          <div
            class="pbx-mb-4 pbx-flex pbx-jusitify-left pbx-items-center pbx-gap-2 pbx-border-0 pbx-border-solid pbx-border-b pbx-border-gray-200 pbx-pb-4 pbx-overflow-auto"
          >
            <button
              v-for="cat in categories"
              :key="cat"
              class="pbx-mySecondaryButton pbx-text-xs pbx-px-4"
              :class="[
                selectedCategory === cat
                  ? 'pbx-bg-myPrimaryLinkColor pbx-text-white hover:pbx-bg-myPrimaryLinkColor hover:pbx-text-white'
                  : 'hover:pbx-bg-myPrimaryLinkColor hover:pbx-text-white',
              ]"
              @click="selectedCategory = cat"
            >
              {{ cat }}
            </button>
          </div>
          <div class="pbx-min-h-[96rem]">
            <div class="pbx-grid pbx-grid-cols-1 sm:pbx-grid-cols-2 md:pbx-grid-cols-3 pbx-gap-4 pbx-pb-4">
              <div
                v-for="comp in filteredComponents"
                :key="comp.title"
                class="pbx-border-solid pbx-border pbx-border-gray-400 pbx-overflow-hidden hover:pbx-border-myPrimaryLinkColor pbx-duration-100 pbx-cursor-pointer pbx-max-h-96"
                @click="handleDropComponent({ id: null, html_code: comp.html_code, title: comp.title })"
              >
                <div
                  class="pbx-overflow-hidden pbx-whitespace-pre-line pbx-flex-1 pbx-h-auto pbx-border-0 pbx-border-solid pbx-border-b pbx-border-gray-200 pbx-py-2 pbx-px-2"
                >
                  <div
                    class="pbx-w-64 pbx-h-64 pbx-object-cover pbx-cursor-pointer pbx-bg-white pbx-mx-auto pbx-flex pbx-items-center pbx-justify-center pbx-theme-cover"
                    v-html="comp.cover_image"
                  />
                </div>
                <div class="pbx-p-3">
                  <h4 class="pbx-myPrimaryParagraph pbx-text-sm pbx-font-normal">{{ comp.title }}</h4>
                  <div class="pbx-myPrimaryParagraph pbx-text-xs pbx-font-normal pbx-pt-2">Click to add component</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <div>
        <button class="pbx-sr-only">Focusable fallback</button>
      </div>
    </div>
  </div>
</template>
