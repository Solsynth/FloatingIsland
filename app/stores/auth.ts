import type { SnAuthFactor, SnAuthChallenge, SnAuthToken, SnAccount } from "~/types/auth";
import {
    createChallenge,
    getFactors,
    getChallenge,
    requestFactorCode,
    verifyChallenge,
    getToken,
    getUserInfo,
} from "~/utils/api";
import {
    readTokenPair,
    clearTokenPair,
    getValidToken,
    setTokenFromResponse,
    type StoredTokenPair,
} from "~/utils/token";
import FingerprintJS from "@fingerprintjs/fingerprintjs";

let fpPromise: Promise<FingerprintJS> | null = null;

async function getFingerprint(): Promise<string> {
    if (!fpPromise) {
        fpPromise = FingerprintJS.load();
    }
    const fp = await fpPromise;
    const result = await fp.get();
    return result.visitorId;
}

function getDeviceInfo(): Record<string, unknown> {
    if (import.meta.server) {
        return { device_id: "", device_name: "Server", platform: 1 };
    }
    const ua = navigator.userAgent;
    const platform = 1; // 1 = web

    const deviceName =
        ua.includes("Chrome") && !ua.includes("Edg")
            ? "Chrome Browser"
            : ua.includes("Edg")
                ? "Edge Browser"
                : ua.includes("Firefox")
                    ? "Firefox Browser"
                    : ua.includes("Safari") && !ua.includes("Chrome")
                        ? "Safari Browser"
                        : "Web Browser";

    return {
        device_id: "",
        device_name: deviceName,
        platform,
    };
}

export const useAuthStore = defineStore("auth", () => {
    // State
    const isAuthenticated = ref(false);
    const isLoading = ref(false);
    const user = ref<SnAccount | null>(null);
    const token = ref<SnAuthToken | null>(null);

    // Login flow state
    const challenge = ref<SnAuthChallenge | null>(null);
    const factors = ref<SnAuthFactor[]>([]);
    const selectedFactor = ref<SnAuthFactor | null>(null);

    // Cookie for SSR (server sets this, we read it)
    const authCookie = useCookie("auth_token", {
        httpOnly: false, // We need to read it client-side
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // Computed
    const loginProgress = computed(() => {
        const ch = challenge.value;
        if (!ch) return 0;
        const { stepRemain, stepTotal } = ch;
        if (!stepTotal || stepTotal <= 0) return 0;
        if (stepRemain == null) return 0;
        return Math.max(0, Math.min(1, 1 - stepRemain / stepTotal));
    });

    const loginStep = computed(() => {
        const ch = challenge.value;
        if (!ch) return 0;
        const { stepRemain, stepTotal } = ch;
        if (stepTotal == null || stepRemain == null) return 0;
        return Math.max(0, stepTotal - stepRemain);
    });

    const displayName = computed(() => user.value?.nick || user.value?.name || "");

    // Actions
    async function initAuth() {
        // Server-side: check for cookie
        if (import.meta.server) {
            if (authCookie.value) {
                // Server has set the token in cookie
                // We'll fetch user data client-side or server can pre-fetch
                isAuthenticated.value = true;
            }
            return;
        }

        // Client-side: check localStorage (for backward compatibility)
        const saved = readTokenPair();
        if (saved) {
            token.value = { token: saved.token, expiresAt: saved.expiresAt };
            isAuthenticated.value = true;

            // Validate token
            try {
                await fetchUser();
            } catch {
                logout();
            }
        }
    }

    async function fetchUser() {
        try {
            isLoading.value = true;
            const userData = await getUserInfo();
            user.value = userData;
            isAuthenticated.value = true;
        } catch (error) {
            console.error("Failed to fetch user:", error);
            logout();
            throw error;
        } finally {
            isLoading.value = false;
        }
    }

    function setToken(
        tokenString: string,
        refreshToken?: string,
        expiresIn?: number,
        refreshExpiresIn?: number,
    ) {
        setTokenFromResponse(tokenString, refreshToken, expiresIn, refreshExpiresIn);

        const saved = readTokenPair();
        token.value = { token: tokenString, expiresAt: saved?.expiresAt };
        isAuthenticated.value = true;

        // Also set cookie for SSR
        authCookie.value = tokenString;
    }

    function logout() {
        token.value = null;
        user.value = null;
        isAuthenticated.value = false;
        challenge.value = null;
        factors.value = [];
        selectedFactor.value = null;
        clearTokenPair();
        authCookie.value = null;
    }

    // Login flow
    async function startLogin(account: string) {
        const deviceId = await getFingerprint();
        const deviceInfo = { ...getDeviceInfo(), device_id: deviceId };
        const result = await createChallenge(account, deviceInfo);
        challenge.value = result;
        return result;
    }

    async function loadFactors(challengeId: string) {
        const result = await getFactors(challengeId);
        factors.value = result;
        return result;
    }

    async function loadChallenge(challengeId: string) {
        const result = await getChallenge(challengeId);
        challenge.value = result;
        return result;
    }

    async function requestCode(challengeId: string, factorId: string) {
        return requestFactorCode(challengeId, factorId);
    }

    async function submitVerification(challengeId: string, factorId: string, password: string) {
        const result = await verifyChallenge(challengeId, factorId, password);
        challenge.value = result;
        return result;
    }

    async function exchangeToken(code: string) {
        const result = await getToken(code);
        setToken(
            result.token,
            result.refreshToken,
            result.expiresIn,
            result.refreshExpiresIn,
        );
        await fetchUser();
        return result;
    }

    return {
        // State
        isAuthenticated,
        isLoading,
        user,
        token,
        challenge,
        factors,
        selectedFactor,
        // Computed
        loginProgress,
        loginStep,
        displayName,
        // Actions
        initAuth,
        fetchUser,
        setToken,
        logout,
        startLogin,
        loadFactors,
        loadChallenge,
        requestCode,
        submitVerification,
        exchangeToken,
    };
});
