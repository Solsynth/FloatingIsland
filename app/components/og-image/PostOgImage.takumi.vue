<script setup lang="ts">
import { snakeToCamel } from '~/utils/case'

const { postId } = defineProps<{
  postId: string
}>()

const runtimeConfig = useRuntimeConfig()
const fileBaseUrl = runtimeConfig.public.fileBaseUrl as string
const apiBaseUrl = runtimeConfig.public.apiBaseUrl as string

// Fetch post data server-side
const { data: post } = await useAsyncData(
  `og-post-${postId}`,
  () => $fetch(`${apiBaseUrl}/sphere/posts/${encodeURIComponent(postId)}`).then(snakeToCamel),
  { server: true }
)

// Computed values - use title + description, fallback description to content
const title = computed(() => post.value?.title || '')
const description = computed(() => post.value?.description || post.value?.content || '')
const authorName = computed(() => post.value?.publisher?.nick || post.value?.publisher?.name || '')
const authorAvatar = computed(() => post.value?.publisher?.picture?.id || '')
const postImage = computed(() => {
  const image = post.value?.attachments?.find((a: { mimeType: string }) => a.mimeType?.startsWith('image/'))
  return image?.id || ''
})

const initials = computed(() => {
  if (!authorName.value) return '?'
  return authorName.value.slice(0, 2).toUpperCase()
})

const truncatedContent = computed(() => {
  if (!description.value) return ''
  return description.value.length > 200 ? description.value.slice(0, 200) + '...' : description.value
})

// Use optimized image URLs with size constraints
const optimizedAvatarUrl = computed(() => {
  if (!authorAvatar.value) return ''
  if (authorAvatar.value.startsWith('http')) return authorAvatar.value
  // Request optimized size for avatar (112x112 for OG @2x)
  return `${fileBaseUrl}/${authorAvatar.value}?w=112&h=112&fit=cover&format=webp`
})

const optimizedPostImageUrl = computed(() => {
  if (!postImage.value) return ''
  if (postImage.value.startsWith('http')) return postImage.value
  // Request optimized size for OG background (900x450)
  return `${fileBaseUrl}/${postImage.value}?w=900&h=450&fit=cover&format=webp`
})

const hasBackgroundImage = computed(() => !!optimizedPostImageUrl.value)
const hasAuthor = computed(() => !!authorName.value)
</script>

<template>
  <div
    class="w-full h-full"
    style="font-family: 'Nunito', 'Noto Sans SC', sans-serif; position: relative; overflow: hidden;"
  >
    <!-- Background: Image or Gradient -->
    <img
      v-if="hasBackgroundImage"
      :src="optimizedPostImageUrl"
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
        src="/icon-outline.svg"
        alt="Solar Network"
        style="width: 36px; height: 36px;"
      />
      <span class="text-white" style="font-size: 20px; font-weight: 600; opacity: 0.9;">
        Solar Network
      </span>
    </div>

    <!-- Content: Bottom aligned -->
    <div
      class="w-full h-full flex flex-col"
      style="position: relative; z-index: 1; padding: 60px;"
    >
      <!-- Spacer to push content down -->
      <div class="flex-1" />

      <!-- Post title -->
      <h1
        v-if="title"
        class="text-white"
        style="font-size: 48px; font-weight: 800; margin: 0 0 20px 0; line-height: 1.15; letter-spacing: -0.5px; text-shadow: 0 2px 12px rgba(0,0,0,0.5);"
      >
        {{ title }}
      </h1>

      <!-- Post description / content -->
      <p
        v-if="truncatedContent"
        class="text-white whitespace-pre-wrap"
        style="font-size: 24px; font-weight: 400; margin: 0 0 32px 0; line-height: 1.5; opacity: 0.9; text-shadow: 0 1px 8px rgba(0,0,0,0.4);"
      >
        {{ truncatedContent }}
      </p>

      <!-- Author info (only when author exists) -->
      <div v-if="hasAuthor" class="flex items-center gap-4">
        <!-- Avatar -->
        <div
          v-if="optimizedAvatarUrl"
          style="width: 56px; height: 56px; border-radius: 50%; overflow: hidden; border: 2px solid rgba(255,255,255,0.3); flex-shrink: 0;"
        >
          <img
            :src="optimizedAvatarUrl"
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
