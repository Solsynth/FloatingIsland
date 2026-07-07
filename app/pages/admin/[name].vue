<template>
  <NuxtLayout name="admin">
    <!-- Loading -->
    <div v-if="isLoadingDetail" class="flex justify-center py-16">
      <span class="loading loading-spinner loading-lg" />
    </div>

    <template v-else-if="detail">
      <!-- Page Header -->
      <div class="flex items-center gap-3 mb-6">
        <NuxtLink to="/admin" class="btn btn-circle btn-ghost btn-sm">
          <IconArrowLeft class="w-4 h-4" />
        </NuxtLink>
        <div class="avatar">
          <div class="w-10 rounded-full">
            <img
              v-if="getFileUrl(detail.account.profile?.picture?.id)"
              :src="getFileUrl(detail.account.profile?.picture?.id)"
              :alt="detail.account.nick"
            />
            <div
              v-else
              class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold"
            >
              {{ (detail.account.nick || detail.account.name).slice(0, 2).toUpperCase() }}
            </div>
          </div>
        </div>
        <div class="min-w-0 flex-1">
          <h1 class="text-xl font-bold tracking-tight">
            {{ detail.account.nick || detail.account.name }}
          </h1>
          <p class="text-sm text-base-content/50">
            @{{ detail.account.name }}
          </p>
        </div>
        <!-- Status Badge -->
        <div v-if="detail.status" class="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-base-200/80">
          <span
            class="inline-block w-2 h-2 rounded-full"
            :class="detail.status.isOnline ? 'bg-success' : 'bg-base-300'"
          />
          <span class="text-xs font-medium text-base-content/60">
            {{ detail.status.label }}
          </span>
        </div>
      </div>

      <!-- Warning Banner (Active Punishment) -->
      <div v-if="detail.activePunishment" class="rounded-xl bg-error/5 border border-error/20 p-4 mb-6">
        <div class="flex items-start gap-3">
          <IconShieldAlert class="w-5 h-5 text-error shrink-0 mt-0.5" />
          <div class="min-w-0">
            <p class="text-sm font-semibold text-error">Active Punishment</p>
            <p class="text-xs text-base-content/60 mt-0.5">
              {{ detail.activePunishment.reason || 'No reason provided' }}
            </p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column: Details -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Account Info -->
          <AdminCard title="Account Information">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-xs text-base-content/40 uppercase tracking-wider">Account ID</span>
                <p class="font-mono text-xs mt-1 break-all text-base-content/70">{{ detail.account.id }}</p>
              </div>
              <div>
                <span class="text-xs text-base-content/40 uppercase tracking-wider">Username</span>
                <p class="mt-1 text-base-content/70">@{{ detail.account.name }}</p>
              </div>
              <div v-if="detail.account.profile?.socialCredits !== undefined">
                <span class="text-xs text-base-content/40 uppercase tracking-wider">Social Credits</span>
                <p class="mt-1 text-base-content/70">{{ detail.account.profile?.socialCredits }}</p>
              </div>
              <div v-if="detail.account.createdAt">
                <span class="text-xs text-base-content/40 uppercase tracking-wider">Created</span>
                <p class="mt-1 text-base-content/70">{{ formatDate(detail.account.createdAt) }}</p>
              </div>
            </div>
          </AdminCard>

          <!-- Contacts -->
          <AdminCard v-if="detail.contacts?.length" title="Contact Methods">
            <div class="space-y-2">
              <div
                v-for="(contact, ci) in detail.contacts"
                :key="ci"
                class="flex items-center gap-3 p-2 rounded-lg bg-base-200/50"
              >
                <span class="text-xs px-2 py-0.5 rounded-full bg-base-300/60 text-base-content/50 uppercase tracking-wider">
                  {{ contactTypeLabel(contact.type) }}
                </span>
                <span class="text-sm flex-1 truncate">{{ contact.content }}</span>
                <span v-if="contact.isPrimary" class="badge badge-primary badge-xs">Primary</span>
              </div>
            </div>
          </AdminCard>

          <!-- Auth Factors -->
          <AdminCard v-if="detail.authFactors?.length" title="Authentication Factors">
            <div class="space-y-2">
              <div
                v-for="factor in detail.authFactors"
                :key="factor.id"
                class="flex items-center gap-3 p-2 rounded-lg bg-base-200/50"
              >
                <IconKeyRound class="w-4 h-4 text-base-content/40" />
                <span class="text-sm flex-1">{{ factorTypeLabel(factor.type) }}</span>
                <span
                  v-if="factor.hasSecret !== undefined"
                  class="text-xs px-2 py-0.5 rounded-full"
                  :class="factor.hasSecret ? 'bg-success/10 text-success' : 'bg-base-300/60 text-base-content/40'"
                >
                  {{ factor.hasSecret ? 'Configured' : 'Pending' }}
                </span>
              </div>
            </div>
          </AdminCard>

          <!-- Active Punishments -->
          <AdminCard v-if="detail.activePunishments.length" title="Active Punishments">
            <div class="space-y-2">
              <div
                v-for="punishment in detail.activePunishments"
                :key="punishment.id"
                class="flex items-start gap-3 p-3 rounded-lg bg-error/5 border border-error/10"
              >
                <IconBan class="w-4 h-4 text-error shrink-0 mt-0.5" />
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-medium">{{ punishmentTypeLabel(punishment.type) }}</span>
                    <button
                      class="btn btn-ghost btn-xs text-error"
                      @click="handleDeletePunishment(punishment.id)"
                    >
                      <IconTrash2 class="w-3 h-3" />
                    </button>
                  </div>
                  <p class="text-xs text-base-content/50 mt-0.5">{{ punishment.reason || 'No reason' }}</p>
                </div>
              </div>
            </div>
          </AdminCard>

          <!-- Activities -->
          <AdminCard v-if="detail.activities?.length" title="Presence Activities">
            <div class="space-y-2">
              <div
                v-for="(activity, ai) in detail.activities"
                :key="ai"
                class="flex items-center gap-3 p-2 rounded-lg bg-base-200/50"
              >
                <IconGamepad2 class="w-4 h-4 text-base-content/40" />
                <span class="text-sm flex-1">{{ activity.title }}</span>
                <span class="text-xs text-base-content/40 capitalize">{{ activity.provider }}</span>
              </div>
            </div>
          </AdminCard>
        </div>

        <!-- Right Column: Quick Actions -->
        <div class="space-y-6">
          <!-- Security Stats -->
          <AdminCard title="Security Overview">
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-sm text-base-content/60">Active Sessions</span>
                <span class="text-sm font-semibold">{{ detail.activeSessionCount }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-base-content/60">Active Devices</span>
                <span class="text-sm font-semibold">{{ detail.activeDeviceCount }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-base-content/60">Auth Factors</span>
                <span class="text-sm font-semibold">{{ detail.authFactors?.length || 0 }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-base-content/60">Badges</span>
                <span class="text-sm font-semibold">{{ detail.badgeCount || 0 }}</span>
              </div>
            </div>
          </AdminCard>

          <!-- Quick Actions -->
          <AdminCard title="Quick Actions" compact>
            <div class="space-y-2">
              <button
                class="btn btn-outline btn-sm w-full justify-start"
                @click="handleRevokeSessions"
              >
                <IconLogOut class="w-4 h-4" />
                Revoke All Sessions
              </button>
              <button
                class="btn btn-warning btn-sm w-full justify-start"
                @click="suspendOpen = true"
              >
                <IconShieldAlert class="w-4 h-4" />
                Suspend Account
              </button>
              <button
                class="btn btn-error btn-sm w-full justify-start"
                @click="deleteOpen = true"
              >
                <IconTrash2 class="w-4 h-4" />
                Delete Account
              </button>
            </div>
          </AdminCard>
        </div>
      </div>

      <!-- Suspend Drawer -->
      <AdminDrawer :open="suspendOpen" title="Suspend Account" @update:open="suspendOpen = $event">
        <form class="space-y-4" @submit.prevent="handleSuspend">
          <div>
            <label class="label label-text text-sm font-medium">Punishment Type</label>
            <select v-model="suspendForm.type" class="select select-bordered w-full">
              <option value="block_login">Block Login</option>
              <option value="disable_account">Disable Account</option>
            </select>
          </div>
          <div>
            <label class="label label-text text-sm font-medium">Reason</label>
            <textarea
              v-model="suspendForm.reason"
              class="textarea textarea-bordered w-full text-sm"
              rows="3"
              placeholder="Reason for suspension..."
            />
          </div>
          <div>
            <label class="label label-text text-sm font-medium">Expires At</label>
            <input
              v-model="suspendForm.expiredAt"
              type="datetime-local"
              class="input input-bordered w-full text-sm"
            />
            <p class="text-xs text-base-content/40 mt-1">Leave empty for permanent</p>
          </div>
          <label class="flex items-center gap-2 cursor-pointer">
            <input v-model="suspendForm.revokeSessions" type="checkbox" class="checkbox checkbox-sm" />
            <span class="text-sm">Revoke all active sessions immediately</span>
          </label>
          <button
            type="submit"
            class="btn btn-warning w-full"
            :disabled="!suspendForm.reason || isSuspending"
          >
            <span v-if="isSuspending" class="loading loading-spinner loading-xs" />
            <span v-else>Suspend Account</span>
          </button>
        </form>
      </AdminDrawer>

      <!-- Delete Confirmation Dialog -->
      <AdminDrawer :open="deleteOpen" title="Delete Account" @update:open="deleteOpen = $event">
        <div class="space-y-4">
          <div class="rounded-xl bg-error/5 border border-error/20 p-4">
            <div class="flex items-start gap-3">
              <IconAlertTriangle class="w-5 h-5 text-error shrink-0 mt-0.5" />
              <div>
                <p class="text-sm font-semibold text-error">This action is irreversible</p>
                <p class="text-xs text-base-content/60 mt-1">
                  Deleting <strong>@{{ detail.account.name }}</strong> will permanently remove all account data.
                </p>
              </div>
            </div>
          </div>
          <div class="flex gap-2">
            <button class="btn btn-ghost flex-1" @click="deleteOpen = false">Cancel</button>
            <button
              class="btn btn-error flex-1"
              :disabled="isDeleting"
              @click="handleDelete"
            >
              <span v-if="isDeleting" class="loading loading-spinner loading-xs" />
              <span v-else>Delete Permanently</span>
            </button>
          </div>
        </div>
      </AdminDrawer>
    </template>

    <!-- Not Found -->
    <div v-else class="flex flex-col items-center py-16 text-center">
      <IconUserX class="w-12 h-12 text-base-content/20 mb-4" />
      <p class="text-base-content/50 mb-1">Account not found</p>
      <NuxtLink to="/admin" class="btn btn-sm btn-ghost mt-2">
        Back to accounts
      </NuxtLink>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import {
  IconArrowLeft,
  IconShieldAlert,
  IconKeyRound,
  IconBan,
  IconTrash2,
  IconLogOut,
  IconGamepad2,
  IconAlertTriangle,
  IconUserX,
} from '#components'
import { getFileUrl } from '~/utils/files'
import {
  revokeAccountSessions,
  suspendAccount,
  deleteAdminAccount,
  deletePunishment,
} from '~/utils/admin'
import type { PunishmentType } from '~/types/admin'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const { currentAccount: detail, isLoadingDetail, loadAccountDetail, clearCurrentAccount } = useAdmin()

const identifier = computed(() => route.params.name as string)

// Suspend state
const suspendOpen = ref(false)
const isSuspending = ref(false)
const suspendForm = ref({
  type: 'block_login' as PunishmentType,
  reason: '',
  expiredAt: '',
  revokeSessions: true,
})

// Delete state
const deleteOpen = ref(false)
const isDeleting = ref(false)

function contactTypeLabel(type: number): string {
  const labels: Record<number, string> = { 0: 'Email', 1: 'Phone', 2: 'Other' }
  return labels[type] || 'Unknown'
}

function factorTypeLabel(type: number): string {
  const labels: Record<number, string> = {
    0: 'Password',
    1: 'Email',
    2: 'In-App',
    3: 'TOTP',
    4: 'PIN',
    5: 'Recovery Code',
    6: 'Physical Passport',
    7: 'Passkey',
  }
  return labels[type] || 'Unknown'
}

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

async function handleRevokeSessions() {
  try {
    await revokeAccountSessions(identifier.value)
    toast.success('All sessions revoked')
    await loadAccountDetail(identifier.value)
  } catch {
    toast.error('Failed to revoke sessions')
  }
}

async function handleSuspend() {
  isSuspending.value = true
  try {
    await suspendAccount(identifier.value, {
      reason: suspendForm.value.reason,
      type: suspendForm.value.type,
      expiredAt: suspendForm.value.expiredAt || undefined,
      revokeSessions: suspendForm.value.revokeSessions,
    })
    suspendOpen.value = false
    toast.success('Account suspended')
    await loadAccountDetail(identifier.value)
  } catch {
    toast.error('Failed to suspend account')
  } finally {
    isSuspending.value = false
  }
}

async function handleDelete() {
  isDeleting.value = true
  try {
    await deleteAdminAccount(identifier.value)
    toast.success('Account deleted')
    navigateTo('/admin')
  } catch {
    toast.error('Failed to delete account')
    isDeleting.value = false
  }
}

async function handleDeletePunishment(punishmentId: string) {
  try {
    await deletePunishment(identifier.value, punishmentId)
    toast.success('Punishment removed')
    await loadAccountDetail(identifier.value)
  } catch {
    toast.error('Failed to remove punishment')
  }
}

onMounted(() => {
  loadAccountDetail(identifier.value)
})

onUnmounted(() => {
  clearCurrentAccount()
})
</script>
