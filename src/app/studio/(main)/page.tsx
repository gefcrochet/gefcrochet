import { formatPrice } from "@/lib/utils"
import { StatusBadge } from "@/components/StatusBadge"
import Link from "next/link"

interface DashboardData {
  totalOrders: number
  recentOrders: number
  totalRevenueCents: number
  recentRevenueCents: number
  processingCount: number
  lowStockProducts: { id: string; name: string; stock: number; sku: string | null }[]
  recentOrdersList: { id: string; orderNumber: number; customerName: string; totalCents: number; status: string; createdAt: string }[]
  dailyRevenue: { date: string; cents: number }[]
}

async function getDashboard(): Promise<DashboardData | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/api/analytics`, {
      cache: "no-store",
      headers: { Cookie: "" },
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export default async function DashboardPage() {
  const data = await getDashboard()

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="font-newsreader text-2xl font-semibold text-on-surface">Dashboard</h1>
        <p className="text-sm text-on-surface-variant mt-0.5">Benvenuta nello Studio</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Ordini totali", value: data?.totalOrders ?? "—", sub: `${data?.recentOrders ?? 0} negli ultimi 30gg` },
          { label: "Fatturato totale", value: data ? formatPrice(data.totalRevenueCents) : "—", sub: `${data ? formatPrice(data.recentRevenueCents) : "—"} negli ultimi 30gg` },
          { label: "Da evadere", value: data?.processingCount ?? "—", sub: "ordini in lavorazione" },
          { label: "Scorte basse", value: data?.lowStockProducts.length ?? "—", sub: "prodotti sotto soglia" },
        ].map(({ label, value, sub }) => (
          <div key={label} className="bg-surface-container-low border border-outline-variant rounded-2xl p-4">
            <p className="text-xs text-on-surface-variant font-medium uppercase tracking-wide">{label}</p>
            <p className="text-2xl font-semibold text-on-surface mt-1">{value}</p>
            <p className="text-xs text-on-surface-variant mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div className="bg-surface-container-low border border-outline-variant rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant">
            <p className="font-medium text-on-surface text-sm">Ordini recenti</p>
            <Link href="/studio/orders" className="text-xs text-primary hover:underline">Vedi tutti</Link>
          </div>
          <div className="divide-y divide-outline-variant">
            {data?.recentOrdersList.length ? data.recentOrdersList.map((o) => (
              <div key={o.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-on-surface">#{o.orderNumber} — {o.customerName}</p>
                  <p className="text-xs text-on-surface-variant">{new Date(o.createdAt).toLocaleDateString("it-IT")}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={o.status} />
                  <span className="text-sm font-medium text-on-surface">{formatPrice(o.totalCents)}</span>
                </div>
              </div>
            )) : (
              <p className="px-5 py-8 text-sm text-on-surface-variant text-center">Nessun ordine ancora</p>
            )}
          </div>
        </div>

        {/* Low stock */}
        <div className="bg-surface-container-low border border-outline-variant rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant">
            <p className="font-medium text-on-surface text-sm">Scorte basse</p>
            <Link href="/studio/products" className="text-xs text-primary hover:underline">Gestisci</Link>
          </div>
          <div className="divide-y divide-outline-variant">
            {data?.lowStockProducts.length ? data.lowStockProducts.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-on-surface">{p.name}</p>
                  {p.sku && <p className="text-xs text-on-surface-variant">SKU {p.sku}</p>}
                </div>
                <span className={`text-sm font-semibold ${p.stock === 0 ? "text-error" : "text-amber-600"}`}>
                  {p.stock} rimasti
                </span>
              </div>
            )) : (
              <p className="px-5 py-8 text-sm text-on-surface-variant text-center">Tutte le scorte sono ok</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <Link href="/studio/products/new" className="inline-flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Nuovo prodotto
        </Link>
        <Link href="/studio/orders" className="inline-flex items-center gap-2 bg-surface-container border border-outline-variant text-on-surface px-4 py-2 rounded-xl text-sm font-medium hover:bg-surface-container-high transition-colors">
          <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
          Gestisci ordini
        </Link>
      </div>
    </div>
  )
}
