"use client"

export function NewsletterForm() {
  async function subscribe(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const email = (e.currentTarget.elements.namedItem("email") as HTMLInputElement).value
    await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) })
    ;(e.currentTarget.elements.namedItem("email") as HTMLInputElement).value = ""
  }

  return (
    <form onSubmit={subscribe} className="flex gap-2 max-w-sm mx-auto">
      <input
        name="email"
        type="email"
        required
        placeholder="la tua email"
        className="flex-1 px-4 py-2.5 rounded-2xl bg-white/80 text-on-surface text-sm placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <button type="submit" className="bg-primary text-on-primary px-4 py-2.5 rounded-2xl text-sm font-medium hover:bg-primary/90 transition-colors">
        Iscriviti
      </button>
    </form>
  )
}
