<template>
  <div class="card bg-base-100 shadow-sm overflow-hidden">
    <!-- Steam Hero Image -->
    <div v-if="isSteam && steamGameId" class="relative h-28 w-full">
      <img
        :src="steamHeroUrl"
        class="w-full h-full object-cover"
        alt=""
        loading="lazy"
        @error="handleSteamImageError"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
    </div>

    <div class="card-body p-3">
      <div class="flex gap-3" :class="{ 'items-start': !hasArtwork || isSteam, 'items-center': hasArtwork && !isSteam }">
        <!-- Avatar with activity badge -->
        <div class="relative shrink-0">
          <div v-if="account" class="avatar">
            <div class="w-9 h-9 rounded-full">
              <img
                v-if="accountAvatar"
                :src="accountAvatar"
                :alt="accountName"
                class="w-full h-full rounded-full object-cover"
              />
              <div v-else class="w-full h-full rounded-full bg-primary flex items-center justify-center">
                <span class="text-xs text-primary-content font-medium">{{ accountInitials }}</span>
              </div>
            </div>
          </div>
          <div
            v-else
            class="w-9 h-9 rounded-full flex items-center justify-center"
            :class="activityBgClass"
          >
            <component :is="activityIcon" class="w-4.5 h-4.5" :class="activityIconClass" />
          </div>

          <!-- Activity type badge -->
          <span
            class="absolute -bottom-1 -right-1 w-[18px] h-[18px] rounded-full flex items-center justify-center border-2 border-base-100"
            :class="activityBadgeClass"
          >
            <component :is="activityIcon" class="w-2.5 h-2.5 text-white" />
          </span>

          <!-- Provider badge (Spotify/Steam) -->
          <span
            v-if="isSpotify"
            class="absolute -top-0.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-[#1DB954] flex items-center justify-center border-2 border-base-100"
          >
            <IconMusic class="w-2 h-2 text-white" />
          </span>
          <span
            v-else-if="isSteam"
            class="absolute -top-0.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-[#1B2838] flex items-center justify-center border-2 border-base-100"
          >
            <IconGamepad class="w-2 h-2 text-white" />
          </span>
        </div>

        <!-- Artwork image (non-Steam) -->
        <img
          v-if="hasArtwork && !isSteam"
          :src="artworkUrl"
          class="w-12 h-12 rounded-lg object-cover shrink-0"
          alt=""
          loading="lazy"
        />

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <!-- Account name and time -->
          <div v-if="account" class="flex items-center gap-1 mb-0.5">
            <span class="text-xs font-semibold text-base-content/70 truncate">
              {{ accountDisplayName }}
            </span>
            <span class="text-xs text-base-content/30">·</span>
            <span class="text-xs text-base-content/40 whitespace-nowrap">
              {{ formatRelativeTime(activity.createdAt) }}
            </span>
          </div>

          <!-- Title -->
          <div class="flex items-center gap-1.5">
            <span class="text-sm font-medium truncate">
              {{ activity.title || t("presence.unknown") }}
            </span>
            <a
              v-if="activity.titleUrl"
              :href="activity.titleUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="text-base-content/40 hover:text-base-content/60 shrink-0"
              @click.stop
            >
              <IconExternalLink class="h-3 w-3" />
            </a>
          </div>

          <!-- Subtitle -->
          <div v-if="activity.subtitle" class="flex items-center gap-1 mt-0.5">
            <span class="text-xs text-base-content/60 truncate">
              {{ activity.subtitle }}
            </span>
            <a
              v-if="activity.subtitleUrl"
              :href="activity.subtitleUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="text-base-content/40 hover:text-base-content/60 shrink-0"
              @click.stop
            >
              <IconExternalLink class="h-3 w-3" />
            </a>
          </div>

          <!-- Caption -->
          <p v-if="activity.caption" class="text-xs text-base-content/50 italic truncate mt-0.5">
            {{ activity.caption }}
          </p>

          <!-- Badges -->
          <div class="flex items-center gap-1.5 mt-2">
            <span class="badge badge-xs badge-accent">
              {{ activityTypeLabel }}
            </span>
            <span v-if="isActive" class="badge badge-xs badge-primary">
              {{ t("presence.ongoing") }}
            </span>
            <span v-if="!account" class="text-xs text-base-content/40">
              {{ formatRelativeTime(activity.createdAt) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SnPresenceActivity, Account } from "~/types/post";
import { API_BASE_URL } from "~/utils/api";
import { getFileUrl } from "~/utils/files";
import {
  IconGamepad,
  IconMusic,
  IconHeart,
  IconActivity,
  IconExternalLink,
} from "#components";

const { t } = useI18n();

const props = defineProps<{
  activity: SnPresenceActivity;
  rawData?: Record<string, unknown>;
}>();

const isSpotify = computed(() => {
  const provider = props.rawData?.provider ?? props.activity.meta?.provider;
  return provider === "spotify";
});

const isSteam = computed(() => {
  const provider = props.rawData?.provider ?? props.activity.meta?.provider;
  return provider === "steam";
});

const isActive = computed(() => {
  if (props.rawData?.is_active !== undefined) {
    return props.rawData.is_active as boolean;
  }
  return (
    !props.activity.deletedAt &&
    new Date(props.activity.leaseExpiresAt) > new Date()
  );
});

const steamGameId = computed(() => {
  if (!isSteam.value || !props.activity.meta) return null;
  const gameId = props.activity.meta.game_id;
  return gameId ? String(gameId).replace(/"/g, "") : null;
});

const steamHeroUrl = computed(() => {
  if (!steamGameId.value) return "";
  return `https://cdn.cloudflare.steamstatic.com/steam/apps/${steamGameId.value}/library_hero.jpg`;
});

const hasArtwork = computed(() => {
  return !!(props.activity.largeImage || props.activity.smallImage);
});

const artworkUrl = computed(() => {
  const url = props.activity.largeImage || props.activity.smallImage;
  if (!url) return "";
  return resolveImageUrl(url);
});

// Account resolution
const account = computed<Account | null>(() => {
  return props.activity.account ?? null;
});

const accountName = computed(() => {
  return account.value?.nick || account.value?.name || "";
});

const accountDisplayName = computed(() => {
  if (!account.value) return "";
  const nick = account.value.nick;
  const name = account.value.name;
  return nick ? `${nick} (@${name})` : `@${name}`;
});

const accountAvatar = computed(() => {
  if (!account.value?.profile?.picture?.id) return null;
  return getFileUrl(account.value.profile.picture.id);
});

const accountInitials = computed(() => {
  const name = account.value?.name || "?";
  return name.slice(0, 2).toUpperCase();
});

const activityIcon = computed(() => {
  switch (props.activity.type) {
    case 1: return IconGamepad; // Gaming
    case 2: return IconMusic; // Music
    case 3: return IconActivity; // Workout
    default: return IconHeart;
  }
});

const activityBgClass = computed(() => {
  switch (props.activity.type) {
    case 1: return "bg-purple-500/15"; // Gaming
    case 2: return "bg-green-500/15"; // Music
    case 3: return "bg-orange-500/15"; // Workout
    default: return "bg-blue-500/15";
  }
});

const activityIconClass = computed(() => {
  switch (props.activity.type) {
    case 1: return "text-purple-500"; // Gaming
    case 2: return "text-green-500"; // Music
    case 3: return "text-orange-500"; // Workout
    default: return "text-blue-500";
  }
});

const activityBadgeClass = computed(() => {
  switch (props.activity.type) {
    case 1: return "bg-purple-500"; // Gaming
    case 2: return "bg-green-500"; // Music
    case 3: return "bg-orange-500"; // Workout
    default: return "bg-blue-500";
  }
});

const activityTypeLabel = computed(() => {
  switch (props.activity.type) {
    case 1: return t("presence.gaming");
    case 2: return t("presence.music");
    case 3: return t("presence.workout");
    default: return t("presence.activity");
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

  if (seconds < 60) return t("time.justNow");
  if (minutes < 60) return t("time.minutesAgo", { count: minutes });
  if (hours < 24) return t("time.hoursAgo", { count: hours });
  if (days < 7) return t("time.daysAgo", { count: days });
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function handleSteamImageError(e: Event) {
  // Hide the hero image on error
  const img = e.target as HTMLImageElement;
  img.style.display = "none";
}
</script>
