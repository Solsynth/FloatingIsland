<template>
	<div class="min-h-screen bg-base-200 flex items-center justify-center px-4 py-8">
		<div class="w-full max-w-4xl rounded-3xl shadow-2xl backdrop-blur-xl overflow-hidden">
			<div class="grid md:grid-cols-[0.95fr_1.05fr]">
				<!-- Left Column: Branding -->
				<section
					class="flex flex-col justify-between gap-4 rounded-t-3xl bg-base-100/50 p-6 backdrop-blur-2xl md:rounded-l-3xl md:rounded-tr-none md:p-8"
				>
					<div class="flex flex-col gap-4">
						<img src="/favicon.png" alt="Solar Network" class="h-12 w-12 rounded-full">
						<div>
							<p class="text-xs font-semibold tracking-[0.2em] text-base-content/70 uppercase">
								{{ t("auth.createAccount.step", { step: stepIndex }) }}
							</p>
						</div>
						<div>
							<h1 class="text-3xl leading-tight font-black">{{ t("auth.createAccount.title") }}</h1>
							<p class="text-sm text-base-content/70 mt-2">
								{{ t("auth.createAccount.subtitle") }}
							</p>
						</div>
					</div>


					<!-- Step Progress Bar -->
					<div class="flex items-center gap-1">
						<div
							v-for="i in 5"
							:key="i"
							class="flex-1 h-1.5 rounded-full transition-all duration-300"
							:class="i <= stepIndex ? 'bg-primary' : 'bg-base-300'"
						/>
					</div>
				</section>

				<!-- Right Column: Form -->
				<section class="rounded-b-2xl bg-base-100/90 p-6 md:rounded-r-2xl md:rounded-bl-none md:p-8 min-h-96 flex-col flex justify-between">
					<div v-if="error" class="alert alert-error text-sm mb-4">
						<IconAlertCircle class="w-4 h-4" />
						<span>{{ error }}</span>
					</div>

					<!-- Step 1: Username & Nickname -->
					<div v-if="stage === 'username-nick'" class="space-y-4">
						<fieldset class="fieldset">
							<legend class="fieldset-legend">{{ t("auth.createAccount.username") }}</legend>
							<input
								v-model="form.name"
								type="text"
								class="input input-bordered w-full"
								:placeholder="t('auth.createAccount.usernamePlaceholder')"
							>
							<p class="fieldset-label text-xs text-base-content/50">
								{{ t("auth.createAccount.usernameHint") }}
							</p>
						</fieldset>
						<fieldset class="fieldset">
							<legend class="fieldset-legend">{{ t("auth.createAccount.nickname") }}</legend>
							<input
								v-model="form.nick"
								type="text"
								class="input input-bordered w-full"
								:placeholder="t('auth.createAccount.nicknamePlaceholder')"
							>
						</fieldset>
					</div>

					<!-- Step 2: Email -->
					<div v-if="stage === 'email'" class="space-y-4">
						<fieldset class="fieldset">
							<legend class="fieldset-legend">{{ t("auth.createAccount.email") }}</legend>
							<input
								v-model="form.email"
								type="email"
								class="input input-bordered w-full"
								:placeholder="t('auth.createAccount.emailPlaceholder')"
							>
							<p class="fieldset-label text-xs text-base-content/50">
								{{ t("auth.createAccount.emailHint") }}
							</p>
						</fieldset>
					</div>

					<!-- Step 3: Password -->
					<div v-if="stage === 'password'" class="space-y-4">
						<fieldset class="fieldset">
							<legend class="fieldset-legend">{{ t("auth.createAccount.password") }}</legend>
							<input
								v-model="form.password"
								type="password"
								class="input input-bordered w-full"
								:placeholder="t('auth.createAccount.passwordPlaceholder')"
							>
							<p class="fieldset-label text-xs text-base-content/50">
								{{ t("auth.createAccount.passwordHint") }}
							</p>
						</fieldset>
					</div>

					<!-- Step 4: Captcha -->
					<div v-if="stage === 'captcha'" class="space-y-3">
						<p class="text-center text-sm text-base-content/70">
							{{ t("auth.createAccount.captchaTitle") }}
						</p>
						<CaptchaWidget @verified="onCaptchaVerified" />
						<p v-if="form.captchaToken" class="text-xs text-success text-center">
							<IconCheckCircle class="w-3 h-3 inline mr-1" />
							{{ t("auth.createAccount.captchaSuccess") }}
						</p>
					</div>

					<!-- Step 5: Terms -->
					<div v-if="stage === 'terms'" class="space-y-4">
						<div class="rounded-xl border border-base-300 bg-base-200/60 p-4 text-sm text-base-content/80">
							<ul class="list-disc space-y-1 pl-5">
								<li>{{ t("auth.createAccount.termsList1") }}</li>
								<li>{{ t("auth.createAccount.termsList2") }}</li>
								<li>{{ t("auth.createAccount.termsList3") }}</li>
							</ul>
						</div>
						<div class="flex items-center gap-2 text-sm text-base-content/70">
							<IconShieldCheck class="w-4 h-4 text-success" />
							<span>{{ t("auth.createAccount.termsAgree") }}</span>
						</div>
					</div>

					<!-- Navigation Buttons -->
					<div class="mt-6 flex items-center justify-between">
						<NuxtLink
							v-if="stage === 'username-nick'"
							:to="redirectUrl ? `/auth/login?redirect=${encodeURIComponent(redirectUrl)}` : '/auth/login'"
							class="btn btn-ghost btn-sm"
						>
							{{ t("auth.createAccount.login") }}
						</NuxtLink>
						<button
							v-else
							class="btn btn-ghost btn-sm"
							:disabled="submitting"
							@click="back"
						>
							<IconArrowLeft class="w-4 h-4" />
							{{ t("auth.back") }}
						</button>

						<button
							v-if="stage !== 'terms'"
							class="btn btn-primary"
							:disabled="!canProceed || submitting"
							@click="next"
						>
							{{ t("auth.createAccount.next") }}
							<IconArrowRight class="w-4 h-4" />
						</button>
						<button
							v-else
							class="btn btn-primary"
							:disabled="submitting"
							@click="handleSubmit"
						>
							<IconLoader
								v-if="submitting"
								class="w-4 h-4 animate-spin"
							/>
							<IconCheckCircle v-else class="w-4 h-4" />
							{{ t("auth.createAccount.createAccount") }}
						</button>
					</div>
				</section>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import {
	IconAlertCircle,
	IconArrowLeft,
	IconArrowRight,
	IconCheckCircle,
	IconShieldCheck,
	IconLoader
} from '#components';

definePageMeta({ layout: false });

const { t } = useI18n();

useSolarSeo({
    title: t("auth.seoTitleCreateAccount"),
    description: t("auth.seoDescriptionCreateAccount"),
});

type Stage = 'username-nick' | 'email' | 'password' | 'captcha' | 'terms';

const form = reactive({
	name: '',
	nick: '',
	email: '',
	password: '',
	captchaToken: ''
});

const stage = ref<Stage>('username-nick');
const submitting = ref(false);
const error = ref<string | null>(null);
const redirectUrl = ref<string | null>(null);

const stepIndex = computed(() => {
	const stages: Stage[] = ['username-nick', 'email', 'password', 'captcha', 'terms'];
	return stages.indexOf(stage.value) + 1;
});

const canProceed = computed(() => {
	switch (stage.value) {
		case 'username-nick':
			return /^[A-Za-z0-9_-]{2,256}$/.test(form.name) && form.nick.trim().length > 0 && form.nick.length <= 256;
		case 'email':
			return form.email.trim().length > 0 && !form.email.includes('+') && /.+@.+\..+/.test(form.email);
		case 'password':
			return form.password.length >= 4 && form.password.length <= 128;
		case 'captcha':
			return form.captchaToken.length > 0;
		case 'terms':
			return form.captchaToken.length > 0;
		default:
			return false;
	}
});

function validateCurrentStage(): string | null {
	if (stage.value === 'username-nick') {
		if (!/^[A-Za-z0-9_-]{2,256}$/.test(form.name)) {
			return t("auth.validation.username");
		}
		if (!form.nick.trim() || form.nick.length > 256) {
			return t("auth.validation.nickname");
		}
	}
	if (stage.value === 'email') {
		if (!form.email.trim() || form.email.includes('+') || !/.+@.+\..+/.test(form.email)) {
			return t("auth.validation.email");
		}
	}
	if (stage.value === 'password') {
		if (form.password.length < 4 || form.password.length > 128) {
			return t("auth.validation.password");
		}
	}
	if (stage.value === 'captcha' && !form.captchaToken.trim()) {
		return t("auth.validation.captcha");
	}
	return null;
}

function next() {
	const validationError = validateCurrentStage();
	if (validationError) {
		error.value = validationError;
		return;
	}

	error.value = null;

	if (stage.value === 'username-nick') stage.value = 'email';
	else if (stage.value === 'email') stage.value = 'password';
	else if (stage.value === 'password') stage.value = 'captcha';
	else if (stage.value === 'captcha') stage.value = 'terms';
}

function back() {
	error.value = null;

	if (stage.value === 'email') stage.value = 'username-nick';
	else if (stage.value === 'password') stage.value = 'email';
	else if (stage.value === 'captcha') stage.value = 'password';
	else if (stage.value === 'terms') stage.value = 'captcha';
}

function onCaptchaVerified(token: string) {
	form.captchaToken = token;
	stage.value = 'terms';
}

async function handleSubmit() {
	if (!form.captchaToken.trim()) {
		error.value = t("auth.validation.captchaSubmit");
		stage.value = 'captcha';
		return;
	}

	submitting.value = true;
	error.value = null;

	try {
		const { createAccount } = await import('~/utils/api');
		await createAccount({
			name: form.name.trim(),
			nick: form.nick.trim(),
			email: form.email.trim(),
			password: form.password,
			language: navigator.language?.toLowerCase() || 'en-us',
			captchaToken: form.captchaToken
		});

		const loginUrl = redirectUrl.value
			? `/auth/login?redirect=${encodeURIComponent(redirectUrl.value)}`
			: '/auth/login';
		navigateTo(loginUrl);
	} catch (e) {
		error.value = e instanceof Error ? e.message : t("auth.validation.failedCreate");
	} finally {
		submitting.value = false;
	}
}

onMounted(() => {
	const route = useRoute();
	const tk = route.query.captcha_tk as string;
	if (tk) {
		form.captchaToken = tk;
		stage.value = 'terms';
	}
	// Save redirect param for navigation back to login
	const redirect = route.query.redirect as string;
	if (redirect) {
		redirectUrl.value = redirect;
	}
});
</script>
