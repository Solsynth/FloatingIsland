<template>
    <NuxtLayout name="app">
        <div class="space-y-6">
            <!-- Header -->
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 class="text-2xl font-bold">Realms</h1>
                    <p class="text-base-content/60 text-sm">Join communities and explore new worlds</p>
                </div>
                <button class="btn btn-primary" @click="showCreateModal = true">
                    <IconPlus class="w-4 h-4" />
                    Create Realm
                </button>
            </div>

            <!-- Auth Required State -->
            <div v-if="requiresAuth || !auth.isAuthenticated.value" class="card bg-base-200/50">
                <div class="card-body items-center text-center py-12">
                    <div class="w-16 h-16 rounded-2xl bg-base-300 flex items-center justify-center mb-4">
                        <IconLogIn class="w-8 h-8 text-base-content/40" />
                    </div>
                    <h2 class="text-lg font-bold">Sign in to view Realms</h2>
                    <p class="text-base-content/60 text-sm max-w-sm mb-4">
                        Realms are community spaces for you and your friends. Sign in to explore and join realms.
                    </p>
                    <NuxtLink to="/auth/login" class="btn btn-primary">
                        <IconLogIn class="w-4 h-4" />
                        Sign In
                    </NuxtLink>
                </div>
            </div>

            <!-- Loading State -->
            <ConfuseSpinner v-else-if="status === 'pending' && realms.length === 0" message="Loading realms..." />

            <!-- Error State -->
            <div v-else-if="error" class="alert alert-error">
                <IconAlertCircle class="w-5 h-5" />
                <span>{{ error }}</span>
            </div>

            <!-- Realms List -->
            <div v-else-if="realms.length > 0" class="grid gap-3">
                <RealmListTile v-for="realm in realms" :key="realm.id" :realm="realm" />
            </div>

            <!-- Empty State -->
            <div v-else class="card bg-base-200/50">
                <div class="card-body items-center text-center py-12">
                    <div class="w-16 h-16 rounded-2xl bg-base-300 flex items-center justify-center mb-4">
                        <IconUsers class="w-8 h-8 text-base-content/40" />
                    </div>
                    <h2 class="text-lg font-bold">No Realms Yet</h2>
                    <p class="text-base-content/60 text-sm max-w-sm">
                        You haven't joined any realms yet. Create your own or wait for invitations from others.
                    </p>
                    <button class="btn btn-primary mt-4" @click="showCreateModal = true">
                        <IconPlus class="w-4 h-4" />
                        Create Your First Realm
                    </button>
                </div>
            </div>

            <!-- Load More -->
            <div v-if="realms.length > 0" class="py-2 text-center">
                <button
                    v-if="hasMore"
                    class="btn btn-outline"
                    :disabled="fetchingMore"
                    @click="loadMore"
                >
                    <IconLoader v-if="fetchingMore" class="w-4 h-4 animate-spin" />
                    <span>Load more</span>
                </button>
                <p v-else-if="realms.length > 5" class="text-sm text-base-content/50">
                    No more realms
                </p>
            </div>
        </div>

        <!-- Create Realm Modal -->
        <RealmCreateModal v-model:open="showCreateModal" @created="handleRealmCreated" />
    </NuxtLayout>
</template>

<script setup lang="ts">
import type { Realm } from '~/types/realm'
import { fetchRealms } from '~/utils/api'

useHead({
    title: 'Realms',
    meta: [{ name: 'description', content: 'Explore and join realms on Solar Network' }],
})

const auth = useAuth()
const realms = useState<Realm[]>('realms-list', () => [])
const hasMore = ref(true)
const fetchingMore = ref(false)
const showCreateModal = ref(false)
const requiresAuth = ref(false)

// Initial fetch - only if authenticated
const { data: initialData, status, error } = await useAsyncData(
    'realms-list-fetch',
    async () => {
        if (!auth.isAuthenticated.value) {
            requiresAuth.value = true
            return []
        }
        try {
            return await fetchRealms()
        } catch (err: unknown) {
            if ((err as Error)?.message?.includes('401') || (err as Error)?.message?.includes('Unauthorized')) {
                requiresAuth.value = true
                return []
            }
            throw err
        }
    },
    {
        default: () => [],
        server: false, // Only run on client to ensure auth state is available
    },
)

watch(
    initialData,
    (data) => {
        if (data) {
            realms.value = data
            hasMore.value = data.length === 50 // API returns 50 per page
        }
    },
    { immediate: true },
)

async function loadMore() {
    if (!hasMore.value || fetchingMore.value) return
    fetchingMore.value = true

    try {
        const more = await fetchRealms()
        if (more.length > 0) {
            // Filter out duplicates
            const existingIds = new Set(realms.value.map(r => r.id))
            const newRealms = more.filter(r => !existingIds.has(r.id))
            realms.value = [...realms.value, ...newRealms]
            hasMore.value = more.length === 50
        } else {
            hasMore.value = false
        }
    } catch (e) {
        console.error('Failed to load more realms:', e)
    } finally {
        fetchingMore.value = false
    }
}

function handleRealmCreated(newRealm: Realm) {
    realms.value.unshift(newRealm)
    navigateTo(`/realms/${newRealm.slug}`)
}
</script>
