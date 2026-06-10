<template>
  <div
    class="inline-flex items-center justify-center rounded-full cursor-default"
    :class="sizeClasses"
    :style="{ backgroundColor: badgeColor + '33' }"
  >
    <!-- SVG icon from manifest - inlined for color support -->
    <div
      v-if="svgIconUrl && !svgError && svgContent"
      class="badge-svg-container"
      :class="iconSizeClasses"
      v-html="svgContent"
    />
    <!-- Loading state -->
    <div
      v-else-if="svgIconUrl && !svgError && !svgContent"
      class="badge-svg-loading"
      :class="iconSizeClasses"
    />
    <!-- Fallback icon -->
    <IconStar
      v-else
      :class="iconSizeClasses"
      :style="{ color: badgeColor }"
    />
  </div>
</template>

<script setup lang="ts">
import type { SnAccountBadge } from "~/types/auth";
import type { BadgeManifestEntry } from "~/utils/badges";
import { getBadgeColor, getBadgeIconUrl } from "~/utils/badges";
import { IconStar } from "#components";

const props = withDefaults(
  defineProps<{
    badge: SnAccountBadge;
    manifest?: Record<string, BadgeManifestEntry> | null;
    size?: "sm" | "md" | "lg";
  }>(),
  {
    manifest: null,
    size: "md",
  }
);

const svgError = ref(false);
const svgContent = ref("");
const svgCache = new Map<string, string>();

const badgeColor = computed(() => getBadgeColor(props.badge, props.manifest ?? undefined));

const svgIconUrl = computed(() => getBadgeIconUrl(props.badge, props.manifest ?? undefined));

// Fetch and process SVG to apply color
async function loadSvg(url: string, color: string) {
  // Check cache first
  const cacheKey = `${url}:${color}`;
  if (svgCache.has(cacheKey)) {
    svgContent.value = svgCache.get(cacheKey)!;
    return;
  }

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      svgError.value = true;
      return;
    }

    let svgText = await response.text();

    // Replace currentColor with the actual badge color
    svgText = svgText.replace(/currentColor/g, color);

    // Ensure SVG has proper size attributes
    svgText = svgText.replace(
      /<svg([^>]*)>/,
      (match, attrs) => {
        if (!attrs.includes('width')) {
          return `<svg${attrs} width="100%" height="100%">`;
        }
        return match;
      }
    );

    svgContent.value = svgText;
    svgCache.set(cacheKey, svgText);
    svgError.value = false;
  } catch (err) {
    console.warn('[BadgeIcon] Failed to load badge SVG:', err);
    svgError.value = true;
  }
}

watch(
  [svgIconUrl, badgeColor],
  ([url, color]) => {
    if (url && color) {
      svgContent.value = ""; // Reset while loading
      loadSvg(url, color);
    } else {
      svgContent.value = "";
    }
  },
  { immediate: true }
);

// Reset error when badge changes
watch(
  () => props.badge.id,
  () => {
    svgError.value = false;
  }
);

const sizeClasses = computed(() => {
  switch (props.size) {
    case "sm":
      return "w-6 h-6";
    case "lg":
      return "w-12 h-12";
    default:
      return "w-8 h-8";
  }
});

const iconSizeClasses = computed(() => {
  switch (props.size) {
    case "sm":
      return "w-4 h-4";
    case "lg":
      return "w-8 h-8";
    default:
      return "w-5 h-5";
  }
});
</script>

<style scoped>
.badge-svg-container {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 0;
}

.badge-svg-container :deep(svg) {
  width: 100%;
  height: 100%;
}

.badge-svg-loading {
  background: linear-gradient(90deg, transparent 25%, rgba(255,255,255,0.3) 50%, transparent 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 50%;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
