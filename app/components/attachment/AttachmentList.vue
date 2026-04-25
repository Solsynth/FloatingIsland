<template>
	<div class="relative">
		<!-- Carousel Container -->
		<div class="overflow-hidden rounded-lg max-h-125">
			<div
				class="flex transition-transform duration-300 ease-out h-full"
				:style="{ transform: `translateX(-${currentIndex * 100}%)` }"
			>
				<div
					v-for="attachment in attachments"
					:key="attachment.id"
					class="w-full shrink-0 h-full"
				>
					<AttachmentItem
						:attachment="attachment"
						class="w-full h-full min-h-[300px]"
					/>
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

const props = defineProps<{
	attachments: FileAttachment[];
}>();

const currentIndex = ref(0);

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
</script>
