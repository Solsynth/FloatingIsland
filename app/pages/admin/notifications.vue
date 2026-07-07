<template>
  <NuxtLayout name="admin">
    <AdminPageHeader title="Notifications" description="Send push notifications to accounts" />

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

            <!-- Account IDs -->
            <div v-if="targetMode === 'accounts'">
              <label class="label label-text text-sm font-medium">Account IDs</label>
              <textarea
                v-model="form.accountIdsRaw"
                class="textarea textarea-sm w-full text-sm font-mono bg-base-200/60 border-0 rounded-xl"
                rows="3"
                placeholder="One GUID per line"
              />
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
  </NuxtLayout>
</template>

<script setup lang="ts">
import { sendAdminNotifications } from '~/utils/admin'
import type { BulkDeliveryResult, NotificationPayload } from '~/types/admin'

definePageMeta({ middleware: 'auth' })

const isSending = ref(false)
const targetMode = ref<'accounts' | 'broadcast'>('accounts')
const result = ref<BulkDeliveryResult | null>(null)

const form = ref({
  accountIdsRaw: '',
  topic: 'admin.notice',
  title: '',
  subtitle: '',
  body: '',
  actionUri: '',
  isSilent: false,
  isSavable: true,
})

async function handleSendNotification() {
  isSending.value = true
  result.value = null

  const accountIds = targetMode.value === 'accounts'
    ? form.value.accountIdsRaw.split('\n').map(s => s.trim()).filter(Boolean)
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
  } catch {
    toast.error('Failed to send notifications')
  } finally {
    isSending.value = false
  }
}
</script>
