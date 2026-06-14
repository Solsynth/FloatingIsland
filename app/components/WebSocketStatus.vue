<template>
  <Transition name="ws-status">
    <div
      v-if="shouldShow"
      class="fixed top-2 left-1/2 z-[10000] -translate-x-1/2"
    >
      <div
        class="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium shadow-lg backdrop-blur-sm"
        :class="statusClasses"
      >
        <span class="relative flex h-2.5 w-2.5">
          <span
            v-if="status === 'connecting'"
            class="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
            :class="dotColorClass"
          />
          <span
            class="relative inline-flex h-2.5 w-2.5 rounded-full"
            :class="dotColorClass"
          />
        </span>
        <span>{{ statusText }}</span>
        <button
          v-if="status === 'disconnected' || status === 'error'"
          class="ml-1 rounded-full bg-white/20 px-2 py-0.5 text-xs hover:bg-white/30"
          @click="handleReconnect"
        >
          {{ t('ws.reconnect') }}
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const { t } = useI18n()
const { status, manualReconnect } = useWebSocket()

// Show banner for non-connected states (but hide 'connected' after a brief delay)
const justConnected = ref(false)

watch(status, (newStatus) => {
  if (newStatus === 'connected') {
    justConnected.value = true
    setTimeout(() => {
      justConnected.value = false
    }, 2000)
  }
})

const shouldShow = computed(() => {
  if (status.value === 'connected' && !justConnected.value) return false
  return true
})

const statusText = computed(() => {
  switch (status.value) {
    case 'connecting':
      return t('ws.connecting')
    case 'connected':
      return t('ws.connected')
    case 'disconnected':
      return t('ws.disconnected')
    case 'error':
      return t('ws.error')
    default:
      return ''
  }
})

const statusClasses = computed(() => {
  switch (status.value) {
    case 'connecting':
      return 'bg-warning/90 text-warning-content'
    case 'connected':
      return 'bg-success/90 text-success-content'
    case 'disconnected':
      return 'bg-base-content/80 text-base-100'
    case 'error':
      return 'bg-error/90 text-error-content'
    default:
      return ''
  }
})

const dotColorClass = computed(() => {
  switch (status.value) {
    case 'connecting':
      return 'bg-warning-content'
    case 'connected':
      return 'bg-success-content'
    case 'disconnected':
      return 'bg-base-100'
    case 'error':
      return 'bg-error-content'
    default:
      return ''
  }
})

function handleReconnect() {
  manualReconnect()
}
</script>

<style scoped>
.ws-status-enter-active {
  transition: all 0.3s ease-out;
}
.ws-status-leave-active {
  transition: all 0.2s ease-in;
}
.ws-status-enter-from,
.ws-status-leave-to {
  opacity: 0;
  transform: translate(-50%, -100%);
}
</style>
