"use client"

import Link from "next/link"
import { useCart } from "@/components/CartContext"
import { formatPrice } from "@/lib/utils"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"

export default function CartPage() {
  const { items, count, total, updateQty, removeItem } = useCart()
  const shipping = total >= 15000 ? 0 : 600

  return (
    <>
      <Header />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="font-newsreader text-3xl font-semibold text-on-surface mb-8">
          Carrello {count > 0 && <span className="text-on-surface-variant font-normal text-xl">({count})</span>}
        </h1>

        {items.length === 0 ? (
          <div className="py-24 text-center">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant/30 mb-4 block">shopping_bag</span>
            <p className="text-on-surface-variant mb-6">Il tuo carrello è vuoto.</p>
            <Link href="/shop" className="bg-primary text-on-primary px-6 py-3 rounded-2xl font-medium hover:bg-primary/90 transition-colors">
              Vai al negozio
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-4 bg-surface-container-low border border-outline-variant rounded-2xl p-4">
                  <div className="w-20 h-20 rounded-xl bg-surface-container overflow-hidden shrink-0">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-2xl text-on-surface-variant/30">yarn</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/shop/${item.slug}`} className="font-medium text-on-surface hover:text-primary transition-colors text-sm">
                      {item.name}
                    </Link>
                    <p className="text-sm text-on-surface-variant mt-0.5">{formatPrice(item.price)} cad.</p>
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center border border-outline-variant rounded-lg overflow-hidden">
                        <button onClick={() => updateQty(item.productId, item.quantity - 1)} className="px-2 py-1 text-on-surface-variant hover:bg-surface-container">
                          <span className="material-symbols-outlined text-[16px]">remove</span>
                        </button>
                        <span className="px-3 py-1 text-sm text-on-surface">{item.quantity}</span>
                        <button onClick={() => updateQty(item.productId, item.quantity + 1)} className="px-2 py-1 text-on-surface-variant hover:bg-surface-container">
                          <span className="material-symbols-outlined text-[16px]">add</span>
                        </button>
                      </div>
                      <button onClick={() => removeItem(item.productId)} className="text-xs text-error hover:underline">
                        Rimuovi
                      </button>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold text-on-surface">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-5 space-y-4 sticky top-20">
                <h2 className="font-semibold text-on-surface">Riepilogo ordine</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Subtotale</span><span>{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Spedizione</span>
                    <span>{shipping === 0 ? "Gratuita" : formatPrice(shipping)}</span>
                  </div>
                  {shipping === 0 && (
                    <p className="text-xs text-primary">Spedizione gratuita sopra i €150</p>
                  )}
                </div>
                <div className="border-t border-outline-variant pt-3 flex justify-between font-semibold text-on-surface">
                  <span>Totale</span>
                  <span>{formatPrice(total + shipping)}</span>
                </div>
                <Link
                  href="/contatti"
                  className="w-full bg-primary text-on-primary py-3 rounded-2xl font-medium hover:bg-primary/90 transition-colors text-center block"
                >
                  Invia richiesta d&apos;ordine
                </Link>
                <p className="text-xs text-center text-on-surface-variant">
                  Ti contatteremo per confermare e concordare la spedizione
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}
