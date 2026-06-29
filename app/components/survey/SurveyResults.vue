<template>
  <div class="space-y-4">
    <div v-for="q in questions" :key="'r-'+q.id" class="card bg-base-100 shadow-sm">
      <div class="card-body p-5">
        <div class="font-medium text-sm mb-3">{{ q.title }}</div>

        <!-- Choice results -->
        <div v-if="q.type === 0 || q.type === 1 || q.type === 2" class="space-y-2">
          <div v-for="opt in choiceOptions(q)" :key="opt.id" class="space-y-1">
            <div class="flex justify-between text-xs">
              <span>{{ opt.label }}</span>
              <span class="text-base-content/50">{{ statValue(q.id, opt.id) }} ({{ statPct(q.id, opt.id) }}%)</span>
            </div>
            <progress
              class="progress h-4 w-full"
              :class="opt.color"
              :value="statPct(q.id, opt.id)"
              max="100"
            ></progress>
          </div>
        </div>

        <!-- Rating average -->
        <div v-if="q.type === 3" class="flex items-center gap-3">
          <div class="text-3xl font-bold">{{ ratingAvg(q.id) }}</div>
          <div class="flex items-center gap-1">
            <IconStar
              v-for="i in 5"
              :key="i"
              class="w-5 h-5"
              :class="i <= Math.round(Number(ratingAvg(q.id))) ? 'text-warning fill-current' : 'text-base-content/20'"
            />
          </div>
          <span class="text-xs text-base-content/40">/ {{ q.maxValue || 5 }}</span>
        </div>

        <!-- Free text -->
        <div v-if="q.type === 4" class="text-sm text-base-content/50">
          {{ totalCount }} {{ t('surveys.responses') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IconStar } from '#components'
import type { SnSurveyQuestion } from '~/types/creator'

const { t } = useI18n()

const props = defineProps<{
  questions: SnSurveyQuestion[]
  stats: Record<string, Record<string, number>>
}>()

const progressColors = [
  'progress-primary',
  'progress-secondary',
  'progress-accent',
  'progress-info',
  'progress-success',
  'progress-warning',
]

const totalCount = computed(() => {
  if (!props.questions.length) return 0
  const first = props.questions[0]
  const s = props.stats[first.id]
  if (!s) return 0
  return Object.values(s).reduce((sum, v) => sum + v, 0)
})

function choiceOptions(q: SnSurveyQuestion) {
  if (q.type === 2) {
    return [
      { id: 'true', label: t('surveys.yes'), color: progressColors[0] },
      { id: 'false', label: t('surveys.no'), color: progressColors[1] },
    ]
  }
  return (q.options || []).map((opt, i) => ({
    ...opt,
    color: progressColors[i % progressColors.length],
  }))
}

function statValue(qid: string, optId: string): number {
  return props.stats[qid]?.[optId] ?? 0
}

function statPct(qid: string, optId: string): number {
  const s = props.stats[qid]
  if (!s) return 0
  const total = Object.values(s).reduce((sum, v) => sum + v, 0)
  if (!total) return 0
  const count = s[optId] ?? 0
  return Math.round((count / total) * 100)
}

function ratingAvg(qid: string): string {
  const v = props.stats[qid]?.rating
  if (v === undefined || v === null) return '—'
  return Number(v).toFixed(1)
}
</script>
