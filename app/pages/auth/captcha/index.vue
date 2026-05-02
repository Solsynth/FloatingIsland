<template>
	<div class="min-h-screen bg-base-200 flex items-center justify-center px-4">
		<div class="w-full max-w-lg rounded-3xl border border-base-300/70 bg-base-100/90 p-6 text-center shadow-2xl backdrop-blur-xl">
			<div class="mb-4 flex flex-col items-center gap-3">
				<div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary">
					<IconShieldCheck class="w-5 h-5" />
				</div>
				<div>
					<h1 class="text-xl font-black">Solar Network Anti-Robot</h1>
					<p class="text-xs text-base-content/60">Complete verification to continue</p>
				</div>
			</div>

			<div class="my-4">
				<CaptchaWidget @verified="useToken" />
			</div>

			<p class="mt-5 text-xs text-base-content/60">
				Hosted by
				<a
					href="https://github.com/Solsynth/DysonNetwork"
					class="link link-primary"
					target="_blank"
					rel="noreferrer"
				>DysonNetwork.Sphere</a>
			</p>
		</div>
	</div>
</template>

<script setup lang="ts">
import { IconShieldCheck } from '#components';

definePageMeta({ layout: false });

const route = useRoute();

function useToken(value: string) {
	const finalToken = value.trim();
	if (!finalToken) return;

	if (window.parent !== window) {
		window.parent.postMessage(`captcha_tk=${finalToken}`, '*');
	}

	const redirectUri = route.query.redirect_uri as string;
	if (redirectUri) {
		const url = new URL(redirectUri);
		url.searchParams.set('captcha_tk', finalToken);
		window.location.href = url.toString();
	}
}
</script>
