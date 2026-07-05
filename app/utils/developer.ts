import type {
  Developer,
  DeveloperStats,
  DevProject,
  CustomApp,
  CustomAppSecret,
  AppProduct,
  Bot,
  BotKey,
  BotChatConfig,
} from '~/types/developer'
import { apiFetch, safeJsonParse } from '~/utils/api'
import { camelToSnake } from '~/utils/case'

// ==================== Developers ====================

export async function fetchDevelopers(): Promise<Developer[]> {
  const response = await apiFetch('/develop/developers')
  return safeJsonParse<Developer[]>(response)
}

export async function fetchDeveloperStats(
  publisherName: string,
): Promise<DeveloperStats | null> {
  try {
    const response = await apiFetch(
      `/develop/developers/${encodeURIComponent(publisherName)}/stats`,
    )
    return safeJsonParse<DeveloperStats>(response)
  } catch {
    return null
  }
}

export async function enrollDeveloper(publisherName: string): Promise<void> {
  await apiFetch(
    `/develop/developers/${encodeURIComponent(publisherName)}/enroll`,
    { method: 'POST' },
  )
}

// ==================== Projects ====================

export async function fetchDevProjects(
  publisherName: string,
): Promise<DevProject[]> {
  const response = await apiFetch(
    `/develop/private/projects?dev=${encodeURIComponent(publisherName)}`,
  )
  return safeJsonParse<DevProject[]>(response)
}

export async function fetchDevProject(
  publisherName: string,
  projectId: string,
): Promise<DevProject | null> {
  try {
    const response = await apiFetch(
      `/develop/private/projects/${encodeURIComponent(projectId)}?dev=${encodeURIComponent(publisherName)}`,
    )
    return safeJsonParse<DevProject>(response)
  } catch {
    return null
  }
}

export async function createDevProject(
  publisherName: string,
  data: { name: string; slug: string; description: string },
): Promise<DevProject> {
  const response = await apiFetch(
    `/develop/private/projects?dev=${encodeURIComponent(publisherName)}`,
    {
      method: 'POST',
      body: JSON.stringify(camelToSnake(data)),
    },
  )
  return safeJsonParse<DevProject>(response)
}

export async function updateDevProject(
  publisherName: string,
  projectId: string,
  data: { name?: string; slug?: string; description?: string },
): Promise<DevProject> {
  const response = await apiFetch(
    `/develop/private/projects/${encodeURIComponent(projectId)}?dev=${encodeURIComponent(publisherName)}`,
    {
      method: 'PUT',
      body: JSON.stringify(camelToSnake(data)),
    },
  )
  return safeJsonParse<DevProject>(response)
}

export async function deleteDevProject(
  publisherName: string,
  projectId: string,
): Promise<void> {
  await apiFetch(
    `/develop/private/projects/${encodeURIComponent(projectId)}?dev=${encodeURIComponent(publisherName)}`,
    { method: 'DELETE' },
  )
}

// ==================== Custom Apps ====================

export async function fetchCustomApps(
  publisherName: string,
  projectId: string,
): Promise<CustomApp[]> {
  const response = await apiFetch(
    `/develop/private/apps?dev=${encodeURIComponent(publisherName)}&proj=${encodeURIComponent(projectId)}`,
  )
  return safeJsonParse<CustomApp[]>(response)
}

export async function fetchCustomApp(
  publisherName: string,
  projectId: string,
  appId: string,
): Promise<CustomApp> {
  const response = await apiFetch(
    `/develop/private/apps/${encodeURIComponent(appId)}?dev=${encodeURIComponent(publisherName)}&proj=${encodeURIComponent(projectId)}`,
  )
  return safeJsonParse<CustomApp>(response)
}

export async function createCustomApp(
  publisherName: string,
  projectId: string,
  data: {
    name: string
    slug: string
    description?: string
  },
): Promise<CustomApp> {
  const response = await apiFetch(
    `/develop/private/apps?dev=${encodeURIComponent(publisherName)}&proj=${encodeURIComponent(projectId)}`,
    {
      method: 'POST',
      body: JSON.stringify(camelToSnake(data)),
    },
  )
  return safeJsonParse<CustomApp>(response)
}

export async function updateCustomApp(
  publisherName: string,
  projectId: string,
  appId: string,
  data: {
    name?: string
    slug?: string
    description?: string
    pictureId?: string | null
    backgroundId?: string | null
    status?: number
    links?: {
      homePage?: string | null
      privacyPolicy?: string | null
      termsOfService?: string | null
    }
    paymentWalletId?: string | null
    oauthConfig?: {
      clientUri?: string | null
      redirectUris?: string[]
      postLogoutRedirectUris?: string[] | null
      allowedScopes?: string[]
      allowedGrantTypes?: string[]
      requirePkce?: boolean
      allowOfflineAccess?: boolean
      isPublicClient?: boolean
    }
  },
): Promise<CustomApp> {
  const response = await apiFetch(
    `/develop/private/apps/${encodeURIComponent(appId)}?dev=${encodeURIComponent(publisherName)}&proj=${encodeURIComponent(projectId)}`,
    {
      method: 'PATCH',
      body: JSON.stringify(camelToSnake(data)),
    },
  )
  return safeJsonParse<CustomApp>(response)
}

export async function deleteCustomApp(
  publisherName: string,
  projectId: string,
  appId: string,
): Promise<void> {
  await apiFetch(
    `/develop/private/apps/${encodeURIComponent(appId)}?dev=${encodeURIComponent(publisherName)}&proj=${encodeURIComponent(projectId)}`,
    { method: 'DELETE' },
  )
}

// ==================== App Products ====================

export async function fetchAppProducts(
  publisherName: string,
  projectId: string,
  appId: string,
): Promise<AppProduct[]> {
  const response = await apiFetch(
    `/develop/private/apps/${encodeURIComponent(appId)}/products?dev=${encodeURIComponent(publisherName)}&proj=${encodeURIComponent(projectId)}`,
  )
  return safeJsonParse<AppProduct[]>(response)
}

export async function createAppProduct(
  publisherName: string,
  projectId: string,
  appId: string,
  data: {
    identifier: string
    displayName: string
    description?: string
    currency: string
    price: number
    pictureId?: string
    backgroundId?: string
  },
): Promise<AppProduct> {
  const response = await apiFetch(
    `/develop/private/apps/${encodeURIComponent(appId)}/products?dev=${encodeURIComponent(publisherName)}&proj=${encodeURIComponent(projectId)}`,
    {
      method: 'POST',
      body: JSON.stringify(camelToSnake(data)),
    },
  )
  return safeJsonParse<AppProduct>(response)
}

export async function updateAppProduct(
  publisherName: string,
  projectId: string,
  appId: string,
  productId: string,
  data: {
    identifier?: string
    displayName?: string
    description?: string
    currency?: string
    price?: number
    pictureId?: string
    backgroundId?: string
  },
): Promise<AppProduct> {
  const response = await apiFetch(
    `/develop/private/apps/${encodeURIComponent(appId)}/products/${encodeURIComponent(productId)}?dev=${encodeURIComponent(publisherName)}&proj=${encodeURIComponent(projectId)}`,
    {
      method: 'PATCH',
      body: JSON.stringify(camelToSnake(data)),
    },
  )
  return safeJsonParse<AppProduct>(response)
}

export async function deleteAppProduct(
  publisherName: string,
  projectId: string,
  appId: string,
  productId: string,
): Promise<void> {
  await apiFetch(
    `/develop/private/apps/${encodeURIComponent(appId)}/products/${encodeURIComponent(productId)}?dev=${encodeURIComponent(publisherName)}&proj=${encodeURIComponent(projectId)}`,
    { method: 'DELETE' },
  )
}

// ==================== App Secrets ====================

export async function fetchAppSecrets(
  publisherName: string,
  projectId: string,
  appId: string,
): Promise<CustomAppSecret[]> {
  const response = await apiFetch(
    `/develop/private/apps/${encodeURIComponent(appId)}/secrets?dev=${encodeURIComponent(publisherName)}&proj=${encodeURIComponent(projectId)}`,
  )
  return safeJsonParse<CustomAppSecret[]>(response)
}

export async function createAppSecret(
  publisherName: string,
  projectId: string,
  appId: string,
  data: { description?: string; type?: number; expiresIn?: string | null },
): Promise<CustomAppSecret> {
  const response = await apiFetch(
    `/develop/private/apps/${encodeURIComponent(appId)}/secrets?dev=${encodeURIComponent(publisherName)}&proj=${encodeURIComponent(projectId)}`,
    {
      method: 'POST',
      body: JSON.stringify(camelToSnake(data)),
    },
  )
  return safeJsonParse<CustomAppSecret>(response)
}

export async function deleteAppSecret(
  publisherName: string,
  projectId: string,
  appId: string,
  secretId: string,
): Promise<void> {
  await apiFetch(
    `/develop/private/apps/${encodeURIComponent(appId)}/secrets/${encodeURIComponent(secretId)}?dev=${encodeURIComponent(publisherName)}&proj=${encodeURIComponent(projectId)}`,
    { method: 'DELETE' },
  )
}

// ==================== Bots ====================

export async function fetchBots(
  publisherName: string,
  projectId: string,
): Promise<Bot[]> {
  const response = await apiFetch(
    `/develop/private/bots?dev=${encodeURIComponent(publisherName)}&proj=${encodeURIComponent(projectId)}`,
  )
  return safeJsonParse<Bot[]>(response)
}

export async function fetchBot(
  publisherName: string,
  projectId: string,
  botId: string,
): Promise<Bot> {
  const response = await apiFetch(
    `/develop/private/bots/${encodeURIComponent(botId)}?dev=${encodeURIComponent(publisherName)}&proj=${encodeURIComponent(projectId)}`,
  )
  return safeJsonParse<Bot>(response)
}

export async function createBot(
  publisherName: string,
  projectId: string,
  data: {
    name: string
    nick: string
    slug: string
    language?: string
    bio?: string
    pictureId?: string
    backgroundId?: string
  },
): Promise<Bot> {
  const response = await apiFetch(
    `/develop/private/bots?dev=${encodeURIComponent(publisherName)}&proj=${encodeURIComponent(projectId)}`,
    {
      method: 'POST',
      body: JSON.stringify(camelToSnake(data)),
    },
  )
  return safeJsonParse<Bot>(response)
}

export async function updateBot(
  publisherName: string,
  projectId: string,
  botId: string,
  data: {
    name?: string
    nick?: string
    slug?: string
    language?: string
    isActive?: boolean
    bio?: string
    pictureId?: string
    backgroundId?: string
  },
): Promise<Bot> {
  const response = await apiFetch(
    `/develop/private/bots/${encodeURIComponent(botId)}?dev=${encodeURIComponent(publisherName)}&proj=${encodeURIComponent(projectId)}`,
    {
      method: 'PATCH',
      body: JSON.stringify(camelToSnake(data)),
    },
  )
  return safeJsonParse<Bot>(response)
}

export async function deleteBot(
  publisherName: string,
  projectId: string,
  botId: string,
): Promise<void> {
  await apiFetch(
    `/develop/private/bots/${encodeURIComponent(botId)}?dev=${encodeURIComponent(publisherName)}&proj=${encodeURIComponent(projectId)}`,
    { method: 'DELETE' },
  )
}

// ==================== Bot Keys ====================

export async function fetchBotKeys(
  publisherName: string,
  projectId: string,
  botId: string,
): Promise<BotKey[]> {
  const response = await apiFetch(
    `/develop/private/bots/${encodeURIComponent(botId)}/keys?dev=${encodeURIComponent(publisherName)}&proj=${encodeURIComponent(projectId)}`,
  )
  return safeJsonParse<BotKey[]>(response)
}

export async function createBotKey(
  publisherName: string,
  projectId: string,
  botId: string,
  data: { label?: string },
): Promise<BotKey> {
  const response = await apiFetch(
    `/develop/private/bots/${encodeURIComponent(botId)}/keys?dev=${encodeURIComponent(publisherName)}&proj=${encodeURIComponent(projectId)}`,
    {
      method: 'POST',
      body: JSON.stringify(camelToSnake(data)),
    },
  )
  return safeJsonParse<BotKey>(response)
}

export async function deleteBotKey(
  publisherName: string,
  projectId: string,
  botId: string,
  keyId: string,
): Promise<void> {
  await apiFetch(
    `/develop/private/bots/${encodeURIComponent(botId)}/keys/${encodeURIComponent(keyId)}?dev=${encodeURIComponent(publisherName)}&proj=${encodeURIComponent(projectId)}`,
    { method: 'DELETE' },
  )
}

// ==================== Bot Chat Config ====================

export async function fetchBotChatConfig(
  publisherName: string,
  projectId: string,
  botId: string,
): Promise<BotChatConfig | null> {
  try {
    const response = await apiFetch(
      `/develop/private/bots/${encodeURIComponent(botId)}/chat?dev=${encodeURIComponent(publisherName)}&proj=${encodeURIComponent(projectId)}`,
    )
    return safeJsonParse<BotChatConfig>(response)
  } catch {
    return null
  }
}

export async function updateBotChatConfig(
  publisherName: string,
  projectId: string,
  botId: string,
  data: BotChatConfig,
): Promise<BotChatConfig> {
  const response = await apiFetch(
    `/develop/private/bots/${encodeURIComponent(botId)}/chat?dev=${encodeURIComponent(publisherName)}&proj=${encodeURIComponent(projectId)}`,
    {
      method: 'PUT',
      body: JSON.stringify(camelToSnake(data)),
    },
  )
  return safeJsonParse<BotChatConfig>(response)
}
