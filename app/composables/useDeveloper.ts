import { storeToRefs } from 'pinia'
import { useDeveloperStore } from '~/stores/developer'

export function useDeveloper() {
  const store = useDeveloperStore()
  const {
    developers,
    currentDeveloper,
    isLoading,
    hasDeveloperSelected,
    currentPublisherName,
  } = storeToRefs(store)

  return {
    developers,
    currentDeveloper,
    isLoading,
    hasDeveloperSelected,
    currentPublisherName,
    loadDevelopers: store.loadDevelopers,
    selectDeveloper: store.selectDeveloper,
    clearSelection: store.clearSelection,
  }
}
