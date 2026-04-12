<template>
  <NuxtLayout name="app">
    <ConfuseSpinner v-if="publisherStatus === 'pending'" message="Loading publisher..." />

    <template v-else-if="publisher">
      <div class="card bg-base-100 shadow-xl overflow-hidden mb-6">
        <div
          class="h-32 bg-gradient-to-r from-primary/20 to-accent/20"
          :style="backgroundStyle"
        />
        <div class="card-body pb-6">
          <div class="avatar -mt-16 mb-4">
            <div class="w-24 rounded-full ring-4 ring-base-100 bg-base-300 overflow-hidden">
              <img
                v-if="pictureUrl"
                :src="pictureUrl"
                :alt="publisherName"
                class="w-full h-full object-cover"
              />
              <div v-else class="w-full h-full flex items-center justify-center text-2xl font-bold text-base-content/50">
                {{ initials }}
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <h1 class="text-2xl font-bold">{{ publisherName }}</h1>
            <IconBadgeCheck v-if="isVerified" class="w-5 h-5 text-blue-500" />
          </div>
          <p v-if="publisher.bio" class="mt-1 text-base-content/70">{{ publisher.bio }}</p>
          <p class="text-xs text-base-content/40 mt-1">
            Created {{ formatDate(publisher.createdAt) }}
          </p>
        </div>
      </div>

      <h2 class="text-lg font-bold mb-4 px-1">Posts</h2>
      <div class="space-y-4">
        <PostCard
          v-for="post in publisherPosts"
          :key="post.id"
          :post="post"
          @boost="() => {}"
          @share="() => {}"
        />
      </div>
      <p v-if="publisherPosts.length === 0" class="text-center text-base-content/40 py-8">
        No posts yet
      </p>
    </template>

    <div v-else class="alert alert-warning">
      <IconAlertTriangle class="w-5 h-5" />
      <span>Publisher not found</span>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { Publisher, Post } from '~/types/post'

const route = useRoute()
const publisherName = computed(() => route.params.name as string)

const { data: publisher, status: publisherStatus } = await useFetch<Publisher>(
  () => `/api/publishers/${publisherName.value}-info`,
  {
    key: `publisher-${publisherName.value}`,
  },
)

const { data: publisherPosts } = await useFetch<{ posts: Post[] }>(
  () => `/api/publishers/${publisherName.value}`,
  {
    query: { take: 20, offset: 0 },
    key: `publisher-posts-${publisherName.value}`,
    default: () => ({ posts: [] }),
    transform: (data) => data?.posts || [],
  },
)

const displayName = computed(() => publisher.value?.nick || publisher.value?.name || '')
const pictureUrl = computed(() => publisher.value?.picture?.url || null)
const initials = computed(() => (publisher.value?.name || '?').slice(0, 2).toUpperCase())
const isVerified = computed(() => !!publisher.value?.verification)

const backgroundStyle = computed(() => {
  const bg = publisher.value?.background?.url
  if (bg) return `background-image: url(${bg}); background-size: cover; background-position: center;`
  return ''
})

watch(publisher, (p) => {
  if (p) {
    useHead({
      title: displayName.value,
      meta: [
        { name: 'description', content: p.bio || `@${p.name} on Solar Network` },
      ],
    })
  }
}, { immediate: true })

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}
</script>
