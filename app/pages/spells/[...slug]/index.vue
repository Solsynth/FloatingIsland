<template>
  <div class="min-h-screen bg-base-200 flex items-center justify-center px-4">
    <div class="card bg-base-100 shadow-xl max-w-md w-full">
      <div class="card-body">
        <ConfuseSpinner v-if="loading" message="Processing spell..." />

        <template v-else-if="spell">
          <h2 class="card-title text-xl mb-2">Spell Activated</h2>
          <div class="space-y-2 text-sm">
            <p><strong>Type:</strong> {{ spell.type }}</p>
            <p><strong>Account:</strong> @{{ spell.account.name }}</p>
            <p><strong>Applied:</strong> {{ new Date(spell.affectedAt).toLocaleString() }}</p>
            <p v-if="spell.expiredAt"><strong>Expires:</strong> {{ new Date(spell.expiredAt).toLocaleString() }}</p>
          </div>
          <button class="btn btn-primary mt-4" @click="navigateTo('/')">Done</button>
        </template>

        <template v-else-if="applySuccess">
          <div class="text-center">
            <IconWand2 class="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 class="text-xl font-bold mb-2">Spell Applied!</h2>
            <p class="text-base-content/60">Your spell has been successfully applied.</p>
            <button class="btn btn-primary mt-4" @click="navigateTo('/')">Done</button>
          </div>
        </template>

        <div v-else class="alert alert-error">
          <IconAlertCircle class="w-4 h-4" />
          <span>Invalid spell</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const route = useRoute()
const spellWord = computed(() => (route.params.slug as string[])?.join('/') || '')

const { data: spell, pending: loading } = await useFetch(
  () => `/api/spells/${spellWord.value}`,
  {
    key: (word) => `spell-${word}`,
    default: () => null,
  }
)

const applySuccess = computed(() => !loading.value && !spell.value)
</script>
