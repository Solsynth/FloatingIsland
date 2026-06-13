<template>
  <form @submit.prevent="handleSubmit">
    <AdminCard
      :title="pack ? 'Edit Sticker Pack' : 'New Sticker Pack'"
      description="Create or edit a sticker pack with a prefix for your community"
      class="mb-6"
    >
      <!-- Icon Upload -->
      <div class="flex items-start gap-4 mb-6 p-4 rounded-xl bg-base-200/50 border border-dashed border-base-300/50">
        <div class="w-20 h-20 rounded-xl bg-base-200 overflow-hidden shrink-0 border border-base-300/30">
          <img
            v-if="iconUrl"
            :src="iconUrl"
            class="w-full h-full object-cover"
            alt="Pack Icon"
          />
          <div v-else class="flex items-center justify-center h-full">
            <IconSticker class="w-8 h-8 text-base-content/20" />
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <p class="text-sm font-medium">Pack Icon</p>
          <p class="text-xs text-base-content/40">A small icon representing this sticker pack</p>
          <button type="button" class="btn btn-ghost btn-sm w-fit" @click="pickIcon">
            <IconUpload class="w-4 h-4" />
            {{ iconId ? 'Change' : 'Upload' }}
          </button>
        </div>
      </div>

      <!-- Name -->
      <fieldset class="fieldset mb-4">
        <legend class="fieldset-legend">
          {{ t('creator.stickers.packName') }}
          <span class="text-xs text-error">*</span>
        </legend>
        <input
          v-model="form.name"
          type="text"
          class="input w-full"
          placeholder="My Cool Stickers"
          required
        />
      </fieldset>

      <!-- Description -->
      <fieldset class="fieldset mb-4">
        <legend class="fieldset-legend">{{ t('creator.stickers.packDescription') }}</legend>
        <textarea
          v-model="form.description"
          class="textarea w-full min-h-[80px]"
          rows="3"
          placeholder="Describe your sticker pack..."
        />
      </fieldset>

      <!-- Prefix -->
      <fieldset class="fieldset">
        <legend class="fieldset-legend">
          {{ t('creator.stickers.prefix') }}
          <span class="text-xs text-error">*</span>
        </legend>
        <div class="join">
          <span class="join-item btn btn-disabled btn-sm bg-base-200/80">:</span>
          <input
            v-model="form.prefix"
            type="text"
            class="input join-item flex-1 font-mono text-sm"
            placeholder="my-pack"
            required
          />
          <span class="join-item btn btn-disabled btn-sm bg-base-200/80">:</span>
        </div>
        <p class="fieldset-label">{{ t('creator.stickers.prefixHint') }}</p>
      </fieldset>
    </AdminCard>

    <!-- Actions -->
    <div class="flex items-center justify-between gap-3">
      <button
        type="button"
        class="btn btn-ghost"
        @click="emit('close')"
      >
        {{ t('creator.cancel') }}
      </button>
      <button
        type="submit"
        class="btn btn-primary min-w-[120px]"
        :class="{ 'loading': submitting }"
        :disabled="submitting || !form.name || !form.prefix"
      >
        <IconSave class="w-4 h-4" />
        {{ pack ? t('creator.save') : t('creator.create') }}
      </button>
    </div>
  </form>
</template>

<!-- File Picker -->
<CloudFileDrawer
  v-model:open="iconPickerOpen"
  :allowed-types="['image']"
  :crop-aspect-ratio="1"
  usage="stickerPack.icon"
  @select="onIconSelected"
/>

<script setup lang="ts">
import { IconSave, IconSticker, IconUpload } from '#components'
import type { SnStickerPack } from '~/types/creator'
import { createStickerPack, updateStickerPack } from '~/utils/creator'
import { getFileUrl } from '~/utils/files'
import type { SnCloudFile } from '~/types/drive'

const props = defineProps<{
  pubName: string
  pack?: SnStickerPack | null
}>()

const emit = defineEmits<{
  close: []
  saved: [pack: SnStickerPack]
}>()

const { t } = useI18n()

const form = reactive({
  name: props.pack?.name ?? '',
  description: props.pack?.description ?? '',
  prefix: props.pack?.prefix ?? '',
})

const iconId = ref<string | null>(props.pack?.icon?.id ?? null)
const submitting = ref(false)
const iconPickerOpen = ref(false)

const iconUrl = computed(() => getFileUrl(iconId.value))

function pickIcon() {
  iconPickerOpen.value = true
}

function onIconSelected(file: SnCloudFile | SnCloudFile[] | null) {
  if (file && !Array.isArray(file)) {
    iconId.value = file.id
  }
}

async function handleSubmit() {
  submitting.value = true
  try {
    let result: SnStickerPack
    if (props.pack) {
      result = await updateStickerPack(props.pack.id, {
        name: form.name,
        description: form.description,
        prefix: form.prefix,
        iconId: iconId.value,
      })
    } else {
      result = await createStickerPack(props.pubName, {
        name: form.name,
        description: form.description,
        prefix: form.prefix,
        iconId: iconId.value,
      })
    }
    emit('saved', result)
  } catch (e) {
    console.error(e)
  } finally {
    submitting.value = false
  }
}
</script>
