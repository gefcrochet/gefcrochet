"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"

export interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
  imageUrl?: string
  slug: string
}

interface CartContextValue {
  items: CartItem[]
  count: number
  total: number
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void
  removeItem: (productId: string) => void
  updateQty: (productId: string, quantity: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem("ff-cart")
      if (stored) setItems(JSON.parse(stored))
    } catch {}
  }, [])

  const persist = (next: CartItem[]) => {
    setItems(next)
    localStorage.setItem("ff-cart", JSON.stringify(next))
  }

  const addItem = useCallback((item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
    setItems((prev) => {
      const qty = item.quantity ?? 1
      const existing = prev.find((i) => i.productId === item.productId)
      const next = existing
        ? prev.map((i) => (i.productId === item.productId ? { ...i, quantity: i.quantity + qty } : i))
        : [...prev, { ...item, quantity: qty }]
      localStorage.setItem("ff-cart", JSON.stringify(next))
      return next
    })
  }, [])

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.productId !== productId)
      localStorage.setItem("ff-cart", JSON.stringify(next))
      return next
    })
  }, [])

  const updateQty = useCallback((productId: string, quantity: number) => {
    setItems((prev) => {
      const next = quantity <= 0
        ? prev.filter((i) => i.productId !== productId)
        : prev.map((i) => (i.productId === productId ? { ...i, quantity } : i))
      localStorage.setItem("ff-cart", JSON.stringify(next))
      return next
    })
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
    localStorage.removeItem("ff-cart")
  }, [])

  const count = items.reduce((s, i) => s + i.quantity, 0)
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, count, total, addItem, removeItem, updateQty, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used inside CartProvider")
  return ctx
}
