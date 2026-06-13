<template>
  <div>
    <AdminCard compact class="mb-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <IconLayers class="w-4 h-4 text-primary" />
          <span class="text-sm font-medium">{{ stickerIds.length }} {{ t('creator.stickers.title') }} {{ t('creator.common.selected') }}</span>
        </div>
      </div>
    </AdminCard>

    <AdminCard
      title="Batch Edit"
      description="Apply changes to all selected stickers at once"
      class="mb-6"
    >
      <!-- Size -->
      <div class="form-control mb-4">
        <label class="flex items-center gap-3 cursor-pointer mb-2">
          <input v-model="applySize" type="checkbox" class="checkbox checkbox-sm checkbox-primary" />
          <span class="text-sm font-medium">{{ t('creator.common.updateSize') }}</span>
        </label>
        <select
          v-model="size"
          class="select select-bordered w-full max-w-xs"
          :disabled="!applySize"
        >
          <option :value="0">{{ t('creator.stickers.sizeAuto') }}</option>
          <option :value="1">{{ t('creator.stickers.sizeSmall') }}</option>
          <option :value="2">{{ t('creator.stickers.sizeMedium') }}</option>
          <option :value="3">{{ t('creator.stickers.sizeLarge') }}</option>
        </select>
      </div>

      <!-- Mode -->
      <div class="form-control mb-2">
        <label class="flex items-center gap-3 cursor-pointer mb-2">
          <input v-model="applyMode" type="checkbox" class="checkbox checkbox-sm checkbox-primary" />
          <span class="text-sm font-medium">{{ t('creator.common.updateMode') }}</span>
        </label>
        <select
          v-model="mode"
          class="select select-bordered w-full max-w-xs"
          :disabled="!applyMode"
        >
          <option :value="0">{{ t('creator.stickers.modeSticker') }}</option>
          <option :value="1">{{ t('creator.stickers.modeEmote') }}</option>
        </select>
      </div>
    </AdminCard>

    <!-- Submit -->
    <div class="flex items-center justify-end gap-2">
      <button class="btn btn-ghost" @click="emit('close')">{{ t('creator.cancel') }}</button>
      <button
        class="btn btn-primary min-w-[100px]"
        :class="{ 'loading': submitting }"
        :disabled="submitting || (!applySize && !applyMode)"
        @click="handleSubmit"
      >
        <IconSave class="w-4 h-4" />
        {{ t('creator.common.apply') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IconSave, IconLayers } from '#components'
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
