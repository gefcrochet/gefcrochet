import Link from "next/link"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"

export default function IscrizioneConfermataPage() {
  return (
    <>
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-md w-full text-center space-y-5">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              mark_email_read
            </span>
          </div>
          <h1 className="font-newsreader text-3xl font-semibold text-on-surface">
            Iscrizione confermata!
          </h1>
          <p className="text-on-surface-variant leading-relaxed">
            Benvenuta nella newsletter di GeF Crochet. 🌿<br />
            Riceverai le novità sulle nuove creazioni direttamente nella tua casella.
          </p>
          <Link
            href="/shop"
            className="inline-block bg-primary text-on-primary px-6 py-3 rounded-2xl font-medium hover:bg-primary/90 transition-colors"
          >
            Scopri le creazioni
          </Link>
        </div>
      </main>
      <Footer />
    </>
  )
}
