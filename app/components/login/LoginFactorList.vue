<template>
    <div class="space-y-3">
        <label
            v-for="factor in factors"
            :key="factor.id"
            class="flex items-center gap-3 p-3 rounded-xl border border-base-300 cursor-pointer hover:bg-base-200 transition-colors"
            :class="{
                'border-primary bg-primary/5': selectedFactor?.id === factor.id,
            }"
        >
            <input
                type="radio"
                name="factor"
                class="radio radio-primary"
                :checked="selectedFactor?.id === factor.id"
                @change="$emit('select', factor)"
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
            <IconShield v-else class="w-5 h-5" />
            <div>
                <div class="font-medium">
                    {{ factor.name || getFactorLabel(factor.type) }}
                </div>
                <div class="text-xs text-base-content/50">
                    {{ getFactorDescription(factor.type) }}
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
} from "#components";
import type { SnAuthFactor } from "~/types/auth";
import { FACTOR_TYPES } from "~/types/auth";

defineProps<{
    factors: SnAuthFactor[];
    selectedFactor: SnAuthFactor | null;
}>();

defineEmits<{
    select: [factor: SnAuthFactor];
}>();

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
