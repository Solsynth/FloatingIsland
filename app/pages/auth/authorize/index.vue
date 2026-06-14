<template>
	<div class="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden">
		<!-- Full-page blurred background -->
		<div
			v-if="backgroundUrl"
			class="fixed inset-0 -z-10 bg-cover bg-center scale-110"
			:style="`background-image: url('${backgroundUrl}')`"
		/>
		<div
			class="fixed inset-0 -z-10 backdrop-blur-3xl bg-base-200/60"
			:class="{ 'bg-base-200': !backgroundUrl }"
		/>

		<div class="w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden border border-base-300/30">
			<div class="grid md:grid-cols-[1fr_1.1fr]">
				<!-- Left Column: Branding & App -->
				<section
					class="relative flex flex-col justify-between gap-6 rounded-t-3xl p-6 md:rounded-l-3xl md:rounded-tr-none md:p-8 overflow-hidden"
					:style="leftStyle"
				>
					<!-- Left background layer -->
					<div
						v-if="backgroundUrl"
						class="absolute inset-0 -z-10 bg-cover bg-center opacity-40"
						:style="`background-image: url('${backgroundUrl}')`"
					/>
					<div
						v-if="backgroundUrl"
						class="absolute inset-0 -z-10 bg-gradient-to-b from-base-100/80 via-base-100/60 to-base-100/90"
					/>
					<div v-else class="absolute inset-0 -z-10 bg-base-100/80 backdrop-blur-2xl" />

					<div class="flex flex-col gap-5">
						<img src="/favicon.png" alt="Solar Network" class="h-10 w-10 rounded-full opacity-80">
						<div>
							<p class="text-xs font-semibold tracking-[0.2em] text-base-content/60 uppercase">
								Authorization Request
							</p>
						</div>
						<div>
							<h1 class="text-3xl leading-tight font-black">Grant Access</h1>
							<p class="text-sm text-base-content/60 mt-2">
								Review the permissions before authorizing this application.
							</p>
						</div>
					</div>

					<!-- App Icon (large, centered) -->
					<div v-if="clientInfo" class="flex flex-col items-center gap-3 py-4">
						<div class="relative">
							<div class="avatar">
								<div class="w-24 h-24 rounded-3xl shadow-lg overflow-hidden ring-4 ring-base-100/50">
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
										<IconPlug class="w-10 h-10" />
									</div>
								</div>
							</div>
						</div>
						<p class="font-bold text-lg text-center">
							{{ clientInfo.clientName || 'Unknown App' }}
						</p>
					</div>

					<!-- User Account Info -->
					<div
						v-if="auth.user.value"
						class="flex items-center gap-3 p-4 bg-base-200/40 rounded-2xl border border-base-300/30 backdrop-blur-sm"
					>
						<div class="avatar">
							<div class="w-11 h-11 rounded-full overflow-hidden">
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
									<IconUser class="w-5 h-5" />
								</div>
							</div>
						</div>
						<div class="min-w-0">
							<p class="font-bold truncate text-sm">
								{{ auth.user.value?.nick || auth.user.value?.name || 'Unknown User' }}
							</p>
							<p class="text-xs text-base-content/50 truncate">
								@{{ auth.user.value?.name }}
							</p>
						</div>
					</div>
				</section>

				<!-- Right Column: Permissions & Actions -->
				<section class="rounded-b-2xl bg-base-100/95 backdrop-blur-sm p-6 md:rounded-r-2xl md:rounded-bl-none md:p-8 min-h-96 flex flex-col justify-between">
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

							<!-- App Info Summary -->
							<div class="flex flex-col items-center text-center mb-6">
								<div class="avatar mb-2">
									<div class="w-11 h-11 rounded-2xl overflow-hidden ring-2 ring-base-300/30">
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
											<IconPlug class="w-5 h-5" />
										</div>
									</div>
								</div>
								<p class="font-bold text-xl">
									{{ clientInfo.clientName || 'Unknown App' }}
								</p>
								<p class="text-sm text-base-content/50">
									wants access to your account
								</p>
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
									<IconAlertTriangle
										v-if="scope === '*'"
										class="w-4 h-4 mt-0.5 text-warning flex-shrink-0"
									/>
									<IconCheck
										v-else
										class="w-4 h-4 mt-0.5 text-success flex-shrink-0"
									/>
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

		<div class="w-full max-w-4xl mt-4 flex justify-center md:justify-end">
			<button
				class="btn btn-ghost btn-sm text-base-content/60"
				:disabled="isLoggingOut || isAuthorizing"
				@click="handleLogoutForAnotherAccount"
			>
				<IconLoader
					v-if="isLoggingOut"
					class="w-4 h-4 animate-spin"
				/>
				<IconLogOut v-else class="w-4 h-4" />
				Use another account
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import {
	IconPlug,
	IconCheck,
	IconAlertTriangle,
	IconAlertCircle,
	IconLoader,
	IconLogOut,
	IconX,
	IconShield,
	IconUser
} from '#components';

definePageMeta({
	layout: false,
	middleware: 'auth',
});

defineOgImage('UniOgImage', { title: 'Authorize App', description: 'Authorize an application to access your Solar Network account.' })

useSolarSeo({
	title: "Authorize App",
	description: "Authorize an application to access your Solar Network account.",
});

const route = useRoute();
const auth = useAuth();
const loading = ref(true);
const isAuthorizing = ref(false);
const isLoggingOut = ref(false);
const error = ref<string | null>(null);

const clientInfo = ref<{
	clientName?: string;
	homeUri?: string;
	picture?: { id?: string };
	background?: { id?: string };
	scopes?: string[];
} | null>(null);

// Cached image URLs
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

// Left column style: tinted with app background
const leftStyle = computed(() => {
	if (!backgroundUrl.value) return {};
	return {};
});

// User-friendly scope labels
const scopeLabels: Record<string, string> = {
	openid: 'Read your Solarpass profile',
	profile: 'Read your public profile information',
	email: 'Read your email address',
	'offline_access': 'Access your account when you\'re not logged in',
	'*': 'Full access: this app can do anything as you',
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

async function handleLogoutForAnotherAccount() {
	isLoggingOut.value = true;
	error.value = null;
	try {
		await auth.logout();
		await navigateTo(`/auth/login?redirect=${encodeURIComponent(route.fullPath)}`);
	} catch (e) {
		error.value = e instanceof Error ? e.message : 'Failed to logout';
		isLoggingOut.value = false;
	}
}

onMounted(() => {
	loadClientInfo();
});
</script>
