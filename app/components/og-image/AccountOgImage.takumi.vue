<script setup lang="ts">
const {
  name = '',
  displayName = '',
  bio = '',
  avatarId = '',
  backgroundId = '',
} = defineProps<{
  name?: string
  displayName?: string
  bio?: string
  avatarId?: string
  backgroundId?: string
}>()

const initials = computed(() => {
  if (!displayName) return '?'
  return displayName.slice(0, 2).toUpperCase()
})

const truncatedBio = computed(() => {
  if (!bio) return ''
  return bio.length > 160 ? bio.slice(0, 160) + '...' : bio
})

const fullAvatarUrl = computed(() => {
  if (!avatarId) return ''
  if (avatarId.startsWith('http')) return avatarId
  return `https://api.solian.app/drive/files/${avatarId}`
})

const fullBackgroundUrl = computed(() => {
  if (!backgroundId) return ''
  if (backgroundId.startsWith('http')) return backgroundId
  return `https://api.solian.app/drive/files/${backgroundId}`
})

const hasBackground = computed(() => !!fullBackgroundUrl.value)
</script>

<template>
  <div
    class="w-full h-full"
    style="font-family: 'Nunito', 'Noto Sans SC', sans-serif; position: relative; overflow: hidden;"
  >
    <!-- Background: Image or Gradient -->
    <img
      v-if="hasBackground"
      :src="fullBackgroundUrl"
      alt=""
      style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center; filter: blur(6px); transform: scale(1.05);"
    />
    <div
      v-else
      style="position: absolute; inset: 0; background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);"
    />

    <!-- Dark overlay -->
    <div
      style="position: absolute; inset: 0;"
      :style="hasBackground
        ? 'background: linear-gradient(0deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.2) 100%);'
        : 'background: linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(30, 41, 59, 0.75) 50%, rgba(15, 23, 42, 0.85) 100%);'"
    />

    <!-- Grid pattern overlay (no bg image) -->
    <div
      v-if="!hasBackground"
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
      <!-- Account info -->
      <div class="flex items-center gap-5" style="margin-bottom: 20px;">
        <!-- Avatar -->
        <div
          v-if="fullAvatarUrl"
          style="width: 80px; height: 80px; border-radius: 50%; overflow: hidden; border: 3px solid rgba(255,255,255,0.3); flex-shrink: 0;"
        >
          <img
            :src="fullAvatarUrl"
            :alt="displayName"
            style="width: 100%; height: 100%; object-fit: cover;"
          />
        </div>
        <div
          v-else
          style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #6366f1, #8b5cf6); display: flex; align-items: center; justify-content: center; border: 3px solid rgba(255,255,255,0.2); flex-shrink: 0;"
        >
          <span class="text-white" style="font-size: 32px; font-weight: 700;">
            {{ initials }}
          </span>
        </div>

        <!-- Name and handle -->
        <div>
          <p class="text-white" style="font-size: 40px; font-weight: 800; margin: 0; line-height: 1.15; text-shadow: 0 2px 12px rgba(0,0,0,0.5);">
            {{ displayName }}
          </p>
          <p class="text-white" style="font-size: 22px; font-weight: 400; margin: 6px 0 0 0; opacity: 0.7; text-shadow: 0 1px 6px rgba(0,0,0,0.4);">
            @{{ name }}
          </p>
        </div>
      </div>

      <!-- Bio -->
      <p
        v-if="truncatedBio"
        class="text-white whitespace-pre-wrap"
        style="font-size: 22px; font-weight: 400; margin: 0; line-height: 1.5; opacity: 0.85; text-shadow: 0 1px 8px rgba(0,0,0,0.4);"
      >
        {{ truncatedBio }}
      </p>
    </div>

    <!-- Bottom accent line -->
    <div
      style="position: absolute; bottom: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #6366f1, #3b82f6, #8b5cf6);"
    />
  </div>
</template>
