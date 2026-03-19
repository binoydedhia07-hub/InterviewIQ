export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { notes, context, allSessions } = req.body

  if (!notes && !allSessions) {
    return res.status(400).json({ error: 'Missing notes or sessions' })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' })
  }

  const isCrossSession = Boolean(allSessions && allSessions.length > 1)

  const prompt = isCrossSession
    ? `You are an expert user researcher for B2B SaaS product teams. Synthesize insights across ${allSessions.length} user interviews. Find patterns across multiple sessions.

INTERVIEWS:
${allSessions.map((s, i) => `--- Interview ${i + 1} (${s.context.role || 'Unknown role'}, ${s.context.companySize || 'Unknown size'}) ---\n${s.notes}`).join('\n\n')}

Respond with ONLY valid JSON, no markdown fences, no explanation:
{
  "summary": "2-3 sentence executive summary",
  "themes": [
    {
      "title": "Theme name (3-5 words)",
      "description": "What this theme means and why it matters (1-2 sentences)",
      "severity": "high|medium|low",
      "frequency": <number of interviews this appeared in>,
      "quotes": ["verbatim quote from notes", "another verbatim quote"],
      "hmw": ["How might we ... ?", "How might we ... ?"]
    }
  ],
  "contradictions": ["Any conflicting signals across interviews"],
  "recommended_next_steps": ["Concrete next action", "Another action"]
}`
    : `You are an expert user researcher for B2B SaaS product teams. Synthesize this single user interview into structured insights.

CONTEXT: Role: ${context?.role || 'Not specified'}, Company size: ${context?.companySize || 'Not specified'}, Use case: ${context?.useCase || 'Not specified'}

INTERVIEW NOTES:
${notes}

Respond with ONLY valid JSON, no markdown fences, no explanation:
{
  "summary": "2-3 sentence summary of this interview",
  "themes": [
    {
      "title": "Theme name (3-5 words)",
      "description": "What this theme means (1-2 sentences)",
      "severity": "high|medium|low",
      "frequency": 1,
      "quotes": ["verbatim quote from notes", "another verbatim quote"],
      "hmw": ["How might we ... ?", "How might we ... ?"]
    }
  ],
  "contradictions": [],
  "recommended_next_steps": ["Concrete next action"]
}`

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 2000,
            responseMimeType: 'application/json',
          },
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      const msg = data.error?.message || 'Gemini API error'
      return res.status(response.status).json({ error: msg })
    }

    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text
    if (!raw) return res.status(500).json({ error: 'Empty response from Gemini' })

    const clean = raw.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)
    return res.status(200).json(parsed)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Failed to synthesize. Check your notes and try again.' })
  }
}
