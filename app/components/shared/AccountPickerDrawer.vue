<template>
  <ClientOnly>
    <DrawerRoot :open="open" @update:open="emit('update:open', $event)">
      <DrawerPortal>
        <DrawerOverlay class="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" />
        <DrawerContent class="fixed z-50 flex flex-col bg-base-100 shadow-2xl right-0 top-0 bottom-0 w-[28rem]">
          <div class="flex items-center justify-between px-6 py-4 border-b border-base-300/30 shrink-0">
            <h3 class="font-bold text-lg">{{ title }}</h3>
            <button class="btn btn-circle btn-ghost btn-sm" @click="emit('update:open', false)">
              <IconX class="w-4 h-4" />
            </button>
          </div>
          <div class="flex-1 overflow-y-auto px-6 py-6 scrollbar-none">
            <AccountPicker
              :allow-multiple="allowMultiple"
              :placeholder="placeholder"
              @select="onSelect"
            />
          </div>
        </DrawerContent>
      </DrawerPortal>
    </DrawerRoot>
    <template #fallback>
      <span></span>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import { IconX } from '#components'
import {
  DrawerRoot,
  DrawerPortal,
  DrawerOverlay,
  DrawerContent,
} from 'vaul-vue'
import AccountPicker from '~/components/creator/AccountPicker.vue'
import type { SnAccount } from '~/types/auth'

const props = withDefaults(defineProps<{
  open: boolean
  title?: string
  allowMultiple?: boolean
  placeholder?: string
}>(), {
  title: 'Select Account',
})

const emit = defineEmits<{
  select: [accounts: SnAccount | SnAccount[] | null]
  'update:open': [value: boolean]
}>()

function onSelect(accounts: SnAccount | SnAccount[] | null) {
  emit('select', accounts)
  emit('update:open', false)
}
</script>
