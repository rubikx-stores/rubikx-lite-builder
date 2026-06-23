<script setup>
import { ref, computed } from 'vue'
import { sharedPageBuilderStore } from '../../../stores/shared-store'

import { isEmptyObject } from '../../../helpers/isEmptyObject.ts'
const version = __APP_VERSION__

// Use shared store instance
const pageBuilderStateStore = sharedPageBuilderStore

const getPageBuilderConfig = computed(() => {
  return pageBuilderStateStore.getPageBuilderConfig
})
</script>

<template>
  <div
    class="w-full inset-x-0 h-[90vh] bg-white overflow-x-scroll lg:pt-2 pt-2"
  >
    <!-- Advanced Settings - start -->
    <div
      class="mt-4 mb-4 py-8 px-2 border border-solid border-gray-600 rounded-xl"
    >
      <!-- Advanced Settings - start -->
      <div>
        <div class="flex items-left flex-col gap-1">
          <h3 class="pbx-myQuaternaryHeader">Configuration Overview</h3>
          <p class="pbx-myPrimaryParagraph text-xs">
            A summary of current user preferences, application settings, and system metadata
            including UI theme, language, saved components, and logo configuration.
          </p>
        </div>

        <!-- Version Information Table - start -->
        <div class="px-2">
          <div class="mt-8">
            <h4 class="pbx-myQuaternaryHeader text-sm mb-2">Version Information</h4>
            <div
              class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg"
            >
              <div class="overflow-x-auto">
                <table class="min-w-full">
                  <thead class="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        App
                      </th>
                      <th
                        scope="col"
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Version
                      </th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr>
                      <td
                        class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
                      >
                        <div class="min-w-[30rem] w-max">Page Builder</div>
                      </td>
                      <td
                        class="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                      >
                        <div class="min-w-[30rem] w-max">
                          <span
                            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {{ version }}
                          </span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <!-- Version Information Table - end -->

          <!-- Resource Data Table - start -->
          <div
            class="mt-4"
            v-if="
              getPageBuilderConfig?.resourceData &&
              !isEmptyObject(getPageBuilderConfig.resourceData)
            "
          >
            <h4 class="pbx-myQuaternaryHeader text-sm mb-2">Resource Data</h4>
            <div
              class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg"
            >
              <div class="overflow-x-auto">
                <table class="min-w-full">
                  <thead class="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Property
                      </th>
                      <th
                        scope="col"
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Value
                      </th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-if="getPageBuilderConfig?.resourceData?.title">
                      <td
                        class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
                      >
                        <div class="min-w-[30rem] w-max">Title</div>
                      </td>
                      <td
                        class="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                      >
                        <div class="min-w-[30rem] w-max">
                          {{ getPageBuilderConfig.resourceData.title }}
                        </div>
                      </td>
                    </tr>
                    <tr v-if="getPageBuilderConfig?.resourceData?.id">
                      <td
                        class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
                      >
                        <div class="min-w-[30rem] w-max">ID</div>
                      </td>
                      <td
                        class="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                      >
                        <div class="min-w-[30rem] w-max">
                          {{ getPageBuilderConfig.resourceData.id }}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <!-- Resource Data Table - end -->

          <!-- User Information Table - start -->
          <div
            class="mt-8"
            v-if="
              getPageBuilderConfig?.userForPageBuilder &&
              !isEmptyObject(getPageBuilderConfig.userForPageBuilder)
            "
          >
            <h4 class="pbx-myQuaternaryHeader text-sm mb-2">User Information</h4>
            <div
              class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg"
            >
              <div class="overflow-x-auto">
                <table class="min-w-full">
                  <thead class="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Property
                      </th>
                      <th
                        scope="col"
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Value
                      </th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr>
                      <td
                        class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
                      >
                        <div class="min-w-[30rem] w-max">User Name</div>
                      </td>
                      <td
                        class="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                      >
                        <div class="min-w-[30rem] w-max">
                          {{ getPageBuilderConfig.userForPageBuilder.name }}
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td
                        class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
                      >
                        <div class="min-w-[30rem] w-max">Image</div>
                      </td>
                      <td
                        v-if="
                          getPageBuilderConfig.userForPageBuilder.image &&
                          typeof getPageBuilderConfig.userForPageBuilder.image === 'string' &&
                          getPageBuilderConfig.userForPageBuilder.image.length > 2
                        "
                        class="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                      >
                        <div class="min-w-[30rem] w-max">
                          <div class="flex items-center space-x-3">
                            <img
                              class="block inset-0 object-top h-10 min-h-10 max-h-10 w-10 min-w-10 max-w-10 object-cover rounded-full"
                              :src="getPageBuilderConfig.userForPageBuilder.image"
                              alt="image"
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td
                        class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
                      >
                        <div class="min-w-[30rem] w-max">Image URL</div>
                      </td>
                      <td
                        v-if="
                          getPageBuilderConfig.userForPageBuilder.image &&
                          typeof getPageBuilderConfig.userForPageBuilder.image === 'string' &&
                          getPageBuilderConfig.userForPageBuilder.image.length > 2
                        "
                        class="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                      >
                        <div class="min-w-[30rem] w-max">
                          {{ getPageBuilderConfig.userForPageBuilder.image }}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <!-- User Information Table - end -->

          <!-- User Settings Table - start -->
          <div
            class="mt-8"
            v-if="
              getPageBuilderConfig?.userSettings &&
              !isEmptyObject(getPageBuilderConfig.userSettings)
            "
          >
            <h4 class="pbx-myQuaternaryHeader text-sm mb-2">User Settings</h4>
            <div
              class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg"
            >
              <div class="overflow-x-auto">
                <table class="min-w-full">
                  <thead class="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Setting
                      </th>
                      <th
                        scope="col"
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Value
                      </th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-if="getPageBuilderConfig?.userSettings?.theme">
                      <td
                        class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
                      >
                        <div class="min-w-[30rem] w-max">Theme</div>
                      </td>
                      <td
                        class="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                      >
                        <div class="min-w-[30rem] w-max">
                          {{ getPageBuilderConfig.userSettings.theme }}
                        </div>
                      </td>
                    </tr>
                    <tr v-if="getPageBuilderConfig?.userSettings?.language">
                      <td
                        class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
                      >
                        <div class="min-w-[30rem] w-max">Language</div>
                      </td>
                      <td
                        class="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                      >
                        <div class="min-w-[30rem] w-max">
                          {{ getPageBuilderConfig.userSettings.language }}
                        </div>
                      </td>
                    </tr>
                    <tr v-if="getPageBuilderConfig?.userSettings?.autoSave !== undefined">
                      <td
                        class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
                      >
                        <div class="min-w-[30rem] w-max">Auto Save</div>
                      </td>
                      <td
                        class="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                      >
                        <div class="min-w-[30rem] w-max">
                          <span
                            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                            :class="
                              getPageBuilderConfig.userSettings.autoSave
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            "
                          >
                            {{
                              getPageBuilderConfig.userSettings.autoSave ? 'Enabled' : 'Disabled'
                            }}
                          </span>
                        </div>
                      </td>
                    </tr>
                    <tr v-if="getPageBuilderConfig?.userSettings?.notifications !== undefined">
                      <td
                        class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
                      >
                        <div class="min-w-[30rem] w-max">Notifications</div>
                      </td>
                      <td
                        class="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                      >
                        <div class="min-w-[30rem] w-max">
                          <span
                            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                            :class="
                              getPageBuilderConfig.userSettings.notifications
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            "
                          >
                            {{
                              getPageBuilderConfig.userSettings.notifications
                                ? 'Enabled'
                                : 'Disabled'
                            }}
                          </span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <!-- User Settings Table - end -->

          <!-- Page Builder Logo Table - start -->
          <div
            class="mt-8"
            v-if="
              getPageBuilderConfig &&
              getPageBuilderConfig.pageBuilderLogo &&
              !isEmptyObject(getPageBuilderConfig.pageBuilderLogo)
            "
          >
            <h4 class="pbx-myQuaternaryHeader text-sm mb-2">Logo Configuration</h4>
            <div
              class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg"
            >
              <div class="overflow-x-auto">
                <table class="min-w-full">
                  <thead class="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Property
                      </th>
                      <th
                        scope="col"
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Value
                      </th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr>
                      <td
                        class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
                      >
                        <div class="min-w-[30rem] w-max">Logo</div>
                      </td>
                      <td
                        class="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                      >
                        <div class="min-w-[30rem] w-max">
                          <div class="flex items-center space-x-3">
                            <img
                              class="h-4"
                              :src="getPageBuilderConfig.pageBuilderLogo.src"
                              alt="Logo"
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td
                        class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
                      >
                        <div class="min-w-[30rem] w-max">Logo URL</div>
                      </td>
                      <td
                        class="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                      >
                        <div class="min-w-[30rem] w-max">
                          <div class="flex items-center space-x-3">
                            <div class="pr-6">
                              <div class="flex items-center space-x-3">
                                <span class="whitespace-nowrap">{{
                                  getPageBuilderConfig.pageBuilderLogo.src
                                }}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <!-- Page Builder Logo Table - end -->

          <!-- Form Type Table - start -->
          <div
            class="mt-8"
            v-if="
              getPageBuilderConfig?.updateOrCreate &&
              !isEmptyObject(getPageBuilderConfig.updateOrCreate)
            "
          >
            <h4 class="pbx-myQuaternaryHeader text-sm mb-2">Form Type</h4>
            <div
              class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg"
            >
              <div class="overflow-x-auto">
                <table class="w-max">
                  <thead class="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Mode
                      </th>
                      <th
                        scope="col"
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr>
                      <td
                        class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
                      >
                        <div class="min-w-[30rem] w-max">Form Type</div>
                      </td>
                      <td
                        class="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                      >
                        <div class="min-w-[30rem] w-max">
                          <span
                            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                            :class="
                              getPageBuilderConfig.updateOrCreate === 'create'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-blue-100 text-blue-800'
                            "
                          >
                            <span
                              v-if="
                                getPageBuilderConfig &&
                                getPageBuilderConfig.updateOrCreate.formType === 'create'
                              "
                            >
                              {{ getPageBuilderConfig.updateOrCreate.formType }}
                            </span>
                            <span
                              v-if="
                                getPageBuilderConfig &&
                                getPageBuilderConfig.updateOrCreate.formType === 'update'
                              "
                            >
                              {{ getPageBuilderConfig.updateOrCreate.formType }}
                            </span>
                          </span>
                        </div>
                      </td>
                    </tr>
                    <tr
                      v-if="
                        getPageBuilderConfig.updateOrCreate.formName &&
                        getPageBuilderConfig.updateOrCreate.formName.length > 0
                      "
                    >
                      <td
                        class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
                      >
                        <div class="min-w-[30rem] w-max">Form Name</div>
                      </td>
                      <td
                        class="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                      >
                        <div class="min-w-[30rem] w-max">
                          <span
                            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          >
                            {{ getPageBuilderConfig.updateOrCreate.formName }}
                          </span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <!-- Form Type Table - end -->
        </div>
      </div>
    </div>
    <!-- Advanced Settings - end -->

    <!-- Congig - start -->
    <div
      class="mt-4 mb-4 py-8 px-2 border border-solid border-gray-600 rounded-xl"
    >
      <div class="flex items-left flex-col gap-1">
        <h3 class="pbx-myQuaternaryHeader">Complete Configuration Overview</h3>
        <p class="pbx-myPrimaryParagraph text-xs">
          Complete configuration object currently used by the Page Builder. Includes user
          information, branding settings, and other context-specific data needed for rendering and
          managing the builder environment.
        </p>
      </div>

      <div
        class="mt-4 whitespace-pre-wrap text-white overflow-hidden bg-gray-900"
      >
        <div class="flex bg-gray-800/40 ring-1 ring-white/5">
          <div
            class="mb-px flex text-xs font-medium text-myPrimaryMediumGrayColor"
          >
            <div class="px-4 py-4 text-white">Configuration</div>
          </div>
        </div>
        <div class="px-4 pb-8 pt-4 text-white text-xs break-all">
          <p class="pbx-myPrimaryParagraph text-xs text-white">
            config: {{ JSON.stringify(getPageBuilderConfig, null, 4) }}
          </p>
        </div>
      </div>
    </div>
    <!-- Config - end -->
  </div>
</template>
