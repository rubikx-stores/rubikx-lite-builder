<script setup>
import { ref, computed, watch } from 'vue'
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/vue'
import tailwindColors from '../../../../utils/builder/tailwaind-colors'
import { sharedPageBuilderStore } from '../../../../stores/shared-store'
import { getPageBuilder } from '../../../../composables/builderInstance'
import { useTranslations } from '../../../../composables/useTranslations'

const { translate } = useTranslations()

const pageBuilderService = getPageBuilder()

// Use shared store instance
const pageBuilderStateStore = sharedPageBuilderStore

defineProps({
  globalPageLayout: {
    Type: Boolean,
  },
})

const backgroundColor = ref(null)
const getBackgroundColor = computed(() => {
  return pageBuilderStateStore.getBackgroundColor
})

watch(
  getBackgroundColor,
  async (newValue) => {
    backgroundColor.value = newValue
    await pageBuilderService.initializeElementStyles()
  },
  { immediate: true },
)
</script>

<template>
  <Listbox as="div" v-model="backgroundColor">
    <div class="relative">
      <div
        :class="[
          globalPageLayout
            ? 'flex flex-col border-solid border border-gray-400'
            : 'flex gap-2 items-center',
        ]"
      >
        <ListboxButton
          v-if="globalPageLayout"
          class="flex flex-row justify-between items-center pl-3 pr-3 py-5 cursor-pointer duration-200 hover:bg-myPrimaryLightGrayColor bg-white hover:text-black text-black font-sans font-medium border-0"
        >
          <div class="flex justify-start items-center gap-2">
            <div
              class="aspect-square w-6 h-6 border border-gray-600 rounded-sm bg-none border-solid"
              :class="`bg-${backgroundColor?.replace('bg-', '')}`"
            ></div>
            <div>{{ translate('Background Color') }}</div>
          </div>

          <span v-if="globalPageLayout" class="material-symbols-outlined"> chevron_right </span>
        </ListboxButton>

        <ListboxButton
          v-if="!globalPageLayout"
          as="div"
          class="h-10 w-10 cursor-pointer flex items-center justify-center hover:bg-gray-100 aspect-square text-myPrimaryDarkGrayColor bg-gray-100 rounded-xl hover:bg-myPrimaryLinkColor hover:text-white"
        >
          <div class="flex flex-col">
            <div class="flex gap-2 items-center">
              <span>
                <svg
                  fill="currentColor"
                  height="25"
                  viewBox="0 0 22 22"
                  width="26"
                  xmlns="http://www.w3.org/2000/svg"
                  style="display: block"
                >
                  <path
                    clip-rule="evenodd"
                    d="M4 11l8-8 8 8-8 8-8-8zm8-5.172L17.172 11H6.828L12 5.828z"
                    fill-rule="evenodd"
                  ></path>
                  <path
                    d="M3.5 13s-2 2.757-2 4.054c0 1.075.895 1.946 2 1.946s2-.871 2-1.946c0-1.297-2-4.054-2-4.054z"
                  ></path>
                </svg>
              </span>
              <span
                v-if="false"
                class="material-symbols-outlined"
                style="text-shadow: rgb(0 0 0 / 10%) 1.5px 1.5px 0px"
                :class="`text-${backgroundColor?.replace('bg-', '')}`"
              >
                format_color_fill
              </span>
            </div>
          </div>
        </ListboxButton>
      </div>

      <transition
        leave-active-class="transition ease-in duration-100"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <ListboxOptions
          class="pbx-headless-dropdown absolute min-w-[12rem] z-40 mt-1 max-h-56 w-full overflow-auto rounded-md bg-gray-50 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
        >
          <ListboxOption
            as="template"
            v-for="color in tailwindColors.backgroundColorVariables"
            @click="pageBuilderService.handleBackgroundColor(backgroundColor)"
            :key="color"
            :value="color"
            v-slot="{ active, backgroundColor }"
          >
            <li
              :class="[
                active
                  ? 'bg-myPrimaryLinkColor text-white'
                  : 'text-myPrimaryDarkGrayColor',
                'relative cursor-default select-none py-2 pl-3 pr-9',
              ]"
            >
              <div v-if="color === 'none'" class="flex items-center">
                <span class="material-symbols-outlined"> ev_shadow </span>
                <span class="ml-3">{{ translate('Transparent') }}</span>
              </div>
              <div v-if="color !== 'none'" class="flex items-center">
                <div
                  class="aspect-square w-6 h-6 border-solid border border-gray-100 rounded-sm"
                  :class="`bg-${color.replace('bg-', '')}`"
                ></div>
                <span class="ml-3">{{ color }}</span>
              </div>
            </li>
          </ListboxOption>
        </ListboxOptions>
      </transition>
    </div>
  </Listbox>
</template>
