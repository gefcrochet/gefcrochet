import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-surface-container border-t border-outline-variant mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div>
          <p className="font-newsreader text-lg font-semibold text-on-surface mb-2">GeF Crochet</p>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Crochet fatto a mano con fibre naturali eticamente selezionate.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-3">Esplora</p>
          <ul className="space-y-2 text-sm text-on-surface-variant">
            <li><Link href="/shop" className="hover:text-primary transition-colors">Negozio</Link></li>
            <li><Link href="/patterns" className="hover:text-primary transition-colors">Cartamodelli</Link></li>
            <li><Link href="/#storia" className="hover:text-primary transition-colors">La nostra storia</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-3">Contatti</p>
          <ul className="space-y-2 text-sm text-on-surface-variant">
            <li><a href="mailto:ciao@gefcrochet.it" className="hover:text-primary transition-colors">ciao@gefcrochet.it</a></li>
            <li><a href="https://instagram.com/gefcrochet" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">@gefcrochet</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-outline-variant px-4 sm:px-6 py-4 text-center text-xs text-on-surface-variant">
        © {new Date().getFullYear()} GeF Crochet — fatto con cura artigianale
      </div>
    </footer>
  )
}
