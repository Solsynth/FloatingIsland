import { getValidToken, readTokenPair } from "~/utils/token";
import { useAuthStore } from "~/stores/auth";

export default defineNuxtPlugin(async () => {
  const store = useAuthStore();
  const config = useRuntimeConfig();

  // Initialize auth state from storage
  await store.initAuth();

  // Ensure isLoading is false after initAuth completes
  store.isLoading = false;

  // Set up periodic token refresh (every 4 minutes)
  // This ensures the token is refreshed before it expires
  const refreshInterval = setInterval(async () => {
    const tokenPair = readTokenPair();
    if (tokenPair) {
      await getValidToken(config.public.apiBaseUrl);
    }
  }, 4 * 60 * 1000); // 4 minutes

  // Clean up interval on app unload
  window.addEventListener("beforeunload", () => {
    clearInterval(refreshInterval);
  });
});
