import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/studio/", "/api/", "/ganaweb"],
      },
    ],
    sitemap: "https://www.gefcrochet.it/sitemap.xml",
  }
}
