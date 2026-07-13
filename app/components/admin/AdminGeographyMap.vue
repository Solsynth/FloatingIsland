<template>
  <AdminCard no-padding>
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3 border-b border-base-300/20">
      <div class="flex items-center gap-3 min-w-0">
        <IconGlobe class="w-4 h-4 text-primary shrink-0" />
        <div class="min-w-0">
          <span class="text-sm font-semibold">User Geography</span>
          <p class="text-[11px] text-base-content/40 truncate">
            Aggregate GeoIP from latest auth sessions
          </p>
        </div>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <div class="join">
          <button
            v-for="opt in windowOptions"
            :key="opt.days"
            type="button"
            class="btn btn-xs join-item"
            :class="windowDays === opt.days ? 'btn-primary' : 'btn-ghost'"
            :disabled="loading"
            @click="setWindow(opt.days)"
          >
            {{ opt.label }}
          </button>
        </div>
        <div class="join">
          <button
            type="button"
            class="btn btn-xs join-item"
            :class="precision === 'country' ? 'btn-primary' : 'btn-ghost'"
            :disabled="loading"
            @click="setPrecision('country')"
          >
            Country
          </button>
          <button
            type="button"
            class="btn btn-xs join-item"
            :class="precision === 'city' ? 'btn-primary' : 'btn-ghost'"
            :disabled="loading"
            @click="setPrecision('city')"
          >
            City
          </button>
        </div>
        <button type="button" class="btn btn-ghost btn-xs" :disabled="loading" @click="reload">
          <IconRefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': loading }" />
        </button>
      </div>
    </div>

    <div
      v-if="stats"
      class="grid grid-cols-2 sm:grid-cols-3 gap-3 px-5 py-3 border-b border-base-300/15 bg-base-200/20"
    >
      <div>
        <div class="text-sm font-bold tabular-nums">{{ formatNum(stats.accountsWithLocation) }}</div>
        <div class="text-[10px] text-base-content/40 uppercase tracking-wider">With location</div>
      </div>
      <div>
        <div class="text-sm font-bold tabular-nums text-primary">{{ formatNum(totalInBuckets) }}</div>
        <div class="text-[10px] text-base-content/40 uppercase tracking-wider">In table</div>
      </div>
      <div>
        <div class="text-sm font-bold tabular-nums">{{ formatNum(rows.length) }}</div>
        <div class="text-[10px] text-base-content/40 uppercase tracking-wider">
          {{ precision === 'city' ? 'Cities' : 'Countries' }}
        </div>
      </div>
    </div>

    <div v-if="loading && !stats" class="flex justify-center py-12">
      <span class="loading loading-spinner loading-md" />
    </div>

    <div
      v-else-if="error && !stats"
      class="flex flex-col items-center justify-center py-12 px-6 text-center"
    >
      <IconMapPinOff class="w-10 h-10 text-base-content/20 mb-3" />
      <p class="text-sm text-base-content/50">{{ error }}</p>
      <p class="text-[11px] text-base-content/35 mt-1">Requires accounts.view</p>
    </div>

    <div v-else class="overflow-x-auto">
      <table class="table table-sm table-zebra">
        <thead>
          <tr class="text-xs text-base-content/50 uppercase tracking-wider">
            <th class="w-10 pl-5">#</th>
            <th>Country</th>
            <th>City</th>
            <th class="text-right">Accounts</th>
            <th class="min-w-[8rem]">Share</th>
            <th class="pr-5 text-right">Coordinates</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, idx) in rows" :key="row.key" class="hover:bg-base-200/50">
            <td class="pl-5 text-xs text-base-content/35 tabular-nums">{{ idx + 1 }}</td>
            <td>
              <div class="flex items-center gap-2 min-w-0">
                <span class="badge badge-ghost badge-xs font-mono shrink-0">{{ row.countryCode }}</span>
                <span class="text-sm truncate">{{ row.country || row.countryCode }}</span>
              </div>
            </td>
            <td>
              <span v-if="row.city" class="text-sm">{{ row.city }}</span>
              <span v-else class="text-xs text-base-content/30">—</span>
            </td>
            <td class="text-right">
              <span class="text-sm font-semibold tabular-nums">{{ formatNum(row.userCount) }}</span>
            </td>
            <td>
              <div class="flex items-center gap-2">
                <div class="flex-1 h-1.5 rounded-full bg-base-300/40 overflow-hidden min-w-[3rem]">
                  <div
                    class="h-full rounded-full bg-primary/70"
                    :style="{ width: `${row.barPct}%` }"
                  />
                </div>
                <span class="text-[11px] tabular-nums text-base-content/45 w-12 text-right">
                  {{ row.share.toFixed(1) }}%
                </span>
              </div>
            </td>
            <td class="pr-5 text-right">
              <span class="text-[11px] font-mono text-base-content/40">
                {{ row.latitude.toFixed(1) }}°, {{ row.longitude.toFixed(1) }}°
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <div
        v-if="!rows.length"
        class="flex flex-col items-center py-12 text-center px-6 max-w-md mx-auto"
      >
        <IconMapPinOff class="w-10 h-10 text-base-content/20 mb-3" />
        <p class="text-sm text-base-content/50">No accounts with GeoIP location in this window</p>
        <p class="text-[11px] text-base-content/35 mt-2 leading-relaxed">
          Sessions need a non-null <code class="text-[10px]">location</code> (country code + lat/lng).
          Check that Padlock is writing GeoIP onto auth sessions, or widen the time window.
        </p>
      </div>

      <div
        v-if="stats"
        class="flex flex-wrap items-center justify-between gap-2 px-5 py-2.5 border-t border-base-300/15 text-[11px] text-base-content/40"
      >
        <span>
          Since {{ formatDate(stats.since) }}
          · as of {{ formatDateTime(stats.calculatedAt) }}
          · precision {{ stats.precision }}
        </span>
        <span v-if="loading" class="flex items-center gap-1.5">
          <span class="loading loading-spinner loading-xs" />
          Updating…
        </span>
      </div>
    </div>
  </AdminCard>
</template>

<script setup lang="ts">
import { IconGlobe, IconRefreshCw, IconMapPinOff } from '#components'
import type { AccountGeographyStats, GeographyPrecision } from '~/types/admin'
import { fetchAccountGeographyStats } from '~/utils/admin'

interface GeoRow {
  key: string
  countryCode: string
  country?: string | null
  city?: string | null
  latitude: number
  longitude: number
  userCount: number
  share: number
  barPct: number
}

const loading = ref(false)
const error = ref<string | null>(null)
const stats = ref<AccountGeographyStats | null>(null)
/** Default to city so the City column is populated. */
const precision = ref<GeographyPrecision>('city')
const windowDays = ref(30)

const windowOptions = [
  { days: 7, label: '7d' },
  { days: 30, label: '30d' },
  { days: 90, label: '90d' },
  { days: 365, label: '1y' },
]

const totalInBuckets = computed(() =>
  (stats.value?.buckets ?? []).reduce((sum, b) => sum + b.userCount, 0),
)

const rows = computed<GeoRow[]>(() => {
  const buckets = stats.value?.buckets ?? []
  const total = totalInBuckets.value || stats.value?.accountsWithLocation || 0
  const max = buckets.length ? Math.max(...buckets.map((b) => b.userCount)) : 1
  return [...buckets]
    .sort((a, b) => b.userCount - a.userCount)
    .map((b) => ({
      key: b.city ? `${b.countryCode}:${b.city}` : b.countryCode,
      countryCode: b.countryCode,
      country: b.country,
      city: b.city,
      latitude: b.latitude,
      longitude: b.longitude,
      userCount: b.userCount,
      share: total > 0 ? (b.userCount / total) * 100 : 0,
      barPct: max > 0 ? (b.userCount / max) * 100 : 0,
    }))
})

function sinceIso(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
}

function formatNum(n: number | undefined | null): string {
  if (n === undefined || n === null) return '—'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString()
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return dateStr
  }
}

function formatDateTime(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleString()
  } catch {
    return dateStr
  }
}

async function reload() {
  loading.value = true
  error.value = null
  try {
    stats.value = await fetchAccountGeographyStats({
      since: sinceIso(windowDays.value),
      precision: precision.value,
    })
  } catch {
    error.value = 'Failed to load geography stats'
    if (!stats.value) stats.value = null
  } finally {
    loading.value = false
  }
}

function setWindow(days: number) {
  if (windowDays.value === days) return
  windowDays.value = days
  reload()
}

function setPrecision(value: GeographyPrecision) {
  if (precision.value === value) return
  precision.value = value
  reload()
}

onMounted(reload)

defineExpose({ reload })
</script>
