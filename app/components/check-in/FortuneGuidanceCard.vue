<template>
    <div class="card bg-base-100">
        <div class="card-body p-5 gap-3">
            <div class="flex items-center gap-2">
                <IconBookOpen class="w-5 h-5 text-primary" />
                <h3
                    class="text-base font-bold"
                    :style="{ fontFamily: serifFont }"
                >
                    Fortune Guidance
                </h3>
            </div>
            <p
                class="text-sm leading-relaxed text-base-content"
                :style="{ fontFamily: serifFont, lineHeight: '1.75' }"
            >
                {{ summaryDetail }}
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { IconBookOpen } from "#components";

defineProps<{
    summaryDetail: string;
}>();

const serifFont = "'Noto Serif', 'Noto Serif SC', serif";
</script>
