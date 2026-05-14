import { NextRequest } from "next/server"
import { getSessionFromRequest } from "@/lib/session"
import { cloudinary } from "@/lib/cloudinary"

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"]
const MAX_SIZE = 10 * 1024 * 1024

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return Response.json({ error: "Non autorizzato" }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get("file") as File | null
  const folder = ((formData.get("folder") as string | null) ?? "").trim()

  if (!file) return Response.json({ error: "File mancante" }, { status: 400 })
  if (file.size > MAX_SIZE) return Response.json({ error: "File troppo grande (max 10MB)" }, { status: 400 })
  if (!ALLOWED_TYPES.includes(file.type)) return Response.json({ error: "Formato non supportato" }, { status: 400 })

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const cloudinaryFolder = folder
    ? `gefcrochet/${folder.replace(/[^a-z0-9_\-]/gi, "-")}`
    : "gefcrochet"

  const result = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: cloudinaryFolder, resource_type: "image" },
      (error, result) => {
        if (error || !result) reject(error ?? new Error("Upload fallito"))
        else resolve(result as { secure_url: string; public_id: string })
      }
    ).end(buffer)
  })

  return Response.json({ url: result.secure_url, publicId: result.public_id })
}
