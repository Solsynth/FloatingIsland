import type {
  SnAuthChallenge,
  SnAuthFactor,
  SnAuthToken,
  User,
  CaptchaConfig,
  WalletOrder,
  SpellInfo,
} from "~/types/auth";
import type { Publisher } from "~/types/post";
import type { Realm } from "~/types/realm";
import type { LivestreamDetail } from "~/types/livestream";
import { snakeToCamel, camelToSnake } from "~/utils/case";

export const API_BASE = "api.solian.app";
export const API_BASE_URL = `https://${API_BASE}`;

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

async function safeJsonParse<T>(response: Response): Promise<T> {
  const data = await parseResponse(response);
  return snakeToCamel(data) as T;
}

function getAuthToken(): string | null {
  if (import.meta.server) return null;
  return localStorage.getItem("auth_token");
}

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {},
): Promise<Response> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });

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
  options: RequestInit = {},
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
  });
  return safeJsonParse<SnAuthChallenge>(response);
}

export async function getFactors(challengeId: string): Promise<SnAuthFactor[]> {
  const response = await apiFetch(
    `/padlock/auth/challenge/${challengeId}/factors`,
  );
  return safeJsonParse<SnAuthFactor[]>(response);
}

export async function getChallenge(
  challengeId: string,
): Promise<SnAuthChallenge> {
  const response = await apiFetch(`/padlock/auth/challenge/${challengeId}`);
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
  });
  return safeJsonParse<SnAuthChallenge>(response);
}

export async function getToken(code: string): Promise<SnAuthToken> {
  const response = await apiFetch("/padlock/auth/token", {
    method: "POST",
    body: JSON.stringify({ grant_type: "authorization_code", code }),
  });
  return safeJsonParse<SnAuthToken>(response);
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
  });
  return safeJsonParse<unknown>(response);
}

export async function getCaptchaConfig(): Promise<CaptchaConfig> {
  const response = await apiFetch("/padlock/auth/captcha");
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

// Data API
export async function fetchPosts(
  take = 20,
  offset = 0,
): Promise<{ posts: Post[]; total: number }> {
  const response = await apiFetch(
    `/sphere/posts?take=${take}&offset=${offset}`,
  );
  return safeJsonParse(response);
}

export async function fetchPost(id: string): Promise<Post> {
  const response = await apiFetch(`/sphere/posts/${id}`);
  return safeJsonParse<Post>(response);
}

export async function fetchPostReplies(id: string): Promise<Post[]> {
  const response = await apiFetch(`/sphere/posts/${id}/replies`);
  return safeJsonParse<Post[]>(response);
}

export async function fetchPublisherPosts(
  name: string,
  take = 20,
  offset = 0,
): Promise<{ posts: Post[]; total: number }> {
  const response = await apiFetch(
    `/sphere/publishers/${encodeURIComponent(name)}/posts?take=${take}&offset=${offset}`,
  );
  return safeJsonParse(response);
}

export async function fetchRealmPosts(
  slug: string,
  take = 20,
  offset = 0,
): Promise<{ posts: Post[]; total: number }> {
  const response = await apiFetch(
    `/sphere/realms/${encodeURIComponent(slug)}/posts?take=${take}&offset=${offset}`,
  );
  return safeJsonParse(response);
}

export async function fetchAccount(name: string): Promise<User> {
  const response = await apiFetch(
    `/passport/accounts/${encodeURIComponent(name)}`,
  );
  return safeJsonParse<User>(response);
}

export async function fetchPublisher(name: string): Promise<Publisher> {
  const response = await apiFetch(
    `/sphere/publishers/${encodeURIComponent(name)}`,
  );
  return safeJsonParse<Publisher>(response);
}

export async function fetchPublishers(): Promise<Publisher[]> {
  const response = await apiFetch("/sphere/publishers");
  return safeJsonParse<Publisher[]>(response);
}

export async function fetchRealm(slug: string): Promise<Realm> {
  const response = await apiFetch(
    `/passport/realms/${encodeURIComponent(slug)}`,
  );
  return safeJsonParse<Realm>(response);
}

export async function fetchLivestreams(): Promise<LivestreamDetail[]> {
  const response = await apiFetch("/sphere/livestreams");
  return safeJsonParse<LivestreamDetail[]>(response);
}

export async function fetchLivestream(id: string): Promise<LivestreamDetail> {
  const response = await apiFetch(`/sphere/livestreams/${id}`);
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
