<template>
  <NuxtLayout name="creator">
    <div class="mx-auto max-w-4xl pt-4 space-y-6">
      <h1 class="text-xl font-bold">{{ t('creator.settings') }}</h1>

      <!-- Edit Publisher -->
      <div class="card bg-base-100 shadow-sm">
        <div class="card-body p-5">
          <h2 class="card-title text-base mb-4">{{ t('creator.editPublisher') }}</h2>
          <PublisherForm :publisher="currentPublisher" @saved="handleSaved" />
        </div>
      </div>

      <!-- Feature Flags -->
      <div class="card bg-base-100 shadow-sm">
        <div class="card-body p-5">
          <h2 class="card-title text-base mb-4">{{ t('creator.features.title') }}</h2>
          <div class="space-y-4">
            <div
              v-for="flag in featureFlags"
              :key="flag.key"
              class="flex items-start justify-between gap-4 p-3 rounded-lg bg-base-200"
            >
              <div>
                <div class="font-medium text-sm">{{ flag.label }}</div>
                <div class="text-xs text-base-content/60">{{ flag.description }}</div>
              </div>
              <input
                type="checkbox"
                class="toggle toggle-primary toggle-sm"
                :checked="features?.[flag.key] ?? false"
                @change="toggleFeature(flag.key, ($event.target as HTMLInputElement).checked)"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Fediverse -->
      <div class="card bg-base-100 shadow-sm">
        <div class="card-body p-5">
          <h2 class="card-title text-base mb-4">{{ t('creator.fediverse.title') }}</h2>

          <ConfuseSpinner v-if="fediverseStatus === 'pending'" />

          <template v-else-if="fediverse">
            <div class="flex items-start justify-between gap-4 p-3 rounded-lg bg-base-200 mb-4">
              <div>
                <div class="font-medium text-sm">
                  {{ fediverse.enabled ? t('creator.fediverse.enabled') : t('creator.fediverse.disabled') }}
                </div>
                <div class="text-xs text-base-content/60">
                  {{ fediverse.enabled ? t('creator.fediverse.disableHint') : t('creator.fediverse.enableHint') }}
                </div>
              </div>
              <input
                type="checkbox"
                class="toggle toggle-primary toggle-sm"
                :checked="fediverse.enabled"
                @change="toggleFediverse"
              />
            </div>

            <div v-if="fediverse.enabled && fediverse.actor" class="space-y-3">
              <div class="flex items-center gap-3 p-3 rounded-lg bg-base-100">
                <div class="avatar">
                  <div class="w-10 rounded-full bg-primary text-primary-content flex items-center justify-center text-sm font-bold">
                    {{ (fediverse.actor.displayName || fediverse.actor.username).slice(0, 2).toUpperCase() }}
                  </div>
                </div>
                <div>
                  <div class="font-medium text-sm">{{ fediverse.actor.displayName || fediverse.actor.username }}</div>
                  <div class="text-xs text-base-content/50">
                    @{{ fediverse.actor.username }}@{{ fediverse.actor.instance.domain }}
                  </div>
                </div>
              </div>
              <div class="text-xs text-base-content/50 space-y-1 px-3">
                <div>{{ t('creator.fediverse.actorUri') }}: {{ fediverse.actorUri || 'N/A' }}</div>
                <div>{{ t('creator.fediverse.followerCount') }}: {{ fediverse.followerCount || 0 }}</div>
              </div>
            </div>

            <details class="collapse collapse-arrow bg-base-200 mt-2">
              <summary class="collapse-title text-sm font-medium">{{ t('creator.fediverse.whatIs') }}</summary>
              <div class="collapse-content text-sm text-base-content/70">
                {{ t('creator.fediverse.about') }}
              </div>
            </details>
          </template>
        </div>
      </div>

      <!-- Danger Zone -->
      <div class="card bg-error/5 border border-error/20 shadow-sm">
        <div class="card-body p-5">
          <h2 class="card-title text-base text-error mb-4">{{ t('creator.deletePublisher') }}</h2>
          <p class="text-sm text-base-content/70 mb-4">{{ t('creator.deletePublisherConfirm') }}</p>
          <button class="btn btn-error btn-sm" @click="handleDelete">
            <IconTrash class="w-4 h-4" />
            {{ t('creator.deletePublisher') }}
          </button>
        </div>
      </div>
    </div>

    <template #rightbar>
      <div class="space-y-4">
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body p-4">
            <h3 class="font-semibold text-sm mb-3">{{ t('creator.settings') }}</h3>
            <div class="space-y-2 text-xs text-base-content/60">
              <p>{{ t('creator.editPublisher') }}</p>
              <p>{{ t('creator.features.title') }}</p>
              <p>{{ t('creator.fediverse.title') }}</p>
            </div>
          </div>
        </div>
      </div>
    </template>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { IconTrash } from '#components'
import {
  fetchPublisherFeatures,
  enablePublisherFeature,
  disablePublisherFeature,
  fetchFediverseStatus,
  enableFediverse,
  disableFediverse,
  deletePublisher,
} from '~/utils/creator'

definePageMeta({ middleware: 'creator' })

const { t } = useI18n()
const route = useRoute()
const pubName = computed(() => route.params.pubName as string)

const creator = useCreator()
const { currentPublisher } = creator

defineOgImage('UniOgImage', { title: computed(() => `${t('creator.settings')} - ${currentPublisher.value?.nick ?? pubName.value}`) })

useSolarSeo({ title: computed(() => `${t('creator.settings')} - ${currentPublisher.value?.nick ?? pubName.value}`) })

const { data: features, refresh: refreshFeatures } = await useAsyncData(
  `creator-features-${pubName.value}`,
  () => fetchPublisherFeatures(pubName.value),
)

const { data: fediverse, status: fediverseStatus, refresh: refreshFediverse } = await useAsyncData(
  `creator-fediverse-${pubName.value}`,
  () => fetchFediverseStatus(pubName.value),
)

const featureFlags = computed(() => [
  {
    key: 'followRequiresApproval',
    label: t('creator.features.followRequiresApproval'),
    description: t('creator.features.followRequiresApprovalDesc'),
  },
  {
    key: 'postsRequireFollow',
    label: t('creator.features.postsRequireFollow'),
    description: t('creator.features.postsRequireFollowDesc'),
  },
])

async function toggleFeature(flag: string, enabled: boolean) {
  if (enabled) {
    await enablePublisherFeature(pubName.value, flag)
  } else {
    await disablePublisherFeature(pubName.value, flag)
  }
  await refreshFeatures()
}

async function toggleFediverse() {
  if (!fediverse.value) return
  if (fediverse.value.enabled) {
    await disableFediverse(pubName.value)
  } else {
    await enableFediverse(pubName.value)
  }
  await refreshFediverse()
}

async function handleDelete() {
  if (!confirm(t('creator.deletePublisherConfirm'))) return
  await deletePublisher(pubName.value)
  creator.clearSelection()
  navigateTo('/creators')
}

function handleSaved() {
  creator.loadManagedPublishers()
}
</script>
