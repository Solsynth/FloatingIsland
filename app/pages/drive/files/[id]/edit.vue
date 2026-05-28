<template>
  <div class="w-screen h-screen m-0 p-0 overflow-hidden">
    <div v-if="loading" class="flex items-center justify-center w-full h-full">
      <div class="loading loading-spinner loading-lg text-primary" />
    </div>
    <div
      v-else-if="error"
      class="flex flex-col items-center justify-center w-full h-full gap-4 p-8"
    >
      <IconAlertCircle class="w-12 h-12 text-error" />
      <p class="text-center text-error">{{ error }}</p>
      <button class="btn btn-outline btn-sm" @click="openEditor">
        {{ t("common.retry") }}
      </button>
    </div>
    <template v-else>
      <iframe
        ref="iframeRef"
        name="coolframe"
        class="w-screen h-screen border-0"
        :title="t('drive.editingDocument')"
      />
      <form
        v-if="formAction"
        ref="formRef"
        method="POST"
        target="coolframe"
        :action="formAction"
      >
        <input
          v-for="(value, key) in formFields"
          :key="key"
          type="hidden"
          :name="key"
          :value="value"
        />
      </form>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
});

const { t } = useI18n();
const route = useRoute();
const fileId = computed(() => route.params.id as string);

const iframeRef = ref<HTMLIFrameElement | null>(null);
const formRef = ref<HTMLFormElement | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const formAction = ref<string | null>(null);
const formFields = ref<Record<string, string>>({});

useSolarSeo({
  title: "Edit Document",
  description: "Edit document with Collabora Online.",
});

onMounted(() => {
  openEditor();
});

async function openEditor() {
  loading.value = true;
  error.value = null;
  formAction.value = null;
  formFields.value = {};

  try {
    const session = await createWopiEditSession(fileId.value);

    formAction.value = session.actionUrl;
    formFields.value = session.formFields || {};

    // Wait for form to render, then submit
    await nextTick();
    formRef.value?.submit();
  } catch (err) {
    console.error("Failed to open editor:", err);
    error.value = t("drive.failedToOpenEditor");
    loading.value = false;
  }
}
</script>
