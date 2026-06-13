<template>
  <AlertDialog
    v-if="alertState"
    :open="alertState.open"
    :title="alertState.title"
    :description="alertState.description"
    :confirm-text="alertState.confirmText"
    :cancel-text="alertState.cancelText"
    :variant="alertState.variant"
    @confirm="handleConfirm"
    @cancel="handleCancel"
    @update:open="handleOpenChange"
  />
</template>

<script setup lang="ts">
const { alertState, handleConfirm, handleCancel } = useAlert()

function handleOpenChange(open: boolean) {
  if (!open) handleCancel()
}
</script>
