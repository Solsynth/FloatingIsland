<template>
  <div
    v-if="replies.length > 0"
    class="rounded-xl border border-base-300 bg-base-200/30 overflow-hidden"
  >
    <!-- Header -->
    <div class="px-3 py-2 flex items-center justify-between">
      <span class="text-sm font-semibold text-base-content/70">
        {{ totalReplies }} {{ totalReplies === 1 ? 'reply' : 'replies' }}
      </span>
      <button
        v-if="!isOpen"
        class="btn btn-ghost btn-xs"
        @click.stop="loadReplies"
      >
        View replies
      </button>
    </div>

    <!-- Reply list -->
    <div v-if="isOpen" class="divide-y divide-base-300/50">
      <div
        v-for="reply in displayReplies"
        :key="reply.id"
        class="px-3 py-2 hover:bg-base-200/50 cursor-pointer transition-colors"
        @click.stop="navigateToPost(reply.id)"
      >
        <div class="flex gap-2">
          <!-- Avatar -->
          <NuxtLink
            v-if="reply.publisher"
            :to="`/publishers/${reply.publisher.name}`"
            class="shrink-0"
            @click.stop
          >
            <div v-if="getAvatarUrl(reply)" class="avatar">
              <div class="h-8 w-8 rounded-full">
                <img
                  :src="getAvatarUrl(reply)"
                  :alt="getDisplayName(reply.publisher)"
                  class="h-full w-full rounded-full object-cover"
                >
              </div>
            </div>
            <div v-else class="avatar avatar-placeholder">
              <div class="h-8 w-8 rounded-full bg-primary text-primary-content">
                <span class="text-xs font-medium">
                  {{ getInitials(getDisplayName(reply.publisher)) }}
                </span>
              </div>
            </div>
          </NuxtLink>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-1.5 mb-0.5">
              <NuxtLink
                v-if="reply.publisher"
                :to="`/publishers/${reply.publisher.name}`"
                class="text-xs font-semibold truncate hover:underline"
                @click.stop
              >
                {{ getDisplayName(reply.publisher) }}
              </NuxtLink>
              <span
                v-if="reply.publisher?.name"
                class="text-xs text-base-content/50 truncate"
              >
                @{{ reply.publisher.name }}
              </span>
              <span class="text-xs text-base-content/40">
                {{ formatRelativeTime(reply.publishedAt) }}
              </span>
            </div>

            <!-- Reply content preview -->
            <!-- eslint-disable vue/no-v-html -->
            <div
              v-if="reply.content"
              class="prose prose-xs max-w-none break-words text-xs line-clamp-2 prose-p:my-0.5 prose-a:text-primary"
              v-html="renderMarkdown(reply.content)"
            />
            <!-- eslint-enable vue/no-v-html -->

            <!-- Attachments indicator -->
            <div
              v-if="reply.attachments.length > 0"
              class="mt-1 flex items-center gap-1 text-xs text-base-content/50"
            >
              <IconPaperclip class="h-3 w-3" />
              <span>{{ reply.attachments.length }} attachment(s)</span>
            </div>

            <!-- Reply actions -->
            <div class="mt-1 flex items-center gap-2 text-xs text-base-content/50">
              <button
                class="flex items-center gap-1 hover:text-primary transition-colors"
                @click.stop="handleReplyToReply(reply)"
              >
                <IconReply class="h-3 w-3" />
                <span>{{ reply.repliesCount || 0 }}</span>
              </button>
              <button
                class="flex items-center gap-1 hover:text-success transition-colors"
                @click.stop="handleBoostReply(reply)"
              >
                <IconRepeat2 class="h-3 w-3" />
                <span>{{ reply.boostCount || 0 }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Load more -->
      <button
        v-if="hasMore"
        class="w-full px-3 py-2 text-sm text-primary hover:bg-base-200/50 transition-colors"
        @click.stop="loadMore"
      >
        Load more replies...
      </button>

      <!-- View all link -->
      <NuxtLink
        v-if="totalReplies > 3"
        :to="`/posts/${postId}`"
        class="block px-3 py-2 text-sm text-primary hover:bg-base-200/50 transition-colors text-center"
        @click.stop
      >
        View all {{ totalReplies }} replies
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Post } from '~/types/post';
import { fetchPostReplies } from '~/utils/api';
import { getFileUrl } from '~/utils/files';
import { renderMarkdown } from '~/utils/markdown';
import {
  IconPaperclip,
  IconReply,
  IconRepeat2,
} from '#components';

interface Props {
  postId: string;
  totalReplies: number;
  initialReplies?: Post[];
}

const props = withDefaults(defineProps<Props>(), {
  initialReplies: () => [],
});

const emit = defineEmits<{
  reply: [post: Post];
  boost: [post: Post];
}>();

const isOpen = ref(false);
const replies = ref<Post[]>(props.initialReplies);
const loading = ref(false);
const offset = ref(props.initialReplies.length);
const hasMore = ref(true);

const displayReplies = computed(() => {
  return replies.value.slice(0, 3);
});

async function loadReplies() {
  if (replies.value.length > 0) {
    isOpen.value = true;
    return;
  }

  loading.value = true;
  try {
    const result = await fetchPostReplies(props.postId);
    replies.value = result;
    offset.value = result.length;
    hasMore.value = result.length >= 10; // Assume 10 per page
    isOpen.value = true;
  } catch (e) {
    console.error('Failed to load replies:', e);
  } finally {
    loading.value = false;
  }
}

async function loadMore() {
  if (loading.value || !hasMore.value) return;
  loading.value = true;
  try {
    const result = await fetchPostReplies(props.postId);
    replies.value = [...replies.value, ...result];
    offset.value += result.length;
    hasMore.value = result.length >= 10;
  } catch (e) {
    console.error('Failed to load more replies:', e);
  } finally {
    loading.value = false;
  }
}

function navigateToPost(postId: string) {
  navigateTo(`/posts/${postId}`);
}

function getDisplayName(target: Post['publisher']): string {
  if (!target) return 'Unknown';
  return target.nick || target.name || 'Unknown';
}

function getAvatarUrl(post: Post): string {
  if (!post.publisher) return '';
  return getFileUrl(post.publisher.picture?.id) || '';
}

function getInitials(name: string): string {
  if (!name || name === 'Unknown') return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function handleReplyToReply(post: Post) {
  emit('reply', post);
}

function handleBoostReply(post: Post) {
  emit('boost', post);
}
</script>
