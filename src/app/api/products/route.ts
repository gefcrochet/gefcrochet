import { NextRequest } from "next/server"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { getSessionFromRequest } from "@/lib/session"
import { slugify } from "@/lib/utils"

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const slug = searchParams.get("slug")
  const category = searchParams.get("category")
  const featured = searchParams.get("featured")
  const active = searchParams.get("active")
  const search = searchParams.get("search")

  if (slug) {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: { select: { name: true, slug: true } },
        images: { orderBy: { position: "asc" }, select: { url: true, alt: true } },
        tags: { select: { name: true } },
      },
    })
    if (!product) return Response.json(null, { status: 404 })
    return Response.json(product)
  }

  const products = await prisma.product.findMany({
    where: {
      ...(category ? { category: { slug: category } } : {}),
      ...(featured === "true" ? { isFeatured: true } : {}),
      ...(active !== "false" ? { isActive: true } : {}),
      ...(search ? { name: { contains: search } } : {}),
    },
    include: {
      category: { select: { name: true, slug: true } },
      images: { orderBy: { position: "asc" }, select: { url: true, alt: true } },
      tags: { select: { name: true } },
      collections: { include: { collection: { select: { name: true, slug: true } } }, orderBy: { position: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  })
  return Response.json(products)
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return Response.json({ error: "Non autorizzato" }, { status: 401 })

  const body = await req.json()
  const { name, description, price, salePrice, sku, stock, isActive, isFeatured, categoryId, collectionId, colors, tags, images } = body

  if (!name || !description || price == null) {
    return Response.json({ error: "Campi obbligatori mancanti" }, { status: 400 })
  }

  const product = await prisma.product.create({
    data: {
      name,
      slug: slugify(name),
      description,
      price: Number(price),
      salePrice: salePrice ? Number(salePrice) : null,
      sku: sku || null,
      stock: Number(stock ?? 0),
      isActive: isActive ?? true,
      isFeatured: isFeatured ?? false,
      colors: colors ? JSON.stringify(colors) : "[]",
      ...(categoryId ? { categoryId } : {}),
      tags: tags?.length
        ? { connectOrCreate: tags.map((t: string) => ({ where: { name: t }, create: { name: t } })) }
        : undefined,
      images: images?.length
        ? { create: images.map((img: { url: string; alt?: string }, i: number) => ({ url: img.url, alt: img.alt ?? null, position: i })) }
        : undefined,
    },
    include: { category: true, images: { orderBy: { position: "asc" } }, tags: true, collections: { include: { collection: true } } },
  })

  if (collectionId) {
    const lastPos = await prisma.collectionProduct.findFirst({
      where: { collectionId },
      orderBy: { position: "desc" },
      select: { position: true },
    })
    await prisma.collectionProduct.create({
      data: { collectionId, productId: product.id, position: (lastPos?.position ?? -1) + 1 },
    })
  }

  revalidatePath("/shop")
  revalidatePath("/")
  return Response.json(product, { status: 201 })
}
