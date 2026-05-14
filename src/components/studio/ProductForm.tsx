"use client"

import { useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"

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
  id: string
}

interface Collection { id: string; name: string }

export interface ProductFormData {
  name: string
  description: string
  price: number | ""
  salePrice: number | ""
  sku: string
  stock: number | ""
  isActive: boolean
  isFeatured: boolean
  collectionId: string
  tags: string
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
  const fileRef = useRef<HTMLInputElement>(null)
  const colorRef = useRef<HTMLInputElement>(null)

  const set = <K extends keyof ProductFormData>(key: K, val: ProductFormData[K]) =>
    setForm((f) => ({ ...f, [key]: val }))

  // ─── Image upload ────────────────────────────────────────────────────────────

  async function uploadFiles(files: File[]) {
    const imageFiles = files.filter((f) => f.type.startsWith("image/"))
    if (!imageFiles.length) return

    const placeholders: ImageItem[] = imageFiles.map((f) => ({
      id: `tmp-${Date.now()}-${Math.random()}`,
      url: URL.createObjectURL(f),
      alt: f.name,
      uploading: true,
    }))
    setForm((prev) => ({ ...prev, images: [...prev.images, ...placeholders] }))

    // Build folder name from current product name (or generic fallback)
    const productSlug = form.name.trim() ? slugify(form.name) : "prodotto"
    const folder = `media/${productSlug}`

    const uploaded = await Promise.all(
      imageFiles.map(async (file, i) => {
        const fd = new FormData()
        fd.append("file", file)
        fd.append("folder", folder)
        const res = await fetch("/api/upload", { method: "POST", body: fd })
        if (!res.ok) return null
        const { url } = await res.json()
        return { id: placeholders[i].id, url }
      })
    )

    setForm((prev) => ({
      ...prev,
      images: prev.images.map((img) => {
        const match = uploaded.find((u) => u?.id === img.id)
        if (match) return { ...img, url: match.url, uploading: false }
        return img
      }).filter((img) => !img.uploading || uploaded.some((u) => u?.id === img.id)),
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
    await deleteAction()
    router.push("/studio/products")
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
        <textarea
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          required
          rows={4}
          className={inputCls}
          placeholder="Descrizione del prodotto…"
        />
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

      {/* SKU e Scorte */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="SKU">
          <input
            value={form.sku}
            onChange={(e) => set("sku", e.target.value)}
            className={inputCls}
            placeholder="FF-BORSA-001"
          />
        </Field>
        <Field label="Scorte *">
          <input
            type="number"
            min="0"
            required
            value={form.stock}
            onChange={(e) => set("stock", e.target.value === "" ? "" : Number(e.target.value))}
            className={inputCls}
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
      <Field label="Tag" hint="Separati da virgola: estate, cotone, naturale">
        <input
          value={form.tags}
          onChange={(e) => set("tags", e.target.value)}
          className={inputCls}
          placeholder="estate, cotone, naturale"
        />
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

      {/* Immagini — drop zone */}
      <Field label="Immagini prodotto" hint="Trascina qui le immagini o clicca per selezionarle. Riordinale trascinandole.">
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => fileRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors mb-4 ${
            dragOver
              ? "border-primary bg-primary/5"
              : "border-outline-variant hover:border-primary/50 hover:bg-surface-container/50"
          }`}
        >
          <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 block mb-2">upload</span>
          <p className="text-sm text-on-surface-variant">
            <span className="text-primary font-medium">Clicca</span> o trascina le immagini qui
          </p>
          <p className="text-xs text-on-surface-variant/60 mt-1">JPG, PNG, WebP</p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            onChange={onFileChange}
            className="hidden"
          />
        </div>

        {/* Image grid */}
        {form.images.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {form.images.map((img, idx) => (
              <div
                key={img.id}
                draggable={!img.uploading}
                onDragStart={() => onImgDragStart(img.id)}
                onDragOver={(e) => onImgDragOver(e, img.id)}
                onDrop={(e) => onImgDrop(e, img.id)}
                onDragEnd={() => { setDragImgId(null); setDragOverImgId(null) }}
                className={`relative aspect-square rounded-xl overflow-hidden bg-surface-container border-2 transition-all cursor-grab active:cursor-grabbing ${
                  dragOverImgId === img.id ? "border-primary scale-95" : "border-transparent"
                }`}
              >
                <img
                  src={img.url}
                  alt={img.alt}
                  className={`w-full h-full object-cover ${img.uploading ? "opacity-50" : ""}`}
                />
                {img.uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-surface/60">
                    <span className="material-symbols-outlined text-primary text-2xl animate-spin">progress_activity</span>
                  </div>
                )}
                {idx === 0 && !img.uploading && (
                  <span className="absolute top-1 left-1 bg-primary text-on-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    Cover
                  </span>
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

      {/* Checkbox */}
      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm text-on-surface cursor-pointer select-none">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => set("isActive", e.target.checked)}
            className="rounded"
          />
          Attivo (visibile nel negozio)
        </label>
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
