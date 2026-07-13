import type { SnAccount, SnAccountBadge, SnAccountPunishment } from './auth'

export type { SnAccountPunishment }

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
  /** Auth client row GUID */
  id: string
  /** Stable device identifier used in admin device routes */
  deviceId?: string
  label?: string | null
  deviceLabel?: string | null
  deviceName?: string | null
  platform?: string | null
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

export type PostVisibility =
  | 'public'
  | 'friends'
  | 'unlisted'
  | 'private'
  | 'close_friends_only'
  | 'quiet_public'

export type PostShadowbanReason = 'none' | 'spam' | 'advertising' | 'harassment' | 'hate_speech' | 'misinformation' | 'illegal' | 'other'

export interface AdminPost {
  id: string
  title?: string | null
  description?: string | null
  /** Post body from Sphere (`content` field) */
  content?: string | null
  /** Enum may arrive as snake_case string or numeric ordinal */
  visibility: PostVisibility | number | string
  shadowbanReason?: PostShadowbanReason | number | string | null
  shadowbannedAt?: string | null
  lockedAt?: string | null
  draftedAt?: string | null
  createdAt: string
  updatedAt: string
  publishedAt?: string | null
  publisher?: AdminPostPublisher | null
  tags?: AdminPostTag[]
  categories?: AdminPostCategory[]
  realmId?: string | null
  realm?: AdminPostRealm | null
}

export interface AdminPostPublisher {
  id: string
  name: string
  nick?: string | null
}

export interface AdminPostTag {
  id: string
  name: string
  slug?: string
}

export interface AdminPostCategory {
  id: string
  name: string
  slug?: string
}

export interface AdminPostRealm {
  id: string
  name?: string
  slug?: string
  nick?: string
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
  realmId?: string
  visibility?: PostVisibility
  shadowbanReason?: PostShadowbanReason
  locked?: boolean
  drafted?: boolean
  offset?: number
  take?: number
}

// ============ Admin Stats (per-service GET /admin/stats) ============

export interface PassportAdminStats {
  calculatedAt: string
  totalProfiledAccounts: number
  activeUsersLastDay: number
  activeUsersLastWeek: number
  activeUsersLastMonth: number
  registeredUsersLastDay: number
  registeredUsersLastWeek: number
  registeredUsersLastMonth: number
}

export interface SphereAdminStats {
  calculatedAt: string
  totalPosts: number
  publishedPosts: number
  draftPosts: number
  postsLastDay: number
  postsLastWeek: number
  postsLastMonth: number
  totalPublishers: number
  totalReactions: number
  totalBookmarks: number
}

export interface WalletAdminStats {
  calculatedAt: string
  totalWallets: number
  totalTransactions: number
  confirmedTransactions: number
  pendingTransactions: number
  transactionsLastDay: number
  transactionsLastWeek: number
  transactionsLastMonth: number
  totalOrders: number
  paidOrders: number
  totalSubscriptions: number
}

export interface RingAdminStats {
  calculatedAt: string
  totalNotifications: number
  unreadNotifications: number
  notificationsLastDay: number
  notificationsLastWeek: number
  notificationsLastMonth: number
  totalPushSubscriptions: number
  activePushSubscriptions: number
  totalSendRequests: number
  totalDeliveryAttempts: number
}

export interface AccountActivityMetrics {
  calculatedAt: string
  currentDayStartedAt: string
  dailyActiveUsers: number
  weeklyActiveUsers: number
  monthlyActiveUsers: number
  previousDailyActiveUsers: number
  previousWeeklyActiveUsers: number
  previousMonthlyActiveUsers: number
  newAccountsToday: number
  newAccountsThisWeek: number
  newAccountsThisMonth: number
  totalProfiledAccounts: number
}

// ============ Permission Groups (Padlock) ============

export interface PermissionGroupSummary {
  id: string
  key: string
  nodeCount: number
  memberCount: number
  createdAt?: string
  updatedAt?: string
}

export interface PermissionNode {
  id: string
  type?: number
  actor: string
  key: string
  value?: unknown
  expiredAt?: string | null
  affectedAt?: string | null
  groupId?: string | null
}

export interface PermissionGroupMember {
  groupId: string
  actor: string
  expiredAt?: string | null
  affectedAt?: string | null
}

export interface PermissionGroupDetail {
  group: { id: string; key: string; createdAt?: string; updatedAt?: string }
  nodes: PermissionNode[]
  members: PermissionGroupMember[]
}

export interface ActorPermissions {
  actor: string
  directPermissions: PermissionNode[]
  effectivePermissions: PermissionNode[]
  groups: PermissionGroupMember[]
}

export interface UpsertGroupPermissionPayload {
  value?: unknown
  affectedAt?: string | null
  expiredAt?: string | null
}

export interface UpsertGroupMemberPayload {
  affectedAt?: string | null
  expiredAt?: string | null
}

// ============ Account Board (Passport) ============

export type AdminBoardItemKind = 'prebuilt' | 'custom_app' | 0 | 1

export interface AdminBoardItem {
  id: string
  accountId?: string
  order: number
  kind: AdminBoardItemKind
  widgetKey?: string | null
  customAppId?: string | null
  customAppWidgetKey?: string | null
  isEnabled: boolean
  payload?: Record<string, { value?: unknown; label?: string; format?: string } | unknown>
  createdAt?: string
  updatedAt?: string
}

export interface BoardPayloadPush {
  payload: Record<string, { value: unknown; label: string; format?: string }>
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

// ============ Magic Spells (Passport) ============

/** Matches MagicSpellType enum ordinals from DysonNetwork.Shared */
export type MagicSpellType =
  | 0 // account_activation
  | 1 // account_deactivation (not emailable via admin)
  | 2 // account_removal
  | 3 // auth_password_reset
  | 4 // contact_verification

export interface AdminMagicSpell {
  id: string
  type: MagicSpellType | number
  expiresAt?: string | null
  affectedAt?: string | null
  meta?: Record<string, unknown>
  accountId?: string | null
  createdAt?: string
  updatedAt?: string
  deletedAt?: string | null
}

export interface CreateAdminMagicSpellPayload {
  type: MagicSpellType | number
  meta?: Record<string, unknown>
  expiresAt?: string | null
  affectedAt?: string | null
  code?: string
  preventRepeat?: boolean
  sendEmail?: boolean
  bypassVerify?: boolean
}

export interface ResendAdminMagicSpellPayload {
  bypassVerify?: boolean
}

// ============ Delivery Observability (Ring built-in) ============

export interface DeliverySummary {
  total: number
  successful: number
  failed: number
  invalidToken: number
  skipped: number
  /** null when there were no attempts in the success-rate denominator */
  successRate: number | null
}

export interface DeliveryBreakdown extends DeliverySummary {
  key: string
}

export interface EmailDeliveryOverview {
  summary: DeliverySummary
  bySource: DeliveryBreakdown[]
}

export interface NotificationDeliveryOverview {
  sendRequests: number
  sendRequestsByTopic: DeliveryBreakdown[]
  summary: DeliverySummary
  byProvider: DeliveryBreakdown[]
  byTopic: DeliveryBreakdown[]
}

export interface DeliveryObservabilityQuery {
  /** ISO-8601 UTC start (NodaTime Instant). Defaults to 30 days ago. */
  from?: string
  /** ISO-8601 UTC end (NodaTime Instant). Defaults to now. */
  to?: string
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
