<template>
  <NuxtLayout name="admin">
    <AdminPageHeader title="Emails" description="Send HTML emails to accounts" />

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Form -->
      <div class="lg:col-span-2">
        <AdminCard title="Compose Email">
          <form class="space-y-4" @submit.prevent="handleSendEmail">
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

            <!-- Email Content -->
            <div>
              <label class="label label-text text-sm font-medium">Subject</label>
              <input v-model="form.subject" type="text" class="input input-sm w-full bg-base-200/60 border-0 rounded-xl" placeholder="Email subject" />
            </div>
            <div>
              <label class="label label-text text-sm font-medium">HTML Body</label>
              <textarea
                v-model="form.htmlBody"
                class="textarea textarea-sm w-full text-sm font-mono bg-base-200/60 border-0 rounded-xl"
                rows="10"
                placeholder="<html><body>...</body></html>"
              />
              <p class="text-xs text-base-content/40 mt-1">Full HTML document with inline styles required</p>
            </div>

            <button
              type="submit"
              class="btn btn-primary w-full"
              :disabled="isSending || !form.subject || !form.htmlBody"
            >
              <span v-if="isSending" class="loading loading-spinner loading-xs" />
              <span v-else>Send Email</span>
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
        <AdminCard title="About Email Delivery">
          <div class="space-y-2 text-sm text-base-content/60">
            <p>Send custom HTML emails to specific accounts or broadcast to all users.</p>
            <ul class="list-disc list-inside text-xs space-y-1 ml-2">
              <li>Emails are delivered to the account's verified email contacts</li>
              <li>Accounts without verified email contacts will be skipped</li>
              <li>You must provide a full HTML document with inline styles</li>
            </ul>
          </div>
        </AdminCard>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { sendAdminEmails } from '~/utils/admin'
import type { BulkDeliveryResult, EmailPayload } from '~/types/admin'

definePageMeta({ middleware: 'auth' })

const isSending = ref(false)
const targetMode = ref<'accounts' | 'broadcast'>('accounts')
const result = ref<BulkDeliveryResult | null>(null)

const form = ref({
  accountIdsRaw: '',
  subject: '',
  htmlBody: '',
})

async function handleSendEmail() {
  isSending.value = true
  result.value = null

  const accountIds = targetMode.value === 'accounts'
    ? form.value.accountIdsRaw.split('\n').map(s => s.trim()).filter(Boolean)
    : undefined

  const payload: EmailPayload = {
    subject: form.value.subject,
    htmlBody: form.value.htmlBody,
    broadcastToAll: targetMode.value === 'broadcast',
    accountIds: targetMode.value === 'accounts' ? accountIds : undefined,
  }

  try {
    result.value = await sendAdminEmails(payload)
  } catch {
    toast.error('Failed to send emails')
  } finally {
    isSending.value = false
  }
}
</script>
