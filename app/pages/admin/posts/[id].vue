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
              <IconLock v-if="post.lockedAt" class="w-4 h-4" />
              <IconLockOpen v-else class="w-4 h-4" />
              {{ post.lockedAt ? 'Unlock' : 'Lock' }}
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
              <span class="badge badge-xs" :class="visibilityClass(post.visibility)">{{ formatVisibility(post.visibility) }}</span>
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
            <p class="mt-1">{{ post.realm?.nick || post.realm?.name || post.realm?.slug || '—' }}</p>
          </div>
          <div>
            <span class="text-base-content/40 text-xs uppercase tracking-wider">Created</span>
            <p class="mt-1">{{ formatDate(post.createdAt) }}</p>
          </div>
          <div v-if="post.lockedAt">
            <span class="text-base-content/40 text-xs uppercase tracking-wider">Locked At</span>
            <p class="mt-1">{{ formatDate(post.lockedAt) }}</p>
          </div>
          <div v-if="post.draftedAt">
            <span class="text-base-content/40 text-xs uppercase tracking-wider">Drafted At</span>
            <p class="mt-1">{{ formatDate(post.draftedAt) }}</p>
          </div>
          <div v-if="post.publishedAt">
            <span class="text-base-content/40 text-xs uppercase tracking-wider">Published At</span>
            <p class="mt-1">{{ formatDate(post.publishedAt) }}</p>
          </div>
          <div v-if="post.shadowbannedAt">
            <span class="text-base-content/40 text-xs uppercase tracking-wider">Shadowbanned At</span>
            <p class="mt-1">{{ formatDate(post.shadowbannedAt) }}</p>
          </div>
        </div>
      </AdminCard>

      <!-- Content -->
      <AdminCard class="mb-4">
        <h3 class="text-sm font-semibold mb-3">Content</h3>
        <div class="prose prose-sm max-w-none text-base-content/80 whitespace-pre-wrap">{{ post.content || '(empty)' }}</div>
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
              {{ isShadowbanned(post.shadowbanReason)
                ? `Currently shadowbanned: ${formatShadowban(post.shadowbanReason)}`
                : 'Not shadowbanned' }}
            </p>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="reason in shadowbanReasons"
                :key="reason"
                class="btn btn-xs"
                :class="formatShadowban(post.shadowbanReason) === reason ? 'btn-error' : 'btn-ghost'"
                :disabled="reason === 'none'"
                @click="applyShadowban(reason)"
              >
                {{ reason }}
              </button>
            </div>
            <button
              v-if="isShadowbanned(post.shadowbanReason)"
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
              {{ post.realmId
                ? `In realm: ${post.realm?.nick || post.realm?.name || post.realm?.slug || post.realmId}`
                : 'Not in a realm' }}
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
          <p class="text-sm text-base-content/60">Current: {{ formatVisibility(post.visibility) }}</p>
          <select v-model="newVisibility" class="select select-sm w-full bg-base-200/60 border-0 rounded-xl">
            <option value="public">Public</option>
            <option value="friends">Friends</option>
            <option value="unlisted">Unlisted</option>
            <option value="private">Private</option>
            <option value="close_friends_only">Close Friends</option>
            <option value="quiet_public">Quiet Public</option>
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
            Remove this post from <strong>{{ post.realm?.nick || post.realm?.name || post.realm?.slug || 'this realm' }}</strong>? This will make the post private.
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

const VISIBILITY_LABELS = ['public', 'friends', 'unlisted', 'private', 'close_friends_only', 'quiet_public'] as const
const SHADOWBAN_LABELS: Record<number, string> = {
  0: 'none', 1: 'spam', 2: 'advertising', 3: 'harassment',
  4: 'hate_speech', 5: 'misinformation', 6: 'illegal', 99: 'other',
}

function formatVisibility(v: PostVisibility | string | number | undefined): string {
  if (v === undefined || v === null) return '—'
  if (typeof v === 'number') return VISIBILITY_LABELS[v] ?? String(v)
  return String(v)
}

function formatShadowban(v: PostShadowbanReason | string | number | null | undefined): string {
  if (v === undefined || v === null) return ''
  if (typeof v === 'number') return SHADOWBAN_LABELS[v] ?? String(v)
  return String(v)
}

function isShadowbanned(v: PostShadowbanReason | string | number | null | undefined): boolean {
  return !(v === undefined || v === null || v === 'none' || v === 0)
}

function visibilityClass(v: PostVisibility | string | number): string {
  const key = formatVisibility(v)
  return ({
    public: 'badge-success',
    friends: 'badge-info',
    unlisted: 'badge-warning',
    private: 'badge-error',
    close_friends_only: 'badge-primary',
    quiet_public: 'badge-ghost',
  } as Record<string, string>)[key] || 'badge-ghost'
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString()
}

async function load() {
  isLoading.value = true
  try {
    post.value = await fetchAdminPost(route.params.id as string)
    newVisibility.value = formatVisibility(post.value.visibility) as PostVisibility
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
    if (post.value.lockedAt) {
      await unlockPost(post.value.id)
      post.value.lockedAt = null
    } else {
      await lockPost(post.value.id)
      post.value.lockedAt = new Date().toISOString()
    }
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
    post.value.shadowbannedAt = new Date().toISOString()
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
    post.value.shadowbanReason = 'none'
    post.value.shadowbannedAt = null
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
    post.value.realmId = null
    post.value.realm = null
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
