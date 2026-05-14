import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionFromRequest } from "@/lib/session"
import { slugify } from "@/lib/utils"

export async function GET() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } })
  return Response.json(categories)
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return Response.json({ error: "Non autorizzato" }, { status: 401 })

  const { name } = await req.json()
  if (!name) return Response.json({ error: "Nome obbligatorio" }, { status: 400 })

  const category = await prisma.category.create({
    data: { name, slug: slugify(name) },
  })
  return Response.json(category, { status: 201 })
}
