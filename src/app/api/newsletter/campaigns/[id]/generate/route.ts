import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionFromRequest } from "@/lib/session"
import { buildNewsletterHtmlTemplate, type NewsletterProduct } from "@/lib/newsletter-email"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req)
  if (!session) return Response.json({ error: "Non autorizzato" }, { status: 401 })

  const { id } = await params

  const campaign = await prisma.newsletterCampaign.findUnique({
    where: { id },
    include: {
      products: {
        include: {
          product: {
            select: {
              name: true,
              description: true,
              price: true,
              salePrice: true,
              images: {
                select: { url: true, alt: true },
                orderBy: { position: "asc" },
                take: 1,
              },
            },
          },
        },
      },
      collections: {
        include: {
          collection: {
            select: {
              name: true,
              description: true,
              products: {
                select: {
                  product: {
                    select: {
                      name: true,
                      description: true,
                      images: {
                        select: { url: true },
                        orderBy: { position: "asc" },
                        take: 1,
                      },
                    },
                  },
                },
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

  const settings = await prisma.siteSettings.findUnique({
    where: { id: "default" },
    select: { groqApiKey: true },
  })
  const apiKey = settings?.groqApiKey || process.env.GROQ_API_KEY
  if (!apiKey)
    return Response.json(
      { error: "Chiave API Groq non configurata. Vai in Impostazioni." },
      { status: 503 }
    )

  // ── Costruzione del contesto per Groq ─────────────────────────────────────

  const productLines = campaign.products
    .map(({ product: p }) => `- ${p.name}: ${p.description}`)
    .join("\n")

  const collectionLines = campaign.collections
    .map(({ collection: col }) => {
      const productNames = col.products.map(({ product: p }) => p.name).join(", ")
      const desc = col.description ? ` — ${col.description}` : ""
      return `- Collezione "${col.name}"${desc}${productNames ? ` (include: ${productNames})` : ""}`
    })
    .join("\n")

  const context = [
    campaign.topic ? `Tema della newsletter: ${campaign.topic}` : null,
    productLines ? `Prodotti in evidenza:\n${productLines}` : null,
    collectionLines ? `Collezioni in evidenza:\n${collectionLines}` : null,
  ]
    .filter(Boolean)
    .join("\n\n")

  if (!context)
    return Response.json(
      { error: "Inserisci un topic o seleziona almeno un prodotto o una collezione" },
      { status: 400 }
    )

  // ── Chiamata Groq ─────────────────────────────────────────────────────────

  const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "Sei GeF, l'artigiana di GeF Crochet, un brand italiano di prodotti all'uncinetto fatti a mano. " +
            "Scrivi in prima persona, con tono caldo, autentico e appassionato. " +
            "Rispondi SOLO nel formato richiesto, senza preamboli o spiegazioni aggiuntive.",
        },
        {
          role: "user",
          content:
            `Scrivi una newsletter per i miei iscritti basandoti su questo contesto:\n\n${context}\n\n` +
            `Rispondi ESATTAMENTE con questo formato (ogni sezione su righe separate):\n\n` +
            `SUBJECT: [oggetto email accattivante, max 60 caratteri]\n\n` +
            `HEADLINE: [titolo visivo ad alto impatto, 5-9 parole, evocativo]\n\n` +
            `INTRO: [frase di apertura calda e personale, 1-2 righe, in prima persona]\n\n` +
            `BODY:\n[3-4 paragrafi separati da riga vuota. Valorizza i prodotti citando dettagli dalle descrizioni. Tono caldo e autentico.]\n\n` +
            `CLOSING: [frase finale personale e invitante, 1-2 righe, firma con il nome GeF]`,
        },
      ],
      max_tokens: 900,
      temperature: 0.75,
    }),
  })

  if (!groqRes.ok) {
    const err = await groqRes.json().catch(() => ({}))
    return Response.json(
      { error: (err as { error?: { message?: string } })?.error?.message ?? "Errore Groq" },
      { status: 502 }
    )
  }

  const groqData = await groqRes.json()
  const rawText: string = groqData.choices?.[0]?.message?.content?.trim() ?? ""

  // ── Parsing output strutturato ────────────────────────────────────────────

  const parsed = parseGroqSections(rawText)

  // ── Converti URL immagine in JPEG Cloudinary (Gmail non supporta AVIF) ───

  function buildEmailImageUrl(url: string | null | undefined): string | null {
    if (!url) return null
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME
    if (cloudName && url.startsWith("/media/")) {
      // /media/folder/image.avif → Cloudinary JPEG con trasformazioni
      const path = url.replace(/^\/media\//, "").replace(/\.[^.]+$/, "")
      return `https://res.cloudinary.com/${cloudName}/image/upload/f_jpg,c_fill,w_600/gefcrochet/${path}`
    }
    if (url.includes("res.cloudinary.com") && !url.includes("f_jpg")) {
      return url.replace("/image/upload/", "/image/upload/f_jpg,c_fill,w_600/")
    }
    if (url.startsWith("http")) return url
    const siteUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://gefcrochet.vercel.app"
    return `${siteUrl}${url.startsWith("/") ? "" : "/"}${url}`
  }

  // ── Lista prodotti con immagine (per il template) ─────────────────────────

  const templateProducts: NewsletterProduct[] = [
    // Prodotti singoli selezionati
    ...campaign.products.map(({ product: p }) => ({
      name: p.name,
      description: p.description,
      imageUrl: buildEmailImageUrl(p.images[0]?.url),
      price: p.price,
      salePrice: p.salePrice ?? null,
    })),
    // Prodotti da collezioni (senza duplicati)
    ...campaign.collections.flatMap(({ collection: col }) =>
      col.products
        .filter(
          ({ product: p }) =>
            !campaign.products.some(({ product: sp }) => sp.name === p.name)
        )
        .map(({ product: p }) => ({
          name: p.name,
          description: p.description,
          imageUrl: buildEmailImageUrl(p.images[0]?.url),
          price: null,
          salePrice: null,
        }))
    ),
  ].slice(0, 4) // max 4 prodotti per email

  // ── Genera HTML ───────────────────────────────────────────────────────────

  const htmlContent = buildNewsletterHtmlTemplate({
    subject: parsed.subject,
    headline: parsed.headline,
    intro: parsed.intro,
    body: parsed.body,
    closing: parsed.closing,
    products: templateProducts,
  })

  const updated = await prisma.newsletterCampaign.update({
    where: { id },
    data: { subject: parsed.subject, htmlContent },
  })

  return Response.json({ campaign: updated, subject: parsed.subject, body: parsed.body })
}

// ── Parser sezioni Groq ───────────────────────────────────────────────────

interface ParsedGroq {
  subject: string
  headline: string
  intro: string
  body: string
  closing: string
}

function parseGroqSections(raw: string): ParsedGroq {
  const result: ParsedGroq = {
    subject: "Newsletter GeF Crochet",
    headline: "Una novità per te",
    intro: "",
    body: "",
    closing: "",
  }

  // Dividi il testo in blocchi per sezione
  // Ogni sezione inizia con KEYWORD: (all uppercase)
  const sectionRe = /^(SUBJECT|HEADLINE|INTRO|BODY|CLOSING):\s*/im
  const parts = raw.split(sectionRe).filter(Boolean)

  let currentKey = ""
  for (const part of parts) {
    const upper = part.toUpperCase().trim()
    if (
      upper === "SUBJECT" ||
      upper === "HEADLINE" ||
      upper === "INTRO" ||
      upper === "BODY" ||
      upper === "CLOSING"
    ) {
      currentKey = upper
    } else {
      const value = part.trim()
      if (!value) continue
      switch (currentKey) {
        case "SUBJECT":
          result.subject = value.split("\n")[0].trim()
          break
        case "HEADLINE":
          result.headline = value.split("\n")[0].trim()
          break
        case "INTRO":
          result.intro = value.replace(/\n+/g, " ").trim()
          break
        case "BODY":
          result.body = value.trim()
          break
        case "CLOSING":
          result.closing = value.replace(/\n+/g, " ").trim()
          break
      }
    }
  }

  // Fallback: se le sezioni non ci sono, usa tutto come body
  if (!result.body && !result.headline) {
    const subjectMatch = raw.match(/^SUBJECT:\s*(.+)/im)
    result.subject = subjectMatch?.[1]?.trim() ?? result.subject
    result.headline = result.subject
    result.body = raw.replace(/^SUBJECT:.*$/im, "").trim()
  }

  return result
}
