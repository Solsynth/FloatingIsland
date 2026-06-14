import { openDB, type IDBPDatabase } from 'idb'
import type { SnChatMessage, SnChatRoom } from '~/types/chat'

const DB_NAME = 'solar-chat'
const DB_VERSION = 1

interface ChatDBSchema {
  messages: {
    key: string
    value: SnChatMessage & { roomId: string; createdAtMs: number }
    indexes: {
      'by-room': string
      'by-room-time': [string, number]
    }
  }
  rooms: {
    key: string
    value: SnChatRoom
  }
  meta: {
    key: string
    value: { key: string; value: string }
  }
}

let dbPromise: Promise<IDBPDatabase<ChatDBSchema>> | null = null

function getDB(): Promise<IDBPDatabase<ChatDBSchema>> {
  if (!dbPromise) {
    dbPromise = openDB<ChatDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Messages store
        if (!db.objectStoreNames.contains('messages')) {
          const msgStore = db.createObjectStore('messages', { keyPath: 'id' })
          msgStore.createIndex('by-room', 'roomId')
          msgStore.createIndex('by-room-time', ['roomId', 'createdAtMs'])
        }

        // Rooms store
        if (!db.objectStoreNames.contains('rooms')) {
          db.createObjectStore('rooms', { keyPath: 'id' })
        }

        // Meta store (for sync cursors, etc.)
        if (!db.objectStoreNames.contains('meta')) {
          db.createObjectStore('meta', { keyPath: 'key' })
        }
      },
    })
  }
  return dbPromise
}

// Convert SnChatMessage to storable format
function toStoredMessage(msg: SnChatMessage): ChatDBSchema['messages']['value'] {
  return {
    ...msg,
    roomId: msg.chatRoomId,
    createdAtMs: new Date(msg.createdAt).getTime(),
  }
}

export const messageCache = {
  // ── Messages ────────────────────────────────────────────────────────────

  /** Save a single message to the cache */
  async saveMessage(message: SnChatMessage): Promise<void> {
    const db = await getDB()
    await db.put('messages', toStoredMessage(message))
  },

  /** Save multiple messages in a batch */
  async saveMessages(messages: SnChatMessage[]): Promise<void> {
    if (messages.length === 0) return
    const db = await getDB()
    const tx = db.transaction('messages', 'readwrite')
    await Promise.all([
      ...messages.map((msg) => tx.store.put(toStoredMessage(msg))),
      tx.done,
    ])
  },

  /** Get a single message by ID */
  async getMessage(id: string): Promise<SnChatMessage | null> {
    const db = await getDB()
    const msg = await db.get('messages', id)
    if (!msg) return null
    // Strip internal fields
    const { roomId: _, createdAtMs: __, ...rest } = msg
    return rest as SnChatMessage
  },

  /** Get messages for a room, ordered by createdAt ascending */
  async getMessages(
    roomId: string,
    offset = 0,
    limit = 50,
  ): Promise<SnChatMessage[]> {
    const db = await getDB()
    const index = db.transaction('messages').store.index('by-room-time')

    // Use IDBKeyRange to get messages for this room
    const range = IDBKeyRange.bound(
      [roomId, 0],
      [roomId, Number.MAX_SAFE_INTEGER],
    )

    let cursor = await index.openCursor(range, 'prev') // newest first
    const results: SnChatMessage[] = []
    let skipped = 0

    while (cursor) {
      if (skipped < offset) {
        skipped++
        cursor = await cursor.continue()
        continue
      }
      if (results.length >= limit) break

      const { roomId: _, createdAtMs: __, ...rest } = cursor.value
      results.push(rest as SnChatMessage)
      cursor = await cursor.continue()
    }

    // Reverse to get ascending order (oldest first)
    return results.reverse()
  },

  /** Get the latest N messages for a room (for initial load) */
  async getLatestMessages(roomId: string, limit = 50): Promise<SnChatMessage[]> {
    const db = await getDB()
    const index = db.transaction('messages').store.index('by-room-time')

    const range = IDBKeyRange.bound(
      [roomId, 0],
      [roomId, Number.MAX_SAFE_INTEGER],
    )

    let cursor = await index.openCursor(range, 'prev') // newest first
    const results: SnChatMessage[] = []

    while (cursor && results.length < limit) {
      const { roomId: _, createdAtMs: __, ...rest } = cursor.value
      results.push(rest as SnChatMessage)
      cursor = await cursor.continue()
    }

    return results.reverse() // ascending order
  },

  /** Delete a message by ID */
  async deleteMessage(id: string): Promise<void> {
    const db = await getDB()
    await db.delete('messages', id)
  },

  /** Delete all messages for a room */
  async clearRoom(roomId: string): Promise<void> {
    const db = await getDB()
    const tx = db.transaction('messages', 'readwrite')
    const index = tx.store.index('by-room')
    let cursor = await index.openCursor(roomId)

    while (cursor) {
      await cursor.delete()
      cursor = await cursor.continue()
    }
    await tx.done
  },

  /** Get the count of cached messages for a room */
  async getMessageCount(roomId: string): Promise<number> {
    const db = await getDB()
    const index = db.transaction('messages').store.index('by-room')
    return index.count(roomId)
  },

  // ── Rooms ───────────────────────────────────────────────────────────────

  /** Save a room to the cache */
  async saveRoom(room: SnChatRoom): Promise<void> {
    const db = await getDB()
    await db.put('rooms', room)
  },

  /** Save multiple rooms in a batch */
  async saveRooms(rooms: SnChatRoom[]): Promise<void> {
    if (!Array.isArray(rooms) || rooms.length === 0) return
    const db = await getDB()
    const tx = db.transaction('rooms', 'readwrite')
    await Promise.all([
      ...rooms.map((room) => tx.store.put(room)),
      tx.done,
    ])
  },

  /** Get all cached rooms */
  async getRooms(): Promise<SnChatRoom[]> {
    const db = await getDB()
    return db.getAll('rooms')
  },

  /** Get a single room by ID */
  async getRoom(id: string): Promise<SnChatRoom | null> {
    const db = await getDB()
    return (await db.get('rooms', id)) ?? null
  },

  /** Delete a room from cache */
  async deleteRoom(id: string): Promise<void> {
    const db = await getDB()
    await db.delete('rooms', id)
  },

  // ── Meta (sync cursors, etc.) ───────────────────────────────────────────

  /** Get a meta value */
  async getMeta(key: string): Promise<string | null> {
    const db = await getDB()
    const entry = await db.get('meta', key)
    return entry?.value ?? null
  },

  /** Set a meta value */
  async setMeta(key: string, value: string): Promise<void> {
    const db = await getDB()
    await db.put('meta', { key, value })
  },

  // ── Utilities ───────────────────────────────────────────────────────────

  /** Clear all data */
  async clearAll(): Promise<void> {
    const db = await getDB()
    const tx = db.transaction(['messages', 'rooms', 'meta'], 'readwrite')
    await Promise.all([
      tx.objectStore('messages').clear(),
      tx.objectStore('rooms').clear(),
      tx.objectStore('meta').clear(),
      tx.done,
    ])
  },
}
