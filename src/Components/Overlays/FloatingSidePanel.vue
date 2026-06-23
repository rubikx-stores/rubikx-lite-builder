<script setup lang="ts">
defineProps({
  title: {
    type: String,
    required: false,
    default: null,
  },
  showSidebarPanel: {
    type: Boolean,
    default: false,
  },
  position: {
    type: String,
    required: true,
    default: 'right',
    validator(value) {
      const allowed = ['left', 'right'] as const
      const isValid = allowed.includes(value as 'left' | 'right')
      if (!isValid) {
        console.warn(`Invalid prop: position must be 'left' or 'right', got '${value}'`)
      }
      return isValid
    },
  },
})

const emit = defineEmits(['closeSidebarPanel'])

const handleClose = () => {
  emit('closeSidebarPanel')
}
</script>
<template>
  <transition name="popup-fade">
    <div v-if="showSidebarPanel" class="fixed inset-0 z-50">
      <!-- Overlay -->
      <div
        class="fixed inset-0 bg-black opacity-20 z-40"
        @click="handleClose"
      ></div>
      <!-- Right-aligned Modal -->

      <div
        class="fixed top-0 rounded-3xl py-2 px-2 border border-gray-200 max-h-[80vh] lg:min-h-[98%] min-h-[80vh] lg:min-w-96 lg:w-96 w-[96%] overflow-y-auto z-50 bg-white lg:mt-2 mt-2"
        :class="[
          position === 'left' ? 'left-0 ml-[1%]' : '',
          position === 'right' ? 'right-0 mr-[1%]' : '',
        ]"
        @click.stop
      >
        <!-- Close -->
        <div
          class="flex gap-2 justify-between items-center py-2 px-2 mb-2 border-b border-gray-200"
        >
          <span class="pbx-myQuaternaryHeader my-0 py-0 text-black">{{ title }}</span>
          <span @click="handleClose">
            <div
              class="h-10 w-10 cursor-pointer rounded-full flex items-center border-none justify-center bg-gray-50 aspect-square hover:bg-myPrimaryLinkColor hover:text-white focus-visible:ring-0 text-black"
            >
              <span class="material-symbols-outlined"> close </span>
            </div>
          </span>
        </div>
        <!-- Content start -->
        <div class="pt-4 px-2">
          <slot></slot>
        </div>
        <!-- Content end -->
      </div>
    </div>
  </transition>
</template>
