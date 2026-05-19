import Link from "next/link"
import Image from "next/image"
import type { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { formatPrice } from "@/lib/utils"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { unstable_cache } from "next/cache"

interface Props {
  searchParams: Promise<{ q?: string; tag?: string }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { tag, q } = await searchParams
  if (tag) {
    return {
      title: `Prodotti ${tag} fatti a mano — GeF Crochet`,
      description: `Scopri i prodotti artigianali GeF Crochet in ${tag}, realizzati a mano con cura e passione.`,
      keywords: [tag, "crochet", "uncinetto", "fatto a mano", "artigianale"],
    }
  }
  if (q) {
    return { title: `Risultati per "${q}" — GeF Crochet` }
  }
  return {
    title: "Negozio — GeF Crochet",
    description: "Prodotti artigianali fatti a mano: borse, accessori e decorazioni in cotone, lana e fettuccia.",
    keywords: ["crochet", "uncinetto", "fatto a mano", "artigianale", "borsa crochet", "accessori uncinetto"],
  }
}

const getShopData = unstable_cache(
  async (q?: string, tag?: string) => {
    return prisma.product.findMany({
      where: {
        isActive: true,
        ...(q ? { name: { contains: q } } : {}),
        ...(tag ? { tags: { some: { name: tag } } } : {}),
      },
      select: {
        id: true, name: true, slug: true, price: true, salePrice: true,
        description: true,
        images: { orderBy: { position: "asc" }, take: 1, select: { url: true } },
        category: { select: { name: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
    })
  },
  ["shop-data"],
  { revalidate: 3600 }
)

export default async function ShopPage({ searchParams }: Props) {
  const { q, tag } = await searchParams

  const products = await getShopData(q, tag)

  return (
    <>
      <Header />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          {tag ? (
            <div>
              <h1 className="font-newsreader text-3xl font-semibold text-on-surface">
                Prodotti: <em>{tag}</em>
              </h1>
              <Link href="/shop" className="inline-flex items-center gap-1 text-xs text-on-surface-variant hover:text-primary mt-1 transition-colors">
                <span className="material-symbols-outlined text-[14px]">close</span>
                Rimuovi filtro
              </Link>
            </div>
          ) : (
            <h1 className="font-newsreader text-3xl font-semibold text-on-surface">Negozio</h1>
          )}
          <form className="flex gap-2">
            {tag && <input type="hidden" name="tag" value={tag} />}
            <input
              name="q"
              defaultValue={q}
              placeholder="Cerca…"
              className="px-3 py-2 rounded-lg border border-outline-variant bg-surface text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </form>
        </div>

        {products.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-on-surface-variant">Nessun prodotto trovato.</p>
            <Link href="/shop" className="mt-4 inline-block text-primary text-sm hover:underline">Vedi tutti i prodotti</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
            {products.map((p) => (
              <Link key={p.id} href={`/shop/${p.slug}`} className="group flex">
                <div className="bg-surface rounded-2xl overflow-hidden border border-outline-variant/50 shadow-sm hover:shadow-md transition-shadow flex flex-col w-full">
                  <div className="relative aspect-[4/3] bg-surface-container-low overflow-hidden shrink-0">
                    {p.images[0] ? (
                      <Image src={p.images[0].url} alt={p.name} fill sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-4xl text-on-surface-variant/30">yarn</span>
                      </div>
                    )}
                    {p.salePrice && (
                      <div className="absolute top-3 left-3 bg-error text-on-error px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase shadow-sm">
                        In saldo
                      </div>
                    )}
                    {p.category && (
                      <div className="absolute top-3 right-3 bg-surface/90 backdrop-blur text-on-surface px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase shadow-sm">
                        {p.category.name}
                      </div>
                    )}
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-newsreader text-xl font-normal text-on-surface mb-2 line-clamp-1">{p.name}</h3>
                    {p.description && (
                      <p className="text-sm text-on-surface-variant line-clamp-2 mb-4 leading-relaxed">
                        {p.description}
                      </p>
                    )}

                    <div className="mt-auto">
                      <div className="w-full bg-[#4A5D4E] text-white group-hover:bg-[#3D4D40] transition-colors py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 font-medium text-sm shadow-sm">
                        <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
                        {p.salePrice ? (
                          <>Acquista a {formatPrice(p.salePrice)} <span className="line-through text-white/60 ml-1 text-xs font-normal">{formatPrice(p.price)}</span></>
                        ) : (
                          <>Acquista a {formatPrice(p.price)}</>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}
