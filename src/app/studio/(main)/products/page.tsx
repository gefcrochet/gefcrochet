"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { formatPrice } from "@/lib/utils"
import { Toggle } from "@/components/studio/Toggle"

interface Product {
  id: string
  name: string
  price: number
  salePrice: number | null
  isActive: boolean
  isFeatured: boolean
  category: { name: string } | null
  collections: { collection: { name: string } }[]
  images: { url: string }[]
}

const PAGE_SIZE = 10

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const load = useCallback(async (p: number, q: string) => {
    setLoading(true)
    const params = new URLSearchParams({ active: "false", page: String(p), limit: String(PAGE_SIZE) })
    if (q) params.set("search", q)
    const res = await fetch(`/api/products?${params}`)
    if (res.ok) {
      const data = await res.json()
      setProducts(data.products)
      setTotal(data.total)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    setPage(1)
    load(1, search)
  }, [search, load])

  function goToPage(p: number) {
    setPage(p)
    load(p, search)
  }

  async function toggleActive(id: string, isActive: boolean) {
    await fetch(`/api/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    })
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, isActive: !isActive } : p)))
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-newsreader text-2xl font-semibold text-on-surface">Prodotti</h1>
          <p className="text-sm text-on-surface-variant">{total} prodotti</p>
        </div>
        <Link
          href="/studio/products/new"
          className="inline-flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Nuovo prodotto
        </Link>
      </div>

      <div className="mb-5">
        <input
          type="search"
          placeholder="Cerca prodotto…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-xs px-3 py-2 rounded-lg border border-outline-variant bg-surface text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="bg-surface-container-low border border-outline-variant rounded-2xl overflow-hidden">
        {loading ? (
          <p className="py-12 text-center text-sm text-on-surface-variant">Caricamento…</p>
        ) : products.length === 0 ? (
          <p className="py-12 text-center text-sm text-on-surface-variant">Nessun prodotto trovato</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-surface-container border-b border-outline-variant">
              <tr>
                {["Prodotto", "Collezione", "Prezzo", "Stato", ""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-on-surface-variant uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-surface-container/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.images[0] ? (
                        <img src={p.images[0].url} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-surface-container" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center">
                          <span className="material-symbols-outlined text-[18px] text-on-surface-variant">image</span>
                        </div>
                      )}
                      <p className="font-medium text-on-surface">{p.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant">{p.collections[0]?.collection.name ?? p.category?.name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-on-surface">{formatPrice(p.price)}</p>
                    {p.salePrice && <p className="text-xs text-error">{formatPrice(p.salePrice)}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <Toggle
                      checked={p.isActive}
                      onChange={() => toggleActive(p.id, p.isActive)}
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/studio/products/${p.id}`} className="text-primary text-xs font-medium hover:underline">
                      Modifica
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Paginazione */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-on-surface-variant">
            Pagina {page} di {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page === 1}
              className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Pagina precedente"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => goToPage(p)}
                className={[
                  "min-w-[32px] h-8 px-2 rounded-lg text-sm font-medium transition-colors",
                  p === page
                    ? "bg-primary text-on-primary"
                    : "text-on-surface-variant hover:bg-surface-container",
                ].join(" ")}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => goToPage(page + 1)}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Pagina successiva"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
