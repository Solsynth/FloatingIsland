<template>
    <NuxtLayout name="app">
        <!-- Not Found State -->
        <div v-if="notFound" class="mx-auto max-w-2xl p-6">
            <div class="card">
                <div class="card-body items-center text-center">
                    <IconUserX class="text-base-content/50 w-10 h-10" />
                    <h1 class="text-xl font-bold">Publisher not found</h1>
                    <p class="text-base-content/60">The profile you requested does not exist.</p>
                </div>
            </div>
        </div>

        <!-- Error State -->
        <div v-else-if="!publisher" class="mx-auto max-w-2xl p-6">
            <div class="alert alert-error">
                <span>{{ error || 'Failed to load publisher profile' }}</span>
            </div>
        </div>

        <!-- Publisher Profile -->
        <div v-else class="mx-auto max-w-5xl">
            <!-- Header Section -->
            <section class="relative overflow-hidden">
                <div class="h-40 w-full bg-base-200 sm:h-52">
                    <img
                        v-if="backgroundUrl"
                        :src="backgroundUrl"
                        :alt="`${displayName} background`"
                        class="h-full w-full object-cover"
                    />
                </div>
                <div
                    class="mx-auto -mt-16 flex max-w-5xl flex-col gap-4 px-4 pb-4 sm:-mt-14 sm:flex-row sm:items-end sm:px-6"
                >
                    <div class="shrink-0">
                        <div v-if="avatarUrl" class="avatar">
                            <div
                                class="h-24 w-24 rounded-3xl ring ring-base-300 ring-offset-2 ring-offset-base-100 sm:h-28 sm:w-28"
                            >
                                <img :src="avatarUrl" :alt="displayName" />
                            </div>
                        </div>
                        <div v-else class="avatar avatar-placeholder">
                            <div
                                class="h-24 w-24 rounded-3xl bg-primary text-primary-content ring ring-base-300 ring-offset-2 ring-offset-base-100 sm:h-28 sm:w-28"
                            >
                                <span class="text-2xl font-semibold">{{ getInitials(displayName) }}</span>
                            </div>
                        </div>
                    </div>
                    <div class="min-w-0 flex-1">
                        <div class="flex flex-wrap items-center gap-2 pt-18">
                            <h1 class="truncate text-2xl font-black sm:text-3xl">{{ displayName }}</h1>
                            <span v-if="publisher.verification" class="badge gap-1 badge-primary">
                                <IconShieldCheck class="w-3 h-3" />
                                Verified
                            </span>
                        </div>
                        <p class="truncate text-sm text-base-content/60">@{{ publisher.name }}</p>
                    </div>
                    <div class="flex gap-3 text-sm">
                        <div class="rounded-xl border border-base-300 bg-base-100 px-3 py-2">
                            <div class="font-semibold">{{ total }}</div>
                            <div class="text-base-content/60">Posts</div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Content -->
            <div class="space-y-4 px-4 py-4 lg:px-6">
                <!-- Bio Section -->
                <section class="space-y-4">
                    <div class="card">
                        <div class="card-body p-4">
                            <h2 class="text-sm font-semibold text-base-content/70">Bio</h2>
                            <article
                                v-if="bioHtml"
                                class="prose prose-sm max-w-none"
                                v-html="bioHtml"
                            />
                            <p v-else class="text-sm text-base-content/60">No bio yet.</p>
                        </div>
                    </div>
                    <!-- Verification Info -->
                    <div v-if="publisher.verification" class="card">
                        <div class="card-body p-4">
                            <p class="text-sm font-semibold">
                                {{ publisher.verification.title || 'Verified account' }}
                            </p>
                            <p v-if="publisher.verification.description" class="text-sm text-base-content/70">
                                {{ publisher.verification.description }}
                            </p>
                            <p v-if="publisher.verification.verifiedBy" class="text-xs text-base-content/60">
                                By {{ publisher.verification.verifiedBy }}
                            </p>
                        </div>
                    </div>
                </section>

                <!-- Posts Section with Filters -->
                <section class="space-y-4">
                    <!-- Filter Controls -->
                    <div class="card">
                        <div class="card-body gap-4 p-4">
                            <div v-if="isRefreshing" class="mb-1 flex items-center gap-2 text-sm text-base-content/60">
                                <IconLoader class="w-3.5 h-3.5 animate-spin" />
                                <span>Refreshing feed...</span>
                            </div>

                            <!-- Content Type Tabs -->
                            <div class="join w-full">
                                <button
                                    class="btn join-item flex-1"
                                    :class="contentType === 'all' ? 'btn-primary' : 'border-base-300 bg-base-100 text-base-content hover:bg-base-200'"
                                    @click="setContentType('all')"
                                >
                                    All
                                </button>
                                <button
                                    class="btn join-item flex-1"
                                    :class="contentType === 'posts' ? 'btn-primary' : 'border-base-300 bg-base-100 text-base-content hover:bg-base-200'"
                                    @click="setContentType('posts')"
                                >
                                    Posts
                                </button>
                                <button
                                    class="btn join-item flex-1"
                                    :class="contentType === 'articles' ? 'btn-primary' : 'border-base-300 bg-base-100 text-base-content hover:bg-base-200'"
                                    @click="setContentType('articles')"
                                >
                                    Articles
                                </button>
                            </div>

                            <!-- Filter Buttons -->
                            <div class="grid gap-2 sm:grid-cols-2">
                                <button
                                    class="btn justify-start border-base-300 bg-base-100 text-base-content hover:bg-base-200"
                                    @click="cycleRepliesFilter"
                                >
                                    <IconMessageCircle class="w-3.5 h-3.5" />
                                    <span>Replies: {{ includeReplies === null ? 'Auto' : includeReplies ? 'On' : 'Off' }}</span>
                                </button>
                                <button
                                    class="btn justify-start border-base-300 bg-base-100 text-base-content hover:bg-base-200"
                                    @click="toggleMediaOnly"
                                >
                                    <IconImage class="w-3.5 h-3.5" />
                                    <span>Media only: {{ mediaOnly ? 'On' : 'Off' }}</span>
                                </button>
                                <button
                                    class="btn justify-start border-base-300 bg-base-100 text-base-content hover:bg-base-200"
                                    @click="toggleOrder"
                                >
                                    <IconArrowDownUp class="w-3.5 h-3.5" />
                                    <span>Order: {{ orderDesc ? 'Newest' : 'Oldest' }}</span>
                                </button>
                                <div class="join">
                                    <input
                                        v-model="query"
                                        class="input-bordered input join-item w-full"
                                        placeholder="Search posts"
                                        @keydown.enter="reloadWithFilters"
                                    />
                                    <button class="btn join-item btn-primary" @click="reloadWithFilters">
                                        <IconSearch class="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Error -->
                    <div v-if="error" class="alert alert-error">
                        <span>{{ error }}</span>
                    </div>

                    <!-- Posts List -->
                    <div
                        v-if="posts.length > 0"
                        class="space-y-4"
                        :class="isRefreshing ? 'opacity-60' : 'opacity-100'"
                    >
                        <PostCard
                            v-for="post in posts"
                            :key="post.id"
                            :post="post"
                            @boost="handleBoost"
                            @share="handleShare"
                            @reply="handleReply"
                        />
                    </div>

                    <!-- Load More -->
                    <div v-if="posts.length > 0" class="py-2 text-center">
                        <button
                            v-if="hasMore"
                            class="btn btn-outline"
                            :disabled="isLoading"
                            @click="loadMore"
                        >
                            <IconLoader v-if="isLoading" class="w-4 h-4 animate-spin" />
                            <span>Load more</span>
                        </button>
                        <p v-else class="text-sm text-base-content/50">No more posts</p>
                    </div>

                    <!-- Empty State -->
                    <div
                        v-else-if="!error"
                        class="rounded-xl border border-base-300 bg-base-100 p-8 text-center text-base-content/60"
                    >
                        No posts for this publisher with current filters.
                    </div>
                </section>
            </div>
        </div>
    </NuxtLayout>
</template>

<script setup lang="ts">
import type { Post } from '~/types/post';
import type { Publisher } from '~/types/post';
import { fetchPublisher, fetchPublisherPosts } from '~/utils/api';
import { getFileUrl } from '~/utils/files';
import { renderMarkdown } from '~/utils/markdown';
import {
    IconSearch,
    IconImage,
    IconMessageCircle,
    IconArrowDownUp,
    IconShieldCheck,
    IconUserX,
    IconLoader,
} from '#components';

const route = useRoute();
const publisherName = computed(() => route.params.name as string);

// State
const publisher = ref<Publisher | null>(null);
const posts = ref<Post[]>([]);
const notFound = ref(false);
const error = ref<string | null>(null);
const isLoading = ref(false);
const isRefreshing = ref(false);
const total = ref(0);
const offset = ref(0);
const hasMore = ref(false);

// Filters
const contentType = ref<'all' | 'posts' | 'articles'>('all');
const includeReplies = ref<boolean | null>(null);
const mediaOnly = ref(false);
const orderDesc = ref(true);
const query = ref('');

// Computed
const displayName = computed(() => publisher.value?.nick || publisher.value?.name || 'Unknown');
const avatarUrl = computed(() => getFileUrl(publisher.value?.picture?.id));
const backgroundUrl = computed(() => getFileUrl(publisher.value?.background?.id));
const bioHtml = computed(() => {
    if (!publisher.value?.bio) return '';
    return renderMarkdown(publisher.value.bio);
});

function getInitials(name: string): string {
    return (
        name
            .split(/\s+/)
            .filter(Boolean)
            .map((part) => part[0]?.toUpperCase())
            .slice(0, 2)
            .join('') || '?'
    );
}

function cycleRepliesFilter() {
    if (includeReplies.value === null) includeReplies.value = true;
    else if (includeReplies.value === true) includeReplies.value = false;
    else includeReplies.value = null;
    reloadWithFilters();
}

function toggleMediaOnly() {
    mediaOnly.value = !mediaOnly.value;
    reloadWithFilters();
}

function toggleOrder() {
    orderDesc.value = !orderDesc.value;
    reloadWithFilters();
}

function setContentType(type: 'all' | 'posts' | 'articles') {
    contentType.value = type;
    reloadWithFilters();
}

function buildFilterParams(currentOffset: number): Record<string, string> {
    const params: Record<string, string> = {
        offset: String(currentOffset),
        take: '20',
        orderDesc: String(orderDesc.value),
    };

    if (contentType.value === 'posts') params.type = '0';
    if (contentType.value === 'articles') params.type = '1';
    if (includeReplies.value !== null) params.replies = String(includeReplies.value);
    if (mediaOnly.value) params.media = 'true';
    if (query.value.trim()) params.query = query.value.trim();

    return params;
}

async function reloadWithFilters() {
    if (!publisherName.value) return;
    isLoading.value = true;
    isRefreshing.value = true;
    error.value = null;
    try {
        const result = await fetchPublisherPosts(publisherName.value, 20, 0, {
            type: contentType.value === 'posts' ? '0' : contentType.value === 'articles' ? '1' : undefined,
            replies: includeReplies.value,
            media: mediaOnly.value,
            orderDesc: orderDesc.value,
            queryTerm: query.value.trim() || undefined,
        });
        posts.value = result.posts;
        total.value = result.total;
        offset.value = result.posts.length;
        hasMore.value = result.posts.length < result.total;
    } catch (err) {
        error.value = err instanceof Error ? err.message : 'Failed to load posts';
    } finally {
        isLoading.value = false;
        isRefreshing.value = false;
    }
}

async function loadMore() {
    if (!hasMore.value || isLoading.value) return;
    isLoading.value = true;
    error.value = null;
    try {
        const result = await fetchPublisherPosts(publisherName.value, 20, offset.value, {
            type: contentType.value === 'posts' ? '0' : contentType.value === 'articles' ? '1' : undefined,
            replies: includeReplies.value,
            media: mediaOnly.value,
            orderDesc: orderDesc.value,
            queryTerm: query.value.trim() || undefined,
        });
        const more = result.posts;
        posts.value = [...posts.value, ...more];
        offset.value += more.length;
        hasMore.value = posts.value.length < result.total;
    } catch (err) {
        error.value = err instanceof Error ? err.message : 'Failed to load more posts';
    } finally {
        isLoading.value = false;
    }
}

// Actions
function handleBoost(_post: Post) {
    // TODO: Implement boost
}

function handleShare(post: Post) {
    if (navigator.share) {
        navigator.share({
            title: post.title || `${post.publisher?.nick || post.publisher?.name}'s Post`,
            text: post.content.slice(0, 100),
            url: `${window.location.origin}/posts/${post.id}`,
        });
    }
}

function handleReply(post: Post) {
    // TODO: Open compose dialog for reply
    navigateTo(`/posts/${post.id}`);
}

// Initial load
onMounted(async () => {
    try {
        const data = await fetchPublisher(publisherName.value);
        publisher.value = data;

        // Load initial posts
        const postsResult = await fetchPublisherPosts(publisherName.value, 20, 0);
        posts.value = postsResult.posts;
        total.value = postsResult.total;
        offset.value = postsResult.posts.length;
        hasMore.value = postsResult.posts.length < postsResult.total;

        // SEO
        useHead({
            title: displayName.value,
            meta: [
                { name: 'description', content: data.bio || `@${data.name} on Solar Network` },
            ],
        });
    } catch (err) {
        if (err instanceof Error && err.message.includes('404')) {
            notFound.value = true;
        } else {
            error.value = err instanceof Error ? err.message : 'Failed to load publisher';
        }
    }
});
</script>
