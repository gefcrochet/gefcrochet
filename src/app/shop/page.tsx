import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { formatPrice } from "@/lib/utils"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"

interface Props {
  searchParams: Promise<{ category?: string; q?: string }>
}

export default async function ShopPage({ searchParams }: Props) {
  const { category, q } = await searchParams

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: {
        isActive: true,
        ...(category ? { category: { slug: category } } : {}),
        ...(q ? { name: { contains: q } } : {}),
      },
      include: { images: { orderBy: { position: "asc" }, take: 1 }, category: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ])

  return (
    <>
      <Header />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h1 className="font-newsreader text-3xl font-semibold text-on-surface">Negozio</h1>
          <form className="flex gap-2">
            <input
              name="q"
              defaultValue={q}
              placeholder="Cerca…"
              className="px-3 py-2 rounded-lg border border-outline-variant bg-surface text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </form>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Link
            href="/shop"
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${!category ? "bg-primary text-on-primary" : "border border-outline-variant text-on-surface-variant hover:bg-surface-container"}`}
          >
            Tutti
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/shop?category=${cat.slug}`}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${category === cat.slug ? "bg-primary text-on-primary" : "border border-outline-variant text-on-surface-variant hover:bg-surface-container"}`}
            >
              {cat.name}
            </Link>
          ))}
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
                      <img src={p.images[0].url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
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
                    
                    <div className="flex items-center gap-4 text-xs text-on-surface-variant mb-5 mt-auto font-medium">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px]">inventory_2</span>
                        {p.stock > 0 ? `${p.stock} disp.` : "Esaurito"}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px]">local_shipping</span>
                        Sped. 24/48h
                      </div>
                    </div>

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
