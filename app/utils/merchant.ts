import { apiFetch, safeJsonParse } from '~/utils/api'
import type {
  Merchant,
  MerchantOverview,
  MerchantSettlementSummary,
  MerchantDailyIncomingResult,
  MerchantSettlementsResult,
  PendingTotals,
  AdPostStatResult,
  MerchantSettlement,
  MerchantOrderResult,
} from '~/types/merchant'
import type { WalletOrderStatus } from '~/types/auth'

export async function fetchMerchant(merchantId: string): Promise<Merchant> {
  const response = await apiFetch(`/wallet/merchants/${encodeURIComponent(merchantId)}`)
  return safeJsonParse<Merchant>(response)
}

export async function fetchMerchantOverview(merchantId: string): Promise<MerchantOverview> {
  const response = await apiFetch(`/wallet/merchants/${encodeURIComponent(merchantId)}/stats/overview`)
  return safeJsonParse<MerchantOverview>(response)
}

export async function fetchMerchantIncoming(
  merchantId: string,
  params?: { from?: string; to?: string; currency?: string },
): Promise<MerchantSettlementSummary> {
  const searchParams = new URLSearchParams()
  if (params?.from) searchParams.set('from', params.from)
  if (params?.to) searchParams.set('to', params.to)
  if (params?.currency) searchParams.set('currency', params.currency)
  const query = searchParams.toString()
  const response = await apiFetch(
    `/wallet/merchants/${merchantId}/stats/incoming${query ? '?' + query : ''}`,
  )
  return safeJsonParse<MerchantSettlementSummary>(response)
}

export async function fetchMerchantDaily(
  merchantId: string,
  params?: { from?: string; to?: string; currency?: string },
): Promise<MerchantDailyIncomingResult> {
  const searchParams = new URLSearchParams()
  if (params?.from) searchParams.set('from', params.from)
  if (params?.to) searchParams.set('to', params.to)
  if (params?.currency) searchParams.set('currency', params.currency)
  const query = searchParams.toString()
  const response = await apiFetch(
    `/wallet/merchants/${merchantId}/stats/daily${query ? '?' + query : ''}`,
  )
  return safeJsonParse<MerchantDailyIncomingResult>(response)
}

export async function fetchPendingSettlements(
  merchantId: string,
): Promise<PendingTotals> {
  const response = await apiFetch(`/wallet/merchants/${merchantId}/settlements/pending`)
  return safeJsonParse<PendingTotals>(response)
}

export async function fetchMerchantSettlements(
  merchantId: string,
  offset = 0,
  take = 20,
): Promise<MerchantSettlementsResult> {
  const response = await apiFetch(
    `/wallet/merchants/${merchantId}/settlements?offset=${offset}&take=${take}`,
  )
  const totalHeader = response.headers.get('X-Total')
  const total = totalHeader ? Number.parseInt(totalHeader, 10) : 0
  const items = await safeJsonParse<MerchantSettlement[]>(response)
  return { items, total, hasMore: offset + take < total }
}

export interface SettleMerchantResult {
  message: string
  transactions: Array<{ id: string; currency: string; amount: number }>
}

export async function settleMerchant(merchantId: string): Promise<SettleMerchantResult> {
  const response = await apiFetch(
    `/wallet/merchants/${encodeURIComponent(merchantId)}/settlements/settle`,
    { method: 'POST' },
  )
  const data = await safeJsonParse<SettleMerchantResult & {
    transactions?: Array<{ id: string; currency: string; amount: number }>
  }>(response)
  return {
    message: data.message ?? '',
    transactions: Array.isArray(data.transactions) ? data.transactions : [],
  }
}

export async function updateMerchantWallet(
  merchantId: string,
  walletId: string | null,
): Promise<Merchant> {
  const response = await apiFetch(
    `/wallet/merchants/${encodeURIComponent(merchantId)}/wallet`,
    {
      method: 'PATCH',
      body: JSON.stringify({ wallet_id: walletId }),
    },
  )
  return safeJsonParse<Merchant>(response)
}

export async function fetchMerchantOrders(
  merchantId: string,
  params?: { status?: WalletOrderStatus; offset?: number; take?: number },
): Promise<MerchantOrderResult> {
  const searchParams = new URLSearchParams()
  if (params?.status) searchParams.set('status', params.status)
  if (params?.offset !== undefined) searchParams.set('offset', String(params.offset))
  if (params?.take !== undefined) searchParams.set('take', String(params.take))
  const query = searchParams.toString()
  const response = await apiFetch(
    `/wallet/merchants/${merchantId}/orders${query ? '?' + query : ''}`,
  )
  const totalHeader = response.headers.get('X-Total')
  const total = totalHeader ? Number.parseInt(totalHeader, 10) : 0
  const items = await safeJsonParse(response)
  return { items: Array.isArray(items) ? items : [], total, hasMore: (params?.offset ?? 0) + (params?.take ?? 20) < total }
}

export async function fetchAdPostStats(
  pubName: string,
  offset = 0,
  take = 20,
): Promise<AdPostStatResult> {
  const response = await apiFetch(
    `/sphere/publishers/${pubName}/ads?offset=${offset}&take=${take}`,
  )
  const totalHeader = response.headers.get('X-Total')
  const total = totalHeader ? Number.parseInt(totalHeader, 10) : 0
  const items = await safeJsonParse(response)
  return { items: Array.isArray(items) ? items : [], total }
}
