import mitt from 'mitt'
import type { WebSocketPacket, SnChatMessage, SnChatMember } from '~/types/chat'
import type { SnNotification } from '~/types/notification'

// Define all event types
export type EventBusEvents = {
  // WebSocket status
  'ws:status': 'connecting' | 'connected' | 'disconnected' | 'error'
  'ws:message': WebSocketPacket

  // Notifications
  'notification:new': SnNotification
  'notification:count': number

  // Chat messages
  'chat:message:new': SnChatMessage
  'chat:message:update': SnChatMessage
  'chat:message:delete': { messageId: string; roomId: string }

  // Chat room updates
  'chat:room:read': { roomId: string; accountId: string }

  // Typing indicators
  'chat:typing': {
    roomId: string
    sender: SnChatMember
    activityType: string
    progress?: number
  }
}

// Create and export the event bus
export const eventBus = mitt<EventBusEvents>()
