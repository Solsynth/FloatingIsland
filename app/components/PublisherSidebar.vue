<template>
  <div class="flex flex-col gap-4">
    <!-- Publisher Card -->
    <div v-if="publisher" class="card bg-base-100 overflow-hidden">
      <!-- Background Banner -->
      <div class="h-20 w-full bg-base-200">
        <img
          v-if="backgroundUrl"
          :src="backgroundUrl"
          :alt="`${displayName} background`"
          class="h-full w-full object-cover"
        >
      </div>

      <div class="card-body p-4">
        <!-- Avatar and Name -->
        <div class="flex items-center gap-3 -mt-8 mb-3">
          <NuxtLink :to="`/publishers/${publisher.name}`" class="shrink-0">
            <div v-if="avatarUrl" class="avatar">
              <div class="w-16 h-16 rounded-full ring-4 ring-base-100">
                <img :src="avatarUrl" :alt="displayName" >
              </div>
            </div>
            <div v-else class="avatar avatar-placeholder">
              <div
                class="w-16 h-16 rounded-2xl bg-primary text-primary-content flex items-center justify-center text-xl font-bold ring-4 ring-base-100"
              >
                {{ getInitials(displayName) }}
              </div>
            </div>
          </NuxtLink>
          <div class="min-w-0 flex-1 pt-6">
            <NuxtLink
              :to="`/${publisher.name}`"
              class="font-bold text-lg truncate hover:underline"
            >
              {{ displayName }}
            </NuxtLink>
            <p class="text-sm text-base-content/60 truncate">
              @{{ publisher.name }}
            </p>
          </div>
        </div>

        <!-- Bio -->
        <p
          v-if="publisher.bio"
          class="text-sm text-base-content/80 line-clamp-4 mb-3"
        >
          {{ publisher.bio }}
        </p>

        <!-- Verification Badge -->
        <div
          v-if="publisher.verification"
          class="flex items-center gap-2 p-2 rounded-lg bg-primary/10 text-primary text-sm"
        >
          <IconShieldCheck class="w-4 h-4" />
          <span class="font-medium">{{ publisher.verification.title }}</span>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-2 mt-3">
          <NuxtLink
            :to="`/publishers/${publisher.name}`"
            class="btn btn-primary btn-sm flex-1"
          >
            View Profile
          </NuxtLink>
          <button
            class="btn btn-outline btn-sm btn-square"
            @click="sharePublisher"
          >
            <IconShare2 class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Publisher } from "~/types/post";
import { getFileUrl } from "~/utils/files";

const props = defineProps<{
  publisher: Publisher | null;
}>();

const displayName = computed(
  () => props.publisher?.nick || props.publisher?.name || "Unknown",
);
const avatarUrl = computed(() => getFileUrl(props.publisher?.picture?.id));
const backgroundUrl = computed(() =>
  getFileUrl(props.publisher?.background?.id),
);

function getInitials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0]?.toUpperCase())
      .slice(0, 2)
      .join("") || "?"
  );
}

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
}

function sharePublisher() {
  if (props.publisher?.name) {
    navigator.share?.({
      title: displayName.value,
      url: `${window.location.origin}/${props.publisher.name}`,
    }) ??
      navigator.clipboard.writeText(
        `${window.location.origin}/${props.publisher.name}`,
      );
  }
}
</script>
