import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { ProductDetail } from "./ProductDetail"

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await prisma.product.findUnique({
    where: { slug },
    select: { name: true, description: true },
  })
  if (!product) return {}
  return { title: `${product.name} — GeF Crochet`, description: product.description }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params

  const product = await prisma.product.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      price: true,
      salePrice: true,
      isActive: true,
      category: { select: { name: true, slug: true } },
      images: { orderBy: { position: "asc" }, select: { url: true, alt: true } },
      tags: { select: { name: true } },
    },
  })

  if (!product || !product.isActive) notFound()

  return (
    <>
      <Header />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <nav className="flex items-center gap-2 text-xs text-on-surface-variant mb-6">
          <Link href="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-primary">Negozio</Link>
          {product.category && (
            <>
              <span>/</span>
              <Link href={`/shop?category=${product.category.slug}`} className="hover:text-primary">
                {product.category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-on-surface">{product.name}</span>
        </nav>
        <ProductDetail product={product} />
      </main>
      <Footer />
    </>
  )
}
