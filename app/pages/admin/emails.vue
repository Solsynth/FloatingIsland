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
import { computed } from 'vue'
import { IconUsers, IconX } from '#components'
import { sendAdminEmails } from '~/utils/admin'
import { useAccountPicker } from '~/composables/useAccountPicker'
import AccountPickerDrawer from '~/components/shared/AccountPickerDrawer.vue'
import type { BulkDeliveryResult, EmailPayload } from '~/types/admin'
import type { SnAccount } from '~/types/auth'

definePageMeta({ middleware: 'auth' })

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
  subject: '',
  htmlBody: '',
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

async function handleSendEmail() {
  isSending.value = true
  result.value = null

  const accountIds = targetMode.value === 'accounts'
    ? selectedAccounts.value.map(a => a.id)
    : undefined

  const payload: EmailPayload = {
    subject: form.value.subject,
    htmlBody: form.value.htmlBody,
    broadcastToAll: targetMode.value === 'broadcast',
    accountIds: targetMode.value === 'accounts' ? accountIds : undefined,
  }

  try {
    result.value = await sendAdminEmails(payload)
    if (result.value.sent > 0) {
      selectedAccounts.value = []
    }
  } catch {
    useNuxtApp().$toast.error('Failed to send emails')
  } finally {
    isSending.value = false
  }
}
</script>
