import type { ChatMessage } from '../types'
import type { Lang } from '../types'

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.1-8b-instant'

const LANG_INSTRUCTIONS: Record<Lang, string> = {
  hi: 'Respond in Hindi/Hinglish — conversational, warm, like a trusted older sibling. Avoid English unless the user writes in English.',
  en: 'Respond in clear, warm English. Be conversational, not clinical.',
  ta: 'Respond in Tamil. Be warm and conversational. Use simple, everyday Tamil.',
  te: 'Respond in Telugu. Be warm and conversational. Use simple, everyday Telugu.',
  bn: 'Respond in Bengali. Be warm and conversational. Use simple, everyday Bengali.',
  mr: 'Respond in Marathi. Be warm and conversational. Use simple, everyday Marathi.',
}

function buildSystemPrompt(lang: Lang): string {
  return `You are Manu, a warm and empathetic companion for young people in India who may be struggling emotionally.
${LANG_INSTRUCTIONS[lang]}
You never diagnose. You validate feelings first, always.
You gently ask one follow-up question at a time.
You are aware of: depression, anxiety, trauma, loneliness, academic pressure, family conflict, substance abuse in environment.
If the user expresses suicidal ideation, self-harm, or extreme distress: express care, do NOT panic, and gently mention that real people can help — provide iCall number (9152987821).
Keep responses short (2–4 sentences). Avoid clinical jargon.
Never ask for name, location, or any identifying information.`
}

export async function sendToGroq(messages: ChatMessage[], lang: Lang = 'hi'): Promise<string> {
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
        { role: 'system', content: buildSystemPrompt(lang) },
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
