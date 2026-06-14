<template>
  <div class="border-t border-base-300 bg-base-100 px-4 py-3">
    <form
      class="flex items-end gap-2"
      @submit.prevent="handleSend"
    >
      <div class="relative flex-1">
        <textarea
          ref="inputRef"
          v-model="message"
          :placeholder="t('chat.inputPlaceholder')"
          class="textarea textarea-bordered w-full resize-none text-sm"
          :rows="1"
          @keydown="handleKeydown"
          @input="handleInput"
        />
      </div>

      <button
        type="submit"
        class="btn btn-circle btn-primary btn-sm"
        :disabled="!canSend"
      >
        <IconSend class="h-4 w-4" />
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { IconSend } from '#components'

const emit = defineEmits<{
  send: [content: string]
  typing: []
}>()

const { t } = useI18n()
const message = ref('')
const inputRef = ref<HTMLTextAreaElement | null>(null)

const canSend = computed(() => message.value.trim().length > 0)

function handleSend() {
  const content = message.value.trim()
  if (!content) return

  emit('send', content)
  message.value = ''

  // Reset textarea height
  nextTick(() => {
    if (inputRef.value) {
      inputRef.value.style.height = 'auto'
    }
  })
}

function handleKeydown(event: KeyboardEvent) {
  // Send on Enter (without Shift)
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSend()
  }
}

function handleInput() {
  // Auto-resize textarea
  const el = inputRef.value
  if (el) {
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }

  // Emit typing event
  emit('typing')
}
</script>
