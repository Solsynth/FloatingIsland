<template>
    <div class="max-w-3xl mx-auto space-y-6 min-w-0">
        <h1 class="text-2xl font-bold mb-6 max-lg:px-4">Security Settings</h1>

        <!-- Password -->
        <div class="card bg-base-100 shadow-sm">
            <div class="card-body">
                <h2 class="card-title text-lg mb-4">Change Password</h2>

                <div class="space-y-4">
                    <fieldset class="fieldset">
                        <legend class="fieldset-legend">Current Password</legend>
                        <input
                            v-model="passwordForm.current"
                            type="password"
                            class="input input-bordered w-full"
                            placeholder="Enter current password"
                        >
                    </fieldset>

                    <fieldset class="fieldset">
                        <legend class="fieldset-legend">New Password</legend>
                        <input
                            v-model="passwordForm.new"
                            type="password"
                            class="input input-bordered w-full"
                            placeholder="Enter new password"
                        >
                    </fieldset>

                    <fieldset class="fieldset">
                        <legend class="fieldset-legend">Confirm New Password</legend>
                        <input
                            v-model="passwordForm.confirm"
                            type="password"
                            class="input input-bordered w-full"
                            placeholder="Confirm new password"
                        >
                    </fieldset>

                    <div class="flex justify-end">
                        <button
                            class="btn btn-primary"
                            :disabled="isChangingPassword || !canChangePassword"
                            @click="changePassword"
                        >
                            <IconLoader v-if="isChangingPassword" class="w-4 h-4 animate-spin" />
                            <IconKey v-else class="w-4 h-4" />
                            Update Password
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Auth Factors -->
        <div class="card bg-base-100 shadow-sm">
            <div class="card-body">
                <div class="flex items-center justify-between mb-4">
                    <h2 class="card-title text-lg">Two-Factor Authentication</h2>
                    <button class="btn btn-sm btn-primary" @click="showAddFactor = true">
                        <IconPlus class="w-4 h-4" />
                        Add Factor
                    </button>
                </div>

                <div v-if="factorsPending" class="flex justify-center py-8">
                    <span class="loading loading-spinner loading-lg" />
                </div>

                <div v-else-if="factorsError" class="alert alert-error">
                    <IconAlertCircle class="w-5 h-5" />
                    <span>Failed to load auth factors</span>
                    <button class="btn btn-sm" @click="() => refreshFactors()">
                        Retry
                    </button>
                </div>

                <div v-else-if="factors.length === 0" class="text-center py-8 text-base-content/60">
                    <IconShield class="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No authentication factors set up yet.</p>
                    <p class="text-sm">Add a factor to improve your account security.</p>
                </div>

                <div v-else class="space-y-3">
                    <div
                        v-for="factor in factors"
                        :key="factor.id"
                        class="flex items-center justify-between p-4 bg-base-200 rounded-xl"
                    >
                        <div class="flex items-center gap-3">
                            <div
                                class="w-10 h-10 rounded-lg flex items-center justify-center"
                                :class="factor.enabledAt ? 'bg-primary text-primary-content' : 'bg-base-300 text-base-content/50'"
                            >
                                <component
                                    :is="getFactorIcon(factor.type)"
                                    class="w-5 h-5"
                                />
                            </div>
                            <div>
                                <p class="font-medium">{{ getFactorLabel(factor.type) }}</p>
                                <p class="text-sm text-base-content/60">
                                    {{ factor.enabledAt ? 'Enabled' : 'Disabled' }}
                                </p>
                            </div>
                        </div>
                        <div class="flex items-center gap-2">
                            <button
                                v-if="factor.enabledAt"
                                class="btn btn-sm btn-ghost"
                                :disabled="isProcessing === factor.id"
                                @click="disableFactor(factor)"
                            >
                                <IconLoader v-if="isProcessing === factor.id" class="w-4 h-4 animate-spin" />
                                <IconX v-else class="w-4 h-4" />
                                Disable
                            </button>
                            <button
                                v-else
                                class="btn btn-sm btn-primary"
                                :disabled="isProcessing === factor.id"
                                @click="enableFactor(factor)"
                            >
                                <IconLoader v-if="isProcessing === factor.id" class="w-4 h-4 animate-spin" />
                                <IconCheck v-else class="w-4 h-4" />
                                Enable
                            </button>
                            <button
                                class="btn btn-sm btn-ghost text-error"
                                :disabled="isProcessing === factor.id"
                                @click="deleteFactor(factor)"
                            >
                                <IconTrash class="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Recovery Codes -->
        <div class="card bg-base-100 shadow-sm">
            <div class="card-body">
                <h2 class="card-title text-lg mb-4">Recovery Codes</h2>
                <p class="text-base-content/70 mb-4">
                    Recovery codes allow you to regain access to your account if you lose access to your authentication factors.
                </p>

                <div class="flex gap-2">
                    <button
                        v-if="!hasRecoveryCode"
                        class="btn btn-primary"
                        :disabled="isCreatingRecovery"
                        @click="createRecoveryCode"
                    >
                        <IconLoader v-if="isCreatingRecovery" class="w-4 h-4 animate-spin" />
                        <IconKeyRound v-else class="w-4 h-4" />
                        Generate Recovery Codes
                    </button>
                    <div v-else class="flex items-center gap-2 text-success">
                        <IconCheck class="w-5 h-5" />
                        <span>Recovery codes are set up</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Auth Devices & Sessions -->
        <div class="card bg-base-100 shadow-sm">
            <div class="card-body">
                <div class="flex items-center justify-between mb-4">
                    <h2 class="card-title text-lg">Active Sessions</h2>
                    <button
                        v-if="hasOtherSessions"
                        class="btn btn-sm btn-error btn-outline"
                        :disabled="isLoggingOutAll"
                        @click="logoutAllOtherSessions"
                    >
                        <IconLoader v-if="isLoggingOutAll" class="w-4 h-4 animate-spin" />
                        <IconLogOut v-else class="w-4 h-4" />
                        Logout All Others
                    </button>
                </div>

                <!-- Tabs -->
                <div class="tabs tabs-bordered mb-4">
                    <button
                        class="tab"
                        :class="{ 'tab-active': activeTab === 'devices' }"
                        @click="activeTab = 'devices'"
                    >
                        <IconSmartphone class="w-4 h-4 mr-1" />
                        Devices
                    </button>
                    <button
                        class="tab"
                        :class="{ 'tab-active': activeTab === 'sessions' }"
                        @click="activeTab = 'sessions'"
                    >
                        <IconKey class="w-4 h-4 mr-1" />
                        Sessions
                    </button>
                </div>

                <!-- Devices Tab -->
                <div v-if="activeTab === 'devices'">
                    <div v-if="devicesPending" class="flex justify-center py-8">
                        <span class="loading loading-spinner loading-lg" />
                    </div>

                    <div v-else-if="devicesError" class="alert alert-error">
                        <IconAlertCircle class="w-5 h-5" />
                        <span>Failed to load devices</span>
                        <button class="btn btn-sm" @click="() => refreshDevices()">
                            Retry
                        </button>
                    </div>

                    <div v-else-if="devices.length === 0" class="text-center py-8 text-base-content/60">
                        <IconSmartphone class="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No devices found</p>
                    </div>

                    <div v-else class="space-y-3">
                         <div
                             v-for="device in devices"
                             :key="device.deviceId"
                             class="p-4 bg-base-200 rounded-xl cursor-pointer hover:bg-base-300 transition-colors"
                             @click="showDeviceDetail(device)"
                         >
                             <div class="flex items-center gap-3">
                                 <div class="w-10 h-10 rounded-lg bg-primary text-primary-content flex items-center justify-center">
                                     <component :is="getPlatformIcon(device.platform)" class="w-5 h-5" />
                                 </div>
                                 <div class="flex-1 min-w-0">
                                     <div class="flex items-center gap-2">
                                         <p class="font-medium truncate">
                                             {{ device.deviceLabel || device.deviceName }}
                                         </p>
                                         <span v-if="device.isCurrent" class="badge badge-primary badge-sm">Current</span>
                                         <span v-if="device.sessions?.length" class="badge badge-secondary badge-sm">
                                             <IconKey class="w-3 h-3 mr-1" />
                                             {{ device.sessions.length }}
                                         </span>
                                     </div>
                                    <p class="text-sm text-base-content/60">
                                        {{ getPlatformLabel(device.platform) }}
                                        <span v-if="device.sessions?.length">
                                            · Last active {{ formatDate(device.sessions[0]!.createdAt) }}
                                        </span>
                                    </p>
                                 </div>
                                 <IconChevronRight class="w-5 h-5 text-base-content/40" />
                             </div>
                         </div>
                     </div>
                </div>

                <!-- Sessions Tab -->
                <div v-if="activeTab === 'sessions'">
                    <!-- Session Type Filter -->
                    <div class="flex flex-wrap gap-2 mb-4">
                        <button
                            class="btn btn-xs"
                            :class="sessionTypeFilter === null ? 'btn-primary' : 'btn-ghost'"
                            @click="sessionTypeFilter = null"
                        >
                            All
                        </button>
                        <button
                            v-for="(info, type) in SESSION_TYPES"
                            :key="type"
                            class="btn btn-xs"
                            :class="sessionTypeFilter === Number(type) ? 'btn-primary' : 'btn-ghost'"
                            @click="sessionTypeFilter = Number(type)"
                        >
                            {{ info.label }}
                        </button>
                    </div>

                    <div v-if="sessionsPending" class="flex justify-center py-8">
                        <span class="loading loading-spinner loading-lg" />
                    </div>

                    <div v-else-if="sessionsError" class="alert alert-error">
                        <IconAlertCircle class="w-5 h-5" />
                        <span>Failed to load sessions</span>
                        <button class="btn btn-sm" @click="() => refreshSessions()">
                            Retry
                        </button>
                    </div>

                    <div v-else-if="filteredSessions.length === 0" class="text-center py-8 text-base-content/60">
                        <IconKey class="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No sessions found</p>
                    </div>

                    <div v-else class="space-y-3">
                        <div
                            v-for="session in filteredSessions"
                            :key="session.id"
                            class="p-4 bg-base-200 rounded-xl"
                        >
                            <div class="flex items-start gap-3">
                                <div
                                    class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                                    :class="session.isCurrent ? 'bg-primary text-primary-content' : 'bg-base-300 text-base-content/50'"
                                >
                                    <component :is="getSessionTypeIcon(session.type)" class="w-5 h-5" />
                                </div>
                                <div class="flex-1 min-w-0">
                                    <div class="flex items-center gap-2 flex-wrap">
                                        <p class="font-medium">
                                            {{ session.label || session.userAgent || 'Unknown' }}
                                        </p>
                                        <span v-if="session.isCurrent" class="badge badge-primary badge-sm">Current</span>
                                        <span v-if="session.childrenCount" class="badge badge-secondary badge-sm">
                                            {{ session.childrenCount }} children
                                        </span>
                                    </div>
                                    <div class="text-sm text-base-content/60 mt-1 space-y-1">
                                        <p>Created: {{ formatDate(session.createdAt) }}</p>
                                        <p>Last active: {{ formatDate(session.lastGrantedAt) }}</p>
                                        <p v-if="session.location?.city">
                                            <IconMapPin class="w-3 h-3 inline mr-1" />
                                            {{ session.location.city }}
                                        </p>
                                        <p v-if="session.ipAddress">
                                            <IconGlobe class="w-3 h-3 inline mr-1" />
                                            {{ session.ipAddress }}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    v-if="!session.isCurrent"
                                    class="btn btn-sm btn-ghost text-error"
                                    :disabled="isProcessing === session.id"
                                    @click="logoutSession(session)"
                                >
                                    <IconLoader v-if="isProcessing === session.id" class="w-4 h-4 animate-spin" />
                                    <IconLogOut v-else class="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Add Factor Modal -->
    <dialog class="modal" :class="{ 'modal-open': showAddFactor }">
        <div class="modal-box max-w-md">
            <h3 class="font-bold text-lg mb-4">Add Authentication Factor</h3>

            <div v-if="!hasRecoveryCode" class="alert alert-warning mb-4">
                <IconAlertTriangle class="w-5 h-5" />
                <span>Recovery code is required before adding other factors</span>
            </div>

            <fieldset class="fieldset mb-4">
                <legend class="fieldset-legend">Factor Type</legend>
                <select v-model="newFactorType" class="select select-bordered w-full">
                    <option value="">Select a factor type</option>
                    <option
                        v-for="(info, type) in availableFactorTypes"
                        :key="type"
                        :value="type"
                    >
                        {{ info.label }}
                    </option>
                </select>
            </fieldset>

            <fieldset v-if="newFactorType === '0'" class="fieldset mb-4">
                <legend class="fieldset-legend">Secret</legend>
                <input
                    v-model="newFactorSecret"
                    type="password"
                    class="input input-bordered w-full"
                    placeholder="Enter secret"
                >
            </fieldset>

            <fieldset v-if="newFactorType === '4'" class="fieldset mb-4">
                <legend class="fieldset-legend">PIN</legend>
                <input
                    v-model="newFactorPin"
                    type="password"
                    class="input input-bordered w-full"
                    placeholder="6-digit PIN"
                    maxlength="6"
                >
            </fieldset>

            <div v-if="newFactorType" class="text-sm text-base-content/70 mb-4">
                {{ availableFactorTypes[Number(newFactorType)]?.description }}
            </div>

            <div class="modal-action">
                <button class="btn btn-ghost" @click="showAddFactor = false">Cancel</button>
                <button
                    class="btn btn-primary"
                    :disabled="!canAddFactor || isAddingFactor"
                    @click="addFactor"
                >
                    <IconLoader v-if="isAddingFactor" class="w-4 h-4 animate-spin" />
                    Add Factor
                </button>
            </div>
        </div>
        <div class="modal-backdrop" @click="showAddFactor = false" />
    </dialog>

    <!-- Enable Factor Modal -->
    <dialog class="modal" :class="{ 'modal-open': showEnableFactor }">
        <div class="modal-box max-w-md">
            <h3 class="font-bold text-lg mb-4">Enable Factor</h3>
            <p class="text-base-content/70 mb-4">
                Enter the verification code to enable this authentication factor.
            </p>

            <fieldset class="fieldset mb-4">
                <legend class="fieldset-legend">Verification Code</legend>
                <input
                    v-model="verificationCode"
                    type="text"
                    class="input input-bordered w-full text-center text-2xl tracking-widest"
                    placeholder="000000"
                    maxlength="6"
                >
            </fieldset>

            <div class="modal-action">
                <button class="btn btn-ghost" @click="showEnableFactor = false">Cancel</button>
                <button
                    class="btn btn-primary"
                    :disabled="verificationCode.length < 6 || isEnabling"
                    @click="confirmEnableFactor"
                >
                    <IconLoader v-if="isEnabling" class="w-4 h-4 animate-spin" />
                    Enable
                </button>
            </div>
        </div>
        <div class="modal-backdrop" @click="showEnableFactor = false" />
    </dialog>

    <!-- Recovery Code Display Modal -->
    <dialog class="modal" :class="{ 'modal-open': showRecoveryCode }">
        <div class="modal-box max-w-md">
            <div class="text-center mb-6">
                <div class="w-16 h-16 bg-primary text-primary-content rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconKeyRound class="w-8 h-8" />
                </div>
                <h3 class="font-bold text-lg">Recovery Code Created</h3>
            </div>

            <p class="text-base-content/70 mb-4 text-center">
                Save this recovery code in a safe place. It will only be shown once.
            </p>

            <div
                v-if="recoveryCode"
                class="bg-base-200 p-4 rounded-lg mb-6"
            >
                <code class="text-lg font-mono block text-center break-all">{{ recoveryCode }}</code>
            </div>

            <div class="modal-action">
                <button class="btn btn-primary w-full" @click="showRecoveryCode = false">
                    <IconCheck class="w-4 h-4 mr-2" />
                    I Have Saved It
                </button>
            </div>
        </div>
    </dialog>

    <!-- Device Detail Modal -->
    <dialog class="modal" :class="{ 'modal-open': selectedDevice !== null }">
        <div v-if="selectedDevice" class="modal-box max-w-lg">
            <div class="flex items-center justify-between mb-4">
                <h3 class="font-bold text-lg">Device Details</h3>
                <button class="btn btn-sm btn-ghost" @click="selectedDevice = null">
                    <IconX class="w-4 h-4" />
                </button>
            </div>

            <div class="flex items-center gap-3 mb-6">
                <div class="w-12 h-12 rounded-xl bg-primary text-primary-content flex items-center justify-center">
                    <component :is="getPlatformIcon(selectedDevice.platform)" class="w-6 h-6" />
                </div>
                <div>
                    <p class="font-semibold">{{ selectedDevice.deviceLabel || selectedDevice.deviceName }}</p>
                    <p class="text-sm text-base-content/60">{{ getPlatformLabel(selectedDevice.platform) }}</p>
                </div>
                <span v-if="selectedDevice.isCurrent" class="badge badge-primary ml-auto">Current</span>
            </div>

            <!-- Device Info -->
            <div class="grid grid-cols-2 gap-3 mb-6">
                <div class="bg-base-200 p-3 rounded-lg">
                    <p class="text-xs text-base-content/60">Device ID</p>
                    <p class="font-mono text-sm truncate">{{ selectedDevice.deviceId.slice(0, 12) }}</p>
                </div>
                <div class="bg-base-200 p-3 rounded-lg">
                    <p class="text-xs text-base-content/60">Active Sessions</p>
                    <p class="font-semibold">{{ selectedDevice.sessions?.length ?? 0 }}</p>
                </div>
                <div class="bg-base-200 p-3 rounded-lg">
                    <p class="text-xs text-base-content/60">First Seen</p>
                    <p class="text-sm">{{ selectedDevice.sessions?.length ? formatDate(selectedDevice.sessions[0]!.createdAt) : '-' }}</p>
                </div>
                <div class="bg-base-200 p-3 rounded-lg">
                    <p class="text-xs text-base-content/60">Last Active</p>
                    <p class="text-sm">{{ selectedDevice.sessions?.length ? formatDate(selectedDevice.sessions[0]!.lastGrantedAt) : '-' }}</p>
                </div>
            </div>

            <!-- Sessions List -->
            <h4 class="font-semibold mb-3">Sessions</h4>
            <div v-if="selectedDevice.sessions?.length" class="space-y-2 max-h-60 overflow-y-auto">
                <div
                    v-for="session in selectedDevice.sessions"
                    :key="session.id"
                    class="p-3 bg-base-200 rounded-lg"
                >
                    <div class="flex items-center gap-2">
                        <component :is="getSessionTypeIcon(session.type)" class="w-4 h-4" />
                        <span class="font-medium text-sm">{{ session.label || session.userAgent || 'Unknown' }}</span>
                        <span v-if="session.isCurrent" class="badge badge-primary badge-sm">Current</span>
                    </div>
                    <div class="text-xs text-base-content/60 mt-1">
                        <p>Created: {{ formatDate(session.createdAt) }}</p>
                        <p v-if="session.location?.city">Location: {{ session.location.city }}</p>
                    </div>
                </div>
            </div>
            <div v-else class="text-center py-4 text-base-content/60">
                <p>No active sessions</p>
            </div>

            <!-- Actions -->
            <div class="modal-action">
                <button
                    v-if="!selectedDevice.isCurrent"
                    class="btn btn-error w-full"
                    :disabled="isProcessing === selectedDevice.deviceId"
                    @click="logoutDevice(selectedDevice)"
                >
                    <IconLoader v-if="isProcessing === selectedDevice.deviceId" class="w-4 h-4 animate-spin" />
                    <IconLogOut v-else class="w-4 h-4 mr-2" />
                    Logout Device
                </button>
            </div>
        </div>
        <div class="modal-backdrop" @click="selectedDevice = null" />
    </dialog>
</template>

<script setup lang="ts">
import {
    IconLoader,
    IconKey,
    IconShield,
    IconLogOut,
    IconCheck,
    IconX,
    IconTrash,
    IconPlus,
    IconAlertCircle,
    IconAlertTriangle,
    IconTimer,
    IconMail,
    IconBell,
    IconFingerprint,
    IconKeyRound,
    IconSmartphone,
    IconGlobe,
    IconLaptop,
    IconMonitor,
    IconTerminal,
    IconHelpCircle,
    IconChevronRight,
    IconMapPin,
} from "#components";
import {
    fetchAuthFactors,
    createAuthFactor,
    deleteAuthFactor as apiDeleteFactor,
    enableAuthFactor,
    disableAuthFactor,
    fetchAuthDevices,
    fetchAuthSessions,
    revokeDevice,
    revokeSession,
    revokeAllOtherSessions,
} from "~/utils/api";
import { FACTOR_TYPES, SESSION_TYPES, PLATFORM_TYPES, type SnAuthFactor, type SnAuthDevice, type SnAuthSession } from "~/types/auth";

const passwordForm = reactive({
    current: "",
    new: "",
    confirm: "",
});

const isChangingPassword = ref(false);
const isProcessing = ref<string | null>(null);
const isCreatingRecovery = ref(false);
const isAddingFactor = ref(false);
const isEnabling = ref(false);
const isLoggingOutAll = ref(false);
const showAddFactor = ref(false);
const showEnableFactor = ref(false);
const showRecoveryCode = ref(false);
const newFactorType = ref("");
const newFactorSecret = ref("");
const newFactorPin = ref("");
const verificationCode = ref("");
const selectedFactor = ref<SnAuthFactor | null>(null);
const recoveryCode = ref<string | null>(null);
const activeTab = ref<'devices' | 'sessions'>('devices');
const sessionTypeFilter = ref<number | null>(null);
const selectedDevice = ref<SnAuthDevice | null>(null);

// Fetch auth factors
const { data: factors, pending: factorsPending, error: factorsError, refresh: refreshFactors } = await useAsyncData(
    "auth-factors",
    () => fetchAuthFactors(),
    { 
        default: () => [],
        server: false,
    },
);

// Fetch auth devices
const { data: devices, pending: devicesPending, error: devicesError, refresh: refreshDevices } = await useAsyncData(
    "auth-devices",
    () => fetchAuthDevices(),
    { 
        default: () => [],
        server: false,
    },
);

// Fetch auth sessions
const { data: sessions, pending: sessionsPending, error: sessionsError, refresh: refreshSessions } = await useAsyncData(
    "auth-sessions",
    () => fetchAuthSessions(sessionTypeFilter.value ?? undefined),
    { 
        default: () => [], 
        watch: [sessionTypeFilter],
        server: false,
    },
);

const hasRecoveryCode = computed(() =>
    factors.value?.some(f => f.type === 5),
);

const canChangePassword = computed(() =>
    passwordForm.current && passwordForm.new && passwordForm.confirm && passwordForm.new === passwordForm.confirm,
);

const availableFactorTypes = computed(() => {
    const existingTypes = new Set(factors.value?.map(f => f.type) ?? []);
    const result: Record<number, { label: string; description: string; icon: string }> = {};
    for (const [type, info] of Object.entries(FACTOR_TYPES)) {
        const typeNum = Number(type);
        if (existingTypes.has(typeNum) && typeNum !== 5) continue;
        result[typeNum] = info;
    }
    return result;
});

const canAddFactor = computed(() => {
    if (!newFactorType.value) return false;
    const type = Number(newFactorType.value);
    if (type === 0 && !newFactorSecret.value) return false;
    if (type === 4 && newFactorPin.value.length !== 6) return false;
    return true;
});

const filteredSessions = computed(() => {
    const list = sessions.value;
    if (!list || !Array.isArray(list)) return [];
    if (sessionTypeFilter.value === null) return list;
    return list.filter(s => s.type === sessionTypeFilter.value);
});

const hasOtherSessions = computed(() => {
    const sess = sessions.value;
    const devs = devices.value;
    const hasOtherSess = Array.isArray(sess) && sess.some(s => !s.isCurrent);
    const hasOtherDevs = Array.isArray(devs) && devs.some(d => !d.isCurrent);
    return hasOtherSess || hasOtherDevs;
});

function getFactorIcon(type: number) {
    switch (type) {
        case 0: return IconKey;
        case 1: return IconMail;
        case 2: return IconBell;
        case 3: return IconTimer;
        case 4: return IconShield;
        case 5: return IconKeyRound;
        case 6: return IconFingerprint;
        case 7: return IconFingerprint;
        default: return IconKey;
    }
}

function getFactorLabel(type: number) {
    return FACTOR_TYPES[type]?.label || "Unknown";
}

function getPlatformIcon(platform: number) {
    switch (platform) {
        case 1: return IconGlobe;
        case 2: return IconSmartphone;
        case 3: return IconSmartphone;
        case 4: return IconLaptop;
        case 5: return IconMonitor;
        case 6: return IconTerminal;
        default: return IconHelpCircle;
    }
}

function getPlatformLabel(platform: number) {
    return PLATFORM_TYPES[platform]?.label || "Unknown";
}

function getSessionTypeIcon(type: number) {
    const iconName = SESSION_TYPES[type]?.icon || "key";
    switch (iconName) {
        case "key": return IconKey;
        case "link": return IconGlobe;
        case "user-circle": return IconSmartphone;
        case "code": return IconTerminal;
        default: return IconKey;
    }
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function showDeviceDetail(device: SnAuthDevice) {
    selectedDevice.value = device;
}

async function changePassword() {
    if (passwordForm.new !== passwordForm.confirm) {
        alert("Passwords do not match");
        return;
    }
    isChangingPassword.value = true;
    try {
        await new Promise(r => setTimeout(r, 1000));
        alert("Password updated successfully");
        passwordForm.current = "";
        passwordForm.new = "";
        passwordForm.confirm = "";
    } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to change password");
    } finally {
        isChangingPassword.value = false;
    }
}

async function addFactor() {
    isAddingFactor.value = true;
    try {
        const data: Record<string, string> = {};
        if (newFactorType.value === "0") {
            data.secret = newFactorSecret.value;
        } else if (newFactorType.value === "4") {
            data.secret = newFactorPin.value;
        }

        const factor = await createAuthFactor({
            type: Number(newFactorType.value),
            data,
        });

        if (factor.type === 5 && factor.createdResponse?.recovery_code) {
            recoveryCode.value = factor.createdResponse.recovery_code as string;
            showRecoveryCode.value = true;
        }

        alert("Factor created successfully");
        showAddFactor.value = false;
        newFactorType.value = "";
        newFactorSecret.value = "";
        newFactorPin.value = "";
        await refreshFactors();
    } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to create factor");
    } finally {
        isAddingFactor.value = false;
    }
}

async function enableFactor(factor: SnAuthFactor) {
    if (factor.type === 5) {
        isProcessing.value = factor.id;
        try {
            await enableAuthFactor(factor.id);
            alert("Factor enabled successfully");
            await refreshFactors();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to enable factor");
        } finally {
            isProcessing.value = null;
        }
        return;
    }

    selectedFactor.value = factor;
    verificationCode.value = "";
    showEnableFactor.value = true;
}

async function confirmEnableFactor() {
    if (!selectedFactor.value) return;

    isEnabling.value = true;
    try {
        await enableAuthFactor(selectedFactor.value.id, verificationCode.value);
        alert("Factor enabled successfully");
        showEnableFactor.value = false;
        await refreshFactors();
    } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to enable factor");
    } finally {
        isEnabling.value = false;
    }
}

async function disableFactor(factor: SnAuthFactor) {
    isProcessing.value = factor.id;
    try {
        await disableAuthFactor(factor.id);
        alert("Factor disabled successfully");
        await refreshFactors();
    } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to disable factor");
    } finally {
        isProcessing.value = null;
    }
}

async function deleteFactor(factor: SnAuthFactor) {
    if (!confirm("Are you sure you want to delete this factor?")) return;

    isProcessing.value = factor.id;
    try {
        await apiDeleteFactor(factor.id);
        alert("Factor deleted successfully");
        await refreshFactors();
    } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to delete factor");
    } finally {
        isProcessing.value = null;
    }
}

async function createRecoveryCode() {
    isCreatingRecovery.value = true;
    try {
        const factor = await createAuthFactor({ type: 5 });
        if (factor.createdResponse?.recovery_code) {
            recoveryCode.value = factor.createdResponse.recovery_code as string;
            showRecoveryCode.value = true;
        }
        alert("Recovery code created");
        await refreshFactors();
    } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to create recovery code");
    } finally {
        isCreatingRecovery.value = false;
    }
}

async function logoutDevice(device: SnAuthDevice) {
    if (!confirm(`Logout device "${device.deviceLabel || device.deviceName}"?`)) return;

    isProcessing.value = device.deviceId;
    try {
        await revokeDevice(device.deviceId);
        alert("Device logged out successfully");
        selectedDevice.value = null;
        await refreshDevices();
        await refreshSessions();
    } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to logout device");
    } finally {
        isProcessing.value = null;
    }
}

async function logoutSession(session: SnAuthSession) {
    if (!confirm("Logout this session?")) return;

    isProcessing.value = session.id;
    try {
        await revokeSession(session.id);
        alert("Session logged out successfully");
        await refreshSessions();
        await refreshDevices();
    } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to logout session");
    } finally {
        isProcessing.value = null;
    }
}

async function logoutAllOtherSessions() {
    if (!confirm("Logout from all other devices and sessions?")) return;

    isLoggingOutAll.value = true;
    try {
        await revokeAllOtherSessions();
        alert("All other sessions logged out");
        await refreshDevices();
        await refreshSessions();
    } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to logout all sessions");
    } finally {
        isLoggingOutAll.value = false;
    }
}

useHead({
    title: "Security Settings",
});
</script>
