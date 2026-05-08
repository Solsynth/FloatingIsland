<template>
    <div class="space-y-3">
        <label
            v-for="factor in availableFactors"
            :key="factor.id"
            class="flex items-center gap-3 p-3 rounded-xl border border-base-300 transition-colors"
            :class="{
                'border-primary bg-primary/5': selectedFactor?.id === factor.id,
                'cursor-pointer hover:bg-base-200': !isBlacklisted(factor.id),
                'opacity-50 cursor-not-allowed': isBlacklisted(factor.id),
            }"
        >
            <input
                type="radio"
                name="factor"
                class="radio radio-primary"
                :checked="selectedFactor?.id === factor.id"
                :disabled="isBlacklisted(factor.id)"
                @change="!isBlacklisted(factor.id) && $emit('select', factor)"
            >
            <IconKey
                v-if="getFactorIconType(factor.type) === 'key'"
                class="w-5 h-5"
            />
            <IconMail
                v-else-if="getFactorIconType(factor.type) === 'mail'"
                class="w-5 h-5"
            />
            <IconBell
                v-else-if="getFactorIconType(factor.type) === 'bell'"
                class="w-5 h-5"
            />
            <IconTimer
                v-else-if="getFactorIconType(factor.type) === 'timer'"
                class="w-5 h-5"
            />
            <IconNfc
                v-else-if="getFactorIconType(factor.type) === 'nfc'"
                class="w-5 h-5"
            />
            <IconKeySquare
                v-else-if="getFactorIconType(factor.type) === 'key-square'"
                class="w-5 h-5"
            />
            <IconShield v-else class="w-5 h-5" />
            <div>
                <div class="font-medium">
                    {{ factor.name || getFactorLabel(factor.type) }}
                </div>
                <div class="text-xs text-base-content/50">
                    {{ getFactorDescription(factor.type) }}
                    <span v-if="isBlacklisted(factor.id)" class="text-warning">
                        (already used)
                    </span>
                </div>
            </div>
        </label>
    </div>
</template>

<script setup lang="ts">
import {
    IconKey,
    IconMail,
    IconBell,
    IconTimer,
    IconShield,
    IconNfc,
    IconKeySquare,
} from "#components";
import type { SnAuthFactor, SnAuthChallenge } from "~/types/auth";
import { FACTOR_TYPES } from "~/types/auth";

const props = defineProps<{
    factors: SnAuthFactor[];
    selectedFactor: SnAuthFactor | null;
    challenge?: SnAuthChallenge | null;
}>();

defineEmits<{
    select: [factor: SnAuthFactor];
}>();

const availableFactors = computed(() => {
    // Filter out factors that are unavailable on web (e.g., NFC)
    return props.factors.filter(f => !FACTOR_TYPES[f.type]?.webUnavailable);
});

function isBlacklisted(factorId: string): boolean {
    return props.challenge?.blacklistFactors?.includes(factorId) ?? false;
}

function getFactorLabel(type: number): string {
    return FACTOR_TYPES[type]?.label || "Unknown";
}

function getFactorDescription(type: number): string {
    return FACTOR_TYPES[type]?.description || "";
}

function getFactorIconType(type: number): string {
    return FACTOR_TYPES[type]?.icon || "key";
}
</script>
