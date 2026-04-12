<template>
  <div class="min-h-screen bg-base-200 flex items-center justify-center px-4">
    <div class="card bg-base-100 shadow-xl max-w-md w-full">
      <div class="card-body">
        <ConfuseSpinner v-if="loading" message="Authorizing..." />
        <template v-else-if="clientInfo">
          <h2 class="card-title text-xl mb-4">Authorize Application</h2>

          <div class="flex items-center gap-3 mb-4 p-3 bg-base-200 rounded-lg">
            <div class="avatar">
              <div class="w-12 rounded-full bg-base-300">
                <img
                  v-if="clientInfo.picture?.id"
                  :src="getFileUrl(clientInfo.picture.id)"
                  class="w-full h-full object-cover"
                />
                <div v-else class="w-full h-full flex items-center justify-center">
                  <IconApplication class="w-6 h-6" />
                </div>
              </div>
            </div>
            <div>
              <p class="font-bold">{{ clientInfo.clientName || 'Unknown App' }}</p>
              <p class="text-xs text-base-content/50">wants to access your account</p>
            </div>
          </div>

          <div v-if="clientInfo.scopes?.length" class="mb-4">
            <p class="text-sm font-medium mb-2">This app will be able to:</p>
            <ul class="text-sm space-y-1">
              <li v-for="scope in clientInfo.scopes" :key="scope" class="flex items-center gap-2">
                <IconCheck class="w-3 h-3 text-success" />
                {{ scope }}
              </li>
            </ul>
          </div>

          <div class="flex gap-2">
            <button class="btn btn-ghost flex-1" @click="handleDeny">Deny</button>
            <button class="btn btn-primary flex-1" @click="handleApprove">Approve</button>
          </div>
        </template>
        <div v-else class="alert alert-error">
          <IconAlertCircle class="w-4 h-4" />
          <span>Failed to load authorization request</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const route = useRoute()
const loading = ref(true)
const clientInfo = ref<{
  clientName?: string
  homeUri?: string
  picture?: { id?: string }
  scopes?: string[]
} | null>(null)

function getFileUrl(fileId: string): string {
  return `https://api.solian.app/drive/files/${fileId}`
}

async function loadClientInfo() {
  try {
    const config = useRuntimeConfig()
    const query = new URLSearchParams(route.query as Record<string, string>)
    const { getAuthorizeClientInfo } = await import('~/utils/api')
    clientInfo.value = await getAuthorizeClientInfo(query)
  } catch (e) {
    console.error('Failed to load client info:', e)
  } finally {
    loading.value = false
  }
}

async function handleApprove() {
  const query = new URLSearchParams(route.query as Record<string, string>)
  const { submitAuthorizeDecision } = await import('~/utils/api')
  const result = await submitAuthorizeDecision(query, true)
  if (result.redirectUri) {
    window.location.href = result.redirectUri
  } else {
    navigateTo('/')
  }
}

async function handleDeny() {
  const query = new URLSearchParams(route.query as Record<string, string>)
  const { submitAuthorizeDecision } = await import('~/utils/api')
  const result = await submitAuthorizeDecision(query, false)
  if (result.redirectUri) {
    window.location.href = result.redirectUri
  } else {
    navigateTo('/')
  }
}

onMounted(() => {
  loadClientInfo()
})
</script>
