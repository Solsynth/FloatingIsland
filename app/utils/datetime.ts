/**
 * Convert a UTC date string to local Date object
 * Handles various date formats from the API
 */
export function toLocalDate(dateStr: string | Date | undefined | null): Date | null {
  if (!dateStr) return null
  if (dateStr instanceof Date) return dateStr
  
  // If the string doesn't end with Z or an offset, assume UTC
  let str = dateStr.toString().trim()
  if (str && !str.endsWith('Z') && !str.match(/[+-]\d{2}:\d{2}$/)) {
    str += 'Z'
  }
  
  const date = new Date(str)
  return isNaN(date.getTime()) ? null : date
}

/**
 * Format a date as relative time (e.g., "2m ago", "3h ago", "Yesterday")
 */
export function formatRelativeTime(dateStr: string | Date | undefined | null): string {
  const date = toLocalDate(dateStr)
  if (!date) return ''
  
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) return 'just now'
  if (diffMin < 60) return `${diffMin}m`
  if (diffHour < 24) return `${diffHour}h`
  if (diffDay === 1) return 'Yesterday'
  if (diffDay < 7) return `${diffDay}d`
  
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

/**
 * Format a date as time (e.g., "14:30")
 */
export function formatTime(dateStr: string | Date | undefined | null): string {
  const date = toLocalDate(dateStr)
  if (!date) return ''
  return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}

/**
 * Format a date as date string (e.g., "Jan 15")
 */
export function formatDateShort(dateStr: string | Date | undefined | null): string {
  const date = toLocalDate(dateStr)
  if (!date) return ''
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(date1: string | Date | undefined | null, date2: string | Date | undefined | null): boolean {
  const d1 = toLocalDate(date1)
  const d2 = toLocalDate(date2)
  if (!d1 || !d2) return false
  return d1.toDateString() === d2.toDateString()
}

/**
 * Check if a date is today
 */
export function isToday(dateStr: string | Date | undefined | null): boolean {
  const date = toLocalDate(dateStr)
  if (!date) return false
  return date.toDateString() === new Date().toDateString()
}

/**
 * Check if a date is yesterday
 */
export function isYesterday(dateStr: string | Date | undefined | null): boolean {
  const date = toLocalDate(dateStr)
  if (!date) return false
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return date.toDateString() === yesterday.toDateString()
}

/**
 * Format a date for chat message grouping
 */
export function formatChatDate(dateStr: string | Date | undefined | null): string {
  const date = toLocalDate(dateStr)
  if (!date) return ''
  
  if (isToday(dateStr)) return 'Today'
  if (isYesterday(dateStr)) return 'Yesterday'
  
  const now = new Date()
  const diffDay = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffDay < 7) {
    return date.toLocaleDateString(undefined, { weekday: 'long' })
  }
  
  return date.toLocaleDateString(undefined, { 
    month: 'long', 
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  })
}
