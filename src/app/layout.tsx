import type { Metadata } from "next"
import "./globals.css"
import { CartProvider } from "@/components/CartContext"
import { MobileBottomNav } from "@/components/MobileBottomNav"
import { CookieConsentProvider } from "@/components/CookieConsent"

const SITE_URL = "https://gefcrochet.it"
const SITE_NAME = "GeF Crochet"
const DEFAULT_DESCRIPTION = "Prodotti artigianali all'uncinetto fatti a mano in Italia. Borse, accessori, amigurumi e decorazioni in cotone, lana e fettuccia."

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Prodotti artigianali all'uncinetto`,
    template: `%s — ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: ["crochet", "uncinetto", "fatto a mano", "artigianale", "handmade", "borsa uncinetto", "amigurumi", "Italia"],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "it_IT",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Prodotti artigianali all'uncinetto`,
    description: DEFAULT_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Prodotti artigianali all'uncinetto`,
    description: DEFAULT_DESCRIPTION,
  },
}

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.ico`,
    sameAs: ["https://www.instagram.com/gefcrochet"],
    contactPoint: {
      "@type": "ContactPoint",
      email: "info@gefcrochet.it",
      contactType: "customer service",
      availableLanguage: "Italian",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
  },
]

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className="h-full">
      <head>
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,600;0,700;1,400&family=Newsreader:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col antialiased">
        <CartProvider>
          <CookieConsentProvider>
            <div className="flex flex-col flex-1 pb-16 md:pb-0">
              {children}
            </div>
            <MobileBottomNav />
          </CookieConsentProvider>
        </CartProvider>
      </body>
    </html>
  )
}
