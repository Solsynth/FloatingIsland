import type { FileAttachment } from './post'

export interface Developer {
  id: string
  publisherId: string
  publisher?: DeveloperPublisher | null
}

export interface DeveloperPublisher {
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

export interface DeveloperStats {
  totalCustomApps: number
}

export interface DevProject {
  id: string
  slug: string
  name: string
  description: string
  developer: Developer
  developerId: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface CustomApp {
  id: string
  slug: string
  name: string
  description: string | null
  status: number
  picture: FileAttachment | null
  background: FileAttachment | null
  verification: CustomAppVerificationMark | null
  oauthConfig: CustomAppOauthConfig | null
  links: CustomAppLinks | null
  secrets: CustomAppSecret[]
  publisherId: string
  paymentWalletId: string | null
}

export interface CustomAppVerificationMark {
  verified: boolean
  grade: string | null
}

export interface CustomAppLinks {
  homePage: string | null
  privacyPolicy: string | null
  termsOfService: string | null
}

export interface CustomAppOauthConfig {
  clientUri: string | null
  redirectUris: string[]
  postLogoutRedirectUris: string[] | null
  allowedScopes: string[]
  allowedGrantTypes: string[]
  requirePkce: boolean
  allowOfflineAccess: boolean
  isPublicClient: boolean
}

export interface CustomAppSecret {
  id: string
  secret: string | null
  description: string | null
  expiredAt: string | null
  isOidc: boolean
  appId: string
}

export interface Bot {
  id: string
  slug: string
  isActive: boolean
  projectId: string
  createdAt: string
  updatedAt: string
  account: BotAccount
  developer: Developer | null
}

export interface BotAccount {
  id: string
  name: string
  nick: string
  profile: {
    picture?: FileAttachment | null
  }
}

export interface BotConfig {
  isPublic: boolean
  isInteractive: boolean
  allowedRealms: string[]
  allowedChatTypes: string[]
  metadata: Record<string, unknown>
}

export interface BotLinks {
  website: string | null
  documentation: string | null
  privacyPolicy: string | null
  termsOfService: string | null
}

export interface BotKey {
  id: string
  key: string | null
  description: string | null
  expiredAt: string | null
  botId: string
}
