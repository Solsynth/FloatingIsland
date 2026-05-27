<template>
  <div class="card bg-base-100 shadow-sm">
    <div class="card-body p-4">
      <div class="flex items-center gap-2 mb-3">
        <IconUser class="h-4 w-4 text-accent" />
        <span class="text-xs font-medium text-base-content/60">Suggested People</span>
      </div>
      <div class="flex items-center gap-3">
        <div v-if="accountPictureUrl" class="avatar">
          <div class="h-12 w-12 rounded-full">
            <img :src="accountPictureUrl" :alt="account.nick || account.name" class="h-full w-full rounded-full object-cover" />
          </div>
        </div>
        <div v-else class="avatar avatar-placeholder">
          <div class="h-12 w-12 rounded-full bg-accent text-accent-content">
            <span class="text-sm font-medium">{{ getInitials(account.nick || account.name) }}</span>
          </div>
        </div>
        <div class="flex-1 min-w-0">
          <h3 class="font-semibold text-sm truncate">{{ account.nick || account.name }}</h3>
          <p class="text-xs text-base-content/50">@{{ account.name }}</p>
          <p v-if="account.profile?.bio" class="text-xs text-base-content/60 line-clamp-1 mt-0.5">{{ account.profile.bio }}</p>
        </div>
      </div>
      <div class="flex items-center gap-2 mt-3">
        <NuxtLink :to="`/accounts/${account.name}`" class="btn btn-accent btn-xs flex-1">
          View Profile
        </NuxtLink>
      </div>
      <div v-if="reasons.length > 0" class="flex items-center gap-1.5 mt-2 text-xs text-base-content/50">
        <IconSparkles class="h-3 w-3" />
        <span>{{ reasons[0] }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DiscoveryItem } from "~/types/post";
import { getFileUrl } from "~/utils/files";
import { IconUser, IconSparkles } from "#components";

const props = defineProps<{
  item: DiscoveryItem;
}>();

const account = computed(() => {
  const data = props.item.data as unknown as {
    id: string;
    name: string;
    nick?: string;
    profile?: {
      bio?: string;
      picture?: { id: string };
    };
  };
  return data;
});

const accountPictureUrl = computed(() => {
  if (!account.value.profile?.picture) return undefined;
  return getFileUrl(account.value.profile.picture.id) ?? undefined;
});

const reasons = computed(() => props.item.reasons ?? []);

function getInitials(name: string): string {
  if (!name || name === "Unknown") return "?";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}
</script>
