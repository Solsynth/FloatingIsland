<template>
    <div class="max-w-2xl mx-auto">
        <h1 class="text-2xl font-bold mb-6">Appearance Settings</h1>

        <!-- Theme -->
        <div class="card mb-6">
            <div class="card-body gap-4">
                <h2 class="text-sm font-semibold text-base-content/70">Theme</h2>

                <div class="grid grid-cols-3 gap-3">
                    <button
                        class="p-4 rounded-xl border-2 transition-all"
                        :class="theme === 'light' ? 'border-primary bg-primary/10' : 'border-base-300 hover:border-base-400'"
                        @click="theme = 'light'"
                    >
                        <IconSun class="w-6 h-6 mx-auto mb-2" />
                        <span class="text-sm">Light</span>
                    </button>
                    <button
                        class="p-4 rounded-xl border-2 transition-all"
                        :class="theme === 'dark' ? 'border-primary bg-primary/10' : 'border-base-300 hover:border-base-400'"
                        @click="theme = 'dark'"
                    >
                        <IconMoon class="w-6 h-6 mx-auto mb-2" />
                        <span class="text-sm">Dark</span>
                    </button>
                    <button
                        class="p-4 rounded-xl border-2 transition-all"
                        :class="theme === 'system' ? 'border-primary bg-primary/10' : 'border-base-300 hover:border-base-400'"
                        @click="theme = 'system'"
                    >
                        <IconMonitor class="w-6 h-6 mx-auto mb-2" />
                        <span class="text-sm">System</span>
                    </button>
                </div>
            </div>
        </div>

        <!-- Accent Color -->
        <div class="card mb-6">
            <div class="card-body gap-4">
                <h2 class="text-sm font-semibold text-base-content/70">Accent Color</h2>

                <div class="flex flex-wrap gap-3">
                    <button
                        v-for="color in accentColors"
                        :key="color.value"
                        class="w-10 h-10 rounded-full border-2 transition-all"
                        :class="accentColor === color.value ? 'border-white ring-2 ring-primary scale-110' : 'border-transparent hover:scale-105'"
                        :style="{ backgroundColor: color.hex }"
                        :title="color.label"
                        @click="accentColor = color.value"
                    />
                </div>
            </div>
        </div>

        <!-- Font Size -->
        <div class="card mb-6">
            <div class="card-body gap-4">
                <h2 class="text-sm font-semibold text-base-content/70">Font Size</h2>

                <div class="form-control">
                    <label class="label">
                        <span class="label-text">Base Font Size</span>
                    </label>
                    <input
                        v-model="fontSize"
                        type="range"
                        min="14"
                        max="20"
                        class="range range-primary"
                    >
                    <div class="flex justify-between text-xs text-base-content/60 mt-1">
                        <span>Small</span>
                        <span>{{ fontSize }}px</span>
                        <span>Large</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Display Options -->
        <div class="card mb-6">
            <div class="card-body gap-4">
                <h2 class="text-sm font-semibold text-base-content/70">Display Options</h2>

                <div class="form-control">
                    <label class="label cursor-pointer justify-start gap-4">
                        <input
                            v-model="display.compactMode"
                            type="checkbox"
                            class="toggle toggle-primary"
                        >
                        <div>
                            <span class="label-text font-medium">Compact Mode</span>
                            <p class="text-sm text-base-content/60">Reduce padding and spacing</p>
                        </div>
                    </label>
                </div>

                <div class="form-control">
                    <label class="label cursor-pointer justify-start gap-4">
                        <input
                            v-model="display.reducedMotion"
                            type="checkbox"
                            class="toggle toggle-primary"
                        >
                        <div>
                            <span class="label-text font-medium">Reduced Motion</span>
                            <p class="text-sm text-base-content/60">Minimize animations</p>
                        </div>
                    </label>
                </div>
            </div>
        </div>

        <div class="flex gap-2">
            <button
                class="btn btn-primary"
                :disabled="isSaving"
                @click="saveAppearance"
            >
                <IconLoader v-if="isSaving" class="w-4 h-4 animate-spin" />
                <IconCheck v-else class="w-4 h-4" />
                Save Preferences
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { IconSun, IconMoon, IconMonitor, IconLoader, IconCheck } from "#components";

const isSaving = ref(false);

const theme = ref("system");
const accentColor = ref("blue");
const fontSize = ref(16);

const display = reactive({
    compactMode: false,
    reducedMotion: false,
});

const accentColors = [
    { value: "blue", label: "Blue", hex: "#3b82f6" },
    { value: "purple", label: "Purple", hex: "#8b5cf6" },
    { value: "pink", label: "Pink", hex: "#ec4899" },
    { value: "red", label: "Red", hex: "#ef4444" },
    { value: "orange", label: "Orange", hex: "#f97316" },
    { value: "green", label: "Green", hex: "#22c55e" },
    { value: "teal", label: "Teal", hex: "#14b8a6" },
];

async function saveAppearance() {
    isSaving.value = true;
    try {
        // TODO: Implement API
        await new Promise((r) => setTimeout(r, 1000));
        alert("Appearance settings saved");
    } finally {
        isSaving.value = false;
    }
}

useHead({
    title: "Appearance Settings",
});
</script>
