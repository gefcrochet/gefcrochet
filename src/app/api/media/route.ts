import { NextRequest } from "next/server"
import { getSessionFromRequest } from "@/lib/session"
import { readdir, unlink, stat } from "fs/promises"
import path from "path"

const MEDIA_DIR = path.join(process.cwd(), "public", "media")

async function listFilesRecursively(dir: string, base: string = ""): Promise<{ url: string; name: string; folder: string; size: number }[]> {
  let entries: import("fs").Dirent[]
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    return []
  }

  const results: { url: string; name: string; folder: string; size: number }[] = []

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    const relPath = base ? `${base}/${entry.name}` : entry.name

    if (entry.isDirectory()) {
      const sub = await listFilesRecursively(fullPath, relPath)
      results.push(...sub)
    } else if (/\.(jpg|jpeg|png|webp|gif|svg)$/i.test(entry.name)) {
      let size = 0
      try {
        const s = await stat(fullPath)
        size = s.size
      } catch { /* ignore */ }
      results.push({
        url: `/media/${relPath}`,
        name: entry.name,
        folder: base || "/",
        size,
      })
    }
  }

  return results
}

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return Response.json({ error: "Non autorizzato" }, { status: 401 })

  const files = await listFilesRecursively(MEDIA_DIR)
  return Response.json(files)
}

export async function DELETE(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return Response.json({ error: "Non autorizzato" }, { status: 401 })

  const { url } = await req.json()
  if (!url || typeof url !== "string") {
    return Response.json({ error: "URL mancante" }, { status: 400 })
  }

  // Security: url must start with /media/
  if (!url.startsWith("/media/")) {
    return Response.json({ error: "Path non valido" }, { status: 400 })
  }

  const relative = url.replace(/^\/media\//, "")
  // Prevent path traversal
  const resolved = path.resolve(MEDIA_DIR, relative)
  if (!resolved.startsWith(MEDIA_DIR)) {
    return Response.json({ error: "Path non valido" }, { status: 400 })
  }

  try {
    await unlink(resolved)
    return Response.json({ ok: true })
  } catch {
    return Response.json({ error: "File non trovato" }, { status: 404 })
  }
}
