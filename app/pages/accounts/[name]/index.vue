<template>
  <NuxtLayout name="app">
    <ConfuseSpinner
      v-if="accountStatus === 'pending'"
      message="Loading account..."
    />

    <!-- Not Found State -->
    <div v-else-if="notFound" class="mx-auto max-w-2xl p-6">
      <div class="card">
        <div class="card-body items-center text-center">
          <IconUserX class="text-base-content/50 w-10 h-10" />
          <h1 class="text-xl font-bold">Account not found</h1>
          <p class="text-base-content/60">
            The profile you requested does not exist.
          </p>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="mx-auto max-w-2xl p-6">
      <div class="alert alert-error">
        <span>{{ error }}</span>
      </div>
    </div>

    <!-- Account Profile -->
    <div v-else-if="account" class="mx-auto max-w-5xl min-w-0">
      <!-- Header Section -->
      <section class="relative overflow-hidden px-4 pt-4 lg:px-6">
        <div
          class="h-40 w-full bg-base-200 sm:h-52 rounded-2xl overflow-hidden"
        >
          <img
            v-if="backgroundUrl"
            :src="backgroundUrl"
            :alt="`${displayName} background`"
            class="h-full w-full object-cover"
          />
        </div>
        <div
          class="mx-auto -mt-20 flex max-w-5xl flex-col gap-4 px-4 pb-4 sm:-mt-20 sm:flex-row sm:items-end"
        >
          <div class="shrink-0">
            <div v-if="avatarUrl" class="avatar">
              <div
                class="h-24 w-24 rounded-full ring ring-base-300 ring-offset-2 ring-offset-base-100 sm:h-28 sm:w-28 mb-8"
              >
                <img :src="avatarUrl" :alt="displayName" />
              </div>
            </div>
            <div v-else class="avatar avatar-placeholder">
              <div
                class="h-24 w-24 rounded-3xl bg-primary text-primary-content ring ring-base-300 ring-offset-2 ring-offset-base-100 sm:h-28 sm:w-28"
              >
                <span class="text-2xl font-semibold">
                  {{ getInitials(displayName) }}
                </span>
              </div>
            </div>
          </div>
          <div class="min-w-0 flex-1 pt-24">
            <div class="flex flex-wrap items-center gap-2 min-w-0">
              <h1 class="truncate text-2xl font-black sm:text-3xl">
                {{ displayName }}
              </h1>
              <span
                v-if="account.profile?.verification"
                class="badge gap-1 badge-primary"
              >
                <IconShieldCheck class="w-3 h-3" />
                {{ account.profile.verification.title || "Verified" }}
              </span>
            </div>
            <p class="truncate text-sm text-base-content/60">
              @{{ account.name }}
            </p>
            <ActivityPresence :account="account" class="mt-2" />
          </div>

          <!-- Actions -->
          <div class="flex flex-wrap items-center gap-2">
            <!-- Friend/Block/Message buttons for other users -->
            <template v-if="isAuthenticated && !isCurrentUser">
              <button
                v-if="relationship?.isFriend"
                class="btn btn-primary gap-2"
                disabled
              >
                <IconUserCheck class="w-4 h-4" />
                Friends
              </button>
              <button
                v-else
                class="btn btn-primary gap-2"
                :disabled="isActionLoading"
                @click="addFriend"
              >
                <IconLoader
                  v-if="isActionLoading"
                  class="w-4 h-4 animate-spin"
                />
                <IconUserPlus v-else class="w-4 h-4" />
                Add Friend
              </button>
              <button
                v-if="relationship?.isBlocked"
                class="btn btn-outline gap-2"
                :disabled="isActionLoading"
                @click="unblock"
              >
                <IconUserX class="w-4 h-4" />
                Unblock
              </button>
              <button
                v-else
                class="btn btn-ghost gap-2 text-error"
                :disabled="isActionLoading"
                @click="block"
              >
                <IconBan class="w-4 h-4" />
                Block
              </button>
              <button
                class="btn btn-primary gap-2"
                :disabled="isActionLoading"
                @click="sendMessage"
              >
                <IconMessageCircle class="w-4 h-4" />
                Message
              </button>
            </template>

            <!-- For own profile - link to settings -->
            <template v-if="isCurrentUser">
              <NuxtLink
                to="/accounts/me/settings"
                class="btn btn-primary gap-2"
              >
                <IconSettings class="w-4 h-4" />
                Edit Profile
              </NuxtLink>
            </template>

            <button class="btn btn-outline btn-square" @click="shareProfile">
              <IconShare2 class="w-4 h-4" />
            </button>

            <!-- Report button for other users -->
            <button
              v-if="isAuthenticated && !isCurrentUser"
              class="btn btn-error btn-outline btn-square"
              @click="reportUser"
            >
              <IconFlag class="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      <!-- Content Grid -->
      <div class="grid gap-4 px-4 py-4 lg:px-6 lg:grid-cols-3 min-w-0">
        <!-- Left Column - Main Content -->
        <div class="space-y-4 lg:col-span-2 min-w-0">
          <!-- Bio Section (Collapsible) -->
          <div v-if="bioHtml" class="card">
            <div class="card-body p-4">
              <div class="flex items-center justify-between mb-2">
                <h2 class="text-sm font-semibold text-base-content/70">
                  Bio
                </h2>
                <button
                  class="btn btn-ghost btn-xs text-primary"
                  @click="isBioExpanded = !isBioExpanded"
                >
                  {{ isBioExpanded ? "Collapse" : "Expand" }}
                </button>
              </div>
              <template v-if="isBioExpanded">
                <!-- eslint-disable vue/no-v-html -->
                <div
                  class="prose prose-sm max-w-none break-words prose-headings:mb-2 prose-headings:mt-4 prose-p:my-1.5 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-a:break-all prose-code:text-primary prose-code:bg-base-200 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-base-200 prose-pre:text-sm prose-pre:overflow-x-auto prose-blockquote:border-l-4 prose-blockquote:border-primary/30 prose-blockquote:pl-4 prose-blockquote:italic prose-ul:my-1.5 prose-ol:my-1.5"
                  v-html="bioHtml"
                  @click="handleMarkdownClick"
                />
                <!-- eslint-enable vue/no-v-html -->
              </template>
              <p v-else class="text-sm text-base-content/80">
                {{ bioFirstLine }}
              </p>
            </div>
          </div>

          <!-- Bot Developer Info -->
          <div
            v-if="botDeveloper?.publisher"
            class="card bg-secondary/5"
          >
            <div class="card-body p-4">
              <div class="flex items-center gap-2">
                <IconBot class="w-4 h-4 text-secondary" />
                <span class="text-sm">
                  Automated by
                  <NuxtLink
                    :to="`/publishers/${botDeveloper.publisher.name}`"
                    class="font-semibold link link-hover"
                  >
                    {{ botDeveloper.publisher.nick || botDeveloper.publisher.name }}
                  </NuxtLink>
                </span>
              </div>
            </div>
          </div>

          <!-- Activity Timeline Section -->
          <section class="space-y-3">
            <div
              v-if="isLoadingTimeline"
              class="flex items-center gap-2 text-sm text-base-content/60"
            >
              <IconLoader class="w-3.5 h-3.5 animate-spin" />
              <span>Loading activity...</span>
            </div>

            <!-- Timeline Items -->
            <div
              v-if="timelineItems.length > 0"
              class="space-y-2"
              :class="isLoadingTimeline ? 'opacity-60' : 'opacity-100'"
            >
              <AccountTimelineItem
                v-for="item in groupedTimelineItems"
                :key="item.id"
                :item="item.item"
                :duplicate-count="item.count"
              />
            </div>

            <!-- Load More -->
            <div v-if="timelineItems.length > 0" class="py-2 text-center">
              <button
                v-if="hasMoreTimeline"
                class="btn btn-outline btn-sm"
                :disabled="isLoadingTimeline"
                @click="loadMoreTimeline"
              >
                <IconLoader
                  v-if="isLoadingTimeline"
                  class="w-4 h-4 animate-spin"
                />
                <span>Load more</span>
              </button>
              <p v-else class="text-xs text-base-content/50">No more activity</p>
            </div>

            <!-- Empty State -->
            <div
              v-else-if="!isLoadingTimeline"
              class="py-8 text-center text-sm text-base-content/50"
            >
              No activity yet.
            </div>
          </section>
        </div>

        <!-- Right Column - Sidebar -->
        <div class="space-y-4">
          <!-- Fortune Trend -->
          <FortuneTrendCard :username="accountName" />

          <!-- Leveling Progress -->
          <LevelingProgress
            v-if="account.profile?.level"
            :level="account.profile.level"
            :experience="account.profile.experience || 0"
            :progress="account.profile.levelingProgress || 0"
          />

          <!-- Verification Info -->
          <div v-if="account.profile?.verification" class="card bg-primary/5">
            <div class="card-body p-4">
              <div class="flex items-center gap-2 mb-2">
                <IconShieldCheck class="w-5 h-5 text-primary" />
                <h3 class="font-semibold">
                  {{ account.profile.verification.title }}
                </h3>
              </div>
              <p
                v-if="account.profile.verification.description"
                class="text-sm text-base-content/70"
              >
                {{ account.profile.verification.description }}
              </p>
              <p
                v-if="account.profile.verification.verifiedBy"
                class="text-xs text-base-content/50 mt-2"
              >
                Verified by
                {{ account.profile.verification.verifiedBy }}
              </p>
            </div>
          </div>

          <!-- About -->
          <div class="card">
            <div class="card-body p-4">
              <h3 class="text-sm font-semibold text-base-content/70 mb-3">
                About
              </h3>
              <div class="space-y-2">
                <div class="flex items-center gap-2 text-sm">
                  <IconCalendar class="text-base-content/50 w-4 h-4" />
                  <span>Joined {{ formatDate(account.createdAt) }}</span>
                </div>
                <div
                  v-if="account.profile?.birthday"
                  class="flex items-center gap-2 text-sm"
                >
                  <IconCake class="text-base-content/50 w-4 h-4" />
                  <span
                    >{{ formatDate(account.profile.birthday) }}
                    ·
                    {{ getAge(account.profile.birthday) }}
                    years old</span
                  >
                </div>
                <div
                  v-if="fullName"
                  class="flex items-center gap-2 text-sm"
                >
                  <IconUser class="text-base-content/50 w-4 h-4" />
                  <span>{{ fullName }}</span>
                </div>
                <div
                  v-if="account.profile?.gender || account.profile?.pronouns"
                  class="flex items-center gap-2 text-sm"
                >
                  <IconUser class="text-base-content/50 w-4 h-4" />
                  <span>{{ account.profile?.gender || "Unspecified" }} · {{ account.profile?.pronouns || "Unspecified" }}</span>
                </div>
                <div
                  v-if="account.profile?.location"
                  class="flex items-center gap-2 text-sm"
                >
                  <IconMapPin class="text-base-content/50 w-4 h-4" />
                  <span>{{ account.profile.location }}</span>
                </div>
                <div
                  v-if="account.profile?.socialCredits !== undefined"
                  class="flex items-center gap-2 text-sm"
                  :title="`Social credits: ${account.profile.socialCredits.toFixed(2)} pts`"
                >
                  <IconStar class="text-base-content/50 w-4 h-4" />
                  <span>{{ account.profile.socialCredits.toFixed(2) }} pts · {{ getCreditsLevelText(account.profile.socialCreditsLevel) }}</span>
                </div>
                <div
                  class="flex items-center gap-2 text-sm cursor-pointer hover:text-primary"
                  @click="copyAccountId"
                >
                  <IconFingerprint class="text-base-content/50 w-4 h-4" />
                  <span class="truncate">{{ account.id }}</span>
                </div>
              </div>
              <!-- Timezone Info -->
              <div
                v-if="account.profile?.timeZone"
                class="mt-4 p-3 rounded-lg bg-base-200/50"
              >
                <div class="flex items-center gap-2">
                  <IconClock class="w-4 h-4 text-base-content/50" />
                  <div class="flex-1">
                    <p class="text-xs text-base-content/50">Timezone</p>
                    <div class="flex items-center gap-2">
                      <span class="text-sm font-medium">{{ account.profile.timeZone }}</span>
                      <span
                        v-if="currentTimeInTz"
                        class="badge badge-sm badge-primary"
                      >
                        {{ currentTimeInTz }}
                      </span>
                      <span class="text-xs text-base-content/50">
                        UTC{{ tzOffset }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Public Contacts -->
          <div
            v-if="publicContacts.length > 0"
            class="card"
          >
            <div class="card-body p-4">
              <h3 class="text-sm font-semibold text-base-content/70 mb-3">
                Contact Methods
              </h3>
              <div class="space-y-2">
                <a
                  v-for="contact in publicContacts"
                  :key="contact.id"
                  :href="getContactLink(contact)"
                  class="flex items-center gap-3 p-3 rounded-lg bg-base-200/50 hover:bg-base-200 transition-colors"
                  @click="handleContactClick($event, contact)"
                >
                  <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <IconMail v-if="contact.type === 0" class="w-4 h-4 text-primary" />
                    <IconSmartphone v-else-if="contact.type === 1" class="w-4 h-4 text-primary" />
                    <IconHome v-else class="w-4 h-4 text-primary" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-xs text-base-content/50">
                      {{ contact.type === 0 ? "Email" : contact.type === 1 ? "Phone" : "Address" }}
                    </p>
                    <p class="text-sm font-medium truncate">{{ contact.content }}</p>
                  </div>
                  <IconChevronRight class="w-4 h-4 text-base-content/30" />
                </a>
              </div>
            </div>
          </div>

          <!-- Punishment/Restrictions -->
          <div
            v-if="punishment"
            class="card bg-error/5 shadow-sm"
          >
            <div class="card-body p-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-error/10 flex items-center justify-center">
                  <IconAlertTriangle class="w-5 h-5 text-error" />
                </div>
                <div class="flex-1">
                  <h3 class="text-sm font-semibold">Account Restrictions</h3>
                  <p class="text-xs text-base-content/50">Tap to view details</p>
                </div>
                <IconChevronRight class="w-4 h-4 text-base-content/30" />
              </div>
            </div>
          </div>

          <!-- Links -->
          <div v-if="account.profile?.links?.length" class="card">
            <div class="card-body p-4">
              <h3 class="text-sm font-semibold text-base-content/70 mb-3">
                Links
              </h3>
              <div class="space-y-2">
                <a
                  v-for="link in account.profile.links"
                  :key="link.name"
                  :href="
                    link.url.startsWith('http')
                      ? link.url
                      : `https://${link.url}`
                  "
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-center gap-3 p-3 rounded-lg bg-base-200/50 hover:bg-base-200 transition-colors"
                >
                  <IconLink class="text-primary w-4 h-4" />
                  <span class="flex-1 text-sm font-medium capitalize">{{ link.name || link.label }}</span>
                  <IconExternalLink class="text-base-content/30 w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          <!-- Badges -->
          <div v-if="account.badges?.length" class="card">
            <div class="card-body p-4">
              <h3 class="text-sm font-semibold text-base-content/70 mb-3">
                Badges
              </h3>
              <div class="flex flex-wrap gap-2">
                <div
                  v-for="badge in account.badges"
                  :key="badge.id"
                  class="badge badge-lg"
                  :title="badge.caption"
                >
                  {{ badge.label || badge.type }}
                </div>
              </div>
            </div>
          </div>

          <!-- Publishers -->
          <div v-if="publishers.length > 0" class="card">
            <div class="card-body p-4">
              <h3 class="text-sm font-semibold text-base-content/70 mb-3">
                Publishers
              </h3>
              <div class="space-y-2">
                <NuxtLink
                  v-for="pub in publishers"
                  :key="pub.id"
                  :to="`/${pub.name}`"
                  class="flex items-center gap-3 p-2 rounded-xl hover:bg-base-200 transition-colors"
                >
                  <div class="avatar">
                    <div class="w-10 h-10 rounded-xl">
                      <img
                        v-if="pub.picture?.id"
                        :src="getFileUrl(pub.picture.id) ?? undefined"
                        :alt="pub.nick ?? undefined"
                      />
                      <div
                        v-else
                        class="bg-primary text-primary-content flex items-center justify-center text-sm font-bold w-full h-full"
                      >
                        {{ pub.nick?.[0] || "?" }}
                      </div>
                    </div>
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="font-medium text-sm truncate">
                      {{ pub.nick }}
                    </p>
                    <p class="text-xs text-base-content/50 truncate">
                      @{{ pub.name }}
                    </p>
                  </div>
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { SnAccount, SnContactMethod, SnAccountPunishment, SnAccountTimelineItem } from "~/types/auth";
import type { Publisher } from "~/types/post";
import {
  IconUserCheck,
  IconUserPlus,
  IconUserX,
  IconBan,
  IconMessageCircle,
  IconShare2,
  IconSettings,
  IconLoader,
  IconShieldCheck,
  IconCalendar,
  IconCake,
  IconMapPin,
  IconClock,
  IconLink,
  IconBot,
  IconUser,
  IconStar,
  IconFingerprint,
  IconMail,
  IconSmartphone,
  IconHome,
  IconChevronRight,
  IconExternalLink,
  IconAlertTriangle,
  IconFlag,
} from "#components";
import {
  fetchAccount,
  fetchAccountActivityTimeline,
  fetchAccountRelationship,
  addAccountAsFriend,
  blockAccount,
  unblockAccount,
  fetchAccountPunishment,
  fetchAccountBotDeveloper,
} from "~/utils/api";
import { getFileUrl } from "~/utils/files";
import { renderMarkdown } from "~/utils/markdown";

const route = useRoute();
const auth = useAuth();
const accountName = computed(() => route.params.name as string);

const account = ref<SnAccount | null>(null);
const publishers = ref<Publisher[]>([]);
const timelineItems = ref<SnAccountTimelineItem[]>([]);
const relationship = ref<{
  status: number;
  isFriend: boolean;
  isBlocked: boolean;
} | null>(null);
const notFound = ref(false);
const error = ref<string | null>(null);
const isLoadingTimeline = ref(false);
const isActionLoading = ref(false);
const timelineOffset = ref(0);
const hasMoreTimeline = ref(false);
const isBioExpanded = ref(false);
const botDeveloper = ref<{ publisher?: { name: string; nick?: string } } | null>(null);
const punishment = ref<SnAccountPunishment | null>(null);

const accountStatus = computed(() =>
  account.value ? "success" : error.value ? "error" : "pending",
);
const isAuthenticated = computed(() => auth.isAuthenticated.value);
const isCurrentUser = computed(() => {
  if (!auth.user.value || !account.value) return false;
  return auth.user.value.id === account.value.id;
});
const displayName = computed(
  () => account.value?.nick || account.value?.name || "Unknown",
);
const avatarUrl = computed(() =>
  getFileUrl(account.value?.profile?.picture?.id),
);
const backgroundUrl = computed(() =>
  getFileUrl(account.value?.profile?.background?.id),
);
const bioHtml = computed(() => {
  if (!account.value?.profile?.bio) return "";
  return renderMarkdown(account.value.profile.bio);
});

const bioFirstLine = computed(() => {
  if (!account.value?.profile?.bio) return "No bio yet.";
  const lines = account.value.profile.bio.split("\n");
  return lines[0]?.trim() || "No bio yet.";
});

const fullName = computed(() => {
  const profile = account.value?.profile;
  if (!profile) return "";
  const parts = [profile.firstName, profile.middleName, profile.lastName].filter(
    (p) => p && p.length > 0,
  );
  return parts.length > 0 ? parts.join(" ") : "";
});

const publicContacts = computed(() => {
  return account.value?.contacts?.filter((c) => c.isPublic) || [];
});

const currentTimeInTz = ref<string>("");
const tzOffset = ref<string>("");

// Fetch account data with useAsyncData for SSR
const {
  data: accountData,
  status: fetchStatus,
  error: fetchError,
} = await useAsyncData(
  `account-${accountName.value}`,
  () => fetchAccount(accountName.value),
  { watch: [accountName] }
);

// Watch and update refs
watch(accountData, (data) => {
  if (data) {
    account.value = data;
    notFound.value = false;
    error.value = null;
    publishers.value = data.publishers || [];
  }
}, { immediate: true });

watch(fetchError, (err) => {
  if (err) {
    if (err.message?.includes('404')) {
      notFound.value = true;
    } else {
      error.value = err.message || 'Failed to load account';
    }
  }
}, { immediate: true });

const seoTitle = computed(() => account.value ? `${displayName.value} (@${account.value.name})` : '');
const seoDescription = computed(() => account.value?.profile?.bio || `View profile for @${account.value?.name}`);
const seoImage = computed(() => getFileUrl(account.value?.profile?.picture?.id) || undefined);
const seoUrl = computed(() => `https://solian.app/@${account.value?.name}`);

// OG Image (root level with computed values)
defineOgImage('AccountOgImage', {
	name: () => account.value?.name || '',
	displayName: () => displayName.value,
	bio: () => account.value?.profile?.bio || '',
	avatarId: () => account.value?.profile?.picture?.id || '',
	backgroundId: () => account.value?.profile?.background?.id || ''
})

useSolarSeo({
	title: () => seoTitle.value,
	description: () => seoDescription.value,
	image: () => seoImage.value,
	url: () => seoUrl.value,
	type: 'profile',
	breadcrumbs: () => [
		{ name: 'Home', item: 'https://solian.app' },
		{ name: seoTitle.value, item: seoUrl.value }
	]
});

function updateTimezone() {
  const tz = account.value?.profile?.timeZone;
  if (!tz) {
    currentTimeInTz.value = "";
    tzOffset.value = "";
    return;
  }
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    currentTimeInTz.value = formatter.format(now);

    const tzFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      timeZoneName: "shortOffset",
    });
    const parts = tzFormatter.formatToParts(now);
    const tzPart = parts.find((p) => p.type === "timeZoneName");
    tzOffset.value = tzPart?.value?.replace("GMT", "") || "";
  } catch {
    currentTimeInTz.value = "";
    tzOffset.value = "";
  }
}

function getInitials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .map((p) => p[0]?.toUpperCase())
      .slice(0, 2)
      .join("") || "?"
  );
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "Unknown";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getAge(birthday: string): number {
  const birth = new Date(birthday);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  if (
    today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())
  )
    age--;
  return age;
}

function getCreditsLevelText(level?: number): string {
  switch (level) {
    case -1:
      return "Poor";
    case 0:
      return "Normal";
    case 1:
      return "Good";
    case 2:
      return "Excellent";
    default:
      return "Unknown";
  }
}

function getContactLink(contact: SnContactMethod): string {
  if (contact.type === 0) return `mailto:${contact.content}`;
  if (contact.type === 1) return `tel:${contact.content}`;
  return "#";
}

function handleContactClick(e: MouseEvent, contact: SnContactMethod) {
  if (contact.type >= 2) {
    e.preventDefault();
    navigator.clipboard.writeText(contact.content);
    alert("Address copied to clipboard");
  }
}

async function copyAccountId() {
  if (!account.value?.id) return;
  await navigator.clipboard.writeText(account.value.id);
  alert("Account ID copied to clipboard");
}

async function reportUser() {
  if (!account.value?.id) return;
  // TODO: Implement abuse report sheet
  alert("Report feature coming soon!");
}

function handleMarkdownClick(e: MouseEvent) {
  const target = e.target as HTMLElement;

  // Handle mention chip clicks
  if (target.closest(".mention-chip")) {
    e.preventDefault();
    const href = target.closest("a")?.getAttribute("href");
    if (href) {
      navigateTo(href);
    }
    return;
  }

  // Handle spoiler toggles
  if (target.classList.contains("spoiler")) {
    target.classList.toggle("revealed");
  }
}

// Group timeline items by type for display
const groupedTimelineItems = computed(() => {
  const items = timelineItems.value;
  if (items.length === 0) return [];

  const grouped: { id: string; item: SnAccountTimelineItem; count: number }[] = [];
  let currentGroup: { item: SnAccountTimelineItem; count: number } | null = null;

  for (const item of items) {
    if (!currentGroup || !canGroupItems(currentGroup.item, item)) {
      currentGroup = { item, count: 1 };
      grouped.push({ id: item.id, item, count: 1 });
    } else {
      currentGroup.count++;
      // Update the last entry's count
      const lastEntry = grouped[grouped.length - 1];
      if (lastEntry) {
        lastEntry.count = currentGroup.count;
      }
    }
  }

  return grouped;
});

function canGroupItems(a: SnAccountTimelineItem, b: SnAccountTimelineItem): boolean {
  if (a.eventType !== b.eventType) return false;
  if (a.eventType === 0) return false; // Don't group status updates
  if (a.eventType === 1 && a.activity && b.activity) {
    // Don't group Spotify activities
    if (a.activity.manualId === "spotify" || b.activity.manualId === "spotify") return false;
    // Don't group different activity types
    if (a.activity.manualId !== b.activity.manualId || a.activity.type !== b.activity.type) return false;
    // For Steam, group by game_id
    if (a.activity.manualId === "steam" && a.activity.meta && b.activity.meta) {
      return a.activity.meta.game_id === b.activity.meta.game_id;
    }
    return a.activity.title === b.activity.title;
  }
  return false;
}

async function loadTimeline() {
  if (!accountName.value) return;
  isLoadingTimeline.value = true;
  try {
    const result = await fetchAccountActivityTimeline(
      accountName.value,
      20,
      timelineOffset.value,
    );
    if (timelineOffset.value === 0) {
      timelineItems.value = result.items;
    } else {
      timelineItems.value.push(...result.items);
    }
    timelineOffset.value += result.items.length;
    hasMoreTimeline.value = timelineItems.value.length < result.total;
  } catch (err) {
    console.error("Failed to load timeline:", err);
  } finally {
    isLoadingTimeline.value = false;
  }
}

async function loadMoreTimeline() {
  await loadTimeline();
}

async function loadRelationship() {
  if (!account.value?.id || isCurrentUser.value) return;
  try {
    const rel = await fetchAccountRelationship(account.value.id);
    relationship.value = rel;
  } catch {
    relationship.value = null;
  }
}

async function loadBotDeveloper() {
  if (!account.value?.automatedId) {
    botDeveloper.value = null;
    return;
  }
  try {
    const dev = await fetchAccountBotDeveloper(account.value.automatedId);
    botDeveloper.value = dev;
  } catch {
    botDeveloper.value = null;
  }
}

async function loadPunishment() {
  if (!accountName.value) return;
  try {
    const result = await fetchAccountPunishment(accountName.value);
    punishment.value = result;
  } catch {
    punishment.value = null;
  }
}

async function addFriend() {
  if (!account.value?.id) return;
  isActionLoading.value = true;
  try {
    await addAccountAsFriend(account.value.id);
    await loadRelationship();
  } catch (err) {
    alert(err instanceof Error ? err.message : "Failed to add friend");
  } finally {
    isActionLoading.value = false;
  }
}

async function block() {
  if (!account.value?.id) return;
  const confirmed = confirm("Block this user?");
  if (!confirmed) return;
  isActionLoading.value = true;
  try {
    await blockAccount(account.value.id);
    await loadRelationship();
  } catch (err) {
    alert(err instanceof Error ? err.message : "Failed to block");
  } finally {
    isActionLoading.value = false;
  }
}

async function unblock() {
  if (!account.value?.id) return;
  isActionLoading.value = true;
  try {
    await unblockAccount(account.value.id);
    await loadRelationship();
  } catch (err) {
    alert(err instanceof Error ? err.message : "Failed to unblock");
  } finally {
    isActionLoading.value = false;
  }
}

async function sendMessage() {
  if (!account.value?.id) return;
  isActionLoading.value = true;
  try {
    alert("Direct message feature coming soon!");
  } finally {
    isActionLoading.value = false;
  }
}

async function shareProfile() {
  if (account.value?.name) {
    const url = `https://solian.app/@${account.value.name}`;
    if (navigator.share) {
      await navigator.share({ title: displayName.value, url });
    } else {
      await navigator.clipboard.writeText(url);
    }
  }
}

// Load additional data on mount
onMounted(async () => {
  try {
    // Start timezone update interval
    updateTimezone();
    const tzInterval = setInterval(updateTimezone, 60000);
    onUnmounted(() => clearInterval(tzInterval));

    await Promise.all([
      loadTimeline(),
      loadRelationship(),
      loadBotDeveloper(),
      loadPunishment(),
    ]);
  } catch (err) {
    console.error('Failed to load additional data:', err);
  }
});
</script>
