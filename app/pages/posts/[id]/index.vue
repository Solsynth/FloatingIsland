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
				<button class="btn btn-sm btn-primary" @click="handleReply">
					<IconReply class="w-4 h-4" />
					Reply
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
						@boost="handleBoost"
						@share="handleShare"
					/>

					<!-- Replies -->
					<div class="mt-6">
						<h2 class="text-lg font-bold mb-4 px-1">
							Replies ({{ replies.length }})
						</h2>
						<div class="space-y-4">
							<PostCard
								v-for="reply in replies"
								:key="reply.id"
								:post="reply"
								:show-reference="false"
								@boost="handleBoost"
								@share="handleShare"
							/>
						</div>
						<p
							v-if="replies.length === 0"
							class="text-center text-base-content/40 py-8"
						>
							No replies yet. Be the first to reply!
						</p>
					</div>
				</template>

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
import { fetchPost, fetchPostReplies } from '~/utils/api';
import { IconArrowLeft, IconReply, IconAlertTriangle } from '#components';

const route = useRoute();
const router = useRouter();
const postId = computed(() => route.params.id as string);

// Fetch post with useAsyncData
const { data: post, status: postStatus } = await useAsyncData(
	() => `post-${postId.value}`,
	() => fetchPost(postId.value),
	{
		watch: [postId]
	}
);

// Fetch replies with useAsyncData
const { data: replies } = await useAsyncData(
	() => `post-replies-${postId.value}`,
	() => fetchPostReplies(postId.value),
	{
		watch: [postId],
		default: () => []
	}
);

// SEO
watch(
	post,
	(p) => {
		if (p) {
			useHead({
				title:
					p.title ||
					`${p.publisher?.nick || p.publisher?.name}'s Post`,
				meta: [
					{
						name: 'description',
						content: p.description || p.content.slice(0, 160)
					}
				]
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

function handleReply() {
	if (post.value) {
		const compose = useCompose();
		compose.initializeFromState({
			content: '',
			replyingTo: post.value
		});
		const event = new CustomEvent('open-compose');
		window.dispatchEvent(event);
	}
}

function handleBoost(_p: Post) {
}

function handleShare(p: Post) {
	if (navigator.share) {
		navigator.share({
			title: p.title || 'Post on Floating Island',
			text: p.content.slice(0, 100),
			url: window.location.href
		});
	}
}
</script>
