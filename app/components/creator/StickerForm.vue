<template>
  <form @submit.prevent="handleSubmit">
    <AdminCard
      :title="sticker ? 'Edit Sticker' : 'New Sticker'"
      description="Add a sticker to your sticker pack"
      class="mb-6"
    >
      <!-- Image Upload -->
      <div class="flex items-start gap-4 mb-6 p-4 rounded-xl bg-base-200/50 border border-dashed border-base-300/50">
        <div class="w-20 h-20 rounded-xl bg-base-200 overflow-hidden shrink-0 border border-base-300/30">
          <img
            v-if="imageUrl"
            :src="imageUrl"
            class="w-full h-full object-contain"
            alt="Sticker"
          />
          <div v-else class="flex items-center justify-center h-full">
            <IconImage class="w-8 h-8 text-base-content/20" />
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <p class="text-sm font-medium">Image</p>
          <p class="text-xs text-base-content/40">Upload the sticker image asset</p>
          <button type="button" class="btn btn-ghost btn-sm w-fit" @click="pickImage">
            <IconUpload class="w-4 h-4" />
            {{ imageId ? 'Change' : 'Upload' }}
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Name -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">Name</span>
          </label>
          <input
            v-model="form.name"
            type="text"
            class="input input-bordered w-full"
            placeholder="My Sticker"
          />
        </div>

        <!-- Slug -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">{{ t('creator.stickers.stickerSlug') }}</span>
            <span class="text-xs text-error">*</span>
          </label>
          <input
            v-model="form.slug"
            type="text"
            class="input input-bordered w-full font-mono text-sm"
            placeholder="my-sticker"
            required
          />
          <label class="label">
            <span class="label-text-alt text-base-content/40">{{ t('creator.stickers.stickerSlugHint') }}</span>
          </label>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        <!-- Size -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">{{ t('creator.stickers.size') }}</span>
          </label>
          <select v-model="form.size" class="select select-bordered w-full">
            <option :value="0">{{ t('creator.stickers.sizeAuto') }}</option>
            <option :value="1">{{ t('creator.stickers.sizeSmall') }}</option>
            <option :value="2">{{ t('creator.stickers.sizeMedium') }}</option>
            <option :value="3">{{ t('creator.stickers.sizeLarge') }}</option>
          </select>
        </div>

        <!-- Mode -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">{{ t('creator.stickers.mode') }}</span>
          </label>
          <select v-model="form.mode" class="select select-bordered w-full">
            <option :value="0">{{ t('creator.stickers.modeSticker') }}</option>
            <option :value="1">{{ t('creator.stickers.modeEmote') }}</option>
          </select>
        </div>
      </div>
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
        :disabled="submitting || !form.slug || (!imageId && !sticker)"
      >
        <IconSave class="w-4 h-4" />
        {{ sticker ? t('creator.save') : t('creator.create') }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { IconSave, IconImage, IconUpload } from '#components'
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
