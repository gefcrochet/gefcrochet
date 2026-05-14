import { NextRequest } from "next/server"
import { getSessionFromRequest } from "@/lib/session"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

const MEDIA_DIR = path.join(process.cwd(), "public", "media")

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return Response.json({ error: "Non autorizzato" }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get("file") as File | null
  const folder = (formData.get("folder") as string | null)?.trim() || ""

  if (!file) return Response.json({ error: "File mancante" }, { status: 400 })

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  if (file.size > 10 * 1024 * 1024) {
    return Response.json({ error: "File troppo grande (max 10MB)" }, { status: 400 })
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg"
  const allowed = ["jpg", "jpeg", "png", "webp", "gif"]
  if (!allowed.includes(ext)) {
    return Response.json({ error: "Formato non supportato" }, { status: 400 })
  }

  // Sanitize folder name (prevent path traversal)
  const safeFolder = folder
    .replace(/\.\./g, "")
    .replace(/[^a-z0-9_\-\/]/gi, "-")
    .replace(/^\/+|\/+$/g, "")

  const uploadDir = safeFolder
    ? path.join(MEDIA_DIR, safeFolder)
    : MEDIA_DIR

  // Verify the resolved path is inside MEDIA_DIR
  const resolved = path.resolve(uploadDir)
  if (!resolved.startsWith(MEDIA_DIR)) {
    return Response.json({ error: "Path non valido" }, { status: 400 })
  }

  await mkdir(uploadDir, { recursive: true })

  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  await writeFile(path.join(uploadDir, filename), buffer)

  const url = safeFolder ? `/media/${safeFolder}/${filename}` : `/media/${filename}`
  return Response.json({ url })
}
