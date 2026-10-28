<script setup lang="ts">
// Shown in the last 5 minutes of a session. At 0 it turns into an in-place
// re-login so the open page (and any unsaved builder edits) isn't thrown away.
const { user, login, logout } = useAuth()
const session = useSession()
const { visible, expired, remaining, refreshing, extendError } = session

const password = ref('')
const loginError = ref('')
const loggingIn = ref(false)

const clock = computed(() => {
  const s = Number.isFinite(remaining.value) ? remaining.value : 0
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
})

// Move focus into the dialog when it opens, and let Escape close the warning
// (not the expired state, which needs a re-login or logout).
const primaryBtn = ref<HTMLButtonElement | null>(null)
const passwordInput = ref<HTMLInputElement | null>(null)
watch(visible, async (open) => {
  if (!open) return
  await nextTick()
  ;(expired.value ? passwordInput.value : primaryBtn.value)?.focus()
})
watch(expired, async (isExpired) => {
  if (!isExpired) return
  await nextTick()
  passwordInput.value?.focus()
})
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && !expired.value) session.dismiss()
}

async function relogin() {
  if (!user.value || !password.value) return
  loginError.value = ''
  loggingIn.value = true
  try {
    await login(user.value.email, password.value)
    password.value = ''
  } catch (e: unknown) {
    const err = e as { data?: { message?: string }; message?: string }
    loginError.value = err?.data?.message ?? err?.message ?? 'Invalid credentials'
  } finally {
    loggingIn.value = false
  }
}
</script>

<template>
  <div
    v-if="user && visible"
    class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4"
    role="alertdialog"
    aria-modal="true"
    aria-labelledby="session-modal-title"
    @keydown="onKeydown"
  >
    <div class="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
      <template v-if="!expired">
        <div class="flex items-start justify-between gap-3">
          <h2 id="session-modal-title" class="text-base font-semibold text-gray-900">Session expiring soon</h2>
          <button
            type="button"
            class="-mr-1 -mt-1 rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close"
            @click="session.dismiss()"
          >
            <svg class="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
              <path d="M5 5l10 10M15 5L5 15" />
            </svg>
          </button>
        </div>
        <p class="mt-2 text-sm text-gray-600" aria-live="polite">
          You'll be signed out in <span class="font-mono font-semibold">{{ clock }}</span>.
        </p>
        <p v-if="extendError" class="mt-2 text-sm text-red-600">{{ extendError }}</p>
        <div class="mt-5 flex justify-end gap-2">
          <button
            class="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
            @click="logout"
          >
            Log out
          </button>
          <button
            ref="primaryBtn"
            class="rounded-lg bg-gray-900 px-3 py-1.5 text-sm text-white hover:bg-black disabled:opacity-50"
            :disabled="refreshing"
            @click="session.extend()"
          >
            {{ refreshing ? 'Extending…' : 'Stay signed in' }}
          </button>
        </div>
      </template>

      <form v-else @submit.prevent="relogin">
        <h2 id="session-modal-title" class="text-base font-semibold text-gray-900">Session expired</h2>
        <p class="mt-2 text-sm text-gray-600">
          Enter your password to continue as {{ user.email }}. Your open page stays as it is.
        </p>
        <input
          ref="passwordInput"
          v-model="password"
          type="password"
          autocomplete="current-password"
          placeholder="Password"
          class="mt-4 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-900"
        />
        <p v-if="loginError" class="mt-2 text-sm text-red-600">{{ loginError }}</p>
        <div class="mt-5 flex justify-end gap-2">
          <button
            type="button"
            class="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
            @click="logout"
          >
            Log out
          </button>
          <button
            type="submit"
            class="rounded-lg bg-gray-900 px-3 py-1.5 text-sm text-white hover:bg-black disabled:opacity-50"
            :disabled="loggingIn || !password"
          >
            {{ loggingIn ? 'Signing in…' : 'Sign in' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
