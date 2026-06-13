<template>
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
    <div class="min-w-0">
      <div class="flex items-center gap-2 mb-0.5">
        <slot name="pre-title" />
        <h1 class="text-xl font-bold tracking-tight text-base-content">
          {{ title }}
        </h1>
      </div>
      <p v-if="description" class="text-sm text-base-content/50">
        {{ description }}
      </p>
    </div>
    <div class="flex items-center gap-2 shrink-0">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>
