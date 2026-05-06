import type MarkdownIt from 'markdown-it'

const stickerRegex = /:(\w+\+\w+):/g
const STICKER_BASE_URL = 'https://api.solian.app/sphere/stickers/lookup'

function stickerPlugin(md: MarkdownIt): void {
  // Core chain rule to replace stickers in text tokens
  md.core.ruler.push('sticker', (state) => {
    const tokens = state.tokens

    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].type !== 'inline') continue

      // Check if this is a single-sticker content (for enlarged display)
      const fullContent = tokens[i].content.trim()
      const singleStickerMatch = fullContent.match(/^:(\w+\+\w+):$/)
      const isEnlarged = !!singleStickerMatch

      const inlineTokens = tokens[i].children || []
      const newTokens: typeof inlineTokens = []

      for (let j = 0; j < inlineTokens.length; j++) {
        const token = inlineTokens[j]

        if (token.type !== 'text') {
          newTokens.push(token)
          continue
        }

        const text = token.content
        let lastIndex = 0
        let match: RegExpExecArray | null

        stickerRegex.lastIndex = 0

        while ((match = stickerRegex.exec(text)) !== null) {
          // Add text before the match
          if (match.index > lastIndex) {
            const textToken = new state.Token('text', '', 0)
            textToken.content = text.slice(lastIndex, match.index)
            newTokens.push(textToken)
          }

          const symbol = match[1]
          const stickerUrl = `${STICKER_BASE_URL}/${encodeURIComponent(symbol)}/open`

          // Create sticker token
          const stickerToken = new state.Token('sticker', 'img', 0)
          stickerToken.attrSet('src', stickerUrl)
          stickerToken.attrSet('alt', `:${symbol}:`)
          stickerToken.attrSet('class', `sticker-img${isEnlarged ? ' enlarged' : ''}`)
          stickerToken.attrSet('data-symbol', symbol)
          stickerToken.attrSet('loading', 'lazy')
          newTokens.push(stickerToken)

          lastIndex = match.index + match[0].length
        }

        // Add remaining text
        if (lastIndex < text.length) {
          const textToken = new state.Token('text', '', 0)
          textToken.content = text.slice(lastIndex)
          newTokens.push(textToken)
        }
      }

      tokens[i].children = newTokens
    }
  })

  // Add renderer rule for sticker tokens
  md.renderer.rules.sticker = (tokens, idx) => {
    const token = tokens[idx]
    const src = token.attrGet('src') || ''
    const alt = token.attrGet('alt') || ''
    const cls = token.attrGet('class') || 'sticker-img'
    const symbol = token.attrGet('data-symbol') || ''

    return `<img src="${src}" alt="${md.utils.escapeHtml(alt)}" class="${cls}" data-symbol="${md.utils.escapeHtml(symbol)}" loading="lazy" />`
  }
}

export { stickerPlugin }
