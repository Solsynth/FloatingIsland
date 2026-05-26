<template>
    <NuxtLayout name="app">
        <div class="mx-auto w-full max-w-6xl grid gap-4 xl:grid-cols-[1fr_20rem]">
            <div class="card bg-base-100">
                <div class="card-body p-4 sm:p-6 space-y-4">
                    <div class="flex items-center justify-between gap-3">
                        <h1 class="text-lg font-semibold">{{ t('compose.title') }}</h1>
                        <div class="flex items-center gap-2">
                            <button class="btn btn-sm" @click="navigateTo('/')">{{ t('compose.cancel') }}</button>
                            <button class="btn btn-sm btn-primary" :disabled="!canSubmit" @click="handleSubmit">
                                <IconLoader v-if="submitting" class="w-4 h-4 animate-spin" />
                                <span>{{ submitting ? t('compose.posting') : t('compose.post') }}</span>
                            </button>
                        </div>
                    </div>

                    <div v-if="!currentPublisher" class="alert alert-info text-sm">
                        <span>{{ t('compose.noPublisher') }}</span>
                    </div>

                    <div class="flex items-center gap-3" v-if="publishers.length > 0">
                        <select v-model="selectedPublisherName" class="select select-bordered select-sm w-full max-w-xs">
                            <option v-for="pub in publishers" :key="pub.id" :value="pub.name">
                                {{ pub.nick || pub.name }}
                            </option>
                        </select>
                    </div>

                    <div v-if="selectedPublisher" class="flex items-center gap-3 rounded-md border border-base-300 bg-base-50 px-3 py-2">
                        <div class="avatar">
                            <div class="w-8 h-8 rounded-full">
                                <img
                                    v-if="selectedPublisher.picture?.id"
                                    :src="getFileUrl(selectedPublisher.picture.id ?? undefined) || ''"
                                    alt=""
                                    class="w-full h-full object-cover"
                                >
                                <div v-else class="w-full h-full bg-base-300 text-base-content/70 flex items-center justify-center text-xs font-medium">
                                    {{ (selectedPublisher.nick || selectedPublisher.name).slice(0, 2).toUpperCase() }}
                                </div>
                            </div>
                        </div>
                        <div class="min-w-0">
                            <p class="text-sm font-medium leading-tight truncate">{{ selectedPublisher.nick || selectedPublisher.name }}</p>
                            <p class="text-xs text-base-content/60 leading-tight truncate">@{{ selectedPublisher.name }}</p>
                        </div>
                    </div>

                    <input v-model="title" class="input input-bordered w-full" :placeholder="t('compose.titlePlaceholder')" :disabled="!currentPublisher" />
                    <input v-model="description" class="input input-bordered w-full" :placeholder="t('compose.descriptionPlaceholder')" :disabled="!currentPublisher" />

                    <textarea
                        ref="contentRef"
                        v-model="content"
                        class="textarea textarea-bordered w-full min-h-[240px]"
                        :placeholder="t('compose.contentPlaceholder')"
                        :disabled="!currentPublisher"
                        @keydown="handleKeyDown"
                    />

                    <ComposeAttachmentGrid
                        :attachments="attachments"
                        @add="handleAddAttachments"
                        @remove="removeAttachment"
                        @move="handleMoveAttachment"
                        @insert="handleInsertAttachment"
                    />
                </div>
            </div>

            <aside class="space-y-4 xl:sticky xl:top-4 xl:self-start">
                <div class="card bg-base-100">
                    <div class="card-body p-4 space-y-3">
                        <h2 class="text-sm font-semibold">{{ t('compose.postSettings') }}</h2>
                        <div>
                            <label class="text-xs text-base-content/70">{{ t('compose.visibility') }}</label>
                            <select v-model="visibility" class="select select-bordered select-sm w-full mt-1">
                                <option :value="0">{{ t('compose.public') }}</option>
                                <option :value="1">{{ t('compose.friends') }}</option>
                                <option :value="2">{{ t('compose.unlisted') }}</option>
                                <option :value="3">{{ t('compose.private') }}</option>
                            </select>
                        </div>
                        <div>
                            <label class="text-xs text-base-content/70">{{ t('compose.language') }}</label>
                            <select v-model="language" class="select select-bordered select-sm w-full mt-1">
                                <option :value="null">{{ t('compose.autoDetect') }}</option>
                                <option value="en">{{ t('compose.languageEn') }}</option>
                                <option value="zh">{{ t('compose.languageZh') }}</option>
                                <option value="ja">{{ t('compose.languageJa') }}</option>
                                <option value="ko">{{ t('compose.languageKo') }}</option>
                                <option value="es">{{ t('compose.languageEs') }}</option>
                                <option value="fr">{{ t('compose.languageFr') }}</option>
                                <option value="de">{{ t('compose.languageDe') }}</option>
                                <option value="ru">{{ t('compose.languageRu') }}</option>
                            </select>
                        </div>
                        <div>
                            <label class="text-xs text-base-content/70">{{ t('compose.slug') }}</label>
                            <input
                                v-model="resourceIdentifier"
                                class="input input-bordered input-sm w-full mt-1"
                                :placeholder="t('compose.slugPlaceholder')"
                            >
                        </div>
                    </div>
                </div>

                <div class="card bg-base-100">
                    <div class="card-body p-4 space-y-3">
                        <h2 class="text-sm font-semibold">{{ t('compose.tags') }}</h2>
                        <div class="flex items-center gap-2 flex-wrap min-h-6">
                            <span v-for="tag in tags" :key="tag" class="badge badge-primary gap-1">
                                #{{ tag }}
                                <button class="btn btn-xs btn-ghost btn-circle -mr-1" @click="removeTag(tag)">
                                    <IconX class="w-3 h-3" />
                                </button>
                            </span>
                        </div>
                        <div class="flex gap-2">
                            <input
                                v-model="newTag"
                                class="input input-bordered input-sm flex-1"
                                :placeholder="t('compose.addTagPlaceholder')"
                                list="compose-tag-suggestions"
                                @keydown.enter.prevent="addNewTag"
                            >
                            <button class="btn btn-sm" @click="addNewTag">{{ t('compose.addTag') }}</button>
                        </div>
                        <datalist id="compose-tag-suggestions">
                            <option v-for="slug in tagSuggestions" :key="slug" :value="slug" />
                        </datalist>
                    </div>
                </div>

                <div class="card bg-base-100">
                    <div class="card-body p-4 space-y-3">
                        <h2 class="text-sm font-semibold">{{ t('compose.categories') }}</h2>
                        <input
                            v-model="categoryQuery"
                            class="input input-bordered input-sm w-full"
                            :placeholder="t('compose.searchCategories')"
                        >
                        <div class="max-h-56 overflow-y-auto border border-base-300 rounded-md">
                            <button
                                v-for="cat in filteredCategories"
                                :key="cat.id"
                                class="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-base-200"
                                @click="toggleCategory(cat.slug)"
                            >
                                <span class="text-sm truncate">{{ cat.name }}</span>
                                <IconCheck v-if="selectedCategorySlugs.includes(cat.slug)" class="w-4 h-4 text-success" />
                            </button>
                        </div>
                        <p class="text-xs text-base-content/60">
                            {{ t('compose.selected', { count: selectedCategorySlugs.length }) }}
                        </p>
                    </div>
                </div>
            </aside>
        </div>
    </NuxtLayout>
</template>

<script setup lang="ts">
import type { FileAttachment, Post, Publisher } from "~/types/post";
import { API_BASE_URL, fetchCategories, fetchJson, fetchTags, type PostCategory, type PostTag } from "~/utils/api";
import { getValidToken } from "~/utils/token";
import { getFileUrl } from "~/utils/files";

const { t } = useI18n();

useSolarSeo({
    title: t('compose.seoTitle'),
    description: t('compose.seoDescription'),
});

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
    canSubmit,
    setCurrentPublisher,
    setPublishers,
    addAttachments,
    removeAttachment,
    moveAttachment,
    addTag,
    removeTag,
    reset,
    startAutoSave,
    stopAutoSave,
} = compose;

const contentRef = ref<HTMLTextAreaElement | null>(null);
const selectedPublisherName = ref("");
const resourceIdentifier = ref("");
const newTag = ref("");
const availableCategories = ref<PostCategory[]>([]);
const availableTags = ref<PostTag[]>([]);
const selectedCategorySlugs = ref<string[]>([]);
const categoryQuery = ref("");

const selectedPublisher = computed(
    () => publishers.value.find((p) => p.name === selectedPublisherName.value) || null,
);

const filteredCategories = computed(() => {
    const q = categoryQuery.value.trim().toLowerCase();
    if (!q) return availableCategories.value;
    return availableCategories.value.filter((c) =>
        c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q),
    );
});

const tagSuggestions = computed(() => availableTags.value.slice(0, 30).map((t) => t.slug));

onMounted(async () => {
    startAutoSave();
    const [publisherResponse, categoryResponse, tagResponse] = await Promise.all([
        fetchJson<Publisher[]>("/sphere/publishers?mine=true&take=100"),
        fetchCategories(100, 0),
        fetchTags(100, 0),
    ]);
    if (publisherResponse) {
        setPublishers(publisherResponse);
        if (publisherResponse[0]) selectedPublisherName.value = publisherResponse[0].name;
    }
    availableCategories.value = categoryResponse.categories;
    availableTags.value = tagResponse.tags;
});

onBeforeUnmount(() => {
    stopAutoSave();
});

watch(selectedPublisherName, (name) => {
    const pub = publishers.value.find((p) => p.name === name) || null;
    setCurrentPublisher(pub);
}, { immediate: true });

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
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = content.value;
    content.value = text.slice(0, start) + markdown + text.slice(end);
}

function handleKeyDown(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter" && canSubmit.value) {
        event.preventDefault();
        handleSubmit();
    }
}

function addNewTag() {
    const tag = newTag.value.trim().toLowerCase().replace(/^#/, "");
    if (!tag) return;
    addTag(tag);
    newTag.value = "";
}

function toggleCategory(slug: string) {
    if (selectedCategorySlugs.value.includes(slug)) {
        selectedCategorySlugs.value = selectedCategorySlugs.value.filter((s) => s !== slug);
    } else {
        selectedCategorySlugs.value = [...selectedCategorySlugs.value, slug];
    }
}

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
            categories: selectedCategorySlugs.value,
            resource_identifier: resourceIdentifier.value.trim() || undefined,
            attachments: uploadedAttachments.map((a) => a.cloudFile?.id).filter(Boolean),
        };
        const queryParams = new URLSearchParams({ pub: currentPublisher.value.name });
        await fetchJson<Post>(`/sphere/posts?${queryParams.toString()}`, {
            method: "POST",
            body: JSON.stringify(payload),
        });
        reset();
        await navigateTo("/");
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
        const formData = new FormData();
        formData.append("file", attachment.file, attachment.file.name);
        const token = await getValidToken(API_BASE_URL);
        const headers: Record<string, string> = {};
        if (token) headers.Authorization = `Bearer ${token}`;
        const response = await fetch(`${API_BASE_URL}/drive/files/upload/direct`, { method: "POST", headers, body: formData });
        if (!response.ok) throw new Error(`Upload failed: ${response.status}`);
        const data = await response.json();
        const fileData = data.file || data.file_info || data.data?.file || data.data || data;
        attachment.cloudFile = fileData;
        attachment.uploaded = true;
        results.push(attachment);
    }
    return results;
}
</script>
