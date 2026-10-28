export interface AuthUser {
  name: string
  email: string
}

export const useAuth = () => {
  const user = useState<AuthUser | null>('auth_user', () => null)
  const session = useSession()

  const isAuthenticated = computed(() => !!user.value)

  const login = async (email: string, password: string) => {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    })
    const data = await $fetch<{ user: AuthUser; expiresIn: number }>('/api/auth/me')
    user.value = data.user
    session.setExpiresIn(data.expiresIn)
  }

  const logout = async () => {
    await $fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
    session.broadcast({ type: 'LOGOUT' }) // after the cookie is gone, so other tabs land on /login cleanly
    user.value = null
    session.clear()
    await navigateTo('/login')
  }

  return { user, isAuthenticated, login, logout }
}
