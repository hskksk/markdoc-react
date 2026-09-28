import { Children, isValidElement, useState, type ReactElement, type ReactNode } from 'react'

export interface TabProps {
  label?: string
  children?: ReactNode
}

export function Tab({ children }: TabProps) {
  return <div className="markdoc-tab">{children}</div>
}

export function Tabs({ children }: { children?: ReactNode }) {
  const items = Children.toArray(children).filter(isValidElement) as ReactElement<TabProps>[]
  const [requested, setRequested] = useState(0)

  if (items.length === 0) return null

  const active = Math.min(requested, items.length - 1)

  return (
    <div className="markdoc-tabs">
      <div className="markdoc-tabs__list" role="tablist">
        {items.map((item, index) => (
          <button
            key={index}
            type="button"
            role="tab"
            aria-selected={index === active}
            className={`markdoc-tabs__tab${index === active ? ' markdoc-tabs__tab--active' : ''}`}
            onClick={() => setRequested(index)}
          >
            {item.props.label ?? `Tab ${index + 1}`}
          </button>
        ))}
      </div>
      <div className="markdoc-tabs__panel" role="tabpanel">
        {items[active]}
      </div>
    </div>
  )
}
