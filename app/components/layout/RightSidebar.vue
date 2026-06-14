<template>
  <div class="flex flex-col gap-6">
    <!-- Search -->
    <div class="relative">
      <input
        v-model="searchQuery"
        type="text"
        :placeholder="t('common.search')"
        class="input w-full bg-base-100 shadow-sm border-0 focus:bg-base-100 focus:shadow-md focus:outline-none"
        @keyup.enter="handleSearch"
      />
      <button
        class="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content/70 transition-colors"
        @click="handleSearch"
      >
        <IconSearch class="h-4 w-4" />
      </button>
    </div>

    <!-- Check-In Widget (authenticated only) -->
    <CheckInWidget v-if="isAuthenticated" />

    <!-- Categories -->
    <div v-if="categories.length > 0" class="card bg-base-100 shadow-sm">
      <div class="card-body p-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-semibold text-base-content/70">{{ t("sidebar.categories") }}</h3>
          <NuxtLink
            to="/categories"
            class="text-xs text-primary hover:underline"
          >
            {{ t("sidebar.viewAll") }}
          </NuxtLink>
        </div>
        <div class="space-y-1">
          <NuxtLink
            v-for="category in categories.slice(0, 5)"
            :key="category.id"
            :to="`/categories/${category.slug}`"
            class="flex items-center gap-2 p-2 rounded-lg hover:bg-base-200 transition-colors"
          >
            <div
              class="w-6 h-6 rounded flex items-center justify-center"
              :style="{ backgroundColor: category.color || '#6366f1' }"
            >
              <IconFolder class="w-3 h-3 text-white" />
            </div>
            <span class="text-sm truncate">{{ category.name }}</span>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Tags -->
    <div v-if="tags.length > 0" class="card bg-base-100 shadow-sm">
      <div class="card-body p-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-semibold text-base-content/70">{{ t("sidebar.tags") }}</h3>
          <NuxtLink
            to="/categories?tab=tags"
            class="text-xs text-primary hover:underline"
          >
            {{ t("sidebar.viewAll") }}
          </NuxtLink>
        </div>
        <div class="flex flex-wrap gap-1.5">
          <NuxtLink
            v-for="tag in tags.slice(0, 10)"
            :key="tag.id"
            :to="`/tags/${tag.slug}`"
            class="badge badge-sm badge-ghost hover:badge-primary transition-colors"
          >
            #{{ tag.name || tag.slug }}
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Legal Footer -->
    <div class="px-2 text-xs leading-relaxed text-base-content/40">
      <p>{{ t("sidebar.copyright", { year: currentYear }) }}</p>
      <div class="flex flex-wrap gap-2 text-xs">
        <a href="/about" class="link link-hover">{{ t("sidebar.about") }}</a>
        <span class="text-base-content/30">&middot;</span>
        <a href="/privacy" class="link link-hover">{{ t("sidebar.privacy") }}</a>
        <span class="text-base-content/30">&middot;</span>
        <a href="/terms" class="link link-hover">{{ t("sidebar.terms") }}</a>
        <span class="text-base-content/30">&middot;</span>
        <a href="/help" class="link link-hover">{{ t("sidebar.help") }}</a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IconSearch, IconFolder } from "#components";
import {
  fetchCategories,
  fetchTags,
  type PostCategory,
  type PostTag,
} from "~/utils/api";

const { t } = useI18n();

const auth = useAuth();
const { isAuthenticated } = auth;
const currentYear = new Date().getFullYear();
const searchQuery = ref("");

const categories = ref<PostCategory[]>([]);
const tags = ref<PostTag[]>([]);

function handleSearch() {
  if (searchQuery.value.trim()) {
    navigateTo(`/search?q=${encodeURIComponent(searchQuery.value.trim())}`);
  }
}

async function loadData() {
  try {
    const [categoriesResult, tagsResult] = await Promise.all([
      fetchCategories(5, 0),
      fetchTags(10, 0),
    ]);
    categories.value = categoriesResult.categories;
    tags.value = tagsResult.tags;
  } catch (e) {
    console.error("Failed to load sidebar data:", e);
  }
}

onMounted(() => {
  loadData();
});
</script>
