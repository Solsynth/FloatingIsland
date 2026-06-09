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
    currentPublisherNick,
  } = storeToRefs(store)

  return {
    developers,
    currentDeveloper,
    isLoading,
    hasDeveloperSelected,
    currentPublisherName,
    currentPublisherNick,
    loadDevelopers: store.loadDevelopers,
    selectDeveloper: store.selectDeveloper,
    selectByPublisherName: store.selectByPublisherName,
    clearSelection: store.clearSelection,
  }
}
