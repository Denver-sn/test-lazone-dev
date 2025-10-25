import { DroneProduct } from "types/drone"
import { sdk } from "@lib/config"
import { Cart } from "./cart-store"
import { HttpTypes } from "@medusajs/types"

export type CartItem = {
  product_id: string
  quantity: number
  type: "purchase" | "rental"
  rental_details?: {
    start_date: string
    end_date: string
    total_days: number
  }
}

export async function addToCart(item: CartItem) {
  return sdk.client.fetch<CartItem>(`/store/cart/items`, {
    method: "POST",
    body: JSON.stringify(item),
  })
}

export async function getCart() {
  return sdk.client.fetch<HttpTypes.StoreCartResponse>(`/store/cart`)
}
