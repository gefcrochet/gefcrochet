"use server"

import { redirect } from "next/navigation"
import { headers } from "next/headers"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { createSession, deleteSession } from "@/lib/session"

const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000

async function getClientIp(): Promise<string> {
  const h = await headers()
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? "unknown"
}

async function checkRateLimit(ip: string): Promise<boolean> {
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS)
  const count = await prisma.loginAttempt.count({
    where: { ip, createdAt: { gte: windowStart } },
  })
  return count < RATE_LIMIT_MAX
}

async function recordFailedAttempt(ip: string): Promise<void> {
  await prisma.loginAttempt.create({ data: { ip } })
  // Clean up attempts older than 1 hour — fire and forget
  prisma.loginAttempt
    .deleteMany({ where: { createdAt: { lt: new Date(Date.now() - 60 * 60 * 1000) } } })
    .catch(() => {})
}

export async function login(formData: FormData): Promise<{ error?: string }> {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) return { error: "Inserisci email e password" }

  const ip = await getClientIp()
  const allowed = await checkRateLimit(ip)
  if (!allowed) return { error: "Troppi tentativi. Riprova tra 15 minuti." }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    await recordFailedAttempt(ip)
    return { error: "Credenziali non valide" }
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    await recordFailedAttempt(ip)
    return { error: "Credenziali non valide" }
  }

  await prisma.loginAttempt.deleteMany({ where: { ip } })
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
  const allowed = await checkRateLimit(ip)
  if (!allowed) return { error: "Troppi tentativi. Riprova tra 15 minuti." }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    await recordFailedAttempt(ip)
    return { success: true }
  }

  const token = Buffer.from(crypto.randomUUID()).toString("base64url")
  const expiry = new Date(Date.now() + 3600000)

  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken: token, resetTokenExpiry: expiry },
  })

  const { sendEmail } = await import("@/lib/email")

  const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/studio/login/reset?token=${token}`

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
