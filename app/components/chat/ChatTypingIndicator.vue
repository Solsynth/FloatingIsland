<template>
  <div class="flex items-center gap-2 px-4 py-2">
    <div class="flex -space-x-1">
      <div
        v-for="indicator in indicators"
        :key="indicator.sender.id"
        class="avatar avatar-placeholder"
      >
        <div class="w-6 rounded-full bg-base-300 text-base-content">
          <span class="text-[8px] font-medium">
            {{ getInitials(indicator.sender.account?.nick || indicator.sender.account?.name || '?') }}
          </span>
        </div>
      </div>
    </div>

    <div class="flex items-center gap-1">
      <span class="text-xs text-base-content/50">
        {{ typingText }}
      </span>
      <span class="flex gap-0.5">
        <span
          class="h-1 w-1 animate-bounce rounded-full bg-base-content/40"
          style="animation-delay: 0ms"
        />
        <span
          class="h-1 w-1 animate-bounce rounded-full bg-base-content/40"
          style="animation-delay: 150ms"
        />
        <span
          class="h-1 w-1 animate-bounce rounded-full bg-base-content/40"
          style="animation-delay: 300ms"
        />
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ChatActivityStatus } from '~/types/chat'

const props = defineProps<{
  indicators: ChatActivityStatus[]
}>()

const { t } = useI18n()

function getInitials(name: string): string {
  return name.slice(0, 2).toUpperCase()
}

const typingText = computed(() => {
  const names = props.indicators.map(
    (i) => i.sender.nick || i.sender.account?.nick || i.sender.account?.name || 'Someone',
  )

  if (names.length === 1) {
    return t('chat.isTyping', { name: names[0] })
  }
  if (names.length === 2) {
    return t('chat.areTyping', { names: names.join(` ${t('chat.and')} `) })
  }
  return t('chat.multipleTyping', { count: names.length })
})
</script>
