import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  const { email } = await req.json()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
  if (!email || typeof email !== "string" || !emailRegex.test(email)) {
    return Response.json({ error: "Email non valida" }, { status: 400 })
  }

  await prisma.newsletterSubscriber.upsert({
    where: { email },
    update: { isActive: true },
    create: { email },
  })
  return Response.json({ ok: true })
}
