import { defineEventHandler, getQuery } from 'h3'
import { snakeToCamel } from '~/utils/case'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const query = getQuery(event)

  try {
    const params = new URLSearchParams()
    if (query.take) params.set('take', String(query.take))
    if (query.offset) params.set('offset', String(query.offset))

    const response = await fetch(`${config.public.apiBaseUrl}/sphere/livestreams?${params}`)
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`)
    }
    const data = await response.json()
    return snakeToCamel(data)
  } catch (e) {
    event.node.res.statusCode = 502
    return { error: 'Failed to fetch livestreams from API' }
  }
})
