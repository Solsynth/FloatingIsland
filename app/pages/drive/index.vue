<template>
  <NuxtLayout name="app">
    <div
      class="bg-base-100 rounded-xl border border-base-300 shadow-sm overflow-hidden"
    >
      <div class="flex flex-col min-h-[calc(100vh-4rem)]">
        <!-- Header -->
        <div
          class="sticky top-0 z-10 border-b border-base-300 bg-base-100/95 backdrop-blur"
        >
          <div class="flex items-center justify-between px-4 py-3">
            <div class="flex items-center gap-3">
              <button
                v-if="state.currentFolderId"
                class="btn btn-ghost btn-sm btn-circle"
                @click="navigateBack"
              >
                <IconArrowLeft class="w-5 h-5" />
              </button>
              <button v-else class="btn btn-ghost btn-sm btn-circle">
                <IconHardDrive class="w-5 h-5" />
              </button>
              <div class="flex items-center gap-2">
                <h1 class="text-lg font-semibold">{{ t("drive.title") }}</h1>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <!-- Selection mode -->
              <button
                class="btn btn-ghost btn-sm btn-circle"
                :class="{ 'text-primary': state.isSelectionMode }"
                :title="t('drive.select')"
                @click="toggleSelectionMode"
              >
                <IconCheckSquare class="w-5 h-5" />
              </button>

              <!-- View mode toggle -->
              <div class="btn-group">
                <button
                  class="btn btn-ghost btn-sm btn-circle"
                  :class="{
                    'btn-active bg-primary/10': state.viewMode === 'list',
                  }"
                  :title="t('drive.listView')"
                  @click="setViewMode('list')"
                >
                  <IconList class="w-5 h-5" />
                </button>
                <button
                  class="btn btn-ghost btn-sm btn-circle"
                  :class="{
                    'btn-active bg-primary/10': state.viewMode === 'grid',
                  }"
                  :title="t('drive.gridView')"
                  @click="setViewMode('grid')"
                >
                  <IconLayoutGrid class="w-5 h-5" />
                </button>
              </div>

              <!-- Sort dropdown -->
              <div class="dropdown dropdown-end">
                <button class="btn btn-ghost btn-sm gap-1">
                  <IconArrowUpDown class="w-4 h-4" />
                  <span class="hidden sm:inline text-xs">{{ sortLabel }}</span>
                </button>
                <ul
                  class="dropdown-content menu p-2 shadow-lg bg-base-100 rounded-box w-48 z-50"
                >
                  <li>
                    <a
                      :class="{ active: state.sortField === 'date' }"
                      @click="setSort('date')"
                    >
                      <IconClock class="w-4 h-4" />
                      {{ t("drive.sortDate") }}
                      <IconArrowDown
                        v-if="
                          state.sortField === 'date' &&
                          state.sortDirection === 'desc'
                        "
                        class="w-3 h-3 ml-auto"
                      />
                      <IconArrowUp
                        v-if="
                          state.sortField === 'date' &&
                          state.sortDirection === 'asc'
                        "
                        class="w-3 h-3 ml-auto"
                      />
                    </a>
                  </li>
                  <li>
                    <a
                      :class="{ active: state.sortField === 'name' }"
                      @click="setSort('name')"
                    >
                      <IconSortAZ class="w-4 h-4" />
                      {{ t("drive.sortName") }}
                      <IconArrowDown
                        v-if="
                          state.sortField === 'name' &&
                          state.sortDirection === 'desc'
                        "
                        class="w-3 h-3 ml-auto"
                      />
                      <IconArrowUp
                        v-if="
                          state.sortField === 'name' &&
                          state.sortDirection === 'asc'
                        "
                        class="w-3 h-3 ml-auto"
                      />
                    </a>
                  </li>
                  <li>
                    <a
                      :class="{ active: state.sortField === 'size' }"
                      @click="setSort('size')"
                    >
                      <IconDatabase class="w-4 h-4" />
                      {{ t("drive.sortSize") }}
                      <IconArrowDown
                        v-if="
                          state.sortField === 'size' &&
                          state.sortDirection === 'desc'
                        "
                        class="w-3 h-3 ml-auto"
                      />
                      <IconArrowUp
                        v-if="
                          state.sortField === 'size' &&
                          state.sortDirection === 'asc'
                        "
                        class="w-3 h-3 ml-auto"
                      />
                    </a>
                  </li>
                </ul>
              </div>

              <!-- More actions -->
              <div class="dropdown dropdown-end">
                <button class="btn btn-ghost btn-sm btn-circle">
                  <IconMoreVertical class="w-5 h-5" />
                </button>
                <ul
                  class="dropdown-content menu p-2 shadow-lg bg-base-100 rounded-box w-52 z-50"
                >
                  <li v-if="state.mode === 'indexed'">
                    <button @click="showCreateFolder = true">
                      <IconFolderPlus class="w-4 h-4" />
                      {{ t("drive.createFolder") }}
                    </button>
                  </li>
                  <li>
                    <button @click="triggerFileUpload">
                      <IconUpload class="w-4 h-4" />
                      {{ t("drive.uploadFile") }}
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Breadcrumb & Search -->
          <div
            class="flex items-center gap-3 px-4 pb-3"
            v-if="state.mode === 'indexed'"
          >
            <FolderBreadcrumb
              :path-stack="state.pathStack"
              @navigate="navigateToPathIndex"
            />
            <div class="flex-1" />
            <div class="relative">
              <IconSearch
                class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40"
              />
              <input
                v-model="searchQuery"
                type="text"
                class="input input-sm input-bordered pl-9 w-48 sm:w-64"
                :placeholder="t('drive.searchFiles')"
                @input="handleSearch"
              />
            </div>
          </div>

          <!-- Mode tabs -->
          <div class="flex gap-1 px-4 pb-2">
            <button
              class="btn btn-sm"
              :class="state.mode === 'indexed' ? 'btn-primary' : 'btn-ghost'"
              @click="handleSetMode('indexed')"
            >
              <IconFolder class="w-4 h-4" />
              {{ t("drive.indexedFiles") }}
            </button>
            <button
              class="btn btn-sm"
              :class="state.mode === 'unindexed' ? 'btn-primary' : 'btn-ghost'"
              @click="handleSetMode('unindexed')"
            >
              <IconPackage class="w-4 h-4" />
              {{ t("drive.unindexedFiles") }}
            </button>
            <div class="flex-1" />
            <button
              v-if="state.mode === 'unindexed'"
              class="btn btn-sm btn-ghost"
              :class="{ 'text-warning': state.recycled }"
              :title="
                state.recycled ? t('drive.showActive') : t('drive.showRecycled')
              "
              @click="handleSetRecycled(!state.recycled)"
            >
              <IconTrash2 class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Selection bar -->
        <div
          v-if="state.isSelectionMode"
          class="flex items-center gap-3 px-4 py-2 bg-primary/5 border-b border-primary/20"
        >
          <button class="btn btn-ghost btn-xs" @click="clearSelection">
            {{ t("drive.clearSelection") }}
          </button>
          <span class="text-sm text-base-content/60">
            {{ state.selectedFileIds.size }} {{ t("drive.selected") }}
          </span>
          <div class="flex-1" />
          <button
            class="btn btn-error btn-xs"
            :disabled="state.selectedFileIds.size === 0"
            @click="handleBatchDelete"
          >
            <IconTrash class="w-3.5 h-3.5" />
            {{ t("drive.deleteSelected") }}
          </button>
        </div>

        <!-- File list -->
        <div class="flex-1 overflow-y-auto px-4 py-2">
          <!-- Loading state -->
          <div
            v-if="state.isLoading && state.files.length === 0"
            class="flex items-center justify-center py-20"
          >
            <div class="loading loading-spinner loading-lg text-primary" />
          </div>

          <!-- Empty state -->
          <div
            v-else-if="!state.isLoading && state.files.length === 0"
            class="flex flex-col items-center justify-center py-20 text-center"
          >
            <div
              class="w-20 h-20 rounded-full bg-base-200 flex items-center justify-center mb-4"
            >
              <IconFolderOpen
                v-if="state.mode === 'indexed'"
                class="w-10 h-10 text-base-content/30"
              />
              <IconPackage v-else class="w-10 h-10 text-base-content/30" />
            </div>
            <h3 class="text-lg font-semibold mb-1">
              {{
                state.mode === "indexed"
                  ? t("drive.emptyFolder")
                  : t("drive.emptyAttachments")
              }}
            </h3>
            <p class="text-sm text-base-content/50 mb-4">
              {{
                state.mode === "indexed"
                  ? t("drive.emptyFolderHint")
                  : t("drive.emptyAttachmentsHint")
              }}
            </p>
            <div v-if="state.mode === 'indexed'" class="flex gap-2">
              <button class="btn btn-primary btn-sm" @click="triggerFileUpload">
                <IconUpload class="w-4 h-4" />
                {{ t("drive.uploadFile") }}
              </button>
              <button
                class="btn btn-outline btn-sm"
                @click="showCreateFolder = true"
              >
                <IconFolderPlus class="w-4 h-4" />
                {{ t("drive.createFolder") }}
              </button>
            </div>
          </div>

          <!-- List view -->
          <div v-else-if="state.viewMode === 'list'" class="space-y-1">
            <FileListTile
              v-for="file in state.files"
              :key="file.id"
              :file="file"
              :is-selection-mode="state.isSelectionMode"
              :is-selected="state.selectedFileIds.has(file.id)"
              @open="handleNavigateToFolder(file)"
              @download="handleDownload(file)"
              @rename="openRename(file)"
              @move="openMove(file)"
              @delete="handleDelete(file)"
              @toggle-select="toggleFileSelection(file.id)"
            />
          </div>

          <!-- Grid view -->
          <div
            v-else
            class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3"
          >
            <FileGridTile
              v-for="file in state.files"
              :key="file.id"
              :file="file"
              :is-selection-mode="state.isSelectionMode"
              :is-selected="state.selectedFileIds.has(file.id)"
              @open="handleNavigateToFolder(file)"
              @download="handleDownload(file)"
              @rename="openRename(file)"
              @move="openMove(file)"
              @delete="handleDelete(file)"
              @toggle-select="toggleFileSelection(file.id)"
            />
          </div>

          <!-- Load more -->
          <div v-if="state.hasMore" class="flex justify-center py-4">
            <button
              class="btn btn-outline btn-sm"
              :class="{ loading: state.isLoading }"
              :disabled="state.isLoading"
              @click="loadMore"
            >
              {{ t("drive.loadMore") }}
            </button>
          </div>
        </div>

        <!-- Storage bar (bottom) -->
        <div class="border-t border-base-300">
          <StorageBar :usage="state.usage" @details="showUsageDetails = true" />
        </div>

        <!-- Upload progress -->
        <UploadProgress
          :uploads="state.uploads"
          @clear="clearCompletedUploads"
        />

        <!-- Floating upload button -->
        <button
          class="btn btn-circle btn-primary fixed right-6 bottom-6 z-40 w-14 h-14 shadow-lg"
          @click="triggerFileUpload"
        >
          <IconPlus class="w-6 h-6" />
        </button>

        <!-- Hidden file input -->
        <input
          ref="fileInputRef"
          type="file"
          class="hidden"
          multiple
          @change="handleFileSelect"
        />

        <!-- Dialogs -->
        <CreateFolderDialog
          :open="showCreateFolder"
          @close="showCreateFolder = false"
          @confirm="handleCreateFolder"
        />
        <RenameDialog
          :open="!!renamingFile"
          :current-name="renamingFile?.name || ''"
          :file="renamingFile"
          @close="renamingFile = null"
          @confirm="handleRename"
        />
        <MoveDialog
          :open="!!movingFile"
          :file="movingFile"
          :current-path="state.currentPath"
          @close="movingFile = null"
          @confirm="handleMove"
        />
        <UsageDetailsDialog
          :open="showUsageDetails"
          :usage="state.usage"
          @close="showUsageDetails = false"
        />
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { SnCloudFile } from "~/types/drive";
import { fetchDriveBreadcrumb } from "~/utils/api";

defineOgImage('UniOgImage', { title: 'Drive', description: 'Manage your files on Solar Network.' })

useSolarSeo({
  title: "Drive",
  description: "Manage your files on Solar Network.",
});

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const {
  state,
  loadFiles,
  navigateToFolder,
  navigateToPathIndex,
  loadUsage,
  setMode,
  setRecycled,
  setViewMode,
  setSort,
  setSearchQuery,
  toggleSelectionMode,
  toggleFileSelection,
  clearSelection,
  createFolder,
  renameFile,
  deleteFile,
  batchDelete,
  moveFile,
  uploadFiles,
  clearCompletedUploads,
} = useDrive();

const searchQuery = ref("");
const showCreateFolder = ref(false);
const showUsageDetails = ref(false);
const renamingFile = ref<SnCloudFile | null>(null);
const movingFile = ref<SnCloudFile | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);
let searchDebounce: ReturnType<typeof setTimeout> | null = null;

// Sync URL query params to state
const urlMode = computed(() => (route.query.mode as string) || "indexed");
const urlRecycled = computed(() => route.query.recycled === "true");
const urlFolderId = computed(() => (route.query.folder as string) || null);

// Initialize state from URL on mount
onMounted(async () => {
  // Set mode from URL
  if (urlMode.value === "unindexed") {
    setMode("unindexed");
  }

  // Set recycled from URL
  if (urlRecycled.value) {
    setRecycled(true);
  }

  // Load usage
  await loadUsage();

  // Navigate to folder if specified
  if (urlFolderId.value) {
    // Fetch breadcrumb to build path stack
    try {
      const breadcrumb = await fetchDriveBreadcrumb(urlFolderId.value);
      // Build path stack from breadcrumb (skip the file itself, only include folders)
      const pathStack: Array<{ id: string | null; name: string }> = [
        { id: null, name: "Root" },
      ];
      for (const item of breadcrumb) {
        if (item.isFolder) {
          pathStack.push({ id: item.id, name: item.name });
        }
      }
      // Update the path stack in the drive state
      state.pathStack = pathStack;
      state.currentFolderId = urlFolderId.value;
      state.currentPath =
        "/" +
        pathStack
          .slice(1)
          .map((p) => p.name)
          .join("/");
    } catch (err) {
      console.error("Failed to fetch breadcrumb:", err);
    }
    await loadFiles(urlFolderId.value);
  } else {
    await loadFiles();
  }
});

// Watch for URL changes and sync state (only mode and recycled)
watch(
  () => route.query.mode,
  (newMode) => {
    const mode = (newMode as string) || "indexed";
    if (state.mode !== mode) {
      setMode(mode as "indexed" | "unindexed");
    }
  },
);

watch(
  () => route.query.recycled,
  (newRecycled) => {
    const recycled = newRecycled === "true";
    if (state.recycled !== recycled) {
      setRecycled(recycled);
    }
  },
);

// Update URL when state changes
function updateUrl() {
  const query: Record<string, string> = {};
  if (state.mode === "unindexed") {
    query.mode = "unindexed";
  }
  if (state.recycled) {
    query.recycled = "true";
  }
  if (state.currentFolderId) {
    query.folder = state.currentFolderId;
  }

  router.replace({
    path: "/drive",
    query: Object.keys(query).length ? query : undefined,
  });
}

// Override navigateToFolder to update URL
const originalNavigateToFolder = navigateToFolder;
async function handleNavigateToFolder(folder: SnCloudFile | null) {
  await originalNavigateToFolder(folder);
  updateUrl();
}

// Override setMode to update URL
const originalSetMode = setMode;
function handleSetMode(mode: "indexed" | "unindexed") {
  originalSetMode(mode);
  updateUrl();
}

// Override setRecycled to update URL
const originalSetRecycled = setRecycled;
function handleSetRecycled(recycled: boolean) {
  originalSetRecycled(recycled);
  updateUrl();
}

const sortLabel = computed(() => {
  switch (state.sortField) {
    case "date":
      return t("drive.sortDate");
    case "name":
      return t("drive.sortName");
    case "size":
      return t("drive.sortSize");
    default:
      return "";
  }
});

function navigateBack() {
  const parentId =
    state.pathStack.length > 2
      ? state.pathStack[state.pathStack.length - 2]
      : null;
  if (parentId) {
    navigateToPathIndex(state.pathStack.length - 2);
  } else {
    handleNavigateToFolder(null);
  }
}

function handleSearch() {
  if (searchDebounce) clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => {
    setSearchQuery(searchQuery.value);
  }, 300);
}

async function loadMore() {
  await loadFiles(state.currentFolderId, false)
}

function triggerFileUpload() {
  fileInputRef.value?.click();
}

async function handleFileSelect(e: Event) {
  const input = e.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    const count = await uploadFiles(input.files);
    if (count > 0) {
      await loadUsage();
    }
    input.value = "";
  }
}

async function handleCreateFolder(name: string) {
  const success = await createFolder(name);
  if (success) {
    showCreateFolder.value = false;
  }
}

function openRename(file: SnCloudFile) {
  renamingFile.value = file;
}

async function handleRename(newName: string) {
  if (!renamingFile.value) return;
  const success = await renameFile(renamingFile.value.id, newName);
  if (success) {
    renamingFile.value = null;
  }
}

async function handleDelete(file: SnCloudFile) {
  if (confirm(t("drive.confirmDelete", { name: file.name }))) {
    await deleteFile(file.id);
  }
}

async function handleBatchDelete() {
  if (
    confirm(
      t("drive.confirmDeleteSelected", { count: state.selectedFileIds.size }),
    )
  ) {
    await batchDelete();
  }
}

function openMove(file: SnCloudFile) {
  movingFile.value = file;
}

async function handleMove(targetFolderId: string | null) {
  if (!movingFile.value) return;
  const success = await moveFile(movingFile.value.id, targetFolderId);
  if (success) {
    movingFile.value = null;
  }
}

function handleDownload(file: SnCloudFile) {
  const url = `https://api.solian.app/drive/files/${file.id}?original=true`;
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  a.click();
}
</script>
