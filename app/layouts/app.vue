<template>
    <div class="min-h-screen bg-base-200">
        <!-- Route Progress Bar -->
        <div class="route-progress" :class="{ 'is-visible': progressVisible }">
            <div
                class="route-progress__bar"
                :style="{ transform: `scaleX(${progress})` }"
            />
        </div>

        <!-- Compose Dialog Modal -->
        <ComposeDialog v-if="showCompose" @close="showCompose = false" />

        <div class="app-shell mx-auto max-w-7xl lg:px-4">
            <!-- Desktop Layout -->
            <div class="hidden lg:grid lg:grid-cols-[16rem_1fr] lg:gap-4">
                <aside
                    class="sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto"
                >
                    <Sidebar @compose="showCompose = true" />
                </aside>
                <main class="min-h-screen py-4">
                    <slot />
                </main>
            </div>

            <!-- Mobile Layout -->
            <div class="lg:hidden flex flex-col min-h-screen">
                <!-- Mobile Header -->
                <header
                    class="sticky top-0 z-50 bg-base-100/95 backdrop-blur border-b border-base-300"
                >
                    <div class="flex items-center justify-between px-4 h-14">
                        <NuxtLink to="/" class="flex items-center gap-2">
                            <img
                                src="/favicon.png"
                                alt="Solar Network"
                                class="w-8 h-8"
                            />
                            <span class="font-bold text-lg">Solar</span>
                        </NuxtLink>
                        <button
                            class="btn btn-primary btn-sm gap-1"
                            @click="showCompose = true"
                        >
                            <IconPlus class="w-4 h-4" />
                            <span class="hidden sm:inline">Post</span>
                        </button>
                    </div>
                </header>

                <!-- Mobile Main Content -->
                <main class="flex-1 px-2 py-3 pb-20">
                    <slot />
                </main>

                <!-- Mobile Bottom Navigation -->
                <nav
                    class="fixed bottom-0 left-0 right-0 z-50 bg-base-100/95 backdrop-blur border-t border-base-300 safe-area-pb"
                >
                    <div class="flex items-center justify-around h-16">
                        <NuxtLink
                            to="/"
                            class="flex flex-col items-center gap-0.5 p-2 text-base-content/60 hover:text-primary"
                            :class="{ 'text-primary': $route.path === '/' }"
                        >
                            <IconHome class="w-5 h-5" />
                            <span class="text-xs">Home</span>
                        </NuxtLink>
                        <NuxtLink
                            to="/livestreams"
                            class="flex flex-col items-center gap-0.5 p-2 text-base-content/60 hover:text-primary"
                            :class="{
                                'text-primary':
                                    $route.path.startsWith('/livestreams'),
                            }"
                        >
                            <IconRadio class="w-5 h-5" />
                            <span class="text-xs">Live</span>
                        </NuxtLink>
                        <button
                            class="flex flex-col items-center gap-0.5 p-2 text-primary"
                            @click="showCompose = true"
                        >
                            <div
                                class="w-10 h-10 rounded-full bg-primary flex items-center justify-center"
                            >
                                <IconPlus
                                    class="w-5 h-5 text-primary-content"
                                />
                            </div>
                        </button>
                        <NuxtLink
                            to="/pricing"
                            class="flex flex-col items-center gap-0.5 p-2 text-base-content/60 hover:text-primary"
                            :class="{
                                'text-primary': $route.path === '/pricing',
                            }"
                        >
                            <IconCreditCard class="w-5 h-5" />
                            <span class="text-xs">Pricing</span>
                        </NuxtLink>
                        <NuxtLink
                            :to="
                                isAuthenticated ? '/accounts/me' : '/auth/login'
                            "
                            class="flex flex-col items-center gap-0.5 p-2 text-base-content/60 hover:text-primary"
                            :class="{
                                'text-primary':
                                    $route.path.startsWith('/accounts') ||
                                    $route.path.startsWith('/@'),
                            }"
                        >
                            <div
                                v-if="
                                    isAuthenticated &&
                                    user?.profile?.picture?.id
                                "
                                class="w-5 h-5 rounded-full overflow-hidden"
                            >
                                <img
                                    :src="
                                        user.profile.picture.url ||
                                        getFileUrl(user.profile.picture.id)
                                    "
                                    class="w-full h-full object-cover"
                                />
                            </div>
                            <IconUser v-else class="w-5 h-5" />
                            <span class="text-xs">{{
                                isAuthenticated ? "Profile" : "Sign In"
                            }}</span>
                        </NuxtLink>
                    </div>
                </nav>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { getFileUrl } from "~/utils/files";

const progress = ref(0);
const progressVisible = ref(false);
const showCompose = ref(false);

const router = useRouter();
const { isAuthenticated, user } = useAuth();

// Listen for global compose open event
onMounted(() => {
    window.addEventListener('open-compose', () => {
        showCompose.value = true;
    });
});

onBeforeUnmount(() => {
    window.removeEventListener('open-compose', () => {
        showCompose.value = true;
    });
});

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
