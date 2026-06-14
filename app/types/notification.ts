export interface SnNotification {
  id: string
  topic: string
  title: string
  subtitle: string
  content: string
  body?: string
  link?: string
  meta: Record<string, unknown>
  viewedAt?: string
  createdAt: string
}
