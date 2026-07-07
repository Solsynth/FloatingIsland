<template>
  <NuxtLayout name="admin">
    <div v-if="isLoadingDetail" class="flex justify-center py-16">
      <span class="loading loading-spinner loading-lg" />
    </div>

    <template v-else-if="detail">
      <div class="flex items-center gap-3 mb-6">
        <NuxtLink to="/admin/accounts" class="btn btn-circle btn-ghost btn-sm">
          <IconArrowLeft class="w-4 h-4" />
        </NuxtLink>
        <div class="avatar">
          <div class="w-10 rounded-full">
            <img
              v-if="getFileUrl(detail.account.profile?.picture?.id)"
              :src="getFileUrl(detail.account.profile?.picture?.id)"
              :alt="detail.account.nick"
            />
            <div
              v-else
              class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold"
            >
              {{ (detail.account.nick || detail.account.name).slice(0, 2).toUpperCase() }}
            </div>
          </div>
        </div>
        <div class="min-w-0 flex-1">
          <h1 class="text-xl font-bold tracking-tight">{{ detail.account.nick || detail.account.name }}</h1>
          <p class="text-sm text-base-content/50">@{{ detail.account.name }}</p>
        </div>
        <div v-if="detail.status" class="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-base-200/80">
          <span class="inline-block w-2 h-2 rounded-full" :class="detail.status.isOnline ? 'bg-success' : 'bg-base-300'" />
          <span class="text-xs font-medium text-base-content/60">{{ detail.status.label }}</span>
        </div>
      </div>

      <div v-if="detail.activePunishment" class="rounded-xl bg-error/5 border border-error/20 p-4 mb-6">
        <div class="flex items-start gap-3">
          <IconShieldAlert class="w-5 h-5 text-error shrink-0 mt-0.5" />
          <div class="min-w-0">
            <p class="text-sm font-semibold text-error">Active Punishment</p>
            <p class="text-xs text-base-content/60 mt-0.5">{{ detail.activePunishment.reason || 'No reason provided' }}</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-6">
          <!-- Account Info -->
          <AdminCard title="Account Information">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span class="text-xs text-base-content/40 uppercase tracking-wider">Account ID</span>
                <p class="font-mono text-xs mt-1 break-all text-base-content/70">{{ detail.account.id }}</p>
              </div>
              <div>
                <span class="text-xs text-base-content/40 uppercase tracking-wider">Username</span>
                <p class="mt-1 text-base-content/70">@{{ detail.account.name }}</p>
              </div>
              <div v-if="detail.account.profile?.socialCredits !== undefined">
                <span class="text-xs text-base-content/40 uppercase tracking-wider">Social Credits</span>
                <p class="mt-1 text-base-content/70">{{ detail.account.profile?.socialCredits }}</p>
              </div>
              <div v-if="detail.account.createdAt">
                <span class="text-xs text-base-content/40 uppercase tracking-wider">Created</span>
                <p class="mt-1 text-base-content/70">{{ formatDate(detail.account.createdAt) }}</p>
              </div>
            </div>
          </AdminCard>

          <!-- Verification -->
          <AdminCard title="Verification">
            <div class="space-y-3">
              <div v-if="detail.account.profile?.verified" class="flex items-center justify-between p-3 rounded-lg bg-success/5 border border-success/20">
                <div class="flex items-center gap-2">
                  <IconBadgeCheck class="w-4 h-4 text-success" />
                  <div>
                    <p class="text-sm font-medium">{{ detail.account.profile.verified.title || 'Verified' }}</p>
                    <p v-if="detail.account.profile.verified.description" class="text-xs text-base-content/50">{{ detail.account.profile.verified.description }}</p>
                  </div>
                </div>
                <button class="btn btn-ghost btn-xs text-error" @click="clearVerify">Clear</button>
              </div>
              <p v-else class="text-sm text-base-content/40">Not verified</p>
              <button class="btn btn-ghost btn-xs" @click="verifyOpen = true">Set Verification</button>
            </div>
          </AdminCard>

          <!-- Contacts -->
          <AdminCard title="Contact Methods">
            <template #actions>
              <button class="btn btn-ghost btn-xs" @click="contactEdit = null; contactForm = { type: 0, content: '' }; contactDrawerOpen = true">
                <IconPlus class="w-3.5 h-3.5" /> Add
              </button>
            </template>
            <div v-if="contacts.length" class="space-y-2">
              <div v-for="c in contacts" :key="c.id" class="flex items-center gap-3 p-2 rounded-lg bg-base-200/50">
                <span class="text-xs px-2 py-0.5 rounded-full bg-base-300/60 text-base-content/50 uppercase tracking-wider">
                  {{ contactTypeLabel(c.type) }}
                </span>
                <span class="text-sm flex-1 truncate">{{ c.content }}</span>
                <span v-if="c.isPrimary" class="badge badge-primary badge-xs">Primary</span>
                <span v-if="c.verifiedAt" class="badge badge-success badge-xs">Verified</span>
                <button v-if="!c.isPrimary" class="btn btn-ghost btn-xs" @click="doSetPrimaryContact(c.id)">Set Primary</button>
                <button v-if="!c.verifiedAt" class="btn btn-ghost btn-xs text-success" @click="doVerifyContact(c.id)">Verify</button>
                <button class="btn btn-ghost btn-xs" @click="editContact(c)">Edit</button>
                <button class="btn btn-ghost btn-xs text-error" @click="doDeleteContact(c.id)">Delete</button>
              </div>
            </div>
            <p v-else class="text-sm text-base-content/40">No contact methods</p>
          </AdminCard>

          <!-- Auth Factors -->
          <AdminCard title="Authentication Factors">
            <template #actions>
              <button class="btn btn-ghost btn-xs" @click="factorCreateOpen = true">
                <IconPlus class="w-3.5 h-3.5" /> Add
              </button>
            </template>
            <div v-if="factors.length" class="space-y-2">
              <div v-for="f in factors" :key="f.id" class="flex items-center gap-3 p-2 rounded-lg bg-base-200/50">
                <IconKeyRound class="w-4 h-4 text-base-content/40" />
                <span class="text-sm flex-1">{{ factorTypeLabel(f.type) }}</span>
                <span class="text-xs px-2 py-0.5 rounded-full" :class="f.hasSecret ? 'bg-success/10 text-success' : 'bg-base-300/60 text-base-content/40'">
                  {{ f.hasSecret ? 'Configured' : 'Pending' }}
                </span>
                <button v-if="!f.enabledAt" class="btn btn-ghost btn-xs text-success" @click="doEnableFactor(f.id)">Enable</button>
                <button v-if="f.enabledAt" class="btn btn-ghost btn-xs text-warning" @click="doDisableFactor(f.id)">Disable</button>
                <button class="btn btn-ghost btn-xs text-error" @click="doDeleteFactor(f.id)">Delete</button>
              </div>
            </div>
            <p v-else class="text-sm text-base-content/40">No auth factors</p>
            <div class="mt-3">
              <button class="btn btn-ghost btn-xs text-warning" @click="passwordResetOpen = true">Reset Password</button>
            </div>
          </AdminCard>

          <!-- Badges -->
          <AdminCard title="Badges">
            <template #actions>
              <button class="btn btn-ghost btn-xs" @click="badgeGrantOpen = true">
                <IconPlus class="w-3.5 h-3.5" /> Grant
              </button>
            </template>
            <div v-if="badges.length" class="space-y-2">
              <div v-for="b in badges" :key="b.id" class="flex items-center gap-3 p-2 rounded-lg bg-base-200/50">
                <span class="text-sm flex-1">{{ b.label || b.type }}</span>
                <span v-if="b.caption" class="text-xs text-base-content/40">{{ b.caption }}</span>
                <button class="btn btn-ghost btn-xs text-success" @click="doActivateBadge(b.id)">Activate</button>
                <button class="btn btn-ghost btn-xs text-error" @click="doRevokeBadge(b.id)">Revoke</button>
              </div>
            </div>
            <p v-else class="text-sm text-base-content/40">No badges</p>
          </AdminCard>

          <!-- Active Punishments -->
          <AdminCard v-if="detail.activePunishments?.length" title="Active Punishments">
            <div class="space-y-2">
              <div v-for="punishment in detail.activePunishments" :key="punishment.id" class="flex items-start gap-3 p-3 rounded-lg bg-error/5 border border-error/10">
                <IconBan class="w-4 h-4 text-error shrink-0 mt-0.5" />
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-medium">{{ punishmentTypeLabel(punishment.type) }}</span>
                    <button class="btn btn-ghost btn-xs text-error" @click="handleDeletePunishment(punishment.id)">
                      <IconTrash2 class="w-3 h-3" />
                    </button>
                  </div>
                  <p class="text-xs text-base-content/50 mt-0.5">{{ punishment.reason || 'No reason' }}</p>
                </div>
              </div>
            </div>
          </AdminCard>

          <!-- Activities -->
          <AdminCard v-if="detail.activities?.length" title="Presence Activities">
            <div class="space-y-2">
              <div v-for="(activity, ai) in detail.activities" :key="ai" class="flex items-center gap-3 p-2 rounded-lg bg-base-200/50">
                <IconGamepad2 class="w-4 h-4 text-base-content/40" />
                <span class="text-sm flex-1">{{ activity.title }}</span>
                <span class="text-xs text-base-content/40 capitalize">{{ activity.provider }}</span>
              </div>
            </div>
          </AdminCard>

          <!-- Devices -->
          <AdminCard title="Devices">
            <template #actions>
              <button class="btn btn-ghost btn-xs" @click="loadDevices">
                <IconRefreshCw class="w-3.5 h-3.5" /> Refresh
              </button>
            </template>
            <div v-if="devicesLoading" class="flex justify-center py-4">
              <span class="loading loading-spinner loading-sm" />
            </div>
            <div v-else-if="devices.length" class="space-y-2">
              <div
                v-for="device in devices"
                :key="device.id"
                class="p-3 rounded-lg bg-base-200/50 space-y-2"
              >
                <div class="flex items-center gap-2">
                  <IconMonitor class="w-4 h-4 text-base-content/40" />
                  <span class="text-sm font-medium flex-1 truncate">{{ device.label || 'Unnamed Device' }}</span>
                  <span v-if="device.lastActiveAt" class="text-xs text-base-content/40">{{ formatTimeAgo(device.lastActiveAt) }}</span>
                </div>
                <div class="flex items-center gap-2 text-xs text-base-content/50 pl-6">
                  <span class="font-mono truncate">{{ device.clientId?.slice(0, 16) || device.id.slice(0, 16) }}...</span>
                </div>
                <div class="flex items-center gap-1.5 pl-6">
                  <button class="btn btn-ghost btn-xs" @click="editDeviceLabel(device)">
                    <IconPencil class="w-3 h-3" /> Rename
                  </button>
                  <button class="btn btn-ghost btn-xs text-warning" @click="revokeDevice(device)">
                    <IconLogOut class="w-3 h-3" /> Revoke Sessions
                  </button>
                  <button class="btn btn-ghost btn-xs text-error" @click="deleteDevice(device)">
                    <IconTrash2 class="w-3 h-3" /> Remove
                  </button>
                </div>
                <div v-if="device.sessions?.length" class="pl-6 space-y-1.5 mt-1">
                  <div
                    v-for="session in device.sessions"
                    :key="session.id"
                    class="flex items-center gap-2 text-xs p-1.5 rounded bg-base-100/50"
                  >
                    <span class="inline-block w-1.5 h-1.5 rounded-full" :class="session.expiredAt ? 'bg-base-300' : 'bg-success'" />
                    <span class="text-base-content/60">{{ session.ipAddress || 'Unknown IP' }}</span>
                    <span class="text-base-content/40 truncate flex-1">{{ session.userAgent?.slice(0, 40) || 'Unknown' }}</span>
                    <span class="text-base-content/30">{{ session.type === 0 ? 'Login' : session.type === 1 ? 'OAuth' : 'OIDC' }}</span>
                  </div>
                </div>
              </div>
            </div>
            <p v-else class="text-sm text-base-content/40">No devices found</p>
          </AdminCard>

          <!-- Sessions -->
          <AdminCard title="Sessions">
            <template #actions>
              <button class="btn btn-ghost btn-xs" @click="loadSessions">
                <IconRefreshCw class="w-3.5 h-3.5" /> Refresh
              </button>
            </template>
            <div v-if="sessionsLoading" class="flex justify-center py-4">
              <span class="loading loading-spinner loading-sm" />
            </div>
            <div v-else-if="sessions.length" class="space-y-2">
              <div
                v-for="session in sessions"
                :key="session.id"
                class="p-3 rounded-lg bg-base-200/50 space-y-2"
              >
                <div class="flex items-start gap-2">
                  <span class="inline-block w-2 h-2 rounded-full mt-1.5" :class="session.expiredAt ? 'bg-base-300' : 'bg-success'" />
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 text-sm">
                      <span class="font-mono text-xs">{{ session.id.slice(0, 12) }}...</span>
                      <span class="text-xs px-1.5 py-0.5 rounded bg-base-300/60 text-base-content/50">
                        {{ session.type === 0 ? 'Login' : session.type === 1 ? 'OAuth' : 'OIDC' }}
                      </span>
                      <span v-if="session.expiredAt" class="text-xs text-base-content/30">Expired</span>
                    </div>
                    <div class="text-xs text-base-content/50 mt-1 space-y-0.5">
                      <div class="flex items-center gap-1.5">
                        <IconGlobe class="w-3 h-3 text-base-content/30" />
                        <span>{{ session.ipAddress || 'Unknown IP' }}</span>
                        <span v-if="session.location" class="text-base-content/30">- {{ session.location }}</span>
                      </div>
                      <div v-if="session.userAgent" class="truncate">{{ session.userAgent }}</div>
                      <div v-if="session.lastGrantedAt" class="text-base-content/30">
                        Last active: {{ formatTimeAgo(session.lastGrantedAt) }}
                      </div>
                    </div>
                  </div>
                  <button class="btn btn-ghost btn-xs text-error shrink-0" @click="revokeOneSession(session)">
                    <IconX class="w-3 h-3" />
                  </button>
                </div>
                <div v-if="session.childrenCount" class="pl-4">
                  <button class="text-xs text-primary/70 hover:text-primary" @click="toggleSessionChildren(session)">
                    {{ session.children?.length ? 'Hide' : 'Show' }} {{ session.childrenCount }} child sessions
                  </button>
                </div>
                <div v-if="session.children?.length" class="pl-4 space-y-1.5 mt-1">
                  <div
                    v-for="child in session.children"
                    :key="child.id"
                    class="flex items-center gap-2 text-xs p-2 rounded bg-base-100/50"
                  >
                    <span class="inline-block w-1.5 h-1.5 rounded-full" :class="child.expiredAt ? 'bg-base-300' : 'bg-success'" />
                    <span class="font-mono">{{ child.id.slice(0, 10) }}...</span>
                    <span class="text-base-content/50">{{ child.ipAddress || 'Unknown' }}</span>
                    <span class="text-base-content/30">{{ child.type === 1 ? 'OAuth' : 'OIDC' }}</span>
                    <button class="btn btn-ghost btn-xs text-error ml-auto" @click="revokeOneSession(child)">
                      <IconX class="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <p v-else class="text-sm text-base-content/40">No sessions found</p>
          </AdminCard>
        </div>

        <!-- Right Column -->
        <div class="space-y-6">
          <AdminCard title="Security Overview">
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-sm text-base-content/60">Active Sessions</span>
                <span class="text-sm font-semibold">{{ detail.activeSessionCount ?? '—' }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-base-content/60">Active Devices</span>
                <span class="text-sm font-semibold">{{ detail.activeDeviceCount ?? '—' }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-base-content/60">Auth Factors</span>
                <span class="text-sm font-semibold">{{ factors.length }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-base-content/60">Badges</span>
                <span class="text-sm font-semibold">{{ badges.length }}</span>
              </div>
            </div>
          </AdminCard>

          <AdminCard title="Quick Actions" compact>
            <div class="space-y-2">
              <button class="btn btn-outline btn-sm w-full justify-start" @click="handleRevokeSessions">
                <IconLogOut class="w-4 h-4" /> Revoke All Sessions
              </button>
              <button class="btn btn-warning btn-sm w-full justify-start" @click="suspendOpen = true">
                <IconShieldAlert class="w-4 h-4" /> Suspend Account
              </button>
              <button class="btn btn-error btn-sm w-full justify-start" @click="deleteOpen = true">
                <IconTrash2 class="w-4 h-4" /> Delete Account
              </button>
            </div>
          </AdminCard>
        </div>
      </div>

      <!-- Contact Drawer -->
      <AdminDrawer :open="contactDrawerOpen" :title="contactEdit ? 'Edit Contact' : 'Add Contact'" @update:open="contactDrawerOpen = $event">
        <form class="space-y-3" @submit.prevent="doSaveContact">
          <div>
            <label class="text-xs text-base-content/50">Type</label>
            <select v-model="contactForm.type" class="select select-sm w-full bg-base-200/60 border-0 rounded-xl">
              <option :value="0">Email</option>
              <option :value="1">Phone</option>
            </select>
          </div>
          <div>
            <label class="text-xs text-base-content/50">Content</label>
            <input v-model="contactForm.content" type="text" class="input input-sm w-full bg-base-200/60 border-0 rounded-xl" required />
          </div>
          <button class="btn btn-sm btn-primary w-full" :disabled="contactLoading">
            {{ contactLoading ? 'Saving...' : 'Save' }}
          </button>
        </form>
      </AdminDrawer>

      <!-- Factor Create Drawer -->
      <AdminDrawer :open="factorCreateOpen" title="Add Auth Factor" @update:open="factorCreateOpen = $event">
        <form class="space-y-3" @submit.prevent="doCreateFactor">
          <div>
            <label class="text-xs text-base-content/50">Factor Type</label>
            <select v-model="factorCreateForm.type" class="select select-sm w-full bg-base-200/60 border-0 rounded-xl">
              <option :value="0">Password</option>
              <option :value="1">Email</option>
              <option :value="3">TOTP</option>
            </select>
          </div>
          <button class="btn btn-sm btn-primary w-full" :disabled="factorLoading">
            {{ factorLoading ? 'Creating...' : 'Create' }}
          </button>
        </form>
      </AdminDrawer>

      <!-- Password Reset Drawer -->
      <AdminDrawer :open="passwordResetOpen" title="Reset Password" @update:open="passwordResetOpen = $event">
        <form class="space-y-3" @submit.prevent="doResetPassword">
          <div>
            <label class="text-xs text-base-content/50">New Password</label>
            <input v-model="passwordResetForm.newPassword" type="password" class="input input-sm w-full bg-base-200/60 border-0 rounded-xl" required />
          </div>
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input v-model="passwordResetForm.revokeSessions" type="checkbox" class="checkbox checkbox-xs" />
            <span class="text-xs">Revoke all sessions</span>
          </label>
          <button class="btn btn-sm btn-warning w-full" :disabled="factorLoading">
            {{ factorLoading ? 'Resetting...' : 'Reset Password' }}
          </button>
        </form>
      </AdminDrawer>

      <!-- Verification Drawer -->
      <AdminDrawer :open="verifyOpen" title="Set Verification" @update:open="verifyOpen = $event">
        <form class="space-y-3" @submit.prevent="doSetVerification">
          <div>
            <label class="text-xs text-base-content/50">Type</label>
            <select v-model="verifyForm.type" class="select select-sm w-full bg-base-200/60 border-0 rounded-xl">
              <option :value="0">Official</option>
              <option :value="1">Partner</option>
              <option :value="2">Creator</option>
            </select>
          </div>
          <div>
            <label class="text-xs text-base-content/50">Title</label>
            <input v-model="verifyForm.title" type="text" class="input input-sm w-full bg-base-200/60 border-0 rounded-xl" />
          </div>
          <div>
            <label class="text-xs text-base-content/50">Description</label>
            <input v-model="verifyForm.description" type="text" class="input input-sm w-full bg-base-200/60 border-0 rounded-xl" />
          </div>
          <div>
            <label class="text-xs text-base-content/50">Verified By</label>
            <input v-model="verifyForm.verifiedBy" type="text" class="input input-sm w-full bg-base-200/60 border-0 rounded-xl" />
          </div>
          <button class="btn btn-sm btn-primary w-full" :disabled="verifyLoading">
            {{ verifyLoading ? 'Saving...' : 'Set Verification' }}
          </button>
        </form>
      </AdminDrawer>

      <!-- Badge Grant Drawer -->
      <AdminDrawer :open="badgeGrantOpen" title="Grant Badge" @update:open="badgeGrantOpen = $event">
        <form class="space-y-3" @submit.prevent="doGrantBadge">
          <div>
            <label class="text-xs text-base-content/50">Type</label>
            <input v-model="badgeGrantForm.type" type="text" class="input input-sm w-full bg-base-200/60 border-0 rounded-xl" required placeholder="staff, creator, etc." />
          </div>
          <div>
            <label class="text-xs text-base-content/50">Label</label>
            <input v-model="badgeGrantForm.label" type="text" class="input input-sm w-full bg-base-200/60 border-0 rounded-xl" required />
          </div>
          <div>
            <label class="text-xs text-base-content/50">Caption</label>
            <input v-model="badgeGrantForm.caption" type="text" class="input input-sm w-full bg-base-200/60 border-0 rounded-xl" />
          </div>
          <button class="btn btn-sm btn-primary w-full" :disabled="badgeLoading">
            {{ badgeLoading ? 'Granting...' : 'Grant Badge' }}
          </button>
        </form>
      </AdminDrawer>

      <!-- Suspend Drawer -->
      <AdminDrawer :open="suspendOpen" title="Suspend Account" @update:open="suspendOpen = $event">
        <form class="space-y-4" @submit.prevent="handleSuspend">
          <div>
            <label class="text-xs text-base-content/50">Punishment Type</label>
            <select v-model="suspendForm.type" class="select select-sm w-full bg-base-200/60 border-0 rounded-xl">
              <option value="block_login">Block Login</option>
              <option value="disable_account">Disable Account</option>
            </select>
          </div>
          <div>
            <label class="text-xs text-base-content/50">Reason</label>
            <textarea v-model="suspendForm.reason" class="textarea textarea-sm w-full bg-base-200/60 border-0 rounded-xl" rows="3" placeholder="Reason..." />
          </div>
          <div>
            <label class="text-xs text-base-content/50">Expires At</label>
            <input v-model="suspendForm.expiredAt" type="datetime-local" class="input input-sm w-full bg-base-200/60 border-0 rounded-xl" />
            <p class="text-xs text-base-content/40 mt-1">Leave empty for permanent</p>
          </div>
          <label class="flex items-center gap-2 cursor-pointer">
            <input v-model="suspendForm.revokeSessions" type="checkbox" class="checkbox checkbox-xs" />
            <span class="text-sm">Revoke all sessions immediately</span>
          </label>
          <button type="submit" class="btn btn-sm btn-warning w-full" :disabled="!suspendForm.reason || isSuspending">
            <span v-if="isSuspending" class="loading loading-spinner loading-xs" />
            <span v-else>Suspend Account</span>
          </button>
        </form>
      </AdminDrawer>

      <!-- Device Label Drawer -->
      <AdminDrawer :open="deviceLabelOpen" title="Rename Device" @update:open="deviceLabelOpen = $event">
        <form class="space-y-3" @submit.prevent="doUpdateDeviceLabel">
          <div>
            <label class="text-xs text-base-content/50">Device Label</label>
            <input v-model="deviceLabelForm.label" type="text" class="input input-sm w-full bg-base-200/60 border-0 rounded-xl" placeholder="e.g. Alice's MacBook Pro" />
          </div>
          <button class="btn btn-sm btn-primary w-full" :disabled="deviceLabelLoading">
            {{ deviceLabelLoading ? 'Saving...' : 'Save Label' }}
          </button>
        </form>
      </AdminDrawer>

      <!-- Delete Dialog -->
      <AdminDrawer :open="deleteOpen" title="Delete Account" @update:open="deleteOpen = $event">
        <div class="space-y-4">
          <div class="rounded-xl bg-error/5 border border-error/20 p-4">
            <div class="flex items-start gap-3">
              <IconAlertTriangle class="w-5 h-5 text-error shrink-0 mt-0.5" />
              <div>
                <p class="text-sm font-semibold text-error">This action is irreversible</p>
                <p class="text-xs text-base-content/60 mt-1">Deleting <strong>@{{ detail.account.name }}</strong> will permanently remove all account data.</p>
              </div>
            </div>
          </div>
          <div class="flex gap-2">
            <button class="btn btn-ghost flex-1 btn-sm" @click="deleteOpen = false">Cancel</button>
            <button class="btn btn-error flex-1 btn-sm" :disabled="isDeleting" @click="handleDelete">
              <span v-if="isDeleting" class="loading loading-spinner loading-xs" />
              <span v-else>Delete Permanently</span>
            </button>
          </div>
        </div>
      </AdminDrawer>
    </template>

    <div v-else class="flex flex-col items-center py-16 text-center">
      <IconUserX class="w-12 h-12 text-base-content/20 mb-4" />
      <p class="text-base-content/50 mb-1">Account not found</p>
      <NuxtLink to="/admin/accounts" class="btn btn-sm btn-ghost mt-2">Back to accounts</NuxtLink>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import {
  IconArrowLeft,
  IconShieldAlert,
  IconKeyRound,
  IconBan,
  IconTrash2,
  IconLogOut,
  IconGamepad2,
  IconAlertTriangle,
  IconUserX,
  IconPlus,
  IconBadgeCheck,
  IconMonitor,
  IconRefreshCw,
  IconPencil,
  IconGlobe,
  IconX,
} from '#components'
import { getFileUrl } from '~/utils/files'
import {
  revokeAccountSessions,
  suspendAccount,
  deleteAdminAccount,
  deletePunishment,
  fetchAccountContacts,
  createAccountContact,
  updateAccountContact,
  deleteAccountContact,
  verifyContact,
  setPrimaryContact,
  fetchAccountFactors,
  createAccountFactor,
  enableAccountFactor,
  disableAccountFactor,
  deleteAccountFactor,
  resetAccountPassword,
  setVerification,
  clearVerification,
  fetchAccountBadges,
  grantBadge,
  activateBadge,
  revokeBadge,
  fetchAccountDevices,
  adminUpdateDeviceLabel,
  revokeDeviceSessions,
  deleteAccountDevice,
  fetchAccountSessions,
  adminFetchSessionChildren,
  adminRevokeSession,
} from '~/utils/admin'
import type { AdminDevice, AdminSession } from '~/types/admin'
import type { PunishmentType } from '~/types/admin'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const { currentAccount: detail, isLoadingDetail, loadAccountDetail, clearCurrentAccount } = useAdmin()

const identifier = computed(() => route.params.name as string)

// Contacts
const contacts = ref<any[]>([])
const contactDrawerOpen = ref(false)
const contactEdit = ref<any>(null)
const contactLoading = ref(false)
const contactForm = ref({ type: 0, content: '' })

async function loadContacts() {
  try { contacts.value = await fetchAccountContacts(identifier.value) } catch { contacts.value = [] }
}

function editContact(c: any) {
  contactEdit.value = c
  contactForm.value = { type: c.type, content: c.content }
  contactDrawerOpen.value = true
}

async function doSaveContact() {
  contactLoading.value = true
  try {
    if (contactEdit.value) {
      await updateAccountContact(identifier.value, contactEdit.value.id, contactForm.value)
    } else {
      await createAccountContact(identifier.value, contactForm.value)
    }
    contactDrawerOpen.value = false
    await loadContacts()
  } catch { } finally { contactLoading.value = false }
}

async function doVerifyContact(contactId: string) {
  try { await verifyContact(identifier.value, contactId); await loadContacts() } catch { }
}

async function doSetPrimaryContact(contactId: string) {
  try { await setPrimaryContact(identifier.value, contactId); await loadContacts() } catch { }
}

async function doDeleteContact(contactId: string) {
  try { await deleteAccountContact(identifier.value, contactId); await loadContacts() } catch { }
}

// Auth Factors
const factors = ref<any[]>([])
const factorCreateOpen = ref(false)
const passwordResetOpen = ref(false)
const factorLoading = ref(false)
const factorCreateForm = ref({ type: 0 })
const passwordResetForm = ref({ newPassword: '', revokeSessions: true })

async function loadFactors() {
  try { factors.value = await fetchAccountFactors(identifier.value) } catch { factors.value = [] }
}

async function doCreateFactor() {
  factorLoading.value = true
  try { await createAccountFactor(identifier.value, factorCreateForm.value); factorCreateOpen.value = false; await loadFactors() } catch { } finally { factorLoading.value = false }
}

async function doEnableFactor(factorId: string) {
  try { await enableAccountFactor(identifier.value, factorId); await loadFactors() } catch { }
}

async function doDisableFactor(factorId: string) {
  try { await disableAccountFactor(identifier.value, factorId); await loadFactors() } catch { }
}

async function doDeleteFactor(factorId: string) {
  try { await deleteAccountFactor(identifier.value, factorId); await loadFactors() } catch { }
}

async function doResetPassword() {
  factorLoading.value = true
  try { await resetAccountPassword(identifier.value, passwordResetForm.value); passwordResetOpen.value = false } catch { } finally { factorLoading.value = false }
}

// Verification
const verifyOpen = ref(false)
const verifyLoading = ref(false)
const verifyForm = ref({ type: 0, title: '', description: '', verifiedBy: '' })

async function doSetVerification() {
  verifyLoading.value = true
  try { await setVerification(identifier.value, verifyForm.value); verifyOpen.value = false; await loadAccountDetail(identifier.value) } catch { } finally { verifyLoading.value = false }
}

async function clearVerify() {
  try { await clearVerification(identifier.value); await loadAccountDetail(identifier.value) } catch { }
}

// Badges
const badges = ref<any[]>([])
const badgeGrantOpen = ref(false)
const badgeLoading = ref(false)
const badgeGrantForm = ref({ type: '', label: '', caption: '' })

async function loadBadges() {
  try { badges.value = await fetchAccountBadges(identifier.value) } catch { badges.value = [] }
}

async function doGrantBadge() {
  badgeLoading.value = true
  try { await grantBadge(identifier.value, badgeGrantForm.value); badgeGrantOpen.value = false; await loadBadges() } catch { } finally { badgeLoading.value = false }
}

async function doActivateBadge(badgeId: string) {
  try { await activateBadge(identifier.value, badgeId); await loadBadges() } catch { }
}

async function doRevokeBadge(badgeId: string) {
  try { await revokeBadge(identifier.value, badgeId); await loadBadges() } catch { }
}

// Devices
const devices = ref<AdminDevice[]>([])
const devicesLoading = ref(false)
const deviceLabelOpen = ref(false)
const deviceLabelLoading = ref(false)
const deviceLabelEdit = ref<AdminDevice | null>(null)
const deviceLabelForm = ref({ label: '' })

async function loadDevices() {
  devicesLoading.value = true
  try {
    const { items } = await fetchAccountDevices(identifier.value, { includeSessions: true })
    devices.value = items
  } catch { devices.value = [] } finally { devicesLoading.value = false }
}

function editDeviceLabel(device: AdminDevice) {
  deviceLabelEdit.value = device
  deviceLabelForm.value = { label: device.label || '' }
  deviceLabelOpen.value = true
}

async function doUpdateDeviceLabel() {
  if (!deviceLabelEdit.value) return
  deviceLabelLoading.value = true
  try {
    await adminUpdateDeviceLabel(identifier.value, deviceLabelEdit.value.id, deviceLabelForm.value)
    deviceLabelOpen.value = false
    await loadDevices()
  } catch { } finally { deviceLabelLoading.value = false }
}

async function revokeDevice(device: AdminDevice) {
  try { await revokeDeviceSessions(identifier.value, device.id); await loadDevices() } catch { }
}

async function deleteDevice(device: AdminDevice) {
  try { await deleteAccountDevice(identifier.value, device.id); await loadDevices() } catch { }
}

// Sessions
const sessions = ref<AdminSession[]>([])
const sessionsLoading = ref(false)

async function loadSessions() {
  sessionsLoading.value = true
  try {
    const { items } = await fetchAccountSessions(identifier.value, { activeOnly: false })
    sessions.value = items
  } catch { sessions.value = [] } finally { sessionsLoading.value = false }
}

async function toggleSessionChildren(session: AdminSession) {
  if (session.children?.length) {
    session.children = []
  } else {
    try {
      const children = await adminFetchSessionChildren(identifier.value, session.id)
      session.children = children
    } catch { }
  }
}

async function revokeOneSession(session: AdminSession) {
  try { await adminRevokeSession(identifier.value, session.id); await loadSessions(); await loadDevices() } catch { }
}

function formatTimeAgo(dateStr: string): string {
  const now = Date.now()
  const diff = now - new Date(dateStr).getTime()
  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

// Suspend
const suspendOpen = ref(false)
const isSuspending = ref(false)
const suspendForm = ref({ type: 'block_login' as PunishmentType, reason: '', expiredAt: '', revokeSessions: true })

// Delete
const deleteOpen = ref(false)
const isDeleting = ref(false)

function contactTypeLabel(type: number): string {
  const labels: Record<number, string> = { 0: 'Email', 1: 'Phone', 2: 'Other' }
  return labels[type] || 'Unknown'
}

function factorTypeLabel(type: number): string {
  const labels: Record<number, string> = { 0: 'Password', 1: 'Email', 2: 'In-App', 3: 'TOTP', 4: 'PIN', 5: 'Recovery Code', 6: 'Physical Passport', 7: 'Passkey' }
  return labels[type] || 'Unknown'
}

function punishmentTypeLabel(type: number): string {
  const labels: Record<number, string> = { 0: 'Block Login', 1: 'Disable Account', 2: 'Mute', 3: 'Restrict Features' }
  return labels[type] || 'Unknown'
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

async function handleRevokeSessions() {
  try { await revokeAccountSessions(identifier.value); await loadAccountDetail(identifier.value) } catch { }
}

async function handleSuspend() {
  isSuspending.value = true
  try {
    await suspendAccount(identifier.value, { reason: suspendForm.value.reason, type: suspendForm.value.type, expiredAt: suspendForm.value.expiredAt || undefined, revokeSessions: suspendForm.value.revokeSessions })
    suspendOpen.value = false; await loadAccountDetail(identifier.value)
  } catch { } finally { isSuspending.value = false }
}

async function handleDelete() {
  isDeleting.value = true
  try { await deleteAdminAccount(identifier.value); navigateTo('/admin/accounts') } catch { isDeleting.value = false }
}

async function handleDeletePunishment(punishmentId: string) {
  try { await deletePunishment(identifier.value, punishmentId); await loadAccountDetail(identifier.value) } catch { }
}

onMounted(() => {
  loadAccountDetail(identifier.value)
  loadContacts()
  loadFactors()
  loadBadges()
  loadDevices()
  loadSessions()
})

onUnmounted(() => {
  clearCurrentAccount()
})
</script>
