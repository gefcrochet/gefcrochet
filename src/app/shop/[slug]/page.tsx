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
    select: {
      name: true,
      description: true,
      isActive: true,
      tags: { select: { name: true } },
      images: { orderBy: { position: "asc" }, take: 1, select: { url: true } },
      collections: {
        select: {
          collection: { select: { isActive: true } },
        },
      },
    },
  })
  if (!product || !product.isActive || product.collections.some(c => !c.collection.isActive)) return {}

  const title = product.name
  const description = product.description ?? undefined
  const imageUrl = product.images[0]?.url

  return {
    title,
    description,
    keywords: product.tags.map((t) => t.name),
    openGraph: {
      title,
      description,
      url: `/shop/${slug}`,
      type: "website",
      ...(imageUrl ? { images: [{ url: imageUrl, alt: product.name }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(imageUrl ? { images: [imageUrl] } : {}),
    },
  }
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
      collections: {
        select: {
          collection: { select: { isActive: true } },
        },
      },
    },
  })

  if (!product || !product.isActive || product.collections.some(c => !c.collection.isActive)) notFound()

  const displayPrice = (product.salePrice ?? product.price) / 100

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://gefcrochet.it" },
      { "@type": "ListItem", position: 2, name: "Negozio", item: "https://gefcrochet.it/shop" },
      ...(product.category
        ? [{ "@type": "ListItem", position: 3, name: product.category.name, item: `https://gefcrochet.it/shop?category=${product.category.slug}` },
           { "@type": "ListItem", position: 4, name: product.name, item: `https://gefcrochet.it/shop/${product.slug}` }]
        : [{ "@type": "ListItem", position: 3, name: product.name, item: `https://gefcrochet.it/shop/${product.slug}` }]),
    ],
  }

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((img) => img.url),
    brand: { "@type": "Brand", name: "GeF Crochet" },
    offers: {
      "@type": "Offer",
      price: displayPrice.toFixed(2),
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
      url: `https://gefcrochet.it/shop/${product.slug}`,
      seller: { "@type": "Organization", name: "GeF Crochet" },
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <Header />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-on-surface-variant mb-6">
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
