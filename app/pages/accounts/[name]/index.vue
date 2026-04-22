<template>
    <NuxtLayout name="app">
        <ConfuseSpinner
            v-if="accountStatus === 'pending'"
            message="Loading account..."
        />

        <template v-else-if="notFound">
            <div class="mx-auto max-w-2xl p-6">
                <div class="card">
                    <div class="card-body items-center text-center">
                        <IconUserX class="text-base-content/50 w-10 h-10" />
                        <h1 class="text-xl font-bold">Account not found</h1>
                        <p class="text-base-content/60">
                            The profile you requested does not exist.
                        </p>
                    </div>
                </div>
            </div>
        </template>

        <template v-else-if="account">
            <div class="mx-auto max-w-5xl">
                <!-- Profile Header -->
                <section class="relative overflow-hidden px-4 pt-4 lg:px-6">
                    <div
                        class="h-40 w-full bg-base-200 sm:h-52 rounded-2xl overflow-hidden"
                    >
                        <img
                            v-if="backgroundUrl"
                            :src="backgroundUrl"
                            :alt="`${displayName} background`"
                            class="h-full w-full object-cover"
                        />
                    </div>
                    <div
                        class="mx-auto -mt-16 flex max-w-5xl flex-col gap-4 px-4 pb-4 sm:-mt-14 sm:flex-row sm:items-end"
                    >
                        <div class="shrink-0">
                            <div v-if="avatarUrl" class="avatar">
                                <div
                                    class="h-24 w-24 rounded-full ring ring-base-300 ring-offset-2 ring-offset-base-100 sm:h-28 sm:w-28"
                                >
                                    <img :src="avatarUrl" :alt="displayName" />
                                </div>
                            </div>
                            <div v-else class="avatar avatar-placeholder">
                                <div
                                    class="h-24 w-24 rounded-full bg-primary text-primary-content ring ring-base-300 ring-offset-2 ring-offset-base-100 sm:h-28 sm:w-28"
                                >
                                    <span class="text-2xl font-semibold">
                                        {{ getInitials(displayName) }}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div class="min-w-0 flex-1">
                            <div class="flex flex-wrap items-center gap-2 pt-18">
                                <h1 class="truncate text-2xl font-black sm:text-3xl">
                                    {{ displayName }}
                                </h1>
                                <span
                                    v-if="account.profile?.verification"
                                    class="badge badge-primary gap-1"
                                >
                                    <IconShieldCheck class="w-3 h-3" />
                                    {{ account.profile.verification.title }}
                                </span>
                            </div>
                            <p class="truncate text-sm text-base-content/60">
                                @{{ account.name }}
                            </p>
                            <ActivityPresence
                                :account="account"
                                class="mt-1"
                            />
                        </div>
                        <div class="flex flex-wrap items-center gap-2">
                            <template v-if="isAuthenticated && !isCurrentUser">
                                <button
                                    v-if="relationship?.isFriend"
                                    class="btn btn-primary gap-2"
                                    disabled
                                >
                                    <IconUserCheck class="w-4 h-4" />
                                    Friends
                                </button>
                                <button
                                    v-else
                                    class="btn btn-primary gap-2"
                                    :disabled="isActionLoading"
                                    @click="addFriend"
                                >
                                    <IconUserPlus class="w-4 h-4" />
                                    Add Friend
                                </button>
                                <button
                                    v-if="relationship?.isBlocked"
                                    class="btn btn-outline gap-2"
                                    :disabled="isActionLoading"
                                    @click="unblock"
                                >
                                    <IconUserX class="w-4 h-4" />
                                    Unblock
                                </button>
                                <button
                                    v-else
                                    class="btn btn-ghost gap-2 text-error"
                                    :disabled="isActionLoading"
                                    @click="block"
                                >
                                    <IconBan class="w-4 h-4" />
                                    Block
                                </button>
                                <button
                                    class="btn btn-primary gap-2"
                                    :disabled="isActionLoading"
                                    @click="sendMessage"
                                >
                                    <IconMessageCircle class="w-4 h-4" />
                                    Message
                                </button>
                            </template>
                            <button
                                class="btn btn-outline btn-square"
                                @click="shareProfile"
                            >
                                <IconShare2 class="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </section>

                <!-- Content Grid -->
                <div class="grid gap-4 px-4 py-4 lg:px-6 lg:grid-cols-3">
                    <!-- Left Column - Timeline -->
                    <div class="space-y-4 lg:col-span-2">
                        <!-- Bio -->
                        <div class="card">
                            <div class="card-body p-4">
                                <div class="flex items-center justify-between mb-2">
                                    <h2 class="text-sm font-semibold text-base-content/70">
                                        Bio
                                    </h2>
                                    <button
                                        v-if="bioHasMultipleLines"
                                        class="btn btn-ghost btn-xs"
                                        @click="isBioExpanded = !isBioExpanded"
                                    >
                                        {{ isBioExpanded ? 'Collapse' : 'Expand' }}
                                    </button>
                                </div>
                                <div
                                    v-if="bioHtml"
                                    class="prose prose-sm max-w-none"
                                    v-html="bioHtml"
                                />
                                <p v-else class="text-sm text-base-content/60">
                                    No bio yet.
                                </p>
                            </div>
                        </div>

                        <!-- Timeline -->
                        <div class="card">
                            <div class="card-body gap-4 p-4">
                                <h2 class="text-sm font-semibold text-base-content/70">
                                    Timeline
                                </h2>
                                <div
                                    v-if="timelinePosts.length > 0"
                                    class="space-y-3"
                                    :class="isLoadingTimeline ? 'opacity-60' : ''"
                                >
                                    <PostCard
                                        v-for="post in timelinePosts"
                                        :key="post.id"
                                        :post="post"
                                        @boost="handleBoost"
                                        @share="handleShare"
                                        @reply="handleReply"
                                    />
                                </div>
                                <div v-if="timelinePosts.length > 0" class="text-center">
                                    <button
                                        v-if="hasMoreTimeline"
                                        class="btn btn-outline btn-sm"
                                        :disabled="isLoadingTimeline"
                                        @click="loadMoreTimeline"
                                    >
                                        <span>Load more</span>
                                    </button>
                                    <p v-else class="text-sm text-base-content/50">
                                        No more posts
                                    </p>
                                </div>
                                <div
                                    v-else-if="!isLoadingTimeline"
                                    class="text-center py-8 text-base-content/50"
                                >
                                    No posts yet.
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Right Column - Sidebar -->
                    <div class="space-y-4">
                        <LevelingProgress
                            v-if="account.profile?.level"
                            :level="account.profile.level"
                            :experience="account.profile.experience || 0"
                            :progress="account.profile.levelingProgress || 0"
                        />

                        <div v-if="account.profile?.verification" class="card bg-primary/5">
                            <div class="card-body p-4">
                                <div class="flex items-center gap-2 mb-2">
                                    <IconShieldCheck class="w-5 h-5 text-primary" />
                                    <h3 class="font-semibold">{{ account.profile.verification.title }}</h3>
                                </div>
                                <p v-if="account.profile.verification.description" class="text-sm text-base-content/70">
                                    {{ account.profile.verification.description }}
                                </p>
                            </div>
                        </div>

                        <div class="card">
                            <div class="card-body p-4">
                                <h3 class="text-sm font-semibold text-base-content/70 mb-3">About</h3>
                                <div class="space-y-2">
                                    <div class="flex items-center gap-2 text-sm">
                                        <IconCalendar class="text-base-content/50 w-4 h-4" />
                                        <span>Joined {{ formatDate(account.createdAt) }}</span>
                                    </div>
                                    <div v-if="account.profile?.birthday" class="flex items-center gap-2 text-sm">
                                        <IconCake class="text-base-content/50 w-4 h-4" />
                                        <span>{{ formatDate(account.profile.birthday) }} · {{ getAge(account.profile.birthday) }} years old</span>
                                    </div>
                                    <div v-if="account.profile?.location" class="flex items-center gap-2 text-sm">
                                        <IconMapPin class="text-base-content/50 w-4 h-4" />
                                        <span>{{ account.profile.location }}</span>
                                    </div>
                                    <div v-if="account.profile?.gender || account.profile?.pronouns" class="flex items-center gap-2 text-sm">
                                        <IconUser class="text-base-content/50 w-4 h-4" />
                                        <span>{{ account.profile.gender || 'Unspecified' }} · {{ account.profile.pronouns || 'Unspecified' }}</span>
                                    </div>
                                    <div v-if="account.profile?.socialCredits !== undefined" class="flex items-center gap-2 text-sm">
                                        <IconAward class="text-base-content/50 w-4 h-4" />
                                        <span>{{ account.profile.socialCredits.toFixed(2) }} pts · {{ getSocialCreditsLevel(account.profile.socialCreditsLevel || 0) }}</span>
                                    </div>
                                    <div v-if="account.profile?.timeZone" class="flex items-center gap-2 text-sm">
                                        <IconClock class="text-base-content/50 w-4 h-4" />
                                        <span>{{ account.profile.timeZone }}</span>
                                    </div>
                                    <div class="flex items-center gap-2 text-sm">
                                        <IconFingerprint class="text-base-content/50 w-4 h-4" />
                                        <button class="hover:text-primary truncate" @click="copyToClipboard(account.id)">
                                            {{ account.id }}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div v-if="account.profile?.links?.length" class="card">
                            <div class="card-body p-4">
                                <h3 class="text-sm font-semibold text-base-content/70 mb-3">Links</h3>
                                <div class="space-y-2">
                                    <a
                                        v-for="link in account.profile.links"
                                        :key="link.name"
                                        :href="link.url.startsWith('http') ? link.url : `https://${link.url}`"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        class="flex items-center gap-2 text-sm hover:text-primary"
                                    >
                                        <IconLink class="text-base-content/50 w-4 h-4" />
                                        <span class="capitalize">{{ link.name }}</span>
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div v-if="publicContacts.length > 0" class="card">
                            <div class="card-body p-4">
                                <h3 class="text-sm font-semibold text-base-content/70 mb-3">Contact</h3>
                                <div class="space-y-2">
                                    <a
                                        v-for="(contact, idx) in publicContacts"
                                        :key="idx"
                                        :href="getContactHref(contact)"
                                        class="flex items-center gap-2 text-sm hover:text-primary"
                                    >
                                        <IconMail v-if="contact.type === 0" class="text-base-content/50 w-4 h-4" />
                                        <IconPhone v-else-if="contact.type === 1" class="text-base-content/50 w-4 h-4" />
                                        <IconHome v-else class="text-base-content/50 w-4 h-4" />
                                        <span>{{ contact.content }}</span>
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div v-if="account.badges?.length" class="card">
                            <div class="card-body p-4">
                                <h3 class="text-sm font-semibold text-base-content/70 mb-3">Badges</h3>
                                <div class="flex flex-wrap gap-2">
                                    <div
                                        v-for="badge in account.badges"
                                        :key="badge.id"
                                        class="badge badge-lg"
                                        :title="badge.caption"
                                    >
                                        {{ badge.label || badge.type }}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div v-if="publishers.length > 0" class="card">
                            <div class="card-body p-4">
                                <h3 class="text-sm font-semibold text-base-content/70 mb-3">Publishers</h3>
                                <div class="space-y-2">
                                    <NuxtLink
                                        v-for="pub in publishers"
                                        :key="pub.id"
                                        :to="`/${pub.name}`"
                                        class="flex items-center gap-3 p-2 rounded-xl hover:bg-base-200 transition-colors"
                                    >
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
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </NuxtLayout>
</template>

<script setup lang="ts">
import type { User } from "~/types/auth";
import type { Post, Publisher } from "~/types/post";
import {
    fetchAccount,
    fetchAccountTimeline,
    fetchAccountRelationship,
    addAccountAsFriend,
    blockAccount,
    unblockAccount,
    getDirectChat,
    createDirectChat,
} from "~/utils/api";
import { getFileUrl } from "~/utils/files";
import { renderMarkdown } from "~/utils/markdown";

const route = useRoute();
const auth = useAuth();
const accountName = computed(() => route.params.name as string);

const account = ref<User | null>(null);
const publishers = ref<Publisher[]>([]);
const timelinePosts = ref<Post[]>([]);
const relationship = ref<{ status: number; isFriend: boolean; isBlocked: boolean } | null>(null);
const notFound = ref(false);
const error = ref<string | null>(null);
const isLoadingTimeline = ref(false);
const isActionLoading = ref(false);
const timelineOffset = ref(0);
const hasMoreTimeline = ref(false);
const isBioExpanded = ref(false);

const accountStatus = computed(() =>
    account.value ? "success" : error.value ? "error" : "pending"
);
const isAuthenticated = computed(() => auth.isAuthenticated);
const isCurrentUser = computed(() => {
    if (!auth.user || !account.value) return false;
    return auth.user.id === account.value.id;
});
const displayName = computed(() => account.value?.nick || account.value?.name || "Unknown");
const avatarUrl = computed(() => getFileUrl(account.value?.profile?.picture?.id));
const backgroundUrl = computed(() => getFileUrl(account.value?.profile?.background?.id));
const bioHtml = computed(() => {
    if (!account.value?.profile?.bio) return "";
    return renderMarkdown(account.value.profile.bio);
});
const bioHasMultipleLines = computed(() => {
    return account.value?.profile?.bio?.includes("\n") || false;
});
const publicContacts = computed(() => account.value?.contacts?.filter((c) => c.isPublic) || []);

function getInitials(name: string): string {
    return name.split(/\s+/).filter(Boolean).map((p) => p[0]?.toUpperCase()).slice(0, 2).join("") || "?";
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function getAge(birthday: string): number {
    const birth = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--;
    return age;
}

function getSocialCreditsLevel(level: number): string {
    switch (level) {
        case -1: return "Poor";
        case 0: return "Normal";
        case 1: return "Good";
        case 2: return "Excellent";
        default: return "Unknown";
    }
}

function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
}

function shareProfile() {
    if (account.value?.name) {
        navigator.share?.({ title: displayName.value, url: `https://solian.app/@${account.value.name}` })
            ?? navigator.clipboard.writeText(`https://solian.app/@${account.value.name}`);
    }
}

function getContactHref(contact: { type: number; content: string }): string {
    switch (contact.type) {
        case 0: return `mailto:${contact.content}`;
        case 1: return `tel:${contact.content}`;
        default: return "#";
    }
}

async function loadRelationship() {
    if (!account.value?.id || isCurrentUser.value) return;
    try {
        const rel = await fetchAccountRelationship(account.value.id);
        relationship.value = rel;
    } catch {
        relationship.value = null;
    }
}

async function addFriend() {
    if (!account.value?.id) return;
    isActionLoading.value = true;
    try {
        await addAccountAsFriend(account.value.id);
        await loadRelationship();
    } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to add friend");
    } finally {
        isActionLoading.value = false;
    }
}

async function block() {
    if (!account.value?.id) return;
    const confirmed = confirm("Block this user?");
    if (!confirmed) return;
    isActionLoading.value = true;
    try {
        await blockAccount(account.value.id);
        await loadRelationship();
    } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to block");
    } finally {
        isActionLoading.value = false;
    }
}

async function unblock() {
    if (!account.value?.id) return;
    isActionLoading.value = true;
    try {
        await unblockAccount(account.value.id);
        await loadRelationship();
    } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to unblock");
    } finally {
        isActionLoading.value = false;
    }
}

async function sendMessage() {
    if (!account.value?.id) return;
    isActionLoading.value = true;
    try {
        let chat = await getDirectChat(account.value.id);
        if (!chat) {
            chat = await createDirectChat(account.value.id);
        }
        alert("Direct message feature coming soon!");
    } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to create chat");
    } finally {
        isActionLoading.value = false;
    }
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

function handleBoost(_post: Post) {
    // TODO
}

function handleShare(post: Post) {
    navigator.share?.({ title: post.title, text: post.content.slice(0, 100), url: `${window.location.origin}/posts/${post.id}` });
}

function handleReply(post: Post) {
    navigateTo(`/posts/${post.id}`);
}

onMounted(async () => {
    // Redirect to @ route if viewing own profile
    if (isCurrentUser.value) {
        navigateTo(`/@${accountName.value}`, { replace: true });
        return;
    }

    try {
        const data = await fetchAccount(accountName.value);
        account.value = data;
        await Promise.all([loadTimeline(), loadRelationship()]);
        useHead({
            title: `${displayName.value} (@${data.name})`,
            meta: [{ name: "description", content: data.profile?.bio || `View profile for @${data.name}` }],
        });
    } catch (err) {
        if (err instanceof Error && err.message.includes("404")) {
            notFound.value = true;
        } else {
            error.value = err instanceof Error ? err.message : "Failed to load account";
        }
    }
});
</script>
