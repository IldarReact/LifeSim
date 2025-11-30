import type { StateCreator } from 'zustand'
import type { GameStore, BusinessSlice } from './types'
import type { Business, Employee, EmployeeCandidate, BusinessType } from '@/core/types'
import type { BusinessProposal } from '@/core/types/business.types'
import type { StatEffect } from '@/core/types/stats.types'
import { updateBusinessMetrics, calculateNPCVote } from '@/core/lib/business-utils'
import { applyStats } from '@/core/helpers/applyStats'
import {
  shouldCreateNetwork,
  createNetworkForBusinesses,
  addBranchToNetwork,
  updateNetworkBonuses,
  canChangePrice,
  syncPriceToNetwork
} from '@/core/lib/business-network'

export const createBusinessSlice: StateCreator<
  GameStore,
  [],
  [],
  BusinessSlice
> = (set, get) => ({

  openBusiness: (
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
    taxRate
  ) => {
    const state = get()
    if (!state.player) return

    // ✅ Проверка денег
    if (state.player.stats.money < upfrontCost) {
      console.warn('Недостаточно денег для открытия бизнеса')
      return
    }

    // ✅ Проверка энергии (если есть в стоимости)
    if (creationCost.energy && state.player.personal.stats.energy < Math.abs(creationCost.energy)) {
      console.warn('Недостаточно энергии для открытия бизнеса')
      return
    }

    const newBusiness: Business = {
      id: `business_${Date.now()}`,
      name,
      type,
      description,
      state: openingQuarters > 0 ? 'opening' : 'active',

      // ===== НОВОЕ: Ценообразование и производство =====
      price: 5,  // Средняя цена по умолчанию (1-10)
      quantity: type === 'service' || type === 'tech' ? 0 : 100,  // 0 для услуг, 100 для товаров
      isServiceBased: type === 'service' || type === 'tech',  // Услуговые бизнесы

      // ===== НОВОЕ: Сеть филиалов =====
      networkId: undefined,  // Пока не в сети
      isMainBranch: true,    // Первый бизнес всегда главный

      // ===== НОВОЕ: Кооперативное владение =====
      partners: [],  // Пока нет партнеров
      proposals: [],  // Нет предложений

      openingProgress: {
        totalQuarters: openingQuarters,
        quartersLeft: openingQuarters,
        investedAmount: upfrontCost,
        totalCost,
        upfrontCost,
      },

      creationCost,

      initialCost: totalCost,
      quarterlyIncome: (monthlyIncome || 0) * 3,
      quarterlyExpenses: (monthlyExpenses || 0) * 3,
      currentValue: totalCost,

      taxRate: taxRate || 0.15,
      hasInsurance: false,
      insuranceCost: 0,

      inventory: {
        currentStock: 1000, // Полный склад на старте, чтобы не уходить в минус сразу
        maxStock: 1000,
        pricePerUnit: 100,
        purchaseCost: 50,
        autoPurchaseAmount: 0,
      },

      employees: [],
      maxEmployees,
      requiredRoles: [],  // TODO: заполнить из конфига типа бизнеса
      minEmployees: minEmployees || 1,

      // ✅ новый формат ролей
      playerRoles: {
        managerialRoles: ['manager', 'accountant'],  // По умолчанию игрок выполняет эти роли
        operationalRole: null,  // Операционная роль не выбрана
      },

      reputation: 50,
      efficiency: 50,
      customerSatisfaction: 50,

      eventsHistory: [],
      foundedTurn: state.turn
    }

    // ✅ применяем статы игроку
    const updatedStats = applyStats(state.player.stats, {
      money: -upfrontCost,
    })

    const updatedPersonalStats = applyStats(
      { ...state.player.personal.stats, money: 0 },
      creationCost
    )

    // ===== НОВОЕ: Автоматическое создание сети филиалов =====
    let finalBusinesses = [...state.player.businesses]
    let finalNewBusiness = newBusiness

    // Проверяем, нужно ли создать сеть
    if (shouldCreateNetwork(state.player.businesses, type)) {
      // Находим первый бизнес этого типа
      const existingBusiness = state.player.businesses.find(
        b => b.type === type && b.state !== 'frozen'
      )

      if (existingBusiness) {
        // Создаем сеть
        const { main, branch, networkId } = createNetworkForBusinesses(
          existingBusiness,
          newBusiness
        )

        // Обновляем существующий бизнес (делаем главным)
        finalBusinesses = finalBusinesses.map(b =>
          b.id === existingBusiness.id ? main : b
        )

        // Новый бизнес становится филиалом
        finalNewBusiness = branch

        console.log(`[Business Network] Создана сеть ${networkId} для типа "${type}"`)
        console.log(`[Business Network] Главный филиал: ${main.name}`)
        console.log(`[Business Network] Новый филиал: ${branch.name}`)
      }
    } else {
      // Проверяем, есть ли уже сеть этого типа
      const existingNetwork = state.player.businesses.find(
        b => b.type === type && b.networkId && b.state !== 'frozen'
      )

      if (existingNetwork && existingNetwork.networkId) {
        // Добавляем к существующей сети
        const mainBranch = state.player.businesses.find(
          b => b.networkId === existingNetwork.networkId && b.isMainBranch
        )

        if (mainBranch) {
          finalNewBusiness = addBranchToNetwork(
            newBusiness,
            existingNetwork.networkId,
            mainBranch.price
          )

          console.log(`[Business Network] Добавлен филиал в сеть ${existingNetwork.networkId}`)
        }
      }
    }

    // Добавляем новый бизнес
    finalBusinesses.push(finalNewBusiness)

    // Обновляем бонусы сети, если есть
    if (finalNewBusiness.networkId) {
      finalBusinesses = updateNetworkBonuses(finalBusinesses, finalNewBusiness.networkId)
    }

    set({
      player: {
        ...state.player,

        stats: updatedStats,

        personal: {
          ...state.player.personal,
          stats: updatedPersonalStats
        },

        businesses: finalBusinesses
      }
    })
  },

  hireEmployee: (businessId, candidate) => {
    const state = get()
    if (!state.player) return

    const i = state.player.businesses.findIndex(b => b.id === businessId)
    if (i === -1) return

    const business = state.player.businesses[i]

    if (business.employees.length >= business.maxEmployees) {
      console.warn('Достигнут лимит сотрудников')
      return
    }

    if (state.player.stats.money < candidate.requestedSalary) {
      console.warn('Недостаточно денег для найма')
      return
    }

    const newEmployee: Employee = {
      id: `employee_${Date.now()}`,
      name: candidate.name,
      role: candidate.role,
      stars: candidate.stars,
      skills: candidate.skills,
      salary: candidate.requestedSalary,
      satisfaction: 80,
      productivity: 75,
      experience: candidate.experience,
    }

    const employees = [...business.employees, newEmployee]

    const updatedBusiness = updateBusinessMetrics({
      ...business,
      employees
    })

    const updatedBusinesses = [...state.player.businesses]
    updatedBusinesses[i] = updatedBusiness

    // ✅ списание зарплаты
    const updatedStats = applyStats(state.player.stats, {
      money: -candidate.requestedSalary
    })

    set({
      player: {
        ...state.player,
        stats: updatedStats,
        businesses: updatedBusinesses
      }
    })
  },

  fireEmployee: (businessId, employeeId) => {
    const state = get()
    if (!state.player) return

    const i = state.player.businesses.findIndex(b => b.id === businessId)
    if (i === -1) return

    const business = state.player.businesses[i]

    const employees = business.employees.filter(e => e.id !== employeeId)

    const updatedBusiness = updateBusinessMetrics({
      ...business,
      employees
    })

    const updatedBusinesses = [...state.player.businesses]
    updatedBusinesses[i] = updatedBusiness

    set({
      player: {
        ...state.player,
        businesses: updatedBusinesses
      }
    })
  },

  closeBusiness: (businessId) => {
    const state = get()
    if (!state.player) return

    const business = state.player.businesses.find(b => b.id === businessId)
    if (!business) return

    const returnValue = Math.round(business.currentValue * 0.5)

    const updatedStats = applyStats(state.player.stats, {
      money: returnValue
    })

    set({
      player: {
        ...state.player,
        stats: updatedStats,
        businesses: state.player.businesses.filter(b => b.id !== businessId)
      }
    })
  },

  hireFamilyMember: (businessId, familyMemberId, role) => {
    console.log(`[Business] Hire family member ${familyMemberId} as ${role} in ${businessId} - Not implemented yet`)
  },

  unfreezeBusiness: (businessId) => {
    const state = get()
    if (!state.player) return

    const business = state.player.businesses.find(b => b.id === businessId)
    if (!business) return

    // Стоимость разморозки: 30% от общей стоимости
    const unfreezeCost = Math.round(business.initialCost * 0.3)

    if (state.player.stats.money < unfreezeCost) {
      console.warn('Недостаточно денег для разморозки бизнеса')
      return
    }

    const updatedBusinesses = state.player.businesses.map(b =>
      b.id === businessId
        ? {
          ...b,
          state: 'opening' as const,
          openingProgress: {
            ...b.openingProgress,
            quartersLeft: 1 // Занимает 1 квартал
          }
        }
        : b
    )

    const updatedStats = applyStats(state.player.stats, {
      money: -unfreezeCost
    })

    set({
      player: {
        ...state.player,
        stats: updatedStats,
        businesses: updatedBusinesses
      }
    })
  },

  changePrice: (businessId, newPrice) => {
    const state = get()
    if (!state.player) return

    // Ограничение цены 1-10
    const clampedPrice = Math.max(1, Math.min(10, Math.round(newPrice)))

    const business = state.player.businesses.find(b => b.id === businessId)
    if (!business) return

    // Проверка прав на изменение цены в сети (используем утилиту)
    if (!canChangePrice(business)) {
      console.warn(`[Business] Попытка изменить цену не из главного филиала (ID: ${businessId})`)
      return
    }

    let updatedBusinesses = state.player.businesses
    const oldPrice = business.price

    if (business.networkId) {
      // Если это сеть, синхронизируем цену во всех филиалах (используем утилиту)
      updatedBusinesses = syncPriceToNetwork(
        state.player.businesses,
        business.networkId,
        clampedPrice
      )
      console.log(`[Business] 💰 Цена изменена для сети ${business.networkId}: ${oldPrice} → ${clampedPrice}`)
    } else {
      // Одиночный бизнес
      updatedBusinesses = state.player.businesses.map(b =>
        b.id === businessId
          ? { ...b, price: clampedPrice }
          : b
      )
      console.log(`[Business] 💰 Цена изменена для "${business.name}": ${oldPrice} → ${clampedPrice}`)
    }

    set({
      player: {
        ...state.player,
        businesses: updatedBusinesses
      }
    })
  },

  setQuantity: (businessId, newQuantity) => {
    const state = get()
    if (!state.player) return

    const business = state.player.businesses.find(b => b.id === businessId)
    if (!business) return

    if (business.isServiceBased) {
      console.warn(`[Business] Нельзя установить количество для услуги (ID: ${businessId})`)
      return
    }

    const oldQuantity = business.quantity
    const updatedBusinesses = state.player.businesses.map(b =>
      b.id === businessId
        ? { ...b, quantity: Math.max(0, Math.round(newQuantity)) }
        : b
    )

    console.log(`[Business] 📦 План производства изменен для "${business.name}": ${oldQuantity} → ${Math.round(newQuantity)} единиц`)

    set({
      player: {
        ...state.player,
        businesses: updatedBusinesses
      }
    })
  },

  openBranch: (sourceBusinessId) => {
    const state = get()
    if (!state.player) return

    const sourceBusiness = state.player.businesses.find(b => b.id === sourceBusinessId)
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
      updatedBusinesses = updatedBusinesses.map(b =>
        b.id === sourceBusinessId
          ? { ...b, networkId, isMainBranch: true }
          : b
      )
    }

    // Считаем количество филиалов в этой сети для названия
    const branchCount = updatedBusinesses.filter(b => b.networkId === networkId).length
    const branchName = `${sourceBusiness.name.split(' (')[0]} (Филиал ${branchCount})`

    const newBranch: Business = {
      ...sourceBusiness, // Копируем конфиг
      id: `business_${Date.now()}`,
      name: branchName,
      state: 'opening', // Филиал нужно открыть

      // Сетевые настройки
      networkId,
      isMainBranch: false,
      price: sourceBusiness.price, // Наследуем цену

      // Сбрасываем состояние
      employees: [],
      inventory: {
        ...sourceBusiness.inventory,
        currentStock: 0 // Пустой склад
      },

      // Прогресс открытия
      openingProgress: {
        ...sourceBusiness.openingProgress,
        quartersLeft: Math.max(1, Math.round(sourceBusiness.openingProgress.totalQuarters * 0.7)), // Открывается на 30% быстрее
        investedAmount: branchCost,
        totalCost: branchCost,
        upfrontCost: branchCost
      },

      // Сбрасываем метрики
      reputation: 50, // Стартовая репутация
      efficiency: 50,
      customerSatisfaction: 50,
      eventsHistory: [],
      foundedTurn: state.turn,

      // Роли игрока сбрасываем (в филиале он может не работать или работать отдельно)
      playerRoles: {
        managerialRoles: [],
        operationalRole: null
      }
    }

    // Списываем деньги
    const updatedStats = applyStats(state.player.stats, {
      money: -branchCost
    })

    set({
      player: {
        ...state.player,
        stats: updatedStats,
        businesses: [...updatedBusinesses, newBranch]
      }
    })

    console.log(`[Business] Открыт филиал: ${branchName} в сети ${networkId}`)
  },

  proposeAction: (businessId, type, payload) => {
    const state = get()
    if (!state.player) return

    const business = state.player.businesses.find(b => b.id === businessId)
    if (!business) return

    // Вычисляем долю игрока
    const playerPartner = business.partners.find(p => p.type === 'player')
    const playerShare = playerPartner ? playerPartner.share : 100

    // Если у игрока контрольный пакет (>50%), выполняем действие сразу
    if (playerShare > 50) {
      console.log(`[Business] Игрок имеет ${playerShare}% - выполняем действие без голосования`)

      // Выполняем действие напрямую
      switch (type) {
        case 'change_price':
          if (payload.newPrice !== undefined) {
            get().changePrice(businessId, payload.newPrice)
          }
          break
        case 'change_quantity':
          if (payload.newQuantity !== undefined) {
            get().setQuantity(businessId, payload.newQuantity)
          }
          break
      }
      return
    }

    // Создаем предложение
    const proposal: BusinessProposal = {
      id: `prop_${Date.now()}`,
      type,
      initiatorId: playerPartner?.id || 'player',
      payload,
      votes: {
        [playerPartner?.id || 'player']: true // Игрок голосует ЗА свое предложение
      },
      status: 'pending',
      createdTurn: state.turn
    }

    // Собираем голоса NPC
    business.partners.forEach(partner => {
      if (partner.type === 'npc') {
        const vote = calculateNPCVote(proposal, business, partner)
        proposal.votes[partner.id] = vote
      }
    })

    // Подсчитываем результат
    let votesFor = 0
    const voteDetails: string[] = []

    business.partners.forEach(partner => {
      const vote = proposal.votes[partner.id]
      if (vote) {
        votesFor += partner.share
      }
      voteDetails.push(`${partner.name || partner.id}: ${vote ? '✅ ЗА' : '❌ ПРОТИВ'} (${partner.share}%)`)
    })

    console.log(`[Business] 🗳️ Голосование по ${type}:`)
    voteDetails.forEach(detail => console.log(`   - ${detail}`))
    console.log(`   = ИТОГО: ЗА=${votesFor}%, ПРОТИВ=${100 - votesFor}%`)

    // Если >50% ЗА, выполняем действие
    if (votesFor > 50) {
      proposal.status = 'approved'
      proposal.resolvedTurn = state.turn

      console.log(`[Business] Предложение одобрено`)

      // Выполняем действие
      switch (type) {
        case 'change_price':
          if (payload.newPrice !== undefined) {
            get().changePrice(businessId, payload.newPrice)
          }
          break
        case 'change_quantity':
          if (payload.newQuantity !== undefined) {
            get().setQuantity(businessId, payload.newQuantity)
          }
          break
      }
    } else {
      proposal.status = 'rejected'
      proposal.resolvedTurn = state.turn
      console.log(`[Business] Предложение отклонено`)
    }

    // Сохраняем предложение в историю
    const updatedBusinesses = state.player.businesses.map(b =>
      b.id === businessId
        ? { ...b, proposals: [...b.proposals, proposal] }
        : b
    )

    set({
      player: {
        ...state.player,
        businesses: updatedBusinesses
      }
    })
  },

  setPlayerManagerialRoles: (businessId, roles) => {
    const state = get()
    if (!state.player) return

    const updatedBusinesses = state.player.businesses.map(b =>
      b.id === businessId
        ? { ...b, playerRoles: { ...b.playerRoles, managerialRoles: roles } }
        : b
    )

    set({
      player: {
        ...state.player,
        businesses: updatedBusinesses
      }
    })
  },

  setPlayerOperationalRole: (businessId, role) => {
    const state = get()
    if (!state.player) return

    const updatedBusinesses = state.player.businesses.map(b =>
      b.id === businessId
        ? { ...b, playerRoles: { ...b.playerRoles, operationalRole: role } }
        : b
    )

    set({
      player: {
        ...state.player,
        businesses: updatedBusinesses
      }
    })
  },

  freezeBusiness: (businessId) => {
    const state = get()
    if (!state.player) return

    const business = state.player.businesses.find(b => b.id === businessId)
    if (!business) return

    // Рассчитать компенсации (зарплата за 1 квартал)
    const compensation = business.employees.reduce((sum, emp) => sum + emp.salary, 0)

    // Списать деньги (может уйти в минус)
    const currentMoney = state.player.stats.money
    const newMoney = currentMoney - compensation

    const updatedBusinesses = state.player.businesses.map(b =>
      b.id === businessId
        ? {
          ...b,
          state: 'frozen' as const,
          employees: [], // Увольняем всех сотрудников
          reputation: Math.max(0, b.reputation - 20), // Штраф к репутации
          inventory: b.inventory ? { ...b.inventory, currentStock: 0 } : b.inventory // Очищаем склад
        }
        : b
    )

    const updatedStats = { ...state.player.stats, money: newMoney }

    set({
      player: {
        ...state.player,
        stats: updatedStats,
        businesses: updatedBusinesses
      }
    })
  }
})
