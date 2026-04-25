<template>
  <div class="space-y-3">
    <!-- Attachment Grid -->
    <div v-if="attachments.length > 0" class="grid grid-cols-2 sm:grid-cols-3 gap-2">
      <div
        v-for="(attachment, index) in attachments"
        :key="attachment.id"
        class="relative group rounded-lg overflow-hidden border border-base-300 bg-base-200"
        :class="{ 'col-span-2 sm:col-span-2': isLargeAttachment(attachment) }"
      >
        <!-- Image Preview -->
        <template v-if="isImage(attachment)">
          <div class="aspect-video relative">
            <img
              v-if="attachment.preview || attachment.cloudFile?.url"
              :src="attachment.preview || attachment.cloudFile?.url"
              class="w-full h-full object-cover"
              alt="Attachment preview"
            />
            <div v-else class="w-full h-full flex items-center justify-center">
              <IconImage class="w-8 h-8 text-base-content/30" />
            </div>

            <!-- Progress Overlay -->
            <div
              v-if="attachment.progress !== undefined && attachment.progress < 100"
              class="absolute inset-0 bg-black/50 flex items-center justify-center"
            >
              <div class="text-white text-sm font-medium">
                {{ Math.round(attachment.progress) }}%
              </div>
            </div>

            <!-- Hover Actions -->
            <div
              class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"
              :class="{ 'opacity-100': showActions === attachment.id }"
            >
              <button
                v-if="index > 0"
                class="btn btn-circle btn-sm btn-ghost text-white"
                @click="$emit('move', index, 'up')"
                title="Move left"
              >
                <IconArrowLeft class="w-4 h-4" />
              </button>
              <button
                class="btn btn-circle btn-sm btn-ghost text-white"
                @click="$emit('insert', attachment.id)"
                title="Insert into content"
              >
                <IconText class="w-4 h-4" />
              </button>
              <button
                class="btn btn-circle btn-sm btn-ghost text-error"
                @click="$emit('remove', attachment.id)"
                title="Remove"
              >
                <IconTrash2 class="w-4 h-4" />
              </button>
              <button
                v-if="index < attachments.length - 1"
                class="btn btn-circle btn-sm btn-ghost text-white"
                @click="$emit('move', index, 'down')"
                title="Move right"
              >
                <IconArrowRight class="w-4 h-4" />
              </button>
            </div>

            <!-- File Info -->
            <div class="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
              <p class="text-white text-xs truncate">{{ getFileName(attachment) }}</p>
            </div>
          </div>
        </template>

        <!-- Video Preview -->
        <template v-else-if="isVideo(attachment)">
          <div class="aspect-video relative">
            <video
              v-if="attachment.preview"
              :src="attachment.preview"
              class="w-full h-full object-cover"
              preload="metadata"
            />
            <div v-else class="w-full h-full flex items-center justify-center">
              <IconVideo class="w-8 h-8 text-base-content/30" />
            </div>

            <!-- Play Icon Overlay -->
            <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div class="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center">
                <IconPlay class="w-6 h-6 text-white ml-0.5" />
              </div>
            </div>

            <!-- Progress Overlay -->
            <div
              v-if="attachment.progress !== undefined && attachment.progress < 100"
              class="absolute inset-0 bg-black/50 flex items-center justify-center"
            >
              <div class="text-white text-sm font-medium">
                {{ Math.round(attachment.progress) }}%
              </div>
            </div>

            <!-- Hover Actions -->
            <div
              class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"
            >
              <button
                v-if="index > 0"
                class="btn btn-circle btn-sm btn-ghost text-white"
                @click="$emit('move', index, 'up')"
              >
                <IconArrowLeft class="w-4 h-4" />
              </button>
              <button
                class="btn btn-circle btn-sm btn-ghost text-white"
                @click="$emit('insert', attachment.id)"
              >
                <IconText class="w-4 h-4" />
              </button>
              <button
                class="btn btn-circle btn-sm btn-ghost text-error"
                @click="$emit('remove', attachment.id)"
              >
                <IconTrash2 class="w-4 h-4" />
              </button>
              <button
                v-if="index < attachments.length - 1"
                class="btn btn-circle btn-sm btn-ghost text-white"
                @click="$emit('move', index, 'down')"
              >
                <IconArrowRight class="w-4 h-4" />
              </button>
            </div>

            <div class="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
              <p class="text-white text-xs truncate">{{ getFileName(attachment) }}</p>
            </div>
          </div>
        </template>

        <!-- Audio Preview -->
        <template v-else-if="isAudio(attachment)">
          <div class="aspect-video relative bg-gradient-to-br from-primary/20 to-secondary/20 flex flex-col items-center justify-center p-4">
            <IconMusic class="w-10 h-10 text-primary mb-2" />
            <p class="text-xs text-center text-base-content/70 truncate w-full">{{ getFileName(attachment) }}</p>
            <p class="text-xs text-base-content/50">{{ formatFileSize(attachment.file.size) }}</p>

            <!-- Progress -->
            <div
              v-if="attachment.progress !== undefined && attachment.progress < 100"
              class="absolute inset-0 bg-black/30 flex items-center justify-center"
            >
              <div class="text-white text-sm font-medium">
                {{ Math.round(attachment.progress) }}%
              </div>
            </div>

            <!-- Actions -->
            <div class="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                class="btn btn-circle btn-xs btn-ghost text-error"
                @click="$emit('remove', attachment.id)"
              >
                <IconX class="w-3 h-3" />
              </button>
            </div>
          </div>
        </template>

        <!-- File Preview -->
        <template v-else>
          <div class="aspect-video relative bg-base-300 flex flex-col items-center justify-center p-4">
            <IconFile class="w-10 h-10 text-base-content/40 mb-2" />
            <p class="text-xs text-center text-base-content/70 truncate w-full">{{ getFileName(attachment) }}</p>
            <p class="text-xs text-base-content/50">{{ formatFileSize(attachment.file.size) }}</p>

            <!-- Progress -->
            <div
              v-if="attachment.progress !== undefined && attachment.progress < 100"
              class="absolute inset-0 bg-black/30 flex items-center justify-center"
            >
              <div class="text-white text-sm font-medium">
                {{ Math.round(attachment.progress) }}%
              </div>
            </div>

            <!-- Actions -->
            <div class="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                class="btn btn-circle btn-xs btn-ghost text-error"
                @click="$emit('remove', attachment.id)"
              >
                <IconX class="w-3 h-3" />
              </button>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Drag & Drop Zone -->
    <div
      v-if="showDropZone || attachments.length === 0"
      class="border-2 border-dashed border-base-300 rounded-lg p-6 text-center transition-colors"
      :class="{ 'border-primary bg-primary/5': isDragging }"
      @dragenter.prevent="handleDragEnter"
      @dragleave.prevent="handleDragLeave"
      @dragover.prevent
      @drop.prevent="handleDrop"
    >
      <IconUpload class="w-8 h-8 text-base-content/30 mx-auto mb-2" />
      <p class="text-sm text-base-content/70 mb-1">Drag & drop files here</p>
      <p class="text-xs text-base-content/50 mb-3">or click to browse</p>
      <input
        ref="fileInput"
        type="file"
        multiple
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
        class="hidden"
        @change="handleFileSelect"
      />
      <button class="btn btn-sm btn-outline" @click="fileInput?.click()">
        Choose Files
      </button>
    </div>

    <!-- Add More Button (when attachments exist) -->
    <div v-if="attachments.length > 0 && !showDropZone" class="flex gap-2">
      <input
        ref="additionalFileInput"
        type="file"
        multiple
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
        class="hidden"
        @change="handleAdditionalFiles"
      />
      <button class="btn btn-sm btn-outline gap-2" @click="additionalFileInput?.click()">
        <IconPlus class="w-4 h-4" />
        Add Files
      </button>
      <button class="btn btn-sm btn-ghost gap-2" @click="showDropZone = true">
        <IconUpload class="w-4 h-4" />
        Drop Zone
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ComposeAttachment } from '~/composables/useCompose'
import {
  IconImage,
  IconVideo,
  IconMusic,
  IconFile,
  IconPlay,
  IconArrowLeft,
  IconArrowRight,
  IconTrash2,
  IconText,
  IconX,
  IconUpload,
  IconPlus,
} from '#components'

interface Props {
  attachments: ComposeAttachment[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  add: [files: FileList]
  remove: [id: string]
  move: [index: number, direction: 'up' | 'down']
  insert: [id: string]
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const additionalFileInput = ref<HTMLInputElement | null>(null)
const showDropZone = ref(false)
const isDragging = ref(false)
const showActions = ref<string | null>(null)

function isImage(attachment: ComposeAttachment): boolean {
  return attachment.file.type.startsWith('image/') ||
    attachment.cloudFile?.mimeType?.startsWith('image/') ||
    false
}

function isVideo(attachment: ComposeAttachment): boolean {
  return attachment.file.type.startsWith('video/') ||
    attachment.cloudFile?.mimeType?.startsWith('video/') ||
    false
}

function isAudio(attachment: ComposeAttachment): boolean {
  return attachment.file.type.startsWith('audio/') ||
    attachment.cloudFile?.mimeType?.startsWith('audio/') ||
    false
}

function isLargeAttachment(attachment: ComposeAttachment): boolean {
  // First attachment can be larger
  const index = props.attachments.findIndex(a => a.id === attachment.id)
  return index === 0 && (isImage(attachment) || isVideo(attachment))
}

function getFileName(attachment: ComposeAttachment): string {
  return attachment.cloudFile?.name || attachment.file.name || 'Unnamed file'
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    emit('add', input.files)
  }
  input.value = ''
}

function handleAdditionalFiles(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    emit('add', input.files)
  }
  input.value = ''
}

function handleDragEnter() {
  isDragging.value = true
}

function handleDragLeave() {
  isDragging.value = false
}

function handleDrop(event: DragEvent) {
  isDragging.value = false
  if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
    emit('add', event.dataTransfer.files)
  }
}
</script>
