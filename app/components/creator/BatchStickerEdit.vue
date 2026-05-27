<template>
  <div>
    <p class="text-sm mb-4">{{ stickerIds.length }} stickers selected</p>

    <!-- Size -->
    <div class="form-control mb-4">
      <label class="cursor-pointer flex items-center gap-3">
        <input v-model="applySize" type="checkbox" class="checkbox checkbox-sm" />
        <span class="label-text">Update size</span>
      </label>
      <select v-model="size" class="select select-bordered w-full mt-2" :disabled="!applySize">
        <option :value="0">{{ t('creator.stickers.sizeAuto') }}</option>
        <option :value="1">{{ t('creator.stickers.sizeSmall') }}</option>
        <option :value="2">{{ t('creator.stickers.sizeMedium') }}</option>
        <option :value="3">{{ t('creator.stickers.sizeLarge') }}</option>
      </select>
    </div>

    <!-- Mode -->
    <div class="form-control mb-6">
      <label class="cursor-pointer flex items-center gap-3">
        <input v-model="applyMode" type="checkbox" class="checkbox checkbox-sm" />
        <span class="label-text">Update mode</span>
      </label>
      <select v-model="mode" class="select select-bordered w-full mt-2" :disabled="!applyMode">
        <option :value="0">{{ t('creator.stickers.modeSticker') }}</option>
        <option :value="1">{{ t('creator.stickers.modeEmote') }}</option>
      </select>
    </div>

    <!-- Submit -->
    <div class="flex justify-end gap-2">
      <button class="btn btn-ghost" @click="emit('close')">{{ t('creator.cancel') }}</button>
      <button class="btn btn-primary" :disabled="submitting || (!applySize && !applyMode)" @click="handleSubmit">
        <IconSave class="w-4 h-4" /> Apply
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IconSave } from '#components'
import { batchUpdateStickers } from '~/utils/creator'

const props = defineProps<{
  packId: string
  stickerIds: string[]
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const { t } = useI18n()

const applySize = ref(false)
const applyMode = ref(false)
const size = ref(0)
const mode = ref(0)
const submitting = ref(false)

async function handleSubmit() {
  if (!applySize.value && !applyMode.value) return
  submitting.value = true
  try {
    await batchUpdateStickers(props.packId, props.stickerIds, {
      ...(applySize.value ? { size: size.value } : {}),
      ...(applyMode.value ? { mode: mode.value } : {}),
    })
    emit('saved')
  } catch (e) {
    console.error(e)
  } finally {
    submitting.value = false
  }
}
</script>
