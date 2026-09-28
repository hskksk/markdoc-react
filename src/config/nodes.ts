import { Tag, nodes as defaultNodes, type Config, type Node, type Schema } from '@markdoc/markdoc'

const LITERAL_FENCE_LANGUAGES = new Set(['md', 'markdown', 'markdoc', 'mdoc'])

function fenceUsesLiteralContent(language: string | undefined, process: boolean | undefined): boolean {
  if (process === false) return true
  if (process === true) return false
  return language != null && LITERAL_FENCE_LANGUAGES.has(language)
}

const fence: Schema = {
  render: 'CodeFence',
  attributes: defaultNodes.fence.attributes,
  transform(node: Node, config: Config) {
    const attributes = node.transformAttributes(config)
    const language = node.attributes.language as string | undefined
    const processFlag = node.attributes.process as boolean | undefined
    const content = node.attributes.content as string | undefined
    const literal = fenceUsesLiteralContent(language, processFlag)
    const children =
      literal || node.children.length === 0
        ? content == null
          ? []
          : [content]
        : node.transformChildren(config)
    return new Tag('CodeFence', { ...attributes, language, content }, children)
  },
}

const heading: Schema = {
  render: 'Heading',
  attributes: {
    level: { type: Number, required: true },
    id: { type: String },
  },
}

const table: Schema = {
  ...defaultNodes.table,
  transform(node: Node, config: Config) {
    const children = node.transformChildren(config)
    return new Tag('div', { class: 'markdoc-table-wrap' }, [new Tag('table', {}, children)])
  },
}

export const builtinNodes: Record<string, Schema> = {
  ...defaultNodes,
  fence,
  heading,
  table,
}
