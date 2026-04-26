/**
 * Auth middleware - checks if user is authenticated
 * Redirects to login page if not authenticated
 * Preserves the original URL as redirect parameter
 */
export default defineNuxtRouteMiddleware((to) => {
	const auth = useAuth();

	// If not authenticated, redirect to login
	if (!auth.isAuthenticated.value) {
		const redirectUrl = to.fullPath;
		return navigateTo(`/auth/login?redirect=${encodeURIComponent(redirectUrl)}`);
	}
});
