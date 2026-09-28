import type { Config } from '@markdoc/markdoc'
import { builtinNodes } from './nodes'
import { builtinTags } from './tags'
import type { MarkdocExtensions } from './types'

export function createMarkdocConfig(extensions?: MarkdocExtensions): Config {
  return {
    nodes: { ...builtinNodes, ...extensions?.nodes } as Config['nodes'],
    tags: { ...builtinTags, ...extensions?.tags },
    ...(extensions?.variables ? { variables: extensions.variables } : {}),
    ...(extensions?.functions ? { functions: extensions.functions } : {}),
  }
}
