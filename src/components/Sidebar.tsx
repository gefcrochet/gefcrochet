"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { logout } from "@/app/actions/auth"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/studio", label: "Dashboard", icon: "dashboard" },
  { href: "/studio/orders", label: "Ordini", icon: "shopping_bag" },
  { href: "/studio/products", label: "Prodotti", icon: "inventory_2" },
  { href: "/studio/collections", label: "Collezioni", icon: "collections" },
  { href: "/studio/media", label: "Media", icon: "perm_media" },
  { href: "/studio/slideshow", label: "Slideshow", icon: "slideshow" },
  { href: "/studio/newsletter", label: "Newsletter", icon: "mail" },
  { href: "/studio/impostazioni", label: "Impostazioni", icon: "settings" },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 shrink-0 flex flex-col bg-surface-container-low border-r border-outline-variant min-h-screen">
      <div className="px-4 py-5 border-b border-outline-variant flex flex-col items-center gap-1">
        <Link href="/" className="w-full block">
          <Image src="/logo.png" alt="GeF Crochet" height={48} width={192} className="w-full h-auto" />
        </Link>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon }) => {
          const active = pathname === href || (href !== "/studio" && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-primary-container text-on-primary-container"
                  : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
              )}
            >
              <span className="material-symbols-outlined text-[20px]">{icon}</span>
              {label}
            </Link>
          )
        })}
      </nav>
      <div className="px-3 py-4 border-t border-outline-variant">
        <form action={logout}>
          <button
            type="submit"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-on-surface-variant hover:bg-surface-container hover:text-on-surface w-full transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            Esci
          </button>
        </form>
      </div>
    </aside>
  )
}
