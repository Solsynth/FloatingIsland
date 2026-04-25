import type { Post, FileAttachment, Publisher, Category } from '~/types/post';

export interface ComposeAttachment {
	id: string;
	file: File;
	preview?: string;
	progress?: number;
	uploaded?: boolean;
	cloudFile?: FileAttachment;
}

export interface ComposeDraft {
	id: string;
	title: string;
	description: string;
	content: string;
	visibility: number;
	language: string | null;
	tags: string[];
	categories: Category[];
	attachments: ComposeAttachment[];
	updatedAt: Date;
}

export interface ComposeInitialState {
	title?: string;
	description?: string;
	content?: string;
	visibility?: number;
	language?: string | null;
	tags?: string[];
	categories?: Category[];
	attachments?: FileAttachment[];
	replyingTo?: Post;
	forwardingTo?: Post;
}

export function useCompose() {
	// Core form state
	const title = ref('');
	const description = ref('');
	const content = ref('');
	const visibility = ref<number>(0);
	const language = ref<string | null>(null);
	const tags = ref<string[]>([]);
	const categories = ref<Category[]>([]);

	// Attachment state
	const attachments = ref<ComposeAttachment[]>([]);
	const uploadingAttachments = ref<Set<string>>(new Set());

	// Publishers
	const publishers = ref<Publisher[]>([]);
	const currentPublisher = ref<Publisher | null>(null);

	// Submission state
	const submitting = ref(false);
	const lastSaved = ref<Date | null>(null);
	const isDirty = ref(false);

	// Context
	const originalPost = ref<Post | null>(null);
	const replyingTo = ref<Post | undefined>(undefined);
	const forwardingTo = ref<Post | undefined>(undefined);

	// Drafts storage
	const drafts = ref<Record<string, ComposeDraft>>({});
	const currentDraftId = ref<string | null>(null);
	let autoSaveInterval: ReturnType<typeof setInterval> | null = null;

	// Computed
	const hasContent = computed(() =>
		title.value.trim().length > 0 ||
		description.value.trim().length > 0 ||
		content.value.trim().length > 0 ||
		attachments.value.length > 0
	);

	const isEmpty = computed(() => !hasContent.value);

	const draftList = computed(() =>
		Object.values(drafts.value).sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
	);

	const canSubmit = computed(() => {
		return hasContent.value && !submitting.value && currentPublisher.value !== null;
	});

	const visibilityLabel = computed(() => {
		switch (visibility.value) {
			case 0:
				return { label: 'Public', icon: 'IconGlobe', tone: 'badge-success' };
			case 1:
				return { label: 'Friends', icon: 'IconUsers', tone: 'badge-info' };
			case 2:
				return { label: 'Unlisted', icon: 'IconEyeOff', tone: 'badge-warning' };
			case 3:
				return { label: 'Private', icon: 'IconLock', tone: 'badge-neutral' };
			default:
				return { label: 'Public', icon: 'IconGlobe', tone: 'badge-success' };
		}
	});

	// ID generation
	function generateDraftId(): string {
		return `draft_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
	}

	function generateAttachmentId(): string {
		return `attach_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
	}

	// LocalStorage operations
	function saveDraftsToStorage() {
		if (import.meta.client) {
			try {
				localStorage.setItem('compose_drafts', JSON.stringify(drafts.value));
			} catch (e) {
				console.error('Failed to save drafts:', e);
			}
		}
	}

	function loadDraftsFromStorage() {
		if (import.meta.client) {
			try {
				const saved = localStorage.getItem('compose_drafts');
				if (saved) {
					const parsed = JSON.parse(saved) as Record<string, ComposeDraft>;
					drafts.value = Object.fromEntries(
						Object.entries(parsed).map(([k, v]) => [k, { ...v, updatedAt: new Date(v.updatedAt) }])
					);
				}
			} catch (e) {
				console.error('Failed to load drafts:', e);
			}
		}
	}

	function saveDraft(draft: ComposeDraft) {
		drafts.value[draft.id] = draft;
		saveDraftsToStorage();
	}

	function deleteDraft(id: string) {
		const { [id]: _, ...rest } = drafts.value;
		drafts.value = rest;
		saveDraftsToStorage();
	}

	function loadDraft(id: string): ComposeDraft | undefined {
		return drafts.value[id];
	}

	function clearDrafts() {
		drafts.value = {};
		saveDraftsToStorage();
	}

	// Auto-save
	function startAutoSave() {
		stopAutoSave();
		autoSaveInterval = setInterval(() => {
			if (isDirty.value && hasContent.value) {
				saveCurrentDraft();
			}
		}, 3000);
	}

	function stopAutoSave() {
		if (autoSaveInterval) {
			clearInterval(autoSaveInterval);
			autoSaveInterval = null;
		}
	}

	function saveCurrentDraft() {
		if (!hasContent.value) return;

		const draftId = currentDraftId.value || generateDraftId();
		currentDraftId.value = draftId;

		const draft: ComposeDraft = {
			id: draftId,
			title: title.value,
			description: description.value,
			content: content.value,
			visibility: visibility.value,
			language: language.value,
			tags: [...tags.value],
			categories: [...categories.value],
			attachments: [...attachments.value],
			updatedAt: new Date()
		};

		saveDraft(draft);
		lastSaved.value = new Date();
		isDirty.value = false;
	}

	// Attachment operations
	function addAttachment(file: File) {
		const id = generateAttachmentId();
		const attachment: ComposeAttachment = {
			id,
			file,
			uploaded: false
		};

		// Create preview for images
		if (file.type.startsWith('image/')) {
			attachment.preview = URL.createObjectURL(file);
		} else if (file.type.startsWith('video/')) {
			attachment.preview = URL.createObjectURL(file);
		}

		attachments.value.push(attachment);
		isDirty.value = true;
		return id;
	}

	function addAttachments(files: FileList | null) {
		if (!files) return;
		Array.from(files).forEach(file => addAttachment(file));
	}

	function removeAttachment(id: string) {
		const index = attachments.value.findIndex(a => a.id === id);
		if (index === -1) return;

		const attachment = attachments.value[index];
		if (!attachment) return;
		if (attachment.preview) {
			URL.revokeObjectURL(attachment.preview);
		}

		attachments.value.splice(index, 1);
		isDirty.value = true;
	}

	function updateAttachmentProgress(id: string, progress: number) {
		const attachment = attachments.value.find(a => a.id === id);
		if (attachment) {
			attachment.progress = progress;
		}
	}

	function setAttachmentUploaded(id: string, cloudFile: FileAttachment) {
		const attachment = attachments.value.find(a => a.id === id);
		if (attachment) {
			attachment.uploaded = true;
			attachment.cloudFile = cloudFile;
			attachment.progress = 100;
		}
	}

	function moveAttachment(index: number, direction: 'up' | 'down') {
		const newIndex = direction === 'up' ? index - 1 : index + 1;
		if (newIndex < 0 || newIndex >= attachments.value.length) return;

		const temp = attachments.value[index];
		attachments.value[index] = attachments.value[newIndex];
		attachments.value[newIndex] = temp;
		isDirty.value = true;
	}

	// Tag operations
	function addTag(tag: string) {
		const normalized = tag.trim().toLowerCase().replace(/^#/, '');
		if (normalized && !tags.value.includes(normalized)) {
			tags.value.push(normalized);
			isDirty.value = true;
		}
	}

	function removeTag(tag: string) {
		const index = tags.value.indexOf(tag);
		if (index > -1) {
			tags.value.splice(index, 1);
			isDirty.value = true;
		}
	}

	function setTags(newTags: string[]) {
		tags.value = [...newTags];
		isDirty.value = true;
	}

	// Category operations
	function addCategory(category: Category) {
		if (!categories.value.find(c => c.id === category.id)) {
			categories.value.push(category);
			isDirty.value = true;
		}
	}

	function removeCategory(categoryId: string) {
		const index = categories.value.findIndex(c => c.id === categoryId);
		if (index > -1) {
			categories.value.splice(index, 1);
			isDirty.value = true;
		}
	}

	function setCategories(newCategories: Category[]) {
		categories.value = [...newCategories];
		isDirty.value = true;
	}

	// Publisher operations
	function setPublishers(newPublishers: Publisher[]) {
		publishers.value = newPublishers;
		if (!currentPublisher.value && newPublishers.length > 0) {
			currentPublisher.value = newPublishers[0];
		}
	}

	function setCurrentPublisher(publisher: Publisher | null) {
		currentPublisher.value = publisher;
	}

	// Initialization
	function initializeFromState(state: ComposeInitialState | null) {
		title.value = state?.title ?? '';
		description.value = state?.description ?? '';
		content.value = state?.content ?? '';
		visibility.value = state?.visibility ?? 0;
		language.value = state?.language ?? null;
		tags.value = state?.tags ?? [];
		categories.value = state?.categories ?? [];
		replyingTo.value = state?.replyingTo;
		forwardingTo.value = state?.forwardingTo;

		// Convert FileAttachment[] to ComposeAttachment[]
		if (state?.attachments) {
			attachments.value = state.attachments.map(att => ({
				id: generateAttachmentId(),
				file: new File([], att.name),
				uploaded: true,
				cloudFile: att,
				preview: att.url
			}));
		} else {
			attachments.value = [];
		}

		currentDraftId.value = null;
		isDirty.value = false;
	}

	function initializeFromPost(post: Post) {
		originalPost.value = post;
		title.value = post.title ?? '';
		description.value = post.description ?? '';
		content.value = post.content;
		visibility.value = post.visibility;
		language.value = null;
		tags.value = post.tags.map(t => t.slug);
		categories.value = []; // Categories not in post type yet
		replyingTo.value = post.repliedPost ?? undefined;
		forwardingTo.value = post.forwardedPost ?? undefined;

		// Convert existing attachments
		attachments.value = post.attachments.map(att => ({
			id: generateAttachmentId(),
			file: new File([], att.name),
			uploaded: true,
			cloudFile: att,
			preview: att.url
		}));

		currentDraftId.value = null;
		isDirty.value = false;
	}

	function initializeEmpty() {
		title.value = '';
		description.value = '';
		content.value = '';
		visibility.value = 0;
		language.value = null;
		tags.value = [];
		categories.value = [];
		attachments.value = [];
		replyingTo.value = undefined;
		forwardingTo.value = undefined;
		originalPost.value = null;
		currentDraftId.value = null;
		isDirty.value = false;
	}

	function reset() {
		// Cleanup previews
		attachments.value.forEach(att => {
			if (att.preview) {
				URL.revokeObjectURL(att.preview);
			}
		});

		title.value = '';
		description.value = '';
		content.value = '';
		visibility.value = 0;
		language.value = null;
		tags.value = [];
		categories.value = [];
		attachments.value = [];
		submitting.value = false;
		originalPost.value = null;
		replyingTo.value = undefined;
		forwardingTo.value = undefined;
		currentDraftId.value = null;
		lastSaved.value = null;
		isDirty.value = false;
		uploadingAttachments.value.clear();
	}

	// Load drafts on client init
	if (import.meta.client) {
		loadDraftsFromStorage();
	}

	// Watch for changes to mark dirty
	watch([title, description, content, visibility, language], () => {
		isDirty.value = true;
	}, { deep: true });

	return {
		// State refs
		title,
		description,
		content,
		visibility,
		language,
		tags,
		categories,
		attachments,
		uploadingAttachments,
		publishers,
		currentPublisher,
		submitting,
		lastSaved,
		isDirty,
		originalPost,
		replyingTo,
		forwardingTo,
		drafts,
		currentDraftId,

		// Computed
		hasContent,
		isEmpty,
		draftList,
		canSubmit,
		visibilityLabel,

		// Draft operations
		generateDraftId,
		saveDraft,
		deleteDraft,
		loadDraft,
		clearDrafts,
		saveCurrentDraft,
		startAutoSave,
		stopAutoSave,

		// Attachment operations
		addAttachment,
		addAttachments,
		removeAttachment,
		updateAttachmentProgress,
		setAttachmentUploaded,
		moveAttachment,

		// Tag operations
		addTag,
		removeTag,
		setTags,

		// Category operations
		addCategory,
		removeCategory,
		setCategories,

		// Publisher operations
		setPublishers,
		setCurrentPublisher,

		// Initialization
		initializeFromState,
		initializeFromPost,
		initializeEmpty,
		reset
	};
}
