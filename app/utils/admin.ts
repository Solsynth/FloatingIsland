import { apiFetch, fetchJson, safeJsonParse } from '~/utils/api'
import type {
  AdminAccountListEntry,
  AdminAccountDetail,
  AdminAccountQuery,
  SuspendPayload,
  NotificationPayload,
  EmailPayload,
  BulkDeliveryResult,
  SnAccountPunishment,
} from '~/types/admin'

// Padlock service: auth, sessions, punishments, suspend, delete, notifications, emails
const PADLOCK_BASE = '/padlock/admin/accounts'
// Passport service: profile-hydrated accounts, activities, status, badges
const PASSPORT_BASE = '/passport/admin/accounts'

export async function fetchAdminAccounts(
  params: AdminAccountQuery = {},
): Promise<{ accounts: AdminAccountListEntry[]; total: number }> {
  const query = new URLSearchParams()
  if (params.query) query.set('query', params.query)
  if (params.take) query.set('take', String(params.take))
  if (params.offset) query.set('offset', String(params.offset))
  if (params.orderBy) query.set('order_by', params.orderBy)

  const qs = query.toString()
  const endpoint = `${PASSPORT_BASE}${qs ? `?${qs}` : ''}`

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

export async function suspendAccount(
  name: string,
  payload: SuspendPayload,
): Promise<SnAccountPunishment> {
  return fetchJson<SnAccountPunishment>(`${PADLOCK_BASE}/${name}/suspend`, {
    method: 'POST',
    body: JSON.stringify(payload),
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
    body: JSON.stringify(payload),
  })
}

export async function sendAdminEmails(
  payload: EmailPayload,
): Promise<BulkDeliveryResult> {
  return fetchJson<BulkDeliveryResult>(`${PADLOCK_BASE}/emails`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
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
    body: JSON.stringify(payload),
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
      body: JSON.stringify(payload),
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
