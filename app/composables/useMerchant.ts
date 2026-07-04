import { storeToRefs } from 'pinia'
import { useMerchantStore } from '~/stores/merchant'

export function useMerchant() {
  const store = useMerchantStore()
  const {
    managedPublishers,
    currentPublisher,
    currentIdentity,
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
    isLoading,
    hasPublisherSelected,
    currentPublisherName,
    isManager,
    isOwner,
    loadManagedPublishers: store.loadManagedPublishers,
    selectPublisher: store.selectPublisher,
    clearSelection: store.clearSelection,
  }
}
