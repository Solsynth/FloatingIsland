<template>
  <NuxtLayout name="admin">
    <AdminPageHeader title="Dashboard" description="Platform administration overview" />

    <!-- Quick Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <AdminCard v-for="stat in quickStats" :key="stat.label" class="flex items-center gap-4">
        <div class="flex h-10 w-10 items-center justify-center rounded-xl" :class="stat.bg">
          <component :is="stat.icon" class="w-5 h-5" :class="stat.color" />
        </div>
        <div>
          <div class="text-xl font-bold">{{ stat.value }}</div>
          <div class="text-xs text-base-content/40">{{ stat.label }}</div>
        </div>
      </AdminCard>
    </div>

    <!-- Grid of Sections -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <AdminCard
        v-for="section in sections"
        :key="section.href"
        class="group cursor-pointer hover:border-primary/20 transition-all"
        @click="navigateTo(section.href)"
      >
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <component :is="section.icon" class="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 class="text-sm font-semibold">{{ section.label }}</h3>
              <p class="text-xs text-base-content/40 mt-0.5">{{ section.description }}</p>
            </div>
          </div>
          <IconArrowRight class="w-4 h-4 text-base-content/20 group-hover:text-primary transition-colors" />
        </div>
      </AdminCard>
    </div>

    <!-- Cache Stats Quick View -->
    <AdminCard v-if="cacheStats" class="mt-6" no-padding>
      <div class="flex items-center gap-3 px-5 py-3 border-b border-base-300/20">
        <IconDatabase class="w-4 h-4 text-primary" />
        <span class="text-sm font-semibold">Cache Status</span>
      </div>
      <div class="grid grid-cols-3 sm:grid-cols-5 gap-4 px-5 py-4">
        <div class="text-center">
          <div class="text-lg font-bold text-success">{{ cacheStats.hitRatio ? (cacheStats.hitRatio * 100).toFixed(1) + '%' : '0%' }}</div>
          <div class="text-xs text-base-content/40">Hit Ratio</div>
        </div>
        <div class="text-center">
          <div class="text-lg font-bold">{{ cacheStats.keyspaceHits }}</div>
          <div class="text-xs text-base-content/40">Hits</div>
        </div>
        <div class="text-center">
          <div class="text-lg font-bold">{{ cacheStats.keyspaceMisses }}</div>
          <div class="text-xs text-base-content/40">Misses</div>
        </div>
        <div class="text-center">
          <div class="text-lg font-bold">{{ formatMemory(cacheStats.usedMemoryBytes) }}</div>
          <div class="text-xs text-base-content/40">Memory</div>
        </div>
        <div class="text-center">
          <div class="text-lg font-bold">{{ cacheStats.connectedClients }}</div>
          <div class="text-xs text-base-content/40">Connections</div>
        </div>
      </div>
    </AdminCard>
  </NuxtLayout>
</template>

<script setup lang="ts">
import {
  IconUsers,
  IconShieldAlert,
  IconFileText,
  IconWallet,
  IconBell,
  IconMail,
  IconActivity,
  IconDatabase,
  IconArrowRight,
} from '#components'
import type { CacheStats } from '~/types/admin'
import { fetchCacheStats } from '~/utils/admin'

definePageMeta({ middleware: 'auth' })

const cacheStats = ref<CacheStats | null>(null)

const quickStats = [
  {
    icon: IconUsers,
    label: 'Accounts',
    value: '...',
    bg: 'bg-primary/10',
    color: 'text-primary',
  },
  {
    icon: IconFileText,
    label: 'Posts',
    value: '...',
    bg: 'bg-info/10',
    color: 'text-info',
  },
  {
    icon: IconWallet,
    label: 'Transactions',
    value: '...',
    bg: 'bg-success/10',
    color: 'text-success',
  },
  {
    icon: IconBell,
    label: 'Notifications',
    value: '...',
    bg: 'bg-warning/10',
    color: 'text-warning',
  },
]

const sections = [
  {
    icon: IconUsers,
    label: 'Accounts',
    href: '/admin/accounts',
    description: 'Manage platform accounts, sessions, and punishments',
  },
  {
    icon: IconShieldAlert,
    label: 'Punishments',
    href: '/admin/punishments',
    description: 'View and manage account punishments',
  },
  {
    icon: IconFileText,
    label: 'Posts',
    href: '/admin/posts',
    description: 'Review and moderate posts across the platform',
  },
  {
    icon: IconWallet,
    label: 'Wallet',
    href: '/admin/wallet',
    description: 'Manage transactions, orders, and subscriptions',
  },
  {
    icon: IconBell,
    label: 'Notifications',
    href: '/admin/notifications',
    description: 'Send push notifications to accounts',
  },
  {
    icon: IconMail,
    label: 'Emails',
    href: '/admin/emails',
    description: 'Send emails to accounts',
  },
  {
    icon: IconActivity,
    label: 'Presence Scan',
    href: '/admin/presence',
    description: 'Scan Steam presence for accounts',
  },
  {
    icon: IconDatabase,
    label: 'Cache',
    href: '/admin/cache',
    description: 'Inspect and manage platform cache',
  },
]

function formatMemory(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  const units = ['KB', 'MB', 'GB', 'TB']
  let i = -1
  let size = bytes
  do { size /= 1024; i++ } while (size >= 1024 && i < units.length - 1)
  return size.toFixed(1) + ' ' + units[i]
}

onMounted(async () => {
  try {
    cacheStats.value = await fetchCacheStats()
  } catch {
    cacheStats.value = null
  }
})
</script>
