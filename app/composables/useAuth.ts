export interface AuthUser {
  name: string
  email: string
}

export const useAuth = () => {
  const user = useState<AuthUser | null>('auth_user', () => null)

  const isAuthenticated = computed(() => !!user.value)

  const login = async (email: string, password: string) => {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    })
    const data = await $fetch<{ user: AuthUser }>('/api/auth/me')
    user.value = data.user
  }

  const logout = async () => {
    await $fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
    user.value = null
    await navigateTo('/login')
  }

  return { user, isAuthenticated, login, logout }
}
