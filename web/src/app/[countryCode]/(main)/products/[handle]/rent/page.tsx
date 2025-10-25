"use client"

import { useEffect, useState } from "react"
import { useLanguage } from "@lib/context/language-context"
import { getDroneProduct } from "@lib/services/drone-service"
import { DroneProduct } from "types/drone"
import { useCart } from "@lib/hooks/use-cart"
import { toast } from "sonner"
import Image from "next/image"
import { Button } from "@medusajs/ui"
import { Calendar, Info, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { format, addDays } from "date-fns"
import { fr, enUS } from "date-fns/locale"

type Props = {
  params: {
    handle: string
  }
}

export default function RentPage({ params }: Props) {
  const router = useRouter()
  const { currentLanguage, formatPrice } = useLanguage()
  const [product, setProduct] = useState<DroneProduct | null>(null)
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState<Date>(new Date())
  const [endDate, setEndDate] = useState<Date>(addDays(new Date(), 1))
  const [isSubmitting, setIsSubmitting] = useState(false)

  const locale = currentLanguage.code === "fr" ? fr : enUS

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const data = await getDroneProduct(
          params.handle,
          currentLanguage.code,
          currentLanguage.currency.toLowerCase()
        )
        setProduct(data)
      } catch (error) {
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [params.handle, currentLanguage])

  const { addRentalItem, isLoading: isCartLoading } = useCart()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!product) return

    try {
      setIsSubmitting(true)
      await addRentalItem(product, startDate, endDate)
      router.push("/cart")
    } catch (error) {
      toast.error(
        currentLanguage.code === "fr"
          ? "Erreur lors de l'ajout au panier"
          : "Error adding to cart"
      )
    } finally {
      setIsSubmitting(false)
    }
  }

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
        <p className="text-gray-500">
          {currentLanguage.code === "fr"
            ? "Produit non trouvé"
            : "Product not found"}
        </p>
      </div>
    )
  }

  const totalDays = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  )
  const totalPrice = (product.rent_daily_price_minor / 100) * totalDays

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image du produit */}
        <div className="relative aspect-square rounded-xl overflow-hidden">
          <Image
            src={product.thumbnail}
            alt={product.title}
            fill
            className="object-cover"
          />
        </div>

        {/* Formulaire de location */}
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
          <p className="text-gray-600 mb-6">{product.description}</p>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-6">
              {currentLanguage.code === "fr"
                ? "Détails de la location"
                : "Rental Details"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Sélecteur de dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {currentLanguage.code === "fr"
                      ? "Date de début"
                      : "Start Date"}
                  </label>
                  <input
                    type="date"
                    min={format(new Date(), "yyyy-MM-dd")}
                    value={format(startDate, "yyyy-MM-dd")}
                    onChange={(e) => {
                      const newStartDate = new Date(e.target.value)
                      setStartDate(newStartDate)
                      if (endDate <= newStartDate) {
                        setEndDate(addDays(newStartDate, 1))
                      }
                    }}
                    className="w-full rounded-lg border border-gray-200 p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {currentLanguage.code === "fr" ? "Date de fin" : "End Date"}
                  </label>
                  <input
                    type="date"
                    min={format(addDays(startDate, 1), "yyyy-MM-dd")}
                    value={format(endDate, "yyyy-MM-dd")}
                    onChange={(e) => setEndDate(new Date(e.target.value))}
                    className="w-full rounded-lg border border-gray-200 p-2"
                  />
                </div>
              </div>

              {/* Résumé */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {currentLanguage.code === "fr"
                      ? "Prix journalier"
                      : "Daily Rate"}
                  </span>
                  <span>
                    {formatPrice(product.rent_daily_price_minor / 100)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {currentLanguage.code === "fr"
                      ? "Nombre de jours"
                      : "Number of days"}
                  </span>
                  <span>
                    {totalDays}{" "}
                    {currentLanguage.code === "fr" ? "jours" : "days"}
                  </span>
                </div>
                <div className="pt-3 border-t flex justify-between items-center">
                  <span className="font-medium">
                    {currentLanguage.code === "fr" ? "Total" : "Total"}
                  </span>
                  <span className="text-xl font-bold">
                    {formatPrice(totalPrice)}
                  </span>
                </div>
              </div>

              {/* Bouton de soumission */}
              <Button
                type="submit"
                variant="primary"
                className="w-full flex items-center justify-center gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Calendar className="w-5 h-5" />
                )}
                {currentLanguage.code === "fr"
                  ? "Ajouter au panier"
                  : "Add to Cart"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
