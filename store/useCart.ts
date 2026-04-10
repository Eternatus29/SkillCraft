'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem } from '@/types'

interface CartStore {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  clearCart: () => void
  total: () => number
  hasItem: (id: string) => boolean
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((s) => ({
          items: s.items.find((i) => i._id === item._id) ? s.items : [...s.items, item],
        })),
      removeItem: (id) =>
        set((s) => ({ items: s.items.filter((i) => i._id !== id) })),
      clearCart: () => set({ items: [] }),
      total: () => get().items.reduce((sum, i) => sum + i.price, 0),
      hasItem: (id) => get().items.some((i) => i._id === id),
    }),
    { name: 'skillcraft-cart' }
  )
)
