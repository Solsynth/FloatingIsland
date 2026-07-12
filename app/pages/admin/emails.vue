<template>
  <NuxtLayout name="admin">
    <AdminPageHeader title="Emails" description="Send and schedule HTML emails to accounts" />

    <TabsRoot v-model="activeTab" default-value="compose">
      <TabsList class="flex border-b border-base-200 mb-6 overflow-x-auto">
        <TabsTrigger
          value="compose"
          class="flex items-center gap-2 px-4 py-3 text-sm font-medium text-base-content/60 border-b-2 border-transparent transition-colors hover:text-base-content data-[state=active]:text-primary data-[state=active]:border-primary shrink-0"
        >
          <IconSend class="w-4 h-4" />
          Compose
        </TabsTrigger>
        <TabsTrigger
          value="plans"
          class="flex items-center gap-2 px-4 py-3 text-sm font-medium text-base-content/60 border-b-2 border-transparent transition-colors hover:text-base-content data-[state=active]:text-primary data-[state=active]:border-primary shrink-0"
          @click="loadPlans"
        >
          <IconCalendarClock class="w-4 h-4" />
          Sending Plans
        </TabsTrigger>
        <TabsTrigger
          value="export"
          class="flex items-center gap-2 px-4 py-3 text-sm font-medium text-base-content/60 border-b-2 border-transparent transition-colors hover:text-base-content data-[state=active]:text-primary data-[state=active]:border-primary shrink-0"
        >
          <IconDownload class="w-4 h-4" />
          Export
        </TabsTrigger>
        <TabsTrigger
          value="observability"
          class="flex items-center gap-2 px-4 py-3 text-sm font-medium text-base-content/60 border-b-2 border-transparent transition-colors hover:text-base-content data-[state=active]:text-primary data-[state=active]:border-primary shrink-0"
        >
          <IconActivity class="w-4 h-4" />
          Observability
        </TabsTrigger>
      </TabsList>

      <!-- Compose Tab: Immediate Send -->
      <TabsContent value="compose">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 space-y-6">
            <AdminCard title="Compose Email">
              <form class="space-y-4" @submit.prevent="handleSendEmail">
                <!-- Targeting -->
                <div>
                  <label class="label label-text text-sm font-medium">Target Mode</label>
                  <div class="flex gap-2 rounded-xl bg-base-200/70 p-1">
                    <button
                      type="button"
                      class="flex-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all"
                      :class="targetMode === 'accounts' ? 'bg-base-100 text-primary shadow-sm' : 'text-base-content/50'"
                      @click="targetMode = 'accounts'"
                    >
                      Specific Accounts
                    </button>
                    <button
                      type="button"
                      class="flex-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all"
                      :class="targetMode === 'broadcast' ? 'bg-base-100 text-primary shadow-sm' : 'text-base-content/50'"
                      @click="targetMode = 'broadcast'"
                    >
                      Broadcast All
                    </button>
                  </div>
                </div>

                <div v-if="targetMode === 'accounts'">
                  <label class="label label-text text-sm font-medium">Target Accounts</label>
                  <div v-if="selectedAccounts.length" class="flex flex-wrap gap-1.5 mb-2">
                    <span
                      v-for="acc in selectedAccounts"
                      :key="acc.id"
                      class="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-primary/10 text-primary"
                    >
                      {{ acc.nick || acc.name }}
                      <button class="hover:text-error" @click="removeSelectedAccount(acc.id)">
                        <IconX class="w-3 h-3" />
                      </button>
                    </span>
                  </div>
                  <button
                    type="button"
                    class="btn btn-sm btn-outline w-full"
                    @click="openAccountPicker"
                  >
                    <IconUsers class="w-4 h-4" />
                    {{ selectedAccounts.length ? 'Add More Accounts' : 'Select Accounts' }}
                  </button>
                </div>

                <!-- Compose Mode Toggle -->
                <div>
                  <label class="label label-text text-sm font-medium">Compose Mode</label>
                  <div class="flex gap-2 rounded-xl bg-base-200/70 p-1">
                    <button
                      type="button"
                      class="flex-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all"
                      :class="composeMode === 'template' ? 'bg-base-100 text-primary shadow-sm' : 'text-base-content/50'"
                      @click="composeMode = 'template'"
                    >
                      <IconLayoutTemplate class="w-3.5 h-3.5 inline-block mr-1 -mt-0.5" />
                      Template
                    </button>
                    <button
                      type="button"
                      class="flex-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all"
                      :class="composeMode === 'custom' ? 'bg-base-100 text-primary shadow-sm' : 'text-base-content/50'"
                      @click="composeMode = 'custom'"
                    >
                      <IconCode class="w-3.5 h-3.5 inline-block mr-1 -mt-0.5" />
                      Custom HTML
                    </button>
                  </div>
                </div>

                <!-- Template Mode -->
                <template v-if="composeMode === 'template'">
                  <div>
                    <label class="label label-text text-sm font-medium">Email Template</label>
                    <select
                      v-model="templateState.name"
                      class="select select-sm w-full bg-base-200/60 border-0 rounded-xl"
                    >
                      <option value="" disabled>Select a template...</option>
                      <option v-for="t in availableTemplates" :key="t.name" :value="t.name">
                        {{ t.name }}
                      </option>
                    </select>
                    <p v-if="!availableTemplates.length" class="text-xs text-base-content/40 mt-1">
                      Loading templates...
                    </p>
                  </div>

                  <div v-if="templateState.name">
                    <label class="label label-text text-sm font-medium">Template Props (JSON)</label>
                    <textarea
                      v-model="templateState.propsJson"
                      class="textarea textarea-sm w-full text-sm font-mono bg-base-200/60 border-0 rounded-xl"
                      rows="6"
                      placeholder='{ "userName": "John", "confirmationUrl": "https://..." }'
                    />
                    <p v-if="templatePropsError" class="text-xs text-error mt-1">
                      {{ templatePropsError }}
                    </p>
                    <p v-else class="text-xs text-base-content/40 mt-1">
                      Available props depend on the selected template
                    </p>
                  </div>

                  <button
                    type="button"
                    class="btn btn-sm btn-ghost w-full"
                    :disabled="!templateState.name || parsedTemplateProps === null"
                    @click="handlePreview"
                  >
                    <IconEye class="w-4 h-4" />
                    Preview in New Tab
                  </button>
                </template>

                <!-- Custom HTML Mode -->
                <template v-if="composeMode === 'custom'">
                  <div>
                    <label class="label label-text text-sm font-medium">HTML Body</label>
                    <textarea
                      v-model="form.htmlBody"
                      class="textarea textarea-sm w-full text-sm font-mono bg-base-200/60 border-0 rounded-xl"
                      rows="10"
                      placeholder="<html><body>...</body></html>"
                    />
                    <p class="text-xs text-base-content/40 mt-1">Full HTML document with inline styles required</p>
                  </div>
                </template>

                <!-- Subject -->
                <div>
                  <label class="label label-text text-sm font-medium">Subject</label>
                  <input
                    v-model="form.subject"
                    type="text"
                    class="input input-sm w-full bg-base-200/60 border-0 rounded-xl"
                    placeholder="Email subject"
                  />
                </div>

                <button
                  type="submit"
                  class="btn btn-primary w-full"
                  :disabled="!canSend"
                >
                  <span v-if="isSending" class="loading loading-spinner loading-xs" />
                  <span v-else>Send Email</span>
                </button>

                <!-- Result -->
                <div v-if="result" class="rounded-xl bg-success/5 border border-success/20 p-3">
                  <p class="text-sm text-success font-medium">Delivered successfully</p>
                  <p class="text-xs text-base-content/60 mt-1">
                    Requested: {{ result.requested }} &middot; Resolved: {{ result.resolved }} &middot; Sent: {{ result.sent }} &middot; Skipped: {{ result.skipped }}
                  </p>
                </div>
              </form>
            </AdminCard>
          </div>

          <div class="space-y-6">
            <AdminCard title="About Email Delivery">
              <div class="space-y-2 text-sm text-base-content/60">
                <p>Send custom HTML emails to specific accounts or broadcast to all users.</p>
                <ul class="list-disc list-inside text-xs space-y-1 ml-2">
                  <li>Emails are delivered to verified email contacts</li>
                  <li>Accounts without verified contacts are skipped</li>
                  <li>Use templates for consistent branding or write custom HTML</li>
                  <li>For rate-limited batches, use Sending Plans instead of immediate send</li>
                </ul>
              </div>
            </AdminCard>
          </div>
        </div>
      </TabsContent>

      <!-- Export Tab -->
      <TabsContent value="export">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2">
            <AdminCard title="Export Email Contacts">
              <form class="space-y-4" @submit.prevent="handleExportEmails">
                <div>
                  <label class="label label-text text-sm font-medium">Target Mode</label>
                  <div class="flex gap-2 rounded-xl bg-base-200/70 p-1">
                    <button
                      type="button"
                      class="flex-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all"
                      :class="exportTargetMode === 'accounts' ? 'bg-base-100 text-primary shadow-sm' : 'text-base-content/50'"
                      @click="exportTargetMode = 'accounts'"
                    >
                      Specific Accounts
                    </button>
                    <button
                      type="button"
                      class="flex-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all"
                      :class="exportTargetMode === 'broadcast' ? 'bg-base-100 text-primary shadow-sm' : 'text-base-content/50'"
                      @click="exportTargetMode = 'broadcast'"
                    >
                      All Accounts
                    </button>
                  </div>
                </div>

                <div v-if="exportTargetMode === 'accounts'">
                  <label class="label label-text text-sm font-medium">Accounts</label>
                  <div v-if="exportSelectedAccounts.length" class="flex flex-wrap gap-1.5 mb-2">
                    <span
                      v-for="acc in exportSelectedAccounts"
                      :key="acc.id"
                      class="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-primary/10 text-primary"
                    >
                      {{ acc.nick || acc.name }}
                      <button type="button" class="hover:text-error" @click="removeExportAccount(acc.id)">
                        <IconX class="w-3 h-3" />
                      </button>
                    </span>
                  </div>
                  <button
                    type="button"
                    class="btn btn-sm btn-outline w-full"
                    @click="openExportAccountPicker"
                  >
                    <IconUsers class="w-4 h-4" />
                    {{ exportSelectedAccounts.length ? 'Add More Accounts' : 'Select Accounts' }}
                  </button>
                </div>

                <button
                  type="submit"
                  class="btn btn-primary w-full"
                  :disabled="isExporting || (exportTargetMode === 'accounts' && !exportSelectedAccounts.length)"
                >
                  <span v-if="isExporting" class="loading loading-spinner loading-xs" />
                  <template v-else>
                    <IconDownload class="w-4 h-4" />
                    Download CSV
                  </template>
                </button>
              </form>
            </AdminCard>
          </div>
          <div>
            <AdminCard title="CSV Format">
              <div class="space-y-2 text-sm text-base-content/60">
                <p>Exports primary (or first) email contact per account as UTF-8 CSV with BOM.</p>
                <pre class="text-xs bg-base-200/60 rounded-xl p-3 font-mono overflow-x-auto">EmailAddr,UserName
test1@abc.com,张三
test2@abc.com,李四</pre>
                <ul class="list-disc list-inside text-xs space-y-1 ml-2">
                  <li><code class="text-xs">UserName</code> uses nick, then name</li>
                  <li>Requires <code class="text-xs">emails.send</code> permission</li>
                </ul>
              </div>
            </AdminCard>
          </div>
        </div>
      </TabsContent>

      <!-- Observability Tab (OTEL guidance) -->
      <TabsContent value="observability">
        <div class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="card bg-base-100 shadow-sm">
              <div class="card-body p-4">
                <p class="text-xs text-base-content/60">Enqueue</p>
                <p class="text-sm font-mono font-semibold mt-1 break-all">ring.emails.enqueue_requests</p>
                <p class="text-[10px] text-base-content/40 mt-1">Queued via gRPC / NATS</p>
              </div>
            </div>
            <div class="card bg-base-100 shadow-sm">
              <div class="card-body p-4">
                <p class="text-xs text-base-content/60">SMTP Attempts</p>
                <p class="text-sm font-mono font-semibold mt-1 break-all">ring.emails.delivery_attempts</p>
                <p class="text-[10px] text-base-content/40 mt-1">source=queue|sending_plan|direct</p>
              </div>
            </div>
            <div class="card bg-base-100 shadow-sm">
              <div class="card-body p-4">
                <p class="text-xs text-base-content/60">SMTP Results</p>
                <p class="text-sm font-mono font-semibold mt-1 break-all">ring.emails.delivery_results</p>
                <p class="text-[10px] text-base-content/40 mt-1">outcome=success|failure</p>
              </div>
            </div>
            <div class="card bg-base-100 shadow-sm">
              <div class="card-body p-4">
                <p class="text-xs text-base-content/60">Latency</p>
                <p class="text-sm font-mono font-semibold mt-1 break-all">ring.emails.delivery_duration_ms</p>
                <p class="text-[10px] text-base-content/40 mt-1">p50 / p95 / p99 via OTEL</p>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AdminCard title="Success Rate">
              <p class="text-sm text-base-content/60 mb-3">
                SMTP submission success rate (not mailbox delivery):
              </p>
              <pre class="text-xs bg-base-200/60 rounded-xl p-3 font-mono overflow-x-auto whitespace-pre-wrap">{{ emailSuccessRateFormula }}</pre>
              <p class="text-xs text-base-content/40 mt-3">
                Break down by <code class="text-xs">source</code> to separate queue transactional mail from sending plans.
                Do not use gRPC 200 OK or enqueue volume as the success denominator.
              </p>
            </AdminCard>

            <AdminCard title="Suggested Dashboards">
              <ul class="space-y-2 text-sm text-base-content/60">
                <li class="flex gap-2"><span class="text-primary font-semibold">1.</span> Queued email requests per minute</li>
                <li class="flex gap-2"><span class="text-primary font-semibold">2.</span> SMTP attempts and outcomes per minute</li>
                <li class="flex gap-2"><span class="text-primary font-semibold">3.</span> SMTP success rate by source</li>
                <li class="flex gap-2"><span class="text-primary font-semibold">4.</span> p50 / p95 / p99 SMTP delivery duration</li>
                <li class="flex gap-2"><span class="text-primary font-semibold">5.</span> Sending-plan failures vs skipped recipients</li>
                <li class="flex gap-2"><span class="text-primary font-semibold">6.</span> Enqueue rate vs SMTP attempt rate (stalled consumers)</li>
              </ul>
            </AdminCard>
          </div>

          <AdminCard title="Operational Notes">
            <div class="space-y-2 text-sm text-base-content/60">
              <p>
                Ring exports activity source <code class="text-xs">DysonNetwork.Ring.Email</code> and meter
                <code class="text-xs">DysonNetwork.Ring.Email</code> through OTLP when
                <code class="text-xs">OTEL_EXPORTER_OTLP_ENDPOINT</code> is set.
              </p>
              <p>
                Spans use <code class="text-xs">emails.deliver.smtp</code> with tags
                <code class="text-xs">email.source</code> and <code class="text-xs">email.provider=smtp</code>.
                Addresses, subjects, bodies, account IDs, and credentials are excluded from telemetry.
              </p>
              <p class="text-warning/80">
                SMTP success only means the configured SMTP server accepted the message. Provider bounces,
                spam filtering, and mailbox delivery require provider webhooks and are not counted here.
              </p>
            </div>
          </AdminCard>
        </div>
      </TabsContent>

      <!-- Plans Tab: Scheduled Sending -->
      <TabsContent value="plans">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-3">
            <select
              v-model="planFilter.status"
              class="select select-sm w-36 bg-base-200/60 border-0 rounded-xl"
              @change="reloadPlans"
            >
              <option :value="undefined">All Status</option>
              <option :value="0">Scheduled</option>
              <option :value="1">Paused</option>
              <option :value="2">Completed</option>
            </select>
          </div>
          <button class="btn btn-sm btn-primary" @click="planDrawerOpen = true">
            <IconPlus class="w-3.5 h-3.5" />
            Create Plan
          </button>
        </div>

        <!-- Loading -->
        <div v-if="plansLoading" class="flex justify-center py-16">
          <span class="loading loading-spinner loading-lg" />
        </div>

        <!-- Plans List -->
        <AdminCard v-else no-padding>
          <div class="overflow-x-auto">
            <table class="table table-sm table-zebra">
              <thead>
                <tr class="text-xs text-base-content/50 uppercase tracking-wider">
                  <th class="pl-5">Key / Subject</th>
                  <th>Status</th>
                  <th>Progress</th>
                  <th>Schedule</th>
                  <th class="pr-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="plans.length === 0">
                  <td colspan="5" class="text-center py-12 text-base-content/40 text-sm">
                    No email plans yet. Create one to get started.
                  </td>
                </tr>
                <tr
                  v-for="plan in plans"
                  :key="plan.id"
                  class="hover:bg-base-200/50 transition-colors"
                >
                  <td class="pl-5">
                    <p class="text-sm font-medium truncate max-w-[220px]">{{ plan.subject }}</p>
                    <p v-if="plan.sendingPlanKey" class="text-xs text-base-content/40 font-mono">
                      {{ plan.sendingPlanKey }}
                    </p>
                  </td>
                  <td>
                    <span class="badge badge-xs" :class="planStatusClass(plan.status)">
                      {{ planStatusLabel(plan.status) }}
                    </span>
                  </td>
                  <td>
                    <div class="flex items-center gap-1.5 text-xs">
                      <span class="text-base-content/70">R: {{ plan.recipientCount }}</span>
                      <span v-if="plan.counts.sent" class="text-success">{{ plan.counts.sent }}</span>
                      <span v-if="plan.counts.skipped" class="text-warning">{{ plan.counts.skipped }}</span>
                      <span v-if="plan.counts.failed" class="text-error">{{ plan.counts.failed }}</span>
                      <span class="text-base-content/40">/ {{ plan.counts.total }}</span>
                    </div>
                    <!-- Progress bar -->
                    <div class="mt-1 w-full h-1 bg-base-200 rounded-full overflow-hidden">
                      <div
                        class="h-full rounded-full transition-all"
                        :class="planStatusBarClass(plan)"
                        :style="{ width: planProgressPercent(plan) + '%' }"
                      />
                    </div>
                  </td>
                  <td>
                    <div class="text-xs text-base-content/60">
                      <p v-if="plan.plannedStartAt">
                        Start: {{ formatDate(plan.plannedStartAt) }}
                      </p>
                      <p v-if="plan.nextIntervalAt">
                        Next: {{ formatDate(plan.nextIntervalAt) }}
                      </p>
                      <p class="text-base-content/40">
                        {{ plan.maxEmailsPerInterval }} / {{ plan.intervalMinutes }}m &middot;
                        {{ plan.maxEmailsPerDay }}/day
                      </p>
                    </div>
                  </td>
                  <td class="pr-5 text-right">
                    <div class="flex items-center justify-end gap-1">
                      <button
                        v-if="plan.status === 0"
                        class="btn btn-ghost btn-xs text-warning"
                        title="Pause"
                        @click="handlePausePlan(plan.id)"
                      >
                        <IconPause class="w-3.5 h-3.5" />
                      </button>
                      <button
                        v-if="plan.status === 1"
                        class="btn btn-ghost btn-xs text-success"
                        title="Resume"
                        @click="handleResumePlan(plan.id)"
                      >
                        <IconPlay class="w-3.5 h-3.5" />
                      </button>
                      <button
                        v-if="plan.status !== 2"
                        class="btn btn-ghost btn-xs"
                        title="Advance one interval"
                        @click="handleAdvancePlan(plan.id)"
                      >
                        <IconSkipForward class="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div
            v-if="planTotal > 0"
            class="flex items-center justify-between px-5 py-3 border-t border-base-300/20"
          >
            <span class="text-xs text-base-content/40">
              Showing {{ planOffset + 1 }}–{{ Math.min(planOffset + planPageSize, planTotal) }} of {{ planTotal }}
            </span>
            <div class="flex gap-1">
              <button
                class="btn btn-ghost btn-xs"
                :disabled="planOffset === 0"
                @click="planOffset = Math.max(0, planOffset - planPageSize); loadPlans()"
              >
                <IconChevronLeft class="w-3.5 h-3.5" />
              </button>
              <button
                class="btn btn-ghost btn-xs"
                :disabled="planOffset + planPageSize >= planTotal"
                @click="planOffset += planPageSize; loadPlans()"
              >
                <IconChevronRight class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </AdminCard>
      </TabsContent>
    </TabsRoot>

    <!-- Account Picker Drawer -->
    <AccountPickerDrawer
      :open="pickerOpen"
      :allow-multiple="true"
      title="Select Target Accounts"
      placeholder="Search by name or nick..."
      @select="picker.handleSelect"
      @update:open="pickerOpen = $event"
    />

    <!-- Create Plan Drawer -->
    <AdminDrawer
      :open="planDrawerOpen"
      title="Create Sending Plan"
      @update:open="planDrawerOpen = $event"
    >
      <form class="space-y-4" @submit.prevent="handleCreatePlan">
        <!-- Targeting -->
        <div>
          <label class="label label-text text-sm font-medium">Target Mode</label>
          <div class="flex gap-2 rounded-xl bg-base-200/70 p-1">
            <button
              type="button"
              class="flex-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all"
              :class="planTargetMode === 'accounts' ? 'bg-base-100 text-primary shadow-sm' : 'text-base-content/50'"
              @click="planTargetMode = 'accounts'"
            >
              Specific Accounts
            </button>
            <button
              type="button"
              class="flex-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all"
              :class="planTargetMode === 'broadcast' ? 'bg-base-100 text-primary shadow-sm' : 'text-base-content/50'"
              @click="planTargetMode = 'broadcast'"
            >
              Broadcast All
            </button>
          </div>
        </div>

        <div v-if="planTargetMode === 'accounts'">
          <label class="label label-text text-sm font-medium">Target Accounts</label>
          <div v-if="planSelectedAccounts.length" class="flex flex-wrap gap-1.5 mb-2">
            <span
              v-for="acc in planSelectedAccounts"
              :key="acc.id"
              class="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-primary/10 text-primary"
            >
              {{ acc.nick || acc.name }}
              <button class="hover:text-error" @click="removePlanSelectedAccount(acc.id)">
                <IconX class="w-3 h-3" />
              </button>
            </span>
          </div>
          <button
            type="button"
            class="btn btn-sm btn-outline w-full"
            @click="openPlanAccountPicker"
          >
            <IconUsers class="w-4 h-4" />
            {{ planSelectedAccounts.length ? 'Add More Accounts' : 'Select Accounts' }}
          </button>
        </div>

        <!-- Compose Mode -->
        <div>
          <label class="label label-text text-sm font-medium">Compose Mode</label>
          <div class="flex gap-2 rounded-xl bg-base-200/70 p-1">
            <button
              type="button"
              class="flex-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all"
              :class="planComposeMode === 'template' ? 'bg-base-100 text-primary shadow-sm' : 'text-base-content/50'"
              @click="planComposeMode = 'template'"
            >
              <IconLayoutTemplate class="w-3.5 h-3.5 inline-block mr-1 -mt-0.5" />
              Template
            </button>
            <button
              type="button"
              class="flex-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all"
              :class="planComposeMode === 'custom' ? 'bg-base-100 text-primary shadow-sm' : 'text-base-content/50'"
              @click="planComposeMode = 'custom'"
            >
              <IconCode class="w-3.5 h-3.5 inline-block mr-1 -mt-0.5" />
              Custom HTML
            </button>
          </div>
        </div>

        <!-- Template Mode (Plan) -->
        <template v-if="planComposeMode === 'template'">
          <div>
            <label class="label label-text text-sm font-medium">Email Template</label>
            <select
              v-model="planTemplateState.name"
              class="select select-sm w-full bg-base-200/60 border-0 rounded-xl"
            >
              <option value="" disabled>Select a template...</option>
              <option v-for="t in availableTemplates" :key="t.name" :value="t.name">
                {{ t.name }}
              </option>
            </select>
          </div>
          <div v-if="planTemplateState.name">
            <label class="label label-text text-sm font-medium">Template Props (JSON)</label>
            <textarea
              v-model="planTemplateState.propsJson"
              class="textarea textarea-sm w-full text-sm font-mono bg-base-200/60 border-0 rounded-xl"
              rows="5"
              placeholder='{ "userName": "John" }'
            />
          </div>
        </template>

        <!-- Custom HTML Mode (Plan) -->
        <template v-if="planComposeMode === 'custom'">
          <div>
            <label class="label label-text text-sm font-medium">HTML Body</label>
            <textarea
              v-model="planForm.htmlBody"
              class="textarea textarea-sm w-full text-sm font-mono bg-base-200/60 border-0 rounded-xl"
              rows="8"
              placeholder="<html><body>...</body></html>"
            />
          </div>
        </template>

        <div>
          <label class="label label-text text-sm font-medium">Subject</label>
          <input
            v-model="planForm.subject"
            type="text"
            class="input input-sm w-full bg-base-200/60 border-0 rounded-xl"
            placeholder="Email subject"
          />
        </div>

        <div>
          <label class="label label-text text-sm font-medium">Sending Plan Key</label>
          <input
            v-model="planForm.sendingPlanKey"
            type="text"
            class="input input-sm w-full bg-base-200/60 border-0 rounded-xl"
            placeholder="Optional campaign key (e.g. summer-2026)"
          />
        </div>

        <!-- Scheduling -->
        <fieldset class="rounded-xl border border-base-300/30 p-4 space-y-3">
          <legend class="text-xs font-semibold text-base-content/60 px-1">Scheduling</legend>

          <div>
            <label class="label label-text text-sm font-medium">Planned Start At</label>
            <input
              v-model="planForm.plannedStartAt"
              type="datetime-local"
              class="input input-sm w-full bg-base-200/60 border-0 rounded-xl"
            />
          </div>

          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="label label-text text-xs font-medium">Emails / Interval</label>
              <input
                v-model.number="planForm.maxEmailsPerInterval"
                type="number"
                min="1"
                class="input input-sm w-full bg-base-200/60 border-0 rounded-xl"
              />
            </div>
            <div>
              <label class="label label-text text-xs font-medium">Interval (min)</label>
              <input
                v-model.number="planForm.intervalMinutes"
                type="number"
                min="1"
                class="input input-sm w-full bg-base-200/60 border-0 rounded-xl"
              />
            </div>
            <div>
              <label class="label label-text text-xs font-medium">Daily Limit</label>
              <input
                v-model.number="planForm.maxEmailsPerDay"
                type="number"
                min="1"
                class="input input-sm w-full bg-base-200/60 border-0 rounded-xl"
              />
            </div>
          </div>
        </fieldset>

        <div class="flex gap-2 pt-2">
          <button
            type="button"
            class="btn btn-ghost btn-sm flex-1"
            @click="planDrawerOpen = false"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="btn btn-primary btn-sm flex-1"
            :disabled="!canCreatePlan || planCreating"
          >
            <span v-if="planCreating" class="loading loading-spinner loading-xs" />
            <span v-else>Create Plan</span>
          </button>
        </div>
      </form>
    </AdminDrawer>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  IconUsers,
  IconX,
  IconEye,
  IconCode,
  IconLayoutTemplate,
  IconSend,
  IconCalendarClock,
  IconPlus,
  IconChevronLeft,
  IconChevronRight,
  IconPause,
  IconPlay,
  IconSkipForward,
  IconDownload,
  IconActivity,
} from '#components'
import {
  TabsRoot,
  TabsList,
  TabsTrigger,
  TabsContent,
} from 'reka-ui'
import {
  sendAdminEmails,
  exportAccountEmailsCsv,
  createEmailPlan,
  fetchEmailPlans,
  pauseEmailPlan,
  resumeEmailPlan,
  advanceEmailPlan,
} from '~/utils/admin'
import { useAccountPicker } from '~/composables/useAccountPicker'
import AccountPickerDrawer from '~/components/shared/AccountPickerDrawer.vue'
import type { BulkDeliveryResult, EmailPayload, EmailPlan, EmailPlanCreatePayload } from '~/types/admin'
import type { SnAccount } from '~/types/auth'

definePageMeta({ middleware: 'auth' })

// ============ Tab State ============
const activeTab = ref('compose')
const emailSuccessRateFormula = `delivery_results{outcome="success"} /
(delivery_results{outcome="success"} + delivery_results{outcome="failure"})`

// ============ Compose State ============
const isSending = ref(false)
const targetMode = ref<'accounts' | 'broadcast'>('accounts')
const composeMode = ref<'template' | 'custom'>('template')
const result = ref<BulkDeliveryResult | null>(null)
const selectedAccounts = ref<SnAccount[]>([])
const availableTemplates = ref<{ name: string; path: string }[]>([])
const templatePropsError = ref('')

// Export
const isExporting = ref(false)
const exportTargetMode = ref<'accounts' | 'broadcast'>('accounts')
const exportSelectedAccounts = ref<SnAccount[]>([])

const picker = useAccountPicker()
const pickerOpen = computed({
  get: () => picker.isOpen.value,
  set: (val: boolean) => { picker.isOpen.value = val },
})

const form = ref({
  subject: '',
  htmlBody: '',
})

const templateState = ref({
  name: '',
  propsJson: '{}',
})

const parsedTemplateProps = computed(() => {
  try {
    const parsed = JSON.parse(templateState.value.propsJson)
    templatePropsError.value = ''
    return parsed
  } catch (e) {
    templatePropsError.value = `Invalid JSON: ${(e as Error).message}`
    return null
  }
})

const canSend = computed(() => {
  if (!form.value.subject) return false
  if (isSending.value) return false

  if (composeMode.value === 'template') {
    if (!templateState.value.name) return false
    if (parsedTemplateProps.value === null) return false
    return true
  }

  return !!form.value.htmlBody
})

// ============ Plans State ============
const plans = ref<EmailPlan[]>([])
const plansLoading = ref(false)
const planTotal = ref(0)
const planOffset = ref(0)
const planPageSize = 50
const planFilter = ref<{ status?: number }>({ status: undefined })
const planDrawerOpen = ref(false)
const planCreating = ref(false)

const planTargetMode = ref<'accounts' | 'broadcast'>('accounts')
const planComposeMode = ref<'template' | 'custom'>('template')
const planSelectedAccounts = ref<SnAccount[]>([])

const planForm = ref({
  subject: '',
  htmlBody: '',
  sendingPlanKey: '',
  plannedStartAt: '',
  maxEmailsPerInterval: 200,
  intervalMinutes: 30,
  maxEmailsPerDay: 2000,
})

const planTemplateState = ref({
  name: '',
  propsJson: '{}',
})

const planParsedTemplateProps = computed(() => {
  try {
    return JSON.parse(planTemplateState.value.propsJson)
  } catch {
    return null
  }
})

const canCreatePlan = computed(() => {
  if (!planForm.value.subject) return false
  if (planCreating.value) return false

  if (planComposeMode.value === 'template') {
    if (!planTemplateState.value.name) return false
    if (planParsedTemplateProps.value === null) return false
    return true
  }

  return !!planForm.value.htmlBody
})

// ============ Lifecycle ============
onMounted(async () => {
  try {
    const res = await $fetch<{ templates: { name: string; path: string }[] }>('/api/email-templates')
    availableTemplates.value = res.templates
  } catch {
    // Silently fail
  }
})

// ============ Compose Methods ============
async function openAccountPicker() {
  const accounts = await picker.open({ allowMultiple: true, title: 'Select Target Accounts' })
  if (accounts && Array.isArray(accounts)) {
    for (const acc of accounts) {
      if (!selectedAccounts.value.find(a => a.id === acc.id)) {
        selectedAccounts.value.push(acc)
      }
    }
  }
}

function removeSelectedAccount(id: string) {
  selectedAccounts.value = selectedAccounts.value.filter(a => a.id !== id)
}

async function openExportAccountPicker() {
  const accounts = await picker.open({ allowMultiple: true, title: 'Select Accounts to Export' })
  if (accounts && Array.isArray(accounts)) {
    for (const acc of accounts) {
      if (!exportSelectedAccounts.value.find(a => a.id === acc.id)) {
        exportSelectedAccounts.value.push(acc)
      }
    }
  }
}

function removeExportAccount(id: string) {
  exportSelectedAccounts.value = exportSelectedAccounts.value.filter(a => a.id !== id)
}

async function handleExportEmails() {
  isExporting.value = true
  try {
    const blob = await exportAccountEmailsCsv({
      broadcastToAll: exportTargetMode.value === 'broadcast',
      accountIds: exportTargetMode.value === 'accounts'
        ? exportSelectedAccounts.value.map(a => a.id)
        : undefined,
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `account-email-contacts-${new Date().toISOString().slice(0, 19).replace(/[-:T]/g, '')}.csv`
    a.click()
    URL.revokeObjectURL(url)
    useNuxtApp().$toast.success('Email contacts exported')
  } catch {
    useNuxtApp().$toast.error('Failed to export email contacts')
  } finally {
    isExporting.value = false
  }
}

function handlePreview() {
  if (!templateState.value.name || parsedTemplateProps.value === null) return

  const params = new URLSearchParams({
    name: templateState.value.name,
    ...Object.fromEntries(
      Object.entries(parsedTemplateProps.value).map(([k, v]) => [k, typeof v === 'object' ? JSON.stringify(v) : String(v)]),
    ),
  })

  window.open(`/api/emails/debug?${params.toString()}`, '_blank')
}

async function handleSendEmail() {
  isSending.value = true
  result.value = null

  const accountIds = targetMode.value === 'accounts'
    ? selectedAccounts.value.map(a => a.id)
    : undefined

  let htmlBody = form.value.htmlBody

  if (composeMode.value === 'template' && templateState.value.name) {
    try {
      const res = await $fetch<{ html: string }>('/api/email-templates/render', {
        method: 'POST',
        body: {
          name: templateState.value.name,
          props: parsedTemplateProps.value ?? {},
          pretty: false,
        },
      })
      htmlBody = res.html
    } catch {
      useNuxtApp().$toast.error('Failed to render email template')
      isSending.value = false
      return
    }
  }

  const payload: EmailPayload = {
    subject: form.value.subject,
    htmlBody,
    broadcastToAll: targetMode.value === 'broadcast',
    accountIds: targetMode.value === 'accounts' ? accountIds : undefined,
  }

  try {
    result.value = await sendAdminEmails(payload)
    if (result.value.sent > 0) {
      selectedAccounts.value = []
    }
  } catch {
    useNuxtApp().$toast.error('Failed to send emails')
  } finally {
    isSending.value = false
  }
}

// ============ Plans Methods ============
async function loadPlans() {
  plansLoading.value = true
  try {
    const result = await fetchEmailPlans({
      take: planPageSize,
      offset: planOffset.value,
      status: planFilter.value.status,
    })
    plans.value = result.plans
    planTotal.value = result.total
  } catch {
    useNuxtApp().$toast.error('Failed to load email plans')
  } finally {
    plansLoading.value = false
  }
}

function reloadPlans() {
  planOffset.value = 0
  loadPlans()
}

function planStatusLabel(status: number): string {
  switch (status) {
    case 0: return 'Scheduled'
    case 1: return 'Paused'
    case 2: return 'Completed'
    default: return 'Unknown'
  }
}

function planStatusClass(status: number): string {
  switch (status) {
    case 0: return 'badge-success'
    case 1: return 'badge-warning'
    case 2: return 'badge-ghost'
    default: return 'badge-outline'
  }
}

function planStatusBarClass(plan: EmailPlan): string {
  if (plan.status === 1) return 'bg-warning'
  if (plan.counts.failed > 0) return 'bg-error'
  return 'bg-success'
}

function planProgressPercent(plan: EmailPlan): number {
  if (!plan.counts.total) return 0
  const done = plan.counts.sent + plan.counts.skipped + plan.counts.failed
  return Math.round((done / plan.counts.total) * 100)
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleString()
  } catch {
    return dateStr
  }
}

async function openPlanAccountPicker() {
  const accounts = await picker.open({ allowMultiple: true, title: 'Select Target Accounts' })
  if (accounts && Array.isArray(accounts)) {
    for (const acc of accounts) {
      if (!planSelectedAccounts.value.find(a => a.id === acc.id)) {
        planSelectedAccounts.value.push(acc)
      }
    }
  }
}

function removePlanSelectedAccount(id: string) {
  planSelectedAccounts.value = planSelectedAccounts.value.filter(a => a.id !== id)
}

async function handleCreatePlan() {
  planCreating.value = true

  let htmlBody = planForm.value.htmlBody

  if (planComposeMode.value === 'template' && planTemplateState.value.name) {
    try {
      const res = await $fetch<{ html: string }>('/api/email-templates/render', {
        method: 'POST',
        body: {
          name: planTemplateState.value.name,
          props: planParsedTemplateProps.value ?? {},
          pretty: false,
        },
      })
      htmlBody = res.html
    } catch {
      useNuxtApp().$toast.error('Failed to render email template')
      planCreating.value = false
      return
    }
  }

  const payload: EmailPlanCreatePayload = {
    subject: planForm.value.subject,
    htmlBody,
    broadcastToAll: planTargetMode.value === 'broadcast',
    accountIds: planTargetMode.value === 'accounts'
      ? planSelectedAccounts.value.map(a => a.id)
      : undefined,
    sendingPlanKey: planForm.value.sendingPlanKey || undefined,
    plannedStartAt: planForm.value.plannedStartAt ? new Date(planForm.value.plannedStartAt).toISOString() : undefined,
    maxEmailsPerInterval: planForm.value.maxEmailsPerInterval || undefined,
    intervalMinutes: planForm.value.intervalMinutes || undefined,
    maxEmailsPerDay: planForm.value.maxEmailsPerDay || undefined,
  }

  try {
    await createEmailPlan(payload)
    useNuxtApp().$toast.success('Email plan created')
    planDrawerOpen.value = false
    resetPlanForm()
    reloadPlans()
  } catch {
    useNuxtApp().$toast.error('Failed to create email plan')
  } finally {
    planCreating.value = false
  }
}

function resetPlanForm() {
  planForm.value = {
    subject: '',
    htmlBody: '',
    sendingPlanKey: '',
    plannedStartAt: '',
    maxEmailsPerInterval: 200,
    intervalMinutes: 30,
    maxEmailsPerDay: 2000,
  }
  planTemplateState.value = { name: '', propsJson: '{}' }
  planSelectedAccounts.value = []
  planTargetMode.value = 'accounts'
  planComposeMode.value = 'template'
}

async function handlePausePlan(planId: string) {
  try {
    await pauseEmailPlan(planId)
    useNuxtApp().$toast.success('Plan paused')
    loadPlans()
  } catch {
    useNuxtApp().$toast.error('Failed to pause plan')
  }
}

async function handleResumePlan(planId: string) {
  try {
    await resumeEmailPlan(planId)
    useNuxtApp().$toast.success('Plan resumed')
    loadPlans()
  } catch {
    useNuxtApp().$toast.error('Failed to resume plan')
  }
}

async function handleAdvancePlan(planId: string) {
  try {
    await advanceEmailPlan(planId)
    useNuxtApp().$toast.success('Plan advanced')
    loadPlans()
  } catch {
    useNuxtApp().$toast.error('Failed to advance plan')
  }
}
</script>
