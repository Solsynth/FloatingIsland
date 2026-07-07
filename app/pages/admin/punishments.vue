<template>
  <NuxtLayout name="admin">
    <AdminPageHeader title="Punishments" description="View and manage account punishments">
      <template #actions>
        <button class="btn btn-sm btn-primary" @click="loadPunishments">
          <IconRefreshCw class="w-4 h-4" />
          Refresh
        </button>
      </template>
    </AdminPageHeader>

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
  </NuxtLayout>
</template>

<script setup lang="ts">
import { IconRefreshCw, IconShieldCheck } from '#components'
import { fetchPunishmentsCreated } from '~/utils/admin'
import type { SnAccountPunishment } from '~/types/auth'

definePageMeta({ middleware: 'auth' })

const punishments = ref<SnAccountPunishment[]>([])
const isLoading = ref(false)

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

onMounted(() => {
  loadPunishments()
})
</script>
