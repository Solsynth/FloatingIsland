<template>
  <NuxtLayout name="app">
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h1 class="text-2xl font-bold mb-4">Swagger API Documentation</h1>
        <div id="swagger-ui" class="min-h-[60vh]" />
        <p class="text-base-content/50 text-sm">
          API documentation is available at
          <a href="https://api.solian.app/docs" target="_blank" class="text-primary hover:underline">
            api.solian.app/docs
          </a>
        </p>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
useHead({ title: 'API Documentation' })
</script>
