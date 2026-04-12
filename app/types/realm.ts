import type { FileAttachment } from './post'

export interface Realm {
  id: string
  slug: string
  name: string
  description: string | null
  picture: FileAttachment | null
  background: FileAttachment | null
  isPublic: boolean
  isCommunity: boolean
  verification: {
    type: number
    title: string | null
    description: string | null
    verifiedBy: string | null
  } | null
}
