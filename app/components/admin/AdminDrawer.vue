<template>
  <DrawerRoot :open="open" @update:open="$emit('update:open', $event)" direction="right" :dismissible="dismissible" :modal="true">
    <DrawerPortal>
      <DrawerOverlay class="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" />
      <DrawerContent class="fixed right-0 top-0 bottom-0 z-50 flex flex-col bg-base-100 shadow-2xl w-[28rem]" :class="contentClass">
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-base-300/30 shrink-0">
          <slot name="header">
            <h3 v-if="title" class="font-bold text-lg">{{ title }}</h3>
          </slot>
          <button class="btn btn-circle btn-ghost btn-sm" @click="close">
            <IconX class="w-4 h-4" />
          </button>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto px-6 py-6 scrollbar-none">
          <slot />
        </div>

        <!-- Footer -->
        <div v-if="$slots.footer" class="px-6 py-4 border-t border-base-300/30 shrink-0">
          <slot name="footer" />
        </div>
      </DrawerContent>
    </DrawerPortal>
  </DrawerRoot>
</template>

<script setup lang="ts">
import { IconX } from '#components'
import {
  DrawerRoot,
  DrawerPortal,
  DrawerOverlay,
  DrawerContent,
} from 'vaul-vue'

defineProps<{
  open: boolean
  title?: string
  contentClass?: string
  dismissible?: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

function close() {
  emit('update:open', false)
}
</script>
