<template>
	<NuxtLayout name="app">
		<!-- Mobile Header -->
		<div class="lg:hidden sticky z-10 mb-4 -mx-4 -mt-4 top-14">
			<div
				class="flex items-center gap-4 border-b border-base-300 bg-base-100/95 pl-6 pr-4 py-3 backdrop-blur"
			>
				<button class="btn -ml-2 btn-circle btn-ghost btn-sm" @click="handleBack">
					<IconArrowLeft class="w-5 h-5" />
				</button>
				<div class="flex-1">
					<h1 class="text-lg font-bold">Post</h1>
				</div>
				<button class="btn btn-sm btn-primary gap-1" @click="handleReply">
					<IconReply class="w-4 h-4" />
					<span class="hidden sm:inline">Reply</span>
				</button>
			</div>
		</div>

		<div class="grid xl:grid-cols-[1fr_20rem] min-w-0">
			<!-- Main Content -->
			<div class="min-w-0">
				<ConfuseSpinner
					v-if="postStatus === 'pending'"
					message="Loading post..."
				/>

				<template v-else-if="post">
					<!-- Original Post -->
					<PostCard
						:post="post"
						:is-detail="true"
						@boost="handleBoost"
						@share="handleShare"
						@reply="handleReply"
						@refresh="refreshPost"
					/>

					<!-- Interaction Tabs -->
					<div class="mt-6">
						<!-- Tab Bar -->
						<div class="tabs tabs-box bg-base-200/50 p-1 mb-4">
							<button
								v-for="tab in interactionTabs"
								:key="tab.value"
								class="tab flex-1 gap-1.5"
								:class="{ 'tab-active': activeTab === tab.value }"
								@click="activeTab = tab.value"
							>
								<component :is="tab.icon" class="h-4 w-4" />
								<span>{{ tab.label }}</span>
								<span
									v-if="tab.count !== undefined"
									class="badge badge-sm badge-primary"
								>
									{{ tab.count }}
								</span>
							</button>
						</div>

						<!-- Replies Tab -->
						<div v-if="activeTab === 'replies'" class="space-y-4">
							<!-- Reply Input -->
							<div v-if="isAuthenticated" class="card bg-base-100">
								<div class="card-body p-4">
									<div class="flex gap-3">
										<div v-if="userAvatar" class="avatar shrink-0">
											<div class="h-8 w-8 rounded-full">
												<img
													:src="userAvatar"
													:alt="userName"
													class="h-full w-full rounded-full object-cover"
												>
											</div>
										</div>
										<div v-else class="avatar avatar-placeholder shrink-0">
											<div class="h-8 w-8 rounded-full bg-primary text-primary-content">
												<span class="text-xs font-medium">{{ userInitials }}</span>
											</div>
										</div>
										<div class="flex-1">
											<textarea
												v-model="replyContent"
												placeholder="Write a reply..."
												class="textarea textarea-bordered w-full min-h-[80px] resize-none"
											/>
											<div class="flex justify-end mt-2">
												<button
													class="btn btn-primary btn-sm gap-1"
													:disabled="!replyContent.trim() || submittingReply"
													@click="submitReply"
												>
													<IconSend class="w-4 h-4" />
													Reply
												</button>
											</div>
										</div>
									</div>
								</div>
							</div>

							<!-- Replies List -->
							<div class="space-y-4">
								<PostCard
									v-for="reply in replies"
									:key="reply.id"
									:post="reply"
									:show-reference="false"
									@boost="handleBoost"
									@share="handleShare"
									@reply="handleReply"
								/>
							</div>

							<!-- Empty State -->
							<div
								v-if="replies.length === 0"
								class="text-center py-12"
							>
								<IconMessageCircle class="w-12 h-12 mx-auto text-base-content/20 mb-4" />
								<p class="text-base-content/50">
									No replies yet. Be the first to reply!
								</p>
							</div>
						</div>

						<!-- Forwards Tab -->
						<div v-else-if="activeTab === 'forwards'" class="space-y-4">
							<div class="space-y-4">
								<PostCard
									v-for="forward in forwards"
									:key="forward.id"
									:post="forward"
									:show-reference="false"
									@boost="handleBoost"
									@share="handleShare"
									@reply="handleReply"
								/>
							</div>

							<div
								v-if="forwards.length === 0"
								class="text-center py-12"
							>
								<IconForward class="w-12 h-12 mx-auto text-base-content/20 mb-4" />
								<p class="text-base-content/50">
									No forwards yet.
								</p>
							</div>
						</div>

						<!-- Boosts Tab -->
						<div v-else-if="activeTab === 'boosts'" class="space-y-2">
							<div
								v-for="boost in boosts"
								:key="boost.id"
								class="card bg-base-100"
							>
								<div class="card-body p-3">
									<div class="flex items-center gap-3">
										<NuxtLink
											v-if="boost.account"
											:to="`/publishers/${boost.account.name}`"
											class="avatar"
										>
											<div class="h-10 w-10 rounded-full">
												<img
													v-if="getAccountAvatar(boost.account)"
													:src="getAccountAvatar(boost.account)"
													:alt="boost.account.nick || boost.account.name"
													class="h-full w-full rounded-full object-cover"
												>
												<div
													v-else
													class="h-10 w-10 rounded-full bg-primary text-primary-content flex items-center justify-center"
												>
													<span class="text-sm font-medium">
														{{ getInitials(boost.account.nick || boost.account.name) }}
													</span>
												</div>
											</div>
										</NuxtLink>
										<div class="flex-1 min-w-0">
											<NuxtLink
												v-if="boost.account"
												:to="`/publishers/${boost.account.name}`"
												class="font-semibold text-sm hover:underline"
											>
												{{ boost.account.nick || boost.account.name }}
											</NuxtLink>
											<p class="text-xs text-base-content/50">
												Boosted {{ formatRelativeTime(boost.boostedAt) }}
											</p>
										</div>
									</div>
								</div>
							</div>

							<div
								v-if="boosts.length === 0"
								class="text-center py-12"
							>
								<IconRepeat2 class="w-12 h-12 mx-auto text-base-content/20 mb-4" />
								<p class="text-base-content/50">
									No boosts yet.
								</p>
							</div>
						</div>

						<!-- Reactions Tab -->
						<div v-else-if="activeTab === 'reactions'" class="space-y-2">
							<div
								v-for="reaction in reactionList"
								:key="reaction.id"
								class="card bg-base-100"
							>
								<div class="card-body p-3">
									<div class="flex items-center gap-3">
										<NuxtLink
											v-if="reaction.account"
											:to="`/publishers/${reaction.account.name}`"
											class="avatar"
										>
											<div class="h-10 w-10 rounded-full">
												<img
													v-if="getAccountAvatar(reaction.account)"
													:src="getAccountAvatar(reaction.account)"
													:alt="reaction.account.nick || reaction.account.name"
													class="h-full w-full rounded-full object-cover"
												>
												<div
													v-else
													class="h-10 w-10 rounded-full bg-primary text-primary-content flex items-center justify-center"
												>
													<span class="text-sm font-medium">
														{{ getInitials(reaction.account.nick || reaction.account.name) }}
													</span>
												</div>
											</div>
										</NuxtLink>
										<div class="flex-1 min-w-0">
											<NuxtLink
												v-if="reaction.account"
												:to="`/publishers/${reaction.account.name}`"
												class="font-semibold text-sm hover:underline"
											>
												{{ reaction.account.nick || reaction.account.name }}
											</NuxtLink>
											<p class="text-xs text-base-content/50">
												{{ formatRelativeTime(reaction.createdAt) }}
											</p>
										</div>
										<div class="flex items-center gap-2">
											<span class="text-xs text-base-content/60">
												{{ getReactionLabel(reaction.symbol) }}
											</span>
											<img
												v-if="hasSticker(reaction.symbol)"
												:src="getStickerUrl(reaction.symbol)"
												:alt="getReactionLabel(reaction.symbol)"
												class="w-6 h-6 object-contain"
											>
											<span v-else class="text-lg">
												{{ getReactionEmoji(reaction.symbol) }}
											</span>
										</div>
									</div>
								</div>
							</div>

							<div
								v-if="reactionList.length === 0"
								class="text-center py-12"
							>
								<IconSmilePlus class="w-12 h-12 mx-auto text-base-content/20 mb-4" />
								<p class="text-base-content/50">
									No reactions yet.
								</p>
							</div>
						</div>
					</div>
				</template>

				<!-- Error State -->
				<div v-else class="alert alert-warning">
					<IconAlertTriangle class="w-5 h-5" />
					<span>Post not found</span>
				</div>
			</div>

			<!-- Right Sidebar - Publisher Info -->
			<aside class="hidden xl:block sticky top-0 self-start mx-4">
				<PublisherSidebar
					v-if="post?.publisher"
					:publisher="post?.publisher"
				/>
			</aside>
		</div>
	</NuxtLayout>
</template>

<script setup lang="ts">
import type { Post } from '~/types/post';
import type { Boost, PostReaction } from '~/utils/api';
import {
	fetchPost,
	fetchPostReplies,
	fetchPostForwards,
	fetchPostBoosts,
	fetchPostReactionList,
} from '~/utils/api';
import { getFileUrl } from '~/utils/files';
import {
	IconArrowLeft,
	IconReply,
	IconAlertTriangle,
	IconMessageCircle,
	IconForward,
	IconRepeat2,
	IconSmilePlus,
	IconSend,
} from '#components';

const route = useRoute();
const router = useRouter();
const auth = useAuth();
const { isAuthenticated, user } = auth;

const postId = computed(() => route.params.id as string);

// Tab state
const activeTab = ref('replies');

// Reply state
const replyContent = ref('');
const submittingReply = ref(false);

// User info
const userName = computed(() => user.value?.nick || user.value?.name || '');
const userAvatar = computed(() => getFileUrl(user.value?.profile?.picture?.id));
const userInitials = computed(() => {
	const name = user.value?.name || '?';
	return name.slice(0, 2).toUpperCase();
});

// Fetch post
const {
	data: post,
	status: postStatus,
	refresh: refreshPost,
} = await useAsyncData(
	() => `post-${postId.value}`,
	() => fetchPost(postId.value),
	{ watch: [postId] }
);

// Fetch replies
const { data: replies } = await useAsyncData(
	() => `post-replies-${postId.value}`,
	() => fetchPostReplies(postId.value),
	{ watch: [postId], default: () => [] }
);

// Fetch forwards
const { data: forwards } = await useAsyncData(
	() => `post-forwards-${postId.value}`,
	async () => {
		const result = await fetchPostForwards(postId.value);
		return result.posts;
	},
	{ watch: [postId], default: () => [] }
);

// Fetch boosts
const { data: boosts } = await useAsyncData(
	() => `post-boosts-${postId.value}`,
	async () => {
		const result = await fetchPostBoosts(postId.value);
		return result.items;
	},
	{ watch: [postId], default: () => [] }
);

// Fetch reactions list
const { data: reactionList } = await useAsyncData(
	() => `post-reactions-${postId.value}`,
	async () => {
		const result = await fetchPostReactionList(postId.value);
		return result.items;
	},
	{ watch: [postId], default: () => [] }
);

// Tab configuration
const interactionTabs = computed(() => [
	{
		value: 'replies',
		label: 'Replies',
		icon: IconMessageCircle,
		count: replies.value?.length,
	},
	{
		value: 'forwards',
		label: 'Forwards',
		icon: IconForward,
		count: forwards.value?.length,
	},
	{
		value: 'boosts',
		label: 'Boosts',
		icon: IconRepeat2,
		count: boosts.value?.length,
	},
	{
		value: 'reactions',
		label: 'Reactions',
		icon: IconSmilePlus,
		count: reactionList.value?.length,
	},
]);

// Sticker helpers
const stickerSymbols = new Set([
	'thumb_up', 'heart', 'clap', 'party', 'laugh', 'cry', 'angry', 'confuse', 'pray',
	'thumb_down', 'thinking', 'speechless', 'hello', 'eat', 'onegai', 'sleepy', 'sorry',
]);

function hasSticker(symbol: string): boolean {
	return stickerSymbols.has(symbol.toLowerCase());
}

function getStickerUrl(symbol: string): string {
	return `/images/stickers/${symbol.toLowerCase()}.webp`;
}

function getReactionEmoji(symbol: string): string {
	const emojiMap: Record<string, string> = {
		thumb_up: '👍',
		heart: '❤️',
		clap: '👏',
		party: '🎉',
		laugh: '😂',
		cry: '😢',
		angry: '😠',
		confuse: '😕',
		pray: '🙏',
		thumb_down: '👎',
	};
	return emojiMap[symbol.toLowerCase()] || '❓';
}

function getReactionLabel(symbol: string): string {
	const labelMap: Record<string, string> = {
		thumb_up: 'Like',
		heart: 'Heart',
		clap: 'Clap',
		party: 'Party',
		laugh: 'Laugh',
		cry: 'Cry',
		angry: 'Angry',
		confuse: 'Confused',
		pray: 'Pray',
		thumb_down: 'Dislike',
		thinking: 'Thinking',
		speechless: 'Speechless',
		hello: 'Hello',
		eat: 'Eat',
		onegai: 'Please',
		sleepy: 'Sleepy',
		sorry: 'Sorry',
	};
	return labelMap[symbol.toLowerCase()] || symbol;
}

// Helper functions
function getAccountAvatar(account: { profile?: { picture?: { id: string } } }): string {
	return getFileUrl(account.profile?.picture?.id) || '';
}

function getInitials(name: string): string {
	if (!name || name === 'Unknown') return '?';
	return name
		.split(' ')
		.map((n) => n[0])
		.join('')
		.toUpperCase()
		.slice(0, 2);
}

function formatRelativeTime(dateStr: string): string {
	const date = new Date(dateStr);
	const now = new Date();
	const diff = now.getTime() - date.getTime();
	const minutes = Math.floor(diff / 60000);
	const hours = Math.floor(diff / 3600000);
	const days = Math.floor(diff / 86400000);

	if (minutes < 1) return 'just now';
	if (minutes < 60) return `${minutes}m ago`;
	if (hours < 24) return `${hours}h ago`;
	if (days < 7) return `${days}d ago`;
	return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// SEO
watch(
	post,
	(p) => {
		if (p) {
			const title = p.title || `${p.publisher?.nick || p.publisher?.name}'s Post`;
			const description = p.description || p.content.slice(0, 160);
			const imageUrl = p.attachments[0]?.url || getFileUrl(p.attachments[0]?.id);

			useHead({
				title,
				meta: [
					{ name: 'description', content: description },
					{ property: 'og:title', content: title },
					{ property: 'og:description', content: description },
					{ property: 'og:type', content: 'article' },
					...(imageUrl ? [{ property: 'og:image', content: imageUrl }] : []),
					{ property: 'og:url', content: `https://solian.app/posts/${p.id}` },
					{ name: 'twitter:card', content: imageUrl ? 'summary_large_image' : 'summary' },
					{ name: 'twitter:title', content: title },
					{ name: 'twitter:description', content: description },
					...(imageUrl ? [{ name: 'twitter:image', content: imageUrl }] : []),
				],
			});
		}
	},
	{ immediate: true }
);

function handleBack() {
	if (typeof window !== 'undefined' && window.history.length > 1) {
		router.back();
		return;
	}
	router.push('/');
}

function handleReply(post?: Post) {
	if (post) {
		const compose = useCompose();
		compose.initializeFromState({
			content: '',
			replyingTo: post,
		});
		const event = new CustomEvent('open-compose');
		window.dispatchEvent(event);
	}
}

function handleBoost(_p: Post) {
	// TODO: Implement boost
}

function handleShare(p: Post) {
	if (navigator.share) {
		navigator.share({
			title: p.title || 'Post on Floating Island',
			text: p.content.slice(0, 100),
			url: window.location.href,
		});
	}
}

async function submitReply() {
	if (!replyContent.value.trim() || submittingReply.value) return;

	submittingReply.value = true;
	try {
		// TODO: Implement reply submission via API
		replyContent.value = '';
		// Refresh replies
	} catch (e) {
		console.error('Failed to submit reply:', e);
	} finally {
		submittingReply.value = false;
	}
}
</script>
