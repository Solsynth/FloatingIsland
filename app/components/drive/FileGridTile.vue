<template>
  <div
    class="rounded-xl border border-base-300 overflow-hidden transition-all cursor-pointer hover:shadow-md hover:border-primary/30 group"
    :class="{ 'border-primary/50 bg-primary/5': isSelected }"
    @click="handleClick"
    @contextmenu.prevent="$emit('contextmenu', $event)"
  >
    <!-- Preview area -->
    <div
      class="relative aspect-square bg-base-200 flex items-center justify-center"
    >
      <!-- Selection checkbox overlay -->
      <div
        v-if="isSelectionMode"
        class="absolute top-2 left-2 z-10"
        @click.stop
      >
        <input
          type="checkbox"
          class="checkbox checkbox-sm checkbox-primary"
          :checked="isSelected"
          @change="$emit('toggleSelect')"
        />
      </div>

      <!-- Image preview -->
      <img
        v-if="isImage && thumbnailUrl"
        :src="thumbnailUrl"
        class="w-full h-full object-cover"
        alt=""
      />
      <!-- Video preview -->
      <div v-else-if="isVideo" class="relative w-full h-full">
        <div class="w-full h-full bg-base-300 flex items-center justify-center">
          <IconFileVideo class="w-10 h-10 text-base-content/30" />
        </div>
        <div class="absolute inset-0 flex items-center justify-center">
          <div
            class="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center"
          >
            <IconPlay class="w-5 h-5 text-white" />
          </div>
        </div>
      </div>
      <!-- Folder -->
      <div v-else-if="file.isFolder" class="flex flex-col items-center gap-2">
        <IconFolder class="w-12 h-12 text-primary" />
        <span class="text-xs text-base-content/50"
          >{{ file.childrenCount }} {{ t("drive.items") }}</span
        >
      </div>
      <!-- Audio -->
      <div v-else-if="isAudio" class="flex flex-col items-center gap-2">
        <IconFileAudio class="w-12 h-12 text-accent" />
      </div>
      <!-- Text -->
      <div v-else-if="isText" class="flex flex-col items-center gap-2">
        <IconFileText class="w-12 h-12 text-info" />
      </div>
      <!-- Generic file -->
      <div v-else class="flex flex-col items-center gap-2">
        <IconFile class="w-12 h-12 text-base-content/30" />
      </div>

      <!-- Hover actions overlay -->
      <div
        class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100"
      >
        <button
          v-if="!file.isFolder"
          class="btn btn-circle btn-sm bg-white/90 hover:bg-white border-none"
          :title="t('drive.download')"
          @click.stop="$emit('download')"
        >
          <IconDownload class="w-4 h-4 text-base-content" />
        </button>
        <div class="dropdown dropdown-end" @click.stop>
          <button
            class="btn btn-circle btn-sm bg-white/90 hover:bg-white border-none"
          >
            <IconMoreHorizontal class="w-4 h-4 text-base-content" />
          </button>
          <ul
            class="dropdown-content menu p-2 shadow-lg bg-base-100 rounded-box w-48 z-50"
          >
            <li v-if="file.isFolder">
              <a @click="$emit('open')">
                <IconFolderOpen class="w-4 h-4" />
                {{ t("drive.open") }}
              </a>
            </li>
            <li>
              <a @click="$emit('rename')">
                <IconPencil class="w-4 h-4" />
                {{ t("drive.rename") }}
              </a>
            </li>
            <li v-if="!file.isFolder">
              <a @click="$emit('download')">
                <IconDownload class="w-4 h-4" />
                {{ t("drive.download") }}
              </a>
            </li>
            <li>
              <a class="text-error" @click="$emit('delete')">
                <IconTrash class="w-4 h-4" />
                {{ t("drive.delete") }}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- File name -->
    <div class="px-3 py-2">
      <div class="text-xs font-medium truncate">
        {{ file.name || t("drive.untitled") }}
      </div>
      <div class="text-[10px] text-base-content/50 mt-0.5">
        {{ file.isFolder ? t("drive.folder") : formatBytes(file.size) }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SnCloudFile } from "~/types/drive";
import { getFileUrl } from "~/utils/files";

const { t } = useI18n();

const props = defineProps<{
  file: SnCloudFile;
  isSelectionMode?: boolean;
  isSelected?: boolean;
}>();

const emit = defineEmits<{
  open: [];
  download: [];
  rename: [];
  delete: [];
  toggleSelect: [];
  contextmenu: [event: MouseEvent];
}>();

const isImage = computed(() => props.file.mimeType.startsWith("image/"));
const isVideo = computed(() => props.file.mimeType.startsWith("video/"));
const isAudio = computed(() => props.file.mimeType.startsWith("audio/"));
const isText = computed(() => props.file.mimeType.startsWith("text/"));

const thumbnailUrl = computed(() => {
  if (props.file.hasThumbnail) return getFileUrl(props.file.id, "thumbnail");
  else if (isImage.value) return getFileUrl(props.file.id);
  return null;
});

function handleClick() {
  if (props.isSelectionMode) {
    emit("toggleSelect");
  } else if (props.file.isFolder) {
    emit("open");
  } else {
    navigateTo(`/files/${props.file.id}`);
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
</script>
