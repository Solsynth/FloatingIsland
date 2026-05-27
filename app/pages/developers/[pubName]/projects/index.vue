<template>
  <NuxtLayout name="developer">
    <div class="mx-auto max-w-4xl pt-4">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-2xl font-bold">{{ t('developer.projects.title') }}</h2>
        <button class="btn btn-primary btn-sm" @click="openCreateModal">
          <IconPlus class="w-4 h-4" />
          {{ t('developer.projects.create') }}
        </button>
      </div>

      <div class="card bg-base-100 shadow-sm">
        <div class="card-body p-4">
          <div v-if="isLoading" class="flex justify-center py-8">
            <span class="loading loading-spinner loading-lg" />
          </div>

          <template v-else>
            <div v-if="projects.length > 0" class="space-y-2">
              <div
                v-for="project in projects"
                :key="project.id"
                class="flex items-center gap-4 rounded-xl p-3 transition-colors hover:bg-base-200"
              >
                <div class="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-secondary-content">
                  <IconFolder class="w-5 h-5" />
                </div>
                <div class="min-w-0 flex-1">
                  <div class="font-medium">{{ project.name }}</div>
                  <div class="text-sm text-base-content/50">{{ project.description }}</div>
                  <div class="text-xs text-base-content/40 mt-1">{{ project.slug }}</div>
                </div>
                <div class="flex gap-2">
                  <button class="btn btn-ghost btn-xs" @click="openEditModal(project)">
                    <IconEdit class="w-4 h-4" />
                  </button>
                  <button class="btn btn-ghost btn-xs text-error" @click="handleDelete(project)">
                    <IconTrash class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div v-else class="flex flex-col items-center py-8 text-center">
              <IconFolder class="w-12 h-12 text-base-content/20 mb-4" />
              <p class="text-base-content/60">{{ t('developer.projects.noProjects') }}</p>
            </div>
          </template>
        </div>
      </div>

      <!-- Create/Edit Project Modal -->
      <dialog class="modal" :class="{ 'modal-open': modalOpen }" @close="modalOpen = false">
        <div class="modal-box">
          <h3 class="font-bold text-lg mb-4">
            {{ editingProject ? t('developer.projects.edit') : t('developer.projects.create') }}
          </h3>
          <form @submit.prevent="handleSubmit">
            <div class="form-control mb-4">
              <label class="label">
                <span class="label-text">{{ t('developer.projects.name') }}</span>
              </label>
              <input
                v-model="formData.name"
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
                v-model="formData.slug"
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
                v-model="formData.description"
                class="textarea textarea-bordered w-full"
                rows="3"
              />
            </div>
            <div class="modal-action">
              <button type="button" class="btn" @click="modalOpen = false">{{ t('common.cancel') }}</button>
              <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                <span v-if="isSubmitting" class="loading loading-spinner loading-sm" />
                {{ editingProject ? t('common.save') : t('common.create') }}
              </button>
            </div>
          </form>
        </div>
        <form method="dialog" class="modal-backdrop">
          <button @click="modalOpen = false">close</button>
        </form>
      </dialog>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import {
  IconPlus,
  IconFolder,
  IconEdit,
  IconTrash,
} from '#components'
import type { DevProject } from '~/types/developer'
import {
  fetchDevProjects,
  createDevProject,
  updateDevProject,
  deleteDevProject,
} from '~/utils/developer'

definePageMeta({ middleware: 'developer' })

const { t } = useI18n()
const route = useRoute()
const pubName = computed(() => route.params.pubName as string)

const projects = ref<DevProject[]>([])
const isLoading = ref(false)
const modalOpen = ref(false)
const isSubmitting = ref(false)
const editingProject = ref<DevProject | null>(null)

const formData = reactive({
  name: '',
  slug: '',
  description: '',
})

useSolarSeo({ title: `${t('developer.projects.title')} - ${pubName.value}` })

async function loadProjects() {
  isLoading.value = true
  try {
    projects.value = await fetchDevProjects(pubName.value)
  } catch (e) {
    console.error(e)
  } finally {
    isLoading.value = false
  }
}

function openCreateModal() {
  editingProject.value = null
  formData.name = ''
  formData.slug = ''
  formData.description = ''
  modalOpen.value = true
}

function openEditModal(project: DevProject) {
  editingProject.value = project
  formData.name = project.name
  formData.slug = project.slug
  formData.description = project.description
  modalOpen.value = true
}

async function handleSubmit() {
  isSubmitting.value = true
  try {
    if (editingProject.value) {
      await updateDevProject(pubName.value, editingProject.value.id, {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
      })
    } else {
      await createDevProject(pubName.value, {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
      })
    }
    modalOpen.value = false
    await loadProjects()
  } catch (e) {
    console.error(e)
  } finally {
    isSubmitting.value = false
  }
}

async function handleDelete(project: DevProject) {
  if (!confirm(t('developer.projects.deleteConfirm'))) return
  try {
    await deleteDevProject(pubName.value, project.id)
    await loadProjects()
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => {
  loadProjects()
})
</script>
