import { escapeHtml } from '../text'
import type { Highlighter } from './types'

export interface ShikiHighlighterLike {
  codeToHtml: (code: string, options: { lang: string; theme: string }) => Promise<string>
}

export interface ShikiRendererOptions {
  theme?: string
}

export function createShikiRenderer(highlighter: ShikiHighlighterLike, options: ShikiRendererOptions = {}): Highlighter {
  const theme = options.theme ?? 'github-dark'

  return async ({ code, language }) => {
    try {
      const html = await highlighter.codeToHtml(code, { lang: language || 'text', theme })
      return { html }
    } catch {
      return { html: escapeHtml(code) }
    }
  }
}
