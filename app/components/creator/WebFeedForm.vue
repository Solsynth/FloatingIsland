<template>
  <form @submit.prevent="handleSubmit">
    <AdminCard
      :title="feed ? 'Edit Feed' : 'New Feed'"
      description="Import content from external RSS/Atom feeds"
      class="mb-6"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Title -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">Title</span>
            <span class="text-xs text-error">*</span>
          </label>
          <input
            v-model="form.title"
            type="text"
            class="input input-bordered w-full"
            placeholder="My News Feed"
            required
          />
        </div>

        <!-- URL -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">{{ t('creator.feeds.url') }}</span>
            <span class="text-xs text-error">*</span>
          </label>
          <input
            v-model="form.url"
            type="url"
            class="input input-bordered w-full font-mono text-sm"
            placeholder="https://example.com/feed"
            required
          />
        </div>
      </div>

      <!-- Description -->
      <div class="form-control mt-2">
        <label class="label">
          <span class="label-text font-medium">{{ t('creator.collections.description') }}</span>
        </label>
        <textarea
          v-model="form.description"
          class="textarea textarea-bordered w-full min-h-[80px]"
          rows="3"
          placeholder="Describe this feed..."
        />
      </div>

      <!-- Scrape toggle -->
      <div class="form-control mt-4">
        <label class="flex items-start gap-3 p-4 rounded-xl bg-base-200/60 border border-base-300/30 cursor-pointer hover:bg-base-200/80 transition-colors">
          <input v-model="form.scrapPage" type="checkbox" class="toggle toggle-primary toggle-sm mt-0.5" />
          <div>
            <div class="text-sm font-medium">{{ t('creator.feeds.scrapPage') }}</div>
            <div class="text-xs text-base-content/40 mt-0.5">{{ t('creator.feeds.scrapPageHint') }}</div>
          </div>
        </label>
      </div>
    </AdminCard>

    <!-- Actions -->
    <div class="flex items-center justify-between gap-3">
      <div class="flex items-center gap-2">
        <button
          v-if="feed"
          type="button"
          class="btn btn-error btn-ghost btn-sm"
          @click="handleDelete"
        >
          <IconTrash class="w-4 h-4" />
          {{ t('creator.delete') }}
        </button>
      </div>
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="btn btn-ghost"
          @click="emit('close')"
        >
          {{ t('creator.cancel') }}
        </button>
        <button
          v-if="feed"
          type="button"
          class="btn btn-outline btn-sm"
          :class="{ 'loading': scraping }"
          :disabled="scraping"
          @click="handleScrap"
        >
          <IconRefreshCw class="w-4 h-4" />
          {{ t('creator.feeds.scrapNow') }}
        </button>
        <button
          type="submit"
          class="btn btn-primary min-w-[100px]"
          :class="{ 'loading': submitting }"
          :disabled="submitting"
        >
          <IconSave class="w-4 h-4" />
          {{ t('creator.save') }}
        </button>
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { IconSave, IconTrash, IconRefreshCw } from '#components'
import type { SnWebFeed } from '~/types/creator'
import {
  createWebFeed,
  updateWebFeed,
  deleteWebFeed,
  scrapWebFeed,
} from '~/utils/creator'

const props = defineProps<{
  pubName: string
  feed?: SnWebFeed | null
}>()

const emit = defineEmits<{
  close: []
  saved: [feed: SnWebFeed]
}>()

const { t } = useI18n()

const form = reactive({
  title: props.feed?.title ?? '',
  url: props.feed?.url ?? '',
  description: props.feed?.description ?? '',
  scrapPage: props.feed?.config?.scrapPage ?? false,
})

const submitting = ref(false)
const scraping = ref(false)

async function handleSubmit() {
  submitting.value = true
  try {
    let result: SnWebFeed
    if (props.feed) {
      result = await updateWebFeed(props.pubName, props.feed.id, {
        title: form.title,
        url: form.url,
        description: form.description,
        scrapPage: form.scrapPage,
      })
    } else {
      result = await createWebFeed(props.pubName, {
        title: form.title,
        url: form.url,
        description: form.description,
        scrapPage: form.scrapPage,
      })
    }
    emit('saved', result)
  } catch (e) {
    console.error(e)
  } finally {
    submitting.value = false
  }
}

async function handleDelete() {
  if (!props.feed) return
  if (!confirm(t('creator.feeds.deleteConfirm'))) return
  await deleteWebFeed(props.pubName, props.feed.id)
  emit('close')
}

async function handleScrap() {
  if (!props.feed) return
  scraping.value = true
  try {
    await scrapWebFeed(props.pubName, props.feed.id)
  } catch (e) {
    console.error(e)
  } finally {
    scraping.value = false
  }
}
</script>
