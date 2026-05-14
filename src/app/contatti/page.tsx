import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { ContactForm } from "@/components/ContactForm"

export const metadata = {
  title: "Contatti — GeF Crochet",
  description: "Scrivici per informazioni sui prodotti, ordini personalizzati o collaborazioni.",
}

export default function ContattiPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-primary-fixed py-20 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-4">Siamo qui</p>
            <h1 className="font-newsreader text-4xl lg:text-5xl font-semibold text-on-surface leading-tight mb-4">
              Contatti
            </h1>
            <p className="text-on-surface-variant leading-relaxed">
              Hai domande su un prodotto, vuoi un pezzo su misura, o semplicemente vuoi dirci ciao?
              <br />
              Scrivi — rispondo entro 24 ore.
            </p>
          </div>
        </section>

        {/* Contact content */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 grid md:grid-cols-2 gap-12">
          {/* Info */}
          <div className="space-y-8">
            <div>
              <h2 className="font-newsreader text-2xl font-semibold text-on-surface mb-4">Dove trovarci</h2>
              <div className="space-y-4 text-sm text-on-surface-variant">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary text-xl mt-0.5">mail</span>
                  <div>
                    <p className="font-medium text-on-surface">Email</p>
                    <a href="mailto:ciao@gefcrochet.it" className="hover:text-primary transition-colors">
                      ciao@gefcrochet.it
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary text-xl mt-0.5">near_me</span>
                  <div>
                    <p className="font-medium text-on-surface">Instagram</p>
                    <a
                      href="https://instagram.com/gefcrochet"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary transition-colors"
                    >
                      @gefcrochet
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary text-xl mt-0.5">schedule</span>
                  <div>
                    <p className="font-medium text-on-surface">Rispondiamo entro</p>
                    <p>24 ore nei giorni feriali</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-low rounded-2xl p-6">
              <h3 className="font-semibold text-on-surface mb-2">Ordini su misura</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Realizziamo pezzi personalizzati: colori, dimensioni e fibre su richiesta. Scrivici con la tua
                idea e ti risponderemo con disponibilità e preventivo.
              </p>
            </div>
          </div>

          {/* Form */}
          <div>
            <h2 className="font-newsreader text-2xl font-semibold text-on-surface mb-6">Scrivici un messaggio</h2>
            <ContactForm />
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
