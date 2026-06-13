<template>
  <AdminSidebar
    :section-label="t('developer.console')"
    :nav-groups="navGroups"
    :organizations="orgList"
    :current-org="currentDeveloper ? mapOrg(currentDeveloper) : null"
    :select-placeholder="t('developer.selectDeveloper')"
    :clear-label="t('developer.clearDeveloper')"
    :loading="isLoading"
    portal-mode="developer"
    :is-publisher-selected="!!currentDeveloper"
    :show-portal-toggle="!!currentDeveloper"
    @navigate="$emit('navigate')"
    @clear-selection="clearSelection(); $emit('navigate')"
    @toggle-portal="handleTogglePortal"
  />
</template>

<script setup lang="ts">
import {
  IconLayoutDashboard,
  IconSettings,
  IconTestTube,
} from '#components'
import type { Developer } from '~/types/developer'

defineEmits<{ navigate: [] }>()

const { t } = useI18n()
const developer = useDeveloper()
const { developers, currentDeveloper, isLoading, clearSelection } = developer

const pubName = computed(() => currentDeveloper?.value?.publisher?.name ?? null)

const orgList = computed(() =>
  developers.value.map(mapOrg).filter(Boolean) as Array<{
    id: string
    name: string
    nick?: string
    picture?: { id: string } | null
    [key: string]: any
  }>
)

function handleTogglePortal(mode: 'creator' | 'developer') {
  if (mode === 'creator') {
    const name = pubName.value
    if (name) {
      navigateTo(`/creators/${name}`)
    }
  }
}

// Map developer's publisher to the AdminSidebar org shape
function mapOrg(dev: Developer) {
  if (!dev.publisher) return null
  return {
    id: dev.id,
    name: dev.publisher.name,
    nick: dev.publisher.nick,
    picture: dev.publisher.picture,
  }
}

const navGroups = computed(() => {
  if (!pubName.value) return []
  const p = pubName.value
  return [
    {
      label: t('nav.overview'),
      items: [
        { icon: IconLayoutDashboard, label: t('developer.dashboard'), href: `/developers/${p}` },
      ],
    },
    {
      label: t('developer.apiPlayground'),
      items: [
        { icon: IconTestTube, label: t('developer.apiPlayground'), href: `/developers/${p}/api-playground` },
      ],
    },
    {
      label: t('nav.settings'),
      items: [
        { icon: IconSettings, label: t('developer.settings'), href: `/developers/${p}/settings` },
      ],
    },
  ]
})
</script>
