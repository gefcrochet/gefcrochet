import { NextRequest } from "next/server"
import { getSessionFromRequest } from "@/lib/session"
import { cloudinary } from "@/lib/cloudinary"

interface CloudinaryResource {
  secure_url: string
  public_id: string
  folder: string
  bytes: number
  format: string
  display_name?: string
  filename?: string
}

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return Response.json({ error: "Non autorizzato" }, { status: 401 })

  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error("Cloudinary env vars missing")
    return Response.json({ error: "Cloudinary non configurato" }, { status: 500 })
  }

  try {
    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: "gefcrochet",
      max_results: 200,
      resource_type: "image",
    }) as { resources: CloudinaryResource[] }

    const files = result.resources.map((r) => {
      const rawFolder = r.folder ?? r.public_id.split("/").slice(0, -1).join("/") ?? ""
      const folder = rawFolder.replace(/^gefcrochet\/?/, "") || "/"
      const nameParts = r.public_id.split("/")
      const name = nameParts[nameParts.length - 1]
      const ext = r.format || "avif"
      const localPath = r.public_id.replace(/^gefcrochet\//, "")
      return {
        url: `/media/${localPath}.${ext}`,
        publicId: r.public_id,
        name,
        folder,
        size: r.bytes,
      }
    })

    return Response.json(files)
  } catch (err) {
    console.error("Cloudinary GET error:", err)
    return Response.json({ error: "Errore Cloudinary", detail: String(err) }, { status: 500 })
  }
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
