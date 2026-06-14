export default defineNuxtPlugin(() => {
  const { isAuthenticated } = useAuth()
  const ws = useWebSocket()

  // Connect WebSocket when user is authenticated
  watch(
    isAuthenticated,
    (authenticated) => {
      if (authenticated) {
        console.log('[Plugin] User authenticated, connecting WebSocket...')
        ws.connect()
      } else {
        console.log('[Plugin] User logged out, disconnecting WebSocket...')
        ws.disconnect()
      }
    },
    { immediate: true },
  )

  // Clean up on page unload
  if (import.meta.client) {
    window.addEventListener('beforeunload', () => {
      ws.disconnect()
    })
  }

  // Provide WebSocket instance globally
  return {
    provide: {
      ws,
    },
  }
})
