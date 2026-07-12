import { defineStore } from 'pinia'
import type {
  AdminAccountListEntry,
  AdminAccountDetail,
  AdminAccountQuery,
} from '~/types/admin'
import {
  fetchAdminAccounts,
  fetchAdminAccountDetail,
} from '~/utils/admin'

export const useAdminStore = defineStore('admin', () => {
  const accounts = ref<AdminAccountListEntry[]>([])
  const totalAccounts = ref(0)
  const hasMore = ref(false)
  const currentAccount = ref<AdminAccountDetail | null>(null)
  const isLoading = ref(false)
  const isLoadingDetail = ref(false)

  async function loadAccounts(params: AdminAccountQuery = {}) {
    isLoading.value = true
    try {
      const result = await fetchAdminAccounts(params)
      accounts.value = result.accounts
      totalAccounts.value = result.total
      const take = params.take ?? 50
      const offset = params.offset ?? 0
      hasMore.value = result.total
        ? offset + result.accounts.length < result.total
        : result.accounts.length >= take
    } catch {
      accounts.value = []
      totalAccounts.value = 0
      hasMore.value = false
      if (import.meta.client) {
        try {
          useNuxtApp().$toast.error('Failed to load accounts')
        } catch {
          // toast plugin may be unavailable during SSR/tests
        }
      }
    } finally {
      isLoading.value = false
    }
  }

  async function loadAccountDetail(identifier: string) {
    isLoadingDetail.value = true
    try {
      currentAccount.value = await fetchAdminAccountDetail(identifier)
    } catch {
      currentAccount.value = null
    } finally {
      isLoadingDetail.value = false
    }
  }

  function clearCurrentAccount() {
    currentAccount.value = null
  }

  return {
    accounts,
    totalAccounts,
    hasMore,
    currentAccount,
    isLoading,
    isLoadingDetail,
    loadAccounts,
    loadAccountDetail,
    clearCurrentAccount,
  }
})
