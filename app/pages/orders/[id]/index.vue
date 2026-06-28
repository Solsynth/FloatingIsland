<template>
  <NuxtLayout name="app">
    <ConfuseSpinner v-if="orderStatus === 'pending'" message="Loading order..." />

    <template v-else-if="order">
      <div class="mx-auto max-w-lg px-4 py-6">
        <!-- Back -->
        <button class="btn btn-ghost btn-sm gap-2 mb-4" @click="router.back()">
          <IconArrowLeft class="w-4 h-4" />
          Back
        </button>

        <!-- Paid Success Banner -->
        <div v-if="order.status === 'paid'" class="alert alert-success mb-4 shadow-md">
          <IconCheck class="w-5 h-5" />
          <div>
            <span class="font-bold">Payment Successful</span>
            <p class="text-sm opacity-80" v-if="order.transactionId">Transaction: {{ order.transactionId.slice(0, 12) }}...</p>
          </div>
        </div>

        <div v-if="payError" class="alert alert-error mb-4 shadow-md">
          <IconAlertTriangle class="w-5 h-5" />
          <span>{{ payError }}</span>
          <button class="btn btn-ghost btn-xs btn-square" @click="payError = ''">
            <IconX class="w-4 h-4" />
          </button>
        </div>

        <!-- Order Card -->
        <div class="card bg-base-100 shadow-md">
          <div class="card-body p-6">
            <!-- Header -->
            <div class="flex items-center justify-between mb-4">
              <h1 class="text-lg font-bold">Order</h1>
              <span class="badge badge-lg" :class="statusBadgeClass">
                {{ order.status }}
              </span>
            </div>

            <!-- Order ID -->
            <div class="flex items-center gap-2 mb-4">
              <span class="text-xs font-mono text-base-content/50 truncate">{{ order.id }}</span>
              <button class="btn btn-ghost btn-xs btn-square" @click="copyId">
                <IconCopy class="w-3 h-3" />
              </button>
            </div>

            <!-- Items -->
            <div v-if="order.items && order.items.length" class="space-y-2 mb-4">
              <div
                v-for="(item, i) in order.items"
                :key="i"
                class="flex items-center justify-between py-2 border-b border-base-200/50 last:border-0"
              >
                <div class="flex items-center gap-3 min-w-0">
                  <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <IconShoppingBag class="w-4 h-4 text-primary" />
                  </div>
                  <div class="min-w-0">
                    <p class="text-sm font-medium truncate">{{ item.productIdentifier }}</p>
                    <p class="text-xs text-base-content/50">{{ item.quantity }} × {{ item.currency }} {{ formatAmount(item.unitPrice) }}</p>
                  </div>
                </div>
                <span class="text-sm font-semibold shrink-0 ml-2">{{ item.currency }} {{ formatAmount(item.unitPrice * item.quantity) }}</span>
              </div>
            </div>

            <!-- Legacy single product -->
            <div v-else-if="order.productIdentifier" class="flex items-center justify-between py-2 border-b border-base-200/50 mb-4">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <IconShoppingBag class="w-4 h-4 text-primary" />
                </div>
                <span class="text-sm font-medium">{{ order.productIdentifier }}</span>
              </div>
            </div>

            <!-- Remarks -->
            <p v-if="order.remarks" class="text-sm text-base-content/60 mb-4 italic">
              "{{ order.remarks }}"
            </p>

            <!-- Total -->
            <div class="flex items-center justify-between py-3 border-t border-base-200">
              <span class="font-semibold">Total</span>
              <span class="text-xl font-bold">{{ order.currency }} {{ formatAmount(order.amount) }}</span>
            </div>

            <!-- Expiry -->
            <p v-if="order.expiredAt && order.status !== 'paid'" class="text-xs text-base-content/40 mt-2">
              Expires {{ new Date(order.expiredAt).toLocaleString() }}
            </p>
          </div>
        </div>

        <!-- Payment Form (Unpaid only) -->
        <div v-if="order.status === 'unpaid'" class="card bg-base-100 shadow-md mt-4">
          <div class="card-body p-6 space-y-4">
            <h2 class="font-semibold">Payment</h2>

            <!-- Wallet Selector -->
            <div v-if="wallets.length > 1" class="form-control">
              <label class="label"><span class="label-text">Pay from wallet</span></label>
              <select v-model="selectedWalletId" class="select select-bordered w-full">
                <option
                  v-for="w in wallets"
                  :key="w.id"
                  :value="w.id"
                >
                  {{ w.name || 'Wallet' }} ({{ getWalletBalance(w) }})
                </option>
              </select>
            </div>

            <!-- PIN -->
            <div class="form-control">
              <label class="label"><span class="label-text">Enter PIN</span></label>
              <input
                v-model="pinCode"
                type="password"
                placeholder="Your 6-digit PIN"
                class="input input-bordered w-full"
                maxlength="6"
                autocomplete="off"
              >
            </div>

            <button
              class="btn btn-primary w-full gap-2"
              :disabled="!pinCode || paying"
              @click="handlePay"
            >
              <IconLoader v-if="paying" class="w-4 h-4 animate-spin" />
              <IconWallet v-else class="w-4 h-4" />
              {{ paying ? 'Processing...' : 'Pay Now' }}
            </button>
          </div>
        </div>
      </div>
    </template>

    <div v-else class="alert alert-warning mx-4 mt-6">
      <IconAlertTriangle class="w-5 h-5" />
      <span>Order not found</span>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { getOrder, payOrder, fetchWallets, type Wallet } from '~/utils/api'

defineOgImage('UniOgImage', { title: 'Order Payment', description: 'Pay your order on Solar Network.' })
useSolarSeo({ title: 'Order Payment', description: 'Pay your order on Solar Network.' })

const router = useRouter()
const route = useRoute()
const orderId = computed(() => route.params.id as string)

const paying = ref(false)
const pinCode = ref('')
const payError = ref('')
const selectedWalletId = ref('')
const wallets = ref<Wallet[]>([])

const { data: order, status: orderStatus, refresh } = await useAsyncData(
  () => `order-${orderId.value}`,
  () => getOrder(orderId.value),
  { watch: [orderId], default: () => null, immediate: true },
)

// Load wallets for wallet selector
onMounted(async () => {
  try {
    const all = await fetchWallets()
    wallets.value = all
    if (all.length) selectedWalletId.value = all.find(w => w.isPrimary)?.id || all[0].id
  } catch { /* user may not have wallet yet */ }
})

const statusBadgeClass = computed(() => {
  const map: Record<string, string> = {
    unpaid: 'badge-warning',
    paid: 'badge-success',
    finished: 'badge-info',
    cancelled: 'badge-error',
    expired: 'badge-neutral',
  }
  return map[order.value?.status || ''] || 'badge-ghost'
})

function formatAmount(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function getWalletBalance(w: Wallet): string {
  const p = w.pockets?.find(p => p.currency === order.value?.currency)
  return p ? `${p.currency} ${formatAmount(p.availableAmount ?? p.amount)}` : ''
}

function copyId() {
  if (order.value) navigator.clipboard.writeText(order.value.id)
}

async function handlePay() {
  if (!order.value || !pinCode.value) return
  paying.value = true
  payError.value = ''
  try {
    const updated = await payOrder(order.value.id, pinCode.value, selectedWalletId.value || undefined)
    order.value = updated
    pinCode.value = ''
  } catch (e: any) {
    payError.value = e?.message || 'Payment failed. Please try again.'
  } finally {
    paying.value = false
  }
}
</script>
