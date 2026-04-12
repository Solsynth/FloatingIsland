<template>
  <div class="min-h-screen bg-base-200 flex items-center justify-center px-4">
    <div class="card bg-base-100 shadow-xl max-w-md w-full">
      <div class="card-body">
        <h2 class="card-title text-xl mb-4">Captcha Verification</h2>
        <p class="text-sm text-base-content/60 mb-4">
          Please complete the captcha to continue.
        </p>

        <!-- Captcha widget placeholder -->
        <div class="p-6 bg-base-200 rounded-lg text-center">
          <IconShieldCheck class="w-12 h-12 text-base-content/30 mx-auto mb-2" />
          <p class="text-sm">Captcha widget would render here</p>
        </div>

        <div class="mt-4">
          <button class="btn btn-primary w-full" @click="navigateTo('/auth/login')">
            Back to Login
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })
</script>
