<script setup>
import { ref, computed, watch } from 'vue'
import EditorAccordion from '../EditorAccordion.vue'
import tailwindBorderStyleWidthPlusColor from '../../../../utils/builder/tailwind-border-style-width-color'
import tailwindColors from '../../../../utils/builder/tailwaind-colors'
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/vue'
import { sharedPageBuilderStore } from '../../../../stores/shared-store'
import { getPageBuilder } from '../../../../composables/builderInstance'
import { useTranslations } from '../../../../composables/useTranslations'

const { translate } = useTranslations()
const pageBuilderService = getPageBuilder()

// Use shared store instance
const pageBuilderStateStore = sharedPageBuilderStore

const borderStyle = ref(null)
const borderWidth = ref(null)
const borderColor = ref(null)
const getBorderStyle = computed(() => {
  return pageBuilderStateStore.getBorderStyle
})
const getBorderWidth = computed(() => {
  return pageBuilderStateStore.getBorderWidth
})
const getBorderColor = computed(() => {
  return pageBuilderStateStore.getBorderColor
})

watch(
  getBorderStyle,
  async (newValue) => {
    borderStyle.value = newValue
    await pageBuilderService.initializeElementStyles()
  },
  { immediate: true },
)
watch(
  getBorderWidth,
  async (newValue) => {
    borderWidth.value = newValue
    await pageBuilderService.initializeElementStyles()
  },
  { immediate: true },
)
watch(
  getBorderColor,
  async (newValue) => {
    borderColor.value = newValue
    await pageBuilderService.initializeElementStyles()
  },
  { immediate: true },
)
</script>

<template>
  <EditorAccordion>
    <template #title>{{ translate('Border Style, Width & Color') }}</template>
    <template #content>
      <p class="pbx-myPrimaryParagraph font-medium py-0 my-4">
        {{ translate('Border') }}
      </p>

      <div class="my-2 py-2">
        <label for="border-style" class="pbx-myPrimaryInputLabel">{{
          translate('Border Style')
        }}</label>
        <select
          id="border-style"
          v-model="borderStyle"
          class="pbx-myPrimarySelect"
          @change="pageBuilderService.handleBorderStyle(borderStyle)"
        >
          <option disabled value="">{{ translate('Select') }}</option>
          <option
            v-for="borderStyle in tailwindBorderStyleWidthPlusColor.borderStyle"
            :key="borderStyle"
          >
            {{ borderStyle }}
          </option>
        </select>
      </div>
      <hr />
      <div class="my-2 py-2">
        <label for="border-width" class="pbx-myPrimaryInputLabel">{{
          translate('Border Width')
        }}</label>
        <select
          id="border-width"
          v-model="borderWidth"
          class="pbx-myPrimarySelect"
          @change="pageBuilderService.handleBorderWidth(borderWidth)"
        >
          <option disabled value="">{{ translate('Select') }}</option>
          <option
            v-for="borderWidth in tailwindBorderStyleWidthPlusColor.borderWidth"
            :key="borderWidth"
          >
            {{ borderWidth }}
          </option>
        </select>
      </div>
      <hr />
      <div class="my-2 py-2">
        <label for="border-color" class="pbx-myPrimaryInputLabel">{{
          translate('Border Color')
        }}</label>
        <Listbox as="div" v-model="borderColor">
          <div class="relative mt-2">
            <ListboxButton class="pbx-myPrimarySelect" id="border-color">
              <span class="flex items-center gap-2">
                <div v-if="getBorderColor === 'none'">
                  <div class="pbx-myPrimaryColorPreview border-none">
                    <span class="material-symbols-outlined"> ev_shadow </span>
                  </div>
                </div>
                <div
                  v-if="borderColor !== 'none'"
                  class="aspect-square w-6 h-6 border-solid border border-gray-100 rounded-sm"
                  :class="`bg-${borderColor?.replace('border-', '')}`"
                ></div>
                <span class="block truncate">{{ borderColor }}</span>
              </span>
            </ListboxButton>

            <transition
              leave-active-class="transition ease-in duration-100"
              leave-from-class="opacity-100"
              leave-to-class="opacity-0"
            >
              <ListboxOptions
                class="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm list-none p-0 m-0"
              >
                <ListboxOption
                  as="template"
                  v-for="color in tailwindBorderStyleWidthPlusColor.borderColor"
                  @click="pageBuilderService.handleBorderColor(borderColor)"
                  :key="color"
                  :value="color"
                  v-slot="{ active, borderColor }"
                >
                  <li
                    :class="[
                      active
                        ? 'bg-myPrimaryLinkColor text-white'
                        : 'text-myPrimaryDarkGrayColor',
                      'relative cursor-default select-none py-2 pl-3 pr-9',
                    ]"
                  >
                    <div class="flex items-center">
                      <div v-if="color === 'none'">
                        <div class="pbx-myPrimaryColorPreview border-none">
                          <span class="material-symbols-outlined"> ev_shadow </span>
                        </div>
                      </div>

                      <div
                        v-if="color !== 'none'"
                        class="aspect-square w-6 h-6 bg-gray-950"
                        :class="`bg-${color.replace('border-', '')}`"
                      ></div>
                      <span v-if="color === 'none'" class="ml-3">{{
                        translate('Transparent')
                      }}</span>
                      <span v-if="color !== 'none'" class="ml-3">{{ color }}</span>
                    </div>
                  </li>
                </ListboxOption>
              </ListboxOptions>
            </transition>
          </div>
        </Listbox>
      </div>
    </template>
  </EditorAccordion>
</template>
