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
  // State - uses Nuxt's global useState so it's shared across calls
  const isAuthenticated = useState<boolean>(
    "auth-isAuthenticated",
    () => false,
  );
  const isLoading = useState<boolean>("auth-isLoading", () => false);
  const user = useState<User | null>("auth-user", () => null);
  const token = useState<SnAuthToken | null>("auth-token", () => null);

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
    const platform = /Mac|iPod|iPhone|iPad/.test(navigator.platform)
      ? 4
      : /Android/.test(ua)
        ? 3
        : /Windows/.test(ua)
          ? 5
          : /Linux/.test(ua)
            ? 6
            : 1;

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
    const savedToken = localStorage.getItem("auth_token");
    if (savedToken) {
      token.value = { token: savedToken };
      isAuthenticated.value = true;
      await fetchUser();
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

  function setToken(tokenString: string) {
    token.value = { token: tokenString };
    isAuthenticated.value = true;
    if (import.meta.client) {
      localStorage.setItem("auth_token", tokenString);
    }
  }

  function logout() {
    token.value = null;
    user.value = null;
    isAuthenticated.value = false;
    challenge.value = null;
    factors.value = [];
    selectedFactor.value = null;
    if (import.meta.client) {
      localStorage.removeItem("auth_token");
    }
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
    setToken(result.token);
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
    // Methods
    getDeviceId,
    getDeviceInfo,
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
    setChallengeState,
    setFactorsState,
    selectFactor,
    clearLoginFlow,
  };
}
