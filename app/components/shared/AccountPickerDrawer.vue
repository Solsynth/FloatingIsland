<template>
  <ClientOnly>
    <DrawerRoot :open="open" @update:open="emit('update:open', $event)">
      <DrawerPortal>
        <DrawerOverlay class="fixed inset-0 bg-black/40 z-50" />
        <DrawerContent
          class="fixed bottom-0 left-0 right-0 mx-auto z-50 bg-base-100 rounded-t-2xl max-h-[80vh] flex flex-col max-w-lg"
        >
          <!-- Drag handle -->
          <div class="flex justify-center pt-3 pb-2">
            <div class="w-10 h-1 rounded-full bg-base-content/20" />
          </div>

          <!-- Header -->
          <div class="flex items-center justify-between px-5 pb-3">
            <h3 class="text-lg font-semibold">{{ title }}</h3>
            <button class="btn btn-sm btn-ghost btn-square" @click="emit('update:open', false)">
              <IconX class="w-4 h-4" />
            </button>
          </div>

          <!-- Body -->
          <div class="flex-1 overflow-y-auto px-5 pb-5 min-h-0">
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

withDefaults(defineProps<{
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
