import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionFromRequest } from "@/lib/session"
import { ORDER_STATUSES } from "@/lib/utils"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req)
  if (!session) return Response.json({ error: "Non autorizzato" }, { status: 401 })

  const { id } = await params
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { product: { include: { images: true } } } } },
  })
  if (!order) return Response.json({ error: "Ordine non trovato" }, { status: 404 })
  return Response.json(order)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(req)
  if (!session) return Response.json({ error: "Non autorizzato" }, { status: 401 })

  const { id } = await params
  const { status, notes } = await req.json()

  if (status && !ORDER_STATUSES.includes(status)) {
    return Response.json({ error: "Stato non valido" }, { status: 400 })
  }

  const order = await prisma.order.update({
    where: { id },
    data: {
      ...(status ? { status } : {}),
      ...(notes !== undefined ? { notes } : {}),
    },
    include: { items: true },
  })
  return Response.json(order)
}
