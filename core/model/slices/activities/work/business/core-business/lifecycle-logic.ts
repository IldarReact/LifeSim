import { applyStats } from '@/core/helpers/apply-stats'
import { validateBusinessUnfreeze } from '@/core/lib/business'
import type { Business, Employee } from '@/core/types'
import type { GameStore } from '../../../../types'

export const handleCloseBusiness = (
  get: () => GameStore,
  set: (patch: Partial<GameStore>) => void,
  businessId: string,
) => {
  const state = get()
  if (!state.player) return

  const business = state.player.businesses.find((b: Business) => b.id === businessId)
  if (!business) return

  const returnValue = Math.round(business.currentValue * 0.5)
  const updatedStats = applyStats(state.player.stats, { money: returnValue })
  const updatedPersonalStats = applyStats(state.player.personal.stats, { money: returnValue })

  set({
    player: {
      ...state.player,
      stats: updatedStats,
      personal: {
        ...state.player.personal,
        stats: updatedPersonalStats,
      },
      businesses: state.player.businesses.filter((b: Business) => b.id !== businessId),
    },
  })
}

export const handleFreezeBusiness = (
  get: () => GameStore,
  set: (patch: Partial<GameStore>) => void,
  businessId: string,
) => {
  const state = get()
  if (!state.player) return

  const business = state.player.businesses.find((b: Business) => b.id === businessId)
  if (!business) return

  const compensation = business.employees.reduce(
    (sum: number, emp: Employee) => sum + emp.salary,
    0,
  )
  const currentMoney = state.player.stats.money
  const newMoney = currentMoney - compensation

  const updatedBusinesses = state.player.businesses.map((b: Business) =>
    b.id === businessId
      ? {
          ...b,
          state: 'frozen' as const,
          employees: [],
          reputation: Math.max(0, b.reputation - 20),
          inventory: b.inventory ? { ...b.inventory, currentStock: 0 } : b.inventory,
        }
      : b,
  )

  const updatedStats = { ...state.player.stats, money: newMoney }
  const updatedPersonalStats = {
    ...state.player.personal.stats,
    money: state.player.personal.stats.money - compensation,
  }

  set({
    player: {
      ...state.player,
      stats: updatedStats,
      personal: {
        ...state.player.personal,
        stats: updatedPersonalStats,
      },
      businesses: updatedBusinesses,
    },
  })
}

export const handleUnfreezeBusiness = (
  get: () => GameStore,
  set: (patch: Partial<GameStore>) => void,
  businessId: string,
) => {
  const state = get()
  if (!state.player) return

  const business = state.player.businesses.find((b: Business) => b.id === businessId)
  if (!business) return

  const validation = validateBusinessUnfreeze(state.player.stats.money, business.initialCost)
  if (!validation.isValid) {
    console.warn(validation.error)
    return
  }

  const updatedBusinesses = state.player.businesses.map((b: Business) =>
    b.id === businessId
      ? {
          ...b,
          state: 'opening' as const,
          openingProgress: {
            ...b.openingProgress,
            quartersLeft: 1,
          },
        }
      : b,
  )

  const updatedStats = applyStats(state.player.stats, { money: -validation.unfreezeCost })
  const updatedPersonalStats = applyStats(state.player.personal.stats, {
    money: -validation.unfreezeCost,
  })

  set({
    player: {
      ...state.player,
      stats: updatedStats,
      personal: {
        ...state.player.personal,
        stats: updatedPersonalStats,
      },
      businesses: updatedBusinesses,
    },
  })
}

export const handleDepositToBusinessWallet = (
  get: () => GameStore,
  set: (patch: Partial<GameStore>) => void,
  businessId: string,
  amount: number,
) => {
  const state = get()
  if (!state.player) return
  if (amount <= 0) return

  const i = state.player.businesses.findIndex((b: Business) => b.id === businessId)
  if (i === -1) return

  const business = state.player.businesses[i]
  if (!business) return

  if (state.player.stats.money < amount) {
    console.warn(
      `[Business Wallet] Недостаточно средств у игрока для пополнения: требуется $${amount}`,
    )
    return
  }

  const updatedStats = applyStats(state.player.stats, { money: -amount })
  const updatedPersonalStats = applyStats(state.player.personal.stats, { money: -amount })

  const updatedBusinesses = [...state.player.businesses]
  updatedBusinesses[i] = {
    ...business,
    walletBalance: (business.walletBalance || 0) + amount,
  }

  set({
    player: {
      ...state.player,
      stats: updatedStats,
      personal: {
        ...state.player.personal,
        stats: updatedPersonalStats,
      },
      businesses: updatedBusinesses,
    },
  })
}
