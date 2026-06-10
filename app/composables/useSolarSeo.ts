import type { MaybeComputedRef } from '@vueuse/core'

interface SeoMetaOptions {
  title?: MaybeComputedRef<string>;
  description?: MaybeComputedRef<string>;
  image?: MaybeComputedRef<string>;
  url?: MaybeComputedRef<string>;
  type?: "website" | "article" | "profile";
  datePublished?: MaybeComputedRef<string>;
  dateModified?: MaybeComputedRef<string>;
  author?: MaybeComputedRef<string>;
  publisher?: string;
  breadcrumbs?: MaybeComputedRef<Array<{ name: string; item: string }>>;
}

const SITE_NAME = "Solar Network";
const DEFAULT_DESCRIPTION =
  "Explore posts, realms, and publishers on Solar Network.";
const DEFAULT_URL = "https://solian.app";

export function useSolarSeo(options: SeoMetaOptions = {}) {
  const {
    title,
    description,
    image,
    url,
    type = "website",
    datePublished,
    dateModified,
    author,
    publisher,
    breadcrumbs
  } = options;

  const i18n = useI18n();
  const localeProperties = computed(() => i18n.localeProperties.value);

  // Resolve reactive values
  const resolvedTitle = computed(() => toValue(title) || '');
  const resolvedDescription = computed(() => toValue(description) || '');
  const resolvedImage = computed(() => toValue(image) || '');
  const resolvedUrl = computed(() => toValue(url) || '');
  const resolvedDatePublished = computed(() => toValue(datePublished) || '');
  const resolvedDateModified = computed(() => toValue(dateModified) || '');
  const resolvedAuthor = computed(() => toValue(author) || '');
  const resolvedBreadcrumbs = computed(() => toValue(breadcrumbs) || []);

  // Just return the raw title - titleTemplate in nuxt.config.ts handles the suffix
  const pageTitle = computed(() => {
    return resolvedTitle.value || SITE_NAME;
  });

  const metaDescription = computed(() => resolvedDescription.value || DEFAULT_DESCRIPTION);
  const metaUrl = computed(() => resolvedUrl.value || DEFAULT_URL);

  // Schema.org structured data
  const schemaOrgData = computed(() => {
    const schemas: any[] = [];

    // Breadcrumb schema
    if (resolvedBreadcrumbs.value.length > 0) {
      schemas.push({
        '@type': 'BreadcrumbList',
        itemListElement: resolvedBreadcrumbs.value.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: item.item
        }))
      });
    }

    // Page-specific schema based on type
    if (type === 'article') {
      schemas.push({
        '@type': 'Article',
        headline: resolvedTitle.value,
        description: metaDescription.value,
        image: resolvedImage.value || undefined,
        url: metaUrl.value,
        datePublished: resolvedDatePublished.value || undefined,
        dateModified: resolvedDateModified.value || resolvedDatePublished.value || undefined,
        author: resolvedAuthor.value ? {
          '@type': 'Person',
          name: resolvedAuthor.value
        } : undefined,
        publisher: publisher ? {
          '@type': 'Organization',
          name: publisher,
          logo: {
            '@type': 'ImageObject',
            url: `${DEFAULT_URL}/favicon.png`
          }
        } : undefined,
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': metaUrl.value
        }
      });
    } else if (type === 'profile') {
      schemas.push({
        '@type': 'ProfilePage',
        mainEntity: {
          '@type': 'Person',
          name: resolvedTitle.value,
          description: metaDescription.value,
          image: resolvedImage.value || undefined
        }
      });
    } else {
      schemas.push({
        '@type': 'WebPage',
        name: resolvedTitle.value || SITE_NAME,
        description: metaDescription.value,
        url: metaUrl.value,
        image: resolvedImage.value || undefined
      });
    }

    return schemas;
  });

  useHead({
    htmlAttrs: {
      lang: computed(
        () => localeProperties.value.language || localeProperties.value.code,
      ),
    },
    title: computed(() => resolvedTitle.value || SITE_NAME),
    meta: [
      { name: "description", content: metaDescription },
      { property: "og:title", content: pageTitle },
      { property: "og:description", content: metaDescription },
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:type", content: type },
      { property: "og:url", content: metaUrl },
      {
        name: "twitter:card",
        content: computed(() => (resolvedImage.value ? "summary_large_image" : "summary")),
      },
      { name: "twitter:title", content: pageTitle },
      { name: "twitter:description", content: metaDescription },
      { name: "twitter:image", content: resolvedImage },
    ],
  });

  // Add Schema.org via useSchemaOrg
  useSchemaOrg(schemaOrgData.value);
}
