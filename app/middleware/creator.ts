export default defineNuxtRouteMiddleware((_to) => {
  const auth = useAuth()
  if (!auth.isAuthenticated.value) {
    return navigateTo('/auth/login')
  }
})
