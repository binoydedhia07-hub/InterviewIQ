export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { notes, context, allSessions } = req.body

  if (!notes && !allSessions) {
    return res.status(400).json({ error: 'Missing notes or sessions' })
  }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'GROQ_API_KEY is not set in environment variables' })
  }

  const isCrossSession = Boolean(allSessions && allSessions.length > 1)

  const prompt = isCrossSession
    ? `Synthesize insights across ${allSessions.length} user interviews. Find patterns across multiple sessions.

INTERVIEWS:
${allSessions.map((s, i) => `--- Interview ${i + 1} (${s.context.role || 'Unknown role'}, ${s.context.companySize || 'Unknown size'}) ---\n${s.notes}`).join('\n\n')}

Return ONLY this JSON structure, no other text:
{
  "summary": "2-3 sentence executive summary",
  "themes": [
    {
      "title": "Theme name 3-5 words",
      "description": "What this theme means and why it matters",
      "severity": "high",
      "frequency": 2,
      "quotes": ["verbatim quote from notes"],
      "hmw": ["How might we do something?"]
    }
  ],
  "contradictions": ["Any conflicting signals"],
  "recommended_next_steps": ["Concrete next action"]
}`
    : `Synthesize this user interview into structured insights.

CONTEXT: Role: ${context?.role || 'Not specified'}, Company size: ${context?.companySize || 'Not specified'}, Use case: ${context?.useCase || 'Not specified'}

INTERVIEW NOTES:
${notes}

Return ONLY this JSON structure, no other text:
{
  "summary": "2-3 sentence summary of this interview",
  "themes": [
    {
      "title": "Theme name 3-5 words",
      "description": "What this theme means",
      "severity": "high",
      "frequency": 1,
      "quotes": ["verbatim quote from notes"],
      "hmw": ["How might we do something?"]
    }
  ],
  "contradictions": [],
  "recommended_next_steps": ["Concrete next action"]
}`

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are an expert user researcher. You always respond with valid JSON only. No markdown, no explanation, no code fences. Just the raw JSON object.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    })

    const raw = await response.text()

    if (!response.ok) {
      return res.status(response.status).json({ error: `Groq error: ${raw}` })
    }

    let data
    try {
      data = JSON.parse(raw)
    } catch {
      return res.status(500).json({ error: `Failed to parse Groq response: ${raw.slice(0, 200)}` })
    }

    const content = data.choices?.[0]?.message?.content?.trim()
    if (!content) {
      return res.status(500).json({ error: 'Empty response from Groq' })
    }

    const clean = content.replace(/```json|```/g, '').trim()

    let parsed
    try {
      parsed = JSON.parse(clean)
    } catch {
      return res.status(500).json({ error: `Model returned invalid JSON: ${clean.slice(0, 200)}` })
    }

    return res.status(200).json(parsed)

  } catch (err) {
    return res.status(500).json({ error: `Server error: ${err.message}` })
  }
}
