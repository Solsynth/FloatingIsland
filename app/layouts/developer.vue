<template>
  <div class="min-h-screen bg-base-200">
    <!-- Desktop Admin Layout -->
    <div class="hidden lg:flex min-h-screen">
      <!-- Sidebar -->
      <aside class="fixed left-0 top-0 bottom-0 w-[18rem] z-40 overflow-y-auto scrollbar-none">
        <DeveloperSidebar />
      </aside>

      <!-- Main Area -->
      <div class="ml-[18rem] flex-1 flex flex-col min-h-screen max-h-screen">
        <!-- Header -->
        <AdminHeader :breadcrumbs="breadcrumbs" :page-title="pageTitle" />

        <!-- Content -->
        <div class="flex-1 flex min-h-0">
          <main class="flex-1 min-w-0 overflow-y-auto px-6 py-6 scrollbar-none">
            <div class="mx-auto max-w-5xl">
              <slot />
            </div>
          </main>

          <!-- Right Sidebar -->
          <aside
            v-if="$slots.rightbar"
            class="w-[22rem] shrink-0 overflow-y-auto pt-6 pr-6 border-l border-base-300/30 scrollbar-none"
          >
            <div class="sticky top-0">
              <slot name="rightbar" />
            </div>
          </aside>
        </div>
      </div>
    </div>

    <!-- Mobile Layout -->
    <div class="lg:hidden flex flex-col min-h-screen">
      <!-- Mobile Header -->
      <header
        class="fixed top-0 left-0 right-0 z-50 border-b border-base-300/50 bg-base-100/95 backdrop-blur-xl"
      >
        <div class="flex h-14 items-center justify-between px-4">
          <NuxtLink to="/developers" class="btn btn-circle btn-ghost btn-sm">
            <IconArrowLeft class="w-5 h-5" />
          </NuxtLink>
          <span class="text-sm font-semibold">{{
            publisherName || t("developer.title")
          }}</span>
          <button
            class="btn btn-circle btn-ghost btn-sm"
            @click="mobileMenuOpen = !mobileMenuOpen"
          >
            <IconMenu class="w-5 h-5" />
          </button>
        </div>
      </header>

      <!-- Mobile Nav Drawer -->
      <div
        v-if="mobileMenuOpen"
        class="fixed inset-0 z-40 bg-black/40"
        @click="mobileMenuOpen = false"
      >
        <div
          class="absolute right-0 top-14 bottom-0 w-72 bg-base-100 p-4 overflow-y-auto shadow-xl scrollbar-none"
          @click.stop
        >
          <DeveloperSidebar @navigate="mobileMenuOpen = false" />
        </div>
      </div>

      <!-- Mobile Main Content -->
      <main class="flex-1 px-4 py-3 pt-[4.5rem]">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IconArrowLeft, IconMenu } from "#components";

const { t } = useI18n();
const route = useRoute();
const developer = useDeveloper();
const { currentDeveloper } = developer;

const mobileMenuOpen = ref(false);

const publisherName = computed(() => {
  const name = route.params.pubName;
  return typeof name === "string" ? name : null;
});

const segmentLabels: Record<string, string> = {
  settings: "Settings",
  members: "Members",
  posts: "Posts",
  feeds: "Feeds",
  stickers: "Stickers",
  collections: "Collections",
  polls: "Polls",
  leaderboard: "Leaderboard",
  subscribers: "Subscribers",
  projects: "Projects",
  apps: "Apps",
  bots: "Bots",
};

const nickLabel = computed(
  () =>
    currentDeveloper.value?.publisher?.nick ||
    (typeof route.params.pubName === "string" ? route.params.pubName : ""),
);

const breadcrumbs = computed(() => {
  const parts: Array<{ label: string; href: string }> = [
    { label: t('developer.console'), href: "/developers" },
  ];
  const segments = route.path.split("/").filter(Boolean);
  // segments[0] is 'developers', segments[1] is pubName
  if (segments.length >= 2 && segments[1] === route.params.pubName) {
    parts.push({ label: nickLabel.value, href: `/developers/${segments[1]}` });
  }
  // Remaining segments after pubName
  for (let i = 2; i < segments.length; i++) {
    const seg = segments[i] as string;
    const href = "/" + segments.slice(0, i + 1).join("/");
    const label = segmentLabels[seg] || seg;
    parts.push({ label, href });
  }
  return parts;
});

const pageTitle = computed(() => {
  const last = breadcrumbs.value[breadcrumbs.value.length - 1];
  return last ? last.label : t("developer.title");
});
</script>
