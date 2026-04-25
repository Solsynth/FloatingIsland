<template>
    <div class="max-w-3xl mx-auto space-y-6 min-w-0">
        <h1 class="text-2xl font-bold mb-6">Privacy Settings</h1>

        <!-- Profile Visibility -->
        <div class="card bg-base-100 shadow-sm">
            <div class="card-body">
                <h2 class="card-title text-lg mb-4">Profile Visibility</h2>

                <div class="space-y-4">
                    <div class="form-control">
                        <label class="label cursor-pointer justify-start gap-4">
                            <input
                                v-model="privacy.profileVisible"
                                type="checkbox"
                                class="toggle toggle-primary"
                            >
                            <div>
                                <span class="label-text font-medium">Public Profile</span>
                                <p class="text-sm text-base-content/60">Allow anyone to view your profile</p>
                            </div>
                        </label>
                    </div>

                    <div class="form-control">
                        <label class="label cursor-pointer justify-start gap-4">
                            <input
                                v-model="privacy.showEmail"
                                type="checkbox"
                                class="toggle toggle-primary"
                            >
                            <div>
                                <span class="label-text font-medium">Show Email</span>
                                <p class="text-sm text-base-content/60">Display your email on your profile</p>
                            </div>
                        </label>
                    </div>

                    <div class="form-control">
                        <label class="label cursor-pointer justify-start gap-4">
                            <input
                                v-model="privacy.showBirthday"
                                type="checkbox"
                                class="toggle toggle-primary"
                            >
                            <div>
                                <span class="label-text font-medium">Show Birthday</span>
                                <p class="text-sm text-base-content/60">Display your birthday on your profile</p>
                            </div>
                        </label>
                    </div>

                    <div class="flex justify-end pt-2">
                        <button
                            class="btn btn-primary"
                            :disabled="isSaving"
                            @click="savePrivacy"
                        >
                            <IconLoader v-if="isSaving" class="w-4 h-4 animate-spin" />
                            <IconSave v-else class="w-4 h-4" />
                            Save Privacy Settings
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Post Defaults -->
        <div class="card bg-base-100 shadow-sm">
            <div class="card-body">
                <h2 class="card-title text-lg mb-4">Post Defaults</h2>

                <div class="space-y-4">
                    <fieldset class="fieldset">
                        <legend class="fieldset-legend">Default Visibility</legend>
                        <select v-model="privacy.defaultVisibility" class="select select-bordered w-full">
                            <option :value="0">Public</option>
                            <option :value="1">Friends Only</option>
                            <option :value="2">Unlisted</option>
                            <option :value="3">Private</option>
                        </select>
                    </fieldset>

                    <div class="form-control">
                        <label class="label cursor-pointer justify-start gap-4">
                            <input
                                v-model="privacy.allowComments"
                                type="checkbox"
                                class="toggle toggle-primary"
                            >
                            <div>
                                <span class="label-text font-medium">Allow Comments</span>
                                <p class="text-sm text-base-content/60">Let others comment on your posts</p>
                            </div>
                        </label>
                    </div>

                    <div class="form-control">
                        <label class="label cursor-pointer justify-start gap-4">
                            <input
                                v-model="privacy.allowReplies"
                                type="checkbox"
                                class="toggle toggle-primary"
                            >
                            <div>
                                <span class="label-text font-medium">Allow Replies</span>
                                <p class="text-sm text-base-content/60">Let others reply to your posts</p>
                            </div>
                        </label>
                    </div>
                </div>
            </div>
        </div>

        <!-- Blocking -->
        <div class="card bg-base-100 shadow-sm">
            <div class="card-body">
                <h2 class="card-title text-lg mb-4">Blocked Users</h2>

                <div v-if="blockedUsers.length === 0" class="text-center py-8 text-base-content/60">
                    <IconBan class="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No blocked users</p>
                </div>

                <div v-else class="space-y-3">
                    <div
                        v-for="user in blockedUsers"
                        :key="user.id"
                        class="flex items-center justify-between p-4 bg-base-200 rounded-xl"
                    >
                        <div class="flex items-center gap-3">
                            <div class="avatar">
                                <div class="w-10 h-10 rounded-full">
                                    <img v-if="user.profile?.picture?.id" :src="getFileUrl(user.profile.picture.id)" :alt="user.name">
                                    <div v-else class="bg-primary text-primary-content flex items-center justify-center w-full h-full text-sm font-bold">
                                        {{ user.name[0] }}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <p class="font-medium">{{ user.nick || user.name }}</p>
                                <p class="text-xs text-base-content/60">@{{ user.name }}</p>
                            </div>
                        </div>
                        <button class="btn btn-sm btn-ghost text-error" @click="unblock(user.id)">
                            <IconX class="w-4 h-4" />
                            Unblock
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { IconBan, IconLoader, IconSave, IconX } from "#components";
import { getFileUrl } from "~/utils/files";
import { unblockAccount } from "~/utils/api";
import type { SnAccount } from "~/types/auth";

const isSaving = ref(false);

const privacy = reactive({
    profileVisible: true,
    showEmail: false,
    showBirthday: true,
    defaultVisibility: 0,
    allowComments: true,
    allowReplies: true,
});

const blockedUsers = ref<SnAccount[]>([]);

// TODO: Fetch blocked users from API
async function fetchBlockedUsers() {
    // blockedUsers.value = await fetchBlockedAccounts();
}

async function unblock(userId: string) {
    try {
        await unblockAccount(userId);
        blockedUsers.value = blockedUsers.value.filter(u => u.id !== userId);
        alert("User unblocked");
    } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to unblock user");
    }
}

async function savePrivacy() {
    isSaving.value = true;
    try {
        // TODO: Implement API
        await new Promise(r => setTimeout(r, 1000));
        alert("Privacy settings saved");
    } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to save privacy settings");
    } finally {
        isSaving.value = false;
    }
}

onMounted(() => {
    fetchBlockedUsers();
});

useHead({
    title: "Privacy Settings",
});
</script>
