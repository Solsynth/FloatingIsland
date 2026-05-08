<template>
    <div
        class="card"
        :style="{ backgroundColor: 'oklch(var(--p) / 0.12)' }"
    >
        <div class="card-body p-5 gap-3">
            <div class="flex items-center gap-2">
                <IconWand class="w-5 h-5 text-primary" />
                <h3
                    class="text-base font-bold"
                    :style="{ fontFamily: serifFont }"
                >
                    Today's Ritual
                </h3>
            </div>
            <p
                class="text-sm leading-relaxed"
                :style="{ fontFamily: serifFont, lineHeight: '1.65' }"
            >
                {{ ritual }}
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { IconWand } from "#components";

defineProps<{
    ritual: string;
}>();

const serifFont = "'Noto Serif', 'Noto Serif SC', serif";
</script>
