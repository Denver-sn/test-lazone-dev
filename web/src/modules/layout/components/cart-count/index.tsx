"use client"

import { useCart } from "@lib/hooks/use-cart"
import { Button } from "@medusajs/ui"
import { ShoppingCart } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@lib/context/language-context"

export default function CartCount() {
  const { cart } = useCart()
  const { currentLanguage } = useLanguage()

  const itemCount = cart.items.reduce((total, item) => total + item.quantity, 0)

  return (
    <Link href="/cart">
      <Button variant="transparent" className="relative">
        <ShoppingCart className="w-5 h-5" />
        {itemCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
            {itemCount}
          </span>
        )}
        <span className="ml-2">
          {currentLanguage.code === "fr" ? "Panier" : "Cart"}
        </span>
      </Button>
    </Link>
  )
}
