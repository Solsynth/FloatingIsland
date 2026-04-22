<template>
  <!-- Fullscreen Mode -->
  <div
    v-if="isFullscreen"
    class="fixed inset-0 z-50 flex flex-col bg-black/90"
  >
      <div class="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <button class="btn btn-circle text-white btn-ghost" @click="toggleFullscreen">
          <IconX class="h-8 w-8" />
        </button>
        <div class="flex gap-2">
          <button class="btn btn-circle text-white btn-ghost" @click="zoomOut">
            <IconZoomOut class="h-6 w-6" />
          </button>
          <button class="btn btn-circle text-white btn-ghost" @click="zoomIn">
            <IconZoomIn class="h-6 w-6" />
          </button>
          <button class="btn btn-circle text-white btn-ghost" @click="resetTransform">
            <IconRotateCcw class="h-6 w-6" />
          </button>
          <button class="btn btn-circle text-white btn-ghost" @click="handleShare">
            <IconShare2 class="h-6 w-6" />
          </button>
          <button class="btn btn-circle text-white btn-ghost" @click="handleDownload">
            <IconDownload class="h-6 w-6" />
          </button>
        </div>
      </div>
      <div
        class="flex flex-1 items-center justify-center overflow-hidden"
        role="img"
        aria-label="Zoomable image"
        @wheel.prevent="handleWheel"
        @mousedown.stop="handleMouseDown"
        @mousemove.stop="handleMouseMove"
        @mouseup.stop="handleMouseUp"
        @mouseleave.stop="handleMouseUp"
      >
        <img
          v-if="isImage"
          :src="fileUrl"
          alt="File"
          class="max-h-full max-w-full object-contain select-none"
          :style="imageStyle"
          draggable="false"
          @error="handleImageError"
        />
        <video
          v-else-if="isVideo"
          :src="fileUrl"
          controls
          class="max-h-full max-w-full"
        />
      </div>
      <div
        class="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-4 py-2 text-white"
      >
        {{ Math.round(scale * 100) }}%
      </div>
    </div>

    <!-- Normal Mode -->
    <div v-else class="min-h-screen bg-base-100">
      <div class="sticky top-0 z-10 border-b border-base-300 bg-base-100/95 backdrop-blur">
        <div class="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <button class="btn btn-circle btn-ghost btn-sm" @click="handleBack">
            <IconArrowLeft class="h-5 w-5" />
          </button>
          <div class="flex gap-2">
            <template v-if="isImage">
              <button class="btn btn-circle btn-ghost btn-sm" @click="zoomOut">
                <IconZoomOut class="h-5 w-5" />
              </button>
              <span class="flex w-12 items-center justify-center text-sm">
                {{ Math.round(scale * 100) }}%
              </span>
              <button class="btn btn-circle btn-ghost btn-sm" @click="zoomIn">
                <IconZoomIn class="h-5 w-5" />
              </button>
              <button class="btn btn-circle btn-ghost btn-sm" @click="resetTransform">
                <IconRotateCcw class="h-5 w-5" />
              </button>
              <button class="btn btn-circle btn-ghost btn-sm" @click="toggleFullscreen">
                <IconMaximize2 class="h-5 w-5" />
              </button>
            </template>
            <button class="btn btn-circle btn-ghost btn-sm" @click="handleShare">
              <IconShare2 class="h-5 w-5" />
            </button>
            <button class="btn btn-circle btn-ghost btn-sm" @click="handleDownload">
              <IconDownload class="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div
        class="flex min-h-[calc(100vh-65px)] items-center justify-center overflow-auto p-4"
        @wheel.prevent="handleWheel"
        @mousedown.stop="handleMouseDown"
        @mousemove.stop="handleMouseMove"
        @mouseup.stop="handleMouseUp"
        @mouseleave.stop="handleMouseUp"
      >
        <div class="relative w-full max-w-5xl">
          <!-- Image -->
          <img
            v-if="isImage"
            :src="fileUrl"
            alt="File"
            class="w-full rounded-lg object-contain shadow-lg select-none"
            :style="imageStyle"
            draggable="false"
            @error="handleImageError"
          />
          <!-- Video -->
          <video
            v-else-if="isVideo"
            :src="fileUrl"
            controls
            class="w-full rounded-lg shadow-lg"
          />
          <!-- Audio -->
          <div
            v-else-if="isAudio"
            class="flex flex-col items-center justify-center py-12 bg-base-200 rounded-lg"
          >
            <IconMusic class="w-20 h-20 text-base-content/20 mb-4" />
            <p class="text-base-content/60 mb-4">{{ fileId }}</p>
            <audio :src="fileUrl" controls class="w-full max-w-md" />
          </div>
          <!-- Other file types -->
          <div
            v-else
            class="flex flex-col items-center justify-center py-12 bg-base-200 rounded-lg"
          >
            <IconFile class="w-20 h-20 text-base-content/20 mb-4" />
            <p class="text-base-content/60">{{ fileId }}</p>
            <a :href="fileUrl" class="btn btn-primary mt-4" download>
              <IconDownload class="w-4 h-4" />
              Download
            </a>
          </div>
        </div>
      </div>

      <!-- File Info -->
      <div class="border-t border-base-300 bg-base-100">
        <div class="mx-auto max-w-5xl px-4 py-4">
          <h1 class="text-lg font-semibold">{{ fileId }}</h1>
          <div class="mt-2 text-sm text-base-content/60 flex flex-wrap gap-4">
            <span>Type: {{ detectedMimeType || 'Unknown' }}</span>
          </div>
        </div>
      </div>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})

const route = useRoute()
const fileId = computed(() => route.params.id as string)

const config = useRuntimeConfig()
const fileUrl = computed(() => `${config.public.fileBaseUrl}/${fileId.value}`)

// Detect file type from extension
const detectedMimeType = computed(() => {
  const ext = fileId.value.split('.').pop()?.toLowerCase()
  const mimeTypes: Record<string, string> = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'mp4': 'video/mp4',
    'webm': 'video/webm',
    'mov': 'video/quicktime',
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'ogg': 'audio/ogg',
  }
  return mimeTypes[ext || ''] || null
})

const isImage = computed(() => detectedMimeType.value?.startsWith('image/') ?? true) // Default to image
const isVideo = computed(() => detectedMimeType.value?.startsWith('video/') ?? false)
const isAudio = computed(() => detectedMimeType.value?.startsWith('audio/') ?? false)

// Zoom and pan state
const isFullscreen = ref(false)
const scale = ref(1)
const translateX = ref(0)
const translateY = ref(0)
const isDragging = ref(false)
const startX = ref(0)
const startY = ref(0)

const imageStyle = computed(() => {
  const cursor = scale.value > 1
    ? (isDragging.value ? 'grabbing' : 'grab')
    : 'zoom-in'
  return `transform: translate(${translateX.value}px, ${translateY.value}px) scale(${scale.value}); cursor: ${cursor};`
})

function handleBack() {
  if (window.history.length > 1) {
    window.history.back()
  } else {
    navigateTo('/')
  }
}

function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value
  resetTransform()
}

async function handleShare() {
  if (navigator.share) {
    try {
      await navigator.share({
        title: fileId.value,
        url: window.location.href
      })
    } catch {
      // User cancelled or share failed
    }
  } else {
    await navigator.clipboard.writeText(window.location.href)
  }
}

function handleDownload() {
  const link = document.createElement('a')
  link.href = fileUrl.value
  link.download = fileId.value
  link.click()
}

function zoomIn() {
  scale.value = Math.min(scale.value + 0.25, 5)
}

function zoomOut() {
  scale.value = Math.max(scale.value - 0.25, 0.25)
}

function resetTransform() {
  scale.value = 1
  translateX.value = 0
  translateY.value = 0
}

function handleWheel(e: WheelEvent) {
  if (!isImage.value) return
  e.preventDefault()
  if (e.deltaY < 0) {
    zoomIn()
  } else {
    zoomOut()
  }
}

function handleMouseDown(e: MouseEvent) {
  if (!isImage.value) return
  if (scale.value > 1) {
    isDragging.value = true
    startX.value = e.clientX
    startY.value = e.clientY
  }
}

function handleMouseMove(e: MouseEvent) {
  if (isDragging.value && scale.value > 1) {
    const deltaX = e.clientX - startX.value
    const deltaY = e.clientY - startY.value
    translateX.value += deltaX
    translateY.value += deltaY
    startX.value = e.clientX
    startY.value = e.clientY
  }
}

function handleMouseUp() {
  isDragging.value = false
}

function handleImageError() {
  // If image fails to load, it might not be an image
  // The UI will show the generic file view
}
</script>
