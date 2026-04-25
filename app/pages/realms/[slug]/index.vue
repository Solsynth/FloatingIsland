<template>
  <NuxtLayout name="app">
    <!-- Not Found State -->
    <div v-if="notFound" class="mx-auto max-w-2xl p-6">
      <div class="card">
        <div class="card-body items-center text-center">
          <IconUsers class="text-base-content/50 w-10 h-10" />
          <h1 class="text-xl font-bold">Realm not found</h1>
          <p class="text-base-content/60">
            The realm you requested does not exist.
          </p>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="!realm" class="mx-auto max-w-2xl p-6">
      <div class="alert alert-error">
        <span>{{ error || "Failed to load realm" }}</span>
      </div>
    </div>

    <!-- Realm Profile -->
    <div v-else class="mx-auto max-w-5xl">
      <!-- Header Section -->
      <section class="relative overflow-hidden border-base-300">
        <div class="h-40 w-full bg-base-200 sm:h-52">
          <img
            v-if="backgroundUrl"
            :src="backgroundUrl"
            :alt="`${displayName} background`"
            class="h-full w-full object-cover rounded-2xl"
          >
        </div>
        <div
          class="mx-auto -mt-10 flex max-w-5xl flex-col gap-4 px-4 pb-4 sm:-mt-10 sm:flex-row sm:items-end sm:px-6"
        >
          <div class="shrink-0 me-2">
            <div v-if="avatarUrl" class="avatar">
              <div
                class="h-24 w-24 rounded-3xl ring ring-base-300 ring-offset-2 ring-offset-base-100 sm:h-28 sm:w-28"
              >
                <img :src="avatarUrl" :alt="displayName" >
              </div>
            </div>
            <div v-else class="avatar avatar-placeholder">
              <div
                class="h-24 w-24 rounded-3xl bg-primary text-primary-content ring ring-base-300 ring-offset-2 ring-offset-base-100 sm:h-28 sm:w-28"
              >
                <span class="text-2xl font-semibold">{{
                  getInitials(displayName)
                }}</span>
              </div>
            </div>
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <h1 class="truncate text-2xl font-black sm:text-3xl">
                {{ displayName }}
              </h1>
              <span v-if="realm.verification" class="badge gap-1 badge-primary">
                <IconShieldCheck class="w-3 h-3" />
                Verified
              </span>
            </div>
            <p class="truncate text-sm text-base-content/60">
              @{{ realm.slug }}
            </p>
          </div>
          <div class="flex gap-3 text-sm">
            <NuxtLink
              :to="`/realms/${realm.slug}/members`"
              class="rounded-xl border border-base-300 bg-base-100 px-3 py-2 hover:bg-base-200 transition-colors"
            >
              <div class="font-semibold">{{ memberCount }}</div>
              <div class="text-base-content/60">Members</div>
            </NuxtLink>
            <div
              class="rounded-xl border border-base-300 bg-base-100 px-3 py-2"
            >
              <div class="font-semibold">{{ total }}</div>
              <div class="text-base-content/60">Posts</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Content Grid -->
      <div class="grid gap-4 px-4 py-4 lg:px-6 lg:grid-cols-3">
        <!-- Left Column - Main Content -->
        <div class="space-y-4 lg:col-span-2">
          <!-- Description Section -->
          <section class="space-y-4">
            <div class="card">
              <div class="card-body p-4">
                <p
                  v-if="realm.description"
                  class="text-sm text-base-content/80"
                >
                  {{ realm.description }}
                </p>
                <p v-else class="text-sm text-base-content/60">
                  No description yet.
                </p>
                <div class="flex flex-wrap gap-2 pt-1">
                  <span class="badge gap-1 border-info/30 bg-info/15 text-info">
                    <IconUsers v-if="realm.isCommunity" class="w-3 h-3" />
                    <IconBuilding2 v-else class="w-3 h-3" />
                    <span v-if="realm.isCommunity">Community</span>
                    <span v-else>Organization</span>
                  </span>
                  <span
                    :class="`badge gap-1 ${
                      realm.isPublic
                        ? 'border-success/30 bg-success/15 text-success'
                        : 'border-warning/30 bg-warning/20 text-warning'
                    }`"
                  >
                    <IconGlobe v-if="realm.isPublic" class="w-3 h-3" />
                    <IconLock v-else class="w-3 h-3" />
                    <span v-if="realm.isPublic">Public</span>
                    <span v-else>Private</span>
                  </span>
                </div>
              </div>
            </div>

            <!-- Verification Info -->
            <div v-if="realm.verification" class="card">
              <div class="card-body p-4">
                <p class="text-sm font-semibold">
                  {{ realm.verification.title || "Verified realm" }}
                </p>
                <p
                  v-if="realm.verification.description"
                  class="text-sm text-base-content/70"
                >
                  {{ realm.verification.description }}
                </p>
                <p
                  v-if="realm.verification.verifiedBy"
                  class="text-xs text-base-content/60"
                >
                  By {{ realm.verification.verifiedBy }}
                </p>
              </div>
            </div>

            <!-- Join Button -->
            <button
              v-if="realm.isPublic && !isMember"
              class="btn w-full btn-primary sm:w-auto"
              :disabled="isJoining"
              @click="handleJoin"
            >
              <IconLoader v-if="isJoining" class="w-4 h-4 animate-spin" />
              <IconUserPlus v-else class="w-4 h-4" />
              Join Realm
            </button>
          </section>

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
              No posts for this realm with current filters.
            </div>
          </section>
        </div>

        <!-- Right Column - Sidebar -->
        <div class="space-y-4">
          <RealmSidebar
            :realm-slug="realm.slug"
            :is-member="isMember"
            :membership="myMembership"
          />
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { Realm, RealmMember } from "~/types/realm";
import type { Post } from "~/types/post";
import {
  fetchRealm,
  fetchRealmPosts,
  getMyRealmMembership,
  joinRealm,
  fetchRealmMembers,
} from "~/utils/api";
import { getFileUrl } from "~/utils/files";
import {
  IconSearch,
  IconImage,
  IconMessageCircle,
  IconArrowDownUp,
  IconShieldCheck,
  IconUsers,
  IconBuilding2,
  IconGlobe,
  IconLock,
  IconLoader,
  IconUserPlus,
} from "#components";

const route = useRoute();
const realmSlug = computed(() => route.params.slug as string);

// State
const realm = ref<Realm | null>(null);
const posts = ref<Post[]>([]);
const myMembership = ref<RealmMember | null>(null);
const memberCount = ref(0);
const notFound = ref(false);
const error = ref<string | null>(null);
const isLoading = ref(false);
const isRefreshing = ref(false);
const isJoining = ref(false);
const isMember = ref(false);
const total = ref(0);
const offset = ref(0);
const hasMore = ref(false);

// Filters
const contentType = ref<"all" | "posts" | "articles">("all");
const includeReplies = ref<boolean | null>(null);
const mediaOnly = ref(false);
const orderDesc = ref(true);
const query = ref("");

// Computed
const displayName = computed(() => realm.value?.name || "Unknown Realm");
const avatarUrl = computed(() => getFileUrl(realm.value?.picture?.id));
const backgroundUrl = computed(() => getFileUrl(realm.value?.background?.id));

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
  if (!realmSlug.value) return;
  isLoading.value = true;
  isRefreshing.value = true;
  error.value = null;
  try {
    const result = await fetchRealmPosts(realmSlug.value, 20, 0, {
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
    total.value = result.total;
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
    const result = await fetchRealmPosts(realmSlug.value, 20, offset.value, {
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

async function checkMembership() {
  if (!realm.value?.slug) return;
  try {
    const membership = await getMyRealmMembership(realm.value.slug);
    myMembership.value = membership;
    isMember.value = !!membership;
  } catch {
    myMembership.value = null;
    isMember.value = false;
  }
}

async function handleJoin() {
  if (!realm.value?.slug || isJoining.value || isMember.value) return;
  isJoining.value = true;
  try {
    await joinRealm(realm.value.slug);
    await checkMembership();
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Failed to join realm";
  } finally {
    isJoining.value = false;
  }
}

// Actions
function handleBoost(_post: Post) {
  // TODO: Implement boost
}

function handleShare(post: Post) {
  if (navigator.share) {
    navigator.share({
      title:
        post.title || `${post.publisher?.nick || post.publisher?.name}'s Post`,
      text: post.content.slice(0, 100),
      url: `${window.location.origin}/posts/${post.id}`,
    });
  }
}

function handleReply(post: Post) {
  navigateTo(`/posts/${post.id}`);
}

// Initial load
onMounted(async () => {
  try {
    const [data, membersResult] = await Promise.all([
      fetchRealm(realmSlug.value),
      fetchRealmMembers(realmSlug.value, 1, 0).catch(() => ({
        members: [],
        total: 0,
      })),
    ]);
    realm.value = data;
    memberCount.value = membersResult.total;

    // Load initial posts
    const postsResult = await fetchRealmPosts(realmSlug.value, 20, 0);
    posts.value = postsResult.posts;
    total.value = postsResult.total;
    offset.value = postsResult.posts.length;
    hasMore.value = postsResult.posts.length < postsResult.total;

    // Check membership
    await checkMembership();

    // SEO
    useHead({
      title: data.name,
      meta: [
        {
          name: "description",
          content: data.description || `Realm: ${data.name}`,
        },
      ],
    });
  } catch (err) {
    if (err instanceof Error && err.message.includes("404")) {
      notFound.value = true;
    } else {
      error.value = err instanceof Error ? err.message : "Failed to load realm";
    }
  }
});
</script>
