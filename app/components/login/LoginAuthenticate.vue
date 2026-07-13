<template>
    <div class="space-y-6">
        <div class="space-y-1">
            <h2 class="text-xl font-bold">{{ factorLabel }}</h2>
            <p class="text-sm text-base-content/60">{{ factorDescription }}</p>
        </div>

        <div v-if="error" class="alert alert-error text-sm">
            <IconAlertCircle class="w-4 h-4" />
            <span>{{ error }}</span>
        </div>

        <!-- Passkey: show button instead of input -->
        <div v-if="isPasskey" class="space-y-4">
            <button
                class="btn btn-primary w-full gap-2"
                :disabled="submitting"
                @click="$emit('passkey')"
            >
                <IconLoader v-if="submitting" class="w-4 h-4 animate-spin" />
                <IconFingerprint v-else class="w-4 h-4" />
                {{ t("login.authenticateWithPasskey") }}
            </button>
            <button class="btn btn-ghost w-full" :disabled="submitting" @click="$emit('back')">
                <IconArrowLeft class="w-4 h-4" />
                {{ t("auth.back") }}
            </button>
        </div>

        <!-- Standard input for other factor types -->
        <template v-else>
            <fieldset class="fieldset">
                <legend class="fieldset-legend">{{ inputPlaceholder }}</legend>
                <input
                    ref="inputRef"
                    :type="isPassword ? 'password' : 'text'"
                    :placeholder="inputPlaceholder"
                    class="input input-bordered w-full"
                    :value="modelValue"
                    autocomplete="off"
                    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
                    @keydown.enter="$emit('submit')"
                >
            </fieldset>

            <div class="flex gap-2">
                <button class="btn btn-ghost flex-1" @click="$emit('back')">
                    <IconArrowLeft class="w-4 h-4" />
                    {{ t("auth.back") }}
                </button>
                <button
                    class="btn btn-primary flex-1"
                    :disabled="!modelValue || submitting"
                    @click="$emit('submit')"
                >
                    <IconLoader v-if="submitting" class="w-4 h-4 animate-spin" />
                    <IconCheck v-else class="w-4 h-4" />
                    {{ submitLabel }}
                </button>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import {
    IconAlertCircle,
    IconLoader,
    IconArrowLeft,
    IconCheck,
    IconFingerprint,
} from "#components";
import type { SnAuthFactor } from "~/types/auth";
import { FACTOR_TYPES } from "~/types/auth";

const { t } = useI18n();

const props = defineProps<{
    factor: SnAuthFactor | null;
    modelValue: string;
    submitting: boolean;
}>();

defineEmits<{
    "update:modelValue": [value: string];
    submit: [];
    back: [];
    passkey: [];
}>();

const inputRef = ref<HTMLInputElement | null>(null);

const isPasskey = computed(() => props.factor?.type === 7);

const isPassword = computed(() => {
    const type = props.factor?.type;
    return type === 0 || type === 4; // Password or PIN
});

const factorLabel = computed(() => FACTOR_TYPES[props.factor?.type ?? -1]?.label || "Verification");
const factorDescription = computed(() => FACTOR_TYPES[props.factor?.type ?? -1]?.description || "");
const inputPlaceholder = computed(() => isPassword.value ? t("login.enterPassword") : t("login.enterCode"));
const submitLabel = computed(() => isPassword.value ? t("login.verify") : t("login.submit"));

const error = ref<string | null>(null);

watch(() => props.factor, () => {
    error.value = null;
}, { immediate: true });

onMounted(() => {
    if (!isPasskey.value) {
        nextTick(() => {
            inputRef.value?.focus();
        });
    }
});
</script>
