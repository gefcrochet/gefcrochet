import { NextRequest } from "next/server"
import { getSessionFromRequest } from "@/lib/session"
import { cloudinary } from "@/lib/cloudinary"
import sharp from "sharp"
import convert from "heic-convert"

const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "avif", "heic", "heif"]
const MAX_SIZE = 10 * 1024 * 1024

function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return Response.json({ error: "Non autorizzato" }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get("file") as File | null
  const folder = ((formData.get("folder") as string | null) ?? "").trim()
  const originalName = ((formData.get("name") as string | null) ?? file?.name ?? "upload").trim()

  if (!file) return Response.json({ error: "File mancante" }, { status: 400 })
  if (file.size > MAX_SIZE) return Response.json({ error: "File troppo grande (max 10MB)" }, { status: 400 })

  const ext = file.name.split(".").pop()?.toLowerCase() ?? ""
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return Response.json({ error: "Formato non supportato (JPG, PNG, WebP, AVIF)" }, { status: 400 })
  }

  const baseName = slugify(originalName.replace(/\.[^.]+$/, "")) || `upload-${Date.now()}`

  const arrayBuffer = await file.arrayBuffer()
  let raw: Buffer
  if (ext === "heic" || ext === "heif") {
    try {
      const converted = await convert({
        buffer: arrayBuffer as ArrayBuffer,
        format: "JPEG",
        quality: 1,
      })
      raw = Buffer.from(converted)
    } catch (err) {
      console.error("HEIC conversion error:", err)
      return Response.json({ error: "Errore durante la conversione del file HEIC" }, { status: 500 })
    }
  } else {
    raw = Buffer.from(arrayBuffer)
  }
  const uploadBuffer = ext !== "avif" ? await sharp(raw).avif({ quality: 80 }).toBuffer() : raw

  const cloudinaryFolder = folder
    ? `gefcrochet/${folder.replace(/[^a-z0-9_\-\/]/gi, "-").replace(/\/+/g, "/").replace(/^\/+|\/+$/g, "")}`
    : "gefcrochet"

  const result = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: cloudinaryFolder,
        public_id: baseName,
        resource_type: "image",
        format: "avif",
        overwrite: true,
      },
      (error, result) => {
        if (error || !result) reject(error ?? new Error("Upload fallito"))
        else resolve(result as { secure_url: string; public_id: string })
      }
    ).end(uploadBuffer)
  })

  const localPath = result.public_id.replace(/^gefcrochet\//, "")
  return Response.json({ url: `/media/${localPath}.avif`, publicId: result.public_id })
}
