<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { login } = useAuth()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

function onFocus(e: Event) {
  const el = e.target as HTMLInputElement
  el.style.borderColor = '#111'
  el.style.background = '#fff'
}
function onBlur(e: Event) {
  const el = e.target as HTMLInputElement
  el.style.borderColor = '#eee'
  el.style.background = '#fafafa'
}

async function handleSubmit() {
  error.value = ''
  loading.value = true
  try {
    await login(email.value, password.value)
    await navigateTo('/')
  } catch (e: unknown) {
    const err = e as { data?: { message?: string }; message?: string }
    error.value = err?.data?.message ?? err?.message ?? 'Invalid credentials'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div style='position:fixed;inset:0;background:#f5f4f0;display:flex;align-items:center;justify-content:center;font-family:DM Sans,-apple-system,BlinkMacSystemFont,sans-serif;overflow:hidden;'>
    <!-- Dot grid background -->
    <div style='position:absolute;inset:0;background-image:radial-gradient(circle at 1px 1px,rgba(0,0,0,0.06) 1px,transparent 0);background-size:28px 28px;pointer-events:none;'></div>
    <!-- Color blobs -->
    <div style='position:absolute;top:-10%;right:-5%;width:500px;height:500px;border-radius:50%;background:radial-gradient(circle,rgba(20,184,166,0.08) 0%,transparent 70%);pointer-events:none;'></div>
    <div style='position:absolute;bottom:-10%;left:-5%;width:400px;height:400px;border-radius:50%;background:radial-gradient(circle,rgba(99,102,241,0.06) 0%,transparent 70%);pointer-events:none;'></div>
    <!-- Top bar -->
    <div style='position:fixed;top:0;left:0;right:0;padding:20px 40px;display:flex;align-items:center;justify-content:space-between;z-index:10;'>
      <img src='https://rubikxstores.com/wp-content/uploads/2024/07/logo_rubik.png' alt='RubikX' style='height:30px;' />
      <div style='font-size:12px;color:#aaa;display:flex;align-items:center;gap:6px;font-family:inherit;'>
        <div style='width:6px;height:6px;border-radius:50%;background:#22c55e;'></div>
        All systems operational
      </div>
    </div>
    <!-- Main content -->
    <div style='position:relative;z-index:1;width:100%;max-width:440px;margin:0 20px;'>
      <!-- Eyebrow pill -->
      <div style='text-align:center;margin-bottom:32px;'>
        <div style='display:inline-flex;align-items:center;gap:8px;padding:6px 14px;background:#fff;border:1px solid rgba(0,0,0,0.08);border-radius:20px;font-size:12px;color:#666;margin-bottom:20px;box-shadow:0 1px 2px rgba(0,0,0,0.04);'>
          <img src='https://rubikxstores.com/wp-content/uploads/2024/07/logo_rubik.png' alt='' style='height:16px;' />
          RubikX Page Builder
        </div>
        <h1 style='font-size:32px;font-weight:700;color:#111;margin:0 0 10px;letter-spacing:-1px;line-height:1.1;'>Welcome back</h1>
        <p style='font-size:15px;color:#888;margin:0;font-weight:400;'>Sign in to your builder workspace</p>
      </div>
      <!-- Error -->
      <div v-if='error' style='background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:12px 16px;margin-bottom:16px;font-size:13px;color:#dc2626;text-align:center;'>
        {{ error }}
      </div>
      <!-- Card -->
      <div style='background:#fff;border-radius:20px;padding:32px;box-shadow:0 4px 6px -1px rgba(0,0,0,0.04),0 0 0 1px rgba(0,0,0,0.06),0 20px 40px -10px rgba(0,0,0,0.08);'>
        <form @submit.prevent='handleSubmit' style='display:flex;flex-direction:column;gap:18px;'>
          <div>
            <label style='display:block;font-size:13px;font-weight:600;color:#333;margin-bottom:8px;letter-spacing:-0.1px;'>Email address</label>
            <input
              v-model='email'
              type='email'
              placeholder='you@rubikxstores.com'
              required
              autocomplete='email'
              style='width:100%;padding:12px 14px;border:1.5px solid #eee;border-radius:10px;font-size:14px;background:#fafafa;outline:none;box-sizing:border-box;color:#111;font-family:inherit;transition:all 0.15s;'
              @focus='onFocus'
              @blur='onBlur'
            />
          </div>
          <div>
            <label style='display:block;font-size:13px;font-weight:600;color:#333;margin-bottom:8px;letter-spacing:-0.1px;'>Password</label>
            <input
              v-model='password'
              type='password'
              placeholder='Enter your password'
              required
              autocomplete='current-password'
              style='width:100%;padding:12px 14px;border:1.5px solid #eee;border-radius:10px;font-size:14px;background:#fafafa;outline:none;box-sizing:border-box;color:#111;font-family:inherit;transition:all 0.15s;'
              @focus='onFocus'
              @blur='onBlur'
            />
          </div>
          <button
            type='submit'
            :disabled='loading'
            style='width:100%;padding:13px;background:#111;color:#fff;border:none;border-radius:10px;font-size:15px;font-weight:600;cursor:pointer;font-family:inherit;letter-spacing:-0.2px;margin-top:4px;transition:opacity 0.15s;'
            :style="loading ? 'opacity:0.6;cursor:not-allowed;' : 'opacity:1;'"
          >
            {{ loading ? 'Signing in...' : 'Continue →' }}
          </button>
        </form>
      </div>
      <!-- Footer -->
      <div style='text-align:center;margin-top:24px;display:flex;align-items:center;justify-content:center;gap:16px;'>
        <span style='font-size:12px;color:#bbb;'>🔒 Odoo JWT secured</span>
        <span style='color:#ddd;'>·</span>
        <span style='font-size:12px;color:#bbb;'>Authorized access only</span>
      </div>
    </div>
  </div>
</template>
