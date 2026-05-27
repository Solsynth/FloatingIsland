import { storeToRefs } from 'pinia'
import { useCreatorStore } from '~/stores/creator'

export function useCreator() {
  const store = useCreatorStore()
  const {
    managedPublishers,
    currentPublisher,
    currentIdentity,
    invites,
    isLoading,
    hasPublisherSelected,
    currentPublisherName,
    isManager,
    isOwner,
  } = storeToRefs(store)

  return {
    managedPublishers,
    currentPublisher,
    currentIdentity,
    invites,
    isLoading,
    hasPublisherSelected,
    currentPublisherName,
    isManager,
    isOwner,
    loadManagedPublishers: store.loadManagedPublishers,
    selectPublisher: store.selectPublisher,
    clearSelection: store.clearSelection,
    loadInvites: store.loadInvites,
  }
}
