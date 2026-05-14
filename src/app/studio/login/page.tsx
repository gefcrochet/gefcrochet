"use client"

import { useState } from "react"
import Link from "next/link"
import { login, loginWithTotp } from "@/app/actions/auth"

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [tempToken, setTempToken] = useState<string | null>(null)

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const result = await login(new FormData(e.currentTarget))
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else if (result?.requiresTotp && result.tempToken) {
      setTempToken(result.tempToken)
      setLoading(false)
    }
  }

  async function handleTotp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const result = await loginWithTotp(new FormData(e.currentTarget))
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="font-newsreader text-2xl font-semibold text-on-surface">GeF Crochet</p>
          <p className="text-sm text-on-surface-variant mt-1">
            {tempToken ? "Verifica autenticatore" : "Accesso allo studio"}
          </p>
        </div>

        {tempToken ? (
          <form onSubmit={handleTotp} className="bg-surface-container-low border border-outline-variant rounded-2xl p-6 space-y-4">
            <input type="hidden" name="tempToken" value={tempToken} />
            <p className="text-sm text-on-surface-variant">
              Inserisci il codice a 6 cifre dall&apos;app autenticatore.
            </p>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5" htmlFor="code">Codice OTP</label>
              <input
                id="code"
                name="code"
                type="text"
                inputMode="numeric"
                pattern="[0-9 ]{6,7}"
                required
                autoFocus
                autoComplete="one-time-code"
                className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm tracking-widest text-center"
                placeholder="000000"
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
              {loading ? "Verifica…" : "Verifica"}
            </button>

            <div className="text-center mt-2">
              <button
                type="button"
                onClick={() => { setTempToken(null); setError(null) }}
                className="text-sm text-on-surface-variant hover:text-primary transition-colors"
              >
                Torna al login
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="bg-surface-container-low border border-outline-variant rounded-2xl p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5" htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                placeholder="info@gefcrochet.it"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5" htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                placeholder="••••••••"
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
              {loading ? "Accesso in corso…" : "Accedi"}
            </button>

            <div className="text-center mt-4">
              <Link href="/studio/login/forgot" className="text-sm text-primary hover:underline">
                Hai dimenticato la password?
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
