"use client"

import { useState, useEffect } from "react"

interface Slide {
  id: string
  imageUrl: string
  caption: string | null
  linkUrl: string | null
  linkText: string | null
  position: number
  isActive: boolean
}

interface MediaFile {
  url: string
  name: string
  folder: string
}

const emptyForm = { imageUrl: "", caption: "", linkUrl: "", linkText: "" }

export default function SlideshowPage() {
  const [slides, setSlides] = useState<Slide[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)

  // Announcement bar state
  const [bannerText, setBannerText] = useState("")
  const [bannerActive, setBannerActive] = useState(false)
  const [bannerSaving, setBannerSaving] = useState(false)
  const [bannerSaved, setBannerSaved] = useState(false)

  // Media picker state
  const [imageTab, setImageTab] = useState<"url" | "media">("url")
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [mediaLoading, setMediaLoading] = useState(false)
  const [mediaFilter, setMediaFilter] = useState("")

  useEffect(() => {
    fetch("/api/slides")
      .then((r) => r.json())
      .then((d) => { setSlides(d); setLoading(false) })
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        setBannerText(d.announcementText ?? "")
        setBannerActive(d.announcementActive ?? false)
      })
  }, [])

  async function saveBanner() {
    setBannerSaving(true)
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ announcementText: bannerText, announcementActive: bannerActive }),
    })
    setBannerSaving(false)
    setBannerSaved(true)
    setTimeout(() => setBannerSaved(false), 2500)
  }

  async function loadMedia() {
    if (mediaFiles.length > 0) return // already loaded
    setMediaLoading(true)
    try {
      const res = await fetch("/api/media")
      if (res.ok) setMediaFiles(await res.json())
    } finally {
      setMediaLoading(false)
    }
  }

  async function saveSlide() {
    if (!form.imageUrl.trim()) return
    setSaving(true)

    if (editId) {
      const res = await fetch(`/api/slides/${editId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        const updated = await res.json()
        setSlides((prev) => prev.map((s) => (s.id === editId ? updated : s)))
      }
    } else {
      const res = await fetch("/api/slides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        const created = await res.json()
        setSlides((prev) => [...prev, created])
      }
    }

    setForm(emptyForm)
    setShowForm(false)
    setEditId(null)
    setSaving(false)
  }

  async function toggleActive(id: string, isActive: boolean) {
    await fetch(`/api/slides/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    })
    setSlides((prev) => prev.map((s) => (s.id === id ? { ...s, isActive: !isActive } : s)))
  }

  async function moveSlide(id: string, direction: "up" | "down") {
    const idx = slides.findIndex((s) => s.id === id)
    if (direction === "up" && idx === 0) return
    if (direction === "down" && idx === slides.length - 1) return

    const swapIdx = direction === "up" ? idx - 1 : idx + 1
    const updated = [...slides]
    const posA = updated[idx].position
    const posB = updated[swapIdx].position
    updated[idx] = { ...updated[idx], position: posB }
    updated[swapIdx] = { ...updated[swapIdx], position: posA }
    ;[updated[idx], updated[swapIdx]] = [updated[swapIdx], updated[idx]]
    setSlides(updated)

    await Promise.all([
      fetch(`/api/slides/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ position: posB }) }),
      fetch(`/api/slides/${updated[direction === "up" ? idx : swapIdx].id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ position: posA }) }),
    ])
  }

  async function deleteSlide(id: string) {
    if (!confirm("Eliminare questa slide?")) return
    await fetch(`/api/slides/${id}`, { method: "DELETE" })
    setSlides((prev) => prev.filter((s) => s.id !== id))
  }

  function startEdit(slide: Slide) {
    setForm({
      imageUrl: slide.imageUrl,
      caption: slide.caption ?? "",
      linkUrl: slide.linkUrl ?? "",
      linkText: slide.linkText ?? "",
    })
    setEditId(slide.id)
    setImageTab("url")
    setShowForm(true)
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">

      {/* Announcement bar settings */}
      <section className="bg-surface-container-low border border-outline-variant rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px]">campaign</span>
          <h2 className="font-semibold text-on-surface">Striscia Annunci</h2>
          <span className="text-xs text-on-surface-variant ml-auto">appare sopra il menù su tutto il sito</span>
        </div>
        <div>
          <label className="block text-xs font-medium text-on-surface-variant mb-1">Testo del banner</label>
          <input
            value={bannerText}
            onChange={(e) => setBannerText(e.target.value)}
            placeholder="Es. Spedizione gratuita sopra €60 · Fatto a mano in Italia"
            className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <button
              type="button"
              role="switch"
              aria-checked={bannerActive}
              onClick={() => setBannerActive((v) => !v)}
              className={`relative w-10 h-5 rounded-full transition-colors ${bannerActive ? "bg-primary" : "bg-outline-variant"}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${bannerActive ? "translate-x-5" : "translate-x-0"}`} />
            </button>
            <span className="text-sm text-on-surface">{bannerActive ? "Visibile" : "Nascosta"}</span>
          </label>
          <div className="flex items-center gap-3">
            {bannerSaved && <span className="text-xs text-green-600 font-medium">Salvato ✓</span>}
            <button
              onClick={saveBanner}
              disabled={bannerSaving}
              className="bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {bannerSaving ? "Salvataggio…" : "Salva"}
            </button>
          </div>
        </div>
      </section>

      {/* Slides section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-newsreader text-2xl font-semibold text-on-surface">Slideshow Home</h1>
          <p className="text-sm text-on-surface-variant">{slides.length} slide · appaiono nell&apos;hero della homepage</p>
        </div>
        <button
          onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(true) }}
          className="inline-flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Nuova slide
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="mb-6 bg-surface-container-low border border-outline-variant rounded-2xl p-5 space-y-4">
          <h2 className="font-medium text-on-surface">{editId ? "Modifica slide" : "Aggiungi slide"}</h2>

          {/* Image source tabs */}
          <div>
            <div className="flex gap-1 mb-3 bg-surface-container rounded-xl p-1 w-fit">
              <button
                type="button"
                onClick={() => setImageTab("url")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  imageTab === "url"
                    ? "bg-surface text-on-surface shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                URL manuale
              </button>
              <button
                type="button"
                onClick={() => { setImageTab("media"); loadMedia() }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  imageTab === "media"
                    ? "bg-surface text-on-surface shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">perm_media</span>
                  Media library
                </span>
              </button>
            </div>

            {imageTab === "url" ? (
              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-1">URL immagine *</label>
                <input
                  value={form.imageUrl}
                  onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                  placeholder="https://... oppure /media/nome-file.jpg"
                  className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-on-surface-variant mb-2">Scegli dalla libreria</label>

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
                      .map((f) => (
                        <button
                          key={f.url}
                          type="button"
                          onClick={() => setForm((prev) => ({ ...prev, imageUrl: f.url }))}
                          className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                            form.imageUrl === f.url
                              ? "border-primary shadow-md"
                              : "border-transparent hover:border-outline-variant"
                          }`}
                          title={f.name}
                        >
                          <img src={f.url} alt={f.name} className="w-full h-full object-cover" loading="lazy" />
                          {form.imageUrl === f.url && (
                            <div className="absolute inset-0 flex items-center justify-center bg-primary/30">
                              <span className="material-symbols-outlined text-on-primary text-xl">check_circle</span>
                            </div>
                          )}
                        </button>
                      ))
                    }
                  </div>
                )}

                {/* Show selected URL */}
                {form.imageUrl && (
                  <p className="mt-2 text-xs font-mono text-on-surface-variant bg-surface-container px-2 py-1 rounded-lg truncate">
                    {form.imageUrl}
                  </p>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-on-surface-variant mb-1">Didascalia</label>
            <input
              value={form.caption}
              onChange={(e) => setForm((f) => ({ ...f, caption: e.target.value }))}
              placeholder="Testo mostrato sopra l'immagine…"
              className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1">URL link</label>
              <input
                value={form.linkUrl}
                onChange={(e) => setForm((f) => ({ ...f, linkUrl: e.target.value }))}
                placeholder="/shop"
                className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1">Testo pulsante</label>
              <input
                value={form.linkText}
                onChange={(e) => setForm((f) => ({ ...f, linkText: e.target.value }))}
                placeholder="Scopri la collezione"
                className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => { setShowForm(false); setEditId(null); setForm(emptyForm) }}
              className="px-4 py-2 rounded-lg text-sm text-on-surface-variant border border-outline-variant hover:bg-surface-container transition-colors"
            >
              Annulla
            </button>
            <button
              onClick={saveSlide}
              disabled={saving || !form.imageUrl.trim()}
              className="bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-60 hover:bg-primary/90 transition-colors"
            >
              {saving ? "…" : editId ? "Salva" : "Aggiungi"}
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <p className="text-center text-sm text-on-surface-variant py-12">Caricamento…</p>
      ) : slides.length === 0 ? (
        <div className="text-center py-16 text-on-surface-variant">
          <span className="material-symbols-outlined text-5xl mb-3 block opacity-30">slideshow</span>
          <p className="text-sm">Nessuna slide. Aggiungi la prima per attivare lo slideshow in homepage.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {slides.map((slide, idx) => (
            <div key={slide.id} className="bg-surface-container-low border border-outline-variant rounded-2xl p-4 flex gap-4 items-center">
              {/* Thumbnail */}
              <div className="w-20 h-14 rounded-lg overflow-hidden bg-surface-container shrink-0">
                <img src={slide.imageUrl} alt="" className="w-full h-full object-cover" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-on-surface text-sm truncate">{slide.caption || "Nessuna didascalia"}</p>
                {slide.linkUrl && (
                  <p className="text-xs text-on-surface-variant truncate">{slide.linkUrl}</p>
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => moveSlide(slide.id, "up")}
                  disabled={idx === 0}
                  className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors disabled:opacity-30"
                  title="Sposta su"
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
                </button>
                <button
                  onClick={() => moveSlide(slide.id, "down")}
                  disabled={idx === slides.length - 1}
                  className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors disabled:opacity-30"
                  title="Sposta giù"
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_downward</span>
                </button>
                <button
                  onClick={() => toggleActive(slide.id, slide.isActive)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium ml-1 ${slide.isActive ? "bg-green-100 text-green-700" : "bg-surface-container text-on-surface-variant"}`}
                >
                  {slide.isActive ? "Visibile" : "Nascosta"}
                </button>
                <button
                  onClick={() => startEdit(slide)}
                  className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors ml-1"
                  title="Modifica"
                >
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                </button>
                <button
                  onClick={() => deleteSlide(slide.id)}
                  className="p-1.5 rounded-lg text-error hover:bg-error-container transition-colors"
                  title="Elimina"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}
