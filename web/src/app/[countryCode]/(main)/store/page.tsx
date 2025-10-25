"use client"

import { useLanguage } from "@lib/context/language-context"
import { getDroneProducts } from "@lib/services/drone-service"
import { DroneFilter, DroneProduct } from "types/drone"
import { useEffect, useState } from "react"
import RentalCard from "@modules/store/components/rental-card"
import FilterSidebar from "@modules/store/components/filter-sidebar"
import { Button } from "@medusajs/ui"
import { Filter as FilterIcon, X } from "lucide-react"
import Image from "next/image"

export default function StorePage() {
  const { currentLanguage } = useLanguage()
  const [products, setProducts] = useState<DroneProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<DroneFilter>({})
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)

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

  const filteredProducts = products.filter((product) => {
    if (filters.sale_mode && product.sale_mode !== filters.sale_mode) {
      return false
    }
    if (
      filters.price_range &&
      (product.rent_daily_price_minor / 100 < filters.price_range.min ||
        product.rent_daily_price_minor / 100 > filters.price_range.max)
    ) {
      return false
    }
    return true
  })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (filters.sort_by) {
      case "price_asc":
        return a.rent_daily_price_minor - b.rent_daily_price_minor
      case "price_desc":
        return b.rent_daily_price_minor - a.rent_daily_price_minor
      case "newest":
        return new Date(b.id).getTime() - new Date(a.id).getTime()
      default:
        return 0
    }
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <div className="relative h-[40vh] bg-gray-900">
        <Image
          src="https://images.unsplash.com/photo-1579829366248-204fe8413f31?ixlib=rb-1.2.1&auto=format&fit=crop&w=2850&q=80"
          alt="Drone store banner"
          fill
          className="object-cover opacity-60"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {currentLanguage.code === "fr"
                ? "Location de Drones"
                : "Drone Rental"}
            </h1>
            <p className="text-xl max-w-2xl mx-auto px-4">
              {currentLanguage.code === "fr"
                ? "Trouvez le drone parfait pour votre prochain projet"
                : "Find the perfect drone for your next project"}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Desktop */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <FilterSidebar
              initialFilters={filters}
              onFilterChange={setFilters}
            />
          </div>

          {/* Mobile Filter Button */}
          <div className="lg:hidden">
            <Button
              variant="secondary"
              className="w-full flex items-center justify-center gap-2"
              onClick={() => setIsMobileFiltersOpen(true)}
            >
              <FilterIcon className="w-4 h-4" />
              {currentLanguage.code === "fr" ? "Filtres" : "Filters"}
            </Button>
          </div>

          {/* Mobile Filters Sidebar */}
          {isMobileFiltersOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div
                className="absolute inset-0 bg-black/50"
                onClick={() => setIsMobileFiltersOpen(false)}
              />
              <div className="absolute right-0 top-0 h-full w-[300px] bg-white p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold">
                    {currentLanguage.code === "fr" ? "Filtres" : "Filters"}
                  </h2>
                  <button onClick={() => setIsMobileFiltersOpen(false)}>
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <FilterSidebar
                  initialFilters={filters}
                  onFilterChange={(newFilters) => {
                    setFilters(newFilters)
                    setIsMobileFiltersOpen(false)
                  }}
                />
              </div>
            </div>
          )}

          {/* Products Grid */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">
                {currentLanguage.code === "fr"
                  ? "Drones disponibles"
                  : "Available Drones"}
              </h2>
              <p className="text-gray-500">
                {sortedProducts.length}{" "}
                {currentLanguage.code === "fr" ? "résultats" : "results"}
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="bg-gray-100 rounded-xl aspect-[4/3] animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedProducts.map((product) => (
                  <RentalCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-primary/5 rounded-2xl p-8 mt-12">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-4">
                {currentLanguage.code === "fr"
                  ? "Besoin d'aide pour choisir ?"
                  : "Need help choosing?"}
              </h2>
              <p className="text-gray-600 mb-6">
                {currentLanguage.code === "fr"
                  ? "Notre équipe d'experts est là pour vous guider dans votre choix de drone."
                  : "Our team of experts is here to guide you in choosing your drone."}
              </p>
              <Button variant="secondary">
                {currentLanguage.code === "fr"
                  ? "Contactez-nous"
                  : "Contact Us"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
