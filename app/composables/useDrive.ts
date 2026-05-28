import type { SnCloudFile, DriveUsage, DriveQuota, PaginatedResult } from '~/types/drive'
import {
  fetchDriveRootChildren,
  fetchDriveFolderChildren,
  fetchDriveFileInfo,
  fetchDriveUsage,
  fetchDriveQuota,
  fetchDriveUnindexedFiles,
  createDriveFolder,
  renameDriveFile,
  moveDriveFile,
  deleteDriveFile,
  batchDeleteDriveFiles,
  uploadDriveFile,
} from '~/utils/api'

export type ViewMode = 'list' | 'grid'
export type SortField = 'date' | 'name' | 'size'
export type SortDirection = 'asc' | 'desc'
export type DriveMode = 'indexed' | 'unindexed'

export interface DriveState {
  files: SnCloudFile[]
  currentPath: string
  currentFolderId: string | null
  pathStack: Array<{ id: string | null; name: string }>
  isLoading: boolean
  hasMore: boolean
  totalCount: number
  viewMode: ViewMode
  sortField: SortField
  sortDirection: SortDirection
  searchQuery: string
  selectedFileIds: Set<string>
  isSelectionMode: boolean
  usage: DriveUsage | null
  quota: DriveQuota | null
  mode: DriveMode
  recycled: boolean
}

export function useDrive() {
  const state = reactive<DriveState>({
    files: [],
    currentPath: '/',
    currentFolderId: null,
    pathStack: [{ id: null, name: 'Root' }],
    isLoading: false,
    hasMore: false,
    totalCount: 0,
    viewMode: 'list',
    sortField: 'date',
    sortDirection: 'desc',
    searchQuery: '',
    selectedFileIds: new Set(),
    isSelectionMode: false,
    usage: null,
    quota: null,
    mode: 'indexed',
    recycled: false,
  })

  async function loadFiles(folderId: string | null = null, reset = true) {
    state.isLoading = true
    try {
      let result: PaginatedResult<SnCloudFile>
      const options = {
        query: state.searchQuery || undefined,
        order: state.sortField,
        orderDesc: state.sortDirection === 'desc',
      }

      if (state.mode === 'unindexed') {
        result = await fetchDriveUnindexedFiles({
          ...options,
          recycled: state.recycled,
        })
      } else if (folderId) {
        result = await fetchDriveFolderChildren(folderId, options)
      } else {
        result = await fetchDriveRootChildren(options)
      }

      if (reset) {
        state.files = result.items
      } else {
        state.files = [...state.files, ...result.items]
      }
      state.totalCount = result.totalCount
      state.hasMore = state.files.length < result.totalCount
      state.currentFolderId = folderId
    } catch (err) {
      console.error('Failed to load files:', err)
    } finally {
      state.isLoading = false
    }
  }

  async function navigateToFolder(folder: SnCloudFile | null) {
    if (folder === null) {
      state.currentPath = '/'
      state.currentFolderId = null
      state.pathStack = [{ id: null, name: 'Root' }]
      await loadFiles(null)
    } else {
      state.currentPath = state.currentPath === '/'
        ? `/${folder.name}`
        : `${state.currentPath}/${folder.name}`
      state.currentFolderId = folder.id
      state.pathStack.push({ id: folder.id, name: folder.name })
      await loadFiles(folder.id)
    }
    state.selectedFileIds.clear()
    state.isSelectionMode = false
  }

  async function navigateToPathIndex(index: number) {
    const target = state.pathStack[index]
    state.pathStack = state.pathStack.slice(0, index + 1)
    state.currentPath = index === 0 ? '/' : '/' + state.pathStack.slice(1).map(p => p.name).join('/')
    state.currentFolderId = target.id
    await loadFiles(target.id)
    state.selectedFileIds.clear()
    state.isSelectionMode = false
  }

  async function loadUsage() {
    try {
      const [usage, quota] = await Promise.all([
        fetchDriveUsage(),
        fetchDriveQuota(),
      ])
      state.usage = usage
      state.quota = quota
    } catch (err) {
      console.error('Failed to load usage:', err)
    }
  }

  async function refresh() {
    await loadFiles(state.currentFolderId)
  }

  function setMode(mode: DriveMode) {
    if (state.mode === mode) return
    state.mode = mode
    state.files = []
    state.currentFolderId = null
    state.pathStack = [{ id: null, name: 'Root' }]
    state.currentPath = '/'
    state.selectedFileIds.clear()
    state.isSelectionMode = false
    loadFiles(null)
  }

  function setRecycled(recycled: boolean) {
    if (state.recycled === recycled) return
    state.recycled = recycled
    state.selectedFileIds.clear()
    state.isSelectionMode = false
    loadFiles(null)
  }

  function setViewMode(mode: ViewMode) {
    state.viewMode = mode
  }

  function setSort(field: SortField) {
    if (state.sortField === field) {
      state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc'
    } else {
      state.sortField = field
      state.sortDirection = 'desc'
    }
    loadFiles(state.currentFolderId)
  }

  function setSearchQuery(query: string) {
    state.searchQuery = query
    loadFiles(state.currentFolderId)
  }

  function toggleSelectionMode() {
    state.isSelectionMode = !state.isSelectionMode
    if (!state.isSelectionMode) {
      state.selectedFileIds.clear()
    }
  }

  function toggleFileSelection(fileId: string) {
    if (state.selectedFileIds.has(fileId)) {
      state.selectedFileIds.delete(fileId)
    } else {
      state.selectedFileIds.add(fileId)
    }
  }

  function selectAll() {
    state.files.forEach(f => state.selectedFileIds.add(f.id))
  }

  function clearSelection() {
    state.selectedFileIds.clear()
  }

  async function createFolder(name: string) {
    try {
      await createDriveFolder({
        name,
        parentId: state.currentFolderId,
      })
      await refresh()
      return true
    } catch (err) {
      console.error('Failed to create folder:', err)
      return false
    }
  }

  async function renameFile(fileId: string, newName: string) {
    try {
      await renameDriveFile(fileId, newName)
      await refresh()
      return true
    } catch (err) {
      console.error('Failed to rename file:', err)
      return false
    }
  }

  async function deleteFile(fileId: string) {
    try {
      await deleteDriveFile(fileId)
      await refresh()
      return true
    } catch (err) {
      console.error('Failed to delete file:', err)
      return false
    }
  }

  async function batchDelete() {
    if (state.selectedFileIds.size === 0) return false
    try {
      await batchDeleteDriveFiles(Array.from(state.selectedFileIds))
      state.selectedFileIds.clear()
      state.isSelectionMode = false
      await refresh()
      return true
    } catch (err) {
      console.error('Failed to delete files:', err)
      return false
    }
  }

  async function moveFile(fileId: string, targetFolderId: string | null) {
    try {
      await moveDriveFile(fileId, targetFolderId)
      await refresh()
      return true
    } catch (err) {
      console.error('Failed to move file:', err)
      return false
    }
  }

  async function uploadFile(file: File) {
    try {
      await uploadDriveFile(file, {
        parentId: state.currentFolderId,
      })
      await refresh()
      return true
    } catch (err) {
      console.error('Failed to upload file:', err)
      return false
    }
  }

  async function uploadFiles(files: FileList | File[]) {
    const fileArray = Array.from(files)
    let successCount = 0
    for (const file of fileArray) {
      const success = await uploadFile(file)
      if (success) successCount++
    }
    return successCount
  }

  return {
    state,
    loadFiles,
    navigateToFolder,
    navigateToPathIndex,
    loadUsage,
    refresh,
    setMode,
    setRecycled,
    setViewMode,
    setSort,
    setSearchQuery,
    toggleSelectionMode,
    toggleFileSelection,
    selectAll,
    clearSelection,
    createFolder,
    renameFile,
    deleteFile,
    batchDelete,
    moveFile,
    uploadFile,
    uploadFiles,
  }
}
