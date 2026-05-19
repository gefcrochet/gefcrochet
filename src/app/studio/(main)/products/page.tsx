"use client"

import { useState, useEffect } from "react"
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

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const params = new URLSearchParams({ active: "false" })
      if (search) params.set("search", search)
      const res = await fetch(`/api/products?${params}`)
      if (res.ok) setProducts(await res.json())
      setLoading(false)
    }
    load()
  }, [search])

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
          <p className="text-sm text-on-surface-variant">{products.length} prodotti</p>
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
    </div>
  )
}
