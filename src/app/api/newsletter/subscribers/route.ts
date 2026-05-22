import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionFromRequest } from "@/lib/session"

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return Response.json({ error: "Non autorizzato" }, { status: 401 })

  const subscribers = await prisma.newsletterSubscriber.findMany({
    orderBy: { subscribedAt: "desc" },
  })
  return Response.json(subscribers)
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return Response.json({ error: "Non autorizzato" }, { status: 401 })

  const { email } = await req.json()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
  if (!email || typeof email !== "string" || !emailRegex.test(email.trim())) {
    return Response.json({ error: "Email non valida" }, { status: 400 })
  }

  const subscriber = await prisma.newsletterSubscriber.upsert({
    where: { email: email.trim().toLowerCase() },
    update: { isActive: true },
    create: { email: email.trim().toLowerCase() },
  })
  return Response.json(subscriber, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return Response.json({ error: "Non autorizzato" }, { status: 401 })

  const { email } = await req.json()
  await prisma.newsletterSubscriber.update({
    where: { email },
    data: { isActive: false },
  })
  return Response.json({ ok: true })
}
