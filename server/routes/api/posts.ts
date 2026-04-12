import { defineEventHandler, getQuery } from 'h3'
import { snakeToCamel } from '~/utils/case'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const query = getQuery(event)

  try {
    const take = query.take || 20
    const offset = query.offset || 0
    const replies = query.replies ?? 'false'

    const params = new URLSearchParams({
      take: String(take),
      offset: String(offset),
      replies: String(replies),
    })

    if (query.realm) params.set('realm', String(query.realm))
    if (query.media) params.set('media', String(query.media))
    if (query.queryTerm) params.set('query', String(query.queryTerm))
    if (query.type) params.set('type', String(query.type))
    if (query.orderDesc) params.set('orderDesc', String(query.orderDesc))
    if (query.pub) params.set('pub', String(query.pub))

    const url = `${config.public.apiBaseUrl}/sphere/posts?${params.toString()}`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`)
    }

    const total = parseInt(response.headers.get('x-total') || '0', 10)
    const data = await response.json()

    return {
      posts: snakeToCamel(data),
      total,
    }
  } catch (e) {
    console.error('Failed to fetch posts:', e)
    event.node.res.statusCode = 502
    return { error: 'Failed to fetch posts from API', posts: [], total: 0 }
  }
})
