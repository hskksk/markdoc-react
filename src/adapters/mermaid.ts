import { toErrorMessage } from '../text'
import type { DiagramRenderer } from './types'

export interface MermaidRenderResult {
  svg: string
  bindFunctions?: (element: Element) => void
}

export interface MermaidLike {
  initialize: (config: Record<string, unknown>) => void
  render: (id: string, text: string) => Promise<MermaidRenderResult>
}

let renderCount = 0

export function createMermaidRenderer(mermaid: MermaidLike): DiagramRenderer {
  return async ({ source, theme }) => {
    try {
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'loose',
        theme: theme === 'dark' ? 'dark' : 'default',
      })
      renderCount += 1
      const result = await mermaid.render(`markdoc-diagram-${renderCount}`, source)
      return { svg: result.svg }
    } catch (error) {
      return { error: toErrorMessage(error) }
    }
  }
}
