"use client"

import { useEffect, useState, use } from "react"
import { useLanguage } from "@lib/context/language-context"
import { getDroneProduct } from "@lib/services/drone-service"
import { DroneProduct } from "types/drone"
import Image from "next/image"
import { Button } from "@medusajs/ui"
import { Calendar, ShoppingCart } from "lucide-react"
import { useDroneActions } from "@lib/hooks/use-drone-actions"

type Props = {
  params: {
    handle: string
  }
}

export default function ProductDetailPage({ params }: Props) {
  const { currentLanguage, formatPrice } = useLanguage()
  const { onBuy, onRent, isLoading: actionLoading } = useDroneActions()
  const [product, setProduct] = useState<DroneProduct | null>(null)
  const [loading, setLoading] = useState(true)

  const handle = use(params).handle

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const data = await getDroneProduct(
          handle,
          currentLanguage.code,
          currentLanguage.currency.toLowerCase()
        )
        setProduct(data)
      } catch (error) {
        console.error("Failed to fetch product:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [handle, currentLanguage])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500">Produit non trouvé</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Image Gallery */}
        <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
          <Image
            src={product.thumbnail}
            alt={product.title}
            width={800}
            height={600}
            className="h-full w-full object-cover object-center"
          />
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold">{product.title}</h1>
          <p className="mt-4 text-lg text-gray-500">{product.description}</p>

          {/* Specifications */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Spécifications</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="border rounded-lg p-4">
                <p className="text-sm text-gray-500">Poids</p>
                <p className="text-lg font-medium">{product.weight}g</p>
              </div>
              <div className="border rounded-lg p-4">
                <p className="text-sm text-gray-500">Mode de vente</p>
                <p className="text-lg font-medium">
                  {product.sale_mode === "both"
                    ? "Achat et Location"
                    : product.sale_mode === "sale"
                    ? "Achat uniquement"
                    : "Location uniquement"}
                </p>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="mt-8">
            <div className="flex flex-col gap-4">
              {(product.sale_mode === "sale" ||
                product.sale_mode === "both") && (
                <div className="border rounded-lg p-4">
                  <p className="text-sm text-gray-500">
                    {currentLanguage.code === "fr"
                      ? "Prix d'achat"
                      : "Purchase Price"}
                  </p>
                  <p className="text-2xl font-bold">
                    {formatPrice(product.sale_price_minor / 100)}
                  </p>
                  <Button
                    className="mt-2 w-full flex items-center justify-center gap-2"
                    variant="primary"
                    onClick={() => onBuy(product)}
                    disabled={actionLoading}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {currentLanguage.code === "fr"
                      ? "Ajouter au panier"
                      : "Add to Cart"}
                  </Button>
                </div>
              )}

              {(product.sale_mode === "rent" ||
                product.sale_mode === "both") && (
                <div className="border rounded-lg p-4">
                  <p className="text-sm text-gray-500">
                    {currentLanguage.code === "fr"
                      ? "Prix de location"
                      : "Rental Price"}
                  </p>
                  <p className="text-2xl font-bold">
                    {formatPrice(product.rent_daily_price_minor / 100)}
                    <span className="text-base font-normal text-gray-500">
                      {currentLanguage.code === "fr" ? "/jour" : "/day"}
                    </span>
                  </p>
                  <Button
                    className="mt-2 w-full flex items-center justify-center gap-2"
                    variant="secondary"
                    onClick={() => onRent(product)}
                    disabled={actionLoading}
                  >
                    <Calendar className="w-4 h-4" />
                    {currentLanguage.code === "fr"
                      ? "Réserver une période"
                      : "Book a Period"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
