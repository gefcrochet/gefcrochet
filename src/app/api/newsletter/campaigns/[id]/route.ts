import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionFromRequest } from "@/lib/session"
import { sendEmail } from "@/lib/email"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req)
  if (!session) return Response.json({ error: "Non autorizzato" }, { status: 401 })

  const { id } = await params
  const campaign = await prisma.newsletterCampaign.findUnique({
    where: { id },
    include: { products: { include: { product: { select: { id: true, name: true } } } } },
  })
  if (!campaign) return Response.json({ error: "Campagna non trovata" }, { status: 404 })
  return Response.json(campaign)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req)
  if (!session) return Response.json({ error: "Non autorizzato" }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const { subject, htmlContent, topic, scheduledFor, productIds, action } = body

  const campaign = await prisma.newsletterCampaign.findUnique({ where: { id } })
  if (!campaign) return Response.json({ error: "Non trovata" }, { status: 404 })

  // action: "submit" → PENDING_APPROVAL + invia preview email
  if (action === "submit") {
    if (!campaign.htmlContent) {
      return Response.json({ error: "Genera prima il contenuto con Groq" }, { status: 400 })
    }

    const updated = await prisma.newsletterCampaign.update({
      where: { id },
      data: { status: "PENDING_APPROVAL" },
    })

    const siteUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://gefcrochet.vercel.app"
    const approveUrl = `${siteUrl}/api/newsletter/campaigns/${id}/approve?token=${campaign.approvalToken}`
    const cancelUrl  = `${siteUrl}/api/newsletter/campaigns/${id}/cancel?token=${campaign.approvalToken}`
    const scheduledStr = campaign.scheduledFor
      ? new Date(campaign.scheduledFor).toLocaleString("it-IT", { dateStyle: "long", timeStyle: "short" })
      : "non programmato"

    await sendEmail({
      to: "info@gefcrochet.it",
      subject: `[Newsletter] Approvazione richiesta: "${campaign.subject}"`,
      html: `
        <!DOCTYPE html><html lang="it"><head><meta charset="utf-8"/></head>
        <body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#f3f4ee;">
          <div style="background:#516447;padding:20px 24px;border-radius:8px 8px 0 0;">
            <p style="margin:0;font-size:18px;font-weight:700;color:#fff;">📬 Nuova newsletter da approvare</p>
          </div>
          <div style="background:#fff;padding:24px;border:1px solid #e1e3dd;">
            <p style="margin:0 0 8px;"><strong>Oggetto:</strong> ${campaign.subject}</p>
            <p style="margin:0 0 8px;"><strong>Invio programmato:</strong> ${scheduledStr}</p>
            <p style="margin:0 0 24px;"><strong>Topic:</strong> ${campaign.topic ?? "—"}</p>
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding-right:12px;">
                  <a href="${approveUrl}" style="display:inline-block;background:#516447;color:#fff;font-size:14px;font-weight:700;padding:12px 24px;border-radius:24px;text-decoration:none;">✅ Approva e programma invio</a>
                </td>
                <td>
                  <a href="${cancelUrl}" style="display:inline-block;background:#ba1a1a;color:#fff;font-size:14px;font-weight:700;padding:12px 24px;border-radius:24px;text-decoration:none;">❌ Annulla campagna</a>
                </td>
              </tr>
            </table>
          </div>
          <div style="background:#f3f4ee;padding:16px 24px;border-radius:0 0 8px 8px;border:1px solid #e1e3dd;border-top:none;">
            <p style="margin:0 0 8px;font-size:13px;color:#444840;font-weight:600;">Anteprima newsletter:</p>
          </div>
          <div style="border:2px solid #516447;border-radius:0 0 8px 8px;overflow:hidden;">
            ${campaign.htmlContent}
          </div>
        </body></html>
      `,
    })

    return Response.json(updated)
  }

  // Aggiornamento campi
  const updateData: Record<string, unknown> = {}
  if (subject !== undefined) updateData.subject = subject
  if (htmlContent !== undefined) updateData.htmlContent = htmlContent
  if (topic !== undefined) updateData.topic = topic || null
  if (scheduledFor !== undefined) updateData.scheduledFor = scheduledFor ? new Date(scheduledFor) : null

  let updated = await prisma.newsletterCampaign.update({ where: { id }, data: updateData })

  // Aggiorna prodotti se specificati
  if (productIds !== undefined) {
    await prisma.newsletterCampaignProduct.deleteMany({ where: { campaignId: id } })
    if (productIds.length > 0) {
      await prisma.newsletterCampaignProduct.createMany({
        data: productIds.map((productId: string) => ({ campaignId: id, productId })),
      })
    }
    updated = await prisma.newsletterCampaign.findUnique({ where: { id } }) ?? updated
  }

  return Response.json(updated)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req)
  if (!session) return Response.json({ error: "Non autorizzato" }, { status: 401 })

  const { id } = await params
  await prisma.newsletterCampaign.delete({ where: { id } })
  return Response.json({ ok: true })
}
