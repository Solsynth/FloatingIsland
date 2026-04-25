<template>
  <NuxtLayout name="app">
    <h1 class="text-2xl font-bold mb-6 px-1">Livestreams</h1>

    <ConfuseSpinner v-if="streamsStatus === 'pending'" message="Loading livestreams..." />

    <div v-else-if="streams.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="stream in streams"
        :key="stream.id"
        class="card bg-base-100 shadow-xl cursor-pointer hover:shadow-2xl transition-shadow"
        @click="navigateTo(`/livestreams/${stream.id}`)"
      >
        <figure class="relative aspect-video bg-base-300">
          <img
            v-if="stream.thumbnailId"
            :src="getFileUrl(stream.thumbnailId)"
            :alt="stream.title"
            class="w-full h-full object-cover"
          >
          <div v-else class="w-full h-full flex items-center justify-center">
            <IconRadio class="w-12 h-12 text-base-content/20" />
          </div>
          <div
            class="absolute top-2 left-2 badge"
            :class="stream.status === 1 ? 'badge-error' : 'badge-ghost'"
          >
            {{ stream.status === 1 ? 'LIVE' : 'ENDED' }}
          </div>
          <div v-if="stream.viewerCount" class="absolute bottom-2 left-2 badge badge-sm bg-black/50 text-white border-0">
            <IconUsers class="w-3 h-3 mr-1" />
            {{ stream.viewerCount }}
          </div>
        </figure>
        <div class="card-body p-4">
          <h3 class="font-bold truncate">{{ stream.title || 'Untitled Stream' }}</h3>
          <div class="flex items-center gap-2 text-sm text-base-content/60">
            <div class="avatar">
              <div class="w-6 h-6 rounded-full bg-base-300">
                <img
                  v-if="stream.publisher?.picture?.id"
                  :src="getFileUrl(stream.publisher.picture.id)"
                  class="w-full h-full object-cover"
                >
              </div>
            </div>
            <span>{{ stream.publisher?.nick || stream.publisher?.name || 'Unknown' }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-16">
      <IconRadio class="w-16 h-16 text-base-content/20 mx-auto mb-4" />
      <h2 class="text-xl font-bold mb-2">No Livestreams</h2>
      <p class="text-base-content/50">There are no livestreams right now</p>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { LivestreamDetail } from '~/types/livestream'
import { fetchLivestreams } from '~/utils/api'

useHead({
  title: 'Livestreams',
  meta: [{ name: 'description', content: 'Watch livestreams on Solar Network' }],
})

const { data: streams, status: streamsStatus } = await useAsyncData(
  'livestreams',
  () => fetchLivestreams(),
  {
    default: () => [],
  },
)
</script>
