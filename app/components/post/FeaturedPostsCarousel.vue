<template>
  <div v-if="posts.length > 0" class="card bg-base-100 shadow-sm">
    <div class="card-body p-0">
      <!-- Header -->
      <div
        class="flex items-center gap-2 px-4 h-12 cursor-pointer select-none"
        @click="toggleCollapse"
      >
        <IconSparkles class="h-4 w-4 text-primary shrink-0" />
        <span class="text-sm font-semibold flex-1">
          {{ t("home.featuredPosts") }}
        </span>

        <!-- Navigation arrows (only when expanded) -->
        <template v-if="!isCollapsed && posts.length > 1">
          <button
            class="btn btn-ghost btn-xs btn-square"
            :disabled="currentPage === 0"
            @click.stop="prevPage"
          >
            <IconChevronLeft class="h-4 w-4" />
          </button>
          <button
            class="btn btn-ghost btn-xs btn-square"
            :disabled="currentPage === posts.length - 1"
            @click.stop="nextPage"
          >
            <IconChevronRight class="h-4 w-4" />
          </button>
        </template>

        <!-- Collapse toggle -->
        <button class="btn btn-ghost btn-xs btn-square" @click.stop="toggleCollapse">
          <IconChevronDown
            class="h-4 w-4 transition-transform duration-200"
            :class="{ '-rotate-180': !isCollapsed }"
          />
        </button>
      </div>

      <!-- Collapsible content -->
      <div
        ref="contentRef"
        class="overflow-hidden transition-all duration-300 ease-in-out"
        :style="{ maxHeight: contentHeight }"
      >
        <div class="px-4 pb-4">
          <!-- Loading -->
          <div v-if="loading" class="flex items-center justify-center py-8">
            <span class="loading loading-spinner loading-sm text-primary" />
          </div>

          <!-- Error -->
          <div v-else-if="error" class="text-sm text-base-content/50 py-4 text-center">
            {{ t("home.featuredPostsFailed") }}
          </div>

          <!-- Featured posts carousel -->
          <div v-else class="relative">
            <div class="overflow-hidden rounded-xl">
              <div
                class="flex transition-transform duration-300 ease-out"
                :style="{ transform: `translateX(-${currentPage * 100}%)` }"
              >
                <div
                  v-for="post in posts"
                  :key="post.id"
                  class="w-full shrink-0"
                >
                  <PostCard
                    :post="post"
                    embedded
                    @boost="(p: Post) => emit('boost', p)"
                    @share="(p: Post) => emit('share', p)"
                    @reply="(p: Post) => emit('reply', p)"
                  />
                </div>
              </div>
            </div>

            <!-- Page indicators -->
            <div
              v-if="posts.length > 1"
              class="flex items-center justify-center gap-1.5 mt-3"
            >
              <button
                v-for="(_, i) in posts"
                :key="i"
                class="h-1.5 rounded-full transition-all duration-200"
                :class="
                  i === currentPage
                    ? 'w-4 bg-primary'
                    : 'w-1.5 bg-base-300 hover:bg-base-content/30'
                "
                @click="goToPage(i)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Post } from '~/types/post';
import { fetchFeaturedPosts } from '~/utils/api';
import { IconSparkles, IconChevronLeft, IconChevronRight, IconChevronDown } from '#components';

const { t } = useI18n();

const emit = defineEmits<{
  boost: [post: Post];
  share: [post: Post];
  reply: [post: Post];
}>();

const STORAGE_KEY = 'featured_posts_collapsed';

const posts = ref<Post[]>([]);
const loading = ref(true);
const error = ref(false);
const currentPage = ref(0);
const contentRef = ref<HTMLElement | null>(null);
const contentHeight = ref('0px');

// Collapse state from localStorage
const isCollapsed = ref(true);

function loadCollapseState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    isCollapsed.value = stored === 'true';
  } catch {
    isCollapsed.value = false;
  }
}

function saveCollapseState() {
  try {
    localStorage.setItem(STORAGE_KEY, String(isCollapsed.value));
  } catch {
    // localStorage unavailable
  }
}

function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value;
  saveCollapseState();
}

// Animate max-height for smooth open/close
watch(isCollapsed, () => {
  if (!contentRef.value) return;
  if (isCollapsed.value) {
    contentHeight.value = '0px';
  } else {
    // Height auto requires capturing scrollHeight
    const el = contentRef.value;
    el.style.maxHeight = '';
    requestAnimationFrame(() => {
      contentHeight.value = el.scrollHeight + 'px';
    });
  }
});

// On mount, load collapse state and fetch posts
onMounted(async () => {
  loadCollapseState();

  // Set initial height if not collapsed
  if (!isCollapsed.value && contentRef.value) {
    requestAnimationFrame(() => {
      if (contentRef.value) {
        contentHeight.value = contentRef.value.scrollHeight + 'px';
      }
    });
  }

  try {
    const data = await fetchFeaturedPosts();
    posts.value = data;
  } catch (e) {
    console.error('Failed to fetch featured posts:', e);
    error.value = true;
  } finally {
    loading.value = false;
  }
});

function prevPage() {
  if (currentPage.value > 0) currentPage.value--;
}

function nextPage() {
  if (currentPage.value < posts.value.length - 1) currentPage.value++;
}

function goToPage(index: number) {
  currentPage.value = index;
}
</script>
