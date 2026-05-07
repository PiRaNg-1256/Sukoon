const KEYWORD_GROUPS: { patterns: RegExp[]; score: number }[] = [
  {
    patterns: [
      /mar\s*jaana/i, /khatam\s*karna/i, /suicide/i, /marna\s*chahta/i,
      /मर\s*जाना/, /मरना\s*चाहता/, /मरना\s*चाहती/, /खतम\s*करना/, /जीना\s*नहीं\s*चाहता/, /जीना\s*नहीं\s*चाहती/,
    ],
    score: 8,
  },
  {
    patterns: [
      /jeene\s*ki\s*ichha\s*nahi/i, /sab\s*bekaar/i, /koi\s*umeed\s*nahi/i,
      /जीने\s*की\s*इच्छा/, /सब\s*बेकार/, /कोई\s*उम्मीद\s*नहीं/, /उम्मीद\s*नहीं/,
    ],
    score: 4,
  },
  {
    patterns: [
      /neend\s*nahi/i, /khana\s*nahi/i, /\bthaka\b/i, /\bakela\b/i, /\brona\b/i,
      /नींद\s*नहीं/, /थका/, /थकी/, /अकेला/, /अकेली/, /रोना/, /रो\s*रहा/, /रो\s*रही/,
    ],
    score: 2,
  },
  {
    patterns: [
      /ghabrahat/i, /dara\s*hua/i, /\btension\b/i, /\bstress\b/i,
      /घबराहट/, /डरा\s*हुआ/, /टेंशन/, /stress/i,
    ],
    score: 1,
  },
]

export function scoreMessage(text: string): number {
  let total = 0
  for (const group of KEYWORD_GROUPS) {
    if (group.patterns.some(p => p.test(text))) {
      total += group.score
    }
  }
  return total
}
