import type { FileAttachment, Account } from './post'

export interface PublisherStats {
  postsCreated: number
  stickerPacksCreated: number
  stickersCreated: number
  upvoteReceived: number
  downvoteReceived: number
}

export interface PublisherQuotaInfo {
  total: number
  used: number
  remaining: number
  level: number
  perkLevel: number
  records: unknown[]
}

export interface PublisherRatingOverview {
  grade: string
  rating: number
  rank: number
  percentile: number
}

export interface PublisherManaged {
  id: string
  name: string
  nick: string
  bio: string | null
  picture: FileAttachment | null
  background: FileAttachment | null
  type: number
  realmId: string | null
  createdAt: string
}

export interface PublisherMember {
  id: string
  accountId: string
  publisherId: string
  role: number
  joinedAt: string | null
  account: Account | null
  publisher: PublisherManaged | null
}

export interface PublisherSubscriber {
  subscription: {
    accountId: string
    publisherId: string
    notify: boolean
    createdAt: string
  }
  account: Account | null
}

export interface PublisherFollowRequest {
  id: string
  state: number
  accountId: string
  publisherId: string
  account: Account | null
  createdAt: string
}

export interface PublisherFollowResponse {
  status: string
  message?: string
}

export interface FediverseActor {
  username: string
  displayName: string | null
  instance: {
    domain: string
  }
}

export interface FediverseStatus {
  enabled: boolean
  actor: FediverseActor | null
  actorUri: string | null
  followerCount: number
}

export interface SnStickerPack {
  id: string
  name: string
  description: string
  prefix: string
  icon: FileAttachment | null
  publisherId: string
  createdAt: string
  updatedAt: string
}

export interface SnSticker {
  id: string
  name: string | null
  slug: string
  image: FileAttachment
  size: number
  mode: number
  packId: string
  createdAt: string
  updatedAt: string
}

export interface SnPollQuestion {
  id: string
  content: string
  type: number
  options: string[]
}

export interface SnPollWithStats {
  id: string
  title: string | null
  description: string | null
  questions: SnPollQuestion[]
  publisherId: string
  endedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface SnWebFeedConfig {
  scrapPage: boolean
}

export interface SnWebFeed {
  id: string
  title: string
  url: string
  description: string | null
  config: SnWebFeedConfig
  publisherId: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface SnPostCollection {
  slug: string
  name: string | null
  description: string | null
  background: FileAttachment | null
  icon: FileAttachment | null
  publisherId: string
  createdAt: string
  updatedAt: string
}

export interface PublisherFeatureFlags {
  followRequiresApproval: boolean
  postsRequireFollow: boolean
  [key: string]: boolean
}

export interface HeatmapData {
  startDate: string
  endDate: string
  data: Record<string, number>
}

export interface PublisherLeaderboardEntry {
  rank: number
  rating: number
  grade: string
  percentile: number
  publisherId: string
  name: string
  nick: string
  picture: FileAttachment | null
}
