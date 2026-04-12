<template>
  <div class="navbar bg-base-100 shadow-lg px-4 lg:px-8">
    <div class="flex-1">
      <NuxtLink to="/" class="btn btn-ghost text-xl gap-2">
        <IconMountain />
        FloatingIsland
      </NuxtLink>
    </div>
    <div class="flex-none">
      <ul class="menu menu-horizontal px-1 gap-2">
        <li>
          <NuxtLink to="/">
            <IconHome class="w-4 h-4" />
            Home
          </NuxtLink>
        </li>
        <li>
          <NuxtLink to="/livestreams">
            <IconRadio class="w-4 h-4" />
            Live
          </NuxtLink>
        </li>
      </ul>
    </div>
    <div class="flex-none ml-2">
      <button class="btn btn-primary btn-sm gap-1" @click="$emit('compose')">
        <IconPlus class="w-4 h-4" />
        Post
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits<{
  compose: []
}>()
</script>
