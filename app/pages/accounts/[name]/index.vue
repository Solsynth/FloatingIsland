<template>
    <NuxtLayout name="app">
        <ConfuseSpinner
            v-if="accountStatus === 'pending'"
            message="Loading account..."
        />

        <!-- Not Found State -->
        <div v-else-if="notFound" class="mx-auto max-w-2xl p-6">
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

        <!-- Error State -->
        <div v-else-if="error" class="mx-auto max-w-2xl p-6">
            <div class="alert alert-error">
                <span>{{ error }}</span>
            </div>
        </div>

        <!-- Account Profile -->
        <div v-else-if="account" class="mx-auto max-w-5xl min-w-0">
            <!-- Header Section -->
            <section class="relative overflow-hidden px-4 pt-4 lg:px-6">
                <div
                    class="h-40 w-full bg-base-200 sm:h-52 rounded-2xl overflow-hidden"
                >
                    <img
                        v-if="backgroundUrl"
                        :src="backgroundUrl"
                        :alt="`${displayName} background`"
                        class="h-full w-full object-cover"
                    >
                </div>
                <div
                    class="mx-auto -mt-20 flex max-w-5xl flex-col gap-4 px-4 pb-4 sm:-mt-20 sm:flex-row sm:items-end"
                >
                    <div class="shrink-0">
                        <div v-if="avatarUrl" class="avatar">
                            <div
                                class="h-24 w-24 rounded-full ring ring-base-300 ring-offset-2 ring-offset-base-100 sm:h-28 sm:w-28 mb-8"
                            >
                                <img :src="avatarUrl" :alt="displayName" >
                            </div>
                        </div>
                        <div v-else class="avatar avatar-placeholder">
                            <div
                                class="h-24 w-24 rounded-3xl bg-primary text-primary-content ring ring-base-300 ring-offset-2 ring-offset-base-100 sm:h-28 sm:w-28"
                            >
                                <span class="text-2xl font-semibold">
                                    {{ getInitials(displayName) }}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="min-w-0 flex-1 pt-8">
                        <div class="flex flex-wrap items-center gap-2 min-w-0">
                            <h1
                                class="truncate text-2xl font-black sm:text-3xl"
                            >
                                {{ displayName }}
                            </h1>
                            <span
                                v-if="account.profile?.verification"
                                class="badge gap-1 badge-primary"
                            >
                                <IconShieldCheck class="w-3 h-3" />
                                {{
                                    account.profile.verification.title ||
                                    "Verified"
                                }}
                            </span>
                        </div>
                        <p class="truncate text-sm text-base-content/60">
                            @{{ account.name }}
                        </p>
                        <ActivityPresence :account="account" class="mt-2" />
                    </div>

                    <!-- Actions -->
                    <div class="flex flex-wrap items-center gap-2">
                        <!-- Friend/Block/Message buttons for other users -->
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
                                <IconLoader
                                    v-if="isActionLoading"
                                    class="w-4 h-4 animate-spin"
                                />
                                <IconUserPlus v-else class="w-4 h-4" />
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

                        <!-- For own profile - link to settings -->
                        <template v-if="isCurrentUser">
                            <NuxtLink
                                to="/accounts/me/settings"
                                class="btn btn-primary gap-2"
                            >
                                <IconSettings class="w-4 h-4" />
                                Edit Profile
                            </NuxtLink>
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
            <div class="grid gap-4 px-4 py-4 lg:px-6 lg:grid-cols-3 min-w-0">
                <!-- Left Column - Main Content -->
                <div class="space-y-4 lg:col-span-2 min-w-0">
                    <!-- Bio Section -->
                    <div class="card">
                        <div class="card-body p-4">
                            <h2
                                class="text-sm font-semibold text-base-content/70 mb-2"
                            >
                                Bio
                            </h2>
                            <!-- eslint-disable vue/no-v-html -->
                            <div
                                v-if="bioHtml"
                                class="prose prose-sm max-w-none break-words prose-headings:mb-2 prose-headings:mt-4 prose-p:my-1.5 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-a:break-all prose-code:text-primary prose-code:bg-base-200 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-base-200 prose-pre:text-sm prose-pre:overflow-x-auto prose-blockquote:border-l-4 prose-blockquote:border-primary/30 prose-blockquote:pl-4 prose-blockquote:italic prose-ul:my-1.5 prose-ol:my-1.5"
                                v-html="bioHtml"
                            />
                            <!-- eslint-enable vue/no-v-html -->
                            <p v-else class="text-sm text-base-content/60">
                                No bio yet.
                            </p>
                        </div>
                    </div>

                    <!-- Timeline Section with Filters -->
                    <section class="space-y-4">
                        <!-- Filter Controls -->
                        <div class="card">
                            <div class="card-body gap-4 p-4">
                                <div
                                    v-if="isLoadingTimeline"
                                    class="mb-1 flex items-center gap-2 text-sm text-base-content/60"
                                >
                                    <IconLoader
                                        class="w-3.5 h-3.5 animate-spin"
                                    />
                                    <span>Loading posts...</span>
                                </div>

                                <!-- Content Type Tabs -->
                                <div class="join w-full">
                                    <button
                                        class="btn join-item flex-1"
                                        :class="
                                            contentType === 'all'
                                                ? 'btn-primary'
                                                : 'border-base-300 bg-base-100 text-base-content hover:bg-base-200'
                                        "
                                        @click="setContentType('all')"
                                    >
                                        All
                                    </button>
                                    <button
                                        class="btn join-item flex-1"
                                        :class="
                                            contentType === 'posts'
                                                ? 'btn-primary'
                                                : 'border-base-300 bg-base-100 text-base-content hover:bg-base-200'
                                        "
                                        @click="setContentType('posts')"
                                    >
                                        Posts
                                    </button>
                                    <button
                                        class="btn join-item flex-1"
                                        :class="
                                            contentType === 'articles'
                                                ? 'btn-primary'
                                                : 'border-base-300 bg-base-100 text-base-content hover:bg-base-200'
                                        "
                                        @click="setContentType('articles')"
                                    >
                                        Articles
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Posts List -->
                        <div
                            v-if="timelinePosts.length > 0"
                            class="space-y-4"
                            :class="
                                isLoadingTimeline ? 'opacity-60' : 'opacity-100'
                            "
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

                        <!-- Load More -->
                        <div
                            v-if="timelinePosts.length > 0"
                            class="py-2 text-center"
                        >
                            <button
                                v-if="hasMoreTimeline"
                                class="btn btn-outline"
                                :disabled="isLoadingTimeline"
                                @click="loadMoreTimeline"
                            >
                                <IconLoader
                                    v-if="isLoadingTimeline"
                                    class="w-4 h-4 animate-spin"
                                />
                                <span>Load more</span>
                            </button>
                            <p v-else class="text-sm text-base-content/50">
                                No more posts
                            </p>
                        </div>

                        <!-- Empty State -->
                        <div
                            v-else-if="!isLoadingTimeline"
                            class="rounded-xl border border-base-300 bg-base-100 p-8 text-center text-base-content/60"
                        >
                            No posts yet.
                        </div>
                    </section>
                </div>

                <!-- Right Column - Sidebar -->
                <div class="space-y-4">
                    <!-- Leveling Progress -->
                    <LevelingProgress
                        v-if="account.profile?.level"
                        :level="account.profile.level"
                        :experience="account.profile.experience || 0"
                        :progress="account.profile.levelingProgress || 0"
                    />

                    <!-- Verification Info -->
                    <div
                        v-if="account.profile?.verification"
                        class="card bg-primary/5"
                    >
                        <div class="card-body p-4">
                            <div class="flex items-center gap-2 mb-2">
                                <IconShieldCheck class="w-5 h-5 text-primary" />
                                <h3 class="font-semibold">
                                    {{ account.profile.verification.title }}
                                </h3>
                            </div>
                            <p
                                v-if="account.profile.verification.description"
                                class="text-sm text-base-content/70"
                            >
                                {{ account.profile.verification.description }}
                            </p>
                            <p
                                v-if="account.profile.verification.verifiedBy"
                                class="text-xs text-base-content/50 mt-2"
                            >
                                Verified by
                                {{ account.profile.verification.verifiedBy }}
                            </p>
                        </div>
                    </div>

                    <!-- About -->
                    <div class="card">
                        <div class="card-body p-4">
                            <h3
                                class="text-sm font-semibold text-base-content/70 mb-3"
                            >
                                About
                            </h3>
                            <div class="space-y-2">
                                <div class="flex items-center gap-2 text-sm">
                                    <IconCalendar
                                        class="text-base-content/50 w-4 h-4"
                                    />
                                    <span
                                        >Joined
                                        {{
                                            formatDate(account.createdAt)
                                        }}</span
                                    >
                                </div>
                                <div
                                    v-if="account.profile?.birthday"
                                    class="flex items-center gap-2 text-sm"
                                >
                                    <IconCake
                                        class="text-base-content/50 w-4 h-4"
                                    />
                                    <span
                                        >{{
                                            formatDate(account.profile.birthday)
                                        }}
                                        ·
                                        {{
                                            getAge(account.profile.birthday)
                                        }}
                                        years old</span
                                    >
                                </div>
                                <div
                                    v-if="account.profile?.location"
                                    class="flex items-center gap-2 text-sm"
                                >
                                    <IconMapPin
                                        class="text-base-content/50 w-4 h-4"
                                    />
                                    <span>{{ account.profile.location }}</span>
                                </div>
                                <div
                                    v-if="account.profile?.timeZone"
                                    class="flex items-center gap-2 text-sm"
                                >
                                    <IconClock
                                        class="text-base-content/50 w-4 h-4"
                                    />
                                    <span>{{ account.profile.timeZone }}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Links -->
                    <div v-if="account.profile?.links?.length" class="card">
                        <div class="card-body p-4">
                            <h3
                                class="text-sm font-semibold text-base-content/70 mb-3"
                            >
                                Links
                            </h3>
                            <div class="space-y-2">
                                <a
                                    v-for="link in account.profile.links"
                                    :key="link.name"
                                    :href="
                                        link.url.startsWith('http')
                                            ? link.url
                                            : `https://${link.url}`
                                    "
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="flex items-center gap-2 text-sm hover:text-primary"
                                >
                                    <IconLink
                                        class="text-base-content/50 w-4 h-4"
                                    />
                                    <span class="capitalize">{{
                                        link.name
                                    }}</span>
                                </a>
                            </div>
                        </div>
                    </div>

                    <!-- Badges -->
                    <div v-if="account.badges?.length" class="card">
                        <div class="card-body p-4">
                            <h3
                                class="text-sm font-semibold text-base-content/70 mb-3"
                            >
                                Badges
                            </h3>
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

                    <!-- Publishers -->
                    <div v-if="publishers.length > 0" class="card">
                        <div class="card-body p-4">
                            <h3
                                class="text-sm font-semibold text-base-content/70 mb-3"
                            >
                                Publishers
                            </h3>
                            <div class="space-y-2">
                                <NuxtLink
                                    v-for="pub in publishers"
                                    :key="pub.id"
                                    :to="`/${pub.name}`"
                                    class="flex items-center gap-3 p-2 rounded-xl hover:bg-base-200 transition-colors"
                                >
                                    <div class="avatar">
                                        <div class="w-10 h-10 rounded-xl">
                                            <img
                                                v-if="pub.picture?.id"
                                                :src="
                                                    getFileUrl(pub.picture.id)
                                                "
                                                :alt="pub.nick"
                                            >
                                            <div
                                                v-else
                                                class="bg-primary text-primary-content flex items-center justify-center text-sm font-bold w-full h-full"
                                            >
                                                {{ pub.nick?.[0] || "?" }}
                                            </div>
                                        </div>
                                    </div>
                                    <div class="min-w-0 flex-1">
                                        <p class="font-medium text-sm truncate">
                                            {{ pub.nick }}
                                        </p>
                                        <p
                                            class="text-xs text-base-content/50 truncate"
                                        >
                                            @{{ pub.name }}
                                        </p>
                                    </div>
                                </NuxtLink>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </NuxtLayout>
</template>

<script setup lang="ts">
import type { SnAccount } from "~/types/auth";
import type { Post, Publisher } from "~/types/post";
import {
    IconUserCheck,
    IconUserPlus,
    IconUserX,
    IconBan,
    IconMessageCircle,
    IconShare2,
    IconSettings,
    IconLoader,
    IconShieldCheck,
    IconCalendar,
    IconCake,
    IconMapPin,
    IconClock,
    IconLink,
} from "#components";
import {
    fetchAccount,
    fetchAccountTimeline,
    fetchAccountRelationship,
    addAccountAsFriend,
    blockAccount,
    unblockAccount,
} from "~/utils/api";
import { getFileUrl } from "~/utils/files";
import { renderMarkdown } from "~/utils/markdown";

const route = useRoute();
const auth = useAuth();
const accountName = computed(() => route.params.name as string);

const account = ref<SnAccount | null>(null);
const publishers = ref<Publisher[]>([]);
const timelinePosts = ref<Post[]>([]);
const relationship = ref<{
    status: number;
    isFriend: boolean;
    isBlocked: boolean;
} | null>(null);
const notFound = ref(false);
const error = ref<string | null>(null);
const isLoadingTimeline = ref(false);
const isActionLoading = ref(false);
const timelineOffset = ref(0);
const hasMoreTimeline = ref(false);

// Filters
const contentType = ref<"all" | "posts" | "articles">("all");

const accountStatus = computed(() =>
    account.value ? "success" : error.value ? "error" : "pending",
);
const isAuthenticated = computed(() => auth.isAuthenticated);
const isCurrentUser = computed(() => {
    if (!auth.user || !account.value) return false;
    return auth.user.id === account.value.id;
});
const displayName = computed(
    () => account.value?.nick || account.value?.name || "Unknown",
);
const avatarUrl = computed(() =>
    getFileUrl(account.value?.profile?.picture?.id),
);
const backgroundUrl = computed(() =>
    getFileUrl(account.value?.profile?.background?.id),
);
const bioHtml = computed(() => {
    if (!account.value?.profile?.bio) return "";
    return renderMarkdown(account.value.profile.bio);
});

function getInitials(name: string): string {
    return (
        name
            .split(/\s+/)
            .filter(Boolean)
            .map((p) => p[0]?.toUpperCase())
            .slice(0, 2)
            .join("") || "?"
    );
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

function getAge(birthday: string): number {
    const birth = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    if (
        today.getMonth() < birth.getMonth() ||
        (today.getMonth() === birth.getMonth() &&
            today.getDate() < birth.getDate())
    )
        age--;
    return age;
}

function setContentType(type: "all" | "posts" | "articles") {
    contentType.value = type;
    timelineOffset.value = 0;
    loadTimeline();
}

async function loadTimeline() {
    if (!accountName.value) return;
    isLoadingTimeline.value = true;
    try {
        const result = await fetchAccountTimeline(
            accountName.value,
            20,
            timelineOffset.value,
        );
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
        alert("Direct message feature coming soon!");
    } finally {
        isActionLoading.value = false;
    }
}

async function shareProfile() {
    if (account.value?.name) {
        const url = `https://solian.app/@${account.value.name}`;
        if (navigator.share) {
            await navigator.share({ title: displayName.value, url });
        } else {
            await navigator.clipboard.writeText(url);
        }
    }
}

function handleBoost(_post: Post) {
    // TODO
}

function handleShare(post: Post) {
    navigator.share?.({
        title: post.title,
        text: post.content.slice(0, 100),
        url: `${window.location.origin}/posts/${post.id}`,
    });
}

function handleReply(post: Post) {
    navigateTo(`/posts/${post.id}`);
}

onMounted(async () => {
    try {
        const data = await fetchAccount(accountName.value);
        account.value = data;
        await Promise.all([loadTimeline(), loadRelationship()]);
        
        const title = `${displayName.value} (@${data.name})`;
        const description = data.profile?.bio || `View profile for @${data.name}`;
        const avatarUrl = getFileUrl(data.profile?.picture?.id);
        
        useHead({
            title,
            meta: [
                {
                    name: "description",
                    content: description,
                },
                {
                    property: "og:title",
                    content: title,
                },
                {
                    property: "og:description",
                    content: description,
                },
                {
                    property: "og:type",
                    content: "profile",
                },
                ...(avatarUrl ? [{
                    property: "og:image",
                    content: avatarUrl
                }] : []),
                {
                    property: "og:url",
                    content: `https://solian.app/@${data.name}`,
                },
                {
                    name: "twitter:card",
                    content: "summary",
                },
                {
                    name: "twitter:title",
                    content: title,
                },
                {
                    name: "twitter:description",
                    content: description,
                },
                ...(avatarUrl ? [{
                    name: "twitter:image",
                    content: avatarUrl
                }] : []),
            ],
        });
    } catch (err) {
        if (err instanceof Error && err.message.includes("404")) {
            notFound.value = true;
        } else {
            error.value =
                err instanceof Error ? err.message : "Failed to load account";
        }
    }
});
</script>
