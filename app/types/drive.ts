export interface SnCloudFile {
  id: string
  name: string
  description: string | null
  mimeType: string
  size: number
  hash: string | null
  isFolder: boolean
  indexed: boolean
  isMarkedRecycle: boolean
  parentId: string | null
  objectId: string | null
  storageId: string | null
  storageUrl: string | null
  poolId: string | null
  usage: string | null
  applicationType: string | null
  ratio: number | null
  blurhash: string | null
  childrenCount: number
  children: SnCloudFile[]
  sensitiveMarks: string[]
  userMeta: Record<string, unknown>
  fileMeta: Record<string, unknown>
  hasCompression: boolean
  hasThumbnail: boolean
  permissionStatus: {
    readable: boolean
    writable: boolean
    manageable: boolean
    visibility: string
  } | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  expiredAt: string | null
}

export interface SnFilePool {
  id: string
  name: string
  description: string | null
  ownerId: string
  createdAt: string
  updatedAt: string
}

export interface DriveUsage {
  totalUsageBytes: number
  totalFileCount: number
  totalQuota: number
  usedQuota: number
  poolUsages: Array<{
    poolId: string
    poolName: string
    usageBytes: number
    fileCount: number
  }>
}

export interface DriveQuota {
  basedQuota: number
  extraQuota: number
  totalQuota: number
  usedQuota: number
}

export interface FileListItem {
  type: 'file' | 'folder'
  file: SnCloudFile
}

export interface DriveFilePermission {
  id: string
  fileId: string
  accountId: string
  permission: number
  createdAt: string
}

export interface PaginatedResult<T> {
  items: T[]
  totalCount: number
}
