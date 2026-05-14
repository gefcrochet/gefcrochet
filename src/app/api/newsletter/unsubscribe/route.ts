import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token")
  if (!token) {
    return Response.json({ error: "Token mancante" }, { status: 400 })
  }

  const subscriber = await prisma.newsletterSubscriber.findUnique({
    where: { unsubscribeToken: token },
  })

  if (!subscriber) {
    return Response.json({ error: "Link non valido" }, { status: 404 })
  }

  await prisma.newsletterSubscriber.update({
    where: { unsubscribeToken: token },
    data: { isActive: false },
  })

  return new Response(null, {
    status: 302,
    headers: { Location: "/?disiscritto=1" },
  })
}
