export interface CurrencyBreakdown {
  count: number
  total: number
}

export interface MerchantOverview {
  totalPending: number
  totalSettled: number
  totalAllTime: number
  pending: Record<string, CurrencyBreakdown>
  settled: Record<string, CurrencyBreakdown>
  thisMonth: Record<string, CurrencyBreakdown>
}

export interface MerchantSettlementSummary {
  from?: string
  to?: string
  currency?: string | null
  totalCount: number
  totalAmount: number
  byStatus: Record<string, CurrencyBreakdown>
  byCurrency: Record<string, CurrencyBreakdown>
  settlements: MerchantSettlement[]
}

export interface MerchantDailyIncoming {
  date: string
  count: number
  total: number
  byCurrency: Record<string, number>
}

export interface MerchantDailyIncomingResult {
  from?: string
  to?: string
  currency: string | null
  daily: MerchantDailyIncoming[]
}

export type SettlementStatus = 'Pending' | 'Settled' | 'Cancelled'
export type SettledBy = 'Automatic' | 'Manual'

export interface MerchantSettlement {
  id: string
  orderId?: string
  awardId?: string
  paymentWalletId?: string
  currency: string
  amount: number
  status: SettlementStatus
  settledBy?: SettledBy | null
  settledAt?: string | null
  settlementTransactionId?: string | null
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export interface MerchantSettlementsResult {
  items: MerchantSettlement[]
  total: number
  hasMore: boolean
}

export interface PendingTotals {
  pending: Record<string, CurrencyBreakdown>
}

export interface AdPostStat {
  postId: string
  title?: string | null
  slug?: string | null
  activeBidTotal: number
  bidCount: number
  isCurrentlyPlaced: boolean
  shownCount: number
  lastShownAt?: string | null
}

export interface AdPostStatResult {
  items: AdPostStat[]
  total: number
}

export interface Merchant {
  id: string
  publisherId: string
  paymentWalletId?: string
  name: string
  createdAt: string
  updatedAt: string
}

import type { WalletOrder } from '~/types/auth'

export interface MerchantOrderResult {
  items: WalletOrder[]
  total: number
  hasMore: boolean
}
