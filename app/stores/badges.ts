import { defineStore } from 'pinia';
import type { BadgeManifestEntry, BadgeManifestResponse } from '~/utils/badges';

export const useBadgeManifestStore = defineStore('badgeManifest', () => {
	const manifest = ref<Record<string, BadgeManifestEntry>>({});
	const isLoading = ref(false);
	const isLoaded = ref(false);
	const error = ref<string | null>(null);

	async function fetchManifest() {
		if (isLoading.value) return;

		isLoading.value = true;
		error.value = null;

		try {
			const config = useRuntimeConfig();
			const response = await fetch(
				`${config.public.apiBaseUrl}/.well-known/badges`,
				{ headers: { 'Accept': 'application/json' } }
			);

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}

			const data: BadgeManifestResponse = snakeToCamel(await response.json());

			if (data.badges?.length) {
				manifest.value = Object.fromEntries(
					data.badges.map((entry) => [entry.identifier, entry])
				);
				console.log(`[BadgeManifest] Loaded ${Object.keys(manifest.value).length} manifest.`);
				isLoaded.value = true;
			}
		} catch (err) {
			console.error('[BadgeManifest] Failed to load:', err);
			error.value = err instanceof Error ? err.message : 'Unknown error';
		} finally {
			isLoading.value = false;
		}
	}

	function getEntry(identifier: string): BadgeManifestEntry | undefined {
		return manifest.value[identifier];
	}

	return {
		manifest,
		isLoading,
		isLoaded,
		error,
		fetchManifest,
		getEntry
	};
});
