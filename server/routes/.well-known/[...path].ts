import { defineEventHandler, getRouterParam, proxyRequest } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const path = getRouterParam(event, 'path') || ''

  const url = `${config.public.apiBaseUrl}/.well-known/${path}`
  return proxyRequest(event, url, {
    headers: {
      'Content-Type': 'application/json',
    },
  })
})
