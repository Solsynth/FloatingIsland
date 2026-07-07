import { storeToRefs } from 'pinia'
import { useAdminStore } from '~/stores/admin'

export function useAdmin() {
  const store = useAdminStore()
  const {
    accounts,
    totalAccounts,
    hasMore,
    currentAccount,
    isLoading,
    isLoadingDetail,
  } = storeToRefs(store)

  return {
    accounts,
    totalAccounts,
    hasMore,
    currentAccount,
    isLoading,
    isLoadingDetail,
    loadAccounts: store.loadAccounts,
    loadAccountDetail: store.loadAccountDetail,
    clearCurrentAccount: store.clearCurrentAccount,
  }
}
