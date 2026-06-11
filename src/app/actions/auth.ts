"use server"

import { redirect } from "next/navigation"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { createSession, deleteSession, createTempToken, verifyTempToken } from "@/lib/session"
import { getClientIp, checkRateLimit, recordAttempt, clearAttempts } from "@/lib/rate-limit"
import { SITE_URL } from "@/lib/utils"

const RL_SCOPE = "login"

export async function login(
  formData: FormData
): Promise<{ error?: string; requiresTotp?: boolean; tempToken?: string }> {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) return { error: "Inserisci email e password" }

  const ip = await getClientIp()
  const allowed = await checkRateLimit(RL_SCOPE, ip)
  if (!allowed) return { error: "Troppi tentativi. Riprova tra 15 minuti." }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    await recordAttempt(RL_SCOPE, ip)
    return { error: "Credenziali non valide" }
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    await recordAttempt(RL_SCOPE, ip)
    return { error: "Credenziali non valide" }
  }

  await clearAttempts(RL_SCOPE, ip)

  if (user.totpEnabled && user.totpSecret) {
    const tempToken = await createTempToken(user.id)
    return { requiresTotp: true, tempToken }
  }

  await createSession(user.id)
  redirect("/studio")
}

export async function loginWithTotp(
  formData: FormData
): Promise<{ error?: string }> {
  const tempToken = formData.get("tempToken") as string
  const code = formData.get("code") as string

  if (!tempToken || !code) return { error: "Dati mancanti" }

  const payload = await verifyTempToken(tempToken)
  if (!payload) return { error: "Sessione scaduta. Effettua nuovamente il login." }

  const user = await prisma.user.findUnique({ where: { id: payload.userId } })
  if (!user || !user.totpSecret) return { error: "Errore di configurazione" }

  const { verifySync } = await import("otplib")
  const result = verifySync({ token: code.replace(/\s/g, ""), secret: user.totpSecret })
  const valid = result.valid
  if (!valid) return { error: "Codice non valido" }

  await createSession(user.id)
  redirect("/studio")
}

export async function logout(): Promise<void> {
  await deleteSession()
  redirect("/studio/login")
}

export async function requestPasswordReset(formData: FormData): Promise<{ error?: string; success?: boolean }> {
  const email = formData.get("email") as string
  if (!email) return { error: "Inserisci l'email" }

  const ip = await getClientIp()
  const allowed = await checkRateLimit(RL_SCOPE, ip)
  if (!allowed) return { error: "Troppi tentativi. Riprova tra 15 minuti." }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    await recordAttempt(RL_SCOPE, ip)
    return { success: true }
  }

  const token = Buffer.from(crypto.randomUUID()).toString("base64url")
  const expiry = new Date(Date.now() + 3600000)

  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken: token, resetTokenExpiry: expiry },
  })

  const { sendEmail } = await import("@/lib/email")

  const baseUrl = process.env.NODE_ENV === "production" ? SITE_URL : "http://localhost:3000"
  const resetUrl = `${baseUrl}/studio/login/reset?token=${token}`

  await sendEmail({
    to: user.email,
    subject: "GeF Crochet - Recupero Password",
    html: `<p>Hai richiesto di reimpostare la tua password.</p><p>Clicca sul link sottostante per procedere:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>Il link scadrà tra 1 ora.</p>`,
  })

  return { success: true }
}

export async function resetPassword(formData: FormData): Promise<{ error?: string; success?: boolean }> {
  const token = formData.get("token") as string
  const password = formData.get("password") as string
  const confirm = formData.get("confirm") as string

  if (!token) return { error: "Token non valido" }
  if (password !== confirm) return { error: "Le password non coincidono" }
  if (password.length < 8) return { error: "La password deve avere almeno 8 caratteri" }

  const user = await prisma.user.findUnique({ where: { resetToken: token } })
  if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
    return { error: "Il link di recupero è scaduto o non valido" }
  }

  const passwordHash = await bcrypt.hash(password, 10)

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, resetToken: null, resetTokenExpiry: null },
  })

  return { success: true }
}
