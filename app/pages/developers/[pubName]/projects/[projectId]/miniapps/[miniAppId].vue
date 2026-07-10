<template>
  <NuxtLayout name="developer">
    <div class="mx-auto max-w-4xl">
      <NuxtLink :to="base" class="btn btn-ghost btn-sm mb-4"
        ><IconArrowLeft class="w-4 h-4" /> Plugins</NuxtLink
      >
      <div v-if="app" class="space-y-6">
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body p-5">
            <div class="flex items-start justify-between gap-4">
              <div>
                <h2 class="text-2xl font-bold">
                  {{ app.name || app.manifest.name }}
                </h2>
                <p class="text-base-content/50 font-mono">
                  {{ app.slug }} ·
                  {{ app.manifest.version || app.version || "unversioned" }}
                </p>
              </div>
              <span class="badge">{{ stageLabel(app.stage) }}</span>
            </div>
            <p class="mt-4 text-base-content/70">
              {{ app.description || app.manifest.description }}
            </p>
          </div>
        </div>
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body p-5">
            <h3 class="font-bold mb-3">Manifest</h3>
            <form class="space-y-3" @submit.prevent="saveManifest">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <fieldset class="fieldset">
                  <legend class="fieldset-legend">Plugin ID</legend>
                  <input
                    v-model="manifestForm.id"
                    class="input w-full"
                    required
                  />
                </fieldset>
                <fieldset class="fieldset">
                  <legend class="fieldset-legend">Name</legend>
                  <input
                    v-model="manifestForm.name"
                    class="input w-full"
                    required
                  />
                </fieldset>
                <fieldset class="fieldset">
                  <legend class="fieldset-legend">Version</legend>
                  <input
                    v-model="manifestForm.version"
                    class="input w-full"
                    required
                  />
                </fieldset>
                <fieldset class="fieldset">
                  <legend class="fieldset-legend">Status</legend>
                  <select v-model.number="stage" class="select w-full">
                    <option :value="0">Development</option>
                    <option :value="1">Staging</option>
                    <option :value="2">Production</option>
                  </select>
                </fieldset>
                <fieldset class="fieldset">
                  <legend class="fieldset-legend">Author</legend>
                  <input v-model="manifestForm.author" class="input w-full" />
                </fieldset>
                <fieldset class="fieldset sm:col-span-2">
                  <legend class="fieldset-legend">Description</legend>
                  <textarea
                    v-model="manifestForm.description"
                    class="textarea w-full"
                    rows="3"
                  />
                </fieldset>
                <fieldset class="fieldset">
                  <legend class="fieldset-legend">Entry file</legend>
                  <input
                    v-model="manifestForm.entry"
                    class="input w-full"
                    required
                  />
                </fieldset>
                <fieldset class="fieldset sm:col-span-2">
                  <legend class="fieldset-legend">Homepage</legend>
                  <input
                    v-model="manifestForm.homepage"
                    type="url"
                    class="input w-full"
                  />
                </fieldset>
                <label
                  class="label cursor-pointer justify-start gap-3 sm:col-span-2"
                  ><input
                    v-model="manifestForm.background"
                    type="checkbox"
                    class="toggle toggle-primary"
                  /><span>Run in the background</span></label
                >
                <fieldset class="fieldset sm:col-span-2">
                  <legend class="fieldset-legend">Permissions</legend>
                  <TagsInputRoot
                    v-model="manifestPermissions"
                    :delimiter="/[ ,;\t\n\r]+/"
                    add-on-paste
                    add-on-blur
                    class="input flex h-auto min-h-12 w-full flex-wrap items-center gap-2 py-2"
                    ><TagsInputItem
                      v-for="permission in manifestPermissions"
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
                <div
                  class="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3"
                >
                  <button
                    type="button"
                    class="btn btn-outline justify-start"
                    @click="chooseIcon"
                  >
                    Choose cloud icon</button
                  ><button
                    type="button"
                    class="btn btn-outline justify-start"
                    @click="chooseBackground"
                  >
                    Choose cloud background
                  </button>
                </div>
              </div>
              <button class="btn btn-primary" :disabled="savingManifest">
                <IconSave class="w-4 h-4" /> Save manifest
              </button>
            </form>
          </div>
        </div>
        <div class="card bg-base-100 shadow-sm">
          <div class="card-body p-5">
            <h3 class="font-bold mb-3">Package</h3>
            <div
              v-if="hasPackage"
              class="rounded-xl border border-success/30 bg-success/5 p-4 mb-4"
            >
              <div class="flex items-center gap-2 text-success font-semibold">
                <IconPackageCheck class="w-4 h-4" />
                Package uploaded
              </div>
              <div class="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <div>
                  <div class="text-xs text-base-content/50">Size</div>
                  <div>{{ formatBytes(app.packageSize) }}</div>
                </div>
                <div>
                  <div class="text-xs text-base-content/50">SHA-256</div>
                  <div class="font-mono text-xs break-all">
                    {{ app.packageSha256 }}
                  </div>
                </div>
                <div>
                  <div class="text-xs text-base-content/50">Storage key</div>
                  <div class="font-mono text-xs break-all">
                    {{ app.packageStorageKey || app.packageKey }}
                  </div>
                </div>
              </div>
              <a
                v-if="app.packageUrl"
                :href="app.packageUrl"
                class="btn btn-outline btn-sm mt-4"
                target="_blank"
                rel="noopener"
              >
                <IconDownload class="w-4 h-4" /> Download package
              </a>
            </div>
            <div
              v-else
              class="rounded-xl border border-base-300/50 bg-base-200/30 p-4 mb-4 text-sm text-base-content/60"
            >
              No package uploaded yet.
            </div>
            <input
              type="file"
              accept=".zip,application/zip"
              class="file-input w-full"
              @change="onFile"
            />
            <p v-if="packageResult" class="mt-3 text-sm text-success break-all">
              {{ packageResult.fileName }} · {{ packageResult.size }} bytes ·
              {{ packageResult.sha256 }}
            </p>
            <button
              class="btn btn-primary mt-4"
              :disabled="!file || uploading"
              @click="upload"
            >
              <IconUpload class="w-4 h-4" /> Upload ZIP
            </button>
            <p class="text-xs text-base-content/50 mt-2">
              ZIP must be no larger than 5 MiB and contain a valid
              manifest.json.
            </p>
          </div>
        </div>
        <CloudFileDrawer
          v-model:open="filePicker.isOpen.value"
          :allowed-types="filePicker.options.value.allowedTypes"
          :crop-aspect-ratio="filePicker.options.value.cropAspectRatio"
          :allow-multiple="filePicker.options.value.allowMultiple"
          :usage="filePicker.options.value.usage"
          @select="filePicker.handleSelect"
        />
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import {
  ArrowLeft as IconArrowLeft,
  Upload as IconUpload,
  Save as IconSave,
  PackageCheck as IconPackageCheck,
  Download as IconDownload,
} from "@lucide/vue";
import {
  TagsInputInput,
  TagsInputItem,
  TagsInputItemDelete,
  TagsInputItemText,
  TagsInputRoot,
} from "reka-ui";
import type { MiniApp, PluginPackageResult } from "~/types/developer";
import type { SnCloudFile } from "~/types/drive";
import {
  fetchMiniApp,
  updateMiniApp,
  uploadMiniAppPackage,
} from "~/utils/developer";

definePageMeta({ middleware: "developer" });
const route = useRoute();
const pubName = computed(() => route.params.pubName as string);
const projectId = computed(() => route.params.projectId as string);
const miniAppId = computed(() => route.params.miniAppId as string);
const base = computed(
  () => `/developers/${pubName.value}/projects/${projectId.value}/miniapps`,
);
const app = ref<MiniApp | null>(null);
const file = ref<File | null>(null);
const uploading = ref(false);
const packageResult = ref<PluginPackageResult | null>(null);
const filePicker = useCloudFilePicker();
const savingManifest = ref(false);
const stage = ref(0);
const hasPackage = computed(() =>
  Boolean(
    app.value?.packageUrl ||
      app.value?.packageStorageKey ||
      app.value?.packageKey ||
      app.value?.packageSha256,
  ),
);
const manifestForm = reactive({
  id: "",
  name: "",
  version: "",
  author: "",
  description: "",
  entry: "",
  icon: "",
  homepage: "",
  background: false,
});
const manifestPermissions = ref<string[]>([]);
function stageLabel(stage: number) {
  return stage === 2 ? "Production" : stage === 1 ? "Staging" : "Development";
}
function onFile(event: Event) {
  file.value = (event.target as HTMLInputElement).files?.[0] || null;
}
function formatBytes(size?: number | null) {
  if (!size) return "Unknown";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KiB`;
  return `${(size / (1024 * 1024)).toFixed(2)} MiB`;
}
async function load() {
  try {
    app.value = await fetchMiniApp(
      pubName.value,
      projectId.value,
      miniAppId.value,
    );
    if (app.value) {
      stage.value = app.value.stage;
      const {
        icon: _icon,
        permissions,
        ...editableManifest
      } = app.value.manifest;
      Object.assign(manifestForm, editableManifest);
      manifestPermissions.value = [...(permissions || [])];
    }
  } catch {
    app.value = null;
  }
}
async function chooseIcon() {
  const file = await filePicker.open({
    allowedTypes: ["image"],
    usage: "plugin.icon",
    cropAspectRatio: 1,
  });
  if (file && !Array.isArray(file))
    await updateMiniApp(pubName.value, projectId.value, miniAppId.value, {
      iconId: (file as SnCloudFile).id,
    });
}
async function chooseBackground() {
  const file = await filePicker.open({
    allowedTypes: ["image"],
    usage: "plugin.background",
    cropAspectRatio: 16 / 7,
  });
  if (file && !Array.isArray(file))
    await updateMiniApp(pubName.value, projectId.value, miniAppId.value, {
      backgroundId: (file as SnCloudFile).id,
    });
}
async function saveManifest() {
  savingManifest.value = true;
  try {
    await updateMiniApp(pubName.value, projectId.value, miniAppId.value, {
      stage: stage.value,
      manifest: { ...manifestForm, permissions: manifestPermissions.value },
    });
    await load();
  } finally {
    savingManifest.value = false;
  }
}
async function upload() {
  if (!file.value || file.value.size > 5 * 1024 * 1024) return;
  uploading.value = true;
  try {
    packageResult.value = await uploadMiniAppPackage(
      pubName.value,
      projectId.value,
      miniAppId.value,
      file.value,
    );
    await load();
  } finally {
    uploading.value = false;
  }
}
watch([pubName, projectId, miniAppId], load, { immediate: true });
</script>
