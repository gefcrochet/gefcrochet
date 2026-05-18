"use client"

import { useState, useRef } from "react"
import { formatPrice } from "@/lib/utils"
import { useCart } from "@/components/CartContext"

interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  salePrice: number | null
  category: { name: string; slug: string } | null
  images: { url: string; alt: string | null }[]
  tags: { name: string }[]
}

export function ProductDetail({ product }: { product: Product }) {
  const [imgIndex, setImgIndex] = useState(0)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const addedTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { addItem } = useCart()

  const displayPrice = product.salePrice ?? product.price

  function handleAddToCart() {
    addItem({
      productId: product.id,
      name: product.name,
      price: displayPrice,
      imageUrl: product.images[0]?.url,
      slug: product.slug,
      quantity: qty,
    })
    setAdded(true)
    if (addedTimer.current) clearTimeout(addedTimer.current)
    addedTimer.current = setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
      {/* Gallery */}
      <div className="space-y-3">
        <div className="aspect-square rounded-3xl bg-surface-container overflow-hidden">
          {product.images[imgIndex] ? (
            <img
              src={product.images[imgIndex].url}
              alt={product.images[imgIndex].alt ?? product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="material-symbols-outlined text-6xl text-on-surface-variant/20">yarn</span>
            </div>
          )}
        </div>
        {product.images.length > 1 && (
          <div className="flex gap-2 flex-wrap">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setImgIndex(i)}
                className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${
                  i === imgIndex ? "border-primary" : "border-transparent hover:border-outline-variant"
                }`}
              >
                <img src={img.url} alt={img.alt ?? ""} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Details */}
      <div className="py-2">
        {product.category && (
          <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-2">
            {product.category.name}
          </p>
        )}
        <h1 className="font-newsreader text-3xl lg:text-4xl font-semibold text-on-surface mb-4">
          {product.name}
        </h1>

        <div className="flex items-center gap-3 mb-6">
          <p className={`text-2xl font-semibold ${product.salePrice ? "text-error" : "text-on-surface"}`}>
            {formatPrice(displayPrice)}
          </p>
          {product.salePrice && (
            <p className="text-lg text-on-surface-variant line-through">{formatPrice(product.price)}</p>
          )}
        </div>

        <p className="text-on-surface-variant leading-relaxed mb-6">{product.description}</p>

        {/* Qty + CTA */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center border border-outline-variant rounded-xl overflow-hidden">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="px-3 py-2 text-on-surface-variant hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">remove</span>
            </button>
            <span className="px-4 py-2 text-on-surface font-medium text-sm">{qty}</span>
            <button
              onClick={() => setQty((q) => q + 1)}
              className="px-3 py-2 text-on-surface-variant hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
            </button>
          </div>
          <button
            onClick={handleAddToCart}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-medium text-sm transition-all ${
              added ? "bg-green-600 text-white" : "bg-primary text-on-primary hover:bg-primary/90"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{added ? "check" : "shopping_bag"}</span>
            {added ? "Aggiunto!" : "Aggiungi al carrello"}
          </button>
        </div>

        {/* Tags */}
        {product.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {product.tags.map((t) => (
              <span
                key={t.name}
                className="px-3 py-1 rounded-full bg-surface-container text-xs text-on-surface-variant"
              >
                {t.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
