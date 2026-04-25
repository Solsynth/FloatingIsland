<template>
    <div class="min-h-[50vh] flex items-center justify-center">
        <ConfuseSpinner message="Redirecting..." />
    </div>
</template>

<script setup lang="ts">
const route = useRoute();
const router = useRouter();
const name = computed(() => route.params.name as string);

// Redirect /@name to /accounts/name
onMounted(() => {
    if (name.value) {
        router.replace(`/accounts/${name.value}`);
    } else {
        router.replace('/');
    }
});
</script>
