import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["nuxt-lucide-icons", "@nuxt/eslint", "@pinia/nuxt"],
  css: ["~/assets/css/main.css"],
  components: [
    {
      path: "~/components",
      pathPrefix: false,
    },
  ],
  experimental: {
    viewTransition: true,
  },
  app: {
    head: {
      title: "Solar Network",
      titleTemplate: (title) => {
        return title && title !== "Solar Network" ? `${title} • Solar Network` : "Solar Network";
      },
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content:
            "Explore posts, realms, publishers, and livestreams on Solar Network.",
        },
        { name: "theme-color", content: "#4f46e5" },
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: "Solar Network" },
        { property: "og:title", content: "Solar Network" },
        {
          property: "og:description",
          content: "Explore posts, realms, publishers, and livestreams on Solar Network.",
        },
        { property: "og:image", content: "/og-image.png" },
        { property: "og:url", content: "https://solian.app" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: "Solar Network" },
        {
          name: "twitter:description",
          content: "Explore posts, realms, publishers, and livestreams on Solar Network.",
        },
        { name: "twitter:image", content: "/og-image.png" },
      ],
      link: [
        { rel: "icon", type: "image/png", href: "/favicon.png" },
        { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap",
        },
      ],
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
  lucide: {
    namePrefix: "icon",
  },
  runtimeConfig: {
    public: {
      apiBaseUrl: "https://api.solian.app",
      fileBaseUrl: "https://api.solian.app/drive/files",
    },
  },
  nitro: {
    routeRules: {},
  },
});