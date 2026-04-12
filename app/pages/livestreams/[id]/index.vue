<template>
  <NuxtLayout name="app">
    <ConfuseSpinner v-if="loading" message="Loading livestream..." />

    <template v-else-if="stream">
      <!-- Video Player -->
      <div class="card bg-base-100 shadow-xl overflow-hidden mb-6">
        <div class="aspect-video bg-black relative">
          <video
            v-if="hlsUrl"
            ref="videoRef"
            :src="hlsUrl"
            controls
            class="w-full h-full"
            autoplay
          />
          <div v-else class="w-full h-full flex items-center justify-center text-white">
            <div class="text-center">
              <IconRadio class="w-16 h-16 mb-4 opacity-50" />
              <p class="text-lg">No stream available</p>
            </div>
          </div>

          <!-- Stream Info Overlay -->
          <div class="absolute top-4 left-4 flex gap-2">
            <div
              class="badge"
              :class="stream.status === 1 ? 'badge-error' : 'badge-ghost'"
            >
              {{ stream.status === 1 ? 'LIVE' : 'ENDED' }}
            </div>
          </div>
        </div>

        <div class="card-body">
          <h1 class="text-2xl font-bold">{{ stream.title || 'Untitled Stream' }}</h1>
          <div class="flex items-center gap-3">
            <div class="avatar">
              <div class="w-10 rounded-full bg-base-300">
                <img
                  v-if="publisherPicture"
                  :src="publisherPicture"
                  class="w-full h-full object-cover"
                />
              </div>
            </div>
            <div>
              <p class="font-semibold">{{ publisherName }}</p>
              <p class="text-xs text-base-content/50" v-if="stream.description">{{ stream.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </template>

    <div v-else class="alert alert-warning">
      <IconAlertTriangle class="w-5 h-5" />
      <span>Livestream not found</span>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { LivestreamDetail } from '~/types/livestream'

const route = useRoute()
const streamId = computed(() => route.params.id as string)

const { data: stream, pending: loading } = await useFetch<LivestreamDetail>(
  () => `/api/livestreams/${streamId.value}`,
  {
    key: (id) => `livestream-${id}`,
    default: () => null,
  }
)

const publisherName = computed(() => stream.value?.publisher?.nick || stream.value?.publisher?.name || '')
const publisherPicture = computed(() => {
  const picId = stream.value?.publisher?.picture?.id
  if (!picId) return null
  return `https://api.solian.app/drive/files/${picId}`
})
const hlsUrl = computed(() => {
  if (!stream.value?.hlsPlaylistPath) return null
  return `https://api.solian.app${stream.value.hlsPlaylistPath}`
})

watchEffect(() => {
  if (stream.value) {
    useHead({
      title: stream.value.title || 'Livestream',
      meta: [
        { name: 'description', content: stream.value.description || `Watch ${publisherName.value}'s livestream` },
      ],
    })
  }
})
</script>
