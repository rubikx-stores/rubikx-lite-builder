<script setup lang="ts">
const { user, logout } = useAuth()

interface Website {
  id: number
  name: string
  domain: string
}

const { data: websites } = useFetch<Website[]>('/api/websites')
const { unreadCount, openDrawer } = useReleaseNotes()
const primaryDomain = computed(() => websites.value?.[0]?.domain)
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white border-b border-gray-200">
      <div class="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <img
            src="https://rubikxstores.com/wp-content/uploads/2024/07/logo_rubik.png"
            height="32"
            alt="RubikX"
            class="h-8 w-auto"
          />
          <span class="font-semibold text-gray-900 text-sm">Builder</span>
        </div>
        <div class="flex items-center gap-4">
          <button
            class="relative text-gray-500 hover:text-gray-900 transition-colors"
            :aria-label="unreadCount ? `What's new (${unreadCount} unread)` : `What's new`"
            @click="openDrawer"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
            </svg>
            <span
              v-if="unreadCount"
              class="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-gray-400 ring-2 ring-white"
              aria-hidden="true"
            />
          </button>
          <span class="text-sm text-gray-500">{{ primaryDomain ?? user?.email }}</span>
          <button
            class="text-sm text-gray-600 hover:text-gray-900 rounded-lg border border-gray-200 px-3 py-1.5 transition-colors"
            @click="logout"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
    <main class="max-w-6xl mx-auto px-6 py-8">
      <slot />
    </main>
    <WhatsNewDrawer />
  </div>
</template>
