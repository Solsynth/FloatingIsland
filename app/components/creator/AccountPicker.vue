<template>
  <div>
    <!-- Search -->
    <div class="form-control mb-4">
      <div class="relative">
        <IconSearch class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/30" />
        <input
          v-model="query"
          type="text"
          class="input input-bordered w-full pl-9"
          :placeholder="t('common.search')"
          @input="handleSearch"
        />
      </div>
    </div>

    <!-- Results -->
    <div v-if="loading" class="flex justify-center py-8">
      <span class="loading loading-spinner loading-sm text-primary" />
    </div>

    <div
      v-else-if="results.length === 0 && query.length > 0"
      class="flex flex-col items-center justify-center py-8 text-base-content/30"
    >
      <IconUsers class="w-8 h-8 mb-2" />
      <p class="text-sm">{{ t('creator.noResults') }}</p>
    </div>

    <div v-else class="space-y-1 max-h-72 overflow-y-auto rounded-xl">
      <button
        v-for="account in results"
        :key="account.id"
        class="flex items-center gap-3 w-full rounded-lg p-3 transition-all hover:bg-base-200/80 hover:pl-4"
        @click="emit('select', account)"
      >
        <div class="avatar">
          <div class="w-9 rounded-full">
            <img
              v-if="getFileUrl(account.profile?.picture?.id)"
              :src="getFileUrl(account.profile?.picture?.id) ?? ''"
              :alt="account.nick || 'Account'"
            />
            <div
              v-else
              class="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold"
            >
              {{ (account.nick || account.name || '?').slice(0, 2).toUpperCase() }}
            </div>
          </div>
        </div>
        <div class="min-w-0 text-left">
          <div class="text-sm font-medium truncate">{{ account.nick || account.name }}</div>
          <div class="text-xs text-base-content/40">@{{ account.name }}</div>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IconSearch, IconUsers } from '#components'
import { searchAccounts } from '~/utils/api'
import type { SnAccount } from '~/types/auth'
import { getFileUrl } from '~/utils/files'

const emit = defineEmits<{
  select: [account: { id: string }]
}>()

const { t } = useI18n()

const query = ref('')
const results = ref<SnAccount[]>([])
const loading = ref(false)
let searchTimeout: ReturnType<typeof setTimeout> | null = null

function handleSearch() {
  if (searchTimeout) clearTimeout(searchTimeout)
  if (query.value.length < 2) {
    results.value = []
    return
  }
  searchTimeout = setTimeout(async () => {
    loading.value = true
    try {
      results.value = await searchAccounts(query.value, 10)
    } catch {
      results.value = []
    } finally {
      loading.value = false
    }
  }, 300)
}
</script>
