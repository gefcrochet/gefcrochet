import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { SITE_URL } from "@/lib/utils"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const token = req.nextUrl.searchParams.get("token")
  if (!token) return Response.json({ error: "Token mancante" }, { status: 400 })

  const campaign = await prisma.newsletterCampaign.findUnique({ where: { id } })
  if (!campaign || campaign.approvalToken !== token) {
    return Response.json({ error: "Link non valido" }, { status: 404 })
  }
  if (campaign.status !== "PENDING_APPROVAL") {
    return new Response(confirmHtml("info", "Campagna già elaborata", `Questa campagna è già in stato: <strong>${campaign.status}</strong>.`), {
      headers: { "Content-Type": "text/html" },
    })
  }

  await prisma.newsletterCampaign.update({ where: { id }, data: { status: "APPROVED" } })

  const scheduledStr = campaign.scheduledFor
    ? new Date(campaign.scheduledFor).toLocaleString("it-IT", { dateStyle: "long", timeStyle: "short" })
    : "appena possibile"

  return new Response(
    confirmHtml("success", "✅ Campagna approvata!", `La newsletter <em>"${campaign.subject}"</em> è stata approvata e verrà inviata il <strong>${scheduledStr}</strong>.`),
    { headers: { "Content-Type": "text/html" } }
  )
}

function confirmHtml(type: "success" | "info", title: string, message: string) {
  const color = type === "success" ? "#516447" : "#665e4b"
  return `<!DOCTYPE html><html lang="it"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>${title}</title></head>
<body style="margin:0;padding:0;background:#f3f4ee;font-family:Arial,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;">
  <div style="max-width:480px;width:100%;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">
    <div style="background:${color};padding:24px 32px;"><p style="margin:0;font-size:20px;font-weight:700;color:#fff;">${title}</p></div>
    <div style="padding:24px 32px;"><p style="margin:0 0 20px;font-size:15px;color:#191c19;line-height:1.6;">${message}</p>
    <a href="${SITE_URL}/studio/newsletter" style="display:inline-block;background:${color};color:#fff;font-size:13px;font-weight:600;padding:10px 20px;border-radius:20px;text-decoration:none;">Vai allo Studio</a></div>
  </div>
</body></html>`
}
