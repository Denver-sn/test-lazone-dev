"use client"

import { useLanguage } from "@lib/context/language-context"
import { CartItem } from "@lib/services/cart-store"
import { Button } from "@medusajs/ui"
import { Calendar, Minus, Plus, Trash2 } from "lucide-react"
import Image from "next/image"
import { format } from "date-fns"
import { fr, enUS } from "date-fns/locale"

type Props = {
  item: CartItem
  updateQuantity: (id: string, quantity: number) => void
  removeItem: (id: string) => void
}

export default function CartItemComponent({
  item,
  updateQuantity,
  removeItem,
}: Props) {
  const { currentLanguage, formatPrice } = useLanguage()
  const locale = currentLanguage.code === "fr" ? fr : enUS

  const itemPrice =
    item.type === "purchase"
      ? (item.product.sale_price_minor / 100) * item.quantity
      : (item.rental_details?.total_price || 0) * item.quantity

  return (
    <div className="flex gap-4 py-4 border-b">
      <div className="relative aspect-square w-24 overflow-hidden rounded-lg">
        <Image
          src={item.product.thumbnail}
          alt={item.product.title}
          fill
          className="object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex justify-between">
          <div>
            <h3 className="text-base font-medium">{item.product.title}</h3>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {item.type === "purchase"
                  ? currentLanguage.code === "fr"
                    ? "Achat"
                    : "Purchase"
                  : currentLanguage.code === "fr"
                  ? "Location"
                  : "Rental"}
              </span>
              {item.type === "rental" && item.rental_details && (
                <span className="text-sm text-gray-500">
                  {format(new Date(item.rental_details.start_date), "PP", {
                    locale,
                  })}{" "}
                  -{" "}
                  {format(new Date(item.rental_details.end_date), "PP", {
                    locale,
                  })}
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="font-medium">{formatPrice(itemPrice)}</p>
            {item.type === "rental" && item.rental_details && (
              <p className="text-sm text-gray-500">
                {item.rental_details.total_days}{" "}
                {currentLanguage.code === "fr" ? "jours" : "days"}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="small"
              onClick={() =>
                updateQuantity(item.id, Math.max(0, item.quantity - 1))
              }
            >
              <Minus className="w-4 h-4" />
            </Button>
            <span className="w-8 text-center">{item.quantity}</span>
            <Button
              variant="secondary"
              size="small"
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <Button
            variant="secondary"
            size="small"
            onClick={() => removeItem(item.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
