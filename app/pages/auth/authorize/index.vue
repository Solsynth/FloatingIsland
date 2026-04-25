<template>
    <div class="min-h-screen bg-base-200 flex items-center justify-center px-4 py-8 relative">
        <!-- Background Image (if available) -->
        <div
            v-if="backgroundUrl"
            class="fixed inset-0 -z-10 bg-cover bg-center opacity-30 blur-sm"
            :style="`background-image: url('${backgroundUrl}')`"
        />

        <div class="w-full max-w-4xl rounded-3xl shadow-2xl backdrop-blur-xl overflow-hidden">
            <div class="grid md:grid-cols-[1fr_1.15fr]">
                <!-- Left Column: Branding & App Info -->
                <section
                    class="flex flex-col justify-start gap-4 rounded-t-3xl bg-base-100/50 p-6 backdrop-blur-2xl md:rounded-l-3xl md:rounded-tr-none md:p-8"
                >
                    <img src="/favicon.png" alt="Solar Network" class="h-12 w-12 rounded-full">
                    <div>
                        <p class="text-xs font-semibold tracking-[0.2em] text-base-content/70 uppercase">
                            Authorization Request
                        </p>
                        <h1 class="text-3xl leading-tight font-black mt-2">
                            Grant Access
                        </h1>
                        <p class="text-sm text-base-content/70 mt-2">
                            Review the permissions before authorizing this application.
                        </p>
                    </div>

                    <!-- App Info Card (visible on desktop) -->
                    <div
                        v-if="clientInfo && !loading"
                        class="hidden md:flex items-center gap-3 mt-4 p-4 bg-base-200/60 rounded-2xl border border-base-300"
                    >
                        <div class="avatar">
                            <div class="w-14 h-14 rounded-2xl bg-base-300 overflow-hidden">
                                <img
                                    v-if="clientInfo.picture?.id"
                                    :src="getFileUrl(clientInfo.picture.id)"
                                    class="w-full h-full object-cover"
                                >
                                <div
                                    v-else
                                    class="w-full h-full flex items-center justify-center bg-primary/15 text-primary"
                                >
                                    <IconPlug class="w-6 h-6" />
                                </div>
                            </div>
                        </div>
                        <div class="min-w-0">
                            <p class="font-bold truncate">
                                {{ clientInfo.clientName || "Unknown App" }}
                            </p>
                            <p class="text-xs text-base-content/50">
                                wants to access your account
                            </p>
                        </div>
                    </div>
                </section>

                <!-- Right Column: Authorization Content -->
                <section class="rounded-b-2xl bg-base-100/90 p-6 md:rounded-r-2xl md:rounded-bl-none md:p-8">
                    <ConfuseSpinner v-if="loading" message="Authorizing..." />

                    <template v-else-if="clientInfo">
                        <!-- Mobile App Info -->
                        <div class="flex md:hidden items-center gap-3 mb-6">
                            <div class="avatar">
                                <div class="w-14 h-14 rounded-2xl bg-base-300 overflow-hidden">
                                    <img
                                        v-if="clientInfo.picture?.id"
                                        :src="getFileUrl(clientInfo.picture.id)"
                                        class="w-full h-full object-cover"
                                    >
                                    <div
                                        v-else
                                        class="w-full h-full flex items-center justify-center bg-primary/15 text-primary"
                                    >
                                        <IconPlug class="w-6 h-6" />
                                    </div>
                                </div>
                            </div>
                            <div class="min-w-0">
                                <p class="font-bold truncate text-lg">
                                    {{ clientInfo.clientName || "Unknown App" }}
                                </p>
                                <p class="text-xs text-base-content/50">
                                    wants to access your account
                                </p>
                            </div>
                        </div>

                        <!-- Error Message -->
                        <div
                            v-if="error"
                            class="alert alert-error text-sm mb-4"
                        >
                            <IconAlertCircle class="w-4 h-4" />
                            <span>{{ error }}</span>
                        </div>

                        <!-- Permissions -->
                        <div class="rounded-2xl border border-base-300 bg-base-200/60 p-4">
                            <p class="mb-3 text-sm font-semibold flex items-center gap-2">
                                <IconShield class="w-4 h-4 text-primary" />
                                Requested permissions
                            </p>
                            <ul
                                v-if="clientInfo.scopes?.length"
                                class="space-y-2 text-sm"
                            >
                                <li
                                    v-for="scope in clientInfo.scopes"
                                    :key="scope"
                                    class="flex items-start gap-2"
                                >
                                    <IconCheck class="w-4 h-4 mt-0.5 text-success flex-shrink-0" />
                                    <span>{{ scope }}</span>
                                </li>
                            </ul>
                            <p v-else class="text-sm text-base-content/60">
                                No explicit scopes provided.
                            </p>
                        </div>

                        <!-- Action Buttons -->
                        <div class="mt-6 grid grid-cols-2 gap-3">
                            <button
                                class="btn btn-primary"
                                :disabled="isAuthorizing"
                                @click="handleApprove"
                            >
                                <IconLoader
                                    v-if="isAuthorizing"
                                    class="w-4 h-4 animate-spin"
                                />
                                <IconCheck v-else class="w-4 h-4" />
                                Authorize
                            </button>
                            <button
                                class="btn btn-outline"
                                :disabled="isAuthorizing"
                                @click="handleDeny"
                            >
                                <IconX class="w-4 h-4" />
                                Deny
                            </button>
                        </div>
                    </template>

                    <!-- Error State -->
                    <div
                        v-else
                        class="flex flex-col items-center justify-center py-8 text-center"
                    >
                        <div class="w-16 h-16 rounded-full bg-error/20 flex items-center justify-center mb-4">
                            <IconAlertCircle class="w-8 h-8 text-error" />
                        </div>
                        <h2 class="text-xl font-bold">Authorization Failed</h2>
                        <p class="text-base-content/60 text-sm mt-1">
                            Failed to load authorization request
                        </p>
                    </div>
                </section>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import {
    IconPlug,
    IconCheck,
    IconAlertCircle,
    IconLoader,
    IconX,
    IconShield,
} from "#components";

definePageMeta({ layout: false });

const route = useRoute();
const auth = useAuth();
const loading = ref(true);
const isAuthorizing = ref(false);
const error = ref<string | null>(null);

const clientInfo = ref<{
    clientName?: string;
    homeUri?: string;
    picture?: { id?: string };
    background?: { id?: string };
    scopes?: string[];
} | null>(null);

const backgroundUrl = computed(() => {
    return clientInfo.value?.background?.id
        ? getFileUrl(clientInfo.value.background.id)
        : null;
});

function getFileUrl(fileId: string): string {
    return `https://api.solian.app/drive/files/${fileId}`;
}

async function loadClientInfo() {
    try {
        const query = new URLSearchParams(
            route.query as Record<string, string>,
        );
        const { getAuthorizeClientInfo } = await import("~/utils/api");
        clientInfo.value = await getAuthorizeClientInfo(query);
    } catch (e) {
        console.error("Failed to load client info:", e);
        error.value = e instanceof Error ? e.message : "Failed to load authorization request";
    } finally {
        loading.value = false;
    }
}

async function handleApprove() {
    isAuthorizing.value = true;
    error.value = null;
    try {
        const query = new URLSearchParams(route.query as Record<string, string>);
        const { submitAuthorizeDecision } = await import("~/utils/api");
        const result = await submitAuthorizeDecision(query, true);
        if (result.redirectUri) {
            window.location.href = result.redirectUri;
        } else {
            navigateTo("/");
        }
    } catch (e) {
        error.value = e instanceof Error ? e.message : "Failed to submit authorization";
        isAuthorizing.value = false;
    }
}

async function handleDeny() {
    isAuthorizing.value = true;
    error.value = null;
    try {
        const query = new URLSearchParams(route.query as Record<string, string>);
        const { submitAuthorizeDecision } = await import("~/utils/api");
        const result = await submitAuthorizeDecision(query, false);
        if (result.redirectUri) {
            window.location.href = result.redirectUri;
        } else {
            navigateTo("/");
        }
    } catch (e) {
        error.value = e instanceof Error ? e.message : "Failed to submit denial";
        isAuthorizing.value = false;
    }
}

onMounted(() => {
    // Redirect to login if not authenticated
    if (!auth.isAuthenticated.value) {
        const redirectUrl = route.fullPath;
        navigateTo(`/auth/login?redirect=${encodeURIComponent(redirectUrl)}`);
        return;
    }
    loadClientInfo();
});
</script>
