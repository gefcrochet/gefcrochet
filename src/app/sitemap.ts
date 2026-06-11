import type { MetadataRoute } from "next"
import { prisma } from "@/lib/prisma"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      collections: {
        none: {
          collection: {
            isActive: false,
          },
        },
      },
    },
    select: { slug: true, updatedAt: true },
  })

  const productUrls: MetadataRoute.Sitemap = products.map((p) => ({
    url: `https://www.gefcrochet.it/shop/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }))

  return [
    { url: "https://www.gefcrochet.it", lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: "https://www.gefcrochet.it/shop", lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: "https://www.gefcrochet.it/patterns", lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: "https://www.gefcrochet.it/contatti", lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: "https://www.gefcrochet.it/privacy", lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    ...productUrls,
  ]
}
