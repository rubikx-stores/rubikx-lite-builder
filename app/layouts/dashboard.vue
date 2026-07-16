<script setup lang="ts">
const { user, logout } = useAuth()

interface Website {
  id: number
  name: string
  domain: string
}

const { data: websites } = useFetch<Website[]>('/api/websites')
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
  </div>
</template>
