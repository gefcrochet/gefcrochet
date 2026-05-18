import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionFromRequest } from "@/lib/session"
import { revalidatePath } from "next/cache"

export async function PATCH(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return Response.json({ error: "Non autorizzato" }, { status: 401 })

  const { ids } = await req.json() as { ids: string[] }
  if (!Array.isArray(ids)) return Response.json({ error: "ids required" }, { status: 400 })

  await Promise.all(ids.map((id, i) => prisma.collection.update({ where: { id }, data: { position: i } })))

  revalidatePath("/")
  revalidatePath("/shop")
  return Response.json({ ok: true })
}
