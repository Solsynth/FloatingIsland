<template>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div
            v-for="item in items"
            :key="item.label"
            class="card bg-base-100"
        >
            <div class="card-body p-4 flex-row items-center gap-3">
                <component
                    :is="item.icon"
                    class="w-5 h-5 text-primary shrink-0"
                />
                <div class="flex-1 min-w-0">
                    <p
                        class="text-xs font-semibold text-base-content/60"
                        :style="{ fontFamily: serifFont }"
                    >
                        {{ item.label }}
                    </p>
                    <p
                        class="text-sm font-semibold truncate"
                        :style="{ fontFamily: serifFont }"
                    >
                        {{ item.value }}
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import {
    IconPalette,
    IconCompass,
    IconClock,
    IconKey,
} from "#components";
import type { FortuneReport } from "~/utils/api";

const props = defineProps<{
    report: FortuneReport;
}>();

const serifFont = "'Noto Serif', 'Noto Serif SC', serif";

const items = computed(() => [
    { icon: IconPalette, label: "Lucky Color", value: props.report.luckyColor },
    { icon: IconCompass, label: "Lucky Direction", value: props.report.luckyDirection },
    { icon: IconClock, label: "Lucky Time", value: props.report.luckyTime },
    { icon: IconKey, label: "Lucky Item", value: props.report.luckyItem },
]);
</script>
