import { Tag, type Config, type Node, type Schema } from '@markdoc/markdoc'

function diagramSourceFromFence(node: Node): { source: string; lang?: string } {
  for (const child of node.children) {
    if (child.type !== 'fence') continue
    const source = child.attributes.content
    if (typeof source === 'string' && source.length > 0) {
      const lang = child.attributes.language
      return { source, lang: typeof lang === 'string' ? lang : undefined }
    }
  }
  return { source: '' }
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
    const { source, lang } = diagramSourceFromFence(node)
    const type = lang === 'd2' ? 'd2' : (attributes.type as string) || 'mermaid'
    return new Tag('Diagram', { ...attributes, type, source }, [])
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
