import { storeToRefs } from "pinia";
import { useAuthStore } from "~/stores/auth";

/**
 * Composable for auth - uses Pinia store internally
 * Supports both cookie-based auth (production) and bearer token auth (dev)
 */
export function useAuth() {
    const store = useAuthStore();

    // Use storeToRefs to maintain reactivity
    const {
        isAuthenticated,
        isLoading,
        user,
        token,
        challenge,
        factors,
        selectedFactor,
        loginProgress,
        loginStep,
        displayName,
    } = storeToRefs(store);

    return {
        // State (refs)
        isAuthenticated,
        isLoading,
        user,
        token,
        challenge,
        factors,
        selectedFactor,
        // Computed (refs from storeToRefs)
        loginProgress,
        loginStep,
        displayName,
        // Methods
        initAuth: store.initAuth,
        fetchUser: store.fetchUser,
        setToken: store.setToken,
        logout: store.logout,
        startLogin: store.startLogin,
        loadFactors: store.loadFactors,
        loadChallenge: store.loadChallenge,
        requestCode: store.requestCode,
        submitVerification: store.submitVerification,
        exchangeToken: store.exchangeToken,
        // State setters (for login flow)
        setChallengeState: (ch: typeof store.challenge) => {
            store.challenge = ch;
        },
        setFactorsState: (f: typeof store.factors) => {
            store.factors = f;
        },
        selectFactor: (factor: typeof store.selectedFactor) => {
            store.selectedFactor = factor;
        },
        clearLoginFlow: () => {
            store.challenge = null;
            store.factors = [];
            store.selectedFactor = null;
        },
        clearFactor: () => {
            store.selectedFactor = null;
        },
        // Legacy helpers (primarily for dev mode with bearer tokens)
        getDeviceId: async () => "",
        getDeviceInfo: () => ({ device_id: "", device_name: "Web", platform: 1 }),
        getValidAuthToken: async () => store.token?.token || null,
    };
}
