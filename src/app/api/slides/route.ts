import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionFromRequest } from "@/lib/session"

export async function GET() {
  const slides = await prisma.slide.findMany({
    orderBy: { position: "asc" },
  })
  return Response.json(slides)
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return Response.json({ error: "Non autorizzato" }, { status: 401 })

  const body = await req.json()
  const { imageUrl, caption, linkUrl, linkText, position, isActive } = body

  if (!imageUrl) return Response.json({ error: "imageUrl obbligatorio" }, { status: 400 })

  const lastSlide = await prisma.slide.findFirst({ orderBy: { position: "desc" }, select: { position: true } })
  const nextPosition = position ?? (lastSlide ? lastSlide.position + 1 : 0)

  const slide = await prisma.slide.create({
    data: {
      imageUrl,
      caption: caption ?? null,
      linkUrl: linkUrl ?? null,
      linkText: linkText ?? null,
      position: nextPosition,
      isActive: isActive ?? true,
    },
  })
  return Response.json(slide, { status: 201 })
}
