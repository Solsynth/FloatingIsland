import { defineStore } from 'pinia'
import type { PublisherManaged, PublisherMember } from '~/types/creator'
import {
  fetchManagedPublishers,
  fetchPublisherIdentity,
  fetchPublisherInvites,
} from '~/utils/creator'

export const useCreatorStore = defineStore('creator', () => {
  const managedPublishers = ref<PublisherManaged[]>([])
  const currentPublisher = ref<PublisherManaged | null>(null)
  const currentIdentity = ref<PublisherMember | null>(null)
  const invites = ref<PublisherMember[]>([])
  const isLoading = ref(false)

  const hasPublisherSelected = computed(() => !!currentPublisher.value)
  const currentPublisherName = computed(() => currentPublisher.value?.name ?? null)
  const isManager = computed(() => (currentIdentity.value?.role ?? 0) >= 50)
  const isOwner = computed(() => (currentIdentity.value?.role ?? 0) >= 100)

  async function loadManagedPublishers() {
    isLoading.value = true
    try {
      managedPublishers.value = await fetchManagedPublishers()
    } catch {
      // Error handled at the component level with toast
      managedPublishers.value = []
    } finally {
      isLoading.value = false
    }
  }

  async function selectPublisher(publisher: PublisherManaged) {
    currentPublisher.value = publisher
    currentIdentity.value = null
    try {
      currentIdentity.value = await fetchPublisherIdentity(publisher.name)
    } catch {
      // User may not be a member
    }
  }

  function clearSelection() {
    currentPublisher.value = null
    currentIdentity.value = null
  }

  async function loadInvites() {
    try {
      invites.value = await fetchPublisherInvites()
    } catch {
      invites.value = []
    }
  }

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
    loadManagedPublishers,
    selectPublisher,
    clearSelection,
    loadInvites,
  }
})
