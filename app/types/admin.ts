import type { SnAccount, SnAccountBadge, SnAccountPunishment } from './auth'

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
  id: string
  type: number
  content: string
  isPrimary: boolean
  isPublic?: boolean
  verifiedAt?: string | null
  accountId?: string
  createdAt?: string
  updatedAt?: string
}

/** Public connection shape from GET /passport/accounts/{name}/connections */
export interface AdminPublicConnection {
  provider: string
  providedIdentifier: string
  url?: string
}

export interface AdminAuthFactor {
  id: string
  type: number
  trustworthy?: number
  hasSecret: boolean
  config?: Record<string, unknown> | null
  enabledAt?: string | null
  expiredAt?: string | null
  createdAt?: string
  updatedAt?: string
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
  badges?: SnAccountBadge[]
  badgeCount?: number
  board?: Record<string, unknown>[]
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

// ============ Device & Session Management ============

export interface AdminDevice {
  id: string
  label?: string | null
  clientId?: string
  lastActiveAt?: string | null
  createdAt?: string
  deletedAt?: string | null
  sessions?: AdminSession[]
}

export interface AdminDeviceQuery {
  take?: number
  offset?: number
  includeDeleted?: boolean
  includeSessions?: boolean
}

export interface AdminSession {
  id: string
  type: number
  ipAddress?: string | null
  userAgent?: string | null
  location?: string | null
  clientId?: string | null
  parentSessionId?: string | null
  appId?: string | null
  scopes?: string[]
  audiences?: string[]
  lastGrantedAt?: string | null
  expiredAt?: string | null
  createdAt?: string
  deletedAt?: string | null
  childrenCount?: number
  children?: AdminSession[]
}

export interface AdminSessionQuery {
  take?: number
  offset?: number
  type?: number
  clientId?: string
  includeChildren?: boolean
  activeOnly?: boolean
}

export interface DeviceLabelPayload {
  label: string
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

// ============ Notification Observability ============

export type NotificationProvider = 'websocket' | 'sop' | 'google' | 'apple' | 'appk' | 'unifiedpush'

export type DeliveryOutcome = 'success' | 'failure' | 'invalid_token' | 'skipped' | 'no_subscription'

export type PreferenceResult = 'normal' | 'silent' | 'reject'

export interface ProviderDeliveryMetrics {
  provider: NotificationProvider
  attempts: number
  results: Record<DeliveryOutcome, number>
  successRate: number
}

export interface TopicMetric {
  topic: string
  sendRequests: number
  deliveryAttempts: number
}

export interface DeliveryLatency {
  p50: number
  p95: number
  p99: number
  avg: number
}

export interface NotificationObservability {
  totalSendRequests: number
  totalTargetAccounts: number
  totalDeliveryAttempts: number
  totalDeliveryResults: Record<DeliveryOutcome, number>
  overallSuccessRate: number
  providers: ProviderDeliveryMetrics[]
  topics: TopicMetric[]
  latency: DeliveryLatency
  batchSizes: { avg: number; max: number }
  preferenceResults: Record<PreferenceResult, number>
}

// ============ Email Sending Plans ============

export interface EmailPlanCreatePayload {
  accountIds?: string[]
  broadcastToAll?: boolean
  sendingPlanKey?: string
  subject: string
  htmlBody: string
  plannedStartAt?: string
  maxEmailsPerInterval?: number
  intervalMinutes?: number
  maxEmailsPerDay?: number
}

export interface EmailPlanCounts {
  total: number
  pending: number
  sent: number
  skipped: number
  failed: number
}

export interface EmailPlanAdvance {
  intervalNumber: number
  isManual: boolean
  attemptedCount: number
  sentCount: number
  skippedCount: number
  failedCount: number
  pendingCountAfter: number
  startedAt: string
  completedAt: string
}

export interface EmailPlan {
  id: string
  sendingPlanKey?: string
  createdByAccountId?: string
  subject: string
  broadcastToAll: boolean
  recipientCount: number
  maxEmailsPerInterval: number
  intervalMinutes: number
  maxEmailsPerDay: number
  status: number
  advancedIntervalsCount: number
  plannedStartAt?: string
  nextIntervalAt?: string
  lastAdvancedAt?: string
  pausedAt?: string
  completedAt?: string
  counts: EmailPlanCounts
  advances?: EmailPlanAdvance[]
}

export interface EmailPlanQuery {
  take?: number
  offset?: number
  status?: number
}
