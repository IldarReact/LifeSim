import type { Business, BusinessChangeType } from '@/core/types/business.types'

export interface BusinessChangeProposal {
  id: string
  businessId: string
  changeType: BusinessChangeType
  initiatorId: string
  initiatorName: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: number
  data: {
    newPrice?: number
    newQuantity?: number
    employeeId?: string
    employeeName?: string
    employeeRole?: string
    employeeSalary?: number
  }
}

export interface PartnershipBusinessSlice {
  // Предложения изменений
  businessProposals: BusinessChangeProposal[]

  // Actions
  proposeBusinessChange: (
    businessId: string,
    changeType: BusinessChangeType,
    data: BusinessChangeProposal['data'],
  ) => void

  approveBusinessChange: (proposalId: string) => void
  rejectBusinessChange: (proposalId: string) => void

  // Прямые изменения (для владельцев с > 50%)
  updateBusinessDirectly: (
    businessId: string,
    changes: {
      price?: number
      quantity?: number
      state?: Business['state']
    },
  ) => void

  // Event handlers
  onBusinessChangeProposed: (
    event: import('@/core/types/events.types').BusinessChangeProposedEvent,
  ) => void
  onBusinessChangeApproved: (
    event: import('@/core/types/events.types').BusinessChangeApprovedEvent,
  ) => void
  onBusinessChangeRejected: (
    event: import('@/core/types/events.types').BusinessChangeRejectedEvent,
  ) => void
  onBusinessUpdated: (event: import('@/core/types/events.types').BusinessUpdatedEvent) => void
}
