import type { GameStore } from '../../../types'

import { canChangePrice, syncPriceToNetwork } from '@/core/lib/business/business-network'
import type { Business } from '@/core/types/business.types'
import type { PricingProductionSlice } from '../../../types/business.types'
import type { GameStateCreator } from '../../../types'

export const createPricingProductionSlice: GameStateCreator<PricingProductionSlice> = (
  set,
  get,
) => ({
  changePrice: (businessId: string, newPrice: number) => {
    const state = get()
    if (!state.player) return

    // Clamp price between 1 and 10
    const clampedPrice = Math.max(1, Math.min(10, Math.round(newPrice)))

    const business = state.player.businesses.find((b) => b.id === businessId)
    if (!business) return

    if (!canChangePrice(business)) {
      console.warn(`[Pricing] Attempt to change price from non-main branch (ID: ${businessId})`)
      return
    }

    let updatedBusinesses = state.player.businesses
    const oldPrice = business.price

    if (business.networkId) {
      updatedBusinesses = syncPriceToNetwork(
        state.player.businesses,
        business.networkId,
        clampedPrice,
      )
      console.log(
        `[Pricing] Price changed for network ${business.networkId}: ${oldPrice} → ${clampedPrice}`,
      )
    } else {
      updatedBusinesses = state.player.businesses.map((b) =>
        b.id === businessId ? { ...b, price: clampedPrice } : b,
      )
      console.log(`[Pricing] Price changed for "${business.name}": ${oldPrice} → ${clampedPrice}`)
    }

    const k = 15 // markup coefficient per price level
    const recalcInventoryPrice = (b: Business): Business => {
      if (b.isServiceBased || !b.inventory) return b
      const level = b.price || 5
      const cost = b.inventory.purchaseCost
      const newPricePerUnit = Math.round(cost * (1 + (k / 100) * (level - 5)))
      return {
        ...b,
        inventory: {
          ...b.inventory,
          pricePerUnit: newPricePerUnit,
        },
      }
    }

    if (business.networkId) {
      const nid = business.networkId
      updatedBusinesses = updatedBusinesses.map((b) =>
        b.networkId === nid ? recalcInventoryPrice(b) : b,
      )
    } else {
      updatedBusinesses = updatedBusinesses.map((b) =>
        b.id === businessId ? recalcInventoryPrice(b) : b,
      )
    }

    set((state) => ({
      player: state.player
        ? {
            ...state.player,
            businesses: updatedBusinesses,
          }
        : null,
    }))
  },

  setQuantity: (businessId: string, newQuantity: number) => {
    const state = get()
    if (!state.player) return

    const business = state.player.businesses.find((b) => b.id === businessId)
    if (!business) return

    if (business.isServiceBased) {
      console.warn(`[Pricing] Cannot set quantity for a service (ID: ${businessId})`)
      return
    }

    const oldQuantity = business.quantity
    const updatedBusinesses = state.player.businesses.map((b) =>
      b.id === businessId ? { ...b, quantity: Math.max(0, Math.round(newQuantity)) } : b,
    )

    console.log(
      `[Pricing] Production plan changed for "${business.name}": ${oldQuantity} → ${Math.round(newQuantity)} units`,
    )

    set((state) => ({
      player: state.player
        ? {
            ...state.player,
            businesses: updatedBusinesses,
          }
        : null,
    }))
  },

  setAutoPurchase: (businessId: string, amount: number) => {
    const state = get()
    if (!state.player) return

    const updatedBusinesses = state.player.businesses.map((b) => {
      if (b.id === businessId && b.inventory) {
        return {
          ...b,
          inventory: {
            ...b.inventory,
            autoPurchaseAmount: amount,
          },
        }
      }
      return b
    })

    set((state) => ({
      player: state.player
        ? {
            ...state.player,
            businesses: updatedBusinesses,
          }
        : null,
    }))
  },
})
