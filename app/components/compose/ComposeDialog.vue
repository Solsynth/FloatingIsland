<template>
  <ClientOnly>
  <DrawerRoot :open="isOpen" @update:open="handleDrawerClose">
    <DrawerPortal>
      <DrawerOverlay class="fixed inset-0 bg-black/40 z-50" />
      <DrawerContent
        class="fixed bottom-0 left-0 right-0 mx-auto z-50 bg-base-100 rounded-t-2xl h-[80vh] flex flex-col max-w-2xl"
      >
        <!-- Drag handle -->
        <div class="flex justify-center pt-3 pb-2">
          <div class="w-10 h-1 rounded-full bg-base-content/20" />
        </div>

        <!-- Header -->
        <div
          class="flex items-center justify-between px-4 py-3 border-b border-base-200"
        >
          <div class="flex items-center gap-3">
            <button
              class="btn btn-sm btn-circle btn-ghost"
              @click="handleClose"
            >
              <IconX class="w-5 h-5" />
            </button>
            <h3 class="font-semibold">{{ dialogTitle }}</h3>
          </div>

          <div class="flex items-center gap-2">
            <span
              v-if="lastSaved"
              class="text-xs text-base-content/50 hidden sm:block"
            >
              Saved {{ formatTimeAgo(lastSaved) }}
            </span>

            <button
              class="btn btn-sm btn-circle btn-ghost"
              :title="showPreview ? 'Back to editor' : 'Preview'"
              @click="showPreview = !showPreview"
            >
              <IconEye class="w-5 h-5" />
            </button>

            <button
              class="btn btn-sm btn-circle btn-ghost"
              title="Settings"
              @click="showSettingsPanel = true"
            >
              <IconSettings class="w-5 h-5" />
            </button>

            <button
              class="btn btn-sm btn-primary gap-2"
              :disabled="!canSubmit"
              @click="handleSubmit"
            >
              <IconLoader v-if="submitting" class="w-4 h-4 animate-spin" />
              <IconSend v-else class="w-4 h-4" />
              <span class="hidden sm:inline">{{ submitButtonText }}</span>
            </button>
          </div>
        </div>

        <!-- Scrollable Content -->
        <div class="flex-1 overflow-y-auto">
          <div class="p-4 space-y-4">
            <!-- Publisher Selector -->
            <PublisherSelector
              v-if="publishers.length > 0"
              v-model="currentPublisher"
              :publishers="publishers"
              placeholder="Select publisher"
              clear-label="Clear selection"
            />

            <!-- Reply Context -->
            <div
              v-if="replyingTo"
              class="p-3 bg-base-200/50 rounded-lg border-l-4 border-primary"
            >
              <div
                class="flex items-center gap-2 text-sm text-base-content/70 mb-1"
              >
                <IconReply class="w-4 h-4" />
                <span>Replying to</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="avatar">
                  <div class="w-6 h-6 rounded-full">
                    <img
                      v-if="replyingTo.publisher?.picture?.id"
                      :src="getFileUrlSafe(replyingTo.publisher.picture.id)"
                      alt=""
                      class="w-full h-full object-cover"
                    />
                    <div
                      v-else
                      class="w-full h-full bg-primary/20 text-primary flex items-center justify-center text-xs"
                    >
                      {{
                        getInitials(
                          replyingTo.publisher?.nick ||
                            replyingTo.publisher?.name ||
                            "?",
                        )
                      }}
                    </div>
                  </div>
                </div>
                <span class="text-sm font-medium">{{
                  replyingTo.publisher?.nick || replyingTo.publisher?.name
                }}</span>
                <span class="text-sm text-base-content/50 line-clamp-1">{{
                  replyingTo.content.slice(0, 100)
                }}</span>
              </div>
            </div>

            <!-- Forward Context -->
            <div
              v-if="forwardingTo"
              class="p-3 bg-base-200/50 rounded-lg border-l-4 border-secondary"
            >
              <div
                class="flex items-center gap-2 text-sm text-base-content/70 mb-1"
              >
                <IconForward class="w-4 h-4" />
                <span>Forwarding</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="avatar">
                  <div class="w-6 h-6 rounded-full">
                    <img
                      v-if="forwardingTo.publisher?.picture?.id"
                      :src="getFileUrlSafe(forwardingTo.publisher.picture.id)"
                      alt=""
                      class="w-full h-full object-cover"
                    />
                    <div
                      v-else
                      class="w-full h-full bg-secondary/20 text-secondary flex items-center justify-center text-xs"
                    >
                      {{
                        getInitials(
                          forwardingTo.publisher?.nick ||
                            forwardingTo.publisher?.name ||
                            "?",
                        )
                      }}
                    </div>
                  </div>
                </div>
                <span class="text-sm font-medium">{{
                  forwardingTo.publisher?.nick || forwardingTo.publisher?.name
                }}</span>
                <span class="text-sm text-base-content/50 line-clamp-1">{{
                  forwardingTo.content.slice(0, 100)
                }}</span>
              </div>
            </div>

            <div v-if="!currentPublisher" class="alert alert-info text-sm">
              <span>Pick a publisher to start composing.</span>
            </div>

            <!-- Title Input -->
            <input
              v-model="title"
              type="text"
              placeholder="Title (optional)"
              class="input input-bordered w-full"
              :disabled="!currentPublisher"
            />

            <!-- Description Input -->
            <input
              v-model="description"
              type="text"
              placeholder="Description (optional)"
              class="input input-bordered w-full"
              :disabled="!currentPublisher"
            />

            <!-- Content Textarea / Preview -->
            <div v-if="!showPreview" class="relative">
              <textarea
                ref="contentRef"
                v-model="content"
                placeholder="What's on your mind?"
                class="textarea textarea-bordered w-full min-h-[120px] resize-y"
                :disabled="!currentPublisher"
                @keydown="handleKeyDown"
              />
              <div
                class="absolute bottom-2 right-2 text-xs text-base-content/40"
              >
                {{ content.length }} chars
              </div>
            </div>
            <div
              v-else
              class="prose prose-sm max-w-none p-4 rounded-lg border border-base-300 bg-base-100 min-h-[120px]"
            >
              <div
                v-if="content.trim().length > 0"
                @click="handleMarkdownClick"
                v-html="renderedPreviewContent"
              />
              <p
                v-if="content.trim().length === 0"
                class="text-base-content/50"
              >
                Nothing to preview yet.
              </p>
            </div>

            <!-- Tags Input -->
            <TagsInputRoot
              v-model="tags"
              class="input input-bordered w-full h-auto min-h-10 flex flex-wrap items-center gap-1.5"
              :disabled="!currentPublisher"
              add-on-blur
              add-on-tab
            >
              <TagsInputItem
                v-for="tag in tags"
                :key="tag"
                :value="tag"
                class="badge badge-primary gap-1"
              >
                <TagsInputItemText>#{{ tag }}</TagsInputItemText>
                <TagsInputItemDelete
                  class="btn btn-xs btn-ghost btn-circle -mr-1"
                >
                  <IconX class="w-3 h-3" />
                </TagsInputItemDelete>
              </TagsInputItem>
              <TagsInputInput
                placeholder="Add tags..."
                class="outline-none border-none bg-transparent text-sm min-w-[100px] flex-1 p-0"
              />
            </TagsInputRoot>

            <!-- Attachments -->
            <ComposeAttachmentGrid
              class="mx-1"
              :attachments="attachments"
              @add="handleAddAttachments"
              @remove="removeAttachment"
              @move="handleMoveAttachment"
              @insert="handleInsertAttachment"
            />
          </div>
        </div>

        <!-- Footer / Toolbar -->
        <div class="px-4 py-3 border-t border-base-200">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-1">
              <button
                class="btn btn-sm btn-ghost gap-1.5"
                title="Attach files"
                @click="openFilePicker"
              >
                <IconPaperclip class="w-4 h-4" />
                <span class="hidden sm:inline">Attach</span>
              </button>

              <div class="w-px h-6 bg-base-300 mx-1" />

              <div class="badge badge-ghost gap-1">
                <IconGlobe v-if="visibility === 0" class="w-3.5 h-3.5" />
                <IconUsers v-else-if="visibility === 1" class="w-3.5 h-3.5" />
                <IconEyeOff v-else-if="visibility === 2" class="w-3.5 h-3.5" />
                <IconLock v-else class="w-3.5 h-3.5" />
                {{ visibilityLabel.label }}
              </div>
            </div>

            <div class="flex items-center gap-3">
              <span class="text-xs text-base-content/50 hidden sm:block">
                <kbd class="kbd kbd-sm">Ctrl</kbd> +
                <kbd class="kbd kbd-sm">Enter</kbd> to post
              </span>
            </div>
          </div>
        </div>
      </DrawerContent>
    </DrawerPortal>
  </DrawerRoot>
  <template #fallback>
    <span></span>
  </template>
  </ClientOnly>

  <!-- File Picker Drawer -->
  <CloudFileDrawer
    v-model:open="filePickerOpen"
    :allow-multiple="true"
    :crop-aspect-ratio="null"
    usage="post.attachment"
    @select="handleFileSelected"
  />

  <!-- Settings Sheet -->
  <ClientOnly>
  <DrawerRoot v-model:open="showSettingsPanel">
    <DrawerPortal>
      <DrawerOverlay class="fixed inset-0 bg-black/40 z-60" />
      <DrawerContent
        class="fixed bottom-0 left-0 right-0 mx-auto z-60 bg-base-100 rounded-t-2xl max-h-[60vh] flex flex-col max-w-md"
      >
        <!-- Drag handle -->
        <div class="flex justify-center pt-3 pb-2">
          <div class="w-10 h-1 rounded-full bg-base-content/20" />
        </div>

        <!-- Header -->
        <div class="flex items-center justify-between px-5 pb-3">
          <h3 class="font-semibold">Post settings</h3>
          <button
            class="btn btn-sm btn-ghost btn-square"
            @click="showSettingsPanel = false"
          >
            <IconX class="w-4 h-4" />
          </button>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto px-5 pb-5">
          <div class="space-y-4">
            <div>
              <label
                class="text-xs font-medium text-base-content/70 mb-1.5 block"
                >Visibility</label
              >
              <select
                v-model="visibility"
                class="select select-bordered select-sm w-full"
              >
                <option :value="0">Public</option>
                <option :value="1">Friends Only</option>
                <option :value="2">Unlisted</option>
                <option :value="3">Private</option>
              </select>
            </div>
            <div>
              <label
                class="text-xs font-medium text-base-content/70 mb-1.5 block"
                >Language</label
              >
              <select
                v-model="language"
                class="select select-bordered select-sm w-full"
              >
                <option :value="null">Auto-detect</option>
                <option value="en">English</option>
                <option value="zh">Chinese</option>
                <option value="ja">Japanese</option>
                <option value="ko">Korean</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="ru">Russian</option>
              </select>
            </div>
            <button
              class="btn btn-sm btn-ghost w-full gap-2"
              @click="saveDraftManually"
            >
              <IconSave class="w-4 h-4" />
              Save Draft Now
            </button>
          </div>
        </div>
      </DrawerContent>
    </DrawerPortal>
  </DrawerRoot>
  <template #fallback>
    <span></span>
  </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import {
  DrawerRoot,
  DrawerPortal,
  DrawerOverlay,
  DrawerContent,
} from "vaul-vue";
import {
  TagsInputRoot,
  TagsInputItem,
  TagsInputItemText,
  TagsInputItemDelete,
  TagsInputInput,
} from "reka-ui";
import type { Post, Publisher, FileAttachment } from "~/types/post";
import { getFileUrl } from "~/utils/files";
import { fetchJson, API_BASE_URL } from "~/utils/api";
import { getValidToken } from "~/utils/token";
import { renderMarkdown } from "~/utils/markdown";
import type { SnCloudFile } from "~/types/drive";

const props = defineProps<{
  open?: boolean;
}>();

const emit = defineEmits<{
  close: [];
  submit: [post: Post];
}>();

const isOpen = computed(() => props.open ?? true);

const compose = useCompose();
const {
  title,
  description,
  content,
  visibility,
  language,
  tags,
  attachments,
  publishers,
  currentPublisher,
  submitting,
  lastSaved,
  canSubmit,
  visibilityLabel,
  draftList,
  loadDraft,
  deleteDraft,
  replyingTo,
  forwardingTo,
  originalPost,
  hasContent,
  addAttachments,
  removeAttachment,
  moveAttachment,
  setAttachmentUploaded,
  setPublishers,
  saveCurrentDraft,
  startAutoSave,
  stopAutoSave,
  reset,
} = compose;

const contentRef = ref<HTMLTextAreaElement | null>(null);
const showPreview = ref(false);
const showSettingsPanel = ref(false);
const checkedDraftRestore = ref(false);

// File picker state
const filePickerOpen = ref(false);

// Dialog title
const dialogTitle = computed(() => {
  if (originalPost.value) return "Edit Post";
  if (replyingTo.value) return "Write a Reply";
  if (forwardingTo.value) return "Forward Post";
  return "New Post";
});

const submitButtonText = computed(() => {
  if (submitting.value) return "Posting...";
  if (originalPost.value) return "Save";
  return "Post";
});

const renderedPreviewContent = computed(() =>
  renderMarkdown(content.value || ""),
);

// Lifecycle
onMounted(() => {
  loadPublishers();
});

onBeforeUnmount(() => {
  stopAutoSave();
});

// Watch for open state changes
watch(isOpen, (open) => {
  if (open) {
    startAutoSave();
    maybeRestoreLatestDraft();
  } else {
    stopAutoSave();
  }
});

// Load publishers from API
async function loadPublishers() {
  try {
    const response = await fetchJson<Publisher[]>(
      "/sphere/publishers?mine=true&take=100",
    );
    if (response) {
      setPublishers(response);
    }
  } catch (error) {
    console.error("Failed to load publishers:", error);
  }
}

async function maybeRestoreLatestDraft() {
  if (checkedDraftRestore.value) return;
  checkedDraftRestore.value = true;
  if (originalPost.value || replyingTo.value || forwardingTo.value) return;
  if (hasContent.value) return;

  const latest = draftList.value[0];
  if (!latest) return;

  const { confirm } = useAlert();
  const shouldRestore = await confirm(
    "Restore draft?",
    "You have an unsaved draft. Would you like to restore it?",
  );
  if (!shouldRestore) return;

  const restored = loadDraft(latest.id);
  if (!restored) return;

  title.value = restored.title;
  description.value = restored.description;
  content.value = restored.content;
  visibility.value = restored.visibility;
  language.value = restored.language;
  tags.value = [...restored.tags];
  attachments.value = [...restored.attachments];
  deleteDraft(restored.id);
}

// File picker
function openFilePicker() {
  filePickerOpen.value = true;
}

function handleFileSelected(files: SnCloudFile | SnCloudFile[] | null) {
  if (!files) return;
  const fileArray = Array.isArray(files) ? files : [files];

  // Add each cloud file as an already-uploaded attachment
  for (const cloudFile of fileArray) {
    // Create a minimal File object for the attachment system
    const blob = new Blob([], { type: cloudFile.mimeType });
    const file = new File([blob], cloudFile.name, { type: cloudFile.mimeType });

    // Add using the compose store's addAttachments
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    addAttachments(dataTransfer.files);

    // Mark as uploaded with cloud file data
    const newAttachment = attachments.value[attachments.value.length - 1];
    if (newAttachment) {
      setAttachmentUploaded(newAttachment.id, cloudFile as any);
    }
  }
}

// Attachment handlers
function handleAddAttachments(files: FileList) {
  addAttachments(files);
}

function handleMoveAttachment(index: number, direction: "up" | "down") {
  moveAttachment(index, direction);
}

function handleInsertAttachment(id: string) {
  const attachment = attachments.value.find((a) => a.id === id);
  if (!attachment) return;

  const fileName = attachment.cloudFile?.name || attachment.file.name;
  const fileId = attachment.cloudFile?.id || "PENDING";
  const markdown = `![${fileName}](solian://files/${fileId})`;

  const textarea = contentRef.value;
  if (textarea) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = content.value;
    content.value = text.slice(0, start) + markdown + text.slice(end);
    nextTick(() => {
      textarea.selectionStart = textarea.selectionEnd = start + markdown.length;
      textarea.focus();
    });
  }
}

// Keyboard shortcuts
function handleKeyDown(event: KeyboardEvent) {
  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
    event.preventDefault();
    if (canSubmit.value) handleSubmit();
  }
  if (event.key === "Escape" && !hasContent.value) {
    handleClose();
  }
}

function handleMarkdownClick(e: MouseEvent) {
  const target = e.target as HTMLElement;
  const link = target.closest("a") as HTMLAnchorElement | null;
  if (!link?.href) return;
  if (link.href.startsWith(window.location.origin)) {
    e.preventDefault();
    navigateTo(link.getAttribute("href") || "/");
  }
}

// Submit handler
async function handleSubmit() {
  if (!canSubmit.value || !currentPublisher.value) return;
  submitting.value = true;

  try {
    const uploadedAttachments = await uploadAttachments();

    const payload: Record<string, unknown> = {
      title: title.value || undefined,
      description: description.value || undefined,
      content: content.value,
      visibility: visibility.value,
      language: language.value,
      tags: tags.value,
      attachments: uploadedAttachments
        .map((a) => a.cloudFile?.id)
        .filter(Boolean),
    };

    if (replyingTo.value) payload.replied_post_id = replyingTo.value.id;
    if (forwardingTo.value) payload.forwarded_post_id = forwardingTo.value.id;

    let response: Post;
    const publisherName = currentPublisher.value?.name;
    if (!publisherName) throw new Error("No publisher selected");

    const queryParams = new URLSearchParams({ pub: publisherName });

    if (originalPost.value) {
      response = await fetchJson<Post>(
        `/sphere/posts/${originalPost.value.id}?${queryParams.toString()}`,
        { method: "PATCH", body: JSON.stringify(payload) },
      );
    } else {
      response = await fetchJson<Post>(
        `/sphere/posts?${queryParams.toString()}`,
        { method: "POST", body: JSON.stringify(payload) },
      );
    }

    stopAutoSave();
    emit("submit", response);
    emit("close");
    reset();
  } catch (error) {
    console.error("Failed to submit post:", error);
    alert("Failed to post. Please try again.");
  } finally {
    submitting.value = false;
  }
}

interface UploadAttachment {
  file: File;
  cloudFile?: FileAttachment;
  uploaded?: boolean;
  progress?: number;
}

async function uploadAttachments(): Promise<UploadAttachment[]> {
  const results = [];

  for (let i = 0; i < attachments.value.length; i++) {
    const attachment = attachments.value[i];
    if (!attachment) continue;
    if (attachment.uploaded && attachment.cloudFile) {
      results.push(attachment);
      continue;
    }

    try {
      const formData = new FormData();
      formData.append("file", attachment.file, attachment.file.name);

      const token = await getValidToken(API_BASE_URL);
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      attachment.progress = 0;

      const response = await fetch(
        `${API_BASE_URL}/drive/files/upload/direct`,
        {
          method: "POST",
          headers,
          body: formData,
        },
      );

      if (!response.ok) throw new Error(`Upload failed: ${response.status}`);

      const data = await response.json();

      let fileData: FileAttachment;
      if (data.file) fileData = data.file;
      else if (data.file_info) fileData = data.file_info;
      else if (data.data?.file) fileData = data.data.file;
      else if (data.data?.id) fileData = data.data;
      else if (data.id) fileData = data;
      else throw new Error("Unexpected upload response format");

      attachment.cloudFile = fileData;
      attachment.uploaded = true;
      attachment.progress = 100;
      results.push(attachment);
    } catch (error) {
      console.error("Failed to upload attachment:", error);
      attachment.progress = undefined;
      throw error;
    }
  }

  return results;
}

function saveDraftManually() {
  saveCurrentDraft();
}

async function handleClose() {
  if (hasContent.value) {
    const { confirm } = useAlert();
    const confirmed = await confirm(
      "Discard draft?",
      "You have unsaved content that will be lost.",
    );
    if (!confirmed) return;
  }
  stopAutoSave();
  checkedDraftRestore.value = false;
  emit("close");
  reset();
}

function handleDrawerClose(open: boolean) {
  if (!open) handleClose();
}

// Helpers
function getInitials(name: string): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString();
}

function getFileUrlSafe(id: string | null | undefined): string | undefined {
  const url = getFileUrl(id ?? undefined);
  return url ?? undefined;
}
</script>
