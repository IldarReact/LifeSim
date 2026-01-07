import { applyStats } from '@/core/helpers/apply-stats'
import { validateBusinessOpening, createBusinessObject } from '@/core/lib/business'
import {
  shouldCreateNetwork,
  createNetworkForBusinesses,
  addBranchToNetwork,
  updateNetworkBonuses,
} from '@/core/lib/business/business-network'
import type { Business, BusinessType } from '@/core/types'
import type { GameStore } from '../../../../types'

export const handleOpenBusiness = (
  get: () => GameStore,
  set: (patch: Partial<GameStore>) => void,
  business: Business,
  upfrontCost: number,
) => {
  const state = get()
  if (!state.player) return

  const validation = validateBusinessOpening(
    state.player.stats.money,
    upfrontCost,
    state.player.personal.stats.energy,
    business.creationCost,
  )

  if (!validation.isValid) {
    console.warn(validation.error)
    return
  }

  const updatedStats = applyStats(state.player.stats, { money: -upfrontCost })
  const updatedStatEffect = applyStats(
    { ...state.player.personal.stats, money: 0 },
    business.creationCost,
  )

  let finalBusinesses = [...state.player.businesses]
  let finalNewBusiness = business

  if (shouldCreateNetwork(state.player.businesses, business.type as BusinessType)) {
    const existingBusiness = state.player.businesses.find(
      (b: Business) => b.type === business.type && b.state !== 'frozen',
    )

    if (existingBusiness) {
      const { main, branch, networkId } = createNetworkForBusinesses(existingBusiness, business)
      finalBusinesses = finalBusinesses.map((b) => (b.id === existingBusiness.id ? main : b))
      finalNewBusiness = branch
      console.log(`[Business Network] Created network ${networkId} for type "${business.type}"`)
    }
  } else {
    const existingNetwork = state.player.businesses.find(
      (b: Business) => b.type === business.type && b.networkId && b.state !== 'frozen',
    )

    if (existingNetwork && existingNetwork.networkId) {
      const mainBranch = state.player.businesses.find(
        (b: Business) => b.networkId === existingNetwork.networkId && b.isMainBranch,
      )

      if (mainBranch) {
        finalNewBusiness = addBranchToNetwork(business, existingNetwork.networkId, mainBranch.price)
        console.log(`[Business Network] Added branch to network ${existingNetwork.networkId}`)
      }
    }
  }

  finalBusinesses.push(finalNewBusiness)

  if (finalNewBusiness.networkId) {
    finalBusinesses = updateNetworkBonuses(finalBusinesses, finalNewBusiness.networkId)
  }

  set({
    player: {
      ...state.player,
      stats: updatedStats,
      personal: {
        ...state.player.personal,
        stats: updatedStatEffect,
      },
      businesses: finalBusinesses,
    },
  })
}

export const handleOpenBranch = (
  get: () => GameStore,
  set: (patch: Partial<GameStore>) => void,
  sourceBusinessId: string,
) => {
  const state = get()
  if (!state.player) return

  const sourceBusiness = state.player.businesses.find((b: Business) => b.id === sourceBusinessId)
  if (!sourceBusiness) return

  const branchCost = sourceBusiness.initialCost
  if (state.player.stats.money < branchCost) {
    console.warn('Not enough money to open branch')
    return
  }

  const branch = createBusinessObject({
    name: `${sourceBusiness.name} (Branch)`,
    type: sourceBusiness.type,
    description: sourceBusiness.description,
    totalCost: sourceBusiness.openingProgress.totalCost,
    upfrontCost: sourceBusiness.openingProgress.upfrontCost,
    creationCost: sourceBusiness.creationCost,
    openingQuarters: sourceBusiness.openingProgress.totalQuarters,
    maxEmployees: sourceBusiness.maxEmployees,
    employeeRoles: sourceBusiness.employeeRoles,
    currentTurn: state.turn,
  })

  handleOpenBusiness(get, set, branch, branchCost)
}
