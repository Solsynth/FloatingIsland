<template>
    <div class="min-h-screen bg-base-200">
        <!-- Route Progress Bar -->
        <div class="route-progress" :class="{ 'is-visible': progressVisible }">
            <div class="route-progress__bar" :style="{ transform: `scaleX(${progress})` }" />
        </div>

        <div class="app-shell mx-auto max-w-7xl">
            <!-- Desktop Layout -->
            <div class="hidden lg:grid lg:grid-cols-[16rem_1fr] lg:gap-6">
                <!-- Settings Sidebar -->
                <aside class="sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto py-4">
                    <div class="card">
                        <div class="card-body p-4">
                            <h2 class="text-lg font-bold mb-4">Settings</h2>
                            <nav class="space-y-1">
                                <NuxtLink
                                    v-for="item in menuItems"
                                    :key="item.to"
                                    :to="item.to"
                                    class="flex items-center gap-3 px-3 py-2 rounded-xl transition-colors"
                                    :class="$route.path === item.to ? 'bg-primary text-primary-content' : 'hover:bg-base-200'"
                                >
                                    <component :is="item.icon" class="w-5 h-5" />
                                    <span>{{ item.label }}</span>
                                </NuxtLink>
                            </nav>

                            <div class="divider my-4" />

                            <NuxtLink
                                :to="`/@${user?.name}`"
                                class="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-base-200 transition-colors"
                            >
                                <IconArrowLeft class="w-5 h-5" />
                                <span>Back to Profile</span>
                            </NuxtLink>
                        </div>
                    </div>
                </aside>

                <!-- Main Content -->
                <main class="min-h-screen py-4">
                    <slot />
                </main>
            </div>

            <!-- Mobile Layout -->
            <div class="lg:hidden flex flex-col min-h-screen">
                <!-- Mobile Header -->
                <header class="sticky top-0 z-50 bg-base-100/95 backdrop-blur border-b border-base-300">
                    <div class="flex items-center justify-between px-4 h-14">
                        <NuxtLink to="/" class="flex items-center gap-2">
                            <img src="/favicon.png" alt="Solar Network" class="w-8 h-8" >
                            <span class="font-bold text-lg">Settings</span>
                        </NuxtLink>
                    </div>
                </header>

                <!-- Mobile Settings Menu -->
                <main class="flex-1 px-4 py-4 pb-20">
                    <slot />
                </main>

                <!-- Mobile Bottom Navigation -->
                <nav class="fixed bottom-0 left-0 right-0 z-50 bg-base-100/95 backdrop-blur border-t border-base-300 safe-area-pb">
                    <div class="flex items-center justify-around h-16">
                        <NuxtLink
                            :to="`/@${user?.name}`"
                            class="flex flex-col items-center gap-0.5 p-2 text-base-content/60 hover:text-primary"
                        >
                            <IconArrowLeft class="w-5 h-5" />
                            <span class="text-xs">Back</span>
                        </NuxtLink>
                    </div>
                </nav>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import {
    IconUser,
    IconShield,
    IconLock,
    IconCreditCard,
    IconBell,
    IconPalette,
    IconArrowLeft,
} from "#components";

const progress = ref(0);
const progressVisible = ref(false);
const { user } = useAuth();

const menuItems = [
    { to: "/accounts/me/settings", label: "Profile", icon: IconUser },
    { to: "/accounts/me/settings/security", label: "Security", icon: IconShield },
    { to: "/accounts/me/settings/privacy", label: "Privacy", icon: IconLock },
    { to: "/accounts/me/settings/notifications", label: "Notifications", icon: IconBell },
    { to: "/accounts/me/settings/appearance", label: "Appearance", icon: IconPalette },
    { to: "/accounts/me/settings/billing", label: "Billing", icon: IconCreditCard },
];

const router = useRouter();

router.beforeEach(() => {
    progress.value = 0;
    progressVisible.value = true;

    const steps = [0.1, 0.3, 0.5, 0.7, 0.85, 0.95];
    let i = 0;
    const interval = setInterval(() => {
        if (i < steps.length) {
            progress.value = steps[i];
            i++;
        } else {
            clearInterval(interval);
        }
    }, 50);

    return () => clearInterval(interval);
});

router.afterEach(() => {
    progress.value = 1;
    setTimeout(() => {
        progressVisible.value = false;
        progress.value = 0;
    }, 200);
});
</script>

<style scoped>
.safe-area-pb {
    padding-bottom: env(safe-area-inset-bottom, 0);
}
</style>
