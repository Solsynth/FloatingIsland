<template>
  <NuxtLayout name="admin">
    <AdminPageHeader title="Presence Scan" description="Run admin presence scan operations">
      <template #actions>
        <button class="btn btn-sm btn-primary" @click="scanOpen = true">
          <IconScan class="w-4 h-4" />
          Run Scan
        </button>
      </template>
    </AdminPageHeader>

    <!-- Scan Drawer -->
    <AdminDrawer :open="scanOpen" title="Run Presence Scan" @update:open="scanOpen = $event">
      <form class="space-y-4" @submit.prevent="handleScan">
        <div>
          <label class="label label-text text-sm font-medium">Scan Type</label>
          <select v-model="scanForm.type" class="select select-bordered w-full">
            <option value="steam">Steam Presence Scan</option>
            <option value="credits">Invalidate Social Credit Cache</option>
          </select>
        </div>

        <div v-if="scanForm.type === 'steam'">
          <label class="label label-text text-sm font-medium">Target (optional)</label>
          <input
            v-model="scanForm.identifier"
            type="text"
            class="input input-bordered w-full text-sm"
            placeholder="Account name, GUID, or Steam ID"
          />
          <p class="text-xs text-base-content/40 mt-1">Leave empty to scan all accounts</p>
        </div>

        <button
          type="submit"
          class="btn btn-primary w-full"
          :disabled="isScanning"
        >
          <span v-if="isScanning" class="loading loading-spinner loading-xs" />
          <span v-else>Start Scan</span>
        </button>

        <!-- Result -->
        <div v-if="scanResult" class="rounded-xl bg-success/5 border border-success/20 p-3">
          <p class="text-sm text-success font-medium">Scan completed</p>
          <p class="text-xs text-base-content/60 mt-1">{{ scanResult }}</p>
        </div>
      </form>
    </AdminDrawer>

    <!-- Info Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <AdminCard title="Steam Presence Scan">
        <p class="text-sm text-base-content/60">
          Scan and update Steam presence data for accounts. This refreshes the game activity
          shown on user profiles.
        </p>
      </AdminCard>
      <AdminCard title="Social Credit Cache">
        <p class="text-sm text-base-content/60">
          Invalidate the social credit cache to force recalculation. Useful after
          moderation actions that affect credit scores.
        </p>
      </AdminCard>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { IconScan } from '#components'
import { scanSteamPresence, invalidateSocialCredits } from '~/utils/admin'

definePageMeta({ middleware: 'auth' })

const scanOpen = ref(false)
const isScanning = ref(false)
const scanResult = ref<string | null>(null)

const scanForm = ref({
  type: 'steam',
  identifier: '',
})

async function handleScan() {
  isScanning.value = true
  scanResult.value = null

  try {
    const id = scanForm.value.identifier
    if (scanForm.value.type === 'steam') {
      const steamId = id.length <= 20 && !id.includes('-') ? id : undefined
      const identifier = steamId ? undefined : (id || undefined)
      await scanSteamPresence(identifier, steamId)
    } else {
      await invalidateSocialCredits(id)
    }
    scanResult.value = 'Operation completed successfully'
  } catch {
    toast.error('Scan failed')
  } finally {
    isScanning.value = false
  }
}
</script>
