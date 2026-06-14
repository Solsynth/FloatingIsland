<template>
  <DrawerRoot :open="open" @update:open="$emit('update:open', $event)" :direction="direction" :dismissible="dismissible" :modal="true">
    <DrawerPortal>
      <DrawerOverlay class="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" />
      <DrawerContent 
        class="fixed z-50 flex flex-col bg-base-100 shadow-2xl"
        :class="[
          contentClass,
          direction === 'bottom' 
            ? 'bottom-0 left-0 right-0 max-h-[85vh] rounded-t-2xl' 
            : 'right-0 top-0 bottom-0 w-[28rem]'
        ]"
      >
        <!-- Drag Handle (bottom drawer) -->
        <div v-if="direction === 'bottom'" class="flex justify-center pt-3 pb-1">
          <div class="w-10 h-1 rounded-full bg-base-300" />
        </div>

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

withDefaults(defineProps<{
  open: boolean
  title?: string
  contentClass?: string
  dismissible?: boolean
  direction?: 'right' | 'bottom'
}>(), {
  direction: 'right'
})

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

function close() {
  emit('update:open', false)
}
</script>
