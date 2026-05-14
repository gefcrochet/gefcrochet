"use client"

import { useState, useEffect } from "react"

interface Subscriber {
  id: string; email: string; isActive: boolean; subscribedAt: string
}

export default function NewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "active">("active")

  useEffect(() => {
    fetch("/api/newsletter/subscribers").then((r) => r.json()).then((d) => {
      setSubscribers(d)
      setLoading(false)
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
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-newsreader text-2xl font-semibold text-on-surface">Newsletter</h1>
          <p className="text-sm text-on-surface-variant">{activeCount} iscritti attivi · {subscribers.length} totali</p>
        </div>
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
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === f ? "bg-primary-container text-on-primary-container" : "border border-outline-variant text-on-surface-variant hover:bg-surface-container"}`}
          >
            {f === "active" ? "Attivi" : "Tutti"}
          </button>
        ))}
      </div>

      <div className="bg-surface-container-low border border-outline-variant rounded-2xl overflow-hidden">
        {loading ? (
          <p className="py-12 text-center text-sm text-on-surface-variant">Caricamento…</p>
        ) : visible.length === 0 ? (
          <p className="py-12 text-center text-sm text-on-surface-variant">Nessun iscritto</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-surface-container border-b border-outline-variant">
              <tr>
                {["Email", "Data iscrizione", "Stato", ""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wide">{h}</th>
                ))}
              </tr>
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
                    {s.isActive && (
                      <button onClick={() => unsubscribe(s.email)} className="text-xs text-error hover:underline">
                        Disiscriversi
                      </button>
                    )}
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
