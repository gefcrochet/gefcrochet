import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionFromRequest } from "@/lib/session"
import { slugify } from "@/lib/utils"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const collection = await prisma.collection.findUnique({
    where: { id },
    include: {
      products: { include: { product: { include: { images: true, category: true } } }, orderBy: { position: "asc" } },
    },
  })
  if (!collection) return Response.json({ error: "Collezione non trovata" }, { status: 404 })
  return Response.json(collection)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req)
  if (!session) return Response.json({ error: "Non autorizzato" }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const { name, description, heroImageUrl, heroTitle, heroSubtitle, isActive, productIds } = body

  const collection = await prisma.collection.update({
    where: { id },
    data: {
      ...(name ? { name, slug: slugify(name) } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(heroImageUrl !== undefined ? { heroImageUrl } : {}),
      ...(heroTitle !== undefined ? { heroTitle } : {}),
      ...(heroSubtitle !== undefined ? { heroSubtitle } : {}),
      ...(isActive !== undefined ? { isActive } : {}),
      ...(productIds !== undefined
        ? {
            products: {
              deleteMany: {},
              create: productIds.map((productId: string, i: number) => ({ productId, position: i })),
            },
          }
        : {}),
    },
    include: { products: { include: { product: true }, orderBy: { position: "asc" } } },
  })
  return Response.json(collection)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req)
  if (!session) return Response.json({ error: "Non autorizzato" }, { status: 401 })

  const { id } = await params
  await prisma.collection.delete({ where: { id } })
  return new Response(null, { status: 204 })
}
