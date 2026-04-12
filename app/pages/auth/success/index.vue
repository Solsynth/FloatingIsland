<template>
  <div class="min-h-screen bg-base-200 flex items-center justify-center px-4">
    <div class="card bg-base-100 shadow-xl max-w-md w-full">
      <div class="card-body items-center text-center">
        <div class="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
          <IconCheck class="w-8 h-8 text-success" />
        </div>
        <h2 class="text-2xl font-bold">Welcome Back!</h2>
        <p class="text-base-content/60 mt-2">You have successfully signed in.</p>
        <button class="btn btn-primary mt-6" @click="navigateTo('/')">
          Go Home
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })
</script>
