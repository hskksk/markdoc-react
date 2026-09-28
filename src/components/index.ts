import type { ComponentType } from 'react'
import { Badge } from './Badge'
import { Callout } from './Callout'
import { CodeFence } from './CodeFence'
import { Details } from './Details'
import { Diagram } from './Diagram'
import { Heading } from './Heading'
import { Kbd } from './Kbd'
import { Math } from './Math'
import { Tab, Tabs } from './Tabs'

/* Markdoc passes tag attributes as arbitrary props, so the component map is intentionally loose. */
/* eslint-disable @typescript-eslint/no-explicit-any */
export type MarkdocComponentMap = Record<string, ComponentType<any>>

export const builtinComponents: MarkdocComponentMap = {
  Badge,
  Callout,
  CodeFence,
  Details,
  Diagram,
  Heading,
  Kbd,
  Math,
  Tab,
  Tabs,
}

export { Badge, Callout, CodeFence, Details, Diagram, Heading, Kbd, Math, Tab, Tabs }
