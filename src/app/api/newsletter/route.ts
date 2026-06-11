import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/email"
import { checkRateLimit, recordAttempt } from "@/lib/rate-limit"
import { SITE_URL } from "@/lib/utils"

function getIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? req.headers.get("x-real-ip") ?? "unknown"
}

function buildConfirmEmailHtml(confirmUrl: string): string {
  return `<!DOCTYPE html>
<html lang="it">
<head><meta charset="utf-8"/></head>
<body style="margin:0;padding:24px;background:#f3f4ee;font-family:Arial,Helvetica,sans-serif;">
  <table width="560" cellpadding="0" cellspacing="0" align="center"
         style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #c4c8bd;">
    <tr>
      <td style="background:#516447;padding:24px;text-align:center;">
        <p style="margin:0;font-family:Georgia,serif;font-size:24px;color:#ffffff;letter-spacing:2px;">GeF Crochet</p>
      </td>
    </tr>
    <tr>
      <td style="padding:28px 32px;">
        <p style="margin:0 0 12px;font-size:18px;font-weight:700;color:#191c19;">Un ultimo passo! 🌿</p>
        <p style="margin:0 0 20px;font-size:14px;color:#444840;line-height:1.6;">
          Grazie per esserti iscritta alla newsletter di GeF Crochet.<br/>
          Conferma il tuo indirizzo email cliccando il pulsante qui sotto:
        </p>
        <p style="margin:0 0 20px;text-align:center;">
          <a href="${confirmUrl}" style="display:inline-block;background:#516447;color:#ffffff;font-size:14px;font-weight:600;padding:12px 28px;border-radius:24px;text-decoration:none;">
            Conferma iscrizione
          </a>
        </p>
        <p style="margin:0;font-size:12px;color:#74786f;line-height:1.6;">
          Se non hai richiesto tu questa iscrizione puoi ignorare questa email:
          senza conferma non riceverai nessuna newsletter.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export async function POST(req: NextRequest) {
  let email: unknown
  try {
    ;({ email } = await req.json())
  } catch {
    return Response.json({ error: "Richiesta non valida" }, { status: 400 })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
  if (!email || typeof email !== "string" || !emailRegex.test(email)) {
    return Response.json({ error: "Email non valida" }, { status: 400 })
  }
  const normalized = email.trim().toLowerCase()

  const ip = getIp(req)
  const allowed = await checkRateLimit("newsletter", ip)
  if (!allowed) {
    return Response.json({ error: "Troppi tentativi. Riprova più tardi." }, { status: 429 })
  }
  await recordAttempt("newsletter", ip)

  // Double opt-in: l'iscrizione diventa attiva solo dopo la conferma via email.
  // Risposta identica in ogni caso per non rivelare chi è già iscritto.
  const existing = await prisma.newsletterSubscriber.findUnique({ where: { email: normalized } })
  if (existing?.isActive) {
    return Response.json({ ok: true })
  }

  const subscriber =
    existing ??
    (await prisma.newsletterSubscriber.create({
      data: { email: normalized, isActive: false },
    }))

  const confirmUrl = `${SITE_URL}/api/newsletter/confirm?token=${subscriber.unsubscribeToken}`
  try {
    await sendEmail({
      to: normalized,
      subject: "Conferma la tua iscrizione — GeF Crochet",
      html: buildConfirmEmailHtml(confirmUrl),
    })
  } catch (err) {
    console.error("[newsletter] Errore invio email di conferma:", err)
    return Response.json({ error: "Errore nell'invio dell'email. Riprova più tardi." }, { status: 500 })
  }

  return Response.json({ ok: true })
}
