import { describe, it, expect } from 'vitest'

import { createPricingProductionSlice } from '../activities/work/business/pricing-production-slice'
import type { LocalGameState } from '../types'

function createMockState(initial?: Partial<LocalGameState>) {
  let state: LocalGameState = {
    player: {
      id: 'p1',
      name: 'Player',
      stats: { money: 0 },
      businesses: [],
    } as any,
    offers: [],
    turn: 1,
    ...initial,
  } as any

  const get = () => state as any
  const set = (patch: any) => {
    const newState = typeof patch === 'function' ? patch(state as any) : patch
    state = { ...(state as any), ...(newState as any) }
  }
  return { get, set, state: () => state }
}

describe('pricing-production-slice', () => {
  it('exports a creator function', () => {
    expect(typeof createPricingProductionSlice).toBe('function')
  })

  it('changePrice updates business.price and inventory.pricePerUnit for product business', () => {
    const { get, set, state } = createMockState({
      player: {
        id: 'p1',
        name: 'Player',
        stats: { money: 0 },
        businesses: [
          {
            id: 'biz_1',
            name: 'Shop',
            type: 'retail',
            description: 'Test',
            state: 'active',
            price: 5,
            quantity: 100,
            isServiceBased: false,
            networkId: undefined,
            isMainBranch: true,
            partners: [],
            proposals: [],
            lastQuarterlyUpdate: 0,
            createdAt: 0,
            monthlyIncome: 0,
            monthlyExpenses: 0,
            autoPurchaseAmount: 0,
            initialCost: 10000,
            quarterlyIncome: 0,
            quarterlyExpenses: 0,
            currentValue: 10000,
            employees: [],
            maxEmployees: 5,
            minEmployees: 1,
            reputation: 50,
            efficiency: 50,
            taxRate: 15,
            hasInsurance: false,
            insuranceCost: 0,
            creationCost: { energy: 0, money: 0 },
            playerRoles: { managerialRoles: [], operationalRole: null },
            employeeRoles: [],
            inventory: {
              currentStock: 1000,
              maxStock: 1000,
              pricePerUnit: 50,
              purchaseCost: 20,
              autoPurchaseAmount: 0,
            },
            openingProgress: {
              totalQuarters: 0,
              quartersLeft: 0,
              investedAmount: 0,
              totalCost: 0,
              upfrontCost: 0,
            },
            eventsHistory: [],
            foundedTurn: 1,
          },
        ],
      },
    } as any)

    const slice = createPricingProductionSlice(set as any, get as any, {} as any) as any
    slice.changePrice('biz_1', 8)

    const b = state().player!.businesses[0] as any
    expect(b.price).toBe(8)
    const expectedPricePerUnit = Math.round(20 * (1 + (15 / 100) * (8 - 5)))
    expect(b.inventory.pricePerUnit).toBe(expectedPricePerUnit)
  })
})
