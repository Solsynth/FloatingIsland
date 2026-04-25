<template>
    <div class="space-y-3 lg:space-y-4">
        <!-- Mobile: Horizontal scrollable cards -->
        <div class="lg:hidden flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            <!-- Compact Boost Card -->
            <div class="card bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 shrink-0 w-40">
                <div class="card-body p-3">
                    <div class="flex items-center gap-1.5 mb-2">
                        <IconRocket class="w-4 h-4 text-primary" />
                        <h3 class="font-semibold text-sm">Level {{ boostStatus?.boostLevel || 0 }}</h3>
                    </div>
                    <div v-if="boostStatus" class="text-lg font-bold">{{ boostStatus.boostPoints.toLocaleString() }} pts</div>
                    <NuxtLink :to="`/realms/${realmSlug}/boost`" class="btn btn-primary btn-xs w-full mt-2">
                        <IconZap class="w-3 h-3" />
                        Boost
                    </NuxtLink>
                </div>
            </div>

            <!-- Quick Links -->
            <NuxtLink :to="`/realms/${realmSlug}/members`" class="card bg-base-200 shrink-0 w-32 flex flex-col items-center justify-center p-3">
                <IconUsers class="w-6 h-6 text-base-content/60 mb-1" />
                <span class="text-sm font-medium">Members</span>
            </NuxtLink>

            <button v-if="isMember" class="card bg-base-200 shrink-0 w-32 flex flex-col items-center justify-center p-3" @click="copyInviteLink">
                <IconLink class="w-6 h-6 text-base-content/60 mb-1" />
                <span class="text-sm font-medium">Invite</span>
            </button>
        </div>

        <!-- Desktop: Full sidebar -->
        <div class="hidden lg:block space-y-4">
            <!-- Boost Status Card -->
            <div class="card bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20">
                <div class="card-body p-4">
                    <div class="flex items-center gap-2 mb-3">
                        <IconRocket class="w-5 h-5 text-primary" />
                        <h3 class="font-semibold">Boost Status</h3>
                    </div>

                    <div v-if="boostStatus" class="space-y-3">
                        <div class="flex items-end justify-between">
                            <div>
                                <div class="text-3xl font-black">{{ boostStatus.boostLevel }}</div>
                                <div class="text-xs text-base-content/60">Current Level</div>
                            </div>
                            <div class="text-right">
                                <div class="text-xl font-bold">{{ boostStatus.boostPoints.toLocaleString() }}</div>
                                <div class="text-xs text-base-content/60">Points</div>
                            </div>
                        </div>

                        <!-- Progress Bar -->
                        <div class="space-y-1">
                            <div class="flex justify-between text-xs text-base-content/60">
                                <span>Progress to next level</span>
                                <span>{{ progressPercent }}%</span>
                            </div>
                            <progress class="progress progress-primary w-full" :value="progressPercent" max="100" />
                        </div>

                        <!-- Boost Button -->
                        <NuxtLink
                            :to="`/realms/${realmSlug}/boost`"
                            class="btn btn-primary btn-sm w-full"
                        >
                            <IconZap class="w-4 h-4" />
                            Boost Realm
                        </NuxtLink>
                    </div>

                    <div v-else-if="isLoadingBoost" class="py-4 text-center">
                        <span class="loading loading-spinner loading-sm"/>
                    </div>

                    <div v-else class="text-center py-4 text-sm text-base-content/60">
                        Failed to load boost status
                    </div>
                </div>
            </div>

            <!-- Leaderboard Preview (Desktop) -->
            <div v-if="leaderboard.length > 0" class="card">
            <div class="card-body p-4">
                <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center gap-2">
                        <IconTrophy class="w-5 h-5 text-warning" />
                        <h3 class="font-semibold">Top Boosters</h3>
                    </div>
                    <NuxtLink
                        :to="`/realms/${realmSlug}/boost`"
                        class="btn btn-ghost btn-xs"
                    >
                        View all
                    </NuxtLink>
                </div>

                <div class="space-y-2">
                    <div
                        v-for="(entry, index) in leaderboard.slice(0, 5)"
                        :key="entry.accountId"
                        class="flex items-center gap-3 p-2 rounded-lg hover:bg-base-200/50 transition-colors"
                    >
                        <div class="w-6 text-center font-bold text-base-content/40">
                            {{ index + 1 }}
                        </div>
                        <div v-if="entry.account?.avatar?.id" class="avatar">
                            <div class="w-8 h-8 rounded-lg">
                                <img :src="getFileUrl(entry.account.avatar.id)" :alt="entry.account.nick || entry.account.name" >
                            </div>
                        </div>
                        <div v-else class="avatar avatar-placeholder">
                            <div class="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">
                                {{ getInitials(entry.account?.nick || entry.account?.name || '?') }}
                            </div>
                        </div>
                        <div class="min-w-0 flex-1">
                            <div class="font-medium text-sm truncate">
                                {{ entry.account?.nick || entry.account?.name }}
                            </div>
                        </div>
                        <div class="text-sm font-semibold text-primary">
                            {{ entry.totalPoints.toLocaleString() }}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Quick Actions -->
        <div class="card">
            <div class="card-body p-4">
                <h3 class="font-semibold mb-3">Quick Links</h3>
                <div class="space-y-1">
                    <NuxtLink
                        :to="`/realms/${realmSlug}/members`"
                        class="flex items-center gap-3 p-2 rounded-lg hover:bg-base-200 transition-colors"
                    >
                        <IconUsers class="w-5 h-5 text-base-content/60" />
                        <span class="text-sm">Members</span>
                    </NuxtLink>
                    <NuxtLink
                        v-if="isMember"
                        :to="`/realms/${realmSlug}/settings`"
                        class="flex items-center gap-3 p-2 rounded-lg hover:bg-base-200 transition-colors"
                    >
                        <IconSettings class="w-5 h-5 text-base-content/60" />
                        <span class="text-sm">Settings</span>
                    </NuxtLink>
                    <button
                        v-if="isMember"
                        class="flex items-center gap-3 p-2 rounded-lg hover:bg-base-200 transition-colors w-full text-left"
                        @click="copyInviteLink"
                    >
                        <IconLink class="w-5 h-5 text-base-content/60" />
                        <span class="text-sm">Copy Invite Link</span>
                    </button>
                </div>
            </div>
        </div>

        <!-- My Identity Card -->
        <div v-if="membership" class="card bg-base-200/50">
            <div class="card-body p-4">
                <h3 class="font-semibold mb-3">My Identity</h3>
                <div class="flex items-start gap-3">
                    <div v-if="auth.user?.profile?.picture?.id" class="avatar">
                        <div class="w-10 h-10 rounded-xl">
                            <img :src="getFileUrl(auth.user.profile.picture.id)" :alt="membership.nick || auth.user.name" >
                        </div>
                    </div>
                    <div v-else class="avatar avatar-placeholder">
                        <div class="w-10 h-10 rounded-xl bg-primary text-primary-content flex items-center justify-center font-bold">
                            {{ getInitials(membership.nick || auth.user?.name || '?') }}
                        </div>
                    </div>
                    <div class="min-w-0 flex-1">
                        <div class="font-medium truncate">
                            {{ membership.nick || auth.user?.nick || auth.user?.name }}
                        </div>
                        <div class="text-xs text-base-content/60 flex items-center gap-2 mt-1">
                            <span class="badge badge-xs" :class="getRoleBadgeClass(membership.role)">
                                {{ getRoleLabel(membership.role) }}
                            </span>
                            <span v-if="membership.label" class="badge badge-xs badge-ghost">
                                {{ membership.label.name }}
                            </span>
                        </div>
                        <div class="text-xs text-base-content/40 mt-2">
                            Lv {{ membership.level }} • {{ membership.experience }} XP
                        </div>
                    </div>
                </div>
                <NuxtLink
                    v-if="isMember"
                    :to="`/realms/${realmSlug}/identity`"
                    class="btn btn-ghost btn-xs w-full mt-3"
                >
                    <IconPencil class="w-3 h-3" />
                    Edit Identity
                </NuxtLink>
            </div>
        </div>
    </div>
    </div>

    <!-- Copied Notification -->
    <div
        v-if="showCopied"
        class="fixed bottom-4 right-4 bg-success text-success-content px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in-up"
    >
        Invite link copied!
    </div>
</template>

<script setup lang="ts">
import type { RealmBoostStatus, RealmBoostLeaderboardEntry, RealmMember, RealmLabel } from '~/types/realm'
import { fetchRealmBoostStatus, fetchRealmBoostLeaderboard, fetchRealmLabels } from '~/utils/api'
import { getFileUrl } from '~/utils/files'

const props = defineProps<{
    realmSlug: string
    isMember: boolean
    membership: RealmMember | null
}>()

const emit = defineEmits<{
    membershipUpdated: [membership: RealmMember]
}>()

const auth = useAuth()

// State
const boostStatus = ref<RealmBoostStatus | null>(null)
const leaderboard = ref<RealmBoostLeaderboardEntry[]>([])
const labels = ref<RealmLabel[]>([])
const isLoadingBoost = ref(false)
const isBoosting = ref(false)
const showCopied = ref(false)

// Computed
const progressPercent = computed(() => {
    if (!boostStatus.value) return 0
    // Estimate progress based on points (simple approximation)
    const level = boostStatus.value.boostLevel
    const points = boostStatus.value.boostPoints
    const pointsForNextLevel = Math.pow(level + 1, 2) * 100
    const pointsForCurrentLevel = Math.pow(level, 2) * 100
    const progress = ((points - pointsForCurrentLevel) / (pointsForNextLevel - pointsForCurrentLevel)) * 100
    return Math.min(Math.max(Math.round(progress), 0), 100)
})

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

function copyInviteLink() {
    const link = `${window.location.origin}/realms/${props.realmSlug}/invite`
    navigator.clipboard.writeText(link)
    showCopied.value = true
    setTimeout(() => showCopied.value = false, 2000)
}

async function loadBoostData() {
    isLoadingBoost.value = true
    try {
        const [status, board] = await Promise.all([
            fetchRealmBoostStatus(props.realmSlug),
            fetchRealmBoostLeaderboard(props.realmSlug, 10),
        ])
        boostStatus.value = status
        leaderboard.value = board
    } catch (err) {
        console.error('Failed to load boost data:', err)
    } finally {
        isLoadingBoost.value = false
    }
}

async function loadLabels() {
    try {
        labels.value = await fetchRealmLabels(props.realmSlug)
    } catch (err) {
        console.error('Failed to load labels:', err)
    }
}

// Load data on mount
onMounted(() => {
    loadBoostData()
    if (props.isMember) {
        loadLabels()
    }
})

// Watch for membership changes
watch(() => props.isMember, (isMember) => {
    if (isMember) {
        loadLabels()
    }
})
</script>
