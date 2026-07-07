<template>
    <div
        class="rounded-xl bg-base-100/60 backdrop-blur-xl border border-base-300/30 shadow-sm"
        :class="[
            hoverable
                ? 'transition-all hover:shadow-md hover:border-base-300/60 cursor-pointer'
                : '',
        ]"
    >
        <!-- Header -->
        <div
            v-if="$slots.header || title"
            class="flex items-center justify-between border-b border-base-300/20"
            :class="[compact ? 'px-4 py-3' : 'px-5 py-4']"
        >
            <div v-if="title" class="min-w-0">
                <h3 class="font-semibold text-sm text-base-content">
                    {{ title }}
                </h3>
                <p
                    v-if="description"
                    class="text-xs text-base-content/40 mt-0.5"
                >
                    {{ description }}
                </p>
            </div>
            <slot name="header" />
        </div>

        <!-- Body -->
        <div :class="[noPadding ? 'p-0' : compact ? 'p-4' : 'p-5']">
            <slot />
        </div>

        <!-- Footer -->
        <div
            v-if="$slots.footer"
            class="border-t border-base-300/20"
            :class="[compact ? 'px-4 py-3' : 'px-5 py-4']"
        >
            <slot name="footer" />
        </div>
    </div>
</template>

<script setup lang="ts">
withDefaults(
    defineProps<{
        title?: string;
        description?: string;
        compact?: boolean;
        hoverable?: boolean;
        noPadding?: boolean;
    }>(),
    {
        compact: false,
        hoverable: false,
        noPadding: false,
    },
);
</script>
