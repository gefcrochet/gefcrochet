"use client"

import { useState, useRef } from "react"

interface Props {
  value: string
  onChange: (value: string) => void
  context: string
  children: React.ReactNode
}

export function AiWritingBar({ value, onChange, context, children }: Props) {
  const [open, setOpen] = useState(false)
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function generate() {
    const trimmed = prompt.trim()
    if (!trimmed) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: trimmed, context, currentValue: value }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Errore sconosciuto")
      onChange(data.text)
      setPrompt("")
      setOpen(false)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  function toggle() {
    setOpen((o) => {
      if (!o) setTimeout(() => inputRef.current?.focus(), 50)
      return !o
    })
    setError(null)
  }

  return (
    <div className="space-y-1.5">
      <div className="relative">
        {children}
        {loading && (
          <div className="absolute inset-0 bg-surface/70 rounded-lg flex items-center justify-center pointer-events-none">
            <span className="text-xs text-on-surface-variant animate-pulse">Generazione in corso…</span>
          </div>
        )}
        <button
          type="button"
          onClick={toggle}
          title="Scrivi con l'AI"
          className={`absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${
            open ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant hover:bg-primary/10 hover:text-primary"
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
        </button>
      </div>

      {open && (
        <div className="flex items-center gap-2 bg-surface-container-low border border-outline-variant rounded-xl px-3 py-2">
          <span className="material-symbols-outlined text-[16px] text-primary flex-shrink-0">auto_awesome</span>
          <input
            ref={inputRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); generate() } if (e.key === "Escape") setOpen(false) }}
            placeholder="Descrivi cosa vuoi scrivere…"
            disabled={loading}
            className="flex-1 bg-transparent text-sm text-on-surface outline-none placeholder:text-on-surface-variant/50 disabled:opacity-50"
          />
          <button
            type="button"
            onClick={generate}
            disabled={loading || !prompt.trim()}
            className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg bg-primary text-on-primary disabled:opacity-40 hover:bg-primary/90 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">
              {loading ? "hourglass_empty" : "send"}
            </span>
          </button>
        </div>
      )}

      {error && (
        <p className="text-xs text-error px-1">{error}</p>
      )}
    </div>
  )
}
