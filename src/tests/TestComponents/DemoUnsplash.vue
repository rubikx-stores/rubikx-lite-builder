<script setup>
import { ref, onMounted } from 'vue'
const unsplashKey = import.meta.env.VITE_UNSPLASH_KEY
import { usePageBuilderModal } from '../../composables/usePageBuilderModal'
import { delay } from '../../composables/delay'
import { preloadImage } from '../../composables/preloadImage'
import { getPageBuilder } from '../../composables/builderInstance'
import { useTranslations } from '../../composables/useTranslations'
const { translate } = useTranslations()

const pageBuilderService = getPageBuilder()

const { closeMediaLibraryModal } = usePageBuilderModal()

const getIsLoading = ref(false)
const getIsLoadingImage = ref(false)
const getSearchTerm = ref('')
const getCurrentPageNumber = ref(1)
const getOrientationValue = ref('')
const getApplyImageToSelection = ref('')
const getCurrentUser = ref('')

const getUnsplashImages = ref([])

const fetchUnsplash = async function () {
  getIsLoading.value = true
  await delay(300)
  localStorage.setItem('unsplash-query', getSearchTerm.value)
  localStorage.setItem('unsplash-page', getCurrentPageNumber.value)

  if (
    getUnsplashImages.value &&
    Array.isArray(getUnsplashImages.value.results) &&
    getUnsplashImages.value.results.length === 0
  ) {
    getCurrentPageNumber.value = 1
  }

  const orientationParam = getOrientationValue.value
    ? `&orientation=${getOrientationValue.value}`
    : ''

  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?page=${getCurrentPageNumber.value}&per_page=24&query=${getSearchTerm.value || 'kinfolk'}${orientationParam}`,
      {
        headers: {
          'Accept-Version': 'v1',
          Authorization: `Client-ID ${unsplashKey}`,
        },
      },
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const images = await response.json()
    getUnsplashImages.value = images
    getIsLoading.value = false
  } catch (error) {
    console.error('Error fetching Unsplash images:', error)
  } finally {
    getIsLoading.value = false
  }
}

const handleImageClick = async function (data) {
  getIsLoadingImage.value = true

  if (data.url) {
    await preloadImage(data.url)
  }

  await delay(100)
  getApplyImageToSelection.value = data.url || ''

  getIsLoadingImage.value = false
}

const searchByOrientation = function (orientationParameter) {
  // check if search term length is more than 0
  if (getOrientationValue.value !== orientationParameter) {
    getOrientationValue.value = orientationParameter
    getCurrentPageNumber.value = 1
    fetchUnsplash()
  }
}
//
// load images for previous page
const previousPage = function () {
  localStorage.setItem('unsplash-page', getCurrentPageNumber.value)
  fetchUnsplash()
}

// load images for next page
const nextPage = async function () {
  localStorage.setItem('unsplash-page', getCurrentPageNumber.value)
  fetchUnsplash()
}

const isLoading = ref(false)

const applySelectedImage = async function (imageURL) {
  isLoading.value = true
  await pageBuilderService.applySelectedImage({
    src: `${imageURL}`,
  })

  closeMediaLibraryModal()
  isLoading.value = false
}

// on mounted
onMounted(async () => {
  getSearchTerm.value = localStorage.getItem('unsplash-query') || 'kinfolk'
  getCurrentPageNumber.value = Number(localStorage.getItem('unsplash-page')) || 1

  await fetchUnsplash()
})
</script>

<template>
  <div>
    <div v-if="getIsLoading || isLoading" class="min-h-[98vh] h-[98vh]">
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
    <div v-if="!isLoading && !getIsLoading">
      <form
        @submit.prevent="
          () => {
            getCurrentPageNumber = 1
            fetchUnsplash()
          }
        "
      >
        <div class="mysearchBarWithOptions">
          <div class="relative w-full flex gap-2">
            <input
              type="search"
              id="search_query"
              v-model="getSearchTerm"
              class="pbx-myPrimarySearchInput w-full pl-10 border-0"
              autocomplete="off"
              :placeholder="translate('Search...')"
            />
            <div
              class="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none"
            >
              <span class="material-symbols-outlined"> search </span>
            </div>
          </div>

          <button
            @click="
              () => {
                getCurrentPageNumber = 1
                fetchUnsplash()
              }
            "
            type="submit"
            class="pbx-myPrimarySearchButton"
          >
            {{ translate('Search') }}
          </button>
        </div>
      </form>
      <div class="mt-2">
        <div
          v-if="getUnsplashImages && getUnsplashImages.results"
          class="flex lg:justify-between justify-end items-center gap-2 py-2 px-2 mb-3 rounded-full border-solid border border-gray-200 shadow-sm"
        >
          <div class="lg:flex hidden justify-left items-center gap-2">
            <button
              @click="searchByOrientation('landscape')"
              type="button"
              class="pbx-myPrimaryTag cursor-pointer"
              :class="{
                'bg-myPrimaryBrandColor text-white': getOrientationValue === 'landscape',
                '': getOrientationValue !== 'landscape',
              }"
            >
              {{ translate('Landscape') }}
            </button>
            <button
              @click="searchByOrientation('portrait')"
              type="button"
              class="pbx-myPrimaryTag cursor-pointer"
              :class="{
                'bg-myPrimaryBrandColor text-white': getOrientationValue === 'portrait',
                '': getOrientationValue !== 'portrait',
              }"
            >
              {{ translate('Portrait') }}
            </button>
            <button
              @click="searchByOrientation('squarish')"
              type="button"
              class="pbx-myPrimaryTag cursor-pointer"
              :class="{
                'bg-myPrimaryBrandColor text-white': getOrientationValue === 'squarish',
                '': getOrientationValue !== 'squarish',
              }"
            >
              {{ translate('Squarish') }}
            </button>

            <svg
              @click="searchByOrientation(null)"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2"
              stroke="currentColor"
              class="w-4 h-4 cursor-pointer"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>

          <nav
            class="flex items-center gap-2 justify-start"
            aria-label="Pagination"
          >
            <p class="pbx-myPrimaryParagraph text-xs italic">
              {{ translate('Total pages') }} {{ getUnsplashImages.total_pages }}
            </p>
            <p class="pbx-myPrimaryParagraph text-xs italic">
              {{ translate('Images') }} {{ getUnsplashImages.total }}
            </p>
            <div
              class="flex flex-1 justify-between sm:justify-end items-center gap-2"
            >
              <span
                v-if="Number(getCurrentPageNumber) !== 1"
                class="pbx-myPrimaryParagraph text-xs italic pr-2 pl-1 cursor-pointer underline"
                @click="nextPage(Number((getCurrentPageNumber = 1)))"
              >
                {{ translate('First page') }}
              </span>
            </div>
            <button
              v-if="Number(getCurrentPageNumber) > 1"
              :disabled="Number(getCurrentPageNumber) < 1"
              class="pbx-myPrimaryTag cursor-pointer"
              @click="previousPage(Number(getCurrentPageNumber--))"
            >
              {{
                `${translate('Prev')} ${Number(getCurrentPageNumber) > 0 ? Number(getCurrentPageNumber) - 1 : Number(getCurrentPageNumber) - 1}`
              }}
            </button>

            <span class="pbx-myPrimaryTag py-2.5 px-4">
              {{ Number(getCurrentPageNumber) }}
            </span>
            <button
              :disabled="Number(getCurrentPageNumber) >= getUnsplashImages.total_pages"
              class="pbx-myPrimaryTag cursor-pointer"
              :class="{
                'opacity-50': Number(getCurrentPageNumber) >= getUnsplashImages.total_pages,
              }"
              @click="nextPage(Number(getCurrentPageNumber++))"
            >
              {{
                `${translate('Next')} ${Number(getCurrentPageNumber) > 0 ? Number(getCurrentPageNumber) + 1 : Number(getCurrentPageNumber) + 1}`
              }}
            </button>
          </nav>
        </div>

        <div class="min-h-full max-h-full flex gap-6">
          <div class="md:w-9/12 w-6/12 pr-1 rounded-lg overflow-y-auto">
            <div v-if="getUnsplashImages && getUnsplashImages.results">
              <div
                v-if="!getIsLoading"
                class="grid lg:grid-cols-6 md:grid-cols-4 sm:grid-cols-4 grid-cols-1 gap-2"
              >
                <div
                  v-for="image in getUnsplashImages.results"
                  :key="image.id"
                  @click="handleImageClick({ url: image.urls.regular, user: image.user.name })"
                  class="border-solid border border-gray-200 my-2 px-2 p-2 cursor-pointer"
                >
                  <img
                    :alt="image.user.name"
                    class="group block w-full overflow-hidden cursor-pointer"
                    :src="image.urls.thumb"
                  />
                  <p class="pbx-myPrimaryParagraph text-xs font-normal mt-2">
                    {{ translate('By:') }} {{ image.user.name }}
                  </p>
                </div>
              </div>
            </div>

            <div
              v-if="
                getUnsplashImages &&
                getUnsplashImages.results &&
                getUnsplashImages.results.length < 1
              "
            >
              <p class="pbx-myPrimaryParagraph py-4 px-4">
                <span v-if="getCurrentPageNumber === 1">
                  {{ translate('We did not find any images. Make a new search.') }}
                </span>
                <span
                  v-if="getCurrentPageNumber > 1"
                  @click="nextPage(1)"
                  class="pbx-myPrimaryLink"
                >
                  {{ translate('No results on current page. Navigate to First Page.') }}
                </span>
              </p>
            </div>
          </div>
          <!-- Sidebar # start -->
          <aside class="md:w-3/12 w-6/12 overflow-y-auto">
            <template v-if="getIsLoadingImage">
              <div class="flex items-center justify-center mt-4">
                <div
                  class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                >
                  <span
                    class="!absolute !m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
                    >{{ translate('Loading...') }}</span
                  >
                </div>
              </div>
            </template>
            <template v-if="getApplyImageToSelection && !getIsLoadingImage">
              <img
                class="mx-auto block w-full object-cover object-center cursor-pointer"
                :src="`${getApplyImageToSelection}`"
                alt="file"
              />
              <div class="md:px-3 px-2">
                <div>
                  <p class="pbx-myPrimaryParagraph font-normal text-gray-900 pt-4">
                    {{ translate('Information') }}
                  </p>
                  <dl
                    class="mt-2 border-t border-b border-gray-200 divide-y divide-gray-200"
                  >
                    <div
                      class="py-3 flex justify-between text-sm font-normal items-center"
                    >
                      <dt class="text-gray-500">{{ translate('From:') }}</dt>
                      <dd class="text-gray-900">Unsplash</dd>
                    </div>
                    <div
                      class="py-3 flex justify-between text-sm font-normal items-center"
                    >
                      <dt class="text-gray-500">{{ translate('By:') }}</dt>
                      <dd class="text-gray-900">{{ getCurrentUser }}</dd>
                    </div>
                  </dl>
                </div>
                <div class="flex justify-end mt-4 w-full">
                  <button
                    v-if="getApplyImageToSelection && typeof getApplyImageToSelection === 'string'"
                    @click="applySelectedImage(getApplyImageToSelection)"
                    class="pbx-myPrimaryButton"
                    type="button"
                  >
                    {{ translate(' Select image') }}
                  </button>
                </div>
              </div>
            </template>
          </aside>
        </div>
        <!-- Sidebar # end -->
      </div>
      <div>
        <button class="sr-only">Focusable fallback</button>
      </div>
    </div>
  </div>
</template>
