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
  activeSessionCount?: number
  activeDeviceCount?: number
  activePunishment?: SnAccountPunishment | null
  activePunishments?: SnAccountPunishment[]
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
  accountId?: string
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
  accountId?: string
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

// ============ Post Admin ============

export type PostVisibility = 'public' | 'private' | 'unlisted' | 'publisher' | 'realm'

export type PostShadowbanReason = 'none' | 'spam' | 'advertising' | 'harassment' | 'hate_speech' | 'misinformation' | 'illegal' | 'other'

export interface AdminPost {
  id: string
  title?: string
  description?: string
  body: string
  visibility: PostVisibility
  shadowbanReason?: PostShadowbanReason
  shadowbannedAt?: string
  locked: boolean
  lockedAt?: string
  drafted: boolean
  createdAt: string
  updatedAt: string
  publishedAt?: string
  publisher?: AdminPostPublisher
  tags?: AdminPostTag[]
  categories?: AdminPostCategory[]
  realmId?: number
  realm?: AdminPostRealm
}

export interface AdminPostPublisher {
  id: string
  name: string
  nick?: string
}

export interface AdminPostTag {
  id: string
  name: string
}

export interface AdminPostCategory {
  id: string
  name: string
}

export interface AdminPostRealm {
  id: number
  name: string
}

export interface PostLockState {
  locked: boolean
  lockedAt?: string
}

export interface PostVisibilityPayload {
  visibility: PostVisibility
}

export interface PostShadowbanPayload {
  reason: PostShadowbanReason
}

export interface PostRealmRemovePayload {
  reason: string
}

export interface PostBatchResult {
  locked?: number
  unlocked?: number
}

export interface AdminPostQuery {
  query?: string
  publisherId?: string
  realmId?: number
  visibility?: PostVisibility
  shadowbanReason?: PostShadowbanReason
  locked?: boolean
  drafted?: boolean
  offset?: number
  take?: number
}

// ============ Wallet Admin ============

export interface AdminTransaction {
  id: string
  walletId?: string
  accountId?: string
  status: string
  type: string
  currency: string
  amount: number
  remark?: string
  createdAt: string
  payerWallet?: AdminWalletInfo
  payeeWallet?: AdminWalletInfo
}

export interface AdminWalletInfo {
  id: string
  accountId?: string
  account?: Record<string, unknown>
}

export interface AdminWalletOrder {
  id: string
  walletId?: string
  accountId?: string
  status: string
  appIdentifier?: string
  productIdentifier?: string
  currency: string
  amount: number
  createdAt: string
  transaction?: AdminTransaction
  items?: Record<string, unknown>[]
  payeeWallet?: AdminWalletInfo
}

export interface AdminTransactionQuery {
  walletId?: string
  accountId?: string
  status?: string
  type?: string
  currency?: string
  offset?: number
  take?: number
}

export interface AdminOrderQuery {
  walletId?: string
  accountId?: string
  status?: string
  appIdentifier?: string
  productIdentifier?: string
  currency?: string
  offset?: number
  take?: number
}

export interface BalanceModifyPayload {
  accountId?: string
  walletId?: string
  currency: string
  amount: number
  remark?: string
  forceOperation?: boolean
}

export interface AdminSubscription {
  id: string
  accountId: string
  identifier: string
  status: string
  isActive: boolean
  isTesting: boolean
  begunAt?: string
  expiredAt?: string
  coupon?: Record<string, unknown>
}

export interface AdminSubscriptionQuery {
  accountId?: string
  identifier?: string
  status?: string
  isActive?: boolean
  isTesting?: boolean
  offset?: number
  take?: number
}

export interface AdminSubscriptionCatalogItem {
  identifier: string
  groupIdentifier: string
  displayName: string
  currency: string
  basePrice: number
  perkLevel: number
  minimumAccountLevel?: number
  experienceMultiplier?: number
  goldenPointReward?: number
  displayConfig?: Record<string, unknown>
  paymentPolicy?: Record<string, unknown>
  giftPolicy?: Record<string, unknown>
  providerMappings?: Record<string, unknown>
  appIdentifier?: string
}

export interface GoldsResupplyPack {
  key: string
  identifier: string
  displayName: string
  currency: string
  providerMappings?: Record<string, unknown>
}

export interface MaintenanceResult {
  affectedCount: number
}

// ============ Cache Admin ============

export interface CacheStats {
  keyspaceHits: number
  keyspaceMisses: number
  totalCommandsProcessed: number
  evictedKeys: number
  expiredKeys: number
  connectedClients: number
  usedMemoryBytes: number
  readCount: number
  hitRatio: number
}

export interface CacheGroupInfo {
  group: string
  count: number
  keys: string[]
}

export interface CacheClearPayload {
  key?: string
  group?: string
}

export interface CacheClearResult {
  scope: 'key' | 'group' | 'all'
  key?: string | null
  group?: string | null
  removedCount: number
}

// ============ Account Contact Management ============

export interface ContactPayload {
  type: number
  content: string
}

export interface ContactUpdatePayload {
  type?: number
  content?: string
}

export interface ContactVerifyPayload {
  verifiedAt?: string
}

export interface ContactVisibilityPayload {
  isPublic: boolean
}

// ============ Auth Factor Management ============

export interface AuthFactorCreatePayload {
  type: number
  config?: Record<string, unknown>
}

export interface PasswordResetPayload {
  newPassword: string
  revokeSessions?: boolean
}

// ============ Verification ============

export interface VerificationPayload {
  type: number
  title?: string
  description?: string
  verifiedBy?: string
}

// ============ Badge Management ============

export interface BadgeGrantPayload {
  type: string
  label: string
  caption?: string
  meta?: Record<string, unknown>
}
