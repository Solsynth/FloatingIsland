<template>
  <form @submit.prevent="handleSubmit">
    <!-- Profile Media Section -->
    <AdminCard title="Profile Media" description="Upload your publisher banner and avatar" class="mb-6">
      <!-- Background Image -->
      <div class="relative mb-16">
        <div
          class="aspect-[16/7] rounded-xl overflow-hidden bg-base-200/80 cursor-pointer border-2 border-dashed border-base-300/50 hover:border-primary/30 transition-all group"
          @click="pickBackground"
        >
          <img
            v-if="backgroundUrl"
            :src="backgroundUrl"
            class="w-full h-full object-cover"
            alt="Background"
          />
          <div v-else class="flex flex-col items-center justify-center h-full gap-2">
            <IconImage class="w-8 h-8 text-base-content/20 group-hover:text-primary/40 transition-colors" />
            <span class="text-xs text-base-content/30 group-hover:text-base-content/50 transition-colors">
              Click to upload
            </span>
          </div>
        </div>
        <!-- Avatar -->
        <div
          class="absolute -bottom-10 left-4 cursor-pointer group"
          @click="pickPicture"
        >
          <div class="avatar">
            <div class="w-20 rounded-full ring-4 ring-base-100">
              <img
                v-if="pictureUrl"
                :src="pictureUrl"
                alt="Avatar"
              />
              <div v-else class="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary text-xl font-bold">
                {{ (form.nick || '?').slice(0, 2).toUpperCase() }}
              </div>
            </div>
          </div>
          <div class="absolute inset-0 flex items-center justify-center rounded-full bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
            <IconCamera class="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    </AdminCard>

    <!-- Profile Details Section -->
    <AdminCard title="Profile Details" description="Manage your publisher identity and public information" class="mb-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Username -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">{{ t('creator.username') }}</span>
            <span v-if="!publisher" class="text-xs text-error">*</span>
          </label>
          <div class="join">
            <span class="join-item btn btn-disabled btn-sm bg-base-200/80">@</span>
            <input
              v-model="form.name"
              type="text"
              class="input input-bordered join-item flex-1"
              :disabled="!!publisher"
              :placeholder="t('creator.username')"
            />
          </div>
          <label class="label">
            <span class="label-text-alt text-base-content/40">{{ t('creator.usernameHint') }}</span>
          </label>
        </div>

        <!-- Nickname -->
        <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">{{ t('creator.nickname') }}</span>
            <span class="text-xs text-error">*</span>
          </label>
          <input
            v-model="form.nick"
            type="text"
            class="input input-bordered w-full"
            :placeholder="t('creator.nickname')"
          />
        </div>
      </div>

      <!-- Bio -->
      <div class="form-control mt-2">
        <label class="label">
          <span class="label-text font-medium">{{ t('creator.bio') }}</span>
        </label>
        <textarea
          v-model="form.bio"
          class="textarea textarea-bordered w-full min-h-[100px]"
          rows="3"
          :placeholder="t('creator.bio')"
        />
        <label class="label">
          <span class="label-text-alt text-base-content/40">Markdown supported</span>
        </label>
      </div>

      <!-- Realm (only for creation) -->
      <div v-if="!publisher" class="form-control mt-4">
        <label class="label">
          <span class="label-text font-medium">{{ t('creator.realm') }}</span>
        </label>
        <select v-model="form.realmSlug" class="select select-bordered w-full max-w-xs">
          <option value="">{{ t('creator.individual') }}</option>
        </select>
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
      <div class="flex items-center gap-2">
        <button
          type="submit"
          class="btn btn-primary min-w-[120px]"
          :class="{ 'loading': submitting }"
          :disabled="submitting || !form.name || !form.nick"
        >
          <IconSave class="w-4 h-4" />
          {{ publisher ? t('creator.save') : t('creator.create') }}
        </button>
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { IconSave, IconImage, IconCamera } from '#components'
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
  const url = prompt('Enter picture URL or file ID:')
  if (url) pictureId.value = url
}

function pickBackground() {
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
