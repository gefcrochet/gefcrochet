import { NextRequest } from "next/server"
import { getSessionFromRequest } from "@/lib/session"
import { cloudinary } from "@/lib/cloudinary"

interface CloudinaryResource {
  secure_url: string
  public_id: string
  folder: string
  bytes: number
  display_name?: string
  filename?: string
}

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return Response.json({ error: "Non autorizzato" }, { status: 401 })

  const result = await cloudinary.api.resources({
    type: "upload",
    prefix: "gefcrochet",
    max_results: 200,
    resource_type: "image",
  }) as { resources: CloudinaryResource[] }

  const files = result.resources.map((r) => {
    const folder = r.folder.replace(/^gefcrochet\/?/, "") || "/"
    const nameParts = r.public_id.split("/")
    const name = nameParts[nameParts.length - 1]
    return {
      url: r.secure_url,
      publicId: r.public_id,
      name,
      folder,
      size: r.bytes,
    }
  })

  return Response.json(files)
}

export async function DELETE(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return Response.json({ error: "Non autorizzato" }, { status: 401 })

  const { publicId } = await req.json()
  if (!publicId || typeof publicId !== "string") {
    return Response.json({ error: "publicId mancante" }, { status: 400 })
  }

  // Safety: must be inside the gefcrochet folder
  if (!publicId.startsWith("gefcrochet/") && publicId !== "gefcrochet") {
    return Response.json({ error: "Path non valido" }, { status: 400 })
  }

  await cloudinary.uploader.destroy(publicId)
  return Response.json({ ok: true })
}
