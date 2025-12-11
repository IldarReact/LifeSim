import type { GameStateCreator } from '../types'
import type { Business, BusinessType } from '@/core/types'
import {
  validateBusinessOpening,
  validateBusinessUnfreeze,
  createBusinessObject,
  updateBusinessMetrics,
} from '@/core/lib/business'
import type { StatEffect } from '@/core/types/stats.types'
import { applyStats } from '@/core/helpers/apply-stats'
import {
  shouldCreateNetwork,
  createNetworkForBusinesses,
  addBranchToNetwork,
  updateNetworkBonuses,
} from '@/core/lib/business-network'

export const createCoreBusinessSlice: GameStateCreator<Record<string, unknown>> = (set, get) => ({
  openBusiness: (
    name: string,
    type: BusinessType,
    description: string,
    totalCost: number,
    upfrontCost: number,
    creationCost: StatEffect,
    openingQuarters: number,
    monthlyIncome: number,
    monthlyExpenses: number,
    maxEmployees: number,
    minEmployees: number,
    taxRate: number,
  ) => {
    const state = get()
    if (!state.player) return

    const validation = validateBusinessOpening(
      state.player.stats.money,
      upfrontCost,
      state.player.personal.stats.energy,
      creationCost,
    )

    if (!validation.isValid) {
      console.warn(validation.error)
      return
    }

    const newBusiness = createBusinessObject({
      name,
      type,
      description,
      totalCost,
      upfrontCost,
      creationCost,
      openingQuarters,
      monthlyIncome,
      monthlyExpenses,
      maxEmployees,
      minEmployees,
      taxRate,
      currentTurn: state.turn,
    })

    const updatedStats = applyStats(state.player.stats, { money: -upfrontCost })
    const updatedStatEffect = applyStats({ ...state.player.personal.stats, money: 0 }, creationCost)

    let finalBusinesses = [...state.player.businesses]
    let finalNewBusiness = newBusiness

    if (shouldCreateNetwork(state.player.businesses, type as BusinessType)) {
      const existingBusiness = state.player.businesses.find(
        (b) => b.type === type && b.state !== 'frozen',
      )

      if (existingBusiness) {
        const { main, branch, networkId } = createNetworkForBusinesses(
          existingBusiness,
          newBusiness,
        )
        finalBusinesses = finalBusinesses.map((b) => (b.id === existingBusiness.id ? main : b))
        finalNewBusiness = branch
        console.log(`[Business Network] Created network ${networkId} for type "${type}"`)
      }
    } else {
      const existingNetwork = state.player.businesses.find(
        (b) => b.type === type && b.networkId && b.state !== 'frozen',
      )

      if (existingNetwork && existingNetwork.networkId) {
        const mainBranch = state.player.businesses.find(
          (b) => b.networkId === existingNetwork.networkId && b.isMainBranch,
        )

        if (mainBranch) {
          finalNewBusiness = addBranchToNetwork(
            newBusiness,
            existingNetwork.networkId,
            mainBranch.price,
          )
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
  },

  closeBusiness: (businessId: string) => {
    const state = get()
    if (!state.player) return

    const business = state.player.businesses.find((b) => b.id === businessId)
    if (!business) return

    const returnValue = Math.round(business.currentValue * 0.5)
    const updatedStats = applyStats(state.player.stats, { money: returnValue })

    set({
      player: {
        ...state.player,
        stats: updatedStats,
        businesses: state.player.businesses.filter((b) => b.id !== businessId),
      },
    })
  },

  unfreezeBusiness: (businessId: string) => {
    const state = get()
    if (!state.player) return

    const business = state.player.businesses.find((b) => b.id === businessId)
    if (!business) return

    const validation = validateBusinessUnfreeze(state.player.stats.money, business.initialCost)
    if (!validation.isValid) {
      console.warn(validation.error)
      return
    }

    const updatedBusinesses = state.player.businesses.map((b) =>
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

    set({
      player: {
        ...state.player,
        stats: updatedStats,
        businesses: updatedBusinesses,
      },
    })
  },

  freezeBusiness: (businessId: string) => {
    const state = get()
    if (!state.player) return

    const business = state.player.businesses.find((b) => b.id === businessId)
    if (!business) return

    const compensation = business.employees.reduce((sum, emp) => sum + emp.salary, 0)
    const currentMoney = state.player.stats.money
    const newMoney = currentMoney - compensation

    const updatedBusinesses = state.player.businesses.map((b) =>
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

    set({
      player: {
        ...state.player,
        stats: updatedStats,
        businesses: updatedBusinesses,
      },
    })
  },

  openBranch: (sourceBusinessId: string) => {
    const state = get()
    if (!state.player) return

    const sourceBusiness = state.player.businesses.find((b) => b.id === sourceBusinessId)
    if (!sourceBusiness) return

    const branchCost = sourceBusiness.initialCost
    if (state.player.stats.money < branchCost) {
      console.warn('Not enough money to open branch')
      return
    }

    let networkId = sourceBusiness.networkId
    let updatedBusinesses = [...state.player.businesses]

    if (!networkId) {
      networkId = `net_${Date.now()}`
      updatedBusinesses = updatedBusinesses.map((b) =>
        b.id === sourceBusinessId ? { ...b, networkId, isMainBranch: true } : b,
      )
    }

    const branchCount = updatedBusinesses.filter((b) => b.networkId === networkId).length
    const branchName = `${sourceBusiness.name.split(' (')[0]} (Branch ${branchCount})`

    const newBranch: Business = {
      ...sourceBusiness,
      id: `business_${Date.now()}`,
      name: branchName,
      state: 'opening',
      networkId,
      isMainBranch: false,
      price: sourceBusiness.price,
      employees: [],
      inventory: {
        ...sourceBusiness.inventory,
        currentStock: 0,
      },
      openingProgress: {
        ...sourceBusiness.openingProgress,
        quartersLeft: Math.max(1, Math.round(sourceBusiness.openingProgress.totalQuarters * 0.7)),
        investedAmount: branchCost,
        totalCost: branchCost,
        upfrontCost: branchCost,
      },
      reputation: 50,
      efficiency: 50,
      eventsHistory: [],
      foundedTurn: state.turn,
      playerRoles: {
        managerialRoles: [],
        operationalRole: null,
      },
    }

    const updatedStats = applyStats(state.player.stats, { money: -branchCost })

    set({
      player: {
        ...state.player,
        stats: updatedStats,
        businesses: [...updatedBusinesses, newBranch],
      },
    })

    console.log(`[Business] Opened branch: ${branchName} in network ${networkId}`)
  },
})
