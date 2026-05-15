import nodemailer from "nodemailer"

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  let host = process.env.SMTP_HOST
  let port = Number(process.env.SMTP_PORT) || 587
  let user = process.env.SMTP_USER
  let pass = process.env.SMTP_PASS
  let from = process.env.SMTP_FROM || "no-reply@gefcrochet.it"
  let secure = process.env.SMTP_SECURE === "true"

  try {
    const { prisma } = await import("@/lib/prisma")
    const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } })
    if (settings?.smtpHost) {
      host = settings.smtpHost
      if (settings.smtpPort) port = settings.smtpPort
      if (settings.smtpUser) user = settings.smtpUser
      if (settings.smtpPass) pass = settings.smtpPass
      if (settings.smtpFrom) from = settings.smtpFrom
      secure = settings.smtpSecure
    }
  } catch {}

  if (!host || !user) {
    console.log("\n=============================================")
    console.log(`[EMAIL MOCK] To: ${to}`)
    console.log(`[EMAIL MOCK] Subject: ${subject}`)
    console.log(`[EMAIL MOCK] Body:\n${html}`)
    console.log("=============================================\n")
    return
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  })

  await transporter.sendMail({
    from: `"GeF Crochet" <${from}>`,
    to,
    subject,
    html,
  })
}
