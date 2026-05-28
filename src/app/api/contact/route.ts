import { NextRequest } from "next/server"
import { sendEmail } from "@/lib/email"
import { verifyTurnstile } from "@/lib/turnstile"

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

export async function POST(req: NextRequest) {
  let body: { name?: string; email?: string; message?: string; turnstileToken?: string }
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: "Richiesta non valida." }, { status: 400 })
  }

  const { name, email, message, turnstileToken } = body

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return Response.json({ error: "Compila tutti i campi." }, { status: 400 })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.trim())) {
    return Response.json({ error: "Indirizzo email non valido." }, { status: 400 })
  }

  const valid = await verifyTurnstile(turnstileToken ?? "")
  if (!valid) {
    return Response.json({ error: "Verifica anti-spam non superata. Riprova." }, { status: 400 })
  }

  const safeName = escapeHtml(name.trim())
  const safeEmail = escapeHtml(email.trim())
  const safeMessage = escapeHtml(message.trim()).replace(/\n/g, "<br/>")

  try {
    await sendEmail({
      to: "info@gefcrochet.it",
      subject: `Nuovo messaggio da ${name.trim()} — GeF Crochet`,
      html: `<!DOCTYPE html>
<html lang="it">
<head><meta charset="utf-8"/></head>
<body style="margin:0;padding:24px;background:#f3f4ee;font-family:Arial,Helvetica,sans-serif;">
  <table width="560" cellpadding="0" cellspacing="0"
         style="max-width:560px;background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #c4c8bd;">
    <tr>
      <td style="background:#516447;padding:20px 24px;">
        <p style="margin:0;font-size:18px;font-weight:700;color:#ffffff;">Nuovo messaggio dal sito</p>
        <p style="margin:4px 0 0;font-size:13px;color:#b8cdaa;">Via modulo Contatti — GeF Crochet</p>
      </td>
    </tr>
    <tr>
      <td style="padding:24px;">
        <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#191c19;">${safeName}</p>
        <p style="margin:0 0 16px;font-size:14px;color:#444840;">
          <a href="mailto:${safeEmail}" style="color:#516447;">${safeEmail}</a>
        </p>
        <hr style="border:none;border-top:1px solid #e1e3dd;margin:0 0 16px;"/>
        <p style="margin:0;font-size:14px;line-height:1.7;color:#2d302d;">${safeMessage}</p>
      </td>
    </tr>
    <tr>
      <td style="background:#f8faf4;padding:14px 24px;border-top:1px solid #e1e3dd;">
        <a href="mailto:${safeEmail}"
           style="font-size:13px;color:#516447;text-decoration:none;font-weight:600;">
          Rispondi a ${safeName} →
        </a>
      </td>
    </tr>
  </table>
</body>
</html>`,
    })
    return Response.json({ success: true })
  } catch (err) {
    console.error("[Contact API]", err)
    return Response.json(
      { error: "Errore nell'invio del messaggio. Riprova più tardi." },
      { status: 500 }
    )
  }
}
