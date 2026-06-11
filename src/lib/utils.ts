import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * URL canonico del sito (l'apex gefcrochet.it fa redirect 307 verso www).
 * NEXT_PUBLIC_BASE_URL consente l'override per ambienti di anteprima.
 */
export const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.gefcrochet.it"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(cents / 100)
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[àáâãäå]/g, "a")
    .replace(/[èéêë]/g, "e")
    .replace(/[ìíîï]/g, "i")
    .replace(/[òóôõö]/g, "o")
    .replace(/[ùúûü]/g, "u")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
}

export const LOW_STOCK_THRESHOLD = 3

export const ORDER_STATUSES = ["PROCESSING", "READY", "SHIPPED", "DELIVERED", "CANCELLED"] as const
export type OrderStatus = (typeof ORDER_STATUSES)[number]

export const STATUS_LABELS: Record<OrderStatus, string> = {
  PROCESSING: "In lavorazione",
  READY: "Pronto per spedire",
  SHIPPED: "Spedito",
  DELIVERED: "Consegnato",
  CANCELLED: "Annullato",
}
