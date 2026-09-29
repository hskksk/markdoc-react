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
| `math` | `{% math %}E = mc^2{% /math %}` | display math (`display` defaults to `true`). `display=false` for inline |
| `diagram` | `{% diagram %}` + fenced block, `{% diagram source="..." /%}`, or a plain body | `type="d2"` or a `d2` fence. A fence keeps indentation; a plain body does not |

`{% math %}` renders a `<span>`, including when `display` is true, so it can sit
inside a paragraph. `$...$` is not parsed.

Block tags (`callout`, `tabs`, `details`, `diagram`) need to be their own block,
with the body on the following lines. A single-line tag is inline Markdown, and
the browser will not keep a block element inside a paragraph.

### Fences and tags

Tags inside a fence run only when both of these allow it:

- The site passes `fenceTags="document"` (the default). `fenceTags="off"` renders
  every fence as source. A document cannot turn that back on. This is a prop of
  `MarkdocView` / `createMarkdocConfig`, not something the document can set.
- The fence itself is not a literal example. Languages `md`, `markdown`,
  `markdoc`, and `mdoc` are literal unless the fence says `{% process=true %}`.
  Any fence can opt out with `{% process=false %}`.

```ts {% process=false %}
{% callout %}shown as text{% /callout %}
```

```md {% process=true %}
{% callout %}this callout renders{% /callout %}
```

```tsx
<MarkdocView source={source} fenceTags="off" />
```

Replacing `nodes.fence` in `config` opts out of this policy, because that
replaces the built-in fence. `theme` is the Mermaid theme (`light` or `dark`).
It does not change the stylesheet or the syntax highlighter. Set Shiki's theme
on `createShikiRenderer`.

Highlighted HTML and diagram SVG are inserted from the adapter you pass in.
`createMermaidRenderer` initializes Mermaid with `securityLevel: 'strict'`.
Treat that HTML as trusted to the same degree as the highlighter or diagram
library. Markdoc itself escapes raw HTML in the document.

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
top of the built-ins. Partials are not resolved, and frontmatter is omitted
from the rendered tree.

`onError` receives a thrown transform error, or Markdoc's validation errors
when the document is invalid. Validation errors do not stop rendering. The
callback runs after render, not during it.

### Next.js

`MarkdocView` is a client component. In App Router, mark the file that uses it
with `"use client"`. You can also transform on the server and render on the
client, since Markdoc's renderable tree is serializable:

```tsx
// server
import Markdoc from '@markdoc/markdoc'
import { createMarkdocConfig } from '@hskksk/markdoc-react'

const content = Markdoc.transform(
  Markdoc.parse(source),
  createMarkdocConfig(undefined, { fenceTags: 'document' }),
)
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

## Releases

Pushes to `main` run [semantic-release](https://semantic-release.gitbook.io/) and
publish to npm with the **`staging`** dist-tag (`pnpm add @hskksk/markdoc-react@staging`).
GitHub Releases and `v*` tags are created automatically when a new version is
published.

Commit messages must follow [Conventional Commits](https://www.conventionalcommits.org/)
(for example `feat: …`, `fix: …`). Releases are skipped when there is nothing
to publish.

### Starting at `0.0.1`

semantic-release treats the last git tag as the previous version. With **no tags**,
the baseline is `0.0.0`:

| Commits since baseline | First version |
| --- | --- |
| `fix:` / `perf:` / … (patch) | `0.0.1` |
| `feat:` (minor) | `0.1.0` |
| `BREAKING CHANGE` | `1.0.0` |

To align the first staging release with **`0.0.1`** when history already contains
`feat:` commits, create a **`v0.0.0`** tag on the commit *before* those features
(or on the current `main` tip and merge a `fix:` commit next). Example:

```bash
git tag v0.0.0 <commit-sha>
git push origin v0.0.0
```

The next releasable `fix:` (or patch-level) commit on `main` will then publish
`0.0.1` to `@staging`. You do not need to tag `v0.0.1` by hand.

Install staging builds:

```bash
pnpm add @hskksk/markdoc-react@staging
```

Promote a version to **`latest`** when ready:

```bash
npm dist-tag add @hskksk/markdoc-react@<version> latest
```

## License

MIT
