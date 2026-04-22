<template>
    <div>
        <div
            v-if="attachments.length"
            class="grid gap-1 rounded-xl overflow-hidden"
            :class="gridClass"
            :style="containerStyle"
        >
            <NuxtLink
                v-for="attachment in visibleAttachments"
                :key="attachment.id"
                :to="`/files/${attachment.id}`"
                class="relative bg-base-300 cursor-pointer block overflow-hidden"
                :class="{ 'aspect-video': !maxHeight }"
                :style="itemStyle"
                @click.stop
            >
                <img
                    v-if="getAttachmentUrl(attachment)"
                    :src="getAttachmentUrl(attachment)"
                    :alt="attachment.name"
                    class="w-full h-full object-cover"
                />
                <div
                    v-else
                    class="w-full h-full flex items-center justify-center"
                >
                    <IconFile class="w-8 h-8 text-base-content/30" />
                </div>
                <!-- Video indicator -->
                <div
                    v-if="attachment.mimeType?.startsWith('video/')"
                    class="absolute inset-0 flex items-center justify-center bg-black/30"
                >
                    <IconPlay class="w-10 h-10 text-white" />
                </div>
                <!-- Blurhash placeholder (if available) -->
                <div
                    v-if="attachment.blurhash && !loadedAttachments.has(attachment.id)"
                    class="absolute inset-0 bg-base-300"
                >
                    <!-- Note: blurhash rendering would require the blurhash package -->
                </div>
            </NuxtLink>
        </div>
        <button
            v-if="attachments.length > maxVisible"
            class="btn btn-ghost btn-xs mt-1"
            @click="showAll = !showAll"
        >
            {{ showAll ? 'Show less' : `+${attachments.length - maxVisible} more` }}
        </button>
    </div>
</template>

<script setup lang="ts">
import type { FileAttachment } from '~/types/post';
import { getFileUrl } from '~/utils/files';

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
const loadedAttachments = ref(new Set<string>());

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

function getAttachmentUrl(attachment: FileAttachment): string | null {
    return attachment.url || getFileUrl(attachment.id);
}

function onImageLoad(attachmentId: string) {
    loadedAttachments.value.add(attachmentId);
}
</script>
