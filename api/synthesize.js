const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
  },
  body: JSON.stringify({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: 'You are an expert user researcher. Respond with ONLY valid JSON, no markdown fences.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.3,
    max_tokens: 2000,
  }),
})

const data = await response.json()
if (!response.ok) return res.status(response.status).json({ error: data.error?.message || 'Groq API error' })

const raw = data.choices[0].message.content.trim()
const clean = raw.replace(/```json|```/g, '').trim()
const parsed = JSON.parse(clean)
return res.status(200).json(parsed)
