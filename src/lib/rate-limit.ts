import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"

const DEFAULT_MAX = 5
const DEFAULT_WINDOW_MS = 15 * 60 * 1000

/**
 * Rate limiting per IP basato sulla tabella LoginAttempt (funziona anche
 * su serverless, dove lo stato in memoria non sopravvive tra le invocazioni).
 * `scope` separa i contatori dei diversi flussi (login, newsletter, …).
 */

export async function getClientIp(): Promise<string> {
  const h = await headers()
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? "unknown"
}

export async function checkRateLimit(
  scope: string,
  ip: string,
  max: number = DEFAULT_MAX,
  windowMs: number = DEFAULT_WINDOW_MS
): Promise<boolean> {
  const windowStart = new Date(Date.now() - windowMs)
  const count = await prisma.loginAttempt.count({
    where: { ip: `${scope}:${ip}`, createdAt: { gte: windowStart } },
  })
  return count < max
}

export async function recordAttempt(scope: string, ip: string): Promise<void> {
  await prisma.loginAttempt.create({ data: { ip: `${scope}:${ip}` } })
  // Pulizia opportunistica delle righe più vecchie di un'ora
  prisma.loginAttempt
    .deleteMany({ where: { createdAt: { lt: new Date(Date.now() - 60 * 60 * 1000) } } })
    .catch(() => {})
}

export async function clearAttempts(scope: string, ip: string): Promise<void> {
  await prisma.loginAttempt.deleteMany({ where: { ip: `${scope}:${ip}` } })
}
