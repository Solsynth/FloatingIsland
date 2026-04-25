import type {
  SnAuthChallenge,
  SnAuthFactor,
  SnAuthToken,
  User,
} from "~/types/auth";
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

export function useAuth() {
  const config = useRuntimeConfig();

  // State - uses Nuxt's global useState so it's shared across calls
  const isAuthenticated = useState<boolean>(
    "auth-isAuthenticated",
    () => false,
  );
  const isLoading = useState<boolean>("auth-isLoading", () => false);
  const user = useState<User | null>("auth-user", () => null);
  const token = useState<SnAuthToken | null>("auth-token", () => null);
  const tokenPair = useState<StoredTokenPair | null>(
    "auth-tokenPair",
    () => null,
  );

  // Login flow state
  const challenge = useState<SnAuthChallenge | null>(
    "auth-challenge",
    () => null,
  );
  const factors = useState<SnAuthFactor[]>("auth-factors", () => []);
  const selectedFactor = useState<SnAuthFactor | null>(
    "auth-selectedFactor",
    () => null,
  );

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

  const displayName = computed(
    () => user.value?.nick || user.value?.name || "",
  );

  async function getDeviceId(): Promise<string> {
    if (import.meta.server) return "";
    return getFingerprint();
  }

  function getDeviceInfo(): Record<string, unknown> {
    if (import.meta.server) {
      return { device_id: "", device_name: "Server", platform: 1 };
    }
    const ua = navigator.userAgent;
    // 1 stands for web
    const platform = 1;

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

    // device_id will be populated by the caller using getDeviceId()
    return {
      device_id: "",
      device_name: deviceName,
      platform,
    };
  }

  async function initAuth() {
    if (import.meta.server) return;

    const saved = readTokenPair();
    if (saved) {
      tokenPair.value = saved;
      token.value = { token: saved.token, expiresAt: saved.expiresAt };
      isAuthenticated.value = true;

      // Validate and refresh token if needed
      const validToken = await getValidToken(config.public.apiBaseUrl);
      if (validToken) {
        await fetchUser();
      } else {
        // Token is invalid or expired, clear it
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
    setTokenFromResponse(
      tokenString,
      refreshToken,
      expiresIn,
      refreshExpiresIn,
    );

    const saved = readTokenPair();
    tokenPair.value = saved;
    token.value = { token: tokenString, expiresAt: saved?.expiresAt };
    isAuthenticated.value = true;
  }

  function logout() {
    token.value = null;
    tokenPair.value = null;
    user.value = null;
    isAuthenticated.value = false;
    challenge.value = null;
    factors.value = [];
    selectedFactor.value = null;
    clearTokenPair();
  }

  // Get a valid token, refreshing if necessary
  async function getValidAuthToken(): Promise<string | null> {
    return getValidToken(config.public.apiBaseUrl);
  }

  // Login flow
  async function startLogin(account: string) {
    const deviceId = await getDeviceId();
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

  async function submitVerification(
    challengeId: string,
    factorId: string,
    password: string,
  ) {
    const result = await verifyChallenge(challengeId, factorId, password);
    challenge.value = result;
    return result;
  }

  async function exchangeToken(code: string) {
    const result = await getToken(code);
    // The API may return refresh_token and expires_in
    setToken(
      result.token,
      result.refreshToken,
      result.expiresIn,
      result.refreshExpiresIn,
    );
    return result;
  }

  function setChallengeState(ch: SnAuthChallenge | null) {
    challenge.value = ch;
  }

  function setFactorsState(f: SnAuthFactor[]) {
    factors.value = f;
  }

  function selectFactor(factor: SnAuthFactor) {
    selectedFactor.value = factor;
  }

  function clearLoginFlow() {
    challenge.value = null;
    factors.value = [];
    selectedFactor.value = null;
  }

  function clearFactor() {
    selectedFactor.value = null;
  }

  return {
    // State
    isAuthenticated,
    isLoading,
    user,
    token,
    tokenPair,
    challenge,
    factors,
    selectedFactor,
    // Computed
    loginProgress,
    loginStep,
    displayName,
    // Methods
    getDeviceId,
    getDeviceInfo,
    initAuth,
    fetchUser,
    setToken,
    logout,
    getValidAuthToken,
    startLogin,
    loadFactors,
    loadChallenge,
    requestCode,
    submitVerification,
    exchangeToken,
    setChallengeState,
    setFactorsState,
    selectFactor,
    clearLoginFlow,
    clearFactor,
  };
}
