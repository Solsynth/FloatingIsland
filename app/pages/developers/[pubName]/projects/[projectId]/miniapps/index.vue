<template>
  <NuxtLayout name="developer">
    <div class="mx-auto max-w-4xl">
      <div class="flex items-center gap-4 mb-4 -mx-4">
        <NuxtLink
          :to="`/developers/${pubName}/projects/${projectId}`"
          class="btn btn-ghost btn-sm"
        >
          <IconArrowLeft class="w-4 h-4" />
          {{ t("developer.projects.detail") }}
        </NuxtLink>
      </div>
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-2xl font-bold">Plugins</h2>
        <button class="btn btn-primary btn-sm" @click="openCreate">
          <IconPlus class="w-4 h-4" /> Create plugin
        </button>
      </div>
      <div class="card bg-base-100 shadow-sm">
        <div class="card-body p-4">
          <div v-if="loading" class="flex justify-center py-8">
            <span class="loading loading-spinner loading-lg" />
          </div>
          <div v-else-if="apps.length" class="space-y-2">
            <NuxtLink
              v-for="app in apps"
              :key="app.id"
              :to="`${base}/${app.id}`"
              class="flex items-center gap-4 rounded-xl p-3 hover:bg-base-200"
            >
              <div
                class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-content"
              >
                <IconPuzzle class="w-5 h-5" />
              </div>
              <div class="min-w-0 flex-1">
                <div class="font-medium">
                  {{ app.name || app.manifest.name }}
                </div>
                <div class="text-sm text-base-content/50">
                  {{ app.slug }} · v{{
                    app.version || app.manifest.version || "unversioned"
                  }}
                </div>
              </div>
              <span class="badge badge-sm">{{ stageLabel(app.stage) }}</span
              ><IconChevronRight class="w-5 h-5 text-base-content/30" />
            </NuxtLink>
          </div>
          <div v-else class="flex flex-col items-center py-8 text-center">
            <IconPuzzle class="w-12 h-12 text-base-content/20 mb-4" />
            <p class="text-base-content/60">No plugins yet</p>
          </div>
        </div>
      </div>
      <AdminDrawer
        :open="createOpen"
        title="Create plugin"
        @update:open="createOpen = $event"
      >
        <form class="space-y-4" @submit.prevent="handleCreate">
          <fieldset class="fieldset">
            <legend class="fieldset-legend">Slug</legend>
            <input
              v-model="form.slug"
              class="input w-full"
              required
              pattern="[a-z0-9-]+"
            />
          </fieldset>
          <fieldset class="fieldset">
            <legend class="fieldset-legend">Status</legend>
            <select v-model.number="form.stage" class="select w-full">
              <option :value="0">Development</option>
              <option :value="1">Staging</option>
              <option :value="2">Production</option>
            </select>
          </fieldset>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <fieldset class="fieldset">
              <legend class="fieldset-legend">Plugin ID</legend>
              <input
                v-model="form.manifest.id"
                class="input w-full"
                required
                placeholder="com.example.my_plugin"
              />
            </fieldset>
            <fieldset class="fieldset">
              <legend class="fieldset-legend">Name</legend>
              <input
                v-model="form.manifest.name"
                class="input w-full"
                required
                placeholder="My Plugin"
              />
            </fieldset>
            <fieldset class="fieldset">
              <legend class="fieldset-legend">Version</legend>
              <input
                v-model="form.manifest.version"
                class="input w-full"
                required
                placeholder="1.0.0"
              />
            </fieldset>
            <fieldset class="fieldset">
              <legend class="fieldset-legend">Author</legend>
              <input
                v-model="form.manifest.author"
                class="input w-full"
                placeholder="Example"
              />
            </fieldset>
            <fieldset class="fieldset sm:col-span-2">
              <legend class="fieldset-legend">Description</legend>
              <textarea
                v-model="form.manifest.description"
                class="textarea w-full"
                rows="3"
                placeholder="A short description."
              />
            </fieldset>
            <fieldset class="fieldset">
              <legend class="fieldset-legend">Entry file</legend>
              <input
                v-model="form.manifest.entry"
                class="input w-full"
                required
                placeholder="main.js"
              />
            </fieldset>
            <div class="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                class="btn btn-outline justify-start"
                @click="chooseIcon"
              >
                Choose cloud icon
              </button>
              <button
                type="button"
                class="btn btn-outline justify-start"
                @click="chooseBackground"
              >
                Choose cloud background
              </button>
            </div>
            <fieldset class="fieldset sm:col-span-2">
              <legend class="fieldset-legend">Homepage</legend>
              <input
                v-model="form.manifest.homepage"
                type="url"
                class="input w-full"
                placeholder="https://example.com/my-plugin"
              />
            </fieldset>
            <label
              class="label cursor-pointer justify-start gap-3 sm:col-span-2"
              ><input
                v-model="form.manifest.background"
                type="checkbox"
                class="toggle toggle-primary"
              /><span>Run in the background</span></label
            >
            <fieldset class="fieldset sm:col-span-2">
              <legend class="fieldset-legend">Permissions</legend>
              <TagsInputRoot
                v-model="form.permissions"
                :delimiter="/[ ,;\t\n\r]+/"
                add-on-paste
                add-on-blur
                class="input flex h-auto min-h-12 w-full flex-wrap items-center gap-2 py-2"
                ><TagsInputItem
                  v-for="permission in form.permissions"
                  :key="permission"
                  :value="permission"
                  class="badge badge-primary gap-1"
                  ><TagsInputItemText /><TagsInputItemDelete
                    class="btn btn-ghost btn-xs btn-circle" /></TagsInputItem
                ><TagsInputInput
                  class="min-w-32 flex-1 bg-transparent outline-none"
                  placeholder="Add permission"
              /></TagsInputRoot>
            </fieldset>
          </div>
          <div class="flex justify-end gap-2">
            <button
              type="button"
              class="btn btn-ghost"
              @click="createOpen = false"
            >
              {{ t("common.cancel") }}</button
            ><button class="btn btn-primary" :disabled="saving">Create</button>
          </div>
        </form>
      </AdminDrawer>
      <CloudFileDrawer
        v-model:open="filePicker.isOpen.value"
        :allowed-types="filePicker.options.value.allowedTypes"
        :crop-aspect-ratio="filePicker.options.value.cropAspectRatio"
        :allow-multiple="filePicker.options.value.allowMultiple"
        :usage="filePicker.options.value.usage"
        @select="filePicker.handleSelect"
      />
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import {
  ArrowLeft as IconArrowLeft,
  Plus as IconPlus,
  Puzzle as IconPuzzle,
  ChevronRight as IconChevronRight,
} from "@lucide/vue";
import {
  TagsInputInput,
  TagsInputItem,
  TagsInputItemDelete,
  TagsInputItemText,
  TagsInputRoot,
} from "reka-ui";
import type { MiniApp } from "~/types/developer";
import { createMiniApp, fetchMiniApps } from "~/utils/developer";
import type { SnCloudFile } from "~/types/drive";

definePageMeta({ middleware: "developer" });
const { t } = useI18n();
const route = useRoute();
const pubName = computed(() => route.params.pubName as string);
const projectId = computed(() => route.params.projectId as string);
const base = computed(
  () => `/developers/${pubName.value}/projects/${projectId.value}/miniapps`,
);
const apps = ref<MiniApp[]>([]);
const loading = ref(false);
const saving = ref(false);
const createOpen = ref(false);
const filePicker = useCloudFilePicker();
const form = reactive({
  slug: "",
  stage: 0,
  iconId: "",
  backgroundId: "",
  permissions: [] as string[],
  manifest: {
    id: "",
    name: "",
    version: "1.0.0",
    author: "",
    description: "",
    entry: "main.js",
    homepage: "",
    background: false,
  },
});

function stageLabel(stage: number) {
  return stage === 2 ? "Production" : stage === 1 ? "Staging" : "Development";
}
async function load() {
  loading.value = true;
  try {
    apps.value = await fetchMiniApps(pubName.value, projectId.value);
  } finally {
    loading.value = false;
  }
}
function openCreate() {
  form.slug = "";
  form.stage = 0;
  form.iconId = "";
  form.backgroundId = "";
  form.permissions = [];
  Object.assign(form.manifest, {
    id: "",
    name: "",
    version: "1.0.0",
    author: "",
    description: "",
    entry: "main.js",
    homepage: "",
    background: false,
  });
  createOpen.value = true;
}
async function chooseIcon() {
  const file = await filePicker.open({
    allowedTypes: ["image"],
    usage: "plugin.icon",
    cropAspectRatio: 1,
  });
  if (file && !Array.isArray(file)) form.iconId = (file as SnCloudFile).id;
}
async function chooseBackground() {
  const file = await filePicker.open({
    allowedTypes: ["image"],
    usage: "plugin.background",
    cropAspectRatio: 16 / 7,
  });
  if (file && !Array.isArray(file))
    form.backgroundId = (file as SnCloudFile).id;
}
async function handleCreate() {
  saving.value = true;
  try {
    const manifest = { ...form.manifest, permissions: form.permissions };
    await createMiniApp(pubName.value, projectId.value, {
      slug: form.slug,
      stage: form.stage,
      iconId: form.iconId || undefined,
      backgroundId: form.backgroundId || undefined,
      manifest,
    });
    createOpen.value = false;
    await load();
  } catch (error) {
    console.error(error);
  } finally {
    saving.value = false;
  }
}
watch([pubName, projectId], load, { immediate: true });
</script>
