<template>
  <div class="min-h-screen bg-base-200">
    <div class="mx-auto max-w-7xl lg:px-4">
      <!-- Desktop Layout -->
      <div class="hidden lg:grid lg:grid-cols-[16rem_1fr_20rem] lg:gap-4">
        <aside class="sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
          <CreatorSidebar />
        </aside>
        <main class="min-h-screen py-4">
          <slot />
        </main>
        <aside class="sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto py-4">
          <slot name="rightbar" />
        </aside>
      </div>

      <!-- Mobile Layout -->
      <div class="lg:hidden flex flex-col min-h-screen">
        <!-- Mobile Header -->
        <header
          class="fixed top-0 left-0 right-0 z-50 border-b border-base-300 bg-base-100/95 backdrop-blur"
        >
          <div class="mx-auto max-w-2xl px-4">
            <div class="flex h-14 items-center justify-between">
              <NuxtLink to="/creators" class="btn btn-circle btn-ghost btn-sm">
                <IconArrowLeft class="w-5 h-5" />
              </NuxtLink>
              <span class="text-sm font-semibold">{{ publisherName || t('creator.title') }}</span>
              <button
                class="btn btn-circle btn-ghost btn-sm"
                @click="mobileMenuOpen = !mobileMenuOpen"
              >
                <IconMenu class="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        <!-- Mobile Nav Drawer -->
        <div
          v-if="mobileMenuOpen"
          class="fixed inset-0 z-40 bg-black/40"
          @click="mobileMenuOpen = false"
        >
          <div
            class="absolute right-0 top-14 bottom-0 w-72 bg-base-100 p-4 overflow-y-auto shadow-xl"
            @click.stop
          >
            <CreatorSidebar @navigate="mobileMenuOpen = false" />
          </div>
        </div>

        <!-- Mobile Main Content -->
        <main class="flex-1 px-4 py-3 pt-[4.5rem]">
          <slot />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IconArrowLeft, IconMenu } from '#components'

const { t } = useI18n()
const route = useRoute()
const mobileMenuOpen = ref(false)

const publisherName = computed(() => {
  const name = route.params.pubName
  return typeof name === 'string' ? name : null
})
</script>
