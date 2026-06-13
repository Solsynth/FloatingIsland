import type { HighlighterGeneric } from 'shiki'

let highlighterPromise: Promise<HighlighterGeneric<any, any>> | null = null

function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = import('shiki').then(({ createHighlighter, bundledLanguages, bundledThemes }) =>
      createHighlighter({
        themes: Object.keys(bundledThemes),
        langs: Object.keys(bundledLanguages),
      })
    )
  }
  return highlighterPromise
}

export function useShiki() {
  const isDark = ref(false)

  if (import.meta.client) {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    isDark.value = mq.matches
    mq.addEventListener('change', (e) => { isDark.value = e.matches })
  }

  const theme = computed(() => isDark.value ? 'github-dark' : 'github-light')

  async function highlightJson(code: string): Promise<string> {
    const h = await getHighlighter()
    if (!h) return code
    return h.codeToHtml(code, {
      lang: 'json',
      theme: theme.value,
    })
  }

  return { highlightJson, theme }
}
