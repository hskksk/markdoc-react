# @hskksk/markdoc-react

Portable React renderer for [Markdoc](https://markdoc.dev) documents. It ships the
`parse → transform → render` pipeline with a built-in tag set, and keeps heavy
dependencies (highlighting, diagrams, math) out of the core through dependency
injection.

- Framework agnostic: works in Vite/React SPA and Next.js (client component or
  server transform + client render).
- Zero runtime dependencies besides `@markdoc/markdoc`.
- Markdoc never executes JavaScript, so rendering untrusted or AI-generated
  content is safe by construction.
- Semantic CSS classes plus CSS variables, shipped as a single stylesheet.

## Install

```bash
pnpm add @hskksk/markdoc-react
```

Import the base styles once, in your app entry:

```ts
import '@hskksk/markdoc-react/styles.css'
```

## Usage

```tsx
import { MarkdocView } from '@hskksk/markdoc-react'

export function DocumentView({ source }: { source: string }) {
  return <MarkdocView source={source} />
}
```

### Built-in tags

| Tag | Syntax | Notes |
| --- | --- | --- |
| `callout` | `{% callout type="warning" %}…{% /callout %}` | `note` \| `tip` \| `warning` \| `error` |
| `tabs` / `tab` | `{% tabs %}{% tab label="A" %}…{% /tab %}{% /tabs %}` | interactive |
| `details` | `{% details summary="More" %}…{% /details %}` | `<details>` element |
| `badge` | `{% badge type="success" %}new{% /badge %}` | inline |
| `kbd` | `Press {% kbd %}⌘K{% /kbd %}` | inline |
| `math` | `{% math %}E = mc^2{% /math %}` | `display=false` for inline |
| `diagram` | `{% diagram %}` + fenced `mermaid` block | `type="d2"` also supported |

Fences whose language is `md`, `markdown`, `markdoc`, or `mdoc` are treated as
literal source, so example tags inside them are not executed.

### Injecting highlighting, diagrams, and math

The core does not import `mermaid`, `katex`, or a syntax highlighter. Pass an
adapter built from the library you already use:

```tsx
import { MarkdocView, createMermaidRenderer, createHighlightJsRenderer } from '@hskksk/markdoc-react'
import mermaid from 'mermaid'
import hljs from 'highlight.js'

const diagramRenderer = createMermaidRenderer(mermaid)
const highlighter = createHighlightJsRenderer(hljs)

<MarkdocView source={source} highlighter={highlighter} diagramRenderer={diagramRenderer} theme="dark" />
```

Available adapters:

| Factory | Input |
| --- | --- |
| `createMermaidRenderer(mermaid)` | `mermaid` default export |
| `createD2Renderer(new D2())` | `@terrastruct/d2` instance |
| `createHighlightJsRenderer(hljs)` | `highlight.js` default export |
| `createShikiRenderer(highlighter, { theme })` | `shiki` highlighter |
| `createKatexRenderer(katex)` | `katex` default export |

Without an adapter the components degrade gracefully: fences render as escaped
code, diagrams show their source with a message, and math shows its TeX source.

### App-specific tags

Extend the schema and the component map through the props:

```tsx
<MarkdocView
  source={source}
  config={{
    tags: {
      episode: {
        render: 'EpisodePlayer',
        selfClosing: true,
        attributes: { id: { type: String, required: true } },
      },
    },
  }}
  components={{ EpisodePlayer: ({ id }) => <audio data-id={id} /> }}
/>
```

`config` accepts `nodes`, `tags`, `variables`, and `functions` and is merged on
top of the built-ins.

### Next.js

`MarkdocView` is a client component. In App Router, mark the file that uses it
with `"use client"`. You can also transform on the server and render on the
client, since Markdoc's renderable tree is serializable:

```tsx
// server
import Markdoc from '@markdoc/markdoc'
import { createMarkdocConfig } from '@hskksk/markdoc-react'

const content = Markdoc.transform(Markdoc.parse(source), createMarkdocConfig())
// pass `content` to a client component and call Markdoc.renderers.react there
```

## Streaming LLM output

`MarkdocView` parses whole documents. For token-by-token streaming (tags mixed
into model output), Markdoc's own parser is not the right tool; use a streaming
parser such as [`@mdocui/core`](https://www.npmjs.com/package/@mdocui/core) for
that and keep this package for stored documents.

## Related

This package generalizes the Markdoc setup used by
[`hskksk/podcaster`](https://github.com/hskksk/podcaster) and
[`hskksk/opencode-manager`](https://github.com/hskksk/opencode-manager).

## Development

```bash
pnpm install
pnpm typecheck
pnpm test
pnpm build
```

## License

MIT
