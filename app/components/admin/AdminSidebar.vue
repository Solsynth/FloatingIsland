<template>
  <aside class="flex h-full flex-col bg-base-100/60 backdrop-blur-2xl border-r border-base-300/50">
    <!-- Logo -->
    <div class="flex items-center gap-3 px-5 py-5 border-b border-base-300/30">
      <NuxtLink to="/" class="shrink-0">
        <img src="/favicon.png" alt="Logo" class="h-9 w-9" />
      </NuxtLink>
      <div class="min-w-0">
        <NuxtLink to="/" class="text-base font-bold tracking-tight text-base-content">
          Solar Network
        </NuxtLink>
        <p class="text-[11px] text-base-content/40 font-medium tracking-wide uppercase">
          {{ sectionLabel }}
        </p>
      </div>
    </div>

    <!-- Portal Toggle (only when a publisher is selected) -->
    <div v-if="isPublisherSelected && showPortalToggle" class="px-3 pt-3 pb-1">
      <div class="flex rounded-xl bg-base-200/70 p-0.5 border border-base-300/20">
        <button
          class="flex-1 rounded-lg px-2 py-1.5 text-xs font-semibold transition-all"
          :class="portalMode === 'creator'
            ? 'bg-base-100 text-primary shadow-sm'
            : 'text-base-content/40 hover:text-base-content/70'"
          :disabled="portalMode === 'creator' || !currentOrg"
          @click="portalMode !== 'creator' && handleTogglePortal('creator')"
        >
          <IconPalette class="w-3.5 h-3.5 inline-block mr-1 -mt-0.5" />
          {{ t('portal.creator') }}
        </button>
        <button
          class="flex-1 rounded-lg px-2 py-1.5 text-xs font-semibold transition-all"
          :class="portalMode === 'developer'
            ? 'bg-base-100 text-primary shadow-sm'
            : 'text-base-content/40 hover:text-base-content/70'"
          :disabled="portalMode === 'developer' || !currentOrg"
          @click="portalMode !== 'developer' && handleTogglePortal('developer')"
        >
          <IconCode class="w-3.5 h-3.5 inline-block mr-1 -mt-0.5" />
          {{ t('portal.developer') }}
        </button>
        <button
          class="flex-1 rounded-lg px-2 py-1.5 text-xs font-semibold transition-all"
          :class="portalMode === 'merchant'
            ? 'bg-base-100 text-primary shadow-sm'
            : 'text-base-content/40 hover:text-base-content/70'"
          :disabled="portalMode === 'merchant' || !currentOrg"
          @click="portalMode !== 'merchant' && handleTogglePortal('merchant')"
        >
          <IconWallet class="w-3.5 h-3.5 inline-block mr-1 -mt-0.5" />
          {{ t('portal.merchant') }}
        </button>
      </div>

      <!-- Enroll Prompt -->
      <div
        v-if="showEnrollPrompt"
        class="mt-2 rounded-xl bg-warning/10 border border-warning/20 p-3"
      >
        <div class="flex items-start gap-2">
          <IconAlertTriangle class="w-4 h-4 text-warning shrink-0 mt-0.5" />
          <div class="min-w-0 flex-1">
            <p class="text-xs font-medium text-warning">
              {{ t('developer.enroll.notEnrolled') }}
            </p>
            <p class="text-[11px] text-base-content/50 mt-0.5">
              {{ t('developer.enroll.notEnrolledHint') }}
            </p>
            <div class="flex items-center gap-2 mt-2">
              <button
                class="btn btn-warning btn-xs min-h-0 h-7 px-3"
                :class="{ 'loading': enrolling }"
                :disabled="enrolling"
                @click="handleEnrollDeveloper"
              >
                {{ t('developer.enroll.enrollNow') }}
              </button>
              <button
                class="btn btn-ghost btn-xs min-h-0 h-7"
                @click="dismissEnrollPrompt"
              >
                {{ t('developer.enroll.dismiss') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Organization Selector -->
    <div v-if="organizations.length > 0" class="px-3 pt-3 pb-2">
      <div class="dropdown dropdown-end w-full">
        <label tabindex="0" class="flex items-center gap-3 w-full rounded-xl px-3 py-2.5 transition-all cursor-pointer hover:bg-base-200/80 border border-transparent hover:border-base-300/50">
          <div class="avatar">
            <div class="w-8 rounded-full">
              <img
                v-if="getFileUrl(currentOrg?.picture?.id)"
                :src="getFileUrl(currentOrg?.picture?.id) ?? ''"
                :alt="currentOrgName ?? 'Organization'"
              />
              <div
                v-else
                class="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold"
              >
                {{ (currentOrgName || '?').slice(0, 2).toUpperCase() }}
              </div>
            </div>
          </div>
          <div class="min-w-0 flex-1">
            <div class="truncate text-sm font-semibold">{{ currentOrgName || selectPlaceholder }}</div>
            <div v-if="currentOrgSubtitle" class="truncate text-[11px] text-base-content/40">@{{ currentOrgSubtitle }}</div>
          </div>
          <IconChevronDown class="w-4 h-4 shrink-0 text-base-content/40" />
        </label>
        <ul
          tabindex="0"
          class="dropdown-content menu z-[1] w-full min-w-[220px] rounded-xl bg-base-100 p-2 shadow-lg border border-base-300/50 mt-1"
        >
          <li v-if="currentOrg">
            <button @click="handleClearSelection" class="flex items-center gap-3">
              <IconX class="w-4 h-4" />
              <span>{{ clearLabel }}</span>
            </button>
          </li>
          <li v-if="currentOrg" class="divider my-1 h-px" />
          <li v-for="org in organizations" :key="org.id">
            <NuxtLink
              :to="getOrgLink(org)"
              class="flex items-center gap-3"
              :class="{ 'active': currentOrgId === org.id }"
              @click="handleNavigate"
            >
              <div class="avatar">
                <div class="w-7 rounded-full">
                  <img
                    v-if="getFileUrl(org.picture?.id)"
                    :src="getFileUrl(org.picture?.id) ?? ''"
                    :alt="getOrgDisplayName(org) || 'Organization'"
                  />
                  <div
                    v-else
                    class="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold"
                  >
                    {{ getOrgDisplayName(org).slice(0, 2).toUpperCase() }}
                  </div>
                </div>
              </div>
              <div class="min-w-0">
                <div class="truncate text-sm font-medium">{{ getOrgDisplayName(org) }}</div>
                <div class="truncate text-[11px] text-base-content/40">@{{ getOrgSubtitle(org) }}</div>
              </div>
            </NuxtLink>
          </li>
        </ul>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-none">
      <div v-for="(group, gi) in navGroups" :key="gi">
        <p v-if="group.label" class="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-base-content/30">
          {{ group.label }}
        </p>
        <div class="space-y-0.5">
          <NuxtLink
            v-for="item in group.items"
            :key="item.href"
            :to="item.href"
            class="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all"
            :class="isActiveRoute(item.href)
              ? 'bg-primary/10 text-primary shadow-sm'
              : 'text-base-content/70 hover:bg-base-200/80 hover:text-base-content'"
            @click="handleNavigate"
          >
            <component
              :is="item.icon"
              class="w-5 h-5 shrink-0 transition-all"
              :class="isActiveRoute(item.href) ? 'text-primary' : 'text-base-content/40 group-hover:text-base-content/70'"
            />
            <span>{{ item.label }}</span>
            <span
              v-if="item.badge"
              class="ml-auto text-[11px] font-semibold px-2 py-0.5 rounded-full"
              :class="isActiveRoute(item.href) ? 'bg-primary/20 text-primary' : 'bg-base-300/60 text-base-content/50'"
            >
              {{ item.badge }}
            </span>
          </NuxtLink>
        </div>
      </div>
    </nav>

    <!-- User Profile -->
    <div class="px-3 pb-4 pt-2 border-t border-base-300/30 mt-auto">
        <div v-if="isAuthenticated && user" class="dropdown dropdown-end dropdown-top w-full">
          <button
            class="flex items-center gap-3 w-full rounded-xl px-3 py-2.5 transition-all hover:bg-base-200/80"
          >
            <div v-if="avatarUrl" class="avatar">
              <div class="w-8 rounded-full">
                <img :src="avatarUrl ?? ''" :alt="displayName || 'User'" />
              </div>
            </div>
            <div v-else class="avatar avatar-placeholder">
              <div class="w-8 rounded-full bg-primary/10 text-primary">
                <span class="text-xs font-bold">{{ fallbackInitials }}</span>
              </div>
            </div>
            <div class="min-w-0 flex-1 text-left">
              <div class="truncate text-sm font-semibold">{{ displayName }}</div>
              <div class="truncate text-[11px] text-base-content/40">@{{ username }}</div>
            </div>
            <IconChevronUp class="w-3.5 h-3.5 shrink-0 text-base-content/30" />
          </button>
          <ul class="dropdown-content menu mb-2 w-full min-w-[200px] rounded-xl bg-base-100 p-2 shadow-lg border border-base-300/50">
            <li>
              <NuxtLink to="/accounts/me" class="flex items-center gap-3">
                <IconUser class="w-4 h-4" />
                {{ t('nav.account') }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/accounts/me/settings" class="flex items-center gap-3">
                <IconSettings class="w-4 h-4" />
                {{ t('nav.settings') }}
              </NuxtLink>
            </li>
            <li class="divider my-1 h-px" />
            <li>
              <button @click="handleLogout" class="flex items-center gap-3 text-error">
                <IconLogOut class="w-4 h-4" />
                {{ t('nav.logout') }}
              </button>
            </li>
          </ul>
        </div>
        <NuxtLink
          v-else
          to="/auth/login"
          class="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all hover:bg-base-200/80"
        >
          <div class="avatar avatar-placeholder">
            <div class="w-8 rounded-full bg-base-300 text-base-content/60">
              <IconLogIn class="w-4 h-4" />
            </div>
          </div>
          <div class="text-left">
            <div class="text-sm font-semibold">{{ t('nav.signIn') }}</div>
            <div class="text-[11px] text-base-content/40">{{ t('nav.joinCommunity') }}</div>
          </div>
        </NuxtLink>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { getFileUrl } from '~/utils/files'
import {
  IconChevronDown,
  IconChevronUp,
  IconX,
  IconLogOut,
  IconLogIn,
  IconUser,
  IconSettings,
  IconPalette,
  IconCode,
  IconWallet,
  IconAlertTriangle,
} from '#components'

const { t } = useI18n()
const route = useRoute()
const { isAuthenticated, user, displayName: authDisplayName, logout } = useAuth()

const props = withDefaults(defineProps<{
  /** Section label shown under the logo (e.g. "Creator Studio", "Developer Console") */
  sectionLabel: string
  /** Navigation groups for the sidebar */
  navGroups: Array<{
    label?: string
    items: Array<{
      icon: any
      label: string
      href: string
      badge?: string | number
    }>
  }>
  /** Organizations/publishers list */
  organizations: Array<{
    id: string
    name: string
    nick?: string
    picture?: { id: string } | null
    [key: string]: any
  }>
  /** Currently selected organization */
  currentOrg?: {
    id: string
    name: string
    nick?: string
    picture?: { id: string } | null
    [key: string]: any
  } | null
  /** Placeholder text for organization selector */
  selectPlaceholder: string
  /** Clear selection label */
  clearLabel: string
  /** Whether data is still loading */
  loading?: boolean
  /** Current portal mode */
  portalMode?: 'creator' | 'developer' | 'merchant'
  /** Whether a publisher is selected */
  isPublisherSelected?: boolean
  /** Whether to show the portal toggle */
  showPortalToggle?: boolean
  /** Whether to show the enroll prompt */
  showEnrollPrompt?: boolean
  /** Whether enrollment is in progress */
  enrolling?: boolean
}>(), {
  portalMode: 'creator' as 'creator' | 'developer' | 'merchant',
  isPublisherSelected: false,
  showPortalToggle: true,
  showEnrollPrompt: false,
  enrolling: false,
})

const emit = defineEmits<{
  navigate: []
  clearSelection: []
  togglePortal: [mode: 'creator' | 'developer' | 'merchant']
  enrollDeveloper: []
  dismissEnroll: []
}>()

const currentOrgId = computed(() => props.currentOrg?.id ?? null)
const currentOrgName = computed((): string | undefined => {
  if (!props.currentOrg) return undefined
  return props.currentOrg.nick || props.currentOrg.name
})
const currentOrgSubtitle = computed(() => props.currentOrg?.name ?? null)

function getOrgDisplayName(org: any): string {
  return org.nick || org.name || 'Unknown'
}

function getOrgSubtitle(org: any): string {
  return org.name || ''
}

function getOrgLink(org: any): string {
  const prefix = props.portalMode === 'merchant' ? 'merchants'
    : props.portalMode === 'developer' ? 'developers' : 'creators'
  return `/${prefix}/${org.name}`
}

function handleNavigate() {
  emit('navigate')
}

function handleClearSelection() {
  emit('clearSelection')
}

function handleTogglePortal(mode: 'creator' | 'developer' | 'merchant') {
  emit('togglePortal', mode)
}

function handleEnrollDeveloper() {
  emit('enrollDeveloper')
}

function dismissEnrollPrompt() {
  emit('dismissEnroll')
}

const displayName = computed(() => authDisplayName.value || user.value?.nick || user.value?.name || '')
const username = computed(() => user.value?.name || '')
const avatarUrl = computed(() => getFileUrl(user.value?.profile?.picture?.id))
const fallbackInitials = computed(() => (username.value || '?').slice(0, 2).toUpperCase())

function isActiveRoute(href: string): boolean {
  return route.path === href || route.path.startsWith(href + '/')
}

function handleLogout() {
  logout()
  navigateTo('/')
}
</script>
