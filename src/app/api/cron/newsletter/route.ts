import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { SITE_URL } from "@/lib/utils"
import { sendEmail } from "@/lib/email"
import { personalizeHtml } from "@/lib/newsletter-email"

export async function GET(req: NextRequest) {
  // Vercel Cron invia "Authorization: Bearer <CRON_SECRET>"; gli altri canali restano supportati
  const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "")
  const secret = bearer || req.headers.get("x-cron-secret") || req.nextUrl.searchParams.get("secret")
  const expected = process.env.CRON_SECRET
  if (!expected || secret !== expected) {
    return Response.json({ error: "Non autorizzato" }, { status: 401 })
  }

  const now = new Date()

  // Campagne approvate il cui orario è arrivato
  const ready = await prisma.newsletterCampaign.findMany({
    where: {
      status: "APPROVED",
      scheduledFor: { lte: now },
    },
  })

  if (ready.length === 0) {
    return Response.json({ sent: 0, message: "Nessuna campagna da inviare" })
  }

  const subscribers = await prisma.newsletterSubscriber.findMany({
    where: { isActive: true },
    select: { email: true, unsubscribeToken: true },
  })

  if (subscribers.length === 0) {
    return Response.json({ sent: 0, message: "Nessun iscritto attivo" })
  }

  const results = []

  for (const campaign of ready) {
    let sent = 0
    const errors: string[] = []

    for (const subscriber of subscribers) {
      try {
        const unsubUrl = `${SITE_URL}/api/newsletter/unsubscribe?token=${subscriber.unsubscribeToken}`
        const html = personalizeHtml(campaign.htmlContent, unsubUrl)

        await sendEmail({ to: subscriber.email, subject: campaign.subject, html })
        sent++
      } catch (err) {
        errors.push(subscriber.email)
        console.error(`[newsletter cron] Errore invio a ${subscriber.email}:`, err)
      }
    }

    await prisma.newsletterCampaign.update({
      where: { id: campaign.id },
      data: { status: "SENT", sentAt: now, recipientCount: sent },
    })

    results.push({ campaignId: campaign.id, subject: campaign.subject, sent, errors: errors.length })
  }

  return Response.json({ sent: results.reduce((s, r) => s + r.sent, 0), campaigns: results })
}
