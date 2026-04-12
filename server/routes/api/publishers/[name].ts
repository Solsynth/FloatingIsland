import { defineEventHandler, getRouterParam, getQuery } from 'h3'
import { snakeToCamel } from '~/utils/case'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const name = getRouterParam(event, 'name')
  const query = getQuery(event)

  try {
    const params = new URLSearchParams({
      pub: name,
      take: String(query.take || 20),
      offset: String(query.offset || 0),
    })
    if (query.replies) params.set('replies', String(query.replies))
    if (query.media) params.set('media', String(query.media))
    if (query.queryTerm) params.set('query', String(query.queryTerm))
    if (query.type) params.set('type', String(query.type))
    if (query.orderDesc) params.set('orderDesc', String(query.orderDesc))

    const response = await fetch(`${config.public.apiBaseUrl}/sphere/posts?${params}`)
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
    event.node.res.statusCode = 502
    return { error: 'Failed to fetch publisher posts', posts: [], total: 0 }
  }
})
