"use server"

import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

export async function getSmtpSettings(): Promise<{
  host: string; port: number; secure: boolean; user: string; from: string; hasPass: boolean
}> {
  const s = await prisma.siteSettings.findUnique({ where: { id: "default" } })
  return {
    host: s?.smtpHost ?? "",
    port: s?.smtpPort ?? 587,
    secure: s?.smtpSecure ?? false,
    user: s?.smtpUser ?? "",
    from: s?.smtpFrom ?? "",
    hasPass: !!(s?.smtpPass),
  }
}

export async function saveSmtpSettings(
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  await requireUser()
  const host = (formData.get("smtpHost") as string).trim()
  const port = parseInt(formData.get("smtpPort") as string) || 587
  const secure = formData.get("smtpSecure") === "true"
  const user = (formData.get("smtpUser") as string).trim()
  const pass = (formData.get("smtpPass") as string).trim()
  const from = (formData.get("smtpFrom") as string).trim()

  const existing = await prisma.siteSettings.findUnique({ where: { id: "default" } })

  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: {
      smtpHost: host || null,
      smtpPort: port,
      smtpSecure: secure,
      smtpUser: user || null,
      smtpPass: pass || existing?.smtpPass || null,
      smtpFrom: from || null,
    },
    create: {
      id: "default",
      smtpHost: host || null,
      smtpPort: port,
      smtpSecure: secure,
      smtpUser: user || null,
      smtpPass: pass || null,
      smtpFrom: from || null,
    },
  })
  return { success: true }
}

export async function testSmtp(): Promise<{ error?: string; success?: boolean }> {
  const user = await requireUser()
  try {
    const { sendEmail } = await import("@/lib/email")
    await sendEmail({
      to: user.email,
      subject: "Test SMTP - GeF Crochet Studio",
      html: "<p>✅ Configurazione SMTP funzionante!</p><p>Questa è un'email di test inviata da GeF Crochet Studio.</p>",
    })
    return { success: true }
  } catch (err) {
    return { error: (err as Error).message }
  }
}

async function requireUser() {
  const session = await getSession()
  if (!session) throw new Error("Non autenticato")
  const user = await prisma.user.findUnique({ where: { id: session.userId } })
  if (!user) throw new Error("Utente non trovato")
  return user
}

export async function changePassword(
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const current = formData.get("current") as string
  const newPw = formData.get("new") as string
  const confirm = formData.get("confirm") as string

  if (!current || !newPw || !confirm) return { error: "Compila tutti i campi" }
  if (newPw !== confirm) return { error: "Le nuove password non coincidono" }
  if (newPw.length < 8) return { error: "La password deve avere almeno 8 caratteri" }

  const user = await requireUser()
  const valid = await bcrypt.compare(current, user.passwordHash)
  if (!valid) return { error: "Password attuale non corretta" }

  const passwordHash = await bcrypt.hash(newPw, 10)
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } })
  return { success: true }
}

export async function getTotpStatus(): Promise<{ enabled: boolean }> {
  const user = await requireUser()
  return { enabled: user.totpEnabled }
}

export async function setupTotp(): Promise<{ error?: string; secret?: string; qrDataUrl?: string }> {
  const user = await requireUser()

  const { generateSecret, generateURI } = await import("otplib")
  const secret = generateSecret()
  const uri = generateURI({ issuer: "GeF Crochet", label: user.email, secret })

  const QRCode = await import("qrcode")
  const qrDataUrl = await QRCode.toDataURL(uri)

  // Save secret temporarily (not yet enabled — user must confirm with a code)
  await prisma.user.update({ where: { id: user.id }, data: { totpSecret: secret } })

  return { secret, qrDataUrl }
}

export async function enableTotp(
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const code = formData.get("code") as string
  if (!code) return { error: "Inserisci il codice" }

  const user = await requireUser()
  if (!user.totpSecret) return { error: "Prima avvia la configurazione" }

  const { verifySync } = await import("otplib")
  const result = verifySync({ token: code.replace(/\s/g, ""), secret: user.totpSecret })
  if (!result.valid) return { error: "Codice non valido" }

  await prisma.user.update({ where: { id: user.id }, data: { totpEnabled: true } })
  return { success: true }
}

export async function disableTotp(
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const password = formData.get("password") as string
  if (!password) return { error: "Inserisci la password per confermare" }

  const user = await requireUser()
  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) return { error: "Password non corretta" }

  await prisma.user.update({
    where: { id: user.id },
    data: { totpEnabled: false, totpSecret: null },
  })
  return { success: true }
}
