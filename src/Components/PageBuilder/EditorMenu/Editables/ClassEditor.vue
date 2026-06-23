<script setup>
import { ref, computed, watch } from 'vue'
import { sharedPageBuilderStore } from '../../../../stores/shared-store'
import EditorAccordion from '../EditorAccordion.vue'
import { getPageBuilder } from '../../../../composables/builderInstance'
import { useTranslations } from '../../../../composables/useTranslations'

const { translate } = useTranslations()

const pageBuilderService = getPageBuilder()

const pageBuilderStateStore = sharedPageBuilderStore

const currentClasses = ref(null)
const getCurrentClasses = computed(() => pageBuilderStateStore.getCurrentClasses)

watch(
  getCurrentClasses,
  (newValue) => {
    currentClasses.value = newValue
  },
  { immediate: true },
)

const inputClass = ref('')
const errorMessage = ref('') // <-- error message reactive ref

const handleAddClasses = async () => {
  const classToAdd = inputClass.value.trim()

  if (!classToAdd) {
    errorMessage.value = 'Please enter a class name.'
    return
  }

  // Add prefix if missing
  const prefixedClass = classToAdd.startsWith('') ? classToAdd : '' + classToAdd

  // Check if class already exists
  if (currentClasses.value?.includes(prefixedClass)) {
    errorMessage.value = `Class "${prefixedClass}" is already added.`
    return
  }

  errorMessage.value = '' // Clear error

  pageBuilderService.handleAddClasses(classToAdd)
  await pageBuilderService.initializeElementStyles()

  inputClass.value = ''
}
</script>

<template>
  <EditorAccordion>
    <template #title>{{ translate('Generated CSS') }}</template>
    <template #content>
      <p class="pbx-myPrimaryInputLabel my-4">
        {{
          translate(
            'This is the CSS applied by the builder. Add your own CSS and press Enter to apply it to the selected element.',
          )
        }}
      </p>

      <div class="flex flex-row flex-wrap gap-2 mt-2 mb-4">
        <div
          v-for="className in currentClasses"
          :key="className"
          class="pbx-myPrimaryTag cursor-pointer hover:bg-myPrimaryErrorColor hover:text-white text-xs py-2 font-medium"
          @click="
            async () => {
              pageBuilderService.handleRemoveClasses(className)
              await pageBuilderService.initializeElementStyles()
            }
          "
        >
          <div class="flex items-center gap-1">
            <span class="mr-1">
              {{ className }}
            </span>
          </div>
        </div>
      </div>

      <hr />
      <div class="my-2 py-2">
        <label for="custom-css" class="pbx-myPrimaryInputLabel">
          {{ translate('Add your CSS.') }}
          <br />
          {{ translate('The  prefix is added automatically.') }}
        </label>
        <div class="flex gap-2 item-center">
          <input
            id="custom-css"
            v-model="inputClass"
            type="text"
            :placeholder="translate('Type class')"
            @keydown.enter="handleAddClasses()"
            autocomplete="off"
            class="pbx-myPrimaryInput"
          />

          <button @click="handleAddClasses" type="button" class="pbx-myPrimaryButton">
            {{ translate('Add') }}
          </button>
        </div>
      </div>
      <p v-if="errorMessage" class="pbx-myPrimaryInputError">{{ errorMessage }}</p>
    </template>
  </EditorAccordion>
</template>
