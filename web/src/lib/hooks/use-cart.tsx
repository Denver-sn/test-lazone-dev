"use client"

import { useEffect, useState } from "react"
import { Cart, CartStore } from "../services/cart-store"
import { DroneProduct } from "types/drone"

export function useCart() {
  const [cart, setCart] = useState<Cart>({ items: [], total: 0 })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Initial cart state
    const initialCart = CartStore.getCart()
    setCart(initialCart)

    // Listen for cart updates
    const handleCartUpdate = () => {
      const updatedCart = CartStore.getCart()
      setCart(updatedCart)
    }

    window.addEventListener("cart-updated", handleCartUpdate)
    // Trigger initial cart update
    window.dispatchEvent(new Event("cart-updated"))

    return () => {
      window.removeEventListener("cart-updated", handleCartUpdate)
    }
  }, [])

  const addPurchaseItem = async (product: DroneProduct) => {
    setIsLoading(true)
    try {
      const updatedCart = CartStore.addPurchaseItem(product)
      setCart(updatedCart)
    } finally {
      setIsLoading(false)
    }
  }

  const addRentalItem = async (
    product: DroneProduct,
    startDate: Date,
    endDate: Date
  ) => {
    setIsLoading(true)
    try {
      const updatedCart = CartStore.addRentalItem(product, startDate, endDate)
      setCart(updatedCart)
    } finally {
      setIsLoading(false)
    }
  }

  const removeItem = (itemId: string) => {
    const updatedCart = CartStore.removeItem(itemId)
    setCart(updatedCart)
  }

  const updateQuantity = (itemId: string, quantity: number) => {
    const updatedCart = CartStore.updateQuantity(itemId, quantity)
    setCart(updatedCart)
  }

  const clearCart = () => {
    const updatedCart = CartStore.clearCart()
    setCart(updatedCart)
  }

  return {
    cart,
    isLoading,
    addPurchaseItem,
    addRentalItem,
    removeItem,
    updateQuantity,
    clearCart,
  }
}
