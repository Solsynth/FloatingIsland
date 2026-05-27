<template>
  <form @submit.prevent="handleSubmit">
    <!-- Slug -->
    <div class="form-control mb-4">
      <label class="label"><span class="label-text">{{ t('creator.collections.slug') }}</span></label>
      <input v-model="form.slug" type="text" class="input input-bordered w-full" :disabled="!!collection" required />
      <label class="label"><span class="label-text-alt text-base-content/50">{{ t('creator.collections.slugHint') }}</span></label>
    </div>

    <!-- Name -->
    <div class="form-control mb-4">
      <label class="label"><span class="label-text">{{ t('creator.collections.name') }}</span></label>
      <input v-model="form.name" type="text" class="input input-bordered w-full" />
    </div>

    <!-- Description -->
    <div class="form-control mb-6">
      <label class="label"><span class="label-text">{{ t('creator.collections.description') }}</span></label>
      <textarea v-model="form.description" class="textarea textarea-bordered w-full" rows="3" />
    </div>

    <!-- Submit -->
    <div class="flex justify-end gap-2">
      <button type="button" class="btn btn-ghost" @click="emit('close')">{{ t('creator.cancel') }}</button>
      <button type="submit" class="btn btn-primary" :disabled="submitting || !form.slug">
        {{ collection ? t('creator.save') : t('creator.create') }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
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
