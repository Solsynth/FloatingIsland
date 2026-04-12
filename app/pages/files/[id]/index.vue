<template>
  <NuxtLayout name="app">
    <ConfuseSpinner v-if="loading" message="Loading file..." />

    <template v-else-if="file">
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h1 class="text-xl font-bold mb-4">{{ file.name }}</h1>

          <!-- Image Preview -->
          <template v-if="file.mimeType?.startsWith('image/')">
            <img :src="fileUrl" :alt="file.name" class="w-full h-auto rounded-lg" />
          </template>

          <!-- Video -->
          <template v-else-if="file.mimeType?.startsWith('video/')">
            <video :src="fileUrl" controls class="w-full rounded-lg" />
          </template>

          <!-- Audio -->
          <template v-else-if="file.mimeType?.startsWith('audio/')">
            <audio :src="fileUrl" controls class="w-full" />
          </template>

          <!-- Other file types -->
          <template v-else>
            <div class="flex flex-col items-center justify-center py-12">
              <IconFile class="w-20 h-20 text-base-content/20 mb-4" />
              <p class="text-base-content/60">{{ file.name }}</p>
              <a :href="fileUrl" class="btn btn-primary mt-4" download>
                <IconDownload class="w-4 h-4" />
                Download
              </a>
            </div>
          </template>

          <!-- File Info -->
          <div class="mt-4 text-sm text-base-content/60 space-y-1">
            <p>Size: {{ file.width }} x {{ file.height }}</p>
            <p>Type: {{ file.mimeType }}</p>
          </div>
        </div>
      </div>
    </template>

    <div v-else class="alert alert-warning">
      <IconAlertTriangle class="w-5 h-5" />
      <span>File not found</span>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { FileAttachment } from '~/types/post'

const route = useRoute()
const fileId = computed(() => route.params.id as string)

const { data: file, pending: loading } = await useFetch<FileAttachment>(
  () => `/api/files/${fileId.value}`,
  {
    key: (id) => `file-${id}`,
    default: () => null,
  }
)

const fileUrl = computed(() => {
  if (!file.value?.id) return null
  return `https://api.solian.app/drive/files/${file.value.id}`
})
</script>
