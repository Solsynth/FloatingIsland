<template>
  <NuxtLayout name="developer">
    <div class="mx-auto max-w-4xl pt-4">
      <h2 class="text-2xl font-bold mb-6">{{ t('developer.settings') }}</h2>

      <div class="space-y-6">
        <!-- Developer Info Card -->
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body p-5">
            <h3 class="card-title text-base mb-4">{{ t('developer.settingsDeveloperInfo') }}</h3>
            <div v-if="developerInfo" class="space-y-4">
              <div class="flex items-center gap-4">
                <div class="avatar">
                  <div class="w-14 rounded-full">
                    <img
                      v-if="getFileUrl(developerInfo.publisher?.picture?.id)"
                      :src="getFileUrl(developerInfo.publisher?.picture?.id)"
                      :alt="developerInfo.publisher?.nick"
                    />
                    <div
                      v-else
                      class="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-content text-lg font-bold"
                    >
                      {{ developerInfo.publisher?.nick?.slice(0, 2).toUpperCase() }}
                    </div>
                  </div>
                </div>
                <div>
                  <div class="text-lg font-bold">{{ developerInfo.publisher?.nick }}</div>
                  <div class="text-sm text-base-content/50">@{{ developerInfo.publisher?.name }}</div>
                </div>
              </div>
              <div v-if="developerInfo.publisher?.bio" class="text-sm text-base-content/70">
                {{ developerInfo.publisher.bio }}
              </div>
              <div class="text-xs text-base-content/40">
                {{ t('developer.settingsMemberSince') }}: {{ formatDate(developerInfo.publisher?.createdAt) }}
              </div>
            </div>
            <div v-else class="flex justify-center py-4">
              <span class="loading loading-spinner loading-md" />
            </div>
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body p-5">
            <h3 class="card-title text-base mb-4">{{ t('developer.settingsQuickStats') }}</h3>
            <div v-if="stats" class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div class="stat bg-base-200 rounded-box">
                <div class="stat-title">{{ t('developer.stats.totalCustomApps') }}</div>
                <div class="stat-value text-primary text-2xl">{{ stats.totalCustomApps }}</div>
              </div>
              <div class="stat bg-base-200 rounded-box">
                <div class="stat-title">{{ t('developer.projects.title') }}</div>
                <div class="stat-value text-secondary text-2xl">{{ stats.totalProjects ?? 0 }}</div>
              </div>
              <div class="stat bg-base-200 rounded-box">
                <div class="stat-title">{{ t('developer.bots.title') }}</div>
                <div class="stat-value text-accent text-2xl">{{ stats.totalBots ?? 0 }}</div>
              </div>
            </div>
            <div v-else class="flex justify-center py-4">
              <span class="loading loading-spinner loading-md" />
            </div>
          </div>
        </div>


      </div>
    </div>

    <template #rightbar>
      <div class="space-y-4">
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body p-4">
            <h3 class="font-semibold text-sm mb-3">{{ t('developer.settings') }}</h3>
            <p class="text-xs text-base-content/60">
              {{ t('developer.settingsDescription') }}
            </p>
          </div>
        </div>
      </div>
    </template>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { getFileUrl } from '~/utils/files'
import type { DeveloperStats } from '~/types/developer'
import { fetchDeveloperStats } from '~/utils/developer'

definePageMeta({ middleware: 'developer' })

const { t } = useI18n()
const route = useRoute()
const pubName = computed(() => route.params.pubName as string)
const developer = useDeveloper()
const { currentDeveloper } = developer

const stats = ref<DeveloperStats | null>(null)
const isLoading = ref(false)

const developerInfo = computed(() => currentDeveloper.value)

defineOgImage('UniOgImage', { title: `${t('developer.settings')} - ${pubName.value}` })

useSolarSeo({ title: `${t('developer.settings')} - ${pubName.value}` })

function formatDate(dateStr?: string) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString()
}

async function loadData() {
  isLoading.value = true
  try {
    await developer.loadDevelopers()
    developer.selectByPublisherName(pubName.value)
    stats.value = await fetchDeveloperStats(pubName.value)
  } catch (e) {
    console.error(e)
  } finally {
    isLoading.value = false
  }
}

watch(pubName, () => {
  loadData()
}, { immediate: true })
</script>
