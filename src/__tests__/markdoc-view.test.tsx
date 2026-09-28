import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MarkdocView, createKatexRenderer, createMermaidRenderer } from '../index'
import type { DiagramRenderer, Highlighter } from '../index'

describe('MarkdocView', () => {
  it('renders core markdown', () => {
    render(<MarkdocView source={'# Hello\n\nSome **bold** text.'} />)

    expect(screen.getByRole('heading', { level: 1, name: 'Hello' })).toBeInTheDocument()
    expect(screen.getByText('bold')).toBeInTheDocument()
  })

  it('renders a callout tag with its type', () => {
    render(<MarkdocView source={'{% callout type="warning" %}\nCareful now\n{% /callout %}'} />)

    expect(screen.getByText('Careful now')).toBeInTheDocument()
    expect(document.querySelector('[data-callout-type="warning"]')).not.toBeNull()
  })

  it('renders tabs and details tags', () => {
    const source = [
      '{% tabs %}',
      '{% tab label="Alpha" %}\nfirst\n{% /tab %}',
      '{% tab label="Beta" %}\nsecond\n{% /tab %}',
      '{% /tabs %}',
      '{% details summary="More" %}\nhidden body\n{% /details %}',
    ].join('\n')

    render(<MarkdocView source={source} />)

    expect(screen.getByRole('tab', { name: 'Alpha' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'Beta' })).toBeInTheDocument()
    expect(screen.getByText('hidden body')).toBeInTheDocument()
  })

  it('keeps markdoc tags inside md fences literal', () => {
    render(<MarkdocView source={'```md\n{% callout %}not-a-tag{% /callout %}\n```'} />)

    expect(document.querySelector('.markdoc-callout')).toBeNull()
    expect(screen.getByText(/{% callout %}/)).toBeInTheDocument()
  })

  it('renders custom tags supplied through config and components', () => {
    render(
      <MarkdocView
        source={'{% chart label="revenue" /%}'}
        config={{
          tags: {
            chart: {
              render: 'Chart',
              selfClosing: true,
              attributes: { label: { type: String } },
            },
          },
        }}
        components={{ Chart: ({ label }: { label?: string }) => <div>chart:{label}</div> }}
      />,
    )

    expect(screen.getByText('chart:revenue')).toBeInTheDocument()
  })

  it('uses an injected highlighter for fences', async () => {
    const highlighter: Highlighter = vi.fn(() => ({ html: '<span class="tok">hi</span>' }))

    render(<MarkdocView source={'```ts\nconst x = 1\n```'} highlighter={highlighter} />)

    expect(await screen.findByText('hi')).toBeInTheDocument()
    expect(highlighter).toHaveBeenCalledWith({ code: 'const x = 1', language: 'ts' })
  })

  it('falls back to the raw source when a diagram renderer is missing', () => {
    render(<MarkdocView source={'{% diagram type="mermaid" %}\n```mermaid\nflowchart LR\n  A --> B\n```\n{% /diagram %}'} />)

    expect(screen.getByText('No diagram renderer configured')).toBeInTheDocument()
    expect(screen.getByText(/flowchart LR/)).toBeInTheDocument()
  })

  it('renders diagram svg through an injected renderer', async () => {
    const diagramRenderer: DiagramRenderer = vi.fn(async () => ({ svg: '<svg data-testid="diagram"></svg>' }))

    render(
      <MarkdocView
        source={'{% diagram %}\n```mermaid\nflowchart LR\n  A --> B\n```\n{% /diagram %}'}
        diagramRenderer={diagramRenderer}
      />,
    )

    expect(await screen.findByTestId('diagram')).toBeInTheDocument()
    expect(diagramRenderer).toHaveBeenCalledWith(expect.objectContaining({ type: 'mermaid' }))
  })

  it('reports transform failures through onError', () => {
    const onError = vi.fn()

    render(
      <MarkdocView
        source={'# ok\n\nbody text'}
        config={{
          nodes: {
            paragraph: {
              transform() {
                throw new Error('boom')
              },
            },
          },
        }}
        onError={onError}
      />,
    )

    expect(onError).toHaveBeenCalledTimes(1)
  })
})

describe('adapters', () => {
  it('mermaid adapter forwards the source and theme', async () => {
    const renderMock = vi.fn(async () => ({ svg: '<svg />' }))
    const diagramRenderer = createMermaidRenderer({ initialize: vi.fn(), render: renderMock })

    const result = await diagramRenderer({ type: 'mermaid', source: 'flowchart LR', theme: 'dark' })

    expect(result.svg).toBe('<svg />')
    expect(renderMock).toHaveBeenCalledWith(expect.any(String), 'flowchart LR')
  })

  it('katex adapter renders tex', () => {
    const renderer = createKatexRenderer({
      renderToString: (tex) => `<span>${tex}</span>`,
    })

    expect(renderer({ tex: 'x^2', display: true })).toBe('<span>x^2</span>')
  })
})
