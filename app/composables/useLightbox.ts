import type { FileAttachment } from '~/types/post';

interface LightboxState {
  isOpen: boolean;
  attachments: FileAttachment[];
  currentIndex: number;
}

const state = reactive<LightboxState>({
  isOpen: false,
  attachments: [],
  currentIndex: 0,
});

export function useLightbox() {
  function open(attachments: FileAttachment[], index: number = 0) {
    state.attachments = attachments;
    state.currentIndex = index;
    state.isOpen = true;
  }

  function close() {
    state.isOpen = false;
  }

  function next() {
    if (state.currentIndex < state.attachments.length - 1) {
      state.currentIndex++;
    }
  }

  function prev() {
    if (state.currentIndex > 0) {
      state.currentIndex--;
    }
  }

  function goTo(index: number) {
    if (index >= 0 && index < state.attachments.length) {
      state.currentIndex = index;
    }
  }

  return {
    state: readonly(state),
    open,
    close,
    next,
    prev,
    goTo,
  };
}
