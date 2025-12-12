import { describe, it, expect, beforeEach } from 'vitest'
import { createPartnerBusiness } from '../create-partner-business'
import type { BusinessType, EmployeeRole } from '@/core/types/business.types'

describe('createPartnerBusiness', () => {
  const mockOffer = {
    details: {
      businessName: 'Тестовый бизнес',
      businessType: 'shop' as BusinessType,
      businessDescription: 'Описание бизнеса',
      totalCost: 100000,
      yourInvestment: 50000,
      yourShare: 50,
    },
    fromPlayerId: 'player1',
    fromPlayerName: 'Игрок 1',
  }

  it('создаёт бизнес с правильными параметрами партнёрства', () => {
    const currentTurn = 1
    const playerId = 'player2'

    const business = createPartnerBusiness(mockOffer, currentTurn, playerId, false)

    // Проверка базовых полей
    expect(business.name).toBe('Тестовый бизнес')
    expect(business.type).toBe('shop')
    expect(business.description).toBe('Описание бизнеса')

    // Проверка партнёрских полей
    expect(business.partnerId).toBe('player1')
    expect(business.partnerName).toBe('Игрок 1')
    expect(business.playerShare).toBe(50)
    expect(business.playerInvestment).toBe(50000)

    // Проверка партнёров - теперь должно быть 2 (текущий игрок + партнёр)
    expect(business.partners).toHaveLength(2)

    // Проверка текущего игрока в partners
    const currentPlayerPartner = business.partners.find(p => p.id === 'player2')
    expect(currentPlayerPartner).toBeDefined()
    expect(currentPlayerPartner?.share).toBe(50)
    expect(currentPlayerPartner?.investedAmount).toBe(50000)

    // Проверка партнёра в partners
    const otherPartner = business.partners.find(p => p.id === 'player1')
    expect(otherPartner).toBeDefined()
    expect(otherPartner?.name).toBe('Игрок 1')
    expect(otherPartner?.share).toBe(50)
    expect(otherPartner?.investedAmount).toBe(50000)

    // Проверка финансов
    expect(business.initialCost).toBe(100000)
    expect(business.currentValue).toBe(100000)

    // Проверка временных меток
    expect(business.foundedTurn).toBe(currentTurn)
    expect(business.lastQuarterlyUpdate).toBe(currentTurn)
    expect(business.createdAt).toBe(currentTurn)
  })

  it('создаёт бизнес для инициатора с правильными параметрами', () => {
    const business = createPartnerBusiness(
      mockOffer,
      1, // currentTurn
      'player1', // playerId (инициатор)
      true, // isInitiator
    )

    // Проверка полей инициатора
    expect(business.playerShare).toBe(50)
    expect(business.partners).toHaveLength(2)

    // Проверка что инициатор есть в partners
    const initiator = business.partners.find(p => p.id === 'player1')
    expect(initiator).toBeDefined()
    expect(initiator?.share).toBe(50)
  })

  it('создаёт бизнес с правильными ролями игрока', () => {
    const business = createPartnerBusiness(mockOffer, 1, 'player2', false)

    expect(business.playerRoles.managerialRoles).toContain('ceo')
    expect(business.playerRoles.operationalRole).toBeNull()
  })

  it('создаёт бизнес с правильными настройками по умолчанию', () => {
    const business = createPartnerBusiness(mockOffer, 1, 'player2', false)

    // Проверка настроек по умолчанию
    expect(business.state).toBe('active')
    expect(business.taxRate).toBe(0.15)
    expect(business.hasInsurance).toBe(true)
    expect(business.insuranceCost).toBe(1000) // 1% от totalCost
    expect(business.reputation).toBe(50)
    expect(business.efficiency).toBe(50)
  })
})
