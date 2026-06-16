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
  totalBots: number
  totalProjects: number
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
  secret?: string | null
  description: string | null
  type: number
  appId: string
  createdAt: string
  updatedAt: string
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
  language: string | null
  profile: BotAccountProfile
}

export interface BotAccountProfile {
  firstName: string | null
  middleName: string | null
  lastName: string | null
  gender: string | null
  pronouns: string | null
  timeZone: string | null
  location: string | null
  bio: string | null
  birthday: string | null
  picture?: FileAttachment | null
  background?: FileAttachment | null
}


export interface BotKey {
  id: string
  key?: string | null
  label: string | null
  createdAt: string
  updatedAt: string
}

export interface BotChatConfig {
  id: string
  commands: BotCommand[]
  webhooks: BotWebhook[]
  autoApproveDm: boolean
  autoApproveGroupChat: boolean
  supportChat: boolean
  subscribedEvents: string[]
}

export interface BotCommand {
  name: string
  description: string
  usage?: string
  parameters?: BotCommandParameter[]
}

export interface BotCommandParameter {
  name: string
  description?: string
  required: boolean
  type?: string
}

export interface BotWebhook {
  url: string
  secret?: string
  events: string[]
  isActive: boolean
}
