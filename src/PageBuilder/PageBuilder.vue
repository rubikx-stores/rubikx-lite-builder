<script setup>
import { onMounted, computed, ref, watch, provide } from 'vue'
import ModalBuilder from '../Components/Modals/ModalBuilder.vue'
import Preview from './Preview.vue'
import ComponentTopMenu from '../Components/PageBuilder/EditorMenu/Editables/ComponentTopMenu.vue'
import EditGetElement from '../Components/PageBuilder/EditorMenu/Editables/EditGetElement.vue'
import BuilderComponents from '../Components/Modals/BuilderComponents.vue'
import RightSidebarEditor from '../Components/PageBuilder/EditorMenu/RightSidebarEditor.vue'
import { sharedPageBuilderPinia, sharedPageBuilderStore } from '../stores/shared-store'
import ToolbarOption from '../Components/PageBuilder/ToolbarOption/ToolbarOption.vue'
import { delay } from '../composables/delay'
import { useDebounce } from '../composables/useDebounce.ts'
import DynamicModalBuilder from '../Components/Modals/DynamicModalBuilder.vue'
import GlobalLoader from '../Components/Loaders/GlobalLoader.vue'
import { useTranslations } from '../composables/useTranslations'
import { getPageBuilder } from '../composables/builderInstance'
import UndoRedo from '../Components/PageBuilder/UndoRedo/UndoRedo.vue'

const pageBuilderService = getPageBuilder()

/**
 * Props for PageBuilder component
 * @typedef {Object} Props
 * @property {Object|null} CustomMediaLibraryComponent - Custom media component
 * @property {Object|null} CustomBuilderComponents - Custom component
 * @property {Object} configPageBuilder - Configuration object containing:
 */
const props = defineProps({
  CustomMediaLibraryComponent: {
    type: Object,
    default: null,
  },
  CustomBuilderComponents: {
    type: Object,
    default: null,
  },
  showCloseButton: {
    type: Boolean,
    default: false,
  },
  showPublishButton: {
    type: Boolean,
    default: false,
  },
})

const { translate, loadTranslations } = useTranslations()

// Use shared Pinia instance for PageBuilder package
const internalPinia = sharedPageBuilderPinia

const pageBuilderStateStore = sharedPageBuilderStore

// Provide store for child components (all pointing to the same consolidated store)
provide('pageBuilderStateStore', pageBuilderStateStore)
// Provide the internal Pinia instance for components that need to create stores
provide('internalPinia', internalPinia)
// Provide custom components for child components
provide('CustomMediaComponent', props.CustomMediaLibraryComponent)
provide('CustomBuilderComponents', props.CustomBuilderComponents)

const emit = defineEmits(['handleClosePageBuilder', 'handlePublishPageBuilder'])

const gridColumnModalCloseNoSave = ref(Number(1))
const typeModalloseNoSave = ref('')
const showModalCloseNoSave = ref(false)
const titleModalCloseNoSave = ref('')
const descriptionModalCloseNoSave = ref('')
const firstButtonCloseNoSave = ref('')
const secondButtonCloseNoSave = ref(null)
const thirdButtonCloseNoSave = ref(null)
const firstModalButtonCloseNoSaveFunction = ref(null)
const secondModalButtonCloseNoSaveFunction = ref(null)
const thirdModalButtonCloseNoSaveFunction = ref(null)

const closePageBuilder = async function () {
  typeModalloseNoSave.value = 'warning'
  showModalCloseNoSave.value = true

  titleModalCloseNoSave.value = translate('Continue Your Work?')
  descriptionModalCloseNoSave.value = translate(
    'Are you sure you want to close the Page Builder? All unsaved changes will be lost.',
  )
  firstButtonCloseNoSave.value = null
  secondButtonCloseNoSave.value = translate('Close Page Builder')
  thirdButtonCloseNoSave.value = null

  firstModalButtonCloseNoSaveFunction.value = async function () {
    showModalCloseNoSave.value = false
  }

  secondModalButtonCloseNoSaveFunction.value = function () {
    acceptClosePageBuilder()
  }

  thirdModalButtonCloseNoSaveFunction.value = async function () {
    //
  }

  // end modal
}

const acceptClosePageBuilder = function () {
  showModalCloseNoSave.value = false
  emit('handleClosePageBuilder')
}
const closePublish = async function () {
  pageBuilderStateStore.setIsLoadingGlobal(true)
  await pageBuilderService.handleManualSave()
  pageBuilderStateStore.setIsLoadingGlobal(false)
  emit('handlePublishPageBuilder')
}

// Provide modal close function for custom components
const closeAddComponentModal = () => {
  showModalAddComponent.value = false
}
provide('closeAddComponentModal', closeAddComponentModal)

const languageSelction = ref('en')

let isInitializingLang = true
const isLoadingLang = ref(false)

// Watch for changes in languageSelction
watch(languageSelction, async (newVal) => {
  if (newVal && !isInitializingLang) {
    isLoadingLang.value = true
    await delay(200)
    await loadTranslations(newVal)
    pageBuilderService.changeLanguage(newVal)

    // Ensure lang is updated within userSettings
    const userSettings = JSON.parse(localStorage.getItem('userSettingsPageBuilder')) || {}
    userSettings.lang = newVal
    localStorage.setItem('userSettingsPageBuilder', JSON.stringify(userSettings))
    isLoadingLang.value = false
  }
})

const getBuilderStarted = computed(() => {
  return pageBuilderStateStore.getBuilderStarted
})
const getPageBuilderConfig = computed(() => {
  return pageBuilderStateStore.getPageBuilderConfig
})

const getMenuRight = computed(() => {
  return pageBuilderStateStore.getMenuRight
})
const openPageBuilderPreviewModal = ref(false)
const titleBuilderDesktop = ref('')
const titleBuilderMobile = ref('')

const previewCurrentDesign = function () {
  pageBuilderService.previewCurrentDesign()
}
const handlePageBuilderPreview = function () {
  titleBuilderDesktop.value = translate('Preview')
  previewCurrentDesign()
  openPageBuilderPreviewModal.value = true
}

const openPageBuilderPreviewMobile = ref(false)

const previewCurrentDesignMobile = function () {
  pageBuilderService.previewCurrentDesign()
}
const handlePageBuilderPreviewMobile = function () {
  titleBuilderMobile.value = translate('Mobile')
  previewCurrentDesignMobile()
  openPageBuilderPreviewMobile.value = true
}

const openAppNotStartedModal = ref(false)

const handlAppNotStartedModal = function () {
  openAppNotStartedModal.value = false
}

const firstPageBuilderPreviewModalButton = function () {
  openPageBuilderPreviewModal.value = false
}
const firstPageBuilderPreviewModalButtonMobile = function () {
  openPageBuilderPreviewMobile.value = false
}

const showModalAddComponent = ref(false)
const titleModalAddComponent = ref('')
const firstButtonTextSearchComponents = ref('')
const firstModalButtonSearchComponentsFunction = ref(null)

const toggleAddComponentModal = async function () {
  await pageBuilderService.clearHtmlSelection()

  //
  titleModalAddComponent.value = translate('Add Components to Page')
  firstButtonTextSearchComponents.value = translate('Close')
  showModalAddComponent.value = true

  firstModalButtonSearchComponentsFunction.value = function () {
    // handle show modal for unique content
    showModalAddComponent.value = false
  }

  // end modal
}

const handleInsertButtonClick = function (id) {
  pageBuilderStateStore.setAddComponentAddIndex(id)
  pageBuilderStateStore.setComponentArrayAddMethod('insert')
  toggleAddComponentModal()
}

const getElement = computed(() => {
  return pageBuilderStateStore.getElement
})

const getComponents = computed(() => {
  return pageBuilderStateStore.getComponents
})

const getHasLocalDraftForUpdate = computed(() => {
  return pageBuilderStateStore.getHasLocalDraftForUpdate
})

const getToggleGlobalHtmlMode = computed(() => {
  return pageBuilderStateStore.getToggleGlobalHtmlMode
})

watch(getHasLocalDraftForUpdate, (newVal) => {
  if (newVal) {
    handlerRumeEditingForUpdate()
  }
})

const getElementAttributes = computed(() => {
  if (!getElement.value || !(getElement.value instanceof HTMLElement)) {
    return ''
  }

  // Extract the attributes to watch
  const attributesToWatch = {
    src: getElement.value.getAttribute('src'),
    href: getElement.value.getAttribute('href'),
    style: getElement.value.getAttribute('style'),
    class: getElement.value.getAttribute('class'),
    dataImage: getElement.value.getAttribute('data-image'),
  }

  return attributesToWatch
})

const debounce = useDebounce()

watch(getElementAttributes, async (newAttributes, oldAttributes) => {
  // Only run if attributes actually changed
  if (
    newAttributes?.src !== oldAttributes?.src ||
    newAttributes?.href !== oldAttributes?.href ||
    newAttributes?.style !== oldAttributes?.style ||
    newAttributes?.class !== oldAttributes?.class ||
    newAttributes?.dataImage !== oldAttributes?.dataImage
  ) {
    debounce(async () => {
      await pageBuilderService.initializeElementStyles()
    }, 200)
  }
})

const handleSelectComponent = function (componentObject) {
  pageBuilderStateStore.setComponent(componentObject)
}

const getIsLoadingGlobal = computed(() => {
  return pageBuilderStateStore.getIsLoadingGlobal
})
const getIsSaving = computed(() => {
  return pageBuilderStateStore.getIsSaving
})

const getIsLoadingResumeEditing = computed(() => {
  return pageBuilderStateStore.getIsLoadingResumeEditing
})
const getIsRestoring = computed(() => {
  return pageBuilderStateStore.getIsRestoring
})

const gridColumnModalResumeEditing = ref(Number(1))
const typeModal = ref('')
const showModalResumeEditing = ref(false)
const titleModalResumeEditing = ref('')
const descriptionModalResumeEditing = ref('')
const firstButtonResumeEditing = ref('')
const secondButtonResumeEditing = ref(null)
const thirdButtonResumeEditing = ref(null)
const firstModalButtonResumeEditingFunction = ref(null)
const secondModalButtonResumeEditingFunction = ref(null)
const thirdModalButtonResumeEditingFunction = ref(null)

const handlerRumeEditingForUpdate = async function () {
  typeModal.value = 'warning'
  showModalResumeEditing.value = true

  titleModalResumeEditing.value = translate('Continue Your Work?')
  descriptionModalResumeEditing.value = translate(
    'We noticed you have some changes that weren’t saved last time. Would you like to pick up where you left off, or use the version that’s currently loaded from the database?',
  )
  firstButtonResumeEditing.value = translate('Use Saved Version')
  secondButtonResumeEditing.value = null
  thirdButtonResumeEditing.value = translate('Continue Where I Left Off')

  firstModalButtonResumeEditingFunction.value = async function () {
    pageBuilderStateStore.setHasLocalDraftForUpdate(false)
    showModalResumeEditing.value = false
  }

  secondModalButtonResumeEditingFunction.value = function () {}

  thirdModalButtonResumeEditingFunction.value = async function () {
    await pageBuilderService.resumeEditingFromDraft()
    pageBuilderStateStore.setHasLocalDraftForUpdate(false)

    showModalResumeEditing.value = false
  }

  // end modal
}

const gridColumnModalRestore = ref(Number(1))
const typeModalRestore = ref('')
const showModalRestore = ref(false)
const titleModalRestore = ref('')
const descriptionModalRestore = ref('')
const firstButtonRestore = ref('')
const secondButtonRestore = ref(null)
const thirdButtonRestore = ref(null)
const firstModalButtonRestoreFunction = ref(null)
const secondModalButtonRestoreFunction = ref(null)
const thirdModalButtonRestoreFunction = ref(null)

const handleRestoreOriginalContent = async function () {
  await pageBuilderService.clearHtmlSelection()

  typeModalRestore.value = 'success'
  showModalRestore.value = true

  titleModalRestore.value = translate('Do you want to reset this page?')
  descriptionModalRestore.value = translate(
    'Are you sure you want to reset this page? This will overwrite your current changes.',
  )
  firstButtonRestore.value = translate('Close')
  secondButtonRestore.value = null
  thirdButtonRestore.value = translate('Reset changes')

  firstModalButtonRestoreFunction.value = function () {
    showModalRestore.value = false
  }

  secondModalButtonRestoreFunction.value = async function () {}
  thirdModalButtonRestoreFunction.value = async function () {
    await pageBuilderService.restoreOriginalContent()
    showModalRestore.value = false
  }

  // end modal
}

// HTML editor logic start
const getShowModalHTMLEditor = computed(() => pageBuilderStateStore.getShowModalHTMLEditor)

const elementHTML = computed(() => {
  if (!getElement.value || !(getElement.value instanceof HTMLElement)) {
    return ''
  }
  return getElement.value.outerHTML
})

const editableHtml = ref('')
const editableComponents = ref('')

watch(getShowModalHTMLEditor, async (newVal) => {
  if (newVal) {
    if (!getToggleGlobalHtmlMode.value) {
      editableHtml.value = elementHTML.value
      return
    }

    editableComponents.value = await pageBuilderService.generateHtmlFromComponents()
  }
})

const handleCloseHTMLEditor = () => {
  pageBuilderStateStore.setShowModalHTMLEditor(false)
}

const isLoading = ref(false)
const errSaveComponents = ref(null)

const handleSaveChangesElement = async () => {
  errSaveComponents.value = null
  isLoading.value = true
  await delay(300)

  const error = await pageBuilderService.applyModifiedHTML(editableHtml.value)

  if (error) {
    errSaveComponents.value = error
    isLoading.value = false
    return
  }

  pageBuilderStateStore.setShowModalHTMLEditor(false)
  isLoading.value = false
}

const handleSaveChangesComponents = async () => {
  errSaveComponents.value = null
  isLoading.value = true
  errSaveComponents.value = null
  await delay(300)

  const error = await pageBuilderService.applyModifiedComponents(editableComponents.value)

  if (error) {
    errSaveComponents.value = error
    isLoading.value = false
    return
  }

  pageBuilderStateStore.setShowModalHTMLEditor(false)
  isLoading.value = false
}
// HTML editor logic end

const ensureBuilderInitialized = function () {
  if (!getBuilderStarted.value) {
    openAppNotStartedModal.value = true
  }
}

const pbxBuilderWrapper = ref(null)

const hideToolbar = function () {
  const toolbar = document.querySelector('#pbxEditToolbar')
  if (toolbar) {
    toolbar.classList.remove('is-visible')
    toolbar.removeAttribute('style')
  }
}

function updatePanelPosition() {
  const container = pbxBuilderWrapper.value
  const editToolbarElement = container && container.querySelector('#pbxEditToolbar')

  if (!container || !editToolbarElement) return

  const selected = container.querySelector('[selected]')

  if (selected && typeof selected.getBoundingClientRect === 'function') {
    const selectedRect = selected.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()

    let left =
      selectedRect.left -
      containerRect.left +
      selectedRect.width / 2 -
      editToolbarElement.offsetWidth / 2

    // Add margin so toolbar is never flush with the left edge
    const margin = 20 // px
    left = Math.max(
      margin,
      Math.min(left, container.offsetWidth - editToolbarElement.offsetWidth - margin),
    )

    const GAP = 20 // px
    const proposedTop =
      selectedRect.top -
      containerRect.top +
      container.scrollTop -
      editToolbarElement.offsetHeight -
      GAP

    const top = Math.max(0, proposedTop)

    editToolbarElement.style.position = 'absolute'
    editToolbarElement.style.left = `${left}px`
    editToolbarElement.style.top = `${top}px`
    editToolbarElement.classList.add('is-visible')
  } else {
    editToolbarElement.classList.remove('is-visible')
    editToolbarElement.removeAttribute('style')
  }
}

const userSettings = JSON.parse(localStorage.getItem('userSettingsPageBuilder'))

onMounted(async () => {
  await pageBuilderService.completeBuilderInitialization(undefined, true)

  if (userSettings && userSettings.lang) {
    languageSelction.value = userSettings.lang
  }
  if (
    getPageBuilderConfig.value &&
    getPageBuilderConfig.value.userSettings &&
    getPageBuilderConfig.value.userSettings.language &&
    getPageBuilderConfig.value.userSettings.language.default &&
    (!userSettings || !userSettings.lang)
  ) {
    languageSelction.value = getPageBuilderConfig.value.userSettings.language.default
  }

  await loadTranslations(languageSelction.value)
  isInitializingLang = false

  updatePanelPosition()

  // Set up MutationObserver and event listeners
  const container = pbxBuilderWrapper.value
  if (!container) return

  const observer = new MutationObserver(updatePanelPosition)
  observer.observe(container, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['selected'],
  })

  window.addEventListener('scroll', updatePanelPosition)
  window.addEventListener('resize', updatePanelPosition)

  //
  //
  //
  //
  // Check if Builder started
  await delay(10000)
  ensureBuilderInitialized()

  // Re-check if Builder started
  await delay(10000)
  ensureBuilderInitialized()

  // Re-check again if Builder started
  await delay(10000)
  ensureBuilderInitialized()
})
</script>

<template>
  <div
    class="lg:min-w-full lg:max-w-full lg:w-full mx-auto flex flex-col font-sans text-black border-solid border border-gray-400 inset-x-0 z-10 bg-white overflow-x-auto h-full"
  >
    <GlobalLoader
      v-if="(getIsLoadingGlobal && !openAppNotStartedModal) || isLoadingLang"
    ></GlobalLoader>
    <ModalBuilder
      title="The builder hasn’t started yet"
      :showModalBuilder="openAppNotStartedModal"
      @closeMainModalBuilder="handlAppNotStartedModal"
      type="delete"
      maxWidth="2xl"
      :noBackgroundOpacity="true"
    >
      The builder hasn’t started yet. If this screen doesn’t go away soon, it may just need a little
      setup in the background. You can safely contact support and ask them to initialize the builder
      by running the startBuilder method for this resource.
    </ModalBuilder>

    <BuilderComponents
      v-if="showModalAddComponent"
      :show="showModalAddComponent"
      :firstButtonText="firstButtonTextSearchComponents"
      :title="titleModalAddComponent"
      :CustomBuilderComponents="props.CustomBuilderComponents"
      @firstModalButtonSearchComponentsFunction="firstModalButtonSearchComponentsFunction"
    ></BuilderComponents>

    <DynamicModalBuilder
      :showDynamicModalBuilder="showModalCloseNoSave"
      :isLoading="false"
      :type="typeModalloseNoSave"
      :gridColumnAmount="gridColumnModalCloseNoSave"
      :title="titleModalCloseNoSave"
      :description="descriptionModalCloseNoSave"
      :firstButtonText="firstButtonCloseNoSave"
      :secondButtonText="secondButtonCloseNoSave"
      :thirdButtonText="thirdButtonCloseNoSave"
      @firstModalButtonFunctionDynamicModalBuilder="firstModalButtonCloseNoSaveFunction"
      @secondModalButtonFunctionDynamicModalBuilder="secondModalButtonCloseNoSaveFunction"
      @thirdModalButtonFunctionDynamicModalBuilder="thirdModalButtonCloseNoSaveFunction"
    >
      <header></header>
      <main></main>
    </DynamicModalBuilder>

    <ModalBuilder
      :title="titleBuilderDesktop"
      :showModalBuilder="openPageBuilderPreviewModal"
      @closeMainModalBuilder="firstPageBuilderPreviewModalButton"
      maxWidth="screen"
    >
      <Preview></Preview>
    </ModalBuilder>

    <ModalBuilder
      :title="titleBuilderMobile"
      :showModalBuilder="openPageBuilderPreviewMobile"
      @closeMainModalBuilder="firstPageBuilderPreviewModalButtonMobile"
      maxWidth="lg"
    >
      <Preview :mobile="true" />
    </ModalBuilder>

    <DynamicModalBuilder
      :showDynamicModalBuilder="showModalResumeEditing"
      :isLoading="getIsLoadingResumeEditing"
      :type="typeModal"
      :gridColumnAmount="gridColumnModalResumeEditing"
      :title="titleModalResumeEditing"
      :description="descriptionModalResumeEditing"
      :firstButtonText="firstButtonResumeEditing"
      :secondButtonText="secondButtonResumeEditing"
      :thirdButtonText="thirdButtonResumeEditing"
      @firstModalButtonFunctionDynamicModalBuilder="firstModalButtonResumeEditingFunction"
      @secondModalButtonFunctionDynamicModalBuilder="secondModalButtonResumeEditingFunction"
      @thirdModalButtonFunctionDynamicModalBuilder="thirdModalButtonResumeEditingFunction"
    >
      <header></header>
      <main></main>
    </DynamicModalBuilder>
    <DynamicModalBuilder
      :showDynamicModalBuilder="showModalRestore"
      :isLoading="getIsRestoring"
      :type="typeModalRestore"
      :gridColumnAmount="gridColumnModalRestore"
      :title="titleModalRestore"
      :description="descriptionModalRestore"
      :firstButtonText="firstButtonRestore"
      :secondButtonText="secondButtonRestore"
      :thirdButtonText="thirdButtonRestore"
      @firstModalButtonFunctionDynamicModalBuilder="firstModalButtonRestoreFunction"
      @secondModalButtonFunctionDynamicModalBuilder="secondModalButtonRestoreFunction"
      @thirdModalButtonFunctionDynamicModalBuilder="thirdModalButtonRestoreFunction"
    >
      <header></header>
      <main></main>
    </DynamicModalBuilder>

    <div
      id="pagebuilder-navbar"
      class="lg:min-w-full lg:max-w-full lg:w-full min-w-[64rem] max-w-[64rem] w-[64rem] flex-1 bg-myPrimaryLightGrayColor flex items-center justify-between border-0 border-solid border-b border-gray-200 mb-2 font-sans min-h-20 sticky top-0 z-20"
    >
      <template
        v-if="
          getPageBuilderConfig &&
          getPageBuilderConfig.pageBuilderLogo &&
          getPageBuilderConfig.pageBuilderLogo.src
        "
      >
        <!-- Logo # start -->
        <div
          @click.self="
            async () => {
              await pageBuilderService.clearHtmlSelection()
            }
          "
          class="flex justify-start py-2 lg:ml-4 ml-2"
        >
          <img class="h-6" :src="getPageBuilderConfig.pageBuilderLogo.src" alt="Logo" />
        </div>
      </template>
      <!-- Logo # end -->

      <UndoRedo @toolbar-hide-request="hideToolbar"></UndoRedo>

      <div
        @click.self="
          async () => {
            await pageBuilderService.clearHtmlSelection()
          }
        "
        class="flex-1 flex justify-center items-center py-2 w-full"
      >
        <div class="flex items-center justify-center">
          <!-- Save Start -->
          <button
            class="pbx-mySecondaryButton h-6 flex gap-2 mr-2"
            @click.stop="
              async () => {
                await pageBuilderService.clearHtmlSelection()
                await pageBuilderService.handleManualSave()
              }
            "
            type="button"
            :disabled="getIsSaving"
          >
            <div
              v-if="!getIsSaving"
              class="h-10 w-4 cursor-pointer rounded-full flex items-center justify-center"
            >
              <span class="material-symbols-outlined">save</span>
            </div>
            <div
              v-if="getIsSaving"
              class="h-10 w-4 cursor-pointer rounded-full flex items-center justify-center"
            >
              <span class="relative flex size-3">
                <span
                  class="absolute inline-flex h-full w-full animate-ping rounded-full bg-gray-400 opacity-75"
                ></span>
                <span
                  class="relative inline-flex size-3 rounded-full bg-green-200"
                ></span>
              </span>
            </div>
            <div>{{ translate('Save') }}</div>
          </button>
          <!-- Save End -->

          <!-- Restore Start -->
          <template
            v-if="
              getPageBuilderConfig &&
              getPageBuilderConfig.updateOrCreate &&
              getPageBuilderConfig.updateOrCreate.formType === 'update'
            "
          >
            <button
              class="pbx-mySecondaryButton h-6 flex gap-2 lg:mr-2 mr-2"
              @click.stop="
                async () => {
                  await pageBuilderService.clearHtmlSelection()
                  await handleRestoreOriginalContent()
                }
              "
              type="button"
              :disabled="getIsRestoring"
            >
              <div
                v-if="!getIsRestoring"
                class="h-10 w-4 cursor-pointer rounded-full flex items-center justify-center"
              >
                <span class="material-symbols-outlined"> settings_backup_restore </span>
              </div>
              <div
                v-if="getIsRestoring"
                class="h-10 w-4 cursor-pointer rounded-full flex items-center justify-center"
              >
                <span class="relative flex size-3">
                  <span
                    class="absolute inline-flex h-full w-full animate-ping rounded-full bg-gray-400 opacity-75"
                  ></span>
                  <span
                    class="relative inline-flex size-3 rounded-full bg-green-200"
                  ></span>
                </span>
              </div>
              <div class="lg:block hidden">
                <span> {{ translate('Reset Page') }} </span>
              </div>
              <div class="lg:hidden block">
                <span> {{ translate('Reset') }} </span>
              </div>
            </button>
          </template>
          <!-- Restore End -->
        </div>
      </div>

      <div
        @click.self="
          async () => {
            await pageBuilderService.clearHtmlSelection()
          }
        "
        class="flex-1 flex justify-center items-center py-2 w-full"
      >
        <div
          @click.self="
            async () => {
              await pageBuilderService.clearHtmlSelection()
            }
          "
          class="flex items-center justify-center"
        >
          <div
            class="mr-2"
            @click="
              () => {
                pageBuilderStateStore.setComponentArrayAddMethod('unshift')
                toggleAddComponentModal()
              }
            "
          >
            <div class="flex items-center justify-center gap-2 border-gray-200">
              <span
                class="h-10 w-10 cursor-pointer rounded-full flex items-center border-none justify-center bg-gray-50 aspect-square hover:bg-myPrimaryLinkColor focus-visible:ring-0 text-black hover:text-white"
              >
                <span class="pbx-myMediumIcon material-symbols-outlined"> add </span>
              </span>
              <span class="cursor-pointer lg:block lg:pr-4 hidden">
                {{ translate('Add') }}
              </span>
            </div>
          </div>
          <div class="flex items-center justify-center mr-2">
            <div
              @click="
                async () => {
                  pageBuilderStateStore.setMenuRight(false)
                  pageBuilderStateStore.setElement(null)
                  await pageBuilderService.clearHtmlSelection()
                  handlePageBuilderPreview()
                }
              "
            >
              <div class="flex items-center justify-center gap-2">
                <span
                  class="h-10 w-10 cursor-pointer rounded-full flex items-center border-none justify-center bg-gray-50 aspect-square hover:bg-myPrimaryLinkColor focus-visible:ring-0 text-black hover:text-white"
                >
                  <span>
                    <svg
                      fill="currentColor"
                      height="22"
                      viewBox="0 0 22 22"
                      width="22"
                      xmlns="http://www.w3.org/2000/svg"
                      style="display: block"
                    >
                      <path
                        clip-rule="evenodd"
                        d="M2 3h18v13h-8v2h3v2H7v-2h3v-2H2V3zm2 2v9h14V5H4z"
                        fill-rule="evenodd"
                      ></path>
                    </svg>
                  </span>
                </span>
              </div>
            </div>
          </div>
          <div class="lg:flex hidden items-center justify-center">
            <div
              @click="
                async () => {
                  pageBuilderStateStore.setMenuRight(false)
                  pageBuilderStateStore.setElement(null)
                  await pageBuilderService.clearHtmlSelection()
                  handlePageBuilderPreviewMobile()
                }
              "
            >
              <div class="flex items-center justify-center gap-2">
                <span
                  class="h-10 w-10 cursor-pointer rounded-full flex items-center border-none justify-center bg-gray-50 aspect-square hover:bg-myPrimaryLinkColor focus-visible:ring-0 text-black hover:text-white"
                >
                  <svg
                    fill="currentColor"
                    height="22"
                    viewBox="0 0 22 22"
                    width="22"
                    xmlns="http://www.w3.org/2000/svg"
                    style="display: block"
                  >
                    <path d="M14 16H8v2h6v-2z"></path>
                    <path
                      d="M14 1H8a3 3 0 00-3 3v14a3 3 0 003 3h6a3 3 0 003-3V4a3 3 0 00-3-3zM7 4a1 1 0 011-1h6a1 1 0 011 1v14a1 1 0 01-1 1H8a1 1 0 01-1-1V4z"
                    ></path>
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex-1 flex gap-2 items-center justify-end">
        <!-- Options # Start -->
        <div
          @click.self="
            async () => {
              await pageBuilderService.clearHtmlSelection()
            }
          "
          class="flex items-center py-2 w-full"
          :class="[showCloseButton ? 'justify-between' : 'justify-end']"
        >
          <ToolbarOption></ToolbarOption>
        </div>
        <!-- Options # Start -->

        <!-- Publish buttons start -->
        <template v-if="showPublishButton">
          <div class="flex-1 ml-2">
            <button
              class="pbx-myPrimaryButton"
              @click="
                async () => {
                  closePublish()
                }
              "
            >
              {{ translate('Publish') }}
            </button>
          </div>
        </template>
        <!-- Publish buttons end -->

        <template
          v-if="
            pageBuilderService &&
            getPageBuilderConfig &&
            getPageBuilderConfig.userSettings &&
            getPageBuilderConfig.userSettings.language &&
            !getPageBuilderConfig.userSettings.language.disableLanguageDropDown
          "
        >
          <template
            v-if="
              getPageBuilderConfig &&
              getPageBuilderConfig.userSettings &&
              getPageBuilderConfig.userSettings.language
            "
          >
            <div
              class="flex-1 flex justify-end items-center ml-2 lg:mr-4 mr-2"
            >
              <select
                id="lang"
                class="pbx-myPrimarySelect min-w-20"
                v-model="languageSelction"
              >
                <template
                  v-if="
                    Array.isArray(getPageBuilderConfig.userSettings.language.enable) &&
                    getPageBuilderConfig.userSettings.language.enable.length >= 1
                  "
                >
                  <option
                    v-for="lang in pageBuilderService
                      .availableLanguage()
                      .filter((l) => getPageBuilderConfig.userSettings.language.enable.includes(l))"
                    :key="lang"
                    :value="lang"
                  >
                    {{ lang }}
                  </option>
                </template>
                <template
                  v-if="
                    !getPageBuilderConfig.userSettings.language.enable ||
                    (Array.isArray(getPageBuilderConfig.userSettings.language.enable) &&
                      getPageBuilderConfig.userSettings.language.enable.length === 0)
                  "
                >
                  <option
                    v-for="lang in pageBuilderService.availableLanguage()"
                    :key="lang"
                    :value="lang"
                  >
                    {{ lang }}
                  </option>
                </template>
              </select>
            </div>
          </template>
        </template>
        <template v-if="showCloseButton">
          <div class="flex-1 ml-2 mr-2">
            <button
              class="h-10 w-10 flex-end cursor-pointer rounded-full flex items-center border-none justify-center bg-gray-50 aspect-square hover:bg-myPrimaryLinkColor hover:text-white hover:fill-white focus-visible:ring-0"
              @click="
                async () => {
                  closePageBuilder()
                  await pageBuilderService.clearHtmlSelection()
                }
              "
            >
              <span class="material-symbols-outlined"> close </span>
            </button>
          </div>
        </template>
      </div>
    </div>
    <!-- Top Layout Save And Reset Area - End -->

    <!-- Page Builder Main Start -->
    <div
      id="pagebuilder-main"
      class="lg:min-w-full lg:max-w-full lg:w-full min-w-[64rem] max-w-[64rem] w-[64rem] flex-1 relative h-full flex pb-2 gap-2"
    >
      <!-- Left Menu Start -->
      <div
        @click.self="
          async () => {
            await pageBuilderService.clearHtmlSelection()
          }
        "
        id="pagebuilder-left-menu"
        class="w-16 pt-7 pb-2 bg-myPrimaryLightGrayColor rounded-r-2xl shadow-sm"
      >
        <div class="mx-2 flex flex-col pbx-myPrimaryGap items-stretch">
          <div
            @click.self="
              async () => {
                await pageBuilderService.clearHtmlSelection()
              }
            "
          >
            <ComponentTopMenu></ComponentTopMenu>
          </div>
        </div>
      </div>
      <!-- Left Menu End -->

      <main
        ref="pbxBuilderWrapper"
        id="page-builder-wrapper"
        class="transition-all duration-300 font-sans p-1 flex flex-col grow rounded-tr-2xl rounded-tl-2xl border-solid border border-gray-200 items-stretch text-black h-[100vh] overflow-y-scroll relative pt-16"
        :class="[getMenuRight ? 'w-full' : 'w-full']"
      >
        <div
          id="pbxEditToolbar"
          class="z-30 flex gap-2 justify-center items-center rounded-sm px-2 h-0 min-w-52 relative"
        >
          <template v-if="getElement">
            <EditGetElement></EditGetElement>
          </template>
        </div>
        <!-- Element Popover toolbar end -->

        <div id="pagebuilder" class="text-black font-sans">
          <!-- Insert button when empty of componenets -->
          <div
            v-if="Array.isArray(getComponents) && getComponents.length === 0"
            id="nolocalstorage"
          >
            <div class="flex justify-center w-full absolute items-center">
              <div
                @click="handleInsertButtonClick(0)"
                class="py-4 px-4 my-4 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center hover:text-white hover:bg-gray-900 cursor-pointer"
              >
                <div class="flex items-center gap-2">
                  <span
                    class="font-medium break-words lg:text-lg md:text-lg text-base font-sans"
                  >
                    {{ translate('Add new Components') }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <!-- Insert button at the top -->
          <div v-if="Array.isArray(getComponents) && getComponents.length != 0" id="nolocalstorage">
            <div
              class="flex justify-end w-full h-0 items-center border border-transparent hover:border hover:border-gray-200 rounded-r-full z-10"
            >
              <div
                @click="handleInsertButtonClick(0)"
                id="addsection"
                class="h-10 rounded-l-full bg-gray-100 text-gray-600 z-50 pl-2 pr-2 flex items-center justify-center hover:text-white hover:bg-gray-900 cursor-pointer"
              >
                <div class="flex items-center gap-1">
                  <span class="material-symbols-outlined"> add </span>
                  <span class="lg:block hidden"> {{ translate('Add') }}</span>
                </div>
              </div>
            </div>
          </div>
          <template v-for="(component, idx) in getComponents" :key="component.id">
            <div
              v-if="component.html_code"
              v-html="component.html_code"
              @mouseup="handleSelectComponent(component)"
            ></div>
            <!-- Insert button between components -->
            <div
              v-if="Array.isArray(getComponents) && getComponents.length != 0"
              id="nolocalstorage"
            >
              <div
                class="flex justify-end w-full h-0 items-center border border-transparent hover:border hover:border-gray-200 rounded-r-full z-10"
              >
                <div
                  @click="handleInsertButtonClick(idx + 1)"
                  id="addsection"
                  class="h-10 rounded-l-full bg-gray-100 text-gray-600 z-50 pl-2 pr-2 flex items-center justify-center hover:text-white hover:bg-gray-900 cursor-pointer"
                >
                  <div class="flex items-center gap-1">
                    <span class="material-symbols-outlined"> add </span>
                    <span class="lg:block hidden"> {{ translate('Add') }}</span>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </main>

      <transition name="slide-right" appear mode="out-in">
        <aside
          v-if="getMenuRight"
          aria-label="menu"
          id="pagebuilder-right-menu"
          class="z-20 flex-shrink-0 overflow-hidden border-0 border-solid border-l-0 border-l-gray-600 rounded-l-2xl h-[100vh] pl-2"
          :class="[
            getMenuRight
              ? 'w-80 bg-myPrimaryLightGrayColor items-stretch'
              : 'bpx-w-0 mr-0',
          ]"
        >
          <RightSidebarEditor @closeEditor="pageBuilderStateStore.setMenuRight(false)">
          </RightSidebarEditor>
        </aside>
        <div
          v-else
          @click.self="
            async () => {
              await pageBuilderService.clearHtmlSelection()
            }
          "
          class="w-18 bg-myPrimaryLightGrayColor pt-5 z-20 flex-shrink-0 overflow-hidden border-0 border-solid border-l-0 border-l-gray-600 rounded-l-2xl h-[100vh] pl-2 pr-2"
        >
          <div
            @click.self="
              async () => {
                await pageBuilderService.clearHtmlSelection()
              }
            "
            class="flex flex-col items-center justify-center gap-2"
          >
            <button
              v-if="!getMenuRight"
              @click="pageBuilderStateStore.setMenuRight(true)"
              type="button"
              class="h-10 w-10 cursor-pointer rounded-full flex items-center border-none justify-center bg-gray-50 aspect-square hover:bg-myPrimaryLinkColor focus-visible:ring-0 text-black hover:text-white"
            >
              <span>
                <svg
                  fill="currentColor"
                  height="22"
                  viewBox="0 0 22 22"
                  width="22"
                  xmlns="http://www.w3.org/2000/svg"
                  style="display: block"
                >
                  <g clip-path="url(#prefix__clip0_1645_485)">
                    <path
                      clip-rule="evenodd"
                      d="M19.871 1.81a2.768 2.768 0 00-3.914 0l-3.543 3.544-2.5-2.5L0 12.768l8.914 8.914 9.914-9.914-2.5-2.5 3.543-3.543a2.768 2.768 0 000-3.914zm-2.5 1.415a.768.768 0 011.086 1.086L13.5 9.268l2.5 2.5-1.086 1.086-6.086-6.086 1.086-1.086 2.5 2.5 4.957-4.957zM7.414 8.182l-4.586 4.586 1.086 1.086 3.293-3.293 1.414 1.414-3.293 3.293 1.086 1.086 3.293-3.293 1.414 1.414-3.293 3.293 1.086 1.086 4.586-4.586-6.086-6.086z"
                      fill-rule="evenodd"
                    ></path>
                  </g>
                  <defs>
                    <clipPath id="prefix__clip0_1645_485">
                      <path d="M0 0h22v22H0z" fill="#fff"></path>
                    </clipPath>
                  </defs>
                </svg>
              </span>
            </button>
          </div>
        </div>
      </transition>
    </div>
    <!-- Page Builder Main End -->
  </div>
  <ModalBuilder
    maxWidth="7xl"
    :showModalBuilder="getShowModalHTMLEditor"
    :title="translate('HTML Editor')"
    @closeMainModalBuilder="handleCloseHTMLEditor"
  >
    <template v-if="!getToggleGlobalHtmlMode">
      <textarea
        id="html-editor"
        v-model="editableHtml"
        class="h-full font-sans bg-gray-900 text-white w-full"
        style="overflow: auto; min-height: 400px"
      ></textarea>
      <div class="flex justify-end min-h-6">
        <p v-if="errSaveComponents" class="pbx-myPrimaryParagraphError">
          Error: {{ errSaveComponents }}
        </p>
      </div>
      <div
        class="border-0 border-solid border-t border-gray-200 flex items-center justify-end"
      >
        <div class="py-4 flex sm:justify-end justify-center">
          <div
            class="sm:grid-cols-2 sm:items-end sm:justify-end flex flex-row pbx-myPrimaryGap w-full"
          >
            <template v-if="!isLoading">
              <button @click="handleCloseHTMLEditor" type="button" class="pbx-mySecondaryButton">
                {{ translate('Close') }}
              </button>
              <button @click="handleSaveChangesElement" type="button" class="pbx-myPrimaryButton">
                {{ translate('Save') }}
              </button>
            </template>
            <template v-if="isLoading">
              <div class="flex items-center my-2 justify-end">
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
        </div>
      </div>
    </template>

    <template v-if="getToggleGlobalHtmlMode">
      <textarea
        id="html-editor"
        v-model="editableComponents"
        class="h-full font-sans bg-gray-900 text-white w-full"
        style="overflow: auto; min-height: 400px"
      ></textarea>
      <div class="flex justify-end min-h-6">
        <p v-if="errSaveComponents" class="pbx-myPrimaryParagraphError">
          Error: {{ errSaveComponents }}
        </p>
      </div>
      <div
        class="border-0 border-solid border-t border-gray-200 flex items-center justify-end"
      >
        <div class="py-4 flex sm:justify-end justify-center">
          <div
            class="sm:grid-cols-2 sm:items-end sm:justify-end flex flex-row pbx-myPrimaryGap w-full"
          >
            <template v-if="!isLoading">
              <button @click="handleCloseHTMLEditor" type="button" class="pbx-mySecondaryButton">
                {{ translate('Close') }}
              </button>
              <button
                @click="handleSaveChangesComponents"
                type="button"
                class="pbx-myPrimaryButton"
              >
                {{ translate('Save') }}
              </button>
            </template>
            <template v-if="isLoading">
              <div class="flex items-center my-2 justify-end">
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
        </div>
      </div>
    </template>
  </ModalBuilder>
</template>

<style>
#pagebuilder #nolocalstorage {
  display: flex;
  justify-content: center;
  align-items: center;
}
#pagebuilder #addsection {
  /* display: none; */
}
#pagebuilder #nolocalstorage:hover #addsection {
  display: flex;
  justify-content: center;
  align-items: center;
}

#pagebuilder [element] {
  outline: rgba(255, 255, 255, 0) dashed 3px !important;
  outline-offset: -4px !important;
}

#pagebuilder [hovered] {
  outline: rgb(0, 140, 14, 1) dashed 3px !important;
  outline-offset: -4px !important;
}

#pagebuilder [selected] {
  position: relative;
  outline: rgb(185, 16, 16) dashed 3px !important;
  outline-offset: -4px !important;
}

/* sortable */

.sortable-ghost {
  display: flex;
  justify-content: center;
}

.sortable-ghost > * {
  width: 100%;
}

/* CSS for content inside page builder # start */
#page-builder-editor .tiptap {
  outline: none !important;
  box-shadow: none !important;
  background: #fff;
  min-height: 25rem;
  border-bottom: 1px solid #f1f1f1;
  padding: 0px 0px 10px 16px;
  margin-bottom: 20px;
  padding-bottom: 100px;
}
.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
}

.slide-right-enter-to,
.slide-right-leave-from {
  transform: translateX(0%);
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.1s ease;
}
</style>
