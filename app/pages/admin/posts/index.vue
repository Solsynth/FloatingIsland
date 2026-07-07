<template>
  <NuxtLayout name="admin">
    <AdminPageHeader title="Posts" description="Review and moderate posts across the platform" />

    <!-- Search & Filters -->
    <AdminCard class="mb-6">
      <div class="flex flex-col gap-3">
        <div class="relative">
          <IconSearch class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search posts by title or content..."
            class="input input-sm w-full pl-9 bg-base-200/60 border-0 rounded-xl"
            @keyup.enter="handleSearch"
          />
        </div>
        <div class="flex flex-wrap gap-2">
          <select v-model="filters.visibility" class="select select-sm bg-base-200/60 border-0 rounded-xl" @change="handleSearch">
            <option value="">All Visibility</option>
            <option value="public">Public</option>
            <option value="private">Private</option>
            <option value="unlisted">Unlisted</option>
            <option value="publisher">Publisher</option>
            <option value="realm">Realm</option>
          </select>
          <select v-model="filters.shadowbanReason" class="select select-sm bg-base-200/60 border-0 rounded-xl" @change="handleSearch">
            <option value="">All Shadowban</option>
            <option value="spam">Spam</option>
            <option value="advertising">Advertising</option>
            <option value="harassment">Harassment</option>
            <option value="hate_speech">Hate Speech</option>
            <option value="misinformation">Misinformation</option>
            <option value="illegal">Illegal</option>
            <option value="other">Other</option>
          </select>
          <select v-model="filters.locked" class="select select-sm bg-base-200/60 border-0 rounded-xl" @change="handleSearch">
            <option value="">Any Lock</option>
            <option value="true">Locked</option>
            <option value="false">Unlocked</option>
          </select>
        </div>
      </div>
    </AdminCard>

    <!-- Loading -->
    <div v-if="isLoading" class="flex justify-center py-16">
      <span class="loading loading-spinner loading-lg" />
    </div>

    <!-- Posts Table -->
    <AdminCard v-else no-padding>
      <div class="overflow-x-auto">
        <table class="table table-sm table-zebra">
          <thead>
            <tr class="text-xs text-base-content/50 uppercase tracking-wider">
              <th class="pl-5">Post</th>
              <th>Publisher</th>
              <th>Visibility</th>
              <th>Status</th>
              <th>Realm</th>
              <th class="pr-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="post in posts" :key="post.id" class="hover:bg-base-200/50 transition-colors">
              <td class="pl-5">
                <NuxtLink :to="`/admin/posts/${post.id}`" class="block">
                  <div class="text-sm font-medium truncate max-w-[16rem]">
                    {{ post.title || '(Untitled)' }}
                  </div>
                  <div class="text-xs text-base-content/40 truncate max-w-[16rem]">
                    {{ post.description || stripHtml(post.body || '').slice(0, 80) }}
                  </div>
                </NuxtLink>
              </td>
              <td>
                <span class="text-sm text-base-content/60">
                  {{ post.publisher?.nick || post.publisher?.name || '—' }}
                </span>
              </td>
              <td>
                <span class="badge badge-xs" :class="visibilityClass(post.visibility)">
                  {{ post.visibility }}
                </span>
              </td>
              <td>
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span v-if="post.locked" class="badge badge-warning badge-xs">Locked</span>
                  <span v-if="post.shadowbanReason && post.shadowbanReason !== 'none'" class="badge badge-error badge-xs">
                    {{ post.shadowbanReason }}
                  </span>
                  <span v-if="post.drafted" class="badge badge-ghost badge-xs">Draft</span>
                </div>
              </td>
              <td>
                <span class="text-xs text-base-content/60">{{ post.realm?.name || '—' }}</span>
              </td>
              <td class="pr-5 text-right">
                <NuxtLink :to="`/admin/posts/${post.id}`" class="btn btn-ghost btn-xs">
                  <IconExternalLink class="w-3.5 h-3.5" />
                </NuxtLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="posts.length === 0" class="flex flex-col items-center py-16 text-center">
        <IconFileText class="w-12 h-12 text-base-content/20 mb-4" />
        <p class="text-base-content/50 mb-1">No posts found</p>
        <p class="text-xs text-base-content/30">Try adjusting your search or filters</p>
      </div>

      <div v-if="hasMore || total > pageSize" class="flex items-center justify-between px-5 py-3 border-t border-base-300/20">
        <span class="text-xs text-base-content/40">
          Showing {{ offset + 1 }}–{{ Math.min(offset + pageSize, total) }} of {{ total || 'many' }}
        </span>
        <div class="flex gap-1">
          <button class="btn btn-ghost btn-xs" :disabled="offset === 0" @click="prevPage">
            <IconChevronLeft class="w-3.5 h-3.5" />
          </button>
          <button class="btn btn-ghost btn-xs" :disabled="!hasMore && offset + pageSize >= total" @click="nextPage">
            <IconChevronRight class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </AdminCard>
  </NuxtLayout>
</template>

<script setup lang="ts">
import {
  IconSearch,
  IconExternalLink,
  IconChevronLeft,
  IconChevronRight,
  IconFileText,
} from '#components'
import type { PostVisibility, PostShadowbanReason, AdminPost } from '~/types/admin'
import { fetchAdminPosts } from '~/utils/admin'

definePageMeta({ middleware: 'auth' })

const posts = ref<AdminPost[]>([])
const total = ref(0)
const hasMore = ref(false)
const isLoading = ref(false)
const pageSize = 50
const offset = ref(0)
const searchQuery = ref('')
const filters = ref({
  visibility: '' as string,
  shadowbanReason: '' as string,
  locked: '' as string,
})

function stripHtml(html: string | null | undefined): string {
  return (html || '').replace(/<[^>]*>/g, '').trim()
}

function visibilityClass(v: PostVisibility): string {
  return {
    public: 'badge-success',
    private: 'badge-error',
    unlisted: 'badge-warning',
    publisher: 'badge-info',
    realm: 'badge-primary',
  }[v] || 'badge-ghost'
}

async function loadPosts() {
  isLoading.value = true
  try {
    const result = await fetchAdminPosts({
      query: searchQuery.value || undefined,
      visibility: (filters.value.visibility || undefined) as PostVisibility | undefined,
      shadowbanReason: (filters.value.shadowbanReason || undefined) as PostShadowbanReason | undefined,
      locked: filters.value.locked ? filters.value.locked === 'true' : undefined,
      take: pageSize,
      offset: offset.value,
    })
    posts.value = result.posts
    total.value = result.total
    hasMore.value = result.total > offset.value + result.posts.length || result.posts.length >= pageSize
  } catch {
    posts.value = []
    total.value = 0
    hasMore.value = false
  } finally {
    isLoading.value = false
  }
}

function handleSearch() {
  offset.value = 0
  loadPosts()
}

function prevPage() {
  offset.value = Math.max(0, offset.value - pageSize)
  loadPosts()
}

function nextPage() {
  offset.value = offset.value + pageSize
  loadPosts()
}

onMounted(() => {
  loadPosts()
})
</script>
