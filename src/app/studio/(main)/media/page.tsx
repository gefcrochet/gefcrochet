"use client"

import { useState, useEffect, useRef, useCallback } from "react"

interface MediaFile {
  url: string
  publicId: string
  name: string
  folder: string
  size: number
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export default function MediaPage() {
  const [files, setFiles] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const [filter, setFilter] = useState("")
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const loadFiles = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/media")
      if (res.ok) {
        const data = await res.json()
        setFiles(data)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadFiles() }, [loadFiles])

  const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"])

  async function uploadFiles(fileList: File[]) {
    const imageFiles = fileList.filter((f) => ACCEPTED_TYPES.has(f.type))
    if (!imageFiles.length) return
    setUploading(true)

    await Promise.all(
      imageFiles.map(async (file) => {
        const fd = new FormData()
        fd.append("file", file)
        fd.append("name", file.name)
        await fetch("/api/media/upload", { method: "POST", body: fd })
      })
    )

    await loadFiles()
    setUploading(false)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    uploadFiles(Array.from(e.dataTransfer.files))
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    uploadFiles(Array.from(e.target.files ?? []))
    e.target.value = ""
  }

  async function deleteFile(publicId: string) {
    const res = await fetch("/api/media", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publicId }),
    })
    if (res.ok) {
      setFiles((prev) => prev.filter((f) => f.publicId !== publicId))
      if (selected === publicId) setSelected(null)
    }
    setDeleteConfirm(null)
  }

  function copyUrl(url: string) {
    navigator.clipboard.writeText(url).catch(() => {})
  }

  // Group files by folder
  const filtered = files.filter(
    (f) =>
      f.name.toLowerCase().includes(filter.toLowerCase()) ||
      f.folder.toLowerCase().includes(filter.toLowerCase())
  )

  const folders = Array.from(new Set(filtered.map((f) => f.folder))).sort()

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-newsreader text-2xl font-semibold text-on-surface">Media Library</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">
            {files.length} file · cartella <code className="text-xs bg-surface-container px-1.5 py-0.5 rounded">/media</code>
          </p>
        </div>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
        >
          <span className="material-symbols-outlined text-[18px]">upload</span>
          {uploading ? "Caricamento…" : "Carica immagini"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.avif"
          multiple
          onChange={onFileChange}
          className="hidden"
        />
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors mb-6 ${
          dragOver
            ? "border-primary bg-primary/5"
            : "border-outline-variant hover:border-primary/40 hover:bg-surface-container/30"
        }`}
      >
        <span className="material-symbols-outlined text-4xl text-on-surface-variant/30 block mb-2">
          {uploading ? "progress_activity" : "perm_media"}
        </span>
        <p className="text-sm text-on-surface-variant">
          {uploading
            ? "Caricamento in corso…"
            : <>
                <span className="text-primary font-medium cursor-pointer" onClick={() => fileRef.current?.click()}>Clicca</span>
                {" "}o trascina qui le immagini da caricare in /media
              </>
          }
        </p>
        <p className="text-xs text-on-surface-variant/50 mt-1">JPG, PNG, WebP, AVIF · convertite automaticamente in AVIF</p>
      </div>

      {/* Filter */}
      {files.length > 0 && (
        <div className="mb-4">
          <div className="relative max-w-xs">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant/50">search</span>
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Cerca per nome o cartella…"
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-outline-variant bg-surface text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <span className="material-symbols-outlined text-3xl text-on-surface-variant/30 animate-spin">progress_activity</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-on-surface-variant">
          <span className="material-symbols-outlined text-5xl mb-3 block opacity-25">perm_media</span>
          <p className="text-sm">
            {filter ? "Nessun risultato per questa ricerca." : "Nessuna immagine ancora. Carica la prima!"}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {folders.map((folder) => {
            const folderFiles = filtered.filter((f) => f.folder === folder)
            return (
              <div key={folder}>
                {/* Folder header */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-[16px] text-on-surface-variant/60">folder</span>
                  <p className="text-xs font-medium text-on-surface-variant uppercase tracking-wide">
                    {folder === "/" ? "Root /media" : `media/${folder}`}
                  </p>
                  <span className="text-xs text-on-surface-variant/50">({folderFiles.length})</span>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {folderFiles.map((file) => {
                    const isSelected = selected === file.url
                    return (
                      <div
                        key={file.url}
                        onClick={() => setSelected(isSelected ? null : file.publicId)}
                        className={`group relative aspect-square rounded-xl overflow-hidden bg-surface-container border-2 cursor-pointer transition-all hover:scale-[1.02] ${
                          isSelected ? "border-primary shadow-md shadow-primary/20" : "border-transparent hover:border-outline-variant"
                        }`}
                      >
                        {/* Thumbnail */}
                        <img
                          src={file.url}
                          alt={file.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />

                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-surface/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                          <p className="text-[10px] text-on-surface text-center font-medium leading-tight line-clamp-2">{file.name}</p>
                          <p className="text-[9px] text-on-surface-variant">{formatBytes(file.size)}</p>
                          <div className="flex gap-1.5">
                            <button
                              onClick={(e) => { e.stopPropagation(); copyUrl(file.url) }}
                              className="p-1.5 rounded-lg bg-surface-container text-on-surface hover:bg-primary hover:text-on-primary transition-colors"
                              title="Copia URL"
                            >
                              <span className="material-symbols-outlined text-[14px]">content_copy</span>
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setDeleteConfirm(file.publicId) }}
                              className="p-1.5 rounded-lg bg-surface-container text-error hover:bg-error hover:text-on-error transition-colors"
                              title="Elimina"
                            >
                              <span className="material-symbols-outlined text-[14px]">delete</span>
                            </button>
                          </div>
                        </div>

                        {/* Selected indicator */}
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center pointer-events-none">
                            <span className="material-symbols-outlined text-on-primary text-[12px]">check</span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Selected file info bar */}
      {selected && (() => {
        const f = files.find((x) => x.publicId === selected)
        if (!f) return null
        return (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-surface border border-outline-variant shadow-xl rounded-2xl px-5 py-3 text-sm">
            <img src={f.url} alt="" className="w-10 h-10 rounded-lg object-cover" />
            <div className="max-w-xs">
              <p className="font-medium text-on-surface truncate">{f.name}</p>
              <p className="text-xs text-on-surface-variant font-mono truncate">{f.url}</p>
            </div>
            <button
              onClick={() => copyUrl(f.url)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-primary border border-primary/30 px-3 py-1.5 rounded-lg hover:bg-primary/5 transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">content_copy</span>
              Copia URL
            </button>
            <button onClick={() => setSelected(null)} className="text-on-surface-variant hover:text-on-surface">
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        )
      })()}

      {/* Delete confirmation dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-scrim/50 backdrop-blur-sm">
          <div className="bg-surface rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4">
            <h3 className="font-medium text-on-surface mb-2">Elimina immagine</h3>
            <p className="text-sm text-on-surface-variant mb-1">Questa azione è irreversibile.</p>
            <p className="text-xs text-on-surface-variant font-mono bg-surface-container rounded-lg px-3 py-2 mb-5 truncate">{deleteConfirm}</p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-xl text-sm border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={() => deleteFile(deleteConfirm)}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-error text-on-error hover:bg-error/90 transition-colors"
              >
                Elimina
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
