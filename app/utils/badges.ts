import type { SnAccountBadge } from "~/types/auth";

export interface BadgeManifestEntry {
  identifier: string;
  achievementIdentifier?: string;
  label?: string;
  caption?: string;
  icon?: string;
  color?: string;
  iconUrl?: string | null;
  localizationKey?: string;
  category?: string;
  series?: {
    identifier: string;
    title: string;
    order: number;
  } | null;
  hidden?: boolean;
}

export interface BadgeManifestResponse {
  version: number;
  badges: BadgeManifestEntry[];
}

/**
 * @deprecated Use `useBadgeManifestStore` from `~/stores/badges` instead.
 */
export async function getBadgeManifestMap(): Promise<Record<string, BadgeManifestEntry>> {
  const store = useBadgeManifestStore();
  await store.fetchManifest();
  return store.manifest;
}

export function getBadgeColor(
  badge: SnAccountBadge,
  manifest?: Record<string, BadgeManifestEntry>
): string {
  // Special handling for sponsor badges with level-based gradient
  if (badge.type === "sponsor") {
    const level = parseInt(
      ((badge.meta?.level as string) || "0").replace(/"/g, ""),
      10
    );
    const clampedLevel = Math.max(0, Math.min(36, level));
    const t = clampedLevel / 36.0;
    // Interpolate from red to golden
    const r = Math.round(239 + (218 - 239) * t);
    const g = Math.round(68 + (165 - 68) * t);
    const b = Math.round(68 + (32 - 68) * t);
    return `rgb(${r}, ${g}, ${b})`;
  }

  // Try manifest color
  if (manifest) {
    const entry = manifest[badge.type];
    if (entry?.color) {
      const hex = entry.color.replace("#", "");
      if (hex.length === 6) return `#${hex}`;
      if (hex.length === 8) return `#${hex}`;
    }
  }

  return "#3b82f6";
}

export function getBadgeName(
  badge: SnAccountBadge,
  manifest?: Record<string, BadgeManifestEntry>
): string {
  // Try manifest label
  if (manifest) {
    const entry = manifest[badge.type];
    if (entry?.label) return entry.label;
  }

  // Fallback to badge label or type
  return badge.label || badge.type || "Unknown";
}

export function getBadgeDescription(
  badge: SnAccountBadge,
  manifest?: Record<string, BadgeManifestEntry>
): string | null {
  const primary = manifest?.[badge.type]?.caption;
  const badgeCaption = badge.caption;

  const desc = primary && primary.length > 0 ? primary : null;

  if (badgeCaption && badgeCaption.length > 0 && badgeCaption !== desc) {
    return desc ? `${desc}\n${badgeCaption}` : badgeCaption;
  }

  return desc;
}

export function getBadgeIconUrl(
  badge: SnAccountBadge,
  manifest?: Record<string, BadgeManifestEntry>
): string | null {
  if (!manifest) return null;
  const entry = manifest[badge.type];
  if (!entry?.iconUrl) return null;

  // Resolve relative URLs
  if (entry.iconUrl.startsWith("http")) return entry.iconUrl;
  const config = useRuntimeConfig();
  return `${config.public.apiBaseUrl}${entry.iconUrl}`;
}

export function getBadgeIconName(
  badge: SnAccountBadge,
  manifest?: Record<string, BadgeManifestEntry>
): string | null {
  if (!manifest) return null;
  const entry = manifest[badge.type];
  return entry?.icon || null;
}
