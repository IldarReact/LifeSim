import type { GameStateCreator } from '../../../types'

import { applyStats } from '@/core/helpers/apply-stats'
import { createBusinessBranch } from '@/core/lib/business'
import type { Business } from '@/core/types'

export const createBranchesSlice: GameStateCreator<{
  openBranch: (sourceBusinessId: string) => void
}> = (set, get) => ({
  openBranch: (sourceBusinessId: string) => {
    const state = get()
    if (!state.player) return

    const sourceBusiness = state.player.businesses.find((b) => b.id === sourceBusinessId)
    if (!sourceBusiness) return

    // Стоимость открытия филиала (берем initialCost)
    const branchCost = sourceBusiness.initialCost

    if (state.player.stats.money < branchCost) {
      console.warn('Недостаточно денег для открытия филиала')
      return
    }

    let networkId = sourceBusiness.networkId
    let updatedBusinesses = [...state.player.businesses]

    // Если сети еще нет, создаем её
    if (!networkId) {
      networkId = `net_${Date.now()}`

      // Обновляем исходный бизнес, делаем его главным
      updatedBusinesses = updatedBusinesses.map((b) =>
        b.id === sourceBusinessId ? { ...b, networkId, isMainBranch: true } : b,
      )
    }

    // Считаем количество филиалов в этой сети для названия
    const branchCount = updatedBusinesses.filter((b) => b.networkId === networkId).length

    const newBranch = createBusinessBranch(
      sourceBusiness,
      networkId,
      branchCount,
      state.turn,
      branchCost,
    )

    const updatedStats = applyStats(state.player.stats, {
      money: -branchCost,
    })

    set({
      player: {
        ...state.player,
        stats: updatedStats,
        businesses: [...updatedBusinesses, newBranch],
      },
    })

    console.log(`[Business] Открыт филиал: ${newBranch.name} в сети ${networkId}`)
  },
})
