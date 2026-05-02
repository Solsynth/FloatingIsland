<template>
	<div class="min-h-screen bg-base-200 flex items-center justify-center px-4">
		<div class="w-full max-w-md rounded-3xl shadow-2xl backdrop-blur-xl overflow-hidden">
			<div class="bg-base-100/90 p-6 backdrop-blur-2xl md:p-8">
				<div class="flex flex-col items-center gap-4 mb-6">
					<img src="/favicon.png" alt="Solar Network" class="h-12 w-12 rounded-full">
					<div class="text-center">
						<h1 class="text-2xl font-bold">Verification Required</h1>
						<p class="text-sm text-base-content/60 mt-1">
							Complete the captcha to continue
						</p>
					</div>
				</div>

				<div
					v-if="error"
					class="alert alert-error text-sm mb-4"
				>
					<IconAlertCircle class="w-4 h-4" />
					<span>{{ error }}</span>
				</div>

				<CaptchaWidget @verified="onVerified" />

				<p v-if="token" class="text-xs text-success text-center mt-3">
					<IconCheckCircle class="w-3 h-3 inline mr-1" />
					Captcha verified successfully. Redirecting...
				</p>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import {
	IconAlertCircle,
	IconCheckCircle,
} from '#components';

definePageMeta({ layout: false });

const route = useRoute();
const error = ref<string | null>(null);
const token = ref<string | null>(null);

const redirectUrl = computed(() => {
	const redirect = route.query.redirect as string;
	return redirect ? decodeURIComponent(redirect) : null;
});

function onVerified(captchaToken: string) {
	token.value = captchaToken;

	const target = redirectUrl.value || '/auth/login';
	const separator = target.includes('?') ? '&' : '?';
	const url = `${target}${separator}captcha_tk=${encodeURIComponent(captchaToken)}`;

	setTimeout(() => {
		navigateTo(url);
	}, 500);
}

onMounted(() => {
	const captchaTk = route.query.captcha_tk as string;
	if (captchaTk) {
		token.value = captchaTk;
	}
});
</script>
