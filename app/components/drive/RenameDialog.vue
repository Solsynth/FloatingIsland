<template>
  <dialog ref="dialogRef" class="modal" :open="!!file">
    <div class="modal-box">
      <h3 class="font-bold text-lg">{{ t('drive.rename') }}</h3>
      <div class="py-4">
        <input
          ref="inputRef"
          v-model="newName"
          type="text"
          class="input input-bordered w-full"
          :placeholder="t('drive.enterName')"
          @keydown.enter="handleConfirm"
        />
      </div>
      <div class="modal-action">
        <button class="btn btn-ghost" @click="$emit('close')">{{ t('common.cancel') }}</button>
        <button class="btn btn-primary" :disabled="!newName.trim()" @click="handleConfirm">
          {{ t('common.confirm') }}
        </button>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button @click="$emit('close')">close</button>
    </form>
  </dialog>
</template>

<script setup lang="ts">
import type { SnCloudFile } from '~/types/drive'

const { t } = useI18n()

const props = defineProps<{
  open: boolean
  currentName: string
  file: SnCloudFile | null
}>()

const emit = defineEmits<{
  close: []
  confirm: [name: string]
}>()

const newName = ref(props.currentName)
const inputRef = ref<HTMLInputElement | null>(null)

watch(() => props.file, (file) => {
  if (file) {
    newName.value = file.name
    nextTick(() => {
      inputRef.value?.focus()
      inputRef.value?.select()
    })
  }
})

function handleConfirm() {
  if (newName.value.trim()) {
    emit('confirm', newName.value.trim())
  }
}
</script>
