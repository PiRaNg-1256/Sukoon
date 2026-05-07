import type { ChatMessage } from '../types'

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.1-8b-instant'

const SYSTEM_PROMPT = `You are Manu, a warm and empathetic companion for young people in India who may be struggling emotionally.
You speak in Hindi/Hinglish — conversational, warm, like a trusted older sibling, not a doctor.
You never diagnose. You validate feelings first, always.
You gently ask one follow-up question at a time.
You are aware of: depression, anxiety, trauma, loneliness, academic pressure, family conflict, substance abuse in environment.
If the user expresses suicidal ideation, self-harm, or extreme distress: express care, do NOT panic, and gently mention that real people can help — provide iCall number (9152987821).
Keep responses short (2–4 sentences). Avoid clinical jargon. Avoid English unless user writes in English.
Never ask for name, location, or any identifying information.`

export async function sendToGroq(messages: ChatMessage[]): Promise<string> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY as string
  if (!apiKey) throw new Error('VITE_GROQ_API_KEY not set')

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.map(m => ({ role: m.role, content: m.content })),
      ],
      max_tokens: 256,
      temperature: 0.7,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Groq ${res.status}: ${err}`)
  }

  const data = (await res.json()) as { choices: { message: { content: string } }[] }
  return data.choices[0].message.content
}
