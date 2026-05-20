"use client"

import { useState, useEffect } from "react"
import { ProductForm, ProductFormData } from "@/components/studio/ProductForm"

interface Collection { id: string; name: string }

const defaultForm: ProductFormData = {
  name: "",
  description: "",
  price: "",
  salePrice: "",
  isActive: true,
  isFeatured: false,
  collectionId: "",
  tags: [],
  colors: [],
  images: [],
}

export default function NewProductPage() {
  const [collections, setCollections] = useState<Collection[]>([])

  useEffect(() => {
    fetch("/api/collections").then((r) => r.json()).then(setCollections)
  }, [])

  async function handleSubmit(data: ProductFormData) {
    const res = await fetch("/api/products", {
      method: "POST",
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
        images: data.images
          .filter((i) => !i.uploading && !i.error && !i.url.startsWith("blob:"))
          .map((i) => ({ url: i.url, alt: i.alt })),
      }),
    })
    const json = await res.json()
    if (!res.ok) return { ok: false, error: json.error }
    return { ok: true }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="font-newsreader text-2xl font-semibold text-on-surface">Nuovo prodotto</h1>
      </div>
      <ProductForm
        initial={defaultForm}
        collections={collections}
        submitLabel="Crea prodotto"
        onSubmit={handleSubmit}
      />
    </div>
  )
}
