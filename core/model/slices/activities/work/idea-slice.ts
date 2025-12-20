import type { StateCreator } from 'zustand'

import type { GameStore, IdeaSlice } from '../../types'

import { applyStats } from '@/core/helpers/apply-stats'
import {
  generateBusinessIdea,
  calculateDevelopmentCost,
  canDevelopIdea,
} from '@/core/lib/idea-generator'
import type { Business } from '@/core/types'

export const createIdeaSlice: StateCreator<GameStore, [], [], IdeaSlice> = (set, get) => ({
  generateIdea: () => {
    const state = get()
    if (!state.player) return

    // Стоимость генерации (энергия)
    const energyCost = 20
    if (state.player.stats.energy < energyCost) {
      console.log('[Idea] Недостаточно энергии для генерации идеи')
      return
    }

    // Генерируем идею
    const idea = generateBusinessIdea(
      state.player.personal.skills,
      state.turn,
      state.globalMarket.value,
    )

    // Списываем энергию и добавляем идею
    const updatedStats = applyStats(state.player.stats, {
      energy: -energyCost,
    })
    const updatedPersonalStats = applyStats(state.player.personal.stats, {
      energy: -energyCost,
    })

    set({
      player: {
        ...state.player,
        stats: updatedStats,
        personal: {
          ...state.player.personal,
          stats: updatedPersonalStats,
        },
        businessIdeas: [...state.player.businessIdeas, idea],
      },
    })

    console.log(`[Idea] Сгенерирована идея: ${idea.name} (${idea.riskLevel} risk)`)
  },

  developIdea: (ideaId: string, investment: number) => {
    const state = get()
    if (!state.player) return

    const ideaIndex = state.player.businessIdeas.findIndex((i) => i.id === ideaId)
    if (ideaIndex === -1) return

    const idea = state.player.businessIdeas[ideaIndex]

    // Проверка денег
    if (state.player.stats.money < investment) {
      console.log('[Idea] Недостаточно денег для инвестиций')
      return
    }

    // Проверка требований навыков
    if (!canDevelopIdea(idea, state.player.personal.skills)) {
      console.log('[Idea] Недостаточно навыков для развития идеи')
      return
    }

    // Обновляем идею
    const updatedIdea = { ...idea }
    updatedIdea.investedAmount += investment

    // Прогресс развития
    const costForNextStage = calculateDevelopmentCost(idea)
    const progressGain = (investment / costForNextStage) * 100

    updatedIdea.developmentProgress += progressGain

    // Переход на следующую стадию
    if (updatedIdea.developmentProgress >= 100) {
      updatedIdea.developmentProgress = 0
      if (updatedIdea.stage === 'idea') updatedIdea.stage = 'prototype'
      else if (updatedIdea.stage === 'prototype') updatedIdea.stage = 'mvp'
      else if (updatedIdea.stage === 'mvp') updatedIdea.stage = 'launched'

      console.log(`[Idea] Идея перешла на стадию: ${updatedIdea.stage}`)
    }

    // Списываем деньги и обновляем идею
    const updatedStats = applyStats(state.player.stats, {
      money: -investment,
    })
    const updatedPersonalStats = applyStats(state.player.personal.stats, {
      money: -investment,
    })

    const updatedIdeas = [...state.player.businessIdeas]
    updatedIdeas[ideaIndex] = updatedIdea

    set({
      player: {
        ...state.player,
        stats: updatedStats,
        personal: {
          ...state.player.personal,
          stats: updatedPersonalStats,
        },
        businessIdeas: updatedIdeas,
      },
    })
  },

  launchBusinessFromIdea: (ideaId: string) => {
    const state = get()
    if (!state.player) return

    const ideaIndex = state.player.businessIdeas.findIndex((i) => i.id === ideaId)
    if (ideaIndex === -1) return

    const idea = state.player.businessIdeas[ideaIndex]

    if (idea.stage !== 'launched' && idea.stage !== 'mvp') {
      console.log('[Idea] Идея еще не готова к запуску')
      return
    }

    // Создаем бизнес из идеи
    // Используем существующий метод openBusiness, но с параметрами из идеи
    // Нам нужно адаптировать параметры

    // Удаляем идею из списка
    const updatedIdeas = state.player.businessIdeas.filter((i) => i.id !== ideaId)

    // Вызываем openBusiness через store action
    // Но openBusiness требует много параметров.
    // Упростим: создадим бизнес напрямую и добавим в массив

    const newBusiness: Business = {
      id: `biz_${Date.now()}`,
      name: idea.name,
      type: idea.type,
      description: idea.description,
      state: 'active',

      lastQuarterlyUpdate: state.turn,
      createdAt: state.turn,
      monthlyIncome: 0,
      monthlyExpenses: 0,
      autoPurchaseAmount: 0,

      price: 5,
      quantity: 100,
      isServiceBased: idea.type === 'service' || idea.type === 'tech',
      networkId: undefined,
      isMainBranch: true,
      partners: [],
      proposals: [],

      initialCost: idea.investedAmount,
      quarterlyIncome: 0,
      quarterlyExpenses: 0,
      currentValue: idea.investedAmount,

      employees: [],
      maxEmployees: 5, // Начальный лимит
      minEmployees: 1,

      reputation: Math.max(
        0,
        Math.min(
          100,
          50 +
            idea.marketDemand * 0.3 +
            (idea.riskLevel === 'low'
              ? 5
              : idea.riskLevel === 'high'
                ? -5
                : idea.riskLevel === 'very_high'
                  ? -10
                  : 0) +
            (Math.random() - 0.5) * (idea.riskLevel === 'very_high' ? 40 : 20),
        ),
      ),
      efficiency: Math.max(0, Math.min(100, 50 + idea.potentialReturn * 10)),

      taxRate: 0.2, // Базовая ставка
      hasInsurance: false,
      insuranceCost: 0,

      creationCost: { energy: 0, money: 0 }, // Уже оплачено инвестициями

      playerRoles: {
        managerialRoles: [],
        operationalRole: null,
      },
      requiredRoles: [], // Будет заполнено логикой бизнеса

      inventory: {
        currentStock: 0,
        maxStock: 500,
        pricePerUnit: 0,
        purchaseCost: 0,
        autoPurchaseAmount: 0,
      },

      openingProgress: {
        totalQuarters: 0,
        quartersLeft: 0,
        investedAmount: idea.investedAmount,
        totalCost: idea.investedAmount,
        upfrontCost: 0,
      },

      eventsHistory: [],
      foundedTurn: state.turn,
    }

    set({
      player: {
        ...state.player,
        businessIdeas: updatedIdeas,
        businesses: [...state.player.businesses, newBusiness],
      },
    })

    console.log(`[Idea] Бизнес запущен: ${newBusiness.name}`)
  },

  discardIdea: (ideaId: string) => {
    const state = get()
    if (!state.player) return

    const updatedIdeas = state.player.businessIdeas.filter((i) => i.id !== ideaId)

    set({
      player: {
        ...state.player,
        businessIdeas: updatedIdeas,
      },
    })
  },
})
