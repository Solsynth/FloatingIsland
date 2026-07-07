/**
 * Auth middleware - checks if user is authenticated
 * Disabled in dev mode to avoid redirect loops during local development
 * Redirects to login page if not authenticated
 * Preserves the original URL as redirect parameter
 */
export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.dev) {
    console.log("[Auth] Development, skip auth.");
    return;
  }

  const auth = useAuth();

  if (!auth.isAuthenticated.value) {
    const redirectUrl = to.fullPath;
    return navigateTo(
      `/auth/login?redirect=${encodeURIComponent(redirectUrl)}`,
    );
  }
});
