import { NextRequest } from "next/server"
import { getSessionFromRequest } from "@/lib/session"
import { prisma } from "@/lib/prisma"

// I settings contengono credenziali SMTP e chiave API Groq:
// l'intera route è riservata allo Studio (sessione obbligatoria)
export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return Response.json({ error: "Non autorizzato" }, { status: 401 })

  const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } })
  return Response.json(settings ?? { id: "default", announcementText: null, announcementActive: false })
}

const EDITABLE_FIELDS = [
  "announcementText",
  "announcementActive",
  "smtpHost",
  "smtpPort",
  "smtpSecure",
  "smtpUser",
  "smtpPass",
  "smtpFrom",
  "groqApiKey",
] as const

export async function PATCH(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return Response.json({ error: "Non autorizzato" }, { status: 401 })

  const body = await req.json()
  const data: Record<string, unknown> = {}
  for (const field of EDITABLE_FIELDS) {
    if (field in body) data[field] = body[field]
  }

  const settings = await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: data,
    create: { id: "default", ...data },
  })
  return Response.json(settings)
}
