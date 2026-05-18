import { NextRequest } from "next/server"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getSessionFromRequest } from "@/lib/session"
import { slugify } from "@/lib/utils"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      images: { orderBy: { position: "asc" } },
      tags: true,
      collections: { include: { collection: true }, orderBy: { position: "asc" } },
    },
  })
  if (!product) return Response.json({ error: "Prodotto non trovato" }, { status: 404 })
  return Response.json(product)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req)
  if (!session) return Response.json({ error: "Non autorizzato" }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const { name, description, price, salePrice, sku, stock, isActive, isFeatured, categoryId, collectionId, colors, tags, images } = body

  const product = await prisma.product.update({
    where: { id },
    data: {
      ...(name ? { name, slug: slugify(name) } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(price !== undefined ? { price: Number(price) } : {}),
      ...(salePrice !== undefined ? { salePrice: salePrice ? Number(salePrice) : null } : {}),
      ...(sku !== undefined ? { sku: sku || null } : {}),
      ...(stock !== undefined ? { stock: Number(stock) } : {}),
      ...(isActive !== undefined ? { isActive } : {}),
      ...(isFeatured !== undefined ? { isFeatured } : {}),
      ...(categoryId !== undefined ? { categoryId: categoryId || null } : {}),
      ...(colors !== undefined ? { colors: JSON.stringify(colors) } : {}),
      ...(tags !== undefined
        ? { tags: { set: [], connectOrCreate: tags.map((t: string) => ({ where: { name: t }, create: { name: t } })) } }
        : {}),
      ...(images !== undefined
        ? { images: { deleteMany: {}, create: images.map((img: { url: string; alt?: string }, i: number) => ({ url: img.url, alt: img.alt ?? null, position: i })) } }
        : {}),
    },
    include: {
      category: true,
      images: { orderBy: { position: "asc" } },
      tags: true,
      collections: { include: { collection: true }, orderBy: { position: "asc" } },
    },
  })

  if (collectionId !== undefined) {
    await prisma.collectionProduct.deleteMany({ where: { productId: id } })
    if (collectionId) {
      const lastPos = await prisma.collectionProduct.findFirst({
        where: { collectionId },
        orderBy: { position: "desc" },
        select: { position: true },
      })
      await prisma.collectionProduct.create({
        data: { collectionId, productId: id, position: (lastPos?.position ?? -1) + 1 },
      })
    }
  }

  revalidatePath("/shop")
  revalidatePath("/")
  revalidatePath(`/shop/${product.slug}`)
  return Response.json(product)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req)
  if (!session) return Response.json({ error: "Non autorizzato" }, { status: 401 })

  const { id } = await params
  try {
    await prisma.collectionProduct.deleteMany({ where: { productId: id } })
    await prisma.product.delete({ where: { id } })
    revalidatePath("/shop")
    revalidatePath("/")
    return new Response(null, { status: 204 })
  } catch (err) {
    console.error("Delete product error:", err)
    return Response.json({ error: "Impossibile eliminare il prodotto" }, { status: 500 })
  }
}
