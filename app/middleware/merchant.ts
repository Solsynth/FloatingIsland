export default defineNuxtRouteMiddleware((_to) => {
  // Skip auth check in local development
  if (import.meta.client) {
    const host = window.location.hostname
    if (host === 'localhost' || host === '127.0.0.1') {
      return
    }
  }

  const auth = useAuth()
  if (!auth.isAuthenticated.value) {
    return navigateTo('/auth/login')
  }
})
