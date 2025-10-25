"use client"

import { DroneFilter } from "types/drone"
import { useLanguage } from "@lib/context/language-context"
import { Button } from "@medusajs/ui"
import { Filter as FilterIcon, RotateCcw } from "lucide-react"
import * as Slider from "@radix-ui/react-slider"
import { useState } from "react"

type Props = {
  initialFilters: DroneFilter
  onFilterChange: (filters: DroneFilter) => void
}

export default function FilterSidebar({
  initialFilters,
  onFilterChange,
}: Props) {
  const { currentLanguage } = useLanguage()
  const [filters, setFilters] = useState<DroneFilter>(initialFilters)

  const handleFilterChange = (newFilters: Partial<DroneFilter>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    onFilterChange(updatedFilters)
  }

  const resetFilters = () => {
    const emptyFilters: DroneFilter = {}
    setFilters(emptyFilters)
    onFilterChange(emptyFilters)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FilterIcon className="w-5 h-5" />
          <h2 className="text-lg font-semibold">
            {currentLanguage.code === "fr" ? "Filtres" : "Filters"}
          </h2>
        </div>
        <Button
          variant="secondary"
          className="text-sm flex items-center gap-2"
          onClick={resetFilters}
        >
          <RotateCcw className="w-4 h-4" />
          {currentLanguage.code === "fr" ? "Réinitialiser" : "Reset"}
        </Button>
      </div>

      {/* Type de location */}
      <div>
        <h3 className="text-sm font-medium mb-3">
          {currentLanguage.code === "fr" ? "Type de location" : "Rental Type"}
        </h3>
        <div className="space-y-2">
          {["both", "rent", "sale"].map((mode) => (
            <label key={mode} className="flex items-center gap-2">
              <input
                type="radio"
                name="sale_mode"
                value={mode}
                checked={filters.sale_mode === mode}
                onChange={(e) =>
                  handleFilterChange({ sale_mode: e.target.value as any })
                }
                className="form-radio text-primary"
              />
              <span className="text-sm">
                {mode === "both"
                  ? currentLanguage.code === "fr"
                    ? "Location & Achat"
                    : "Rent & Buy"
                  : mode === "rent"
                  ? currentLanguage.code === "fr"
                    ? "Location uniquement"
                    : "Rent only"
                  : currentLanguage.code === "fr"
                  ? "Achat uniquement"
                  : "Buy only"}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Prix */}
      <div>
        <h3 className="text-sm font-medium mb-3">
          {currentLanguage.code === "fr" ? "Prix journalier" : "Daily Price"}
        </h3>
        <div className="px-2">
          <Slider.Root
            className="relative flex items-center select-none touch-none w-full h-5"
            value={[
              filters.price_range?.min || 0,
              filters.price_range?.max || 1000,
            ]}
            max={1000}
            step={10}
            onValueChange={([min, max]) =>
              handleFilterChange({ price_range: { min, max } })
            }
          >
            <Slider.Track className="bg-gray-200 relative grow rounded-full h-[3px]">
              <Slider.Range className="absolute bg-primary rounded-full h-full" />
            </Slider.Track>
            <Slider.Thumb className="block w-5 h-5 bg-white border-2 border-primary rounded-full hover:bg-primary/10 focus:outline-none" />
            <Slider.Thumb className="block w-5 h-5 bg-white border-2 border-primary rounded-full hover:bg-primary/10 focus:outline-none" />
          </Slider.Root>
          <div className="flex justify-between mt-2 text-sm text-gray-500">
            <span>{filters.price_range?.min || 0}€</span>
            <span>{filters.price_range?.max || 1000}€</span>
          </div>
        </div>
      </div>

      {/* Tri */}
      <div>
        <h3 className="text-sm font-medium mb-3">
          {currentLanguage.code === "fr" ? "Trier par" : "Sort by"}
        </h3>
        <select
          className="w-full rounded-lg border border-gray-200 p-2 text-sm"
          value={filters.sort_by || ""}
          onChange={(e) =>
            handleFilterChange({ sort_by: e.target.value as any })
          }
        >
          <option value="">
            {currentLanguage.code === "fr" ? "Par défaut" : "Default"}
          </option>
          <option value="price_asc">
            {currentLanguage.code === "fr"
              ? "Prix croissant"
              : "Price: Low to High"}
          </option>
          <option value="price_desc">
            {currentLanguage.code === "fr"
              ? "Prix décroissant"
              : "Price: High to Low"}
          </option>
          <option value="newest">
            {currentLanguage.code === "fr" ? "Plus récent" : "Newest"}
          </option>
          <option value="popularity">
            {currentLanguage.code === "fr" ? "Popularité" : "Popularity"}
          </option>
        </select>
      </div>
    </div>
  )
}
