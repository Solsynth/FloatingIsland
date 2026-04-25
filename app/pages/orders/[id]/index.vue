<template>
  <NuxtLayout name="app">
    <ConfuseSpinner v-if="orderStatus === 'pending'" message="Loading order..." />

    <template v-else-if="order">
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h1 class="text-2xl font-bold mb-4">Order Status</h1>

          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-base-content/60">Order ID</span>
              <span class="font-mono text-sm">{{ order.id }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-base-content/60">Amount</span>
              <span class="font-bold">{{ order.currency }} {{ order.amount }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-base-content/60">Product</span>
              <span>{{ order.productIdentifier || 'N/A' }}</span>
            </div>
            <div v-if="order.remarks" class="flex justify-between">
              <span class="text-base-content/60">Remarks</span>
              <span>{{ order.remarks }}</span>
            </div>
            <div v-if="order.expiredAt" class="flex justify-between">
              <span class="text-base-content/60">Expires</span>
              <span>{{ new Date(order.expiredAt).toLocaleString() }}</span>
            </div>
          </div>

          <div class="divider" />

          <!-- Payment form -->
          <div class="form-control">
            <label class="label"><span class="label-text">Enter PIN to pay</span></label>
            <input
              v-model="pinCode"
              type="password"
              placeholder="Enter your PIN"
              class="input input-bordered w-full"
              maxlength="6"
            >
          </div>

          <button
            class="btn btn-primary mt-4"
            :disabled="!pinCode || paying"
            @click="handlePay"
          >
            <IconLoader v-if="paying" class="w-4 h-4 animate-spin" />
            Pay Now
          </button>
        </div>
      </div>
    </template>

    <div v-else class="alert alert-warning">
      <IconAlertTriangle class="w-5 h-5" />
      <span>Order not found</span>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">

import { getOrder, payOrder } from '~/utils/api'

const route = useRoute()
const orderId = computed(() => route.params.id as string)
const paying = ref(false)
const pinCode = ref('')

const { data: order, status: orderStatus } = await useAsyncData(
  () => `order-${orderId.value}`,
  () => getOrder(orderId.value),
  {
    watch: [orderId],
    default: () => null,
  },
)

async function handlePay() {
  if (!order.value || !pinCode.value) return
  paying.value = true
  try {
    await payOrder(order.value.id, pinCode.value)
    // Success
  } catch (e) {
    console.error('Payment failed:', e)
  } finally {
    paying.value = false
  }
}
</script>
