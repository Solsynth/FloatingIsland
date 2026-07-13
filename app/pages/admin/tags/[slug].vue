<template>
  <NuxtLayout name="admin">
    <div v-if="isLoading" class="flex justify-center py-16">
      <span class="loading loading-spinner loading-lg" />
    </div>

    <template v-else-if="tag">
      <AdminPageHeader :title="tag.name || tag.slug" :description="`#${tag.slug}`">
        <template #actions>
          <button class="btn btn-sm btn-error" :disabled="actLoading" @click="deleteTag">
            <IconTrash2 class="w-4 h-4" />
            Delete
          </button>
        </template>
      </AdminPageHeader>

      <AdminCard class="mb-4">
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <span class="text-base-content/40 text-xs uppercase tracking-wider">Usage</span>
            <p class="mt-1 font-semibold tabular-nums">{{ tag.usage ?? 0 }} posts</p>
          </div>
          <div>
            <span class="text-base-content/40 text-xs uppercase tracking-wider">Owner</span>
            <p class="mt-1">
              <NuxtLink
                v-if="tag.ownerPublisher"
                :to="`/admin/publishers/${tag.ownerPublisher.name}`"
                class="link link-hover"
              >
                {{ tag.ownerPublisher.nick || tag.ownerPublisher.name }}
              </NuxtLink>
              <span v-else class="text-base-content/40">Unowned</span>
            </p>
          </div>
          <div>
            <span class="text-base-content/40 text-xs uppercase tracking-wider">Protected</span>
            <p class="mt-1">
              <span class="badge badge-xs" :class="tag.isProtected ? 'badge-warning' : 'badge-ghost'">
                {{ tag.isProtected ? 'Yes' : 'No' }}
              </span>
            </p>
          </div>
          <div>
            <span class="text-base-content/40 text-xs uppercase tracking-wider">Event</span>
            <p class="mt-1">
              <span class="badge badge-xs" :class="tag.isEvent ? 'badge-info' : 'badge-ghost'">
                {{ tag.isEvent ? 'Yes' : 'No' }}
              </span>
            </p>
          </div>
        </div>
        <p v-if="tag.description" class="text-sm text-base-content/60 mt-4">{{ tag.description }}</p>
      </AdminCard>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <AdminCard>
          <h3 class="text-sm font-semibold mb-3">Edit metadata</h3>
          <div class="space-y-3">
            <input v-model="editForm.name" class="input input-sm w-full bg-base-200/60 border-0 rounded-xl" placeholder="Name" />
            <textarea v-model="editForm.description" class="textarea textarea-sm w-full bg-base-200/60 border-0 rounded-xl" rows="3" placeholder="Description" />
            <button class="btn btn-sm btn-primary" :disabled="actLoading" @click="saveMeta">Save</button>
          </div>
        </AdminCard>

        <AdminCard>
          <h3 class="text-sm font-semibold mb-3">Ownership</h3>
          <div class="space-y-3">
            <input
              v-model="assignPublisherId"
              class="input input-sm w-full bg-base-200/60 border-0 rounded-xl font-mono"
              placeholder="Publisher UUID..."
            />
            <div class="flex flex-wrap gap-2">
              <button class="btn btn-sm btn-primary" :disabled="actLoading || !assignPublisherId" @click="assign">
                Assign owner
              </button>
              <button
                v-if="tag.ownerPublisherId"
                class="btn btn-sm btn-ghost"
                :disabled="actLoading"
                @click="unassign"
              >
                Clear owner
              </button>
            </div>
          </div>
        </AdminCard>

        <AdminCard>
          <h3 class="text-sm font-semibold mb-3">Protection</h3>
          <p class="text-xs text-base-content/50 mb-3">
            Protected tags can only be used by the owning publisher.
          </p>
          <button
            class="btn btn-sm"
            :class="tag.isProtected ? 'btn-warning' : 'btn-ghost'"
            :disabled="actLoading || !tag.ownerPublisherId"
            @click="toggleProtect"
          >
            {{ tag.isProtected ? 'Unprotect' : 'Protect' }}
          </button>
        </AdminCard>

        <AdminCard>
          <h3 class="text-sm font-semibold mb-3">Event tag</h3>
          <div class="space-y-3">
            <input
              v-model="eventEndsAt"
              type="datetime-local"
              class="input input-sm w-full bg-base-200/60 border-0 rounded-xl"
            />
            <div class="flex flex-wrap gap-2">
              <button class="btn btn-sm btn-info" :disabled="actLoading || !eventEndsAt" @click="enableEvent">
                Mark as event
              </button>
              <button
                v-if="tag.isEvent"
                class="btn btn-sm btn-ghost"
                :disabled="actLoading"
                @click="disableEvent"
              >
                Clear event
              </button>
            </div>
            <p v-if="tag.eventEndsAt" class="text-xs text-base-content/40">
              Ends: {{ formatDate(tag.eventEndsAt) }}
            </p>
          </div>
        </AdminCard>
      </div>
    </template>

    <div v-else class="flex flex-col items-center py-16 text-center">
      <IconAlertTriangle class="w-12 h-12 text-base-content/20 mb-4" />
      <p class="text-base-content/50">Tag not found</p>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { IconTrash2, IconAlertTriangle } from '#components'
import type { AdminTag } from '~/types/admin'
import {
  fetchAdminTag,
  updateAdminTag,
  assignAdminTag,
  unassignAdminTag,
  setAdminTagProtected,
  setAdminTagEvent,
  deleteAdminTag,
} from '~/utils/admin'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const { destructive } = useAlert()
const tag = ref<AdminTag | null>(null)
const isLoading = ref(true)
const actLoading = ref(false)
const editForm = ref({ name: '', description: '' })
const assignPublisherId = ref('')
const eventEndsAt = ref('')

function formatDate(date: string) {
  return new Date(date).toLocaleString()
}

async function load() {
  isLoading.value = true
  try {
    tag.value = await fetchAdminTag(route.params.slug as string)
    editForm.value = {
      name: tag.value.name || '',
      description: tag.value.description || '',
    }
    assignPublisherId.value = tag.value.ownerPublisherId || ''
  } catch {
    tag.value = null
  } finally {
    isLoading.value = false
  }
}

async function saveMeta() {
  if (!tag.value || actLoading.value) return
  actLoading.value = true
  try {
    tag.value = await updateAdminTag(tag.value.slug, {
      name: editForm.value.name || undefined,
      description: editForm.value.description || undefined,
    })
    useNuxtApp().$toast.success('Tag updated')
  } catch (e: any) {
    useNuxtApp().$toast.error(e?.data?.message || e?.message || 'Update failed')
  } finally {
    actLoading.value = false
  }
}

async function assign() {
  if (!tag.value || !assignPublisherId.value || actLoading.value) return
  actLoading.value = true
  try {
    tag.value = await assignAdminTag(tag.value.slug, { publisherId: assignPublisherId.value })
    useNuxtApp().$toast.success('Owner assigned')
  } catch (e: any) {
    useNuxtApp().$toast.error(e?.data?.message || e?.message || 'Assign failed')
  } finally {
    actLoading.value = false
  }
}

async function unassign() {
  if (!tag.value || actLoading.value) return
  actLoading.value = true
  try {
    tag.value = await unassignAdminTag(tag.value.slug)
    assignPublisherId.value = ''
    useNuxtApp().$toast.success('Owner cleared')
  } catch (e: any) {
    useNuxtApp().$toast.error(e?.data?.message || e?.message || 'Unassign failed')
  } finally {
    actLoading.value = false
  }
}

async function toggleProtect() {
  if (!tag.value || actLoading.value) return
  actLoading.value = true
  try {
    tag.value = await setAdminTagProtected(tag.value.slug, {
      isProtected: !tag.value.isProtected,
    })
  } catch (e: any) {
    useNuxtApp().$toast.error(e?.data?.message || e?.message || 'Failed')
  } finally {
    actLoading.value = false
  }
}

async function enableEvent() {
  if (!tag.value || !eventEndsAt.value || actLoading.value) return
  actLoading.value = true
  try {
    const endsAt = new Date(eventEndsAt.value).toISOString()
    tag.value = await setAdminTagEvent(tag.value.slug, { isEvent: true, endsAt })
    useNuxtApp().$toast.success('Event enabled')
  } catch (e: any) {
    useNuxtApp().$toast.error(e?.data?.message || e?.message || 'Failed')
  } finally {
    actLoading.value = false
  }
}

async function disableEvent() {
  if (!tag.value || actLoading.value) return
  actLoading.value = true
  try {
    tag.value = await setAdminTagEvent(tag.value.slug, { isEvent: false })
  } catch (e: any) {
    useNuxtApp().$toast.error(e?.data?.message || e?.message || 'Failed')
  } finally {
    actLoading.value = false
  }
}

async function deleteTag() {
  if (!tag.value) return
  const ok = await destructive(
    'Delete tag',
    `Permanently delete #${tag.value.slug}? It will be removed from all posts.`,
  )
  if (!ok) return
  actLoading.value = true
  try {
    await deleteAdminTag(tag.value.slug)
    useNuxtApp().$toast.success('Tag deleted')
    await navigateTo('/admin/tags')
  } catch (e: any) {
    useNuxtApp().$toast.error(e?.data?.message || e?.message || 'Delete failed')
  } finally {
    actLoading.value = false
  }
}

onMounted(() => load())
</script>
