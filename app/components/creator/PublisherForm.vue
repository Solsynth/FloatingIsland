<template>
  <div>
    <form @submit.prevent="handleSubmit">
      <!-- Background Image -->
      <div class="relative mb-16">
        <div
          class="aspect-[16/7] rounded-xl overflow-hidden bg-base-200 cursor-pointer"
          @click="pickBackground"
        >
          <img
            v-if="backgroundUrl"
            :src="backgroundUrl"
            class="w-full h-full object-cover"
            alt="Background"
          />
          <div v-else class="flex items-center justify-center h-full">
            <IconImage class="w-8 h-8 text-base-content/20" />
          </div>
        </div>
        <!-- Avatar -->
        <div
          class="absolute -bottom-10 left-4 cursor-pointer"
          @click="pickPicture"
        >
          <div class="avatar">
            <div class="w-20 rounded-full ring-4 ring-base-100">
              <img
                v-if="pictureUrl"
                :src="pictureUrl"
                alt="Avatar"
              />
              <div v-else class="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-content text-xl font-bold">
                {{ (form.nick || '?').slice(0, 2).toUpperCase() }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Username -->
      <div class="form-control mb-4">
        <label class="label">
          <span class="label-text">{{ t('creator.username') }}</span>
        </label>
        <div class="join">
          <span class="join-item btn btn-disabled btn-sm">@</span>
          <input
            v-model="form.name"
            type="text"
            class="input input-bordered join-item flex-1"
            :disabled="!!publisher"
            :placeholder="t('creator.username')"
          />
        </div>
        <label class="label">
          <span class="label-text-alt text-base-content/50">{{ t('creator.usernameHint') }}</span>
        </label>
      </div>

      <!-- Nickname -->
      <div class="form-control mb-4">
        <label class="label">
          <span class="label-text">{{ t('creator.nickname') }}</span>
        </label>
        <input
          v-model="form.nick"
          type="text"
          class="input input-bordered w-full"
          :placeholder="t('creator.nickname')"
        />
      </div>

      <!-- Bio -->
      <div class="form-control mb-4">
        <label class="label">
          <span class="label-text">{{ t('creator.bio') }}</span>
        </label>
        <textarea
          v-model="form.bio"
          class="textarea textarea-bordered w-full"
          rows="3"
          :placeholder="t('creator.bio')"
        />
      </div>

      <!-- Realm (only for creation) -->
      <div v-if="!publisher" class="form-control mb-6">
        <label class="label">
          <span class="label-text">{{ t('creator.realm') }}</span>
        </label>
        <select v-model="form.realmSlug" class="select select-bordered w-full">
          <option value="">{{ t('creator.individual') }}</option>
          <!-- Realms would be loaded here -->
        </select>
      </div>

      <!-- Submit -->
      <div class="flex justify-end gap-2">
        <button
          type="button"
          class="btn btn-ghost"
          @click="emit('close')"
        >
          {{ t('creator.cancel') }}
        </button>
        <button
          type="submit"
          class="btn btn-primary"
          :class="{ 'loading': submitting }"
          :disabled="submitting || !form.name || !form.nick"
        >
          {{ publisher ? t('creator.save') : t('creator.create') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { IconImage } from '#components'
import type { PublisherManaged } from '~/types/creator'
import { createPublisher, updatePublisher } from '~/utils/creator'
import { getFileUrl } from '~/utils/files'

const props = defineProps<{
  publisher?: PublisherManaged | null
}>()

const emit = defineEmits<{
  close: []
  saved: [publisher: PublisherManaged]
  created: [publisher: PublisherManaged]
}>()

const { t } = useI18n()

const form = reactive({
  name: props.publisher?.name ?? '',
  nick: props.publisher?.nick ?? '',
  bio: props.publisher?.bio ?? '',
  realmSlug: '',
})

const pictureId = ref<string | null>(props.publisher?.picture?.id ?? null)
const backgroundId = ref<string | null>(props.publisher?.background?.id ?? null)
const submitting = ref(false)

const pictureUrl = computed(() => getFileUrl(pictureId.value))
const backgroundUrl = computed(() => getFileUrl(backgroundId.value))

// Watch for publisher changes (when used in edit mode)
watch(() => props.publisher, (pub) => {
  if (pub) {
    form.name = pub.name
    form.nick = pub.nick
    form.bio = pub.bio ?? ''
    pictureId.value = pub.picture?.id ?? null
    backgroundId.value = pub.background?.id ?? null
  }
}, { immediate: true })

function pickPicture() {
  // TODO: implement image picker
  const url = prompt('Enter picture URL or file ID:')
  if (url) pictureId.value = url
}

function pickBackground() {
  // TODO: implement image picker
  const url = prompt('Enter background URL or file ID:')
  if (url) backgroundId.value = url
}

async function handleSubmit() {
  submitting.value = true
  try {
    let result: PublisherManaged
    if (props.publisher) {
      result = await updatePublisher(props.publisher.name, {
        nick: form.nick,
        bio: form.bio,
        pictureId: pictureId.value,
        backgroundId: backgroundId.value,
      })
      emit('saved', result)
    } else {
      result = await createPublisher({
        name: form.name,
        nick: form.nick,
        bio: form.bio,
        pictureId: pictureId.value,
        backgroundId: backgroundId.value,
        realmSlug: form.realmSlug || undefined,
      })
      emit('created', result)
    }
  } catch (e) {
    console.error(e)
  } finally {
    submitting.value = false
  }
}
</script>
