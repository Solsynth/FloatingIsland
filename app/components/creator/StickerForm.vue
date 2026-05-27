<template>
  <form @submit.prevent="handleSubmit">
    <!-- Image -->
    <div class="flex items-end gap-3 mb-4">
      <div class="w-20 h-20 rounded-lg bg-base-200 overflow-hidden">
        <img v-if="imageUrl" :src="imageUrl" class="w-full h-full object-contain" alt="Sticker" />
        <div v-else class="flex items-center justify-center h-full">
          <IconImage class="w-8 h-8 text-base-content/20" />
        </div>
      </div>
      <button type="button" class="btn btn-ghost btn-sm" @click="pickImage">
        <IconUpload class="w-4 h-4" />
      </button>
    </div>

    <!-- Name -->
    <div class="form-control mb-4">
      <label class="label"><span class="label-text">Name</span></label>
      <input v-model="form.name" type="text" class="input input-bordered w-full" />
    </div>

    <!-- Slug -->
    <div class="form-control mb-4">
      <label class="label"><span class="label-text">{{ t('creator.stickers.stickerSlug') }}</span></label>
      <input v-model="form.slug" type="text" class="input input-bordered w-full" required />
      <label class="label"><span class="label-text-alt text-base-content/50">{{ t('creator.stickers.stickerSlugHint') }}</span></label>
    </div>

    <!-- Size -->
    <div class="form-control mb-4">
      <label class="label"><span class="label-text">{{ t('creator.stickers.size') }}</span></label>
      <select v-model="form.size" class="select select-bordered w-full">
        <option :value="0">{{ t('creator.stickers.sizeAuto') }}</option>
        <option :value="1">{{ t('creator.stickers.sizeSmall') }}</option>
        <option :value="2">{{ t('creator.stickers.sizeMedium') }}</option>
        <option :value="3">{{ t('creator.stickers.sizeLarge') }}</option>
      </select>
    </div>

    <!-- Mode -->
    <div class="form-control mb-6">
      <label class="label"><span class="label-text">{{ t('creator.stickers.mode') }}</span></label>
      <select v-model="form.mode" class="select select-bordered w-full">
        <option :value="0">{{ t('creator.stickers.modeSticker') }}</option>
        <option :value="1">{{ t('creator.stickers.modeEmote') }}</option>
      </select>
    </div>

    <!-- Submit -->
    <div class="flex justify-end gap-2">
      <button type="button" class="btn btn-ghost" @click="emit('close')">{{ t('creator.cancel') }}</button>
      <button type="submit" class="btn btn-primary" :disabled="submitting || !form.slug">
        {{ sticker ? t('creator.save') : t('creator.create') }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { IconImage, IconUpload } from '#components'
import type { SnSticker } from '~/types/creator'
import { createSticker, updateSticker } from '~/utils/creator'
import { getFileUrl } from '~/utils/files'

const props = defineProps<{
  packId: string
  sticker?: SnSticker | null
}>()

const emit = defineEmits<{
  close: []
  saved: [sticker: SnSticker]
}>()

const { t } = useI18n()

const form = reactive({
  name: props.sticker?.name ?? '',
  slug: props.sticker?.slug ?? '',
  size: props.sticker?.size ?? 0,
  mode: props.sticker?.mode ?? 0,
})

const imageId = ref<string | null>(props.sticker?.image?.id ?? null)
const submitting = ref(false)

const imageUrl = computed(() => getFileUrl(imageId.value))

function pickImage() {
  const url = prompt('Enter image file ID:')
  if (url) imageId.value = url
}

async function handleSubmit() {
  if (!imageId.value && !props.sticker) return
  submitting.value = true
  try {
    let result: SnSticker
    if (props.sticker) {
      result = await updateSticker(props.packId, props.sticker.id, {
        name: form.name || null,
        slug: form.slug,
        imageId: imageId.value ?? undefined,
        size: form.size,
        mode: form.mode,
      })
    } else {
      result = await createSticker(props.packId, {
        name: form.name || undefined,
        slug: form.slug,
        imageId: imageId.value!,
        size: form.size,
        mode: form.mode,
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
