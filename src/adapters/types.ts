export interface HighlightInput {
  code: string
  language?: string
}

export interface HighlightResult {
  html: string
}

export type Highlighter = (input: HighlightInput) => HighlightResult | Promise<HighlightResult>

export type DiagramType = 'mermaid' | 'd2'

export interface DiagramInput {
  type: DiagramType
  source: string
  theme?: DiagramTheme
}

export interface DiagramResult {
  svg?: string
  error?: string
}

export type DiagramRenderer = (input: DiagramInput) => Promise<DiagramResult>

export interface MathInput {
  tex: string
  display: boolean
}

export type MathRenderer = (input: MathInput) => string | Promise<string>

export type DiagramTheme = 'light' | 'dark'
