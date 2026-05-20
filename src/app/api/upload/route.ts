import { NextRequest } from "next/server"
import { getSessionFromRequest } from "@/lib/session"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import sharp from "sharp"
import convert from "heic-convert"

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return Response.json({ error: "Non autorizzato" }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get("file") as File | null
  const folder = (formData.get("folder") as string | null)?.trim() || ""

  if (!file) return Response.json({ error: "File mancante" }, { status: 400 })

  if (file.size > 10 * 1024 * 1024) {
    return Response.json({ error: "File troppo grande (max 10MB)" }, { status: 400 })
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg"
  const allowed = ["jpg", "jpeg", "png", "webp", "avif", "heic", "heif"]
  if (!allowed.includes(ext)) {
    return Response.json({ error: "Formato non supportato" }, { status: 400 })
  }

  const safeFolder = folder
    .replace(/\.\./g, "")
    .replace(/[^a-z0-9_\-\/]/gi, "-")
    .replace(/^\/+|\/+$/g, "")

  const mediaBase = path.join(process.cwd(), "public", "media")
  const uploadDir = safeFolder ? path.join(mediaBase, safeFolder) : mediaBase

  const resolved = path.resolve(uploadDir)
  if (!resolved.startsWith(mediaBase)) {
    return Response.json({ error: "Path non valido" }, { status: 400 })
  }

  await mkdir(uploadDir, { recursive: true })

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
  const finalExt = ext === "avif" ? ext : "avif"
  const finalBuffer = ext !== "avif" ? await sharp(raw).avif({ quality: 80 }).toBuffer() : raw

  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${finalExt}`
  await writeFile(path.join(uploadDir, filename), finalBuffer)

  const url = safeFolder ? `/media/${safeFolder}/${filename}` : `/media/${filename}`
  return Response.json({ url })
}
