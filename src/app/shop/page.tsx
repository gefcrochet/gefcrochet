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
    const title = `Prodotti ${tag} fatti a mano`
    const description = `Scopri i prodotti artigianali GeF Crochet in ${tag}, realizzati a mano con cura e passione.`
    return {
      title,
      description,
      keywords: [tag, "crochet", "uncinetto", "fatto a mano", "artigianale"],
      openGraph: { title, description, url: `/shop?tag=${tag}` },
    }
  }
  if (q) return { title: `Risultati per "${q}"` }

  return {
    title: "Negozio",
    description: "Prodotti artigianali all'uncinetto fatti a mano: borse, accessori, amigurumi e decorazioni in cotone, lana e fettuccia.",
    keywords: ["crochet", "uncinetto", "fatto a mano", "artigianale", "borsa crochet", "accessori uncinetto", "amigurumi"],
    openGraph: { title: "Negozio", description: "Prodotti artigianali all'uncinetto fatti a mano.", url: "/shop" },
  }
}

// Flat search/tag results
const getFilteredProducts = unstable_cache(
  async (q?: string, tag?: string) => {
    return prisma.product.findMany({
      where: {
        isActive: true,
        collections: { none: { collection: { isActive: false } } },
        ...(q ? { name: { contains: q } } : {}),
        ...(tag ? { tags: { some: { name: tag } } } : {}),
      },
      select: {
        id: true, name: true, slug: true, price: true, salePrice: true, description: true,
        images: { orderBy: { position: "asc" }, take: 1, select: { url: true } },
        category: { select: { name: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
    })
  },
  ["shop-filtered"],
  { revalidate: 3600 }
)

// Collections with ordered products
const getCollectionsData = unstable_cache(
  async () => {
    return prisma.collection.findMany({
      where: { isActive: true },
      include: {
        products: {
          where: { product: { isActive: true } },
          include: {
            product: {
              select: {
                id: true, name: true, slug: true, price: true, salePrice: true, description: true,
                images: { orderBy: { position: "asc" }, take: 1, select: { url: true } },
                category: { select: { name: true, slug: true } },
              },
            },
          },
          orderBy: { position: "asc" },
        },
      },
      orderBy: { position: "asc" },
    })
  },
  ["shop-collections"],
  { revalidate: 3600 }
)

interface ProductCardProps {
  id: string
  name: string
  slug: string
  price: number
  salePrice: number | null
  description: string
  images: { url: string }[]
  category: { name: string; slug: string } | null
}

function ProductCard({ p }: { p: ProductCardProps }) {
  return (
    <Link href={`/shop/${p.slug}`} className="group flex">
      <div className="bg-surface rounded-2xl overflow-hidden border border-outline-variant/50 shadow-sm hover:shadow-md transition-shadow flex flex-col w-full">
        <div className="relative aspect-[4/3] bg-surface-container-low overflow-hidden shrink-0">
          {p.images[0] ? (
            <Image
              src={p.images[0].url}
              alt={p.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
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
            <p className="text-sm text-on-surface-variant line-clamp-2 mb-4 leading-relaxed">{p.description}</p>
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
  )
}

export default async function ShopPage({ searchParams }: Props) {
  const { q, tag } = await searchParams
  const isFiltering = Boolean(q || tag)

  return (
    <>
      <Header />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-10">

        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
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
            <h1 className="font-newsreader text-3xl font-semibold text-on-surface">
              {q ? `Risultati per "${q}"` : "Negozio"}
            </h1>
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

        {/* ── Filtered / search view ── */}
        {isFiltering ? (
          <FilteredView q={q} tag={tag} />
        ) : (
          <CollectionsView />
        )}

      </main>
      <Footer />
    </>
  )
}

async function FilteredView({ q, tag }: { q?: string; tag?: string }) {
  const products = await getFilteredProducts(q, tag)

  if (products.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="text-on-surface-variant">Nessun prodotto trovato.</p>
        <Link href="/shop" className="mt-4 inline-block text-primary text-sm hover:underline">Vedi tutti i prodotti</Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
      {products.map((p) => <ProductCard key={p.id} p={p} />)}
    </div>
  )
}

async function CollectionsView() {
  const collections = await getCollectionsData()
  const activeCollections = collections.filter((c) => c.products.length > 0)

  if (activeCollections.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="text-on-surface-variant">Nessun prodotto disponibile al momento.</p>
      </div>
    )
  }

  return (
    <div className="space-y-16">
      {activeCollections.map((collection) => (
        <section key={collection.id}>
          {/* Section header */}
          <div className="flex items-center gap-4 mb-6">
            <h2 className="font-newsreader text-2xl font-semibold text-on-surface whitespace-nowrap">
              {collection.name}
            </h2>
            <div className="flex-1 h-px bg-outline-variant" />
          </div>

          {collection.description && (
            <p className="text-sm text-on-surface-variant mb-6 max-w-2xl leading-relaxed">
              {collection.description}
            </p>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
            {collection.products.map(({ product }) => (
              <ProductCard key={product.id} p={product} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
