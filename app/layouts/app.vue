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

        <div class="app-shell mx-auto max-w-320">
            <!-- Desktop Layout -->
            <div
                class="hidden lg:grid lg:grid-cols-[16rem_1fr_16rem] lg:gap-6 lg:px-8 lg:py-4"
            >
                <aside class="sticky top-4 self-start">
                    <Sidebar @compose="showCompose = true" />
                </aside>
                <main class="min-h-screen">
                    <slot />
                </main>
                <aside class="sticky top-4 self-start">
                    <RightSidebar />
                </aside>
            </div>

            <!-- Mobile Layout -->
            <div class="lg:hidden">
                <MobileNav @compose="showCompose = true" />
                <main class="pb-16">
                    <slot />
                </main>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const progress = ref(0);
const progressVisible = ref(false);
const showCompose = ref(false);

const router = useRouter();

router.beforeEach(() => {
    progress.value = 0;
    progressVisible.value = true;

    // Simulate progress
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
