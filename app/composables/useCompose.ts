import type { Post, FileAttachment, Publisher } from '~/types/post'

export interface ComposeAttachment {
  id: string
  file: File
  preview?: string
  progress?: number
}

export interface ComposeDraft {
  id: string
  title: string
  description: string
  content: string
  visibility: number
  attachments: FileAttachment[]
  updatedAt: Date
}

export function useCompose() {
  const drafts = useState<Record<string, ComposeDraft>>('compose-drafts', () => ({}))
  const publishers = useState<Publisher[]>('compose-publishers', () => [])
  const currentPublisher = useState<Publisher | null>('compose-currentPublisher', () => null)

  const title = useState<string>('compose-title', () => '')
  const description = useState<string>('compose-description', () => '')
  const content = useState<string>('compose-content', () => '')
  const visibility = useState<number>('compose-visibility', () => 0)
  const attachments = useState<ComposeAttachment[]>('compose-attachments', () => [])
  const submitting = useState<boolean>('compose-submitting', () => false)

  const originalPost = useState<Post | null>('compose-originalPost', () => null)
  const replyingTo = useState<Post | undefined>('compose-replyingTo', () => undefined)
  const forwardingTo = useState<Post | undefined>('compose-forwardingTo', () => undefined)

  const hasContent = computed(() =>
    title.value.trim().length > 0 ||
    description.value.trim().length > 0 ||
    content.value.trim().length > 0 ||
    attachments.value.length > 0,
  )

  const draftList = computed(() =>
    Object.values(drafts.value).sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()),
  )

  function generateDraftId(): string {
    return `draft_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  }

  function saveDraftsToStorage() {
    if (import.meta.client) {
      try {
        localStorage.setItem('compose_drafts', JSON.stringify(drafts.value))
      } catch (e) {
        console.error('Failed to save drafts:', e)
      }
    }
  }

  function loadDraftsFromStorage() {
    if (import.meta.client) {
      try {
        const saved = localStorage.getItem('compose_drafts')
        if (saved) {
          const parsed = JSON.parse(saved) as Record<string, ComposeDraft>
          drafts.value = Object.fromEntries(
            Object.entries(parsed).map(([k, v]) => [k, { ...v, updatedAt: new Date(v.updatedAt) }]),
          )
        }
      } catch (e) {
        console.error('Failed to load drafts:', e)
      }
    }
  }

  function saveDraft(draft: ComposeDraft) {
    drafts.value[draft.id] = draft
    saveDraftsToStorage()
  }

  function deleteDraft(id: string) {
    delete drafts.value[id]
    saveDraftsToStorage()
  }

  function loadDraft(id: string): ComposeDraft | undefined {
    return drafts.value[id]
  }

  function clearDrafts() {
    drafts.value = {}
    saveDraftsToStorage()
  }

  function setPublishers(newPublishers: Publisher[]) {
    publishers.value = newPublishers
    if (!currentPublisher.value && newPublishers.length > 0) {
      currentPublisher.value = newPublishers[0]
    }
  }

  function setCurrentPublisher(publisher: Publisher) {
    currentPublisher.value = publisher
  }

  function initializeFromState(state: {
    title?: string
    description?: string
    content: string
    visibility?: number
    attachments?: FileAttachment[]
    replyingTo?: Post
    forwardingTo?: Post
  } | null) {
    title.value = state?.title ?? ''
    description.value = state?.description ?? ''
    content.value = state?.content ?? ''
    visibility.value = state?.visibility ?? 0
    replyingTo.value = state?.replyingTo
    forwardingTo.value = state?.forwardingTo
    attachments.value = []
  }

  function initializeFromPost(post: Post) {
    originalPost.value = post
    title.value = post.title ?? ''
    description.value = post.description ?? ''
    content.value = post.content
    visibility.value = post.visibility
    replyingTo.value = post.repliedPost ?? undefined
    forwardingTo.value = post.forwardedPost ?? undefined
    attachments.value = []
  }

  function reset() {
    title.value = ''
    description.value = ''
    content.value = ''
    visibility.value = 0
    attachments.value = []
    submitting.value = false
    originalPost.value = null
    replyingTo.value = undefined
    forwardingTo.value = undefined
  }

  function addAttachment(file: File) {
    const id = `attach_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    const attachment: ComposeAttachment = { id, file }
    if (file.type.startsWith('image/')) {
      attachment.preview = URL.createObjectURL(file)
    }
    attachments.value = [...attachments.value, attachment]
  }

  function removeAttachment(id: string) {
    const attachment = attachments.value.find((a) => a.id === id)
    if (attachment?.preview) {
      URL.revokeObjectURL(attachment.preview)
    }
    attachments.value = attachments.value.filter((a) => a.id !== id)
  }

  function updateAttachmentProgress(id: string, progress: number) {
    attachments.value = attachments.value.map((a) => (a.id === id ? { ...a, progress } : a))
  }

  // Load drafts on client init
  if (import.meta.client) {
    loadDraftsFromStorage()
  }

  return {
    drafts,
    publishers,
    currentPublisher,
    title,
    description,
    content,
    visibility,
    attachments,
    submitting,
    originalPost,
    replyingTo,
    forwardingTo,
    hasContent,
    draftList,
    generateDraftId,
    saveDraft,
    deleteDraft,
    loadDraft,
    clearDrafts,
    setPublishers,
    setCurrentPublisher,
    initializeFromState,
    initializeFromPost,
    reset,
    addAttachment,
    removeAttachment,
    updateAttachmentProgress,
  }
}
