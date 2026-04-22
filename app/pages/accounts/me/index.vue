<template>
    <div class="min-h-screen flex items-center justify-center">
        <ConfuseSpinner message="Redirecting..." />
    </div>
</template>

<script setup lang="ts">
const auth = useAuth();

onMounted(() => {
    if (auth.user?.name) {
        navigateTo(`/@${auth.user.name}`, { replace: true });
    } else {
        navigateTo('/auth/login', { replace: true });
    }
});
</script>
