<template>
	<div class="relative">
		<!-- Carousel Container -->
		<div class="overflow-hidden rounded-xl max-h-125">
			<div
				class="flex transition-transform duration-300 ease-out h-full"
				:style="{ transform: `translateX(-${currentIndex * 100}%)` }"
			>
				<div
					v-for="attachment in attachments"
					:key="attachment.id"
					class="w-full shrink-0 h-full"
				>
					<NuxtLink
						:to="`/files/${attachment.id}`"
						class="relative bg-base-300 cursor-pointer overflow-hidden flex items-center justify-center min-h-[300px]"
						style="height: 100%;"
						@click.stop
					>
						<!-- Blurhash Background - stays visible behind image -->
						<div
							v-if="getBlurhash(attachment)"
							class="absolute inset-0 w-full h-full z-0"
						>
							<canvas
								:ref="(el) => setCanvasRef(el, attachment.id)"
								:data-blurhash="getBlurhash(attachment)"
								class="blurhash-canvas block"
								style="width: 100%; height: 100%;"
							/>
						</div>

						<!-- Main Image with object-fit: contain -->
						<img
							v-if="getAttachmentUrl(attachment)"
							:src="getAttachmentUrl(attachment)!"
							:alt="attachment.name"
							class="relative z-10 max-w-full max-h-125 w-auto h-auto object-contain"
						>

						<!-- File Icon Fallback -->
						<div
							v-else
							class="w-full h-full flex items-center justify-center min-h-50 relative z-10"
						>
							<IconFile class="w-8 h-8 text-base-content/30" />
						</div>

						<!-- Video indicator -->
						<div
							v-if="attachment.mimeType?.startsWith('video/')"
							class="absolute inset-0 flex items-center justify-center bg-black/30 z-20"
						>
							<IconPlay class="w-10 h-10 text-white" />
						</div>
					</NuxtLink>
				</div>
			</div>
		</div>

		<!-- Navigation Arrows (only show if more than 1 attachment) -->
		<template v-if="attachments.length > 1">
			<!-- Previous Button -->
			<button
				class="btn btn-circle btn-sm btn-ghost absolute left-2 top-1/2 -translate-y-1/2 bg-base-100/80 hover:bg-base-100 shadow-sm"
				:class="{ 'opacity-50 cursor-not-allowed': isFirst }"
				:disabled="isFirst"
				@click.stop="prev"
			>
				<IconChevronLeft class="w-4 h-4" />
			</button>

			<!-- Next Button -->
			<button
				class="btn btn-circle btn-sm btn-ghost absolute right-2 top-1/2 -translate-y-1/2 bg-base-100/80 hover:bg-base-100 shadow-sm"
				:class="{ 'opacity-50 cursor-not-allowed': isLast }"
				:disabled="isLast"
				@click.stop="next"
			>
				<IconChevronRight class="w-4 h-4" />
			</button>

			<!-- Dots Indicator -->
			<div
				class="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5"
			>
				<button
					v-for="(_, index) in attachments"
					:key="index"
					class="w-2 h-2 rounded-full transition-colors"
					:class="
                        index === currentIndex
                            ? 'bg-white shadow-sm'
                            : 'bg-white/50 hover:bg-white/70'
                    "
					@click.stop="goTo(index)"
				/>
			</div>

			<!-- Counter -->
			<div
				class="absolute top-2 right-2 px-2 py-0.5 bg-black/50 rounded-full text-xs text-white font-medium z-30"
			>
				{{ currentIndex + 1 }} / {{ attachments.length }}
			</div>
		</template>
	</div>
</template>

<script setup lang="ts">
import type { FileAttachment } from '~/types/post';
import type { ComponentPublicInstance } from 'vue';
import { getFileUrl } from '~/utils/files';
import { decode } from 'blurhash';

const props = defineProps<{
	attachments: FileAttachment[];
}>();

const currentIndex = ref(0);
const canvasMap = ref<Map<string, HTMLCanvasElement>>(new Map());

const isFirst = computed(() => currentIndex.value === 0);
const isLast = computed(() => currentIndex.value === props.attachments.length - 1);

function prev() {
	if (!isFirst.value) {
		currentIndex.value--;
	}
}

function next() {
	if (!isLast.value) {
		currentIndex.value++;
	}
}

function goTo(index: number) {
	currentIndex.value = index;
}

function getAttachmentUrl(attachment: FileAttachment): string | null {
	return attachment.url || getFileUrl(attachment.id);
}

function getBlurhash(attachment: FileAttachment): string | null {
	return (attachment.fileMeta?.['blur'] as string) || null;
}

// Store canvas refs in a map keyed by attachment ID
function setCanvasRef(el: Element | ComponentPublicInstance | null, id: string) {
	if (el instanceof HTMLCanvasElement) {
		canvasMap.value.set(id, el);
		// Render blurhash immediately when ref is set
		const attachment = props.attachments.find(a => a.id === id);
		if (attachment) {
			const blurhash = getBlurhash(attachment);
			if (blurhash) {
				renderBlurhashToCanvas(el, blurhash);
			}
		}
	}
}

// Render blurhash to canvas
function renderBlurhashToCanvas(canvas: HTMLCanvasElement, blurhash: string) {
	if (!blurhash || !canvas) return false;

	// Skip if already rendered
	if (canvas.dataset.rendered === 'true') return true;

	try {
		const width = 32;
		const height = 32;
		const pixels = decode(blurhash, width, height);

		canvas.width = width;
		canvas.height = height;

		const ctx = canvas.getContext('2d');
		if (!ctx) return false;

		const imageData = ctx.createImageData(width, height);
		imageData.data.set(pixels);
		ctx.putImageData(imageData, 0, 0);

		// Mark as rendered
		canvas.dataset.rendered = 'true';
		return true;
	} catch (e) {
		console.warn('Failed to decode blurhash:', e);
		return false;
	}
}

// Render blurhash for the current slide when index changes
watch(currentIndex, (newIndex) => {
	const attachment = props.attachments[newIndex];
	if (!attachment) return;

	const blurhash = getBlurhash(attachment);
	if (!blurhash) return;

	const canvas = canvasMap.value.get(attachment.id);
	if (canvas) {
		renderBlurhashToCanvas(canvas, blurhash);
	}
});

// Also render when component mounts
onMounted(() => {
	// Render all canvases in the map
	canvasMap.value.forEach((canvas, id) => {
		const attachment = props.attachments.find(a => a.id === id);
		if (attachment) {
			const blurhash = getBlurhash(attachment);
			if (blurhash) {
				renderBlurhashToCanvas(canvas, blurhash);
			}
		}
	});
});

// Clean up map when component unmounts
onUnmounted(() => {
	canvasMap.value.clear();
});
</script>

<style scoped>
.blurhash-canvas {
	display: block;
}
</style>
