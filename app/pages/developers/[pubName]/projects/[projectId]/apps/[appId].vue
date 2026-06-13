<template>
  <NuxtLayout name="developer">
    <div class="mx-auto max-w-4xl">
      <div v-if="isLoading" class="flex justify-center py-8">
        <span class="loading loading-spinner loading-lg" />
      </div>

      <template v-else-if="app">
        <!-- App Header -->
        <div class="flex items-center gap-4 mb-6 -mx-4">
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
                    {{ secret.type }}
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

      <!-- Edit App Modal -->
      <dialog class="modal" :class="{ 'modal-open': editModalOpen }" @close="editModalOpen = false">
        <div class="modal-box max-w-2xl">
          <h3 class="font-bold text-lg mb-4">{{ t('common.edit') }} - {{ app?.name }}</h3>
          <div class="tabs tabs-border mb-4">
            <button
              v-for="tab in editTabs"
              :key="tab.key"
              class="tab"
              :class="{ 'tab-active': editActiveTab === tab.key }"
              @click="editActiveTab = tab.key"
            >
              {{ tab.label }}
            </button>
          </div>

          <!-- Basic Info Tab -->
          <form v-if="editActiveTab === 'basic'" @submit.prevent="handleUpdateBasic">
            <!-- Picture & Background -->
            <div class="flex items-center gap-4 mb-4">
              <div class="relative group">
                <div class="avatar cursor-pointer" @click="pickPicture">
                  <div class="w-16 rounded-full">
                    <img v-if="picturePreview" :src="picturePreview" />
                    <div v-else class="flex h-16 w-16 items-center justify-center rounded-full bg-base-300 text-base-content/50">
                      <IconCamera class="w-6 h-6" />
                    </div>
                  </div>
                </div>
                <div class="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" @click="pickPicture">
                  <IconCamera class="w-5 h-5 text-white" />
                </div>
              </div>
              <div class="flex-1">
                <div class="relative group cursor-pointer rounded-lg overflow-hidden h-20 bg-base-300" @click="pickBackground">
                  <img v-if="backgroundPreview" :src="backgroundPreview" class="w-full h-full object-cover" />
                  <div v-else class="flex h-full items-center justify-center text-base-content/50">
                    <span class="text-xs">{{ t('developer.apps.background') ?? 'Background' }}</span>
                  </div>
                  <div class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    <IconCamera class="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            </div>
            <input ref="pictureInput" type="file" accept="image/*" class="hidden" @change="onPictureSelected" />
            <input ref="backgroundInput" type="file" accept="image/*" class="hidden" @change="onBackgroundSelected" />

            <div class="form-control mb-4">
              <label class="label"><span class="label-text">{{ t('developer.apps.name') }}</span></label>
              <input v-model="editForm.name" type="text" class="input input-bordered w-full" required />
            </div>
            <div class="form-control mb-4">
              <label class="label"><span class="label-text">{{ t('developer.apps.slug') }}</span></label>
              <input v-model="editForm.slug" type="text" class="input input-bordered w-full" required />
            </div>
            <div class="form-control mb-4">
              <label class="label"><span class="label-text">{{ t('developer.apps.description') }}</span></label>
              <textarea v-model="editForm.description" class="textarea textarea-bordered w-full" rows="3" />
            </div>
            <div class="form-control mb-4">
              <label class="label"><span class="label-text">Status</span></label>
              <select v-model="editForm.status" class="select select-bordered w-full">
                <option :value="-1">Disabled</option>
                <option :value="0">Draft</option>
                <option :value="1">Active</option>
              </select>
            </div>
            <div class="modal-action">
              <button type="button" class="btn" @click="editModalOpen = false">{{ t('common.cancel') }}</button>
              <button type="submit" class="btn btn-primary" :disabled="isUpdatingApp">
                <span v-if="isUpdatingApp" class="loading loading-spinner loading-sm" />
                {{ t('common.save') }}
              </button>
            </div>
          </form>

          <!-- OAuth Tab -->
          <form v-else-if="editActiveTab === 'oauth'" @submit.prevent="handleUpdateOAuth">
            <div class="form-control mb-4">
              <label class="label"><span class="label-text">{{ t('developer.apps.oauth.clientUri') }}</span></label>
              <input v-model="oauthForm.clientUri" type="url" class="input input-bordered w-full" placeholder="https://example.com" />
            </div>
            <div class="form-control mb-4">
              <label class="label">
                <span class="label-text">{{ t('developer.apps.oauth.redirectUris') }}</span>
                <span class="label-text-alt">{{ t('common.search').replace('...', '') }}: one per line</span>
              </label>
              <textarea v-model="oauthForm.redirectUris" class="textarea textarea-bordered w-full" rows="3" placeholder="https://example.com/callback" />
            </div>
            <div class="form-control mb-4">
              <label class="label"><span class="label-text">{{ t('developer.apps.oauth.allowedScopes') }}</span></label>
              <input v-model="oauthForm.allowedScopes" type="text" class="input input-bordered w-full" placeholder="openid profile email" />
            </div>
            <div class="flex gap-6 mb-4">
              <label class="label cursor-pointer gap-2">
                <input v-model="oauthForm.requirePkce" type="checkbox" class="checkbox checkbox-sm" />
                <span class="label-text">{{ t('developer.apps.oauth.requirePkce') }}</span>
              </label>
              <label class="label cursor-pointer gap-2">
                <input v-model="oauthForm.allowOfflineAccess" type="checkbox" class="checkbox checkbox-sm" />
                <span class="label-text">{{ t('developer.apps.oauth.allowOfflineAccess') }}</span>
              </label>
              <label class="label cursor-pointer gap-2">
                <input v-model="oauthForm.isPublicClient" type="checkbox" class="checkbox checkbox-sm" />
                <span class="label-text">{{ t('developer.apps.oauth.isPublicClient') }}</span>
              </label>
            </div>
            <div class="modal-action">
              <button type="button" class="btn" @click="editModalOpen = false">{{ t('common.cancel') }}</button>
              <button type="submit" class="btn btn-primary" :disabled="isUpdatingApp">
                <span v-if="isUpdatingApp" class="loading loading-spinner loading-sm" />
                {{ t('common.save') }}
              </button>
            </div>
          </form>

          <!-- Links Tab -->
          <form v-else-if="editActiveTab === 'links'" @submit.prevent="handleUpdateLinks">
            <div class="form-control mb-4">
              <label class="label"><span class="label-text">{{ t('developer.apps.links.homePage') ?? 'Home Page' }}</span></label>
              <input v-model="linksForm.homePage" type="url" class="input input-bordered w-full" placeholder="https://example.com" />
            </div>
            <div class="form-control mb-4">
              <label class="label"><span class="label-text">{{ t('developer.apps.links.privacyPolicy') ?? 'Privacy Policy' }}</span></label>
              <input v-model="linksForm.privacyPolicy" type="url" class="input input-bordered w-full" placeholder="https://example.com/privacy" />
            </div>
            <div class="form-control mb-4">
              <label class="label"><span class="label-text">{{ t('developer.apps.links.termsOfService') ?? 'Terms of Service' }}</span></label>
              <input v-model="linksForm.termsOfService" type="url" class="input input-bordered w-full" placeholder="https://example.com/terms" />
            </div>
            <div class="modal-action">
              <button type="button" class="btn" @click="editModalOpen = false">{{ t('common.cancel') }}</button>
              <button type="submit" class="btn btn-primary" :disabled="isUpdatingApp">
                <span v-if="isUpdatingApp" class="loading loading-spinner loading-sm" />
                {{ t('common.save') }}
              </button>
            </div>
          </form>
        </div>
        <form method="dialog" class="modal-backdrop">
          <button @click="editModalOpen = false">close</button>
        </form>
      </dialog>

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
              <label class="label">
                <span class="label-text">Type</span>
              </label>
              <select v-model="newSecret.type" class="select select-bordered w-full">
                <option value="AppConnect">App Connect</option>
                <option value="Oidc">OIDC</option>
              </select>
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
  IconCamera,
} from '#components'
import { getFileUrl } from '~/utils/files'
import { uploadDriveFile } from '~/utils/api'
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
const developer = useDeveloper()

const app = ref<CustomApp | null>(null)
const secrets = ref<CustomAppSecret[]>([])
const isLoading = ref(false)
const secretModalOpen = ref(false)
const isCreatingSecret = ref(false)
const editModalOpen = ref(false)
const isUpdatingApp = ref(false)
const editActiveTab = ref<'basic' | 'oauth' | 'links'>('basic')

const editTabs = computed(() => [
  { key: 'basic' as const, label: t('developer.apps.name') },
  { key: 'oauth' as const, label: t('developer.apps.oauth.title') },
  { key: 'links' as const, label: t('developer.apps.links.title') },
])

const editForm = reactive({
  name: '',
  slug: '',
  description: '',
  status: 0,
})

const oauthForm = reactive({
  clientUri: '',
  redirectUris: '',
  allowedScopes: '',
  requirePkce: false,
  allowOfflineAccess: false,
  isPublicClient: false,
})

const linksForm = reactive({
  homePage: '',
  privacyPolicy: '',
  termsOfService: '',
})

const newSecret = reactive({
  description: '',
  type: 'AppConnect',
})

// Picture / background
const pictureInput = ref<HTMLInputElement | null>(null)
const backgroundInput = ref<HTMLInputElement | null>(null)
const pictureId = ref<string | null>(null)
const backgroundId = ref<string | null>(null)
const picturePreview = ref<string | null>(null)
const backgroundPreview = ref<string | null>(null)

defineOgImage('UniOgImage', { title: `${t('developer.apps.detail')} - ${pubName.value}` })

useSolarSeo({ title: `${t('developer.apps.detail')} - ${pubName.value}` })

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString()
}

async function loadData() {
  isLoading.value = true
  try {
    await developer.loadDevelopers()
    developer.selectByPublisherName(pubName.value)

    const appData = await fetchCustomApp(pubName.value, projectId.value, appId.value)
    app.value = appData

    const secretsResult = await fetchAppSecrets(pubName.value, projectId.value, appId.value)
    secrets.value = secretsResult
  } catch (e) {
    console.error(e)
  } finally {
    isLoading.value = false
  }
}

function pickPicture() { pictureInput.value?.click() }
function pickBackground() { backgroundInput.value?.click() }

async function onPictureSelected(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  picturePreview.value = URL.createObjectURL(file)
  try {
    const uploaded = await uploadDriveFile(file, { usage: 'avatar' })
    pictureId.value = uploaded.id
  } catch (err) {
    console.error('Upload failed:', err)
    picturePreview.value = null
  }
}

async function onBackgroundSelected(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  backgroundPreview.value = URL.createObjectURL(file)
  try {
    const uploaded = await uploadDriveFile(file, { usage: 'background' })
    backgroundId.value = uploaded.id
  } catch (err) {
    console.error('Upload failed:', err)
    backgroundPreview.value = null
  }
}

function openEditModal() {
  if (!app.value) return
  editActiveTab.value = 'basic'
  editForm.name = app.value.name
  editForm.slug = app.value.slug
  editForm.description = app.value.description ?? ''
  editForm.status = app.value.status
  const oc = app.value.oauthConfig
  oauthForm.clientUri = oc?.clientUri ?? ''
  oauthForm.redirectUris = oc?.redirectUris?.join('\n') ?? ''
  oauthForm.allowedScopes = oc?.allowedScopes?.join(' ') ?? ''
  oauthForm.requirePkce = oc?.requirePkce ?? false
  oauthForm.allowOfflineAccess = oc?.allowOfflineAccess ?? false
  oauthForm.isPublicClient = oc?.isPublicClient ?? false
  const lk = app.value.links
  linksForm.homePage = lk?.homePage ?? ''
  linksForm.privacyPolicy = lk?.privacyPolicy ?? ''
  linksForm.termsOfService = lk?.termsOfService ?? ''
  pictureId.value = app.value.picture?.id ?? null
  backgroundId.value = app.value.background?.id ?? null
  picturePreview.value = pictureId.value ? getFileUrl(pictureId.value) : null
  backgroundPreview.value = backgroundId.value ? getFileUrl(backgroundId.value) : null
  editModalOpen.value = true
}

async function handleUpdateBasic() {
  isUpdatingApp.value = true
  try {
    await updateCustomApp(pubName.value, projectId.value, appId.value, {
      name: editForm.name,
      slug: editForm.slug,
      description: editForm.description || null,
      pictureId: pictureId.value ?? undefined,
      backgroundId: backgroundId.value ?? undefined,
      status: editForm.status,
    })
    editModalOpen.value = false
    app.value = await fetchCustomApp(pubName.value, projectId.value, appId.value)
  } catch (e) {
    console.error(e)
  } finally {
    isUpdatingApp.value = false
  }
}

async function handleUpdateOAuth() {
  isUpdatingApp.value = true
  try {
    const uris = oauthForm.redirectUris
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean)
    const scopes = oauthForm.allowedScopes
      .split(/[,\s]+/)
      .map(s => s.trim())
      .filter(Boolean)
    await updateCustomApp(pubName.value, projectId.value, appId.value, {
      oauthConfig: {
        clientUri: oauthForm.clientUri || null,
        redirectUris: uris,
        allowedScopes: scopes,
        requirePkce: oauthForm.requirePkce,
        allowOfflineAccess: oauthForm.allowOfflineAccess,
        isPublicClient: oauthForm.isPublicClient,
      },
    })
    editModalOpen.value = false
    app.value = await fetchCustomApp(pubName.value, projectId.value, appId.value)
  } catch (e) {
    console.error(e)
  } finally {
    isUpdatingApp.value = false
  }
}

async function handleUpdateLinks() {
  isUpdatingApp.value = true
  try {
    await updateCustomApp(pubName.value, projectId.value, appId.value, {
      links: {
        homePage: linksForm.homePage || null,
        privacyPolicy: linksForm.privacyPolicy || null,
        termsOfService: linksForm.termsOfService || null,
      },
    })
    editModalOpen.value = false
    app.value = await fetchCustomApp(pubName.value, projectId.value, appId.value)
  } catch (e) {
    console.error(e)
  } finally {
    isUpdatingApp.value = false
  }
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
  newSecret.type = 'AppConnect'
  secretModalOpen.value = true
}

async function handleCreateSecret() {
  isCreatingSecret.value = true
  try {
    await createAppSecret(pubName.value, projectId.value, appId.value, {
      description: newSecret.description || undefined,
      type: newSecret.type,
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

// Load on mount and when route params change
watch([pubName, projectId, appId], () => {
  loadData()
}, { immediate: true })
</script>
