<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  showModalBuilder: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    default: 'success',
  },
  maxWidth: {
    type: String,
    default: '2xl',
  },
  minHeight: {
    type: String,
  },
  maxHeight: {
    type: String,
  },
  noBackgroundOpacity: {
    type: Boolean,
  },
})

const emit = defineEmits(['closeMainModalBuilder'])

const handleClose = () => {
  emit('closeMainModalBuilder')
}

const maxWidthClass = computed(() => {
  return {
    sm: 'md:max-w-sm w-screen',
    md: 'md:max-w-md w-screen',
    lg: 'md:max-w-lg w-screen',
    xl: 'md:max-w-xl w-screen',
    '2xl': 'md:max-w-2xl w-screen',
    '3xl': 'md:max-w-3xl w-screen',
    '4xl': 'md:max-w-4xl w-screen',
    '5xl': 'md:max-w-5xl w-screen',
    '6xl': 'md:max-w-6xl w-screen',
    '7xl': 'md:max-w-7xl w-screen',
    full: 'md:max-w-full w-screen', // 100% width
    screen: 'md:w-screen w-screen max-w-none', // truly full screen
  }[props.maxWidth]
})
</script>

<template>
  <teleport to="body">
    <div id="pbx-modal" class="font-sans">
      <!-- Modal -->
      <div
        v-if="showModalBuilder"
        class="fixed inset-0 z-40 flex items-center justify-center mx-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        <!-- Backdrop -->
        <div
          class="fixed inset-0 bg-black/50 transition-opacity"
          :class="[noBackgroundOpacity ? 'bg-black/100' : '']"
          @click="handleClose"
        ></div>

        <div
          class="relative inline-block bg-white rounded-3xl text-left shadow-xl transform transition-all max-w-[96vh] lg:max-h-[98vh] max-h-[85vh] overflow-y-auto w-full"
          :class="[
            maxWidthClass ? maxWidthClass : '',
            minHeight ? minHeight : '',
            maxHeight ? maxHeight : '',
          ]"
        >
          <div
            class="h-16 px-4 border-0 border-solid border-b border-gray-200 mb-2 flex items-center justify-between"
            :class="[
              type === 'success' ? 'bg-white' : '',
              type === 'warning' ? 'bg-white' : '',
              type === 'danger' ? 'bg-white' : '',
              type === 'delete' ? 'bg-white' : '',
            ]"
          >
            <h3
              as="h3"
              class="pbx-myQuaternaryHeader my-0 py-0"
              :class="[
                type === 'success' ? 'text-black' : '',
                type === 'warning' ? 'text-black' : '',
                type === 'danger' ? 'text-black' : '',
                type === 'delete' ? 'text-black' : '',
              ]"
            >
              {{ title }}
            </h3>
            <div
              class="h-10 w-10 cursor-pointer rounded-full flex items-center border-none justify-center bg-gray-50 aspect-square hover:bg-myPrimaryLinkColor hover:text-white focus-visible:ring-0 text-black"
              @click="handleClose"
            >
              <span class="material-symbols-outlined"> close </span>
            </div>
          </div>
          <div class="px-4 min-h-32">
            <slot></slot>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>
