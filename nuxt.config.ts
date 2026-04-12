// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['nuxt-lucide-icons'],
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: 'Floating Island',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Explore posts, realms, publishers, and livestreams on Solar Network.' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap' },
      ],
    },
  },
  vite: {
    plugins: [
      (await import('@tailwindcss/vite')).default(),
    ],
  },
  lucide: {
    namePrefix: 'icon',
  },
  runtimeConfig: {
    public: {
      apiBaseUrl: 'https://api.solian.app',
      fileBaseUrl: 'https://api.solian.app/drive/files',
    },
  },
  nitro: {
    routeRules: {
      '/api/proxy/**': { proxy: 'https://api.solian.app/**' },
    },
  },
})
