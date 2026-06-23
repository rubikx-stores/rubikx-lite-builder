<script setup>
import ModalBuilder from './ModalBuilder.vue'

defineProps({
  showDynamicModalBuilder: {
    type: Boolean,
    default: false,
    required: true,
  },
  simpleModal: {
    type: Boolean,
    default: false,
    required: false,
  },
  disabled: {
    type: Boolean,
    default: false,
    required: false,
  },
  isLoading: {
    type: Boolean,
    default: false,
    required: false,
  },
  disabledWhichButton: {
    type: String,
    default: '',
    required: false,
  },
  maxWidth: {
    type: String,
    required: false,
    default: '2xl',
  },
  gridColumnAmount: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    required: true,
  },
  firstButtonText: {
    type: String,
  },
  secondButtonText: {
    type: String,
  },
  thirdButtonText: {
    type: String,
  },
})

const emit = defineEmits([
  'firstModalButtonFunctionDynamicModalBuilder',
  'secondModalButtonFunctionDynamicModalBuilder',
  'thirdModalButtonFunctionDynamicModalBuilder',
])

// first button function
const firstButtonBuilder = function () {
  emit('firstModalButtonFunctionDynamicModalBuilder')
}
// second button  function
const secondButtonBuilder = function () {
  emit('secondModalButtonFunctionDynamicModalBuilder')
}

// third button function
const thirdButtonBuilder = function () {
  emit('thirdModalButtonFunctionDynamicModalBuilder')
}
</script>

<template>
  <ModalBuilder
    :title="title"
    :showModalBuilder="showDynamicModalBuilder"
    :type="type"
    @closeMainModalBuilder="firstButtonBuilder"
    :maxWidth="maxWidth"
  >
    <slot name="content" />

    <div
      class="min-h-32 h-max font-sans w-full relative inline-block align-bottom text-left overflow-hidden transform transition-all sm:align-middle"
    >
      <div :class="{ 'pr-4 pb-4': !simpleModal }">
        <template v-if="simpleModal !== true">
          <div v-html="description" class="pbx-myPrimaryParagraph mb-6"></div>
        </template>

        <slot name="header"></slot>

        <slot></slot>
      </div>
    </div>

    <div
      class="border-0 border-solid border-t border-gray-200 mt-4 flex items-center justify-end"
    >
      <div
        v-if="simpleModal !== true && !isLoading"
        class="py-4 flex sm:justify-end justify-center"
      >
        <slot name="footer" />
        <div
          :class="{
            'sm:grid-cols-1': gridColumnAmount === 1,
            'sm:grid-cols-2': gridColumnAmount === 2,
            'sm:grid-cols-3': gridColumnAmount === 3,
          }"
          class="sm:grid-cols-2 sm:items-end sm:justify-end flex flex-row pbx-myPrimaryGap w-full"
        >
          <button
            v-if="firstButtonText"
            ref="firstButtonRef"
            class="pbx-mySecondaryButton"
            type="button"
            @click="firstButtonBuilder"
          >
            {{ firstButtonText }}
          </button>

          <button
            v-if="secondButtonText"
            class="pbx-myPrimaryButton bg-yellow-300 hover:bg-yellow-400 text-myPrimaryDarkGrayColor hover:text-myPrimaryDarkGrayColor focus:ring-yellow-400 w-full"
            type="button"
            @click="secondButtonBuilder"
          >
            {{ secondButtonText }}
          </button>

          <button
            v-if="thirdButtonText"
            class="pbx-myPrimaryButton bg-myPrimaryLinkColor focus-visible:ring-myPrimaryLinkColor focus:ring-myPrimaryLinkColor hover:bg-myPrimaryLinkColor w-full"
            :class="[
              type === 'danger' || type === 'delete'
                ? 'bg-red-600 focus-visible:ring-red-600 focus:ring-red-600 hover:bg-red-600'
                : 'bg-myPrimaryLinkColor focus-visible:ring-myPrimaryLinkColor focus:ring-myPrimaryLinkColor hover:bg-myPrimaryLinkColor',
            ]"
            type="button"
            @click="thirdButtonBuilder"
          >
            {{ thirdButtonText }}
          </button>
        </div>
      </div>

      <template v-if="isLoading">
        <div class="flex items-center my-2 py-4 px-2 justify-end">
          <div
            class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
          >
            <span
              class="!absolute !m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
              >Loading...</span
            >
          </div>
        </div>
      </template>
    </div>
  </ModalBuilder>
</template>

<style scope>
/*
  Enter and leave animations can use different
  durations and timing functions.
*/
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.8s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}

.bounce-enter-active {
  animation: bounce-in 0.5s;
}
.bounce-leave-active {
  animation: bounce-in 0.5s reverse;
}
@keyframes bounce-in {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.25);
  }
  100% {
    transform: scale(1);
  }
}
</style>
