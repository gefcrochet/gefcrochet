"use client"

import { useState, useEffect } from "react"
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
  isActive: boolean
  products: { product: { id: string; name: string } }[]
}

const emptyForm = { name: "", description: "" }

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
      className="bg-surface-container-low border border-outline-variant rounded-2xl p-5 flex items-start gap-3"
    >
      <button
        className="mt-0.5 flex-shrink-0 cursor-grab active:cursor-grabbing text-on-surface-variant/40 hover:text-on-surface-variant transition-colors touch-none"
        {...attributes}
        {...listeners}
        aria-label="Trascina per riordinare"
      >
        <span className="material-symbols-outlined text-[22px]">drag_indicator</span>
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0 mr-3">
            <p className="font-medium text-on-surface truncate">{c.name}</p>
            <p className="text-xs text-on-surface-variant">/{c.slug}</p>
          </div>
          <Toggle checked={c.isActive} onChange={onToggle} />
        </div>

        {c.description && (
          <p className="text-sm text-on-surface-variant mb-3 leading-relaxed line-clamp-2">{c.description}</p>
        )}

        <p className="text-xs text-on-surface-variant mb-4">{c.products.length} prodotti</p>

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

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  useEffect(() => {
    fetch("/api/collections")
      .then((r) => r.json())
      .then((d) => { setCollections(d); setLoading(false) })
  }, [])

  async function saveCollection() {
    if (!form.name.trim()) return
    setSaving(true)

    if (editId) {
      const res = await fetch(`/api/collections/${editId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, description: form.description || null }),
      })
      if (res.ok) {
        const updated = await res.json()
        setCollections((prev) => prev.map((c) => (c.id === editId ? { ...c, ...updated } : c)))
      }
    } else {
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, description: form.description || null }),
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
    setForm({ name: c.name, description: c.description ?? "" })
    setEditId(c.id)
    setShowForm(true)
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
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => { setShowForm(false); setEditId(null); setForm(emptyForm) }}
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
