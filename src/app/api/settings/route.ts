import { NextRequest } from "next/server"
import { getSessionFromRequest } from "@/lib/session"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } })
  return Response.json(settings ?? { id: "default", announcementText: null, announcementActive: false })
}

export async function PATCH(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return Response.json({ error: "Non autorizzato" }, { status: 401 })

  const data = await req.json()
  const settings = await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: data,
    create: { id: "default", ...data },
  })
  return Response.json(settings)
}
