interface SeoMetaOptions {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: 'website' | 'article' | 'profile'
}

const SITE_NAME = 'Solar Network'
const DEFAULT_DESCRIPTION = 'Explore posts, realms, publishers, and livestreams on Solar Network.'
const DEFAULT_URL = 'https://solian.app'
const DEFAULT_IMAGE = '/og-image.png'

export function useSolarSeo(options: SeoMetaOptions = {}) {
  const { title, description, image, url, type = 'website' } = options

  const pageTitle = computed(() => {
    if (!title) return SITE_NAME
    return `${title} • ${SITE_NAME}`
  })

  const metaDescription = computed(() => description || DEFAULT_DESCRIPTION)
  const metaImage = computed(() => image || DEFAULT_IMAGE)
  const metaUrl = computed(() => url || DEFAULT_URL)

  useHead({
    title: title || SITE_NAME,
    meta: [
      { name: 'description', content: metaDescription },
      { property: 'og:title', content: pageTitle },
      { property: 'og:description', content: metaDescription },
      { property: 'og:site_name', content: SITE_NAME },
      { property: 'og:type', content: type },
      { property: 'og:url', content: metaUrl },
      { property: 'og:image', content: metaImage },
      { name: 'twitter:card', content: computed(() => image ? 'summary_large_image' : 'summary') },
      { name: 'twitter:title', content: pageTitle },
      { name: 'twitter:description', content: metaDescription },
      { name: 'twitter:image', content: metaImage },
    ],
  })
}
