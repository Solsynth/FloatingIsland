<template>
  <NuxtLayout name="developer">
    <div class="mx-auto max-w-4xl pt-4">
      <!-- Stats Card -->
      <div v-if="stats" class="card bg-base-100 shadow-sm mb-6">
        <div class="card-body p-5">
          <h3 class="text-lg font-bold mb-4">{{ t('developer.overview') }}</h3>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="stat bg-base-200 rounded-box">
              <div class="stat-title">{{ t('developer.stats.totalCustomApps') }}</div>
              <div class="stat-value text-primary">{{ stats.totalCustomApps }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Projects Section -->
      <div class="card bg-base-100 shadow-sm">
        <div class="card-body p-4">
          <div class="flex items-center justify-between mb-4">
            <h3 class="card-title text-base">{{ t('developer.projects.title') }}</h3>
            <button class="btn btn-primary btn-sm" @click="openCreateProjectModal">
              <IconPlus class="w-4 h-4" />
              {{ t('developer.projects.create') }}
            </button>
          </div>

          <div v-if="isLoadingProjects" class="flex justify-center py-8">
            <span class="loading loading-spinner loading-lg" />
          </div>

          <template v-else>
            <div v-if="projects.length > 0" class="space-y-2">
              <NuxtLink
                v-for="project in projects"
                :key="project.id"
                :to="`/developers/${pubName}/projects/${project.id}`"
                class="flex items-center gap-4 rounded-xl p-3 transition-colors hover:bg-base-200"
              >
                <div class="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-secondary-content">
                  <IconFolder class="w-5 h-5" />
                </div>
                <div class="min-w-0 flex-1">
                  <div class="font-medium">{{ project.name }}</div>
                  <div class="text-sm text-base-content/50">{{ project.description }}</div>
                </div>
                <IconChevronRight class="w-5 h-5 text-base-content/30" />
              </NuxtLink>
            </div>

            <div v-else class="flex flex-col items-center py-8 text-center">
              <IconFolder class="w-12 h-12 text-base-content/20 mb-4" />
              <p class="text-base-content/60 mb-4">{{ t('developer.projects.noProjects') }}</p>
            </div>
          </template>
        </div>
      </div>

      <!-- Create Project Modal -->
      <dialog class="modal" :class="{ 'modal-open': createProjectModalOpen }" @close="createProjectModalOpen = false">
        <div class="modal-box">
          <h3 class="font-bold text-lg mb-4">{{ t('developer.projects.create') }}</h3>
          <form @submit.prevent="handleCreateProject">
            <div class="form-control mb-4">
              <label class="label">
                <span class="label-text">{{ t('developer.projects.name') }}</span>
              </label>
              <input
                v-model="newProject.name"
                type="text"
                class="input input-bordered w-full"
                required
              />
            </div>
            <div class="form-control mb-4">
              <label class="label">
                <span class="label-text">{{ t('developer.projects.slug') }}</span>
              </label>
              <input
                v-model="newProject.slug"
                type="text"
                class="input input-bordered w-full"
                required
              />
            </div>
            <div class="form-control mb-4">
              <label class="label">
                <span class="label-text">{{ t('developer.projects.description') }}</span>
              </label>
              <textarea
                v-model="newProject.description"
                class="textarea textarea-bordered w-full"
                rows="3"
              />
            </div>
            <div class="modal-action">
              <button type="button" class="btn" @click="createProjectModalOpen = false">{{ t('common.cancel') }}</button>
              <button type="submit" class="btn btn-primary" :disabled="isCreatingProject">
                <span v-if="isCreatingProject" class="loading loading-spinner loading-sm" />
                {{ t('common.create') }}
              </button>
            </div>
          </form>
        </div>
        <form method="dialog" class="modal-backdrop">
          <button @click="createProjectModalOpen = false">close</button>
        </form>
      </dialog>
    </div>

    <template #rightbar>
      <div class="space-y-4">
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body p-4">
            <h3 class="font-semibold text-sm mb-3">{{ t('developer.dashboard') }}</h3>
            <p class="text-xs text-base-content/60">
              {{ t('developer.dashboardDescription') }}
            </p>
          </div>
        </div>
      </div>
    </template>
  </NuxtLayout>
</template>

<script setup lang="ts">
import {
  IconPlus,
  IconFolder,
  IconChevronRight,
} from '#components'
import type { DeveloperStats, DevProject } from '~/types/developer'
import { fetchDeveloperStats, fetchDevProjects, createDevProject } from '~/utils/developer'

definePageMeta({ middleware: 'developer' })

const { t } = useI18n()
const route = useRoute()
const pubName = computed(() => route.params.pubName as string)

const stats = ref<DeveloperStats | null>(null)
const projects = ref<DevProject[]>([])
const isLoadingProjects = ref(false)
const createProjectModalOpen = ref(false)
const isCreatingProject = ref(false)

const newProject = reactive({
  name: '',
  slug: '',
  description: '',
})

useSolarSeo({ title: `${t('developer.dashboard')} - ${pubName.value}` })

async function loadData() {
  isLoadingProjects.value = true
  try {
    const [statsData, projectsData] = await Promise.all([
      fetchDeveloperStats(pubName.value),
      fetchDevProjects(pubName.value),
    ])
    stats.value = statsData
    projects.value = projectsData
  } catch (e) {
    console.error(e)
  } finally {
    isLoadingProjects.value = false
  }
}

function openCreateProjectModal() {
  newProject.name = ''
  newProject.slug = ''
  newProject.description = ''
  createProjectModalOpen.value = true
}

async function handleCreateProject() {
  isCreatingProject.value = true
  try {
    await createDevProject(pubName.value, {
      name: newProject.name,
      slug: newProject.slug,
      description: newProject.description,
    })
    createProjectModalOpen.value = false
    await loadData()
  } catch (e) {
    console.error(e)
  } finally {
    isCreatingProject.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>
