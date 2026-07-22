<script setup lang="ts">
// Site-wide brand colors — opened via the toolbar icon next to the desktop/
// mobile preview buttons (rendered app-side into PageBuilder's `toolbarExtra`
// slot in PageBuilderWrapper.client.vue). Replaces the old Settings-tab
// Primary/Secondary pickers: this is now the single place theme colors live.
const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

const {
  state: themeColorsState,
  setPrimaryButtonColor,
  setSecondaryButtonColor,
  setPrimaryTextColor,
  setSecondaryTextColor,
} = useThemeColors()
const { applyThemeColorsToAllBlocks } = useEditorSidebar()

function close() {
  emit('update:modelValue', false)
}

function onPrimaryButtonColor(v: string) {
  setPrimaryButtonColor(v)
  applyThemeColorsToAllBlocks()
}
function onSecondaryButtonColor(v: string) {
  setSecondaryButtonColor(v)
  applyThemeColorsToAllBlocks()
}
function onPrimaryTextColor(v: string) {
  setPrimaryTextColor(v)
  applyThemeColorsToAllBlocks()
}
function onSecondaryTextColor(v: string) {
  setSecondaryTextColor(v)
  applyThemeColorsToAllBlocks()
}
</script>

<template>
  <div
    v-if="props.modelValue"
    class="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 p-4"
    @click.self="close"
  >
    <div class="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
      <div class="mb-4 flex items-center justify-between">
        <h3 class="text-lg font-medium text-gray-900">Brand Colors</h3>
        <button
          type="button"
          aria-label="Close"
          class="cursor-pointer rounded-md border-none bg-transparent p-1 text-gray-400 hover:text-gray-700"
          @click="close"
        >
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <label class="block text-sm font-medium text-gray-900 mb-2">Primary Button Color</label>
      <div class="flex items-center gap-2 mb-4">
        <input
          type="color"
          :value="themeColorsState.primaryButtonColor"
          aria-label="Primary button color"
          class="h-9 w-12 shrink-0 cursor-pointer rounded-md border border-gray-300 p-0.5"
          @input="onPrimaryButtonColor(($event.target as HTMLInputElement).value)"
        >
        <input
          type="text"
          :value="themeColorsState.primaryButtonColor"
          spellcheck="false"
          aria-label="Primary button color hex"
          class="w-full rounded-md border border-gray-300 py-2 px-3 text-sm font-mono lowercase"
          @change="onPrimaryButtonColor(($event.target as HTMLInputElement).value)"
        >
      </div>

      <label class="block text-sm font-medium text-gray-900 mb-2">Secondary Button Color</label>
      <div class="flex items-center gap-2 mb-4">
        <input
          type="color"
          :value="themeColorsState.secondaryButtonColor"
          aria-label="Secondary button color"
          class="h-9 w-12 shrink-0 cursor-pointer rounded-md border border-gray-300 p-0.5"
          @input="onSecondaryButtonColor(($event.target as HTMLInputElement).value)"
        >
        <input
          type="text"
          :value="themeColorsState.secondaryButtonColor"
          spellcheck="false"
          aria-label="Secondary button color hex"
          class="w-full rounded-md border border-gray-300 py-2 px-3 text-sm font-mono lowercase"
          @change="onSecondaryButtonColor(($event.target as HTMLInputElement).value)"
        >
      </div>

      <label class="block text-sm font-medium text-gray-900 mb-2">Primary Text Color</label>
      <div class="flex items-center gap-2 mb-4">
        <input
          type="color"
          :value="themeColorsState.primaryTextColor"
          aria-label="Primary text color"
          class="h-9 w-12 shrink-0 cursor-pointer rounded-md border border-gray-300 p-0.5"
          @input="onPrimaryTextColor(($event.target as HTMLInputElement).value)"
        >
        <input
          type="text"
          :value="themeColorsState.primaryTextColor"
          spellcheck="false"
          aria-label="Primary text color hex"
          class="w-full rounded-md border border-gray-300 py-2 px-3 text-sm font-mono lowercase"
          @change="onPrimaryTextColor(($event.target as HTMLInputElement).value)"
        >
      </div>

      <label class="block text-sm font-medium text-gray-900 mb-2">Secondary Text Color</label>
      <div class="flex items-center gap-2 mb-4">
        <input
          type="color"
          :value="themeColorsState.secondaryTextColor"
          aria-label="Secondary text color"
          class="h-9 w-12 shrink-0 cursor-pointer rounded-md border border-gray-300 p-0.5"
          @input="onSecondaryTextColor(($event.target as HTMLInputElement).value)"
        >
        <input
          type="text"
          :value="themeColorsState.secondaryTextColor"
          spellcheck="false"
          aria-label="Secondary text color hex"
          class="w-full rounded-md border border-gray-300 py-2 px-3 text-sm font-mono lowercase"
          @change="onSecondaryTextColor(($event.target as HTMLInputElement).value)"
        >
      </div>

      <p class="text-xs text-gray-500 mb-4">
        Applies across the whole website — buttons, accents and highlights follow these colors. A block with its own color set stays unchanged.
      </p>

      <button
        type="button"
        class="w-full rounded-md bg-gray-900 py-2 text-sm font-medium text-white hover:bg-gray-700"
        @click="close"
      >
        Done
      </button>
    </div>
  </div>
</template>
