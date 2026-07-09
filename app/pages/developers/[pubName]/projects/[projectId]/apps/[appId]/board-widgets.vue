<template>
  <NuxtLayout name="developer">
    <div class="mx-auto max-w-5xl">
      <!-- Back Navigation -->
      <div class="flex items-center gap-4 mb-6 -mx-4">
        <NuxtLink :to="`/developers/${pubName}/projects/${projectId}/apps/${appId}`" class="btn btn-ghost btn-sm">
          <IconArrowLeft class="w-4 h-4" />
          {{ t('developer.apps.detail') }}
        </NuxtLink>
      </div>

      <!-- Header -->
      <div class="mb-6">
        <h2 class="text-2xl font-bold flex items-center gap-3">
          <IconLayoutDashboard class="w-7 h-7 text-primary" />
          {{ t('developer.apps.boardWidgets.title') }}
        </h2>
        <p class="text-sm text-base-content/50 mt-1">
          {{ t('developer.apps.boardWidgets.description') }}
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center py-16">
        <span class="loading loading-spinner loading-lg" />
      </div>

      <template v-else>
        <!-- Widgets List Card -->
        <div class="card bg-base-100 shadow-sm mb-6">
          <div class="card-body p-5">
            <div class="flex items-center justify-between mb-4">
              <h3 class="card-title text-base">{{ t('developer.apps.boardWidgets.widgetList') }}</h3>
              <button class="btn btn-primary btn-sm" @click="openCreateModal">
                <IconPlus class="w-4 h-4" />
                {{ t('developer.apps.boardWidgets.addWidget') }}
              </button>
            </div>

            <!-- Widget Items -->
            <div v-if="widgets.length > 0" class="space-y-3">
              <div
                v-for="(widget, index) in widgets"
                :key="widget.key"
                class="rounded-xl border border-base-300/30 p-4 transition-colors hover:border-primary/30"
              >
                <div class="flex items-start gap-4">
                  <!-- Widget Info -->
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-2 flex-wrap">
                      <code class="text-sm font-mono font-semibold">{{ widget.key }}</code>
                      <span
                        class="badge badge-sm"
                        :class="widget.isEnabled ? 'badge-success' : 'badge-ghost'"
                      >
                        {{ widget.isEnabled ? t('common.active') ?? 'Active' : t('common.disabled') ?? 'Disabled' }}
                      </span>
                      <span class="badge badge-sm badge-outline">{{ widget.rendererType }}</span>
                      <span v-if="!widget.allowMultiple" class="badge badge-sm badge-info">
                        {{ t('developer.apps.boardWidgets.singleton') }}
                      </span>
                    </div>
                    <div class="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-base-content/50">
                      <span v-if="widget.maxPayloadBytes > 0">
                        {{ t('developer.apps.boardWidgets.maxPayloadBytes') }}: {{ widget.maxPayloadBytes }}b
                      </span>
                      <span v-if="widget.requiredFields.length > 0">
                        {{ t('developer.apps.boardWidgets.requiredFields') }}: {{ widget.requiredFields.join(', ') }}
                      </span>
                    </div>
                    <!-- Field types -->
                    <div v-if="widget.fieldTypes.length > 0" class="mt-2 space-y-1">
                      <div class="text-xs text-base-content/40 mb-1">{{ t('developer.apps.boardWidgets.fieldTypes') }}:</div>
                      <div class="flex flex-wrap gap-1">
                        <span
                          v-for="field in widget.fieldTypes"
                          :key="field.name"
                          class="badge badge-xs"
                          :class="field.required ? 'badge-warning' : 'badge-ghost'"
                        >
                          {{ field.name }} <span class="text-[10px] text-base-content/40">({{ field.type }}{{ field.format ? '/' + field.format : '' }})</span>{{ field.required ? '*' : '' }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- Actions -->
                  <div class="flex gap-1 shrink-0">
                    <button class="btn btn-ghost btn-xs" @click="openEditModal(widget, index)">
                      <IconEdit class="w-3.5 h-3.5" />
                    </button>
                    <button class="btn btn-ghost btn-xs text-error" @click="handleDelete(widget.key, index)">
                      <IconTrash class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div v-else class="flex flex-col items-center py-10 text-center">
              <IconLayoutDashboard class="w-12 h-12 text-base-content/20 mb-4" />
              <p class="text-base-content/60 mb-2">{{ t('developer.apps.boardWidgets.noWidgets') }}</p>
              <p class="text-sm text-base-content/40">{{ t('developer.apps.boardWidgets.noWidgetsHint') }}</p>
            </div>
          </div>
        </div>

        <!-- Payload Push Card -->
        <div class="card bg-base-100 shadow-sm mb-6">
          <div class="card-body p-5">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h3 class="card-title text-base flex items-center gap-2">
                  <IconUpload class="w-5 h-5 text-secondary" />
                  {{ t('developer.apps.boardWidgets.payloadPush.title') }}
                </h3>
                <p class="text-xs text-base-content/50 mt-1">{{ t('developer.apps.boardWidgets.payloadPush.subtitle') }}</p>
              </div>
              <button class="btn btn-secondary btn-sm" @click="openPushModal">
                <IconRocket class="w-4 h-4" />
                {{ t('developer.apps.boardWidgets.payloadPush.testPush') }}
              </button>
            </div>

            <!-- API Reference -->
            <div class="space-y-3">
              <!-- Endpoint -->
              <div class="rounded-xl bg-base-200/60 p-3">
                <div class="flex items-center gap-2 mb-1.5">
                  <span class="badge badge-secondary badge-xs font-bold">POST</span>
                  <code class="text-[11px] text-base-content/60 font-mono truncate">/develop/private/apps/{{ appId.slice(0, 8) }}.../board/payload</code>
                </div>
                <p class="text-xs text-base-content/50">
                  {{ t('developer.apps.boardWidgets.payloadPush.authLabel') }}:
                  <code class="bg-base-200 rounded px-1 text-[11px]">X-App-Secret</code>
                  <span class="text-base-content/30 mx-1">or</span>
                  <code class="bg-base-200 rounded px-1 text-[11px]">Authorization: Bearer</code>
                </p>
              </div>
              <!-- Key Parameters -->
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div class="rounded-xl bg-base-200/60 p-3">
                  <div class="text-xs font-semibold text-base-content/60 mb-1">account_id</div>
                  <p class="text-[11px] text-base-content/40">{{ t('developer.apps.boardWidgets.payloadPush.accountIdHint') }}</p>
                </div>
                <div class="rounded-xl bg-base-200/60 p-3">
                  <div class="text-xs font-semibold text-base-content/60 mb-1">board_item_id</div>
                  <p class="text-[11px] text-base-content/40">{{ t('developer.apps.boardWidgets.payloadPush.boardItemIdHint') }}</p>
                </div>
                <div class="rounded-xl bg-base-200/60 p-3">
                  <div class="text-xs font-semibold text-base-content/60 mb-1">payload</div>
                  <p class="text-[11px] text-base-content/40">{{ t('developer.apps.boardWidgets.payloadPush.payloadHint') }}</p>
                </div>
              </div>
              <!-- Info Note -->
              <div class="rounded-xl bg-secondary/5 border border-secondary/10 p-2.5">
                <p class="text-[11px] text-secondary/70 leading-relaxed">
                  <IconInfo class="w-3 h-3 inline mr-1 -mt-0.5" />
                  {{ t('developer.apps.boardWidgets.payloadPush.infoNote') }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Info Card -->
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body p-5">
            <h3 class="card-title text-base mb-3">{{ t('developer.apps.boardWidgets.howItWorks') }}</h3>
            <div class="space-y-3 text-sm text-base-content/70">
              <p>{{ t('developer.apps.boardWidgets.howItWorksDesc1') }}</p>
              <p>{{ t('developer.apps.boardWidgets.howItWorksDesc2') }}</p>
              <p>{{ t('developer.apps.boardWidgets.howItWorksDesc3') }}</p>
            </div>
            <div class="divider" />
            <div class="rounded-xl bg-base-200/60 p-3">
              <div class="text-xs font-semibold text-base-content/70 mb-1">{{ t('developer.apps.boardWidgets.oauthScopeLabel') }}</div>
              <code class="text-xs font-mono text-primary">accounts.profile.board</code>
              <p class="text-xs text-base-content/40 mt-1">{{ t('developer.apps.boardWidgets.oauthScopeHint') }}</p>
            </div>
          </div>
        </div>
      </template>

      <!-- Create/Edit Widget Drawer -->
      <AdminDrawer
        :open="widgetModalOpen"
        :title="editingWidget ? t('developer.apps.boardWidgets.editWidget') : t('developer.apps.boardWidgets.addWidget')"
        @update:open="widgetModalOpen = $event"
        content-class="max-w-2xl"
      >
        <form @submit.prevent="handleSaveWidget">
          <div class="space-y-4">
            <!-- Key -->
            <fieldset class="fieldset">
              <legend class="fieldset-legend">{{ t('developer.apps.boardWidgets.key') }}</legend>
              <input
                v-model="widgetForm.key"
                type="text"
                class="input w-full font-mono text-sm"
                required
                :disabled="!!editingWidget"
                placeholder="summary_card"
              />
              <p class="text-xs text-base-content/40 mt-1">{{ t('developer.apps.boardWidgets.keyHint') }}</p>
            </fieldset>

            <!-- Renderer Type -->
            <fieldset class="fieldset">
              <legend class="fieldset-legend">{{ t('developer.apps.boardWidgets.rendererType') }}</legend>
              <select v-model="widgetForm.rendererType" class="select w-full">
                <option value="data">data</option>
                <option value="card">card</option>
                <option value="inline">inline</option>
                <option value="hero">hero</option>
                <option value="list">list</option>
                <option value="stat">stat</option>
              </select>
            </fieldset>

            <!-- Max Payload Bytes -->
            <fieldset class="fieldset">
              <legend class="fieldset-legend">{{ t('developer.apps.boardWidgets.maxPayloadBytes') }}</legend>
              <input
                v-model.number="widgetForm.maxPayloadBytes"
                type="number"
                class="input w-full"
                min="0"
                placeholder="2048"
              />
            </fieldset>

            <!-- Field Types Editor -->
            <fieldset class="fieldset">
              <legend class="fieldset-legend flex items-center justify-between w-full pr-4">
                <span>{{ t('developer.apps.boardWidgets.fieldTypes') }}</span>
                <button type="button" class="btn btn-ghost btn-xs" @click="addFieldType">
                  <IconPlus class="w-3 h-3" />
                </button>
              </legend>
              <p class="text-[11px] text-base-content/40 mb-1.5 leading-relaxed">
                {{ t('developer.apps.boardWidgets.fieldEnvelopeHint') }}
              </p>
              <p class="text-[11px] text-base-content/35 mb-2 leading-relaxed">
                {{ t('developer.apps.boardWidgets.fieldValueTypesHint') }}
              </p>

              <!-- Envelope shape reference -->
              <div class="rounded-lg bg-base-200/50 border border-base-300/40 p-2.5 mb-2 font-mono text-[11px] text-base-content/55 leading-relaxed">
                <div class="text-base-content/40 mb-1 not-italic font-sans text-[10px] font-semibold uppercase tracking-wide">
                  envelope
                </div>
                <div>{</div>
                <div class="pl-3">
                  <span class="text-primary">"value"</span>:
                  <span class="text-base-content/70"> string | number | boolean | null | object | array</span>
                  <span class="text-error">*</span>
                </div>
                <div class="pl-3">
                  <span class="text-primary">"label"</span>:
                  <span class="text-base-content/70"> string</span>
                  <span class="text-error">*</span>
                </div>
                <div class="pl-3">
                  <span class="text-primary">"format"</span>:
                  <span class="text-base-content/70"> string?</span>
                </div>
                <div>}</div>
                <p class="mt-1.5 font-sans text-[10px] text-base-content/40 leading-relaxed">
                  object / array values may contain arbitrarily nested JSON.
                </p>
              </div>

              <div v-if="widgetForm.fieldTypes.length > 0" class="space-y-2">
                <div
                  v-for="(field, fi) in widgetForm.fieldTypes"
                  :key="fi"
                  class="rounded-lg bg-base-200/40 border border-base-300/30 p-2.5 space-y-1.5"
                >
                  <div class="flex items-center gap-2 flex-wrap">
                    <input
                      v-model="field.name"
                      type="text"
                      class="input input-sm w-28 font-mono text-xs"
                      :placeholder="t('developer.apps.boardWidgets.fieldName') ?? 'Name'"
                    >
                    <select
                      v-model="field.type"
                      class="select select-sm flex-1 min-w-[6.5rem] text-xs"
                      @change="onFieldTypeChange(field)"
                    >
                      <option value="string">string</option>
                      <option value="number">number</option>
                      <option value="boolean">boolean</option>
                      <option value="null">null</option>
                      <option value="array">array</option>
                      <option value="object">object</option>
                    </select>
                    <select
                      v-model="field.format"
                      class="select select-sm w-24 text-xs"
                      :disabled="isNestedFieldType(field.type)"
                      :title="isNestedFieldType(field.type) ? t('developer.apps.boardWidgets.formatHintNested') : undefined"
                    >
                      <option value="">{{ t('developer.apps.boardWidgets.formatAuto') ?? 'Auto' }}</option>
                      <option value="boolean">boolean</option>
                      <option value="number">number</option>
                      <option value="date">date</option>
                      <option value="currency">currency</option>
                      <option value="json">json</option>
                    </select>
                    <button type="button" class="btn btn-ghost btn-xs btn-square text-error" @click="removeFieldType(fi)">
                      <IconX class="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div class="flex items-center gap-2">
                    <input
                      v-model="field.label"
                      type="text"
                      class="input input-sm flex-1 text-xs"
                      :placeholder="t('developer.apps.boardWidgets.fieldLabel') ?? 'Label'"
                    >
                    <label class="flex items-center gap-1 cursor-pointer text-xs shrink-0">
                      <input v-model="field.required" type="checkbox" class="checkbox checkbox-xs">
                      {{ t('common.required') ?? 'Required' }}
                    </label>
                  </div>
                  <p
                    v-if="isNestedFieldType(field.type)"
                    class="text-[10px] text-base-content/40 leading-relaxed px-0.5"
                  >
                    {{ t('developer.apps.boardWidgets.formatHintNested') }}
                  </p>
                </div>
              </div>
              <p v-else class="text-xs text-base-content/40 italic">{{ t('developer.apps.boardWidgets.noFieldTypes') }}</p>
            </fieldset>

            <!-- Toggles -->
            <div class="flex flex-wrap gap-4">
              <label class="flex items-center gap-2 cursor-pointer">
                <input v-model="widgetForm.isEnabled" type="checkbox" class="toggle toggle-sm" />
                <span class="text-sm">{{ t('developer.apps.boardWidgets.isEnabled') }}</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input v-model="widgetForm.allowMultiple" type="checkbox" class="toggle toggle-sm" />
                <span class="text-sm">{{ t('developer.apps.boardWidgets.allowMultiple') }}</span>
              </label>
            </div>
          </div>

          <div class="flex items-center justify-between gap-3 mt-6">
            <button type="button" class="btn btn-ghost" @click="widgetModalOpen = false">
              {{ t('common.cancel') }}
            </button>
            <button type="submit" class="btn btn-primary" :disabled="isSavingWidget">
              <span v-if="isSavingWidget" class="loading loading-spinner loading-sm" />
              {{ editingWidget ? t('common.save') : t('common.create') }}
            </button>
          </div>
        </form>
      </AdminDrawer>

      <!-- Push Payload Drawer -->
      <AdminDrawer
        :open="pushModalOpen"
        :title="t('developer.apps.boardWidgets.payloadPush.title')"
        @update:open="pushModalOpen = $event"
        content-class="max-w-2xl"
      >
        <div class="space-y-4">
          <fieldset class="fieldset">
            <legend class="fieldset-legend">{{ t('developer.apps.boardWidgets.payloadPush.widgetKey') }}</legend>
            <select v-model="pushForm.widgetKey" class="select w-full font-mono text-sm">
              <option value="" disabled>{{ t('developer.apps.boardWidgets.payloadPush.selectWidget') }}</option>
              <option v-for="w in widgets" :key="w.key" :value="w.key">{{ w.key }}</option>
            </select>
          </fieldset>

          <fieldset class="fieldset">
            <legend class="fieldset-legend">{{ t('developer.apps.boardWidgets.payloadPush.accountId') }}</legend>
            <input
              v-model="pushForm.accountId"
              type="text"
              class="input w-full font-mono text-sm"
              placeholder="550e8400-e29b-41d4-a716-446655440000"
            />
            <p class="text-xs text-base-content/40 mt-1">{{ t('developer.apps.boardWidgets.payloadPush.accountIdPlaceholder') }}</p>
          </fieldset>

          <fieldset class="fieldset">
            <legend class="fieldset-legend">
              {{ t('developer.apps.boardWidgets.payloadPush.boardItemId') }}
              <span class="text-base-content/40 font-normal">({{ t('developer.apps.boardWidgets.payloadPush.optional') }})</span>
            </legend>
            <input
              v-model="pushForm.boardItemId"
              type="text"
              class="input w-full font-mono text-sm"
              placeholder="de305d54-75b4-431b-adb2-eb6b9e546014"
            />
            <p class="text-xs text-base-content/40 mt-1">{{ t('developer.apps.boardWidgets.payloadPush.boardItemIdOptionalHint') }}</p>
          </fieldset>

          <fieldset class="fieldset">
            <legend class="fieldset-legend flex items-center justify-between w-full pr-1">
              <span>{{ t('developer.apps.boardWidgets.payload') }}</span>
              <button
                type="button"
                class="btn btn-ghost btn-xs"
                :disabled="!selectedPushWidget"
                @click="fillSamplePayload"
              >
                {{ t('developer.apps.boardWidgets.fillSample') }}
              </button>
            </legend>
            <p class="text-[11px] text-base-content/40 mb-1.5 leading-relaxed">
              {{ t('developer.apps.boardWidgets.payloadHintNested') }}
            </p>
            <textarea
              v-model="pushPayloadInput"
              class="textarea w-full font-mono text-sm leading-relaxed"
              rows="12"
              :placeholder="payloadPlaceholder"
            />
          </fieldset>

          <div v-if="pushResult" class="rounded-xl p-3" :class="pushResult.success ? 'bg-success/10 border border-success/30' : 'bg-error/10 border border-error/30'">
            <div class="flex items-center gap-2 text-sm font-semibold" :class="pushResult.success ? 'text-success' : 'text-error'">
              <IconCheckCircle v-if="pushResult.success" class="w-4 h-4" />
              <IconAlertCircle v-else class="w-4 h-4" />
              {{ pushResult.success ? t('developer.apps.boardWidgets.payloadPush.pushSucceeded') : t('developer.apps.boardWidgets.payloadPush.pushFailed') }}
            </div>
            <p v-if="pushResult.message" class="text-xs mt-1 text-base-content/60">{{ pushResult.message }}</p>
            <div v-if="pushResult.normalizedPayload" class="mt-2">
              <div class="text-xs font-semibold text-base-content/50 mb-1">{{ t('developer.apps.boardWidgets.normalizedPayload') }}:</div>
              <pre class="text-xs font-mono bg-base-200 rounded p-2 overflow-x-auto"><code>{{ JSON.stringify(pushResult.normalizedPayload, null, 2) }}</code></pre>
            </div>
            <div v-if="pushResult.boardItem" class="mt-2">
              <div class="text-xs font-semibold text-base-content/50 mb-1">{{ t('developer.apps.boardWidgets.payloadPush.updatedBoardItem') }}:</div>
              <pre class="text-xs font-mono bg-base-200 rounded p-2 overflow-x-auto"><code>{{ JSON.stringify(pushResult.boardItem, null, 2) }}</code></pre>
            </div>
          </div>

          <!-- API info note -->
          <div class="rounded-xl bg-base-200/60 p-3 text-xs text-base-content/50">
            <div class="flex items-center gap-1.5 mb-1">
              <IconTerminal class="w-3.5 h-3.5" />
              <span class="font-semibold text-base-content/60">{{ t('developer.apps.boardWidgets.payloadPush.backendNoteTitle') }}</span>
            </div>
            <p class="leading-relaxed">{{ t('developer.apps.boardWidgets.payloadPush.backendNote') }}</p>
            <div class="mt-2 rounded bg-base-300/50 p-2 font-mono text-[11px] text-base-content/50 overflow-x-auto">
              <div>POST /develop/private/apps/{{ appId }}/board/payload</div>
              <div class="text-base-content/30">Authorization: Bearer &lt;secret&gt;</div>
            </div>
          </div>

          <div class="flex items-center justify-between gap-3">
            <button type="button" class="btn btn-ghost" @click="pushModalOpen = false">
              {{ t('common.cancel') }}
            </button>
            <button type="button" class="btn btn-secondary" :disabled="isPushing" @click="handlePushPayload">
              <span v-if="isPushing" class="loading loading-spinner loading-sm" />
              <IconRocket v-else class="w-4 h-4" />
              {{ t('developer.apps.boardWidgets.payloadPush.push') }}
            </button>
          </div>
        </div>
      </AdminDrawer>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import {
  IconArrowLeft,
  IconPlus,
  IconEdit,
  IconTrash,
  IconLayoutDashboard,
  IconX,
  IconCheckCircle,
  IconAlertCircle,
  IconUpload,
  IconRocket,
  IconInfo,
  IconTerminal,
} from '#components'
import type {
  BoardWidgetFieldManifest,
  BoardWidgetManifest,
  BoardWidgetPayload,
  BoardWidgetPayloadPushResponse,
} from '~/types/developer'
import {
  fetchBoardWidgets,
  createBoardWidget,
  updateBoardWidget,
  deleteBoardWidget,
  pushBoardWidgetPayload,
  sampleBoardWidgetPayload,
} from '~/utils/developer'

definePageMeta({ middleware: 'developer' })

const { t } = useI18n()
const route = useRoute()
const pubName = computed(() => route.params.pubName as string)
const projectId = computed(() => route.params.projectId as string)
const appId = computed(() => route.params.appId as string)

// ---- State ----
const widgets = ref<BoardWidgetManifest[]>([])
const isLoading = ref(false)

// ---- Create/Edit Modal ----
const widgetModalOpen = ref(false)
const isSavingWidget = ref(false)
const editingWidget = ref<BoardWidgetManifest | null>(null)
const editingIndex = ref(-1)

const defaultWidget = (): BoardWidgetManifest => ({
  key: '',
  isEnabled: true,
  rendererType: 'data',
  fieldTypes: [],
  requiredFields: [],
  maxPayloadBytes: 2048,
  allowMultiple: true,
})

const widgetForm = reactive<BoardWidgetManifest>(defaultWidget())

// Sync requiredFields from fieldTypes whenever they change
const requiredFieldsSync = computed(() =>
  widgetForm.fieldTypes.filter(f => f.required).map(f => f.name).filter(Boolean)
)

defineOgImage('UniOgImage', { title: `${t('developer.apps.boardWidgets.title')} · Pub: ${pubName.value}` })

useSolarSeo({ title: `${t('developer.apps.boardWidgets.title')} · ${pubName.value}` })

// ---- Load ----
async function loadWidgets() {
  isLoading.value = true
  try {
    widgets.value = await fetchBoardWidgets(pubName.value, projectId.value, appId.value)
  } catch (e) {
    console.error('[board-widgets] Failed to load widgets:', e)
  } finally {
    isLoading.value = false
  }
}

// ---- Create/Edit ----
function openCreateModal() {
  editingWidget.value = null
  editingIndex.value = -1
  Object.assign(widgetForm, defaultWidget())
  widgetModalOpen.value = true
}

function openEditModal(widget: BoardWidgetManifest, index: number) {
  editingWidget.value = widget
  editingIndex.value = index
  Object.assign(widgetForm, JSON.parse(JSON.stringify(widget)))
  widgetModalOpen.value = true
}

function addFieldType() {
  widgetForm.fieldTypes.push({ name: '', type: 'string', label: '', format: '', required: false })
}

function removeFieldType(index: number) {
  widgetForm.fieldTypes.splice(index, 1)
}

function isNestedFieldType(type?: string): boolean {
  const t = (type || '').toLowerCase()
  return t === 'object' || t === 'array' || t === 'null'
}

function onFieldTypeChange(field: BoardWidgetFieldManifest) {
  // Display formats apply to scalar values; nested types use json, null has no format
  if (field.type === 'object' || field.type === 'array') {
    field.format = 'json'
  } else if (field.type === 'null' || field.format === 'json') {
    field.format = ''
  }
}

async function handleSaveWidget() {
  isSavingWidget.value = true
  try {
    // Sync requiredFields from fieldTypes checkboxes
    widgetForm.requiredFields = requiredFieldsSync.value

    if (editingWidget.value) {
      const updated = await updateBoardWidget(
        pubName.value,
        projectId.value,
        appId.value,
        editingWidget.value.key,
        widgetForm,
      )
      widgets.value[editingIndex.value] = updated
    } else {
      const created = await createBoardWidget(
        pubName.value,
        projectId.value,
        appId.value,
        widgetForm,
      )
      widgets.value.push(created)
    }
    widgetModalOpen.value = false
  } catch (e) {
    console.error(e)
  } finally {
    isSavingWidget.value = false
  }
}

// ---- Delete ----
async function handleDelete(widgetKey: string, index: number) {
  if (!confirm(t('developer.apps.boardWidgets.deleteConfirm'))) return
  try {
    await deleteBoardWidget(pubName.value, projectId.value, appId.value, widgetKey)
    widgets.value.splice(index, 1)
  } catch (e) {
    console.error(e)
  }
}

// ---- Push Payload ----
const pushModalOpen = ref(false)
const isPushing = ref(false)
const pushResult = ref<BoardWidgetPayloadPushResponse | null>(null)

const pushForm = reactive({
  widgetKey: '',
  accountId: '',
  boardItemId: '',
})
const pushPayloadInput = ref('')

const selectedPushWidget = computed(() =>
  widgets.value.find(w => w.key === pushForm.widgetKey) ?? null,
)

const payloadPlaceholder = `{
  "title": {
    "value": "Updated from app backend",
    "label": "Title"
  },
  "show_points": {
    "value": false,
    "label": "Show points",
    "format": "boolean"
  },
  "meta": {
    "value": {
      "source": "backend",
      "tags": ["featured", "live"],
      "stats": { "views": 120, "likes": 8 }
    },
    "label": "Metadata"
  },
  "items": {
    "value": [
      { "id": 1, "name": "Alpha" },
      { "id": 2, "name": "Beta", "nested": { "ok": true } }
    ],
    "label": "Items"
  }
}`

function openPushModal() {
  pushForm.widgetKey = widgets.value.length > 0 ? widgets.value[0]!.key : ''
  pushForm.accountId = ''
  pushForm.boardItemId = ''
  pushResult.value = null
  // Prefill sample from selected widget field types (supports object/array values)
  const first = widgets.value[0]
  pushPayloadInput.value = first && first.fieldTypes.length > 0
    ? JSON.stringify(sampleBoardWidgetPayload(first.fieldTypes), null, 2)
    : ''
  pushModalOpen.value = true
}

function fillSamplePayload() {
  const widget = selectedPushWidget.value
  if (!widget) return
  pushPayloadInput.value = widget.fieldTypes.length > 0
    ? JSON.stringify(sampleBoardWidgetPayload(widget.fieldTypes), null, 2)
    : payloadPlaceholder
}

/**
 * Client-side envelope check: each field must be { value: any JSON, label: string, format?: string }.
 * value may be string | number | boolean | null | object | array (arbitrarily nested).
 */
function validateEnvelopePayload(raw: unknown): { ok: true; payload: BoardWidgetPayload } | { ok: false; message: string } {
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ok: false, message: t('developer.apps.boardWidgets.invalidEnvelope') }
  }
  const payload = raw as Record<string, unknown>
  for (const [key, field] of Object.entries(payload)) {
    if (field === null || typeof field !== 'object' || Array.isArray(field)) {
      return {
        ok: false,
        message: `${t('developer.apps.boardWidgets.invalidEnvelope')} (${key})`,
      }
    }
    const env = field as Record<string, unknown>
    if (!('value' in env)) {
      return {
        ok: false,
        message: `${t('developer.apps.boardWidgets.invalidEnvelope')} (${key}: missing value)`,
      }
    }
    // value: any JSON (string | number | boolean | null | object | array)
    if (!isJsonValue(env.value)) {
      return {
        ok: false,
        message: `${t('developer.apps.boardWidgets.invalidEnvelope')} (${key}: value is not JSON)`,
      }
    }
    if (typeof env.label !== 'string' || !env.label.trim()) {
      return {
        ok: false,
        message: `${t('developer.apps.boardWidgets.invalidEnvelope')} (${key}: label must be a non-empty string)`,
      }
    }
    if (env.format !== undefined && typeof env.format !== 'string') {
      return {
        ok: false,
        message: `${t('developer.apps.boardWidgets.invalidEnvelope')} (${key}: format must be a string)`,
      }
    }
  }
  return { ok: true, payload: payload as BoardWidgetPayload }
}

function isJsonValue(v: unknown): boolean {
  if (v === null) return true
  const ty = typeof v
  if (ty === 'string' || ty === 'number' || ty === 'boolean') return true
  if (ty === 'undefined' || ty === 'function' || ty === 'symbol' || ty === 'bigint') return false
  if (Array.isArray(v)) return v.every(isJsonValue)
  if (ty === 'object') {
    return Object.values(v as Record<string, unknown>).every(isJsonValue)
  }
  return false
}

watch(() => pushForm.widgetKey, (key) => {
  if (!pushModalOpen.value || !key) return
  // When switching widgets, refresh sample if textarea still empty
  if (!pushPayloadInput.value.trim()) {
    fillSamplePayload()
  }
})

async function handlePushPayload() {
  if (!pushForm.widgetKey || !pushForm.accountId) return
  isPushing.value = true
  try {
    let parsed: unknown
    try {
      parsed = JSON.parse(pushPayloadInput.value || '{}')
    } catch {
      pushResult.value = {
        success: false,
        message: t('developer.apps.boardWidgets.invalidJson'),
        accountId: pushForm.accountId,
        boardItemId: pushForm.boardItemId || undefined,
        widgetKey: pushForm.widgetKey,
        normalizedPayload: null,
        boardItem: null,
      }
      return
    }

    const check = validateEnvelopePayload(parsed)
    if (!check.ok) {
      pushResult.value = {
        success: false,
        message: check.message,
        accountId: pushForm.accountId,
        boardItemId: pushForm.boardItemId || undefined,
        widgetKey: pushForm.widgetKey,
        normalizedPayload: null,
        boardItem: null,
      }
      return
    }

    pushResult.value = await pushBoardWidgetPayload(
      appId.value,
      {
        accountId: pushForm.accountId,
        boardItemId: pushForm.boardItemId || undefined,
        widgetKey: pushForm.widgetKey,
        payload: check.payload,
      },
    )
  } catch (e) {
    console.error(e)
    pushResult.value = {
      success: false,
      message: String(e),
      accountId: pushForm.accountId,
      boardItemId: pushForm.boardItemId || undefined,
      widgetKey: pushForm.widgetKey,
      normalizedPayload: null,
      boardItem: null,
    }
  } finally {
    isPushing.value = false
  }
}

watch([pubName, projectId, appId], async () => {
  await loadWidgets()
}, { immediate: true })
</script>
