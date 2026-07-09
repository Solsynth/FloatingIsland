<template>
  <header class="sticky top-0 z-30 bg-base-100/90 backdrop-blur-md border-b border-base-300/50">
    <div class="flex items-center justify-between h-14 px-4 lg:px-6">
      <!-- Left: Breadcrumbs + Page Title -->
      <div class="flex items-center gap-2.5 min-w-0">
        <!-- Mobile menu toggle -->
        <button
          type="button"
          class="btn btn-circle btn-ghost btn-sm lg:hidden"
          @click="$emit('toggleMobileMenu')"
        >
          <IconMenu class="w-5 h-5" />
        </button>

        <!-- Breadcrumbs -->
        <nav
          v-if="breadcrumbs && breadcrumbs.length > 0"
          class="hidden sm:flex items-center gap-1 text-sm min-w-0"
          aria-label="Breadcrumb"
        >
          <template v-for="(crumb, ci) in breadcrumbs" :key="ci">
            <NuxtLink
              v-if="ci < breadcrumbs.length - 1"
              :to="crumb.href"
              class="truncate text-base-content/45 hover:text-base-content transition-colors duration-150 max-w-[10rem]"
            >
              {{ crumb.label }}
            </NuxtLink>
            <span
              v-else
              class="truncate font-semibold text-base-content max-w-[14rem]"
              aria-current="page"
            >
              {{ crumb.label }}
            </span>
            <IconChevronRight
              v-if="ci < breadcrumbs.length - 1"
              class="w-3.5 h-3.5 shrink-0 text-base-content/25"
            />
          </template>
        </nav>

        <!-- Page Title (mobile) -->
        <h1 class="sm:hidden text-sm font-semibold truncate">
          {{ pageTitle || '' }}
        </h1>
      </div>

      <!-- Right: Actions -->
      <div class="flex items-center gap-1.5 shrink-0">
        <!-- Search -->
        <div class="relative hidden md:block">
          <IconSearch
            class="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/35 pointer-events-none"
          />
          <input
            v-model="searchQuery"
            type="search"
            :placeholder="t('common.search') + '...'"
            class="input input-sm w-48 lg:w-56 h-9 bg-base-200/70 border border-base-300/40 rounded-lg pl-8 text-sm placeholder:text-base-content/35 focus:bg-base-100 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/15 transition-colors duration-150"
            @keyup.enter="handleSearch"
          >
        </div>

        <!-- Notification Bell -->
        <button
          type="button"
          class="btn btn-circle btn-ghost btn-sm relative"
          :title="t('common.notifications')"
        >
          <IconBell class="w-5 h-5 text-base-content/50" />
          <span
            v-if="(notificationCount ?? 0) > 0"
            class="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-0.5 rounded-full bg-error text-[10px] font-bold text-white flex items-center justify-center"
          >
            {{ (notificationCount ?? 0) > 9 ? '9+' : notificationCount }}
          </span>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { IconMenu, IconSearch, IconBell, IconChevronRight } from '#components'

const { t } = useI18n()

defineProps<{
  breadcrumbs?: Array<{ label: string; href: string }>
  pageTitle?: string
  notificationCount?: number
}>()

defineEmits<{
  toggleMobileMenu: []
}>()

const searchQuery = ref('')

function handleSearch() {
  if (searchQuery.value.trim()) {
    navigateTo(`/search?q=${encodeURIComponent(searchQuery.value.trim())}`)
    searchQuery.value = ''
  }
}
</script>
