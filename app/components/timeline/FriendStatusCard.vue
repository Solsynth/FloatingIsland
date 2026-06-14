<template>
  <div class="card bg-base-100 shadow-sm">
    <div class="card-body p-3">
      <div class="flex gap-3 items-start">
        <!-- Avatar with status indicator -->
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
            :class="statusBgClass"
          >
            <component :is="statusIcon" class="w-4.5 h-4.5" :class="statusIconClass" />
          </div>

          <!-- Status indicator badge -->
          <span
            class="absolute -bottom-1 -right-1 w-[18px] h-[18px] rounded-full flex items-center justify-center border-2 border-base-100"
            :class="statusBadgeClass"
          >
            <component :is="statusIcon" class="w-2.5 h-2.5 text-white" />
          </span>
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <!-- Account name and time -->
          <div v-if="account" class="flex items-center gap-1 mb-0.5">
            <span class="text-xs font-semibold text-base-content/70 truncate">
              {{ accountDisplayName }}
            </span>
            <span class="text-xs text-base-content/30">·</span>
            <span class="text-xs text-base-content/40 whitespace-nowrap">
              {{ formatRelativeTime(createdAt) }}
            </span>
          </div>

          <!-- Status label -->
          <div class="flex items-center gap-1.5">
            <span v-if="displaySymbol" class="text-base">{{ displaySymbol }}</span>
            <span class="text-sm font-medium truncate">
              {{ displayLabel }}
            </span>
          </div>

          <!-- Status type -->
          <p class="text-xs text-base-content/60 truncate mt-0.5">
            {{ statusTypeLabel }}
          </p>

          <!-- Badges -->
          <div class="flex items-center gap-1.5 mt-2">
            <span
              class="badge badge-xs"
              :class="status.isOnline ? 'badge-success' : 'badge-ghost'"
            >
              {{ status.isOnline ? t("status.online") : t("status.offline") }}
            </span>
            <span v-if="status.isAutomated" class="badge badge-xs badge-accent">
              {{ t("status.bot") }}
            </span>
            <span v-if="!account" class="text-xs text-base-content/40">
              {{ formatRelativeTime(createdAt) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SnAccountStatus, Account, SnAccountStatusType } from "~/types/post";
import { getFileUrl } from "~/utils/files";
import {
  IconCircle,
  IconMoon,
  IconEyeOff,
  IconHeart,
} from "#components";

const { t } = useI18n();

const props = defineProps<{
  status: SnAccountStatus;
  createdAt: string;
}>();

// Account resolution
const account = computed<Account | null>(() => {
  return props.status.account ?? null;
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

const displayLabel = computed(() => {
  const label = props.status.label?.trim();
  if (label) return label;
  return statusTypeLabel.value;
});

const displaySymbol = computed(() => {
  const symbol = props.status.symbol?.trim();
  return symbol || null;
});

const statusTypeLabel = computed(() => {
  if (props.status.isIdleOrOnline) {
    return t("status.idle");
  }

  switch (props.status.type) {
    case 1: return t("status.busy"); // SnAccountStatusType.busy
    case 2: return t("status.doNotDisturb"); // SnAccountStatusType.doNotDisturb
    case 3: return t("status.invisible"); // SnAccountStatusType.invisible
    default: return props.status.isOnline ? t("status.online") : t("status.offline");
  }
});

const statusIcon = computed(() => {
  if (props.status.isIdleOrOnline) {
    return IconMoon;
  }

  switch (props.status.type) {
    case 1: return IconMoon; // busy
    case 2: return IconCircle; // doNotDisturb
    case 3: return IconEyeOff; // invisible
    default: return IconCircle;
  }
});

const statusBgClass = computed(() => {
  if (props.status.isIdleOrOnline) {
    return "bg-amber-500/15";
  }

  switch (props.status.type) {
    case 1: return "bg-orange-500/15"; // busy
    case 2: return "bg-deep-orange-500/15"; // doNotDisturb
    case 3: return "bg-gray-500/15"; // invisible
    default: return props.status.isOnline ? "bg-green-500/15" : "bg-gray-500/15";
  }
});

const statusIconClass = computed(() => {
  if (props.status.isIdleOrOnline) {
    return "text-amber-500";
  }

  switch (props.status.type) {
    case 1: return "text-orange-500"; // busy
    case 2: return "text-deep-orange-500"; // doNotDisturb
    case 3: return "text-gray-500"; // invisible
    default: return props.status.isOnline ? "text-green-500" : "text-gray-500";
  }
});

const statusBadgeClass = computed(() => {
  if (props.status.isIdleOrOnline) {
    return "bg-amber-500";
  }

  switch (props.status.type) {
    case 1: return "bg-orange-500"; // busy
    case 2: return "bg-deep-orange-500"; // doNotDisturb
    case 3: return "bg-gray-500"; // invisible
    default: return props.status.isOnline ? "bg-green-500" : "bg-gray-500";
  }
});

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
</script>
