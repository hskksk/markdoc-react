import type { ChartHandler, DiagramTheme, VizHandle } from './types'

export interface VegaEmbedViewLike {
  finalize: () => void
}

export interface VegaEmbedResultLike {
  view: VegaEmbedViewLike
}

export interface VegaEmbedLike {
  (container: HTMLElement, spec: unknown, options?: Record<string, unknown>): Promise<VegaEmbedResultLike>
}

export function createVegaLiteChartHandler(vegaEmbed: VegaEmbedLike): ChartHandler {
  return async (container, spec, { theme }) => {
    const result = await vegaEmbed(container, spec, {
      actions: { export: true, source: false, compiled: false, editor: false },
      theme: theme === 'dark' ? 'dark' : undefined,
    })
    const handle: VizHandle = {
      dispose: () => result.view.finalize(),
    }
    return handle
  }
}
