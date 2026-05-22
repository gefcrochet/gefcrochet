import Link from "next/link"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"

export default function DisiscrivetiPage() {
  return (
    <>
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-md w-full text-center space-y-5">
          <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-on-surface-variant text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              mail_off
            </span>
          </div>
          <h1 className="font-newsreader text-3xl font-semibold text-on-surface">
            Disiscrizione effettuata
          </h1>
          <p className="text-on-surface-variant leading-relaxed">
            Hai rimosso la tua email dalla nostra newsletter.<br />
            Ci dispiace vederti andare via! 🌿
          </p>
          <p className="text-sm text-on-surface-variant">
            Puoi reiscriverti in qualsiasi momento dal nostro sito.
          </p>
          <Link
            href="/"
            className="inline-block bg-primary text-on-primary px-6 py-3 rounded-2xl font-medium hover:bg-primary/90 transition-colors"
          >
            Torna alla home
          </Link>
        </div>
      </main>
      <Footer />
    </>
  )
}
