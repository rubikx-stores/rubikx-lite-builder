<script setup lang="ts">
import { computed, ref } from 'vue'
import { sharedPageBuilderStore } from '../../../stores/shared-store'
import GlobalLoader from '../../../Components/Loaders/GlobalLoader.vue'
import { getPageBuilder } from '../../../composables/builderInstance'

const pageBuilderService = getPageBuilder()

const emit = defineEmits(['toolbar-hide-request'])

// Use shared store instance
const pageBuilderStateStore = sharedPageBuilderStore

const getIsLoadingGlobal = computed(() => {
  return pageBuilderStateStore.getIsLoadingGlobal
})

const historyIndex = computed(() => pageBuilderStateStore.getHistoryIndex)
const historyLength = computed(() => pageBuilderStateStore.getHistoryLength)

const canUndo = computed(() => historyIndex.value > 0)
const canRedo = computed(() => historyIndex.value < historyLength.value - 1)

const handleUndo = async function () {
  if (canUndo.value) {
    // Emit event to hide toolbar
    emit('toolbar-hide-request')
    await pageBuilderService.undo()
    await pageBuilderService.clearHtmlSelection()
  }
}

const handleRedo = async function () {
  if (canRedo.value) {
    // Emit event to hide toolbar
    emit('toolbar-hide-request')
    await pageBuilderService.redo()
    await pageBuilderService.clearHtmlSelection()
  }
}
</script>

<template>
  <GlobalLoader v-if="getIsLoadingGlobal"></GlobalLoader>
  <div
    @click="
      async () => {
        await pageBuilderService.clearHtmlSelection()
      }
    "
    class="flex-1 flex justify-center items-center py-2 w-full gap-1"
  >
    <!-- Undo Start -->

    <div
      @click="handleUndo"
      type="button"
      class="h-10 w-10 rounded-full flex items-center border-none justify-center bg-gray-50 aspect-square text-black hover:text-white"
      :class="[
        canUndo
          ? 'cursor-pointer hover:bg-myPrimaryLinkColor focus-visible:ring-0'
          : 'cursor-not-allowed bg-opacity-20  hover:bg-gray-200',
      ]"
    >
      <span class="material-symbols-outlined"> undo </span>
    </div>

    <!-- Undo End -->
    <div
      class="text-xs text-gray-600 mx-2 py-3 px-2 border-solid border border-gray-200 rounded-full"
    >
      {{ historyIndex + 1 }}/{{ historyLength }}
    </div>
    <!-- Redo Start -->

    <div
      @click="handleRedo"
      class="h-10 w-10 rounded-full flex items-center border-none justify-center bg-gray-50 aspect-square text-black hover:text-white"
      :class="[
        canRedo
          ? 'cursor-pointer hover:bg-myPrimaryLinkColor focus-visible:ring-0'
          : 'cursor-not-allowed bg-opacity-20  hover:bg-gray-200',
      ]"
    >
      <span class="material-symbols-outlined"> redo </span>
    </div>

    <!-- Redo End -->
  </div>
</template>
