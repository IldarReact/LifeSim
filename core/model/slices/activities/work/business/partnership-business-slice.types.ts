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
    // Для price
    newPrice?: number

    // Для quantity
    newQuantity?: number

    // Для hire_employee
    employeeId?: string
    employeeName?: string
    employeeRole?: string
    employeeSalary?: number
    employeeStars?: number
    isPlayer?: boolean
    skills?: import('@/core/types').EmployeeSkills
    experience?: number
    humanTraits?: import('@/core/types').HumanTrait[]

    // Для fire_employee
    fireEmployeeId?: string
    fireEmployeeName?: string

    // Для open_branch
    branchName?: string
    branchCost?: number

    // Для auto_purchase
    autoPurchaseAmount?: number

    // Для change_role
    newRole?: string
    oldRole?: string
    // Дополнительные поля для случая, когда игрок вступает в роль (используется как hire_employee для игрока)
    isMe?: boolean

    // Для fund_collection
    collectionAmount?: number
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
