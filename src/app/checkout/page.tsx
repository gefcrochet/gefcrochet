"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useCart } from "@/components/CartContext"
import { formatPrice } from "@/lib/utils"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart()
  const shipping = total >= 15000 ? 0 : 600
  const grandTotal = total + shipping

  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "" })
  const [captcha, setCaptcha] = useState<{ question: string; token: string } | null>(null)
  const [captchaAnswer, setCaptchaAnswer] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [orderNumber, setOrderNumber] = useState<number | null>(null)

  // Load captcha challenge on mount
  useEffect(() => {
    fetch("/api/captcha")
      .then((r) => r.json())
      .then(setCaptcha)
      .catch(() => {})
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function refreshCaptcha() {
    setCaptchaAnswer("")
    const r = await fetch("/api/captcha")
    const data = await r.json()
    setCaptcha(data)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (items.length === 0) return

    setLoading(true)
    setError("")

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        items,
        subtotalCents: total,
        shippingCents: shipping,
        totalCents: grandTotal,
        captchaToken: captcha?.token ?? "",
        captchaAnswer: captchaAnswer.trim(),
      }),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? "Si è verificato un errore. Riprova.")
      // Refresh captcha after failed attempt
      refreshCaptcha()
      setLoading(false)
      return
    }

    clearCart()
    setOrderNumber(data.order.orderNumber)
    setLoading(false)
  }

  /* ── Ordine confermato ── */
  if (orderNumber !== null) {
    return (
      <>
        <Header />
        <main className="flex-1 flex items-center justify-center px-4 py-20">
          <div className="max-w-md w-full text-center space-y-5">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <h1 className="font-newsreader text-3xl font-semibold text-on-surface">
              Richiesta inviata!
            </h1>
            <p className="text-on-surface-variant">
              Abbiamo ricevuto la tua richiesta d&apos;ordine <strong>#{orderNumber}</strong>.<br />
              Ti contatteremo a breve per confermare e concordare la spedizione.
            </p>
            <Link href="/shop" className="inline-block bg-primary text-on-primary px-6 py-3 rounded-2xl font-medium hover:bg-primary/90 transition-colors">
              Continua a esplorare
            </Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  /* ── Carrello vuoto ── */
  if (items.length === 0) {
    return (
      <>
        <Header />
        <main className="flex-1 flex items-center justify-center px-4 py-20">
          <div className="text-center space-y-4">
            <p className="text-on-surface-variant">Il tuo carrello è vuoto.</p>
            <Link href="/shop" className="inline-block bg-primary text-on-primary px-6 py-3 rounded-2xl font-medium hover:bg-primary/90 transition-colors">
              Vai al negozio
            </Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-10 w-full">
        <Link href="/cart" className="inline-flex items-center gap-1 text-sm text-on-surface-variant hover:text-primary transition-colors mb-6">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Torna al carrello
        </Link>

        <h1 className="font-newsreader text-3xl font-semibold text-on-surface mb-8">
          Completa la richiesta
        </h1>

        <div className="grid lg:grid-cols-2 gap-8 items-start">

          {/* ── Form dati cliente ── */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="font-semibold text-on-surface mb-1">I tuoi dati</h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-on-surface mb-1">Nome *</label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  autoComplete="given-name"
                  value={form.firstName}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-on-surface mb-1">Cognome *</label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  autoComplete="family-name"
                  value={form.lastName}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-on-surface mb-1">Email *</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-on-surface mb-1">
                Numero di cellulare
                <span className="text-on-surface-variant font-normal ml-1">(opzionale)</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="+39 333 1234567"
                className="w-full px-3 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-on-surface-variant/50"
              />
            </div>

            {/* CAPTCHA */}
            <div className="bg-surface-container-low border border-outline-variant rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="captcha" className="text-sm font-medium text-on-surface">
                  Verifica anti-spam: {captcha ? captcha.question : "Caricamento…"}
                </label>
                <button
                  type="button"
                  onClick={refreshCaptcha}
                  className="text-xs text-primary hover:underline"
                  title="Genera nuova domanda"
                >
                  Cambia
                </button>
              </div>
              <input
                id="captcha"
                type="number"
                inputMode="numeric"
                required
                value={captchaAnswer}
                onChange={(e) => setCaptchaAnswer(e.target.value)}
                placeholder="Risposta"
                className="w-28 px-3 py-2 rounded-lg border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {error && (
              <p className="text-sm text-error bg-error/10 rounded-xl px-4 py-3">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !captcha}
              className="w-full bg-primary text-on-primary py-3.5 rounded-2xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Invio in corso…" : "Conferma richiesta d'ordine"}
            </button>

            <p className="text-xs text-center text-on-surface-variant">
              Ti contatteremo per confermare e concordare la spedizione.
            </p>
          </form>

          {/* ── Riepilogo ordine ── */}
          <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-5 space-y-4 lg:sticky lg:top-24">
            <h2 className="font-semibold text-on-surface">Riepilogo ordine</h2>

            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-3 items-center">
                  <div className="w-12 h-12 rounded-lg bg-surface-container overflow-hidden shrink-0">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-lg text-on-surface-variant/30">yarn</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-on-surface font-medium truncate">{item.name}</p>
                    <p className="text-xs text-on-surface-variant">× {item.quantity}</p>
                  </div>
                  <p className="text-sm font-medium text-on-surface shrink-0">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-outline-variant pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-on-surface-variant">
                <span>Subtotale</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <span>Spedizione</span>
                <span>{shipping === 0 ? "Gratuita" : formatPrice(shipping)}</span>
              </div>
              {shipping === 0 && (
                <p className="text-xs text-primary">Spedizione gratuita sopra i €150</p>
              )}
              <div className="flex justify-between font-semibold text-on-surface pt-2 border-t border-outline-variant">
                <span>Totale</span>
                <span>{formatPrice(grandTotal)}</span>
              </div>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </>
  )
}
