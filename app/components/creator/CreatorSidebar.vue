<template>
  <aside class="flex h-full flex-col items-stretch px-4 py-4">
    <!-- Logo -->
    <div class="mb-6 flex justify-end px-2">
      <NuxtLink to="/" class="text-2xl font-bold text-primary">
        <img src="/favicon.png" alt="Logo" class="h-12 w-12" />
      </NuxtLink>
    </div>

    <!-- Publisher Selector -->
    <div v-if="managedPublishers.length > 0" class="mb-4">
      <div class="dropdown dropdown-end w-full">
        <label tabindex="0" class="btn btn-ghost w-full justify-end gap-2">
          <IconChevronDown class="w-4 h-4 shrink-0" />
          <span class="truncate text-sm text-right">
            {{ currentPublisher ? currentPublisher.nick : t('creator.selectPublisher') }}
          </span>
        </label>
        <ul
          tabindex="0"
          class="dropdown-content menu z-[1] w-full rounded-box bg-base-100 p-2 shadow"
        >
          <li v-if="currentPublisher">
            <button @click="clearSelection(); emit('navigate')">
              <IconX class="w-4 h-4" />
              {{ t('creator.clearSelection') }}
            </button>
          </li>
          <li v-for="pub in managedPublishers" :key="pub.id">
            <NuxtLink
              :to="`/creators/${pub.name}`"
              class="flex items-center gap-3"
              :class="{ 'active': currentPublisher?.id === pub.id }"
              @click="emit('navigate')"
            >
              <div class="avatar">
                <div class="w-8 rounded-full">
                  <img v-if="getFileUrl(pub.picture?.id)" :src="getFileUrl(pub.picture?.id)" :alt="pub.nick" />
                  <div v-else class="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-content text-xs font-bold">
                    {{ pub.nick?.slice(0, 2).toUpperCase() }}
                  </div>
                </div>
              </div>
              <div class="min-w-0">
                <div class="truncate text-sm font-medium">{{ pub.nick }}</div>
                <div class="truncate text-xs text-base-content/50">@{{ pub.name }}</div>
              </div>
            </NuxtLink>
          </li>
        </ul>
      </div>
    </div>

    <!-- Navigation (only when publisher selected) -->
    <nav v-if="currentPublisherName" class="flex-1 grow space-y-1">
      <NuxtLink
        v-for="item in navItems"
        :key="item.href"
        :to="item.href"
        class="group flex items-center justify-end gap-4 rounded-xl px-4 py-3 transition-colors hover:bg-base-200"
        @click="emit('navigate')"
      >
        <span class="text-sm font-medium transition-colors group-hover:text-primary">
          {{ item.label }}
        </span>
        <component :is="item.icon" class="h-5 w-5 transition-colors group-hover:text-primary" />
      </NuxtLink>
    </nav>

    <!-- Unselected state -->
    <nav v-else class="flex-1 grow space-y-1">
      <NuxtLink
        to="/creators"
        class="group flex items-center justify-end gap-4 rounded-xl px-4 py-3 transition-colors hover:bg-base-200"
        @click="emit('navigate')"
      >
        <span class="text-sm font-medium transition-colors group-hover:text-primary">
          {{ t('creator.title') }}
        </span>
        <IconLayoutDashboard class="h-5 w-5 transition-colors group-hover:text-primary" />
      </NuxtLink>
      <button
        v-if="managedPublishers.length === 0 && !isLoading"
        class="group flex w-full items-center justify-end gap-4 rounded-xl px-4 py-3 transition-colors hover:bg-base-200"
        @click="navigateTo('/creators'); emit('navigate')"
      >
        <span class="text-sm font-medium transition-colors group-hover:text-primary">
          {{ t('creator.createPublisher') }}
        </span>
        <IconPlus class="h-5 w-5 transition-colors group-hover:text-primary" />
      </button>
    </nav>

    <!-- Bottom: Back to main -->
    <div class="mt-auto flex flex-col gap-2 px-2">
      <NuxtLink
        to="/"
        class="group flex items-center justify-end gap-4 rounded-xl px-4 py-3 transition-colors hover:bg-base-200"
        @click="emit('navigate')"
      >
        <span class="text-sm font-medium transition-colors group-hover:text-primary">
          {{ t('creator.backToApp') }}
        </span>
        <IconArrowLeft class="h-5 w-5 transition-colors group-hover:text-primary" />
      </NuxtLink>
    </div>
  </aside>
</template>

<script setup lang="ts">
import {
  IconChevronDown,
  IconX,
  IconLayoutDashboard,
  IconFileText,
  IconFolder,
  IconSticker,
  IconChartBar,
  IconRss,
  IconUsers,
  IconUserPlus,
  IconSettings,
  IconPlus,
  IconArrowLeft,
  IconTrophy,
} from '#components'
import { getFileUrl } from '~/utils/files'

const emit = defineEmits<{ navigate: [] }>()
const { t } = useI18n()

const creator = useCreator()
const { managedPublishers, currentPublisher, currentPublisherName, isLoading } = creator

const pubName = computed(() => currentPublisherName.value)

const navItems = computed(() => {
  if (!pubName.value) return []
  const p = pubName.value
  return [
    { icon: IconLayoutDashboard, label: t('creator.dashboard'), href: `/creators/${p}` },
    { icon: IconFileText, label: t('creator.posts'), href: `/creators/${p}/posts` },
    { icon: IconFolder, label: t('creator.collections'), href: `/creators/${p}/collections` },
    { icon: IconSticker, label: t('creator.stickers'), href: `/creators/${p}/stickers` },
    { icon: IconChartBar, label: t('creator.polls'), href: `/creators/${p}/polls` },
    { icon: IconRss, label: t('creator.feeds'), href: `/creators/${p}/feeds` },
    { icon: IconTrophy, label: t('creator.leaderboard'), href: `/creators/${p}/leaderboard` },
    { icon: IconUsers, label: t('creator.members'), href: `/creators/${p}/members` },
    { icon: IconUserPlus, label: t('creator.subscribers'), href: `/creators/${p}/subscribers` },
    { icon: IconSettings, label: t('creator.settings'), href: `/creators/${p}/settings` },
  ]
})

onMounted(() => {
  creator.loadManagedPublishers()
})
</script>
