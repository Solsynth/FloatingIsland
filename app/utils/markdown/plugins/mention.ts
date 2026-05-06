import type MarkdownIt from 'markdown-it'

const mentionRegex = /@(\w+(?:\/\w+)?)/g

function mentionPlugin(md: MarkdownIt): void {
  // Core chain rule to replace mentions in text tokens
  md.core.ruler.push('mention', (state) => {
    const tokens = state.tokens

    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].type !== 'inline') continue

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

        mentionRegex.lastIndex = 0

        while ((match = mentionRegex.exec(text)) !== null) {
          // Add text before the match
          if (match.index > lastIndex) {
            const textToken = new state.Token('text', '', 0)
            textToken.content = text.slice(lastIndex, match.index)
            newTokens.push(textToken)
          }

          // Parse the mention
          const fullMention = match[1]
          const parts = fullMention.split('/')
          let type: string
          let id: string

          if (parts.length === 1) {
            // @username -> accounts
            type = 'accounts'
            id = parts[0]
          } else {
            // @type/id
            const typeShortcut = parts[0]
            id = parts[1]
            type = typeShortcut === 'u' ? 'accounts'
              : typeShortcut === 'r' ? 'realms'
              : typeShortcut === 'p' ? 'publishers'
              : 'accounts'
          }

          // Create mention_open token
          const mentionOpen = new state.Token('mention_open', 'a', 1)
          mentionOpen.attrSet('class', 'mention-chip')
          mentionOpen.attrSet('href', `/${type}/${id}`)
          mentionOpen.attrSet('data-mention-type', type)
          mentionOpen.attrSet('data-mention-id', id)
          mentionOpen.content = `@${fullMention}`
          newTokens.push(mentionOpen)

          // Create text token for the mention content
          const mentionText = new state.Token('mention_text', '', 0)
          mentionText.content = `@${fullMention}`
          newTokens.push(mentionText)

          // Create mention_close token
          const mentionClose = new state.Token('mention_close', 'a', -1)
          newTokens.push(mentionClose)

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

  // Add renderer rules for mention tokens
  md.renderer.rules.mention_open = (tokens, idx) => {
    const token = tokens[idx]
    const href = token.attrGet('href') || '#'
    return `<a class="mention-chip" href="${href}">`
  }

  md.renderer.rules.mention_text = (tokens, idx) => {
    return md.utils.escapeHtml(tokens[idx].content)
  }

  md.renderer.rules.mention_close = () => {
    return '</a>'
  }
}

export { mentionPlugin }
