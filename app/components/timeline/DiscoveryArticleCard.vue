<template>
  <div class="card bg-base-100 shadow-sm">
    <div class="card-body p-4">
      <div class="flex items-center gap-2 mb-3">
        <IconNewspaper class="h-4 w-4 text-info" />
        <span class="text-xs font-medium text-base-content/60">Web Article</span>
      </div>
      <div v-if="article.image" class="aspect-video w-full overflow-hidden rounded-lg mb-3">
        <img :src="article.image" :alt="article.title || 'Article'" class="h-full w-full object-cover" loading="lazy" />
      </div>
      <div>
        <h3 v-if="article.title" class="font-semibold text-sm line-clamp-2">{{ article.title }}</h3>
        <p v-if="article.description" class="text-xs text-base-content/60 line-clamp-2 mt-1">{{ article.description }}</p>
        <div class="flex items-center gap-2 mt-2 text-xs text-base-content/50">
          <IconLink class="h-3 w-3" />
          <span class="truncate">{{ article.siteName || getHost(article.url) }}</span>
        </div>
      </div>
      <div class="flex items-center gap-2 mt-3">
        <button class="btn btn-info btn-xs flex-1" @click="openArticle">
          Read Article
          <IconExternalLink class="h-3 w-3 ml-1" />
        </button>
      </div>
      <div v-if="reasons.length > 0" class="flex items-center gap-1.5 mt-2 text-xs text-base-content/50">
        <IconSparkles class="h-3 w-3" />
        <span>{{ reasons[0] }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DiscoveryItem, SnWebArticle } from "~/types/post";
import { IconNewspaper, IconLink, IconExternalLink, IconSparkles } from "#components";

const props = defineProps<{
  item: DiscoveryItem;
}>();

const article = computed(() => props.item.data as unknown as SnWebArticle);
const reasons = computed(() => props.item.reasons ?? []);

function getHost(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

function openArticle() {
  window.open(article.value.url, "_blank", "noopener,noreferrer");
}
</script>
