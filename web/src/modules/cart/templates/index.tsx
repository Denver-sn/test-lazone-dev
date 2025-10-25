"use client"

import { useLanguage } from "@lib/context/language-context"
import { useCart } from "@lib/hooks/use-cart"
import CartItemComponent from "../components/cart-item"
import CartSummary from "../components/cart-summary"
import { ShoppingCart } from "lucide-react"
import { useEffect, useState } from "react"

export default function CartTemplate() {
  const { currentLanguage } = useLanguage()
  const { cart, updateQuantity, removeItem } = useCart()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [cart])

  if (!mounted) {
    return null
  }

  if (!cart.items.length) {
    return (
      <div className="flex flex-col items-center justify-center py-32 px-4">
        <ShoppingCart className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-medium text-gray-900 mb-2">
          {currentLanguage.code === "fr"
            ? "Votre panier est vide"
            : "Your cart is empty"}
        </h2>
        <p className="text-gray-500 text-center max-w-lg">
          {currentLanguage.code === "fr"
            ? "Découvrez notre sélection de drones disponibles à l'achat et à la location."
            : "Discover our selection of drones available for purchase and rental."}
        </p>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-4rem)]">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold mb-8">
          {currentLanguage.code === "fr" ? "Panier" : "Cart"}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg p-6">
              <div className="divide-y">
                {cart.items.map((item) => (
                  <CartItemComponent
                    key={item.id}
                    item={item}
                    updateQuantity={updateQuantity}
                    removeItem={removeItem}
                  />
                ))}
              </div>
            </div>
          </div>

          <div>
            <CartSummary cart={cart} />
          </div>
        </div>
      </div>
    </div>
  )
}
