<template>
  <div class="space-y-3">
    <template v-for="(prop, propName) in resolvedProperties" :key="propName">
      <div class="flex items-start gap-2">
        <div class="flex-1 min-w-0">
          <!-- Label -->
          <label class="flex items-center gap-1.5 mb-1">
            <span class="text-xs font-semibold text-base-content/70">
              {{ propName }}
            </span>
            <span v-if="isRequired(propName as string)" class="text-[10px] text-error font-bold">*</span>
            <span v-if="prop.type" class="text-[10px] text-base-content/30 font-mono">
              {{ prop.format || prop.type }}
            </span>
            <span v-if="prop.enum" class="text-[10px] text-base-content/30 font-mono">
              enum
            </span>
          </label>

          <!-- Enum: select -->
          <select
            v-if="prop.enum"
            class="select select-sm w-full"
            :value="modelValue?.[propName as string] ?? ''"
            @change="updateField(propName as string, ($event.target as HTMLSelectElement).value)"
          >
            <option value="">--</option>
            <option v-for="opt in prop.enum" :key="opt" :value="opt">{{ opt }}</option>
          </select>

          <!-- Boolean: checkbox -->
          <label
            v-else-if="prop.type === 'boolean'"
            class="flex items-center gap-2 cursor-pointer"
          >
            <input
              type="checkbox"
              class="checkbox checkbox-sm"
              :checked="modelValue?.[propName as string] ?? false"
              @change="updateField(propName as string, ($event.target as HTMLInputElement).checked)"
            />
            <span class="text-xs text-base-content/50">{{ modelValue?.[propName as string] ? 'true' : 'false' }}</span>
          </label>

          <!-- Integer / Number -->
          <input
            v-else-if="prop.type === 'integer' || prop.type === 'number'"
            type="number"
            class="input input-sm w-full"
            :value="modelValue?.[propName as string] ?? ''"
            :placeholder="prop.example?.toString() || '0'"
            @input="updateField(propName as string, toNum(($event.target as HTMLInputElement).value))"
          />

          <!-- Array of objects: expandable list -->
          <div v-else-if="prop.type === 'array' && prop.items?.properties" class="space-y-2">
            <div
              v-for="(item, idx) in (modelValue?.[propName as string] || [])"
              :key="idx"
              class="relative border border-base-300/30 rounded-lg p-3 bg-base-100"
            >
              <button
                class="absolute top-1 right-1 btn btn-ghost btn-xs btn-square"
                @click="removeArrayItem(propName as string, Number(idx))"
              >
                <IconX class="w-3.5 h-3.5" />
              </button>
              <SchemaForm
                :schema="prop.items"
                :schemas="schemas"
                :model-value="item"
                @update:model-value="updateArrayItem(propName as string, Number(idx), $event)"
              />
            </div>
            <button class="btn btn-ghost btn-xs" @click="addArrayItem(propName as string, prop.items)">
              <IconPlus class="w-3.5 h-3.5" /> Add
            </button>
          </div>

          <!-- Array of simple types -->
          <div v-else-if="prop.type === 'array'" class="flex flex-wrap gap-1.5">
            <div
              v-for="(item, idx) in (modelValue?.[propName as string] || [])"
              :key="idx"
              class="flex items-center gap-1 bg-base-200/60 rounded-lg px-2 py-1"
            >
              <input
                type="text"
                class="bg-transparent border-0 outline-none text-xs w-20"
                :value="item"
                @input="updateArrayItemRaw(propName as string, Number(idx), ($event.target as HTMLInputElement).value)"
              />
              <button class="btn btn-ghost btn-xs btn-square h-4 min-h-0 w-4" @click="removeArrayItem(propName as string, Number(idx))">
                <IconX class="w-3 h-3" />
              </button>
            </div>
            <button class="btn btn-ghost btn-xs h-6 min-h-0" @click="addArrayItemRaw(propName as string)">
              <IconPlus class="w-3 h-3" />
            </button>
          </div>

          <!-- Nested object: collapsible -->
          <div v-else-if="prop.type === 'object' && prop.properties" class="collapse collapse-arrow bg-base-200/30 border border-base-300/20 rounded-lg">
            <input type="checkbox" />
            <div class="collapse-title text-xs font-semibold text-base-content/50 min-h-0 py-2 px-3">
              {{ propName }} ({{ Object.keys(prop.properties).length }} fields)
            </div>
            <div class="collapse-content px-3 pb-3">
              <SchemaForm
                :schema="prop"
                :schemas="schemas"
                :model-value="modelValue?.[propName as string] || {}"
                @update:model-value="updateField(propName as string, $event)"
              />
            </div>
          </div>

          <!-- $ref: resolved object -->
          <div v-else-if="prop.$ref" class="collapse collapse-arrow bg-base-200/30 border border-base-300/20 rounded-lg">
            <input type="checkbox" />
            <div class="collapse-title text-xs font-semibold text-base-content/50 min-h-0 py-2 px-3">
              {{ propName }} ({{ prop.$ref.split('/').pop() }})
            </div>
            <div class="collapse-content px-3 pb-3">
              <SchemaForm
                :schema="resolveRef(prop.$ref)"
                :schemas="schemas"
                :model-value="modelValue?.[propName as string] || {}"
                @update:model-value="updateField(propName as string, $event)"
              />
            </div>
          </div>

          <!-- String (default) -->
          <textarea
            v-else-if="isLongString(prop)"
            class="textarea textarea-sm w-full text-xs"
            rows="2"
            :value="modelValue?.[propName as string] ?? ''"
            :placeholder="prop.example?.toString() || prop.description || ''"
            @input="updateField(propName as string, ($event.target as HTMLTextAreaElement).value)"
          />
          <input
            v-else
            type="text"
            class="input input-sm w-full"
            :value="modelValue?.[propName as string] ?? ''"
            :placeholder="prop.example?.toString() || prop.description || ''"
            @input="updateField(propName as string, ($event.target as HTMLInputElement).value)"
          />

          <!-- Description hint -->
          <p v-if="prop.description" class="text-[10px] text-base-content/30 mt-0.5 leading-tight">
            {{ prop.description }}
          </p>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { IconX, IconPlus } from '#components'

interface SchemaProp {
  type?: string
  format?: string
  description?: string
  example?: any
  enum?: any[]
  properties?: Record<string, any>
  items?: any
  required?: string[]
  $ref?: string
  allOf?: any[]
}

interface Schema {
  type?: string
  properties?: Record<string, any>
  required?: string[]
  allOf?: any[]
}

const props = defineProps<{
  schema: Schema | null
  schemas: Record<string, any>
  modelValue?: Record<string, any>
}>()

const emit = defineEmits<{
  'update:model-value': [value: Record<string, any>]
}>()

const resolvedProperties = computed(() => {
  if (!props.schema) return {}

  // Handle allOf: merge all referenced schemas + inline properties
  if (props.schema.allOf) {
    const merged: Record<string, any> = {}
    for (const part of props.schema.allOf) {
      let resolved = part
      if (part.$ref) {
        resolved = resolveRef(part.$ref)
      }
      if (resolved?.properties) {
        Object.assign(merged, resolved.properties)
      }
    }
    return merged
  }

  return props.schema.properties || {}
})

const requiredFields = computed(() => {
  if (!props.schema) return []
  if (props.schema.allOf) {
    const req: string[] = []
    for (const part of props.schema.allOf) {
      let resolved = part
      if (part.$ref) resolved = resolveRef(part.$ref)
      if (resolved?.required) req.push(...resolved.required)
    }
    return req
  }
  return props.schema.required || []
})

function isRequired(name: string): boolean {
  return requiredFields.value.includes(name)
}

function resolveRef(ref: string): any {
  const name = ref.split('/').pop()
  return props.schemas[name || ''] || null
}

function isLongString(prop: SchemaProp): boolean {
  return prop.type === 'string' && (
    prop.format === 'textarea' ||
    (prop.description?.length ?? 0) > 80
  )
}

function toNum(val: string): number | null {
  if (val === '' || val === '-') return null
  const n = Number(val)
  return isNaN(n) ? null : n
}

function updateField(name: string, value: any) {
  emit('update:model-value', { ...props.modelValue, [name]: value })
}

function addArrayItem(name: string, itemSchema: any) {
  const arr = [...(props.modelValue?.[name] || [])]
  // Build default object from item schema
  const defaultItem: Record<string, any> = {}
  if (itemSchema?.properties) {
    for (const [k, v] of Object.entries(itemSchema.properties) as any) {
      if (v.type === 'string') defaultItem[k] = ''
      else if (v.type === 'integer' || v.type === 'number') defaultItem[k] = 0
      else if (v.type === 'boolean') defaultItem[k] = false
      else defaultItem[k] = null
    }
  }
  arr.push(defaultItem)
  emit('update:model-value', { ...props.modelValue, [name]: arr })
}

function removeArrayItem(name: string, idx: number) {
  const arr = [...(props.modelValue?.[name] || [])]
  arr.splice(idx, 1)
  emit('update:model-value', { ...props.modelValue, [name]: arr })
}

function updateArrayItem(name: string, idx: number, value: any) {
  const arr = [...(props.modelValue?.[name] || [])]
  arr[idx] = value
  emit('update:model-value', { ...props.modelValue, [name]: arr })
}

function addArrayItemRaw(name: string) {
  const arr = [...(props.modelValue?.[name] || [])]
  arr.push('')
  emit('update:model-value', { ...props.modelValue, [name]: arr })
}

function updateArrayItemRaw(name: string, idx: number, value: string) {
  const arr = [...(props.modelValue?.[name] || [])]
  arr[idx] = value
  emit('update:model-value', { ...props.modelValue, [name]: arr })
}
</script>
