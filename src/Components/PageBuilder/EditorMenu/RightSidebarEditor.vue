<script setup>
import { computed, ref, watch, nextTick } from 'vue'
import { sharedPageBuilderStore } from '../../../stores/shared-store'
import ClassEditor from './Editables/ClassEditor.vue'
import StyleEditor from './Editables/StyleEditor.vue'
import ImageEditor from './Editables/ImageEditor.vue'
import OpacityEditor from './Editables/OpacityEditor.vue'
import Padding from './Editables/Padding.vue'
import Margin from './Editables/Margin.vue'
import BorderRadius from './Editables/BorderRadius.vue'
import Borders from './Editables/Borders.vue'
import { getPageBuilder } from '../../../composables/builderInstance'
import { useTranslations } from '../../../composables/useTranslations'
import ModalBuilder from '../../Modals/ModalBuilder.vue'
import AdvancedPageBuilderSettings from '../Settings/AdvancedPageBuilderSettings.vue'
import { delay } from '../../../composables/delay'

const { translate } = useTranslations()

const pageBuilderService = getPageBuilder()
const pageBuilderStateStore = sharedPageBuilderStore

defineEmits(['closeEditor'])

const getElement = computed(() => {
  return pageBuilderStateStore.getElement
})

const elementTag = computed(() => {
  return getElement.value?.tagName
})

const scrollContainer = ref(null)
let lastScrollTop = 0
let lastComponentId = null

// getElement changes both when a field edit re-renders the SAME block's DOM
// (where restoring scroll is correct — the user is still mid-edit) and when
// the user clicks a DIFFERENT block to select it (where restoring an old,
// unrelated scroll offset just looks like the panel jumping/scrolling on its
// own). Distinguish the two via the enclosing section's data-componentid: only
// restore when it's unchanged, otherwise this is a fresh selection and the
// panel should simply open at the top.
//
// setElement() (page-builder-state.ts) always sets `element` to null first,
// then to the real value on nextTick, purely to force this watcher to fire
// even when the payload is the same reference as before (e.g. every debounced
// field edit calls setElement(section) on the same still-selected section).
// That intermediate null firing must be ignored entirely — acting on it (or
// letting it overwrite lastComponentId) throws away the very id this guard
// needs to recognize "still editing the same block" on the real firing that
// follows one tick later.
watch(
  () => pageBuilderStateStore.getElement,
  (newEl) => {
    const newComponentId =
      newEl?.closest?.('[data-componentid]')?.getAttribute('data-componentid') ?? null
    if (newComponentId === null) return
    const sameBlock = newComponentId === lastComponentId
    nextTick(() => {
      if (scrollContainer.value) {
        scrollContainer.value.scrollTop = sameBlock ? lastScrollTop : 0
      }
    })
    lastComponentId = newComponentId
  },
)

// Save scroll position before update
function onScroll() {
  if (scrollContainer.value) {
    lastScrollTop = scrollContainer.value.scrollTop
  }
}

const showHTMLSettings = ref(false)
const isLoading = ref(false)

const openHTMLSettings = async function () {
  showHTMLSettings.value = true
  isLoading.value = true
  await delay(200)
  pageBuilderStateStore.setToggleGlobalHtmlMode(true)
  await pageBuilderService.globalPageStyles()

  await pageBuilderService.generateHtmlFromComponents()
  isLoading.value = false
}

const closeHTMLSettings = async function () {
  isLoading.value = true
  await delay(200)
  await pageBuilderService.handleManualSave()

  // Remove global highlight if present
  const pagebuilder = document.querySelector('#pagebuilder')
  if (pagebuilder) {
    pagebuilder.removeAttribute('data-global-selected')
  }
  showHTMLSettings.value = false
  isLoading.value = false
}
</script>

<template>
  <div class="flex h-full flex-col">
    <div
      class="flex flex-row justify-between pt-7 pr-4 pl-4 items-center mb-3"
    >
      <button
        type="button"
        @click="$emit('closeEditor')"
        class="h-10 w-10 cursor-pointer rounded-full flex items-center border-none justify-center bg-gray-50 aspect-square hover:bg-myPrimaryLinkColor hover:text-white focus-visible:ring-0 text-black hover:text-white"
      >
        <span class="material-symbols-outlined"> close </span>
      </button>
      <p class="font-medium text-sm">
        {{ translate('Editing') }}
        <span class="lowercase">&lt;{{ elementTag }}&gt;</span>
      </p>
    </div>

    <div
      ref="scrollContainer"
      @scroll="onScroll"
      class="pl-3 pr-3 mb-4 overflow-y-scroll"
    >
      <div v-show="getElement && pageBuilderService.isEditableElement(getElement)">
        <article class="mb-1">
          <ImageEditor> </ImageEditor>
        </article>
        <article class="my-1">
          <OpacityEditor> </OpacityEditor>
        </article>
        <article class="my-1">
          <Padding> </Padding>
        </article>
        <article class="my-1">
          <Margin> </Margin>
        </article>
        <article class="my-1">
          <BorderRadius></BorderRadius>
        </article>
        <article class="my-1">
          <Borders></Borders>
        </article>
        <article class="my-1">
          <ClassEditor></ClassEditor>
        </article>
        <article class="my-1">
          <StyleEditor></StyleEditor>
        </article>
        <div class="w-full border-t border-solid border-gray-200 my-6"></div>
      </div>

      <button
        @click="openHTMLSettings"
        type="button"
        class="my-1 border border-gray-900 flex flex-row justify-between items-center pl-3 pr-3 py-5 cursor-pointer duration-200 bg-black text-white hover:bg-myPrimaryLightGrayColor hover:text-black select-none w-full"
      >
        <p class="font-medium my-0 py-0">
          {{ translate('Global Page Styles') }}
        </p>
      </button>
    </div>
  </div>
  <ModalBuilder
    maxWidth="5xl"
    :showModalBuilder="showHTMLSettings"
    :title="translate('Selected HTML')"
    @closeMainModalBuilder="closeHTMLSettings"
    minHeight=""
    maxHeight=""
  >
    <AdvancedPageBuilderSettings :isLoading="isLoading"> </AdvancedPageBuilderSettings>
  </ModalBuilder>
</template>
