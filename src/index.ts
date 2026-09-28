export { MarkdocView, type MarkdocViewProps } from './renderer/MarkdocView'

export { MarkdocProvider, useMarkdocRuntime, type MarkdocRuntime } from './context/MarkdocProvider'

export { createMarkdocConfig } from './config/createConfig'
export { builtinNodes } from './config/nodes'
export { builtinTags } from './config/tags'
export type { MarkdocExtensions } from './config/types'

export { builtinComponents, type MarkdocComponentMap } from './components'
export {
  Badge,
  Callout,
  CodeFence,
  Details,
  Diagram,
  Heading,
  Kbd,
  Math,
  Tab,
  Tabs,
} from './components'

export { childDiagramSource, childText, escapeHtml, slugify, toErrorMessage } from './text'

export { createMermaidRenderer, type MermaidLike, type MermaidRenderResult } from './adapters/mermaid'
export { createD2Renderer, type D2CompileResult, type D2Like } from './adapters/d2'
export { createHighlightJsRenderer, type HighlightJsLike } from './adapters/highlightjs'
export { createShikiRenderer, type ShikiHighlighterLike, type ShikiRendererOptions } from './adapters/shiki'
export { createKatexRenderer, type KatexLike } from './adapters/katex'
export type {
  DiagramInput,
  DiagramRenderer,
  DiagramResult,
  DiagramTheme,
  DiagramType,
  Highlighter,
  HighlightInput,
  HighlightResult,
  MathInput,
  MathRenderer,
} from './adapters/types'
