import { NextRequest } from "next/server"
import { getSessionFromRequest } from "@/lib/session"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return Response.json({ error: "Non autorizzato" }, { status: 401 })

  const { prompt, context, currentValue } = await req.json()
  if (!prompt?.trim()) return Response.json({ error: "Prompt mancante" }, { status: 400 })

  const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } })
  const apiKey = settings?.groqApiKey || process.env.GROQ_API_KEY
  if (!apiKey) return Response.json({ error: "Chiave API Groq non configurata. Vai in Impostazioni → Intelligenza Artificiale." }, { status: 503 })

  const userMessage = currentValue?.trim()
    ? `Scrivi ${context}.\n\nRichiesta: ${prompt}\n\nTesto attuale (puoi migliorarlo o riscriverlo):\n${currentValue}`
    : `Scrivi ${context}.\n\nRichiesta: ${prompt}`

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "Sei un copywriter esperto per GeF Crochet, un brand artigianale italiano specializzato in prodotti all'uncinetto fatti a mano. Scrivi testi autentici, caldi, naturali e commercialmente efficaci in italiano. Rispondi SOLO con il testo richiesto, senza preamboli, titoli o spiegazioni.",
        },
        { role: "user", content: userMessage },
      ],
      max_tokens: 600,
      temperature: 0.75,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    return Response.json({ error: err?.error?.message ?? "Errore Groq" }, { status: 502 })
  }

  const data = await res.json()
  const text = data.choices?.[0]?.message?.content?.trim() ?? ""
  return Response.json({ text })
}
