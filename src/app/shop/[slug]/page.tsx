"use client"

import { useState, useEffect } from "react"
import { useParams, notFound } from "next/navigation"
import Link from "next/link"
import { formatPrice } from "@/lib/utils"
import { useCart } from "@/components/CartContext"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"

interface Product {
  id: string; name: string; slug: string; description: string
  price: number; salePrice: number | null; stock: number; isActive: boolean
  category: { name: string; slug: string }
  images: { url: string; alt: string | null }[]
  tags: { name: string }[]
}

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [imgIndex, setImgIndex] = useState(0)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const { addItem } = useCart()

  useEffect(() => {
    fetch(`/api/products?active=true`)
      .then((r) => r.json())
      .then((products: Product[]) => {
        const found = products.find((p: Product) => p.slug === slug)
        setProduct(found ?? null)
        setLoading(false)
      })
  }, [slug])

  if (loading) return (
    <>
      <Header />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center text-on-surface-variant text-sm">Caricamento…</main>
      <Footer />
    </>
  )

  if (!product) return (
    <>
      <Header />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-24 text-center">
        <p className="font-newsreader text-2xl text-on-surface mb-4">Prodotto non trovato</p>
        <Link href="/shop" className="text-primary hover:underline text-sm">Torna al negozio</Link>
      </main>
      <Footer />
    </>
  )

  const displayPrice = product.salePrice ?? product.price

  function handleAddToCart() {
    addItem({
      productId: product!.id,
      name: product!.name,
      price: displayPrice,
      imageUrl: product!.images[0]?.url,
      slug: product!.slug,
      quantity: qty,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <>
      <Header />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-on-surface-variant mb-6">
          <Link href="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-primary">Negozio</Link>
          <span>/</span>
          <Link href={`/shop?category=${product.category.slug}`} className="hover:text-primary">{product.category.name}</Link>
          <span>/</span>
          <span className="text-on-surface">{product.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
          {/* Gallery */}
          <div className="space-y-3">
            <div className="aspect-square rounded-3xl bg-surface-container overflow-hidden">
              {product.images[imgIndex] ? (
                <img src={product.images[imgIndex].url} alt={product.images[imgIndex].alt ?? product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-6xl text-on-surface-variant/20">yarn</span>
                </div>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIndex(i)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${i === imgIndex ? "border-primary" : "border-transparent"}`}
                  >
                    <img src={img.url} alt={img.alt ?? ""} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="py-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-2">{product.category.name}</p>
            <h1 className="font-newsreader text-3xl lg:text-4xl font-semibold text-on-surface mb-4">{product.name}</h1>

            <div className="flex items-center gap-3 mb-6">
              <p className={`text-2xl font-semibold ${product.salePrice ? "text-error" : "text-on-surface"}`}>
                {formatPrice(displayPrice)}
              </p>
              {product.salePrice && <p className="text-lg text-on-surface-variant line-through">{formatPrice(product.price)}</p>}
            </div>

            <p className="text-on-surface-variant leading-relaxed mb-6">{product.description}</p>

            {/* Stock */}
            {product.stock <= 3 && product.stock > 0 && (
              <p className="text-sm text-amber-600 mb-4">Solo {product.stock} rimasti</p>
            )}
            {product.stock === 0 && (
              <p className="text-sm text-error mb-4">Esaurito</p>
            )}

            {/* Qty + CTA */}
            {product.stock > 0 && (
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center border border-outline-variant rounded-xl overflow-hidden">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 py-2 text-on-surface-variant hover:bg-surface-container transition-colors">
                    <span className="material-symbols-outlined text-[18px]">remove</span>
                  </button>
                  <span className="px-4 py-2 text-on-surface font-medium text-sm">{qty}</span>
                  <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} className="px-3 py-2 text-on-surface-variant hover:bg-surface-container transition-colors">
                    <span className="material-symbols-outlined text-[18px]">add</span>
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-medium text-sm transition-all ${added ? "bg-green-600 text-white" : "bg-primary text-on-primary hover:bg-primary/90"}`}
                >
                  <span className="material-symbols-outlined text-[18px]">{added ? "check" : "shopping_bag"}</span>
                  {added ? "Aggiunto!" : "Aggiungi al carrello"}
                </button>
              </div>
            )}

            {/* Tags */}
            {product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((t) => (
                  <span key={t.name} className="px-3 py-1 rounded-full bg-surface-container text-xs text-on-surface-variant">{t.name}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
