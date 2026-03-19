export default function InputForm({ session, onUpdate, onSubmit, error }) {
  const { notes, context } = session
  const wordCount = notes.trim() ? notes.trim().split(/\s+/).length : 0
  const canSubmit = notes.trim().length > 50

  return (
    <div className="form-section">
      <div className="form-title">Add interview notes</div>
      <div className="form-subtitle">
        Paste raw notes, a transcript, or bullet points — any format works.
      </div>

      <div className="context-row">
        <div>
          <label className="field-label">Interviewee role</label>
          <input
            type="text"
            placeholder="e.g. Head of RevOps"
            value={context.role}
            onChange={e => onUpdate({ context: { ...context, role: e.target.value } })}
          />
        </div>
        <div>
          <label className="field-label">Company size</label>
          <select
            value={context.companySize}
            onChange={e => onUpdate({ context: { ...context, companySize: e.target.value } })}
          >
            <option value="">Select…</option>
            <option>1–10 (seed)</option>
            <option>11–50 (early)</option>
            <option>51–200 (growth)</option>
            <option>201–1000 (scale)</option>
            <option>1000+ (enterprise)</option>
          </select>
        </div>
        <div>
          <label className="field-label">Use case / product area</label>
          <input
            type="text"
            placeholder="e.g. onboarding, reporting"
            value={context.useCase}
            onChange={e => onUpdate({ context: { ...context, useCase: e.target.value } })}
          />
        </div>
      </div>

      <div className="notes-label-row">
        <label className="field-label" style={{ marginBottom: 0 }}>Interview notes</label>
        <span className="char-count">{wordCount} words</span>
      </div>
      <textarea
        placeholder={`Paste your raw notes here…\n\nExamples of what works:\n- Messy bullet points from a Zoom call\n- A full transcript\n- Voice-memo transcription\n- Anything you typed during the interview`}
        value={notes}
        onChange={e => onUpdate({ notes: e.target.value })}
      />

      {error && <div className="error-block">{error}</div>}

      <button
        className="btn-primary"
        onClick={onSubmit}
        disabled={!canSubmit}
      >
        Synthesize this interview →
      </button>
    </div>
  )
}
