<template>
  <button
    class="relative flex items-center justify-center rounded-xl p-3 transition-all duration-300 hover:bg-base-200 hover:text-primary"
    :class="collapsed ? 'px-3' : ''"
    :aria-label="t('notifications.bellLabel')"
    @click="handleClick"
  >
    <IconBell class="h-6 w-6 shrink-0 transition-colors" />
    <span
      v-if="unreadCount > 0"
      class="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-error px-1 text-xs font-bold text-error-content"
    >
      {{ displayCount }}
    </span>
  </button>
</template>

<script setup lang="ts">
const { t } = useI18n()
const { collapsed } = useSidebar()
const { unreadCount, openDrawer } = useNotifications()

const displayCount = computed(() => {
  if (unreadCount.value > 99) return '99+'
  return String(unreadCount.value)
})

function handleClick() {
  openDrawer()
}
</script>
