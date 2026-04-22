<template>
    <NuxtLayout name="app">
        <div class="space-y-4">
            <ConfuseSpinner
                v-if="status === 'pending' && posts.length === 0"
                message="Loading posts..."
            />

            <div v-else-if="error" class="alert alert-error">
                <IconAlertCircle class="w-5 h-5" />
                <span>Failed to load posts: {{ error }}</span>
            </div>

            <template v-if="posts.length > 0">
                <PostCard
                    v-for="post in posts"
                    :key="post.id"
                    :post="post"
                    @boost="handleBoost"
                    @share="handleShare"
                />
            </template>

            <!-- Load More Trigger -->
            <div
                ref="loadMoreRef"
                class="h-10 flex items-center justify-center"
            >
                <ConfuseSpinner v-if="fetchingMore" message="Loading more..." />
                <p
                    v-else-if="!hasMore && posts.length > 0"
                    class="text-base-content/40 text-sm"
                >
                    No more posts to load
                </p>
            </div>
        </div>
    </NuxtLayout>
</template>

<script setup lang="ts">
import { nextTick } from "vue";
import type { Post } from "~/types/post";
import { fetchPosts } from "~/utils/api";

useHead({
    title: "Explore",
    meta: [{ name: "description", content: "Explore posts on Solar Network" }],
});

const posts = useState<Post[]>("home-posts", () => []);
const total = ref(0);
const offset = ref(0);
const hasMore = ref(true);
const fetchingMore = ref(false);
const loadMoreRef = ref<HTMLElement | null>(null);

// Initial fetch with useAsyncData for SSR compatibility
const {
    data: initialData,
    status,
    error,
} = await useAsyncData(
    "home-posts-fetch",
    () => fetchPosts(20, 0, { replies: false }),
    {
        default: () => ({ posts: [], total: 0 }),
    },
);

watch(
    initialData,
    (data) => {
        if (data?.posts) {
            posts.value = data.posts;
            total.value = data.total;
            offset.value = data.posts.length;
            hasMore.value = offset.value < data.total;
        }
    },
    { immediate: true },
);

async function loadMore() {
    if (!hasMore.value || fetchingMore.value) return;
    fetchingMore.value = true;

    try {
        const result = await fetchPosts(20, offset.value, { replies: false });

        if (result?.posts) {
            posts.value = [...posts.value, ...result.posts];
            offset.value += result.posts.length;
            hasMore.value = offset.value < result.total;
        }
    } catch (e) {
        console.error("Failed to load more posts:", e);
    } finally {
        fetchingMore.value = false;
    }
}

function handleBoost(_post: Post) {}

function handleShare(post: Post) {
    if (navigator.share) {
        navigator.share({
            title: post.title || "Post on Floating Island",
            text: post.content.slice(0, 100),
            url: `${window.location.origin}/posts/${post.id}`,
        });
    }
}

// Intersection Observer for infinite scroll
let observer: IntersectionObserver | null = null;

onMounted(() => {
    // Delay observer setup to ensure DOM is fully rendered
    nextTick(() => {
        if (!loadMoreRef.value) return;

        observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                if (
                    entry.isIntersecting &&
                    status.value !== 'pending' &&
                    hasMore.value &&
                    !fetchingMore.value &&
                    posts.value.length > 0
                ) {
                    loadMore();
                }
            },
            { rootMargin: "100px" },
        );

        observer.observe(loadMoreRef.value);

        // Trigger loadMore if element is already visible (large screens)
        const rect = loadMoreRef.value.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
        if (
            isVisible &&
            status.value !== 'pending' &&
            hasMore.value &&
            !fetchingMore.value &&
            posts.value.length > 0
        ) {
            loadMore();
        }
    });
});

onBeforeUnmount(() => {
    observer?.disconnect();
});
</script>
