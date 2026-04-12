<template>
  <div class="w-full h-screen bg-black overflow-hidden">
    <iframe
      :src="chatUrl"
      class="w-full h-full border-0"
      allow="microphone; camera"
    />
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const chatUrl = computed(() => `/embeds/livestreams/${route.params.id}/chat`)
</script>
