<template>
    <div class="min-h-[50vh] flex items-center justify-center">
        <ConfuseSpinner message="Loading..." />
    </div>
</template>

<script setup lang="ts">
// Redirect /accounts/me to /accounts/me/settings
const router = useRouter();

onMounted(() => {
    router.replace('/accounts/me/settings');
});
</script>
