"use client"

import { useState, use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { resetPassword } from "@/app/actions/auth"

export default function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const router = useRouter()
  const { token } = use(searchParams)
  
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  if (!token) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-error mb-4">Token mancante o non valido.</p>
          <Link href="/studio/login" className="text-primary hover:underline text-sm">Torna al login</Link>
        </div>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const result = await resetPassword(new FormData(e.currentTarget))
    if (result?.error) {
      setError(result.error)
    } else if (result?.success) {
      setSuccess(true)
      setTimeout(() => {
        router.push("/studio/login")
      }, 3000)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="font-newsreader text-2xl font-semibold text-on-surface">GeF Crochet</p>
          <p className="text-sm text-on-surface-variant mt-1">Imposta nuova password</p>
        </div>

        {success ? (
          <div className="bg-primary-container text-on-primary-container rounded-2xl p-6 text-center space-y-4">
            <span className="material-symbols-outlined text-4xl">check_circle</span>
            <p className="text-sm font-medium">Password aggiornata con successo!</p>
            <p className="text-xs">Reindirizzamento al login in corso...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-surface-container-low border border-outline-variant rounded-2xl p-6 space-y-4">
            <input type="hidden" name="token" value={token} />
            
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5" htmlFor="password">Nuova Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                placeholder="Almeno 8 caratteri"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1.5" htmlFor="confirm">Conferma Password</label>
              <input
                id="confirm"
                name="confirm"
                type="password"
                required
                minLength={8}
                className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                placeholder="Ripeti la password"
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
              {loading ? "Salvataggio…" : "Salva nuova password"}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
