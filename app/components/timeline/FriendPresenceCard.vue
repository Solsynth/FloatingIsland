<template>
  <div class="card bg-base-100 shadow-sm">
    <div class="card-body p-4">
      <div class="flex items-center gap-3">
        <div class="relative">
          <div
            class="w-10 h-10 rounded-full flex items-center justify-center"
            :class="activityBgClass"
          >
            <component :is="activityIcon" class="w-5 h-5" :class="activityIconClass" />
          </div>
          <span
            v-if="isSpotify"
            class="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-success flex items-center justify-center border-2 border-base-100"
          >
            <IconMusic class="w-2 h-2 text-white" />
          </span>
          <span
            v-if="isSteam"
            class="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#1B2838] flex items-center justify-center border-2 border-base-100"
          >
            <IconGamepad class="w-2 h-2 text-white" />
          </span>
        </div>
        <img
          v-if="activity.largeImage && !isSteam"
          :src="resolveImageUrl(activity.largeImage)"
          class="w-12 h-12 rounded-lg object-cover shrink-0"
          alt=""
          loading="lazy"
        />
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-1.5">
            <span class="text-sm font-medium truncate">
              {{ activity.title || "Unknown" }}
            </span>
            <a
              v-if="activity.titleUrl"
              :href="activity.titleUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="text-base-content/40 hover:text-base-content/60"
              @click.stop
            >
              <IconExternalLink class="h-3.5 w-3.5" />
            </a>
          </div>
          <p v-if="activity.subtitle" class="text-xs text-base-content/60 truncate">
            {{ activity.subtitle }}
          </p>
          <p v-if="activity.caption" class="text-xs text-base-content/50 italic truncate">
            {{ activity.caption }}
          </p>
          <div class="flex items-center gap-2 mt-1.5">
            <div class="badge badge-xs badge-accent">
              {{ activityTypeLabel }}
            </div>
            <span class="text-xs text-base-content/40">{{ formatRelativeTime(activity.createdAt) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SnPresenceActivity } from "~/types/post";
import { API_BASE_URL } from "~/utils/api";
import {
  IconGamepad,
  IconMusic,
  IconHeart,
  IconActivity,
  IconExternalLink,
} from "#components";

const props = defineProps<{
  activity: SnPresenceActivity;
}>();

const isSpotify = computed(() => props.activity.manualId === "spotify");
const isSteam = computed(() => props.activity.manualId === "steam");

const activityIcon = computed(() => {
  switch (props.activity.type) {
    case 1: return IconGamepad; // playing
    case 2: return IconMusic; // listening
    case 3: return IconActivity; // exercising
    default: return IconHeart;
  }
});

const activityBgClass = computed(() => {
  switch (props.activity.type) {
    case 1: return "bg-info/15"; // playing
    case 2: return "bg-primary/15"; // listening
    case 3: return "bg-warning/15"; // exercising
    default: return "bg-base-200";
  }
});

const activityIconClass = computed(() => {
  switch (props.activity.type) {
    case 1: return "text-info";
    case 2: return "text-primary";
    case 3: return "text-warning";
    default: return "text-base-content/50";
  }
});

const activityTypeLabel = computed(() => {
  switch (props.activity.type) {
    case 1: return "Playing";
    case 2: return "Listening";
    case 3: return "Exercising";
    default: return "Activity";
  }
});

function resolveImageUrl(url: string): string {
  if (url.startsWith("sha256:")) {
    return `${API_BASE_URL}/passport/presence/artworks/${url}`;
  }
  return url;
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
</script>
