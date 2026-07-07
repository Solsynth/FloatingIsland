import { apiFetch, fetchJson, safeJsonParse } from '~/utils/api'
import { camelToSnake } from '~/utils/case'
import type {
  AdminAccountListEntry,
  AdminAccountDetail,
  AdminAccountQuery,
  SuspendPayload,
  NotificationPayload,
  EmailPayload,
  BulkDeliveryResult,
  SnAccountPunishment,
  AdminPost,
  AdminPostQuery,
  PostLockState,
  PostVisibilityPayload,
  PostShadowbanPayload,
  PostRealmRemovePayload,
  PostBatchResult,
  AdminTransaction,
  AdminTransactionQuery,
  AdminWalletOrder,
  AdminOrderQuery,
  BalanceModifyPayload,
  AdminSubscription,
  AdminSubscriptionQuery,
  AdminSubscriptionCatalogItem,
  GoldsResupplyPack,
  MaintenanceResult,
  CacheStats,
  CacheGroupInfo,
  CacheClearPayload,
  CacheClearResult,
  ContactPayload,
  ContactUpdatePayload,
  ContactVerifyPayload,
  ContactVisibilityPayload,
  AuthFactorCreatePayload,
  PasswordResetPayload,
  VerificationPayload,
  BadgeGrantPayload,
  SnContact,
  AdminAuthFactor,
  AdminDevice,
  AdminDeviceQuery,
  AdminSession,
  AdminSessionQuery,
  DeviceLabelPayload,
  NotificationObservability,
} from '~/types/admin'

// Padlock service: auth, sessions, punishments, suspend, delete, notifications, emails
const PADLOCK_BASE = '/padlock/admin/accounts'
// Passport service: profile-hydrated accounts, activities, status, badges
const PASSPORT_BASE = '/passport/admin/accounts'
// Sphere service: post moderation
const SPHERE_POSTS = '/sphere/admin/posts'
// Wallet service: payments, subscriptions, products
const WALLET_PAYMENTS = '/wallet/admin/payments'
const WALLET_SUBSCRIPTIONS = '/wallet/admin/subscriptions'
const WALLET_PRODUCTS = '/wallet/admin/wallet-products'
// Padlock service: cache management
const PADLOCK_CACHE = '/padlock/admin/cache'
// Ring service: notification observability
const RING_ADMIN = '/ring/admin'

async function fetchPaginated<T>(
  endpoint: string,
): Promise<{ items: T[]; total: number }> {
  const res = await apiFetch(endpoint)
  const totalHeader = res.headers.get('X-Total')
  const total = totalHeader ? parseInt(totalHeader, 10) : 0
  const items = await safeJsonParse<T[]>(res)
  return { items, total }
}

function buildQuery(params: Record<string, unknown>): string {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key.replace(/[A-Z]/g, (l) => `_${l.toLowerCase()}`), String(value))
    }
  }
  return query.toString()
}

export async function fetchAdminAccounts(
  params: AdminAccountQuery = {},
): Promise<{ accounts: AdminAccountListEntry[]; total: number }> {
  const query = new URLSearchParams()
  if (params.query) query.set('query', params.query)
  if (params.take) query.set('take', String(params.take))
  if (params.offset) query.set('offset', String(params.offset))
  if (params.orderBy) query.set('order_by', params.orderBy)

  const qs = query.toString()
  const endpoint = `${PADLOCK_BASE}${qs ? `?${qs}` : ''}`

  const res = await apiFetch(endpoint)

  const totalHeader = res.headers.get('X-Total')
  const total = totalHeader ? parseInt(totalHeader, 10) : 0

  const accounts = await safeJsonParse<AdminAccountListEntry[]>(res)

  return { accounts, total }
}

export async function fetchAdminAccountDetail(
  identifier: string,
): Promise<AdminAccountDetail> {
  return fetchJson<AdminAccountDetail>(`${PASSPORT_BASE}/${identifier}`)
}

export async function revokeAccountSessions(name: string): Promise<void> {
  await fetchJson(`${PADLOCK_BASE}/${name}/sessions/revoke`, {
    method: 'POST',
  })
}

export async function fetchAccountDevices(
  name: string,
  params: AdminDeviceQuery = {},
): Promise<{ items: AdminDevice[]; total: number }> {
  const qs = buildQuery(params as unknown as Record<string, unknown>)
  const endpoint = `${PADLOCK_BASE}/${name}/devices${qs ? `?${qs}` : ''}`
  return fetchPaginated<AdminDevice>(endpoint)
}

export async function adminUpdateDeviceLabel(
  name: string,
  deviceId: string,
  payload: DeviceLabelPayload,
): Promise<void> {
  await fetchJson(`${PADLOCK_BASE}/${name}/devices/${deviceId}/label`, {
    method: 'PATCH',
    body: JSON.stringify(camelToSnake(payload)),
  })
}

export async function revokeDeviceSessions(
  name: string,
  deviceId: string,
): Promise<void> {
  await fetchJson(`${PADLOCK_BASE}/${name}/devices/${deviceId}/sessions/revoke`, {
    method: 'POST',
  })
}

export async function deleteAccountDevice(
  name: string,
  deviceId: string,
): Promise<void> {
  await fetchJson(`${PADLOCK_BASE}/${name}/devices/${deviceId}`, {
    method: 'DELETE',
  })
}

export async function fetchAccountSessions(
  name: string,
  params: AdminSessionQuery = {},
): Promise<{ items: AdminSession[]; total: number }> {
  const qs = buildQuery(params as unknown as Record<string, unknown>)
  const endpoint = `${PADLOCK_BASE}/${name}/sessions${qs ? `?${qs}` : ''}`
  return fetchPaginated<AdminSession>(endpoint)
}

export async function adminFetchSessionChildren(
  name: string,
  sessionId: string,
): Promise<AdminSession[]> {
  return fetchJson<AdminSession[]>(`${PADLOCK_BASE}/${name}/sessions/${sessionId}/children`)
}

export async function adminRevokeSession(
  name: string,
  sessionId: string,
): Promise<void> {
  await fetchJson(`${PADLOCK_BASE}/${name}/sessions/${sessionId}`, {
    method: 'DELETE',
  })
}

export async function suspendAccount(
  name: string,
  payload: SuspendPayload,
): Promise<SnAccountPunishment> {
  return fetchJson<SnAccountPunishment>(`${PADLOCK_BASE}/${name}/suspend`, {
    method: 'POST',
    body: JSON.stringify(camelToSnake(payload)),
  })
}

export async function deleteAdminAccount(name: string): Promise<void> {
  await fetchJson(`${PADLOCK_BASE}/${name}`, {
    method: 'DELETE',
  })
}

export async function sendAdminNotifications(
  payload: NotificationPayload,
): Promise<BulkDeliveryResult> {
  return fetchJson<BulkDeliveryResult>(`${PADLOCK_BASE}/notifications`, {
    method: 'POST',
    body: JSON.stringify(camelToSnake(payload)),
  })
}

export async function sendAdminEmails(
  payload: EmailPayload,
): Promise<BulkDeliveryResult> {
  return fetchJson<BulkDeliveryResult>(`${PADLOCK_BASE}/emails`, {
    method: 'POST',
    body: JSON.stringify(camelToSnake(payload)),
  })
}

export async function fetchNotificationObservability(): Promise<NotificationObservability> {
  return fetchJson<NotificationObservability>(`${RING_ADMIN}/notifications/observability`)
}

export async function fetchPunishmentsCreated(): Promise<SnAccountPunishment[]> {
  return fetchJson<SnAccountPunishment[]>(`${PADLOCK_BASE}/punishments/created`)
}

export async function createPunishment(
  name: string,
  payload: Record<string, unknown>,
): Promise<SnAccountPunishment> {
  return fetchJson<SnAccountPunishment>(`${PADLOCK_BASE}/${name}/punishments`, {
    method: 'POST',
    body: JSON.stringify(camelToSnake(payload)),
  })
}

export async function updatePunishment(
  name: string,
  punishmentId: string,
  payload: Record<string, unknown>,
): Promise<SnAccountPunishment> {
  return fetchJson<SnAccountPunishment>(
    `${PADLOCK_BASE}/${name}/punishments/${punishmentId}`,
    {
      method: 'PATCH',
      body: JSON.stringify(camelToSnake(payload)),
    },
  )
}

export async function deletePunishment(
  name: string,
  punishmentId: string,
): Promise<void> {
  await fetchJson(`${PADLOCK_BASE}/${name}/punishments/${punishmentId}`, {
    method: 'DELETE',
  })
}

export async function scanSteamPresence(
  identifier?: string,
  steamId?: string,
): Promise<void> {
  let endpoint: string
  if (steamId) {
    endpoint = `${PASSPORT_BASE}/presences/steam/scan-by-steam-id/${steamId}`
  } else if (identifier) {
    endpoint = `${PASSPORT_BASE}/presences/steam/scan/${identifier}`
  } else {
    endpoint = `${PASSPORT_BASE}/presences/steam/scan`
  }
  await fetchJson(endpoint, { method: 'POST' })
}

export async function invalidateSocialCredits(name: string): Promise<void> {
  await fetchJson(`${PASSPORT_BASE}/${name}/credits`, { method: 'POST' })
}

// ============ Post Admin ============

export async function fetchAdminPosts(
  params: AdminPostQuery = {},
): Promise<{ posts: AdminPost[]; total: number }> {
  const qs = buildQuery(params as unknown as Record<string, unknown>)
  const endpoint = `${SPHERE_POSTS}${qs ? `?${qs}` : ''}`
  const { items, total } = await fetchPaginated<AdminPost>(endpoint)
  return { posts: items, total }
}

export async function fetchAdminPost(id: string): Promise<AdminPost> {
  return fetchJson<AdminPost>(`${SPHERE_POSTS}/${id}`)
}

export async function fetchPostLockState(id: string): Promise<PostLockState> {
  return fetchJson<PostLockState>(`${SPHERE_POSTS}/${id}/lock`)
}

export async function lockPost(id: string): Promise<void> {
  await fetchJson(`${SPHERE_POSTS}/${id}/lock`, { method: 'POST' })
}

export async function unlockPost(id: string): Promise<void> {
  await fetchJson(`${SPHERE_POSTS}/${id}/lock`, { method: 'DELETE' })
}

export async function batchLockPosts(ids: string[]): Promise<PostBatchResult> {
  return fetchJson<PostBatchResult>(`${SPHERE_POSTS}/lock/batch`, {
    method: 'POST',
    body: JSON.stringify(ids),
  })
}

export async function batchUnlockPosts(ids: string[]): Promise<PostBatchResult> {
  return fetchJson<PostBatchResult>(`${SPHERE_POSTS}/lock/batch`, {
    method: 'DELETE',
    body: JSON.stringify(ids),
  })
}

export async function changePostVisibility(
  id: string,
  payload: PostVisibilityPayload,
): Promise<void> {
  await fetchJson(`${SPHERE_POSTS}/${id}/visibility`, {
    method: 'POST',
    body: JSON.stringify(camelToSnake(payload)),
  })
}

export async function shadowbanPost(
  id: string,
  payload: PostShadowbanPayload,
): Promise<void> {
  await fetchJson(`${SPHERE_POSTS}/${id}/shadowban`, {
    method: 'POST',
    body: JSON.stringify(camelToSnake(payload)),
  })
}

export async function unshadowbanPost(id: string): Promise<void> {
  await fetchJson(`${SPHERE_POSTS}/${id}/shadowban`, { method: 'DELETE' })
}

export async function removePostFromRealm(
  id: string,
  payload: PostRealmRemovePayload,
): Promise<void> {
  await fetchJson(`${SPHERE_POSTS}/${id}/realm/remove`, {
    method: 'POST',
    body: JSON.stringify(camelToSnake(payload)),
  })
}

export async function deleteAdminPost(id: string): Promise<void> {
  await fetchJson(`${SPHERE_POSTS}/${id}`, { method: 'DELETE' })
}

// ============ Wallet Admin ============

export async function fetchAdminTransactions(
  params: AdminTransactionQuery = {},
): Promise<{ items: AdminTransaction[]; total: number }> {
  const qs = buildQuery(params as unknown as Record<string, unknown>)
  const endpoint = `${WALLET_PAYMENTS}/transactions${qs ? `?${qs}` : ''}`
  return fetchPaginated<AdminTransaction>(endpoint)
}

export async function fetchAdminTransaction(id: string): Promise<AdminTransaction> {
  return fetchJson<AdminTransaction>(`${WALLET_PAYMENTS}/transactions/${id}`)
}

export async function fetchAdminOrders(
  params: AdminOrderQuery = {},
): Promise<{ items: AdminWalletOrder[]; total: number }> {
  const qs = buildQuery(params as unknown as Record<string, unknown>)
  const endpoint = `${WALLET_PAYMENTS}/orders${qs ? `?${qs}` : ''}`
  return fetchPaginated<AdminWalletOrder>(endpoint)
}

export async function fetchAdminOrder(id: string): Promise<AdminWalletOrder> {
  return fetchJson<AdminWalletOrder>(`${WALLET_PAYMENTS}/orders/${id}`)
}

export async function modifyBalance(payload: BalanceModifyPayload): Promise<void> {
  await fetchJson(`${WALLET_PAYMENTS}/balance`, {
    method: 'POST',
    body: JSON.stringify(camelToSnake(payload)),
  })
}

export async function fetchSubscriptions(
  params: AdminSubscriptionQuery = {},
): Promise<{ items: AdminSubscription[]; total: number }> {
  const qs = buildQuery(params as unknown as Record<string, unknown>)
  const endpoint = `${WALLET_SUBSCRIPTIONS}${qs ? `?${qs}` : ''}`
  return fetchPaginated<AdminSubscription>(endpoint)
}

export async function fetchSubscriptionCatalog(): Promise<AdminSubscriptionCatalogItem[]> {
  return fetchJson<AdminSubscriptionCatalogItem[]>(`${WALLET_SUBSCRIPTIONS}/catalog`)
}

export async function fetchSubscriptionCatalogItem(
  identifier: string,
): Promise<AdminSubscriptionCatalogItem> {
  return fetchJson<AdminSubscriptionCatalogItem>(`${WALLET_SUBSCRIPTIONS}/catalog/${identifier}`)
}

export async function saveSubscriptionCatalogItem(
  payload: AdminSubscriptionCatalogItem,
): Promise<AdminSubscriptionCatalogItem> {
  return fetchJson<AdminSubscriptionCatalogItem>(`${WALLET_SUBSCRIPTIONS}/catalog`, {
    method: 'POST',
    body: JSON.stringify(camelToSnake(payload)),
  })
}

export async function deleteSubscriptionCatalogItem(identifier: string): Promise<void> {
  await fetchJson(`${WALLET_SUBSCRIPTIONS}/catalog/${identifier}`, { method: 'DELETE' })
}

export async function runMaintenanceUpdateExpired(
  batchSize?: number,
): Promise<MaintenanceResult> {
  return fetchJson<MaintenanceResult>(`${WALLET_SUBSCRIPTIONS}/maintenance/update-expired`, {
    method: 'POST',
    body: batchSize ? JSON.stringify({ batch_size: batchSize }) : undefined,
  })
}

export async function runMaintenanceActivatePending(
  batchSize?: number,
): Promise<MaintenanceResult> {
  return fetchJson<MaintenanceResult>(`${WALLET_SUBSCRIPTIONS}/maintenance/activate-pending`, {
    method: 'POST',
    body: batchSize ? JSON.stringify({ batch_size: batchSize }) : undefined,
  })
}

export async function runMaintenanceCancelInAppWallet(): Promise<MaintenanceResult> {
  return fetchJson<MaintenanceResult>(`${WALLET_SUBSCRIPTIONS}/maintenance/cancel-unavailable-in-app-wallet`, {
    method: 'POST',
  })
}

export async function fetchGoldsResupplyPack(): Promise<GoldsResupplyPack> {
  return fetchJson<GoldsResupplyPack>(`${WALLET_PRODUCTS}/golds-resupply-pack`)
}

export async function applyWalletProductOrder(orderId: string): Promise<void> {
  await fetchJson(`${WALLET_PRODUCTS}/orders/${orderId}/apply`, { method: 'POST' })
}

// ============ Cache Admin ============

export async function fetchCacheStats(): Promise<CacheStats> {
  return fetchJson<CacheStats>(`${PADLOCK_CACHE}/stats`)
}

export async function fetchCacheGroup(group: string): Promise<CacheGroupInfo> {
  return fetchJson<CacheGroupInfo>(`${PADLOCK_CACHE}/groups/${encodeURIComponent(group)}`)
}

export async function clearCacheByKey(payload: CacheClearPayload): Promise<CacheClearResult> {
  return fetchJson<CacheClearResult>(`${PADLOCK_CACHE}/keys/clear`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function clearCacheByGroup(payload: CacheClearPayload): Promise<CacheClearResult> {
  return fetchJson<CacheClearResult>(`${PADLOCK_CACHE}/groups/clear`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function clearAllCache(): Promise<CacheClearResult> {
  return fetchJson<CacheClearResult>(`${PADLOCK_CACHE}/clear`, { method: 'POST' })
}

// ============ Account Contact Management (Padlock) ============

export async function fetchAccountContacts(name: string): Promise<SnContact[]> {
  return fetchJson<SnContact[]>(`${PADLOCK_BASE}/${name}/contacts`)
}

export async function createAccountContact(
  name: string,
  payload: ContactPayload,
): Promise<SnContact> {
  return fetchJson<SnContact>(`${PADLOCK_BASE}/${name}/contacts`, {
    method: 'POST',
    body: JSON.stringify(camelToSnake(payload)),
  })
}

export async function updateAccountContact(
  name: string,
  contactId: string,
  payload: ContactUpdatePayload,
): Promise<SnContact> {
  return fetchJson<SnContact>(`${PADLOCK_BASE}/${name}/contacts/${contactId}`, {
    method: 'PATCH',
    body: JSON.stringify(camelToSnake(payload)),
  })
}

export async function requestContactVerification(
  name: string,
  contactId: string,
): Promise<void> {
  await fetchJson(`${PADLOCK_BASE}/${name}/contacts/${contactId}/verify/request`, {
    method: 'POST',
  })
}

export async function verifyContact(
  name: string,
  contactId: string,
  payload?: ContactVerifyPayload,
): Promise<void> {
  await fetchJson(`${PADLOCK_BASE}/${name}/contacts/${contactId}/verify`, {
    method: 'POST',
    body: payload ? JSON.stringify(camelToSnake(payload)) : undefined,
  })
}

export async function unverifyContact(
  name: string,
  contactId: string,
): Promise<void> {
  await fetchJson(`${PADLOCK_BASE}/${name}/contacts/${contactId}/verify`, {
    method: 'DELETE',
  })
}

export async function setPrimaryContact(
  name: string,
  contactId: string,
): Promise<void> {
  await fetchJson(`${PADLOCK_BASE}/${name}/contacts/${contactId}/primary`, {
    method: 'POST',
  })
}

export async function setContactVisibility(
  name: string,
  contactId: string,
  payload: ContactVisibilityPayload,
): Promise<void> {
  await fetchJson(`${PADLOCK_BASE}/${name}/contacts/${contactId}/visibility`, {
    method: 'POST',
    body: JSON.stringify(camelToSnake(payload)),
  })
}

export async function deleteAccountContact(
  name: string,
  contactId: string,
): Promise<void> {
  await fetchJson(`${PADLOCK_BASE}/${name}/contacts/${contactId}`, {
    method: 'DELETE',
  })
}

// ============ Auth Factor Management (Padlock) ============

export async function fetchAccountFactors(name: string): Promise<AdminAuthFactor[]> {
  return fetchJson<AdminAuthFactor[]>(`${PADLOCK_BASE}/${name}/factors`)
}

export async function createAccountFactor(
  name: string,
  payload: AuthFactorCreatePayload,
): Promise<AdminAuthFactor> {
  return fetchJson<AdminAuthFactor>(`${PADLOCK_BASE}/${name}/factors`, {
    method: 'POST',
    body: JSON.stringify(camelToSnake(payload)),
  })
}

export async function enableAccountFactor(
  name: string,
  factorId: string,
): Promise<void> {
  await fetchJson(`${PADLOCK_BASE}/${name}/factors/${factorId}/enable`, {
    method: 'POST',
  })
}

export async function disableAccountFactor(
  name: string,
  factorId: string,
): Promise<void> {
  await fetchJson(`${PADLOCK_BASE}/${name}/factors/${factorId}/disable`, {
    method: 'POST',
  })
}

export async function resetAccountPassword(
  name: string,
  payload: PasswordResetPayload,
): Promise<void> {
  await fetchJson(`${PADLOCK_BASE}/${name}/factors/password/reset`, {
    method: 'POST',
    body: JSON.stringify(camelToSnake(payload)),
  })
}

export async function deleteAccountFactor(
  name: string,
  factorId: string,
): Promise<void> {
  await fetchJson(`${PADLOCK_BASE}/${name}/factors/${factorId}`, {
    method: 'DELETE',
  })
}

// ============ Verification (Passport) ============

export async function setVerification(
  identifier: string,
  payload: VerificationPayload,
): Promise<void> {
  await fetchJson(`${PASSPORT_BASE}/${identifier}/verification`, {
    method: 'POST',
    body: JSON.stringify(camelToSnake(payload)),
  })
}

export async function clearVerification(identifier: string): Promise<void> {
  await fetchJson(`${PASSPORT_BASE}/${identifier}/verification`, {
    method: 'DELETE',
  })
}

// ============ Badge Management (Passport) ============

export async function fetchAccountBadges(identifier: string): Promise<Record<string, unknown>[]> {
  return fetchJson<Record<string, unknown>[]>(`${PASSPORT_BASE}/${identifier}/badges`)
}

export async function grantBadge(
  identifier: string,
  payload: BadgeGrantPayload,
): Promise<void> {
  await fetchJson(`${PASSPORT_BASE}/${identifier}/badges`, {
    method: 'POST',
    body: JSON.stringify(camelToSnake(payload)),
  })
}

export async function activateBadge(
  identifier: string,
  badgeId: string,
): Promise<void> {
  await fetchJson(`${PASSPORT_BASE}/${identifier}/badges/${badgeId}/activate`, {
    method: 'POST',
  })
}

export async function revokeBadge(
  identifier: string,
  badgeId: string,
): Promise<void> {
  await fetchJson(`${PASSPORT_BASE}/${identifier}/badges/${badgeId}`, {
    method: 'DELETE',
  })
}

// ============ Passport Read-Only Contacts & Factors ============

export async function fetchPassportContacts(identifier: string): Promise<SnContact[]> {
  return fetchJson<SnContact[]>(`${PASSPORT_BASE}/${identifier}/contacts`)
}

export async function fetchPassportFactors(identifier: string): Promise<AdminAuthFactor[]> {
  return fetchJson<AdminAuthFactor[]>(`${PASSPORT_BASE}/${identifier}/factors`)
}

// ============ Presence Scan Extras ============

export async function scanSteamPresenceByStage(stage: string): Promise<void> {
  await fetchJson(`${PASSPORT_BASE}/presences/steam/scan/stages/${stage}`, {
    method: 'POST',
  })
}
