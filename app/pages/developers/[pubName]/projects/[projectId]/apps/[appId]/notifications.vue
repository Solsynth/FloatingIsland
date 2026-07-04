<template>
  <NuxtLayout name="developer">
    <div class="mx-auto max-w-5xl">
      <!-- Breadcrumb -->
      <div class="flex items-center gap-4 mb-4 -mx-4">
        <NuxtLink :to="`/developers/${pubName}/projects/${projectId}/apps/${appId}`" class="btn btn-ghost btn-sm">
          <IconArrowLeft class="w-4 h-4" />
          {{ t('developer.apps.backToList') }}
        </NuxtLink>
      </div>

      <div v-if="isLoading" class="flex justify-center py-8">
        <span class="loading loading-spinner loading-lg" />
      </div>

      <template v-else-if="app">
        <!-- Page Header -->
        <div class="mb-6">
          <div class="flex items-center gap-3 mb-2">
            <IconBell class="w-7 h-7 text-primary" />
            <h2 class="text-2xl font-bold">{{ t('developer.apps.notifications.title') }}</h2>
          </div>
          <p class="text-base-content/60">{{ t('developer.apps.notifications.description') }}</p>
        </div>

        <!-- API Reference Card -->
        <div class="card bg-base-100 shadow-sm mb-6">
          <div class="card-body p-5">
            <h3 class="card-title text-base mb-3">
              <IconCode class="w-5 h-5" />
              {{ t('developer.apps.notifications.apiReference') }}
            </h3>

            <!-- Endpoint -->
            <div class="rounded-xl bg-base-300/40 p-4 mb-4">
              <div class="flex items-center gap-2 mb-2">
                <span class="badge badge-success badge-sm font-bold">POST</span>
                <code class="text-sm font-mono">/develop/private/apps/{{ appId }}/notifications</code>
              </div>
              <div class="text-xs text-base-content/50">
                {{ t('developer.apps.notifications.auth') }}:
                <code class="bg-base-200 rounded px-1.5 py-0.5">X-Api-Key: {api_key}</code>
              </div>
            </div>

            <!-- Targeting Modes -->
            <div class="space-y-3">
              <div class="font-semibold text-sm">{{ t('developer.apps.notifications.targetingModes') }}</div>

              <!-- Single Account -->
              <div class="collapse collapse-arrow bg-base-200/40 border border-base-300/20 rounded-xl">
                <input type="checkbox" />
                <div class="collapse-title text-sm font-semibold min-h-0 py-3">
                  {{ t('developer.apps.notifications.singleAccount') }}
                </div>
                <div class="collapse-content">
                  <pre class="rounded-lg bg-base-300/30 p-3 text-xs font-mono overflow-x-auto"><code>{{ singleExample }}</code></pre>
                </div>
              </div>

              <!-- Multiple Accounts -->
              <div class="collapse collapse-arrow bg-base-200/40 border border-base-300/20 rounded-xl">
                <input type="checkbox" />
                <div class="collapse-title text-sm font-semibold min-h-0 py-3">
                  {{ t('developer.apps.notifications.multipleAccounts') }}
                </div>
                <div class="collapse-content">
                  <pre class="rounded-lg bg-base-300/30 p-3 text-xs font-mono overflow-x-auto"><code>{{ multipleExample }}</code></pre>
                </div>
              </div>

              <!-- Broadcast -->
              <div class="collapse collapse-arrow bg-base-200/40 border border-base-300/20 rounded-xl">
                <input type="checkbox" />
                <div class="collapse-title text-sm font-semibold min-h-0 py-3">
                  {{ t('developer.apps.notifications.broadcastAll') }}
                </div>
                <div class="collapse-content">
                  <pre class="rounded-lg bg-base-300/30 p-3 text-xs font-mono overflow-x-auto"><code>{{ broadcastExample }}</code></pre>
                </div>
              </div>
            </div>

            <!-- Request Fields -->
            <div class="mt-4">
              <div class="font-semibold text-sm mb-2">{{ t('developer.apps.notifications.requestFields') }}</div>
              <div class="overflow-x-auto">
                <table class="table table-xs">
                  <thead>
                    <tr>
                      <th>{{ t('developer.apps.notifications.field') }}</th>
                      <th>{{ t('developer.apps.notifications.type') }}</th>
                      <th>{{ t('developer.apps.notifications.required') }}</th>
                      <th>{{ t('developer.apps.notifications.tableDescription') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td><code>account_id</code></td><td>string</td><td><span class="badge badge-xs badge-ghost">*</span></td><td>{{ t('developer.apps.notifications.fieldAccountId') }}</td></tr>
                    <tr><td><code>account_ids</code></td><td>string[]</td><td><span class="badge badge-xs badge-ghost">*</span></td><td>{{ t('developer.apps.notifications.fieldAccountIds') }}</td></tr>
                    <tr><td><code>broadcast_to_all</code></td><td>boolean</td><td><span class="badge badge-xs badge-ghost">*</span></td><td>{{ t('developer.apps.notifications.fieldBroadcast') }}</td></tr>
                    <tr><td><code>topic</code></td><td>string</td><td><span class="badge badge-xs badge-error">✓</span></td><td>{{ t('developer.apps.notifications.fieldTopic') }}</td></tr>
                    <tr><td><code>title</code></td><td>string</td><td><span class="badge badge-xs badge-error">✓</span></td><td>{{ t('developer.apps.notifications.fieldTitle') }}</td></tr>
                    <tr><td><code>subtitle</code></td><td>string</td><td></td><td>{{ t('developer.apps.notifications.fieldSubtitle') }}</td></tr>
                    <tr><td><code>body</code></td><td>string</td><td><span class="badge badge-xs badge-error">✓</span></td><td>{{ t('developer.apps.notifications.fieldBody') }}</td></tr>
                    <tr><td><code>action_uri</code></td><td>string</td><td></td><td>{{ t('developer.apps.notifications.fieldActionUri') }}</td></tr>
                    <tr><td><code>push_type</code></td><td>number</td><td></td><td>{{ t('developer.apps.notifications.fieldPushType') }}</td></tr>
                    <tr><td><code>is_silent</code></td><td>boolean</td><td></td><td>{{ t('developer.apps.notifications.fieldIsSilent') }}</td></tr>
                    <tr><td><code>is_savable</code></td><td>boolean</td><td></td><td>{{ t('developer.apps.notifications.fieldIsSavable') }}</td></tr>
                    <tr><td><code>meta</code></td><td>object</td><td></td><td>{{ t('developer.apps.notifications.fieldMeta') }}</td></tr>
                  </tbody>
                </table>
              </div>
              <p class="text-xs text-base-content/40 mt-2">* {{ t('developer.apps.notifications.targetingHint') }}</p>
            </div>

            <!-- Response -->
            <div class="mt-4">
              <div class="font-semibold text-sm mb-2">{{ t('developer.apps.notifications.response') }}</div>
              <pre class="rounded-lg bg-base-300/30 p-3 text-xs font-mono overflow-x-auto"><code>{{ responseExample }}</code></pre>
            </div>

            <!-- Notes -->
            <div class="mt-4 rounded-xl bg-info/5 border border-info/20 p-4">
              <div class="text-sm font-semibold text-info mb-2">{{ t('developer.apps.notifications.notes') }}</div>
              <ul class="text-xs text-base-content/60 space-y-1.5 list-disc list-inside">
                <li>{{ t('developer.apps.notifications.noteDelivery') }}</li>
                <li>
                  {{ t('developer.apps.notifications.noteTopic') }}:
                  <code class="bg-base-200 rounded px-1 text-[11px]">%s.%s.your_topic</code>
                </li>
                <li>
                  {{ t('developer.apps.notifications.noteMeta') }}:
                  <code class="bg-base-200 rounded px-1 text-[11px]">sent_by_app</code>
                </li>
                <li>{{ t('developer.apps.notifications.noteNoTargets') }}</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Playground Card -->
        <div class="card bg-base-100 shadow-sm mb-6">
          <div class="card-body p-5">
            <h3 class="card-title text-base mb-1">
              <IconFlaskConical class="w-5 h-5" />
              {{ t('developer.apps.notifications.playground') }}
            </h3>
            <p class="text-sm text-base-content/50 mb-4">{{ t('developer.apps.notifications.playgroundDesc') }}</p>

            <!-- API Key Input -->
            <fieldset class="fieldset mb-4">
              <legend class="fieldset-legend">{{ t('developer.apps.notifications.apiKey') }}</legend>
              <div class="flex items-center gap-3">
                <div class="flex-1 relative">
                  <input
                    v-model="apiKey"
                    :type="showApiKey ? 'text' : 'password'"
                    class="input w-full font-mono text-sm pr-10"
                    placeholder="your_app_api_key_here"
                  />
                  <button
                    type="button"
                    class="absolute right-2 top-1/2 -translate-y-1/2 btn btn-ghost btn-xs btn-square"
                    @click="showApiKey = !showApiKey"
                  >
                    <IconEye v-if="showApiKey" class="w-4 h-4" />
                    <IconEyeOff v-else class="w-4 h-4" />
                  </button>
                </div>
                <NuxtLink :to="`/developers/${pubName}/projects/${projectId}/apps/${appId}`" class="btn btn-ghost btn-sm whitespace-nowrap">
                  <IconKey class="w-4 h-4" />
                  {{ t('developer.apps.notifications.manageKeys') }}
                </NuxtLink>
              </div>
              <p v-if="!apiKey" class="text-xs text-warning mt-1">
                <IconTriangleAlert class="w-3.5 h-3.5 inline -mt-0.5" />
                {{ t('developer.noApiKey') }}
              </p>
            </fieldset>

            <!-- Targeting Mode Toggle -->
            <fieldset class="fieldset mb-4">
              <legend class="fieldset-legend">{{ t('developer.apps.notifications.targetingMode') }}</legend>
              <div class="flex rounded-lg bg-base-200/60 p-0.5 w-fit">
                <button
                  v-for="mode in targetingModes"
                  :key="mode.key"
                  class="rounded-md px-4 py-1.5 text-xs font-semibold transition-all"
                  :class="targetingMode === mode.key ? 'bg-base-100 text-primary shadow-sm' : 'text-base-content/40 hover:text-base-content/70'"
                  @click="targetingMode = mode.key"
                >
                  {{ mode.label }}
                </button>
              </div>
            </fieldset>

            <!-- Target Input (for single/multiple) -->
            <fieldset v-if="targetingMode === 'single'" class="fieldset mb-4">
              <legend class="fieldset-legend">{{ t('developer.apps.notifications.accountId') }}</legend>
              <input
                v-model="request.accountId"
                type="text"
                class="input w-full font-mono text-sm"
                placeholder="00000000-0000-0000-0000-000000000001"
              />
            </fieldset>

            <fieldset v-if="targetingMode === 'multiple'" class="fieldset mb-4">
              <legend class="fieldset-legend">{{ t('developer.apps.notifications.accountIds') }}</legend>
              <textarea
                v-model="accountIdsText"
                class="textarea w-full font-mono text-sm"
                rows="3"
                placeholder="00000000-0000-0000-0000-000000000001&#10;00000000-0000-0000-0000-000000000002"
              />
              <p class="text-xs text-base-content/40 mt-1">{{ t('developer.apps.notifications.onePerLine') }}</p>
            </fieldset>

            <!-- Notification Fields -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <fieldset class="fieldset">
                <legend class="fieldset-legend">{{ t('developer.apps.notifications.topic') }}</legend>
                <input
                  v-model="request.topic"
                  type="text"
                  class="input w-full text-sm"
                  placeholder="order.created"
                />
                <p class="text-xs text-base-content/40 mt-1">{{ topicPreview }}</p>
              </fieldset>
              <fieldset class="fieldset">
                <legend class="fieldset-legend">{{ t('developer.apps.notifications.labelTitle') }}</legend>
                <input
                  v-model="request.title"
                  type="text"
                  class="input w-full text-sm"
                  placeholder="Order Created"
                />
              </fieldset>
            </div>

            <fieldset class="fieldset mb-4">
              <legend class="fieldset-legend">{{ t('developer.apps.notifications.body') }}</legend>
              <textarea
                v-model="request.body"
                class="textarea w-full text-sm"
                rows="2"
                placeholder="Your order has been created successfully."
              />
            </fieldset>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <fieldset class="fieldset">
                <legend class="fieldset-legend">{{ t('developer.apps.notifications.subtitle') }}</legend>
                <input
                  v-model="request.subtitle"
                  type="text"
                  class="input w-full text-sm"
                  placeholder="Optional subtitle"
                />
              </fieldset>
              <fieldset class="fieldset">
                <legend class="fieldset-legend">{{ t('developer.apps.notifications.actionUri') }}</legend>
                <input
                  v-model="request.actionUri"
                  type="text"
                  class="input w-full text-sm"
                  placeholder="https://example.com/orders/123"
                />
              </fieldset>
            </div>

            <!-- Meta JSON -->
            <fieldset class="fieldset mb-4">
              <legend class="fieldset-legend">
                {{ t('developer.apps.notifications.meta') }}
                <span class="text-xs text-base-content/40 font-normal">{{ t('developer.apps.notifications.metaOptional') }}</span>
              </legend>
              <textarea
                v-model="metaText"
                class="textarea w-full font-mono text-sm"
                rows="3"
                placeholder='{ "order_id": "12345" }'
              />
              <p v-if="metaError" class="text-xs text-error mt-1">{{ metaError }}</p>
            </fieldset>

            <!-- Options -->
            <div class="flex flex-wrap gap-4 mb-4">
              <label class="flex items-center gap-2 cursor-pointer">
                <input v-model="request.isSilent" type="checkbox" class="checkbox checkbox-sm" />
                <span class="text-sm">{{ t('developer.apps.notifications.isSilent') }}</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input v-model="request.isSavable" type="checkbox" class="checkbox checkbox-sm" />
                <span class="text-sm">{{ t('developer.apps.notifications.isSavable') }}</span>
              </label>
            </div>

            <!-- Send Button -->
            <div class="flex items-center gap-3">
              <button
                class="btn btn-primary"
                :class="{ loading: isSending }"
                :disabled="isSending || !canSend"
                @click="handleSend"
              >
                <IconSend v-if="!isSending" class="w-4 h-4" />
                {{ isSending ? t('developer.apps.notifications.sending') : t('developer.apps.notifications.sendTest') }}
              </button>
              <button class="btn btn-ghost btn-sm" @click="resetForm">
                <IconRotateCcw class="w-3.5 h-3.5" />
                {{ t('developer.apps.notifications.reset') }}
              </button>
            </div>
          </div>
        </div>

        <!-- Response Card -->
        <div v-if="response || sendError" class="card bg-base-100 shadow-sm">
          <div class="card-body p-5">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-base font-bold">{{ t('developer.playground.response') }}</h3>
              <div v-if="responseStatus" class="flex items-center gap-3 text-sm">
                <span class="font-semibold">
                  {{ t('developer.playground.status') }}:
                  <span :class="statusColorClass" class="font-mono">{{ responseStatus }}</span>
                </span>
                <span v-if="responseTime" class="text-base-content/50">
                  {{ t('developer.playground.time') }}: {{ responseTime }}ms
                </span>
              </div>
            </div>

            <!-- Error -->
            <div v-if="sendError" class="rounded-xl bg-error/10 border border-error/20 p-4">
              <div class="flex items-start gap-3">
                <IconCircleX class="w-5 h-5 text-error shrink-0 mt-0.5" />
                <div>
                  <div class="text-sm font-semibold text-error mb-1">{{ t('developer.apps.notifications.sendFailed') }}</div>
                  <pre class="text-xs font-mono text-base-content/60 whitespace-pre-wrap">{{ sendError }}</pre>
                </div>
              </div>
            </div>

            <!-- Success -->
            <div v-else-if="response" class="rounded-xl bg-success/10 border border-success/20 p-4">
              <div class="flex items-start gap-3 mb-3">
                <IconCircleCheck class="w-5 h-5 text-success shrink-0 mt-0.5" />
                <div>
                  <div class="text-sm font-semibold text-success mb-1">
                    {{ t('developer.apps.notifications.sentSuccessfully', { count: response.sent }) }}
                  </div>
                </div>
              </div>
              <pre class="rounded-lg bg-base-300/30 p-3 text-xs font-mono overflow-x-auto"><code>{{ JSON.stringify(response, null, 2) }}</code></pre>
            </div>
          </div>
        </div>
      </template>

      <div v-else class="flex flex-col items-center py-8 text-center">
        <IconBellOff class="w-12 h-12 text-base-content/20 mb-4" />
        <p class="text-base-content/60">{{ t('developer.apps.notFound') }}</p>
        <NuxtLink :to="`/developers/${pubName}/projects/${projectId}/apps`" class="btn btn-primary btn-sm mt-4">
          {{ t('developer.apps.backToList') }}
        </NuxtLink>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import {
  IconArrowLeft,
  IconBell,
  IconBellOff,
  IconCircleCheck,
  IconCircleX,
  IconCode,
  IconEye,
  IconEyeOff,
  IconFlaskConical,
  IconKey,
  IconRotateCcw,
  IconSend,
  IconTriangleAlert,
} from '#components'
import { sendCustomAppNotification } from '~/utils/developer-notifications'

definePageMeta({ middleware: 'developer' })

const { t } = useI18n()
const route = useRoute()
const pubName = computed(() => route.params.pubName as string)
const projectId = computed(() => route.params.projectId as string)
const appId = computed(() => route.params.appId as string)
const developer = useDeveloper()
const { $toast } = useNuxtApp()

// ---- App data ----
const app = ref<{ id: string; name: string; slug: string } | null>(null)
const isLoading = ref(false)

// ---- Playground state ----
const apiKey = ref('')
const showApiKey = ref(false)
const targetingMode = ref<'single' | 'multiple' | 'broadcast'>('single')
const accountIdsText = ref('')
const metaText = ref('')
const metaError = ref('')
const isSending = ref(false)
const response = ref<{ sent: number; scope: string; broadcast_to_all?: boolean } | null>(null)
const responseStatus = ref<number | null>(null)
const responseTime = ref<number | null>(null)
const sendError = ref('')

const targetingModes = [
  { key: 'single' as const, label: t('developer.apps.notifications.singleAccount') },
  { key: 'multiple' as const, label: t('developer.apps.notifications.multipleAccounts') },
  { key: 'broadcast' as const, label: t('developer.apps.notifications.broadcastAll') },
]

const request = reactive({
  accountId: '',
  topic: 'test.notification',
  title: 'Test Notification',
  body: 'This is a test notification from the developer playground.',
  subtitle: '',
  actionUri: '',
  isSilent: false,
  isSavable: true,
})

// ---- Computed ----
const canSend = computed(() => {
  if (!apiKey.value.trim()) return false
  if (!request.topic.trim() || !request.title.trim() || !request.body.trim()) return false
  if (targetingMode.value === 'single' && !request.accountId.trim()) return false
  if (targetingMode.value === 'multiple' && !accountIdsText.value.trim()) return false
  return true
})

const topicPreview = computed(() => {
  const slug = app.value?.slug || 'app'
  return `${pubName.value}.${slug}.${request.topic}`
})

const statusColorClass = computed(() => {
  if (!responseStatus.value) return ''
  if (responseStatus.value < 300) return 'text-success'
  if (responseStatus.value < 400) return 'text-warning'
  return 'text-error'
})

// ---- API Examples ----
const singleExample = `{
  "account_id": "00000000-0000-0000-0000-000000000001",
  "topic": "order.created",
  "title": "Order created",
  "body": "Your order was created."
}`

const multipleExample = `{
  "account_ids": [
    "00000000-0000-0000-0000-000000000001",
    "00000000-0000-0000-0000-000000000002"
  ],
  "topic": "campaign.update",
  "title": "Campaign update",
  "body": "A new update is available."
}`

const broadcastExample = `{
  "broadcast_to_all": true,
  "topic": "maintenance",
  "title": "Maintenance notice",
  "body": "Scheduled maintenance starts soon."
}`

const responseExample = `{
  "sent": 12,
  "scope": "notifications.send",
  "broadcast_to_all": true
}`

// ---- Methods ----
function resetForm() {
  request.accountId = ''
  request.topic = 'test.notification'
  request.title = 'Test Notification'
  request.body = 'This is a test notification from the developer playground.'
  request.subtitle = ''
  request.actionUri = ''
  request.isSilent = false
  request.isSavable = true
  accountIdsText.value = ''
  metaText.value = ''
  metaError.value = ''
  response.value = null
  sendError.value = ''
  responseStatus.value = null
  responseTime.value = null
}

async function handleSend() {
  metaError.value = ''

  // Parse meta
  let meta: Record<string, unknown> | undefined
  if (metaText.value.trim()) {
    try {
      meta = JSON.parse(metaText.value)
    } catch {
      metaError.value = t('developer.apps.notifications.invalidMeta')
      return
    }
  }

  // Build request body
  const body: Record<string, any> = {
    topic: request.topic.trim(),
    title: request.title.trim(),
    body: request.body.trim(),
    is_silent: request.isSilent,
    is_savable: request.isSavable,
  }

  if (request.subtitle.trim()) body.subtitle = request.subtitle.trim()
  if (request.actionUri.trim()) body.action_uri = request.actionUri.trim()
  if (meta) body.meta = meta

  if (targetingMode.value === 'single') {
    body.account_id = request.accountId.trim()
  } else if (targetingMode.value === 'multiple') {
    body.account_ids = accountIdsText.value
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean)
  } else {
    body.broadcast_to_all = true
  }

  isSending.value = true
  response.value = null
  sendError.value = ''
  responseStatus.value = null
  responseTime.value = null

  const startTime = performance.now()

  try {
    const result = await sendCustomAppNotification(
      appId.value,
      apiKey.value.trim(),
      body as any,
    )

    const endTime = performance.now()
    responseTime.value = Math.round(endTime - startTime)
    responseStatus.value = 200
    response.value = result
  } catch (e: any) {
    const endTime = performance.now()
    responseTime.value = Math.round(endTime - startTime)
    responseStatus.value = e.status || 500
    sendError.value = e?.message || 'Unknown error'
    $toast.error(t('developer.apps.notifications.sendFailed'))
  } finally {
    isSending.value = false
  }
}

async function loadData() {
  isLoading.value = true
  try {
    await developer.loadDevelopers()
    developer.selectByPublisherName(pubName.value)
    await developer.loadProject(pubName.value, projectId.value)

    if (developer.currentApp.value) {
      app.value = developer.currentApp.value
    }
  } catch (e) {
    console.error(e)
  } finally {
    isLoading.value = false
  }
}

watch([pubName, projectId, appId], () => {
  loadData()
}, { immediate: true })
</script>
