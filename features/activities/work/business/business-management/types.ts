import type { Business, EmployeeRole, EmployeeCandidate } from '@/core/types'

export interface BusinessManagementDialogProps {
  businessId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export interface BusinessManagementProps {
  business: Business
  playerCash: number
  proposalsCount?: number
  onHireEmployee: (businessId: string, candidate: EmployeeCandidate) => void
  onFireEmployee: (businessId: string, employeeId: string) => void
  onChangePrice: (businessId: string, newPrice: number) => void
  onSetQuantity: (businessId: string, newQuantity: number) => void
  onOpenBranch: (sourceBusinessId: string) => void
  onJoinAsEmployee: (businessId: string, role: EmployeeRole, salary: number) => void
  onLeaveJob: (businessId: string) => void
  onUnassignRole: (businessId: string, role: EmployeeRole) => void
}

export interface AvailablePosition {
  role: EmployeeRole
  salary: number
  description: string
}
