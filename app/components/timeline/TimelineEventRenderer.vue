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

    <!-- Friend presence events -->
    <FriendPresenceCard
      v-else-if="isPresenceEvent && presenceActivity"
      :activity="presenceActivity"
      :raw-data="presenceRawData"
    />

    <!-- Friend status events -->
    <FriendStatusCard
      v-else-if="isStatusEvent && statusData"
      :status="statusData"
      :created-at="event.createdAt"
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

const isPostEvent = computed(() =>
  props.event.type === "posts.new" || props.event.type === "posts.new.replies"
);

const isPresenceEvent = computed(() =>
  props.event.type === "presence.friend"
);

const isStatusEvent = computed(() =>
  props.event.type === "status.friend"
);

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


