<template>
  <div
    v-if="Array.isArray(value)"
    class="space-y-1"
    :class="align === 'right' ? 'text-right' : 'text-left'"
  >
    <CustomPayloadValue
      v-for="(item, i) in value"
      :key="i"
      :value="item"
      :align="align"
      :max-lines="maxLines"
    />
  </div>
  <div
    v-else-if="isPlainObject(value)"
    class="space-y-1"
    :class="align === 'right' ? 'text-right' : 'text-left'"
  >
    <div
      v-for="(v, k) in value as Record<string, unknown>"
      :key="k"
      class="inline-flex flex-wrap gap-1"
      :class="align === 'right' ? 'justify-end' : 'justify-start'"
    >
      <span class="font-medium">{{ k }}:</span>
      <CustomPayloadValue :value="v" :align="align" :max-lines="maxLines" />
    </div>
  </div>
  <p
    v-else
    class="font-medium"
    :class="[
      align === 'right' ? 'text-right' : 'text-left',
      maxLines ? `line-clamp-${maxLines}` : '',
    ]"
  >
    {{ display }}
  </p>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    value: unknown;
    align?: "left" | "right";
    maxLines?: number;
  }>(),
  {
    align: "left",
  },
);

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return Boolean(v) && typeof v === "object" && !Array.isArray(v);
}

function stringify(value: unknown): string {
  if (value == null) return "-";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (isPlainObject(value) && "value" in value) {
    return stringify(value.value);
  }
  return String(value);
}

const display = computed(() => stringify(props.value));
</script>
