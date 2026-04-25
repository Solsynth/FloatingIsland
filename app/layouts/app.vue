<template>
	<div class="min-h-screen bg-base-200">
		<div class="app-shell mx-auto max-w-7xl lg:px-4">
			<!-- Desktop Layout -->
			<div class="hidden lg:grid lg:grid-cols-[16rem_1fr] lg:gap-4">
				<aside
					class="sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto"
				>
					<Sidebar @compose="showCompose = true" />
				</aside>
				<main class="min-h-screen py-4">
					<slot />
				</main>
			</div>

			<!-- Mobile Layout -->
			<div class="lg:hidden flex flex-col min-h-screen">
				<!-- Mobile Header -->
				<header
					class="sticky top-0 z-50 bg-base-100/95 backdrop-blur border-b border-base-300"
				>
					<div class="flex items-center justify-between px-4 h-14">
						<NuxtLink to="/" class="flex items-center gap-2">
							<img
								src="/favicon.png"
								alt="Solar Network"
								class="w-8 h-8"
							>
							<span class="font-bold text-lg">Solar Network</span>
						</NuxtLink>
					</div>
				</header>

				<!-- Mobile Main Content -->
				<main class="flex-1 px-2 py-3 pb-20">
					<slot />
				</main>

				<!-- Mobile Bottom Navigation -->
				<nav
					class="fixed bottom-0 left-0 right-0 z-50 bg-base-100/95 backdrop-blur border-t border-base-300 safe-area-pb"
				>
					<div class="flex items-center justify-around h-16">
						<NuxtLink
							to="/explore"
							class="flex flex-col items-center gap-0.5 p-2 text-base-content/60 hover:text-primary"
							:class="{ 'text-primary': $route.path.startsWith('/explore') }"
						>
							<IconSearch class="w-5 h-5" />
							<span class="text-xs">Explore</span>
						</NuxtLink>
						<NuxtLink
							to="/realms"
							class="flex flex-col items-center gap-0.5 p-2 text-base-content/60 hover:text-primary"
							:class="{
                                'text-primary':
                                    $route.path.startsWith('/realms'),
                            }"
						>
							<IconBuilding class="w-5 h-5" />
							<span class="text-xs">Realm</span>
						</NuxtLink>
						<NuxtLink
							:to="
                                isAuthenticated ? '/accounts/me' : '/auth/login'
                            "
							class="flex flex-col items-center gap-0.5 p-2 text-base-content/60 hover:text-primary"
							:class="{
                                'text-primary':
                                    $route.path.startsWith('/accounts') ||
                                    $route.path.startsWith('/@'),
                            }"
						>
							<div
								v-if="
                                    isAuthenticated &&
                                    user?.profile?.picture?.id
                                "
								class="w-5 h-5 rounded-full overflow-hidden"
							>
								<img
									alt="Account Picture"
									:src="
                                        user.profile.picture.url ||
                                        getFileUrl(user.profile.picture.id)
                                    "
									class="w-full h-full object-cover"
								>
							</div>
							<IconUser v-else class="w-5 h-5" />
							<span class="text-xs">Account</span>
						</NuxtLink>
					</div>
				</nav>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { getFileUrl } from '~/utils/files';

const router = useRouter();
const { isAuthenticated, user } = useAuth();
</script>

<style scoped>
.safe-area-pb {
	padding-bottom: env(safe-area-inset-bottom, 0);
}
</style>
