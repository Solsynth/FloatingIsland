<template>
    <div class="min-h-screen bg-base-200 flex items-center justify-center px-4">
        <div class="w-full max-w-md">
            <!-- Logo -->
            <div class="text-center mb-8">
                <div class="inline-flex items-center gap-3">
                    <img src="/favicon.png" alt="Solar Network" class="w-10 h-10" />
                    <span class="text-2xl font-bold text-base-content">Solar Network</span>
                </div>
            </div>

            <div class="card bg-base-100 shadow-xl">
                <div class="card-body">
                    <h2 class="card-title text-2xl mb-2">Create Account</h2>

                    <div v-if="error" class="alert alert-error text-sm">
                        <IconAlertCircle class="w-4 h-4" />
                        <span>{{ error }}</span>
                    </div>

                    <!-- Step 1-5 indicator -->
                    <div class="flex items-center gap-1 mb-4">
                        <div
                            v-for="i in 5"
                            :key="i"
                            class="flex-1 h-1 rounded-full transition-colors"
                            :class="i <= currentStep ? 'bg-primary' : 'bg-base-300'"
                        />
                    </div>

                    <!-- Step 1: Username -->
                    <div v-if="currentStep === 1" class="space-y-3">
                        <div class="form-control">
                            <label class="label"><span class="label-text">Username</span></label>
                            <input
                                v-model="form.name"
                                type="text"
                                placeholder="Choose a username"
                                class="input input-bordered w-full"
                                @keydown.enter="nextStep"
                            />
                        </div>
                    </div>

                    <!-- Step 2: Nickname -->
                    <div v-if="currentStep === 2" class="space-y-3">
                        <div class="form-control">
                            <label class="label"><span class="label-text">Display Name</span></label>
                            <input
                                v-model="form.nick"
                                type="text"
                                placeholder="Your display name"
                                class="input input-bordered w-full"
                                @keydown.enter="nextStep"
                            />
                        </div>
                    </div>

                    <!-- Step 3: Email -->
                    <div v-if="currentStep === 3" class="space-y-3">
                        <div class="form-control">
                            <label class="label"><span class="label-text">Email</span></label>
                            <input
                                v-model="form.email"
                                type="email"
                                placeholder="your@email.com"
                                class="input input-bordered w-full"
                                @keydown.enter="nextStep"
                            />
                        </div>
                    </div>

                    <!-- Step 4: Password -->
                    <div v-if="currentStep === 4" class="space-y-3">
                        <div class="form-control">
                            <label class="label"><span class="label-text">Password</span></label>
                            <input
                                v-model="form.password"
                                type="password"
                                placeholder="Create a password"
                                class="input input-bordered w-full"
                                @keydown.enter="nextStep"
                            />
                        </div>
                    </div>

                    <!-- Step 5: Captcha & Submit -->
                    <div v-if="currentStep === 5" class="space-y-3">
                        <p class="text-sm text-base-content/60">Complete the captcha to create your account</p>
                        <CaptchaWidget @verified="form.captchaToken = $event" />
                    </div>

                    <div class="flex gap-2 mt-6">
                        <button v-if="currentStep > 1" class="btn btn-ghost flex-1" @click="currentStep--">
                            Back
                        </button>
                        <button
                            class="btn btn-primary flex-1"
                            :disabled="!canProceed || submitting"
                            @click="currentStep === 5 ? handleSubmit() : nextStep()"
                        >
                            <IconLoader v-if="submitting" class="w-4 h-4 animate-spin" />
                            {{ currentStep === 5 ? 'Create Account' : 'Continue' }}
                        </button>
                    </div>

                    <div class="text-center mt-4">
                        <NuxtLink to="/auth/login" class="text-sm text-primary hover:underline">
                            Already have an account? Sign in
                        </NuxtLink>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const form = reactive({
    name: '',
    nick: '',
    email: '',
    password: '',
    captchaToken: '',
})

const currentStep = ref(1)
const submitting = ref(false)
const error = ref<string | null>(null)

const canProceed = computed(() => {
    switch (currentStep.value) {
        case 1: return form.name.length >= 2
        case 2: return form.nick.length >= 1
        case 3: return form.email.includes('@')
        case 4: return form.password.length >= 6
        case 5: return form.captchaToken.length > 0
        default: return false
    }
})

function nextStep() {
    if (canProceed.value && currentStep.value < 5) {
        currentStep.value++
    }
}

async function handleSubmit() {
    submitting.value = true
    error.value = null

    try {
        const { createAccount } = await import('~/utils/api')
        await createAccount({
            name: form.name,
            nick: form.nick,
            email: form.email,
            password: form.password,
            language: 'en',
            captchaToken: form.captchaToken,
        })

        navigateTo('/auth/success')
    } catch (e) {
        error.value = e instanceof Error ? e.message : 'Failed to create account'
    } finally {
        submitting.value = false
    }
}
</script>
