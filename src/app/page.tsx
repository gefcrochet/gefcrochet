import Link from "next/link"
import Image from "next/image"
import { prisma } from "@/lib/prisma"
import { formatPrice } from "@/lib/utils"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { NewsletterForm } from "@/components/NewsletterForm"
import { HeroSlideshow } from "@/components/HeroSlideshow"
import { AnnouncementBar } from "@/components/AnnouncementBar"

export const revalidate = 3600

async function getSlides() {
  return prisma.slide.findMany({ where: { isActive: true }, orderBy: { position: "asc" } })
}

async function getFeaturedProducts() {
  return prisma.product.findMany({
    where: { isFeatured: true, isActive: true },
    select: {
      id: true, name: true, slug: true, price: true, salePrice: true,
      category: { select: { name: true } },
      images: { orderBy: { position: "asc" }, take: 1, select: { url: true } },
    },
    take: 4,
  })
}

async function getCollections() {
  return prisma.collection.findMany({
    where: { isActive: true },
    select: { id: true, name: true, slug: true, description: true, heroImageUrl: true },
    orderBy: { position: "asc" },
  })
}

export default async function HomePage() {
  const [slides, products, collections] = await Promise.all([getSlides(), getFeaturedProducts(), getCollections()])

  return (
    <>
      <AnnouncementBar />
      <Header />
      <main className="flex-1">

        {/* Hero Slideshow */}
        <HeroSlideshow slides={slides} />

        {/* Categories bento */}
        {collections.length > 0 && (
          <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="font-newsreader text-4xl font-normal text-primary mb-3">Le nostre collezioni</h2>
              <p className="text-on-surface-variant max-w-xl mx-auto">
                Collezioni fatte a mano, ognuna realizzata con intenzione e materiali naturali.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {collections.map((coll, i) => (
                <Link
                  key={coll.id}
                  href={`/shop?collection=${coll.slug}`}
                  className={`group relative rounded-[28px] overflow-hidden flex flex-col ${
                    i === 0 ? "md:col-span-2 h-[400px]" : "h-[320px]"
                  } bg-surface-container`}
                >
                  {/* image or placeholder */}
                  <div className="absolute inset-0">
                    {coll.heroImageUrl ? (
                      <Image
                        src={coll.heroImageUrl}
                        alt={coll.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 66vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary-container via-surface-container to-surface-container-high flex items-center justify-center">
                        <span className="material-symbols-outlined text-[80px] text-primary/20">yarn</span>
                      </div>
                    )}
                  </div>

                  {/* frosted-glass title bar */}
                  <div className="absolute bottom-0 inset-x-0 z-20 backdrop-blur-md bg-surface/80 border-t border-outline-variant/30 px-6 py-4">
                    <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-on-surface-variant mb-1">Collezione</p>
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-newsreader text-xl font-normal text-on-surface truncate">{coll.name}</h3>
                        {coll.description && (
                          <p className="text-xs text-on-surface-variant line-clamp-1 mt-0.5">{coll.description}</p>
                        )}
                      </div>
                      <span className="material-symbols-outlined text-on-surface-variant flex-shrink-0 group-hover:translate-x-1 transition-transform duration-200">
                        arrow_forward
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Our Story */}
        <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-[4/5] md:aspect-square rounded-[32px] overflow-hidden bg-surface-container-low">
              <Image
                src="https://res.cloudinary.com/dwpebo7qz/image/upload/v1778833362/gefcrochet/fettucce-cotone.avif"
                alt="GeF Crochet Studio"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute bottom-6 right-6 bg-surface text-center py-4 px-6 rounded-2xl shadow-xl">
                <p className="font-newsreader text-xl text-primary tracking-wide">HANDMADE IN ITALY</p>
              </div>
            </div>
            <div className="max-w-md">
              <p className="text-xs font-semibold tracking-widest uppercase text-on-surface-variant mb-4">La nostra storia</p>
              <h2 className="font-newsreader text-4xl md:text-5xl font-normal text-on-surface mb-6 leading-tight">
                Ci sono mani, occhi e <span className="italic">cuore</span> dietro ogni creazione.
              </h2>
              <div className="space-y-4 text-on-surface-variant leading-relaxed">
                <p>
                  Ogni gomitolo è l&apos;inizio di un viaggio fatto di colori, trame e intrecci d&apos;amore. Qui nascono borse che parlano di te, pupazzi che fanno sorridere, dettagli che scaldano la casa e l&apos;anima.
                </p>
                <p>
                  Tutto è realizzato a mano, lentamente, come si faceva una volta. Perché la bellezza vera ha bisogno di tempo, cura e passione.
                </p>
                <p className="font-medium text-on-surface">
                  💛 Se anche tu ami ciò che è unico, autentico e fatto col cuore… sei nel posto giusto.
                </p>
              </div>
              <div className="mt-8">
                <Link href="/contatti" className="inline-flex items-center gap-2 text-primary font-semibold text-sm hover:gap-3 transition-all">
                  Contattaci <span className="material-symbols-outlined text-base">arrow_forward</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Featured products */}
        {products.length > 0 && (
          <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto border-t border-outline-variant">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="font-newsreader text-4xl font-normal text-primary mb-2">In evidenza</h2>
                <p className="text-on-surface-variant">I nostri pezzi artigianali più recenti</p>
              </div>
              <Link href="/shop" className="hidden md:inline-flex items-center gap-2 text-primary font-semibold text-sm tracking-wide hover:gap-3 transition-all">
                Vedi tutto <span className="material-symbols-outlined text-base">arrow_forward</span>
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {products.map((p) => (
                <Link key={p.id} href={`/shop/${p.slug}`} className="group cursor-pointer">
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-surface-container-low mb-4">
                    {p.images[0] ? (
                      <Image
                        src={p.images[0].url}
                        alt={p.name}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-4xl text-on-surface-variant/30">yarn</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 flex items-end justify-center pb-4 transition-opacity duration-300">
                      <span className="bg-surface text-primary px-6 py-2.5 rounded-full text-sm font-semibold shadow-md">
                        Vedi prodotto
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-on-surface-variant font-semibold tracking-widest uppercase">{p.category?.name}</span>
                    <h3 className="font-newsreader text-lg mt-0.5 mb-1 group-hover:text-primary transition-colors">{p.name}</h3>
                    <span className="font-semibold text-primary">{formatPrice(p.salePrice ?? p.price)}</span>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-10 text-center md:hidden">
              <Link href="/shop" className="inline-flex items-center gap-2 text-primary font-semibold text-sm tracking-wide border border-primary/30 px-6 py-3 rounded-full hover:bg-primary/5 transition-colors">
                Vedi tutti i prodotti <span className="material-symbols-outlined text-base">arrow_forward</span>
              </Link>
            </div>
          </section>
        )}

        {/* Values */}
        <section className="py-20 bg-surface-container-low">
          <div className="px-4 sm:px-6 max-w-7xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="font-newsreader text-4xl font-normal text-primary mb-3">Perché GeF Crochet</h2>
              <p className="text-on-surface-variant max-w-lg mx-auto">
                Ogni scelta, dalla fibra all&apos;imballaggio, è guidata dal nostro impegno per l&apos;artigianato e l&apos;ambiente.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: "handshake", title: "Fatto a mano con amore", desc: "Ogni pezzo richiede ore di lavoro attento. Non usiamo mai macchine — ogni punto è posato a mano, rendendo ogni pezzo unico." },
                { icon: "eco", title: "Materiali scelti con cura", desc: "Ogni filo, cordoncino o fibra viene selezionato personalmente. Che sia cotone, lana o un cordoncino tecnico, scegliamo sempre il meglio disponibile sul mercato." },
                { icon: "recycling", title: "Packaging sostenibile", desc: "Tutti gli imballaggi sono senza plastica, in materiali riciclati e compostabili. Ci impegniamo a lasciare un'impronta leggera sul pianeta." },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="text-center p-8">
                  <div className="w-14 h-14 bg-primary-container rounded-2xl flex items-center justify-center mx-auto mb-5">
                    <span className="material-symbols-outlined text-primary text-2xl">{icon}</span>
                  </div>
                  <h3 className="font-newsreader text-xl text-on-surface mb-3">{title}</h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto">
          <div className="bg-primary rounded-[32px] p-10 md:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <span className="material-symbols-outlined text-[400px] text-on-primary absolute -left-20 -bottom-20">local_florist</span>
              <span className="material-symbols-outlined text-[300px] text-on-primary absolute -right-16 -top-16">eco</span>
            </div>
            <div className="relative z-10">
              <span className="text-on-primary/70 text-xs font-semibold tracking-widest uppercase mb-4 block">Resta in contatto</span>
              <h2 className="font-newsreader text-3xl md:text-4xl font-normal text-on-primary mb-4">
                Unisciti a GeF Crochet
              </h2>
              <p className="text-on-primary/80 mb-8 max-w-md mx-auto">
                Accesso anticipato a nuove collezioni e ispirazione delicata direttamente nella tua casella di posta.
              </p>
              <NewsletterForm />
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
