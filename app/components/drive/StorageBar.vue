<template>
  <div class="flex items-center gap-3 px-6 py-4">
    <div class="flex-1">
      <div class="flex items-center justify-between text-xs mb-1">
        <span class="text-base-content/60">{{ t("drive.storage") }}</span>
        <span class="font-medium"
          >{{ usedFormatted }} / {{ totalFormatted }}</span
        >
      </div>
      <div class="w-full h-1.5 bg-base-300 rounded-full overflow-hidden">
        <div
          class="h-full rounded-full transition-all duration-300"
          :class="progressColor"
          :style="{ width: `${progressPercent}%` }"
        />
      </div>
    </div>
    <button class="btn btn-ghost btn-xs" @click="$emit('details')">
      <IconInfo class="w-3.5 h-3.5" />
    </button>
  </div>
</template>

<script setup lang="ts">
import type { DriveUsage } from "~/types/drive";

const { t } = useI18n();

const props = defineProps<{
  usage: DriveUsage | null;
}>();

defineEmits<{
  details: [];
}>();

const usedBytes = computed(() => props.usage?.totalUsageBytes ?? 0);
const totalBytes = computed(() => {
  const quota = props.usage?.totalQuota ?? 0;
  return quota > 0 ? quota * 1024 * 1024 : 0;
});

const usedFormatted = computed(() => formatBytes(usedBytes.value));
const totalFormatted = computed(() => formatBytes(totalBytes.value));

const progressPercent = computed(() => {
  if (totalBytes.value <= 0) return 0;
  return Math.min(100, (usedBytes.value / totalBytes.value) * 100);
});

const progressColor = computed(() => {
  if (progressPercent.value > 90) return "bg-error";
  if (progressPercent.value > 70) return "bg-warning";
  return "bg-primary";
});

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
</script>
