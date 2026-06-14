<template>
  <div
    class="inline-flex items-center justify-center cursor-default"
    :class="[sizeClasses, inline ? '' : 'rounded-full']"
    :style="inline ? {} : { backgroundColor: badgeColor + '20' }"
  >
    <!-- Badge icon from manifest or Lucide fallback -->
    <component
      :is="lucideIcon"
      v-if="lucideIcon"
      :class="iconSizeClasses"
      :style="{ color: badgeColor, fill: badgeColor, stroke: badgeColor }"
      fill="currentColor"
    />
    <!-- SVG icon from manifest -->
    <div
      v-else-if="svgIconUrl && !svgError && svgContent"
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
    <!-- Default fallback -->
    <IconAward
      v-else
      :class="iconSizeClasses"
      :style="{ color: badgeColor }"
    />
  </div>
</template>

<script setup lang="ts">
import {
  IconAward,
  IconStar,
  IconHeart,
  IconShield,
  IconCrown,
  IconGem,
  IconSword,
  IconFlame,
  IconZap,
  IconTrophy,
  IconMedal,
  IconGift,
  IconCode,
  IconPalette,
} from '#components'
import type { SnAccountBadge } from "~/types/auth";
import type { BadgeManifestEntry } from "~/utils/badges";
import { getBadgeColor, getBadgeIconUrl } from "~/utils/badges";

const props = withDefaults(
  defineProps<{
    badge: SnAccountBadge;
    manifest?: Record<string, BadgeManifestEntry> | null;
    size?: "sm" | "md" | "lg";
    inline?: boolean;
  }>(),
  {
    manifest: null,
    size: "md",
    inline: false,
  }
);

const svgError = ref(false);
const svgContent = ref("");
const svgCache = new Map<string, string>();

const badgeColor = computed(() => getBadgeColor(props.badge, props.manifest ?? undefined));

const svgIconUrl = computed(() => getBadgeIconUrl(props.badge, props.manifest ?? undefined));

// Map badge types to Lucide icons
const kBadgeLucideIcons: Record<string, any> = {
  sponsor: IconHeart,
  supporter: IconHeart,
  verified: IconShield,
  premium: IconCrown,
  stellar: IconStar,
  nova: IconGem,
  supernova: IconZap,
  early_adopter: IconFlame,
  contributor: IconSword,
  developer: IconCode,
  creator: IconPalette,
  moderator: IconShield,
  admin: IconCrown,
  winner: IconTrophy,
  participant: IconMedal,
  gift: IconGift,
}

// Get Lucide icon for badge type
const lucideIcon = computed(() => {
  const type = props.badge.type?.toLowerCase() || ''
  return kBadgeLucideIcons[type] || null
})

// Fetch and process SVG to apply color
async function loadSvg(url: string, color: string) {
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
    if (url && color && !lucideIcon.value) {
      svgContent.value = "";
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
      return "w-4 h-4";
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
