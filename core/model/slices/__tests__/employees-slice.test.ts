import { describe, it, expect } from 'vitest'

import { createCoreBusinessSlice } from '../activities/work/business/core-business-slice'
import { createEmployeesSlice } from '../activities/work/business/employees-slice'

describe('employees-slice', () => {
  it('exports a creator function', () => {
    expect(typeof createEmployeesSlice).toBe('function')
  })

  it('hireEmployee spends from business wallet, not player money', () => {
    let state: any = {
      player: {
        id: 'p1',
        name: 'Player',
        stats: { money: 5000 },
        personal: { stats: { money: 5000 } },
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
            walletBalance: 2000,
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
    }
    const get = () => state
    const set = (patch: any) => {
      const next = typeof patch === 'function' ? patch(state) : patch
      state = { ...state, ...next }
    }

    const coreSlice = createCoreBusinessSlice(set as any, get as any, {} as any) as any
    const empSlice = createEmployeesSlice(set as any, get as any, {} as any) as any

    // Deposit to wallet
    coreSlice.depositToBusinessWallet('biz_1', 1000)
    const beforeHireBiz = get().player.businesses[0]
    expect(beforeHireBiz.walletBalance).toBe(3000)

    // Hire with salary 1500
    empSlice.hireEmployee('biz_1', {
      id: 'cand_1',
      name: 'Alice',
      role: 'worker',
      stars: 3,
      skills: { efficiency: 50 },
      requestedSalary: 1500,
      experience: 2,
      humanTraits: [],
    } as any)

    const afterHireBiz = get().player.businesses[0]
    expect(afterHireBiz.employees.length).toBe(1)
    expect(afterHireBiz.walletBalance).toBe(3000)
    // Player money unchanged by hire
    expect(get().player.stats.money).toBe(4000)
    expect(get().player.personal.stats.money).toBe(4000)
  })
})
