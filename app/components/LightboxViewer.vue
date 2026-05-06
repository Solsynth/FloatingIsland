<template>
  <Teleport to="body">
    <dialog
      v-if="state.isOpen"
      class="modal modal-open"
      @close="close"
    >
      <div class="modal-box max-w-5xl p-0 bg-black">
        <button
          class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 z-10"
          @click="close"
        >
          <IconX class="w-5 h-5" />
        </button>

        <!-- Image viewer -->
        <div class="relative">
          <img
            v-if="currentAttachment"
            :src="getFileUrl(currentAttachment.id)"
            :alt="currentAttachment.name"
            class="w-full h-auto max-h-[80vh] object-contain"
          >

          <!-- Navigation -->
          <button
            v-if="state.currentIndex > 0"
            class="absolute left-4 top-1/2 -translate-y-1/2 btn btn-circle btn-sm bg-black/50 border-none text-white hover:bg-black/70"
            @click="prev"
          >
            <IconChevronLeft class="w-5 h-5" />
          </button>
          <button
            v-if="state.currentIndex < state.attachments.length - 1"
            class="absolute right-4 top-1/2 -translate-y-1/2 btn btn-circle btn-sm bg-black/50 border-none text-white hover:bg-black/70"
            @click="next"
          >
            <IconChevronRight class="w-5 h-5" />
          </button>

          <!-- Counter -->
          <div class="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/60 rounded-full text-sm text-white backdrop-blur-sm">
            {{ state.currentIndex + 1 }} / {{ state.attachments.length }}
          </div>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button @click="close">close</button>
      </form>
    </dialog>
  </Teleport>
</template>

<script setup lang="ts">
import { getFileUrl } from '~/utils/files';
import {
  IconChevronLeft,
  IconChevronRight,
  IconX,
} from '#components';

const { state, close, next, prev } = useLightbox();

const currentAttachment = computed(() => {
  return state.attachments[state.currentIndex];
});

// Handle keyboard navigation
onMounted(() => {
  const handleKeydown = (e: KeyboardEvent) => {
    if (!state.isOpen) return;

    switch (e.key) {
      case 'ArrowLeft':
        prev();
        break;
      case 'ArrowRight':
        next();
        break;
      case 'Escape':
        close();
        break;
    }
  };

  document.addEventListener('keydown', handleKeydown);
  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown);
  });
});
</script>
