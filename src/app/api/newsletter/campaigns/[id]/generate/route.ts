import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionFromRequest } from "@/lib/session"
import { buildNewsletterHtmlTemplate } from "@/lib/newsletter-email"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req)
  if (!session) return Response.json({ error: "Non autorizzato" }, { status: 401 })

  const { id } = await params

  const campaign = await prisma.newsletterCampaign.findUnique({
    where: { id },
    include: {
      products: {
        include: {
          product: { select: { name: true, description: true, price: true, salePrice: true } },
        },
      },
      collections: {
        include: {
          collection: {
            select: {
              name: true,
              description: true,
              products: {
                select: { product: { select: { name: true, description: true } } },
                orderBy: { position: "asc" },
                take: 5,
              },
            },
          },
        },
      },
    },
  })
  if (!campaign) return Response.json({ error: "Campagna non trovata" }, { status: 404 })

  const settings = await prisma.siteSettings.findUnique({ where: { id: "default" }, select: { groqApiKey: true } })
  const apiKey = settings?.groqApiKey || process.env.GROQ_API_KEY
  if (!apiKey) return Response.json({ error: "Chiave API Groq non configurata. Vai in Impostazioni." }, { status: 503 })

  const productLines = campaign.products.map(({ product: p }) =>
    `- ${p.name}: ${p.description}`
  ).join("\n")

  const collectionLines = campaign.collections.map(({ collection: col }) => {
    const productNames = col.products.map(({ product: p }) => p.name).join(", ")
    const desc = col.description ? ` — ${col.description}` : ""
    return `- Collezione "${col.name}"${desc}${productNames ? ` (include: ${productNames})` : ""}`
  }).join("\n")

  const prompt = [
    campaign.topic ? `Tema della newsletter: ${campaign.topic}` : null,
    productLines ? `Prodotti in evidenza:\n${productLines}` : null,
    collectionLines ? `Collezioni in evidenza:\n${collectionLines}` : null,
  ].filter(Boolean).join("\n\n")

  if (!prompt) return Response.json({ error: "Inserisci un topic o seleziona almeno un prodotto o una collezione" }, { status: 400 })

  const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "Sei GeF, l'artigiana di GeF Crochet, un brand italiano di prodotti all'uncinetto fatti a mano. Scrivi in prima persona, con tono caldo, autentico e appassionato. Rispondi SOLO con il testo richiesto, senza preamboli, titoli o separatori.",
        },
        {
          role: "user",
          content: `Scrivi una newsletter per i miei iscritti.\n\n${prompt}\n\nFormato della risposta (solo questi due elementi, separati da una riga vuota):\nSUBJECT: [una riga — oggetto email accattivante]\n\n[corpo della newsletter: 3-5 paragrafi, caldi e autentici, valorizza i prodotti citando dettagli dalla loro descrizione, chiudi con un invito al negozio. Solo testo, niente HTML.]`,
        },
      ],
      max_tokens: 700,
      temperature: 0.78,
    }),
  })

  if (!groqRes.ok) {
    const err = await groqRes.json().catch(() => ({}))
    return Response.json({ error: (err as { error?: { message?: string } })?.error?.message ?? "Errore Groq" }, { status: 502 })
  }

  const groqData = await groqRes.json()
  const rawText: string = groqData.choices?.[0]?.message?.content?.trim() ?? ""

  // Parse subject + body
  const subjectMatch = rawText.match(/^SUBJECT:\s*(.+)/im)
  const subject = subjectMatch?.[1]?.trim() ?? "Newsletter GeF Crochet"
  const body = rawText.replace(/^SUBJECT:.*$/im, "").trim()

  const htmlContent = buildNewsletterHtmlTemplate({ subject, htmlBody: body })

  const updated = await prisma.newsletterCampaign.update({
    where: { id },
    data: { subject, htmlContent },
  })

  return Response.json({ campaign: updated, subject, body })
}
