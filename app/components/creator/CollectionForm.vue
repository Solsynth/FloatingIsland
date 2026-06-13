<template>
  <form @submit.prevent="handleSubmit">
    <AdminCard
      :title="collection ? 'Edit Collection' : 'New Collection'"
      description="Organize your posts into collections"
      class="mb-6"
    >
      <!-- Slug -->
      <div class="form-control mb-4">
        <label class="label">
          <span class="label-text font-medium">{{ t('creator.collections.slug') }}</span>
          <span class="text-xs text-error">*</span>
        </label>
        <div class="join">
          <span class="join-item btn btn-disabled btn-sm bg-base-200/80">/</span>
          <input
            v-model="form.slug"
            type="text"
            class="input input-bordered join-item flex-1 font-mono text-sm"
            :disabled="!!collection"
            placeholder="my-collection"
            required
          />
        </div>
        <label class="label">
          <span class="label-text-alt text-base-content/40">{{ t('creator.collections.slugHint') }}</span>
        </label>
      </div>

      <!-- Name -->
      <div class="form-control mb-4">
        <label class="label">
          <span class="label-text font-medium">{{ t('creator.collections.name') }}</span>
        </label>
        <input
          v-model="form.name"
          type="text"
          class="input input-bordered w-full"
          placeholder="My Collection"
        />
      </div>

      <!-- Description -->
      <div class="form-control mb-2">
        <label class="label">
          <span class="label-text font-medium">{{ t('creator.collections.description') }}</span>
        </label>
        <textarea
          v-model="form.description"
          class="textarea textarea-bordered w-full min-h-[80px]"
          rows="3"
          placeholder="Describe this collection..."
        />
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
        :disabled="submitting || !form.slug"
      >
        <IconSave class="w-4 h-4" />
        {{ collection ? t('creator.save') : t('creator.create') }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { IconSave } from '#components'
import type { SnPostCollection } from '~/types/creator'
import { createCollection, updateCollection } from '~/utils/creator'

const props = defineProps<{
  pubName: string
  collection?: SnPostCollection | null
}>()

const emit = defineEmits<{
  close: []
  saved: [collection: SnPostCollection]
}>()

const { t } = useI18n()

const form = reactive({
  slug: props.collection?.slug ?? '',
  name: props.collection?.name ?? '',
  description: props.collection?.description ?? '',
})

const submitting = ref(false)

async function handleSubmit() {
  submitting.value = true
  try {
    let result: SnPostCollection
    if (props.collection) {
      result = await updateCollection(props.pubName, props.collection.slug, {
        name: form.name || null,
        description: form.description || null,
      })
    } else {
      result = await createCollection(props.pubName, {
        slug: form.slug,
        name: form.name || null,
        description: form.description || null,
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
