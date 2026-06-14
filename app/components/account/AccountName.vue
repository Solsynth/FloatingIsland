<template>
  <span class="inline-flex items-center gap-1 align-middle">
    <!-- Account name with optional color -->
    <span
      class="truncate leading-none"
      :style="nameStyle"
      :class="[nameClasses, fontWeightClass]"
    >
      {{ displayName }}
    </span>

    <!-- Membership tier mark -->
    <IconStar
      v-if="showMembershipMark"
      :title="membershipTooltip"
      class="h-3.5 w-3.5 shrink-0"
      :style="{ color: membershipColor, fill: membershipColor, stroke: membershipColor }"
      fill="currentColor"
    />

    <!-- Verification mark -->
    <component
      :is="verificationIcon"
      v-if="showVerificationMark"
      :title="verificationTooltip"
      class="h-3.5 w-3.5 shrink-0"
      :style="{ color: verificationColor, fill: verificationColor, stroke: verificationColor }"
      fill="currentColor"
    />

    <!-- Active badge mark -->
    <BadgeIcon
      v-if="showBadgeMark"
      :title="badgeTooltip"
      :badge="activeBadge!"
      :manifest="badgeManifestStore.manifest"
      size="sm"
      inline
      class="shrink-0"
    />

    <!-- Bot/automated indicator -->
    <IconBot
      v-if="isBot"
      :title="t('account.automated')"
      class="h-3.5 w-3.5 shrink-0 text-base-content/50"
    />

    <!-- Suffix widgets slot -->
    <slot name="suffix" />
  </span>
</template>

<script setup lang="ts">
import {
  IconStar,
  IconBot,
  IconBuilding2,
  IconPalette,
  IconCode,
  IconClapperboard,
  IconCircleCheck,
  IconBadgeCheck,
  IconUserCheck,
} from '#components'
import type { SnAccount, SnAccountBadge } from '~/types/auth'
import { getBadgeName } from '~/utils/badges'

const props = withDefaults(defineProps<{
  account: SnAccount
  textOverride?: string
  ignorePermissions?: boolean
  hideVerificationMark?: boolean
  hideOverlay?: boolean
  size?: 'sm' | 'md' | 'lg'
  bold?: boolean
}>(), {
  ignorePermissions: false,
  hideVerificationMark: false,
  hideOverlay: false,
  size: 'md',
  bold: true,
})

const { t } = useI18n()
const badgeManifestStore = useBadgeManifestStore()

// Load badge manifest if not loaded
onMounted(() => {
  if (!badgeManifestStore.isLoaded) {
    badgeManifestStore.fetchManifest()
  }
})

// Username plain colors map
const kUsernamePlainColors: Record<string, string> = {
  red: '#ef4444',
  blue: '#3b82f6',
  green: '#22c55e',
  yellow: '#eab308',
  purple: '#a855f7',
  orange: '#f97316',
  pink: '#ec4899',
  cyan: '#06b6d4',
  lime: '#84cc16',
  indigo: '#6366f1',
  teal: '#14b8a6',
  amber: '#f59e0b',
  brown: '#a16207',
  grey: '#6b7280',
  black: '#000000',
  white: '#ffffff',
}

// Verification mark icons and colors
const kVerificationIcons = [
  IconCircleCheck,   // 0: Generic
  IconUserCheck,     // 1: Personal
  IconBadgeCheck,    // 2: Verified
  IconBuilding2,     // 3: Organization
  IconPalette,       // 4: Creator
  IconCode,          // 5: Developer
  IconClapperboard,  // 6: Entertainment
]

const kVerificationColors = [
  '#14b8a6', // teal
  '#38bdf8', // light blue
  '#6366f1', // indigo
  '#ef4444', // red
  '#f97316', // orange
  '#3b82f6', // blue
  '#818cf8', // blue accent
]

// Membership tier colors
const kMembershipColors: Record<string, string> = {
  'solian.stellar.primary': '#60a5fa',    // blue accent
  'solian.stellar.nova': '#39c5bb',       // teal
  'solian.stellar.supernova': '#fcd34d',  // amber accent
}

// Display name
const displayName = computed(() => {
  return props.textOverride || props.account.nick || props.account.name
})

// Check if bot
const isBot = computed(() => {
  return !!props.account.automatedId
})

// Username color logic
const usernameColor = computed(() => {
  const profile = props.account.profile
  if (!profile) return null

  // Check for custom username color from profile
  const customColor = (profile as any).usernameColor
  if (customColor) {
    return customColor
  }

  // Default membership colors
  const subscription = (props.account as any).perkSubscription
  if (subscription?.isActive) {
    return kMembershipColors[subscription.identifier] || null
  }

  return null
})

// Name style
const nameStyle = computed(() => {
  const colorData = usernameColor.value
  if (!colorData) return {}

  // Plain color
  if (colorData.type === 'plain' && colorData.value) {
    const hex = kUsernamePlainColors[colorData.value] || colorData.value
    return { color: hex.startsWith('#') ? hex : `#${hex}` }
  }

  // Gradient
  if (colorData.type === 'gradient' && colorData.colors?.length > 0) {
    const colors = colorData.colors.map((c: string) => {
      return kUsernamePlainColors[c] || (c.startsWith('#') ? c : `#${c}`)
    })
    const direction = colorData.direction || 'to right'
    return {
      background: `linear-gradient(${direction}, ${colors.join(', ')})`,
      '-webkit-background-clip': 'text',
      '-webkit-text-fill-color': 'transparent',
      'background-clip': 'text',
    }
  }

  return {}
})

// Name classes
const nameClasses = computed(() => {
  const classes = []
  if (props.size === 'sm') classes.push('text-xs')
  else if (props.size === 'lg') classes.push('text-base')
  else classes.push('text-sm')
  return classes
})

// Font weight class
const fontWeightClass = computed(() => {
  return props.bold ? 'font-semibold' : 'font-medium'
})

// Membership mark
const membership = computed(() => (props.account as any).perkSubscription)
const showMembershipMark = computed(() => {
  return membership.value?.isActive
})

const membershipColor = computed(() => {
  if (!membership.value) return '#6b7280'
  return kMembershipColors[membership.value.identifier] || '#6b7280'
})

const membershipTooltip = computed(() => {
  if (!membership.value) return ''
  const tierNames: Record<string, string> = {
    'solian.stellar.primary': 'Stellar',
    'solian.stellar.nova': 'Nova',
    'solian.stellar.supernova': 'Supernova',
  }
  const tierName = tierNames[membership.value.identifier] || 'Unknown'
  return `${t('account.membership')} · ${tierName}`
})

// Verification mark
const verification = computed(() => props.account.profile?.verification)
const showVerificationMark = computed(() => {
  return !props.hideVerificationMark && verification.value
})

const verificationIcon = computed(() => {
  if (!verification.value) return IconBadgeCheck
  const type = verification.value.type ?? 0
  return kVerificationIcons[type] || IconBadgeCheck
})

const verificationColor = computed(() => {
  if (!verification.value) return '#3b82f6'
  const type = verification.value.type ?? 0
  return kVerificationColors[type] || '#3b82f6'
})

const verificationTooltip = computed(() => {
  if (!verification.value) return ''
  const title = verification.value.title || 'Verified'
  const desc = verification.value.description || ''
  return desc ? `${title}\n${desc}` : title
})

// Badge mark - uses activeBadge from profile
const activeBadge = computed<SnAccountBadge | null>(() => {
  return (props.account.profile as any)?.activeBadge || null
})

const showBadgeMark = computed(() => !!activeBadge.value)

const badgeTooltip = computed(() => {
  if (!activeBadge.value) return ''
  const name = getBadgeName(activeBadge.value, badgeManifestStore.manifest)
  const desc = activeBadge.value.caption || ''
  return desc ? `${name}\n${desc}` : name
})
</script>
