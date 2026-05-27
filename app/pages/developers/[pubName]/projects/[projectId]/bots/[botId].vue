<template>
  <NuxtLayout name="developer">
    <div class="mx-auto max-w-4xl pt-4">
      <div v-if="isLoading" class="flex justify-center py-8">
        <span class="loading loading-spinner loading-lg" />
      </div>

      <template v-else-if="bot">
        <!-- Bot Header -->
        <div class="flex items-center gap-4 mb-6">
          <NuxtLink :to="`/developers/${pubName}/projects/${projectId}/bots`" class="btn btn-ghost btn-sm">
            <IconArrowLeft class="w-4 h-4" />
            {{ t('developer.bots.title') }}
          </NuxtLink>
        </div>

        <div class="card bg-base-100 shadow-sm mb-6">
          <div class="card-body p-5">
            <div class="flex items-start gap-4">
              <div class="avatar">
                <div class="w-16 rounded-full">
                  <img v-if="getFileUrl(bot.account.profile?.picture?.id)" :src="getFileUrl(bot.account.profile?.picture?.id)" :alt="bot.account.nick" />
                  <div v-else class="flex h-16 w-16 items-center justify-center rounded-full bg-info text-info-content text-xl font-bold">
                    {{ bot.account.nick?.slice(0, 2).toUpperCase() }}
                  </div>
                </div>
              </div>
              <div class="flex-1">
                <h2 class="text-2xl font-bold">{{ bot.account.nick }}</h2>
                <p class="text-base-content/50 mt-1">@{{ bot.account.name }}</p>
                <div class="flex items-center gap-2 mt-2">
                  <span
                    class="badge badge-sm"
                    :class="bot.isActive ? 'badge-success' : 'badge-warning'"
                  >
                    {{ bot.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </div>
              </div>
              <div class="flex gap-2">
                <button class="btn btn-ghost btn-sm" @click="toggleActive">
                  {{ bot.isActive ? t('developer.bots.deactivate') : t('developer.bots.activate') }}
                </button>
                <button class="btn btn-ghost btn-sm text-error" @click="handleDelete">
                  <IconTrash class="w-4 h-4" />
                  {{ t('common.delete') }}
                </button>
              </div>
            </div>
            <div class="mt-4 text-sm text-base-content/50">
              <p>{{ t('developer.bots.createdAt') }}: {{ formatDate(bot.createdAt) }}</p>
              <p>{{ t('developer.bots.updatedAt') }}: {{ formatDate(bot.updatedAt) }}</p>
            </div>
          </div>
        </div>

        <!-- Keys Section -->
        <div class="card bg-base-100 shadow-sm mb-6">
          <div class="card-body p-4">
            <div class="flex items-center justify-between mb-4">
              <h3 class="card-title text-base">{{ t('developer.bots.keys.title') }}</h3>
              <button class="btn btn-primary btn-sm" @click="openCreateKeyModal">
                <IconPlus class="w-4 h-4" />
                {{ t('developer.bots.keys.create') }}
              </button>
            </div>
            <div v-if="keys.length > 0" class="space-y-2">
              <div
                v-for="key in keys"
                :key="key.id"
                class="flex items-center gap-3 rounded-lg p-3 bg-base-200"
              >
                <div class="flex-1">
                  <div class="font-medium text-sm">{{ key.description || t('developer.bots.keys.noDescription') }}</div>
                  <div class="text-xs text-base-content/50">
                    {{ key.key ? key.key.slice(0, 16) + '...' : '***' }}
                    <span v-if="key.expiredAt"> &middot; {{ t('developer.bots.keys.expires') }}: {{ formatDate(key.expiredAt) }}</span>
                  </div>
                </div>
                <button class="btn btn-ghost btn-xs text-error" @click="handleDeleteKey(key.id)">
                  <IconTrash class="w-3 h-3" />
                </button>
              </div>
            </div>
            <p v-else class="text-sm text-base-content/50">{{ t('developer.bots.keys.noKeys') }}</p>
          </div>
        </div>

        <!-- Bot Info -->
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body p-4">
            <h3 class="card-title text-base mb-4">{{ t('developer.bots.info.title') }}</h3>
            <div class="space-y-3">
              <div>
                <div class="text-sm font-medium">ID</div>
                <div class="text-sm text-base-content/70 font-mono">{{ bot.id }}</div>
              </div>
              <div>
                <div class="text-sm font-medium">Slug</div>
                <div class="text-sm text-base-content/70 font-mono">{{ bot.slug }}</div>
              </div>
              <div>
                <div class="text-sm font-medium">Project ID</div>
                <div class="text-sm text-base-content/70 font-mono">{{ bot.projectId }}</div>
              </div>
              <div>
                <div class="text-sm font-medium">Account ID</div>
                <div class="text-sm text-base-content/70 font-mono">{{ bot.account.id }}</div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <div v-else class="flex flex-col items-center py-8 text-center">
        <IconBot class="w-12 h-12 text-base-content/20 mb-4" />
        <p class="text-base-content/60">{{ t('developer.bots.notFound') }}</p>
        <NuxtLink :to="`/developers/${pubName}/projects/${projectId}/bots`" class="btn btn-primary btn-sm mt-4">
          {{ t('developer.bots.backToList') }}
        </NuxtLink>
      </div>

      <!-- Create Key Modal -->
      <dialog class="modal" :class="{ 'modal-open': keyModalOpen }" @close="keyModalOpen = false">
        <div class="modal-box">
          <h3 class="font-bold text-lg mb-4">{{ t('developer.bots.keys.create') }}</h3>
          <form @submit.prevent="handleCreateKey">
            <div class="form-control mb-4">
              <label class="label">
                <span class="label-text">{{ t('developer.bots.keys.description') }}</span>
              </label>
              <input
                v-model="newKey.description"
                type="text"
                class="input input-bordered w-full"
              />
            </div>
            <div class="modal-action">
              <button type="button" class="btn" @click="keyModalOpen = false">{{ t('common.cancel') }}</button>
              <button type="submit" class="btn btn-primary" :disabled="isCreatingKey">
                <span v-if="isCreatingKey" class="loading loading-spinner loading-sm" />
                {{ t('common.create') }}
              </button>
            </div>
          </form>
        </div>
        <form method="dialog" class="modal-backdrop">
          <button @click="keyModalOpen = false">close</button>
        </form>
      </dialog>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import {
  IconArrowLeft,
  IconTrash,
  IconPlus,
  IconBot,
} from '#components'
import { getFileUrl } from '~/utils/files'
import type { Bot, BotKey } from '~/types/developer'
import {
  fetchBot,
  updateBot,
  deleteBot,
  fetchBotKeys,
  createBotKey,
  deleteBotKey,
} from '~/utils/developer'

definePageMeta({ middleware: 'developer' })

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const pubName = computed(() => route.params.pubName as string)
const projectId = computed(() => route.params.projectId as string)
const botId = computed(() => route.params.botId as string)

const bot = ref<Bot | null>(null)
const keys = ref<BotKey[]>([])
const isLoading = ref(false)
const keyModalOpen = ref(false)
const isCreatingKey = ref(false)

const newKey = reactive({
  description: '',
})

useSolarSeo({ title: `${t('developer.bots.detail')} - ${pubName.value}` })

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString()
}

async function loadData() {
  isLoading.value = true
  try {
    const [botData, keysData] = await Promise.all([
      fetchBot(pubName.value, projectId.value, botId.value),
      fetchBotKeys(pubName.value, projectId.value, botId.value),
    ])
    bot.value = botData
    keys.value = keysData
  } catch (e) {
    console.error(e)
  } finally {
    isLoading.value = false
  }
}

async function toggleActive() {
  if (!bot.value) return
  try {
    await updateBot(pubName.value, projectId.value, botId.value, {
      isActive: !bot.value.isActive,
    })
    bot.value = await fetchBot(pubName.value, projectId.value, botId.value)
  } catch (e) {
    console.error(e)
  }
}

async function handleDelete() {
  if (!confirm(t('developer.bots.deleteConfirm'))) return
  try {
    await deleteBot(pubName.value, projectId.value, botId.value)
    router.push(`/developers/${pubName.value}/projects/${projectId.value}/bots`)
  } catch (e) {
    console.error(e)
  }
}

function openCreateKeyModal() {
  newKey.description = ''
  keyModalOpen.value = true
}

async function handleCreateKey() {
  isCreatingKey.value = true
  try {
    await createBotKey(pubName.value, projectId.value, botId.value, {
      description: newKey.description || undefined,
    })
    keyModalOpen.value = false
    keys.value = await fetchBotKeys(pubName.value, projectId.value, botId.value)
  } catch (e) {
    console.error(e)
  } finally {
    isCreatingKey.value = false
  }
}

async function handleDeleteKey(keyId: string) {
  if (!confirm(t('developer.bots.keys.deleteConfirm'))) return
  try {
    await deleteBotKey(pubName.value, projectId.value, botId.value, keyId)
    keys.value = await fetchBotKeys(pubName.value, projectId.value, botId.value)
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => {
  loadData()
})
</script>
