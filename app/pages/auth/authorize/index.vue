<template>
	<div class="min-h-screen bg-base-200 flex items-center justify-center px-4 py-8 relative">
		<!-- Background Image (if available) -->
		<div
			v-if="backgroundUrl"
			class="fixed inset-0 -z-10 bg-cover bg-center opacity-30 blur-sm"
			:style="`background-image: url('${backgroundUrl}')`"
		/>

		<div class="w-full max-w-4xl rounded-3xl shadow-2xl backdrop-blur-xl overflow-hidden">
			<div class="grid md:grid-cols-[0.95fr_1.05fr]">
				<!-- Left Column: Branding & User Account -->
				<section
					class="flex flex-col justify-between gap-4 rounded-t-3xl bg-base-100/50 p-6 backdrop-blur-2xl md:rounded-l-3xl md:rounded-tr-none md:p-8"
				>
					<div class="flex flex-col gap-4">
						<img src="/favicon.png" alt="Solar Network" class="h-12 w-12 rounded-full">
						<div>
							<p class="text-xs font-semibold tracking-[0.2em] text-base-content/70 uppercase">
								Authorization Request
							</p>
						</div>
						<div>
							<h1 class="text-3xl leading-tight font-black">Grant Access</h1>
							<p class="text-sm text-base-content/70 mt-2">
								Review the permissions before authorizing this application.
							</p>
						</div>
					</div>

					<!-- User Account Info (Bottom of left panel) -->
					<div
						v-if="auth.user.value"
						class="flex items-center gap-3 p-4 bg-base-200/60 rounded-2xl border border-base-300"
					>
						<div class="avatar">
							<div class="w-12 h-12 rounded-full overflow-hidden">
								<img
									v-if="userAvatarUrl"
									:src="userAvatarUrl"
									loading="lazy"
									class="w-full h-full object-cover"
								>
								<div
									v-else
									class="w-full h-full flex items-center justify-center bg-primary/15 text-primary"
								>
									<IconUser class="w-6 h-6" />
								</div>
							</div>
						</div>
						<div class="min-w-0">
							<p class="font-bold truncate">
								{{ auth.user.value?.nick || auth.user.value?.name || 'Unknown User' }}
							</p>
							<p class="text-xs text-base-content/50 truncate">
								@{{ auth.user.value?.name }}
							</p>
						</div>
					</div>
				</section>

				<!-- Right Column: Client Info & Authorization -->
				<section class="rounded-b-2xl bg-base-100/90 p-6 md:rounded-r-2xl md:rounded-bl-none md:p-8 min-h-96 flex flex-col justify-between">
					<ConfuseSpinner v-if="loading" message="Authorizing..." />

					<template v-else-if="clientInfo">
						<div>
							<!-- Error Message -->
							<div
								v-if="error"
								class="alert alert-error text-sm mb-4"
							>
								<IconAlertCircle class="w-4 h-4" />
								<span>{{ error }}</span>
							</div>

							<!-- Client/App Info -->
							<div class="flex items-center gap-4 mb-6">
								<div class="avatar">
									<div class="w-16 h-16 rounded-2xl bg-base-300 overflow-hidden">
										<img
											v-if="clientPictureUrl"
											:src="clientPictureUrl"
											loading="lazy"
											class="w-full h-full object-cover"
										>
										<div
											v-else
											class="w-full h-full flex items-center justify-center bg-primary/15 text-primary"
										>
											<IconPlug class="w-8 h-8" />
										</div>
									</div>
								</div>
								<div class="min-w-0">
									<p class="font-bold truncate text-xl">
										{{ clientInfo.clientName || 'Unknown App' }}
									</p>
									<p class="text-sm text-base-content/50">
										wants access to your account
									</p>
								</div>
							</div>

							<!-- Permissions -->
							<div class="rounded-2xl border border-base-300 bg-base-200/60 p-4">
								<p class="mb-3 text-sm font-semibold flex items-center gap-2">
									<IconShield class="w-4 h-4 text-primary" />
									Requested permissions
								</p>
								<ul
									v-if="clientInfo.scopes?.length"
									class="space-y-2 text-sm"
								>
									<li
										v-for="scope in clientInfo.scopes"
										:key="scope"
										class="flex items-start gap-2"
									>
										<IconCheck class="w-4 h-4 mt-0.5 text-success flex-shrink-0" />
										<span>{{ getScopeLabel(scope) }}</span>
									</li>
								</ul>
								<p v-else class="text-sm text-base-content/60">
									No explicit scopes provided.
								</p>
							</div>
						</div>

						<!-- Action Buttons -->
						<div class="mt-6 grid grid-cols-2 gap-3">
							<button
								class="btn btn-primary"
								:disabled="isAuthorizing"
								@click="handleApprove"
							>
								<IconLoader
									v-if="isAuthorizing"
									class="w-4 h-4 animate-spin"
								/>
								<IconCheck v-else class="w-4 h-4" />
								Authorize
							</button>
							<button
								class="btn btn-outline"
								:disabled="isAuthorizing"
								@click="handleDeny"
							>
								<IconX class="w-4 h-4" />
								Deny
							</button>
						</div>
					</template>

					<!-- Error State -->
					<div
						v-else
						class="flex flex-col items-center justify-center py-8 text-center"
					>
						<div class="w-16 h-16 rounded-full bg-error/20 flex items-center justify-center mb-4">
							<IconAlertCircle class="w-8 h-8 text-error" />
						</div>
						<h2 class="text-xl font-bold">Authorization Failed</h2>
						<p class="text-base-content/60 text-sm mt-1">
							Failed to load authorization request
						</p>
					</div>
				</section>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import {
	IconPlug,
	IconCheck,
	IconAlertCircle,
	IconLoader,
	IconX,
	IconShield,
	IconUser
} from '#components';

definePageMeta({
	layout: false,
});

const route = useRoute();
const auth = useAuth();
const loading = ref(true);
const isAuthorizing = ref(false);
const error = ref<string | null>(null);

const clientInfo = ref<{
	clientName?: string;
	homeUri?: string;
	picture?: { id?: string };
	background?: { id?: string };
	scopes?: string[];
} | null>(null);

// Cached image URLs - computed once when data changes
const userAvatarUrl = computed(() => {
	const fileId = auth.user.value?.profile?.picture?.id;
	return fileId ? `https://api.solian.app/drive/files/${fileId}` : null;
});

const clientPictureUrl = computed(() => {
	const fileId = clientInfo.value?.picture?.id;
	return fileId ? `https://api.solian.app/drive/files/${fileId}` : null;
});

const backgroundUrl = computed(() => {
	const fileId = clientInfo.value?.background?.id;
	return fileId ? `https://api.solian.app/drive/files/${fileId}` : null;
});

// User-friendly scope labels
const scopeLabels: Record<string, string> = {
	openid: 'Read your Solarpass profile',
	profile: 'Read your public profile information',
	email: 'Read your email address',
	'offline_access': 'Access your account when you\'re not logged in',
};

function getScopeLabel(scope: string): string {
	return scopeLabels[scope] || scope;
}

async function loadClientInfo() {
	try {
		const query = new URLSearchParams(
			route.query as Record<string, string>
		);
		const { getAuthorizeClientInfo } = await import('~/utils/api');
		clientInfo.value = await getAuthorizeClientInfo(query);
	} catch (e) {
		console.error('Failed to load client info:', e);
		error.value =
			e instanceof Error ? e.message : 'Failed to load authorization request';
	} finally {
		loading.value = false;
	}
}

async function handleApprove() {
	isAuthorizing.value = true;
	error.value = null;
	try {
		const query = new URLSearchParams(route.query as Record<string, string>);
		const { submitAuthorizeDecision } = await import('~/utils/api');
		const result = await submitAuthorizeDecision(query, true);
		if (result.redirectUri) {
			window.location.href = result.redirectUri;
		} else {
			navigateTo('/');
		}
	} catch (e) {
		error.value =
			e instanceof Error ? e.message : 'Failed to submit authorization';
		isAuthorizing.value = false;
	}
}

async function handleDeny() {
	isAuthorizing.value = true;
	error.value = null;
	try {
		const query = new URLSearchParams(route.query as Record<string, string>);
		const { submitAuthorizeDecision } = await import('~/utils/api');
		const result = await submitAuthorizeDecision(query, false);
		if (result.redirectUri) {
			window.location.href = result.redirectUri;
		} else {
			navigateTo('/');
		}
	} catch (e) {
		error.value = e instanceof Error ? e.message : 'Failed to submit denial';
		isAuthorizing.value = false;
	}
}

onMounted(() => {
	if (!auth.isAuthenticated.value) {
		const redirectUrl = route.fullPath;
		navigateTo(`/auth/login?redirect=${encodeURIComponent(redirectUrl)}`);
		return;
	}
	loadClientInfo();
});
</script>
