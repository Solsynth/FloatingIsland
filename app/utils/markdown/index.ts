import MarkdownIt from 'markdown-it'
import { mentionPlugin } from './plugins/mention'
import { stickerPlugin } from './plugins/sticker'
import { highlightPlugin } from './plugins/highlight'
import { spoilerPlugin } from './plugins/spoiler'
import { solianPlugin } from './plugins/solian'

const md = new MarkdownIt({
  html: false,
  breaks: true,
  linkify: true,
})

// Register plugins
md.use(mentionPlugin)
md.use(stickerPlugin)
md.use(highlightPlugin)
md.use(spoilerPlugin)
md.use(solianPlugin)

export { md }

export function renderMarkdown(content: string): string {
  return md.render(content)
}
