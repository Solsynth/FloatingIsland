import { defineStore } from 'pinia'
import type { Developer } from '~/types/developer'
import { fetchDevelopers } from '~/utils/developer'

export const useDeveloperStore = defineStore('developer', () => {
  const developers = ref<Developer[]>([])
  const currentDeveloper = ref<Developer | null>(null)
  const isLoading = ref(false)

  const hasDeveloperSelected = computed(() => !!currentDeveloper.value)
  const currentPublisherName = computed(
    () => currentDeveloper.value?.publisher?.name ?? null,
  )
  const currentPublisherNick = computed(
    () => currentDeveloper.value?.publisher?.nick ?? currentDeveloper.value?.publisher?.name ?? null,
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

  function selectByPublisherName(pubName: string) {
    const match = developers.value.find(
      d => d.publisher?.name === pubName,
    )
    if (match) {
      currentDeveloper.value = match
    } else if (developers.value.length > 0 && !currentDeveloper.value) {
      currentDeveloper.value = developers.value[0]
    }
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
    currentPublisherNick,
    loadDevelopers,
    selectDeveloper,
    selectByPublisherName,
    clearSelection,
  }
})
