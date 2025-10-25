import { DroneProductsResponse, DroneProduct } from "types/drone"
import { sdk } from "@lib/config"

export async function getDroneProducts(
  locale: string,
  currency: string
): Promise<DroneProductsResponse> {
  return sdk.client.fetch<DroneProductsResponse>(`/store/drone-products`, {
    method: "GET",
    query: {
      locale,
      currency,
    },
  })
}

export async function getDroneProduct(
  handle: string,
  locale: string,
  currency: string
): Promise<DroneProduct> {
  return sdk.client.fetch<DroneProduct>(`/store/drone-products/${handle}`, {
    method: "GET",
    query: {
      locale,
      currency,
    },
  })
}
