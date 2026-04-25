<template>
    <div>
        <div
            v-if="attachments.length"
            class="grid gap-1 rounded-lg overflow-hidden"
            :class="gridClass"
            :style="containerStyle"
        >
            <NuxtLink
                v-for="attachment in visibleAttachments"
                :key="attachment.id"
                :to="`/files/${attachment.id}`"
                class="relative block overflow-hidden"
                :class="{ 'aspect-video': !maxHeight }"
                :style="itemStyle"
                @click.stop
            >
                <AttachmentItem
                    :attachment="attachment"
                    class="w-full h-full"
                />
            </NuxtLink>
        </div>
        <button
            v-if="attachments.length > maxVisible"
            class="btn btn-ghost btn-xs mt-1"
            @click.stop="showAll = !showAll"
        >
            {{ showAll ? 'Show less' : `+${attachments.length - maxVisible} more` }}
        </button>
    </div>
</template>

<script setup lang="ts">
import type { FileAttachment } from '~/types/post';

interface Props {
    attachments: FileAttachment[];
    maxHeight?: number;
    maxVisible?: number;
}

const props = withDefaults(defineProps<Props>(), {
    maxHeight: 0,
    maxVisible: 4,
});

const showAll = ref(false);

const visibleAttachments = computed(() => {
    if (showAll.value) return props.attachments;
    return props.attachments.slice(0, props.maxVisible);
});

const gridClass = computed(() => {
    const count = visibleAttachments.value.length;
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-2';
    if (count === 3) return 'grid-cols-2 grid-rows-2';
    return 'grid-cols-2';
});

const containerStyle = computed(() => {
    if (props.maxHeight) {
        return { maxHeight: `${props.maxHeight}px` };
    }
    return {};
});

const itemStyle = computed(() => {
    if (props.maxHeight) {
        return { maxHeight: `${props.maxHeight}px` };
    }
    return {};
});
</script>
