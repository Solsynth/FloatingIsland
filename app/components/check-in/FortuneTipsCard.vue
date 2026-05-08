<template>
    <div v-if="tips.length > 0" class="space-y-3">
        <div class="flex items-center gap-2">
            <IconLightbulb class="w-5 h-5 text-primary" />
            <h3
                class="text-base font-bold"
                :style="{ fontFamily: serifFont }"
            >
                Tips
            </h3>
        </div>
        <div class="space-y-2">
            <div
                v-for="(tip, i) in tips"
                :key="i"
                class="card bg-base-100"
            >
                <div class="card-body p-4 flex-row items-start gap-3">
                    <div
                        class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        :class="tip.isPositive ? 'bg-success/10' : 'bg-warning/10'"
                    >
                        <IconThumbsUp
                            v-if="tip.isPositive"
                            class="w-4 h-4 text-success"
                        />
                        <IconThumbsDown
                            v-else
                            class="w-4 h-4 text-warning"
                        />
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-semibold" :style="{ fontFamily: serifFont }">
                            {{ tip.title }}
                        </p>
                        <p
                            class="text-xs text-base-content/60 mt-0.5"
                            :style="{ fontFamily: serifFont }"
                        >
                            {{ tip.content }}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import {
    IconLightbulb,
    IconThumbsUp,
    IconThumbsDown,
} from "#components";
import type { FortuneTip } from "~/utils/api";

defineProps<{
    tips: FortuneTip[];
}>();

const serifFont = "'Noto Serif', 'Noto Serif SC', serif";
</script>
