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
    currentProject,
    currentBot,
    currentApp,
  } = storeToRefs(store)

  return {
    developers,
    currentDeveloper,
    isLoading,
    hasDeveloperSelected,
    currentPublisherName,
    currentPublisherNick,
    currentProject,
    currentBot,
    currentApp,
    loadDevelopers: store.loadDevelopers,
    selectDeveloper: store.selectDeveloper,
    selectByPublisherName: store.selectByPublisherName,
    clearSelection: store.clearSelection,
    loadProject: store.loadProject,
    loadBot: store.loadBot,
    loadApp: store.loadApp,
    clearProjectContext: store.clearProjectContext,
  }
}
