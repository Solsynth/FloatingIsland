import { defineStore } from 'pinia'
import type { Developer, DeveloperPublisher } from '~/types/developer'
import { fetchDevelopers } from '~/utils/developer'

export const useDeveloperStore = defineStore('developer', () => {
  const developers = ref<Developer[]>([])
  const currentDeveloper = ref<Developer | null>(null)
  const isLoading = ref(false)

  const hasDeveloperSelected = computed(() => !!currentDeveloper.value)
  const currentPublisherName = computed(
    () => currentDeveloper.value?.publisher?.name ?? null,
  )

  async function loadDevelopers() {
    isLoading.value = true
    try {
      developers.value = await fetchDevelopers()
    } finally {
      isLoading.value = false
    }
  }

  function selectDeveloper(developer: Developer) {
    currentDeveloper.value = developer
  }

  function clearSelection() {
    currentDeveloper.value = null
  }

  return {
    developers,
    currentDeveloper,
    isLoading,
    hasDeveloperSelected,
    currentPublisherName,
    loadDevelopers,
    selectDeveloper,
    clearSelection,
  }
})
