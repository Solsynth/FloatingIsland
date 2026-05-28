<template>
  <div class="w-full h-full relative">
    <div
      v-if="loading"
      class="absolute inset-0 flex items-center justify-center z-10 bg-base-100"
    >
      <div class="loading loading-spinner loading-lg text-primary" />
    </div>
    <div
      v-if="error"
      class="flex flex-col items-center justify-center h-full gap-4 p-8"
    >
      <IconAlertCircle class="w-12 h-12 text-error" />
      <p class="text-center text-error">{{ error }}</p>
      <button class="btn btn-outline btn-sm" @click="retry">
        {{ t("common.retry") }}
      </button>
    </div>
    <iframe
      v-show="!error"
      ref="iframeRef"
      name="coolframe"
      :src="editorUrl"
      class="w-full h-full border-0"
      :title="t('drive.editingDocument')"
      @load="onIframeLoad"
    />
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n();

const props = defineProps<{
  fileId: string;
}>();

const emit = defineEmits<{
  close: [];
}>();

const iframeRef = ref<HTMLIFrameElement | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const editorUrl = ref<string | undefined>(undefined);

onMounted(() => {
  openEditor();
});

async function openEditor() {
  loading.value = true;
  error.value = null;
  editorUrl.value = undefined;

  try {
    const session = await createWopiEditSession(props.fileId);

    // Build URL with form fields as query parameters
    const url = new URL(session.actionUrl)
    for (const [key, value] of Object.entries(session.formFields || {})) {
      url.searchParams.set(key, value)
    }

    editorUrl.value = url.toString();
  } catch (err) {
    console.error("Failed to open editor:", err);
    error.value = t("drive.failedToOpenEditor");
    loading.value = false;
  }
}

function onIframeLoad() {
  setTimeout(() => {
    loading.value = false;
  }, 500);
}

function retry() {
  openEditor();
}
</script>
