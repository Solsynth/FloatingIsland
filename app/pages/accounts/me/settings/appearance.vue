<template>
    <div class="max-w-3xl mx-auto space-y-6 min-w-0">
        <h1 class="text-2xl font-bold mb-6">Appearance Settings</h1>

        <!-- Theme -->
        <div class="card bg-base-100 shadow-sm">
            <div class="card-body">
                <h2 class="card-title text-lg mb-4">Theme</h2>

                <div class="grid grid-cols-3 gap-3">
                    <button
                        class="p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2"
                        :class="theme === 'light' ? 'border-primary bg-primary/10' : 'border-base-300 hover:border-base-400'"
                        @click="setTheme('light')"
                    >
                        <IconSun class="w-6 h-6" />
                        <span class="text-sm">Light</span>
                    </button>
                    <button
                        class="p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2"
                        :class="theme === 'dark' ? 'border-primary bg-primary/10' : 'border-base-300 hover:border-base-400'"
                        @click="setTheme('dark')"
                    >
                        <IconMoon class="w-6 h-6" />
                        <span class="text-sm">Dark</span>
                    </button>
                    <button
                        class="p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2"
                        :class="theme === 'system' ? 'border-primary bg-primary/10' : 'border-base-300 hover:border-base-400'"
                        @click="setTheme('system')"
                    >
                        <IconMonitor class="w-6 h-6" />
                        <span class="text-sm">System</span>
                    </button>
                </div>
            </div>
        </div>

        <!-- Font Size -->
        <div class="card bg-base-100 shadow-sm">
            <div class="card-body">
                <h2 class="card-title text-lg mb-4">Font Size</h2>

                <fieldset class="fieldset">
                    <legend class="fieldset-legend">Base Font Size</legend>
                    <input
                        v-model="fontSize"
                        type="range"
                        min="14"
                        max="20"
                        class="range range-primary w-full"
                        @change="updateFontSize"
                    >
                    <p class="label flex justify-between">
                        <span>Small</span>
                        <span>{{ fontSize }}px</span>
                        <span>Large</span>
                    </p>
                </fieldset>
            </div>
        </div>

        <!-- Display Options -->
        <div class="card bg-base-100 shadow-sm">
            <div class="card-body">
                <h2 class="card-title text-lg mb-4">Display Options</h2>

                <div class="space-y-4">
                    <div class="form-control">
                        <label class="label cursor-pointer justify-start gap-4">
                            <input
                                v-model="display.reducedMotion"
                                type="checkbox"
                                class="toggle toggle-primary"
                                @change="updateDisplay"
                            >
                            <div>
                                <span class="label-text font-medium">Reduced Motion</span>
                                <p class="text-sm text-base-content/60">Minimize animations</p>
                            </div>
                        </label>
                    </div>
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
                <IconSave v-else class="w-4 h-4" />
                Save Preferences
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { IconSun, IconMoon, IconMonitor, IconLoader, IconSave } from "#components";

const isSaving = ref(false);

const theme = ref("system");
const fontSize = ref(16);

const display = reactive({
    reducedMotion: false,
});

// Load settings from localStorage on mount
onMounted(() => {
    const savedTheme = localStorage.getItem("theme") || "system";
    const savedFontSize = localStorage.getItem("font-size") || "16";
    const savedDisplay = localStorage.getItem("display-options");

    theme.value = savedTheme;
    fontSize.value = parseInt(savedFontSize, 10);

    if (savedDisplay) {
        try {
            const parsed = JSON.parse(savedDisplay);
            display.reducedMotion = parsed.reducedMotion || false;
        } catch {
            // Ignore parse errors
        }
    }

    applyTheme(savedTheme);
});

function setTheme(newTheme: string) {
    theme.value = newTheme;
    applyTheme(newTheme);
    localStorage.setItem("theme", newTheme);
}

function applyTheme(newTheme: string) {
    const root = document.documentElement;
    if (newTheme === "system") {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        root.setAttribute("data-theme", prefersDark ? "dark" : "light");
    } else {
        root.setAttribute("data-theme", newTheme);
    }
}

function updateFontSize() {
    localStorage.setItem("font-size", String(fontSize.value));
    document.documentElement.style.fontSize = `${fontSize.value}px`;
}

function updateDisplay() {
    localStorage.setItem("display-options", JSON.stringify(display));
    if (display.reducedMotion) {
        document.documentElement.classList.add("reduce-motion");
    } else {
        document.documentElement.classList.remove("reduce-motion");
    }
}

async function saveAppearance() {
    isSaving.value = true;
    try {
        // Save to localStorage
        localStorage.setItem("theme", theme.value);
        localStorage.setItem("font-size", String(fontSize.value));
        localStorage.setItem("display-options", JSON.stringify(display));

        await new Promise(r => setTimeout(r, 500));
        alert("Appearance settings saved");
    } finally {
        isSaving.value = false;
    }
}

useHead({
    title: "Appearance Settings",
});
</script>
