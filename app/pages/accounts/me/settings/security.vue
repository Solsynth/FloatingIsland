<template>
    <div class="max-w-2xl mx-auto">
        <h1 class="text-2xl font-bold mb-6">Security Settings</h1>

        <!-- Password -->
        <div class="card mb-6">
            <div class="card-body gap-4">
                <h2 class="text-sm font-semibold text-base-content/70">Change Password</h2>

                <div class="form-control">
                    <label class="label">
                        <span class="label-text">Current Password</span>
                    </label>
                    <input
                        v-model="passwordForm.current"
                        type="password"
                        class="input input-bordered"
                        placeholder="Enter current password"
                    >
                </div>

                <div class="form-control">
                    <label class="label">
                        <span class="label-text">New Password</span>
                    </label>
                    <input
                        v-model="passwordForm.new"
                        type="password"
                        class="input input-bordered"
                        placeholder="Enter new password"
                    >
                </div>

                <div class="form-control">
                    <label class="label">
                        <span class="label-text">Confirm New Password</span>
                    </label>
                    <input
                        v-model="passwordForm.confirm"
                        type="password"
                        class="input input-bordered"
                        placeholder="Confirm new password"
                    >
                </div>

                <button
                    class="btn btn-primary w-fit"
                    :disabled="isChangingPassword"
                    @click="changePassword"
                >
                    <IconLoader v-if="isChangingPassword" class="w-4 h-4 animate-spin" />
                    <IconKey v-else class="w-4 h-4" />
                    Update Password
                </button>
            </div>
        </div>

        <!-- Two Factor -->
        <div class="card mb-6">
            <div class="card-body gap-4">
                <h2 class="text-sm font-semibold text-base-content/70">Two-Factor Authentication</h2>

                <div class="flex items-center justify-between">
                    <div>
                        <p class="font-medium">Authenticator App</p>
                        <p class="text-sm text-base-content/60">Use an authenticator app to generate codes</p>
                    </div>
                    <button
                        class="btn btn-primary"
                        :disabled="isEnabling2FA"
                        @click="enable2FA"
                    >
                        <IconLoader v-if="isEnabling2FA" class="w-4 h-4 animate-spin" />
                        <IconShield v-else class="w-4 h-4" />
                        Enable
                    </button>
                </div>
            </div>
        </div>

        <!-- Sessions -->
        <div class="card">
            <div class="card-body gap-4">
                <h2 class="text-sm font-semibold text-base-content/70">Active Sessions</h2>

                <div class="space-y-3">
                    <div class="flex items-center justify-between p-3 bg-base-200 rounded-xl">
                        <div class="flex items-center gap-3">
                            <IconLaptop class="w-5 h-5 text-base-content/60" />
                            <div>
                                <p class="font-medium">Current Session</p>
                                <p class="text-xs text-base-content/60">Chrome on macOS · {{ formatDate(new Date().toISOString()) }}</p>
                            </div>
                        </div>
                        <span class="badge badge-success badge-sm">Active</span>
                    </div>
                </div>

                <button class="btn btn-error btn-outline w-fit" @click="logoutAll">
                    <IconLogOut class="w-4 h-4" />
                    Logout All Sessions
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import {
    IconLoader,
    IconKey,
    IconShield,
    IconLaptop,
    IconLogOut,
} from "#components";

const isChangingPassword = ref(false);
const isEnabling2FA = ref(false);

const passwordForm = reactive({
    current: "",
    new: "",
    confirm: "",
});

async function changePassword() {
    if (passwordForm.new !== passwordForm.confirm) {
        alert("Passwords do not match");
        return;
    }
    isChangingPassword.value = true;
    try {
        // TODO: Implement API
        await new Promise((r) => setTimeout(r, 1000));
        alert("Password updated successfully");
        passwordForm.current = "";
        passwordForm.new = "";
        passwordForm.confirm = "";
    } finally {
        isChangingPassword.value = false;
    }
}

async function enable2FA() {
    isEnabling2FA.value = true;
    try {
        // TODO: Implement 2FA setup
        await new Promise((r) => setTimeout(r, 1000));
        alert("2FA setup coming soon");
    } finally {
        isEnabling2FA.value = false;
    }
}

async function logoutAll() {
    if (!confirm("Logout from all devices?")) return;
    // TODO: Implement API
    alert("All sessions logged out");
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

useHead({
    title: "Security Settings",
});
</script>
