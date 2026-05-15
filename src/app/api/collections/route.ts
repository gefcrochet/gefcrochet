import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionFromRequest } from "@/lib/session"
import { slugify } from "@/lib/utils"

export async function GET() {
  const collections = await prisma.collection.findMany({
    include: {
      products: {
        select: { product: { select: { id: true, name: true } } },
        orderBy: { position: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  })
  return Response.json(collections)
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return Response.json({ error: "Non autorizzato" }, { status: 401 })

  const body = await req.json()
  const { name, description, heroImageUrl, heroTitle, heroSubtitle, isActive, productIds } = body

  if (!name) return Response.json({ error: "Nome obbligatorio" }, { status: 400 })

  const collection = await prisma.collection.create({
    data: {
      name,
      slug: slugify(name),
      description: description ?? null,
      heroImageUrl: heroImageUrl ?? null,
      heroTitle: heroTitle ?? null,
      heroSubtitle: heroSubtitle ?? null,
      isActive: isActive ?? true,
      products: productIds?.length
        ? {
            create: productIds.map((productId: string, i: number) => ({ productId, position: i })),
          }
        : undefined,
    },
    include: { products: { include: { product: true }, orderBy: { position: "asc" } } },
  })
  return Response.json(collection, { status: 201 })
}
