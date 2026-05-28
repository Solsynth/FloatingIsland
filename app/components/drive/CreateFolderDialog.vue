<template>
  <dialog ref="dialogRef" class="modal" :open="open">
    <div class="modal-box">
      <h3 class="font-bold text-lg">{{ t('drive.createFolder') }}</h3>
      <div class="py-4">
        <input
          ref="inputRef"
          v-model="folderName"
          type="text"
          class="input input-bordered w-full"
          :placeholder="t('drive.folderName')"
          @keydown.enter="handleConfirm"
        />
      </div>
      <div class="modal-action">
        <button class="btn btn-ghost" @click="$emit('close')">{{ t('common.cancel') }}</button>
        <button class="btn btn-primary" :disabled="!folderName.trim()" @click="handleConfirm">
          {{ t('drive.create') }}
        </button>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button @click="$emit('close')">close</button>
    </form>
  </dialog>
</template>

<script setup lang="ts">
const { t } = useI18n()

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
  confirm: [name: string]
}>()

const folderName = ref('')
const inputRef = ref<HTMLInputElement | null>(null)

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    folderName.value = ''
    nextTick(() => inputRef.value?.focus())
  }
})

function handleConfirm() {
  if (folderName.value.trim()) {
    emit('confirm', folderName.value.trim())
  }
}
</script>
