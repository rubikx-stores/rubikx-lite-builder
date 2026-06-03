export default defineNuxtRouteMiddleware(async (to) => {
  const user = useState<any>('auth_user')

  if (import.meta.server && !user.value) {
    try {
      const headers = useRequestHeaders(['cookie'])
      const data = await $fetch<{ user: any }>('/api/auth/me', { headers })
      user.value = data.user
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
