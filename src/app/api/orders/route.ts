import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionFromRequest } from "@/lib/session"

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return Response.json({ error: "Non autorizzato" }, { status: 401 })

  const { searchParams } = req.nextUrl
  const status = searchParams.get("status")
  const search = searchParams.get("search")
  const page = Number(searchParams.get("page") ?? 1)
  const limit = Number(searchParams.get("limit") ?? 20)

  const where = {
    ...(status ? { status } : {}),
    ...(search
      ? {
          OR: [
            { customerName: { contains: search } },
            { customerEmail: { contains: search } },
          ],
        }
      : {}),
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.order.count({ where }),
  ])

  return Response.json({ orders, total, page, limit })
}
