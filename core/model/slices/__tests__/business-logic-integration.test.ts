import { describe, it, expect } from 'vitest'

import { createCoreBusinessSlice } from '../activities/work/business/core-business-slice'
import { createEmployeesSlice } from '../activities/work/business/employees-slice'

describe('Business Logic Integration (Layer 4)', () => {
  const createMockStore = () => {
    let state: any = {
      player: {
        id: 'p1',
        businesses: [
          {
            id: 'biz_1',
            name: 'Test Biz',
            type: 'retail',
            state: 'active',
            price: 5,
            quantity: 100,
            walletBalance: 10000,
            employees: [],
            maxEmployees: 1, // Will test 5x expansion
            inventory: {
              currentStock: 100,
              maxStock: 500,
              pricePerUnit: 50,
              purchaseCost: 20,
              autoPurchaseAmount: 0,
            },
            playerRoles: { managerialRoles: [], operationalRole: null },
            partners: [],
            eventsHistory: [],
            reputation: 50,
            efficiency: 50,
            employeeRoles: [],
          },
        ],
      },
    }
    const get = () => state
    const set = (patch: any) => {
      const next = typeof patch === 'function' ? patch(state) : patch
      state = { ...state, ...next }
    }

    return {
      get,
      set,
      core: createCoreBusinessSlice(set as any, get as any, {} as any) as any,
      emp: createEmployeesSlice(set as any, get as any, {} as any) as any,
    }
  }

  it('should allow hiring more than maxEmployees due to 5x logic', () => {
    const { get, emp } = createMockStore()

    // maxEmployees is 1, but we should be able to hire up to 5
    const candidate = {
      id: 'cand_1',
      name: 'Alice',
      role: 'worker',
      stars: 3,
      skills: { efficiency: 50 },
      requestedSalary: 1000,
      experience: 2,
      humanTraits: [],
    }

    // Hire 1st
    emp.hireEmployee('biz_1', { ...candidate, id: 'c1' })
    // Hire 2nd (this would fail if 5x logic wasn't active)
    emp.hireEmployee('biz_1', { ...candidate, id: 'c2' })

    expect(get().player.businesses[0].employees.length).toBe(2)
  })

  it('should block hiring when exceeding 5x of maxEmployees', () => {
    const { get, emp } = createMockStore()
    const candidate = {
      id: 'cand_1',
      name: 'Alice',
      role: 'worker',
      stars: 3,
      skills: { efficiency: 50 },
      requestedSalary: 1000,
      experience: 2,
      humanTraits: [],
    }

    // maxEmployees is 1, 5x limit is 5.
    for (let i = 0; i < 5; i++) {
      emp.hireEmployee('biz_1', { ...candidate, id: `c${i}` })
    }

    expect(get().player.businesses[0].employees.length).toBe(5)

    // 6th hire should fail
    emp.hireEmployee('biz_1', { ...candidate, id: 'c6' })
    expect(get().player.businesses[0].employees.length).toBe(5)
  })
})
