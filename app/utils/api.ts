import type {
  SnAuthChallenge,
  SnAuthFactor,
  SnAuthToken,
  SnAccount,
  CaptchaConfig,
  WalletOrder,
  SpellInfo,
} from "~/types/auth";
import type { Publisher, Post } from "~/types/post";
import type {
  Realm,
  RealmMember,
  RealmLabel,
  RealmBoostStatus,
  RealmBoostLeaderboardEntry,
  RealmInvite,
  RealmChatRoom,
} from "~/types/realm";
import type { LivestreamDetail } from "~/types/livestream";
import { snakeToCamel, camelToSnake } from "~/utils/case";
import {
  getValidToken,
  readTokenPair,
  setTokenFromResponse,
  refreshAccessToken,
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
      // Force refresh the token
      const refreshed = await refreshAccessToken(API_BASE_URL, tokenPair);
      if (refreshed) {
        // Retry the request with new token
        return apiFetch(endpoint, {
          ...options,
          retryCount: retryCount + 1,
        });
      }
    }

    // If refresh failed, clear auth and throw
    // Note: We don't auto-redirect here to allow components to handle auth errors gracefully
    if (typeof window !== "undefined") {
      const auth = useAuth();
      auth.logout();
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

export async function getUserInfo(): Promise<SnAccount> {
  const response = await apiFetch("/passport/accounts/me");
  return safeJsonParse<SnAccount>(response);
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
  options: {
    type?: string;
    replies?: boolean | null;
    media?: boolean;
    orderDesc?: boolean;
    queryTerm?: string;
  } = {},
): Promise<{ posts: Post[]; total: number }> {
  const params = new URLSearchParams({
    pub: name,
    take: String(take),
    offset: String(offset),
    replies: String(options.replies ?? false),
    orderDesc: String(options.orderDesc ?? true),
  });

  if (options.type) params.set("type", options.type);
  if (options.media) params.set("media", "true");
  if (options.queryTerm) params.set("query", options.queryTerm);

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
export async function fetchAccount(name: string): Promise<SnAccount> {
  const response = await apiFetch(
    `/passport/accounts/${encodeURIComponent(name)}`,
    { skipAuth: true },
  );
  return safeJsonParse<SnAccount>(response);
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
  options: {
    type?: string;
    replies?: boolean | null;
    media?: boolean;
    orderDesc?: boolean;
    queryTerm?: string;
  } = {},
): Promise<{ posts: Post[]; total: number }> {
  const params = new URLSearchParams({
    realm: slug,
    take: String(take),
    offset: String(offset),
    replies: String(options.replies ?? false),
    orderDesc: String(options.orderDesc ?? true),
  });

  if (options.type) params.set("type", options.type);
  if (options.media) params.set("media", "true");
  if (options.queryTerm) params.set("query", options.queryTerm);

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

// Heatmap data for publisher activity
export interface HeatmapData {
  startDate: string;
  endDate: string;
  data: Record<string, number>;
}

export async function fetchPublisherHeatmap(
  publisherName: string,
): Promise<HeatmapData> {
  const response = await apiFetch(
    `/sphere/publishers/${encodeURIComponent(publisherName)}/heatmap`,
    { skipAuth: true },
  );
  return safeJsonParse<HeatmapData>(response);
}

// Publisher subscription status
export interface PublisherSubscriptionStatus {
  status: "none" | "pending" | "following" | "subscribed";
  isPending: boolean;
  subscription?: {
    isActive: boolean;
    notify: boolean;
  };
}

export async function fetchPublisherSubscriptionStatus(
  publisherName: string,
): Promise<PublisherSubscriptionStatus | null> {
  try {
    const response = await apiFetch(
      `/sphere/publishers/${encodeURIComponent(publisherName)}/subscription`,
    );
    return safeJsonParse<PublisherSubscriptionStatus>(response);
  } catch (err) {
    // 404 means not subscribed
    if (err instanceof Error && err.message.includes("404")) {
      return null;
    }
    throw err;
  }
}

export async function subscribeToPublisher(
  publisherName: string,
): Promise<void> {
  await apiFetch(
    `/sphere/publishers/${encodeURIComponent(publisherName)}/subscribers`,
    { method: "POST" },
  );
}

export async function unsubscribeFromPublisher(
  publisherName: string,
): Promise<void> {
  await apiFetch(
    `/sphere/publishers/${encodeURIComponent(publisherName)}/subscribers/me`,
    { method: "DELETE" },
  );
}

export async function setPublisherNotify(
  publisherName: string,
  notify: boolean,
): Promise<void> {
  await apiFetch(
    `/sphere/publishers/${encodeURIComponent(publisherName)}/subscribers/me/notify`,
    {
      method: "PATCH",
      body: JSON.stringify({ notify }),
    },
  );
}

// Pinned posts
export async function fetchPublisherPinnedPosts(
  publisherName: string,
): Promise<Post[]> {
  const response = await apiFetch(
    `/sphere/posts?pub=${encodeURIComponent(publisherName)}&pinned=true&take=10`,
    { skipAuth: true },
  );
  return safeJsonParse<Post[]>(response);
}

// Account timeline (user's posts)
export async function fetchAccountTimeline(
  accountName: string,
  take = 20,
  offset = 0,
): Promise<{ posts: Post[]; total: number }> {
  const params = new URLSearchParams({
    take: String(take),
    offset: String(offset),
    account: accountName,
  });

  const response = await apiFetch(`/sphere/posts?${params.toString()}`, {
    skipAuth: true,
  });

  const total = parseInt(response.headers.get("x-total") || "0", 10);
  const data = await safeJsonParse<Post[]>(response);

  return { posts: data, total };
}

// Account relationships
export interface RelationshipStatus {
  status: number; // -100 = blocked, 0 = none, >0 = friend
  isFriend: boolean;
  isBlocked: boolean;
}

export async function fetchAccountRelationship(
  accountId: string,
): Promise<RelationshipStatus | null> {
  try {
    const response = await apiFetch(
      `/passport/accounts/${accountId}/relationship`,
    );
    return safeJsonParse<RelationshipStatus>(response);
  } catch (err) {
    if (err instanceof Error && err.message.includes("404")) {
      return null;
    }
    throw err;
  }
}

export async function addAccountAsFriend(accountId: string): Promise<void> {
  await apiFetch(`/passport/accounts/${accountId}/relationship`, {
    method: "POST",
  });
}

export async function blockAccount(accountId: string): Promise<void> {
  await apiFetch(`/passport/accounts/${accountId}/block`, {
    method: "POST",
  });
}

export async function unblockAccount(accountId: string): Promise<void> {
  await apiFetch(`/passport/accounts/${accountId}/block`, {
    method: "DELETE",
  });
}

// Relationships
export interface Relationship {
  id: string;
  accountId: string;
  relatedId: string;
  status: number;
  expiredAt?: string;
  account?: {
    id: string;
    name: string;
    nick: string;
    profile: {
      picture?: { id: string };
    };
  };
  related?: {
    id: string;
    name: string;
    nick: string;
    profile: {
      picture?: { id: string };
    };
  };
}

export async function fetchRelationships(
  offset = 0,
  take = 20,
): Promise<{ items: Relationship[]; total: number; hasMore: boolean }> {
  const response = await apiFetch(
    `/passport/relationships?offset=${offset}&take=${take}`,
  );
  const data = await safeJsonParse<Relationship[]>(response);
  const total = parseInt(response.headers.get("x-total") || "0", 10);
  return {
    items: data,
    total,
    hasMore: offset + data.length < total,
  };
}

export async function fetchFriendRequests(): Promise<Relationship[]> {
  const response = await apiFetch("/passport/relationships/requests");
  return safeJsonParse<Relationship[]>(response);
}

export async function sendFriendRequest(accountId: string): Promise<void> {
  await apiFetch(`/passport/relationships/${accountId}/friends`, {
    method: "POST",
  });
}

export async function acceptFriendRequest(accountId: string): Promise<void> {
  await apiFetch(`/passport/relationships/${accountId}/friends/accept`, {
    method: "POST",
  });
}

export async function declineFriendRequest(accountId: string): Promise<void> {
  await apiFetch(`/passport/relationships/${accountId}/friends/decline`, {
    method: "POST",
  });
}

export async function cancelFriendRequest(relatedId: string): Promise<void> {
  await apiFetch(`/passport/relationships/${relatedId}/friends`, {
    method: "DELETE",
  });
}

export async function updateRelationship(
  accountId: string,
  status: number,
): Promise<void> {
  await apiFetch(`/passport/relationships/${accountId}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function deleteRelationship(relatedId: string): Promise<void> {
  await apiFetch(`/passport/relationships/${relatedId}`, {
    method: "DELETE",
  });
}

// Wallet Types
export interface WalletPocket {
  id: string;
  currency: string;
  amount: number;
  walletId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Wallet {
  id: string;
  accountId: string;
  pockets: WalletPocket[];
  createdAt: string;
  updatedAt: string;
}

export interface WalletStats {
  totalIncome: number;
  totalOutgoing: number;
}

export interface Transaction {
  id: string;
  payerWalletId?: string;
  payeeWalletId?: string;
  amount: number;
  currency: string;
  type: number; // 0: transfer, 1: payment
  remarks?: string;
  createdAt: string;
  payerWallet?: {
    account?: {
      id: string;
      name: string;
      nick: string;
      profile: {
        picture?: { id: string };
      };
    };
  };
  payeeWallet?: {
    account?: {
      id: string;
      name: string;
      nick: string;
      profile: {
        picture?: { id: string };
      };
    };
  };
}

export interface Fund {
  id: string;
  senderId: string;
  currency: string;
  totalAmount: number;
  splitType: number; // 0: even, 1: random
  amountOfSplits: number;
  message?: string;
  remainingAmount: number;
  claimedCount: number;
  createdAt: string;
  expiresAt?: string;
}

// Wallet API
export async function fetchWallet(): Promise<Wallet | null> {
  try {
    const response = await apiFetch("/wallet/wallets");
    return safeJsonParse<Wallet>(response);
  } catch (err) {
    if (err instanceof Error && err.message.includes("404")) {
      return null;
    }
    throw err;
  }
}

export async function createWallet(): Promise<Wallet> {
  const response = await apiFetch("/wallet/wallets", {
    method: "POST",
  });
  return safeJsonParse<Wallet>(response);
}

export async function fetchWalletStats(): Promise<WalletStats> {
  const response = await apiFetch("/wallet/wallets/stats");
  return safeJsonParse<WalletStats>(response);
}

export async function fetchTransactions(
  offset = 0,
  take = 20,
): Promise<{ items: Transaction[]; total: number; hasMore: boolean }> {
  const response = await apiFetch(
    `/wallet/wallets/transactions?offset=${offset}&take=${take}`,
  );
  const data = await safeJsonParse<Transaction[]>(response);
  const total = parseInt(response.headers.get("x-total") || "0", 10);
  return {
    items: data,
    total,
    hasMore: offset + data.length < total,
  };
}

export async function createTransfer(payload: {
  amount: number;
  currency: string;
  payeeAccountId: string;
  remark?: string;
  pinCode: string;
}): Promise<void> {
  await apiFetch("/wallet/wallets/transfers", {
    method: "POST",
    body: JSON.stringify({
      amount: payload.amount,
      currency: payload.currency,
      payee_account_id: payload.payeeAccountId,
      remark: payload.remark,
      pin_code: payload.pinCode,
    }),
  });
}

export async function createFund(payload: {
  currency: string;
  totalAmount: number;
  splitType: number;
  amountOfSplits: number;
  recipientAccountIds: string[];
  message?: string;
  pinCode: string;
}): Promise<Fund> {
  const response = await apiFetch("/wallet/wallets/funds", {
    method: "POST",
    body: JSON.stringify({
      currency: payload.currency,
      total_amount: payload.totalAmount,
      split_type: payload.splitType,
      amount_of_splits: payload.amountOfSplits,
      recipient_account_ids: payload.recipientAccountIds,
      message: payload.message,
      pin_code: payload.pinCode,
    }),
  });
  return safeJsonParse<Fund>(response);
}

export async function fetchFunds(
  offset = 0,
  take = 20,
): Promise<{ items: Fund[]; total: number; hasMore: boolean }> {
  const response = await apiFetch(
    `/wallet/wallets/funds?offset=${offset}&take=${take}`,
  );
  const data = await safeJsonParse<Fund[]>(response);
  const total = parseInt(response.headers.get("x-total") || "0", 10);
  return {
    items: data,
    total,
    hasMore: offset + data.length < total,
  };
}

// Badges
export interface Badge {
  id: string;
  type: string;
  label: string | null;
  caption: string | null;
  activatedAt: string | null;
  createdAt: string;
  meta: Record<string, unknown>;
}

export async function fetchMyBadges(): Promise<Badge[]> {
  const response = await apiFetch("/passport/accounts/me/badges");
  return safeJsonParse<Badge[]>(response);
}

export async function activateBadge(badgeId: string): Promise<void> {
  await apiFetch(`/passport/accounts/me/badges/${badgeId}/activate`, {
    method: "POST",
  });
}

// Notifications
export interface Notification {
  id: string;
  topic: string;
  title: string;
  subtitle: string;
  content: string;
  link?: string;
  meta: Record<string, unknown>;
  viewedAt?: string;
  createdAt: string;
}

export async function fetchNotifications(
  offset = 0,
  take = 20,
): Promise<{ items: Notification[]; total: number; hasMore: boolean }> {
  const response = await apiFetch(
    `/ring/notifications?offset=${offset}&take=${take}`,
  );
  const data = await safeJsonParse<Notification[]>(response);
  const total = parseInt(response.headers.get("x-total") || "0", 10);
  return {
    items: data,
    total,
    hasMore: offset + data.length < total,
  };
}

export async function fetchNotificationCount(): Promise<number> {
  try {
    const response = await apiFetch("/ring/notifications/count");
    const data = await response.text();
    return parseInt(data, 10) || 0;
  } catch {
    return 0;
  }
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  await apiFetch(`/ring/notifications/${notificationId}/read`, {
    method: "POST",
  });
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiFetch("/ring/notifications/all/read", {
    method: "POST",
  });
}

// Direct messages
export async function getDirectChat(
  accountId: string,
): Promise<unknown | null> {
  try {
    const response = await apiFetch(`/passport/chat/direct/${accountId}`);
    return safeJsonParse<unknown>(response);
  } catch (err) {
    if (err instanceof Error && err.message.includes("404")) {
      return null;
    }
    throw err;
  }
}

export async function createDirectChat(accountId: string): Promise<unknown> {
  const response = await apiFetch(`/passport/chat/direct`, {
    method: "POST",
    body: JSON.stringify({ account_id: accountId }),
  });
  return safeJsonParse<unknown>(response);
}

// Realm API
export async function fetchRealms(): Promise<Realm[]> {
  const response = await apiFetch("/passport/realms");
  const data = await safeJsonParse<Realm[]>(response);
  return data;
}

export async function createRealm(payload: {
  name: string;
  slug: string;
  description?: string;
  isPublic?: boolean;
  isCommunity?: boolean;
}): Promise<Realm> {
  const response = await apiFetch("/passport/realms", {
    method: "POST",
    body: JSON.stringify(camelToSnake(payload)),
  });
  return safeJsonParse<Realm>(response);
}

export async function updateRealm(
  slug: string,
  payload: {
    name?: string;
    description?: string;
    isPublic?: boolean;
  },
): Promise<Realm> {
  const response = await apiFetch(
    `/passport/realms/${encodeURIComponent(slug)}`,
    {
      method: "PATCH",
      body: JSON.stringify(camelToSnake(payload)),
    },
  );
  return safeJsonParse<Realm>(response);
}

export async function deleteRealm(slug: string): Promise<void> {
  await apiFetch(`/passport/realms/${encodeURIComponent(slug)}`, {
    method: "DELETE",
  });
}

// Realm membership
export async function joinRealm(slug: string): Promise<void> {
  await apiFetch(`/passport/realms/${encodeURIComponent(slug)}/members`, {
    method: "POST",
  });
}

export async function leaveRealm(slug: string): Promise<void> {
  await apiFetch(`/passport/realms/${encodeURIComponent(slug)}/members/me`, {
    method: "DELETE",
  });
}

export async function getMyRealmMembership(
  slug: string,
): Promise<RealmMember | null> {
  try {
    const response = await apiFetch(
      `/passport/realms/${encodeURIComponent(slug)}/members/me`,
    );
    return safeJsonParse<RealmMember>(response);
  } catch (err) {
    if (err instanceof Error && err.message.includes("404")) {
      return null;
    }
    throw err;
  }
}

export async function fetchRealmMembers(
  slug: string,
  take = 50,
  offset = 0,
): Promise<{ members: RealmMember[]; total: number }> {
  const params = new URLSearchParams({
    take: String(take),
    offset: String(offset),
  });
  const response = await apiFetch(
    `/passport/realms/${encodeURIComponent(slug)}/members?${params.toString()}`,
  );
  const total = parseInt(response.headers.get("x-total") || "0", 10);
  const data = await safeJsonParse<RealmMember[]>(response);
  return { members: data, total };
}

// Realm invites
export async function fetchRealmInvites(): Promise<RealmInvite[]> {
  const response = await apiFetch("/passport/realms/invites");
  return safeJsonParse<RealmInvite[]>(response);
}

export async function acceptRealmInvite(slug: string): Promise<void> {
  await apiFetch(
    `/passport/realms/invites/${encodeURIComponent(slug)}/accept`,
    {
      method: "POST",
    },
  );
}

export async function declineRealmInvite(slug: string): Promise<void> {
  await apiFetch(
    `/passport/realms/invites/${encodeURIComponent(slug)}/decline`,
    {
      method: "POST",
    },
  );
}

// Realm boost
export async function fetchRealmBoostStatus(
  slug: string,
): Promise<RealmBoostStatus> {
  const response = await apiFetch(
    `/passport/realms/${encodeURIComponent(slug)}/boost`,
  );
  return safeJsonParse<RealmBoostStatus>(response);
}

export async function fetchRealmBoostLeaderboard(
  slug: string,
  take = 20,
): Promise<RealmBoostLeaderboardEntry[]> {
  const response = await apiFetch(
    `/passport/realms/${encodeURIComponent(slug)}/boost/leaderboard?take=${take}`,
  );
  return safeJsonParse<RealmBoostLeaderboardEntry[]>(response);
}

export async function boostRealm(
  slug: string,
  points: number,
  currency: string,
): Promise<void> {
  await apiFetch(`/passport/realms/${encodeURIComponent(slug)}/boost`, {
    method: "POST",
    body: JSON.stringify({ points, currency }),
  });
}

// Realm labels
export async function fetchRealmLabels(slug: string): Promise<RealmLabel[]> {
  const response = await apiFetch(
    `/passport/realms/${encodeURIComponent(slug)}/labels`,
  );
  return safeJsonParse<RealmLabel[]>(response);
}

export async function createRealmLabel(
  slug: string,
  payload: {
    name: string;
    description?: string;
    icon?: string;
    color?: string;
  },
): Promise<RealmLabel> {
  const response = await apiFetch(
    `/passport/realms/${encodeURIComponent(slug)}/labels`,
    {
      method: "POST",
      body: JSON.stringify(camelToSnake(payload)),
    },
  );
  return safeJsonParse<RealmLabel>(response);
}

export async function updateRealmLabel(
  slug: string,
  labelId: string,
  payload: {
    name?: string;
    description?: string;
    icon?: string;
    color?: string;
  },
): Promise<RealmLabel> {
  const response = await apiFetch(
    `/passport/realms/${encodeURIComponent(slug)}/labels/${labelId}`,
    {
      method: "PATCH",
      body: JSON.stringify(camelToSnake(payload)),
    },
  );
  return safeJsonParse<RealmLabel>(response);
}

export async function deleteRealmLabel(
  slug: string,
  labelId: string,
): Promise<void> {
  await apiFetch(
    `/passport/realms/${encodeURIComponent(slug)}/labels/${labelId}`,
    {
      method: "DELETE",
    },
  );
}

// Update my realm identity (nick, bio, label)
export async function updateRealmIdentity(
  slug: string,
  payload: {
    nick?: string;
    bio?: string;
    labelId?: string | null;
  },
): Promise<RealmMember> {
  const response = await apiFetch(
    `/passport/realms/${encodeURIComponent(slug)}/members/me`,
    {
      method: "PATCH",
      body: JSON.stringify(camelToSnake(payload)),
    },
  );
  return safeJsonParse<RealmMember>(response);
}

// Realm chat rooms
export async function fetchRealmChatRooms(
  slug: string,
): Promise<RealmChatRoom[]> {
  const response = await apiFetch(
    `/passport/realms/${encodeURIComponent(slug)}/chat`,
  );
  return safeJsonParse<RealmChatRoom[]>(response);
}
