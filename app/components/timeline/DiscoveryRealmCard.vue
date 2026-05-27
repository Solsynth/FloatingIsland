<template>
  <div class="card bg-base-100 shadow-sm">
    <div class="card-body p-4">
      <div class="flex items-center gap-3">
        <div v-if="realmPictureUrl" class="avatar">
          <div class="h-12 w-12 rounded-lg">
            <img
              :src="realmPictureUrl"
              :alt="realm.name"
              class="h-full w-full rounded-lg object-cover"
            />
          </div>
        </div>
        <div
          v-else
          class="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center"
        >
          <IconGlobe class="h-6 w-6 text-primary" />
        </div>
        <div class="flex-1 min-w-0">
          <h3 class="font-semibold text-sm truncate">{{ realm.name }}</h3>
          <p
            v-if="realm.description"
            class="text-xs text-base-content/60 line-clamp-2 mt-0.5"
          >
            {{ realm.description }}
          </p>
        </div>
      </div>
      <div class="flex items-center gap-2 mt-3">
        <NuxtLink
          :to="`/realms/${realm.slug}`"
          class="btn btn-primary btn-xs flex-1"
        >
          View Realm
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
import { IconGlobe, IconSparkles } from "#components";

const props = defineProps<{
  item: DiscoveryItem;
}>();

const realm = computed(() => {
  const data = props.item.data as unknown as {
    id: string;
    name: string;
    slug: string;
    description?: string;
    picture?: { id: string };
  };
  return data;
});

const realmPictureUrl = computed(() => {
  if (!realm.value.picture) return undefined;
  return getFileUrl(realm.value.picture.id) ?? undefined;
});

const reasons = computed(() => props.item.reasons ?? []);
</script>
