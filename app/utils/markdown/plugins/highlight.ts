import type MarkdownIt from 'markdown-it'

function highlightPlugin(md: MarkdownIt): void {
  // Add inline rule for ==highlight== syntax
  md.inline.ruler.before('emphasis', 'highlight', (state, silent) => {
    const start = state.pos
    const max = state.posMax
    const marker = 0x3D // '=' character

    // Check if we have == at the start
    if (start + 1 >= max) return false
    if (state.src.charCodeAt(start) !== marker) return false
    if (state.src.charCodeAt(start + 1) !== marker) return false

    // Don't allow whitespace right after opening ==
    if (start + 2 < max && state.src.charCodeAt(start + 2) === 0x20) return false

    // Find closing ==
    let end = start + 2
    while (end < max) {
      if (state.src.charCodeAt(end) === marker && 
          end + 1 < max && 
          state.src.charCodeAt(end + 1) === marker) {
        // Don't allow whitespace right before closing ==
        if (end > start + 2 && state.src.charCodeAt(end - 1) === 0x20) {
          end++
          continue
        }
        break
      }
      end++
    }

    if (end >= max) return false
    if (end === start + 2) return false // Empty content

    if (!silent) {
      const token = state.push('highlight', '', 0)
      token.markup = '=='
      token.content = state.src.slice(start + 2, end)
    }

    state.pos = end + 2
    return true
  })

  // Add renderer rule for highlight tokens
  md.renderer.rules.highlight = (tokens, idx) => {
    const token = tokens[idx]
    return `<mark class="highlight">${md.utils.escapeHtml(token.content)}</mark>`
  }
}

export { highlightPlugin }
