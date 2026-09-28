import Markdoc from '@markdoc/markdoc'
import * as React from 'react'
import { useMemo } from 'react'
import { builtinComponents, type MarkdocComponentMap } from '../components'
import { createMarkdocConfig } from '../config/createConfig'
import type { MarkdocExtensions } from '../config/types'
import { MarkdocProvider, type MarkdocRuntime } from '../context/MarkdocProvider'

export interface MarkdocViewProps extends MarkdocRuntime {
  source: string
  config?: MarkdocExtensions
  components?: MarkdocComponentMap
  className?: string
  onError?: (error: unknown) => void
}

export function MarkdocView({ source, config, components, className, onError, highlighter, diagramRenderer, mathRenderer, theme }: MarkdocViewProps) {
  const mergedConfig = useMemo(() => createMarkdocConfig(config), [config])
  const mergedComponents = useMemo<MarkdocComponentMap>(
    () => ({ ...builtinComponents, ...components }),
    [components],
  )
  const runtime = useMemo<MarkdocRuntime>(
    () => ({ highlighter, diagramRenderer, mathRenderer, theme }),
    [highlighter, diagramRenderer, mathRenderer, theme],
  )

  const content = useMemo(() => {
    try {
      const ast = Markdoc.parse(source)
      return Markdoc.transform(ast, mergedConfig)
    } catch (error) {
      onError?.(error)
      return null
    }
  }, [source, mergedConfig, onError])

  return (
    <MarkdocProvider value={runtime}>
      <div className={className ? `markdoc-root ${className}` : 'markdoc-root'} data-markdoc-view="">
        {content ? Markdoc.renderers.react(content, React, { components: mergedComponents }) : null}
      </div>
    </MarkdocProvider>
  )
}
