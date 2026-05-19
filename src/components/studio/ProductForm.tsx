"use client"

import { useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Toggle } from "@/components/studio/Toggle"
import { AiWritingBar } from "@/components/studio/AiWritingBar"

const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/heic", "image/heif"])
const ACCEPTED_EXTS = new Set(["jpg", "jpeg", "png", "webp", "avif", "heic", "heif"])

function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

interface ImageItem {
  url: string
  alt: string
  uploading?: boolean
  error?: boolean
  id: string
}

interface Collection { id: string; name: string }

export interface ProductFormData {
  name: string
  description: string
  price: number | ""
  salePrice: number | ""
  isActive: boolean
  isFeatured: boolean
  collectionId: string
  tags: string[]
  colors: string[]
  images: ImageItem[]
}

interface Props {
  initial: ProductFormData
  collections: Collection[]
  submitLabel: string
  onSubmit: (data: ProductFormData) => Promise<{ ok: boolean; error?: string }>
  deleteAction?: () => Promise<void>
}

const inputCls =
  "w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"

function TagChipInput({ tags, onChange }: { tags: string[]; onChange: (tags: string[]) => void }) {
  const [input, setInput] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  function addTag(value: string) {
    const tag = value.trim().toLowerCase()
    if (tag && !tags.includes(tag)) onChange([...tags, tag])
    setInput("")
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "," || e.key === "Enter") {
      e.preventDefault()
      addTag(input)
    } else if (e.key === "Backspace" && input === "" && tags.length > 0) {
      onChange(tags.slice(0, -1))
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault()
    const parts = e.clipboardData.getData("text").split(",")
    const newTags = parts
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t && !tags.includes(t))
    if (newTags.length) onChange([...tags, ...newTags])
  }

  return (
    <div
      className="flex flex-wrap gap-1.5 px-2.5 py-2 rounded-lg border border-outline-variant bg-surface min-h-[42px] cursor-text focus-within:ring-2 focus-within:ring-primary transition-shadow"
      onClick={() => inputRef.current?.focus()}
    >
      {tags.map((tag) => (
        <span key={tag} className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs font-medium px-2.5 py-1 rounded-full">
          {tag}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange(tags.filter((t) => t !== tag)) }}
            className="hover:text-error transition-colors"
          >
            <span className="material-symbols-outlined text-[12px]">close</span>
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => { if (input.trim()) addTag(input) }}
        onPaste={handlePaste}
        placeholder={tags.length === 0 ? "cotone, borsa, estate…" : ""}
        className="flex-1 min-w-[140px] bg-transparent text-sm text-on-surface outline-none placeholder:text-on-surface-variant/40"
      />
    </div>
  )
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-on-surface mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-xs text-on-surface-variant mt-1">{hint}</p>}
    </div>
  )
}

export function ProductForm({ initial, collections, submitLabel, onSubmit, deleteAction }: Props) {
  const router = useRouter()
  const [form, setForm] = useState<ProductFormData>(initial)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [dragImgId, setDragImgId] = useState<string | null>(null)
  const [dragOverImgId, setDragOverImgId] = useState<string | null>(null)
  const [imageTab, setImageTab] = useState<"upload" | "media">("upload")
  const [mediaFiles, setMediaFiles] = useState<{ url: string; name: string; folder: string }[]>([])
  const [mediaLoading, setMediaLoading] = useState(false)
  const [mediaFilter, setMediaFilter] = useState("")
  const fileRef = useRef<HTMLInputElement>(null)
  const colorRef = useRef<HTMLInputElement>(null)

  const set = <K extends keyof ProductFormData>(key: K, val: ProductFormData[K]) =>
    setForm((f) => ({ ...f, [key]: val }))

  // ─── Image upload ────────────────────────────────────────────────────────────

  async function loadMedia() {
    if (mediaFiles.length > 0) return
    setMediaLoading(true)
    try {
      const res = await fetch("/api/media")
      if (res.ok) setMediaFiles(await res.json())
    } finally {
      setMediaLoading(false)
    }
  }

  function toggleMediaImage(f: { url: string; name: string }) {
    setForm((prev) => {
      const exists = prev.images.some((img) => img.url === f.url)
      if (exists) return { ...prev, images: prev.images.filter((img) => img.url !== f.url) }
      return { ...prev, images: [...prev.images, { id: `lib-${f.url}`, url: f.url, alt: f.name, uploading: false }] }
    })
  }

  async function uploadFiles(files: File[]) {
    const imageFiles = files.filter((f) => {
      if (ACCEPTED_TYPES.has(f.type)) return true
      return ACCEPTED_EXTS.has(f.name.split(".").pop()?.toLowerCase() ?? "")
    })
    if (!imageFiles.length) return

    const productSlug = form.name.trim() ? slugify(form.name) : "prodotto"
    const folder = `products/${productSlug}`

    const placeholders: ImageItem[] = imageFiles.map((f) => ({
      id: `tmp-${Date.now()}-${Math.random()}`,
      url: URL.createObjectURL(f),
      alt: f.name,
      uploading: true,
    }))
    setForm((prev) => ({ ...prev, images: [...prev.images, ...placeholders] }))

    const results = await Promise.all(
      imageFiles.map(async (file, i) => {
        try {
          const fd = new FormData()
          fd.append("file", file)
          fd.append("folder", folder)
          fd.append("name", file.name)
          const res = await fetch("/api/media/upload", { method: "POST", body: fd })
          if (!res.ok) {
            const body = await res.json().catch(() => ({}))
            console.error("Upload error:", res.status, body)
            return { id: placeholders[i].id, url: null }
          }
          const { url } = await res.json()
          return { id: placeholders[i].id, url: url as string }
        } catch (err) {
          console.error("Upload fetch error:", err)
          return { id: placeholders[i].id, url: null }
        }
      })
    )

    const failed = results.filter((r) => r.url === null).length
    if (failed > 0) setError(`${failed} immagini non caricate. Controlla la configurazione Cloudinary e riprova.`)

    setForm((prev) => ({
      ...prev,
      images: prev.images.map((img) => {
        const result = results.find((r) => r.id === img.id)
        if (!result) return img
        if (result.url) return { ...img, url: result.url, uploading: false, error: false }
        return { ...img, uploading: false, error: true }
      }),
    }))
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    uploadFiles(files)
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    uploadFiles(files)
    e.target.value = ""
  }

  function removeImage(id: string) {
    setForm((prev) => ({ ...prev, images: prev.images.filter((img) => img.id !== id) }))
  }

  // ─── Image drag-to-reorder ────────────────────────────────────────────────

  const onImgDragStart = useCallback((id: string) => setDragImgId(id), [])
  const onImgDragOver = useCallback((e: React.DragEvent, id: string) => {
    e.preventDefault()
    setDragOverImgId(id)
  }, [])

  function onImgDrop(e: React.DragEvent, targetId: string) {
    e.preventDefault()
    if (!dragImgId || dragImgId === targetId) { setDragImgId(null); setDragOverImgId(null); return }
    setForm((prev) => {
      const imgs = [...prev.images]
      const fromIdx = imgs.findIndex((i) => i.id === dragImgId)
      const toIdx = imgs.findIndex((i) => i.id === targetId)
      const [moved] = imgs.splice(fromIdx, 1)
      imgs.splice(toIdx, 0, moved)
      return { ...prev, images: imgs }
    })
    setDragImgId(null)
    setDragOverImgId(null)
  }

  // ─── Colors ──────────────────────────────────────────────────────────────

  function addColor(hex: string) {
    if (!hex || form.colors.includes(hex)) return
    set("colors", [...form.colors, hex])
  }

  function removeColor(hex: string) {
    set("colors", form.colors.filter((c) => c !== hex))
  }

  // ─── Submit ──────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const result = await onSubmit(form)
    if (!result.ok) {
      setError(result.error ?? "Errore sconosciuto")
      setLoading(false)
      return
    }
    router.push("/studio/products")
  }

  async function handleDelete() {
    if (!deleteAction) return
    if (!confirm("Eliminare questo prodotto?")) return
    try {
      await deleteAction()
      router.push("/studio/products")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore durante l'eliminazione")
    }
  }

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Nome e descrizione */}
      <Field label="Nome *">
        <input
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          required
          className={inputCls}
          placeholder="Borsa Primavera"
        />
      </Field>

      <Field label="Descrizione *">
        <AiWritingBar
          value={form.description}
          onChange={(v) => set("description", v)}
          context="una descrizione prodotto artigianale all'uncinetto"
        >
          <textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            required
            rows={4}
            className={inputCls}
            placeholder="Descrizione del prodotto…"
          />
        </AiWritingBar>
      </Field>

      {/* Prezzi */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Prezzo (€) *">
          <input
            type="number"
            step="0.01"
            min="0"
            required
            value={form.price}
            onChange={(e) => set("price", e.target.value === "" ? "" : Number(e.target.value))}
            className={inputCls}
            placeholder="85.00"
          />
        </Field>
        <Field label="Prezzo scontato (€)">
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.salePrice}
            onChange={(e) => set("salePrice", e.target.value === "" ? "" : Number(e.target.value))}
            className={inputCls}
            placeholder="69.00"
          />
        </Field>
      </div>

      {/* Collezione */}
      <Field label="Collezione">
        <select
          value={form.collectionId}
          onChange={(e) => set("collectionId", e.target.value)}
          className={inputCls}
        >
          <option value="">— Nessuna collezione —</option>
          {collections.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </Field>

      {/* Tag */}
      <Field label="Tag" hint="Digita e premi Invio o virgola per aggiungere · Backspace per rimuovere l'ultimo">
        <TagChipInput tags={form.tags} onChange={(tags) => set("tags", tags)} />
      </Field>

      {/* Colorazioni */}
      <Field label="Colorazioni disponibili">
        <div className="flex flex-wrap gap-2 mb-3">
          {form.colors.map((hex) => (
            <div
              key={hex}
              className="group relative flex items-center gap-1.5 bg-surface-container border border-outline-variant rounded-full pl-1 pr-2 py-1"
            >
              <span
                className="w-5 h-5 rounded-full border border-outline-variant/50 shrink-0"
                style={{ backgroundColor: hex }}
              />
              <span className="text-xs font-mono text-on-surface">{hex}</span>
              <button
                type="button"
                onClick={() => removeColor(hex)}
                className="ml-0.5 text-on-surface-variant hover:text-error transition-colors"
                aria-label="Rimuovi colore"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={colorRef}
            type="color"
            defaultValue="#516447"
            className="w-10 h-10 rounded-lg border border-outline-variant cursor-pointer p-0.5"
          />
          <button
            type="button"
            onClick={() => colorRef.current && addColor(colorRef.current.value)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary border border-primary/30 px-3 py-2 rounded-lg hover:bg-primary/5 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            Aggiungi colore
          </button>
        </div>
      </Field>

      {/* Immagini */}
      <Field label="Immagini prodotto" hint="La prima immagine sarà la cover. Riordina trascinando.">

        {/* Tabs */}
        <div className="flex gap-1 mb-3 bg-surface-container rounded-xl p-1 w-fit">
          <button
            type="button"
            onClick={() => setImageTab("upload")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${imageTab === "upload" ? "bg-surface text-on-surface shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}
          >
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">upload</span>
              Carica
            </span>
          </button>
          <button
            type="button"
            onClick={() => { setImageTab("media"); loadMedia() }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${imageTab === "media" ? "bg-surface text-on-surface shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}
          >
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">perm_media</span>
              Libreria media
            </span>
          </button>
        </div>

        {imageTab === "upload" ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors mb-4 ${
              dragOver ? "border-primary bg-primary/5" : "border-outline-variant hover:border-primary/50 hover:bg-surface-container/50"
            }`}
          >
            <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 block mb-2">upload</span>
            <p className="text-sm text-on-surface-variant">
              <span className="text-primary font-medium">Clicca</span> o trascina le immagini qui
            </p>
            <p className="text-xs text-on-surface-variant/60 mt-1">JPG, PNG, WebP, AVIF, HEIC · convertite automaticamente in AVIF</p>
            <input
              ref={fileRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.avif,.heic,.heif"
              multiple
              onChange={onFileChange}
              className="hidden"
            />
          </div>
        ) : (
          <div className="mb-4">
            {/* Filter */}
            <div className="relative mb-3">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[15px] text-on-surface-variant/50">search</span>
              <input
                value={mediaFilter}
                onChange={(e) => setMediaFilter(e.target.value)}
                placeholder="Cerca immagine…"
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-outline-variant bg-surface text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {mediaLoading ? (
              <div className="flex items-center justify-center py-10">
                <span className="material-symbols-outlined animate-spin text-primary">progress_activity</span>
              </div>
            ) : mediaFiles.length === 0 ? (
              <p className="text-sm text-on-surface-variant text-center py-8">
                Nessuna immagine nella libreria.{" "}
                <a href="/studio/media" className="text-primary hover:underline">Carica dalla sezione Media →</a>
              </p>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-64 overflow-y-auto pr-1">
                {mediaFiles
                  .filter((f) =>
                    f.name.toLowerCase().includes(mediaFilter.toLowerCase()) ||
                    f.folder.toLowerCase().includes(mediaFilter.toLowerCase())
                  )
                  .map((f) => {
                    const selected = form.images.some((img) => img.url === f.url)
                    return (
                      <button
                        key={f.url}
                        type="button"
                        onClick={() => toggleMediaImage(f)}
                        title={f.name}
                        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                          selected ? "border-primary shadow-md" : "border-transparent hover:border-outline-variant"
                        }`}
                      >
                        <img src={f.url} alt={f.name} className="w-full h-full object-cover" loading="lazy" />
                        {selected && (
                          <div className="absolute inset-0 flex items-center justify-center bg-primary/30">
                            <span className="material-symbols-outlined text-on-primary text-xl">check_circle</span>
                          </div>
                        )}
                      </button>
                    )
                  })}
              </div>
            )}
          </div>
        )}

        {/* Image grid (always visible) */}
        {form.images.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-2">
            {form.images.map((img, idx) => (
              <div
                key={img.id}
                draggable={!img.uploading && !img.error}
                onDragStart={() => onImgDragStart(img.id)}
                onDragOver={(e) => onImgDragOver(e, img.id)}
                onDrop={(e) => onImgDrop(e, img.id)}
                onDragEnd={() => { setDragImgId(null); setDragOverImgId(null) }}
                className={`relative aspect-square rounded-xl overflow-hidden bg-surface-container border-2 transition-all ${
                  img.error
                    ? "border-error"
                    : dragOverImgId === img.id
                    ? "border-primary scale-95"
                    : "border-transparent"
                } ${!img.uploading && !img.error ? "cursor-grab active:cursor-grabbing" : ""}`}
              >
                <img
                  src={img.url}
                  alt={img.alt}
                  className={`w-full h-full object-cover ${img.uploading || img.error ? "opacity-40" : ""}`}
                />
                {img.uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-surface/60">
                    <span className="material-symbols-outlined text-primary text-2xl animate-spin">progress_activity</span>
                  </div>
                )}
                {img.error && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-surface/60">
                    <span className="material-symbols-outlined text-error text-2xl">error</span>
                    <span className="text-[10px] text-error font-medium px-1 text-center leading-tight">Caricamento fallito</span>
                  </div>
                )}
                {idx === 0 && !img.uploading && !img.error && (
                  <span className="absolute top-1 left-1 bg-primary text-on-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full">Cover</span>
                )}
                {!img.uploading && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeImage(img.id) }}
                    className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center rounded-full bg-surface/80 text-error hover:bg-error hover:text-on-error transition-colors"
                    aria-label="Rimuovi"
                  >
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </Field>

      {/* Visibilità e opzioni */}
      <div className="flex gap-6">
        <Toggle
          checked={form.isActive}
          onChange={(v) => set("isActive", v)}
          label="Visibile nel negozio"
        />
        <label className="flex items-center gap-2 text-sm text-on-surface cursor-pointer select-none">
          <input
            type="checkbox"
            checked={form.isFeatured}
            onChange={(e) => set("isFeatured", e.target.checked)}
            className="rounded"
          />
          In evidenza in homepage
        </label>
      </div>

      {error && (
        <p className="text-sm text-error bg-error-container rounded-lg px-3 py-2">{error}</p>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-primary text-on-primary px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
        >
          {loading ? "Salvataggio…" : submitLabel}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-2.5 rounded-xl text-sm font-medium border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors"
        >
          Annulla
        </button>
        {deleteAction && (
          <button
            type="button"
            onClick={handleDelete}
            className="ml-auto text-sm text-error hover:underline"
          >
            Elimina prodotto
          </button>
        )}
      </div>
    </form>
  )
}
