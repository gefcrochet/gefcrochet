import { cn } from "@/lib/utils"
import type { OrderStatus } from "@/lib/utils"

const statusStyles: Record<OrderStatus, string> = {
  PROCESSING: "bg-amber-100 text-amber-800",
  READY: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
}

const statusLabels: Record<OrderStatus, string> = {
  PROCESSING: "In lavorazione",
  READY: "Pronto per spedire",
  SHIPPED: "Spedito",
  DELIVERED: "Consegnato",
  CANCELLED: "Annullato",
}

export function StatusBadge({ status }: { status: string }) {
  const s = status as OrderStatus
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", statusStyles[s] ?? "bg-gray-100 text-gray-700")}>
      {statusLabels[s] ?? status}
    </span>
  )
}
