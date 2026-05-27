<template>
  <PostCard
    :post="post"
    @boost="$emit('boost', post)"
    @share="$emit('share', post)"
    @reply="$emit('reply', post)"
  />
</template>

<script setup lang="ts">
import type { Post, SnTimelineEvent } from "~/types/post";

const props = defineProps<{
  event: SnTimelineEvent;
}>();

defineEmits<{
  boost: [post: Post];
  share: [post: Post];
  reply: [post: Post];
}>();

const post = computed(() => props.event.data as Post);
</script>
