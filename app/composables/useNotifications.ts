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

// Global singleton state (shared across all callers)
const globalState = reactive<NotificationState>({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  hasMore: true,
  offset: 0,
})

const globalDrawerOpen = ref(false)
let cleanupFn: (() => void) | null = null
let isInitialized = false

export function useNotifications() {
  const { isAuthenticated } = useAuth()

  // Subscribe to WebSocket events
  function setupListeners() {
    if (cleanupFn) return

    const onNewNotification = (notification: SnNotification) => {
      // Don't count messages.new notifications (those are chat messages)
      if (notification.topic !== 'messages.new') {
        globalState.unreadCount++
      }
      // Add to list if drawer was opened at least once
      if (globalState.notifications.length > 0) {
        globalState.notifications.unshift(notification)
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
      globalState.unreadCount = await fetchNotificationCount()
    } catch (err) {
      console.error('[Notifications] Failed to fetch count:', err)
    }
  }

  // Load notifications list
  async function loadMore() {
    if (globalState.isLoading || !globalState.hasMore) return
    if (!isAuthenticated.value) return

    globalState.isLoading = true
    try {
      const result = await fetchNotifications(globalState.offset, PAGE_SIZE)
      if (globalState.offset === 0) {
        globalState.notifications = result.items
      } else {
        globalState.notifications.push(...result.items)
      }
      globalState.offset += result.items.length
      globalState.hasMore = result.hasMore

      // Mark fetched unread items as read locally
      const unreadInView = result.items.filter((n: SnNotification) => !n.viewedAt).length
      if (unreadInView > 0) {
        globalState.unreadCount = Math.max(0, globalState.unreadCount - unreadInView)
      }
    } catch (err) {
      console.error('[Notifications] Failed to load:', err)
    } finally {
      globalState.isLoading = false
    }
  }

  // Reload from scratch
  async function refresh() {
    globalState.offset = 0
    globalState.hasMore = true
    globalState.notifications = []
    await fetchCount()
    await loadMore()
  }

  // Mark single notification read
  async function markRead(notificationId: string) {
    try {
      await markNotificationRead(notificationId)
      const notification = globalState.notifications.find(
        (n) => n.id === notificationId,
      )
      if (notification && !notification.viewedAt) {
        notification.viewedAt = new Date().toISOString()
        globalState.unreadCount = Math.max(0, globalState.unreadCount - 1)
      }
    } catch (err) {
      console.error('[Notifications] Failed to mark read:', err)
    }
  }

  // Mark all notifications read
  async function markAllRead() {
    try {
      await markAllNotificationsRead()
      globalState.notifications.forEach((n) => {
        if (!n.viewedAt) {
          n.viewedAt = new Date().toISOString()
        }
      })
      globalState.unreadCount = 0
    } catch (err) {
      console.error('[Notifications] Failed to mark all read:', err)
    }
  }

  // Open drawer and load if needed
  function openDrawer() {
    globalDrawerOpen.value = true
    if (globalState.notifications.length === 0) {
      refresh()
    }
  }

  function closeDrawer() {
    globalDrawerOpen.value = false
  }

  // Initialize on auth (only once)
  watch(isAuthenticated, (auth) => {
    if (auth && !isInitialized) {
      isInitialized = true
      setupListeners()
      fetchCount()
    } else if (!auth) {
      teardownListeners()
      globalState.notifications = []
      globalState.unreadCount = 0
      globalState.offset = 0
      globalState.hasMore = true
      isInitialized = false
    }
  }, { immediate: true })

  // Cleanup on unmount
  onUnmounted(() => {
    // Don't teardown listeners on unmount since state is global
  })

  return {
    notifications: computed(() => globalState.notifications),
    unreadCount: computed(() => globalState.unreadCount),
    isLoading: computed(() => globalState.isLoading),
    hasMore: computed(() => globalState.hasMore),
    drawerOpen: globalDrawerOpen,
    openDrawer,
    closeDrawer,
    loadMore,
    refresh,
    markRead,
    markAllRead,
  }
}
