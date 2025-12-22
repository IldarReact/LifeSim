import type { GameStateCreator } from '../../../types'

import { applyStats } from '@/core/helpers/apply-stats'
import {
  validateBusinessOpening,
  validateBusinessUnfreeze,
  createBusinessObject,
} from '@/core/lib/business'
import {
  shouldCreateNetwork,
  createNetworkForBusinesses,
  addBranchToNetwork,
  updateNetworkBonuses,
} from '@/core/lib/business/business-network'
import type { Business, BusinessType, EmployeeRole } from '@/core/types'
import type { StatEffect } from '@/core/types/stats.types'

export const createCoreBusinessSlice: GameStateCreator<Record<string, unknown>> = (set, get) => ({
  openBusiness: (business: Business, upfrontCost: number) => {
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
        (b) => b.type === business.type && b.state !== 'frozen',
      )

      if (existingBusiness) {
        const { main, branch, networkId } = createNetworkForBusinesses(existingBusiness, business)
        finalBusinesses = finalBusinesses.map((b) => (b.id === existingBusiness.id ? main : b))
        finalNewBusiness = branch
        console.log(`[Business Network] Created network ${networkId} for type "${business.type}"`)
      }
    } else {
      const existingNetwork = state.player.businesses.find(
        (b) => b.type === business.type && b.networkId && b.state !== 'frozen',
      )

      if (existingNetwork && existingNetwork.networkId) {
        const mainBranch = state.player.businesses.find(
          (b) => b.networkId === existingNetwork.networkId && b.isMainBranch,
        )

        if (mainBranch) {
          finalNewBusiness = addBranchToNetwork(
            business,
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
    const updatedPersonalStats = applyStats(state.player.personal.stats, { money: returnValue })

    set({
      player: {
        ...state.player,
        stats: updatedStats,
        personal: {
          ...state.player.personal,
          stats: updatedPersonalStats,
        },
        businesses: state.player.businesses.filter((b) => b.id !== businessId),
      },
    })
  },
  depositToBusinessWallet: (businessId: string, amount: number) => {
    const state = get()
    if (!state.player) return
    if (amount <= 0) return

    const i = state.player.businesses.findIndex((b) => b.id === businessId)
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

    const newBranch = createBusinessObject({
      name: branchName,
      type: sourceBusiness.type,
      description: sourceBusiness.description,
      totalCost: branchCost,
      upfrontCost: branchCost,
      creationCost: { energy: -15 }, // Standard branch energy cost
      openingQuarters: Math.max(1, Math.round(sourceBusiness.openingProgress.totalQuarters * 0.7)),
      monthlyIncome: sourceBusiness.monthlyIncome,
      monthlyExpenses: sourceBusiness.monthlyExpenses,
      maxEmployees: sourceBusiness.maxEmployees,
      minEmployees: sourceBusiness.minEmployees,
      taxRate: sourceBusiness.taxRate,
      requiredRoles: sourceBusiness.requiredRoles,
      inventory: sourceBusiness.inventory,
      currentTurn: state.turn,
    })

    // Apply network specific properties
    const finalBranch = {
      ...newBranch,
      networkId,
      isMainBranch: false,
      price: sourceBusiness.price, // Branches share price with network
    }

    const updatedStats = applyStats(state.player.stats, { money: -branchCost })
    const updatedPersonalStats = applyStats(state.player.personal.stats, { money: -branchCost })

    set({
      player: {
        ...state.player,
        stats: updatedStats,
        personal: {
          ...state.player.personal,
          stats: updatedPersonalStats,
        },
        businesses: [...updatedBusinesses, finalBranch],
      },
    })

    console.log(`[Business] Opened branch: ${branchName} in network ${networkId}`)
  },
})
