<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-black/50" @click="$emit('close')" />
    <div class="relative w-full max-w-md bg-base-100 rounded-xl shadow-lg overflow-hidden">
      <div class="flex items-center justify-between px-4 py-3 border-b border-base-300">
        <h2 class="font-semibold">{{ t('drive.storageDetails') }}</h2>
        <button class="btn btn-ghost btn-xs btn-circle" @click="$emit('close')">
          <IconX class="w-4 h-4" />
        </button>
      </div>

      <div class="p-4 space-y-4">
        <!-- Total usage -->
        <div class="stat bg-base-200 rounded-lg p-3">
          <div class="stat-title text-xs">{{ t('drive.totalUsage') }}</div>
          <div class="stat-value text-lg">{{ formatBytes(usage?.totalUsageBytes ?? 0) }}</div>
        </div>

        <!-- File count -->
        <div class="stat bg-base-200 rounded-lg p-3">
          <div class="stat-title text-xs">{{ t('drive.totalFiles') }}</div>
          <div class="stat-value text-lg">{{ usage?.totalFileCount ?? 0 }}</div>
        </div>

        <!-- Quota -->
        <div class="stat bg-base-200 rounded-lg p-3">
          <div class="stat-title text-xs">{{ t('drive.quota') }}</div>
          <div class="stat-value text-lg">
            {{ formatBytes((usage?.totalQuota ?? 0) * 1024 * 1024) }}
          </div>
        </div>

        <!-- Usage bar -->
        <div>
          <div class="flex justify-between text-xs mb-1">
            <span>{{ t('drive.used') }}</span>
            <span>{{ usagePercent.toFixed(1) }}%</span>
          </div>
          <div class="w-full h-3 bg-base-300 rounded-full overflow-hidden">
            <div
              class="h-full rounded-full transition-all"
              :class="progressColor"
              :style="{ width: `${usagePercent}%` }"
            />
          </div>
        </div>

        <!-- Pool usages -->
        <div v-if="usage?.poolUsages?.length" class="space-y-2">
          <h3 class="text-sm font-medium">{{ t('drive.poolUsage') }}</h3>
          <div v-for="pool in usage.poolUsages" :key="pool.poolId" class="flex items-center justify-between text-sm">
            <span class="text-base-content/70">{{ pool.poolName }}</span>
            <span class="font-medium">{{ formatBytes(pool.usageBytes) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DriveUsage } from '~/types/drive'

const { t } = useI18n()

const props = defineProps<{
  open: boolean
  usage: DriveUsage | null
}>()

defineEmits<{
  close: []
}>()

const usagePercent = computed(() => {
  const total = props.usage?.totalQuota ?? 0
  const used = props.usage?.usedQuota ?? 0
  if (total <= 0) return 0
  return (used / total) * 100
})

const progressColor = computed(() => {
  if (usagePercent.value > 90) return 'bg-error'
  if (usagePercent.value > 70) return 'bg-warning'
  return 'bg-primary'
})

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}
</script>
