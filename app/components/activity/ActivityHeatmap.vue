<template>
    <div class="card">
        <div class="card-body p-4">
            <div class="flex items-center justify-between">
                <h3 class="text-sm font-semibold text-base-content/70">
                    Activity
                </h3>
                <div class="flex items-center gap-2 text-xs text-base-content/50">
                    <span>Less</span>
                    <div class="flex gap-0.5">
                        <div
                            v-for="level in 5"
                            :key="level"
                            class="h-2.5 w-2.5 rounded-sm"
                            :class="getLevelClass(level - 1)"
                        />
                    </div>
                    <span>More</span>
                </div>
            </div>

            <div v-if="status === 'pending'" class="flex justify-center py-4">
                <div class="loading loading-spinner loading-sm"/>
            </div>

            <div
                v-else-if="weeks.length > 0"
                class="mt-3 overflow-x-auto"
            >
                <div class="flex gap-1 min-w-max">
                    <!-- Month labels -->
                    <div class="flex flex-col gap-1">
                        <div class="h-3"/>
                        <div
                            v-for="(month, idx) in monthLabels"
                            :key="idx"
                            class="h-3 text-[10px] text-base-content/40"
                            :style="{ marginTop: idx === 0 ? '0' : '12px' }"
                        >
                            {{ month.label }}
                        </div>
                    </div>

                    <!-- Heatmap grid -->
                    <div class="flex gap-1">
                        <div
                            v-for="(week, weekIdx) in weeks"
                            :key="weekIdx"
                            class="flex flex-col gap-1"
                        >
                            <div
                                v-for="(day, dayIdx) in week"
                                :key="dayIdx"
                                class="h-2.5 w-2.5 rounded-sm transition-colors"
                                :class="getActivityClass(day?.count || 0)"
                                :title="day ? formatTooltip(day) : ''"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div v-else class="py-4 text-center text-sm text-base-content/50">
                No activity data available
            </div>

            <div
                v-if="totalContributions > 0"
                class="mt-3 flex items-center gap-4 text-xs text-base-content/60"
            >
                <span>{{ totalContributions.toLocaleString() }} contributions in the last year</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { HeatmapData } from "~/utils/api";

interface Props {
    heatmap: HeatmapData | null;
    status?: "pending" | "success" | "error";
}

const props = defineProps<Props>();

interface DayData {
    date: Date;
    dateStr: string;
    count: number;
}

// Generate weeks data from heatmap
const weeks = computed<(DayData | null)[][]>(() => {
    if (!props.heatmap?.data) return [];

    const data = props.heatmap.data;
    const startDate = new Date(props.heatmap.startDate);
    const endDate = new Date(props.heatmap.endDate);

    // Adjust start date to previous Sunday
    const startDay = startDate.getDay();
    startDate.setDate(startDate.getDate() - startDay);

    const weeksResult: (DayData | null)[][] = [];
    let currentWeek: (DayData | null)[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate || currentWeek.length > 0) {
        if (currentWeek.length === 7) {
            weeksResult.push(currentWeek);
            currentWeek = [];
        }

        const dateStr = currentDate.toISOString().split("T")[0] as string;
        const count = (data[dateStr] as number) || 0;

        currentWeek.push({
            date: new Date(currentDate),
            dateStr,
            count,
        });

        currentDate.setDate(currentDate.getDate() + 1);
    }

    if (currentWeek.length > 0) {
        while (currentWeek.length < 7) {
            currentWeek.push(null);
        }
        weeksResult.push(currentWeek);
    }

    return weeksResult;
});

// Month labels for the heatmap
interface MonthLabel {
    label: string;
    weekIndex: number;
}

const monthLabels = computed<MonthLabel[]>(() => {
    const labels: MonthLabel[] = [];
    let lastMonth = -1;

    weeks.value.forEach((week, weekIdx) => {
        const firstDay = week.find((d): d is DayData => d !== null);
        if (firstDay) {
            const month = firstDay.date.getMonth();
            if (month !== lastMonth) {
                labels.push({
                    label: firstDay.date.toLocaleString("default", { month: "short" }),
                    weekIndex: weekIdx,
                });
                lastMonth = month;
            }
        }
    });

    return labels;
});

const totalContributions = computed(() => {
    if (!props.heatmap?.data) return 0;
    return Object.values(props.heatmap.data).reduce((a, b) => a + b, 0);
});

const maxCount = computed(() => {
    if (!props.heatmap?.data) return 0;
    return Math.max(...Object.values(props.heatmap.data), 1);
});

function getActivityClass(count: number): string {
    if (count === 0) return "bg-base-300/50";

    const ratio = count / maxCount.value;
    if (ratio <= 0.2) return "bg-primary/30";
    if (ratio <= 0.4) return "bg-primary/50";
    if (ratio <= 0.6) return "bg-primary/70";
    return "bg-primary";
}

function getLevelClass(level: number): string {
    const classes = [
        "bg-base-300/50",
        "bg-primary/30",
        "bg-primary/50",
        "bg-primary/70",
        "bg-primary",
    ];
    return classes[level] || classes[0];
}

function formatTooltip(day: DayData): string {
    const dateStr = day.date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
    return `${day.count} contributions on ${dateStr}`;
}
</script>
