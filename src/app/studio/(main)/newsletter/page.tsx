"use client"

import { useState, useEffect, useCallback } from "react"

// ── Types ──────────────────────────────────────────────────────────────────

interface Subscriber {
  id: string; email: string; isActive: boolean; subscribedAt: string
}

interface CampaignProduct {
  product: { id: string; name: string }
}

interface CampaignCollection {
  collection: { id: string; name: string }
}

interface Campaign {
  id: string
  subject: string
  topic: string | null
  htmlContent: string
  status: string
  scheduledFor: string | null
  sentAt: string | null
  recipientCount: number | null
  createdAt: string
  products: CampaignProduct[]
  collections: CampaignCollection[]
}

interface SimpleProduct { id: string; name: string }
interface SimpleCollection { id: string; name: string }

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Bozza",
  PENDING_APPROVAL: "In attesa",
  APPROVED: "Approvata",
  SENT: "Inviata",
  CANCELLED: "Annullata",
}
const STATUS_COLOR: Record<string, string> = {
  DRAFT: "bg-surface-container text-on-surface-variant",
  PENDING_APPROVAL: "bg-amber-100 text-amber-700",
  APPROVED: "bg-primary-container text-on-primary-container",
  SENT: "bg-green-100 text-green-700",
  CANCELLED: "bg-error-container text-on-error-container",
}

// ── Subscribers tab ────────────────────────────────────────────────────────

function SubscribersTab() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "active">("active")

  useEffect(() => {
    fetch("/api/newsletter/subscribers").then((r) => r.json()).then((d) => {
      setSubscribers(d); setLoading(false)
    })
  }, [])

  async function unsubscribe(email: string) {
    await fetch("/api/newsletter/subscribers", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
    setSubscribers((prev) => prev.map((s) => s.email === email ? { ...s, isActive: false } : s))
  }

  const visible = subscribers.filter((s) => filter === "all" || s.isActive)
  const activeCount = subscribers.filter((s) => s.isActive).length

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-on-surface-variant">{activeCount} iscritti attivi · {subscribers.length} totali</p>
        <a
          href={`data:text/csv;charset=utf-8,Email%0A${subscribers.filter((s) => s.isActive).map((s) => s.email).join("%0A")}`}
          download="newsletter.csv"
          className="inline-flex items-center gap-2 border border-outline-variant text-on-surface-variant px-4 py-2 rounded-xl text-sm font-medium hover:bg-surface-container transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">download</span>
          Esporta CSV
        </a>
      </div>
      <div className="flex gap-2 mb-5">
        {(["active", "all"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === f ? "bg-primary-container text-on-primary-container" : "border border-outline-variant text-on-surface-variant hover:bg-surface-container"}`}
          >{f === "active" ? "Attivi" : "Tutti"}</button>
        ))}
      </div>
      <div className="bg-surface-container-low border border-outline-variant rounded-2xl overflow-hidden">
        {loading ? <p className="py-12 text-center text-sm text-on-surface-variant">Caricamento…</p>
          : visible.length === 0 ? <p className="py-12 text-center text-sm text-on-surface-variant">Nessun iscritto</p>
          : (
          <table className="w-full text-sm">
            <thead className="bg-surface-container border-b border-outline-variant">
              <tr>{["Email", "Data iscrizione", "Stato", ""].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wide">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {visible.map((s) => (
                <tr key={s.id} className="hover:bg-surface-container/50">
                  <td className="px-4 py-3 text-on-surface">{s.email}</td>
                  <td className="px-4 py-3 text-on-surface-variant">{new Date(s.subscribedAt).toLocaleDateString("it-IT")}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.isActive ? "bg-green-100 text-green-700" : "bg-surface-container text-on-surface-variant"}`}>
                      {s.isActive ? "Attivo" : "Disiscritto"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {s.isActive && <button onClick={() => unsubscribe(s.email)} className="text-xs text-error hover:underline">Disiscriversi</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

// ── Campaigns tab ──────────────────────────────────────────────────────────

function CampaignsTab() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Campaign | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [allProducts, setAllProducts] = useState<SimpleProduct[]>([])
  const [allCollections, setAllCollections] = useState<SimpleCollection[]>([])

  // form state
  const [formTopic, setFormTopic] = useState("")
  const [formProductIds, setFormProductIds] = useState<string[]>([])
  const [formCollectionIds, setFormCollectionIds] = useState<string[]>([])
  const [formScheduledFor, setFormScheduledFor] = useState("")
  const [creating, setCreating] = useState(false)

  // panel state
  const [generating, setGenerating] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [panelMsg, setPanelMsg] = useState("")
  const [showPreview, setShowPreview] = useState(false)

  // editable fields
  const [editSubject, setEditSubject] = useState("")
  const [editScheduledFor, setEditScheduledFor] = useState("")
  const [editTopic, setEditTopic] = useState("")
  const [editProductIds, setEditProductIds] = useState<string[]>([])
  const [editCollectionIds, setEditCollectionIds] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  const reload = useCallback(async () => {
    setLoading(true)
    const r = await fetch("/api/newsletter/campaigns")
    if (r.ok) setCampaigns(await r.json())
    setLoading(false)
  }, [])

  useEffect(() => { reload() }, [reload])

  useEffect(() => {
    fetch("/api/products?active=false").then((r) => r.json()).then((d) => {
      const list = Array.isArray(d) ? d : (d.products ?? [])
      setAllProducts(list.map((p: { id: string; name: string }) => ({ id: p.id, name: p.name })))
    })
    fetch("/api/collections").then((r) => r.json()).then((d: { id: string; name: string }[]) => {
      setAllCollections(d.map((c) => ({ id: c.id, name: c.name })))
    })
  }, [])

  function openCampaign(c: Campaign) {
    setSelected(c)
    setEditSubject(c.subject)
    setEditTopic(c.topic ?? "")
    setEditProductIds(c.products.map((p) => p.product.id))
    setEditCollectionIds(c.collections.map((col) => col.collection.id))
    setEditScheduledFor(c.scheduledFor ? c.scheduledFor.slice(0, 16) : "")
    setPanelMsg("")
    setShowPreview(false)
  }

  async function createCampaign() {
    if (!formTopic && formProductIds.length === 0 && formCollectionIds.length === 0) return
    setCreating(true)
    const r = await fetch("/api/newsletter/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic: formTopic,
        productIds: formProductIds,
        collectionIds: formCollectionIds,
        scheduledFor: formScheduledFor || null,
      }),
    })
    if (r.ok) {
      const c = await r.json()
      setCampaigns((prev) => [c, ...prev])
      setShowForm(false)
      setFormTopic(""); setFormProductIds([]); setFormCollectionIds([]); setFormScheduledFor("")
      openCampaign(c)
    }
    setCreating(false)
  }

  async function saveEdits() {
    if (!selected) return
    setSaving(true)
    const r = await fetch(`/api/newsletter/campaigns/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject: editSubject,
        topic: editTopic,
        scheduledFor: editScheduledFor || null,
        productIds: editProductIds,
        collectionIds: editCollectionIds,
      }),
    })
    if (r.ok) {
      const data = await r.json()
      // Use server response which has full includes, fallback to local merge
      const updated: Campaign = data.products !== undefined ? data : {
        ...selected,
        subject: editSubject,
        topic: editTopic || null,
        scheduledFor: editScheduledFor || null,
        products: editProductIds.map((id) => ({ product: { id, name: allProducts.find((p) => p.id === id)?.name ?? id } })),
        collections: editCollectionIds.map((id) => ({ collection: { id, name: allCollections.find((c) => c.id === id)?.name ?? id } })),
      }
      setCampaigns((prev) => prev.map((c) => c.id === selected.id ? updated : c))
      setSelected(updated)
    }
    setSaving(false)
  }

  async function generate() {
    if (!selected) return
    await saveEdits()
    setGenerating(true); setPanelMsg("")
    const r = await fetch(`/api/newsletter/campaigns/${selected.id}/generate`, { method: "POST" })
    const data = await r.json()
    if (r.ok) {
      const updated: Campaign = { ...selected, subject: data.subject, htmlContent: data.campaign.htmlContent }
      setSelected(updated)
      setEditSubject(data.subject)
      setCampaigns((prev) => prev.map((c) => c.id === selected.id ? updated : c))
      setPanelMsg("✅ Testo generato con successo!")
    } else {
      setPanelMsg(`❌ ${data.error}`)
    }
    setGenerating(false)
  }

  async function submitForApproval() {
    if (!selected) return
    setSubmitting(true); setPanelMsg("")
    const r = await fetch(`/api/newsletter/campaigns/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "submit" }),
    })
    if (r.ok) {
      const updated: Campaign = { ...selected, status: "PENDING_APPROVAL" }
      setSelected(updated)
      setCampaigns((prev) => prev.map((c) => c.id === selected.id ? updated : c))
      setPanelMsg("📬 Email di approvazione inviata a info@gefcrochet.it")
    } else {
      const data = await r.json()
      setPanelMsg(`❌ ${data.error}`)
    }
    setSubmitting(false)
  }

  async function deleteCampaign() {
    if (!selected || !confirm("Eliminare questa campagna?")) return
    setDeleting(true)
    await fetch(`/api/newsletter/campaigns/${selected.id}`, { method: "DELETE" })
    setCampaigns((prev) => prev.filter((c) => c.id !== selected.id))
    setSelected(null)
    setDeleting(false)
  }

  const isDraft = selected?.status === "DRAFT"
  const toggleProduct    = (id: string) =>
    setEditProductIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
  const toggleCollection = (id: string) =>
    setEditCollectionIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])

  return (
    <div className="flex gap-6 items-start">
      {/* List */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-on-surface-variant">{campaigns.length} campagne</p>
          <button onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-1.5 bg-primary text-on-primary px-3 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            Nuova campagna
          </button>
        </div>

        {/* Create form */}
        {showForm && (
          <div className="mb-5 bg-surface-container-low border border-outline-variant rounded-2xl p-4 space-y-3">
            <p className="font-medium text-on-surface text-sm">Nuova campagna</p>
            <div>
              <label className="block text-xs text-on-surface-variant mb-1">Topic / tema (opzionale)</label>
              <textarea value={formTopic} onChange={(e) => setFormTopic(e.target.value)} rows={2}
                placeholder="Es. primavera, nuovi arrivi, Natale…"
                className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
            </div>
            <div>
              <label className="block text-xs text-on-surface-variant mb-1">Prodotti in evidenza (opzionale)</label>
              <div className="max-h-32 overflow-y-auto border border-outline-variant rounded-lg divide-y divide-outline-variant">
                {allProducts.map((p) => (
                  <label key={p.id} className="flex items-center gap-2 px-3 py-1.5 hover:bg-surface-container cursor-pointer">
                    <input type="checkbox" checked={formProductIds.includes(p.id)}
                      onChange={() => setFormProductIds((prev) => prev.includes(p.id) ? prev.filter((x) => x !== p.id) : [...prev, p.id])}
                      className="accent-primary" />
                    <span className="text-sm text-on-surface">{p.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs text-on-surface-variant mb-1">Collezioni in evidenza (opzionale)</label>
              <div className="max-h-28 overflow-y-auto border border-outline-variant rounded-lg divide-y divide-outline-variant">
                {allCollections.map((col) => (
                  <label key={col.id} className="flex items-center gap-2 px-3 py-1.5 hover:bg-surface-container cursor-pointer">
                    <input type="checkbox" checked={formCollectionIds.includes(col.id)}
                      onChange={() => setFormCollectionIds((prev) => prev.includes(col.id) ? prev.filter((x) => x !== col.id) : [...prev, col.id])}
                      className="accent-primary" />
                    <span className="text-sm text-on-surface">{col.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs text-on-surface-variant mb-1">Data e ora invio</label>
              <input type="datetime-local" value={formScheduledFor} onChange={(e) => setFormScheduledFor(e.target.value)}
                className="px-3 py-2 rounded-lg border border-outline-variant bg-surface text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowForm(false)} className="px-3 py-1.5 text-sm text-on-surface-variant border border-outline-variant rounded-lg hover:bg-surface-container transition-colors">Annulla</button>
              <button onClick={createCampaign} disabled={creating || (!formTopic && formProductIds.length === 0 && formCollectionIds.length === 0)}
                className="px-3 py-1.5 text-sm bg-primary text-on-primary rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors">
                {creating ? "…" : "Crea bozza"}
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-surface-container-low border border-outline-variant rounded-2xl overflow-hidden">
          {loading ? <p className="py-10 text-center text-sm text-on-surface-variant">Caricamento…</p>
            : campaigns.length === 0 ? <p className="py-10 text-center text-sm text-on-surface-variant">Nessuna campagna ancora. Crea la prima!</p>
            : (
            <table className="w-full text-sm">
              <thead className="bg-surface-container border-b border-outline-variant">
                <tr>{["Oggetto", "Invio", "Stato", ""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wide">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {campaigns.map((c) => (
                  <tr key={c.id}
                    className={`hover:bg-surface-container/50 transition-colors cursor-pointer ${selected?.id === c.id ? "bg-primary/5" : ""}`}
                    onClick={() => openCampaign(c)}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-on-surface truncate max-w-[200px]">
                        {c.subject || <em className="text-on-surface-variant font-normal">Senza oggetto</em>}
                      </p>
                      {c.topic && <p className="text-xs text-on-surface-variant truncate">{c.topic}</p>}
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant text-xs whitespace-nowrap">
                      {c.scheduledFor ? new Date(c.scheduledFor).toLocaleString("it-IT", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[c.status] ?? "bg-surface-container text-on-surface-variant"}`}>
                        {STATUS_LABEL[c.status] ?? c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-on-surface-variant">
                      {c.status === "SENT" && c.recipientCount != null && `${c.recipientCount} inv.`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="w-[360px] shrink-0 bg-surface-container-low border border-outline-variant rounded-2xl p-5 space-y-4 sticky top-20">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-on-surface text-sm">Campagna</h3>
            <button onClick={() => setSelected(null)} className="text-on-surface-variant hover:text-on-surface">
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[selected.status] ?? ""}`}>
              {STATUS_LABEL[selected.status] ?? selected.status}
            </span>
            {selected.status === "SENT" && selected.sentAt && (
              <span className="text-xs text-on-surface-variant">
                {new Date(selected.sentAt).toLocaleString("it-IT", { dateStyle: "short", timeStyle: "short" })} · {selected.recipientCount} dest.
              </span>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs text-on-surface-variant mb-1">Oggetto email</label>
              <input value={editSubject} onChange={(e) => setEditSubject(e.target.value)} disabled={!isDraft}
                className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60" />
            </div>
            <div>
              <label className="block text-xs text-on-surface-variant mb-1">Topic</label>
              <input value={editTopic} onChange={(e) => setEditTopic(e.target.value)} disabled={!isDraft}
                placeholder="Tema della newsletter…"
                className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60" />
            </div>
            <div>
              <label className="block text-xs text-on-surface-variant mb-1">Data e ora invio</label>
              <input type="datetime-local" value={editScheduledFor}
                onChange={(e) => setEditScheduledFor(e.target.value)}
                disabled={selected.status === "SENT" || selected.status === "CANCELLED"}
                className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60" />
            </div>

            {isDraft && (
              <div>
                <label className="block text-xs text-on-surface-variant mb-1">Prodotti</label>
                <div className="max-h-28 overflow-y-auto border border-outline-variant rounded-lg divide-y divide-outline-variant">
                  {allProducts.map((p) => (
                    <label key={p.id} className="flex items-center gap-2 px-3 py-1.5 hover:bg-surface-container cursor-pointer">
                      <input type="checkbox" checked={editProductIds.includes(p.id)} onChange={() => toggleProduct(p.id)} className="accent-primary" />
                      <span className="text-sm text-on-surface">{p.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {isDraft && (
              <div>
                <label className="block text-xs text-on-surface-variant mb-1">Collezioni</label>
                <div className="max-h-24 overflow-y-auto border border-outline-variant rounded-lg divide-y divide-outline-variant">
                  {allCollections.map((col) => (
                    <label key={col.id} className="flex items-center gap-2 px-3 py-1.5 hover:bg-surface-container cursor-pointer">
                      <input type="checkbox" checked={editCollectionIds.includes(col.id)} onChange={() => toggleCollection(col.id)} className="accent-primary" />
                      <span className="text-sm text-on-surface">{col.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {isDraft && (
              <button onClick={saveEdits} disabled={saving}
                className="w-full py-1.5 text-sm border border-outline-variant text-on-surface-variant rounded-lg hover:bg-surface-container transition-colors disabled:opacity-50">
                {saving ? "Salvato…" : "Salva modifiche"}
              </button>
            )}
          </div>

          {panelMsg && (
            <p className={`text-xs rounded-lg px-3 py-2 ${panelMsg.startsWith("❌") ? "bg-error/10 text-error" : "bg-primary/10 text-primary"}`}>
              {panelMsg}
            </p>
          )}

          {isDraft && (
            <div className="space-y-2">
              <button onClick={generate} disabled={generating || (!editTopic && editProductIds.length === 0 && editCollectionIds.length === 0)}
                className="w-full flex items-center justify-center gap-2 bg-primary text-on-primary py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
                <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                {generating ? "Generazione in corso…" : "Genera con Groq"}
              </button>
              {selected.htmlContent && (
                <button onClick={submitForApproval} disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 border border-primary text-primary py-2.5 rounded-xl text-sm font-medium hover:bg-primary/10 disabled:opacity-50 transition-colors">
                  <span className="material-symbols-outlined text-[16px]">send</span>
                  {submitting ? "Invio…" : "Invia per approvazione"}
                </button>
              )}
            </div>
          )}

          {selected.htmlContent && (
            <div>
              <button onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-1.5 text-xs text-primary hover:underline">
                <span className="material-symbols-outlined text-[14px]">{showPreview ? "visibility_off" : "visibility"}</span>
                {showPreview ? "Nascondi anteprima" : "Mostra anteprima"}
              </button>
              {showPreview && (
                <div className="mt-2 border border-outline-variant rounded-xl overflow-hidden" style={{ height: 400 }}>
                  <iframe srcDoc={selected.htmlContent} className="w-full h-full" title="Anteprima newsletter" sandbox="allow-same-origin" />
                </div>
              )}
            </div>
          )}

          {(isDraft || selected.status === "CANCELLED") && (
            <button onClick={deleteCampaign} disabled={deleting}
              className="w-full text-xs text-error hover:underline text-center py-1 disabled:opacity-50">
              {deleting ? "Eliminazione…" : "Elimina campagna"}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────

export default function NewsletterPage() {
  const [tab, setTab] = useState<"subscribers" | "campaigns">("subscribers")

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="font-newsreader text-2xl font-semibold text-on-surface">Newsletter</h1>
      </div>

      <div className="flex gap-1 mb-6 border-b border-outline-variant">
        {([
          { key: "subscribers", label: "Iscritti", icon: "group" },
          { key: "campaigns", label: "Campagne", icon: "campaign" },
        ] as const).map(({ key, label, icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={[
              "flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px",
              tab === key ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:text-on-surface",
            ].join(" ")}
          >
            <span className="material-symbols-outlined text-[16px]">{icon}</span>
            {label}
          </button>
        ))}
      </div>

      {tab === "subscribers" ? <SubscribersTab /> : <CampaignsTab />}
    </div>
  )
}
