export interface FileAttachment {
  id: string
  name: string
  url?: string
  mimeType: string
  hasCompression: boolean
  hasThumbnail: boolean
  fileMeta: Record<string, unknown>
}

export interface Profile {
  id: string
  firstName: string | null
  lastName: string | null
  bio: string | null
  picture: FileAttachment | null
  background: FileAttachment | null
}

export interface Account {
  id: string
  name: string
  nick: string | null
  profile: Profile | null
}

export interface Publisher {
  id: string
  name: string
  nick: string | null
  bio: string | null
  picture: FileAttachment | null
  background: FileAttachment | null
  verification: {
    type: number
    title: string | null
    description: string | null
    verifiedBy: string | null
  } | null
  account: Account | null
  createdAt: string
}

export interface Tag {
  id: string
  slug: string
  name: string
}

export interface Post {
  id: string
  title: string | null
  description: string | null
  content: string
  contentType: number
  publishedAt: string
  visibility: number
  boostCount: number
  upvotes: number
  downvotes: number
  repliesCount: number
  reactionsCount: Record<string, number>
  reactionsMade: Record<string, boolean> | null
  viewsUnique: number
  viewsTotal: number
  isTruncated: boolean
  publisher: Publisher
  attachments: FileAttachment[]
  tags: Tag[]
  repliedPost: Post | null
  forwardedPost: Post | null
  meta?: {
    embeds?: unknown[]
    [key: string]: unknown
  } | null
  metadata?: {
    embeds?: unknown[]
    [key: string]: unknown
  } | null
  resourceIdentifier: string
  createdAt: string
  editedAt: string | null
  updatedAt: string
}
