"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Toggle } from "@/components/studio/Toggle"

interface Collection {
  id: string
  name: string
  slug: string
  description: string | null
  heroImageUrl: string | null
  isActive: boolean
  products: { product: { id: string; name: string } }[]
}

interface MediaFile {
  publicId: string
  url: string
}

const emptyForm = { name: "", description: "", heroImageUrl: "" }

function SortableCard({
  c,
  onToggle,
  onEdit,
  onDelete,
  deleting,
}: {
  c: Collection
  onToggle: () => void
  onEdit: () => void
  onDelete: () => void
  deleting: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: c.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-surface-container-low border border-outline-variant rounded-2xl p-4 flex items-center gap-3"
    >
      <button
        className="flex-shrink-0 cursor-grab active:cursor-grabbing text-on-surface-variant/40 hover:text-on-surface-variant transition-colors touch-none"
        {...attributes}
        {...listeners}
        aria-label="Trascina per riordinare"
      >
        <span className="material-symbols-outlined text-[22px]">drag_indicator</span>
      </button>

      {/* thumbnail */}
      <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-surface-container">
        {c.heroImageUrl ? (
          <Image src={c.heroImageUrl} alt={c.name} fill sizes="56px" className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px] text-on-surface-variant/30">image</span>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-3 mb-0.5">
          <p className="font-medium text-on-surface truncate">{c.name}</p>
          <Toggle checked={c.isActive} onChange={onToggle} />
        </div>
        <p className="text-xs text-on-surface-variant mb-1">/{c.slug}</p>
        {c.description && (
          <p className="text-xs text-on-surface-variant line-clamp-1 mb-2">{c.description}</p>
        )}
        <p className="text-xs text-on-surface-variant/60 mb-3">{c.products.length} prodotti</p>

        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-on-surface-variant border border-outline-variant px-3 py-1.5 rounded-lg hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[14px]">edit</span>
            Modifica
          </button>
          <button
            onClick={onDelete}
            disabled={deleting}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-error border border-error/20 px-3 py-1.5 rounded-lg hover:bg-error-container transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[14px]">delete</span>
            {deleting ? "…" : "Elimina"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const [uploading, setUploading] = useState(false)
  const [mediaOpen, setMediaOpen] = useState(false)
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [mediaLoading, setMediaLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  useEffect(() => {
    fetch("/api/collections")
      .then((r) => r.json())
      .then((d) => { setCollections(d); setLoading(false) })
  }, [])

  async function openMedia() {
    setMediaOpen(true)
    if (mediaFiles.length === 0) {
      setMediaLoading(true)
      const res = await fetch("/api/media")
      const data = await res.json()
      setMediaFiles(Array.isArray(data) ? data : [])
      setMediaLoading(false)
    }
  }

  async function uploadHeroImage(file: File) {
    setUploading(true)
    const fd = new FormData()
    fd.append("file", file)
    fd.append("folder", "collections")
    fd.append("name", file.name)
    const res = await fetch("/api/media/upload", { method: "POST", body: fd })
    if (res.ok) {
      const data = await res.json()
      setForm((f) => ({ ...f, heroImageUrl: data.url }))
      setMediaFiles((prev) => [{ publicId: data.public_id ?? data.publicId, url: data.url }, ...prev])
    }
    setUploading(false)
  }

  async function saveCollection() {
    if (!form.name.trim()) return
    setSaving(true)

    const payload = {
      name: form.name,
      description: form.description || null,
      heroImageUrl: form.heroImageUrl || null,
    }

    if (editId) {
      const res = await fetch(`/api/collections/${editId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        const updated = await res.json()
        setCollections((prev) => prev.map((c) => (c.id === editId ? { ...c, ...updated } : c)))
      }
    } else {
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        const created = await res.json()
        setCollections((prev) => [...prev, created])
      }
    }

    setForm(emptyForm)
    setShowForm(false)
    setEditId(null)
    setSaving(false)
    setMediaOpen(false)
  }

  async function toggleActive(id: string, isActive: boolean) {
    await fetch(`/api/collections/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    })
    setCollections((prev) => prev.map((c) => (c.id === id ? { ...c, isActive: !isActive } : c)))
  }

  async function deleteCollection(id: string) {
    if (!confirm("Eliminare questa collezione? Tutti i prodotti associati verranno rimossi dalla collezione.")) return
    setDeletingId(id)
    await fetch(`/api/collections/${id}`, { method: "DELETE" })
    setCollections((prev) => prev.filter((c) => c.id !== id))
    setDeletingId(null)
  }

  function startEdit(c: Collection) {
    setForm({ name: c.name, description: c.description ?? "", heroImageUrl: c.heroImageUrl ?? "" })
    setEditId(c.id)
    setShowForm(true)
    setMediaOpen(false)
  }

  function cancelForm() {
    setShowForm(false)
    setEditId(null)
    setForm(emptyForm)
    setMediaOpen(false)
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = collections.findIndex((c) => c.id === active.id)
    const newIndex = collections.findIndex((c) => c.id === over.id)
    const reordered = arrayMove(collections, oldIndex, newIndex)
    setCollections(reordered)

    await fetch("/api/collections/reorder", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: reordered.map((c) => c.id) }),
    })
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-newsreader text-2xl font-semibold text-on-surface">Collezioni</h1>
          <p className="text-sm text-on-surface-variant">{collections.length} collezioni</p>
        </div>
        <button
          onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(true) }}
          className="inline-flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Nuova collezione
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="mb-6 bg-surface-container-low border border-outline-variant rounded-2xl p-5 space-y-4">
          <h2 className="font-medium text-on-surface">{editId ? "Modifica collezione" : "Nuova collezione"}</h2>

          <div>
            <label className="block text-xs font-medium text-on-surface-variant mb-1">Nome *</label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Nome della collezione"
              className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-on-surface-variant mb-1">Descrizione</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Breve descrizione della collezione…"
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          {/* Hero image */}
          <div>
            <label className="block text-xs font-medium text-on-surface-variant mb-2">Foto di copertina</label>

            {form.heroImageUrl ? (
              <div className="space-y-2">
                <div className="relative aspect-video rounded-xl overflow-hidden bg-surface-container">
                  <Image src={form.heroImageUrl} alt="Copertina" fill sizes="600px" className="object-cover" />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-on-surface-variant border border-outline-variant px-3 py-1.5 rounded-lg hover:bg-surface-container transition-colors disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[14px]">upload</span>
                    {uploading ? "Caricamento…" : "Cambia"}
                  </button>
                  <button
                    type="button"
                    onClick={openMedia}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-on-surface-variant border border-outline-variant px-3 py-1.5 rounded-lg hover:bg-surface-container transition-colors"
                  >
                    <span className="material-symbols-outlined text-[14px]">photo_library</span>
                    Libreria
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, heroImageUrl: "" }))}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-error border border-error/20 px-3 py-1.5 rounded-lg hover:bg-error-container transition-colors"
                  >
                    <span className="material-symbols-outlined text-[14px]">delete</span>
                    Rimuovi
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-outline-variant rounded-xl p-5 text-center">
                <span className="material-symbols-outlined text-3xl text-on-surface-variant/30 mb-2 block">add_photo_alternate</span>
                <p className="text-sm text-on-surface-variant mb-3">Aggiungi una foto di copertina</p>
                <div className="flex gap-2 justify-center">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-on-surface-variant border border-outline-variant px-3 py-1.5 rounded-lg hover:bg-surface-container transition-colors disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[14px]">upload</span>
                    {uploading ? "Caricamento…" : "Carica"}
                  </button>
                  <button
                    type="button"
                    onClick={openMedia}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-on-surface-variant border border-outline-variant px-3 py-1.5 rounded-lg hover:bg-surface-container transition-colors"
                  >
                    <span className="material-symbols-outlined text-[14px]">photo_library</span>
                    Libreria
                  </button>
                </div>
              </div>
            )}

            {/* Media picker */}
            {mediaOpen && (
              <div className="mt-3 border border-outline-variant rounded-xl bg-surface overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2 border-b border-outline-variant">
                  <p className="text-xs font-medium text-on-surface-variant">Libreria media</p>
                  <button onClick={() => setMediaOpen(false)} className="text-on-surface-variant hover:text-on-surface">
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>
                <div className="p-3 max-h-52 overflow-y-auto">
                  {mediaLoading ? (
                    <p className="text-center text-xs text-on-surface-variant py-6">Caricamento…</p>
                  ) : mediaFiles.length === 0 ? (
                    <p className="text-center text-xs text-on-surface-variant py-6">Nessuna immagine in libreria.</p>
                  ) : (
                    <div className="grid grid-cols-5 gap-2">
                      {mediaFiles.map((f) => (
                        <button
                          key={f.publicId}
                          type="button"
                          onClick={() => { setForm((ff) => ({ ...ff, heroImageUrl: f.url })); setMediaOpen(false) }}
                          className="relative aspect-square rounded-lg overflow-hidden bg-surface-container hover:ring-2 hover:ring-primary transition-all"
                        >
                          <Image src={f.url} alt="" fill sizes="80px" className="object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadHeroImage(f); e.target.value = "" }}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button
              onClick={cancelForm}
              className="px-4 py-2 rounded-lg text-sm text-on-surface-variant border border-outline-variant hover:bg-surface-container transition-colors"
            >
              Annulla
            </button>
            <button
              onClick={saveCollection}
              disabled={saving || !form.name.trim()}
              className="bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-60 hover:bg-primary/90 transition-colors"
            >
              {saving ? "…" : editId ? "Salva" : "Crea"}
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <p className="text-center text-sm text-on-surface-variant py-12">Caricamento…</p>
      ) : collections.length === 0 ? (
        <div className="text-center py-16 text-on-surface-variant">
          <span className="material-symbols-outlined text-5xl mb-3 block opacity-30">collections</span>
          <p className="text-sm">Nessuna collezione. Creane una per raggruppare i tuoi prodotti.</p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={collections.map((c) => c.id)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-3">
              {collections.map((c) => (
                <SortableCard
                  key={c.id}
                  c={c}
                  onToggle={() => toggleActive(c.id, c.isActive)}
                  onEdit={() => startEdit(c)}
                  onDelete={() => deleteCollection(c.id)}
                  deleting={deletingId === c.id}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}
