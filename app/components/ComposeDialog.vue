<template>
  <dialog id="compose-dialog" class="modal" ref="dialogRef">
    <div class="modal-box max-w-2xl">
      <form method="dialog">
        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" @click="$emit('close')">
          <IconX class="w-5 h-5" />
        </button>
      </form>

      <h3 class="text-lg font-bold mb-4">
        {{ isEditing ? 'Edit Post' : replyingTo ? 'Reply' : forwardingTo ? 'Forward' : 'New Post' }}
      </h3>

      <!-- Publisher Selector -->
      <div v-if="publishers.length > 1" class="mb-4">
        <select
          v-model="currentPublisherName"
          class="select select-bordered w-full"
          @change="onPublisherChange"
        >
          <option v-for="pub in publishers" :key="pub.id" :value="pub.name">
            {{ pub.nick || pub.name }}
          </option>
        </select>
      </div>

      <!-- Title -->
      <input
        v-model="titleVal"
        type="text"
        placeholder="Title (optional)"
        class="input input-bordered w-full mb-2"
      />

      <!-- Description -->
      <input
        v-model="descVal"
        type="text"
        placeholder="Description (optional)"
        class="input input-bordered w-full mb-2"
      />

      <!-- Content -->
      <textarea
        v-model="contentVal"
        placeholder="What's on your mind?"
        class="textarea textarea-bordered w-full h-40"
      />

      <!-- Visibility -->
      <div class="mt-3">
        <select v-model="visibilityVal" class="select select-bordered w-full max-w-xs">
          <option :value="0">Public</option>
          <option :value="1">Friends Only</option>
          <option :value="2">Unlisted</option>
          <option :value="3">Private</option>
        </select>
      </div>

      <!-- Reply/Forward context -->
      <div v-if="replyingTo" class="mt-3 p-3 bg-base-200 rounded text-sm">
        <p class="font-semibold">Replying to:</p>
        <p class="line-clamp-2 text-base-content/70">{{ replyingTo.content }}</p>
      </div>

      <!-- Submit -->
      <div class="modal-action">
        <button class="btn btn-ghost" @click="closeDialog">Cancel</button>
        <button
          class="btn btn-primary"
          :disabled="submitting || !contentVal.trim()"
          @click="handleSubmit"
        >
          <IconLoader v-if="submitting" class="w-4 h-4 animate-spin" />
          {{ isEditing ? 'Save' : 'Post' }}
        </button>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button @click="$emit('close')">close</button>
    </form>
  </dialog>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  close: []
}>()

const {
  title: titleVal,
  description: descVal,
  content: contentVal,
  visibility: visibilityVal,
  submitting,
  publishers,
  currentPublisher,
  replyingTo,
  forwardingTo,
  originalPost,
  reset,
  setCurrentPublisher,
} = useCompose()

const dialogRef = ref<HTMLDialogElement | null>(null)
const isEditing = computed(() => !!originalPost.value)
const currentPublisherName = computed({
  get: () => currentPublisher.value?.name || '',
  set: (val: string) => {
    const pub = publishers.value.find((p) => p.name === val)
    if (pub) setCurrentPublisher(pub)
  },
})

function onPublisherChange() {
  // handled by computed setter
}

function closeDialog() {
  emit('close')
}

async function handleSubmit() {
  // TODO: Implement actual post submission via API
  submitting.value = true
  try {
    // Simulate API call
    await new Promise((r) => setTimeout(r, 500))
    reset()
    emit('close')
  } finally {
    submitting.value = false
  }
}

// Watch for dialog open and init publishers
watch(dialogRef, (el) => {
  if (el && el.open) {
    // Initialize publishers if not set
    if (publishers.value.length === 0) {
      // Load from API or use default
    }
  }
})
</script>
