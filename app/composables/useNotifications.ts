import type { SnNotification } from '~/types/notification'
import { eventBus } from '~/utils/eventBus'

interface NotificationState {
  notifications: SnNotification[]
  unreadCount: number
  isLoading: boolean
  hasMore: boolean
  offset: number
}

const PAGE_SIZE = 20

export function useNotifications() {
  const state = reactive<NotificationState>({
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    hasMore: true,
    offset: 0,
  })

  const drawerOpen = ref(false)
  const { isAuthenticated } = useAuth()

  // Subscribe to WebSocket events
  let cleanupFn: (() => void) | null = null

  function setupListeners() {
    if (cleanupFn) return

    const onNewNotification = (notification: SnNotification) => {
      // Don't count messages.new notifications (those are chat messages)
      if (notification.topic !== 'messages.new') {
        state.unreadCount++
      }
      // Add to list if drawer was opened at least once
      if (state.notifications.length > 0) {
        state.notifications.unshift(notification)
      }
    }

    eventBus.on('notification:new', onNewNotification)

    cleanupFn = () => {
      eventBus.off('notification:new', onNewNotification)
    }
  }

  function teardownListeners() {
    cleanupFn?.()
    cleanupFn = null
  }

  // Load notification count from API
  async function fetchCount() {
    if (!isAuthenticated.value) return
    try {
      state.unreadCount = await fetchNotificationCount()
    } catch (err) {
      console.error('[Notifications] Failed to fetch count:', err)
    }
  }

  // Load notifications list
  async function loadMore() {
    if (state.isLoading || !state.hasMore) return
    if (!isAuthenticated.value) return

    state.isLoading = true
    try {
      const result = await fetchNotifications(state.offset, PAGE_SIZE)
      if (state.offset === 0) {
        state.notifications = result.items
      } else {
        state.notifications.push(...result.items)
      }
      state.offset += result.items.length
      state.hasMore = result.hasMore

      // Mark fetched unread items as read locally
      const unreadInView = result.items.filter((n) => !n.viewedAt).length
      if (unreadInView > 0) {
        state.unreadCount = Math.max(0, state.unreadCount - unreadInView)
      }
    } catch (err) {
      console.error('[Notifications] Failed to load:', err)
    } finally {
      state.isLoading = false
    }
  }

  // Reload from scratch
  async function refresh() {
    state.offset = 0
    state.hasMore = true
    state.notifications = []
    await fetchCount()
    await loadMore()
  }

  // Mark single notification read
  async function markRead(notificationId: string) {
    try {
      await markNotificationRead(notificationId)
      const notification = state.notifications.find(
        (n) => n.id === notificationId,
      )
      if (notification && !notification.viewedAt) {
        notification.viewedAt = new Date().toISOString()
        state.unreadCount = Math.max(0, state.unreadCount - 1)
      }
    } catch (err) {
      console.error('[Notifications] Failed to mark read:', err)
    }
  }

  // Mark all notifications read
  async function markAllRead() {
    try {
      await markAllNotificationsRead()
      state.notifications.forEach((n) => {
        if (!n.viewedAt) {
          n.viewedAt = new Date().toISOString()
        }
      })
      state.unreadCount = 0
    } catch (err) {
      console.error('[Notifications] Failed to mark all read:', err)
    }
  }

  // Open drawer and load if needed
  function openDrawer() {
    drawerOpen.value = true
    if (state.notifications.length === 0) {
      refresh()
    }
  }

  function closeDrawer() {
    drawerOpen.value = false
  }

  // Initialize on auth
  watch(isAuthenticated, (auth) => {
    if (auth) {
      setupListeners()
      fetchCount()
    } else {
      teardownListeners()
      state.notifications = []
      state.unreadCount = 0
      state.offset = 0
      state.hasMore = true
    }
  }, { immediate: true })

  // Cleanup on unmount
  onUnmounted(() => {
    teardownListeners()
  })

  return {
    notifications: computed(() => state.notifications),
    unreadCount: computed(() => state.unreadCount),
    isLoading: computed(() => state.isLoading),
    hasMore: computed(() => state.hasMore),
    drawerOpen,
    openDrawer,
    closeDrawer,
    loadMore,
    refresh,
    markRead,
    markAllRead,
  }
}
