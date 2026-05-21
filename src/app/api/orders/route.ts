import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionFromRequest } from "@/lib/session"
import { sendEmail } from "@/lib/email"
import { formatPrice } from "@/lib/utils"

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { firstName, lastName, email, phone, items, subtotalCents, shippingCents, totalCents } = body

  if (!firstName || !lastName || !email || !Array.isArray(items) || items.length === 0) {
    return Response.json({ error: "Dati mancanti o carrello vuoto" }, { status: 400 })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return Response.json({ error: "Indirizzo email non valido" }, { status: 400 })
  }

  const lastOrder = await prisma.order.findFirst({ orderBy: { orderNumber: "desc" } })
  const orderNumber = (lastOrder?.orderNumber ?? 0) + 1
  const customerName = `${firstName} ${lastName}`

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

  const itemsHtml = items
    .map(
      (item: { name: string; quantity: number; price: number }) =>
        `<tr>
          <td style="padding:6px 12px;border-bottom:1px solid #eee;">${item.name}</td>
          <td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:center;">× ${item.quantity}</td>
          <td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:right;">${formatPrice(item.price * item.quantity)}</td>
        </tr>`
    )
    .join("")

  const orderDate = new Date().toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" })

  const totalsHtml = `
    <table style="width:100%;border-collapse:collapse;max-width:280px;margin-left:auto;">
      <tr><td style="padding:4px 0;color:#666;">Subtotale</td><td style="padding:4px 0;text-align:right;">${formatPrice(subtotalCents ?? 0)}</td></tr>
      <tr><td style="padding:4px 0;color:#666;">Spedizione</td><td style="padding:4px 0;text-align:right;">${shippingCents === 0 ? "Gratuita" : formatPrice(shippingCents ?? 0)}</td></tr>
      <tr style="font-weight:700;font-size:16px;border-top:2px solid #eee;">
        <td style="padding:8px 0;">Totale</td>
        <td style="padding:8px 0;text-align:right;">${formatPrice(totalCents ?? 0)}</td>
      </tr>
    </table>
  `

  const itemsTable = `
    <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
      <thead>
        <tr style="background:#f0f0f0;">
          <th style="padding:8px 12px;text-align:left;font-size:13px;">Prodotto</th>
          <th style="padding:8px 12px;text-align:center;font-size:13px;">Qtà</th>
          <th style="padding:8px 12px;text-align:right;font-size:13px;">Importo</th>
        </tr>
      </thead>
      <tbody>${itemsHtml}</tbody>
    </table>
  `

  await Promise.all([
    // Email a GeF
    sendEmail({
      to: "info@gefcrochet.it",
      subject: `Nuova richiesta d'ordine #${orderNumber} — ${customerName}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a;">
          <h2 style="font-size:22px;margin-bottom:4px;">Nuova richiesta d'ordine #${orderNumber}</h2>
          <p style="color:#666;margin-top:0;">Ricevuta il ${orderDate}</p>

          <table style="width:100%;border-collapse:collapse;margin:20px 0;background:#f9f9f9;border-radius:8px;overflow:hidden;">
            <tr><td style="padding:10px 12px;font-weight:600;">Nome</td><td style="padding:10px 12px;">${customerName}</td></tr>
            <tr><td style="padding:10px 12px;font-weight:600;background:#f0f0f0;">Email</td><td style="padding:10px 12px;background:#f0f0f0;"><a href="mailto:${email}">${email}</a></td></tr>
            ${phone ? `<tr><td style="padding:10px 12px;font-weight:600;">Telefono</td><td style="padding:10px 12px;">${phone}</td></tr>` : ""}
          </table>

          <h3 style="margin-bottom:8px;">Articoli ordinati</h3>
          ${itemsTable}
          ${totalsHtml}

          <p style="margin-top:28px;font-size:13px;color:#888;">
            Visualizza l'ordine nello Studio → <a href="https://gefcrochet.vercel.app/studio/orders">gefcrochet.vercel.app/studio/orders</a>
          </p>
        </div>
      `,
    }),

    // Email di conferma al cliente
    sendEmail({
      to: email,
      subject: `Richiesta d'ordine #${orderNumber} ricevuta — GeF Crochet`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a;">
          <h2 style="font-size:22px;margin-bottom:4px;">Grazie, ${firstName}!</h2>
          <p style="color:#666;margin-top:0;">Abbiamo ricevuto la tua richiesta d'ordine il ${orderDate}.</p>
          <p style="margin-bottom:24px;">Ti contatteremo a breve per confermare l'ordine e concordare i dettagli di spedizione.</p>

          <h3 style="margin-bottom:8px;font-size:15px;">Riepilogo ordine #${orderNumber}</h3>
          ${itemsTable}
          ${totalsHtml}

          <hr style="border:none;border-top:1px solid #eee;margin:28px 0;" />
          <p style="font-size:13px;color:#888;margin:0;">
            Per qualsiasi domanda scrivi a <a href="mailto:info@gefcrochet.it">info@gefcrochet.it</a> oppure contattaci su
            <a href="https://api.whatsapp.com/send/?phone=390656559587">WhatsApp</a>.
          </p>
          <p style="font-size:12px;color:#bbb;margin-top:8px;">GeF Crochet — prodotti artigianali all'uncinetto</p>
        </div>
      `,
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
