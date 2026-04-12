<template>
    <div
        class="confuse-spinner"
        :class="customClass"
        :style="spinnerStyle"
        aria-label="Confuse Spinner"
        role="img"
    >
        <slot v-if="$slots.default" />
        <span v-else class="confuse-spinner__text">{{
            patterns[currentIndex]
        }}</span>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";

interface Props {
    size?: number;
    speed?: number;
    color?: string;
    text?: string;
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: number;
    letterSpacing?: string;
    animationDirection?: string;
    animationFillMode?: string;
    animationPlayState?: string;
    customClass?: string;
    customStyle?: string;
}

const props = withDefaults(defineProps<Props>(), {
    size: 40,
    speed: 5,
    color: "currentColor",
    text: "o.0 0.o",
    fontSize: 16,
    fontFamily: "inherit",
    fontWeight: 400,
    letterSpacing: "0.1em",
    animationDirection: "normal",
    animationFillMode: "both",
    animationPlayState: "running",
    customClass: "",
    customStyle: "",
});

const patterns = computed(() =>
    props.text.split(/\s+/).filter((p) => p.trim().length > 0),
);
const currentIndex = ref(0);
let intervalId: ReturnType<typeof setInterval> | null = null;

const spinnerStyle = computed(() => ({
    "--spinner-size": `${props.size}px`,
    "--spinner-color": props.color,
    "--animation-speed": props.speed,
    "--animation-direction": props.animationDirection,
    "--animation-fill-mode": props.animationFillMode,
    "--animation-play-state": props.animationPlayState,
    "--text-font-size": `${props.fontSize}px`,
    "--text-font-family": props.fontFamily,
    "--text-font-weight": props.fontWeight,
    "--text-letter-spacing": props.letterSpacing,
    ...(props.customStyle ? parseCustomStyle(props.customStyle) : {}),
}));

function parseCustomStyle(styleStr: string): Record<string, string> {
    const result: Record<string, string> = {};
    styleStr.split(";").forEach((pair) => {
        const [key, ...valueParts] = pair.split(":");
        if (key && valueParts.length) {
            result[key.trim()] = valueParts.join(":").trim();
        }
    });
    return result;
}

onMounted(() => {
    const interval = Math.max(50, 1000 / props.speed);
    intervalId = setInterval(() => {
        currentIndex.value = (currentIndex.value + 1) % patterns.value.length;
    }, interval);
});

onUnmounted(() => {
    if (intervalId) {
        clearInterval(intervalId);
    }
});
</script>

<style scoped>
.confuse-spinner {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--spinner-size);
    height: var(--spinner-size);
    color: var(--spinner-color);
    text-align: center;
}

.confuse-spinner__text {
    font-size: var(--text-font-size);
    font-family: var(--text-font-family);
    font-weight: var(--text-font-weight);
    letter-spacing: var(--text-letter-spacing);
    white-space: nowrap;
    overflow: hidden;
    display: inline-block;
    transition: opacity 0.3s ease-in-out;
}
</style>
