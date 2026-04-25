<template>
	<NuxtLayout name="app">
		<div class="grid xl:grid-cols-[1fr_16rem] gap-6 min-w-0">
			<!-- Main Content -->
			<div class="min-w-0">
				<!-- Mobile Tab Navigation -->
				<div class="xl:hidden mb-4 overflow-x-auto pb-2 flex justify-center">
					<div class="tabs tabs-box tabs-sm flex-nowrap min-w-max">
						<NuxtLink
							v-for="item in menuItems"
							:key="item.to"
							:to="item.to"
							class="tab"
							:class="isActiveRoute(item.to) ? 'tab-active' : ''"
						>
							<span class="flex items-center gap-1.5">
								<component :is="item.icon" class="w-4 h-4" />
								{{ item.label }}
							</span>
						</NuxtLink>
					</div>
				</div>

				<NuxtPage />
			</div>

			<!-- Right Sidebar - Settings Navigation -->
			<aside class="hidden xl:block sticky top-4 self-start max-h-[calc(100vh-2rem)] overflow-y-auto">
				<div class="mt-4">
					<h2 class="card-title text-lg mb-4 px-2">Settings</h2>
					<ul class="menu menu-vertical p-0 gap-1 w-full">
						<li v-for="item in menuItems" :key="item.to">
							<NuxtLink
								:to="item.to"
								class="flex items-center gap-3 px-3 py-2 rounded-lg"
								:class="isActiveRoute(item.to) ? 'menu-active' : ''"
							>
								<component :is="item.icon" class="w-5 h-5" />
								<span class="text-sm">{{ item.label }}</span>
							</NuxtLink>
						</li>
					</ul>

					<NuxtLink
						:to="`/@${user?.name}`"
						class="btn btn-ghost btn-sm justify-start gap-3 mt-4"
					>
						<IconArrowLeft class="w-5 h-5" />
						<span>Back to Profile</span>
					</NuxtLink>
				</div>
			</aside>
		</div>
	</NuxtLayout>
</template>

<script setup lang="ts">
import {
	IconUser,
	IconShield,
	IconLock,
	IconBell,
	IconPalette,
	IconArrowLeft
} from '#components';

const route = useRoute();
const { user } = useAuth();

const menuItems = [
	{ to: '/accounts/me/settings', label: 'Profile', icon: IconUser },
	{ to: '/accounts/me/settings/security', label: 'Security', icon: IconShield },
	{ to: '/accounts/me/settings/privacy', label: 'Privacy', icon: IconLock },
	{ to: '/accounts/me/settings/notifications', label: 'Notifications', icon: IconBell },
	{ to: '/accounts/me/settings/appearance', label: 'Appearance', icon: IconPalette }
];

function isActiveRoute(path: string): boolean {
	// Exact match for the base settings page
	if (path === '/accounts/me/settings') {
		return route.path === path || route.path === `${path}/index`;
	}
	// For other pages, check if the current route starts with this path
	return route.path === path || route.path.startsWith(`${path}/`);
}

useHead({
	title: 'Settings'
});
</script>
