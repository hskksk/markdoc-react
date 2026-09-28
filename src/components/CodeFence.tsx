import { useEffect, useState, type ReactNode } from 'react'
import { useMarkdocRuntime } from '../context/MarkdocProvider'
import { childText } from '../text'

export function CodeFence({ content, children, language }: { content?: string; children?: ReactNode; language?: string }) {
  const raw = typeof content === 'string' ? content : childText(children)
  const code = raw.replace(/\n$/, '')
  const { highlighter } = useMarkdocRuntime()
  const [html, setHtml] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    if (!highlighter) {
      setHtml(null)
      return
    }
    Promise.resolve(highlighter({ code, language }))
      .then((result) => {
        if (!cancelled) setHtml(result.html)
      })
      .catch(() => {
        if (!cancelled) setHtml(null)
      })
    return () => {
      cancelled = true
    }
  }, [code, language, highlighter])

  if (html != null) {
    return <div className="markdoc-code markdoc-code--highlighted" dangerouslySetInnerHTML={{ __html: html }} />
  }

  return (
    <pre className="markdoc-code">
      <code className={language ? `language-${language}` : undefined}>{code}</code>
    </pre>
  )
}
