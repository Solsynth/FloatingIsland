<template>
  <dialog id="compose-dialog" class="modal modal-open" ref="dialogRef">
    <div
      class="modal-box p-0 overflow-hidden max-w-2xl w-[calc(100%-2rem)] max-h-[calc(100vh-4rem)] flex flex-col"
      :class="{ 'h-[calc(100vh-4rem)]': isMobile }"
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-4 py-3 border-b border-base-200 bg-base-100">
        <div class="flex items-center gap-3">
          <button class="btn btn-sm btn-circle btn-ghost" @click="handleClose">
            <IconX class="w-5 h-5" />
          </button>
          <h3 class="font-semibold">
            {{ dialogTitle }}
          </h3>
        </div>

        <div class="flex items-center gap-2">
          <!-- Auto-save indicator -->
          <span v-if="lastSaved" class="text-xs text-base-content/50 hidden sm:block">
            Saved {{ formatTimeAgo(lastSaved) }}
          </span>

          <!-- Settings Button -->
          <div class="dropdown dropdown-end">
            <button class="btn btn-sm btn-circle btn-ghost" tabindex="0">
              <IconSettings class="w-5 h-5" />
            </button>
            <div class="dropdown-content z-20 menu p-2 shadow-lg bg-base-100 rounded-box w-64 mt-2">
              <div class="p-3 space-y-4">
                <!-- Visibility -->
                <div>
                  <label class="text-xs font-medium text-base-content/70 mb-1.5 block">Visibility</label>
                  <select v-model="visibility" class="select select-bordered select-sm w-full">
                    <option :value="0">Public</option>
                    <option :value="1">Friends Only</option>
                    <option :value="2">Unlisted</option>
                    <option :value="3">Private</option>
                  </select>
                </div>

                <!-- Language -->
                <div>
                  <label class="text-xs font-medium text-base-content/70 mb-1.5 block">Language</label>
                  <select v-model="language" class="select select-bordered select-sm w-full">
                    <option :value="null">Auto-detect</option>
                    <option value="en">English</option>
                    <option value="zh">Chinese</option>
                    <option value="ja">Japanese</option>
                    <option value="ko">Korean</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="ru">Russian</option>
                  </select>
                </div>

                <!-- Draft Actions -->
                <div class="pt-2 border-t border-base-200">
                  <button class="btn btn-sm btn-ghost w-full gap-2" @click="saveDraftManually">
                    <IconSave class="w-4 h-4" />
                    Save Draft Now
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <button
            class="btn btn-sm btn-primary gap-2"
            :disabled="!canSubmit"
            @click="handleSubmit"
          >
            <IconLoader v-if="submitting" class="w-4 h-4 animate-spin" />
            <IconSend v-else class="w-4 h-4" />
            <span class="hidden sm:inline">{{ submitButtonText }}</span>
          </button>
        </div>
      </div>

      <!-- Scrollable Content -->
      <div class="flex-1 overflow-y-auto">
        <div class="p-4 space-y-4">
          <!-- Publisher Selector -->
          <div v-if="publishers.length > 0" class="flex items-center gap-3">
            <div v-if="currentPublisher" class="flex items-center gap-2">
              <div class="avatar">
                <div class="w-8 h-8 rounded-full">
                  <img
                    v-if="currentPublisher.picture?.id"
                    :src="getFileUrl(currentPublisher.picture.id)"
                    alt=""
                    class="w-full h-full object-cover"
                  />
                  <div v-else class="w-full h-full bg-primary text-primary-content flex items-center justify-center text-sm font-medium">
                    {{ getInitials(currentPublisher.nick || currentPublisher.name) }}
                  </div>
                </div>
              </div>
              <div class="flex flex-col">
                <span class="text-sm font-medium">{{ currentPublisher.nick || currentPublisher.name }}</span>
                <span class="text-xs text-base-content/50">@{{ currentPublisher.name }}</span>
              </div>
            </div>

            <div v-if="publishers.length > 1" class="dropdown">
              <button class="btn btn-xs btn-ghost gap-1">
                <IconChevronDown class="w-4 h-4" />
                Change
              </button>
              <ul class="dropdown-content z-20 menu p-2 shadow-lg bg-base-100 rounded-box w-56 mt-2">
                <li v-for="pub in publishers" :key="pub.id">
                  <button class="flex items-center gap-2" @click="selectPublisher(pub)">
                    <div class="avatar">
                      <div class="w-6 h-6 rounded-full">
                        <img
                          v-if="pub.picture?.id"
                          :src="getFileUrl(pub.picture.id)"
                          alt=""
                          class="w-full h-full object-cover"
                        />
                        <div v-else class="w-full h-full bg-primary text-primary-content flex items-center justify-center text-xs">
                          {{ getInitials(pub.nick || pub.name) }}
                        </div>
                      </div>
                    </div>
                    <span class="truncate">{{ pub.nick || pub.name }}</span>
                    <IconCheck v-if="pub.id === currentPublisher?.id" class="w-4 h-4 ml-auto text-success" />
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <!-- Reply Context -->
          <div v-if="replyingTo" class="p-3 bg-base-200/50 rounded-lg border-l-4 border-primary">
            <div class="flex items-center gap-2 text-sm text-base-content/70 mb-1">
              <IconReply class="w-4 h-4" />
              <span>Replying to</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="avatar">
                <div class="w-6 h-6 rounded-full">
                  <img
                    v-if="replyingTo.publisher?.picture?.id"
                    :src="getFileUrl(replyingTo.publisher.picture.id)"
                    alt=""
                    class="w-full h-full object-cover"
                  />
                  <div v-else class="w-full h-full bg-primary/20 text-primary flex items-center justify-center text-xs">
                    {{ getInitials(replyingTo.publisher?.nick || replyingTo.publisher?.name || '?') }}
                  </div>
                </div>
              </div>
              <span class="text-sm font-medium">{{ replyingTo.publisher?.nick || replyingTo.publisher?.name }}</span>
              <span class="text-sm text-base-content/50 line-clamp-1">{{ replyingTo.content.slice(0, 100) }}</span>
            </div>
          </div>

          <!-- Forward Context -->
          <div v-if="forwardingTo" class="p-3 bg-base-200/50 rounded-lg border-l-4 border-secondary">
            <div class="flex items-center gap-2 text-sm text-base-content/70 mb-1">
              <IconForward class="w-4 h-4" />
              <span>Forwarding</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="avatar">
                <div class="w-6 h-6 rounded-full">
                  <img
                    v-if="forwardingTo.publisher?.picture?.id"
                    :src="getFileUrl(forwardingTo.publisher.picture.id)"
                    alt=""
                    class="w-full h-full object-cover"
                  />
                  <div v-else class="w-full h-full bg-secondary/20 text-secondary flex items-center justify-center text-xs">
                    {{ getInitials(forwardingTo.publisher?.nick || forwardingTo.publisher?.name || '?') }}
                  </div>
                </div>
              </div>
              <span class="text-sm font-medium">{{ forwardingTo.publisher?.nick || forwardingTo.publisher?.name }}</span>
              <span class="text-sm text-base-content/50 line-clamp-1">{{ forwardingTo.content.slice(0, 100) }}</span>
            </div>
          </div>

          <!-- Title Input -->
          <input
            v-model="title"
            type="text"
            placeholder="Title (optional)"
            class="input input-bordered w-full"
          />

          <!-- Description Input -->
          <input
            v-model="description"
            type="text"
            placeholder="Description (optional)"
            class="input input-bordered w-full"
          />

          <!-- Content Textarea -->
          <div class="relative">
            <textarea
              ref="contentRef"
              v-model="content"
              placeholder="What's on your mind?"
              class="textarea textarea-bordered w-full min-h-[120px] resize-y"
              @keydown="handleKeyDown"
            />
            <div class="absolute bottom-2 right-2 text-xs text-base-content/40">
              {{ content.length }} chars
            </div>
          </div>

          <!-- Tags Input -->
          <div class="space-y-2">
            <div class="flex items-center gap-2 flex-wrap">
              <span
                v-for="tag in tags"
                :key="tag"
                class="badge badge-primary gap-1"
              >
                #{{ tag }}
                <button class="btn btn-xs btn-ghost btn-circle -mr-1" @click="removeTag(tag)">
                  <IconX class="w-3 h-3" />
                </button>
              </span>
            </div>
            <div class="flex gap-2">
              <input
                v-model="newTag"
                type="text"
                placeholder="Add tags (press Enter)"
                class="input input-bordered input-sm flex-1"
                @keydown.enter.prevent="addNewTag"
              />
              <button class="btn btn-sm btn-ghost" @click="addNewTag">
                <IconPlus class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Attachments -->
          <ComposeAttachmentGrid
            :attachments="attachments"
            @add="handleAddAttachments"
            @remove="removeAttachment"
            @move="handleMoveAttachment"
            @insert="handleInsertAttachment"
          />
        </div>
      </div>

      <!-- Footer / Toolbar -->
      <div class="px-4 py-3 border-t border-base-200 bg-base-100">
        <div class="flex items-center justify-between">
          <!-- Toolbar Actions -->
          <div class="flex items-center gap-1">
            <input
              ref="imageInput"
              type="file"
              multiple
              accept="image/*"
              class="hidden"
              @change="handleImageSelect"
            />
            <button
              class="btn btn-sm btn-ghost btn-circle"
              title="Add Image"
              @click="imageInput?.click()"
            >
              <IconImage class="w-5 h-5" />
            </button>

            <input
              ref="videoInput"
              type="file"
              multiple
              accept="video/*"
              class="hidden"
              @change="handleVideoSelect"
            />
            <button
              class="btn btn-sm btn-ghost btn-circle"
              title="Add Video"
              @click="videoInput?.click()"
            >
              <IconVideo class="w-5 h-5" />
            </button>

            <input
              ref="fileInput"
              type="file"
              multiple
              accept="*/*"
              class="hidden"
              @change="handleFileSelect"
            />
            <button
              class="btn btn-sm btn-ghost btn-circle"
              title="Add File"
              @click="fileInput?.click()"
            >
              <IconPaperclip class="w-5 h-5" />
            </button>

            <div class="w-px h-6 bg-base-300 mx-1" />

            <!-- Visibility Badge -->
            <div class="badge badge-ghost gap-1">
              <IconGlobe v-if="visibility === 0" class="w-3.5 h-3.5" />
              <IconUsers v-else-if="visibility === 1" class="w-3.5 h-3.5" />
              <IconEyeOff v-else-if="visibility === 2" class="w-3.5 h-3.5" />
              <IconLock v-else class="w-3.5 h-3.5" />
              {{ visibilityLabel.label }}
            </div>
          </div>

          <!-- Character Count & Submit Hint -->
          <div class="flex items-center gap-3">
            <span class="text-xs text-base-content/50 hidden sm:block">
              <kbd class="kbd kbd-sm">Ctrl</kbd> + <kbd class="kbd kbd-sm">Enter</kbd> to post
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Backdrop -->
    <form method="dialog" class="modal-backdrop">
      <button @click="handleClose">close</button>
    </form>
  </dialog>
</template>

<script setup lang="ts">
import type { Post, Publisher, FileAttachment } from '~/types/post'
import { getFileUrl } from '~/utils/files'
import { fetchJson, API_BASE_URL, getValidToken } from '~/utils/api'

const emit = defineEmits<{
  close: []
  submit: [post: Post]
}>()

const compose = useCompose()
const {
  title,
  description,
  content,
  visibility,
  language,
  tags,
  attachments,
  publishers,
  currentPublisher,
  submitting,
  lastSaved,
  canSubmit,
  visibilityLabel,
  replyingTo,
  forwardingTo,
  originalPost,
  hasContent,
  addAttachment,
  addAttachments,
  removeAttachment,
  moveAttachment,
  addTag,
  removeTag,
  setCurrentPublisher,
  setPublishers,
  saveCurrentDraft,
  startAutoSave,
  stopAutoSave,
  reset,
} = compose

const dialogRef = ref<HTMLDialogElement | null>(null)
const contentRef = ref<HTMLTextAreaElement | null>(null)
const isMobile = ref(false)
const newTag = ref('')

// File input refs
const imageInput = ref<HTMLInputElement | null>(null)
const videoInput = ref<HTMLInputElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

// Dialog title
const dialogTitle = computed(() => {
  if (originalPost.value) return 'Edit Post'
  if (replyingTo.value) return 'Write a Reply'
  if (forwardingTo.value) return 'Forward Post'
  return 'New Post'
})

const submitButtonText = computed(() => {
  if (submitting.value) return 'Posting...'
  if (originalPost.value) return 'Save'
  return 'Post'
})

// Check mobile on mount
onMounted(() => {
  isMobile.value = window.innerWidth < 640
  window.addEventListener('resize', () => {
    isMobile.value = window.innerWidth < 640
  })

  // Show the dialog
  dialogRef.value?.showModal()

  // Start auto-save
  startAutoSave()

  // Load publishers
  loadPublishers()
})

onBeforeUnmount(() => {
  stopAutoSave()
})

// Load publishers from API
async function loadPublishers() {
  try {
    const response = await fetchJson<Publisher[]>('/sphere/publishers?mine=true&take=100')
    if (response) {
      setPublishers(response)
    }
  } catch (error) {
    console.error('Failed to load publishers:', error)
  }
}

function selectPublisher(pub: Publisher) {
  setCurrentPublisher(pub)
}

// Attachment handlers
function handleAddAttachments(files: FileList) {
  addAttachments(files)
}

function handleMoveAttachment(index: number, direction: 'up' | 'down') {
  moveAttachment(index, direction)
}

function handleInsertAttachment(id: string) {
  const attachment = attachments.value.find(a => a.id === id)
  if (!attachment) return

  // Insert markdown link at cursor position
  const fileName = attachment.cloudFile?.name || attachment.file.name
  const fileId = attachment.cloudFile?.id || 'PENDING'
  const markdown = `![${fileName}](solian://files/${fileId})`

  const textarea = contentRef.value
  if (textarea) {
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = content.value
    content.value = text.slice(0, start) + markdown + text.slice(end)
    nextTick(() => {
      textarea.selectionStart = textarea.selectionEnd = start + markdown.length
      textarea.focus()
    })
  }
}

function handleImageSelect(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files) {
    addAttachments(input.files)
  }
  input.value = ''
}

function handleVideoSelect(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files) {
    addAttachments(input.files)
  }
  input.value = ''
}

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files) {
    addAttachments(input.files)
  }
  input.value = ''
}

// Tag handlers
function addNewTag() {
  const tag = newTag.value.trim()
  if (tag) {
    addTag(tag.replace(/^#/, ''))
    newTag.value = ''
  }
}

// Keyboard shortcuts
function handleKeyDown(event: KeyboardEvent) {
  // Ctrl/Cmd + Enter to submit
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    event.preventDefault()
    if (canSubmit.value) {
      handleSubmit()
    }
  }
  // Escape to close (only if empty)
  if (event.key === 'Escape' && !hasContent.value) {
    handleClose()
  }
}

// Submit handler
async function handleSubmit() {
  if (!canSubmit.value || !currentPublisher.value) return

  submitting.value = true

  try {
    // Upload attachments first
    const uploadedAttachments = await uploadAttachments()

    // Prepare payload
    const payload: Record<string, unknown> = {
      title: title.value || undefined,
      description: description.value || undefined,
      content: content.value,
      visibility: visibility.value,
      language: language.value,
      tags: tags.value,
      attachments: uploadedAttachments.map(a => a.cloudFile?.id).filter(Boolean),
    }

    if (replyingTo.value) {
      payload.replied_post_id = replyingTo.value.id
    }
    if (forwardingTo.value) {
      payload.forwarded_post_id = forwardingTo.value.id
    }

    let response: Post
    const publisherName = currentPublisher.value?.name
    if (!publisherName) {
      throw new Error('No publisher selected')
    }

    // Build query params with publisher
    const queryParams = new URLSearchParams({ pub: publisherName })

    if (originalPost.value) {
      // Update existing post
      response = await fetchJson<Post>(`/sphere/posts/${originalPost.value.id}?${queryParams.toString()}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      })
    } else {
      // Create new post
      response = await fetchJson<Post>(`/sphere/posts?${queryParams.toString()}`, {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    }

    // Success - close and reset
    stopAutoSave()
    emit('submit', response)
    emit('close')
    reset()
  } catch (error) {
    console.error('Failed to submit post:', error)
    alert('Failed to post. Please try again.')
  } finally {
    submitting.value = false
  }
}

async function uploadAttachments(): Promise<any[]> {
  const results = []

  for (let i = 0; i < attachments.value.length; i++) {
    const attachment = attachments.value[i]
    if (attachment.uploaded && attachment.cloudFile) {
      results.push(attachment)
      continue
    }

    try {
      // Create FormData for simplified direct upload
      const formData = new FormData()
      formData.append('file', attachment.file, attachment.file.name)

      const token = await getValidToken(API_BASE_URL)
      const headers: Record<string, string> = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      // Update progress to show upload started
      attachment.progress = 0

      const response = await fetch(`${API_BASE_URL}/drive/files/upload/direct`, {
        method: 'POST',
        headers,
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`)
      }

      const data = await response.json()

      // Handle different response formats
      let fileData: FileAttachment
      if (data.file) {
        fileData = data.file
      } else if (data.file_info) {
        fileData = data.file_info
      } else if (data.data?.file) {
        fileData = data.data.file
      } else if (data.data?.id) {
        fileData = data.data
      } else if (data.id) {
        fileData = data
      } else {
        throw new Error('Unexpected upload response format')
      }

      attachment.cloudFile = fileData
      attachment.uploaded = true
      attachment.progress = 100
      results.push(attachment)
    } catch (error) {
      console.error('Failed to upload attachment:', error)
      attachment.progress = undefined
      throw error
    }
  }

  return results
}

function saveDraftManually() {
  saveCurrentDraft()
}

function handleClose() {
  if (hasContent.value) {
    const confirmed = window.confirm('You have unsaved content. Discard?')
    if (!confirmed) return
  }

  stopAutoSave()
  emit('close')
  reset()
}

// Helpers
function getInitials(name: string): string {
  if (!name) return '?'
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (seconds < 60) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return date.toLocaleDateString()
}
</script>
