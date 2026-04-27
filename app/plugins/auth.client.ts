import { getValidToken, readTokenPair } from "~/utils/token";
import { useAuthStore } from "~/stores/auth";
import { getAuthMode, refreshSession } from "~/utils/api";

export default defineNuxtPlugin(async () => {
  const store = useAuthStore();
  const config = useRuntimeConfig();

  // Initialize auth state
  await store.initAuth();

  // Ensure isLoading is false after initAuth completes
  store.isLoading = false;

  // Set up periodic token refresh (every 4 minutes)
  // Cookie mode: call refresh endpoint (uses HttpOnly refresh cookie)
  // Bearer mode: use localStorage refresh token
  const refreshInterval = setInterval(async () => {
    const mode = getAuthMode();

    if (mode === "cookie") {
      await refreshSession();
    } else {
      const tokenPair = readTokenPair();
      if (tokenPair) {
        await getValidToken(config.public.apiBaseUrl);
      }
    }
  }, 4 * 60 * 1000); // 4 minutes

  // Clean up interval on app unload
  window.addEventListener("beforeunload", () => {
    clearInterval(refreshInterval);
  });
});
