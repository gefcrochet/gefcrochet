"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useCart } from "./CartContext"

export function Header() {
  const { count } = useCart()
  const pathname = usePathname()

  function navClass(href: string) {
    const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href)
    return [
      "px-3 py-1.5 rounded-md transition-colors duration-200",
      isActive
        ? "text-primary font-semibold"
        : "text-on-surface-variant hover:text-primary hover:bg-primary/10",
    ].join(" ")
  }

  return (
    <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur border-b border-outline-variant">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[100px] grid grid-cols-3 items-center">
        {/* Left: nav links (desktop only) */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
          <Link href="/" className={navClass("/")}>Home</Link>
          <Link href="/shop" className={navClass("/shop")}>Catalogo</Link>
          <Link href="/contatti" className={navClass("/contatti")}>Contatti</Link>
        </nav>

        {/* Mobile: empty left cell (nav is in bottom bar) */}
        <div className="md:hidden" />

        {/* Center: logo */}
        <div className="flex justify-center">
          <Link href="/" className="flex items-center">
            <Image src="/logo.png" alt="GeF Crochet" height={89.5} width={160} className="w-[160px] h-[89.5px]" priority />
          </Link>
        </div>

        {/* Right: cart icon */}
        <div className="flex items-center justify-end gap-2">
          <Link href="/cart" className="relative p-2 text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined text-[22px]">shopping_bag</span>
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-primary text-on-primary text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {count > 9 ? "9+" : count}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  )
}
