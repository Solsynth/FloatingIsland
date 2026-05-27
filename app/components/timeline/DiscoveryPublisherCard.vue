<template>
  <div class="card bg-base-100 shadow-sm">
    <div class="card-body p-4">
      <div class="flex items-center gap-3">
        <div v-if="publisherPictureUrl" class="avatar">
          <div class="h-12 w-12 rounded-full">
            <img
              :src="publisherPictureUrl"
              :alt="publisher.nick || publisher.name"
              class="h-full w-full rounded-full object-cover"
            />
          </div>
        </div>
        <div v-else class="avatar avatar-placeholder">
          <div
            class="h-12 w-12 rounded-full bg-secondary text-secondary-content"
          >
            <span class="text-sm font-medium">{{
              getInitials(publisher.nick || publisher.name)
            }}</span>
          </div>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-1.5">
            <h3 class="font-semibold text-sm truncate">
              {{ publisher.nick || publisher.name }}
            </h3>
            <IconBadgeCheck
              v-if="publisher.verification"
              class="h-4 w-4 text-primary shrink-0"
            />
          </div>
          <p class="text-xs text-base-content/50">@{{ publisher.name }}</p>
          <p
            v-if="publisher.bio"
            class="text-xs text-base-content/60 line-clamp-1 mt-0.5"
          >
            {{ publisher.bio }}
          </p>
        </div>
      </div>
      <div class="flex items-center gap-2 mt-3">
        <NuxtLink
          :to="`/publishers/${publisher.name}`"
          class="btn btn-secondary btn-xs flex-1"
        >
          View Profile
        </NuxtLink>
      </div>
      <div
        v-if="reasons.length > 0"
        class="flex items-center gap-1.5 mt-2 text-xs text-base-content/50"
      >
        <IconSparkles class="h-3 w-3" />
        <span>{{ reasons[0] }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DiscoveryItem } from "~/types/post";
import { getFileUrl } from "~/utils/files";
import { IconBadgeCheck, IconSparkles } from "#components";

const props = defineProps<{
  item: DiscoveryItem;
}>();

const publisher = computed(() => {
  const data = props.item.data as unknown as {
    id: string;
    name: string;
    nick?: string;
    bio?: string;
    picture?: { id: string };
    verification?: unknown;
  };
  return data;
});

const publisherPictureUrl = computed(() => {
  if (!publisher.value.picture) return undefined;
  return getFileUrl(publisher.value.picture.id) ?? undefined;
});

const reasons = computed(() => props.item.reasons ?? []);

function getInitials(name: string): string {
  if (!name || name === "Unknown") return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
</script>
