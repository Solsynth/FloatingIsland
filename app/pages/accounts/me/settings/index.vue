<template>
    <div class="max-w-2xl mx-auto">
        <h1 class="text-2xl font-bold mb-6">Profile Settings</h1>

        <!-- Profile Header Preview -->
        <div class="card mb-6">
            <div class="card-body">
                <h2 class="text-sm font-semibold text-base-content/70 mb-4">Profile Preview</h2>
                <div class="flex items-center gap-4">
                    <div class="avatar">
                        <div class="w-16 h-16 rounded-full">
                            <img v-if="avatarUrl" :src="avatarUrl" :alt="displayName" >
                            <div v-else class="bg-primary text-primary-content flex items-center justify-center w-full h-full text-xl font-bold">
                                {{ getInitials(displayName) }}
                            </div>
                        </div>
                    </div>
                    <div>
                        <h3 class="font-semibold">{{ displayName }}</h3>
                        <p class="text-sm text-base-content/60">@{{ user?.name }}</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Edit Profile Form -->
        <div class="card">
            <div class="card-body gap-4">
                <h2 class="text-sm font-semibold text-base-content/70 mb-2">Edit Profile</h2>

                <div class="form-control">
                    <label class="label">
                        <span class="label-text">Display Name</span>
                    </label>
                    <input
                        v-model="form.nick"
                        type="text"
                        class="input input-bordered"
                        placeholder="Your display name"
                    >
                </div>

                <div class="form-control">
                    <label class="label">
                        <span class="label-text">Bio</span>
                    </label>
                    <textarea
                        v-model="form.bio"
                        class="textarea textarea-bordered h-32"
                        placeholder="Tell us about yourself..."
                    />
                </div>

                <div class="form-control">
                    <label class="label">
                        <span class="label-text">Location</span>
                    </label>
                    <input
                        v-model="form.location"
                        type="text"
                        class="input input-bordered"
                        placeholder="City, Country"
                    >
                </div>

                <div class="form-control">
                    <label class="label">
                        <span class="label-text">Website</span>
                    </label>
                    <input
                        v-model="form.website"
                        type="url"
                        class="input input-bordered"
                        placeholder="https://example.com"
                    >
                </div>

                <div class="form-control">
                    <label class="label">
                        <span class="label-text">Birthday</span>
                    </label>
                    <input
                        v-model="form.birthday"
                        type="date"
                        class="input input-bordered"
                    >
                </div>

                <div class="form-control">
                    <label class="label">
                        <span class="label-text">Gender</span>
                    </label>
                    <select v-model="form.gender" class="select select-bordered">
                        <option value="">Prefer not to say</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Non-binary">Non-binary</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                <div class="form-control">
                    <label class="label">
                        <span class="label-text">Pronouns</span>
                    </label>
                    <input
                        v-model="form.pronouns"
                        type="text"
                        class="input input-bordered"
                        placeholder="e.g. they/them"
                    >
                </div>

                <div class="form-control">
                    <label class="label">
                        <span class="label-text">Time Zone</span>
                    </label>
                    <select v-model="form.timeZone" class="select select-bordered">
                        <option value="">Select timezone</option>
                        <option v-for="tz in timezones" :key="tz" :value="tz">{{ tz }}</option>
                    </select>
                </div>

                <div class="divider" />

                <div class="flex gap-2">
                    <button
                        class="btn btn-primary"
                        :disabled="isSaving"
                        @click="saveProfile"
                    >
                        <IconLoader v-if="isSaving" class="w-4 h-4 animate-spin" />
                        <IconCheck v-else class="w-4 h-4" />
                        Save Changes
                    </button>
                    <button class="btn btn-ghost" @click="resetForm">Reset</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { IconLoader, IconCheck } from "#components";
import { getFileUrl } from "~/utils/files";

const auth = useAuth();
const user = computed(() => auth.user);
const isSaving = ref(false);

const displayName = computed(() => user.value?.nick || user.value?.name || "Unknown");
const avatarUrl = computed(() => getFileUrl(user.value?.profile?.picture?.id));

const timezones = Intl.supportedValuesOf?.("timeZone") || [
    "UTC",
    "America/New_York",
    "America/Los_Angeles",
    "Europe/London",
    "Europe/Paris",
    "Asia/Tokyo",
    "Asia/Shanghai",
    "Australia/Sydney",
];

const form = reactive({
    nick: "",
    bio: "",
    location: "",
    website: "",
    birthday: "",
    gender: "",
    pronouns: "",
    timeZone: "",
});

function resetForm() {
    if (!user.value?.profile) return;
    form.nick = user.value.nick || "";
    form.bio = user.value.profile.bio || "";
    form.location = user.value.profile.location || "";
    form.website = "";
    form.birthday = user.value.profile.birthday?.split("T")[0] || "";
    form.gender = user.value.profile.gender || "";
    form.pronouns = user.value.profile.pronouns || "";
    form.timeZone = user.value.profile.timeZone || "";
}

async function saveProfile() {
    isSaving.value = true;
    try {
        // TODO: Implement API call
        await new Promise((r) => setTimeout(r, 1000));
        // Reload user data
        await auth.refreshUser();
    } finally {
        isSaving.value = false;
    }
}

function getInitials(name: string): string {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .map((p) => p[0]?.toUpperCase())
        .slice(0, 2)
        .join("") || "?";
}

onMounted(() => {
    resetForm();
});

useHead({
    title: "Profile Settings",
});
</script>
