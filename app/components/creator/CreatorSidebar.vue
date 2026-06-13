<template>
  <AdminSidebar
    section-label="Creator Studio"
    :nav-groups="navGroups"
    :organizations="managedPublishers"
    :current-org="currentPublisher"
    select-placeholder="Select Publisher"
    clear-label="Clear Publisher"
    :loading="isLoading"
    portal-mode="creator"
    :is-publisher-selected="!!currentPublisher"
    :show-portal-toggle="!!currentPublisher"
    :show-enroll-prompt="showEnrollPrompt"
    :enrolling="enrolling"
    @navigate="$emit('navigate')"
    @clear-selection="clearSelection(); $emit('navigate')"
    @toggle-portal="handleTogglePortal"
    @enroll-developer="handleEnroll"
    @dismiss-enroll="showEnrollPrompt = false"
  />
</template>

<script setup lang="ts">
import {
  IconLayoutDashboard,
  IconFileText,
  IconFolder,
  IconSticker,
  IconChartBar,
  IconRss,
  IconTrophy,
  IconUsers,
  IconUserPlus,
  IconSettings,
} from '#components'
import { enrollDeveloper } from '~/utils/developer'

defineEmits<{ navigate: [] }>()

const { t } = useI18n()
const creator = useCreator()
const developer = useDeveloper()
const { managedPublishers, currentPublisher, currentPublisherName, isLoading, clearSelection } = creator

const pubName = computed(() => currentPublisherName.value)
const showEnrollPrompt = ref(false)
const enrolling = ref(false)

// Check if the current publisher has a developer identity
const hasDeveloperIdentity = computed(() => {
  const name = pubName.value
  if (!name) return false
  return developer.developers.value.some(d => d.publisher?.name === name)
})

function handleTogglePortal(mode: 'creator' | 'developer') {
  if (mode === 'developer') {
    const name = pubName.value
    if (!name) return

    if (hasDeveloperIdentity.value) {
      navigateTo(`/developers/${name}`)
    } else {
      showEnrollPrompt.value = true
    }
  }
}

async function handleEnroll() {
  const name = pubName.value
  if (!name) return

  enrolling.value = true
  try {
    await enrollDeveloper(name)
    await developer.loadDevelopers()
    showEnrollPrompt.value = false
    navigateTo(`/developers/${name}`)
  } catch (e) {
    console.error('Failed to enroll as developer:', e)
  } finally {
    enrolling.value = false
  }
}

onMounted(() => {
  // Load developer list to check identity status
  developer.loadDevelopers()
})

// Reset enroll prompt when publisher changes
watch(pubName, () => {
  showEnrollPrompt.value = false
})

const navGroups = computed(() => {
  if (!pubName.value) return []
  const p = pubName.value
  return [
    {
      label: 'Overview',
      items: [
        { icon: IconLayoutDashboard, label: t('creator.dashboard'), href: `/creators/${p}` },
      ],
    },
    {
      label: 'Content',
      items: [
        { icon: IconFileText, label: t('creator.posts.title'), href: `/creators/${p}/posts` },
        { icon: IconFolder, label: t('creator.collections.title'), href: `/creators/${p}/collections` },
        { icon: IconSticker, label: t('creator.stickers.title'), href: `/creators/${p}/stickers` },
        { icon: IconChartBar, label: t('creator.polls.title'), href: `/creators/${p}/polls` },
        { icon: IconRss, label: t('creator.feeds.title'), href: `/creators/${p}/feeds` },
      ],
    },
    {
      label: 'Community',
      items: [
        { icon: IconTrophy, label: t('creator.leaderboard.title'), href: `/creators/${p}/leaderboard` },
        { icon: IconUsers, label: t('creator.members.title'), href: `/creators/${p}/members` },
        { icon: IconUserPlus, label: t('creator.subscribers.title'), href: `/creators/${p}/subscribers` },
      ],
    },
    {
      label: 'Settings',
      items: [
        { icon: IconSettings, label: t('creator.settings'), href: `/creators/${p}/settings` },
      ],
    },
  ]
})
</script>
