<template>
  <div
    class="flex flex-col border-solid border border-gray-400"
    :class="{ '': expanded }"
  >
    <div
      class="flex flex-row justify-between items-center pl-3 pr-3 py-5 cursor-pointer duration-200 bg-white hover:bg-myPrimaryLightGrayColor select-none"
      @click="expanded = !expanded"
    >
      <p class="pbx-myPrimaryParagraph font-medium my-0 py-0">
        <slot name="title" />
      </p>

      <template v-if="expanded">
        <span class="material-symbols-outlined"> keyboard_arrow_down </span>
      </template>
      <template v-if="!expanded">
        <span class="material-symbols-outlined"> chevron_right </span>
      </template>
    </div>
    <div
      :class="[
        expanded
          ? 'block bg-indigo-50 border-0 border-solid border-t border-red-50'
          : 'hidden',
      ]"
      class="px-4 ease-linear duration-75 pb-8"
    >
      <slot name="content" />
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  setup() {
    const expanded = ref(false)

    return {
      expanded,
    }
  },
}
</script>
