<template>
  <div
    v-if="hasRenderableContent"
    class="timeline-event"
  >
    <!-- Post events -->
    <TimelinePostItem
      v-if="isPostEvent"
      :event="event"
      @boost="$emit('boost', $event)"
      @share="$emit('share', $event)"
      @reply="$emit('reply', $event)"
    />

    <!-- Discovery carousels (personalized suggestions) -->
    <DiscoveryActivityBlock
      v-else-if="isDiscoveryEvent"
      :event="event"
      @boost="$emit('boost', $event)"
      @share="$emit('share', $event)"
      @reply="$emit('reply', $event)"
    />

    <!-- Friend presence events -->
    <FriendPresenceCard
      v-else-if="isPresenceEvent && presenceActivity"
      :activity="presenceActivity"
      :raw-data="presenceRawData"
      variant="feed"
    />

    <!-- Friend status events -->
    <FriendStatusCard
      v-else-if="isStatusEvent && statusData"
      :status="statusData"
      :created-at="event.createdAt"
      variant="feed"
    />
  </div>
</template>

<script setup lang="ts">
import type {
  SnTimelineEvent,
  SnPresenceActivity,
  Post,
} from "~/types/post";

const props = defineProps<{
  event: SnTimelineEvent;
}>();

defineEmits<{
  boost: [post: Post];
  share: [post: Post];
  reply: [post: Post];
}>();

const isPostEvent = computed(
  () =>
    props.event.type === "posts.new" ||
    props.event.type === "posts.new.replies",
);

const isDiscoveryEvent = computed(
  () =>
    props.event.type === "discovery" || props.event.type === "discovery.v2",
);

const isPresenceEvent = computed(() => props.event.type === "presence.friend");

const isStatusEvent = computed(() => props.event.type === "status.friend");

const hasRenderableContent = computed(() => {
  if (props.event.data == null) return false;
  return (
    isPostEvent.value ||
    isDiscoveryEvent.value ||
    isPresenceEvent.value ||
    isStatusEvent.value
  );
});

const presenceActivity = computed<SnPresenceActivity | null>(() => {
  if (!isPresenceEvent.value) return null;
  const data = props.event.data as Record<string, unknown>;
  return (data?.activity as SnPresenceActivity) ?? null;
});

const presenceRawData = computed<Record<string, unknown>>(() => {
  if (!isPresenceEvent.value) return {};
  return (props.event.data as Record<string, unknown>) ?? {};
});

const statusData = computed(() => {
  if (!isStatusEvent.value) return null;
  const data = props.event.data as Record<string, unknown>;
  return (data?.status as import("~/types/post").SnAccountStatus) ?? null;
});
</script>

<style scoped>
.timeline-event {
  content-visibility: auto;
  contain-intrinsic-size: auto 240px;
}
</style>
