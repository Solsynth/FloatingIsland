<template>
  <div
    class="flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors cursor-pointer hover:bg-base-200 group"
    :class="{ 'bg-primary/10 border border-primary/30': isSelected }"
    @click="handleClick"
    @contextmenu.prevent="$emit('contextmenu', $event)"
  >
    <!-- Selection checkbox -->
    <label v-if="isSelectionMode" class="cursor-pointer" @click.stop>
      <input
        type="checkbox"
        class="checkbox checkbox-sm checkbox-primary"
        :checked="isSelected"
        @change="$emit('toggleSelect')"
      />
    </label>

    <!-- File icon/preview -->
    <div
      class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
      :class="iconBgClass"
    >
      <IconFolder v-if="file.isFolder" class="w-5 h-5 text-primary" />
      <img
        v-else-if="isImage && thumbnailUrl"
        :src="thumbnailUrl"
        class="w-10 h-10 rounded-lg object-cover"
        alt=""
      />
      <IconFileVideo v-else-if="isVideo" class="w-5 h-5 text-secondary" />
      <IconFileAudio v-else-if="isAudio" class="w-5 h-5 text-accent" />
      <IconFileText v-else-if="isText" class="w-5 h-5 text-info" />
      <IconFile v-else class="w-5 h-5 text-base-content/50" />
    </div>

    <!-- File info -->
    <div class="flex-1 min-w-0">
      <div class="text-sm font-medium truncate">
        {{ file.name || t("drive.untitled") }}
      </div>
      <div class="flex items-center gap-2 text-xs text-base-content/50">
        <span v-if="file.isFolder"
          >{{ file.childrenCount }} {{ t("drive.items") }}</span
        >
        <span v-else>{{ formatBytes(file.size) }}</span>
        <span>{{ formatDate(file.createdAt) }}</span>
      </div>
    </div>

    <!-- Actions -->
    <div
      class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
      @click.stop
    >
      <button
        v-if="!file.isFolder"
        class="btn btn-ghost btn-xs"
        :title="t('drive.download')"
        @click="$emit('download')"
      >
        <IconDownload class="w-4 h-4" />
      </button>
      <div class="dropdown dropdown-end" @click.stop>
        <button class="btn btn-ghost btn-xs" :title="t('drive.more')">
          <IconMoreHorizontal class="w-4 h-4" />
        </button>
        <ul
          class="dropdown-content menu p-2 shadow-lg bg-base-100 rounded-box w-48 z-50"
        >
          <li v-if="file.isFolder">
            <button @click.stop="$emit('open')">
              <IconFolderOpen class="w-4 h-4" />
              {{ t("drive.open") }}
            </button>
          </li>
          <li v-if="!file.isFolder">
            <a :href="fileUrl" target="_blank" @click.stop>
              <IconExternalLink class="w-4 h-4" />
              {{ t("drive.openInNewTab") }}
            </a>
          </li>
          <li>
            <button @click.stop="$emit('rename')">
              <IconPencil class="w-4 h-4" />
              {{ t("drive.rename") }}
            </button>
          </li>
          <li v-if="!file.isFolder">
            <button @click.stop="$emit('download')">
              <IconDownload class="w-4 h-4" />
              {{ t("drive.download") }}
            </button>
          </li>
          <li>
            <button @click.stop="$emit('move')">
              <IconFolderInput class="w-4 h-4" />
              {{ t("drive.move") }}
            </button>
          </li>
          <li>
            <button class="text-error" @click.stop="$emit('delete')">
              <IconTrash class="w-4 h-4" />
              {{ t("drive.delete") }}
            </button>
          </li>
        </ul>
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
  move: [];
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

const fileUrl = computed(() => getFileUrl(props.file.id) || "#");

const iconBgClass = computed(() => {
  if (props.file.isFolder) return "bg-primary/10";
  if (isImage.value) return "bg-secondary/10";
  if (isVideo.value) return "bg-accent/10";
  if (isAudio.value) return "bg-info/10";
  return "bg-base-200";
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

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return diffMins <= 1 ? "just now" : `${diffMins}m ago`;
    }
    return `${diffHours}h ago`;
  }
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 365) {
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  }
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
</script>
