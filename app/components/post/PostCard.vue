<template>
  <component
    :is="wrapperTag"
    class="block hover:no-underline"
    v-bind="wrapperProps"
  >
    <article
      class="card cursor-pointer transition-all"
      :class="embedded ? 'bg-base-200 border-0' : 'bg-base-100'"
    >
      <div class="card-body p-4">
        <!-- Reference Post (Parent, Twitter-style) -->
        <div v-if="showReference && hasReference" class="mb-2">
          <button
            type="button"
            class="mb-2 flex w-full items-center gap-2 text-left text-sm font-medium text-base-content/65"
            @click.stop="referenceCollapsed = !referenceCollapsed"
          >
            <IconReply v-if="referenceIsReply" class="h-4 w-4" />
            <IconForward v-else class="h-4 w-4" />
            <span>{{ referenceIsReply ? "Replying to" : "Forwarded" }}</span>
            <span class="ml-auto text-xs">{{
              referenceCollapsed ? "Expand" : "Collapse"
            }}</span>
            <IconChevronDown
              v-if="referenceCollapsed"
              class="h-4 w-4 text-base-content/60"
            />
            <IconChevronUp v-else class="h-4 w-4 text-base-content/60" />
          </button>
          <div
            v-if="!referenceCollapsed && referencePost"
            class="grid cursor-pointer grid-cols-[40px_1fr] gap-3"
            @click.stop="navigateToReference"
          >
            <div class="relative flex justify-center">
              <component
                :is="referencePost.publisher ? 'NuxtLink' : 'div'"
                type="button"
                class="avatar"
                :to="
                  referencePost.publisher
                    ? `/publishers/${referencePost.publisher.name}`
                    : undefined
                "
              >
                <div
                  v-if="getAvatarUrl(referencePost)"
                  class="h-10 w-10 rounded-full"
                >
                  <img
                    :src="getAvatarUrl(referencePost)"
                    :alt="getDisplayName(referencePost.publisher)"
                    class="h-full w-full rounded-full object-cover"
                  >
                </div>
                <div
                  v-else
                  class="h-10 w-10 rounded-full bg-primary text-primary-content"
                >
                  <span class="text-sm font-medium">{{
                    getInitials(getDisplayName(referencePost.publisher))
                  }}</span>
                </div>
              </component>
              <div
                class="absolute top-10 -bottom-2.5 w-px bg-base-300/80"
              />
            </div>
            <div class="min-w-0 pb-2">
              <div class="flex items-center gap-2 min-w-0">
                <span class="truncate text-sm font-semibold">{{
                  getDisplayName(referencePost.publisher)
                }}</span>
                <span
                  v-if="referencePost.publisher?.name"
                  class="truncate text-sm text-base-content/65"
                >
                  @{{ referencePost.publisher.name }}
                </span>
              </div>
              <div class="text-xs text-base-content/55">
                {{ formatDate(referencePost.publishedAt) }}
              </div>
              <!-- eslint-disable vue/no-v-html -->
              <div
                v-if="referencePost.content"
                class="prose prose-sm mt-2 max-w-none break-words prose-headings:mb-1 prose-headings:mt-2 prose-p:my-1 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-a:break-all prose-code:text-primary prose-code:bg-base-200 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-base-200 prose-pre:text-xs prose-pre:overflow-x-auto prose-blockquote:border-l-4 prose-blockquote:border-primary/30 prose-blockquote:pl-3 prose-blockquote:italic prose-ul:my-1 prose-ol:my-1"
                v-html="renderedReferenceContent"
              />
              <!-- eslint-enable vue/no-v-html -->
              <div
                v-if="referencePost.title || referencePost.description"
                class="mt-2 space-y-1"
              >
                <div
                  v-if="referencePost.title"
                  class="line-clamp-1 text-sm font-semibold"
                >
                  {{ referencePost.title }}
                </div>
                <div
                  v-if="referencePost.description"
                  class="line-clamp-2 text-xs text-base-content/75"
                >
                  {{ referencePost.description }}
                </div>
              </div>
              <div
                v-if="referencePost.isTruncated"
                class="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-base-300 bg-base-100/70 px-2 py-1 text-xs text-base-content/70 italic"
              >
                <IconEllipsis class="h-3.5 w-3.5" />
                <span>Post truncated</span>
              </div>
              <div
                v-if="referencePost.attachments.length > 0"
                class="mt-2 inline-flex items-center gap-1 text-xs text-base-content/70"
              >
                <IconPaperclip class="h-3.5 w-3.5" />
                <span
                  >{{ referencePost.attachments.length }} attachment(s)</span
                >
              </div>
              <AttachmentGrid
                v-if="referencePost.attachments.length > 0"
                :attachments="referencePost.attachments"
                :max-height="80"
              />
            </div>
          </div>
        </div>

        <!-- Header -->
        <div class="flex items-start justify-between gap-3">
          <component
            :is="post.publisher ? 'NuxtLink' : 'div'"
            type="button"
            class="flex items-center gap-3"
            :to="
              post.publisher ? `/publishers/${post.publisher.name}` : undefined
            "
          >
            <!-- Avatar -->
            <div v-if="getAvatarUrl(post)" class="avatar">
              <div class="h-10 w-10 rounded-full">
                <img
                  :src="getAvatarUrl(post)"
                  :alt="getDisplayName(post.publisher)"
                  class="h-full w-full rounded-full object-cover"
                >
              </div>
            </div>
            <div v-else class="avatar avatar-placeholder">
              <div
                class="h-10 w-10 rounded-full bg-primary text-primary-content"
              >
                <span class="text-sm font-medium">{{
                  getInitials(getDisplayName(post.publisher))
                }}</span>
              </div>
            </div>

            <div class="flex flex-col items-start min-w-0">
              <div class="flex items-center gap-1.5 min-w-0">
                <span class="text-base leading-tight font-semibold truncate">
                  {{ getDisplayName(post.publisher) }}
                </span>
                <IconBadgeCheck
                  v-if="post.publisher?.verification"
                  class="h-4 w-4 text-primary shrink-0"
                />
                <span
                  v-if="post.publisher?.name"
                  class="text-sm text-base-content/50 truncate"
                >
                  @{{ post.publisher.name }}
                </span>
              </div>
              <span class="text-xs text-base-content/40">{{
                formatDate(post.publishedAt, isDetail)
              }}</span>
            </div>
          </component>

          <!-- Menu -->
          <div class="relative">
            <button
              class="btn btn-circle btn-ghost btn-sm"
              @click.stop="showMenu = !showMenu"
            >
              <IconMoreHorizontal class="h-5 w-5" />
            </button>
            <div
              v-if="showMenu"
              class="absolute top-full right-0 z-10 mt-1"
              role="menu"
              tabindex="-1"
              @click.stop
            >
              <ul
                class="menu w-40 rounded-box border border-base-300 bg-base-100 shadow-lg"
              >
                <li>
                  <button @click.stop="handleShare">
                    <IconShare class="h-4 w-4" /> Share
                  </button>
                </li>
                <li>
                  <button @click.stop="handleCopyLink">
                    <IconLink class="h-4 w-4" /> Copy link
                  </button>
                </li>
                <li>
                  <button class="text-error" @click.stop="handleReport">
                    <IconFlag class="h-4 w-4" /> Report
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Content -->
        <div class="mt-3">
          <h3 v-if="post.title" class="mb-2 text-lg font-semibold line-clamp-2">
            {{ post.title }}
          </h3>
          <!-- eslint-disable vue/no-v-html -->
          <div
            class="prose prose-sm max-w-none break-words prose-headings:mb-2 prose-headings:mt-4 prose-p:my-1.5 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-a:break-all prose-code:text-primary prose-code:bg-base-200 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-base-200 prose-pre:text-sm prose-pre:overflow-x-auto prose-blockquote:border-l-4 prose-blockquote:border-primary/30 prose-blockquote:pl-4 prose-blockquote:italic prose-ul:my-1.5 prose-ol:my-1.5"
            v-html="renderedContent"
          />
          <!-- eslint-enable vue/no-v-html -->
          <div
            v-if="post.isTruncated"
            class="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-base-300 bg-base-200/40 px-2 py-1 text-xs text-base-content/75 italic"
          >
            <IconEllipsis class="h-3.5 w-3.5" />
            <span>Post truncated</span>
            <IconArrowRight v-if="!isDetail" class="h-3.5 w-3.5" />
          </div>
        </div>

        <!-- Attachments -->
        <AttachmentGrid
          v-if="post.attachments.length > 0"
          :attachments="post.attachments"
        />

        <!-- Tags -->
        <div v-if="post.tags.length > 0" class="mt-3 flex flex-wrap gap-2">
          <NuxtLink
            v-for="tag in post.tags"
            :key="tag.id"
            :to="`/tag/${tag.slug}`"
            class="badge badge-ghost badge-sm transition-colors hover:badge-primary"
            @click.stop
          >
            {{ tag.name ?? "#" + tag.slug }}
          </NuxtLink>
        </div>

        <!-- Embeds -->
        <div v-if="embeds.length > 0" class="mt-3 space-y-3">
          <!-- Link Embeds -->
          <div
            v-if="linkEmbeds.length > 0"
            class="rounded-xl border border-base-300/80 bg-base-200/20 p-2"
          >
            <div
              class="mb-2 flex items-center gap-2 px-1 text-sm font-medium text-base-content/70"
            >
              <IconLink2 class="h-4 w-4" />
              <span>Links ({{ linkEmbeds.length }})</span>
            </div>
            <!-- Single Link -->
            <div v-if="linkEmbeds.length === 1">
              <button
                type="button"
                class="card w-full cursor-pointer border border-base-300 bg-base-100 text-left"
                @click.stop="openExternal(getEmbedUrl(linkEmbeds[0])!)"
              >
                <img
                  v-if="
                    getEmbedImage(linkEmbeds[0]) &&
                    getEmbedImage(linkEmbeds[0]) !==
                      getEmbedFavicon(linkEmbeds[0])
                  "
                  :src="
                    resolveAssetUrl(
                      getEmbedUrl(linkEmbeds[0])!,
                      getEmbedImage(linkEmbeds[0])!,
                    )
                  "
                  :alt="getEmbedTitle(linkEmbeds[0]) || 'Link preview image'"
                  class="h-36 w-full rounded-t-xl object-cover"
                  loading="lazy"
                >
                <div class="card-body gap-2 p-3">
                  <div
                    class="flex items-center gap-2 text-xs text-base-content/60"
                  >
                    <img
                      v-if="getEmbedFavicon(linkEmbeds[0])"
                      :src="
                        resolveAssetUrl(
                          getEmbedUrl(linkEmbeds[0])!,
                          getEmbedFavicon(linkEmbeds[0])!,
                        )
                      "
                      alt="Site icon"
                      class="h-4 w-4 rounded object-cover"
                      loading="lazy"
                    >
                    <IconLink v-else class="h-4 w-4" />
                    <span class="truncate">{{
                      getEmbedSiteName(linkEmbeds[0]) ||
                      getHost(getEmbedUrl(linkEmbeds[0])!)
                    }}</span>
                    <IconExternalLink class="ml-auto h-4 w-4" />
                  </div>
                  <div
                    v-if="getEmbedTitle(linkEmbeds[0])"
                    class="line-clamp-2 text-sm font-semibold"
                  >
                    {{ getEmbedTitle(linkEmbeds[0]) }}
                  </div>
                  <div
                    v-if="getEmbedDescription(linkEmbeds[0])"
                    class="line-clamp-3 text-sm text-base-content/75"
                  >
                    {{ getEmbedDescription(linkEmbeds[0]) }}
                  </div>
                  <div class="truncate text-xs text-primary underline">
                    {{ getEmbedUrl(linkEmbeds[0]) }}
                  </div>
                  <div
                    v-if="
                      getEmbedAuthor(linkEmbeds[0]) ||
                      getEmbedPublished(linkEmbeds[0])
                    "
                    class="mt-1 flex items-center gap-3 text-xs text-base-content/60"
                  >
                    <span
                      v-if="getEmbedAuthor(linkEmbeds[0])"
                      class="inline-flex items-center gap-1"
                    >
                      <IconUser class="h-3.5 w-3.5" />
                      {{ getEmbedAuthor(linkEmbeds[0]) }}
                    </span>
                    <span
                      v-if="getEmbedPublished(linkEmbeds[0])"
                      class="inline-flex items-center gap-1"
                    >
                      <IconClock3 class="h-3.5 w-3.5" />
                      {{ formatDateLabel(getEmbedPublished(linkEmbeds[0])!) }}
                    </span>
                  </div>
                </div>
              </button>
            </div>
            <!-- Multiple Links Carousel -->
            <div v-else class="carousel w-full carousel-center gap-3">
              <button
                v-for="(embed, idx) in linkEmbeds"
                :key="idx"
                type="button"
                class="card carousel-item w-80 cursor-pointer border border-base-300 bg-base-100 text-left"
                @click.stop="openExternal(getEmbedUrl(embed)!)"
              >
                <img
                  v-if="getEmbedImage(embed)"
                  :src="
                    resolveAssetUrl(getEmbedUrl(embed)!, getEmbedImage(embed)!)
                  "
                  :alt="getEmbedTitle(embed) || 'Link preview image'"
                  class="h-24 w-full rounded-t-xl object-cover"
                  loading="lazy"
                >
                <div class="card-body p-3">
                  <div class="truncate text-xs text-base-content/60">
                    {{
                      getEmbedSiteName(embed) || getHost(getEmbedUrl(embed)!)
                    }}
                  </div>
                  <div class="line-clamp-1 text-sm font-semibold">
                    {{ getEmbedTitle(embed) || getEmbedUrl(embed) }}
                  </div>
                  <div
                    v-if="getEmbedDescription(embed)"
                    class="line-clamp-2 text-xs text-base-content/70"
                  >
                    {{ getEmbedDescription(embed) }}
                  </div>
                </div>
              </button>
            </div>
          </div>

          <!-- Non-Link Embeds -->
          <div v-for="(embed, idx) in nonLinkEmbeds" :key="idx">
            <!-- Poll Embed -->
            <div v-if="getEmbedType(embed) === 'poll'" class="card">
              <div class="card-body p-3">
                <div class="flex items-center gap-2 font-medium">
                  <IconVote class="h-4 w-4" /> Poll
                </div>
                <div
                  v-if="!getEmbedId(embed)"
                  class="text-sm text-base-content/70"
                >
                  Poll was unavailable.
                </div>
                <div v-else>
                  <div class="text-sm text-base-content/80">
                    {{ getEmbedTitle(embed) || `Poll #${getEmbedId(embed)}` }}
                  </div>
                  <div
                    v-if="getEmbedDescription(embed)"
                    class="text-xs text-base-content/65"
                  >
                    {{ getEmbedDescription(embed) }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Fund Embed -->
            <div v-else-if="getEmbedType(embed) === 'fund'" class="card">
              <div class="card-body p-3">
                <div class="flex items-center gap-2 font-medium">
                  <IconCircleDollarSign class="h-4 w-4" /> Fund Envelope
                </div>
                <div
                  v-if="!getEmbedId(embed)"
                  class="text-sm text-base-content/70"
                >
                  Fund envelope was unavailable.
                </div>
                <div v-else>
                  <div class="text-sm text-base-content/80">
                    {{ getEmbedTitle(embed) || `Fund #${getEmbedId(embed)}` }}
                  </div>
                  <div
                    v-if="getEmbedDescription(embed)"
                    class="text-xs text-base-content/65"
                  >
                    {{ getEmbedDescription(embed) }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Livestream Embed -->
            <div v-else-if="getEmbedType(embed) === 'livestream'">
              <div v-if="!getEmbedId(embed)" class="card">
                <div class="card-body p-3">
                  <div class="flex items-center gap-2 font-medium">
                    <IconRadio class="h-4 w-4" /> Livestream
                  </div>
                  <div class="text-sm text-base-content/70">
                    Livestream was unavailable.
                  </div>
                </div>
              </div>
              <NuxtLink
                v-else
                :to="`/livestreams/${getEmbedId(embed)}`"
                class="card cursor-pointer border border-base-300 bg-base-100 block hover:no-underline"
                @click.stop
              >
                <div class="card-body p-3">
                  <div class="flex items-center gap-2 font-medium text-primary">
                    <IconRadio class="h-4 w-4" />
                    <span>{{ getEmbedTitle(embed) || "Livestream" }}</span>
                  </div>
                  <div
                    v-if="getEmbedDescription(embed)"
                    class="text-sm text-base-content/70 line-clamp-2"
                  >
                    {{ getEmbedDescription(embed) }}
                  </div>
                </div>
              </NuxtLink>
            </div>

            <!-- Unknown Embed -->
            <div v-else class="alert py-2 text-sm alert-info">
              <IconAlertCircle class="h-4 w-4" />
              <span
                >Unable to show embed:
                {{ getEmbedType(embed) || "unknown" }}</span
              >
            </div>
          </div>
        </div>

        <!-- Metadata -->
        <div class="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span
            v-if="post.visibility !== 0"
            :class="`badge badge-sm ${visibilityMeta.tone}`"
          >
            <IconGlobe v-if="post.visibility === 0" class="h-3.5 w-3.5" />
            <IconUsers v-else-if="post.visibility === 1" class="h-3.5 w-3.5" />
            <IconEyeOff v-else-if="post.visibility === 2" class="h-3.5 w-3.5" />
            <IconLock v-else class="h-3.5 w-3.5" />
            {{ visibilityMeta.label }}
          </span>
          <span v-if="hasEdits" class="badge badge-outline badge-sm">
            <IconPenLine class="h-3 w-3" />
            {{ formatDate(post.editedAt!) }} edited
          </span>
          <span
            v-if="post.attachments.length > 0"
            class="badge badge-outline badge-sm"
          >
            <IconPaperclip class="h-3 w-3" />
            {{ post.attachments.length }}
          </span>
        </div>

        <!-- Actions -->
        <div class="mt-4 flex items-center justify-between pt-3">
          <div class="flex items-center gap-1">
            <button
              class="btn gap-1.5 btn-ghost btn-sm hover:bg-primary/10 hover:text-primary"
              @click.stop="handleReply"
            >
              <IconMessageCircle class="h-4 w-4" />
              <span class="text-xs">{{ formatNumber(post.repliesCount) }}</span>
            </button>
            <button
              class="btn gap-1.5 btn-ghost btn-sm hover:bg-success/10 hover:text-success"
              @click.stop="handleBoost"
            >
              <IconRepeat2 class="h-4 w-4" />
              <span class="text-xs">{{ formatNumber(post.boostCount) }}</span>
            </button>
          </div>

          <div class="flex items-center gap-0.5 rounded-xl bg-base-200 p-0.5">
            <button
              class="btn px-2 btn-ghost btn-xs hover:bg-success/20 hover:text-success"
              @click.stop="handleUpvote"
            >
              <IconArrowBigUp class="h-5 w-5" />
            </button>
            <span class="min-w-[1.5ch] text-center text-sm font-medium">{{
              formatNumber(netScore)
            }}</span>
            <button
              class="btn px-2 btn-ghost btn-xs hover:bg-error/20 hover:text-error"
              @click.stop="handleDownvote"
            >
              <IconArrowBigDown class="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </article>
  </component>
</template>

<script setup lang="ts">
import type { Post } from "~/types/post";
import { getFileUrl } from "~/utils/files";
import { renderMarkdown } from "~/utils/markdown";
import {
  IconMessageCircle,
  IconRepeat2,
  IconArrowBigUp,
  IconArrowBigDown,
  IconMoreHorizontal,
  IconShare,
  IconFlag,
  IconLink,
  IconReply,
  IconChevronDown,
  IconChevronUp,
  IconEllipsis,
  IconArrowRight,
  IconPaperclip,
  IconGlobe,
  IconUsers,
  IconEyeOff,
  IconLock,
  IconPenLine,
  IconLink2,
  IconExternalLink,
  IconVote,
  IconCircleDollarSign,
  IconRadio,
  IconAlertCircle,
  IconUser,
  IconClock3,
  IconForward,
  IconBadgeCheck,
} from "#components";

interface Props {
  post: Post;
  isDetail?: boolean;
  showReference?: boolean;
  embedded?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isDetail: false,
  showReference: true,
  embedded: false,
});

const emit = defineEmits<{
  boost: [post: Post];
  share: [post: Post];
  reply: [post: Post];
}>();

// State
const showMenu = ref(false);
const referenceCollapsed = ref(false);

// Computed
const displayContent = computed(() =>
  props.post.isTruncated ? `${props.post.content}...` : props.post.content,
);
const renderedContent = computed(() => renderMarkdown(displayContent.value));
const referencePost = computed(
  () => props.post.repliedPost ?? props.post.forwardedPost,
);
const hasReference = computed(() => Boolean(referencePost.value));
const referenceIsReply = computed(() => Boolean(props.post.repliedPost));
const renderedReferenceContent = computed(() => {
  if (!referencePost.value) return "";
  const content = referencePost.value.isTruncated
    ? `${referencePost.value.content}...`
    : referencePost.value.content;
  return renderMarkdown(content);
});
const netScore = computed(() => props.post.upvotes - props.post.downvotes);
const hasEdits = computed(() => props.post.editedAt != null);

// Wrapper element - use 'div' for detail view, 'NuxtLink' for list view
const wrapperTag = computed(() => (props.isDetail ? "div" : "a"));
const wrapperProps = computed(() => {
  if (props.isDetail) return {};
  return { href: `/posts/${props.post.id}` };
});

// Embeds
interface EmbedItem {
  type?: string;
  [key: string]: unknown;
}

const embeds = computed(() => {
  const raw = props.post.meta?.embeds ?? props.post.metadata?.embeds;
  if (!Array.isArray(raw)) return [];
  return raw.filter((e): e is EmbedItem => typeof e === "object" && e !== null);
});

const linkEmbeds = computed(() =>
  embeds.value.filter((e) => getEmbedType(e) === "link"),
);
const nonLinkEmbeds = computed(() =>
  embeds.value.filter((e) => getEmbedType(e) !== "link"),
);

// Visibility
interface VisibilityMeta {
  label: string;
  tone: string;
}

function getVisibilityMeta(visibility: number): VisibilityMeta {
  switch (visibility) {
    case 1:
      return { label: "Friends", tone: "badge-info" };
    case 2:
      return { label: "Unlisted", tone: "badge-warning" };
    case 3:
      return { label: "Private", tone: "badge-neutral" };
    default:
      return { label: "Public", tone: "badge-success" };
  }
}

const visibilityMeta = computed(() => getVisibilityMeta(props.post.visibility));

// Embed helpers
function getEmbedType(embed: EmbedItem): string {
  return typeof embed.type === "string" ? embed.type.toLowerCase() : "unknown";
}

function getEmbedString(embed: EmbedItem, keys: string[]): string | null {
  for (const key of keys) {
    const value = embed[key];
    if (typeof value === "string" && value.trim() !== "") return value;
  }
  return null;
}

function getEmbedUrl(embed: EmbedItem): string | null {
  return getEmbedString(embed, ["url", "uri", "href"]);
}

function getEmbedId(embed: EmbedItem): string | null {
  const raw = embed.id;
  if (typeof raw === "string" && raw.trim() !== "") return raw;
  if (typeof raw === "number") return String(raw);
  return null;
}

function getEmbedTitle(embed: EmbedItem): string | null {
  return getEmbedString(embed, ["title"]);
}

function getEmbedDescription(embed: EmbedItem): string | null {
  return getEmbedString(embed, ["description"]);
}

function getEmbedSiteName(embed: EmbedItem): string | null {
  return getEmbedString(embed, ["siteName", "site_name"]);
}

function getEmbedFavicon(embed: EmbedItem): string | null {
  return getEmbedString(embed, ["faviconUrl", "favicon_url"]);
}

function getEmbedImage(embed: EmbedItem): string | null {
  return getEmbedString(embed, ["imageUrl", "image_url"]);
}

function getEmbedAuthor(embed: EmbedItem): string | null {
  return getEmbedString(embed, ["author"]);
}

function getEmbedPublished(embed: EmbedItem): string | null {
  return getEmbedString(embed, ["publishedDate", "published_date"]);
}

// Helpers
function getHost(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

function resolveAssetUrl(baseUrl: string, rawUrl: string): string {
  if (rawUrl.startsWith("//")) return `https:${rawUrl}`;
  if (rawUrl.startsWith("/")) {
    try {
      const parsed = new URL(baseUrl);
      return `${parsed.protocol}//${parsed.host}${rawUrl}`;
    } catch {
      return rawUrl;
    }
  }
  return rawUrl;
}

function formatDateLabel(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return formatDate(date.toISOString());
}

function openExternal(url: string): void {
  window.open(url, "_blank", "noopener,noreferrer");
}

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
}

function formatDate(dateStr: string, isDetailMode: boolean = false): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (isDetailMode) {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getInitials(name: string): string {
  if (!name || name === "Unknown") return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getDisplayName(target: Post["publisher"]): string {
  if (!target) return "Unknown";
  return target.nick || target.name || "Unknown";
}

function getAvatarUrl(target: Post): string {
  if (!target.publisher) return "";
  return getFileUrl(target.publisher.picture?.id) || "";
}

// Navigation
function navigateToReference() {
  if (referencePost.value) {
    navigateTo(`/posts/${referencePost.value.id}`);
  }
}

// Actions
function handleShare() {
  emit("share", props.post);
}

function handleCopyLink() {
  const url = `${window.location.origin}/posts/${props.post.id}`;
  navigator.clipboard.writeText(url);
  showMenu.value = false;
}

function handleReport() {
  // TODO: Implement report
  showMenu.value = false;
}

function handleReply() {
  // Use global compose state
  const compose = useCompose()
  compose.initializeFromState({
    content: '',
    replyingTo: props.post,
  })
  // Emit to parent for dialog opening
  emit("reply", props.post);
  // Also trigger global compose open
  const event = new CustomEvent('open-compose')
  window.dispatchEvent(event)
}

function handleBoost() {
  emit("boost", props.post);
}

function handleUpvote() {
  // TODO: Implement upvote
}

function handleDownvote() {
  // TODO: Implement downvote
}

// Close menu when clicking outside
onMounted(() => {
  const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest(".relative")) {
      showMenu.value = false;
    }
  };
  document.addEventListener("click", handleClickOutside);
  onUnmounted(() => {
    document.removeEventListener("click", handleClickOutside);
  });
});
</script>
