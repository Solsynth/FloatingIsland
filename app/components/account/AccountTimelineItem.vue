<template>
  <div class="card">
    <div class="card-body p-0 overflow-hidden">
    <!-- Status Event -->
    <template v-if="item.eventType === 0 && item.status">
      <div class="p-3 flex items-center gap-3">
        <div class="relative">
          <div
            class="w-10 h-10 rounded-full flex items-center justify-center"
            :class="statusBgClass"
          >
            <component :is="statusIcon" class="w-5 h-5" :class="statusIconClass" />
          </div>
          <span
            class="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-base-100"
            :class="item.status.isOnline ? 'bg-success' : 'bg-base-300'"
          />
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-1">
            <span v-if="item.status.symbol" class="text-base">{{ item.status.symbol }}</span>
            <span class="text-sm font-medium truncate">
              {{ item.status.label || "Status change" }}
            </span>
          </div>
          <div class="flex items-center gap-1.5 text-xs text-base-content/50">
            <span>{{ formatRelativeTime(item.createdAt) }}</span>
            <span>·</span>
            <span>{{ formatDateTime(item.createdAt) }}</span>
            <span
              v-if="item.status.appIdentifier"
              class="badge badge-xs badge-ghost"
            >
              {{ item.status.appIdentifier }}
            </span>
            <span v-if="duration" class="flex items-center gap-0.5">
              <IconClock class="w-3 h-3" />
              {{ formatDuration(duration) }}
            </span>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <div v-if="item.status.isAutomated" class="badge badge-sm badge-secondary gap-1">
            <IconBot class="w-3 h-3" />
            Bot
          </div>
          <div v-if="duplicateCount && duplicateCount > 1" class="badge badge-sm badge-primary">
            x{{ duplicateCount }}
          </div>
        </div>
      </div>
    </template>

    <!-- Activity Event -->
    <template v-else-if="item.eventType === 1 && item.activity">
      <!-- Steam Background Image -->
      <div v-if="isSteam && item.activity.meta?.gameId" class="relative h-30 bg-[#1B2838] rounded-t-2xl">
        <img
          :src="`https://cdn.cloudflare.steamstatic.com/steam/apps/${item.activity.meta.gameId}/library_hero.jpg`"
          class="w-full h-full object-cover rounded-t-2xl"
          alt=""
          @error="($event.target as HTMLImageElement).style.display = 'none'"
        />
        <div v-if="!isSteam" class="absolute inset-0 flex items-center justify-center">
          <IconGamepad class="w-8 h-8 text-white/70" />
        </div>
      </div>
      <div class="p-3 flex items-start gap-3">
        <div class="relative shrink-0">
          <div
            class="w-10 h-10 rounded-full flex items-center justify-center"
            :class="activityBgClass"
          >
            <component :is="activityIcon" class="w-5 h-5" :class="activityIconClass" />
          </div>
          <span
            v-if="isSpotify"
            class="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-success flex items-center justify-center"
          >
            <IconMusic class="w-2.5 h-2.5 text-white" />
          </span>
          <span
            v-if="isSteam"
            class="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-[#1B2838] flex items-center justify-center"
          >
            <IconPlay class="w-2.5 h-2.5 text-white" />
          </span>
        </div>
        <img
          v-if="activityImageUrl && !isSteam"
          :src="activityImageUrl"
          class="w-12 h-12 rounded-lg object-cover shrink-0"
          alt=""
        />
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-1">
            <p class="text-sm font-medium truncate grow-0">
              {{ item.activity.title || "Unknown" }}
            </p>
            <a
              v-if="item.activity.titleUrl"
              :href="item.activity.titleUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="text-base-content/40 hover:text-base-content/60"
            >
              <IconExternalLink class="w-3.5 h-3.5" />
            </a>
          </div>
          <div v-if="item.activity.subtitle" class="flex items-center gap-1">
            <p class="text-xs text-base-content/60 truncate grow-0">
              {{ item.activity.subtitle }}
            </p>
            <a
              v-if="item.activity.subtitleUrl"
              :href="item.activity.subtitleUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="text-base-content/40 hover:text-base-content/60"
            >
              <IconExternalLink class="w-3.5 h-3.5" />
            </a>
          </div>
          <p
            v-if="item.activity.caption"
            class="text-xs text-base-content/50 italic truncate"
          >
            {{ item.activity.caption }}
          </p>
          <p class="text-xs text-base-content/50 mt-0.5">
            {{ formatRelativeTime(item.createdAt) }} · {{ formatDateTime(item.createdAt) }}
          </p>
          <p v-if="duration" class="flex items-center gap-0.5 text-xs text-base-content/50 mt-1">
            <IconClock class="w-3 h-3" />
            {{ formatDuration(duration) }}
          </p>
        </div>
        <div class="flex flex-col items-end gap-1">
          <div class="badge badge-sm badge-accent">
            {{ activityTypeLabel }}
          </div>
          <div v-if="duplicateCount && duplicateCount > 1 && !isSpotify" class="badge badge-sm badge-primary">
            x{{ duplicateCount }}
          </div>
        </div>
      </div>
    </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SnAccountTimelineItem } from "~/types/auth";
import {
  IconCircle,
  IconMoon,
  IconEyeOff,
  IconPlay,
  IconMusic,
  IconHeart,
  IconMoreHorizontal,
  IconBot,
  IconClock,
  IconExternalLink,
  IconGamepad,
} from "#components";

const props = defineProps<{
  item: SnAccountTimelineItem;
  duplicateCount?: number;
  duration?: number; // duration in milliseconds
}>();

const isSpotify = computed(() => props.item.activity?.manualId === "spotify");
const isSteam = computed(() => props.item.activity?.manualId === "steam");

const statusIcon = computed(() => {
  if (!props.item.status) return IconCircle;
  switch (props.item.status.type) {
    case 1: return IconMoon; // busy
    case 2: return IconCircle; // do not disturb
    case 3: return IconEyeOff; // invisible
    default: return IconCircle;
  }
});

const statusBgClass = computed(() => {
  if (!props.item.status) return "bg-base-200";
  switch (props.item.status.type) {
    case 1: return "bg-error/15"; // busy
    case 2: return "bg-warning/15"; // dnd
    case 3: return "bg-base-300/50"; // invisible
    default: return "bg-success/15"; // online
  }
});

const statusIconClass = computed(() => {
  if (!props.item.status) return "text-base-content/50";
  switch (props.item.status.type) {
    case 1: return "text-error";
    case 2: return "text-warning";
    case 3: return "text-base-content/50";
    default: return "text-success";
  }
});

const activityIcon = computed(() => {
  if (!props.item.activity) return IconMoreHorizontal;
  switch (props.item.activity.type) {
    case 1: return IconPlay; // playing
    case 2: return IconMusic; // listening
    case 3: return IconHeart; // exercising
    default: return IconMoreHorizontal;
  }
});

const activityBgClass = computed(() => {
  if (!props.item.activity) return "bg-base-200";
  switch (props.item.activity.type) {
    case 1: return "bg-info/15"; // playing
    case 2: return "bg-primary/15"; // listening
    case 3: return "bg-warning/15"; // exercising
    default: return "bg-base-200";
  }
});

const activityIconClass = computed(() => {
  if (!props.item.activity) return "text-base-content/50";
  switch (props.item.activity.type) {
    case 1: return "text-info";
    case 2: return "text-primary";
    case 3: return "text-warning";
    default: return "text-base-content/50";
  }
});

const activityTypeLabel = computed(() => {
  if (!props.item.activity) return "Activity";
  switch (props.item.activity.type) {
    case 1: return "Playing";
    case 2: return "Listening";
    case 3: return "Exercising";
    default: return "Activity";
  }
});

const activityImageUrl = computed(() => {
  const imageUri = props.item.activity?.largeImage || props.item.activity?.smallImage;
  if (!imageUri) return null;
  return resolveImageUrl(imageUri);
});

function resolveImageUrl(imageUri: string): string {
  if (imageUri.startsWith('sha256:')) {
    const config = useRuntimeConfig();
    return `${config.public.apiBaseUrl}/passport/presence/artworks/${imageUri}`;
  }
  return imageUri;
}

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
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDuration(ms: number): string {
  const absMs = Math.abs(ms);
  const seconds = Math.floor(absMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m`;
  return `${seconds}s`;
}
</script>
