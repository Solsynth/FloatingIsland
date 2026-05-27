<template>
  <form @submit.prevent="handleSubmit">
    <!-- Title -->
    <div class="form-control mb-4">
      <label class="label"><span class="label-text">Title</span></label>
      <input v-model="form.title" type="text" class="input input-bordered w-full" required />
    </div>

    <!-- URL -->
    <div class="form-control mb-4">
      <label class="label"><span class="label-text">{{ t('creator.feeds.url') }}</span></label>
      <input v-model="form.url" type="url" class="input input-bordered w-full" placeholder="https://example.com/feed" required />
    </div>

    <!-- Description -->
    <div class="form-control mb-4">
      <label class="label"><span class="label-text">{{ t('creator.collections.description') }}</span></label>
      <textarea v-model="form.description" class="textarea textarea-bordered w-full" rows="3" />
    </div>

    <!-- Scrape toggle -->
    <div class="form-control mb-6">
      <label class="cursor-pointer flex items-start gap-3 p-3 rounded-lg bg-base-200">
        <input v-model="form.scrapPage" type="checkbox" class="toggle toggle-primary toggle-sm mt-1" />
        <div>
          <div class="text-sm font-medium">{{ t('creator.feeds.scrapPage') }}</div>
          <div class="text-xs text-base-content/60">{{ t('creator.feeds.scrapPageHint') }}</div>
        </div>
      </label>
    </div>

    <!-- Actions -->
    <div class="flex items-center justify-between">
      <button
        v-if="feed"
        type="button"
        class="btn btn-error btn-ghost btn-sm"
        @click="handleDelete"
      >
        <IconTrash class="w-4 h-4" />
        {{ t('creator.delete') }}
      </button>
      <div v-else />
      <div class="flex gap-2">
        <button v-if="feed" type="button" class="btn btn-ghost btn-sm" :disabled="submitting" @click="handleScrap">
          <IconRefreshCw class="w-4 h-4" />
          {{ t('creator.feeds.scrapNow') }}
        </button>
        <button type="submit" class="btn btn-primary" :disabled="submitting">
          {{ t('creator.save') }}
        </button>
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { IconTrash, IconRefreshCw } from '#components'
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
  submitting.value = true
  try {
    await scrapWebFeed(props.pubName, props.feed.id)
  } catch (e) {
    console.error(e)
  } finally {
    submitting.value = false
  }
}
</script>
