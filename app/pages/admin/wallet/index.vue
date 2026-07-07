<template>
  <NuxtLayout name="admin">
    <AdminPageHeader title="Wallet" description="Manage wallets, transactions, orders, and subscriptions" />

    <!-- Tabs -->
    <div class="flex gap-1 mb-6 p-1 rounded-xl bg-base-300/30 w-fit">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="rounded-lg px-4 py-1.5 text-xs font-semibold transition-all"
        :class="activeTab === tab.id ? 'bg-base-100 text-primary shadow-sm' : 'text-base-content/50'"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Transactions Tab -->
    <template v-if="activeTab === 'transactions'">
      <AdminCard class="mb-4">
        <div class="flex flex-wrap gap-2">
          <input
            v-model="txFilters.accountId"
            type="text"
            placeholder="Account ID..."
            class="input input-sm bg-base-200/60 border-0 rounded-xl w-44"
          />
          <input
            v-model="txFilters.currency"
            type="text"
            placeholder="Currency..."
            class="input input-sm bg-base-200/60 border-0 rounded-xl w-32"
          />
          <button class="btn btn-sm btn-primary" @click="loadTransactions">Filter</button>
        </div>
      </AdminCard>

      <div v-if="txLoading" class="flex justify-center py-16">
        <span class="loading loading-spinner loading-lg" />
      </div>

      <AdminCard v-else no-padding>
        <div class="overflow-x-auto">
          <table class="table table-sm table-zebra">
            <thead>
              <tr class="text-xs text-base-content/50 uppercase tracking-wider">
                <th class="pl-5">ID</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Currency</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="tx in transactions" :key="tx.id" class="hover:bg-base-200/50">
                <td class="pl-5 text-xs font-mono truncate max-w-[8rem]">{{ tx.id.slice(0, 8) }}...</td>
                <td><span class="text-xs">{{ tx.type }}</span></td>
                <td><span class="text-sm font-medium">{{ tx.amount }}</span></td>
                <td><span class="text-xs">{{ tx.currency }}</span></td>
                <td><span class="badge badge-xs">{{ tx.status }}</span></td>
                <td><span class="text-xs text-base-content/40">{{ formatDate(tx.createdAt) }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="transactions.length === 0" class="flex flex-col items-center py-12 text-center">
          <p class="text-base-content/50">No transactions found</p>
        </div>
        <div v-if="txHasMore || txTotal > 50" class="flex items-center justify-between px-5 py-3 border-t border-base-300/20">
          <span class="text-xs text-base-content/40">Showing {{ txOffset + 1 }}–{{ Math.min(txOffset + 50, txTotal) }} of {{ txTotal || 'many' }}</span>
          <div class="flex gap-1">
            <button class="btn btn-ghost btn-xs" :disabled="txOffset === 0" @click="txOffset = Math.max(0, txOffset - 50); loadTransactions()">
              <IconChevronLeft class="w-3.5 h-3.5" />
            </button>
            <button class="btn btn-ghost btn-xs" :disabled="!txHasMore && txOffset + 50 >= txTotal" @click="txOffset += 50; loadTransactions()">
              <IconChevronRight class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </AdminCard>

      <!-- Balance Modify -->
      <AdminCard class="mt-4">
        <h3 class="text-sm font-semibold mb-3">Modify Balance</h3>
        <div class="flex flex-wrap gap-2 items-end">
          <div>
            <label class="text-xs text-base-content/50">Account ID</label>
            <input v-model="balForm.accountId" type="text" class="input input-sm bg-base-200/60 border-0 rounded-xl w-44" />
          </div>
          <div>
            <label class="text-xs text-base-content/50">Currency</label>
            <input v-model="balForm.currency" type="text" class="input input-sm bg-base-200/60 border-0 rounded-xl w-24" />
          </div>
          <div>
            <label class="text-xs text-base-content/50">Amount</label>
            <input v-model.number="balForm.amount" type="number" class="input input-sm bg-base-200/60 border-0 rounded-xl w-24" />
          </div>
          <div>
            <label class="text-xs text-base-content/50">Remark</label>
            <input v-model="balForm.remark" type="text" class="input input-sm bg-base-200/60 border-0 rounded-xl w-40" />
          </div>
          <label class="flex items-center gap-1.5 cursor-pointer pt-4">
            <input v-model="balForm.forceOperation" type="checkbox" class="checkbox checkbox-xs" />
            <span class="text-xs text-base-content/50">Force</span>
          </label>
          <button class="btn btn-sm btn-primary" :disabled="balLoading" @click="handleModifyBalance">
            {{ balLoading ? 'Processing...' : 'Modify Balance' }}
          </button>
        </div>
      </AdminCard>
    </template>

    <!-- Orders Tab -->
    <template v-if="activeTab === 'orders'">
      <AdminCard class="mb-4">
        <div class="flex flex-wrap gap-2">
          <input v-model="orderFilters.accountId" type="text" placeholder="Account ID..." class="input input-sm bg-base-200/60 border-0 rounded-xl w-44" />
          <input v-model="orderFilters.currency" type="text" placeholder="Currency..." class="input input-sm bg-base-200/60 border-0 rounded-xl w-32" />
          <button class="btn btn-sm btn-primary" @click="loadOrders">Filter</button>
        </div>
      </AdminCard>

      <div v-if="orderLoading" class="flex justify-center py-16">
        <span class="loading loading-spinner loading-lg" />
      </div>

      <AdminCard v-else no-padding>
        <div class="overflow-x-auto">
          <table class="table table-sm table-zebra">
            <thead>
              <tr class="text-xs text-base-content/50 uppercase tracking-wider">
                <th class="pl-5">ID</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Currency</th>
                <th>Created</th>
                <th class="pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in orders" :key="order.id" class="hover:bg-base-200/50">
                <td class="pl-5 text-xs font-mono truncate max-w-[8rem]">{{ order.id.slice(0, 8) }}...</td>
                <td><span class="badge badge-xs">{{ order.status }}</span></td>
                <td><span class="text-sm font-medium">{{ order.amount }}</span></td>
                <td><span class="text-xs">{{ order.currency }}</span></td>
                <td><span class="text-xs text-base-content/40">{{ formatDate(order.createdAt) }}</span></td>
                <td class="pr-5 text-right">
                  <button class="btn btn-ghost btn-xs" @click="applyOrder(order.id)">Apply</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="orders.length === 0" class="flex flex-col items-center py-12 text-center">
          <p class="text-base-content/50">No orders found</p>
        </div>
      </AdminCard>

      <!-- Golds Resupply Pack -->
      <AdminCard class="mt-4">
        <h3 class="text-sm font-semibold mb-3">Golds Resupply Pack</h3>
        <div v-if="goldsPack" class="grid grid-cols-2 gap-3 text-sm">
          <div><span class="text-base-content/40">Key:</span> {{ goldsPack.key }}</div>
          <div><span class="text-base-content/40">Identifier:</span> {{ goldsPack.identifier }}</div>
          <div><span class="text-base-content/40">Display:</span> {{ goldsPack.displayName }}</div>
          <div><span class="text-base-content/40">Currency:</span> {{ goldsPack.currency }}</div>
        </div>
        <p v-else class="text-sm text-base-content/50">No configuration found</p>
      </AdminCard>
    </template>

    <!-- Subscriptions Tab -->
    <template v-if="activeTab === 'subscriptions'">
      <AdminCard class="mb-4">
        <div class="flex flex-wrap gap-2">
          <input v-model="subFilters.accountId" type="text" placeholder="Account ID..." class="input input-sm bg-base-200/60 border-0 rounded-xl w-44" />
          <input v-model="subFilters.identifier" type="text" placeholder="Identifier..." class="input input-sm bg-base-200/60 border-0 rounded-xl w-32" />
          <button class="btn btn-sm btn-primary" @click="loadSubscriptions">Filter</button>
        </div>
      </AdminCard>

      <div v-if="subLoading" class="flex justify-center py-16">
        <span class="loading loading-spinner loading-lg" />
      </div>

      <AdminCard v-else no-padding>
        <div class="overflow-x-auto">
          <table class="table table-sm table-zebra">
            <thead>
              <tr class="text-xs text-base-content/50 uppercase tracking-wider">
                <th class="pl-5">ID</th>
                <th>Account</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Testing</th>
                <th>Began</th>
                <th>Expires</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="sub in subscriptions" :key="sub.id" class="hover:bg-base-200/50">
                <td class="pl-5 text-xs font-mono truncate max-w-[8rem]">{{ sub.id.slice(0, 8) }}...</td>
                <td class="text-xs font-mono truncate max-w-[8rem]">{{ sub.accountId.slice(0, 8) }}...</td>
                <td><span class="text-xs">{{ sub.identifier }}</span></td>
                <td>
                  <span class="badge badge-xs" :class="sub.isActive ? 'badge-success' : 'badge-ghost'">
                    {{ sub.status }}
                  </span>
                </td>
                <td><span v-if="sub.isTesting" class="badge badge-warning badge-xs">Test</span></td>
                <td><span class="text-xs text-base-content/40">{{ formatDate(sub.begunAt) }}</span></td>
                <td><span class="text-xs text-base-content/40">{{ formatDate(sub.expiredAt) }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="subscriptions.length === 0" class="flex flex-col items-center py-12 text-center">
          <p class="text-base-content/50">No subscriptions found</p>
        </div>
      </AdminCard>

      <!-- Maintenance Actions -->
      <AdminCard class="mt-4">
        <h3 class="text-sm font-semibold mb-3">Maintenance</h3>
        <div class="flex flex-wrap gap-2">
          <button class="btn btn-sm btn-ghost" :disabled="maintLoading" @click="runMaintenance('update-expired')">
            Update Expired
          </button>
          <button class="btn btn-sm btn-ghost" :disabled="maintLoading" @click="runMaintenance('activate-pending')">
            Activate Pending
          </button>
          <button class="btn btn-sm btn-ghost" :disabled="maintLoading" @click="runMaintenance('cancel-in-app')">
            Cancel In-App Wallet
          </button>
        </div>
        <p v-if="maintResult" class="text-xs text-success mt-2">
          Affected: {{ maintResult.affectedCount }}
        </p>
      </AdminCard>
    </template>

    <!-- Catalog Tab -->
    <template v-if="activeTab === 'catalog'">
      <AdminCard class="mb-4">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-semibold">Subscription Catalog</h3>
          <button class="btn btn-sm btn-primary" @click="openCatalogCreate">
            <IconPlus class="w-3.5 h-3.5" />
            Add Item
          </button>
        </div>
      </AdminCard>

      <div v-if="catalogLoading" class="flex justify-center py-16">
        <span class="loading loading-spinner loading-lg" />
      </div>

      <template v-else>
        <AdminCard v-for="item in catalog" :key="item.identifier" class="mb-3" no-padding>
          <div class="px-5 py-3">
            <div class="flex items-center justify-between">
              <div>
                <span class="text-sm font-semibold">{{ item.displayName }}</span>
                <span class="text-xs text-base-content/40 ml-2">{{ item.identifier }}</span>
              </div>
              <div class="flex gap-1">
                <button class="btn btn-ghost btn-xs" @click="editCatalogItem(item)">Edit</button>
                <button class="btn btn-ghost btn-xs text-error" @click="deleteCatalog(item.identifier)">Delete</button>
              </div>
            </div>
            <div class="grid grid-cols-4 gap-2 mt-2 text-xs text-base-content/50">
              <div>Currency: {{ item.currency }}</div>
              <div>Price: {{ item.basePrice }}</div>
              <div>Perk Lv: {{ item.perkLevel }}</div>
              <div>Group: {{ item.groupIdentifier }}</div>
            </div>
          </div>
        </AdminCard>
        <div v-if="catalog.length === 0" class="flex flex-col items-center py-12 text-center">
          <p class="text-base-content/50">No catalog items</p>
        </div>
      </template>

      <!-- Catalog Edit Drawer -->
      <AdminDrawer :open="catalogDrawerOpen" :title="catalogEditId ? 'Edit Catalog Item' : 'New Catalog Item'" @update:open="catalogDrawerOpen = $event">
        <form class="space-y-3" @submit.prevent="saveCatalogItem">
          <div>
            <label class="text-xs text-base-content/50">Identifier</label>
            <input v-model="catalogForm.identifier" type="text" class="input input-sm w-full bg-base-200/60 border-0 rounded-xl" required />
          </div>
          <div>
            <label class="text-xs text-base-content/50">Display Name</label>
            <input v-model="catalogForm.displayName" type="text" class="input input-sm w-full bg-base-200/60 border-0 rounded-xl" required />
          </div>
          <div>
            <label class="text-xs text-base-content/50">Group Identifier</label>
            <input v-model="catalogForm.groupIdentifier" type="text" class="input input-sm w-full bg-base-200/60 border-0 rounded-xl" required />
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="text-xs text-base-content/50">Currency</label>
              <input v-model="catalogForm.currency" type="text" class="input input-sm w-full bg-base-200/60 border-0 rounded-xl" />
            </div>
            <div>
              <label class="text-xs text-base-content/50">Base Price</label>
              <input v-model.number="catalogForm.basePrice" type="number" class="input input-sm w-full bg-base-200/60 border-0 rounded-xl" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="text-xs text-base-content/50">Perk Level</label>
              <input v-model.number="catalogForm.perkLevel" type="number" class="input input-sm w-full bg-base-200/60 border-0 rounded-xl" />
            </div>
            <div>
              <label class="text-xs text-base-content/50">Min Account Level</label>
              <input v-model.number="catalogForm.minimumAccountLevel" type="number" class="input input-sm w-full bg-base-200/60 border-0 rounded-xl" />
            </div>
          </div>
          <button class="btn btn-sm btn-primary w-full" :disabled="catalogSaving">
            {{ catalogSaving ? 'Saving...' : 'Save' }}
          </button>
        </form>
      </AdminDrawer>
    </template>
  </NuxtLayout>
</template>

<script setup lang="ts">
import {
  IconChevronLeft,
  IconChevronRight,
  IconPlus,
} from '#components'
import type {
  AdminTransaction,
  AdminWalletOrder,
  AdminSubscription,
  AdminSubscriptionCatalogItem,
  GoldsResupplyPack,
  MaintenanceResult,
} from '~/types/admin'
import {
  fetchAdminTransactions,
  fetchAdminOrders,
  modifyBalance,
  fetchSubscriptions,
  fetchSubscriptionCatalog,
  saveSubscriptionCatalogItem,
  deleteSubscriptionCatalogItem,
  runMaintenanceUpdateExpired,
  runMaintenanceActivatePending,
  runMaintenanceCancelInAppWallet,
  fetchGoldsResupplyPack,
  applyWalletProductOrder,
} from '~/utils/admin'

definePageMeta({ middleware: 'auth' })

const activeTab = ref('transactions')
const tabs = [
  { id: 'transactions', label: 'Transactions' },
  { id: 'orders', label: 'Orders' },
  { id: 'subscriptions', label: 'Subscriptions' },
  { id: 'catalog', label: 'Catalog' },
]

function formatDate(date?: string): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString()
}

// Transactions
const transactions = ref<AdminTransaction[]>([])
const txTotal = ref(0)
const txHasMore = ref(false)
const txOffset = ref(0)
const txLoading = ref(false)
const txFilters = ref({ accountId: '', currency: '' })

async function loadTransactions() {
  txLoading.value = true
  try {
    const result = await fetchAdminTransactions({
      accountId: txFilters.value.accountId || undefined,
      currency: txFilters.value.currency || undefined,
      take: 50,
      offset: txOffset.value,
    })
    transactions.value = result.items
    txTotal.value = result.total
    txHasMore.value = result.total > txOffset.value + result.items.length || result.items.length >= 50
  } catch {
    transactions.value = []
  } finally {
    txLoading.value = false
  }
}

// Balance
const balForm = ref({ accountId: '', currency: '', amount: 0, remark: '', forceOperation: false })
const balLoading = ref(false)

async function handleModifyBalance() {
  balLoading.value = true
  try {
    await modifyBalance(balForm.value)
    balForm.value = { accountId: '', currency: '', amount: 0, remark: '', forceOperation: false }
    loadTransactions()
  } catch { /* ignore */ } finally {
    balLoading.value = false
  }
}

// Orders
const orders = ref<AdminWalletOrder[]>([])
const orderLoading = ref(false)
const orderFilters = ref({ accountId: '', currency: '' })

async function loadOrders() {
  orderLoading.value = true
  try {
    const result = await fetchAdminOrders({
      accountId: orderFilters.value.accountId || undefined,
      currency: orderFilters.value.currency || undefined,
    })
    orders.value = result.items
  } catch {
    orders.value = []
  } finally {
    orderLoading.value = false
  }
}

async function applyOrder(orderId: string) {
  try {
    await applyWalletProductOrder(orderId)
    loadOrders()
  } catch { /* ignore */ }
}

const goldsPack = ref<GoldsResupplyPack | null>(null)

// Subscriptions
const subscriptions = ref<AdminSubscription[]>([])
const subLoading = ref(false)
const subFilters = ref({ accountId: '', identifier: '' })

async function loadSubscriptions() {
  subLoading.value = true
  try {
    const result = await fetchSubscriptions({
      accountId: subFilters.value.accountId || undefined,
      identifier: subFilters.value.identifier || undefined,
    })
    subscriptions.value = result.items
  } catch {
    subscriptions.value = []
  } finally {
    subLoading.value = false
  }
}

const maintLoading = ref(false)
const maintResult = ref<MaintenanceResult | null>(null)

async function runMaintenance(type: string) {
  maintLoading.value = true
  maintResult.value = null
  try {
    if (type === 'update-expired') {
      maintResult.value = await runMaintenanceUpdateExpired()
    } else if (type === 'activate-pending') {
      maintResult.value = await runMaintenanceActivatePending()
    } else if (type === 'cancel-in-app') {
      maintResult.value = await runMaintenanceCancelInAppWallet()
    }
  } catch { /* ignore */ } finally {
    maintLoading.value = false
  }
}

// Catalog
const catalog = ref<AdminSubscriptionCatalogItem[]>([])
const catalogLoading = ref(false)
const catalogDrawerOpen = ref(false)
const catalogEditId = ref<string | null>(null)
const catalogSaving = ref(false)
const catalogForm = ref<AdminSubscriptionCatalogItem>({
  identifier: '',
  displayName: '',
  groupIdentifier: '',
  currency: '',
  basePrice: 0,
  perkLevel: 0,
})

async function loadCatalog() {
  catalogLoading.value = true
  try {
    catalog.value = await fetchSubscriptionCatalog()
  } catch {
    catalog.value = []
  } finally {
    catalogLoading.value = false
  }
}

function openCatalogCreate() {
  catalogEditId.value = null
  catalogForm.value = {
    identifier: '', displayName: '', groupIdentifier: '',
    currency: '', basePrice: 0, perkLevel: 0,
  }
  catalogDrawerOpen.value = true
}

function editCatalogItem(item: AdminSubscriptionCatalogItem) {
  catalogEditId.value = item.identifier
  catalogForm.value = { ...item }
  catalogDrawerOpen.value = true
}

async function saveCatalogItem() {
  catalogSaving.value = true
  try {
    await saveSubscriptionCatalogItem(catalogForm.value)
    catalogDrawerOpen.value = false
    loadCatalog()
  } catch { /* ignore */ } finally {
    catalogSaving.value = false
  }
}

async function deleteCatalog(identifier: string) {
  try {
    await deleteSubscriptionCatalogItem(identifier)
    loadCatalog()
  } catch { /* ignore */ }
}

// Tab switching loads
watch(activeTab, (tab) => {
  if (tab === 'transactions') loadTransactions()
  else if (tab === 'orders') { loadOrders(); fetchGoldsResupplyPack().then(p => goldsPack.value = p).catch(() => {}) }
  else if (tab === 'subscriptions') loadSubscriptions()
  else if (tab === 'catalog') loadCatalog()
})

onMounted(() => {
  loadTransactions()
})
</script>
