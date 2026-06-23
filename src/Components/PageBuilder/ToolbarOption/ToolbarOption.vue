<script setup>
import { computed } from 'vue'
import { sharedPageBuilderStore } from '../../../stores/shared-store'

// Use shared store instance
const pageBuilderStateStore = sharedPageBuilderStore

const getPageBuilderConfig = computed(() => {
  return pageBuilderStateStore.getPageBuilderConfig
})
</script>

<template>
  <div>
    <div class="flex items-center justify-center ml-2">
      <div class="mr-2">
        <!-- User No image Start-->
        <div
          class="flex items-center pbx-myPrimaryTag whitespace-nowrap py-0 gap-2"
          v-if="
            getPageBuilderConfig &&
            getPageBuilderConfig.userForPageBuilder &&
            getPageBuilderConfig.userForPageBuilder.name &&
            (!getPageBuilderConfig.userForPageBuilder.image ||
              (typeof getPageBuilderConfig.userForPageBuilder.image === 'string' &&
                getPageBuilderConfig.userForPageBuilder.image?.length < 2))
          "
        >
          <div
            class="text-white rounded-full bg-myPrimaryBrandColor flex justify-center items-center text-xs d min-d max-d lg:w-8 lg:h-8 lg:min-w-8 lg:max-w-8 w-8 h-8 min-w-8 max-w-8 font-normal"
          >
            {{
              typeof getPageBuilderConfig.userForPageBuilder.name === 'string' &&
              getPageBuilderConfig.userForPageBuilder.name[0]
            }}
          </div>
        </div>

        <!-- User No image End -->

        <!-- User With image Start-->
        <div
          class="flex items-center lg:pbx-myPrimaryTag whitespace-nowrap py-0 gap-4 w-max h-12 ml-2"
          v-if="
            getPageBuilderConfig &&
            getPageBuilderConfig.userForPageBuilder &&
            getPageBuilderConfig.userForPageBuilder.name &&
            getPageBuilderConfig.userForPageBuilder.image &&
            typeof getPageBuilderConfig.userForPageBuilder.image === 'string' &&
            getPageBuilderConfig.userForPageBuilder.image.length > 2
          "
        >
          <div
            class="text-white flex-shrink-0 d w-10 h-10 rounded-full flex justify-center items-center text-xs rounded-l-full"
          >
            <img
              alt="Avatar"
              :src="`${getPageBuilderConfig.userForPageBuilder.image}`"
              class="block inset-0 object-top d min-d max-d lg:w-8 lg:h-8 lg:min-w-8 lg:max-w-8 w-8 h-8 min-w-8 max-w-8 object-cover rounded-full"
            />
          </div>
        </div>
      </div>

      <!-- User With image End -->
    </div>
  </div>
</template>
