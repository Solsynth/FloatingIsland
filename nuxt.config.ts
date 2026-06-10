import tailwindcss from '@tailwindcss/vite';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: '2025-07-15',
	devtools: { enabled: true },
	modules: [
		'nuxt-lucide-icons',
		'@nuxt/eslint',
		'@pinia/nuxt',
		'@nuxtjs/i18n',
		'@nuxt/fonts',
		'nuxt-og-image',
		'nuxt-seo-utils',
		'nuxt-schema-org',
		'@nuxtjs/sitemap',
		'@nuxtjs/robots'
	],
	i18n: {
		strategy: 'no_prefix',
		defaultLocale: 'en',
		locales: [
			{ code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
			{ code: 'zh', language: 'zh-CN', name: '简体中文', file: 'zh-CN.json' }
		],
		lazy: true,
		bundle: { strictMessage: false },
		detectBrowserLanguage: {
			useCookie: true,
			cookieKey: 'i18n_locale',
			redirectOn: 'root',
			fallbackLocale: 'en',
			alwaysRedirect: false
		}
	},
	fonts: {
		families: [
			{ name: 'Nunito', weights: [400, 700], global: true },
			{ name: 'Noto Sans SC', weights: [400, 700], global: true }
		]
	},
	css: ['~/assets/css/main.css'],
	components: [
		{
			path: '~/components',
			pathPrefix: false
		}
	],
	experimental: {
		viewTransition: true
	},
	ogImage: {
		enabled: true,
		compatibility: {
			runtime: {
				takumi: 'node'
			}
		}
	},
	app: {
		head: {
			title: 'Solar Network',
			titleTemplate: (title) => {
				return title && title !== 'Solar Network' ? `${title} • Solar Network` : 'Solar Network';
			},
			meta: [
				{ charset: 'utf-8' },
				{ name: 'viewport', content: 'width=device-width, initial-scale=1' },
				{
					name: 'description',
					content:
						'Explore posts, realms, and publishers on Solar Network.'
				},
				{ name: 'theme-color', content: '#4f46e5' },
				{ property: 'og:type', content: 'website' },
				{ property: 'og:site_name', content: 'Solar Network' },
				{ property: 'og:title', content: 'Solar Network' },
				{
					property: 'og:description',
					content: 'Explore posts, realms, and publishers on Solar Network.'
				},
				{ property: 'og:image', content: '/og-image.png' },
				{ property: 'og:url', content: 'https://solian.app' },
				{ name: 'twitter:card', content: 'summary_large_image' },
				{ name: 'twitter:title', content: 'Solar Network' },
				{
					name: 'twitter:description',
					content: 'Explore posts, realms, and publishers on Solar Network.'
				},
				{ name: 'twitter:image', content: '/og-image.png' }
			],
			link: [
				{ rel: 'icon', type: 'image/png', href: '/favicon.png' },
				{ rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
				{ rel: 'preconnect', href: 'https://fonts.googleapis.com' },
				{
					rel: 'preconnect',
					href: 'https://fonts.gstatic.com',
					crossorigin: ''
				},
				{
					rel: 'stylesheet',
					href: 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap'
				}
			]
		}
	},
	vite: {
		plugins: [tailwindcss()]
	},
	lucide: {
		namePrefix: 'icon'
	},
	runtimeConfig: {
		public: {
			apiBaseUrl: 'https://api.solian.app',
			fileBaseUrl: 'https://api.solian.app/drive/files'
		}
	},
	site: {
		url: 'https://solian.app',
		name: 'Solar Network',
		description: 'Explore posts, realms, and publishers on Solar Network.',
		defaultLocale: 'en'
	},
	schemaOrg: {
		identity: {
			type: 'Organization',
			name: 'Solar Network',
			url: 'https://solian.app',
			logo: 'https://solian.app/favicon.png',
			sameAs: [
				'https://github.com/solsynth',
				'https://twitter.com/solsynth'
			]
		}
	},
	sitemap: {
		hosts: ['https://solian.app'],
		gzip: true,
		exclude: ['/admin/**', '/auth/**', '/api/**', '/compose', '/drive/**'],
		defaults: {
			changefreq: 'daily',
			priority: 0.7
		}
	},
	robots: {
		allow: '/',
		disallow: ['/admin', '/auth', '/api', '/compose', '/drive'],
		sitemap: 'https://solian.app/sitemap.xml'
	},
	nitro: {
		routeRules: {}
	}
});