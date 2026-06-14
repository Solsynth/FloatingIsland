<template>
  <div
    ref="containerRef"
    class="flex flex-1 flex-col overflow-y-auto py-2"
    @scroll="handleScroll"
  >
    <!-- Load more indicator -->
    <div
      v-if="isLoadingMore"
      class="flex items-center justify-center py-3"
    >
      <span class="loading loading-spinner loading-sm text-primary" />
    </div>

    <!-- Load more button -->
    <div
      v-else-if="hasMore && messages.length > 0"
      class="flex items-center justify-center py-3"
    >
      <button
        class="btn btn-ghost btn-xs text-xs text-base-content/50"
        @click="$emit('loadMore')"
      >
        {{ t('chat.loadMore') }}
      </button>
    </div>

    <!-- Initial loading -->
    <div
      v-if="isLoading && messages.length === 0"
      class="flex flex-1 items-center justify-center"
    >
      <span class="loading loading-spinner loading-lg text-primary" />
    </div>

    <!-- Empty state -->
    <div
      v-else-if="messages.length === 0"
      class="flex flex-1 flex-col items-center justify-center text-center"
    >
      <IconMessageSquare class="mb-3 h-12 w-12 text-base-content/20" />
      <p class="text-sm text-base-content/40">
        {{ t('chat.noMessages') }}
      </p>
      <p class="mt-1 text-xs text-base-content/30">
        {{ t('chat.sendFirstMessage') }}
      </p>
    </div>

    <!-- Messages with grouping -->
    <div v-else>
      <template v-for="(msg, index) in messages" :key="msg.id">
        <!-- Date separator -->
        <div
          v-if="showDateSeparator(index)"
          class="my-3 flex items-center gap-3 px-4"
        >
          <div class="h-px flex-1 bg-base-300" />
          <span class="text-xs font-medium text-base-content/40">
            {{ formatDate(msg.createdAt) }}
          </span>
          <div class="h-px flex-1 bg-base-300" />
        </div>

        <!-- Message with grouping -->
        <div :id="`message-${msg.id}`">
          <ChatMessageItem
            :message="msg"
            :is-own="msg.senderId === currentUserId"
            :sender-name="getSenderName(msg)"
            :show-avatar="true"
            :is-first-in-group="isFirstInGroup(index)"
            :is-last-in-group="isLastInGroup(index)"
            @jump="handleJumpToMessage"
            @reply="$emit('reply', $event)"
            @forward="$emit('forward', $event)"
            @edit="$emit('edit', $event)"
            @delete="$emit('delete', $event)"
          />
        </div>
      </template>
    </div>

    <!-- Typing indicator -->
    <ChatTypingIndicator
      v-if="typingIndicators.length > 0"
      :indicators="typingIndicators"
    />

    <!-- Scroll anchor -->
    <div ref="scrollAnchor" />
  </div>
</template>

<script setup lang="ts">
import { IconMessageSquare } from '#components'
import type { SnChatMessage, ChatActivityStatus } from '~/types/chat'
import { isSameDay, formatChatDate } from '~/utils/datetime'

const props = defineProps<{
  messages: SnChatMessage[]
  isLoading: boolean
  isLoadingMore: boolean
  hasMore: boolean
  typingIndicators: ChatActivityStatus[]
  currentUserId?: string
}>()

defineEmits<{
  loadMore: []
  reply: [message: SnChatMessage]
  forward: [message: SnChatMessage]
  edit: [message: SnChatMessage]
  delete: [message: SnChatMessage]
}>()

const { t } = useI18n()
const containerRef = ref<HTMLElement | null>(null)
const scrollAnchor = ref<HTMLElement | null>(null)
const isNearBottom = ref(true)

// Auto-scroll to bottom when new messages arrive
watch(
  () => props.messages.length,
  (newLen, oldLen) => {
    if (newLen > oldLen && isNearBottom.value) {
      nextTick(() => {
        scrollToBottom()
      })
    }
  },
)

function scrollToBottom(smooth = true) {
  scrollAnchor.value?.scrollIntoView({
    behavior: smooth ? 'smooth' : 'instant',
    block: 'end',
  })
}

function handleScroll() {
  const el = containerRef.value
  if (!el) return

  const threshold = 150
  isNearBottom.value =
    el.scrollHeight - el.scrollTop - el.clientHeight < threshold
}

// Jump to a specific message by ID
function handleJumpToMessage(messageId: string) {
  const messageEl = document.getElementById(`message-${messageId}`)
  if (messageEl) {
    messageEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
    // Add highlight effect
    messageEl.classList.add('bg-primary/20')
    setTimeout(() => {
      messageEl.classList.remove('bg-primary/20')
    }, 2000)
  }
}

function showDateSeparator(index: number): boolean {
  if (index === 0) return true
  const current = props.messages[index]
  const prev = props.messages[index - 1]
  if (!current || !prev) return false
  return !isSameDay(current.createdAt, prev.createdAt)
}

// Use datetime utility for proper local date formatting
function formatDate(dateStr: string): string {
  return formatChatDate(dateStr)
}

function getSenderName(msg: SnChatMessage): string {
  return msg.sender?.nick || msg.sender?.account?.nick || msg.sender?.account?.name || ''
}

// Check if two messages are in the same sender group (within 3 minutes)
function isSameSenderGroup(index1: number, index2: number): boolean {
  if (index1 < 0 || index1 >= props.messages.length) return false
  if (index2 < 0 || index2 >= props.messages.length) return false

  const msg1 = props.messages[index1]
  const msg2 = props.messages[index2]
  if (!msg1 || !msg2) return false

  // Different sender
  if (msg1.senderId !== msg2.senderId) return false

  // More than 3 minutes apart
  const timeDiff = Math.abs(
    new Date(msg1.createdAt).getTime() - new Date(msg2.createdAt).getTime(),
  )
  if (timeDiff > 3 * 60 * 1000) return false

  // Different day
  if (!isSameDay(msg1.createdAt, msg2.createdAt)) return false

  return true
}

// Is this the first message in a sender group?
function isFirstInGroup(index: number): boolean {
  if (index === 0) return true
  return !isSameSenderGroup(index, index - 1)
}

// Is this the last message in a sender group?
function isLastInGroup(index: number): boolean {
  if (index === props.messages.length - 1) return true
  return !isSameSenderGroup(index, index + 1)
}

// Scroll to bottom on mount
onMounted(() => {
  nextTick(() => scrollToBottom(false))
})
</script>
