<template>
  <NuxtLayout name="merchant">
    <div class="mx-auto max-w-5xl">
      <!-- Filter Tabs -->
      <div class="flex items-center gap-2 mb-4">
        <button
          v-for="tab in statusTabs"
          :key="tab.value"
          class="btn btn-sm"
          :class="currentStatus === tab.value ? 'btn-primary' : 'btn-ghost'"
          @click="currentStatus = tab.value"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Orders Table -->
      <div class="card bg-base-100 shadow-sm">
        <div class="card-body p-5">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-base font-bold">{{ t('merchant.orders') }}</h3>
            <button class="btn btn-ghost btn-xs" @click="loadOrders" :disabled="isLoading">
              <IconRefresh class="w-3.5 h-3.5" />
              {{ t('common.refresh') }}
            </button>
          </div>

          <!-- Loading -->
          <div v-if="isLoading" class="flex justify-center py-8">
            <span class="loading loading-spinner loading-lg" />
          </div>

          <!-- Table -->
          <div v-else-if="orders.items.length > 0" class="overflow-x-auto">
            <table class="table table-sm">
              <thead>
                <tr>
                  <th>{{ t('merchant.table.date') }}</th>
                  <th>{{ t('merchant.table.orderId') }}</th>
                  <th>{{ t('merchant.table.product') }}</th>
                  <th class="text-right">{{ t('merchant.table.amount') }}</th>
                  <th>{{ t('merchant.table.currency') }}</th>
                  <th>{{ t('merchant.table.status') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="o in orders.items" :key="o.id">
                  <td class="text-xs text-base-content/60">{{ formatDate(o.createdAt) }}</td>
                  <td class="font-mono text-xs max-w-[120px] truncate">{{ o.id.slice(0, 8) }}</td>
                  <td class="text-sm">
                    <div class="truncate max-w-[200px]">{{ o.productIdentifier || o.app?.name || '—' }}</div>
                    <div v-if="o.app?.slug" class="text-xs text-base-content/40 font-mono">{{ o.app.slug }}</div>
                  </td>
                  <td class="text-right font-mono font-semibold">{{ o.amount.toFixed(2) }}</td>
                  <td class="text-xs">{{ o.currency }}</td>
                  <td>
                    <span
                      class="badge badge-xs"
                      :class="statusBadgeClass(o.status)"
                    >{{ statusLabel(o.status) }}</span>
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Pagination -->
            <div v-if="orders.hasMore" class="flex justify-center mt-4">
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
            <IconPackage class="w-10 h-10 mb-3" />
            <p class="text-sm">{{ t('merchant.noOrders') }}</p>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import {
  IconRefreshCw as IconRefresh,
  IconPackage,
} from '#components'
import type { MerchantOrderResult } from '~/types/merchant'
import { WalletOrderStatus } from '~/types/auth'
import { fetchMerchantOrders } from '~/utils/merchant'
import { fetchManagedPublishers } from '~/utils/creator'

definePageMeta({ middleware: 'merchant' })

const { t } = useI18n()
const { $toast } = useNuxtApp()
const route = useRoute()
const merchantRoute = useMerchant()
const pubName = computed(() => route.params.pubName as string)

const orders = ref<MerchantOrderResult>({ items: [], total: 0, hasMore: false })
const isLoading = ref(false)
const offset = ref(0)
const pageSize = 20
const currentStatus = ref<WalletOrderStatus | undefined>(undefined)

const statusTabs = [
  { value: undefined, label: t('merchant.status.all') },
  { value: WalletOrderStatus.Unpaid, label: t('merchant.status.unpaid') },
  { value: WalletOrderStatus.Paid, label: t('merchant.status.paid') },
  { value: WalletOrderStatus.Finished, label: t('merchant.status.finished') },
  { value: WalletOrderStatus.Cancelled, label: t('merchant.status.cancelled') },
  { value: WalletOrderStatus.Expired, label: t('merchant.status.expired') },
]

function statusLabel(status: WalletOrderStatus): string {
  switch (status) {
    case WalletOrderStatus.Unpaid: return t('merchant.status.unpaid')
    case WalletOrderStatus.Paid: return t('merchant.status.paid')
    case WalletOrderStatus.Finished: return t('merchant.status.finished')
    case WalletOrderStatus.Cancelled: return t('merchant.status.cancelled')
    case WalletOrderStatus.Expired: return t('merchant.status.expired')
    default: return String(status)
  }
}

function statusBadgeClass(status: WalletOrderStatus): string {
  switch (status) {
    case WalletOrderStatus.Unpaid: return 'badge-warning'
    case WalletOrderStatus.Paid: return 'badge-success'
    case WalletOrderStatus.Finished: return 'badge-info'
    case WalletOrderStatus.Cancelled: return 'badge-error'
    case WalletOrderStatus.Expired: return 'badge-ghost'
    default: return ''
  }
}

function formatDate(dateStr: string | { seconds: number; nanos: number } | undefined): string {
  if (!dateStr) return '—'
  if (typeof dateStr === 'string') {
    return new Date(dateStr).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }
  return new Date(dateStr.seconds * 1000).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

async function loadOrders() {
  isLoading.value = true
  try {
    offset.value = 0
    const result = await fetchMerchantOrders(pubName.value, {
      status: currentStatus.value,
      offset: 0,
      take: pageSize,
    })
    orders.value = result
  } catch (e) {
    console.error(e)
    $toast.error(t('merchant.error.loadingOrders'))
  } finally {
    isLoading.value = false
  }
}

async function loadMore() {
  isLoading.value = true
  try {
    offset.value += pageSize
    const result = await fetchMerchantOrders(pubName.value, {
      status: currentStatus.value,
      offset: offset.value,
      take: pageSize,
    })
    orders.value = {
      ...result,
      items: [...orders.value.items, ...result.items],
    }
  } catch (e) {
    console.error(e)
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  if (!merchantRoute.hasPublisherSelected.value || merchantRoute.currentPublisherName.value !== pubName.value) {
    const pubs = await fetchManagedPublishers()
    const pub = pubs.find(p => p.name === pubName.value)
    if (pub) await merchantRoute.selectPublisher(pub)
  }
})

watch(currentStatus, () => { loadOrders() })
watch(pubName, () => { loadOrders() }, { immediate: true })
</script>
