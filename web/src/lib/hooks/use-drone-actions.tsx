"use client"

import { useRouter } from "next/navigation"
import { DroneProduct } from "types/drone"
import { useCart } from "./use-cart"
import { toast } from "sonner"
import { useLanguage } from "@lib/context/language-context"

export type DroneAction = {
  onBuy: (product: DroneProduct) => void
  onRent: (product: DroneProduct) => void
  onViewDetails: (product: DroneProduct) => void
  isLoading: boolean
}

export function useDroneActions(): DroneAction {
  const router = useRouter()
  const { currentLanguage } = useLanguage()
  const { addPurchaseItem, isLoading } = useCart()

  const onBuy = async (product: DroneProduct) => {
    try {
      await addPurchaseItem(product)
      router.push("/cart")
    } catch (error) {
      toast.error(
        currentLanguage.code === "fr"
          ? "Erreur lors de l'ajout au panier"
          : "Error adding to cart"
      )
    }
  }

  const onRent = (product: DroneProduct) => {
    router.push(`/products/${product.handle}/rent`)
  }

  const onViewDetails = (product: DroneProduct) => {
    router.push(`/products/${product.handle}`)
  }

  return {
    onBuy,
    onRent,
    onViewDetails,
    isLoading,
  }
}
