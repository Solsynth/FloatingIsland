<template>
  <NuxtLayout name="app">
    <ConfuseSpinner v-if="realmStatus === 'pending'" message="Loading realm..." />

    <template v-else-if="realm">
      <div class="card bg-base-100 shadow-xl overflow-hidden mb-6">
        <div
          class="h-32 bg-gradient-to-r from-accent/20 to-primary/20"
          :style="backgroundStyle"
        />
        <div class="card-body pb-6">
          <div class="avatar -mt-16 mb-4">
            <div class="w-24 rounded-full ring-4 ring-base-100 bg-base-300 overflow-hidden">
              <img
                v-if="pictureUrl"
                :src="pictureUrl"
                :alt="realm.name"
                class="w-full h-full object-cover"
              />
              <div v-else class="w-full h-full flex items-center justify-center text-2xl font-bold text-base-content/50">
                {{ initials }}
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <h1 class="text-2xl font-bold">{{ realm.name }}</h1>
            <IconBadgeCheck v-if="realm.verification" class="w-5 h-5 text-blue-500" />
          </div>
          <p v-if="realm.description" class="mt-1 text-base-content/70">{{ realm.description }}</p>
          <div class="flex gap-3 mt-2">
            <div class="badge" :class="realm.isPublic ? 'badge-success' : 'badge-warning'">
              {{ realm.isPublic ? 'Public' : 'Private' }}
            </div>
            <div v-if="realm.isCommunity" class="badge badge-info">Community</div>
          </div>
        </div>
      </div>

      <h2 class="text-lg font-bold mb-4 px-1">Posts in {{ realm.name }}</h2>
      <div class="space-y-4">
        <PostCard
          v-for="post in realmPosts"
          :key="post.id"
          :post="post"
          @boost="() => {}"
          @share="() => {}"
        />
      </div>
      <p v-if="realmPosts.length === 0" class="text-center text-base-content/40 py-8">
        No posts in this realm yet
      </p>
    </template>

    <div v-else class="alert alert-warning">
      <IconAlertTriangle class="w-5 h-5" />
      <span>Realm not found</span>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { Realm } from '~/types/realm'
import type { Post } from '~/types/post'

const route = useRoute()
const realmSlug = computed(() => route.params.slug as string)

const { data: realm, status: realmStatus } = await useFetch<Realm>(
  () => `/api/realms/${realmSlug.value}`,
  {
    key: `realm-${realmSlug.value}`,
  },
)

const { data: realmPosts } = await useFetch<{ posts: Post[] }>(
  () => `/api/realms/${realmSlug.value}?posts=true`,
  {
    query: { posts: 'true', take: 20, offset: 0 },
    key: `realm-posts-${realmSlug.value}`,
    default: () => ({ posts: [] }),
    transform: (data) => data?.posts || [],
  },
)

const pictureUrl = computed(() => realm.value?.picture?.url || null)
const initials = computed(() => (realm.value?.name || '?').slice(0, 2).toUpperCase())

const backgroundStyle = computed(() => {
  const bg = realm.value?.background?.url
  if (bg) return `background-image: url(${bg}); background-size: cover; background-position: center;`
  return ''
})

watch(realm, (r) => {
  if (r) {
    useHead({
      title: r.name,
      meta: [
        { name: 'description', content: r.description || `Realm: ${r.name}` },
      ],
    })
  }
}, { immediate: true })
</script>
