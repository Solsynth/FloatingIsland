<template>
    <NuxtLayout name="app">
        <ConfuseSpinner v-if="accountStatus === 'pending'" message="Loading profile..." />

        <template v-else-if="notFound">
            <div class="mx-auto max-w-2xl p-6">
                <div class="card">
                    <div class="card-body items-center text-center">
                        <IconUserX class="text-base-content/50 w-10 h-10" />
                        <h1 class="text-xl font-bold">Account not found</h1>
                    </div>
                </div>
            </div>
        </template>

        <template v-else-if="account">
            <div class="mx-auto max-w-5xl">
                <!-- Profile Header -->
                <section class="relative overflow-hidden px-4 pt-4 lg:px-6">
                    <div class="h-32 sm:h-40 w-full bg-base-200 sm:h-52 rounded-2xl overflow-hidden">
                        <img v-if="backgroundUrl" :src="backgroundUrl" :alt="`${displayName} background`" class="h-full w-full object-cover" />
                    </div>
                    <div class="mx-auto -mt-12 sm:-mt-14 flex max-w-5xl flex-col sm:flex-row sm:items-end gap-4 px-4 pb-4">
                        <div class="shrink-0">
                            <div v-if="avatarUrl" class="avatar">
                                <div class="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl sm:rounded-3xl ring-4 ring-base-100">
                                    <img :src="avatarUrl" :alt="displayName" />
                                </div>
                            </div>
                            <div v-else class="avatar avatar-placeholder">
                                <div class="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl sm:rounded-3xl bg-primary text-primary-content flex items-center justify-center text-2xl font-bold ring-4 ring-base-100">
                                    {{ getInitials(displayName) }}
                                </div>
                            </div>
                        </div>
                        <div class="min-w-0 flex-1">
                            <div class="flex flex-wrap items-center gap-2">
                                <h1 class="text-xl sm:text-2xl font-black truncate">{{ displayName }}</h1>
                                <span v-if="account.profile?.verification" class="badge badge-primary gap-1">
                                    <IconShieldCheck class="w-3 h-3" />
                                    {{ account.profile.verification.title }}
                                </span>
                            </div>
                            <p class="text-sm text-base-content/60">@{{ account.name }}</p>
                        </div>
                    </div>
                </section>

                <!-- Quick Actions Grid -->
                <div class="px-4 lg:px-6 mb-4">
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <NuxtLink to="/settings/profile" class="btn btn-outline justify-start gap-2 h-auto py-3">
                            <IconUser class="w-5 h-5" />
                            <div class="text-left">
                                <div class="text-sm font-medium">Edit Profile</div>
                                <div class="text-xs text-base-content/50 hidden sm:block">Name, bio, avatar</div>
                            </div>
                        </NuxtLink>
                        <NuxtLink to="/settings/account" class="btn btn-outline justify-start gap-2 h-auto py-3">
                            <IconSettings class="w-5 h-5" />
                            <div class="text-left">
                                <div class="text-sm font-medium">Account</div>
                                <div class="text-xs text-base-content/50 hidden sm:block">Security, password</div>
                            </div>
                        </NuxtLink>
                        <NuxtLink to="/settings/privacy" class="btn btn-outline justify-start gap-2 h-auto py-3">
                            <IconLock class="w-5 h-5" />
                            <div class="text-left">
                                <div class="text-sm font-medium">Privacy</div>
                                <div class="text-xs text-base-content/50 hidden sm:block">Visibility, blocks</div>
                            </div>
                        </NuxtLink>
                        <NuxtLink to="/pricing" class="btn btn-outline justify-start gap-2 h-auto py-3">
                            <IconCreditCard class="w-5 h-5" />
                            <div class="text-left">
                                <div class="text-sm font-medium">Membership</div>
                                <div class="text-xs text-base-content/50 hidden sm:block">Plans, billing</div>
                            </div>
                        </NuxtLink>
                    </div>
                </div>

                <!-- Content Grid -->
                <div class="grid gap-4 px-4 py-4 lg:px-6 lg:grid-cols-3">
                    <!-- Left Column - Timeline -->
                    <div class="space-y-4 lg:col-span-2">
                        <!-- Compose -->
                        <div class="card bg-base-200/50">
                            <div class="card-body p-4">
                                <button class="btn btn-primary w-full gap-2" @click="showCompose = true">
                                    <IconPlus class="w-5 h-5" />
                                    Create Post
                                </button>
                            </div>
                        </div>

                        <!-- Bio (editable) -->
                        <div class="card">
                            <div class="card-body p-4">
                                <div class="flex items-center justify-between mb-2">
                                    <h2 class="text-sm font-semibold text-base-content/70">Bio</h2>
                                    <NuxtLink to="/settings/profile" class="btn btn-ghost btn-xs gap-1">
                                        <IconPencil class="w-3 h-3" />
                                        Edit
                                    </NuxtLink>
                                </div>
                                <div v-if="bioHtml" class="prose prose-sm max-w-none" v-html="bioHtml" />
                                <p v-else class="text-sm text-base-content/60">No bio yet. Click edit to add one.</p>
                            </div>
                        </div>

                        <!-- Timeline -->
                        <div class="card">
                            <div class="card-body gap-4 p-4">
                                <h2 class="text-sm font-semibold text-base-content/70">Your Timeline</h2>
                                <div v-if="timelinePosts.length > 0" class="space-y-3" :class="isLoadingTimeline ? 'opacity-60' : ''">
                                    <PostCard v-for="post in timelinePosts" :key="post.id" :post="post" @boost="handleBoost" @share="handleShare" @reply="handleReply" />
                                </div>
                                <div v-if="timelinePosts.length > 0" class="text-center">
                                    <button v-if="hasMoreTimeline" class="btn btn-outline btn-sm" :disabled="isLoadingTimeline" @click="loadMoreTimeline">
                                        <span>Load more</span>
                                    </button>
                                    <p v-else class="text-sm text-base-content/50">No more posts</p>
                                </div>
                                <div v-else-if="!isLoadingTimeline" class="text-center py-8 text-base-content/50">
                                    <p>No posts yet.</p>
                                    <button class="btn btn-primary btn-sm mt-2" @click="showCompose = true">Create your first post</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Right Column - Stats & Quick Links -->
                    <div class="space-y-4">
                        <!-- Level Progress -->
                        <LevelingProgress v-if="account.profile?.level" :level="account.profile.level" :experience="account.profile.experience || 0" :progress="account.profile.levelingProgress || 0" />

                        <!-- Stats -->
                        <div class="card">
                            <div class="card-body p-4">
                                <h3 class="text-sm font-semibold text-base-content/70 mb-3">Your Stats</h3>
                                <div class="grid grid-cols-2 gap-3">
                                    <div class="text-center p-3 rounded-xl bg-base-200">
                                        <div class="text-2xl font-bold">{{ timelinePosts.length }}</div>
                                        <div class="text-xs text-base-content/60">Posts</div>
                                    </div>
                                    <div class="text-center p-3 rounded-xl bg-base-200">
                                        <div class="text-2xl font-bold">{{ account.profile?.level || 1 }}</div>
                                        <div class="text-xs text-base-content/60">Level</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Publishers -->
                        <div v-if="publishers.length > 0" class="card">
                            <div class="card-body p-4">
                                <div class="flex items-center justify-between mb-3">
                                    <h3 class="text-sm font-semibold text-base-content/70">Your Publishers</h3>
                                    <NuxtLink to="/publishers/create" class="btn btn-ghost btn-xs">New</NuxtLink>
                                </div>
                                <div class="space-y-2">
                                    <NuxtLink v-for="pub in publishers.slice(0, 3)" :key="pub.id" :to="`/${pub.name}`" class="flex items-center gap-3 p-2 rounded-xl hover:bg-base-200 transition-colors">
                                        <div class="avatar">
                                            <div class="w-10 h-10 rounded-xl">
                                                <img v-if="pub.picture?.id" :src="getFileUrl(pub.picture.id)" :alt="pub.nick">
                                                <div v-else class="bg-primary text-primary-content flex items-center justify-center text-sm font-bold w-full h-full">
                                                    {{ pub.nick?.[0] || '?' }}
                                                </div>
                                            </div>
                                        </div>
                                        <div class="min-w-0 flex-1">
                                            <p class="font-medium text-sm truncate">{{ pub.nick }}</p>
                                            <p class="text-xs text-base-content/50 truncate">@{{ pub.name }}</p>
                                        </div>
                                    </NuxtLink>
                                </div>
                                <NuxtLink v-if="publishers.length > 3" to="/publishers" class="btn btn-ghost btn-xs w-full mt-2">View all {{ publishers.length }} publishers</NuxtLink>
                            </div>
                        </div>

                        <!-- Realms -->
                        <div class="card">
                            <div class="card-body p-4">
                                <div class="flex items-center justify-between mb-3">
                                    <h3 class="text-sm font-semibold text-base-content/70">Your Realms</h3>
                                    <NuxtLink to="/realms" class="btn btn-ghost btn-xs">View all</NuxtLink>
                                </div>
                                <div v-if="realms.length > 0" class="space-y-2">
                                    <NuxtLink v-for="realm in realms.slice(0, 3)" :key="realm.id" :to="`/realms/${realm.slug}`" class="flex items-center gap-3 p-2 rounded-xl hover:bg-base-200 transition-colors">
                                        <div class="avatar">
                                            <div class="w-10 h-10 rounded-xl">
                                                <img v-if="realm.picture?.id" :src="getFileUrl(realm.picture.id)" :alt="realm.name">
                                                <div v-else class="bg-primary text-primary-content flex items-center justify-center text-sm font-bold w-full h-full">
                                                    {{ realm.name?.[0] || '?' }}
                                                </div>
                                            </div>
                                        </div>
                                        <div class="min-w-0 flex-1">
                                            <p class="font-medium text-sm truncate">{{ realm.name }}</p>
                                            <p class="text-xs text-base-content/50 truncate">@{{ realm.slug }}</p>
                                        </div>
                                    </NuxtLink>
                                </div>
                                <div v-else class="text-center py-4 text-base-content/50 text-sm">
                                    <p>No realms yet</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </template>

        <!-- Compose Dialog -->
        <ComposeDialog v-if="showCompose" @close="showCompose = false" />
    </NuxtLayout>
</template>

<script setup lang="ts">
import type { User } from "~/types/auth";
import type { Post, Publisher } from "~/types/post";
import type { Realm } from "~/types/realm";
import { fetchAccount, fetchAccountTimeline, fetchRealms } from "~/utils/api";
import { getFileUrl } from "~/utils/files";
import { renderMarkdown } from "~/utils/markdown";

const route = useRoute();
const auth = useAuth();
const accountName = computed(() => route.params.name as string);

const account = ref<User | null>(null);
const publishers = ref<Publisher[]>([]);
const realms = ref<Realm[]>([]);
const timelinePosts = ref<Post[]>([]);
const notFound = ref(false);
const isLoadingTimeline = ref(false);
const timelineOffset = ref(0);
const hasMoreTimeline = ref(false);
const showCompose = ref(false);

const accountStatus = computed(() => account.value ? "success" : "pending");
const isCurrentUser = computed(() => auth.user?.name === accountName.value);
const displayName = computed(() => account.value?.nick || account.value?.name || "Unknown");
const avatarUrl = computed(() => getFileUrl(account.value?.profile?.picture?.id));
const backgroundUrl = computed(() => getFileUrl(account.value?.profile?.background?.id));
const bioHtml = computed(() => account.value?.profile?.bio ? renderMarkdown(account.value.profile.bio) : "");

function getInitials(name: string): string {
    return name.split(/\s+/).filter(Boolean).map((p) => p[0]?.toUpperCase()).slice(0, 2).join("") || "?";
}

async function loadTimeline() {
    if (!accountName.value) return;
    isLoadingTimeline.value = true;
    try {
        const result = await fetchAccountTimeline(accountName.value, 20, timelineOffset.value);
        if (timelineOffset.value === 0) {
            timelinePosts.value = result.posts;
        } else {
            timelinePosts.value.push(...result.posts);
        }
        timelineOffset.value += result.posts.length;
        hasMoreTimeline.value = timelinePosts.value.length < result.total;
    } catch (err) {
        console.error("Failed to load timeline:", err);
    } finally {
        isLoadingTimeline.value = false;
    }
}

async function loadMoreTimeline() {
    await loadTimeline();
}

function handleBoost(_post: Post) {}
function handleShare(post: Post) {
    navigator.share?.({ title: post.title, text: post.content.slice(0, 100), url: `${window.location.origin}/posts/${post.id}` });
}
function handleReply(post: Post) {
    navigateTo(`/posts/${post.id}`);
}

onMounted(async () => {
    // Redirect if not the current user
    if (!isCurrentUser.value && auth.user?.name) {
        navigateTo(`/accounts/${accountName.value}`);
        return;
    }

    try {
        const [data, realmsData] = await Promise.all([
            fetchAccount(accountName.value),
            fetchRealms().catch(() => []),
        ]);
        account.value = data;
        publishers.value = data.publishers || [];
        realms.value = realmsData;
        await loadTimeline();

        useHead({
            title: `${displayName.value} (@${data.name})`,
            meta: [{ name: "description", content: data.profile?.bio || `View profile for @${data.name}` }],
        });
    } catch (err) {
        if (err instanceof Error && err.message.includes("404")) {
            notFound.value = true;
        }
    }
});
</script>
