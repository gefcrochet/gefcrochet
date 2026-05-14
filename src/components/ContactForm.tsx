"use client"

export function ContactForm() {
  return (
    <form
      action="mailto:gef@floraandfiber.it"
      method="post"
      encType="text/plain"
      className="space-y-4"
    >
      <div>
        <label className="block text-sm font-medium text-on-surface mb-1.5">Nome</label>
        <input
          type="text"
          name="nome"
          required
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
          placeholder="tua@email.it"
          className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary placeholder-on-surface-variant/50"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-on-surface mb-1.5">Messaggio</label>
        <textarea
          name="messaggio"
          required
          rows={5}
          placeholder="Scrivi qui il tuo messaggio…"
          className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary placeholder-on-surface-variant/50 resize-none"
        />
      </div>
      <button
        type="submit"
        className="w-full bg-primary text-on-primary py-3 rounded-xl font-medium text-sm hover:bg-primary/90 transition-colors"
      >
        Invia messaggio
      </button>
      <p className="text-xs text-on-surface-variant text-center">
        Oppure scrivici direttamente a{" "}
        <a href="mailto:gef@floraandfiber.it" className="text-primary hover:underline">
          gef@floraandfiber.it
        </a>
      </p>
    </form>
  )
}
