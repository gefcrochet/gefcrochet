"use client"

import { useState } from "react"
import Link from "next/link"
import { login } from "@/app/actions/auth"

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const result = await login(new FormData(e.currentTarget))
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
          <p className="text-sm text-on-surface-variant mt-1">Accesso allo studio</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface-container-low border border-outline-variant rounded-2xl p-6 space-y-4">
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
      </div>
    </div>
  )
}
