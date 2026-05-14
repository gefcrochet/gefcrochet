"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useCart } from "@/components/CartContext"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"

export default function CheckoutSuccessPage() {
  const { clearCart } = useCart()

  useEffect(() => {
    clearCart()
  }, [clearCart])

  return (
    <>
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-24">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-primary-container rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-3xl text-primary fill-icon">check_circle</span>
          </div>
          <h1 className="font-newsreader text-3xl font-semibold text-on-surface mb-3">Ordine ricevuto!</h1>
          <p className="text-on-surface-variant mb-8">
            Grazie per il tuo acquisto. Riceverai una conferma via email. Ogni pezzo viene lavorato a mano con cura — riceverai aggiornamenti sullo stato della spedizione.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/shop" className="bg-primary text-on-primary px-6 py-3 rounded-2xl font-medium hover:bg-primary/90 transition-colors">
              Continua a fare acquisti
            </Link>
            <Link href="/" className="border border-outline-variant text-on-surface-variant px-6 py-3 rounded-2xl font-medium hover:bg-surface-container transition-colors">
              Torna alla home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
