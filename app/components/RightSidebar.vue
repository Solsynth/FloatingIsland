<template>
  <div class="space-y-4 px-2">
    <!-- Search -->
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body p-4">
        <label class="input input-bordered flex items-center gap-2">
          <IconSearch class="w-4 h-4 opacity-50" />
          <input type="text" class="grow" placeholder="Search..." />
        </label>
      </div>
    </div>

    <!-- About -->
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body p-4">
        <h3 class="font-bold text-lg">About</h3>
        <p class="text-sm text-base-content/70">
          Floating Island is a browser-based client for Solar Network.
          Explore posts, realms, publishers, and livestreams.
        </p>
      </div>
    </div>

    <!-- Legal -->
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body p-4">
        <h3 class="font-bold text-sm">Legal</h3>
        <div class="text-xs text-base-content/60 space-y-1">
          <p>Terms of Service</p>
          <p>Privacy Policy</p>
          <p>Cookie Policy</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>
