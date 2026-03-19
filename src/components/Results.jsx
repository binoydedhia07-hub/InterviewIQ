import { useState } from 'react'

function ThemeCard({ theme }) {
  const [open, setOpen] = useState(true)

  return (
    <div className="theme-card">
      <div className="theme-header" onClick={() => setOpen(o => !o)}>
        <div className={`severity-dot ${theme.severity}`} />
        <div className="theme-title">{theme.title}</div>
        <div className="theme-meta">
          {theme.frequency > 1 && (
            <span className="freq-badge">{theme.frequency}× mentioned</span>
          )}
          <span className={`severity-pill ${theme.severity}`}>{theme.severity}</span>
          <span className={`chevron ${open ? 'open' : ''}`}>▶</span>
        </div>
      </div>

      {open && (
        <div className="theme-body">
          <div className="theme-description">{theme.description}</div>

          {theme.quotes?.length > 0 && (
            <div className="quotes-section">
              <div className="quotes-label">Verbatim quotes</div>
              {theme.quotes.map((q, i) => (
                <div key={i} className="quote-item">"{q}"</div>
              ))}
            </div>
          )}

          {theme.hmw?.length > 0 && (
            <div className="hmw-section">
              <div className="hmw-label">How might we…</div>
              <div className="hmw-list">
                {theme.hmw.map((h, i) => (
                  <div key={i} className="hmw-item">{h}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function buildMarkdown(result, isCross, sessionCount) {
  const lines = []
  lines.push(`# User Research Synthesis${isCross ? ` (${sessionCount} interviews)` : ''}`)
  lines.push('')
  lines.push(`## Summary`)
  lines.push(result.summary)
  lines.push('')
  lines.push(`## Themes`)
  result.themes?.forEach(t => {
    lines.push(`### ${t.title} _(${t.severity} severity)_`)
    lines.push(t.description)
    if (t.quotes?.length) {
      lines.push('')
      lines.push('**Quotes:**')
      t.quotes.forEach(q => lines.push(`> "${q}"`))
    }
    if (t.hmw?.length) {
      lines.push('')
      lines.push('**How might we…**')
      t.hmw.forEach(h => lines.push(`- ${h}`))
    }
    lines.push('')
  })
  if (result.contradictions?.length) {
    lines.push('## Contradictions / open questions')
    result.contradictions.forEach(c => lines.push(`- ${c}`))
    lines.push('')
  }
  if (result.recommended_next_steps?.length) {
    lines.push('## Recommended next steps')
    result.recommended_next_steps.forEach(s => lines.push(`- ${s}`))
  }
  return lines.join('\n')
}

export default function Results({ result, isCross, sessionCount, onBack }) {
  const [copied, setCopied] = useState(false)

  const copyMarkdown = async () => {
    const md = buildMarkdown(result, isCross, sessionCount)
    await navigator.clipboard.writeText(md)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const sortedThemes = [...(result.themes || [])].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 }
    return (order[a.severity] ?? 1) - (order[b.severity] ?? 1)
  })

  return (
    <div>
      <div className="results-header">
        <div className="results-title">Synthesis</div>
        <span className={`results-badge ${isCross ? 'cross' : ''}`}>
          {isCross ? `${sessionCount} interviews` : 'single interview'}
        </span>
      </div>

      {result.summary && (
        <div className="summary-block">{result.summary}</div>
      )}

      <div className="section-heading">Themes ({sortedThemes.length})</div>
      <div className="themes-grid">
        {sortedThemes.map((t, i) => (
          <ThemeCard key={i} theme={t} />
        ))}
      </div>

      {result.contradictions?.length > 0 && (
        <div className="callout-block">
          <div className="callout-title">Contradictions & open questions</div>
          <div className="callout-list">
            {result.contradictions.map((c, i) => (
              <div key={i} className="callout-item">{c}</div>
            ))}
          </div>
        </div>
      )}

      {result.recommended_next_steps?.length > 0 && (
        <div className="callout-block">
          <div className="callout-title">Recommended next steps</div>
          <div className="callout-list">
            {result.recommended_next_steps.map((s, i) => (
              <div key={i} className="callout-item">{s}</div>
            ))}
          </div>
        </div>
      )}

      <div className="export-bar">
        <button
          className={`btn-export ${copied ? 'copied' : ''}`}
          onClick={copyMarkdown}
        >
          {copied ? '✓ Copied!' : 'Copy as Notion markdown'}
        </button>
        <button className="btn-export" onClick={onBack}>
          ← Edit notes
        </button>
      </div>
    </div>
  )
}
