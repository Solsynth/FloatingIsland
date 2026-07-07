<template>
  <NuxtLayout name="admin">
    <div v-if="isLoading" class="flex justify-center py-16">
      <span class="loading loading-spinner loading-lg" />
    </div>

    <template v-else-if="post">
      <AdminPageHeader :title="post.title || 'Untitled Post'" :description="`Post #${post.id}`">
        <template #actions>
          <div class="flex gap-2">
            <button class="btn btn-sm btn-ghost" @click="toggleLock">
              <IconLock v-if="post.locked" class="w-4 h-4" />
              <IconLockOpen v-else class="w-4 h-4" />
              {{ post.locked ? 'Unlock' : 'Lock' }}
            </button>
            <button class="btn btn-sm btn-error" @click="deletePost">
              <IconTrash2 class="w-4 h-4" />
              Delete
            </button>
          </div>
        </template>
      </AdminPageHeader>

      <!-- Post Info -->
      <AdminCard class="mb-4">
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <span class="text-base-content/40 text-xs uppercase tracking-wider">Visibility</span>
            <div class="flex items-center gap-2 mt-1">
              <span class="badge badge-xs" :class="visibilityClass(post.visibility)">{{ post.visibility }}</span>
              <button class="btn btn-ghost btn-xs" @click="showVisibilityDialog = true">
                <IconPencil class="w-3 h-3" />
              </button>
            </div>
          </div>
          <div>
            <span class="text-base-content/40 text-xs uppercase tracking-wider">Publisher</span>
            <p class="mt-1 font-medium">{{ post.publisher?.nick || post.publisher?.name || '—' }}</p>
          </div>
          <div>
            <span class="text-base-content/40 text-xs uppercase tracking-wider">Realm</span>
            <p class="mt-1">{{ post.realm?.name || '—' }}</p>
          </div>
          <div>
            <span class="text-base-content/40 text-xs uppercase tracking-wider">Created</span>
            <p class="mt-1">{{ formatDate(post.createdAt) }}</p>
          </div>
        </div>
      </AdminCard>

      <!-- Content -->
      <AdminCard class="mb-4">
        <h3 class="text-sm font-semibold mb-3">Content</h3>
        <div class="prose prose-sm max-w-none text-base-content/80" v-html="post.body" />
      </AdminCard>

      <!-- Moderation Actions -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <!-- Shadowban -->
        <AdminCard>
          <h3 class="text-sm font-semibold mb-3 flex items-center gap-2">
            <IconEyeOff class="w-4 h-4" />
            Shadowban
          </h3>
          <div class="space-y-3">
            <p class="text-xs text-base-content/60">
              {{ post.shadowbanReason && post.shadowbanReason !== 'none'
                ? `Currently shadowbanned: ${post.shadowbanReason}`
                : 'Not shadowbanned' }}
            </p>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="reason in shadowbanReasons"
                :key="reason"
                class="btn btn-xs"
                :class="post.shadowbanReason === reason ? 'btn-error' : 'btn-ghost'"
                :disabled="reason === 'none'"
                @click="applyShadowban(reason)"
              >
                {{ reason }}
              </button>
            </div>
            <button
              v-if="post.shadowbanReason && post.shadowbanReason !== 'none'"
              class="btn btn-ghost btn-xs text-success"
              @click="removeShadowban"
            >
              Clear Shadowban
            </button>
          </div>
        </AdminCard>

        <!-- Realm Actions -->
        <AdminCard>
          <h3 class="text-sm font-semibold mb-3 flex items-center gap-2">
            <IconBuilding2 class="w-4 h-4" />
            Realm Actions
          </h3>
          <div class="space-y-3">
            <p class="text-xs text-base-content/60">
              {{ post.realm ? `In realm: ${post.realm.name}` : 'Not in a realm' }}
            </p>
            <button
              v-if="post.realmId"
              class="btn btn-ghost btn-xs text-warning"
              @click="showRealmRemoveDialog = true"
            >
              Remove from Realm
            </button>
          </div>
        </AdminCard>
      </div>

      <!-- Tags -->
      <AdminCard v-if="post.tags?.length" class="mb-4">
        <h3 class="text-sm font-semibold mb-2">Tags</h3>
        <div class="flex flex-wrap gap-1.5">
          <span v-for="tag in post.tags" :key="tag.id" class="badge badge-outline badge-xs">
            {{ tag.name }}
          </span>
        </div>
      </AdminCard>

      <!-- Visibility Dialog -->
      <AdminDrawer :open="showVisibilityDialog" title="Change Visibility" @update:open="showVisibilityDialog = $event">
        <div class="space-y-4">
          <p class="text-sm text-base-content/60">Current: {{ post.visibility }}</p>
          <select v-model="newVisibility" class="select select-sm w-full bg-base-200/60 border-0 rounded-xl">
            <option value="public">Public</option>
            <option value="private">Private</option>
            <option value="unlisted">Unlisted</option>
            <option value="publisher">Publisher</option>
            <option value="realm">Realm</option>
          </select>
          <button class="btn btn-sm btn-primary w-full" :disabled="actLoading" @click="changeVisibility">
            {{ actLoading ? 'Saving...' : 'Save Visibility' }}
          </button>
        </div>
      </AdminDrawer>

      <!-- Realm Remove Dialog -->
      <AdminDrawer :open="showRealmRemoveDialog" title="Remove from Realm" @update:open="showRealmRemoveDialog = $event">
        <div class="space-y-4">
          <p class="text-sm text-base-content/60">
            Remove this post from <strong>{{ post.realm?.name }}</strong>? This will make the post private.
          </p>
          <textarea
            v-model="realmRemoveReason"
            class="textarea textarea-sm w-full bg-base-200/60 border-0 rounded-xl"
            placeholder="Reason for removal..."
            rows="3"
          />
          <button class="btn btn-sm btn-warning w-full" :disabled="actLoading || !realmRemoveReason" @click="removeRealm">
            {{ actLoading ? 'Removing...' : 'Remove from Realm' }}
          </button>
        </div>
      </AdminDrawer>
    </template>

    <div v-else class="flex flex-col items-center py-16 text-center">
      <IconAlertTriangle class="w-12 h-12 text-base-content/20 mb-4" />
      <p class="text-base-content/50">Post not found</p>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import {
  IconLock,
  IconLockOpen,
  IconTrash2,
  IconPencil,
  IconEyeOff,
  IconBuilding2,
  IconAlertTriangle,
} from '#components'
import type { AdminPost, PostVisibility, PostShadowbanReason } from '~/types/admin'
import {
  fetchAdminPost,
  lockPost,
  unlockPost,
  changePostVisibility,
  shadowbanPost,
  unshadowbanPost,
  removePostFromRealm,
  deleteAdminPost,
} from '~/utils/admin'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const router = useRouter()
const post = ref<AdminPost | null>(null)
const isLoading = ref(true)
const actLoading = ref(false)

const showVisibilityDialog = ref(false)
const showRealmRemoveDialog = ref(false)
const newVisibility = ref<PostVisibility>('public')
const realmRemoveReason = ref('')

const shadowbanReasons: PostShadowbanReason[] = [
  'spam', 'advertising', 'harassment', 'hate_speech',
  'misinformation', 'illegal', 'other', 'none',
]

function visibilityClass(v: PostVisibility): string {
  return {
    public: 'badge-success',
    private: 'badge-error',
    unlisted: 'badge-warning',
    publisher: 'badge-info',
    realm: 'badge-primary',
  }[v] || 'badge-ghost'
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString()
}

async function load() {
  isLoading.value = true
  try {
    post.value = await fetchAdminPost(route.params.id as string)
    newVisibility.value = post.value.visibility
  } catch {
    post.value = null
  } finally {
    isLoading.value = false
  }
}

async function toggleLock() {
  if (!post.value || actLoading.value) return
  actLoading.value = true
  try {
    if (post.value.locked) {
      await unlockPost(post.value.id)
    } else {
      await lockPost(post.value.id)
    }
    post.value.locked = !post.value.locked
  } catch {
    // ignore
  } finally {
    actLoading.value = false
  }
}

async function changeVisibility() {
  if (!post.value || actLoading.value) return
  actLoading.value = true
  try {
    await changePostVisibility(post.value.id, { visibility: newVisibility.value })
    post.value.visibility = newVisibility.value
    showVisibilityDialog.value = false
  } catch {
    // ignore
  } finally {
    actLoading.value = false
  }
}

async function applyShadowban(reason: PostShadowbanReason) {
  if (!post.value || actLoading.value || reason === 'none') return
  actLoading.value = true
  try {
    await shadowbanPost(post.value.id, { reason })
    post.value.shadowbanReason = reason
  } catch {
    // ignore
  } finally {
    actLoading.value = false
  }
}

async function removeShadowban() {
  if (!post.value || actLoading.value) return
  actLoading.value = true
  try {
    await unshadowbanPost(post.value.id)
    post.value.shadowbanReason = undefined
  } catch {
    // ignore
  } finally {
    actLoading.value = false
  }
}

async function removeRealm() {
  if (!post.value || actLoading.value || !realmRemoveReason.value) return
  actLoading.value = true
  try {
    await removePostFromRealm(post.value.id, { reason: realmRemoveReason.value })
    post.value.realmId = undefined
    post.value.realm = undefined
    post.value.visibility = 'private'
    showRealmRemoveDialog.value = false
    realmRemoveReason.value = ''
  } catch {
    // ignore
  } finally {
    actLoading.value = false
  }
}

async function deletePost() {
  if (!post.value || actLoading.value) return
  actLoading.value = true
  try {
    await deleteAdminPost(post.value.id)
    router.push('/admin/posts')
  } catch {
    // ignore
  } finally {
    actLoading.value = false
  }
}

onMounted(() => {
  load()
})
</script>
