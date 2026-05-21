import { NextRequest } from "next/server"
import { createHmac } from "crypto"
import { prisma } from "@/lib/prisma"
import { getSessionFromRequest } from "@/lib/session"
import { sendEmail } from "@/lib/email"
import { formatPrice } from "@/lib/utils"

const CAPTCHA_SECRET = process.env.SESSION_SECRET ?? "gefcrochet-captcha-fallback"

function verifyCaptcha(token: string, userAnswer: string): boolean {
  const num = parseInt(userAnswer.trim(), 10)
  if (isNaN(num)) return false
  const now = Math.floor(Date.now() / (15 * 60 * 1000))
  for (const w of [now, now - 1]) {
    const expected = createHmac("sha256", CAPTCHA_SECRET)
      .update(`${num}:${w}`)
      .digest("hex")
      .slice(0, 24)
    if (expected === token) return true
  }
  return false
}

async function generateGroqMessage(
  apiKey: string,
  firstName: string,
  products: { name: string; description: string }[]
): Promise<string> {
  const productList = products
    .map((p) => `- ${p.name}: ${p.description}`)
    .join("\n")

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
            "Sei GeF, l'artigiana di GeF Crochet, un brand italiano di prodotti all'uncinetto fatti a mano con amore. Scrivi in prima persona, con un tono caldo, autentico e appassionato. Rispondi SOLO con il testo richiesto, senza preamboli o titoli.",
        },
        {
          role: "user",
          content: `Scrivi un breve paragrafo (4-6 frasi) da inserire in un'email di conferma ordine indirizzata a ${firstName}.\n\nIl cliente ha ordinato:\n${productList}\n\nIl paragrafo deve:\n- Ringraziarli con calore e sincerità\n- Valorizzare ogni prodotto scelto citando qualcosa di specifico dalla sua descrizione, come se tu stessi raccontando la storia di quel pezzo\n- Trasmettere la cura e la passione artigianale messa in ogni creazione\n- Chiudersi con un pensiero caloroso in attesa di consegnare il lavoro`,
        },
      ],
      max_tokens: 400,
      temperature: 0.78,
    }),
  })

  if (!res.ok) throw new Error("Groq error")
  const data = await res.json()
  return data.choices?.[0]?.message?.content?.trim() ?? ""
}

function buildCustomerEmailHtml({
  firstName,
  orderNumber,
  orderDate,
  groqMessage,
  items,
  subtotalCents,
  shippingCents,
  totalCents,
}: {
  firstName: string
  orderNumber: number
  orderDate: string
  groqMessage: string
  items: { name: string; quantity: number; price: number }[]
  subtotalCents: number
  shippingCents: number
  totalCents: number
}): string {
  const rowsBg = ["#ffffff", "#f8faf4"]
  const itemRows = items
    .map(
      (item, i) =>
        `<tr style="background:${rowsBg[i % 2]};">
          <td style="padding:10px 16px;font-size:14px;color:#191c19;">${item.name}</td>
          <td style="padding:10px 16px;font-size:14px;color:#444840;text-align:center;">× ${item.quantity}</td>
          <td style="padding:10px 16px;font-size:14px;color:#191c19;text-align:right;font-weight:600;">${formatPrice(item.price * item.quantity)}</td>
        </tr>`
    )
    .join("")

  const groqBlock = groqMessage
    ? `<tr>
        <td style="padding:0 32px 28px;">
          <p style="margin:0;font-size:15px;line-height:1.7;color:#3a4c31;font-style:italic;border-left:3px solid #516447;padding-left:16px;">
            ${groqMessage.replace(/\n/g, "<br/>")}
          </p>
        </td>
      </tr>`
    : ""

  return `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Conferma ordine #${orderNumber} — GeF Crochet</title>
</head>
<body style="margin:0;padding:0;background:#f3f4ee;font-family:'Plus Jakarta Sans',Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4ee;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

          <!-- Header verde -->
          <tr>
            <td style="background:#516447;border-radius:12px 12px 0 0;padding:28px 32px;text-align:center;">
              <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:30px;font-weight:400;color:#ffffff;letter-spacing:3px;">GeF Crochet</p>
              <p style="margin:6px 0 0;font-size:12px;color:#b8cdaa;letter-spacing:1px;text-transform:uppercase;">prodotti artigianali all'uncinetto</p>
            </td>
          </tr>

          <!-- Corpo email -->
          <tr>
            <td style="background:#ffffff;padding:0;">
              <table width="100%" cellpadding="0" cellspacing="0">

                <!-- Saluto -->
                <tr>
                  <td style="padding:32px 32px 20px;">
                    <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#191c19;">Grazie, ${firstName}! 🌿</p>
                    <p style="margin:0;font-size:14px;color:#444840;line-height:1.6;">
                      Abbiamo ricevuto la tua richiesta d'ordine <strong>#${orderNumber}</strong> il <strong>${orderDate}</strong>.<br/>
                      Ti contatteremo a breve per confermare e concordare i dettagli di spedizione.
                    </p>
                  </td>
                </tr>

                <!-- Paragrafo Groq -->
                ${groqBlock}

                <!-- Divisore -->
                <tr>
                  <td style="padding:0 32px 20px;">
                    <hr style="border:none;border-top:1px solid #e1e3dd;margin:0;"/>
                  </td>
                </tr>

                <!-- Titolo riepilogo -->
                <tr>
                  <td style="padding:0 32px 12px;">
                    <p style="margin:0;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#74786f;">Riepilogo ordine</p>
                  </td>
                </tr>

                <!-- Tabella articoli -->
                <tr>
                  <td style="padding:0 32px 8px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:8px;overflow:hidden;border:1px solid #e1e3dd;">
                      <thead>
                        <tr style="background:#516447;">
                          <th style="padding:10px 16px;text-align:left;font-size:12px;font-weight:600;color:#ffffff;text-transform:uppercase;letter-spacing:0.5px;">Prodotto</th>
                          <th style="padding:10px 16px;text-align:center;font-size:12px;font-weight:600;color:#ffffff;text-transform:uppercase;letter-spacing:0.5px;">Qtà</th>
                          <th style="padding:10px 16px;text-align:right;font-size:12px;font-weight:600;color:#ffffff;text-transform:uppercase;letter-spacing:0.5px;">Importo</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${itemRows}
                      </tbody>
                    </table>
                  </td>
                </tr>

                <!-- Totali -->
                <tr>
                  <td style="padding:8px 32px 28px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:4px 0;font-size:14px;color:#444840;">Subtotale</td>
                        <td style="padding:4px 0;font-size:14px;color:#444840;text-align:right;">${formatPrice(subtotalCents)}</td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0;font-size:14px;color:#444840;">Spedizione</td>
                        <td style="padding:4px 0;font-size:14px;color:#444840;text-align:right;">${shippingCents === 0 ? "Gratuita 🎉" : formatPrice(shippingCents)}</td>
                      </tr>
                      <tr>
                        <td colspan="2" style="padding:8px 0 0;border-top:2px solid #516447;"></td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0;font-size:16px;font-weight:700;color:#191c19;">Totale</td>
                        <td style="padding:4px 0;font-size:16px;font-weight:700;color:#516447;text-align:right;">${formatPrice(totalCents)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- CTA contatti -->
                <tr>
                  <td style="background:#f8faf4;padding:20px 32px;border-top:1px solid #e1e3dd;">
                    <p style="margin:0 0 12px;font-size:13px;color:#444840;">Hai domande? Siamo qui per te:</p>
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-right:12px;">
                          <a href="mailto:info@gefcrochet.it" style="display:inline-block;background:#516447;color:#ffffff;font-size:13px;font-weight:600;padding:8px 16px;border-radius:20px;text-decoration:none;">
                            ✉ Scrivi una email
                          </a>
                        </td>
                        <td>
                          <a href="https://api.whatsapp.com/send/?phone=390656559587" style="display:inline-block;background:#25D366;color:#ffffff;font-size:13px;font-weight:600;padding:8px 16px;border-radius:20px;text-decoration:none;">
                            WhatsApp
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#516447;border-radius:0 0 12px 12px;padding:16px 32px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#b8cdaa;">© ${new Date().getFullYear()} GeF Crochet — Fatto con ❤ in Italia</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function buildStudioEmailHtml({
  customerName,
  email,
  phone,
  orderNumber,
  orderDate,
  items,
  subtotalCents,
  shippingCents,
  totalCents,
}: {
  customerName: string
  email: string
  phone?: string
  orderNumber: number
  orderDate: string
  items: { name: string; quantity: number; price: number }[]
  subtotalCents: number
  shippingCents: number
  totalCents: number
}): string {
  const itemRows = items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #e1e3dd;font-size:14px;color:#191c19;">${item.name}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e1e3dd;font-size:14px;color:#444840;text-align:center;">× ${item.quantity}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e1e3dd;font-size:14px;color:#191c19;text-align:right;font-weight:600;">${formatPrice(item.price * item.quantity)}</td>
        </tr>`
    )
    .join("")

  return `<!DOCTYPE html>
<html lang="it">
<head><meta charset="utf-8"/><title>Nuovo ordine #${orderNumber}</title></head>
<body style="margin:0;padding:24px;background:#f3f4ee;font-family:Arial,Helvetica,sans-serif;">
  <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #c4c8bd;">
    <tr><td style="background:#516447;padding:20px 24px;">
      <p style="margin:0;font-size:18px;font-weight:700;color:#ffffff;">Nuova richiesta d'ordine #${orderNumber}</p>
      <p style="margin:4px 0 0;font-size:13px;color:#b8cdaa;">Ricevuta il ${orderDate}</p>
    </td></tr>
    <tr><td style="padding:20px 24px;">
      <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#191c19;">${customerName}</p>
      <p style="margin:0 0 4px;font-size:14px;color:#444840;"><a href="mailto:${email}" style="color:#516447;">${email}</a></p>
      ${phone ? `<p style="margin:0;font-size:14px;color:#444840;">${phone}</p>` : ""}
    </td></tr>
    <tr><td style="padding:0 24px 20px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e1e3dd;border-radius:6px;overflow:hidden;">
        <thead><tr style="background:#f3f4ee;">
          <th style="padding:8px 12px;text-align:left;font-size:12px;color:#74786f;text-transform:uppercase;">Prodotto</th>
          <th style="padding:8px 12px;text-align:center;font-size:12px;color:#74786f;text-transform:uppercase;">Qtà</th>
          <th style="padding:8px 12px;text-align:right;font-size:12px;color:#74786f;text-transform:uppercase;">Importo</th>
        </tr></thead>
        <tbody>${itemRows}</tbody>
      </table>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;">
        <tr><td style="font-size:13px;color:#444840;">Subtotale</td><td style="font-size:13px;color:#444840;text-align:right;">${formatPrice(subtotalCents)}</td></tr>
        <tr><td style="font-size:13px;color:#444840;">Spedizione</td><td style="font-size:13px;color:#444840;text-align:right;">${shippingCents === 0 ? "Gratuita" : formatPrice(shippingCents)}</td></tr>
        <tr><td style="font-size:15px;font-weight:700;color:#191c19;padding-top:8px;border-top:2px solid #516447;">Totale</td><td style="font-size:15px;font-weight:700;color:#516447;text-align:right;padding-top:8px;border-top:2px solid #516447;">${formatPrice(totalCents)}</td></tr>
      </table>
    </td></tr>
    <tr><td style="background:#f8faf4;padding:16px 24px;border-top:1px solid #e1e3dd;">
      <a href="https://gefcrochet.vercel.app/studio/orders" style="font-size:13px;color:#516447;">Visualizza nello Studio →</a>
    </td></tr>
  </table>
</body>
</html>`
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const {
    firstName, lastName, email, phone,
    items, subtotalCents, shippingCents, totalCents,
    captchaToken, captchaAnswer,
  } = body

  if (!firstName || !lastName || !email || !Array.isArray(items) || items.length === 0) {
    return Response.json({ error: "Dati mancanti o carrello vuoto" }, { status: 400 })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return Response.json({ error: "Indirizzo email non valido" }, { status: 400 })
  }

  if (!captchaToken || !captchaAnswer || !verifyCaptcha(captchaToken, captchaAnswer)) {
    return Response.json({ error: "Verifica CAPTCHA non riuscita. Riprova." }, { status: 400 })
  }

  const lastOrder = await prisma.order.findFirst({ orderBy: { orderNumber: "desc" } })
  const orderNumber = (lastOrder?.orderNumber ?? 0) + 1
  const customerName = `${firstName} ${lastName}`
  const orderDate = new Date().toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" })

  const order = await prisma.order.create({
    data: {
      orderNumber,
      customerName,
      customerEmail: email,
      customerPhone: phone || null,
      shippingLine1: "",
      shippingCity: "",
      shippingPostal: "",
      shippingCountry: "IT",
      subtotalCents: subtotalCents ?? 0,
      shippingCents: shippingCents ?? 0,
      totalCents: totalCents ?? 0,
      items: {
        create: items.map((item: { productId: string; name: string; price: number; quantity: number }) => ({
          productId: item.productId,
          productName: item.name,
          quantity: item.quantity,
          unitPrice: item.price,
        })),
      },
    },
    include: { items: true },
  })

  // Fetch product descriptions + Groq API key in parallel
  const productIds = items.map((i: { productId: string }) => i.productId).filter(Boolean)
  const [products, settings] = await Promise.all([
    prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, description: true },
    }),
    prisma.siteSettings.findUnique({ where: { id: "default" }, select: { groqApiKey: true } }),
  ])

  const apiKey = settings?.groqApiKey || process.env.GROQ_API_KEY

  // Generate Groq message (with silent fallback)
  let groqMessage = ""
  if (apiKey && products.length > 0) {
    try {
      groqMessage = await generateGroqMessage(apiKey, firstName, products)
    } catch {
      // Groq non disponibile: l'email viene inviata senza il paragrafo personalizzato
    }
  }

  await Promise.all([
    sendEmail({
      to: "info@gefcrochet.it",
      subject: `Nuova richiesta d'ordine #${orderNumber} — ${customerName}`,
      html: buildStudioEmailHtml({ customerName, email, phone, orderNumber, orderDate, items, subtotalCents, shippingCents, totalCents }),
    }),
    sendEmail({
      to: email,
      subject: `Richiesta d'ordine #${orderNumber} ricevuta — GeF Crochet`,
      html: buildCustomerEmailHtml({ firstName, orderNumber, orderDate, groqMessage, items, subtotalCents, shippingCents, totalCents }),
    }),
  ])

  return Response.json({ order }, { status: 201 })
}

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return Response.json({ error: "Non autorizzato" }, { status: 401 })

  const { searchParams } = req.nextUrl
  const status = searchParams.get("status")
  const search = searchParams.get("search")
  const page = Number(searchParams.get("page") ?? 1)
  const limit = Number(searchParams.get("limit") ?? 20)

  const where = {
    ...(status ? { status } : {}),
    ...(search
      ? {
          OR: [
            { customerName: { contains: search } },
            { customerEmail: { contains: search } },
          ],
        }
      : {}),
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.order.count({ where }),
  ])

  return Response.json({ orders, total, page, limit })
}
