export default defineNuxtRouteMiddleware((_to) => {
  // Skip auth check in local development
  if (import.meta.dev) {
    return
  }

  const auth = useAuth()
  if (!auth.isAuthenticated.value) {
    return navigateTo('/auth/login')
  }
})
