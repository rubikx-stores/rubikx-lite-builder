<script setup lang="ts">
// Site-wide brand colors — opened via the toolbar icon next to the desktop/
// mobile preview buttons (rendered app-side into PageBuilder's `toolbarExtra`
// slot in PageBuilderWrapper.client.vue).
//
// These 6 colors are stored and saved to the CMS (global-theme record) only —
// they do NOT apply themselves to any block. Per-block button/text colors are
// set manually via each block's own right-panel editor, same as always.
//
// Edits are a local draft: nothing is saved until "Save" is clicked. Closing
// (X or backdrop) discards any unsaved picks and reverts to the last-saved
// values next time the modal opens.
import { reactive, ref, watch } from 'vue'
import type { ThemeColorValues } from '~/composables/editor/useThemeColors'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

const { state: themeColorsState, saveTheme, themeJson } = useThemeColors()
const selectedCompanyId = useState<number | null>('selectedCompanyId')
const saving = ref(false)
const saveError = ref('')

const draft = reactive<ThemeColorValues>({
  primaryCtaBgColor: themeColorsState.primaryCtaBgColor,
  primaryCtaTextColor: themeColorsState.primaryCtaTextColor,
  secondaryCtaBgColor: themeColorsState.secondaryCtaBgColor,
  secondaryCtaTextColor: themeColorsState.secondaryCtaTextColor,
  primaryTextColor: themeColorsState.primaryTextColor,
  secondaryTextColor: themeColorsState.secondaryTextColor,
})

// Re-sync the draft from the last-saved values every time the modal opens,
// so a previous unsaved edit never leaks in on reopen.
watch(() => props.modelValue, (open) => {
  if (!open) return
  draft.primaryCtaBgColor = themeColorsState.primaryCtaBgColor
  draft.primaryCtaTextColor = themeColorsState.primaryCtaTextColor
  draft.secondaryCtaBgColor = themeColorsState.secondaryCtaBgColor
  draft.secondaryCtaTextColor = themeColorsState.secondaryCtaTextColor
  draft.primaryTextColor = themeColorsState.primaryTextColor
  draft.secondaryTextColor = themeColorsState.secondaryTextColor
})

function close() {
  emit('update:modelValue', false)
}

async function save() {
  saveTheme({ ...draft })
  saving.value = true
  saveError.value = ''
  try {
    await $fetch('/api/proxy/odoo/cms', {
      method: 'POST',
      body: {
        key: 'global-theme',
        value: themeJson(),
        state: 'published',
        version: '1',
        updatedOn: new Date().toISOString(),
        updatedBy: 'editor',
        ...(selectedCompanyId.value ? { companyId: selectedCompanyId.value } : {}),
      },
    })
    const pageHtmlCache = usePageHtmlCache()
    pageHtmlCache.value['global-theme'] = themeJson()
    close()
  } catch (err: any) {
    saveError.value = err?.data?.message || err?.message || 'Failed to save brand colors.'
  } finally {
    saving.value = false
  }
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
            <input v-model="draft.primaryCtaBgColor" type="color" aria-label="Primary Background Color" class="h-9 w-9 shrink-0 cursor-pointer rounded-md border border-gray-300 p-0.5">
            <input v-model="draft.primaryCtaBgColor" type="text" spellcheck="false" aria-label="Primary Background Color hex" class="w-full min-w-0 rounded-md border border-gray-300 py-2 px-1.5 text-xs font-mono lowercase">
          </div>
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-900 mb-1">Text Color</label>
          <div class="flex items-center gap-1">
            <input v-model="draft.primaryCtaTextColor" type="color" aria-label="Primary Text Color" class="h-9 w-9 shrink-0 cursor-pointer rounded-md border border-gray-300 p-0.5">
            <input v-model="draft.primaryCtaTextColor" type="text" spellcheck="false" aria-label="Primary Text Color hex" class="w-full min-w-0 rounded-md border border-gray-300 py-2 px-1.5 text-xs font-mono lowercase">
          </div>
        </div>

        <div>
          <span class="block text-xs text-gray-500 mb-1">Preview</span>
          <span
            class="h-9 rounded-md px-3 text-xs font-medium flex items-center justify-center"
            :style="{ background: draft.primaryCtaBgColor, color: draft.primaryCtaTextColor }"
          >Add to Cart</span>
        </div>
      </div>

      <!-- ── Secondary Cta Button ── -->
      <h4 class="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">Secondary Cta Button/Text</h4>

      <div class="grid grid-cols-3 gap-3 mb-4">
        <div>
          <label class="block text-xs font-medium text-gray-900 mb-1">Background Color</label>
          <div class="flex items-center gap-1">
            <input v-model="draft.secondaryCtaBgColor" type="color" aria-label="Secondary Background Color" class="h-9 w-9 shrink-0 cursor-pointer rounded-md border border-gray-300 p-0.5">
            <input v-model="draft.secondaryCtaBgColor" type="text" spellcheck="false" aria-label="Secondary Background Color hex" class="w-full min-w-0 rounded-md border border-gray-300 py-2 px-1.5 text-xs font-mono lowercase">
          </div>
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-900 mb-1">Text Color</label>
          <div class="flex items-center gap-1">
            <input v-model="draft.secondaryCtaTextColor" type="color" aria-label="Secondary Text Color" class="h-9 w-9 shrink-0 cursor-pointer rounded-md border border-gray-300 p-0.5">
            <input v-model="draft.secondaryCtaTextColor" type="text" spellcheck="false" aria-label="Secondary Text Color hex" class="w-full min-w-0 rounded-md border border-gray-300 py-2 px-1.5 text-xs font-mono lowercase">
          </div>
        </div>

        <div>
          <span class="block text-xs text-gray-500 mb-1">Preview</span>
          <span
            class="h-9 rounded-md px-3 text-xs font-medium flex items-center justify-center"
            :style="{ background: draft.secondaryCtaBgColor, color: draft.secondaryCtaTextColor }"
          >Learn More</span>
        </div>
      </div>

      <!-- ── Primary / Secondary Text Color (heading / subheading) ── -->
      <!-- Independent of the CTA button colors above — this is the general
           site heading/subheading text color, previewed as plain text with
           no button background so it reads as text styling, not a button. -->
      <h4 class="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">Primary Text Color</h4>

      <div class="grid grid-cols-3 gap-3 mb-4">
        <div>
          <label class="block text-xs font-medium text-gray-900 mb-1">Text Color</label>
          <div class="flex items-center gap-1">
            <input v-model="draft.primaryTextColor" type="color" aria-label="Primary Heading Text Color" class="h-9 w-9 shrink-0 cursor-pointer rounded-md border border-gray-300 p-0.5">
            <input v-model="draft.primaryTextColor" type="text" spellcheck="false" aria-label="Primary Heading Text Color hex" class="w-full min-w-0 rounded-md border border-gray-300 py-2 px-1.5 text-xs font-mono lowercase">
          </div>
        </div>

        <div class="col-span-2">
          <label class="invisible block text-xs font-medium mb-1">Text Color</label>
          <span class="flex h-9 items-center text-base font-bold" :style="{ color: draft.primaryTextColor }">THIS IS YOUR HEADING TEXT</span>
        </div>
      </div>

      <h4 class="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">Secondary Text Color</h4>

      <div class="grid grid-cols-3 gap-3 mb-4">
        <div>
          <label class="block text-xs font-medium text-gray-900 mb-1">Text Color</label>
          <div class="flex items-center gap-1">
            <input v-model="draft.secondaryTextColor" type="color" aria-label="Secondary Subheading Text Color" class="h-9 w-9 shrink-0 cursor-pointer rounded-md border border-gray-300 p-0.5">
            <input v-model="draft.secondaryTextColor" type="text" spellcheck="false" aria-label="Secondary Subheading Text Color hex" class="w-full min-w-0 rounded-md border border-gray-300 py-2 px-1.5 text-xs font-mono lowercase">
          </div>
        </div>

        <div class="col-span-2">
          <label class="invisible block text-xs font-medium mb-1">Text Color</label>
          <span class="flex h-9 items-center text-sm font-normal" :style="{ color: draft.secondaryTextColor }">THIS IS YOUR SUBHEADING TEXT</span>
        </div>
      </div>

      <p class="text-xs text-gray-500 mb-3">
        Saved for reference only — set each block's own button/text color from its editor panel on the right.
      </p>

      <p v-if="saveError" class="text-xs text-red-600 mb-2">{{ saveError }}</p>

      <div class="flex flex-row gap-2">
        <button
          type="button"
          class="flex-1 rounded-md border border-gray-300 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          :disabled="saving"
          @click="close"
        >
          Cancel
        </button>
        <button
          type="button"
          class="flex-1 rounded-md bg-gray-900 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
          :disabled="saving"
          @click="save"
        >
          {{ saving ? 'Saving…' : 'Save' }}
        </button>
      </div>
    </div>
  </div>
</template>
