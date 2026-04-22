<template>
  <NuxtLayout name="app">
    <div class="grid lg:grid-cols-[1fr_20rem] gap-4">
      <!-- Main Content -->
      <div>
        <ConfuseSpinner
          v-if="postStatus === 'pending'"
          message="Loading post..."
        />

        <template v-else-if="post">
          <!-- Original Post -->
          <PostCard :post="post" @boost="handleBoost" @share="handleShare" />

          <!-- Replies -->
          <div class="mt-6">
            <h2 class="text-lg font-bold mb-4 px-1">
              Replies ({{ replies.length }})
            </h2>
            <div class="space-y-4">
              <PostCard
                v-for="reply in replies"
                :key="reply.id"
                :post="reply"
                @boost="handleBoost"
                @share="handleShare"
              />
            </div>
            <p
              v-if="replies.length === 0"
              class="text-center text-base-content/40 py-8"
            >
              No replies yet. Be the first to reply!
            </p>
          </div>
        </template>

        <div v-else class="alert alert-warning">
          <IconAlertTriangle class="w-5 h-5" />
          <span>Post not found</span>
        </div>
      </div>

      <!-- Right Sidebar - Publisher Info -->
      <aside class="hidden lg:block sticky top-0 self-start mr-4">
        <PublisherSidebar :publisher="post?.publisher" />
      </aside>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { Post } from "~/types/post";
import { fetchPost, fetchPostReplies } from "~/utils/api";

const route = useRoute();
const postId = computed(() => route.params.id as string);

// Fetch post with useAsyncData
const { data: post, status: postStatus } = await useAsyncData(
  () => `post-${postId.value}`,
  () => fetchPost(postId.value),
  {
    watch: [postId],
  },
);

// Fetch replies with useAsyncData
const { data: replies } = await useAsyncData(
  () => `post-replies-${postId.value}`,
  () => fetchPostReplies(postId.value),
  {
    watch: [postId],
    default: () => [],
  },
);

// SEO
watch(
  post,
  (p) => {
    if (p) {
      useHead({
        title: p.title || `${p.publisher?.nick || p.publisher?.name}'s Post`,
        meta: [
          {
            name: "description",
            content: p.description || p.content.slice(0, 160),
          },
        ],
      });
    }
  },
  { immediate: true },
);

function handleBoost(_p: Post) {}
function handleShare(p: Post) {
  if (navigator.share) {
    navigator.share({
      title: p.title || "Post on Floating Island",
      text: p.content.slice(0, 100),
      url: window.location.href,
    });
  }
}
</script>
