import type { SnAccount, SnAccountPunishment } from './auth'

export type PunishmentType = 'block_login' | 'disable_account'

export type OrderByField = 'name' | 'name_desc' | 'created_at_desc'

export interface AdminAccountListEntry {
  account: SnAccount
  primaryEmail?: string
  contactCount: number
  authFactorCount: number
  hasPassword: boolean
  activeSessionCount: number
  activeDeviceCount: number
  activePunishment: SnAccountPunishment | null
  status?: SnAccountStatus
  badgeCount?: number
  activeActivityCount?: number
}

export interface SnAccountStatus {
  accountId: string
  label: string
  isOnline: boolean
  type?: number
}

export interface SnContact {
  type: number
  content: string
  isPrimary: boolean
}

export interface AdminAuthFactor {
  id: string
  type: number
  trustworthy?: number
  hasSecret: boolean
  config?: Record<string, unknown> | null
  enabledAt?: string | null
  expiredAt?: string | null
}

export interface AdminAccountDetail {
  account: SnAccount
  contacts?: SnContact[]
  authFactors?: AdminAuthFactor[]
  activeSessionCount: number
  activeDeviceCount: number
  activePunishment: SnAccountPunishment | null
  activePunishments: SnAccountPunishment[]
  status?: SnAccountStatus
  activities?: SnActivity[]
  badgeCount?: number
}

export interface SnActivity {
  provider: string
  title: string
}

export interface SuspendPayload {
  reason: string
  expiredAt?: string
  type: PunishmentType
  revokeSessions?: boolean
  socialCreditReduction?: number
  publisherRatingReduction?: number
  publisherNames?: string[]
}

export interface NotificationPayload {
  accountIds?: string[]
  broadcastToAll?: boolean
  topic: string
  title: string
  subtitle?: string
  body: string
  actionUri?: string
  pushType?: string
  isSilent?: boolean
  isSavable?: boolean
  meta?: Record<string, unknown>
}

export interface EmailPayload {
  accountIds?: string[]
  broadcastToAll?: boolean
  subject: string
  htmlBody: string
}

export interface BulkDeliveryResult {
  requested: number
  resolved: number
  sent: number
  skipped: number
  broadcastToAll: boolean
}

export interface AdminAccountQuery {
  query?: string
  take?: number
  offset?: number
  orderBy?: OrderByField
}
