import type { GameStateCreator, GameSlice } from './types'
import { createInitialPlayer } from '@/core/lib/initial-state'
import { WORLD_COUNTRIES } from '@/core/lib/data-loaders/economy-loader'
import { processTurn } from '../logic/turn-logic'

export const createGameSlice: GameStateCreator<GameSlice> = (set, get) => ({
  // State
  turn: 0,
  year: 2024,
  isProcessingTurn: false,
  gameStatus: 'menu',
  setupCountryId: null,
  endReason: null,
  activeActivity: null,
  inflationNotification: null,

  // Actions
  setSetupCountry: (id: string) => {
    ;(set as any)(
      { setupCountryId: id, gameStatus: 'select_character' },
      false,
      'game/setSetupCountry',
    )
  },

  startSinglePlayer: () => {
    ;(set as any)({ 
      gameStatus: 'setup',
      countries: WORLD_COUNTRIES 
    }, false, 'game/startSinglePlayer')
  },

  initializeGame: (countryId: string, archetype: string) => {
    const cId = countryId || get().setupCountryId
    if (!cId) return
    ;(set as any)(
      {
        turn: 1,
        year: 2024,
        gameStatus: 'playing',
        countries: WORLD_COUNTRIES,
        player: createInitialPlayer(archetype, cId),
        history: [],
        notifications: [],
        pendingApplications: [],
        pendingFreelanceApplications: [],
      },
      false,
      'game/initializeGame',
    )
  },

  resetGame: () => {
    set({
      turn: 0,
      year: 2024,
      isProcessingTurn: false,
      globalEvents: [],
      countries: WORLD_COUNTRIES,
      player: null,
      history: [],
      gameStatus: 'menu',
      endReason: null,
      activeActivity: null,
      pendingEventNotification: null,
      setupCountryId: null,
      notifications: [],
      pendingApplications: [],
      pendingFreelanceApplications: [],
    })
  },

  setActiveActivity: (activity: string | null) => {
    ;(set as any)({ activeActivity: activity }, false, 'game/setActiveActivity')
  },

  nextTurn: () => {
    processTurn(get, set)
  },

  resolveCrisis: (actionType: string) => {
    const player = get().player
    if (!player) return

    let newMoney = player.stats.money
    let newAssets = [...player.assets]
    let newDebts = [...player.debts]
    let newFamily = [...player.personal.familyMembers]
    let gameStatus = get().gameStatus
    let endReason = get().endReason

    if (actionType === 'bankruptcy') {
      set({ gameStatus: 'ended', endReason: 'BANKRUPTCY' })
      return
    }

    if (actionType === 'sell_asset') {
      // Продаем все активы
      const assetsValue = newAssets.reduce((sum, a) => sum + a.value, 0)
      newMoney += assetsValue
      newAssets = []
    } else if (actionType === 'emergency_loan') {
      const { calculateEmergencyLoanAmount } = require('@/core/lib/financial-crisis')
      const amount = calculateEmergencyLoanAmount(player.stats.money)
      newMoney += amount
      newDebts.push({
        id: `loan_crisis_${Date.now()}`,
        name: 'Экстренный кредит',
        type: 'consumer_credit',
        principalAmount: amount,
        remainingAmount: amount,
        interestRate: 25, // 25% годовых
        termQuarters: 12, // 3 года
        remainingQuarters: 12,
        startTurn: get().turn,
        quarterlyPayment: (amount * (1 + 0.25 * 3)) / 12, // Упрощенный расчет
        quarterlyPrincipal: amount / 12,
        quarterlyInterest: (amount * 0.25) / 4,
      })
    } else if (actionType === 'family_help') {
      const { calculateFamilyHelp } = require('@/core/lib/financial-crisis')
      const amount = calculateFamilyHelp(newFamily)
      newMoney += amount
      // Ухудшаем отношения
      newFamily = newFamily.map((m) => ({
        ...m,
        relationLevel: Math.max(0, m.relationLevel - 30),
      }))
    }

    // Если вышли из кризиса
    const { FINANCIAL_CRISIS_THRESHOLD } = require('@/core/lib/financial-crisis')
    if (newMoney >= FINANCIAL_CRISIS_THRESHOLD) {
      gameStatus = 'playing'
    }

    set(
      {
        gameStatus,
        endReason,
        player: {
          ...player,
          assets: newAssets,
          debts: newDebts,
          personal: {
            ...player.personal,
            familyMembers: newFamily,
          },
          stats: {
            ...player.stats,
            money: newMoney,
          },
        },
      },
      false,
      'game/resolveCrisis',
    )
  },

  clearInflationNotification: () => {
    ;(set as any)({ inflationNotification: null }, false, 'game/clearInflationNotification')
  },
})
