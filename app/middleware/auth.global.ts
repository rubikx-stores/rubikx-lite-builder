export default defineNuxtRouteMiddleware(async (to) => {
  const user = useState<any>('auth_user')
  const expiresIn = useState<number | null>('session_expires_in', () => null)

  if (import.meta.server && !user.value) {
    try {
      const headers = useRequestHeaders(['cookie'])
      const data = await $fetch<{ user: any; expiresIn: number }>('/api/auth/me', { headers })
      user.value = data.user
      expiresIn.value = data.expiresIn
    } catch {
      user.value = null
    }
  }

  const isAuthenticated = !!user.value

  if (!isAuthenticated && to.path !== '/login') {
    return navigateTo('/login')
  }

  if (isAuthenticated && to.path === '/login') {
    return navigateTo('/')
  }
})
