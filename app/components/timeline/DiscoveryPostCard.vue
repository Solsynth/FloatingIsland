<template>
  <div class="card bg-base-100 shadow-sm">
    <div class="card-body p-4">
      <PostCard
        :post="post"
        :embedded="true"
        @boost="$emit('boost', post)"
        @share="$emit('share', post)"
        @reply="$emit('reply', post)"
      />
      <div
        v-if="reasons.length > 0"
        class="flex items-center gap-1.5 mt-2 text-xs text-base-content/50"
      >
        <IconSparkles class="h-3 w-3" />
        <span>{{ reasons[0] }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DiscoveryItem, Post } from "~/types/post";
import { IconSparkles } from "#components";

const props = defineProps<{
  item: DiscoveryItem;
}>();

defineEmits<{
  boost: [post: Post];
  share: [post: Post];
  reply: [post: Post];
}>();

const post = computed(() => props.item.data as unknown as Post);
const reasons = computed(() => props.item.reasons ?? []);
</script>
