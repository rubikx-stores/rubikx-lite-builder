<script setup>
import DynamicModalBuilder from '../../../Modals/DynamicModalBuilder.vue'
import { ref } from 'vue'
import { getPageBuilder } from '../../../../composables/builderInstance'
import { useTranslations } from '../../../../composables/useTranslations'
import { delay } from '../../../../composables/delay'
import PageBuilderSettings from '../../Settings/PageBuilderSettings.vue'
import ModalBuilder from '../../../../Components/Modals/ModalBuilder.vue'
import FloatingSidePanel from '../../../../Components/Overlays/FloatingSidePanel.vue'

const { translate } = useTranslations()

const pageBuilderService = getPageBuilder()

const isDeletingLayout = ref(false)
const showModalDeleteAllComponents = ref(false)

const typeModal = ref('')
const gridColumnModal = ref(Number(1))
const titleModal = ref('')
const descriptionModal = ref('')
const firstButtonModal = ref('')
const secondButtonModal = ref(null)
const thirdButtonModal = ref(null)

const firstModalButtonFunctionDynamicModalBuilder = ref(null)
const secondModalButtonFunctionDynamicModalBuilder = ref(null)
const thirdModalButtonFunctionDynamicModalBuilder = ref(null)

const handleDeleteComponentsFromDOM = function () {
  showModalDeleteAllComponents.value = true
  typeModal.value = 'delete'
  gridColumnModal.value = 2
  titleModal.value = translate('Remove all Components')
  descriptionModal.value = translate('Are you sure you want to remove all Components?')
  firstButtonModal.value = translate('Close')
  secondButtonModal.value = null
  thirdButtonModal.value = translate('Delete')

  firstModalButtonFunctionDynamicModalBuilder.value = function () {
    showModalDeleteAllComponents.value = false
  }
  secondModalButtonFunctionDynamicModalBuilder.value = function () {}
  thirdModalButtonFunctionDynamicModalBuilder.value = async function () {
    isDeletingLayout.value = true
    await pageBuilderService.clearHtmlSelection()
    await pageBuilderService.handleFormSubmission()
    await delay(500)

    showModalDeleteAllComponents.value = false
    isDeletingLayout.value = false
  }
}

const showMainSettings = ref(false)

const handleMainSettings = function () {
  showMainSettings.value = false
}
const openMainSettings = function () {
  showMainSettings.value = true
}

const seoResult = ref(null)
const showSEO = ref(false)

const handleSEO = async function () {
  showSEO.value = !showSEO.value

  if (showSEO.value) {
    seoResult.value = await pageBuilderService.analyzeSEO()
  }
}

const closeSEO = function () {
  showSEO.value = false
}
</script>

<template>
  <div>
    <div class="flex flex-col items-center justify-center pbx-myPrimaryGap">
      <!-- SEO Start -->
      <div class="flex gap-2 items-center justify-center relative">
        <div
          @click="handleSEO"
          bg-myPrimaryLinkColor
          class="select-none h-10 w-10 cursor-pointer rounded-full flex items-center border-none justify-center bg-gray-50 aspect-square hover:bg-myPrimaryLinkColor focus-visible:ring-0 text-black hover:text-white"
          :class="{ 'bg-myPrimaryLinkColor text-white': showSEO }"
        >
          <div class="font-semibold text-sm">SEO</div>
        </div>

        <!-- Overlay SEO start -->
        <FloatingSidePanel
          title="SEO"
          :showSidebarPanel="showSEO"
          @closeSidebarPanel="closeSEO"
          position="left"
        >
          <!-- score indicator start -->
          <div class="overflow-y-auto">
            <div>
              <!-- score indicator start -->
              <div class="flex items-center justify-center gap-2">
                <div
                  class="lg:text-base text-sm font-semibold text-center min-h-14 flex justify-center items-center"
                >
                  <template v-if="seoResult">
                    <!-- Outer ring -->
                    <div
                      class="relative my-4 rounded-full flex items-center justify-center w-36 h-36"
                      :style="{
                        background: `conic-gradient(${
                          seoResult.score < 50 ? '#ef4444' : '#50C878'
                        } ${seoResult.score}%, #e5e7eb 0)`,
                      }"
                    >
                      <!-- Inner circle -->
                      <div
                        class="bg-gray-100 rounded-full w-32 h-32 flex items-center justify-center"
                      >
                        <div class="text-center">
                          <span class="lg:text-7xl text-5xl">
                            {{ seoResult.score }}
                          </span>
                          <span class="text-xl">%</span>
                        </div>
                      </div>
                    </div>
                  </template>
                </div>
              </div>
              <!-- score indicator end -->

              <!-- Checks start -->
              <div
                v-if="seoResult && seoResult.checks && seoResult.checks.length"
                class="w-full"
              >
                <h3 class="text-xl font-semibold mb-4 text-center">
                  {{ translate('SEO Check Results') }}
                </h3>

                <ul class="space-y-4">
                  <li
                    v-for="(check, index) in seoResult.checks"
                    :key="index"
                    class="flex items-start gap-4 p-4 bg-white rounded-lg border-solid border-2"
                    :class="check.passed ? 'border-emerald-500' : 'border-red-600'"
                  >
                    <!-- Status indicator -->
                    <div class="flex-shrink-0 mt-1">
                      <template v-if="check.passed">
                        <div
                          class="h-10 w-10 cursor-pointer rounded-full flex items-center border-none justify-center bg-myPrimaryLinkColor aspect-square hover:bg-myPrimaryLinkColor focus-visible:ring-0 text-white hover:text-white"
                        >
                          <span class="material-symbols-outlined"> check </span>
                        </div>
                      </template>

                      <template v-if="!check.passed">
                        <div
                          class="select-none h-10 w-10 cursor-pointer rounded-full flex items-center border-none justify-center bg-myPrimaryErrorColor aspect-square hover:bg-myPrimaryErrorColor hover:text-white text-white"
                        >
                          <span class="material-symbols-outlined"> check_indeterminate_small </span>
                        </div>
                      </template>
                    </div>

                    <!-- Check details -->
                    <div class="flex-1">
                      <p
                        class="text-lg font-medium"
                        :class="check.passed ? 'text-green-700' : 'text-red-700'"
                      >
                        {{ check.check }}
                      </p>
                      <p class="text-sm text-gray-600">
                        {{ check.details }}
                      </p>
                    </div>
                  </li>
                </ul>
              </div>

              <div v-else class="text-gray-500 text-center">No SEO checks available.</div>
              <!-- Checks end -->
            </div>
          </div>

          <!-- score indicator end -->
        </FloatingSidePanel>
        <!-- Overlay SEO end -->
      </div>
      <!-- SEO End -->

      <div class="flex gap-2 items-center justify-center">
        <div
          @click="handleDeleteComponentsFromDOM"
          class="select-none h-10 w-10 cursor-pointer rounded-full flex items-center border-none justify-center bg-gray-50 aspect-square hover:bg-myPrimaryErrorColor hover:text-white text-myPrimaryErrorColor"
        >
          <span class="material-symbols-outlined"> delete_forever </span>
        </div>
      </div>

      <div class="w-full border-t border-solid border-gray-200"></div>

      <!-- settings start -->
      <div class="flex gap-2 items-center justify-center">
        <div
          @click="
            async () => {
              await pageBuilderService.clearHtmlSelection()
              openMainSettings()
            }
          "
          class="select-none h-10 w-10 cursor-pointer rounded-full flex items-center border-none justify-center bg-gray-50 aspect-square hover:bg-myPrimaryLinkColor focus-visible:ring-0 text-black hover:text-white"
        >
          <svg
            fill="currentColor"
            height="22"
            viewBox="0 0 22 22"
            width="22"
            xmlns="http://www.w3.org/2000/svg"
            class="css-1a6490m"
          >
            <path
              clip-rule="evenodd"
              d="M15.192 5.393A6.965 6.965 0 0012 4.071V2h-2v2.07a6.964 6.964 0 00-3.192 1.323L5.344 3.93 3.93 5.343l1.464 1.464A6.964 6.964 0 004.07 10H2v2h2.07a6.964 6.964 0 001.324 3.193L3.93 16.657l1.414 1.414 1.464-1.464A6.964 6.964 0 0010 17.929V20h2v-2.07a6.964 6.964 0 003.192-1.323l1.465 1.464 1.414-1.414-1.465-1.465A6.964 6.964 0 0017.93 12H20v-2h-2.07a6.963 6.963 0 00-1.324-3.193l1.464-1.464-1.414-1.414-1.464 1.464zM11 16a5 5 0 100-10 5 5 0 000 10z"
              fill-rule="evenodd"
            ></path>
          </svg>
        </div>
      </div>
      <!-- settings end -->
    </div>

    <DynamicModalBuilder
      :showDynamicModalBuilder="showModalDeleteAllComponents"
      :type="typeModal"
      :gridColumnAmount="gridColumnModal"
      :title="titleModal"
      :description="descriptionModal"
      :isLoading="isDeletingLayout"
      :firstButtonText="firstButtonModal"
      :secondButtonText="secondButtonModal"
      :thirdButtonText="thirdButtonModal"
      @firstModalButtonFunctionDynamicModalBuilder="firstModalButtonFunctionDynamicModalBuilder"
      @secondModalButtonFunctionDynamicModalBuilder="secondModalButtonFunctionDynamicModalBuilder"
      @thirdModalButtonFunctionDynamicModalBuilder="thirdModalButtonFunctionDynamicModalBuilder"
    >
      <header></header>
      <main></main>
    </DynamicModalBuilder>

    <ModalBuilder
      maxWidth="5xl"
      :showModalBuilder="showMainSettings"
      title="Main Settings"
      @closeMainModalBuilder="handleMainSettings"
      minHeight=""
      maxHeight=""
    >
      <PageBuilderSettings> </PageBuilderSettings>
    </ModalBuilder>
  </div>
</template>
