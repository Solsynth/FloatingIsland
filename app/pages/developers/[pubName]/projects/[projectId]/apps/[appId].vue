<template>
  <NuxtLayout name="developer">
    <div class="mx-auto max-w-4xl pt-4">
      <div v-if="isLoading" class="flex justify-center py-8">
        <span class="loading loading-spinner loading-lg" />
      </div>

      <template v-else-if="app">
        <!-- App Header -->
        <div class="flex items-center gap-4 mb-6">
          <NuxtLink :to="`/developers/${pubName}/projects/${projectId}/apps`" class="btn btn-ghost btn-sm">
            <IconArrowLeft class="w-4 h-4" />
            {{ t('developer.apps.title') }}
          </NuxtLink>
        </div>

        <div class="card bg-base-100 shadow-sm mb-6">
          <div class="card-body p-5">
            <div class="flex items-start gap-4">
              <div class="avatar">
                <div class="w-16 rounded-full">
                  <img v-if="getFileUrl(app.picture?.id)" :src="getFileUrl(app.picture?.id)" :alt="app.name" />
                  <div v-else class="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-accent-content text-xl font-bold">
                    {{ app.name?.slice(0, 2).toUpperCase() }}
                  </div>
                </div>
              </div>
              <div class="flex-1">
                <h2 class="text-2xl font-bold">{{ app.name }}</h2>
                <p class="text-base-content/50 mt-1">{{ app.slug }}</p>
                <span
                  class="badge badge-sm mt-2"
                  :class="{
                    'badge-success': app.status === 1,
                    'badge-warning': app.status === 0,
                    'badge-error': app.status === -1,
                  }"
                >
                  {{ app.status === 1 ? 'Active' : app.status === 0 ? 'Draft' : 'Disabled' }}
                </span>
              </div>
              <div class="flex gap-2">
                <button class="btn btn-ghost btn-sm" @click="openEditModal">
                  <IconEdit class="w-4 h-4" />
                  {{ t('common.edit') }}
                </button>
                <button class="btn btn-ghost btn-sm text-error" @click="handleDelete">
                  <IconTrash class="w-4 h-4" />
                  {{ t('common.delete') }}
                </button>
              </div>
            </div>
            <p v-if="app.description" class="mt-4 text-base-content/70">
              {{ app.description }}
            </p>
          </div>
        </div>

        <!-- Secrets Section -->
        <div class="card bg-base-100 shadow-sm mb-6">
          <div class="card-body p-4">
            <div class="flex items-center justify-between mb-4">
              <h3 class="card-title text-base">{{ t('developer.apps.secrets.title') }}</h3>
              <button class="btn btn-primary btn-sm" @click="openCreateSecretModal">
                <IconPlus class="w-4 h-4" />
                {{ t('developer.apps.secrets.create') }}
              </button>
            </div>
            <div v-if="secrets.length > 0" class="space-y-2">
              <div
                v-for="secret in secrets"
                :key="secret.id"
                class="flex items-center gap-3 rounded-lg p-3 bg-base-200"
              >
                <div class="flex-1">
                  <div class="font-medium text-sm">{{ secret.description || t('developer.apps.secrets.noDescription') }}</div>
                  <div class="text-xs text-base-content/50">
                    {{ secret.isOidc ? 'OIDC' : 'API' }}
                    <span v-if="secret.expiredAt"> &middot; {{ t('developer.apps.secrets.expires') }}: {{ formatDate(secret.expiredAt) }}</span>
                  </div>
                </div>
                <button class="btn btn-ghost btn-xs text-error" @click="handleDeleteSecret(secret.id)">
                  <IconTrash class="w-3 h-3" />
                </button>
              </div>
            </div>
            <p v-else class="text-sm text-base-content/50">{{ t('developer.apps.secrets.noSecrets') }}</p>
          </div>
        </div>

        <!-- OAuth Config -->
        <div v-if="app.oauthConfig" class="card bg-base-100 shadow-sm mb-6">
          <div class="card-body p-4">
            <h3 class="card-title text-base mb-4">{{ t('developer.apps.oauth.title') }}</h3>
            <div class="space-y-3">
              <div>
                <div class="text-sm font-medium">{{ t('developer.apps.oauth.clientUri') }}</div>
                <div class="text-sm text-base-content/70">{{ app.oauthConfig.clientUri || '-' }}</div>
              </div>
              <div>
                <div class="text-sm font-medium">{{ t('developer.apps.oauth.redirectUris') }}</div>
                <div v-if="app.oauthConfig.redirectUris.length > 0" class="mt-1 space-y-1">
                  <div v-for="uri in app.oauthConfig.redirectUris" :key="uri" class="text-sm text-base-content/70 bg-base-200 rounded px-2 py-1">
                    {{ uri }}
                  </div>
                </div>
                <div v-else class="text-sm text-base-content/50">-</div>
              </div>
              <div>
                <div class="text-sm font-medium">{{ t('developer.apps.oauth.allowedScopes') }}</div>
                <div class="flex flex-wrap gap-1 mt-1">
                  <span v-for="scope in app.oauthConfig.allowedScopes" :key="scope" class="badge badge-sm">
                    {{ scope }}
                  </span>
                </div>
              </div>
              <div class="flex gap-4">
                <div>
                  <div class="text-sm font-medium">{{ t('developer.apps.oauth.requirePkce') }}</div>
                  <div class="text-sm text-base-content/70">{{ app.oauthConfig.requirePkce ? 'Yes' : 'No' }}</div>
                </div>
                <div>
                  <div class="text-sm font-medium">{{ t('developer.apps.oauth.allowOfflineAccess') }}</div>
                  <div class="text-sm text-base-content/70">{{ app.oauthConfig.allowOfflineAccess ? 'Yes' : 'No' }}</div>
                </div>
                <div>
                  <div class="text-sm font-medium">{{ t('developer.apps.oauth.isPublicClient') }}</div>
                  <div class="text-sm text-base-content/70">{{ app.oauthConfig.isPublicClient ? 'Yes' : 'No' }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Links -->
        <div v-if="app.links" class="card bg-base-100 shadow-sm">
          <div class="card-body p-4">
            <h3 class="card-title text-base mb-4">{{ t('developer.apps.links.title') }}</h3>
            <div class="space-y-2">
              <div v-if="app.links.homePage" class="flex items-center gap-2">
                <IconLink class="w-4 h-4 text-base-content/50" />
                <a :href="app.links.homePage" target="_blank" class="link link-primary text-sm">{{ app.links.homePage }}</a>
              </div>
              <div v-if="app.links.privacyPolicy" class="flex items-center gap-2">
                <IconShield class="w-4 h-4 text-base-content/50" />
                <a :href="app.links.privacyPolicy" target="_blank" class="link link-primary text-sm">{{ app.links.privacyPolicy }}</a>
              </div>
              <div v-if="app.links.termsOfService" class="flex items-center gap-2">
                <IconFileText class="w-4 h-4 text-base-content/50" />
                <a :href="app.links.termsOfService" target="_blank" class="link link-primary text-sm">{{ app.links.termsOfService }}</a>
              </div>
              <p v-if="!app.links.homePage && !app.links.privacyPolicy && !app.links.termsOfService" class="text-sm text-base-content/50">
                {{ t('developer.apps.links.noLinks') }}
              </p>
            </div>
          </div>
        </div>
      </template>

      <div v-else class="flex flex-col items-center py-8 text-center">
        <IconBoxes class="w-12 h-12 text-base-content/20 mb-4" />
        <p class="text-base-content/60">{{ t('developer.apps.notFound') }}</p>
        <NuxtLink :to="`/developers/${pubName}/projects/${projectId}/apps`" class="btn btn-primary btn-sm mt-4">
          {{ t('developer.apps.backToList') }}
        </NuxtLink>
      </div>

      <!-- Create Secret Modal -->
      <dialog class="modal" :class="{ 'modal-open': secretModalOpen }" @close="secretModalOpen = false">
        <div class="modal-box">
          <h3 class="font-bold text-lg mb-4">{{ t('developer.apps.secrets.create') }}</h3>
          <form @submit.prevent="handleCreateSecret">
            <div class="form-control mb-4">
              <label class="label">
                <span class="label-text">{{ t('developer.apps.secrets.description') }}</span>
              </label>
              <input
                v-model="newSecret.description"
                type="text"
                class="input input-bordered w-full"
              />
            </div>
            <div class="form-control mb-4">
              <label class="label cursor-pointer">
                <span class="label-text">{{ t('developer.apps.secrets.isOidc') }}</span>
                <input v-model="newSecret.isOidc" type="checkbox" class="checkbox" />
              </label>
            </div>
            <div class="modal-action">
              <button type="button" class="btn" @click="secretModalOpen = false">{{ t('common.cancel') }}</button>
              <button type="submit" class="btn btn-primary" :disabled="isCreatingSecret">
                <span v-if="isCreatingSecret" class="loading loading-spinner loading-sm" />
                {{ t('common.create') }}
              </button>
            </div>
          </form>
        </div>
        <form method="dialog" class="modal-backdrop">
          <button @click="secretModalOpen = false">close</button>
        </form>
      </dialog>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import {
  IconArrowLeft,
  IconEdit,
  IconTrash,
  IconPlus,
  IconBoxes,
  IconLink,
  IconShield,
  IconFileText,
} from '#components'
import { getFileUrl } from '~/utils/files'
import type { CustomApp, CustomAppSecret } from '~/types/developer'
import {
  fetchCustomApp,
  updateCustomApp,
  deleteCustomApp,
  fetchAppSecrets,
  createAppSecret,
  deleteAppSecret,
} from '~/utils/developer'

definePageMeta({ middleware: 'developer' })

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const pubName = computed(() => route.params.pubName as string)
const projectId = computed(() => route.params.projectId as string)
const appId = computed(() => route.params.appId as string)

const app = ref<CustomApp | null>(null)
const secrets = ref<CustomAppSecret[]>([])
const isLoading = ref(false)
const secretModalOpen = ref(false)
const isCreatingSecret = ref(false)

const newSecret = reactive({
  description: '',
  isOidc: false,
})

useSolarSeo({ title: `${t('developer.apps.detail')} - ${pubName.value}` })

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString()
}

async function loadData() {
  isLoading.value = true
  try {
    const [appData, secretsData] = await Promise.all([
      fetchCustomApp(pubName.value, projectId.value, appId.value),
      fetchAppSecrets(pubName.value, projectId.value, appId.value),
    ])
    app.value = appData
    secrets.value = secretsData
  } catch (e) {
    console.error(e)
  } finally {
    isLoading.value = false
  }
}

function openEditModal() {
  // TODO: Implement edit modal
}

async function handleDelete() {
  if (!confirm(t('developer.apps.deleteConfirm'))) return
  try {
    await deleteCustomApp(pubName.value, projectId.value, appId.value)
    router.push(`/developers/${pubName.value}/projects/${projectId.value}/apps`)
  } catch (e) {
    console.error(e)
  }
}

function openCreateSecretModal() {
  newSecret.description = ''
  newSecret.isOidc = false
  secretModalOpen.value = true
}

async function handleCreateSecret() {
  isCreatingSecret.value = true
  try {
    await createAppSecret(pubName.value, projectId.value, appId.value, {
      description: newSecret.description || undefined,
      isOidc: newSecret.isOidc,
    })
    secretModalOpen.value = false
    secrets.value = await fetchAppSecrets(pubName.value, projectId.value, appId.value)
  } catch (e) {
    console.error(e)
  } finally {
    isCreatingSecret.value = false
  }
}

async function handleDeleteSecret(secretId: string) {
  if (!confirm(t('developer.apps.secrets.deleteConfirm'))) return
  try {
    await deleteAppSecret(pubName.value, projectId.value, appId.value, secretId)
    secrets.value = await fetchAppSecrets(pubName.value, projectId.value, appId.value)
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => {
  loadData()
})
</script>
