<template>
    <div class="max-w-3xl mx-auto space-y-6 min-w-0">
        <h1 class="text-2xl font-bold mb-6 max-lg:px-4">Notification Settings</h1>

        <!-- Push Notifications -->
        <div class="card bg-base-100 shadow-sm">
            <div class="card-body">
                <h2 class="card-title text-lg mb-4">Push Notifications</h2>

                <div class="form-control">
                    <label class="label cursor-pointer justify-start gap-4">
                        <input
                            v-model="notifications.push"
                            type="checkbox"
                            class="toggle toggle-primary"
                        >
                        <div>
                            <span class="label-text font-medium">Enable Push Notifications</span>
                            <p class="text-sm text-base-content/60">Receive notifications in your browser</p>
                        </div>
                    </label>
                </div>
            </div>
        </div>

        <!-- Email Notifications -->
        <div class="card bg-base-100 shadow-sm">
            <div class="card-body">
                <h2 class="card-title text-lg mb-4">Email Notifications</h2>

                <div class="space-y-2">
                    <div class="form-control">
                        <label class="label cursor-pointer justify-start gap-4">
                            <input
                                v-model="notifications.email.mentions"
                                type="checkbox"
                                class="checkbox checkbox-primary"
                            >
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
                            >
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
                            >
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
                            >
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
                            >
                            <div>
                                <span class="label-text font-medium">Direct Messages</span>
                                <p class="text-sm text-base-content/60">When you receive a direct message</p>
                            </div>
                        </label>
                    </div>
                </div>
            </div>
        </div>

        <!-- In-App Notifications -->
        <div class="card bg-base-100 shadow-sm">
            <div class="card-body">
                <h2 class="card-title text-lg mb-4">In-App Notifications</h2>

                <div class="space-y-2">
                    <div class="form-control">
                        <label class="label cursor-pointer justify-start gap-4">
                            <input
                                v-model="notifications.inApp.mentions"
                                type="checkbox"
                                class="checkbox checkbox-primary"
                            >
                            <div>
                                <span class="label-text font-medium">Mentions</span>
                            </div>
                        </label>
                    </div>

                    <div class="form-control">
                        <label class="label cursor-pointer justify-start gap-4">
                            <input
                                v-model="notifications.inApp.replies"
                                type="checkbox"
                                class="checkbox checkbox-primary"
                            >
                            <div>
                                <span class="label-text font-medium">Replies</span>
                            </div>
                        </label>
                    </div>

                    <div class="form-control">
                        <label class="label cursor-pointer justify-start gap-4">
                            <input
                                v-model="notifications.inApp.likes"
                                type="checkbox"
                                class="checkbox checkbox-primary"
                            >
                            <div>
                                <span class="label-text font-medium">Likes</span>
                            </div>
                        </label>
                    </div>

                    <div class="form-control">
                        <label class="label cursor-pointer justify-start gap-4">
                            <input
                                v-model="notifications.inApp.follows"
                                type="checkbox"
                                class="checkbox checkbox-primary"
                            >
                            <div>
                                <span class="label-text font-medium">Follows</span>
                            </div>
                        </label>
                    </div>

                    <div class="form-control">
                        <label class="label cursor-pointer justify-start gap-4">
                            <input
                                v-model="notifications.inApp.messages"
                                type="checkbox"
                                class="checkbox checkbox-primary"
                            >
                            <div>
                                <span class="label-text font-medium">Messages</span>
                            </div>
                        </label>
                    </div>

                    <div class="form-control">
                        <label class="label cursor-pointer justify-start gap-4">
                            <input
                                v-model="notifications.inApp.realmActivity"
                                type="checkbox"
                                class="checkbox checkbox-primary"
                            >
                            <div>
                                <span class="label-text font-medium">Realm Activity</span>
                            </div>
                        </label>
                    </div>
                </div>
            </div>
        </div>

        <!-- Digest -->
        <div class="card bg-base-100 shadow-sm">
            <div class="card-body">
                <h2 class="card-title text-lg mb-4">Email Digest</h2>

                <fieldset class="fieldset">
                    <legend class="fieldset-legend">Digest Frequency</legend>
                    <select v-model="notifications.digestFrequency" class="select select-bordered w-full">
                        <option value="never">Never</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                    </select>
                </fieldset>
            </div>
        </div>

        <!-- Notification Topics -->
        <div class="card bg-base-100 shadow-sm">
            <div class="card-body">
                <div class="flex items-center justify-between mb-4">
                    <h2 class="card-title text-lg">Notification Topics</h2>
                    <button class="btn btn-sm btn-primary" @click="showAddTopic = true">
                        <IconPlus class="w-4 h-4" />
                        Add Custom
                    </button>
                </div>

                <div v-if="pending" class="flex justify-center py-8">
                    <span class="loading loading-spinner loading-lg" />
                </div>

                <div v-else-if="topics.length === 0" class="text-center py-8 text-base-content/60">
                    <IconBell class="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No notification topics configured</p>
                </div>

                <div v-else class="space-y-3">
                    <div
                        v-for="topic in topics"
                        :key="topic.topic"
                        class="flex items-center justify-between p-4 bg-base-200 rounded-xl"
                    >
                        <div>
                            <p class="font-medium">{{ topic.description }}</p>
                            <p class="text-sm text-base-content/60">{{ topic.topic }}</p>
                        </div>
                        <select
                            v-model="topicPreferences[topic.topic]"
                            class="select select-bordered select-sm"
                            @change="updateTopicPreference(topic.topic, $event.target?.value)"
                        >
                            <option value="normal">Normal</option>
                            <option value="silent">Silent</option>
                            <option value="reject">Off</option>
                        </select>
                    </div>
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
                <IconSave v-else class="w-4 h-4" />
                Save Preferences
            </button>
        </div>

        <!-- Add Custom Topic Modal -->
        <dialog class="modal" :class="{ 'modal-open': showAddTopic }">
            <div class="modal-box max-w-md">
                <h3 class="font-bold text-lg mb-4">Add Custom Topic</h3>

                <fieldset class="fieldset mb-4">
                    <legend class="fieldset-legend">Topic</legend>
                    <input
                        v-model="newTopic.topic"
                        type="text"
                        class="input input-bordered w-full"
                        placeholder="e.g. custom.topic.name"
                    >
                </fieldset>

                <fieldset class="fieldset mb-4">
                    <legend class="fieldset-legend">Description</legend>
                    <input
                        v-model="newTopic.description"
                        type="text"
                        class="input input-bordered w-full"
                        placeholder="Description for this topic"
                    >
                </fieldset>

                <div class="modal-action">
                    <button class="btn btn-ghost" @click="showAddTopic = false">Cancel</button>
                    <button
                        class="btn btn-primary"
                        :disabled="!newTopic.topic || !newTopic.description || isAddingTopic"
                        @click="addCustomTopic"
                    >
                        <IconLoader v-if="isAddingTopic" class="w-4 h-4 animate-spin" />
                        Add Topic
                    </button>
                </div>
            </div>
            <div class="modal-backdrop" @click="showAddTopic = false" />
        </dialog>
    </div>
</template>

<script setup lang="ts">
import { IconLoader, IconSave, IconBell, IconPlus } from "#components";

const isSaving = ref(false);
const isAddingTopic = ref(false);
const showAddTopic = ref(false);
const pending = ref(false);

const notifications = reactive({
    push: false,
    email: {
        mentions: true,
        replies: true,
        likes: false,
        follows: true,
        messages: true,
    },
    inApp: {
        mentions: true,
        replies: true,
        likes: true,
        follows: true,
        messages: true,
        realmActivity: true,
    },
    digestFrequency: "weekly",
});

interface NotificationTopic {
    topic: string;
    description: string;
}

const topics = ref<NotificationTopic[]>([]);
const topicPreferences = ref<Record<string, string>>({});

const newTopic = reactive({
    topic: "",
    description: "",
});

// TODO: Fetch notification topics and preferences from API
async function fetchNotificationTopics() {
    pending.value = true;
    try {
        // topics.value = await fetchNotificationTopics();
        // topicPreferences.value = await fetchNotificationPreferences();
    } finally {
        pending.value = false;
    }
}

async function updateTopicPreference(topic: string, preference: string) {
    try {
        // await setNotificationPreference(topic, preference);
        topicPreferences.value[topic] = preference;
    } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to update preference");
    }
}

async function addCustomTopic() {
    isAddingTopic.value = true;
    try {
        // await createCustomTopic(newTopic.topic, newTopic.description);
        topics.value.push({ ...newTopic });
        newTopic.topic = "";
        newTopic.description = "";
        showAddTopic.value = false;
        alert("Topic added successfully");
    } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to add topic");
    } finally {
        isAddingTopic.value = false;
    }
}

async function saveNotifications() {
    isSaving.value = true;
    try {
        // TODO: Implement API
        await new Promise(r => setTimeout(r, 1000));
        alert("Notification preferences saved");
    } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to save preferences");
    } finally {
        isSaving.value = false;
    }
}

onMounted(() => {
    fetchNotificationTopics();
});

useHead({
    title: "Notification Settings",
});
</script>
