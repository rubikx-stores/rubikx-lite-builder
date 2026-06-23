<script setup lang="ts">
import { getPageBuilder } from '../../composables/builderInstance'
import { useTranslations } from '../../composables/useTranslations'

const { translate } = useTranslations()
const pageBuilderService = getPageBuilder()
</script>

<template>
  <div>
    <template v-if="pageBuilderService.isSelectedElementValidText()">
      <div class="flex flex-col border-solid border border-gray-400">
        <div
          @click="pageBuilderService.toggleTipTapModal(true)"
          class="flex flex-row justify-between items-center pl-3 pr-3 py-5 cursor-pointer duration-200 hover:bg-myPrimaryLightGrayColor bg-white"
        >
          <p class="pbx-myPrimaryParagraph font-medium my-0 py-0">
            {{ translate('Text') }}
          </p>
          <span class="material-symbols-outlined"> chevron_right </span>
        </div>
      </div>
    </template>
  </div>
</template>
