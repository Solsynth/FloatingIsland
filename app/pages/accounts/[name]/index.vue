<template>
    <NuxtLayout name="app">
        <ConfuseSpinner
            v-if="accountStatus === 'pending'"
            message="Loading account..."
        />

        <template v-else-if="account">
            <!-- Profile Header -->
            <div class="card bg-base-100 shadow-xl overflow-hidden">
                <div
                    class="h-32 bg-gradient-to-r from-primary/20 to-secondary/20"
                    :style="backgroundStyle"
                />
                <div class="card-body pb-6">
                    <div class="avatar -mt-16 mb-4">
                        <div
                            class="w-24 rounded-full ring-4 ring-base-100 bg-base-300 overflow-hidden"
                        >
                            <img
                                v-if="pictureUrl"
                                :src="pictureUrl"
                                :alt="displayName"
                                class="w-full h-full object-cover"
                            />
                            <div
                                v-else
                                class="w-full h-full flex items-center justify-center text-2xl font-bold text-base-content/50"
                            >
                                {{ initials }}
                            </div>
                        </div>
                    </div>

                    <div class="flex items-start justify-between">
                        <div>
                            <div class="flex items-center gap-2">
                                <h1 class="text-2xl font-bold">
                                    {{ displayName }}
                                </h1>
                                <IconBadgeCheck
                                    v-if="isVerified"
                                    class="w-5 h-5 text-blue-500"
                                />
                            </div>
                            <p class="text-base-content/50">
                                @{{ account.name }}
                            </p>
                        </div>
                    </div>

                    <p v-if="bio" class="mt-2 text-base-content/80">
                        {{ bio }}
                    </p>

                    <div class="flex gap-6 mt-4 text-sm">
                        <div
                            v-if="account.profile"
                            class="flex items-center gap-1"
                        >
                            <IconMapPin class="w-4 h-4" />
                            <span>{{
                                account.profile.location || "No location"
                            }}</span>
                        </div>
                        <div class="flex items-center gap-1">
                            <IconCalendar class="w-4 h-4" />
                            <span
                                >Joined
                                {{ formatDate(account.createdAt) }}</span
                            >
                        </div>
                        <div
                            v-if="account.profile?.level"
                            class="flex items-center gap-1"
                        >
                            <IconStar class="w-4 h-4 text-yellow-500" />
                            <span>Level {{ account.profile.level }}</span>
                        </div>
                    </div>

                    <div
                        v-if="account.badges?.length"
                        class="flex flex-wrap gap-2 mt-3"
                    >
                        <div
                            v-for="badge in account.badges"
                            :key="badge.id"
                            class="badge badge-outline gap-1"
                        >
                            <IconAward class="w-3 h-3" />
                            {{ badge.label }}
                        </div>
                    </div>

                    <div
                        v-if="account.profile?.links?.length"
                        class="mt-3 space-y-1"
                    >
                        <a
                            v-for="link in account.profile.links"
                            :key="link.name"
                            :href="link.url"
                            class="text-primary hover:underline text-sm flex items-center gap-1"
                            target="_blank"
                            rel="noopener"
                        >
                            <IconLink class="w-3 h-3" />
                            {{ link.name }}
                        </a>
                    </div>
                </div>
            </div>
        </template>

        <div v-else class="alert alert-warning">
            <IconAlertTriangle class="w-5 h-5" />
            <span>Account not found</span>
        </div>
    </NuxtLayout>
</template>

<script setup lang="ts">
import type { User } from "~/types/auth";

const route = useRoute();
const accountName = computed(() => route.params.name as string);

const { data: account, status: accountStatus } = await useFetch<User>(
    () => `/api/accounts/${accountName.value}`,
    {
        key: `account-${accountName.value}`,
    },
);

const displayName = computed(
    () => account.value?.nick || account.value?.name || "",
);
const pictureUrl = computed(() => account.value?.profile?.picture?.url || null);
const bio = computed(() => account.value?.profile?.bio || "");
const initials = computed(() =>
    (account.value?.name || "?").slice(0, 2).toUpperCase(),
);
const isVerified = computed(() => false);

const backgroundStyle = computed(() => {
    const bg = account.value?.profile?.background?.url;
    if (bg)
        return `background-image: url(${bg}); background-size: cover; background-position: center;`;
    return "";
});

watch(
    account,
    (a) => {
        if (a) {
            useHead({
                title: `${displayName.value} (@${a.name})`,
                meta: [
                    {
                        name: "description",
                        content:
                            bio.value ||
                            `@${a.name}'s profile on Solar Network`,
                    },
                ],
            });
        }
    },
    { immediate: true },
);

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
    });
}

definePageMeta({
    alias: ["/@:name()"],
});
</script>
