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
                  {{ t("home.composePlaceholder") }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Featured Posts -->
        <ClientOnly>
          <FeaturedPostsCarousel
            @boost="handleBoost"
            @share="handleShare"
            @reply="handleReply"
          />
        </ClientOnly>

        <!-- Loading State -->
        <ConfuseSpinner
          v-if="status === 'pending' && timelineEvents.length === 0"
          :message="t('home.loadingPosts')"
        />

        <!-- Error State -->
        <div v-else-if="error" class="alert alert-soft alert-error shadow-sm">
          <IconAlertCircle class="h-5 w-5" />
          <span>{{ t("home.loadFailed", { error: String(error) }) }}</span>
        </div>

        <!-- Timeline Events -->
        <template v-if="timelineEvents.length > 0">
          <TimelineEventRenderer
            v-for="event in timelineEvents"
            :key="event.id"
            :event="event"
            @boost="handleBoost"
            @share="handleShare"
            @reply="handleReply"
          />
        </template>

        <!-- Load More -->
        <div class="py-2 flex items-center justify-center">
          <button
            v-if="hasMore && timelineEvents.length > 0"
            class="btn btn-ghost bg-base-100 shadow-sm hover:shadow-md"
            :disabled="fetchingMore"
            @click="loadMore"
          >
            <span v-if="fetchingMore">{{ t("common.loading") }}</span>
            <span v-else>{{ t("common.loadMore") }}</span>
          </button>
          <p
            v-else-if="!hasMore && timelineEvents.length > 0"
            class="text-base-content/40 text-sm"
          >
            {{ t("common.noMore") }}
          </p>
        </div>
      </div>

      <!-- Right Sidebar (Desktop only) -->
      <aside class="hidden xl:block sticky top-4 self-start ml-6 mr-4">
        <RightSidebar />
      </aside>
    </div>

    <!-- Onboarding Modal -->
    <ClientOnly>
      <OnboardingModal />
    </ClientOnly>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { Post, SnTimelineEvent } from "~/types/post";
import { fetchTimeline } from "~/utils/api";
import { getFileUrl } from "~/utils/files";
import { IconAlertCircle } from "#components";

const { t } = useI18n();

const seoTitle = computed(() => t('home.seoTitle'))
const seoDescription = computed(() => t('home.seoDescription'))

defineOgImage('UniOgImage', { title: seoTitle, description: seoDescription })

useSolarSeo({
  title: t("home.seoTitle"),
  description: t("home.seoDescription"),
  url: "https://solian.app",
  breadcrumbs: [
    { name: 'Home', item: 'https://solian.app' }
  ]
});

const auth = useAuth();
const { isAuthenticated, user } = auth;

const timelineEvents = useState<SnTimelineEvent[]>("home-timeline", () => []);
const cursor = ref<string | null>(null);
const timelineMode = ref("personalized");
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
  "home-timeline-fetch",
  () => fetchTimeline(20),
  {
    default: () => ({ items: [], nextCursor: null, mode: "personalized" }),
  },
);

watch(
  initialData,
  (data) => {
    if (data?.items) {
      timelineEvents.value = data.items;
      cursor.value = data.nextCursor;
      timelineMode.value = data.mode;
      hasMore.value = data.nextCursor !== null;
    }
  },
  { immediate: true },
);

async function loadMore() {
  if (!hasMore.value || fetchingMore.value || !cursor.value) return;
  fetchingMore.value = true;

  try {
    const result = await fetchTimeline(20, {
      cursor: cursor.value,
      mode: timelineMode.value,
    });

    if (result?.items) {
      if (result.items.length === 0) {
        hasMore.value = false;
        return;
      }

      const existing = new Set(timelineEvents.value.map((e) => e.id));
      const appended = result.items.filter((e) => !existing.has(e.id));
      timelineEvents.value = [...timelineEvents.value, ...appended];
      cursor.value = result.nextCursor;
      hasMore.value = result.nextCursor !== null;
    }
  } catch (e) {
    console.error("Failed to load more timeline events:", e);
  } finally {
    fetchingMore.value = false;
  }
}

function handleBoost(_post: Post) {}

function handleShare(post: Post) {
  if (navigator.share) {
    navigator.share({
      title: post.title || t("home.sharePostFallbackTitle"),
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
