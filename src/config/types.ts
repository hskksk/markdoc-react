import type { Config, Schema } from '@markdoc/markdoc'

export interface MarkdocExtensions {
  nodes?: Record<string, Schema>
  tags?: Record<string, Schema>
  variables?: Config['variables']
  functions?: Config['functions']
}
