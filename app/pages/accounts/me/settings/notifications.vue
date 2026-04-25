<template>
    <div class="max-w-2xl mx-auto">
        <h1 class="text-2xl font-bold mb-6">Notification Settings</h1>

        <!-- Push Notifications -->
        <div class="card mb-6">
            <div class="card-body gap-4">
                <h2 class="text-sm font-semibold text-base-content/70">Push Notifications</h2>

                <div class="form-control">
                    <label class="label cursor-pointer justify-start gap-4">
                        <input
                            v-model="notifications.push"
                            type="checkbox"
                            class="toggle toggle-primary"
                        />
                        <div>
                            <span class="label-text font-medium">Enable Push Notifications</span>
                            <p class="text-sm text-base-content/60">Receive notifications in your browser</p>
                        </div>
                    </label>
                </div>
            </div>
        </div>

        <!-- Email Notifications -->
        <div class="card mb-6">
            <div class="card-body gap-4">
                <h2 class="text-sm font-semibold text-base-content/70">Email Notifications</h2>

                <div class="form-control">
                    <label class="label cursor-pointer justify-start gap-4">
                        <input
                            v-model="notifications.email.mentions"
                            type="checkbox"
                            class="checkbox checkbox-primary"
                        />
                        <div>
                            <span class="label-text font-medium">Mentions</span>
                            <p class="text-sm text-base-content/60">When someone mentions you in a post</p>
                        </div>
                    </label>
                </div>

                <div class="form-control">
                    <label class="label cursor-pointer justify-start gap-4">
                        <input
                            v-model="notifications.email.replies"
                            type="checkbox"
                            class="checkbox checkbox-primary"
                        />
                        <div>
                            <span class="label-text font-medium">Replies</span>
                            <p class="text-sm text-base-content/60">When someone replies to your posts</p>
                        </div>
                    </label>
                </div>

                <div class="form-control">
                    <label class="label cursor-pointer justify-start gap-4">
                        <input
                            v-model="notifications.email.likes"
                            type="checkbox"
                            class="checkbox checkbox-primary"
                        />
                        <div>
                            <span class="label-text font-medium">Likes</span>
                            <p class="text-sm text-base-content/60">When someone likes your posts</p>
                        </div>
                    </label>
                </div>

                <div class="form-control">
                    <label class="label cursor-pointer justify-start gap-4">
                        <input
                            v-model="notifications.email.follows"
                            type="checkbox"
                            class="checkbox checkbox-primary"
                        />
                        <div>
                            <span class="label-text font-medium">New Followers</span>
                            <p class="text-sm text-base-content/60">When someone follows you</p>
                        </div>
                    </label>
                </div>

                <div class="form-control">
                    <label class="label cursor-pointer justify-start gap-4">
                        <input
                            v-model="notifications.email.messages"
                            type="checkbox"
                            class="checkbox checkbox-primary"
                        />
                        <div>
                            <span class="label-text font-medium">Direct Messages</span>
                            <p class="text-sm text-base-content/60">When you receive a direct message</p>
                        </div>
                    </label>
                </div>
            </div>
        </div>

        <!-- Digest -->
        <div class="card mb-6">
            <div class="card-body gap-4">
                <h2 class="text-sm font-semibold text-base-content/70">Email Digest</h2>

                <div class="form-control">
                    <label class="label">
                        <span class="label-text">Digest Frequency</span>
                    </label>
                    <select v-model="notifications.digestFrequency" class="select select-bordered">
                        <option value="never">Never</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                    </select>
                </div>
            </div>
        </div>

        <div class="flex gap-2">
            <button
                class="btn btn-primary"
                :disabled="isSaving"
                @click="saveNotifications"
            >
                <IconLoader v-if="isSaving" class="w-4 h-4 animate-spin" />
                <IconCheck v-else class="w-4 h-4" />
                Save Preferences
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { IconLoader, IconCheck } from "#components";

const isSaving = ref(false);

const notifications = reactive({
    push: false,
    email: {
        mentions: true,
        replies: true,
        likes: false,
        follows: true,
        messages: true,
    },
    digestFrequency: "weekly",
});

async function saveNotifications() {
    isSaving.value = true;
    try {
        // TODO: Implement API
        await new Promise((r) => setTimeout(r, 1000));
        alert("Notification preferences saved");
    } finally {
        isSaving.value = false;
    }
}

useHead({
    title: "Notification Settings",
});
</script>
