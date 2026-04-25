<template>
    <div class="max-w-2xl mx-auto">
        <h1 class="text-2xl font-bold mb-6">Privacy Settings</h1>

        <!-- Profile Visibility -->
        <div class="card mb-6">
            <div class="card-body gap-4">
                <h2 class="text-sm font-semibold text-base-content/70">Profile Visibility</h2>

                <div class="form-control">
                    <label class="label cursor-pointer justify-start gap-4">
                        <input
                            v-model="privacy.profileVisible"
                            type="checkbox"
                            class="checkbox checkbox-primary"
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
                            class="checkbox checkbox-primary"
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
                            class="checkbox checkbox-primary"
                        >
                        <div>
                            <span class="label-text font-medium">Show Birthday</span>
                            <p class="text-sm text-base-content/60">Display your birthday on your profile</p>
                        </div>
                    </label>
                </div>
            </div>
        </div>

        <!-- Post Defaults -->
        <div class="card mb-6">
            <div class="card-body gap-4">
                <h2 class="text-sm font-semibold text-base-content/70">Post Defaults</h2>

                <div class="form-control">
                    <label class="label">
                        <span class="label-text">Default Visibility</span>
                    </label>
                    <select v-model="privacy.defaultVisibility" class="select select-bordered">
                        <option :value="0">Public</option>
                        <option :value="1">Friends Only</option>
                        <option :value="2">Unlisted</option>
                        <option :value="3">Private</option>
                    </select>
                </div>

                <div class="form-control">
                    <label class="label cursor-pointer justify-start gap-4">
                        <input
                            v-model="privacy.allowComments"
                            type="checkbox"
                            class="checkbox checkbox-primary"
                        >
                        <div>
                            <span class="label-text font-medium">Allow Comments</span>
                            <p class="text-sm text-base-content/60">Let others comment on your posts</p>
                        </div>
                    </label>
                </div>
            </div>
        </div>

        <!-- Blocking -->
        <div class="card">
            <div class="card-body gap-4">
                <h2 class="text-sm font-semibold text-base-content/70">Blocked Users</h2>

                <div v-if="blockedUsers.length === 0" class="text-center py-8 text-base-content/60">
                    <IconBan class="w-8 h-8 mx-auto mb-2" />
                    <p>No blocked users</p>
                </div>

                <div v-else class="space-y-2">
                    <div
                        v-for="user in blockedUsers"
                        :key="user.id"
                        class="flex items-center justify-between p-3 bg-base-200 rounded-xl"
                    >
                        <div class="flex items-center gap-3">
                            <div class="avatar">
                                <div class="w-10 h-10 rounded-full">
                                    <img v-if="user.profile.picture" :src="getFileUrl(user.profile.picture.id)!" :alt="user.name" >
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
                            Unblock
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div class="mt-6">
            <button
                class="btn btn-primary"
                :disabled="isSaving"
                @click="savePrivacy"
            >
                <IconLoader v-if="isSaving" class="w-4 h-4 animate-spin" />
                <IconCheck v-else class="w-4 h-4" />
                Save Privacy Settings
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { IconBan, IconLoader, IconCheck } from "#components";
import type { SnAccount } from '~/types/auth';

const isSaving = ref(false);

const privacy = reactive({
    profileVisible: true,
    showEmail: false,
    showBirthday: true,
    defaultVisibility: 0,
    allowComments: true,
});

const blockedUsers = ref<SnAccount[]>([
    // TODO: Fetch from API
]);

async function unblock(userId: string) {
    // TODO: Implement API
    blockedUsers.value = blockedUsers.value.filter((u) => u.id !== userId);
}

async function savePrivacy() {
    isSaving.value = true;
    try {
        // TODO: Implement API
        await new Promise((r) => setTimeout(r, 1000));
        alert("Privacy settings saved");
    } finally {
        isSaving.value = false;
    }
}

useHead({
    title: "Privacy Settings",
});
</script>
