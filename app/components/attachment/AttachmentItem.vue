<template>
  <div class="relative rounded-xl overflow-hidden bg-base-300 cursor-pointer" @click="isOpen = true">
    <img
      v-if="fileUrl"
      :src="fileUrl"
      :alt="attachment.name"
      class="w-full h-full object-cover"
    >
    <div v-else class="p-8 flex flex-col items-center justify-center">
      <IconFile class="w-12 h-12 text-base-content/30 mb-2" />
      <span class="text-sm text-base-content/50">{{ attachment.name }}</span>
    </div>
  </div>

  <!-- Fullscreen viewer -->
  <dialog v-if="isOpen" class="modal modal-open" @close="isOpen = false">
    <div class="modal-box max-w-4xl p-0 bg-black">
      <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 z-10" @click="isOpen = false">
        <IconX class="w-5 h-5" />
      </button>
      <img
        v-if="fileUrl"
        :src="fileUrl"
        :alt="attachment.name"
        class="w-full h-auto"
      >
      <div v-else class="p-8 flex flex-col items-center justify-center text-white">
        <IconFile class="w-16 h-16 text-white/30 mb-4" />
        <span>{{ attachment.name }}</span>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button @click="isOpen = false">close</button>
    </form>
  </dialog>
</template>

<script setup lang="ts">
import type { FileAttachment } from '~/types/post'
import { getFileUrl } from '~/utils/files'

const props = defineProps<{
  attachment: FileAttachment
}>()

const isOpen = ref(false)

const fileUrl = computed(() => {
  return (props.attachment.url || getFileUrl(props.attachment.id)) || ''
})
</script>
