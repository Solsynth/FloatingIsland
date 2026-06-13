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
      <div class="form-control mb-4">
        <label class="label">
          <span class="label-text font-medium">{{ t('creator.stickers.packName') }}</span>
          <span class="text-xs text-error">*</span>
        </label>
        <input
          v-model="form.name"
          type="text"
          class="input input-bordered w-full"
          placeholder="My Cool Stickers"
          required
        />
      </div>

      <!-- Description -->
      <div class="form-control mb-4">
        <label class="label">
          <span class="label-text font-medium">{{ t('creator.stickers.packDescription') }}</span>
        </label>
        <textarea
          v-model="form.description"
          class="textarea textarea-bordered w-full min-h-[80px]"
          rows="3"
          placeholder="Describe your sticker pack..."
        />
      </div>

      <!-- Prefix -->
      <div class="form-control">
        <label class="label">
          <span class="label-text font-medium">{{ t('creator.stickers.prefix') }}</span>
          <span class="text-xs text-error">*</span>
        </label>
        <div class="join">
          <span class="join-item btn btn-disabled btn-sm bg-base-200/80">:</span>
          <input
            v-model="form.prefix"
            type="text"
            class="input input-bordered join-item flex-1 font-mono text-sm"
            placeholder="my-pack"
            required
          />
          <span class="join-item btn btn-disabled btn-sm bg-base-200/80">:</span>
        </div>
        <label class="label">
          <span class="label-text-alt text-base-content/40">{{ t('creator.stickers.prefixHint') }}</span>
        </label>
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
        :disabled="submitting || !form.name || !form.prefix"
      >
        <IconSave class="w-4 h-4" />
        {{ pack ? t('creator.save') : t('creator.create') }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { IconSave, IconSticker, IconUpload } from '#components'
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
