<script setup lang="ts">
definePageMeta({ layout: 'editor' })

const route = useRoute()
const pageId = computed(() => route.query.pageId as string | undefined)
const pageName = computed(() => (route.query.pageName as string) ?? 'Untitled')
const pageVersion = computed(() => Number(route.query.pageVersion) || 1)
const pageVersionStatus = computed(() => route.query.pageVersionStatus as string | undefined)
const nextVersion = computed(() => Number(route.query.nextVersion) || undefined)
const companyId = computed(() => Number(route.query.companyId) || undefined)

// Shared with PageBuilderWrapper.client.vue — true once an edit has been made
// that hasn't actually made it to the backend yet (see that file for how it's
// set/cleared).
const hasUnsavedChanges = useState<boolean>('hasUnsavedChanges', () => false)

const pageBuilderWrapperRef = ref<{ triggerSave: () => void | Promise<void> } | null>(null)
const showLeaveConfirm = ref(false)
// Set when the user picks "Save & Leave" — once hasUnsavedChanges flips back
// to false (the real backend save actually succeeded, not just the
// library's own Save button), we navigate away on its behalf.
const pendingLeaveAfterSave = ref(false)

function handleBackClick() {
  if (hasUnsavedChanges.value) {
    showLeaveConfirm.value = true
  } else {
    navigateTo('/')
  }
}

function cancelLeave() {
  showLeaveConfirm.value = false
}

function discardAndLeave() {
  hasUnsavedChanges.value = false
  showLeaveConfirm.value = false
  navigateTo('/')
}

function saveAndLeave() {
  pendingLeaveAfterSave.value = true
  showLeaveConfirm.value = false
  pageBuilderWrapperRef.value?.triggerSave()
}

watch(hasUnsavedChanges, (dirty) => {
  if (!dirty && pendingLeaveAfterSave.value) {
    pendingLeaveAfterSave.value = false
    navigateTo('/')
  }
})
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- Editor header -->
    <div class="shrink-0 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
      <button
        type="button"
        class="flex items-center gap-1 text-base font-semibold text-gray-500 hover:text-gray-900 transition-colors bg-transparent border-none cursor-pointer p-0"
        @click="handleBackClick"
      >
        ← Pages
      </button>
      <span class="text-sm font-medium text-gray-900">{{ pageName }}</span>
      <!-- spacer keeps title centred -->
      <span class="w-16" />
    </div>

    <!-- Page builder fills remaining height -->
    <div class="flex-1 min-h-0">
      <PageBuilderWrapper
        ref="pageBuilderWrapperRef"
        :key="pageId"
        :page-id="pageId"
        :page-name="pageName"
        :page-version="pageVersion"
        :page-version-status="pageVersionStatus"
        :next-version="nextVersion"
        :company-id="companyId"
      />
    </div>

    <!-- Unsaved-changes confirmation -->
    <Teleport to="body">
      <div
        v-if="showLeaveConfirm"
        class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-[2px] px-4"
        @click.self="cancelLeave"
      >
        <div class="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
          <div class="flex items-start gap-4 p-6">
            <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-100">
              <svg class="h-6 w-6 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </div>
            <div class="min-w-0 pt-0.5">
              <h3 class="text-base font-semibold text-gray-900">Leave without saving?</h3>
              <p class="mt-1.5 text-sm leading-relaxed text-gray-500">
                You've made changes to this page that haven't been saved yet. If you leave now, those changes will be lost.
              </p>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 border-t border-gray-100 bg-gray-50 px-6 py-4">
            <button
              type="button"
              class="rounded-lg px-3.5 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
              @click="cancelLeave"
            >
              Cancel
            </button>
            <button
              type="button"
              class="rounded-lg px-3.5 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
              @click="discardAndLeave"
            >
              Discard Changes
            </button>
            <button
              type="button"
              class="rounded-lg bg-gray-900 px-3.5 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-gray-800"
              @click="saveAndLeave"
            >
              Save & Leave
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
