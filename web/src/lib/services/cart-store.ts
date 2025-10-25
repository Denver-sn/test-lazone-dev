import { DroneProduct } from "types/drone"

export type CartItemType = "purchase" | "rental"

export type CartItem = {
  id: string
  product: DroneProduct
  type: CartItemType
  quantity: number
  rental_details?: {
    start_date: string
    end_date: string
    total_days: number
    total_price: number
  }
}

export type Cart = {
  items: CartItem[]
  total: number
}

const CART_STORAGE_KEY = "drone_hub_cart"

export const CartStore = {
  getCart: (): Cart => {
    if (typeof window === "undefined") return { items: [], total: 0 }

    const stored = localStorage.getItem(CART_STORAGE_KEY)
    if (!stored) return { items: [], total: 0 }

    return JSON.parse(stored)
  },

  saveCart: (cart: Cart) => {
    if (typeof window === "undefined") return
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
    // Dispatch custom event for cart updates
    window.dispatchEvent(new Event("cart-updated"))
  },

  addPurchaseItem: (product: DroneProduct, quantity: number = 1) => {
    const cart = CartStore.getCart()
    const existingItemIndex = cart.items.findIndex(
      (item) => item.id === product.id && item.type === "purchase"
    )

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity
    } else {
      cart.items.push({
        id: product.id,
        product,
        type: "purchase",
        quantity,
      })
    }

    cart.total = CartStore.calculateTotal(cart)
    CartStore.saveCart(cart)
    return cart
  },

  addRentalItem: (
    product: DroneProduct,
    startDate: Date,
    endDate: Date,
    quantity: number = 1
  ) => {
    const cart = CartStore.getCart()
    const totalDays = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    )
    const totalPrice = (product.rent_daily_price_minor / 100) * totalDays

    cart.items.push({
      id: `${product.id}-${startDate.toISOString()}-${endDate.toISOString()}`,
      product,
      type: "rental",
      quantity,
      rental_details: {
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        total_days: totalDays,
        total_price: totalPrice,
      },
    })

    cart.total = CartStore.calculateTotal(cart)
    CartStore.saveCart(cart)
    return cart
  },

  removeItem: (itemId: string) => {
    const cart = CartStore.getCart()
    cart.items = cart.items.filter((item) => item.id !== itemId)
    cart.total = CartStore.calculateTotal(cart)
    CartStore.saveCart(cart)
    return cart
  },

  updateQuantity: (itemId: string, quantity: number) => {
    const cart = CartStore.getCart()
    const item = cart.items.find((item) => item.id === itemId)
    if (item) {
      item.quantity = quantity
      cart.total = CartStore.calculateTotal(cart)
      CartStore.saveCart(cart)
    }
    return cart
  },

  clearCart: () => {
    const emptyCart = { items: [], total: 0 }
    CartStore.saveCart(emptyCart)
    return emptyCart
  },

  calculateTotal: (cart: Cart): number => {
    return cart.items.reduce((total, item) => {
      if (item.type === "purchase") {
        return total + (item.product.sale_price_minor / 100) * item.quantity
      } else {
        return total + (item.rental_details?.total_price || 0) * item.quantity
      }
    }, 0)
  },
}
