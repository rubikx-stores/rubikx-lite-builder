<script setup>
import { ref, computed, watch } from 'vue'
import { sharedPageBuilderStore } from '../../../../stores/shared-store'
import EditorAccordion from '../EditorAccordion.vue'
import { getPageBuilder } from '../../../../composables/builderInstance'
import { useTranslations } from '../../../../composables/useTranslations'

const { translate } = useTranslations()
const pageBuilderService = getPageBuilder()

const pageBuilderStateStore = sharedPageBuilderStore

const currentStyles = ref(null)
const getCurrentStyles = computed(() => pageBuilderStateStore.getCurrentStyles)

watch(
  getCurrentStyles,
  (newValue) => {
    currentStyles.value = newValue
  },
  { immediate: true },
)

const inputProperty = ref('')
const inputValue = ref('')
const errorMessage = ref('')
const valueInputRef = ref(null)

const handleEnterOnProperty = () => {
  if (valueInputRef.value) {
    valueInputRef.value.focus()
  }
}

const handleAddStyle = async () => {
  const property = inputProperty.value.trim()
  const value = inputValue.value.trim()

  if (!property || !value) {
    errorMessage.value = 'Please enter a property and a value.'
    return
  }

  if (currentStyles.value && currentStyles.value[property]) {
    errorMessage.value = `Property "${property}" already exists. Remove it first to add a new one.`
    return
  }

  errorMessage.value = '' // Clear error

  pageBuilderService.handleAddStyle(property, value)
  await pageBuilderService.initializeElementStyles()

  inputProperty.value = ''
  inputValue.value = ''
}
</script>

<template>
  <EditorAccordion>
    <template #title>{{ translate('Inline Styles') }}</template>
    <template #content>
      <p class="pbx-myPrimaryInputLabel my-4">
        {{
          translate(
            'These are the inline styles applied by the builder. Add your own styles and press Enter to apply them to the selected element.',
          )
        }}
      </p>

      <div class="flex flex-row flex-wrap gap-2 mt-2 mb-4">
        <div
          v-for="(value, key) in currentStyles"
          :key="key"
          class="pbx-myPrimaryTag cursor-pointer hover:bg-myPrimaryErrorColor hover:text-white text-xs py-2 font-medium"
          @click="
            async () => {
              pageBuilderService.handleRemoveStyle(key)
              await pageBuilderService.initializeElementStyles()
            }
          "
        >
          <div class="flex items-center gap-1">
            <span class="mr-1"> {{ key }}: {{ value }}; </span>
          </div>
        </div>
      </div>

      <hr />
      <div class="my-2 py-2">
        <label for="custom-style-property" class="pbx-myPrimaryInputLabel">
          {{ translate('Add your own style.') }}
        </label>
        <div class="flex gap-2 flex-col item-center">
          <input
            id="custom-style-property"
            v-model="inputProperty"
            type="text"
            :placeholder="translate('property')"
            @keydown.enter.prevent="handleEnterOnProperty"
            autocomplete="off"
            class="pbx-myPrimaryInput"
          />
          <input
            id="custom-style-value"
            ref="valueInputRef"
            v-model="inputValue"
            type="text"
            :placeholder="translate('value')"
            @keydown.enter="handleAddStyle"
            autocomplete="off"
            class="pbx-myPrimaryInput"
          />

          <button @click="handleAddStyle" type="button" class="pbx-myPrimaryButton">
            {{ translate('Add') }}
          </button>
        </div>
      </div>
      <p v-if="errorMessage" class="pbx-myPrimaryInputError">{{ errorMessage }}</p>
    </template>
  </EditorAccordion>
</template>
