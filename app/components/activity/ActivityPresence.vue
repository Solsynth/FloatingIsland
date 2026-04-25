<template>
    <div class="flex items-center gap-2 text-sm">
        <div class="w-2.5 h-2.5 rounded-full" :class="statusClass" />
        <span :class="textClass">{{ statusText }}</span>
        <span v-if="showLastSeen && lastSeenText" class="text-base-content/50">
            · {{ lastSeenText }}
        </span>
    </div>
</template>

<script setup lang="ts">
import type { SnAccount } from "~/types/auth";

interface Props {
    account: SnAccount;
    showLastSeen?: boolean;
}

const props = defineProps<Props>();

const status = computed(() => {
    // Check if user has presence data
    const presence = props.account.profile?.presence;
    if (!presence) return "offline";
    return presence.status || "offline";
});

const lastSeen = computed(() => {
    const presence = props.account.profile?.presence;
    if (!presence?.lastSeenAt) return null;
    return new Date(presence.lastSeenAt);
});

const statusClass = computed(() => {
    switch (status.value) {
        case "online":
            return "bg-success animate-pulse";
        case "away":
            return "bg-warning";
        case "busy":
            return "bg-error";
        case "offline":
        default:
            return "bg-base-content/30";
    }
});

const textClass = computed(() => {
    switch (status.value) {
        case "online":
            return "text-success font-medium";
        case "away":
            return "text-warning";
        case "busy":
            return "text-error";
        case "offline":
        default:
            return "text-base-content/50";
    }
});

const statusText = computed(() => {
    switch (status.value) {
        case "online":
            return "Online";
        case "away":
            return "Away";
        case "busy":
            return "Do not disturb";
        case "offline":
        default:
            return "Offline";
    }
});

const lastSeenText = computed(() => {
    if (!lastSeen.value) return null;

    const now = new Date();
    const diff = now.getTime() - lastSeen.value.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return lastSeen.value.toLocaleDateString();
});
</script>
