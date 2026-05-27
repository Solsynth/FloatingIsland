import type {
  Developer,
  DeveloperStats,
  DevProject,
  CustomApp,
  CustomAppSecret,
  Bot,
  BotKey,
  BotConfig,
  BotLinks,
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
    `/develop/developers/${encodeURIComponent(publisherName)}/projects`,
  )
  return safeJsonParse<DevProject[]>(response)
}

export async function fetchDevProject(
  publisherName: string,
  projectId: string,
): Promise<DevProject | null> {
  try {
    const projects = await fetchDevProjects(publisherName)
    return projects.find(p => p.id === projectId) ?? null
  } catch {
    return null
  }
}

export async function createDevProject(
  publisherName: string,
  data: { name: string; slug: string; description: string },
): Promise<DevProject> {
  const response = await apiFetch(
    `/develop/developers/${encodeURIComponent(publisherName)}/projects`,
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
    `/develop/developers/${encodeURIComponent(publisherName)}/projects/${encodeURIComponent(projectId)}`,
    {
      method: 'PATCH',
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
    `/develop/developers/${encodeURIComponent(publisherName)}/projects/${encodeURIComponent(projectId)}`,
    { method: 'DELETE' },
  )
}

// ==================== Custom Apps ====================

export async function fetchCustomApps(
  publisherName: string,
  projectId: string,
): Promise<CustomApp[]> {
  const response = await apiFetch(
    `/develop/developers/${encodeURIComponent(publisherName)}/projects/${encodeURIComponent(projectId)}/apps`,
  )
  return safeJsonParse<CustomApp[]>(response)
}

export async function fetchCustomApp(
  publisherName: string,
  projectId: string,
  appId: string,
): Promise<CustomApp> {
  const response = await apiFetch(
    `/develop/developers/${encodeURIComponent(publisherName)}/projects/${encodeURIComponent(projectId)}/apps/${encodeURIComponent(appId)}`,
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
    `/develop/developers/${encodeURIComponent(publisherName)}/projects/${encodeURIComponent(projectId)}/apps`,
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
    links?: {
      homePage?: string | null
      privacyPolicy?: string | null
      termsOfService?: string | null
    }
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
    `/develop/developers/${encodeURIComponent(publisherName)}/projects/${encodeURIComponent(projectId)}/apps/${encodeURIComponent(appId)}`,
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
    `/develop/developers/${encodeURIComponent(publisherName)}/projects/${encodeURIComponent(projectId)}/apps/${encodeURIComponent(appId)}`,
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
    `/develop/developers/${encodeURIComponent(publisherName)}/projects/${encodeURIComponent(projectId)}/apps/${encodeURIComponent(appId)}/secrets`,
  )
  return safeJsonParse<CustomAppSecret[]>(response)
}

export async function createAppSecret(
  publisherName: string,
  projectId: string,
  appId: string,
  data: { description?: string; isOidc?: boolean; expiredAt?: string | null },
): Promise<CustomAppSecret> {
  const response = await apiFetch(
    `/develop/developers/${encodeURIComponent(publisherName)}/projects/${encodeURIComponent(projectId)}/apps/${encodeURIComponent(appId)}/secrets`,
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
    `/develop/developers/${encodeURIComponent(publisherName)}/projects/${encodeURIComponent(projectId)}/apps/${encodeURIComponent(appId)}/secrets/${encodeURIComponent(secretId)}`,
    { method: 'DELETE' },
  )
}

// ==================== Bots ====================

export async function fetchBots(
  publisherName: string,
  projectId: string,
): Promise<Bot[]> {
  const response = await apiFetch(
    `/develop/developers/${encodeURIComponent(publisherName)}/projects/${encodeURIComponent(projectId)}/bots`,
  )
  return safeJsonParse<Bot[]>(response)
}

export async function fetchBot(
  publisherName: string,
  projectId: string,
  botId: string,
): Promise<Bot> {
  const response = await apiFetch(
    `/develop/developers/${encodeURIComponent(publisherName)}/projects/${encodeURIComponent(projectId)}/bots/${encodeURIComponent(botId)}`,
  )
  return safeJsonParse<Bot>(response)
}

export async function createBot(
  publisherName: string,
  projectId: string,
  data: { slug: string },
): Promise<Bot> {
  const response = await apiFetch(
    `/develop/developers/${encodeURIComponent(publisherName)}/projects/${encodeURIComponent(projectId)}/bots`,
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
    isActive?: boolean
    config?: BotConfig
    links?: BotLinks
  },
): Promise<Bot> {
  const response = await apiFetch(
    `/develop/developers/${encodeURIComponent(publisherName)}/projects/${encodeURIComponent(projectId)}/bots/${encodeURIComponent(botId)}`,
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
    `/develop/developers/${encodeURIComponent(publisherName)}/projects/${encodeURIComponent(projectId)}/bots/${encodeURIComponent(botId)}`,
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
    `/develop/developers/${encodeURIComponent(publisherName)}/projects/${encodeURIComponent(projectId)}/bots/${encodeURIComponent(botId)}/keys`,
  )
  return safeJsonParse<BotKey[]>(response)
}

export async function createBotKey(
  publisherName: string,
  projectId: string,
  botId: string,
  data: { description?: string; expiredAt?: string | null },
): Promise<BotKey> {
  const response = await apiFetch(
    `/develop/developers/${encodeURIComponent(publisherName)}/projects/${encodeURIComponent(projectId)}/bots/${encodeURIComponent(botId)}/keys`,
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
    `/develop/developers/${encodeURIComponent(publisherName)}/projects/${encodeURIComponent(projectId)}/bots/${encodeURIComponent(botId)}/keys/${encodeURIComponent(keyId)}`,
    { method: 'DELETE' },
  )
}
