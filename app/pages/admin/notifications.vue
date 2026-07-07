<template>
  <NuxtLayout name="admin">
    <AdminPageHeader title="Notifications" description="Send push notifications to accounts" />

    <TabsRoot v-model="activeTab" default-value="send">
      <TabsList class="flex border-b border-base-200 mb-6">
        <TabsTrigger
          value="send"
          class="flex items-center gap-2 px-4 py-3 text-sm font-medium text-base-content/60 border-b-2 border-transparent transition-colors hover:text-base-content data-[state=active]:text-primary data-[state=active]:border-primary"
        >
          <IconSend class="w-4 h-4" />
          Send
        </TabsTrigger>
        <TabsTrigger
          value="observability"
          class="flex items-center gap-2 px-4 py-3 text-sm font-medium text-base-content/60 border-b-2 border-transparent transition-colors hover:text-base-content data-[state=active]:text-primary data-[state=active]:border-primary"
        >
          <IconActivity class="w-4 h-4" />
          Observability
        </TabsTrigger>
      </TabsList>

      <TabsContent value="send">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Form -->
          <div class="lg:col-span-2">
            <AdminCard title="Compose Notification">
              <form class="space-y-4" @submit.prevent="handleSendNotification">
                <!-- Targeting -->
                <div>
                  <label class="label label-text text-sm font-medium">Target Mode</label>
                  <div class="flex gap-2 rounded-xl bg-base-200/70 p-1">
                    <button
                      type="button"
                      class="flex-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all"
                      :class="targetMode === 'accounts' ? 'bg-base-100 text-primary shadow-sm' : 'text-base-content/50'"
                      @click="targetMode = 'accounts'"
                    >
                      Specific Accounts
                    </button>
                    <button
                      type="button"
                      class="flex-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all"
                      :class="targetMode === 'broadcast' ? 'bg-base-100 text-primary shadow-sm' : 'text-base-content/50'"
                      @click="targetMode = 'broadcast'"
                    >
                      Broadcast All
                    </button>
                  </div>
                </div>

                <!-- Account Targeting -->
                <div v-if="targetMode === 'accounts'">
                  <label class="label label-text text-sm font-medium">Target Accounts</label>
                  <div v-if="selectedAccounts.length" class="flex flex-wrap gap-1.5 mb-2">
                    <span
                      v-for="acc in selectedAccounts"
                      :key="acc.id"
                      class="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-primary/10 text-primary"
                    >
                      {{ acc.nick || acc.name }}
                      <button class="hover:text-error" @click="removeSelectedAccount(acc.id)">
                        <IconX class="w-3 h-3" />
                      </button>
                    </span>
                  </div>
                  <button
                    type="button"
                    class="btn btn-sm btn-outline w-full"
                    @click="openAccountPicker"
                  >
                    <IconUsers class="w-4 h-4" />
                    {{ selectedAccounts.length ? 'Add More Accounts' : 'Select Accounts' }}
                  </button>
                </div>

                <!-- Notification Content -->
                <div>
                  <label class="label label-text text-sm font-medium">Topic</label>
                  <input v-model="form.topic" type="text" class="input input-sm w-full bg-base-200/60 border-0 rounded-xl" placeholder="admin.notice" />
                </div>
                <div>
                  <label class="label label-text text-sm font-medium">Title</label>
                  <input v-model="form.title" type="text" class="input input-sm w-full bg-base-200/60 border-0 rounded-xl" placeholder="Notification title" />
                </div>
                <div>
                  <label class="label label-text text-sm font-medium">Subtitle</label>
                  <input v-model="form.subtitle" type="text" class="input input-sm w-full bg-base-200/60 border-0 rounded-xl" placeholder="Optional subtitle" />
                </div>
                <div>
                  <label class="label label-text text-sm font-medium">Body</label>
                  <textarea
                    v-model="form.body"
                    class="textarea textarea-sm w-full bg-base-200/60 border-0 rounded-xl"
                    rows="3"
                    placeholder="Notification body..."
                  />
                </div>
                <div>
                  <label class="label label-text text-sm font-medium">Action URI</label>
                  <input v-model="form.actionUri" type="text" class="input input-sm w-full bg-base-200/60 border-0 rounded-xl" placeholder="solian://path/to/content" />
                </div>

                <!-- Options -->
                <div class="flex gap-4">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input v-model="form.isSilent" type="checkbox" class="checkbox checkbox-sm" />
                    <span class="text-sm">Silent</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input v-model="form.isSavable" type="checkbox" class="checkbox checkbox-sm" />
                    <span class="text-sm">Savable</span>
                  </label>
                </div>

                <button
                  type="submit"
                  class="btn btn-primary w-full"
                  :disabled="isSending || !form.title || !form.body"
                >
                  <span v-if="isSending" class="loading loading-spinner loading-xs" />
                  <span v-else>Send Notification</span>
                </button>

                <!-- Result -->
                <div v-if="result" class="rounded-xl bg-success/5 border border-success/20 p-3">
                  <p class="text-sm text-success font-medium">Delivered successfully</p>
                  <p class="text-xs text-base-content/60 mt-1">
                    Requested: {{ result.requested }} • Sent: {{ result.sent }} • Skipped: {{ result.skipped }}
                  </p>
                </div>
              </form>
            </AdminCard>
          </div>

          <!-- Info -->
          <div>
            <AdminCard title="About Push Notifications">
              <p class="text-sm text-base-content/60">
                Use this panel to send targeted push notifications to specific accounts or broadcast to all users.
                Notifications use the Ring push delivery path and support customizable title, body, and action URIs.
              </p>
            </AdminCard>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="observability">
        <div v-if="isLoadingObs" class="flex justify-center py-12">
          <span class="loading loading-spinner loading-lg" />
        </div>

        <div v-else-if="observability" class="space-y-6">
          <!-- Summary Stats -->
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="card bg-base-100 shadow-sm">
              <div class="card-body p-4">
                <p class="text-xs text-base-content/60">Send Requests</p>
                <p class="text-2xl font-bold mt-1">{{ formatNumber(observability.totalSendRequests) }}</p>
              </div>
            </div>
            <div class="card bg-base-100 shadow-sm">
              <div class="card-body p-4">
                <p class="text-xs text-base-content/60">Target Accounts</p>
                <p class="text-2xl font-bold mt-1">{{ formatNumber(observability.totalTargetAccounts) }}</p>
              </div>
            </div>
            <div class="card bg-base-100 shadow-sm">
              <div class="card-body p-4">
                <p class="text-xs text-base-content/60">Delivery Attempts</p>
                <p class="text-2xl font-bold mt-1">{{ formatNumber(observability.totalDeliveryAttempts) }}</p>
              </div>
            </div>
            <div class="card bg-base-100 shadow-sm">
              <div class="card-body p-4">
                <p class="text-xs text-base-content/60">Success Rate</p>
                <p class="text-2xl font-bold mt-1" :class="getSuccessRateClass(observability.overallSuccessRate)">
                  {{ (observability.overallSuccessRate * 100).toFixed(1) }}%
                </p>
              </div>
            </div>
          </div>

          <!-- Provider Breakdown -->
          <AdminCard title="Delivery by Provider">
            <div class="space-y-4">
              <div
                v-for="provider in observability.providers"
                :key="provider.provider"
                class="space-y-2"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="font-medium text-sm capitalize">{{ provider.provider }}</span>
                    <span class="badge badge-xs badge-ghost">{{ formatNumber(provider.attempts) }} attempts</span>
                  </div>
                  <span
                    class="text-sm font-semibold"
                    :class="getSuccessRateClass(provider.successRate)"
                  >
                    {{ (provider.successRate * 100).toFixed(1) }}%
                  </span>
                </div>
                <div class="flex gap-1 h-2 rounded-full overflow-hidden bg-base-200">
                  <div
                    class="bg-success rounded-full transition-all"
                    :style="{ width: `${(provider.results.success || 0) / provider.attempts * 100}%` }"
                  />
                  <div
                    class="bg-error rounded-full transition-all"
                    :style="{ width: `${(provider.results.failure || 0) / provider.attempts * 100}%` }"
                  />
                  <div
                    class="bg-warning rounded-full transition-all"
                    :style="{ width: `${(provider.results.invalid_token || 0) / provider.attempts * 100}%` }"
                  />
                  <div
                    class="bg-base-content/30 rounded-full transition-all"
                    :style="{ width: `${((provider.results.skipped || 0) + (provider.results.no_subscription || 0)) / provider.attempts * 100}%` }"
                  />
                </div>
                <div class="flex gap-3 text-[10px] text-base-content/50">
                  <span class="flex items-center gap-1">
                    <span class="w-1.5 h-1.5 rounded-full bg-success" /> Success: {{ formatNumber(provider.results.success || 0) }}
                  </span>
                  <span class="flex items-center gap-1">
                    <span class="w-1.5 h-1.5 rounded-full bg-error" /> Failure: {{ formatNumber(provider.results.failure || 0) }}
                  </span>
                  <span v-if="provider.results.invalid_token" class="flex items-center gap-1">
                    <span class="w-1.5 h-1.5 rounded-full bg-warning" /> Invalid: {{ formatNumber(provider.results.invalid_token) }}
                  </span>
                </div>
              </div>
            </div>
          </AdminCard>

          <!-- Latency & Top Topics Row -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Latency Card -->
            <AdminCard title="Delivery Latency">
              <div class="grid grid-cols-4 gap-3">
                <div class="text-center">
                  <p class="text-lg font-bold text-primary">{{ observability.latency.p50 }}<span class="text-xs font-normal text-base-content/40">ms</span></p>
                  <p class="text-[10px] text-base-content/50 mt-0.5">p50</p>
                </div>
                <div class="text-center">
                  <p class="text-lg font-bold">{{ observability.latency.p95 }}<span class="text-xs font-normal text-base-content/40">ms</span></p>
                  <p class="text-[10px] text-base-content/50 mt-0.5">p95</p>
                </div>
                <div class="text-center">
                  <p class="text-lg font-bold">{{ observability.latency.p99 }}<span class="text-xs font-normal text-base-content/40">ms</span></p>
                  <p class="text-[10px] text-base-content/50 mt-0.5">p99</p>
                </div>
                <div class="text-center">
                  <p class="text-lg font-bold text-base-content/70">{{ observability.latency.avg }}<span class="text-xs font-normal text-base-content/40">ms</span></p>
                  <p class="text-[10px] text-base-content/50 mt-0.5">avg</p>
                </div>
              </div>
              <div class="mt-4 pt-4 border-t border-base-200">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-base-content/60">Avg Batch Size</span>
                  <span class="font-medium">{{ observability.batchSizes.avg.toFixed(0) }}</span>
                </div>
                <div class="flex items-center justify-between text-sm mt-2">
                  <span class="text-base-content/60">Max Batch Size</span>
                  <span class="font-medium">{{ observability.batchSizes.max }}</span>
                </div>
              </div>
            </AdminCard>

            <!-- Top Topics Card -->
            <AdminCard title="Top Topics by Volume">
              <div v-if="observability.topics.length" class="space-y-3">
                <div
                  v-for="topic in observability.topics.slice(0, 5)"
                  :key="topic.topic"
                  class="flex items-center justify-between"
                >
                  <div class="flex items-center gap-2 min-w-0">
                    <IconBell class="w-3.5 h-3.5 text-base-content/40 shrink-0" />
                    <span class="text-sm font-mono truncate">{{ topic.topic }}</span>
                  </div>
                  <div class="flex items-center gap-2 shrink-0 ml-3">
                    <span class="text-xs text-base-content/50">{{ formatNumber(topic.sendRequests) }} req</span>
                    <span class="text-xs font-medium">{{ formatNumber(topic.deliveryAttempts) }} del</span>
                  </div>
                </div>
              </div>
              <div v-else class="py-6 text-center text-base-content/40 text-sm">
                No topics recorded yet
              </div>
            </AdminCard>
          </div>

          <!-- Preference Gate Results -->
          <AdminCard title="Preference Gate Results">
            <p class="text-xs text-base-content/50 mb-3">How user notification preferences affect delivery</p>
            <div class="grid grid-cols-3 gap-4">
              <div class="text-center p-3 rounded-xl bg-success/5">
                <p class="text-lg font-bold text-success">{{ formatNumber(observability.preferenceResults.normal) }}</p>
                <p class="text-xs text-base-content/50 mt-0.5">Normal</p>
              </div>
              <div class="text-center p-3 rounded-xl bg-warning/5">
                <p class="text-lg font-bold text-warning">{{ formatNumber(observability.preferenceResults.silent) }}</p>
                <p class="text-xs text-base-content/50 mt-0.5">Silent</p>
              </div>
              <div class="text-center p-3 rounded-xl bg-error/5">
                <p class="text-lg font-bold text-error">{{ formatNumber(observability.preferenceResults.reject) }}</p>
                <p class="text-xs text-base-content/50 mt-0.5">Reject</p>
              </div>
            </div>
          </AdminCard>
        </div>

        <div v-else class="card bg-base-100 shadow-sm">
          <div class="card-body py-12 text-center">
            <IconActivity class="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p class="text-sm text-base-content/40">No observability data available</p>
            <p class="text-xs text-base-content/30 mt-1">Metrics will appear once notifications are sent</p>
          </div>
        </div>
      </TabsContent>
    </TabsRoot>

    <AccountPickerDrawer
      :open="pickerOpen"
      :allow-multiple="true"
      title="Select Target Accounts"
      placeholder="Search by name or nick..."
      @select="picker.handleSelect"
      @update:open="pickerOpen = $event"
    />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { TabsRoot, TabsList, TabsTrigger, TabsContent } from 'reka-ui'
import { IconActivity, IconBell, IconSend, IconUsers, IconX } from '#components'
import { fetchNotificationObservability, sendAdminNotifications } from '~/utils/admin'
import { useAccountPicker } from '~/composables/useAccountPicker'
import AccountPickerDrawer from '~/components/shared/AccountPickerDrawer.vue'
import type { BulkDeliveryResult, NotificationObservability, NotificationPayload } from '~/types/admin'
import type { SnAccount } from '~/types/auth'

definePageMeta({ middleware: 'auth' })

const activeTab = ref<'send' | 'observability'>('send')

const isSending = ref(false)
const targetMode = ref<'accounts' | 'broadcast'>('accounts')
const result = ref<BulkDeliveryResult | null>(null)
const selectedAccounts = ref<SnAccount[]>([])

const picker = useAccountPicker()
const pickerOpen = computed({
  get: () => picker.isOpen.value,
  set: (val: boolean) => { picker.isOpen.value = val },
})

const form = ref({
  topic: 'admin.notice',
  title: '',
  subtitle: '',
  body: '',
  actionUri: '',
  isSilent: false,
  isSavable: true,
})

// Observability
const isLoadingObs = ref(false)
const observability = ref<NotificationObservability | null>(null)

async function loadObservability() {
  if (observability.value) return
  isLoadingObs.value = true
  try {
    observability.value = await fetchNotificationObservability()
  } catch {
    useNuxtApp().$toast.error('Failed to load observability data')
  } finally {
    isLoadingObs.value = false
  }
}

watch(activeTab, (tab) => {
  if (tab === 'observability') {
    loadObservability()
  }
})

async function openAccountPicker() {
  const accounts = await picker.open({ allowMultiple: true, title: 'Select Target Accounts' })
  if (accounts && Array.isArray(accounts)) {
    for (const acc of accounts) {
      if (!selectedAccounts.value.find(a => a.id === acc.id)) {
        selectedAccounts.value.push(acc)
      }
    }
  }
}

function removeSelectedAccount(id: string) {
  selectedAccounts.value = selectedAccounts.value.filter(a => a.id !== id)
}

async function handleSendNotification() {
  isSending.value = true
  result.value = null

  const accountIds = targetMode.value === 'accounts'
    ? selectedAccounts.value.map(a => a.id)
    : undefined

  const payload: NotificationPayload = {
    topic: form.value.topic,
    title: form.value.title,
    subtitle: form.value.subtitle || undefined,
    body: form.value.body,
    actionUri: form.value.actionUri || undefined,
    isSilent: form.value.isSilent,
    isSavable: form.value.isSavable,
    broadcastToAll: targetMode.value === 'broadcast',
    accountIds: targetMode.value === 'accounts' ? accountIds : undefined,
  }

  try {
    result.value = await sendAdminNotifications(payload)
    if (result.value.sent > 0) {
      selectedAccounts.value = []
    }
  } catch {
    useNuxtApp().$toast.error('Failed to send notifications')
  } finally {
    isSending.value = false
  }
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

function getSuccessRateClass(rate: number): string {
  if (rate >= 0.95) return 'text-success'
  if (rate >= 0.8) return 'text-warning'
  return 'text-error'
}
</script>
