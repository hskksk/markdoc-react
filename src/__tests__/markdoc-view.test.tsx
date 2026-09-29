import { readFileSync } from 'node:fs'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MarkdocView, createKatexRenderer, createMermaidRenderer, createShikiRenderer } from '../index'
import type { DiagramRenderer, Highlighter } from '../index'

const css = readFileSync('src/markdoc.css', 'utf8')

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

    const token = await screen.findByText('hi')
    expect(token.closest('pre')).toHaveClass('markdoc-code')
    expect(token.parentElement?.tagName).toBe('CODE')
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

  it('runs tags inside a ts fence and lets the document opt out', () => {
    const { rerender } = render(<MarkdocView source={'```ts\n{% callout %}hi{% /callout %}\n```'} />)

    expect(document.querySelector('.markdoc-callout')).not.toBeNull()
    expect(screen.getByText('hi')).toBeInTheDocument()

    rerender(<MarkdocView source={'```ts {% process=false %}\n{% callout %}hi{% /callout %}\n```'} />)

    expect(document.querySelector('.markdoc-callout')).toBeNull()
    expect(screen.getByText(/{% callout %}/)).toBeInTheDocument()
  })

  it('lets a site turn fence tags off even when the document opts in', () => {
    const onError = vi.fn()

    render(
      <MarkdocView
        fenceTags="off"
        onError={onError}
        source={'```md {% process=true %}\n{% boom %}x{% /boom %}\n```'}
        config={{
          tags: {
            boom: {
              transform() {
                throw new Error('executed')
              },
            },
          },
        }}
      />,
    )

    expect(onError).not.toHaveBeenCalled()
    expect(screen.getByText(/{% boom %}/)).toBeInTheDocument()
    expect(document.querySelector('.markdoc-callout')).toBeNull()
  })

  it('moves tabs with the arrow keys', () => {
    const source = [
      '{% tabs %}',
      '{% tab label="Alpha" %}\nfirst\n{% /tab %}',
      '{% tab label="Beta" %}\nsecond\n{% /tab %}',
      '{% /tabs %}',
    ].join('\n')

    render(<MarkdocView source={source} />)

    const alpha = screen.getByRole('tab', { name: 'Alpha' })
    const beta = screen.getByRole('tab', { name: 'Beta' })
    expect(alpha).toHaveAttribute('tabindex', '0')
    expect(beta).toHaveAttribute('tabindex', '-1')
    expect(alpha.getAttribute('aria-controls')).toBe(document.querySelector('[role="tabpanel"]')?.id)

    fireEvent.keyDown(alpha, { key: 'ArrowRight' })

    expect(beta).toHaveAttribute('aria-selected', 'true')
    expect(beta).toHaveFocus()
    expect(screen.getByText('second')).toBeInTheDocument()
  })

  it('assigns stable unique heading ids', () => {
    const { rerender } = render(<MarkdocView source={'# Hello\n\n# Hello\n\n# !!!\n\n# Sample Heading {% #foo-bar %}'} />)

    const [first, second] = screen.getAllByRole('heading', { name: 'Hello' })
    expect(first).toHaveAttribute('id', 'hello')
    expect(second).toHaveAttribute('id', 'hello-2')
    expect(screen.getByRole('heading', { name: '!!!' })).not.toHaveAttribute('id')
    expect(screen.getByRole('heading', { name: /Sample Heading/ })).toHaveAttribute('id', 'foo-bar')

    rerender(<MarkdocView source={'# Hello'} />)
    expect(screen.getByRole('heading', { name: 'Hello' })).toHaveAttribute('id', 'hello')
  })

  it('renders display math as a span inside a paragraph', () => {
    const errors: string[] = []
    const spy = vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
      errors.push(args.map(String).join(' '))
    })

    render(<MarkdocView source={'{% math %}E = mc^2{% /math %}'} />)

    spy.mockRestore()
    const math = document.querySelector('.markdoc-math')
    expect(math?.tagName).toBe('SPAN')
    expect(math?.classList.contains('markdoc-math--block')).toBe(true)
    expect(math?.parentElement?.tagName).toBe('P')
    expect(errors.join('\n')).not.toContain('validateDOMNesting')
  })

  it('renders a diagram from a source attribute or a plain body', async () => {
    const diagramRenderer: DiagramRenderer = vi.fn(async () => ({ svg: '<svg data-testid="diagram"></svg>' }))
    const { rerender } = render(
      <MarkdocView source={'{% diagram source="flowchart LR" /%}'} diagramRenderer={diagramRenderer} />,
    )

    expect(await screen.findByTestId('diagram')).toBeInTheDocument()
    expect(diagramRenderer).toHaveBeenCalledWith(expect.objectContaining({ type: 'mermaid', source: 'flowchart LR' }))

    rerender(
      <MarkdocView
        source={'{% diagram %}\nflowchart LR\n  A --> B\n{% /diagram %}'}
        diagramRenderer={diagramRenderer}
      />,
    )

    expect(diagramRenderer).toHaveBeenCalledWith(expect.objectContaining({ source: 'flowchart LR\nA --> B' }))

    rerender(
      <MarkdocView
        source={'{% diagram type="d2" %}\n```mermaid\nx -> y\n```\n{% /diagram %}'}
        diagramRenderer={diagramRenderer}
      />,
    )

    expect(diagramRenderer).toHaveBeenCalledWith(expect.objectContaining({ type: 'd2', source: 'x -> y' }))
  })

  it('reports validation errors without dropping the document', () => {
    const onError = vi.fn()

    render(<MarkdocView source={'{% callout %}\nno end'} onError={onError} />)

    expect(onError).toHaveBeenCalledTimes(1)
    expect(Array.isArray(onError.mock.calls[0]?.[0])).toBe(true)
    expect(screen.getByText(/no end/)).toBeInTheDocument()
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
  it('mermaid adapter uses strict mode and reinitializes only when the theme changes', async () => {
    const renderMock = vi.fn(async () => ({ svg: '<svg />' }))
    const initialize = vi.fn()
    const diagramRenderer = createMermaidRenderer({ initialize, render: renderMock })

    const result = await diagramRenderer({ type: 'mermaid', source: 'flowchart LR', theme: 'dark' })
    await diagramRenderer({ type: 'mermaid', source: 'flowchart LR', theme: 'dark' })
    await diagramRenderer({ type: 'mermaid', source: 'flowchart LR', theme: 'light' })

    expect(result.svg).toBe('<svg />')
    expect(renderMock).toHaveBeenCalledWith(expect.any(String), 'flowchart LR')
    expect(initialize).toHaveBeenCalledTimes(2)
    expect(initialize).toHaveBeenNthCalledWith(1, expect.objectContaining({ securityLevel: 'strict', theme: 'dark' }))
    expect(initialize).toHaveBeenNthCalledWith(2, expect.objectContaining({ securityLevel: 'strict', theme: 'default' }))
  })

  it('shiki adapter returns inner html and lifts the pre styles', async () => {
    const highlighter = createShikiRenderer({
      codeToHtml: async (code) =>
        `<pre class="shiki github-dark" style="background-color:#111;color:#eee"><code><span class="line">${code}</span></code></pre>`,
    })

    const result = await highlighter({ code: 'const x = 1', language: 'ts' })

    expect(result.html).toBe('<span class="line">const x = 1</span>')
    expect(result.className).toBe('shiki github-dark')
    expect(result.style).toMatchObject({ backgroundColor: '#111', color: '#eee' })
  })

  it('keeps table alignment selectors in the stylesheet', () => {
    expect(css).toContain("text-align: start")
    expect(css).toContain("[align='center']")
    expect(css).toContain("[align='right']")
  })

  it('katex adapter renders tex', () => {
    const renderer = createKatexRenderer({
      renderToString: (tex) => `<span>${tex}</span>`,
    })

    expect(renderer({ tex: 'x^2', display: true })).toBe('<span>x^2</span>')
  })
})
