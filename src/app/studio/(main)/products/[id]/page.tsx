"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { ProductForm, ProductFormData } from "@/components/studio/ProductForm"

interface Collection { id: string; name: string }

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>()
  const [initial, setInitial] = useState<ProductFormData | null>(null)
  const [collections, setCollections] = useState<Collection[]>([])

  useEffect(() => {
    Promise.all([
      fetch(`/api/products/${id}`).then((r) => r.json()),
      fetch("/api/collections").then((r) => r.json()),
    ]).then(([product, cols]) => {
      setCollections(cols)
      const colors: string[] = (() => {
        try { return JSON.parse(product.colors ?? "[]") } catch { return [] }
      })()
      setInitial({
        name: product.name,
        description: product.description,
        price: product.price / 100,
        salePrice: product.salePrice != null ? product.salePrice / 100 : "",
        isActive: product.isActive,
        isFeatured: product.isFeatured,
        collectionId: product.collections?.[0]?.collectionId ?? "",
        tags: product.tags.map((t: { name: string }) => t.name),
        colors,
        images: product.images.map((img: { url: string; alt: string | null }, i: number) => ({
          id: `existing-${i}`,
          url: img.url,
          alt: img.alt ?? "",
        })),
      })
    })
  }, [id])

  async function handleSubmit(data: ProductFormData) {
    const res = await fetch(`/api/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name,
        description: data.description,
        price: Math.round(Number(data.price) * 100),
        salePrice: data.salePrice !== "" ? Math.round(Number(data.salePrice) * 100) : null,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        collectionId: data.collectionId || null,
        tags: data.tags,
        colors: data.colors,
        images: data.images.filter((i) => !i.uploading).map((i) => ({ url: i.url, alt: i.alt })),
      }),
    })
    const json = await res.json()
    if (!res.ok) return { ok: false, error: json.error }
    return { ok: true }
  }

  async function handleDelete() {
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.error ?? "Errore durante l'eliminazione")
    }
  }

  if (!initial) return <div className="p-6 text-sm text-on-surface-variant">Caricamento…</div>

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="font-newsreader text-2xl font-semibold text-on-surface">Modifica prodotto</h1>
      </div>
      <ProductForm
        initial={initial}
        collections={collections}
        submitLabel="Salva modifiche"
        onSubmit={handleSubmit}
        deleteAction={handleDelete}
      />
    </div>
  )
}
