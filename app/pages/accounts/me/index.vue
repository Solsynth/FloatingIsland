<template>
    <NuxtLayout name="app">
        <div class="min-h-[50vh] flex items-center justify-center">
            <ConfuseSpinner message="Loading..." />
        </div>
    </NuxtLayout>
</template>

<script setup lang="ts">
const auth = useAuth();
const router = useRouter();

// Redirect immediately when auth is ready
watch(() => auth.isLoading.value, (loading) => {
    if (!loading) {
        redirect();
    }
}, { immediate: true });

function redirect() {
    if (auth.user?.value?.name) {
        // User is logged in, go to profile
        router.replace(`/@${auth.user.value.name}`);
    } else {
        // Not logged in, go to login
        router.replace('/auth/login');
    }
}

// Also try immediate redirect in case auth is already loaded
onMounted(() => {
    if (!auth.isLoading.value) {
        redirect();
    }
});
</script>
