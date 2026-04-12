import { defineEventHandler, getRouterParam } from 'h3'
import { snakeToCamel } from '~/utils/case'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const id = getRouterParam(event, 'id')

  try {
    const response = await fetch(`${config.public.apiBaseUrl}/sphere/posts/${id}`)
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`)
    }
    const data = await response.json()
    return snakeToCamel(data)
  } catch (e) {
    event.node.res.statusCode = 502
    return { error: 'Failed to fetch post from API' }
  }
})
