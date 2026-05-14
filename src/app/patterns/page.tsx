import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"

const patterns = [
  {
    id: "1",
    title: "Borsa Tote Botanical",
    difficulty: "Intermedio",
    description: "Una borsa tote spaziosa con motivi botanici in rilievo, perfetta per la stagione calda.",
    materials: "Cotone biologico Aran, uncinetto 4.5mm",
    pages: 12,
    free: true,
    imageUrl: null,
  },
  {
    id: "2",
    title: "Top Estivo in Raffia",
    difficulty: "Avanzato",
    description: "Top senza maniche con texture aperta e lavorazione a rete, ideale per l'estate.",
    materials: "Raffia naturale, uncinetto 3.5mm",
    pages: 16,
    free: false,
    price: 800,
    imageUrl: null,
  },
  {
    id: "3",
    title: "Porta-oggetti Mini",
    difficulty: "Principiante",
    description: "Piccolo cestino in cotone per tenere in ordine la scrivania o il comodino.",
    materials: "Cotone macramè 3mm, uncinetto 3mm",
    pages: 6,
    free: true,
    imageUrl: null,
  },
]

const difficultyColor: Record<string, string> = {
  Principiante: "bg-green-100 text-green-700",
  Intermedio: "bg-amber-100 text-amber-700",
  Avanzato: "bg-purple-100 text-purple-700",
}

export default function PatternsPage() {
  return (
    <>
      <Header />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-10">
          <h1 className="font-newsreader text-4xl font-semibold text-on-surface mb-3">Cartamodelli</h1>
          <p className="text-on-surface-variant max-w-xl">
            Schemi e istruzioni per riprodurre i pezzi Flora &amp; Fiber a casa tua. Alcuni sono gratuiti, altri scaricabili con un piccolo contributo.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {["Tutti", "Gratuiti", "Principiante", "Intermedio", "Avanzato"].map((f) => (
            <button key={f} className="px-4 py-1.5 rounded-full text-sm font-medium border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors first:bg-primary first:text-on-primary first:border-transparent">
              {f}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {patterns.map((p) => (
            <div key={p.id} className="bg-surface-container-low border border-outline-variant rounded-2xl overflow-hidden flex flex-col">
              <div className="aspect-video bg-surface-container flex items-center justify-center">
                <span className="material-symbols-outlined text-5xl text-on-surface-variant/20">design_services</span>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h2 className="font-semibold text-on-surface">{p.title}</h2>
                  <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${difficultyColor[p.difficulty] ?? "bg-surface-container text-on-surface-variant"}`}>
                    {p.difficulty}
                  </span>
                </div>
                <p className="text-sm text-on-surface-variant leading-relaxed mb-3 flex-1">{p.description}</p>
                <p className="text-xs text-on-surface-variant mb-1"><span className="font-medium">Materiali:</span> {p.materials}</p>
                <p className="text-xs text-on-surface-variant mb-4"><span className="font-medium">Pagine:</span> {p.pages}</p>
                <div className="flex items-center justify-between mt-auto">
                  <span className={`text-sm font-semibold ${p.free ? "text-primary" : "text-on-surface"}`}>
                    {p.free ? "Gratuito" : `€${((p.price ?? 0) / 100).toFixed(2)}`}
                  </span>
                  <button className="inline-flex items-center gap-1.5 bg-primary text-on-primary px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors">
                    <span className="material-symbols-outlined text-[16px]">download</span>
                    {p.free ? "Scarica" : "Acquista"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  )
}
