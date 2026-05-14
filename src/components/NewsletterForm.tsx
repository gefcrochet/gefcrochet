"use client"

import { useState } from "react"

export function NewsletterForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")

  async function subscribe(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus("loading")
    const email = (e.currentTarget.elements.namedItem("email") as HTMLInputElement).value
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        setStatus("success")
        ;(e.currentTarget.elements.namedItem("email") as HTMLInputElement).value = ""
      } else {
        setStatus("error")
      }
    } catch {
      setStatus("error")
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-2 text-on-primary">
        <span className="material-symbols-outlined text-3xl">check_circle</span>
        <p className="text-sm font-medium">Benvenuta! Ti abbiamo aggiunta alla lista.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <form onSubmit={subscribe} className="flex gap-2 max-w-sm mx-auto">
        <input
          name="email"
          type="email"
          required
          placeholder="la tua email"
          className="flex-1 px-4 py-2.5 rounded-2xl bg-white/80 text-on-surface text-sm placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-white"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="bg-on-primary text-primary px-4 py-2.5 rounded-2xl text-sm font-semibold hover:bg-on-primary/90 transition-colors disabled:opacity-60"
        >
          {status === "loading" ? "…" : "Iscriviti"}
        </button>
      </form>
      {status === "error" && (
        <p className="text-on-primary/80 text-xs text-center">Qualcosa è andato storto. Riprova.</p>
      )}
    </div>
  )
}
