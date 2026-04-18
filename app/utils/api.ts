import type {
  SnAuthChallenge,
  SnAuthFactor,
  SnAuthToken,
  User,
  CaptchaConfig,
  WalletOrder,
  SpellInfo,
} from "~/types/auth";
import type { Publisher, Post } from "~/types/post";
import type { Realm } from "~/types/realm";
import type { LivestreamDetail } from "~/types/livestream";
import { snakeToCamel, camelToSnake } from "~/utils/case";
import {
  getValidToken,
  readTokenPair,
  setTokenFromResponse,
  type StoredTokenPair,
} from "~/utils/token";

// Global API configuration
export const API_BASE = "api.solian.app";
export const API_BASE_URL = `https://${API_BASE}`;

// Helper to build API URL
export function getApiUrl(endpoint: string): string {
  return `${API_BASE_URL}${endpoint}`;
}

// Parse response helper
async function parseResponse(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text || text.trim().length === 0) {
    return null;
  }
  try {
    return JSON.parse(text);
  } catch {
    return { message: text.trim() };
  }
}

// Helper to safely parse JSON and convert case
async function safeJsonParse<T>(response: Response): Promise<T> {
  const data = await parseResponse(response);
  return snakeToCamel(data) as T;
}

async function getAuthToken(): Promise<string | null> {
  if (import.meta.server) return null;
  return getValidToken(API_BASE_URL);
}

function getAuthTokenSync(): string | null {
  if (import.meta.server) return null;
  const tokenPair = readTokenPair();
  return tokenPair?.token ?? null;
}

interface ApiFetchOptions extends RequestInit {
  skipAuth?: boolean;
  retryCount?: number;
}

export async function apiFetch(
  endpoint: string,
  options: ApiFetchOptions = {},
): Promise<Response> {
  const url = `${API_BASE_URL}${endpoint}`;
  const { skipAuth = false, retryCount = 0, ...fetchOptions } = options;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((fetchOptions.headers as Record<string, string>) || {}),
  };

  if (!skipAuth) {
    const token = await getAuthToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const response = await fetch(url, { ...fetchOptions, headers });

  // Handle 401 Unauthorized - token might be expired
  if (response.status === 401 && !skipAuth && retryCount < 1) {
    // Force token refresh and retry
    const tokenPair = readTokenPair();
    if (tokenPair?.refreshToken) {
      // Clear any cached token to force refresh
      const newToken = await getValidToken(API_BASE_URL);
      if (newToken) {
        // Retry the request with new token
        return apiFetch(endpoint, {
          ...options,
          retryCount: retryCount + 1,
        });
      }
    }

    // If refresh failed, clear auth and throw
    if (typeof window !== "undefined") {
      const auth = useAuth();
      auth.logout();
      navigateTo("/auth/login");
    }
    throw new Error("Session expired. Please login again.");
  }

  if (!response.ok) {
    const errorData = await parseResponse(response);
    const message =
      typeof errorData === "object" && errorData && "message" in errorData
        ? String(errorData.message)
        : `HTTP ${response.status}`;
    throw new Error(message);
  }

  return response;
}

export async function fetchJson<T>(
  endpoint: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const response = await apiFetch(endpoint, options);
  return safeJsonParse<T>(response);
}

// Auth API
export async function createChallenge(
  account: string,
  deviceInfo: Record<string, unknown>,
): Promise<SnAuthChallenge> {
  const response = await apiFetch("/padlock/auth/challenge", {
    method: "POST",
    body: JSON.stringify({ account, ...deviceInfo }),
    skipAuth: true,
  });
  return safeJsonParse<SnAuthChallenge>(response);
}

export async function getFactors(challengeId: string): Promise<SnAuthFactor[]> {
  const response = await apiFetch(
    `/padlock/auth/challenge/${challengeId}/factors`,
    { skipAuth: true },
  );
  return safeJsonParse<SnAuthFactor[]>(response);
}

export async function getChallenge(
  challengeId: string,
): Promise<SnAuthChallenge> {
  const response = await apiFetch(`/padlock/auth/challenge/${challengeId}`, {
    skipAuth: true,
  });
  return safeJsonParse<SnAuthChallenge>(response);
}

export async function requestFactorCode(
  challengeId: string,
  factorId: string,
): Promise<unknown> {
  const response = await apiFetch(
    `/padlock/auth/challenge/${challengeId}/factors/${factorId}`,
    {
      method: "POST",
      skipAuth: true,
    },
  );
  return safeJsonParse<unknown>(response);
}

export async function verifyChallenge(
  challengeId: string,
  factorId: string,
  password: string,
): Promise<SnAuthChallenge> {
  const response = await apiFetch(`/padlock/auth/challenge/${challengeId}`, {
    method: "PATCH",
    body: JSON.stringify(camelToSnake({ factorId, password })),
    skipAuth: true,
  });
  return safeJsonParse<SnAuthChallenge>(response);
}

export async function getToken(code: string): Promise<SnAuthToken> {
  const response = await apiFetch("/padlock/auth/token", {
    method: "POST",
    body: JSON.stringify({ grant_type: "authorization_code", code }),
    skipAuth: true,
  });

  const data = await safeJsonParse<{
    token: string;
    refresh_token?: string;
    expires_in?: number;
    refresh_expires_in?: number;
  }>(response);

  // Store the token pair with refresh token info
  setTokenFromResponse(
    data.token,
    data.refresh_token,
    data.expires_in,
    data.refresh_expires_in,
  );

  return {
    token: data.token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
    refreshExpiresIn: data.refresh_expires_in,
  };
}

export async function refreshApiAccessToken(
  refreshToken: string,
): Promise<StoredTokenPair | null> {
  try {
    const response = await apiFetch("/padlock/auth/token", {
      method: "POST",
      body: JSON.stringify({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
      skipAuth: true,
    });

    const data = await safeJsonParse<{
      token: string;
      refresh_token?: string;
      expires_in?: number;
      refresh_expires_in?: number;
    }>(response);

    setTokenFromResponse(
      data.token,
      data.refresh_token,
      data.expires_in,
      data.refresh_expires_in,
    );

    return readTokenPair();
  } catch (err) {
    console.error("Token refresh failed:", err);
    return null;
  }
}

export async function getUserInfo(): Promise<User> {
  const response = await apiFetch("/passport/accounts/me");
  return safeJsonParse<User>(response);
}

export async function createAccount(payload: {
  name: string;
  nick: string;
  email: string;
  password: string;
  language: string;
  captchaToken: string;
}): Promise<unknown> {
  const response = await apiFetch("/padlock/accounts", {
    method: "POST",
    body: JSON.stringify(camelToSnake({ ...payload })),
    skipAuth: true,
  });
  return safeJsonParse<unknown>(response);
}

export async function requestPasswordReset(
  account: string,
  captchaToken: string,
): Promise<unknown> {
  const response = await apiFetch("/padlock/accounts/recovery/password", {
    method: "POST",
    body: JSON.stringify(camelToSnake({ account, captchaToken })),
    skipAuth: true,
  });
  return safeJsonParse<unknown>(response);
}

export async function getCaptchaConfig(): Promise<CaptchaConfig> {
  const response = await apiFetch("/padlock/auth/captcha", { skipAuth: true });
  return safeJsonParse<CaptchaConfig>(response);
}

export async function getAuthorizeClientInfo(query: URLSearchParams): Promise<{
  clientName?: string;
  homeUri?: string;
  picture?: { id?: string };
  background?: { id?: string };
  scopes?: string[];
}> {
  const response = await apiFetch(
    `/padlock/auth/open/authorize?${query.toString()}`,
    { skipAuth: true },
  );
  return safeJsonParse(response);
}

export async function submitAuthorizeDecision(
  query: URLSearchParams,
  authorize: boolean,
): Promise<{ redirectUri?: string }> {
  const payload = new URLSearchParams(query);
  payload.set("authorize", authorize ? "true" : "false");

  const response = await apiFetch("/padlock/auth/open/authorize", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: payload.toString(),
  });
  return safeJsonParse(response);
}

export async function getOrder(orderId: string): Promise<WalletOrder> {
  const response = await apiFetch(
    `/passport/orders/${encodeURIComponent(orderId)}`,
  );
  return safeJsonParse<WalletOrder>(response);
}

export async function payOrder(
  orderId: string,
  pinCode: string,
): Promise<unknown> {
  const response = await apiFetch(
    `/passport/orders/${encodeURIComponent(orderId)}/pay`,
    {
      method: "POST",
      body: JSON.stringify({ pin_code: pinCode }),
    },
  );
  return safeJsonParse(response);
}

export async function getSpell(spellWord: string): Promise<SpellInfo> {
  const response = await apiFetch(
    `/passport/spells/${encodeURIComponent(spellWord)}`,
  );
  return safeJsonParse<SpellInfo>(response);
}

export async function applySpell(
  spellWord: string,
  newPassword?: string,
): Promise<unknown> {
  const response = await apiFetch(
    `/passport/spells/${encodeURIComponent(spellWord)}/apply`,
    {
      method: "POST",
      body: newPassword ? JSON.stringify({ new_password: newPassword }) : null,
    },
  );
  return safeJsonParse(response);
}

export function getOidcLoginUrl(
  provider: string,
  deviceId: string,
  returnUrl: string,
): string {
  const params = new URLSearchParams({ returnUrl, deviceId, flow: "login" });
  return `${API_BASE_URL}/padlock/auth/login/${provider.toLowerCase()}?${params}`;
}

// Data API - Posts
export async function fetchPosts(
  take = 20,
  offset = 0,
  options: {
    replies?: boolean;
    realm?: string;
    media?: boolean;
    queryTerm?: string;
    type?: string;
    orderDesc?: boolean;
    pub?: string;
  } = {},
): Promise<{ posts: Post[]; total: number }> {
  const params = new URLSearchParams({
    take: String(take),
    offset: String(offset),
    replies: String(options.replies ?? false),
  });

  if (options.realm) params.set("realm", options.realm);
  if (options.media) params.set("media", String(options.media));
  if (options.queryTerm) params.set("query", options.queryTerm);
  if (options.type) params.set("type", options.type);
  if (options.orderDesc) params.set("orderDesc", String(options.orderDesc));
  if (options.pub) params.set("pub", options.pub);

  const response = await apiFetch(`/sphere/posts?${params.toString()}`, {
    skipAuth: true,
  });

  const total = parseInt(response.headers.get("x-total") || "0", 10);
  const data = await safeJsonParse<Post[]>(response);

  return { posts: data, total };
}

export async function fetchPost(id: string): Promise<Post> {
  const response = await apiFetch(`/sphere/posts/${id}`, { skipAuth: true });
  return safeJsonParse<Post>(response);
}

export async function fetchPostReplies(id: string): Promise<Post[]> {
  const response = await apiFetch(`/sphere/posts/${id}/replies`, {
    skipAuth: true,
  });
  return safeJsonParse<Post[]>(response);
}

// Data API - Publishers
export async function fetchPublisher(name: string): Promise<Publisher> {
  const response = await apiFetch(
    `/sphere/publishers/${encodeURIComponent(name)}`,
    { skipAuth: true },
  );
  return safeJsonParse<Publisher>(response);
}

export async function fetchPublisherPosts(
  name: string,
  take = 20,
  offset = 0,
): Promise<{ posts: Post[]; total: number }> {
  const params = new URLSearchParams({
    pub: name,
    take: String(take),
    offset: String(offset),
    replies: "false",
  });

  const response = await apiFetch(`/sphere/posts?${params.toString()}`, {
    skipAuth: true,
  });

  const total = parseInt(response.headers.get("x-total") || "0", 10);
  const data = await safeJsonParse<Post[]>(response);

  return { posts: data, total };
}

export async function fetchPublishers(): Promise<Publisher[]> {
  const response = await apiFetch("/sphere/publishers", { skipAuth: true });
  return safeJsonParse<Publisher[]>(response);
}

// Data API - Accounts
export async function fetchAccount(name: string): Promise<User> {
  const response = await apiFetch(
    `/passport/accounts/${encodeURIComponent(name)}`,
    { skipAuth: true },
  );
  return safeJsonParse<User>(response);
}

// Data API - Realms
export async function fetchRealm(slug: string): Promise<Realm> {
  const response = await apiFetch(
    `/passport/realms/${encodeURIComponent(slug)}`,
    { skipAuth: true },
  );
  return safeJsonParse<Realm>(response);
}

export async function fetchRealmPosts(
  slug: string,
  take = 20,
  offset = 0,
): Promise<{ posts: Post[]; total: number }> {
  const params = new URLSearchParams({
    realm: slug,
    take: String(take),
    offset: String(offset),
    replies: "false",
  });

  const response = await apiFetch(`/sphere/posts?${params.toString()}`, {
    skipAuth: true,
  });

  const total = parseInt(response.headers.get("x-total") || "0", 10);
  const data = await safeJsonParse<Post[]>(response);

  return { posts: data, total };
}

// Data API - Livestreams
export async function fetchLivestreams(): Promise<LivestreamDetail[]> {
  const response = await apiFetch("/sphere/livestreams", { skipAuth: true });
  return safeJsonParse<LivestreamDetail[]>(response);
}

export async function fetchLivestream(id: string): Promise<LivestreamDetail> {
  const response = await apiFetch(`/sphere/livestreams/${id}`, {
    skipAuth: true,
  });
  return safeJsonParse<LivestreamDetail>(response);
}

export async function fetchLivestreamChatHistory(
  livestreamId: string,
): Promise<unknown[]> {
  const response = await apiFetch(
    `/sphere/livestreams/${livestreamId}/chat/history`,
  );
  return safeJsonParse<unknown[]>(response);
}

export async function fetchLivestreamLeaderboard(
  livestreamId: string,
): Promise<unknown[]> {
  const response = await apiFetch(
    `/sphere/livestreams/${livestreamId}/leaderboard`,
  );
  return safeJsonParse<unknown[]>(response);
}

export async function fetchLivestreamCredentials(
  livestreamId: string,
): Promise<{ url: string; token: string }> {
  const response = await apiFetch(
    `/sphere/livestreams/${livestreamId}/credentials`,
  );
  return safeJsonParse(response);
}
