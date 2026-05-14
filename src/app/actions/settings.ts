"use server"

import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

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
