<template>
  <aside
    class="flex h-full flex-col items-stretch py-4 transition-all duration-300 ease-in-out"
    :class="collapsed ? 'px-2' : 'px-4'"
  >
    <!-- Logo -->
    <div
      class="mb-6 flex px-2 transition-all duration-300"
      :class="collapsed ? 'justify-center' : 'justify-end'"
    >
      <NuxtLink to="/" class="text-2xl font-bold text-primary">
        <img src="/favicon.png" alt="Logo" class="h-12 w-12" />
      </NuxtLink>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 grow space-y-1">
      <NuxtLink
        v-for="item in navItems"
        :key="item.href"
        :to="item.href"
        class="group relative flex items-center gap-4 rounded-xl py-3 transition-all duration-300 hover:bg-base-200"
        :class="collapsed ? 'justify-center px-3' : 'justify-end px-4'"
      >
        <span
          v-if="!collapsed"
          class="text-lg font-medium transition-all duration-300 group-hover:text-primary"
        >
          {{ item.label }}
        </span>
        <div class="relative">
          <component
            :is="item.icon"
            class="h-6 w-6 shrink-0 transition-colors group-hover:text-primary"
          />
          <span
            v-if="item.badge"
            class="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-error px-1 text-[9px] font-bold text-error-content"
          >
            {{ item.badge > 99 ? '99+' : item.badge }}
          </span>
        </div>
      </NuxtLink>
    </nav>

    <!-- Bottom Section: User Profile -->
    <div class="mt-auto flex flex-col gap-2" :class="collapsed ? 'px-0' : 'px-2'">
      <!-- Toggle Button + Notification Bell Row (expanded) -->
      <div v-if="isAuthenticated && !collapsed" class="flex items-center justify-start gap-4 ps-4">
        <button
          class="btn btn-ghost btn-circle btn-sm"
          aria-label="Collapse sidebar"
          @click="toggleSidebar"
        >
          <IconPanelLeftClose class="h-5 w-5" />
        </button>
        <NotificationBell />
      </div>

      <!-- Toggle Button (expanded, no auth) -->
      <button
        v-if="!isAuthenticated && !collapsed"
        class="btn btn-ghost btn-circle btn-sm mx-auto"
        aria-label="Collapse sidebar"
        @click="toggleSidebar"
      >
        <IconPanelLeftClose class="h-5 w-5" />
      </button>

      <!-- Toggle Button (collapsed, no auth) -->
      <button
        v-if="!isAuthenticated && collapsed"
        class="btn btn-ghost btn-circle btn-sm"
        aria-label="Expand sidebar"
        @click="toggleSidebar"
      >
        <IconPanelLeftClose class="h-5 w-5 rotate-180" />
      </button>

      <!-- Notification Bell + Toggle (collapsed) -->
      <template v-if="collapsed">
        <div v-if="isAuthenticated" class="flex justify-center">
          <NotificationBell />
        </div>
        <div class="flex justify-center">
          <button
            class="btn btn-ghost btn-circle btn-sm"
            aria-label="Expand sidebar"
            @click="toggleSidebar"
          >
            <IconPanelLeftClose class="h-5 w-5 rotate-180" />
          </button>
        </div>
      </template>

      <!-- User Profile Mini -->
      <div
        v-if="isAuthenticated && user"
        class="dropdown dropdown-end dropdown-top w-full"
      >
        <button
          class="flex w-full items-center gap-3 rounded-xl p-3 transition-all duration-300 hover:bg-base-200"
        >
          <div v-if="avatarUrl" class="avatar shrink-0">
            <div class="w-10 rounded-full">
              <img :src="avatarUrl" :alt="username" />
            </div>
          </div>
          <div v-else class="avatar avatar-placeholder shrink-0">
            <div class="w-10 rounded-full bg-primary text-primary-content">
              <span class="text-sm font-medium">{{ fallbackInitials }}</span>
            </div>
          </div>
          <div
            class="min-w-0 flex-1 text-left transition-all duration-300"
            :class="collapsed ? 'hidden' : ''"
          >
            <div class="truncate text-sm font-semibold">
              {{ displayName }}
            </div>
            <div class="truncate text-xs text-base-content/50">
              @{{ username }}
            </div>
          </div>
        </button>
        <ul
          class="dropdown-content menu mb-2 w-52 rounded-box bg-base-100 p-2 shadow"
        >
          <li>
            <NuxtLink to="/accounts/me">
              <IconUser class="w-4.5" />
              {{ t("nav.account") }}
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/accounts/me/settings">
              <IconSettings class="w-4.5" />
              {{ t("nav.settings") }}
            </NuxtLink>
          </li>
          <li class="my-1 border-t border-base-300" />
          <li>
            <button @click="handleLogout">
              <IconLogOut class="w-4.5" />
              {{ t("nav.logout") }}
            </button>
          </li>
        </ul>
      </div>
      <NuxtLink
        v-else
        to="/auth/login"
        class="flex w-full items-center gap-3 rounded-xl p-3 transition-all duration-300 hover:bg-base-200"
      >
        <div class="avatar avatar-placeholder shrink-0">
          <div class="w-10 rounded-full bg-base-300 text-base-content">
            <IconLogIn class="w-5 h-5" />
          </div>
        </div>
        <div
          class="text-left transition-all duration-300"
          :class="collapsed ? 'hidden' : ''"
        >
          <div class="text-sm font-semibold">{{ t("nav.signIn") }}</div>
          <div class="text-xs text-base-content/50">
            {{ t("nav.joinCommunity") }}
          </div>
        </div>
      </NuxtLink>
    </div>
  </aside>
</template>

<script setup lang="ts">
import {
  IconLogIn,
  IconLogOut,
  IconUser,
  IconSettings,
  IconPanelLeftClose,
} from "#components";
import { getFileUrl } from "~/utils/files";

const { t } = useI18n();
const { collapsed, toggleSidebar } = useSidebar();

const {
  isAuthenticated,
  user,
  logout,
  displayName: authDisplayName,
} = useAuth();

const { navItems: mainNavItems } = useMainNav();

const navItems = computed(() =>
  mainNavItems.value.map((item) => ({
    icon: item.icon,
    label: t(item.labelKey),
    href: item.href,
    badge: item.badge,
  }))
);

const displayName = computed(() => authDisplayName.value);
const username = computed(() => user.value?.name || "");
const avatarUrl = computed(() => getFileUrl(user.value?.profile?.picture?.id));
const fallbackInitials = computed(() =>
  (username.value || "?").slice(0, 2).toUpperCase(),
);

function handleLogout() {
  logout();
  navigateTo("/");
}
</script>
