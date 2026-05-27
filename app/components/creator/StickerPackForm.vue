<template>
  <form @submit.prevent="handleSubmit">
    <!-- Icon -->
    <div class="flex items-end gap-3 mb-4">
      <div class="w-20 h-20 rounded-lg bg-base-200 overflow-hidden">
        <img v-if="iconUrl" :src="iconUrl" class="w-full h-full object-cover" alt="Icon" />
        <div v-else class="flex items-center justify-center h-full">
          <IconSticker class="w-8 h-8 text-base-content/20" />
        </div>
      </div>
      <button type="button" class="btn btn-ghost btn-sm" @click="pickIcon">
        <IconUpload class="w-4 h-4" />
      </button>
    </div>

    <!-- Name -->
    <div class="form-control mb-4">
      <label class="label"><span class="label-text">{{ t('creator.stickers.packName') }}</span></label>
      <input v-model="form.name" type="text" class="input input-bordered w-full" required />
    </div>

    <!-- Description -->
    <div class="form-control mb-4">
      <label class="label"><span class="label-text">{{ t('creator.stickers.packDescription') }}</span></label>
      <textarea v-model="form.description" class="textarea textarea-bordered w-full" rows="3" />
    </div>

    <!-- Prefix -->
    <div class="form-control mb-6">
      <label class="label"><span class="label-text">{{ t('creator.stickers.prefix') }}</span></label>
      <input v-model="form.prefix" type="text" class="input input-bordered w-full" required />
      <label class="label"><span class="label-text-alt text-base-content/50">{{ t('creator.stickers.prefixHint') }}</span></label>
    </div>

    <!-- Submit -->
    <div class="flex justify-end gap-2">
      <button type="button" class="btn btn-ghost" @click="emit('close')">{{ t('creator.cancel') }}</button>
      <button type="submit" class="btn btn-primary" :disabled="submitting">
        {{ pack ? t('creator.save') : t('creator.create') }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { IconSticker, IconUpload } from '#components'
import type { SnStickerPack } from '~/types/creator'
import { createStickerPack, updateStickerPack } from '~/utils/creator'
import { getFileUrl } from '~/utils/files'

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

const iconUrl = computed(() => getFileUrl(iconId.value))

function pickIcon() {
  const url = prompt('Enter icon file ID:')
  if (url) iconId.value = url
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
