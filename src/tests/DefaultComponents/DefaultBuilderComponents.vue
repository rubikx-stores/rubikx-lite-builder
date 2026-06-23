<script setup lang="ts">
import { ref, computed } from 'vue'
import componentHelpers from '../../utils/html-elements/componentHelpers'
import components from '../../utils/html-elements/component'
import themes from '../../utils/html-elements/themes'
import { usePageBuilderModal } from '../../composables/usePageBuilderModal'
import type { ComponentObject } from '../../types'
import { getPageBuilder } from '../../composables/builderInstance'
import { useTranslations } from '../../composables/useTranslations'

const { translate } = useTranslations()

const pageBuilderService = getPageBuilder()

defineProps({
  customMediaComponent: {
    type: Object,
    default: null,
  },
})

const isLoading = ref(false)

const selectedThemeSelection = ref('Components')

const componentOrThemes = computed(() => {
  return ['Components', 'Themes']
})
const selectedCategory = ref('All')

const categories = computed(() => {
  const allCategories = components[0].components.data.map((comp) => comp.category)
  return ['All', ...new Set(allCategories)]
})

const filteredComponents = computed(() => {
  if (selectedCategory.value === 'All') {
    return components[0].components.data
  }
  return components[0].components.data.filter((comp) => comp.category === selectedCategory.value)
})

const selectedThemeCategory = ref('All')

const themeCategories = computed(() => {
  const allCategories = themes[0].themes.data.map((comp) => comp.category)
  return ['All', ...new Set(allCategories)]
})

const filteredThemes = computed(() => {
  if (selectedThemeCategory.value === 'All') {
    return themes[0].themes.data
  }
  return themes[0].themes.data.filter((comp) => comp.category === selectedThemeCategory.value)
})

// Get modal close function
const { closeAddComponentModal } = usePageBuilderModal()

// Super simple component addition with professional modal closing!
const handleDropTheme = async function (themeHtml: string) {
  isLoading.value = true

  // Translate all occurrences of hardcoded strings in the theme HTML
  const translatedThemeHtml = themeHtml
    .replace(/Layouts and visual\./g, translate('Layouts and visual.'))
    .replace(
      /Start customizing by editing this default text directly in the editor\./g,
      translate('Start customizing by editing this default text directly in the editor.'),
    )

  await pageBuilderService.addTheme(translatedThemeHtml)
  closeAddComponentModal()
  isLoading.value = false
}

// Super simple component addition with professional modal closing!
const handleDropComponent = async function (componentObject: ComponentObject) {
  isLoading.value = true
  // Translate all occurrences of the hardcoded strings in the html_code
  const translatedHtmlCode = componentObject.html_code
    .replace(/Layouts and visual\./g, translate('Layouts and visual.'))
    .replace(
      /Start customizing by editing this default text directly in the editor\./g,
      translate('Start customizing by editing this default text directly in the editor.'),
    )

  // Create a new component object with the translated html_code and title
  const translatedComponentObject = {
    ...componentObject,
    html_code: translatedHtmlCode,
    title: componentObject.title,
  }

  await pageBuilderService.addComponent(translatedComponentObject)
  closeAddComponentModal()
  isLoading.value = false
}

// Helper function to convert ComponentData to ComponentObject
const convertToComponentObject = function (comp: any): ComponentObject {
  return {
    id: null, // Generate ID when needed in PageBuilderClass
    html_code: comp.html_code,
    title: comp.title,
  }
}
</script>

<style scoped>
/* Add any additional styling if needed */
.category-button {
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  padding: 8px 16px;
  margin: 4px;
  cursor: pointer;
  border-radius: 4px;
}
.category-button.active {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}
</style>

<template>
  <div>
    <template v-if="isLoading">
      <div class="min-h-[90vh] h-[90vh]">
        <div class="flex items-center justify-center">
          <div
            class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
          >
            <span
              class="!absolute !m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
              >{{ translate('Loading...') }}</span
            >
          </div>
        </div>
      </div>
    </template>
    <div v-if="!isLoading">
      <div
        class="mb-4 flex jusitify-left items-center gap-2 border-0 border-solid border-b border-gray-200 pb-4 overflow-auto"
      >
        <button
          v-for="category in componentOrThemes"
          :key="category"
          @click="selectedThemeSelection = category"
          class="pbx-mySecondaryButton text-xs px-4"
          :class="[
            selectedThemeSelection === category
              ? 'bg-myPrimaryLinkColor text-white hover:bg-myPrimaryLinkColor hover:text-white'
              : 'hover:bg-myPrimaryLinkColor hover:text-white',
          ]"
        >
          <span>
            <svg
              fill="currentColor"
              height="22"
              viewBox="0 0 22 22"
              width="22"
              xmlns="http://www.w3.org/2000/svg"
              class="catalog-gy660l"
            >
              <path
                d="M4 7.23V4h3.23v3.23H4zM9.385 7.23V4h3.23v3.23h-3.23zM14.77 4v3.23H18V4h-3.23zM4 12.615v-3.23h3.23v3.23H4zM9.385 9.385v3.23h3.23v-3.23h-3.23zM14.77 12.615v-3.23H18v3.23h-3.23zM4 14.77V18h3.23v-3.23H4zM9.385 18v-3.23h3.23V18h-3.23zM14.77 14.77V18H18v-3.23h-3.23z"
              ></path>
            </svg>
          </span>
          <span>
            {{ translate(category) }}
          </span>
        </button>
      </div>

      <!-- theme is selected start -->
      <template v-if="selectedThemeSelection === 'Themes'">
        <div class="mb-8">
          <h3 class="pbx-myQuaternaryHeader mb-4">{{ translate('Themes') }}</h3>
          <div
            class="mb-4 flex jusitify-left items-center gap-2 border-0 border-solid border-b border-gray-200 pb-4 overflow-auto"
          >
            <button
              v-for="category in themeCategories"
              :key="category"
              @click="selectedThemeCategory = category"
              class="pbx-mySecondaryButton text-xs px-4"
              :class="[
                selectedThemeCategory === category
                  ? 'bg-myPrimaryLinkColor text-white hover:bg-myPrimaryLinkColor hover:text-white'
                  : 'hover:bg-myPrimaryLinkColor hover:text-white',
              ]"
            >
              {{ translate(category) }}
            </button>
          </div>

          <div class="min-h-[96rem]">
            <div
              class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pb-4"
            >
              <div
                v-for="theme in filteredThemes"
                :key="theme.title"
                class="border-solid border border-gray-400 overflow-hidden hover:border-myPrimaryLinkColor duration-100 cursor-pointer max-h-[30rem]"
                @click="handleDropTheme(theme.html_code)"
              >
                <div
                  class="overflow-hidden whitespace-pre-line flex-1 h-auto border-0 border-solid border-b border-gray-200 py-2 px-2"
                >
                  <!-- Use SVG preview instead of external images -->
                  <div
                    class="w-64 h-96 object-cover cursor-pointer bg-white mx-auto flex items-center justify-center pbx-theme-cover"
                    v-html="theme.cover_image"
                  ></div>
                </div>
                <div class="p-3">
                  <h4 class="pbx-myPrimaryParagraph text-sm font-normal">
                    {{ translate(theme.title) }}
                  </h4>
                  <div class="pbx-myPrimaryParagraph text-xs font-normal pt-2">
                    {{ translate('Click to add theme') }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
      <!-- theme is selected end -->

      <template v-if="selectedThemeSelection === 'Components'">
        <!-- Helper Components Section -->
        <div class="mb-8">
          <h3 class="pbx-myQuaternaryHeader mb-4">{{ translate('Helper Components') }}</h3>
          <div
            class="px-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            <div
              v-for="helper in componentHelpers"
              :key="helper.title"
              class="border-solid border border-gray-400 overflow-hidden hover:border-myPrimaryLinkColor duration-100 cursor-pointer max-h-96 p-4"
              @click="handleDropComponent(helper)"
            >
              <div
                class="max-h-72 cursor-pointer object-contain bg-white mx-auto"
              >
                <div v-if="false" class="mr-2" v-html="helper.icon"></div>
                <h4 class="pbx-myPrimaryParagraph text-base font-medium">
                  {{ translate(helper.title) }}
                </h4>
              </div>
              <div class="pbx-myPrimaryParagraph text-xs font-normal pt-2">
                {{ translate('Click to add') }} {{ helper.title.toLowerCase() }}
                {{ translate('component') }}
              </div>
            </div>
          </div>
        </div>

        <!-- Regular Components Section -->
        <div class="px-2">
          <h3 class="pbx-myQuaternaryHeader mb-4">{{ translate('Layout Components') }}</h3>
          <div
            class="mb-4 flex jusitify-left items-center gap-2 border-0 border-solid border-b border-gray-200 pb-4 overflow-auto"
          >
            <button
              v-for="category in categories"
              :key="category"
              @click="selectedCategory = category"
              class="pbx-mySecondaryButton text-xs px-4"
              :class="[
                selectedCategory === category
                  ? 'bg-myPrimaryLinkColor text-white hover:bg-myPrimaryLinkColor hover:text-white'
                  : 'hover:bg-myPrimaryLinkColor hover:text-white',
              ]"
            >
              {{ translate(category) }}
            </button>
          </div>
          <div class="min-h-[96rem]">
            <div
              class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pb-4"
            >
              <div
                v-for="comp in filteredComponents"
                :key="comp.title"
                class="border-solid border border-gray-400 overflow-hidden hover:border-myPrimaryLinkColor duration-100 cursor-pointer max-h-96"
                @click="handleDropComponent(convertToComponentObject(comp))"
              >
                <div
                  class="overflow-hidden whitespace-pre-line flex-1 h-auto border-0 border-solid border-b border-gray-200 py-2 px-2"
                >
                  <!-- Use SVG preview instead of external images -->
                  <div
                    class="w-64 h-64 object-cover cursor-pointer bg-white mx-auto flex items-center justify-center pbx-theme-cover"
                    v-html="comp.cover_image"
                  ></div>
                </div>
                <div class="p-3">
                  <h4 class="pbx-myPrimaryParagraph text-sm font-normal">
                    {{ translate(comp.title) }}
                  </h4>
                  <div class="pbx-myPrimaryParagraph text-xs font-normal pt-2">
                    {{ translate('Click to add component') }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
      <div>
        <button class="sr-only">Focusable fallback</button>
      </div>
    </div>
  </div>
</template>
