<template>
  <div v-if="attachments.length" class="grid gap-1 rounded-xl overflow-hidden" :class="gridClass">
    <NuxtLink
      v-for="attachment in visibleAttachments"
      :key="attachment.id"
      :to="`/files/${attachment.id}`"
      class="relative bg-base-300 aspect-video cursor-pointer block"
      @click.stop
    >
      <img
        v-if="getAttachmentUrl(attachment)"
        :src="getAttachmentUrl(attachment)"
        :alt="attachment.name"
        class="w-full h-full object-cover"
      />
      <div v-else class="w-full h-full flex items-center justify-center">
        <IconFile class="w-8 h-8 text-base-content/30" />
      </div>
      <!-- Video indicator -->
      <div
        v-if="attachment.mimeType?.startsWith('video/')"
        class="absolute inset-0 flex items-center justify-center bg-black/30"
      >
        <IconPlay class="w-10 h-10 text-white" />
      </div>
    </NuxtLink>
  </div>
  <button v-if="attachments.length > 4" class="btn btn-ghost btn-xs mt-1" @click="showAll = !showAll">
    {{ showAll ? 'Show less' : `+${attachments.length - 4} more` }}
  </button>
</template>

<script setup lang="ts">
import type { FileAttachment } from '~/types/post'
import { getFileUrl } from '~/utils/files'

const props = defineProps<{
  attachments: FileAttachment[]
}>()

const showAll = ref(false)

const visibleAttachments = computed(() => {
  if (showAll.value) return props.attachments
  return props.attachments.slice(0, 4)
})

const gridClass = computed(() => {
  const count = visibleAttachments.value.length
  if (count === 1) return 'grid-cols-1'
  return 'grid-cols-2'
})

function getAttachmentUrl(attachment: FileAttachment): string | null {
  return attachment.url || getFileUrl(attachment.id)
}
</script>
