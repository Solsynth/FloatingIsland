<template>
  <NuxtLayout name="merchant">
    <div class="mx-auto max-w-5xl">
      <!-- Overview Stats -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div class="stat bg-base-100 rounded-box shadow-sm">
          <div class="stat-title">{{ t('merchant.totalPending') }}</div>
          <div class="stat-value text-warning text-2xl">{{ overview?.totalPending ?? 0 }}</div>
        </div>
        <div class="stat bg-base-100 rounded-box shadow-sm">
          <div class="stat-title">{{ t('merchant.totalSettled') }}</div>
          <div class="stat-value text-success text-2xl">{{ overview?.totalSettled ?? 0 }}</div>
        </div>
        <div class="stat bg-base-100 rounded-box shadow-sm">
          <div class="stat-title">{{ t('merchant.totalAllTime') }}</div>
          <div class="stat-value text-primary text-2xl">{{ overview?.totalAllTime ?? 0 }}</div>
        </div>
      </div>

      <!-- Pending by Currency + Settle Button -->
      <div class="card bg-base-100 shadow-sm mb-6">
        <div class="card-body p-5">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-base font-bold">{{ t('merchant.pendingFunds') }}</h3>
            <button
              v-if="canSettle"
              class="btn btn-warning btn-sm gap-1.5"
              :class="{ loading: isSettling }"
              :disabled="isSettling"
              @click="handleSettle"
            >
              <IconWallet v-if="!isSettling" class="w-4 h-4" />
              {{ t('merchant.settleNow') }}
            </button>
          </div>
          <div v-if="hasPending" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              v-for="(data, currency) in overview?.pending"
              :key="currency"
              class="flex items-center justify-between rounded-lg p-3 bg-warning/10 border border-warning/20"
            >
              <span class="text-sm font-semibold text-base-content/70">{{ currency }}</span>
              <div class="text-right">
                <div class="font-mono font-bold text-lg">{{ data.total.toFixed(2) }}</div>
                <div class="text-xs text-base-content/40">{{ data.count }} {{ t('merchant.settlements') }}</div>
              </div>
            </div>
          </div>
          <div v-else class="flex flex-col items-center py-4 text-base-content/30">
            <IconWallet class="w-8 h-8 mb-2" />
            <p class="text-sm">{{ t('merchant.noPendingSettlements') }}</p>
          </div>
        </div>
      </div>

      <!-- Settlements Table -->
      <div class="card bg-base-100 shadow-sm">
        <div class="card-body p-5">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-base font-bold">{{ t('merchant.settlementHistory') }}</h3>
            <button class="btn btn-ghost btn-xs" @click="loadSettlements" :disabled="isLoading">
              <IconRefresh class="w-3.5 h-3.5" />
              {{ t('common.refresh') }}
            </button>
          </div>

          <!-- Loading -->
          <div v-if="isLoading" class="flex justify-center py-8">
            <span class="loading loading-spinner loading-lg" />
          </div>

          <!-- Table -->
          <div v-else-if="settlements.items.length > 0" class="overflow-x-auto">
            <table class="table table-sm">
              <thead>
                <tr>
                  <th>{{ t('merchant.table.date') }}</th>
                  <th>{{ t('merchant.table.amount') }}</th>
                  <th>{{ t('merchant.table.currency') }}</th>
                  <th>{{ t('merchant.table.status') }}</th>
                  <th>{{ t('merchant.table.source') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="s in settlements.items" :key="s.id">
                  <td class="text-xs text-base-content/60">{{ formatDate(s.createdAt) }}</td>
                  <td class="font-mono font-semibold">{{ s.amount.toFixed(2) }}</td>
                  <td class="text-xs">{{ s.currency }}</td>
                  <td>
                    <span
                      class="badge badge-xs"
                      :class="statusBadgeClass(s.status)"
                    >{{ s.status }}</span>
                  </td>
                  <td class="text-xs text-base-content/50">
                    {{ s.awardId ? t('merchant.sourceAward') : t('merchant.sourceOrder') }}
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Pagination -->
            <div v-if="settlements.hasMore" class="flex justify-center mt-4">
              <button
                class="btn btn-ghost btn-sm"
                :disabled="isLoading"
                @click="loadMore"
              >
                {{ t('common.loadMore') }}
              </button>
            </div>
          </div>

          <!-- Empty -->
          <div v-else class="flex flex-col items-center py-8 text-base-content/30">
            <IconWallet class="w-10 h-10 mb-3" />
            <p class="text-sm">{{ t('merchant.noSettlements') }}</p>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import {
  IconWallet,
  IconRefreshCw as IconRefresh,
} from '#components'
import type { MerchantOverview, MerchantSettlementsResult } from '~/types/merchant'
import { fetchMerchantOverview, fetchMerchantSettlements, settleMerchant } from '~/utils/merchant'
import { fetchManagedPublishers } from '~/utils/creator'
import { useMerchant } from '~/composables/useMerchant'

definePageMeta({ middleware: 'merchant' })

const { t } = useI18n()
const { $toast } = useNuxtApp()
const route = useRoute()
const merchant = useMerchant()
const pubName = computed(() => route.params.pubName as string)

const overview = ref<MerchantOverview | null>(null)
const settlements = ref<MerchantSettlementsResult>({ items: [], total: 0, hasMore: false })
const isLoading = ref(false)
const isSettling = ref(false)
const offset = ref(0)
const pageSize = 20

onMounted(async () => {
  if (!merchant.hasPublisherSelected.value || merchant.currentPublisherName.value !== pubName.value) {
    const pubs = await fetchManagedPublishers()
    const pub = pubs.find(p => p.name === pubName.value)
    if (pub) await merchant.selectPublisher(pub)
  }
})

const hasPending = computed(() => {
  return overview.value && Object.keys(overview.value.pending).length > 0
})

const canSettle = computed(() => {
  if (!overview.value) return false
  const total = Object.values(overview.value.pending).reduce((sum, d) => sum + d.count, 0)
  return total > 0
})

function statusBadgeClass(status: string): string {
  switch (status) {
    case 'Pending': return 'badge-warning'
    case 'Settled': return 'badge-success'
    case 'Cancelled': return 'badge-error'
    default: return ''
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

async function loadOverview() {
  try {
    overview.value = await fetchMerchantOverview(pubName.value)
  } catch (e) {
    console.error(e)
  }
}

async function loadSettlements() {
  isLoading.value = true
  try {
    offset.value = 0
    const result = await fetchMerchantSettlements(pubName.value, 0, pageSize)
    settlements.value = result
  } catch (e) {
    console.error(e)
    $toast.error(t('merchant.error.loadingSettlements'))
  } finally {
    isLoading.value = false
  }
}

async function loadMore() {
  isLoading.value = true
  try {
    offset.value += pageSize
    const result = await fetchMerchantSettlements(pubName.value, offset.value, pageSize)
    settlements.value = {
      ...result,
      items: [...settlements.value.items, ...result.items],
    }
  } catch (e) {
    console.error(e)
  } finally {
    isLoading.value = false
  }
}

async function handleSettle() {
  isSettling.value = true
  try {
    const result = await settleMerchant(pubName.value)
    $toast.success(t('merchant.settledSuccess', { count: result.transactions.length }))
    await Promise.all([loadOverview(), loadSettlements()])
  } catch (e) {
    console.error(e)
    $toast.error(t('merchant.error.settleFailed'))
  } finally {
    isSettling.value = false
  }
}

watch(pubName, () => {
  loadOverview()
  loadSettlements()
}, { immediate: true })
</script>
