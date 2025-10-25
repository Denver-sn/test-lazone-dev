"use client"

import { DroneProduct } from "types/drone"
import { useLanguage } from "@lib/context/language-context"
import { useDroneActions } from "@lib/hooks/use-drone-actions"
import Image from "next/image"
import { Button } from "@medusajs/ui"
import { Calendar, Info, Loader2, ShoppingCart } from "lucide-react"
import { useState } from "react"
import ActionModal from "@modules/common/components/modal/action-modal"

type Props = {
  product: DroneProduct
}

export default function DroneProductCard({ product }: Props) {
  const { currentLanguage, formatPrice } = useLanguage()
  const { onBuy, onRent, onViewDetails, isLoading } = useDroneActions()
  const [isActionsOpen, setIsActionsOpen] = useState(false)

  return (
    <div className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="aspect-square w-full overflow-hidden">
        <Image
          src={product.thumbnail}
          alt={product.title}
          width={800}
          height={600}
          className="h-full w-full object-cover object-center transition-transform group-hover:scale-105"
        />
        {product.sale_mode === "both" && (
          <div className="absolute top-2 right-2 bg-primary text-white px-2 py-1 rounded text-sm">
            {currentLanguage.code === "fr" ? "Achat & Location" : "Buy & Rent"}
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-lg font-medium text-gray-900">{product.title}</h3>
        <p className="mt-1 text-sm text-gray-500 line-clamp-2">
          {product.description}
        </p>

        <div className="mt-4 space-y-3">
          {/* Prix d'achat */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {currentLanguage.code === "fr"
                ? "Prix d'achat"
                : "Purchase Price"}
            </span>
            <span className="text-lg font-medium text-gray-900">
              {formatPrice(product.sale_price_minor / 100)}
            </span>
          </div>

          {/* Prix de location si disponible */}
          {product.sale_mode === "both" && (
            <div className="flex items-center justify-between border-t pt-3">
              <span className="text-sm text-gray-500">
                {currentLanguage.code === "fr"
                  ? "Prix journalier"
                  : "Daily Rate"}
              </span>
              <span className="text-base text-gray-900">
                {formatPrice(product.rent_daily_price_minor / 100)}
                <span className="text-sm text-gray-500 ml-1">/jour</span>
              </span>
            </div>
          )}

          {/* Boutons d'action */}
          <div className="grid grid-cols-2 gap-2 pt-3">
            <Button
              variant="secondary"
              className="w-full flex items-center justify-center gap-2"
              onClick={() => onViewDetails(product)}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Info className="w-4 h-4" />
              )}
              {currentLanguage.code === "fr" ? "Détails" : "Details"}
            </Button>
            {product.sale_mode === "both" ? (
              <>
                <Button
                  variant="primary"
                  className="w-full flex items-center justify-center gap-2"
                  disabled={isLoading}
                  onClick={() => setIsActionsOpen(true)}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : currentLanguage.code === "fr" ? (
                    "Commander"
                  ) : (
                    "Order"
                  )}
                </Button>

                <ActionModal
                  isOpen={isActionsOpen}
                  onClose={() => setIsActionsOpen(false)}
                  title={
                    currentLanguage.code === "fr"
                      ? "Choisir une option"
                      : "Choose an option"
                  }
                >
                  <div className="space-y-4">
                    <div className="text-sm text-gray-500">
                      {currentLanguage.code === "fr"
                        ? "Comment souhaitez-vous obtenir ce drone ?"
                        : "How would you like to get this drone?"}
                    </div>

                    <div className="grid gap-3">
                      <Button
                        variant="secondary"
                        className="w-full flex items-center justify-center gap-2 py-6"
                        onClick={() => {
                          onBuy(product)
                          setIsActionsOpen(false)
                        }}
                        disabled={isLoading}
                      >
                        <ShoppingCart className="w-5 h-5" />
                        <div>
                          <div className="font-medium">
                            {currentLanguage.code === "fr" ? "Acheter" : "Buy"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatPrice(product.sale_price_minor / 100)}
                          </div>
                        </div>
                      </Button>

                      <Button
                        variant="secondary"
                        className="w-full flex items-center justify-center gap-2 py-6"
                        onClick={() => {
                          onRent(product)
                          setIsActionsOpen(false)
                        }}
                        disabled={isLoading}
                      >
                        <Calendar className="w-5 h-5" />
                        <div>
                          <div className="font-medium">
                            {currentLanguage.code === "fr" ? "Louer" : "Rent"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatPrice(product.rent_daily_price_minor / 100)}{" "}
                            {currentLanguage.code === "fr" ? "/ jour" : "/ day"}
                          </div>
                        </div>
                      </Button>
                    </div>
                  </div>
                </ActionModal>
              </>
            ) : (
              <Button
                variant="primary"
                className="w-full flex items-center justify-center gap-2"
                onClick={() => onBuy(product)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ShoppingCart className="w-4 h-4" />
                )}
                {currentLanguage.code === "fr" ? "Acheter" : "Buy"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
