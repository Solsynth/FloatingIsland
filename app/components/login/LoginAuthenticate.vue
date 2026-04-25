<template>
  <div class="space-y-4">
    <h3 class="text-lg font-bold">{{ factorLabel }}</h3>
    <p class="text-sm text-base-content/60">{{ factorDescription }}</p>

    <div v-if="error" class="alert alert-error text-sm">
      <IconAlertCircle class="w-4 h-4" />
      <span>{{ error }}</span>
    </div>

    <div class="form-control">
      <input
        ref="inputRef"
        :type="isPassword ? 'password' : 'text'"
        :placeholder="inputPlaceholder"
        class="input input-bordered w-full"
        :value="modelValue"
        autocomplete="off"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        @keydown.enter="$emit('submit')"
      >
    </div>

    <div class="flex gap-2">
      <button class="btn btn-ghost flex-1" @click="$emit('back')">
        Back
      </button>
      <button
        class="btn btn-primary flex-1"
        :disabled="!modelValue || submitting"
        @click="$emit('submit')"
      >
        <IconLoader v-if="submitting" class="w-4 h-4 animate-spin" />
        {{ submitLabel }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SnAuthFactor } from '~/types/auth'
import { FACTOR_TYPES } from '~/types/auth'

const props = defineProps<{
  factor: SnAuthFactor | null
  modelValue: string
  submitting: boolean
}>()

defineEmits<{
  'update:modelValue': [value: string]
  submit: []
  back: []
}>()

const inputRef = ref<HTMLInputElement | null>(null)

const isPassword = computed(() => {
  const type = props.factor?.type
  return type === 0 || type === 4 // Password or PIN
})

const factorLabel = computed(() => FACTOR_TYPES[props.factor?.type ?? -1]?.label || 'Verification')
const factorDescription = computed(() => FACTOR_TYPES[props.factor?.type ?? -1]?.description || '')
const inputPlaceholder = computed(() => isPassword.value ? 'Enter your password' : 'Enter verification code')
const submitLabel = computed(() => isPassword.value ? 'Verify' : 'Submit')

const error = ref<string | null>(null)

watch(() => props.factor, () => {
  error.value = null
}, { immediate: true })
</script>
