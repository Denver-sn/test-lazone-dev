"use client"

import { useLanguage } from "@lib/context/language-context"
import { Cart } from "@lib/services/cart-store"
import { Button } from "@medusajs/ui"
import { ShoppingBag } from "lucide-react"

type Props = {
  cart: Cart
}

export default function CartSummary({ cart }: Props) {
  const { currentLanguage, formatPrice } = useLanguage()

  const purchaseItems = cart.items.filter((item) => item.type === "purchase")
  const rentalItems = cart.items.filter((item) => item.type === "rental")

  const purchaseTotal = purchaseItems.reduce(
    (total, item) =>
      total + (item.product.sale_price_minor / 100) * item.quantity,
    0
  )

  const rentalTotal = rentalItems.reduce(
    (total, item) =>
      total + (item.rental_details?.total_price || 0) * item.quantity,
    0
  )

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <h2 className="text-lg font-medium mb-4">
        {currentLanguage.code === "fr"
          ? "Résumé de la commande"
          : "Order Summary"}
      </h2>

      <div className="space-y-3">
        {purchaseItems.length > 0 && (
          <div className="flex justify-between text-sm">
            <span>
              {currentLanguage.code === "fr"
                ? "Total achats"
                : "Purchase total"}
            </span>
            <span>{formatPrice(purchaseTotal)}</span>
          </div>
        )}

        {rentalItems.length > 0 && (
          <div className="flex justify-between text-sm">
            <span>
              {currentLanguage.code === "fr"
                ? "Total locations"
                : "Rental total"}
            </span>
            <span>{formatPrice(rentalTotal)}</span>
          </div>
        )}

        <div className="border-t pt-3 mt-3">
          <div className="flex justify-between font-medium">
            <span>{currentLanguage.code === "fr" ? "Total" : "Total"}</span>
            <span>{formatPrice(cart.total)}</span>
          </div>
        </div>

        <Button
          className="w-full mt-6 flex items-center justify-center gap-2"
          size="large"
        >
          <ShoppingBag className="w-4 h-4" />
          {currentLanguage.code === "fr" ? "Commander" : "Checkout"}
        </Button>
      </div>
    </div>
  )
}
