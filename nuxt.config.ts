// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['nuxt-lucide-icons'],
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [
      (await import('@tailwindcss/vite')).default(),
    ],
  },
  lucide: {
    // Default icon component name prefix
    namePrefix: 'icon',
  },
})
