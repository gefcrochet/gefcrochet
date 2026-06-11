import type { NextConfig } from "next"
import path from "path"

const cloudName = process.env.CLOUDINARY_CLOUD_NAME

// 'unsafe-inline' negli script è richiesto dal runtime inline di Next e dal JSON-LD;
// 'unsafe-eval' serve solo al dev server (react-refresh)
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""} https://challenges.cloudflare.com`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob: https://res.cloudinary.com https://images.unsplash.com",
  "frame-src https://challenges.cloudflare.com",
  "connect-src 'self' https://challenges.cloudflare.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
].join("; ")

const nextConfig: NextConfig = {
  // Explicit root prevents ERR_INVALID_ARG_TYPE in Vercel's modifyConfig
  // when the automatic lock-file discovery picks the wrong parent directory
  outputFileTracingRoot: path.resolve(__dirname),
  serverExternalPackages: ["sharp"],
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
  async rewrites() {
    if (!cloudName) return []
    return [
      {
        source: "/media/:path*",
        destination: `https://res.cloudinary.com/${cloudName}/image/upload/gefcrochet/:path*`,
      },
    ]
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      {
        source: "/media/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ]
  },
}

export default nextConfig
