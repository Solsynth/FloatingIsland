<template>
    <NuxtLayout name="app">
        <ConfuseSpinner
            v-if="accountStatus === 'pending'"
            message="Loading account..."
        />

        <template v-else-if="notFound">
            <div class="mx-auto max-w-2xl p-6">
                <div class="card">
                    <div class="card-body items-center text-center">
                        <IconUserX class="text-base-content/50 w-10 h-10" />
                        <h1 class="text-xl font-bold">Account not found</h1>
                        <p class="text-base-content/60">
                            The profile you requested does not exist.
                        </p>
                    </div>
                </div>
            </div>
        </template>

        <template v-else-if="account">
            <div class="mx-auto max-w-5xl">
                <!-- Profile Header -->
                <section class="relative overflow-hidden px-4 pt-4 lg:px-6">
                    <div
                        class="h-40 w-full bg-base-200 sm:h-52 rounded-2xl overflow-hidden"
                    >
                        <img
                            v-if="backgroundUrl"
                            :src="backgroundUrl"
                            :alt="`${displayName} background`"
                            class="h-full w-full object-cover"
                        />
                    </div>
                    <div
                        class="mx-auto -mt-16 flex max-w-5xl flex-col gap-4 px-4 pb-4 sm:-mt-14 sm:flex-row sm:items-end"
                    >
                        <div class="shrink-0">
                            <div v-if="avatarUrl" class="avatar">
                                <div
                                    class="h-24 w-24 rounded-full ring ring-base-300 ring-offset-2 ring-offset-base-100 sm:h-28 sm:w-28"
                                >
                                    <img :src="avatarUrl" :alt="displayName" />
                                </div>
                            </div>
                            <div v-else class="avatar avatar-placeholder">
                                <div
                                    class="h-24 w-24 rounded-full bg-primary text-primary-content ring ring-base-300 ring-offset-2 ring-offset-base-100 sm:h-28 sm:w-28"
                                >
                                    <span class="text-2xl font-semibold">
                                        {{ getInitials(displayName) }}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div class="min-w-0 flex-1">
                            <div
                                class="flex flex-wrap items-center gap-2 pt-18"
                            >
                                <h1
                                    class="truncate text-2xl font-black sm:text-3xl"
                                >
                                    {{ displayName }}
                                </h1>
                                <span
                                    v-if="account.profile?.verification"
                                    class="badge badge-primary gap-1"
                                >
                                    <IconShieldCheck class="w-3 h-3" />
                                    {{ account.profile.verification.title }}
                                </span>
                            </div>
                            <p class="truncate text-sm text-base-content/60">
                                @{{ account.name }}
                            </p>
                        </div>
                        <div class="flex gap-3">
                            <button
                                class="btn btn-outline btn-sm"
                                @click="shareProfile"
                            >
                                <IconShare2 class="w-4 h-4" />
                                Share
                            </button>
                        </div>
                    </div>
                </section>

                <div class="space-y-4 px-4 py-4 lg:px-6">
                    <!-- Bio Section -->
                    <section class="space-y-4">
                        <div class="card">
                            <div class="card-body p-4">
                                <h2
                                    class="text-sm font-semibold text-base-content/70"
                                >
                                    Bio
                                </h2>
                                <article
                                    v-if="bioHtml"
                                    class="prose prose-sm max-w-none"
                                    v-html="bioHtml"
                                />
                                <p v-else class="text-sm text-base-content/60">
                                    No bio yet.
                                </p>
                            </div>
                        </div>

                        <!-- Verification Info -->
                        <div v-if="account.profile?.verification" class="card">
                            <div class="card-body p-4">
                                <p class="text-sm font-semibold">
                                    {{
                                        account.profile.verification.title ||
                                        "Verified account"
                                    }}
                                </p>
                                <p
                                    v-if="
                                        account.profile.verification.description
                                    "
                                    class="text-sm text-base-content/70"
                                >
                                    {{
                                        account.profile.verification.description
                                    }}
                                </p>
                                <p
                                    v-if="
                                        account.profile.verification.verifiedBy
                                    "
                                    class="text-xs text-base-content/60"
                                >
                                    By
                                    {{
                                        account.profile.verification.verifiedBy
                                    }}
                                </p>
                            </div>
                        </div>
                    </section>

                    <!-- Details Section -->
                    <section class="space-y-4">
                        <div class="card">
                            <div class="card-body gap-4 p-4">
                                <h2
                                    class="text-sm font-semibold text-base-content/70"
                                >
                                    Details
                                </h2>
                                <div class="grid gap-3 sm:grid-cols-2">
                                    <div
                                        class="flex items-center gap-2 text-sm"
                                    >
                                        <IconCalendar
                                            class="text-base-content/50 w-4 h-4"
                                        />
                                        <span
                                            >Joined
                                            {{
                                                formatDate(account.createdAt)
                                            }}</span
                                        >
                                    </div>

                                    <div
                                        v-if="account.profile?.birthday"
                                        class="flex items-center gap-2 text-sm"
                                    >
                                        <IconCake
                                            class="text-base-content/50 w-4 h-4"
                                        />
                                        <span>
                                            {{
                                                formatDate(
                                                    account.profile.birthday,
                                                )
                                            }}
                                            ·
                                            {{
                                                getAge(account.profile.birthday)
                                            }}
                                            years old
                                        </span>
                                    </div>

                                    <div
                                        v-if="account.profile?.location"
                                        class="flex items-center gap-2 text-sm"
                                    >
                                        <IconMapPin
                                            class="text-base-content/50 w-4 h-4"
                                        />
                                        <span>{{
                                            account.profile.location
                                        }}</span>
                                    </div>

                                    <div
                                        v-if="
                                            account.profile?.pronouns ||
                                            account.profile?.gender
                                        "
                                        class="flex items-center gap-2 text-sm"
                                    >
                                        <IconUser
                                            class="text-base-content/50 w-4 h-4"
                                        />
                                        <span>
                                            {{
                                                account.profile?.gender ||
                                                "Unspecified"
                                            }}
                                            ·
                                            {{
                                                account.profile?.pronouns ||
                                                "Unspecified"
                                            }}
                                        </span>
                                    </div>

                                    <div
                                        v-if="
                                            account.profile?.firstName ||
                                            account.profile?.middleName ||
                                            account.profile?.lastName
                                        "
                                        class="flex items-center gap-2 text-sm"
                                    >
                                        <IconBadgeCheck
                                            class="text-base-content/50 w-4 h-4"
                                        />
                                        <span>
                                            {{
                                                [
                                                    account.profile?.firstName,
                                                    account.profile?.middleName,
                                                    account.profile?.lastName,
                                                ]
                                                    .filter(Boolean)
                                                    .join(" ")
                                            }}
                                        </span>
                                    </div>

                                    <div
                                        v-if="
                                            account.profile?.socialCredits !==
                                            undefined
                                        "
                                        class="flex items-center gap-2 text-sm"
                                    >
                                        <IconCircleDollarSign
                                            class="text-base-content/50 w-4 h-4"
                                        />
                                        <span>
                                            {{
                                                account.profile?.socialCredits?.toFixed(
                                                    2,
                                                ) ?? "0.00"
                                            }}
                                            pts ·
                                            <span class="font-medium">{{
                                                getSocialCreditsLevel(
                                                    account.profile
                                                        ?.socialCreditsLevel ??
                                                        0,
                                                )
                                            }}</span>
                                        </span>
                                    </div>

                                    <div
                                        v-if="account.profile?.level"
                                        class="flex items-center gap-2 text-sm"
                                    >
                                        <IconStar
                                            class="text-yellow-500 w-4 h-4"
                                        />
                                        <span
                                            >Level
                                            {{ account.profile.level }}</span
                                        >
                                    </div>

                                    <div
                                        v-if="account.profile?.timeZone"
                                        class="flex items-center gap-2 text-sm"
                                    >
                                        <IconClock
                                            class="text-base-content/50 w-4 h-4"
                                        />
                                        <span>{{
                                            account.profile.timeZone
                                        }}</span>
                                    </div>

                                    <div
                                        class="flex items-center gap-2 text-sm"
                                    >
                                        <IconFingerprint
                                            class="text-base-content/50 w-4 h-4"
                                        />
                                        <button
                                            class="truncate hover:text-primary"
                                            @click="copyToClipboard(account.id)"
                                        >
                                            {{ account.id }}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Links -->
                        <div
                            v-if="
                                account.profile?.links &&
                                account.profile.links.length > 0
                            "
                            class="card"
                        >
                            <div class="card-body p-4">
                                <h2
                                    class="text-sm font-semibold text-base-content/70"
                                >
                                    Links
                                </h2>
                                <div class="space-y-2">
                                    <a
                                        v-for="link in account.profile.links"
                                        :key="link.name"
                                        :href="
                                            link.url.startsWith('http')
                                                ? link.url
                                                : `https://${link.url}`
                                        "
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        class="flex items-center gap-2 text-sm hover:text-primary"
                                    >
                                        <IconLink
                                            class="text-base-content/50 w-4 h-4"
                                        />
                                        <span class="capitalize">{{
                                            link.name
                                        }}</span>
                                    </a>
                                </div>
                            </div>
                        </div>

                        <!-- Contacts -->
                        <div v-if="publicContacts.length > 0" class="card">
                            <div class="card-body p-4">
                                <h2
                                    class="text-sm font-semibold text-base-content/70"
                                >
                                    Contact
                                </h2>
                                <div class="space-y-2">
                                    <div
                                        v-for="(contact, idx) in publicContacts"
                                        :key="idx"
                                        class="flex items-center gap-2 text-sm"
                                    >
                                        <IconMail
                                            v-if="contact.type === 0"
                                            class="text-base-content/50 w-4 h-4"
                                        />
                                        <IconPhone
                                            v-else-if="contact.type === 1"
                                            class="text-base-content/50 w-4 h-4"
                                        />
                                        <IconHome
                                            v-else
                                            class="text-base-content/50 w-4 h-4"
                                        />
                                        <span>{{ contact.content }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Badges -->
                        <div v-if="account.badges?.length" class="card">
                            <div class="card-body p-4">
                                <h2
                                    class="text-sm font-semibold text-base-content/70"
                                >
                                    Badges
                                </h2>
                                <div class="flex flex-wrap gap-2">
                                    <div
                                        v-for="badge in account.badges"
                                        :key="badge.id"
                                        class="badge badge-lg gap-1"
                                        :title="badge.caption ?? undefined"
                                    >
                                        <span>{{
                                            badge.label || badge.type
                                        }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </template>

        <div v-else class="alert alert-error mx-auto max-w-2xl m-6">
            <IconAlertTriangle class="w-5 h-5" />
            <span>{{ errorMessage || "Failed to load account profile" }}</span>
        </div>
    </NuxtLayout>
</template>

<script setup lang="ts">
import type { User } from "~/types/auth";
import { fetchAccount } from "~/utils/api";
import { renderMarkdown } from "~/utils/markdown";

const route = useRoute();
const accountName = computed(() => route.params.name as string);

const {
    data: account,
    status: accountStatus,
    error: fetchError,
} = await useAsyncData(
    () => `account-${accountName.value}`,
    () => fetchAccount(accountName.value),
    {
        watch: [accountName],
    },
);

const notFound = computed(() => {
    const err = fetchError.value as Error & { statusCode?: number };
    return err?.statusCode === 404 || err?.message?.includes("404");
});
const errorMessage = computed(() => fetchError.value?.message || null);

const displayName = computed(
    () => account.value?.nick || account.value?.name || "Unknown",
);
const avatarUrl = computed(() =>
    getFileUrl(account.value?.profile?.picture?.id),
);
const backgroundUrl = computed(() =>
    getFileUrl(account.value?.profile?.background?.id),
);
const bioHtml = computed(() =>
    account.value?.profile?.bio
        ? renderMarkdown(account.value.profile.bio)
        : "",
);
const publicContacts = computed(
    () => account.value?.contacts?.filter((c) => c.isPublic) || [],
);

function getInitials(name: string): string {
    return (
        name
            .split(/\s+/)
            .filter(Boolean)
            .map((part) => part[0]?.toUpperCase())
            .slice(0, 2)
            .join("") || "?"
    );
}

function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

function getAge(birthday: string | null): number | null {
    if (!birthday) return null;
    const birth = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
        age--;
    }
    return age;
}

function getSocialCreditsLevel(level: number): string {
    switch (level) {
        case -1:
            return "Poor";
        case 0:
            return "Normal";
        case 1:
            return "Good";
        case 2:
            return "Excellent";
        default:
            return "Unknown";
    }
}

function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
}

function shareProfile() {
    if (account.value?.name) {
        navigator.share({
            title: displayName.value,
            url: `https://solian.app/@${account.value.name}`,
        });
    }
}

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
                            a.profile?.bio ||
                            `View profile details for @${a.name}.`,
                    },
                ],
            });
        }
    },
    { immediate: true },
);

definePageMeta({
    alias: ["/@:name()"],
});
</script>
