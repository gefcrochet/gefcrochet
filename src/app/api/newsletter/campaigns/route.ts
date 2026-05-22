import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionFromRequest } from "@/lib/session"

const fullInclude = {
  products:    { include: { product: { select: { id: true, name: true } } } },
  collections: { include: { collection: { select: { id: true, name: true } } } },
} as const

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return Response.json({ error: "Non autorizzato" }, { status: 401 })

  const campaigns = await prisma.newsletterCampaign.findMany({
    orderBy: { createdAt: "desc" },
    include: fullInclude,
  })
  return Response.json(campaigns)
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return Response.json({ error: "Non autorizzato" }, { status: 401 })

  const { topic, productIds, collectionIds, scheduledFor } = await req.json()

  const campaign = await prisma.newsletterCampaign.create({
    data: {
      topic: topic?.trim() || null,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
      products: productIds?.length
        ? { create: productIds.map((productId: string) => ({ productId })) }
        : undefined,
      collections: collectionIds?.length
        ? { create: collectionIds.map((collectionId: string) => ({ collectionId })) }
        : undefined,
    },
    include: fullInclude,
  })
  return Response.json(campaign, { status: 201 })
}
