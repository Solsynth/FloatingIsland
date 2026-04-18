<template>
    <div
        class="card bg-base-100 shadow-xl cursor-pointer hover:shadow-2xl transition-shadow"
        @click="navigateToPost"
    >
        <div class="card-body p-4 sm:p-5">
            <!-- Reference Post (Reply/Forward context) -->
            <div
                v-if="referencePost"
                class="mb-3 p-3 bg-base-200/50 rounded-xl text-sm border border-base-300/50"
                @click.stop="navigateToReferencePost"
            >
                <div class="flex items-center gap-2 mb-1">
                    <IconCornerDownRight class="w-3 h-3 text-base-content/40" />
                    <span class="font-semibold text-xs text-base-content/50">
                        {{ referenceLabel }}
                    </span>
                </div>
                <p class="line-clamp-2 text-base-content/70 truncate">
                    {{ truncateContent(referencePost.content, 120) }}
                </p>
            </div>

            <!-- Publisher Header -->
            <div class="flex items-center gap-3 mb-2">
                <div class="avatar">
                    <div
                        class="w-10 h-10 rounded-full bg-base-300 overflow-hidden"
                    >
                        <img
                            v-if="publisherPictureUrl"
                            :src="publisherPictureUrl"
                            :alt="publisherName"
                            class="w-full h-full object-cover"
                            @error="handleImageError"
                        />
                        <div
                            v-else
                            class="w-full h-full flex items-center justify-center text-base-content/50"
                        >
                            <span class="text-sm font-medium">{{
                                publisherInitials
                            }}</span>
                        </div>
                    </div>
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-1">
                        <span class="font-semibold truncate">{{
                            publisherName
                        }}</span>
                        <IconBadgeCheck
                            v-if="isVerified"
                            class="w-4 h-4 text-blue-500 shrink-0"
                        />
                    </div>
                    <div class="text-xs text-base-content/50">
                        <time :datetime="post.publishedAt">{{
                            formatRelativeTime(post.publishedAt)
                        }}</time>
                        <span v-if="post.editedAt" class="ml-1">(edited)</span>
                    </div>
                </div>
                <!-- Visibility Badge -->
                <div
                    class="badge badge-sm"
                    :class="visibilityClass"
                    :title="visibilityLabel"
                >
                    <component :is="visibilityIcon" class="w-3 h-3" />
                </div>
            </div>

            <!-- Content -->
            <div class="mt-2">
                <h3 v-if="post.title" class="font-bold text-lg mb-1">
                    {{ post.title }}
                </h3>
                <p
                    v-if="post.description"
                    class="text-sm text-base-content/70 mb-2"
                >
                    {{ post.description }}
                </p>
                <div
                    class="text-base whitespace-pre-wrap break-words"
                    :class="{
                        'line-clamp-4':
                            isExpanded === false && post.isTruncated,
                    }"
                    v-html="renderedContent"
                />
                <button
                    v-if="post.isTruncated && isExpanded === false"
                    class="btn btn-ghost btn-sm px-2 mt-1"
                    @click.stop="isExpanded = true"
                >
                    Show more
                </button>
            </div>

            <!-- Attachments -->
            <AttachmentGrid
                v-if="post.attachments?.length"
                :attachments="post.attachments"
                class="mt-3"
            />

            <!-- Tags -->
            <div v-if="post.tags?.length" class="flex flex-wrap gap-1 mt-3">
                <span
                    v-for="tag in post.tags"
                    :key="tag.id"
                    class="badge badge-sm badge-ghost"
                >
                    #{{ tag.name }}
                </span>
            </div>

            <!-- Embeds -->
            <div v-if="hasEmbeds" class="mt-3">
                <div
                    v-for="(embed, idx) in embeds"
                    :key="idx"
                    class="p-3 bg-base-200 rounded-lg text-sm"
                >
                    <template v-if="embed?.type === 'link'">
                        <a
                            :href="embed.url"
                            class="text-primary hover:underline"
                            @click.stop
                        >
                            {{ embed.title || embed.url }}
                        </a>
                    </template>
                    <template v-else-if="embed?.type === 'livestream'">
                        <NuxtLink
                            :to="`/livestreams/${embed.id}`"
                            class="flex items-center gap-2 text-primary hover:underline"
                            @click.stop
                        >
                            <IconRadio class="w-4 h-4" />
                            {{ embed.title || "Livestream" }}
                        </NuxtLink>
                    </template>
                </div>
            </div>

            <!-- Stats Bar -->
            <div
                class="flex items-center gap-4 mt-3 text-sm text-base-content/50"
            >
                <span
                    v-if="post.viewsUnique > 0"
                    class="flex items-center gap-1"
                >
                    <IconEye class="w-3.5 h-3.5" />
                    {{ formatNumber(post.viewsUnique) }}
                </span>
                <span
                    v-if="post.repliesCount > 0"
                    class="flex items-center gap-1"
                >
                    <IconMessageCircle class="w-3.5 h-3.5" />
                    {{ formatNumber(post.repliesCount) }}
                </span>
                <span
                    v-if="post.boostCount > 0"
                    class="flex items-center gap-1"
                >
                    <IconRepeat class="w-3.5 h-3.5" />
                    {{ formatNumber(post.boostCount) }}
                </span>
            </div>

            <!-- Actions -->
            <div
                class="flex items-center gap-2 mt-3 pt-3 border-t border-base-200"
            >
                <button
                    class="btn btn-ghost btn-sm gap-1"
                    :class="{ 'text-primary': hasReacted('heart') }"
                    @click.stop="toggleReaction('heart')"
                >
                    <IconHeart class="w-4 h-4" />
                    {{ post.reactionsCount?.heart || 0 }}
                </button>
                <button
                    class="btn btn-ghost btn-sm gap-1"
                    @click.stop="navigateToPost"
                >
                    <IconMessageCircle class="w-4 h-4" />
                    {{ post.repliesCount }}
                </button>
                <button
                    class="btn btn-ghost btn-sm gap-1"
                    @click.stop="$emit('boost', post)"
                >
                    <IconRepeat class="w-4 h-4" />
                    {{ post.boostCount }}
                </button>
                <button
                    class="btn btn-ghost btn-sm gap-1 ml-auto"
                    @click.stop="$emit('share', post)"
                >
                    <IconShare2 class="w-4 h-4" />
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { Post } from "~/types/post";
import { getFileUrl } from "~/utils/files";

const props = defineProps<{
    post: Post;
}>();

defineEmits<{
    boost: [post: Post];
    share: [post: Post];
    reply: [post: Post];
}>();

const isExpanded = ref(false);

const publisherName = computed(
    () => props.post.publisher?.nick || props.post.publisher?.name || "Unknown",
);
const publisherPictureUrl = computed(() => {
    const picture = props.post.publisher?.picture;
    return picture?.url || getFileUrl(picture?.id);
});
const publisherInitials = computed(() => {
    const name = props.post.publisher?.name || "?";
    return name.slice(0, 2).toUpperCase();
});
const isVerified = computed(() => !!props.post.publisher?.verification);

function handleImageError() {
    // Fallback to initials
}

// Visibility
const VISIBILITY_CONFIG: Record<
    number,
    { label: string; icon: string; class: string }
> = {
    0: { label: "Public", icon: "IconGlobe", class: "badge-ghost" },
    1: { label: "Friends Only", icon: "IconUsers", class: "badge-info" },
    2: { label: "Unlisted", icon: "IconLink", class: "badge-warning" },
    3: { label: "Private", icon: "IconLock", class: "badge-error" },
};

const visibilityClass = computed(() => {
    const config = VISIBILITY_CONFIG[props.post.visibility];
    return config?.class || "badge-ghost";
});

const visibilityLabel = computed(() => {
    const config = VISIBILITY_CONFIG[props.post.visibility];
    return config?.label || "Unknown";
});

const visibilityIcon = computed(() => {
    const config = VISIBILITY_CONFIG[props.post.visibility];
    return config?.icon || "IconGlobe";
});

// Content
function truncateContent(content: string, max: number): string {
    if (content.length <= max) return content;
    return content.slice(0, max) + "...";
}

const renderedContent = computed(() => {
    // For now, just render as plain text with newlines
    // Could integrate markdown rendering here
    return props.post.content
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\n/g, "<br>");
});

// Reference post
const referencePost = computed(() => {
    if (props.post.repliedPost) return props.post.repliedPost;
    if (props.post.forwardedPost) return props.post.forwardedPost;
    return null;
});

const referenceLabel = computed(() => {
    if (props.post.repliedPost) return "Replying to";
    if (props.post.forwardedPost) return "Forwarding";
    return "";
});

function navigateToReferencePost() {
    if (referencePost.value) {
        navigateTo(`/posts/${referencePost.value.id}`);
    }
}

// Embeds
const embeds = computed(() => {
    const meta = props.post.meta || props.post.metadata;
    if (!meta?.embeds) return [];
    return meta.embeds;
});

const hasEmbeds = computed(() => embeds.value.length > 0);

// Reactions
function hasReacted(emoji: string): boolean {
    return !!props.post.reactionsMade?.[emoji];
}

function toggleReaction(emoji: string) {
    // TODO: Implement API call to toggle reaction
}

// Navigation
function navigateToPost() {
    navigateTo(`/posts/${props.post.id}`);
}

// Formatting
function formatRelativeTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
}

function formatNumber(num: number): string {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
}
</script>
