<template>
  <NuxtLayout name="creator">
    <div class="mx-auto max-w-4xl">
      <!-- Quota Card -->
      <div v-if="quota" class="card bg-base-100 shadow-sm mb-6">
        <div class="card-body p-5">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-lg font-bold">{{ quota.used }} / {{ quota.total }}</h3>
            <button class="btn btn-ghost btn-xs" @click="showQuotaInfo = !showQuotaInfo">
              <IconInfo class="w-4 h-4" />
            </button>
          </div>
          <p class="text-sm text-base-content/60 mb-2">{{ t('creator.quota.used', {
            used: quota.used, total: quota.total
            }) }}</p>
          <div v-if="showQuotaInfo" class="alert alert-info alert-soft mb-2 text-sm">
            {{ t('creator.quota.info') }}
          </div>
          <progress class="progress progress-primary w-full" :value="quota.used" :max="quota.total" />
        </div>
      </div>

      <!-- Managed Publishers -->
      <div class="card bg-base-100 shadow-sm">
        <div class="card-body p-4">
          <div v-if="isLoading" class="flex justify-center py-8">
            <span class="loading loading-spinner loading-lg" />
          </div>

          <template v-else>
            <!-- Publisher List -->
            <div v-if="managedPublishers.length > 0" class="space-y-1">
              <NuxtLink v-for="pub in managedPublishers" :key="pub.id" :to="`/creators/${pub.name}`"
                class="flex items-center gap-4 rounded-xl p-3 transition-colors hover:bg-base-200">
                <div class="avatar">
                  <div class="w-10 rounded-full">
                    <img v-if="getFileUrl(pub.picture?.id)" :src="getFileUrl(pub.picture?.id)" :alt="pub.nick" />
                    <div v-else
                      class="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-content text-sm font-bold">
                      {{ pub.nick?.slice(0, 2).toUpperCase() }}
                    </div>
                  </div>
                </div>
                <div class="min-w-0 flex-1">
                  <div class="font-medium">{{ pub.nick }}</div>
                  <div class="text-sm text-base-content/50">@{{ pub.name }}</div>
                </div>
                <IconChevronRight class="w-5 h-5 text-base-content/30" />
              </NuxtLink>
            </div>

            <!-- Empty State -->
            <div v-else class="flex flex-col items-center py-8 text-center">
              <IconInfo class="w-12 h-12 text-base-content/20 mb-4" />
              <p class="text-base-content/60 mb-4">{{ t('creator.noResults') }}</p>
            </div>

            <div class="divider my-1" />

            <!-- Invites -->
            <NuxtLink to="/creators" class="flex items-center gap-4 rounded-xl p-3 transition-colors hover:bg-base-200">
              <div class="avatar avatar-placeholder">
                <div class="w-10 rounded-full bg-secondary text-secondary-content">
                  <IconMail class="w-5 h-5" />
                </div>
              </div>
              <div class="min-w-0 flex-1">
                <div class="font-medium">{{ t('creator.invites.title') }}</div>
                <div class="text-sm text-base-content/50">
                  {{ t('creator.invites.count', { count: invites.length }) }}
                </div>
              </div>
              <IconChevronRight class="w-5 h-5 text-base-content/30" />
            </NuxtLink>

            <!-- Create Publisher -->
            <button class="flex w-full items-center gap-4 rounded-xl p-3 transition-colors hover:bg-base-200"
              @click="openCreateModal">
              <div class="avatar avatar-placeholder">
                <div class="w-10 rounded-full bg-primary text-primary-content">
                  <IconPlus class="w-5 h-5" />
                </div>
              </div>
              <div class="text-left min-w-0 flex-1">
                <div class="font-medium">{{ t('creator.createPublisher') }}</div>
              </div>
              <IconChevronRight class="w-5 h-5 text-base-content/30" />
            </button>
          </template>
        </div>
      </div>

      <!-- Invites Sheet -->
      <div v-if="invites.length > 0" class="card bg-base-100 shadow-sm mt-4">
        <div class="card-body p-4">
          <h3 class="card-title text-base mb-2">{{ t('creator.invites.title') }}</h3>
          <div class="space-y-2">
            <div v-for="invite in invites" :key="invite.id" class="flex items-center gap-3 rounded-lg p-3 bg-base-200">
              <div class="avatar">
                <div class="w-9 rounded-full">
                  <img v-if="getFileUrl(invite.publisher?.picture?.id)" :src="getFileUrl(invite.publisher?.picture?.id)"
                    :alt="invite.publisher?.nick" />
                  <div v-else
                    class="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-content text-xs font-bold">
                    {{ invite.publisher?.nick?.slice(0, 2).toUpperCase() }}
                  </div>
                </div>
              </div>
              <div class="min-w-0 flex-1">
                <div class="font-medium text-sm">{{ invite.publisher?.nick }}</div>
                <div class="text-xs text-base-content/50">
                  {{ invite.role >= 100 ? t('creator.members.owner') : invite.role >= 50 ?
                    t('creator.members.moderator') :
                  t('creator.members.member') }}
                </div>
              </div>
              <div class="flex gap-1">
                <button class="btn btn-success btn-xs" @click="handleAcceptInvite(invite.publisher!.name)">
                  <IconCheck class="w-3 h-3" />
                </button>
                <button class="btn btn-ghost btn-xs" @click="handleDeclineInvite(invite.publisher!.name)">
                  <IconX class="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Create Publisher Drawer -->
      <AdminDrawer :open="createModalOpen" :title="t('creator.createPublisher')"
        @update:open="createModalOpen = $event">
        <PublisherForm @close="closeCreateModal" @created="handlePublisherCreated" />
      </AdminDrawer>
    </div>

    <template #rightbar>
      <div class="card bg-base-100 shadow-sm min-h-full rounded-none">
        <div class="card-body p-4">
          <h3 class="font-semibold text-sm mb-3">{{ t('creator.title') }}</h3>
          <p class="text-xs text-base-content/60">
            {{ t('creator.quota.info') }}
          </p>
        </div>
      </div>
    </template>
  </NuxtLayout>
</template>

<script setup lang="ts">
import {
  IconInfo,
  IconChevronRight,
  IconMail,
  IconPlus,
  IconCheck,
  IconX,
} from '#components'
import { getFileUrl } from '~/utils/files'
import { fetchPublisherQuota, acceptInvite, declineInvite } from '~/utils/creator'
import type { PublisherQuotaInfo } from '~/types/creator'

definePageMeta({ middleware: 'creator' })

const { t } = useI18n()
const creator = useCreator()
const { managedPublishers, invites, isLoading } = creator

const quota = ref<PublisherQuotaInfo | null>(null)
const showQuotaInfo = ref(false)
const createModalOpen = ref(false)

defineOgImage('UniOgImage', { title: t('creator.title') })

useSolarSeo({
  title: t('creator.title'), breadcrumbs: [
    { name: 'Home', item: 'https://solian.app' },
    { name: 'Creators', item: 'https://solian.app/creators' }
  ]
})

function openCreateModal() {
  createModalOpen.value = true
}

function closeCreateModal() {
  createModalOpen.value = false
}

onMounted(async () => {
  await Promise.all([
    creator.loadManagedPublishers(),
    creator.loadInvites(),
  ])
  try {
    quota.value = await fetchPublisherQuota()
  } catch {
    // ignore
  }
})

async function handleAcceptInvite(pubName: string) {
  try {
    await acceptInvite(pubName)
    await Promise.all([creator.loadManagedPublishers(), creator.loadInvites()])
  } catch (e) {
    console.error(e)
  }
}

async function handleDeclineInvite(pubName: string) {
  try {
    await declineInvite(pubName)
    await creator.loadInvites()
  } catch (e) {
    console.error(e)
  }
}

function handlePublisherCreated() {
  closeCreateModal()
  creator.loadManagedPublishers()
}
</script>
