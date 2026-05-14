"use client"

import { useState, useEffect, useCallback } from "react"
import { formatPrice, ORDER_STATUSES, STATUS_LABELS, type OrderStatus } from "@/lib/utils"
import { StatusBadge } from "@/components/StatusBadge"

interface OrderItem {
  id: string
  quantity: number
  unitPrice: number
  productName: string
}

interface Order {
  id: string
  orderNumber: number
  status: string
  customerName: string
  customerEmail: string
  customerPhone: string | null
  shippingLine1: string
  shippingCity: string
  shippingPostal: string
  shippingCountry: string
  totalCents: number
  createdAt: string
  notes: string | null
  items: OrderItem[]
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("")
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<Order | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (statusFilter) params.set("status", statusFilter)
    if (search) params.set("search", search)
    const res = await fetch(`/api/orders?${params}`)
    if (res.ok) {
      const data = await res.json()
      setOrders(data.orders)
      setTotal(data.total)
    }
    setLoading(false)
  }, [statusFilter, search])

  useEffect(() => { load() }, [load])

  async function updateStatus(orderId: string, status: string) {
    setUpdatingStatus(true)
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      const updated = await res.json()
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: updated.status } : o)))
      if (selected?.id === orderId) setSelected((s) => s ? { ...s, status: updated.status } : s)
    }
    setUpdatingStatus(false)
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-newsreader text-2xl font-semibold text-on-surface">Ordini</h1>
          <p className="text-sm text-on-surface-variant">{total} ordini totali</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <input
          type="search"
          placeholder="Cerca per nome o email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-48 px-3 py-2 rounded-lg border border-outline-variant bg-surface text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-outline-variant bg-surface text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Tutti gli stati</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-surface-container-low border border-outline-variant rounded-2xl overflow-hidden">
        {loading ? (
          <p className="py-12 text-center text-sm text-on-surface-variant">Caricamento…</p>
        ) : orders.length === 0 ? (
          <p className="py-12 text-center text-sm text-on-surface-variant">Nessun ordine trovato</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-surface-container border-b border-outline-variant">
              <tr>
                {["#", "Cliente", "Data", "Totale", "Stato", ""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-surface-container/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-on-surface">#{o.orderNumber}</td>
                  <td className="px-4 py-3">
                    <p className="text-on-surface">{o.customerName}</p>
                    <p className="text-xs text-on-surface-variant">{o.customerEmail}</p>
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant">{new Date(o.createdAt).toLocaleDateString("it-IT")}</td>
                  <td className="px-4 py-3 font-medium text-on-surface">{formatPrice(o.totalCents)}</td>
                  <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setSelected(o)}
                      className="text-primary text-xs font-medium hover:underline"
                    >
                      Dettagli
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/30" onClick={() => setSelected(null)} />
          <div className="w-full max-w-md bg-surface border-l border-outline-variant overflow-y-auto p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-newsreader text-xl font-semibold text-on-surface">Ordine #{selected.orderNumber}</h2>
              <button onClick={() => setSelected(null)} className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-1 text-sm">
              <p className="font-medium text-on-surface">{selected.customerName}</p>
              <p className="text-on-surface-variant">{selected.customerEmail}</p>
              {selected.customerPhone && <p className="text-on-surface-variant">{selected.customerPhone}</p>}
              <p className="text-on-surface-variant">{selected.shippingLine1}, {selected.shippingPostal} {selected.shippingCity}</p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant mb-2">Articoli</p>
              <div className="space-y-2">
                {selected.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-on-surface">{item.productName} × {item.quantity}</span>
                    <span className="text-on-surface-variant">{formatPrice(item.unitPrice * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-outline-variant flex justify-between font-medium text-sm">
                <span>Totale</span>
                <span>{formatPrice(selected.totalCents)}</span>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant mb-2">Aggiorna stato</p>
              <div className="flex flex-wrap gap-2">
                {ORDER_STATUSES.map((s) => (
                  <button
                    key={s}
                    disabled={updatingStatus || selected.status === s}
                    onClick={() => updateStatus(selected.id, s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors disabled:opacity-50 ${
                      selected.status === s
                        ? "bg-primary-container text-on-primary-container border-transparent"
                        : "border-outline-variant text-on-surface-variant hover:bg-surface-container"
                    }`}
                  >
                    {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
