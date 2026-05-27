<template>
  <div>
    <!-- Post events -->
    <TimelinePostItem
      v-if="isPostEvent"
      :event="event"
      @boost="$emit('boost', $event)"
      @share="$emit('share', $event)"
      @reply="$emit('reply', $event)"
    />

    <!-- Discovery events -->
    <div
      v-else-if="isDiscoveryEvent && discoveryItems.length > 0"
      class="card bg-base-100 shadow-sm"
    >
      <div class="card-body p-4">
        <!-- Header -->
        <div class="flex items-center gap-2 mb-3">
          <component :is="discoveryIcon" class="h-4 w-4" :class="discoveryIconColor" />
          <span class="text-sm font-medium">{{ discoveryTitle }}</span>
        </div>

        <!-- Horizontal scrollable list -->
        <div class="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin">
          <div
            v-for="(item, index) in discoveryItems"
            :key="index"
            class="shrink-0"
            :class="item.type === 'post' ? 'w-72' : 'w-60'"
          >
            <!-- Realm discovery -->
            <DiscoveryRealmCard
              v-if="item.type === 'realm'"
              :item="item"
            />

            <!-- Publisher discovery -->
            <DiscoveryPublisherCard
              v-else-if="item.type === 'publisher'"
              :item="item"
            />

            <!-- Account discovery -->
            <DiscoveryAccountCard
              v-else-if="item.type === 'account'"
              :item="item"
            />

            <!-- Article discovery -->
            <DiscoveryArticleCard
              v-else-if="item.type === 'article'"
              :item="item"
            />

            <!-- Post discovery (shuffled) -->
            <DiscoveryPostCard
              v-else-if="item.type === 'post'"
              :item="item"
              @boost="$emit('boost', $event)"
              @share="$emit('share', $event)"
              @reply="$emit('reply', $event)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Friend presence events -->
    <FriendPresenceCard
      v-else-if="isPresenceEvent && presenceActivity"
      :activity="presenceActivity"
    />
  </div>
</template>

<script setup lang="ts">
import type {
  SnTimelineEvent,
  SnPresenceActivity,
  DiscoveryData,
  DiscoveryItem,
  Post,
} from "~/types/post";
import {
  IconGlobe,
  IconUserCircle,
  IconUser,
  IconNewspaper,
  IconShuffle,
  IconSparkles,
} from "#components";

const props = defineProps<{
  event: SnTimelineEvent;
}>();

defineEmits<{
  boost: [post: Post];
  share: [post: Post];
  reply: [post: Post];
}>();

const isPostEvent = computed(() =>
  props.event.type === "posts.new" || props.event.type === "posts.new.replies"
);

const isDiscoveryEvent = computed(() =>
  props.event.type === "discovery" || props.event.type === "discovery.v2"
);

const isPresenceEvent = computed(() =>
  props.event.type === "presence.friend"
);

const discoveryData = computed(() => {
  if (!isDiscoveryEvent.value) return null;
  const data = props.event.data as DiscoveryData;
  return data;
});

const discoveryItems = computed<DiscoveryItem[]>(() => {
  if (!discoveryData.value) return [];
  return discoveryData.value.items ?? [];
});

const discoveryKind = computed(() => {
  if (!discoveryData.value) return null;
  // Use the kind from data, or infer from first item type
  return discoveryData.value.kind ?? discoveryItems.value[0]?.type ?? null;
});

const discoveryTitle = computed(() => {
  switch (discoveryKind.value) {
    case "realm": return "Suggested Realms";
    case "publisher": return "Suggested Publishers";
    case "account": return "Suggested People";
    case "article": return "Discover Web Articles";
    case "post": return "Discover Posts";
    default: return "Discover";
  }
});

const discoveryIcon = computed(() => {
  switch (discoveryKind.value) {
    case "realm": return IconGlobe;
    case "publisher": return IconUserCircle;
    case "account": return IconUser;
    case "article": return IconNewspaper;
    case "post": return IconShuffle;
    default: return IconSparkles;
  }
});

const discoveryIconColor = computed(() => {
  switch (discoveryKind.value) {
    case "realm": return "text-primary";
    case "publisher": return "text-secondary";
    case "account": return "text-accent";
    case "article": return "text-info";
    case "post": return "text-warning";
    default: return "text-base-content/60";
  }
});

const presenceActivity = computed<SnPresenceActivity | null>(() => {
  if (!isPresenceEvent.value) return null;
  const data = props.event.data as Record<string, unknown>;
  return (data?.activity as SnPresenceActivity) ?? null;
});
</script>

<style scoped>
.scrollbar-thin {
  scrollbar-width: thin;
  scrollbar-color: oklch(var(--bc) / 0.2) transparent;
}

.scrollbar-thin::-webkit-scrollbar {
  height: 6px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background-color: oklch(var(--bc) / 0.2);
  border-radius: 3px;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background-color: oklch(var(--bc) / 0.3);
}
</style>
