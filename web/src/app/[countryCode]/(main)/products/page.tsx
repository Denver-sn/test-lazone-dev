"use client"

import { useEffect, useState } from "react"
import { useLanguage } from "@lib/context/language-context"
import { getDroneProducts } from "@lib/services/drone-service"
import { DroneProduct } from "types/drone"
import DroneProductCard from "@modules/products/components/drone-product-card"

export default function ProductsPage() {
  const { currentLanguage } = useLanguage()
  const [products, setProducts] = useState<DroneProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const response = await getDroneProducts(
          currentLanguage.code,
          currentLanguage.currency.toLowerCase()
        )
        setProducts(response.products)
      } catch (error) {
        // console.error("Failed to fetch products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [currentLanguage])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8">Catalogue des drones</h1>
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <DroneProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
