<template>
  <NuxtLayout name="app">
    <div class="py-16">
      <h1 class="text-4xl font-bold text-center mb-12">Pricing</h1>

      <div class="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 px-4">
        <!-- Free Plan -->
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body items-center text-center">
            <h2 class="card-title text-2xl">Free</h2>
            <p class="text-4xl font-bold my-4">$0</p>
            <p class="text-base-content/60 mb-4">Forever free</p>
            <ul class="space-y-2 text-sm">
              <li class="flex items-center gap-2">
                <IconCheck class="w-4 h-4 text-success" />
                Browse all public content
              </li>
              <li class="flex items-center gap-2">
                <IconCheck class="w-4 h-4 text-success" />
                Join communities
              </li>
              <li class="flex items-center gap-2">
                <IconCheck class="w-4 h-4 text-success" />
                Watch livestreams
              </li>
            </ul>
          </div>
        </div>

        <!-- Premium Plan -->
        <div class="card bg-base-100 shadow-xl border-2 border-primary">
          <div class="card-body items-center text-center">
            <div class="badge badge-primary mb-2">Popular</div>
            <h2 class="card-title text-2xl">Premium</h2>
            <p class="text-4xl font-bold my-4">$4.99</p>
            <p class="text-base-content/60 mb-4">per month</p>
            <ul class="space-y-2 text-sm">
              <li class="flex items-center gap-2">
                <IconCheck class="w-4 h-4 text-success" />
                Everything in Free
              </li>
              <li class="flex items-center gap-2">
                <IconCheck class="w-4 h-4 text-success" />
                Create posts
              </li>
              <li class="flex items-center gap-2">
                <IconCheck class="w-4 h-4 text-success" />
                Premium badge
              </li>
              <li class="flex items-center gap-2">
                <IconCheck class="w-4 h-4 text-success" />
                Priority support
              </li>
            </ul>
            <button class="btn btn-primary mt-4 w-full">Upgrade Now</button>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
useHead({
  title: 'Pricing',
  meta: [{ name: 'description', content: 'Membership plans for Floating Island' }],
})
</script>
