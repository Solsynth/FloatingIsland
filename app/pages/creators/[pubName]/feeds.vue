<template>
  <NuxtLayout name="creator">
    <div class="mx-auto max-w-4xl">
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-xl font-bold">{{ t('creator.feeds.title') }}</h1>
        <button class="btn btn-primary btn-sm" @click="openEditor(null)">
          <IconPlus class="w-4 h-4" />
          {{ t('creator.feeds.create') }}
        </button>
      </div>

      <ConfuseSpinner v-if="status === 'pending'" />

      <div v-else-if="error" class="alert alert-error">
        <span>{{ String(error) }}</span>
      </div>

      <div v-else-if="!feeds?.length" class="text-center py-12 text-base-content/50">
        {{ t('creator.feeds.empty') }}
      </div>

      <div v-else class="space-y-2">
        <div v-for="feed in feeds" :key="feed.id"
          class="card bg-base-100 shadow-sm cursor-pointer transition-all hover:shadow-md" @click="openEditor(feed)">
          <div class="card-body p-4 flex-row items-center gap-4">
            <div class="avatar avatar-placeholder">
              <div class="w-10 rounded-lg bg-primary/10 text-primary">
                <IconRss class="w-5 h-5" />
              </div>
            </div>
            <div class="min-w-0 flex-1">
              <div class="font-medium">{{ feed.title }}</div>
              <div class="text-sm text-base-content/50 truncate">{{ feed.url }}</div>
            </div>
            <IconChevronRight class="w-4 h-4 text-base-content/30" />
          </div>
        </div>
      </div>

      <!-- Editor Drawer -->
      <AdminDrawer :open="editorModalOpen" :title="editingFeed ? t('creator.edit') : t('creator.feeds.create')"
        @update:open="editorModalOpen = $event">
        <WebFeedForm :pub-name="pubName" :feed="editingFeed" @close="closeEditor" @saved="handleSaved" />
      </AdminDrawer>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { IconPlus, IconRss, IconChevronRight } from '#components'
import type { SnWebFeed } from '~/types/creator'
import { fetchWebFeeds } from '~/utils/creator'

definePageMeta({ middleware: 'creator' })

const { t } = useI18n()
const route = useRoute()
const pubName = computed(() => route.params.pubName as string)

const creator = useCreator()
const { currentPublisher } = creator

defineOgImage('UniOgImage', { title: computed(() => `${t('creator.feeds.title')} - ${currentPublisher.value?.nick ?? pubName.value}`) })

useSolarSeo({ title: computed(() => `${t('creator.feeds.title')} - ${currentPublisher.value?.nick ?? pubName.value}`) })

const { data: feeds, status, error, refresh } = await useAsyncData(
  `creator-feeds-${pubName.value}`,
  () => fetchWebFeeds(pubName.value),
)

const showEditor = ref(false)
const editingFeed = ref<SnWebFeed | null>(null)
const editorModalOpen = ref(false)

function openEditor(feed: SnWebFeed | null) {
  editingFeed.value = feed
  editorModalOpen.value = true
}

function closeEditor() {
  editorModalOpen.value = false
}

function handleSaved() {
  closeEditor()
  refresh()
}
</script>
