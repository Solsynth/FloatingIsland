<template>
  <div class="relative rounded-lg overflow-hidden bg-base-300" :class="{ 'cursor-pointer': props.clickable }" @click="handleClick">
    <!-- Image -->
    <template v-if="isImage">
      <img
        v-if="fileUrl"
        :src="fileUrl"
        :alt="attachment.name"
        class="w-full h-full object-cover"
      >
      <div v-else class="p-8 flex flex-col items-center justify-center">
        <IconFileImage class="w-12 h-12 text-base-content/30 mb-2" />
        <span class="text-sm text-base-content/50">{{ attachment.name }}</span>
      </div>
    </template>

    <!-- Video -->
    <template v-else-if="isVideo">
      <div class="relative w-full h-full">
        <video
          v-if="fileUrl"
          :src="fileUrl"
          class="w-full h-full object-cover"
          preload="metadata"
        />
        <div class="absolute inset-0 flex items-center justify-center bg-black/20">
          <IconPlayerPlay class="w-12 h-12 text-white/80" />
        </div>
      </div>
    </template>

    <!-- Audio -->
    <template v-else-if="isAudio">
      <div class="p-6 flex flex-col items-center justify-center h-full">
        <IconHeadphones class="w-12 h-12 text-base-content/30 mb-2" />
        <span class="text-sm text-base-content/50 text-center line-clamp-2">{{ attachment.name }}</span>
      </div>
    </template>

    <!-- Generic File -->
    <template v-else>
      <div class="p-6 flex flex-col items-center justify-center h-full">
        <IconFile class="w-12 h-12 text-base-content/30 mb-2" />
        <span class="text-sm text-base-content/50 text-center line-clamp-2">{{ attachment.name }}</span>
      </div>
    </template>
  </div>

  <!-- Fullscreen viewer -->
  <dialog v-if="isOpen" class="modal modal-open" @close="isOpen = false">
    <div class="modal-box max-w-4xl p-0 bg-black">
      <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 z-10" @click="isOpen = false">
        <IconX class="w-5 h-5" />
      </button>

      <!-- Image viewer -->
      <template v-if="isImage">
        <img
          v-if="fileUrl"
          :src="fileUrl"
          :alt="attachment.name"
          class="w-full h-auto"
        >
        <div v-else class="p-8 flex flex-col items-center justify-center text-white">
          <IconFileImage class="w-16 h-16 text-white/30 mb-4" />
          <span>{{ attachment.name }}</span>
        </div>
      </template>

      <!-- Video player -->
      <template v-else-if="isVideo">
        <video
          v-if="fileUrl"
          :src="fileUrl"
          class="w-full h-auto"
          controls
          autoplay
        />
        <div v-else class="p-8 flex flex-col items-center justify-center text-white">
          <IconPlayerPlay class="w-16 h-16 text-white/30 mb-4" />
          <span>{{ attachment.name }}</span>
        </div>
      </template>

      <!-- Audio player -->
      <template v-else-if="isAudio">
        <div class="p-8 flex flex-col items-center justify-center text-white">
          <IconHeadphones class="w-16 h-16 text-white/30 mb-4" />
          <span class="mb-4">{{ attachment.name }}</span>
          <audio v-if="fileUrl" :src="fileUrl" controls class="w-full max-w-md" />
        </div>
      </template>

      <!-- Generic file -->
      <template v-else>
        <div class="p-8 flex flex-col items-center justify-center text-white">
          <IconFile class="w-16 h-16 text-white/30 mb-4" />
          <span class="mb-2">{{ attachment.name }}</span>
          <a
            v-if="fileUrl"
            :href="fileUrl"
            download
            class="btn btn-sm btn-outline text-white border-white/30 hover:bg-white/10"
          >
            <IconDownload class="w-4 h-4 mr-2" />
            Download
          </a>
        </div>
      </template>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button @click="isOpen = false">close</button>
    </form>
  </dialog>
</template>

<script setup lang="ts">
import type { FileAttachment } from '~/types/post'
import { getFileUrl } from '~/utils/files'
import { isImageFile, isVideoFile, isAudioFile } from '~/utils/fileType'
import { ref, computed } from 'vue'

const props = withDefaults(defineProps<{
  attachment: FileAttachment
  clickable?: boolean
}>(), {
  clickable: true
})

const emit = defineEmits<{
  click: []
}>()

const isOpen = ref(false)

function handleClick() {
  if (props.clickable) {
    isOpen.value = true
  } else {
    emit('click')
  }
}

const fileUrl = computed(() => {
  return (props.attachment.url || getFileUrl(props.attachment.id)) || ''
})

const isImage = computed(() => isImageFile(props.attachment))
const isVideo = computed(() => isVideoFile(props.attachment))
const isAudio = computed(() => isAudioFile(props.attachment))
</script>
