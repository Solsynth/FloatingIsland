<template>
  <NuxtLayout name="creator">
    <div class="mx-auto max-w-4xl">
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-xl font-bold">{{ t('creator.polls.title') }}</h1>
      </div>

      <ConfuseSpinner v-if="status === 'pending'" />

      <div v-else-if="error" class="alert alert-error">
        <span>{{ String(error) }}</span>
      </div>

      <div v-else class="space-y-2">
        <div
          v-for="poll in polls"
          :key="poll.id"
          class="card bg-base-100 shadow-sm"
        >
          <div class="card-body p-4">
            <div class="flex items-start justify-between">
              <div class="min-w-0 flex-1">
                <h3 class="font-medium">{{ poll.title || t('creator.common.untitled') }}</h3>
                <p v-if="poll.description" class="text-sm text-base-content/60 line-clamp-2 mt-1">
                  {{ poll.description }}
                </p>
                <div class="flex items-center gap-3 mt-2 text-xs text-base-content/50">
                  <span>{{ t('creator.polls.questions') }}: {{ poll.questions.length }}</span>
                  <span>{{ poll.endedAt ? formatDate(poll.endedAt) : t('creator.common.noEnd') }}</span>
                </div>
              </div>
              <div class="dropdown dropdown-end">
                <label tabindex="0" class="btn btn-ghost btn-sm btn-circle">
                  <IconMoreVertical class="w-4 h-4" />
                </label>
                <ul tabindex="0" class="dropdown-content menu z-[1] w-40 rounded-box bg-base-100 p-2 shadow">
                  <li>
                    <button class="text-error" @click="handleDelete(poll.id)">
                      <IconTrash class="w-4 h-4" /> {{ t('creator.delete') }}
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div v-if="hasMore" class="flex justify-center py-4">
          <button class="btn btn-ghost btn-sm" @click="loadMore">
            {{ t('common.loadMore') }}
          </button>
        </div>
      </div>
    </div>

    <template #rightbar>
      <div class="space-y-4">
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body p-4">
            <h3 class="font-semibold text-sm mb-3">{{ t('creator.polls.title') }}</h3>
            <p class="text-xs text-base-content/60">
              {{ t('creator.polls.questions') }}
            </p>
          </div>
        </div>
      </div>
    </template>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { IconMoreVertical, IconTrash } from '#components'
import type { SnPollWithStats } from '~/types/creator'
import { fetchPolls, deletePoll } from '~/utils/creator'

definePageMeta({ middleware: 'creator' })

const { t } = useI18n()
const route = useRoute()
const pubName = computed(() => route.params.pubName as string)

const creator = useCreator()
const { currentPublisher } = creator

defineOgImage('UniOgImage', { title: computed(() => `${t('creator.polls.title')} - ${currentPublisher.value?.nick ?? pubName.value}`) })

useSolarSeo({ title: computed(() => `${t('creator.polls.title')} - ${currentPublisher.value?.nick ?? pubName.value}`) })

const pollList = ref<SnPollWithStats[]>([])
const offset = ref(0)
const total = ref(0)
const hasMore = computed(() => pollList.value.length < total.value)

const { status, error } = await useAsyncData(
  `creator-polls-${pubName.value}`,
  async () => {
    const result = await fetchPolls(pubName.value)
    pollList.value = result.items
    total.value = result.total
    offset.value = result.items.length
    return result
  },
)

const polls = computed(() => pollList.value)

async function loadMore() {
  const result = await fetchPolls(pubName.value, offset.value)
  pollList.value = [...pollList.value, ...result.items]
  offset.value += result.items.length
}

async function handleDelete(id: string) {
  if (!confirm(t('creator.polls.deleteConfirm'))) return
  await deletePoll(id)
  const result = await fetchPolls(pubName.value)
  pollList.value = result.items
  total.value = result.total
  offset.value = result.items.length
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString()
}
</script>
