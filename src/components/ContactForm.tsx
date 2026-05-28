"use client"

import { useState, useCallback } from "react"
import { TurnstileWidget } from "@/components/TurnstileWidget"

export function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" })
  const [turnstileToken, setTurnstileToken] = useState("")
  const [turnstileKey, setTurnstileKey] = useState(0)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleVerify = useCallback((token: string) => setTurnstileToken(token), [])
  const handleExpire = useCallback(() => setTurnstileToken(""), [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!turnstileToken) {
      setError("Completa la verifica anti-spam.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, turnstileToken }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Si è verificato un errore. Riprova.")
        // Reset Turnstile dopo un fallimento
        setTurnstileToken("")
        setTurnstileKey((k) => k + 1)
      } else {
        setSuccess(true)
      }
    } catch {
      setError("Errore di rete. Controlla la connessione e riprova.")
      setTurnstileKey((k) => k + 1)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
          <span
            className="material-symbols-outlined text-primary text-3xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            check_circle
          </span>
        </div>
        <h3 className="font-semibold text-on-surface text-lg">Messaggio inviato!</h3>
        <p className="text-sm text-on-surface-variant">
          Grazie per averci scritto. Ti risponderemo entro 24 ore.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-on-surface mb-1.5">Nome</label>
        <input
          type="text"
          name="name"
          required
          value={form.name}
          onChange={handleChange}
          placeholder="Il tuo nome"
          className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary placeholder-on-surface-variant/50"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-on-surface mb-1.5">Email</label>
        <input
          type="email"
          name="email"
          required
          value={form.email}
          onChange={handleChange}
          placeholder="tua@email.it"
          className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary placeholder-on-surface-variant/50"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-on-surface mb-1.5">Messaggio</label>
        <textarea
          name="message"
          required
          rows={5}
          value={form.message}
          onChange={handleChange}
          placeholder="Scrivi qui il tuo messaggio…"
          className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary placeholder-on-surface-variant/50 resize-none"
        />
      </div>

      {/* Cloudflare Turnstile */}
      <TurnstileWidget
        key={turnstileKey}
        onVerify={handleVerify}
        onExpire={handleExpire}
      />

      {error && (
        <p className="text-sm text-error bg-error/10 rounded-xl px-4 py-3">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading || !turnstileToken}
        className="w-full bg-primary text-on-primary py-3 rounded-xl font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? "Invio in corso…" : "Invia messaggio"}
      </button>
      <p className="text-xs text-on-surface-variant text-center">
        Oppure scrivici direttamente a{" "}
        <a href="mailto:info@gefcrochet.it" className="text-primary hover:underline">
          info@gefcrochet.it
        </a>
      </p>
    </form>
  )
}
