<template>
    <dialog
        :id="dialogId"
        class="modal"
        :class="{ 'modal-open': modelValue }"
        @close="handleClose"
    >
        <div class="modal-box max-w-lg">
            <form method="dialog">
                <button
                    class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                    @click="handleClose"
                    :disabled="isCreating"
                >
                    <IconX class="w-5 h-5" />
                </button>
            </form>

            <h3 class="text-lg font-bold mb-1">Create Realm</h3>
            <p class="text-sm text-base-content/60 mb-6">
                Create a new community space for you and your friends
            </p>

            <form class="space-y-4" @submit.prevent="handleSubmit">
                <!-- Name -->
                <div class="form-control">
                    <label class="label">
                        <span class="label-text font-medium">Name</span>
                        <span class="label-text-alt text-error" v-if="errors.name">{{ errors.name }}</span>
                    </label>
                    <input
                        v-model="form.name"
                        type="text"
                        placeholder="My Awesome Community"
                        class="input input-bordered w-full"
                        :class="{ 'input-error': errors.name }"
                        maxlength="100"
                        required
                    />
                </div>

                <!-- Slug -->
                <div class="form-control">
                    <label class="label">
                        <span class="label-text font-medium">Slug</span>
                        <span class="label-text-alt">@{{ form.slug || 'slug' }}</span>
                    </label>
                    <input
                        v-model="form.slug"
                        type="text"
                        placeholder="my-community"
                        class="input input-bordered w-full"
                        :class="{ 'input-error': errors.slug }"
                        maxlength="50"
                        pattern="[a-z0-9-]+"
                        @input="sanitizeSlug"
                        required
                    />
                    <label class="label" v-if="errors.slug">
                        <span class="label-text-alt text-error">{{ errors.slug }}</span>
                    </label>
                    <label class="label" v-else>
                        <span class="label-text-alt">Lowercase letters, numbers, and hyphens only</span>
                    </label>
                </div>

                <!-- Description -->
                <div class="form-control">
                    <label class="label">
                        <span class="label-text font-medium">Description</span>
                        <span class="label-text-alt">{{ form.description?.length || 0 }}/500</span>
                    </label>
                    <textarea
                        v-model="form.description"
                        placeholder="What is this realm about?"
                        class="textarea textarea-bordered w-full h-24 resize-none"
                        maxlength="500"
                    />
                </div>

                <!-- Type -->
                <div class="form-control">
                    <label class="label">
                        <span class="label-text font-medium">Type</span>
                    </label>
                    <div class="flex gap-3">
                        <label
                            class="flex-1 cursor-pointer"
                            :class="form.isCommunity ? 'opacity-100' : 'opacity-60'"
                        >
                            <input
                                v-model="form.isCommunity"
                                type="radio"
                                :value="true"
                                class="radio radio-primary hidden"
                            />
                            <div
                                class="card card-compact border-2 cursor-pointer transition-all"
                                :class="form.isCommunity ? 'border-primary bg-primary/5' : 'border-base-300'"
                            >
                                <div class="card-body items-center text-center">
                                    <IconUsers class="w-8 h-8" />
                                    <h4 class="font-bold">Community</h4>
                                    <p class="text-xs text-base-content/60">For groups and discussions</p>
                                </div>
                            </div>
                        </label>
                        <label
                            class="flex-1 cursor-pointer"
                            :class="!form.isCommunity ? 'opacity-100' : 'opacity-60'"
                        >
                            <input
                                v-model="form.isCommunity"
                                type="radio"
                                :value="false"
                                class="radio radio-primary hidden"
                            />
                            <div
                                class="card card-compact border-2 cursor-pointer transition-all"
                                :class="!form.isCommunity ? 'border-primary bg-primary/5' : 'border-base-300'"
                            >
                                <div class="card-body items-center text-center">
                                    <IconBuilding2 class="w-8 h-8" />
                                    <h4 class="font-bold">Organization</h4>
                                    <p class="text-xs text-base-content/60">For official entities</p>
                                </div>
                            </div>
                        </label>
                    </div>
                </div>

                <!-- Visibility -->
                <div class="form-control">
                    <label class="label cursor-pointer justify-start gap-3">
                        <input v-model="form.isPublic" type="checkbox" class="toggle toggle-primary" />
                        <div>
                            <span class="label-text font-medium">Public Realm</span>
                            <p class="text-xs text-base-content/60">
                                {{ form.isPublic
                                    ? 'Anyone can discover and join this realm'
                                    : 'Only invited members can join'
                            }}
                            </p>
                        </div>
                    </label>
                </div>

                <!-- Error -->
                <div v-if="errors.general" class="alert alert-error text-sm">
                    <IconAlertCircle class="w-4 h-4" />
                    {{ errors.general }}
                </div>

                <!-- Actions -->
                <div class="modal-action">
                    <button
                        type="button"
                        class="btn btn-ghost"
                        @click="handleClose"
                        :disabled="isCreating"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        class="btn btn-primary"
                        :disabled="isCreating || !isValid"
                    >
                        <IconLoader v-if="isCreating" class="w-4 h-4 animate-spin" />
                        <IconCheck v-else class="w-4 h-4" />
                        Create Realm
                    </button>
                </div>
            </form>
        </div>

        <!-- Backdrop -->
        <form method="dialog" class="modal-backdrop">
            <button @click="handleClose" :disabled="isCreating">close</button>
        </form>
    </dialog>
</template>

<script setup lang="ts">
import type { Realm } from '~/types/realm'
import { createRealm } from '~/utils/api'

const props = defineProps<{
    modelValue: boolean
}>()

const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    'created': [realm: Realm]
}>()

const dialogId = 'realm-create-modal'
const isCreating = ref(false)
const errors = ref<Record<string, string>>({})

const form = ref({
    name: '',
    slug: '',
    description: '',
    isPublic: true,
    isCommunity: true,
})

const isValid = computed(() => {
    return form.value.name.trim().length >= 2 &&
           form.value.slug.trim().length >= 2 &&
           /^[a-z0-9-]+$/.test(form.value.slug)
})

function sanitizeSlug() {
    form.value.slug = form.value.slug
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
}

function resetForm() {
    form.value = {
        name: '',
        slug: '',
        description: '',
        isPublic: true,
        isCommunity: true,
    }
    errors.value = {}
}

function handleClose() {
    if (isCreating.value) return
    emit('update:modelValue', false)
    setTimeout(resetForm, 300)
}

async function handleSubmit() {
    if (isCreating.value || !isValid.value) return

    isCreating.value = true
    errors.value = {}

    try {
        const realm = await createRealm({
            name: form.value.name.trim(),
            slug: form.value.slug.trim(),
            description: form.value.description.trim() || undefined,
            isPublic: form.value.isPublic,
            isCommunity: form.value.isCommunity,
        })

        emit('created', realm)
        emit('update:modelValue', false)
        resetForm()
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create realm'

        // Parse specific errors
        if (message.toLowerCase().includes('slug')) {
            errors.value.slug = 'This slug is already taken'
        } else if (message.toLowerCase().includes('name')) {
            errors.value.name = 'Invalid name'
        } else {
            errors.value.general = message
        }
    } finally {
        isCreating.value = false
    }
}

// Auto-generate slug from name
watch(() => form.value.name, (name) => {
    if (!form.value.slug || form.value.slug === generateSlug(form.value.name.slice(0, -1))) {
        form.value.slug = generateSlug(name)
    }
})

function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 50)
}

// Open/close dialog
watch(() => props.modelValue, (isOpen) => {
    const dialog = document.getElementById(dialogId) as HTMLDialogElement
    if (dialog) {
        if (isOpen && !dialog.open) {
            dialog.showModal()
        } else if (!isOpen && dialog.open) {
            dialog.close()
        }
    }
})
</script>
