import type { Business, BusinessChangeType, BusinessProposal } from '@/core/types/business.types'

export type BusinessChangeProposal = BusinessProposal

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
