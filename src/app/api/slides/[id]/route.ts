import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionFromRequest } from "@/lib/session"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req)
  if (!session) return Response.json({ error: "Non autorizzato" }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const { imageUrl, caption, linkUrl, linkText, position, isActive } = body

  const slide = await prisma.slide.update({
    where: { id },
    data: {
      ...(imageUrl !== undefined ? { imageUrl } : {}),
      ...(caption !== undefined ? { caption } : {}),
      ...(linkUrl !== undefined ? { linkUrl } : {}),
      ...(linkText !== undefined ? { linkText } : {}),
      ...(position !== undefined ? { position } : {}),
      ...(isActive !== undefined ? { isActive } : {}),
    },
  })
  return Response.json(slide)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req)
  if (!session) return Response.json({ error: "Non autorizzato" }, { status: 401 })

  const { id } = await params
  await prisma.slide.delete({ where: { id } })
  return new Response(null, { status: 204 })
}
