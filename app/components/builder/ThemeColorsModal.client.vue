<script setup lang="ts">
// Site-wide brand colors — opened via the toolbar icon next to the desktop/
// mobile preview buttons (rendered app-side into PageBuilder's `toolbarExtra`
// slot in PageBuilderWrapper.client.vue).
//
// These 4 colors are stored and saved to the CMS (global-theme record) only —
// they do NOT apply themselves to any block. Per-block button/text colors are
// set manually via each block's own right-panel editor, same as always.
//
// Edits are a local draft: nothing is saved until "Save" is clicked. Closing
// (X or backdrop) discards any unsaved picks and reverts to the last-saved
// values next time the modal opens.
import { reactive, watch } from 'vue'
import type { ThemeColorValues } from '~/composables/editor/useThemeColors'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

const { state: themeColorsState, saveTheme } = useThemeColors()

const draft = reactive<ThemeColorValues>({
  primaryCtaColor: themeColorsState.primaryCtaColor,
  primaryTextColor: themeColorsState.primaryTextColor,
  secondaryCtaColor: themeColorsState.secondaryCtaColor,
  secondaryTextColor: themeColorsState.secondaryTextColor,
})

// Re-sync the draft from the last-saved values every time the modal opens,
// so a previous unsaved edit never leaks in on reopen.
watch(() => props.modelValue, (open) => {
  if (!open) return
  draft.primaryCtaColor = themeColorsState.primaryCtaColor
  draft.primaryTextColor = themeColorsState.primaryTextColor
  draft.secondaryCtaColor = themeColorsState.secondaryCtaColor
  draft.secondaryTextColor = themeColorsState.secondaryTextColor
})

function close() {
  emit('update:modelValue', false)
}

function save() {
  saveTheme({ ...draft })
  close()
}
</script>

<template>
  <div
    v-if="props.modelValue"
    class="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 p-4"
    @click.self="close"
  >
    <div class="w-full max-w-2xl rounded-xl bg-white p-5 shadow-xl max-h-[90vh] overflow-y-auto">
      <div class="mb-3 flex items-center justify-between">
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

      <!-- ── Primary Cta Button ── -->
      <h4 class="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">Primary Cta Button/Text</h4>

      <div class="grid grid-cols-3 gap-3 mb-4">
        <div>
          <label class="block text-xs font-medium text-gray-900 mb-1">Background Color</label>
          <div class="flex items-center gap-1">
            <input v-model="draft.primaryCtaColor" type="color" aria-label="Primary Background Color" class="h-9 w-9 shrink-0 cursor-pointer rounded-md border border-gray-300 p-0.5">
            <input v-model="draft.primaryCtaColor" type="text" spellcheck="false" aria-label="Primary Background Color hex" class="w-full min-w-0 rounded-md border border-gray-300 py-2 px-1.5 text-xs font-mono lowercase">
          </div>
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-900 mb-1">Text Color</label>
          <div class="flex items-center gap-1">
            <input v-model="draft.primaryTextColor" type="color" aria-label="Primary Text Color" class="h-9 w-9 shrink-0 cursor-pointer rounded-md border border-gray-300 p-0.5">
            <input v-model="draft.primaryTextColor" type="text" spellcheck="false" aria-label="Primary Text Color hex" class="w-full min-w-0 rounded-md border border-gray-300 py-2 px-1.5 text-xs font-mono lowercase">
          </div>
        </div>

        <div>
          <span class="block text-xs text-gray-500 mb-1">Sample</span>
          <span
            class="h-9 rounded-md px-3 text-xs font-medium flex items-center justify-center"
            :style="{ background: draft.primaryCtaColor, color: draft.primaryTextColor }"
          >Add to Cart</span>
        </div>
      </div>

      <!-- ── Secondary Cta Button ── -->
      <h4 class="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">Secondary Cta Button/Text</h4>

      <div class="grid grid-cols-3 gap-3 mb-4">
        <div>
          <label class="block text-xs font-medium text-gray-900 mb-1">Background Color</label>
          <div class="flex items-center gap-1">
            <input v-model="draft.secondaryCtaColor" type="color" aria-label="Secondary Background Color" class="h-9 w-9 shrink-0 cursor-pointer rounded-md border border-gray-300 p-0.5">
            <input v-model="draft.secondaryCtaColor" type="text" spellcheck="false" aria-label="Secondary Background Color hex" class="w-full min-w-0 rounded-md border border-gray-300 py-2 px-1.5 text-xs font-mono lowercase">
          </div>
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-900 mb-1">Text Color</label>
          <div class="flex items-center gap-1">
            <input v-model="draft.secondaryTextColor" type="color" aria-label="Secondary Text Color" class="h-9 w-9 shrink-0 cursor-pointer rounded-md border border-gray-300 p-0.5">
            <input v-model="draft.secondaryTextColor" type="text" spellcheck="false" aria-label="Secondary Text Color hex" class="w-full min-w-0 rounded-md border border-gray-300 py-2 px-1.5 text-xs font-mono lowercase">
          </div>
        </div>

        <div>
          <span class="block text-xs text-gray-500 mb-1">Sample</span>
          <span
            class="h-9 rounded-md px-3 text-xs font-medium flex items-center justify-center"
            :style="{ background: draft.secondaryCtaColor, color: draft.secondaryTextColor }"
          >Learn More</span>
        </div>
      </div>

      <p class="text-xs text-gray-500 mb-3">
        Saved for reference only — set each block's own button/text color from its editor panel on the right.
      </p>

      <div class="flex flex-row gap-2">
        <button
          type="button"
          class="flex-1 rounded-md border border-gray-300 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          @click="close"
        >
          Cancel
        </button>
        <button
          type="button"
          class="flex-1 rounded-md bg-gray-900 py-2 text-sm font-medium text-white hover:bg-gray-700"
          @click="save"
        >
          Save
        </button>
      </div>
    </div>
  </div>
</template>
