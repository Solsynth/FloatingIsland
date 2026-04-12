import type { FileAttachment, Post } from './post'

export interface PublisherProfile {
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
  createdAt: string
}

export interface PublisherPageData {
  publisher: PublisherProfile | null
  posts: Post[]
  error: string | null
  notFound: boolean
  total: number
  initialTake: number
}
