const FILE_BASE_URL = 'https://api.solian.app/drive/files'

export function getFileUrl(fileId: string | null | undefined, variant?: string): string | null {
  if (!fileId) return null
  const url = `${FILE_BASE_URL}/${fileId}`
  if (!variant) return url
  return url + `?${variant}=true`
}
