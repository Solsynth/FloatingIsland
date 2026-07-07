<template>
  <NuxtLayout name="admin">
    <AdminPageHeader title="Punishments" description="View and manage account punishments">
      <template #actions>
        <button class="btn btn-sm btn-primary" @click="showCreateForm = !showCreateForm">
          <IconPlus class="w-4 h-4" />
          New Punishment
        </button>
      </template>
    </AdminPageHeader>

    <!-- Create Form -->
    <AdminCard v-if="showCreateForm" class="mb-6" title="Create Punishment">
      <form class="space-y-4" @submit.prevent="handleCreatePunishment">
        <!-- Target Account -->
        <div>
          <label class="label label-text text-sm font-medium">Target Account</label>
          <div v-if="selectedAccount" class="flex items-center gap-2 mb-2">
            <span class="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-primary/10 text-primary">
              {{ selectedAccount.nick || selectedAccount.name }}
              <button type="button" class="hover:text-error" @click="selectedAccount = null">
                <IconX class="w-3 h-3" />
              </button>
            </span>
          </div>
          <button
            v-if="!selectedAccount"
            type="button"
            class="btn btn-sm btn-outline w-full"
            @click="openAccountPicker"
          >
            <IconUser class="w-4 h-4" />
            Select Account
          </button>
        </div>

        <!-- Type -->
        <div>
          <label class="label label-text text-sm font-medium">Punishment Type</label>
          <select v-model="createForm.type" class="select select-sm w-full bg-base-200/60 border-0 rounded-xl">
            <option :value="0">Block Login</option>
            <option :value="1">Disable Account</option>
            <option :value="2">Mute</option>
            <option :value="3">Restrict Features</option>
          </select>
        </div>

        <!-- Reason -->
        <div>
          <label class="label label-text text-sm font-medium">Reason</label>
          <textarea
            v-model="createForm.reason"
            class="textarea textarea-sm w-full bg-base-200/60 border-0 rounded-xl"
            rows="3"
            placeholder="Reason for punishment..."
            required
          />
        </div>

        <!-- Expires -->
        <div>
          <label class="label label-text text-sm font-medium">Expires At</label>
          <input v-model="createForm.expiredAt" type="datetime-local" class="input input-sm w-full bg-base-200/60 border-0 rounded-xl" />
          <p class="text-xs text-base-content/40 mt-1">Leave empty for permanent</p>
        </div>

        <!-- Options -->
        <label class="flex items-center gap-2 cursor-pointer">
          <input v-model="createForm.revokeSessions" type="checkbox" class="checkbox checkbox-sm" />
          <span class="text-sm">Revoke all sessions immediately</span>
        </label>

        <div class="flex gap-2">
          <button type="button" class="btn btn-ghost btn-sm flex-1" @click="showCreateForm = false">
            Cancel
          </button>
          <button
            type="submit"
            class="btn btn-warning btn-sm flex-1"
            :disabled="isCreating || !selectedAccount || !createForm.reason"
          >
            <span v-if="isCreating" class="loading loading-spinner loading-xs" />
            <span v-else>Create Punishment</span>
          </button>
        </div>

        <!-- Result -->
        <div v-if="createResult" class="rounded-xl bg-success/5 border border-success/20 p-3">
          <p class="text-sm text-success font-medium">Punishment created successfully</p>
        </div>
      </form>
    </AdminCard>

    <!-- Loading -->
    <div v-if="isLoading" class="flex justify-center py-16">
      <span class="loading loading-spinner loading-lg" />
    </div>

    <!-- Punishments List -->
    <AdminCard v-else no-padding>
      <div class="overflow-x-auto">
        <table class="table table-sm">
          <thead>
            <tr class="text-xs text-base-content/50 uppercase tracking-wider">
              <th class="pl-5">ID</th>
              <th>Type</th>
              <th>Reason</th>
              <th>Issued At</th>
              <th>Expires</th>
              <th class="pr-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="punishment in punishments"
              :key="punishment.id"
              class="hover:bg-base-200/50 transition-colors"
            >
              <td class="pl-5">
                <span class="font-mono text-xs text-base-content/40">{{ punishment.id.slice(0, 8) }}</span>
              </td>
              <td>
                <span class="badge badge-warning badge-sm">{{ punishmentTypeLabel(punishment.type) }}</span>
              </td>
              <td>
                <span class="text-sm text-base-content/60 truncate max-w-[20rem] block">
                  {{ punishment.reason || '—' }}
                </span>
              </td>
              <td>
                <span class="text-sm text-base-content/50">{{ formatDate(punishment.createdAt) }}</span>
              </td>
              <td>
                <span v-if="punishment.expiresAt" class="text-sm text-base-content/50">
                  {{ formatDate(punishment.expiresAt!) }}
                </span>
                <span v-else class="text-xs text-error font-medium">Permanent</span>
              </td>
              <td class="pr-5 text-right">
                <span v-if="punishment.issuedBy" class="text-xs text-base-content/40">
                  {{ punishment.issuedBy }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div v-if="punishments.length === 0" class="flex flex-col items-center py-16 text-center">
        <IconShieldCheck class="w-12 h-12 text-base-content/20 mb-4" />
        <p class="text-base-content/50 mb-1">No punishments recorded</p>
        <p class="text-xs text-base-content/30">The moderation history will appear here</p>
      </div>
    </AdminCard>

    <AccountPickerDrawer
      :open="pickerOpen"
      :allow-multiple="false"
      title="Select Account to Punish"
      placeholder="Search by name or nick..."
      @select="picker.handleSelect"
      @update:open="pickerOpen = $event"
    />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { IconRefreshCw, IconShieldCheck, IconPlus, IconX, IconUser } from '#components'
import { fetchPunishmentsCreated, createPunishment } from '~/utils/admin'
import { useAccountPicker } from '~/composables/useAccountPicker'
import AccountPickerDrawer from '~/components/shared/AccountPickerDrawer.vue'
import type { SnAccountPunishment } from '~/types/auth'
import type { SnAccount } from '~/types/auth'

definePageMeta({ middleware: 'auth' })

const punishments = ref<SnAccountPunishment[]>([])
const isLoading = ref(false)
const showCreateForm = ref(false)
const isCreating = ref(false)
const createResult = ref(false)
const selectedAccount = ref<SnAccount | null>(null)

const picker = useAccountPicker()
const pickerOpen = computed({
  get: () => picker.isOpen.value,
  set: (val: boolean) => { picker.isOpen.value = val },
})

const createForm = ref({
  type: 0,
  reason: '',
  expiredAt: '',
  revokeSessions: true,
})

function punishmentTypeLabel(type: number): string {
  const labels: Record<number, string> = {
    0: 'Block Login',
    1: 'Disable Account',
    2: 'Mute',
    3: 'Restrict Features',
  }
  return labels[type] || 'Unknown'
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

async function loadPunishments() {
  isLoading.value = true
  try {
    punishments.value = await fetchPunishmentsCreated()
  } catch {
    punishments.value = []
  } finally {
    isLoading.value = false
  }
}

async function openAccountPicker() {
  const account = await picker.open({ allowMultiple: false, title: 'Select Account to Punish' })
  if (account && !Array.isArray(account)) {
    selectedAccount.value = account
  }
}

async function handleCreatePunishment() {
  if (!selectedAccount.value) return
  isCreating.value = true
  createResult.value = false
  try {
    await createPunishment(selectedAccount.value.name, {
      type: createForm.value.type,
      reason: createForm.value.reason,
      expired_at: createForm.value.expiredAt || undefined,
      revoke_sessions: createForm.value.revokeSessions,
    })
    createResult.value = true
    showCreateForm.value = false
    selectedAccount.value = null
    createForm.value = { type: 0, reason: '', expiredAt: '', revokeSessions: true }
    await loadPunishments()
  } finally {
    isCreating.value = false
  }
}

onMounted(() => {
  loadPunishments()
})
</script>
