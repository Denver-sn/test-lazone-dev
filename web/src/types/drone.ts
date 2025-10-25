export type DroneCategory = {
  id: string
  name: string
  handle: string
  description?: string
  image_url?: string
}

export type DroneProduct = {
  id: string
  handle: string
  sale_mode: "both" | "sale" | "rent"
  title: string
  description: string
  thumbnail: string
  images: string[]
  sale_price_minor: number
  rent_daily_price_minor: number
  weight: number
  category_id: string
  category?: DroneCategory
  features?: string[]
  specifications?: {
    [key: string]: string | number
  }
}

export type DroneProductsResponse = {
  locale: string
  currency: string
  count: number
  limit: number
  offset: number
  source_total: number
  products: DroneProduct[]
}

export type DroneFilter = {
  category?: string
  sale_mode?: "both" | "sale" | "rent"
  price_range?: {
    min: number
    max: number
  }
  weight_range?: {
    min: number
    max: number
  }
  sort_by?: "price_asc" | "price_desc" | "newest" | "popularity"
}
