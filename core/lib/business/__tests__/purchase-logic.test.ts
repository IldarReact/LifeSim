import { describe, it, expect } from 'vitest'

import { createBusinessPurchase } from '../purchase-logic'
import type { BusinessTemplate } from '../purchase-logic'

describe('createBusinessPurchase', () => {
  const mockTemplate: BusinessTemplate = {
    id: 'bus_test',
    name: 'Test Business',
    description: 'A test business',
    initialCost: 100000,
    monthlyIncome: 10000,
    monthlyExpenses: 5000,
    maxEmployees: 5,
    minEmployees: 1,
    employeeRoles: [],
    inventory: undefined,
    upfrontPaymentPercentage: 20,
  }

  const currentTurn = 1

  it('should create a solo business correctly with default upfront percentage', () => {
    const inflatedCost = 120000 // Inflation applied
    const result = createBusinessPurchase(mockTemplate, inflatedCost, currentTurn)

    // Check cost calculation - Always 100% per current logic
    expect(result.cost).toBe(120000)

    // Check business object
    expect(result.business.name).toBe('Test Business')
    expect(result.business.initialCost).toBe(120000)
    expect(result.business.openingProgress.investedAmount).toBe(120000)
    expect(result.business.partners).toEqual([])
  })

  it('should create a solo business correctly even if template has upfront percentage', () => {
    const templateWithCustomUpfront = { ...mockTemplate, upfrontPaymentPercentage: 50 }
    const inflatedCost = 100000
    const result = createBusinessPurchase(templateWithCustomUpfront, inflatedCost, currentTurn)

    // Should still be 100% because createBusinessPurchase ignores upfrontPaymentPercentage
    expect(result.cost).toBe(100000)
    expect(result.business.openingProgress.investedAmount).toBe(100000)
  })

  it('should create a partner business correctly', () => {
    const inflatedCost = 200000
    const partnerConfig = {
      partnerId: 'partner_1',
      partnerName: 'Partner Name',
      playerShare: 40, // Player pays 40%
    }

    const result = createBusinessPurchase(mockTemplate, inflatedCost, currentTurn, partnerConfig)

    // Check cost calculation for partner (full share)
    expect(result.cost).toBe(80000) // 40% of 200000

    // Check business object
    expect(result.business.name).toBe('Test Business')
    expect(result.business.initialCost).toBe(200000)
    expect(result.business.playerShare).toBe(40)
    expect(result.business.partners).toHaveLength(2)

    // Check partner details
    const playerPartner = result.business.partners!.find(
      (p) => p.type === 'player' && p.share === 40,
    )
    const npcPartner = result.business.partners!.find((p) => p.id === 'partner_1')

    expect(playerPartner).toBeDefined()
    expect(playerPartner?.investedAmount).toBe(80000)

    expect(npcPartner).toBeDefined()
    expect(npcPartner?.share).toBe(60)
    expect(npcPartner?.investedAmount).toBe(120000)
  })

  it('should handle ID prefixes correctly', () => {
    const templateWithPrefix = { ...mockTemplate, id: 'bus_retail_store' }
    const result = createBusinessPurchase(templateWithPrefix, 100000, currentTurn)

    expect(result.business.type).toBe('retail_store')
  })
})
