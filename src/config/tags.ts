import { Tag, type Config, type Node, type Schema } from '@markdoc/markdoc'

function plainText(node: Node): string {
  if (node.type === 'text' || node.type === 'code') {
    return typeof node.attributes.content === 'string' ? node.attributes.content : ''
  }
  if (node.type === 'softbreak' || node.type === 'hardbreak') return '\n'
  return node.children.map(plainText).join('')
}

function diagramFence(node: Node): Node | undefined {
  return node.children.find((child) => {
    if (child.type !== 'fence') return false
    return typeof child.attributes.content === 'string' && child.attributes.content.trim().length > 0
  })
}

export const callout: Schema = {
  render: 'Callout',
  attributes: {
    type: {
      type: String,
      default: 'note',
      matches: ['note', 'tip', 'warning', 'error'],
    },
  },
}

export const tabs: Schema = {
  render: 'Tabs',
}

export const tab: Schema = {
  render: 'Tab',
  attributes: {
    label: { type: String, required: true },
  },
}

export const details: Schema = {
  render: 'Details',
  attributes: {
    summary: { type: String },
    open: { type: Boolean, default: false },
  },
}

export const badge: Schema = {
  render: 'Badge',
  attributes: {
    type: {
      type: String,
      default: 'default',
      matches: ['default', 'info', 'success', 'warning', 'danger'],
    },
  },
}

export const kbd: Schema = {
  render: 'Kbd',
}

export const math: Schema = {
  render: 'Math',
  attributes: {
    display: { type: Boolean, default: true },
  },
}

export const diagram: Schema = {
  render: 'Diagram',
  attributes: {
    type: { type: String, default: 'mermaid', matches: ['mermaid', 'd2'] },
    source: { type: String },
  },
  transform(node: Node, config: Config) {
    const attributes = node.transformAttributes(config)
    const fence = diagramFence(node)
    const lang = typeof fence?.attributes.language === 'string' ? fence.attributes.language : undefined
    const explicit = node.attributes.type
    const type = explicit === 'd2' || explicit === 'mermaid'
      ? explicit
      : lang?.toLowerCase() === 'd2'
        ? 'd2'
        : 'mermaid'

    let source: string | undefined
    const fenceSource = fence?.attributes.content
    const attributeSource = node.attributes.source
    if (typeof fenceSource === 'string' && fenceSource.trim()) {
      source = fenceSource
    } else if (typeof attributeSource === 'string' && attributeSource.trim()) {
      source = attributeSource
    } else {
      const body = node.children
        .filter((child) => child.type !== 'fence')
        .map(plainText)
        .join('\n')
        .trim()
      if (body) source = body
    }

    const next: Record<string, unknown> = { ...attributes, type }
    if (source) next.source = source
    else delete next.source
    return new Tag('Diagram', next, [])
  },
}

export const builtinTags: Record<string, Schema> = {
  callout,
  tabs,
  tab,
  details,
  badge,
  kbd,
  math,
  diagram,
}
