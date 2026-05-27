<template>
  <aside class="flex h-full flex-col items-stretch px-4 py-4">
    <!-- Logo -->
    <div class="mb-6 flex justify-end px-2">
      <NuxtLink to="/" class="text-2xl font-bold text-primary">
        <img src="/favicon.png" alt="Logo" class="h-12 w-12" />
      </NuxtLink>
    </div>

    <!-- Developer Selector -->
    <div v-if="developers.length > 0" class="mb-4">
      <div class="dropdown dropdown-end w-full">
        <label tabindex="0" class="btn btn-ghost w-full justify-end gap-2">
          <IconChevronDown class="w-4 h-4 shrink-0" />
          <span class="truncate text-sm text-right">
            {{ currentDeveloper ? currentDeveloper.publisher?.nick : t('developer.selectDeveloper') }}
          </span>
        </label>
        <ul
          tabindex="0"
          class="dropdown-content menu z-[1] w-full rounded-box bg-base-100 p-2 shadow"
        >
          <li v-if="currentDeveloper">
            <button @click="clearSelection(); emit('navigate')">
              <IconX class="w-4 h-4" />
              {{ t('developer.clearSelection') }}
            </button>
          </li>
          <li v-for="dev in developers" :key="dev.id">
            <NuxtLink
              :to="`/developers/${dev.publisher?.name}`"
              class="flex items-center gap-3"
              :class="{ 'active': currentDeveloper?.id === dev.id }"
              @click="emit('navigate')"
            >
              <div class="avatar">
                <div class="w-8 rounded-full">
                  <img v-if="getFileUrl(dev.publisher?.picture?.id)" :src="getFileUrl(dev.publisher?.picture?.id)" :alt="dev.publisher?.nick" />
                  <div v-else class="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-content text-xs font-bold">
                    {{ dev.publisher?.nick?.slice(0, 2).toUpperCase() }}
                  </div>
                </div>
              </div>
              <div class="min-w-0">
                <div class="truncate text-sm font-medium">{{ dev.publisher?.nick }}</div>
                <div class="truncate text-xs text-base-content/50">@{{ dev.publisher?.name }}</div>
              </div>
            </NuxtLink>
          </li>
        </ul>
      </div>
    </div>

    <!-- Navigation (only when developer selected) -->
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
        to="/developers"
        class="group flex items-center justify-end gap-4 rounded-xl px-4 py-3 transition-colors hover:bg-base-200"
        @click="emit('navigate')"
      >
        <span class="text-sm font-medium transition-colors group-hover:text-primary">
          {{ t('developer.title') }}
        </span>
        <IconLayoutDashboard class="h-5 w-5 transition-colors group-hover:text-primary" />
      </NuxtLink>
      <button
        v-if="developers.length === 0 && !isLoading"
        class="group flex w-full items-center justify-end gap-4 rounded-xl px-4 py-3 transition-colors hover:bg-base-200"
        @click="navigateTo('/developers'); emit('navigate')"
      >
        <span class="text-sm font-medium transition-colors group-hover:text-primary">
          {{ t('developer.enrollDeveloper') }}
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
          {{ t('developer.backToApp') }}
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
  IconFolder,
  IconSettings,
  IconPlus,
  IconArrowLeft,
} from '#components'
import { getFileUrl } from '~/utils/files'

const emit = defineEmits<{ navigate: [] }>()
const { t } = useI18n()

const developer = useDeveloper()
const { developers, currentDeveloper, currentPublisherName, isLoading } = developer

const pubName = computed(() => currentPublisherName.value)

const navItems = computed(() => {
  if (!pubName.value) return []
  const p = pubName.value
  return [
    { icon: IconLayoutDashboard, label: t('developer.dashboard'), href: `/developers/${p}` },
    { icon: IconFolder, label: t('developer.projects.title'), href: `/developers/${p}/projects` },
    { icon: IconSettings, label: t('developer.settings'), href: `/developers/${p}/settings` },
  ]
})

onMounted(() => {
  developer.loadDevelopers()
})
</script>
