"use client"

import { useState } from "react"
import Link from "next/link"
import { requestPasswordReset } from "@/app/actions/auth"

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const result = await requestPasswordReset(new FormData(e.currentTarget))
    if (result?.error) {
      setError(result.error)
    } else if (result?.success) {
      setSuccess(true)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="font-newsreader text-2xl font-semibold text-on-surface">GeF Crochet</p>
          <p className="text-sm text-on-surface-variant mt-1">Recupero password</p>
        </div>

        {success ? (
          <div className="bg-primary-container text-on-primary-container rounded-2xl p-6 text-center space-y-4">
            <span className="material-symbols-outlined text-4xl">mark_email_read</span>
            <p className="text-sm">Se l&apos;indirizzo email è registrato, riceverai a breve un link per impostare una nuova password.</p>
            <div className="pt-4">
              <Link href="/studio/login" className="text-sm font-semibold hover:underline">
                Torna al login
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-surface-container-low border border-outline-variant rounded-2xl p-6 space-y-4">
            <p className="text-sm text-on-surface-variant mb-4">
              Inserisci l&apos;indirizzo email associato al tuo account. Ti invieremo un link per reimpostare la password.
            </p>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5" htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                placeholder="info@gefcrochet.it"
              />
            </div>

            {error && (
              <p className="text-sm text-error bg-error-container rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-on-primary py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {loading ? "Invio in corso…" : "Invia link di recupero"}
            </button>
            
            <div className="text-center mt-4">
              <Link href="/studio/login" className="text-sm text-on-surface-variant hover:text-primary transition-colors">
                Torna al login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
