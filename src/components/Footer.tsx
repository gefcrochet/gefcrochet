"use client"

import Link from "next/link"
import { useCookieConsent } from "./CookieConsent"

export function Footer() {
  const { openBanner } = useCookieConsent()

  return (
    <footer className="bg-surface-container border-t border-outline-variant mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 sm:grid-cols-2 gap-8">
        <div>
          <p className="font-newsreader text-lg font-semibold text-on-surface mb-2">GeF Crochet</p>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Crochet fatto a mano con fibre naturali eticamente selezionate.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-3">Contatti</p>
          <ul className="space-y-2 text-sm text-on-surface-variant">
            <li>
              <a href="mailto:info@gefcrochet.it" className="hover:text-primary transition-colors">
                info@gefcrochet.it
              </a>
            </li>
            <li>
              <a href="https://instagram.com/gefcrochet" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                @gefcrochet
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-outline-variant px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-on-surface-variant">
          <span>© {new Date().getFullYear()}, GeF Crochet — Powered by <Link href="/ganaweb" className="hover:text-primary transition-colors">GanaWeb</Link></span>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-primary transition-colors">Informativa sulla privacy</Link>
            <button onClick={openBanner} className="hover:text-primary transition-colors cursor-pointer">Preferenze cookie</button>
          </div>
        </div>
      </div>
    </footer>
  )
}
