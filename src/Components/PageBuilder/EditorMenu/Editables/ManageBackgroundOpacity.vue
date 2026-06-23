<script setup>
import { ref, computed, watch } from 'vue'
import { sharedPageBuilderStore } from '../../../../stores/shared-store'
import EditorAccordion from '../EditorAccordion.vue'
import tailwindOpacities from '../../../../utils/builder/tailwind-opacities'
import {
  Listbox,
  ListboxButton,
  ListboxLabel,
  ListboxOption,
  ListboxOptions,
} from '@headlessui/vue'
import { getPageBuilder } from '../../../../composables/builderInstance'
const pageBuilderService = getPageBuilder()

// Use shared store instance
const pageBuilderStateStore = sharedPageBuilderStore
const opacityVueModel = ref(null)
const getBackgroundOpacity = computed(() => {
  return pageBuilderStateStore.getBackgroundOpacity
})

watch(
  getBackgroundOpacity,
  async (newValue) => {
    opacityVueModel.value = newValue
    await pageBuilderService.initializeElementStyles()
  },
  { immediate: true },
)
</script>

<template>
  <div class="my-2 py-2">
    <label for="bg-opacity" class="pbx-myPrimaryInputLabel"> Background Opacity</label>

    <Listbox as="div" v-model="opacityVueModel">
      <div class="relative">
        <ListboxButton class="pbx-myPrimarySelect" id="bg-opacity">
          <span class="flex items-center gap-2">
            <div v-if="opacityVueModel === 'none'">
              <div class="pbx-myPrimaryColorPreview border-none">
                <span class="material-symbols-outlined"> ev_shadow </span>
              </div>
            </div>

            <div
              v-if="opacityVueModel !== 'none'"
              class="aspect-square w-6 h-6 bg-gray-950"
              :class="`${opacityVueModel}`"
            ></div>

            <span class="block truncate" :class="[opacityVueModel !== 'none' ? '' : '']">{{
              opacityVueModel === 'none' ? 'Transparent' : opacityVueModel
            }}</span>
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
              v-for="backgroundOpacity in tailwindOpacities.backgroundOpacities"
              @click="pageBuilderService.handleBackgroundOpacity(backgroundOpacity)"
              :key="backgroundOpacity"
              :value="backgroundOpacity"
              v-slot="{ active }"
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
                  <div v-if="backgroundOpacity === 'none'">
                    <div class="pbx-myPrimaryColorPreview border-none">
                      <span class="material-symbols-outlined"> ev_shadow </span>
                    </div>
                  </div>

                  <div
                    v-if="backgroundOpacity !== 'none'"
                    class="aspect-square w-6 h-6 bg-gray-950"
                    :class="`${backgroundOpacity}`"
                  ></div>
                  <span v-if="backgroundOpacity === 'none'" class="ml-3">Transparent</span>
                  <span v-if="backgroundOpacity !== 'none'" class="ml-3">{{
                    backgroundOpacity
                  }}</span>
                </div>
              </li>
            </ListboxOption>
          </ListboxOptions>
        </transition>
      </div>
    </Listbox>
  </div>
</template>
