import * as React from 'react'
import { useRef } from 'react'
import { MarkdocView, type MarkdocViewProps } from '../renderer/MarkdocView'
import { MarkdocMinimap, type MarkdocMinimapProps } from './MarkdocMinimap'

export interface MarkdocReaderProps extends MarkdocViewProps {
  minimap?: Omit<MarkdocMinimapProps, 'source' | 'scrollRoot'>
  showMinimap?: boolean
}

export function MarkdocReader({
  source,
  minimap,
  showMinimap = true,
  className: viewClassName,
  ...viewProps
}: MarkdocReaderProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  return (
    <div className="markdoc-reader">
      <div ref={scrollRef} className="markdoc-reader__main">
        <MarkdocView source={source} className={viewClassName} {...viewProps} />
      </div>
      {showMinimap ? <MarkdocMinimap source={source} scrollRoot={scrollRef} {...minimap} /> : null}
    </div>
  )
}
