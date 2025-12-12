import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPartnershipBusinessSlice } from '../partnership-business-slice'
import type { GameStore } from '../types'
import type { Business } from '@/core/types/business.types'

// Mock broadcastEvent
vi.mock('@/core/lib/multiplayer', () => ({
  broadcastEvent: vi.fn(),
}))

describe('Partnership Business Slice - Comprehensive Actions', () => {
  let store: GameStore
  let mockBusiness: Business

  beforeEach(() => {
    // Create a mock store with partnership slice
    const mockPlayer = {
      id: 'player_1',
      name: 'Player 1',
      businesses: [],
    }

    mockBusiness = {
      id: 'biz_123',
      name: 'Test Business',
      type: 'retail',
      description: 'Test business description',
      state: 'active',
      price: 100,
      quantity: 10,
      isServiceBased: false,
      networkId: undefined,
      isMainBranch: false,
      partnerBusinessId: undefined,
      partnerId: 'player_2',
      partnerName: 'Player 2',
      playerShare: 50,
      playerInvestment: 50000,
      partners: [
        {
          id: 'player_1',
          name: 'Player 1',
          type: 'player',
          share: 50,
          investedAmount: 50000,
          relation: 100,
        },
        {
          id: 'player_2',
          name: 'Player 2',
          type: 'player',
          share: 50,
          investedAmount: 50000,
          relation: 50,
        },
      ],
      proposals: [],
      employees: [],
      maxEmployees: 10,
      efficiency: 100,
      createdAt: 0,
      lastQuarterlyUpdate: 0,
    } as Partial<Business> as Business

    // Mock store
    store = {
      player: {
        ...mockPlayer,
        businesses: [mockBusiness],
      },
      businessProposals: [],
      turn: 1,
      // We will overwrite these with the actual slice implementation
      proposeBusinessChange: vi.fn(),
      approveBusinessChange: vi.fn(),
      rejectBusinessChange: vi.fn(),
      updateBusinessDirectly: vi.fn(),
      pushNotification: vi.fn(),
    } as any

    // Create the slice with a working 'set' function
    const slice = createPartnershipBusinessSlice(
      (updater: any) => {
        // Handle both function and object updates
        const newState = typeof updater === 'function' ? updater(store) : updater
        // Merge updates into store
        Object.assign(store, newState)
      },
      () => store,
      vi.fn() as any,
    )

    // Bind slice methods to store
    store.proposeBusinessChange = slice.proposeBusinessChange
    store.approveBusinessChange = slice.approveBusinessChange
    store.rejectBusinessChange = slice.rejectBusinessChange
    store.updateBusinessDirectly = slice.updateBusinessDirectly
  })

  describe('Price Change Proposals', () => {
    it('should create proposal for price change when share is 50%', () => {
      store.proposeBusinessChange('biz_123', 'price', { newPrice: 150 })

      expect(store.businessProposals).toHaveLength(1)
      expect(store.businessProposals[0].changeType).toBe('price')
      expect(store.businessProposals[0].data.newPrice).toBe(150)
    })

    it('should apply price change directly when share > 50%', () => {
      mockBusiness.playerShare = 60
      mockBusiness.partners[0].share = 60
      mockBusiness.partners[1].share = 40

      store.proposeBusinessChange('biz_123', 'price', { newPrice: 150 })

      expect(store.businessProposals).toHaveLength(0)
      expect(store.player!.businesses[0].price).toBe(150)
    })
  })

  describe('Quantity Change Proposals', () => {
    it('should create proposal for quantity change when share is 50%', () => {
      store.proposeBusinessChange('biz_123', 'quantity', { newQuantity: 20 })

      expect(store.businessProposals).toHaveLength(1)
      expect(store.businessProposals[0].changeType).toBe('quantity')
      expect(store.businessProposals[0].data.newQuantity).toBe(20)
    })
  })

  describe('Employee Hire Proposals', () => {
    it('should create proposal for hiring employee when share is 50%', () => {
      store.proposeBusinessChange('biz_123', 'hire_employee', {
        employeeName: 'John Doe',
        employeeRole: 'manager',
        employeeSalary: 5000,
        employeeStars: 4,
      })

      expect(store.businessProposals).toHaveLength(1)
      expect(store.businessProposals[0].changeType).toBe('hire_employee')
      expect(store.businessProposals[0].data.employeeName).toBe('John Doe')
    })
  })

  describe('Employee Fire Proposals', () => {
    it('should create proposal for firing employee when share is 50%', () => {
      store.proposeBusinessChange('biz_123', 'fire_employee', {
        fireEmployeeId: 'emp_123',
        fireEmployeeName: 'John Doe',
      })

      expect(store.businessProposals).toHaveLength(1)
      expect(store.businessProposals[0].changeType).toBe('fire_employee')
      expect(store.businessProposals[0].data.fireEmployeeId).toBe('emp_123')
    })
  })

  describe('Freeze/Unfreeze Proposals', () => {
    it('should create proposal for freezing business when share is 50%', () => {
      store.proposeBusinessChange('biz_123', 'freeze', {})

      expect(store.businessProposals).toHaveLength(1)
      expect(store.businessProposals[0].changeType).toBe('freeze')
    })

    it('should create proposal for unfreezing business when share is 50%', () => {
      mockBusiness.state = 'frozen'

      store.proposeBusinessChange('biz_123', 'unfreeze', {})

      expect(store.businessProposals).toHaveLength(1)
      expect(store.businessProposals[0].changeType).toBe('unfreeze')
    })
  })

  describe('Branch Opening Proposals', () => {
    it('should create proposal for opening branch when share is 50%', () => {
      store.proposeBusinessChange('biz_123', 'open_branch', {
        branchName: 'Branch 2',
        branchCost: 100000,
      })

      expect(store.businessProposals).toHaveLength(1)
      expect(store.businessProposals[0].changeType).toBe('open_branch')
      expect(store.businessProposals[0].data.branchName).toBe('Branch 2')
    })
  })

  describe('Approval Flow', () => {
    it('should approve proposal and apply changes', () => {
      // Create a proposal first
      store.businessProposals = [
        {
          id: 'proposal_1',
          businessId: 'biz_123',
          changeType: 'price',
          initiatorId: 'player_2',
          initiatorName: 'Player 2',
          status: 'pending',
          createdAt: 1,
          data: { newPrice: 150 },
        },
      ]

      store.approveBusinessChange('proposal_1')

      expect(store.businessProposals[0].status).toBe('approved')
      expect(store.player!.businesses[0].price).toBe(150)
    })

    it('should reject proposal without applying changes', () => {
      store.businessProposals = [
        {
          id: 'proposal_1',
          businessId: 'biz_123',
          changeType: 'price',
          initiatorId: 'player_2',
          initiatorName: 'Player 2',
          status: 'pending',
          createdAt: 1,
          data: { newPrice: 150 },
        },
      ]

      store.rejectBusinessChange('proposal_1')

      expect(store.businessProposals[0].status).toBe('rejected')
      expect(store.player!.businesses[0].price).toBe(100) // Unchanged
    })
  })

  describe('Permission Checks', () => {
    it('should block changes when share < 50%', () => {
      mockBusiness.playerShare = 40
      mockBusiness.partners[0].share = 40
      mockBusiness.partners[1].share = 60

      store.proposeBusinessChange('biz_123', 'price', { newPrice: 150 })

      expect(store.businessProposals).toHaveLength(0)
      expect(store.pushNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'error',
          title: 'Недостаточно прав',
        }),
      )
    })
  })
})
