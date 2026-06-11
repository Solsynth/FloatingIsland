<script setup lang="ts">
const {
	title = '',
	description = '',
	authorName = '',
	authorAvatar = '',
	postImage = ''
} = defineProps<{
	title?: string
	description?: string
	authorName?: string
	authorAvatar?: string
	postImage?: string
}>();

const initials = computed(() => {
	if (!authorName) return '?';
	return authorName.slice(0, 2).toUpperCase();
});

const truncatedContent = computed(() => {
	if (!description) return '';
	return description.length > 200 ? description.slice(0, 200) + '...' : description;
});

// Ensure avatar URL is absolute
const fullAvatarUrl = computed(() => {
	if (!authorAvatar) return '';
	if (authorAvatar.startsWith('http')) return authorAvatar;
	return `https://api.solian.app/drive/files/${authorAvatar}`;
});

// Ensure post image URL is absolute
const fullPostImageUrl = computed(() => {
	if (!postImage) return '';
	if (postImage.startsWith('http')) return postImage;
	return `https://api.solian.app/drive/files/${postImage}`;
});

const hasBackgroundImage = computed(() => !!fullPostImageUrl.value);
</script>

<template>
	<div
		class="w-full h-full"
		style="font-family: 'Nunito', 'Noto Sans SC', sans-serif; position: relative; overflow: hidden;"
	>
		<!-- Background: Image or Gradient -->
		<img
			v-if="hasBackgroundImage"
			:src="fullPostImageUrl"
			alt=""
			style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center; filter: blur(6px); transform: scale(1.05);"
		/>
		<div
			v-else
			style="position: absolute; inset: 0; background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);"
		/>

		<!-- Dark overlay (stronger when image bg) -->
		<div
			style="position: absolute; inset: 0;"
			:style="hasBackgroundImage
        ? 'background: linear-gradient(0deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.2) 100%);'
        : 'background: linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(30, 41, 59, 0.75) 50%, rgba(15, 23, 42, 0.85) 100%);'"
		/>

		<!-- Grid pattern overlay (subtle) -->
		<div
			v-if="!hasBackgroundImage"
			style="position: absolute; inset: 0; background-image: radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px); background-size: 24px 24px;"
		/>

		<!-- Solar Network branding (top-left) -->
		<div
			class="flex items-center gap-3"
			style="position: absolute; top: 40px; left: 60px; z-index: 10;"
		>
			<img
				src="/favicon.png"
				alt="Solar Network"
				style="width: 36px; height: 36px; filter: invert(1) brightness(10);"
			/>
			<span class="text-white" style="font-size: 20px; font-weight: 600; opacity: 0.9;">
        Solar Network
      </span>
		</div>

		<!-- Content: Bottom aligned -->
		<div
			class="w-full h-full flex flex-col justify-end"
			style="position: relative; z-index: 1; padding: 60px;"
		>
			<!-- Post title (if exists) -->
			<h1
				v-if="title"
				class="text-white"
				style="font-size: 48px; font-weight: 800; margin: 0 0 20px 0; line-height: 1.15; letter-spacing: -0.5px; text-shadow: 0 2px 12px rgba(0,0,0,0.5);"
			>
				{{ title }}
			</h1>

			<!-- Post content -->
			<p
				v-if="truncatedContent"
				class="text-white whitespace-pre-wrap"
				style="font-size: 24px; font-weight: 400; margin: 0 0 32px 0; line-height: 1.5; opacity: 0.9; text-shadow: 0 1px 8px rgba(0,0,0,0.4);"
			>
				{{ truncatedContent }}
			</p>

			<!-- Author info -->
			<div class="flex items-center gap-4">
				<!-- Avatar -->
				<div
					v-if="fullAvatarUrl"
					style="width: 56px; height: 56px; border-radius: 50%; overflow: hidden; border: 2px solid rgba(255,255,255,0.3); flex-shrink: 0;"
				>
					<img
						:src="fullAvatarUrl"
						:alt="authorName"
						style="width: 100%; height: 100%; object-fit: cover;"
					/>
				</div>
				<div
					v-else
					style="width: 56px; height: 56px; border-radius: 50%; background: linear-gradient(135deg, #6366f1, #8b5cf6); display: flex; align-items: center; justify-content: center; border: 2px solid rgba(255,255,255,0.2); flex-shrink: 0;"
				>
          <span class="text-white" style="font-size: 22px; font-weight: 700;">
            {{ initials }}
          </span>
				</div>

				<!-- Username -->
				<div>
					<p class="text-white"
					   style="font-size: 24px; font-weight: 700; margin: 0; line-height: 1.2; text-shadow: 0 1px 6px rgba(0,0,0,0.4);">
						{{ authorName }}
					</p>
				</div>
			</div>
		</div>

		<!-- Bottom accent line -->
		<div
			style="position: absolute; bottom: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #6366f1, #3b82f6, #8b5cf6);"
		/>
	</div>
</template>
