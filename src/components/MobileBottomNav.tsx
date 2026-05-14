"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const items = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/shop", label: "Catalogo", icon: "storefront" },
  { href: "/contatti", label: "Contatti", icon: "mail" },
]

export function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur border-t border-outline-variant">
      <div className="flex items-stretch h-16">
        {items.map(({ href, label, icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors"
            >
              <span
                className={`material-symbols-outlined text-[24px] transition-colors ${
                  active ? "text-primary" : "text-on-surface-variant"
                }`}
                style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
              >
                {icon}
              </span>
              <span className={`text-[10px] font-medium transition-colors ${active ? "text-primary" : "text-on-surface-variant"}`}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
      {/* Safe area for iPhone home indicator */}
      <div className="h-safe-bottom bg-surface/95" />
    </nav>
  )
}
