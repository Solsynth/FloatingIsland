<template>
  <NuxtLayout name="merchant">
    <div class="mx-auto max-w-4xl">
      <AdminPageHeader :title="t('merchant.settings.title')" />

      <!-- Merchant Info -->
      <AdminCard class="mb-5">
        <div class="flex items-center gap-4">
          <div class="avatar shrink-0">
            <div class="w-14 rounded-full">
              <img
                v-if="getFileUrl(publisher?.picture?.id)"
                :src="getFileUrl(publisher?.picture?.id)"
                :alt="publisher?.nick"
              >
              <div
                v-else
                class="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary text-lg font-bold"
              >
                {{ publisher?.nick?.slice(0, 2).toUpperCase() }}
              </div>
            </div>
          </div>
          <div class="min-w-0">
            <div class="text-base font-bold truncate">{{ publisher?.nick }}</div>
            <div class="text-sm text-base-content/50">@{{ publisher?.name }}</div>
          </div>
        </div>
      </AdminCard>

      <!-- Payout Wallet -->
      <AdminCard
        class="mb-5"
        :title="t('merchant.settings.payoutWallet')"
        :description="t('merchant.settings.payoutWalletHint')"
      >
        <div v-if="walletsLoading" class="flex justify-center py-6">
          <span class="loading loading-spinner loading-md" />
        </div>

        <div v-else-if="allWallets.length === 0" class="rounded-xl p-5 bg-base-200/60 border border-base-300/40 text-center">
          <p class="text-sm text-base-content/50">{{ t('merchant.settings.noWallets') }}</p>
          <NuxtLink to="/wallets" class="btn btn-primary btn-sm mt-3">
            {{ t('merchant.settings.createWallet') }}
          </NuxtLink>
        </div>

        <div v-else class="space-y-2">
          <label class="flex items-center gap-3 rounded-xl px-3 py-2.5 border border-base-300/40 bg-base-200/40 cursor-pointer hover:bg-base-200 transition-colors duration-150">
            <input v-model="selectedWalletId" type="radio" name="payoutWallet" :value="null" class="radio radio-sm">
            <span class="text-sm">{{ t('merchant.settings.noWallet') }}</span>
          </label>
          <label
            v-for="wallet in allWallets"
            :key="wallet.id"
            class="flex items-center gap-3 rounded-xl px-3 py-2.5 border border-base-300/40 bg-base-200/40 cursor-pointer hover:bg-base-200 transition-colors duration-150"
          >
            <input v-model="selectedWalletId" type="radio" name="payoutWallet" :value="wallet.id" class="radio radio-sm">
            <div class="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <IconWallet class="w-4 h-4 text-primary" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium truncate">{{ wallet.name || 'Wallet' }}</div>
              <div class="text-xs text-base-content/50">
                {{ formatAmount(wallet.pockets?.[0]?.amount) }} {{ wallet.pockets?.[0]?.currency || '' }}
              </div>
            </div>
            <span v-if="wallet.isPrimary" class="badge badge-sm badge-primary shrink-0">{{ t('common.default') }}</span>
          </label>
        </div>

        <div class="flex justify-end mt-4 pt-3 border-t border-base-300/40">
          <button
            type="button"
            class="btn btn-primary btn-sm min-w-[5.5rem]"
            :class="{ loading: isSaving }"
            :disabled="isSaving || selectedWalletId === currentWalletId"
            @click="handleSaveWallet"
          >
            {{ t('common.save') }}
          </button>
        </div>
      </AdminCard>

      <!-- Danger Zone -->
      <AdminCard class="!border-error/25 !bg-error/[0.03]">
        <template #header>
          <h3 class="font-semibold text-sm text-error">{{ t('merchant.settings.dangerZone') }}</h3>
        </template>
        <p class="text-sm text-base-content/55 leading-relaxed">{{ t('merchant.settings.dangerZoneHint') }}</p>
      </AdminCard>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import {
  IconWallet,
} from '#components'
import { getFileUrl } from '~/utils/files'
import type { PublisherManaged } from '~/types/creator'
import type { Wallet } from '~/utils/api'
import { fetchPublisherById, fetchManagedPublishers } from '~/utils/creator'
import { fetchWallets } from '~/utils/api'
import { updateMerchantWallet } from '~/utils/merchant'
import { useMerchant } from '~/composables/useMerchant'

definePageMeta({ middleware: 'merchant' })

const { t } = useI18n()
const { $toast } = useNuxtApp()
const route = useRoute()
const merchantRoute = useMerchant()
const pubName = computed(() => route.params.pubName as string)

const publisher = ref<PublisherManaged | null>(null)
const allWallets = ref<Wallet[]>([])
const walletsLoading = ref(false)
const selectedWalletId = ref<string | null>(null)
const currentWalletId = ref<string | null>(null)
const isSaving = ref(false)

function formatAmount(amount: number | undefined | null): string {
  if (amount == null) return '0'
  return new Intl.NumberFormat().format(amount)
}

async function loadPublisher() {
  try {
    publisher.value = await fetchPublisherById(pubName.value)
  } catch (e) {
    console.error(e)
  }
}

async function loadWallets() {
  walletsLoading.value = true
  try {
    allWallets.value = await fetchWallets()
  } catch {
    allWallets.value = []
  } finally {
    walletsLoading.value = false
  }
}

async function handleSaveWallet() {
  isSaving.value = true
  try {
    await updateMerchantWallet(pubName.value, selectedWalletId.value)
    currentWalletId.value = selectedWalletId.value
    $toast.success(t('merchant.settings.walletSaved'))
  } catch (e) {
    console.error(e)
    $toast.error(t('merchant.settings.walletSaveFailed'))
  } finally {
    isSaving.value = false
  }
}

onMounted(async () => {
  if (!merchantRoute.hasPublisherSelected.value || merchantRoute.currentPublisherName.value !== pubName.value) {
    const pubs = await fetchManagedPublishers()
    const pub = pubs.find(p => p.name === pubName.value)
    if (pub) await merchantRoute.selectPublisher(pub)
  }
  await Promise.all([loadPublisher(), loadWallets()])
})

watch(pubName, () => { loadPublisher() }, { immediate: true })
</script>
