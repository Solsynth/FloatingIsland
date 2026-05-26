<template>
  <NuxtLayout name="app">
    <div class="grid xl:grid-cols-[1fr_20rem] min-w-0">
      <!-- Main Content -->
      <div class="space-y-4 min-w-0">
        <!-- Compose Quick Input -->
        <div
          v-if="isAuthenticated"
          class="card bg-base-100 shadow-sm cursor-pointer transition-shadow hover:shadow-md"
          @click="openCompose"
        >
          <div class="card-body p-4">
            <div class="flex items-center gap-3">
              <div v-if="userAvatar" class="avatar">
                <div class="h-10 w-10 rounded-full">
                  <img
                    :src="userAvatar"
                    :alt="userName"
                    class="h-full w-full rounded-full object-cover"
                  />
                </div>
              </div>
              <div v-else class="avatar avatar-placeholder">
                <div
                  class="h-10 w-10 rounded-full bg-primary text-primary-content"
                >
                  <span class="text-sm font-medium">{{ userInitials }}</span>
                </div>
              </div>
              <div class="flex-1">
                <div
                  class="w-full rounded-field bg-base-200/60 px-4 py-2.5 text-sm text-base-content/50"
                >
                  What's on your mind?
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <ConfuseSpinner
          v-if="status === 'pending' && posts.length === 0"
          message="Loading posts..."
        />

        <!-- Error State -->
        <div v-else-if="error" class="alert alert-soft alert-error shadow-sm">
          <IconAlertCircle class="h-5 w-5" />
          <span>Failed to load posts: {{ error }}</span>
        </div>

        <!-- Posts List -->
        <template v-if="posts.length > 0">
          <PostCard
            v-for="post in posts"
            :key="post.id"
            :post="post"
            @boost="handleBoost"
            @share="handleShare"
            @reply="handleReply"
          />
        </template>

        <!-- Load More -->
        <div class="py-2 flex items-center justify-center">
          <button
            v-if="hasMore && posts.length > 0"
            class="btn btn-ghost bg-base-100 shadow-sm hover:shadow-md"
            :disabled="fetchingMore"
            @click="loadMore"
          >
            <span v-if="fetchingMore">Loading...</span>
            <span v-else>Load more</span>
          </button>
          <p
            v-else-if="!hasMore && posts.length > 0"
            class="text-base-content/40 text-sm"
          >
            No more posts to load
          </p>
        </div>
      </div>

      <!-- Right Sidebar (Desktop only) -->
      <aside class="hidden xl:block sticky top-4 self-start ml-6 mr-4">
        <RightSidebar />
      </aside>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { Post } from "~/types/post";
import { fetchPosts } from "~/utils/api";
import { getFileUrl } from "~/utils/files";
import { IconAlertCircle } from "#components";

useSolarSeo({
  title: "Explore",
  description:
    "Discover the latest posts, updates, and conversations on Solar Network.",
  url: "https://solian.app",
});

const auth = useAuth();
const { isAuthenticated, user } = auth;

const posts = useState<Post[]>("home-posts", () => []);
const total = ref(0);
const offset = ref(0);
const hasMore = ref(true);
const fetchingMore = ref(false);

// User info
const userName = computed(() => user.value?.nick || user.value?.name || "");
const userAvatar = computed(() => getFileUrl(user.value?.profile?.picture?.id));
const userInitials = computed(() => {
  const name = user.value?.name || "?";
  return name.slice(0, 2).toUpperCase();
});

// Initial fetch with useAsyncData for SSR compatibility
const {
  data: initialData,
  status,
  error,
} = await useAsyncData(
  "home-posts-fetch",
  () => {
    const options: Parameters<typeof fetchPosts>[2] = { replies: false };
    return fetchPosts(20, 0, options);
  },
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
    const options: Parameters<typeof fetchPosts>[2] = { replies: false };
    const result = await fetchPosts(20, offset.value, options);

    if (result?.posts) {
      if (result.posts.length === 0) {
        hasMore.value = false;
        return;
      }

      const existing = new Set(posts.value.map((p) => p.id));
      const appended = result.posts.filter((p) => !existing.has(p.id));
      posts.value = [...posts.value, ...appended];
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

function handleReply(post: Post) {
  const compose = useCompose();
  compose.initializeFromState({
    content: "",
    replyingTo: post,
  });
  const event = new CustomEvent("open-compose");
  window.dispatchEvent(event);
}

function openCompose() {
  const event = new CustomEvent("open-compose");
  window.dispatchEvent(event);
}
</script>
