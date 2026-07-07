<template>
  <NuxtLayout name="admin">
    <AdminPageHeader title="Emails" description="Send HTML emails to accounts" />

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Form -->
      <div class="lg:col-span-2 space-y-6">
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

            <!-- Compose Mode Toggle -->
            <div>
              <label class="label label-text text-sm font-medium">Compose Mode</label>
              <div class="flex gap-2 rounded-xl bg-base-200/70 p-1">
                <button
                  type="button"
                  class="flex-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all"
                  :class="composeMode === 'template' ? 'bg-base-100 text-primary shadow-sm' : 'text-base-content/50'"
                  @click="setComposeMode('template')"
                >
                  <IconLayoutTemplate class="w-3.5 h-3.5 inline-block mr-1 -mt-0.5" />
                  Template
                </button>
                <button
                  type="button"
                  class="flex-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all"
                  :class="composeMode === 'custom' ? 'bg-base-100 text-primary shadow-sm' : 'text-base-content/50'"
                  @click="setComposeMode('custom')"
                >
                  <IconCode class="w-3.5 h-3.5 inline-block mr-1 -mt-0.5" />
                  Custom HTML
                </button>
              </div>
            </div>

            <!-- Template Mode -->
            <template v-if="composeMode === 'template'">
              <div>
                <label class="label label-text text-sm font-medium">Email Template</label>
                <select
                  v-model="templateState.name"
                  class="select select-sm w-full bg-base-200/60 border-0 rounded-xl"
                  @change="onTemplateChange"
                >
                  <option value="" disabled>Select a template...</option>
                  <option v-for="t in availableTemplates" :key="t.name" :value="t.name">
                    {{ t.name }}
                  </option>
                </select>
                <p v-if="!availableTemplates.length" class="text-xs text-base-content/40 mt-1">
                  Loading templates...
                </p>
              </div>

              <div v-if="templateState.name">
                <label class="label label-text text-sm font-medium">Template Props (JSON)</label>
                <textarea
                  v-model="templateState.propsJson"
                  class="textarea textarea-sm w-full text-sm font-mono bg-base-200/60 border-0 rounded-xl"
                  rows="6"
                  placeholder='{ "userName": "John", "confirmationUrl": "https://..." }'
                />
                <p v-if="templatePropsError" class="text-xs text-error mt-1">
                  {{ templatePropsError }}
                </p>
                <p v-else class="text-xs text-base-content/40 mt-1">
                  Available props depend on the selected template
                </p>
              </div>

              <button
                type="button"
                class="btn btn-sm btn-ghost w-full"
                :disabled="!templateState.name || parsedTemplateProps === null"
                @click="handlePreview"
              >
                <IconEye class="w-4 h-4" />
                Preview in New Tab
              </button>
            </template>

            <!-- Custom HTML Mode -->
            <template v-if="composeMode === 'custom'">
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
            </template>

            <!-- Subject -->
            <div>
              <label class="label label-text text-sm font-medium">Subject</label>
              <input
                v-model="form.subject"
                type="text"
                class="input input-sm w-full bg-base-200/60 border-0 rounded-xl"
                placeholder="Email subject"
              />
            </div>

            <button
              type="submit"
              class="btn btn-primary w-full"
              :disabled="!canSend"
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

      <!-- Sidebar -->
      <div class="space-y-6">
        <AdminCard title="About Email Delivery">
          <div class="space-y-2 text-sm text-base-content/60">
            <p>Send custom HTML emails to specific accounts or broadcast to all users.</p>
            <ul class="list-disc list-inside text-xs space-y-1 ml-2">
              <li>Emails are delivered to the account's verified email contacts</li>
              <li>Accounts without verified email contacts will be skipped</li>
              <li>Use templates for consistent branding or write custom HTML</li>
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
import { IconUsers, IconX, IconEye, IconCode, IconLayoutTemplate } from '#components'
import { sendAdminEmails } from '~/utils/admin'
import { useAccountPicker } from '~/composables/useAccountPicker'
import AccountPickerDrawer from '~/components/shared/AccountPickerDrawer.vue'
import type { BulkDeliveryResult, EmailPayload } from '~/types/admin'
import type { SnAccount } from '~/types/auth'

definePageMeta({ middleware: 'auth' })

// State
const isSending = ref(false)
const targetMode = ref<'accounts' | 'broadcast'>('accounts')
const composeMode = ref<'template' | 'custom'>('template')
const result = ref<BulkDeliveryResult | null>(null)
const selectedAccounts = ref<SnAccount[]>([])
const availableTemplates = ref<{ name: string; path: string }[]>([])
const templatePropsError = ref('')

const picker = useAccountPicker()
const pickerOpen = computed({
  get: () => picker.isOpen.value,
  set: (val: boolean) => { picker.isOpen.value = val },
})

const form = ref({
  subject: '',
  htmlBody: '',
})

const templateState = ref({
  name: '',
  propsJson: '{}',
})

// Load available templates on mount
onMounted(async () => {
  try {
    const res = await $fetch<{ templates: { name: string; path: string }[] }>('/api/email-templates')
    availableTemplates.value = res.templates
  } catch {
    // Silently fail — user can still use custom HTML
  }
})

// Computed
const parsedTemplateProps = computed(() => {
  try {
    const parsed = JSON.parse(templateState.value.propsJson)
    templatePropsError.value = ''
    return parsed
  } catch (e) {
    templatePropsError.value = `Invalid JSON: ${(e as Error).message}`
    return null
  }
})

const canSend = computed(() => {
  if (!form.value.subject) return false
  if (isSending.value) return false

  if (composeMode.value === 'template') {
    if (!templateState.value.name) return false
    if (parsedTemplateProps.value === null) return false
    return true
  }

  return !!form.value.htmlBody
})

// Methods
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

function setComposeMode(mode: 'template' | 'custom') {
  composeMode.value = mode
}

function onTemplateChange() {
  // Template changed, preview link will use new template
}

function handlePreview() {
  if (!templateState.value.name || parsedTemplateProps.value === null) return

  const params = new URLSearchParams({
    name: templateState.value.name,
    ...Object.fromEntries(
      Object.entries(parsedTemplateProps.value).map(([k, v]) => [k, typeof v === 'object' ? JSON.stringify(v) : String(v)]),
    ),
  })

  window.open(`/api/emails/debug?${params.toString()}`, '_blank')
}

async function handleSendEmail() {
  isSending.value = true
  result.value = null

  const accountIds = targetMode.value === 'accounts'
    ? selectedAccounts.value.map(a => a.id)
    : undefined

  let htmlBody = form.value.htmlBody

  // If in template mode, render the template first
  if (composeMode.value === 'template' && templateState.value.name) {
    try {
      const res = await $fetch<{ html: string }>('/api/email-templates/render', {
        method: 'POST',
        body: {
          name: templateState.value.name,
          props: parsedTemplateProps.value ?? {},
          pretty: false,
        },
      })
      htmlBody = res.html
    } catch {
      useNuxtApp().$toast.error('Failed to render email template')
      isSending.value = false
      return
    }
  }

  const payload: EmailPayload = {
    subject: form.value.subject,
    htmlBody,
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
