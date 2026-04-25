<template>
  <NuxtLayout name="app">
    <ConfuseSpinner
      v-if="status === 'pending'"
      message="Loading publisher..."
    />

    <!-- Not Found State -->
    <div v-else-if="notFound" class="mx-auto max-w-2xl p-6">
      <div class="card">
        <div class="card-body items-center text-center">
          <IconUserX class="text-base-content/50 w-10 h-10" />
          <h1 class="text-xl font-bold">Publisher not found</h1>
          <p class="text-base-content/60">
            The publisher you requested does not exist.
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

    <!-- Publisher Profile -->
    <div v-else-if="publisher" class="mx-auto max-w-5xl">
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
            <div class="flex flex-wrap items-center gap-2 pt-18">
              <h1 class="truncate text-2xl font-black sm:text-3xl">
                {{ displayName }}
              </h1>
              <span
                v-if="publisher.verification"
                class="badge gap-1 badge-primary"
              >
                <IconShieldCheck class="w-3 h-3" />
                {{ publisher.verification.title || "Verified" }}
              </span>
              <!-- Livestream indicator -->
              <span
                v-if="hasActiveLivestream"
                class="badge badge-error gap-1 cursor-pointer hover:opacity-80"
                @click="goToLivestream"
              >
                <span
                  class="w-2 h-2 rounded-full bg-error-content animate-pulse"
                />
                LIVE
              </span>
            </div>
            <p class="truncate text-sm text-base-content/60">
              @{{ publisher.name }}
            </p>
            <!-- Account link for personal publishers -->
            <div v-if="publisher.type === 0 && publisher.account" class="mt-2">
              <NuxtLink
                :to="`/@${publisher.account.name}`"
                class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary/10 hover:bg-secondary/20 text-sm transition-colors"
              >
                <IconUser class="w-4 h-4" />
                <span> Belongs to @{{ publisher.account.name }} </span>
              </NuxtLink>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex flex-wrap items-center gap-2">
            <!-- Subscribe/Unsubscribe -->
            <template v-if="isAuthenticated && !isOwnPublisher">
              <button
                v-if="subStatus?.status === 'none' || !subStatus"
                class="btn btn-primary"
                :disabled="isSubscribing"
                @click="subscribe"
              >
                <IconLoader v-if="isSubscribing" class="w-4 h-4 animate-spin" />
                <IconPlusCircle v-else class="w-4 h-4" />
                Subscribe
              </button>
              <button
                v-else-if="subStatus?.isPending"
                class="btn btn-outline"
                :disabled="isSubscribing"
                @click="unsubscribe"
              >
                <IconLoader v-if="isSubscribing" class="w-4 h-4 animate-spin" />
                <IconHourglass v-else class="w-4 h-4" />
                Pending
              </button>
              <template v-else>
                <button
                  class="btn btn-primary"
                  :disabled="isSubscribing"
                  @click="unsubscribe"
                >
                  <IconLoader
                    v-if="isSubscribing"
                    class="w-4 h-4 animate-spin"
                  />
                  <IconCheckCircle v-else class="w-4 h-4" />
                  Subscribed
                </button>
                <button
                  class="btn btn-ghost btn-square"
                  :class="
                    subStatus?.subscription?.notify
                      ? 'text-primary'
                      : 'text-base-content/50'
                  "
                  :title="
                    subStatus?.subscription?.notify
                      ? 'Notifications on'
                      : 'Notifications off'
                  "
                  @click="toggleNotify"
                >
                  <IconBell
                    v-if="subStatus?.subscription?.notify"
                    class="w-5 h-5"
                  />
                  <IconBellOff v-else class="w-5 h-5" />
                </button>
              </template>
            </template>

            <button class="btn btn-outline btn-square" @click="shareProfile">
              <IconShare2 class="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      <!-- Content Grid -->
      <div class="grid gap-4 px-4 py-4 lg:px-6 lg:grid-cols-3">
        <!-- Left Column - Main Content -->
        <div class="space-y-4 lg:col-span-2">
          <!-- Bio Section -->
          <div class="card">
            <div class="card-body p-4">
              <h2 class="text-sm font-semibold text-base-content/70 mb-2">
                Bio
              </h2>
              <!-- eslint-disable vue/no-v-html -->
              <div
                v-if="bioHtml"
                class="prose prose-sm max-w-none prose-headings:mb-2 prose-headings:mt-4 prose-p:my-1.5 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-code:text-primary prose-code:bg-base-200 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-base-200 prose-pre:text-sm prose-blockquote:border-l-4 prose-blockquote:border-primary/30 prose-blockquote:pl-4 prose-blockquote:italic prose-ul:my-1.5 prose-ol:my-1.5"
                v-html="bioHtml"
              />
              <!-- eslint-enable vue/no-v-html -->
              <p v-else class="text-sm text-base-content/60">No bio yet.</p>
            </div>
          </div>

          <!-- Pinned Posts -->
          <PinnedPostsCarousel
            :posts="pinnedPosts"
            @boost="handleBoost"
            @share="handleShare"
            @reply="handleReply"
          />

          <!-- Posts Section with Filters -->
          <section class="space-y-4">
            <!-- Filter Controls -->
            <div class="card">
              <div class="card-body gap-4 p-4">
                <div
                  v-if="isRefreshing"
                  class="mb-1 flex items-center gap-2 text-sm text-base-content/60"
                >
                  <IconLoader class="w-3.5 h-3.5 animate-spin" />
                  <span>Refreshing feed...</span>
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

                <!-- Filter Buttons -->
                <div class="grid gap-2 sm:grid-cols-2">
                  <button
                    class="btn justify-start border-base-300 bg-base-100 text-base-content hover:bg-base-200"
                    @click="cycleRepliesFilter"
                  >
                    <IconMessageCircle class="w-3.5 h-3.5" />
                    <span
                      >Replies:
                      {{
                        includeReplies === null
                          ? "Auto"
                          : includeReplies
                            ? "On"
                            : "Off"
                      }}</span
                    >
                  </button>
                  <button
                    class="btn justify-start border-base-300 bg-base-100 text-base-content hover:bg-base-200"
                    @click="toggleMediaOnly"
                  >
                    <IconImage class="w-3.5 h-3.5" />
                    <span>Media only: {{ mediaOnly ? "On" : "Off" }}</span>
                  </button>
                  <button
                    class="btn justify-start border-base-300 bg-base-100 text-base-content hover:bg-base-200"
                    @click="toggleOrder"
                  >
                    <IconArrowDownUp class="w-3.5 h-3.5" />
                    <span>Order: {{ orderDesc ? "Newest" : "Oldest" }}</span>
                  </button>
                  <div class="join">
                    <input
                      v-model="query"
                      class="input-bordered input join-item w-full"
                      placeholder="Search posts"
                      @keydown.enter="reloadWithFilters"
                    >
                    <button
                      class="btn join-item btn-primary"
                      @click="reloadWithFilters"
                    >
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
              No posts from this publisher with current filters.
            </div>
          </section>
        </div>

        <!-- Right Column - Sidebar -->
        <div class="space-y-4">
          <!-- Activity Heatmap -->
          <ActivityHeatmap :heatmap="heatmap" :status="heatmapStatus" />

          <!-- Verification Info -->
          <div v-if="publisher.verification" class="card bg-primary/5">
            <div class="card-body p-4">
              <div class="flex items-center gap-2 mb-2">
                <IconShieldCheck class="w-5 h-5 text-primary" />
                <h3 class="font-semibold">
                  {{ publisher.verification.title }}
                </h3>
              </div>
              <p
                v-if="publisher.verification.description"
                class="text-sm text-base-content/70"
              >
                {{ publisher.verification.description }}
              </p>
              <p
                v-if="publisher.verification.verifiedBy"
                class="text-xs text-base-content/50 mt-2"
              >
                Verified by {{ publisher.verification.verifiedBy }}
              </p>
            </div>
          </div>

          <!-- Publisher Stats -->
          <div class="card">
            <div class="card-body p-4">
              <h3 class="text-sm font-semibold text-base-content/70 mb-3">
                Stats
              </h3>
              <div class="grid grid-cols-2 gap-4">
                <div class="text-center p-3 rounded-xl bg-base-200">
                  <div class="text-2xl font-bold">
                    {{ totalPosts.toLocaleString() }}
                  </div>
                  <div class="text-xs text-base-content/60">Posts</div>
                </div>
                <div class="text-center p-3 rounded-xl bg-base-200">
                  <div class="text-2xl font-bold">
                    {{ pinnedPosts.length }}
                  </div>
                  <div class="text-xs text-base-content/60">Pinned</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { Post, Publisher  } from "~/types/post";
import type { HeatmapData } from "~/utils/api";
import {
  fetchPublisher,
  fetchPublisherPosts,
  fetchPublisherHeatmap,
  fetchPublisherPinnedPosts,
  fetchPublisherSubscriptionStatus,
  subscribeToPublisher,
  unsubscribeFromPublisher,
  setPublisherNotify,
} from "~/utils/api";
import { getFileUrl } from "~/utils/files";
import { renderMarkdown } from "~/utils/markdown";
import { IconSearch } from "#components";

const route = useRoute();
const auth = useAuth();
const publisherName = computed(() => route.params.name as string);

// State
const publisher = ref<Publisher | null>(null);
const pinnedPosts = ref<Post[]>([]);
const posts = ref<Post[]>([]);
const heatmap = ref<HeatmapData | null>(null);
const subStatus = ref<{
  status: "none" | "pending" | "following" | "subscribed";
  isPending: boolean;
  subscription?: { isActive: boolean; notify: boolean };
} | null>(null);
const notFound = ref(false);
const error = ref<string | null>(null);
const isLoading = ref(false);
const isRefreshing = ref(false);
const isSubscribing = ref(false);
const totalPosts = ref(0);
const offset = ref(0);
const hasMore = ref(false);
const heatmapStatus = ref<"pending" | "success" | "error">("pending");

// Filters
const contentType = ref<"all" | "posts" | "articles">("all");
const includeReplies = ref<boolean | null>(null);
const mediaOnly = ref(false);
const orderDesc = ref(true);
const query = ref("");

// Computed
const status = computed(() =>
  publisher.value ? "success" : error.value ? "error" : "pending",
);
const isAuthenticated = computed(() => auth.isAuthenticated);
const isOwnPublisher = computed(() => {
  if (!auth.user || !publisher.value?.account) return false;
  return auth.user.id === publisher.value.account.id;
});
const displayName = computed(
  () => publisher.value?.nick || publisher.value?.name || "Unknown",
);
const avatarUrl = computed(() => getFileUrl(publisher.value?.picture?.id));
const backgroundUrl = computed(() =>
  getFileUrl(publisher.value?.background?.id),
);
const bioHtml = computed(() => {
  if (!publisher.value?.bio) return "";
  return renderMarkdown(publisher.value.bio);
});
const hasActiveLivestream = ref(false); // TODO: fetch from API

// Methods
function getInitials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0]?.toUpperCase())
      .slice(0, 2)
      .join("") || "?"
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

function setContentType(type: "all" | "posts" | "articles") {
  contentType.value = type;
  reloadWithFilters();
}

async function reloadWithFilters() {
  if (!publisherName.value) return;
  isLoading.value = true;
  isRefreshing.value = true;
  error.value = null;
  try {
    const result = await fetchPublisherPosts(publisherName.value, 20, 0, {
      type:
        contentType.value === "posts"
          ? "0"
          : contentType.value === "articles"
            ? "1"
            : undefined,
      replies: includeReplies.value,
      media: mediaOnly.value,
      orderDesc: orderDesc.value,
      queryTerm: query.value.trim() || undefined,
    });
    posts.value = result.posts;
    totalPosts.value = result.total;
    offset.value = result.posts.length;
    hasMore.value = result.posts.length < result.total;
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Failed to load posts";
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
    const result = await fetchPublisherPosts(
      publisherName.value,
      20,
      offset.value,
      {
        type:
          contentType.value === "posts"
            ? "0"
            : contentType.value === "articles"
              ? "1"
              : undefined,
        replies: includeReplies.value,
        media: mediaOnly.value,
        orderDesc: orderDesc.value,
        queryTerm: query.value.trim() || undefined,
      },
    );
    const more = result.posts;
    posts.value = [...posts.value, ...more];
    offset.value += more.length;
    hasMore.value = posts.value.length < result.total;
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : "Failed to load more posts";
  } finally {
    isLoading.value = false;
  }
}

async function subscribe() {
  if (!publisherName.value) return;
  isSubscribing.value = true;
  try {
    await subscribeToPublisher(publisherName.value);
    await loadSubscriptionStatus();
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Failed to subscribe";
  } finally {
    isSubscribing.value = false;
  }
}

async function unsubscribe() {
  if (!publisherName.value) return;
  const confirmed = confirm("Are you sure you want to unsubscribe?");
  if (!confirmed) return;
  isSubscribing.value = true;
  try {
    await unsubscribeFromPublisher(publisherName.value);
    await loadSubscriptionStatus();
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Failed to unsubscribe";
  } finally {
    isSubscribing.value = false;
  }
}

async function toggleNotify() {
  if (!publisherName.value || !subStatus.value?.subscription) return;
  const currentNotify = subStatus.value.subscription.notify;
  try {
    await setPublisherNotify(publisherName.value, !currentNotify);
    await loadSubscriptionStatus();
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : "Failed to update notification";
  }
}

async function loadSubscriptionStatus() {
  if (!isAuthenticated.value || !publisherName.value) return;
  try {
    const status = await fetchPublisherSubscriptionStatus(publisherName.value);
    subStatus.value = status;
  } catch {
    subStatus.value = null;
  }
}

async function shareProfile() {
  if (publisher.value?.name) {
    const url = `https://solian.app/${publisher.value.name}`;
    if (navigator.share) {
      await navigator.share({
        title: displayName.value,
        url,
      });
    } else {
      await navigator.clipboard.writeText(url);
    }
  }
}

function goToLivestream() {
  // TODO: Navigate to livestream
}

function handleBoost(_post: Post) {
  // TODO: Implement boost
}

function handleShare(post: Post) {
  navigator.share?.({
    title:
      post.title || `${post.publisher?.nick || post.publisher?.name}'s Post`,
    text: post.content.slice(0, 100),
    url: `${window.location.origin}/posts/${post.id}`,
  });
}

function handleReply(post: Post) {
  navigateTo(`/posts/${post.id}`);
}

// Initial load
onMounted(async () => {
  try {
    const [pubData, pinned, heatmapData] = await Promise.all([
      fetchPublisher(publisherName.value),
      fetchPublisherPinnedPosts(publisherName.value),
      fetchPublisherHeatmap(publisherName.value),
    ]);
    publisher.value = pubData;
    pinnedPosts.value = pinned;
    heatmap.value = heatmapData;
    heatmapStatus.value = "success";

    // Load posts
    await reloadWithFilters();

    // Load subscription if authenticated
    if (isAuthenticated.value) {
      await loadSubscriptionStatus();
    }

    // SEO
    useHead({
      title: displayName.value,
      meta: [
        {
          name: "description",
          content: pubData.bio || `@${pubData.name} on Solar Network`,
        },
      ],
    });
  } catch (err) {
    if (err instanceof Error && err.message.includes("404")) {
      notFound.value = true;
    } else {
      error.value =
        err instanceof Error ? err.message : "Failed to load publisher";
    }
  }
});
</script>
