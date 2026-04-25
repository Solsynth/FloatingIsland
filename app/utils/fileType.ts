import type { FileAttachment } from '~/types/post'

// Image extensions
export const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'ico', 'avif']

// Video extensions
export const videoExtensions = ['mp4', 'webm', 'ogg', 'mov', 'mkv', 'avi', 'flv', 'm4v', '3gp']

// Audio extensions
export const audioExtensions = ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac', 'wma', 'opus']

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || ''
}

/**
 * Check if attachment is an image
 */
export function isImageFile(attachment: FileAttachment): boolean {
  const mimeType = attachment.mimeType || ''
  if (mimeType.startsWith('image/')) return true
  // Fallback to extension if mimeType is generic or missing
  if (!mimeType || mimeType === 'application/octet-stream') {
    return imageExtensions.includes(getFileExtension(attachment.name))
  }
  return false
}

/**
 * Check if attachment is a video
 */
export function isVideoFile(attachment: FileAttachment): boolean {
  const mimeType = attachment.mimeType || ''
  if (mimeType.startsWith('video/')) return true
  // Fallback to extension
  if (!mimeType || mimeType === 'application/octet-stream') {
    return videoExtensions.includes(getFileExtension(attachment.name))
  }
  return false
}

/**
 * Check if attachment is an audio file
 */
export function isAudioFile(attachment: FileAttachment): boolean {
  const mimeType = attachment.mimeType || ''
  if (mimeType.startsWith('audio/')) return true
  // Fallback to extension
  if (!mimeType || mimeType === 'application/octet-stream') {
    return audioExtensions.includes(getFileExtension(attachment.name))
  }
  return false
}

/**
 * Detect MIME type from file extension (for cases where MIME type is not provided)
 */
export function detectMimeTypeFromExtension(filename: string): string | null {
  const ext = getFileExtension(filename)
  const mimeTypes: Record<string, string> = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'bmp': 'image/bmp',
    'svg': 'image/svg+xml',
    'ico': 'image/x-icon',
    'avif': 'image/avif',
    'mp4': 'video/mp4',
    'webm': 'video/webm',
    'ogg': 'video/ogg',
    'mov': 'video/quicktime',
    'mkv': 'video/x-matroska',
    'avi': 'video/x-msvideo',
    'flv': 'video/x-flv',
    'm4v': 'video/x-m4v',
    '3gp': 'video/3gpp',
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'm4a': 'audio/mp4',
    'flac': 'audio/flac',
    'aac': 'audio/aac',
    'wma': 'audio/x-ms-wma',
    'opus': 'audio/opus',
  }
  return mimeTypes[ext] || null
}
