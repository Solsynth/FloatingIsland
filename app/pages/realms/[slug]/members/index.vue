<template>
    <NuxtLayout name="app">
        <!-- Loading -->
        <ConfuseSpinner v-if="status === 'pending'" message="Loading members..." />

        <!-- Not Found -->
        <div v-else-if="notFound" class="mx-auto max-w-2xl p-6">
            <div class="card">
                <div class="card-body items-center text-center">
                    <IconUsers class="text-base-content/50 w-10 h-10" />
                    <h1 class="text-xl font-bold">Realm not found</h1>
                </div>
            </div>
        </div>

        <!-- Error -->
        <div v-else-if="error" class="mx-auto max-w-2xl p-6">
            <div class="alert alert-error">
                <span>{{ error }}</span>
            </div>
        </div>

        <!-- Members List -->
        <div v-else-if="realm" class="mx-auto max-w-4xl space-y-6">
            <!-- Header -->
            <div class="flex items-center gap-4 px-4 lg:px-0">
                <NuxtLink :to="`/realms/${realm.slug}`" class="btn btn-ghost btn-square">
                    <IconArrowLeft class="w-5 h-5" />
                </NuxtLink>
                <div class="min-w-0 flex-1">
                    <h1 class="text-xl font-bold truncate">{{ realm.name }}</h1>
                    <p class="text-sm text-base-content/60">
                        {{ total }} members
                    </p>
                </div>
                <button
                    v-if="canInvite"
                    class="btn btn-primary btn-sm"
                    @click="showInviteModal = true"
                >
                    <IconUserPlus class="w-4 h-4" />
                    Invite
                </button>
            </div>

            <!-- Filters -->
            <div class="card">
                <div class="card-body p-4">
                    <div class="flex flex-wrap gap-2">
                        <div class="join flex-1">
                            <input
                                v-model="searchQuery"
                                type="text"
                                placeholder="Search members..."
                                class="input input-bordered join-item w-full"
                                @keydown.enter="reloadMembers"
                            />
                            <button class="btn btn-primary join-item" @click="reloadMembers">
                                <IconSearch class="w-4 h-4" />
                            </button>
                        </div>
                        <select v-model="roleFilter" class="select select-bordered" @change="reloadMembers">
                            <option value="">All roles</option>
                            <option value="0">Member</option>
                            <option value="1">Moderator</option>
                            <option value="2">Admin</option>
                            <option value="3">Owner</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Members Grid -->
            <div v-if="members.length > 0" class="grid gap-3 sm:grid-cols-2">
                <div
                    v-for="member in members"
                    :key="member.id"
                    class="card bg-base-200/50 hover:bg-base-200 transition-colors"
                >
                    <div class="card-body p-4">
                        <div class="flex items-start gap-3">
                            <!-- Avatar -->
                            <NuxtLink :to="`/@${member.account?.name}`" class="shrink-0">
                                <div v-if="member.account?.avatar?.id" class="avatar">
                                    <div class="w-12 h-12 rounded-xl">
                                        <img
                                            :src="getFileUrl(member.account.avatar.id)"
                                            :alt="member.nick || member.account?.nick || member.account?.name"
                                        />
                                    </div>
                                </div>
                                <div v-else class="avatar avatar-placeholder">
                                    <div class="w-12 h-12 rounded-xl bg-primary text-primary-content flex items-center justify-center font-bold">
                                        {{ getInitials(member.nick || member.account?.nick || member.account?.name || '?') }}
                                    </div>
                                </div>
                            </NuxtLink>

                            <!-- Info -->
                            <div class="min-w-0 flex-1">
                                <div class="flex items-center gap-2 flex-wrap">
                                    <NuxtLink
                                        :to="`/@${member.account?.name}`"
                                        class="font-semibold truncate hover:underline"
                                    >
                                        {{ member.nick || member.account?.nick || member.account?.name }}
                                    </NuxtLink>
                                    <span
                                        class="badge badge-sm"
                                        :class="getRoleBadgeClass(member.role)"
                                    >
                                        {{ getRoleLabel(member.role) }}
                                    </span>
                                    <span
                                        v-if="member.label"
                                        class="badge badge-sm"
                                        :style="getLabelStyle(member.label)"
                                    >
                                        {{ member.label.name }}
                                    </span>
                                </div>
                                <p class="text-sm text-base-content/60 truncate">
                                    @{{ member.account?.name }}
                                </p>
                                <p v-if="member.bio" class="text-xs text-base-content/50 mt-1 line-clamp-2">
                                    {{ member.bio }}
                                </p>
                                <div class="flex items-center gap-3 mt-2 text-xs text-base-content/40">
                                    <span class="flex items-center gap-1">
                                        <IconZap class="w-3 h-3" />
                                        Lv {{ member.level }}
                                    </span>
                                    <span v-if="member.experience > 0">
                                        {{ member.experience }} XP
                                    </span>
                                </div>
                            </div>

                            <!-- Actions -->
                            <div v-if="canManage && member.accountId !== currentUserId" class="dropdown dropdown-end">
                                <button class="btn btn-ghost btn-square btn-sm">
                                    <IconMoreVertical class="w-4 h-4" />
                                </button>
                                <ul class="dropdown-content menu menu-sm bg-base-100 rounded-box z-10 shadow-lg w-40">
                                    <li v-if="myRole && myRole > member.role">
                                        <button @click="promoteMember(member)">
                                            <IconArrowUp class="w-4 h-4" />
                                            Promote
                                        </button>
                                    </li>
                                    <li v-if="myRole && myRole > member.role">
                                        <button @click="demoteMember(member)">
                                            <IconArrowDown class="w-4 h-4" />
                                            Demote
                                        </button>
                                    </li>
                                    <li class="divider"></li>
                                    <li>
                                        <button class="text-error" @click="kickMember(member)">
                                            <IconUserX class="w-4 h-4" />
                                            Remove
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Load More -->
            <div v-if="members.length > 0" class="text-center">
                <button
                    v-if="hasMore"
                    class="btn btn-outline"
                    :disabled="isLoading"
                    @click="loadMore"
                >
                    <IconLoader v-if="isLoading" class="w-4 h-4 animate-spin" />
                    <span>Load more</span>
                </button>
                <p v-else-if="members.length > 10" class="text-sm text-base-content/50">
                    No more members
                </p>
            </div>

            <!-- Empty State -->
            <div v-else class="card bg-base-200/50">
                <div class="card-body items-center text-center py-12">
                    <IconSearch class="w-12 h-12 text-base-content/30 mb-4" />
                    <h2 class="text-lg font-bold">No members found</h2>
                    <p class="text-base-content/60 text-sm">
                        Try adjusting your search or filters
                    </p>
                </div>
            </div>
        </div>
    </NuxtLayout>
</template>

<script setup lang="ts">
import type { Realm, RealmMember, RealmLabel } from '~/types/realm'
import { fetchRealm, fetchRealmMembers, getMyRealmMembership } from '~/utils/api'
import { getFileUrl } from '~/utils/files'

const route = useRoute()
const auth = useAuth()
const realmSlug = computed(() => route.params.slug as string)

// State
const realm = ref<Realm | null>(null)
const members = ref<RealmMember[]>([])
const myMembership = ref<RealmMember | null>(null)
const notFound = ref(false)
const error = ref<string | null>(null)
const isLoading = ref(false)
const total = ref(0)
const offset = ref(0)
const hasMore = ref(false)
const searchQuery = ref('')
const roleFilter = ref('')
const showInviteModal = ref(false)

// Computed
const status = computed(() =>
    realm.value ? 'success' : error.value ? 'error' : 'pending',
)
const myRole = computed(() => myMembership.value?.role ?? null)
const currentUserId = computed(() => auth.user?.id ?? '')
const canInvite = computed(() => myRole.value !== null && myRole.value >= 1)
const canManage = computed(() => myRole.value !== null && myRole.value >= 2)

// Methods
function getInitials(name: string): string {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .map((part) => part[0]?.toUpperCase())
        .slice(0, 2)
        .join('') || '?'
}

function getRoleLabel(role: number): string {
    const roles = ['Member', 'Moderator', 'Admin', 'Owner']
    return roles[role] || 'Member'
}

function getRoleBadgeClass(role: number): string {
    switch (role) {
        case 3: return 'badge-primary'
        case 2: return 'badge-secondary'
        case 1: return 'badge-accent'
        default: return 'badge-ghost'
    }
}

function getLabelStyle(label: RealmLabel): Record<string, string> {
    return {
        backgroundColor: label.color ? `${label.color}20` : undefined,
        borderColor: label.color || undefined,
        color: label.color || undefined,
    }
}

async function reloadMembers() {
    if (!realmSlug.value) return
    isLoading.value = true
    error.value = null
    offset.value = 0

    try {
        const result = await fetchRealmMembers(realmSlug.value, 50, 0)
        members.value = result.members
        total.value = result.total
        offset.value = result.members.length
        hasMore.value = result.members.length < result.total
    } catch (err) {
        error.value = err instanceof Error ? err.message : 'Failed to load members'
    } finally {
        isLoading.value = false
    }
}

async function loadMore() {
    if (!hasMore.value || isLoading.value) return
    isLoading.value = true

    try {
        const result = await fetchRealmMembers(realmSlug.value, 50, offset.value)
        const more = result.members
        members.value = [...members.value, ...more]
        offset.value += more.length
        hasMore.value = members.value.length < result.total
    } catch (err) {
        error.value = err instanceof Error ? err.message : 'Failed to load more members'
    } finally {
        isLoading.value = false
    }
}

async function promoteMember(_member: RealmMember) {
    // TODO: Implement promotion API
    alert('Coming soon!')
}

async function demoteMember(_member: RealmMember) {
    // TODO: Implement demotion API
    alert('Coming soon!')
}

async function kickMember(_member: RealmMember) {
    // TODO: Implement kick API
    alert('Coming soon!')
}

// Initial load
onMounted(async () => {
    try {
        const [realmData, membership] = await Promise.all([
            fetchRealm(realmSlug.value),
            getMyRealmMembership(realmSlug.value),
        ])
        realm.value = realmData
        myMembership.value = membership

        // Load members
        await reloadMembers()

        // SEO
        useHead({
            title: `Members - ${realmData.name}`,
            meta: [
                { name: 'description', content: `Members of ${realmData.name}` },
            ],
        })
    } catch (err) {
        if (err instanceof Error && err.message.includes('404')) {
            notFound.value = true
        } else {
            error.value = err instanceof Error ? err.message : 'Failed to load realm'
        }
    }
})
</script>
