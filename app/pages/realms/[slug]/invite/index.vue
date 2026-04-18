<template>
  <div class="min-h-screen bg-base-200 flex items-center justify-center px-4">
    <div class="card bg-base-100 shadow-xl max-w-md w-full">
      <div class="card-body">
        <ConfuseSpinner v-if="realmStatus === 'pending'" message="Processing invite..." />

        <template v-else-if="realm">
          <h2 class="card-title text-xl mb-2">Join {{ realm.name }}</h2>
          <p class="text-base-content/60 mb-4">
            You have been invited to join this realm.
          </p>
          <div v-if="realm.description" class="text-sm text-base-content/70 mb-4">
            {{ realm.description }}
          </div>
          <div class="flex gap-2">
            <button class="btn btn-ghost flex-1" @click="navigateTo('/')">Cancel</button>
            <button class="btn btn-primary flex-1" @click="handleAccept">Accept</button>
          </div>
        </template>

        <div v-else class="alert alert-error">
          <IconAlertCircle class="w-4 h-4" />
          <span>Invalid or expired invite</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { fetchRealm } from '~/utils/api'

definePageMeta({ layout: false })

const route = useRoute()
const realmSlug = computed(() => route.params.slug as string)

const { data: realm, status: realmStatus } = await useAsyncData(
  () => `realm-invite-${realmSlug.value}`,
  () => fetchRealm(realmSlug.value),
  {
    watch: [realmSlug],
    default: () => null,
  },
)

async function handleAccept() {
  navigateTo(`/realms/${route.params.slug}`)
}
</script>
