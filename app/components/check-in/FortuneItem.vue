<template>
    <div class="flex items-start gap-3 px-4 py-4">
        <component
            :is="icon"
            class="w-5 h-5 text-primary shrink-0 mt-0.5"
        />
        <div class="flex-1 min-w-0">
            <p
                class="text-xs font-semibold text-base-content/60"
                :style="{ fontFamily: serifFont }"
            >
                {{ label }}
            </p>
            <p
                class="text-sm leading-relaxed mt-1"
                :style="{ fontFamily: serifFont }"
            >
                {{ value }}
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { Component } from "vue";

defineProps<{
    icon: Component;
    label: string;
    value: string;
}>();

const serifFont = "'Noto Serif', 'Noto Serif SC', serif";
</script>
