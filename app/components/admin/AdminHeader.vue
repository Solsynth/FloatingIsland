<template>
  <header class="sticky top-0 z-30 bg-base-100/70 backdrop-blur-xl border-b border-base-300/30">
    <div class="flex items-center justify-between h-14 px-6">
      <!-- Left: Breadcrumbs + Page Title -->
      <div class="flex items-center gap-3 min-w-0">
        <!-- Mobile menu toggle -->
        <button
          class="btn btn-circle btn-ghost btn-sm lg:hidden"
          @click="$emit('toggleMobileMenu')"
        >
          <IconMenu class="w-5 h-5" />
        </button>

        <!-- Breadcrumbs -->
        <nav v-if="breadcrumbs && breadcrumbs.length > 0" class="hidden sm:flex items-center gap-1.5 text-sm">
          <template v-for="(crumb, ci) in breadcrumbs" :key="ci">
            <NuxtLink
              :to="crumb.href"
              class="transition-colors"
              :class="ci === breadcrumbs.length - 1
                ? 'font-semibold text-base-content'
                : 'text-base-content/40 hover:text-base-content/70'"
            >
              {{ crumb.label }}
            </NuxtLink>
            <span
              v-if="ci < breadcrumbs.length - 1"
              class="text-base-content/20 mx-0.5"
            >·</span>
          </template>
        </nav>

        <!-- Page Title (mobile) -->
        <h1 class="sm:hidden text-sm font-semibold truncate">
          {{ pageTitle || '' }}
        </h1>
      </div>

      <!-- Right: Actions -->
      <div class="flex items-center gap-2">
        <!-- Search -->
        <div class="relative hidden md:block">
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="t('common.search') + '...'"
            class="input input-sm w-48 lg:w-64 bg-base-200/60 border-0 rounded-xl pl-9 text-sm placeholder:text-base-content/30 focus:bg-base-200 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all"
            @keyup.enter="handleSearch"
          />
          <IconSearch class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/30" />
        </div>

        <!-- Notification Bell -->
        <button
          class="btn btn-circle btn-ghost btn-sm relative"
          title="Notifications"
        >
          <IconBell class="w-5 h-5 text-base-content/50" />
          <span
            v-if="(notificationCount ?? 0) > 0"
            class="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-error text-[10px] font-bold text-white flex items-center justify-center"
          >
            {{ (notificationCount ?? 0) > 9 ? '9+' : notificationCount }}
          </span>
        </button>

        <!-- Separator -->
        <div class="w-px h-6 bg-base-300/50 mx-1" />

        <!-- User Avatar (compact) -->
        <NuxtLink
          v-if="isAuthenticated && user"
          to="/accounts/me"
          class="btn btn-circle btn-ghost btn-sm"
        >
          <div v-if="avatarUrl" class="avatar">
            <div class="w-7 rounded-full">
              <img :src="avatarUrl ?? ''" alt="User avatar" />
            </div>
          </div>
          <div v-else class="avatar avatar-placeholder">
            <div class="w-7 rounded-full bg-primary/10 text-primary">
              <span class="text-[10px] font-bold">{{ fallbackInitials }}</span>
            </div>
          </div>
        </NuxtLink>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { IconMenu, IconSearch, IconBell } from '#components'
import { getFileUrl } from '~/utils/files'

const { t } = useI18n()
const { isAuthenticated, user, displayName: authDisplayName } = useAuth()

defineProps<{
  breadcrumbs?: Array<{ label: string; href: string }>
  pageTitle?: string
  notificationCount?: number
}>()

defineEmits<{
  toggleMobileMenu: []
}>()

const searchQuery = ref('')

const displayName = computed(() => authDisplayName.value || user.value?.nick || user.value?.name || '')
const avatarUrl = computed(() => getFileUrl(user.value?.profile?.picture?.id ?? null))
const fallbackInitials = computed(() => (user.value?.name || '?').slice(0, 2).toUpperCase())

function handleSearch() {
  if (searchQuery.value.trim()) {
    navigateTo(`/search?q=${encodeURIComponent(searchQuery.value.trim())}`)
    searchQuery.value = ''
  }
}
</script>
