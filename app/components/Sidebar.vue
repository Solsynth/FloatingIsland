<template>
    <aside class="flex h-full flex-col items-stretch px-4 py-4">
        <!-- Logo -->
        <div class="mb-6 flex justify-end px-2">
            <NuxtLink to="/" class="text-2xl font-bold text-primary">
                <img src="/favicon.png" alt="Logo" class="h-12 w-12" />
            </NuxtLink>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 grow space-y-1">
            <NuxtLink
                v-for="item in navItems"
                :key="item.href"
                :to="item.href"
                class="group flex items-center justify-end gap-4 rounded-xl px-4 py-3 transition-colors hover:bg-base-200"
            >
                <span
                    class="text-lg font-medium transition-colors group-hover:text-primary"
                    >{{ item.label }}</span
                >
                <component
                    :is="item.icon"
                    class="h-6 w-6 transition-colors group-hover:text-primary"
                />
            </NuxtLink>
        </nav>

        <!-- Bottom Section: Compose + User Profile -->
        <div class="mt-auto flex flex-col gap-2 px-2">
            <!-- Compose Button -->
            <div>
                <button
                    class="btn btn-primary btn-lg w-full rounded-full shadow-lg transition-shadow hover:shadow-xl"
                    @click="$emit('compose')"
                >
                    <IconPlus class="h-6 w-6" />
                    <span>New Post</span>
                </button>
            </div>

            <!-- User Profile Mini -->
            <div
                v-if="isAuthenticated && user"
                class="dropdown dropdown-end dropdown-top w-full"
            >
                <button
                    class="flex w-full items-center gap-3 rounded-xl p-3 transition-colors hover:bg-base-200"
                >
                    <div v-if="avatarUrl" class="avatar">
                        <div class="w-10 rounded-full">
                            <img :src="avatarUrl" :alt="username" />
                        </div>
                    </div>
                    <div v-else class="avatar avatar-placeholder">
                        <div
                            class="w-10 rounded-full bg-primary text-primary-content"
                        >
                            <span class="text-sm font-medium">{{
                                fallbackInitials
                            }}</span>
                        </div>
                    </div>
                    <div class="min-w-0 flex-1 text-left">
                        <div class="truncate text-sm font-semibold">
                            {{ displayName }}
                        </div>
                        <div class="truncate text-xs text-base-content/50">
                            @{{ username }}
                        </div>
                    </div>
                </button>
                <ul
                    class="dropdown-content menu mb-2 w-52 rounded-box bg-base-100 p-2 shadow"
                >
                    <li>
                        <NuxtLink to="/pricing">
                            <IconCreditCard class="w-[18px]" />
                            Membership
                        </NuxtLink>
                    </li>
                    <li class="my-1 border-t border-base-300" />
                    <li>
                        <NuxtLink :to="`/accounts/${username}`">
                            <IconUser class="w-[18px]" />
                            Profile
                        </NuxtLink>
                    </li>
                    <li>
                        <button @click="handleLogout">
                            <IconLogOut class="w-[18px]" />
                            Logout
                        </button>
                    </li>
                </ul>
            </div>
            <NuxtLink
                v-else
                to="/auth/login"
                class="flex w-full items-center gap-3 rounded-xl p-3 transition-colors hover:bg-base-200"
            >
                <div class="avatar avatar-placeholder">
                    <div
                        class="w-10 rounded-full bg-base-300 text-base-content"
                    >
                        <IconLogIn class="w-5 h-5" />
                    </div>
                </div>
                <div class="text-left">
                    <div class="text-sm font-semibold">Sign In</div>
                    <div class="text-xs text-base-content/50">
                        Join the community
                    </div>
                </div>
            </NuxtLink>
        </div>
    </aside>
</template>

<script setup lang="ts">
import {
    IconCompass,
    IconRadio,
    IconUsers,
    IconPlus,
    IconLogIn,
    IconLogOut,
    IconUser,
    IconCreditCard,
} from "#components";
import { getFileUrl } from "~/utils/files";

defineEmits<{
    compose: [];
}>();

const {
    isAuthenticated,
    user,
    logout,
    displayName: authDisplayName,
} = useAuth();

const navItems = [
    { icon: IconCompass, label: "Explore", href: "/" },
    { icon: IconRadio, label: "Livestreams", href: "/livestreams" },
    { icon: IconUsers, label: "Realms", href: "/realms" },
];

const displayName = computed(() => authDisplayName.value);
const username = computed(() => user.value?.name || "");
const avatarUrl = computed(
    () =>
        user.value?.profile?.picture?.url ||
        getFileUrl(user.value?.profile?.picture?.id),
);
const fallbackInitials = computed(() =>
    (username.value || "?").slice(0, 2).toUpperCase(),
);

function handleLogout() {
    logout();
    navigateTo("/");
}
</script>
