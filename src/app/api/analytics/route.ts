import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionFromRequest } from "@/lib/session"

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return Response.json({ error: "Non autorizzato" }, { status: 401 })

  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const [
    totalOrders,
    recentOrders,
    totalRevenue,
    recentRevenue,
    processingCount,
    lowStockProducts,
    topProducts,
    recentOrdersList,
  ] = await Promise.all([
    prisma.order.count({ where: { status: { not: "CANCELLED" } } }),
    prisma.order.count({
      where: { createdAt: { gte: thirtyDaysAgo }, status: { not: "CANCELLED" } },
    }),
    prisma.order.aggregate({
      _sum: { totalCents: true },
      where: { status: { not: "CANCELLED" } },
    }),
    prisma.order.aggregate({
      _sum: { totalCents: true },
      where: { createdAt: { gte: thirtyDaysAgo }, status: { not: "CANCELLED" } },
    }),
    prisma.order.count({ where: { status: "PROCESSING" } }),
    prisma.product.findMany({
      where: { stock: { lte: 3 }, isActive: true },
      select: { id: true, name: true, stock: true, sku: true },
      orderBy: { stock: "asc" },
      take: 5,
    }),
    prisma.orderItem.groupBy({
      by: ["productId", "productName"],
      _sum: { quantity: true },
      where: { order: { createdAt: { gte: thirtyDaysAgo } } },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        totalCents: true,
        status: true,
        createdAt: true,
      },
    }),
  ])

  // Build daily revenue for last 7 days
  const dailyOrders = await prisma.order.findMany({
    where: { createdAt: { gte: sevenDaysAgo }, status: { not: "CANCELLED" } },
    select: { totalCents: true, createdAt: true },
  })

  const dailyRevenue: Record<string, number> = {}
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    dailyRevenue[d.toISOString().slice(0, 10)] = 0
  }
  for (const o of dailyOrders) {
    const key = o.createdAt.toISOString().slice(0, 10)
    if (key in dailyRevenue) dailyRevenue[key] += o.totalCents
  }

  return Response.json({
    totalOrders,
    recentOrders,
    totalRevenueCents: totalRevenue._sum.totalCents ?? 0,
    recentRevenueCents: recentRevenue._sum.totalCents ?? 0,
    processingCount,
    lowStockProducts,
    topProducts,
    recentOrdersList,
    dailyRevenue: Object.entries(dailyRevenue).map(([date, cents]) => ({ date, cents })),
  })
}
